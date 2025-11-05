import type { CarePlan, ChatMessage, Citation } from "@/app/types/chat";

type SendRequestPayload = {
  messages: ChatMessage[];
};

type SendResponse = {
  text?: string;
  citations?: Citation[];
  carePlan?: CarePlan;
  fallback?: boolean;
  error?: { message?: string };
} & Record<string, unknown>;

export type StreamHandler = {
  appendAssistant: (text: string) => void;
  resetNarrative: () => void;
  handleCitations: (value: unknown) => void;
  handleOrders: (text: string | undefined) => void;
  setErrorBanner: (message: string | null) => void;
};

type SendDependencies = {
  request: (payload: SendRequestPayload, options?: { stream?: boolean }) => Promise<SendResponse | ReadableStream<Uint8Array>>;
  streamHandler: StreamHandler;
};

/**
 * Manages message sending and response handling for chat interactions
 * Supports both standard JSON responses and Server-Sent Events (SSE) streaming
 */
export class MessageSendManager {
  private readonly request: SendDependencies["request"];

  private readonly streamHandler: StreamHandler;

  constructor({ request, streamHandler }: SendDependencies) {
    this.request = request;
    this.streamHandler = streamHandler;
  }

  /**
   * Send a chat message and handle the response
   * Automatically detects stream vs JSON responses and routes accordingly
   */
  async send(payload: SendRequestPayload, options?: { stream?: boolean }) {
    const response = await this.request(payload, options);
    if (response instanceof ReadableStream) {
      await this.handleStreamResponse(response);
      return;
    }

    this.handleResponseBody(response);
  }

  private handleResponseBody(body: SendResponse) {
    this.streamHandler.appendAssistant(String(body.text ?? ""));
    this.streamHandler.resetNarrative();
    this.streamHandler.handleCitations(body?.citations);
    this.streamHandler.handleOrders(body?.text);
    if (body?.fallback) {
      this.streamHandler.setErrorBanner("Limited mode - using offline guidance only.");
    }
  }

  private async handleStreamResponse(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedText = "";
    let citations: SendResponse["citations"] | undefined;
    let fallback = false;

    const flushBlock = (raw: string) => {
      if (!raw.trim()) return;
      const eventMatch = raw.match(/^event:\s*(.*)$/m);
      const dataMatch = raw.match(/^data:\s*(.*)$/m);
      const event = eventMatch?.[1]?.trim() || "message";
      const dataRaw = dataMatch?.[1];
      if (!dataRaw) return;
      try {
        const data = JSON.parse(dataRaw) as Record<string, unknown>;
        if (event === "citations") {
          citations = data as unknown as SendResponse["citations"];
          this.streamHandler.handleCitations(citations);
        } else if (event === "delta") {
          const delta = typeof data?.text === "string" ? (data.text as string) : "";
          accumulatedText += delta;
        } else if (event === "final") {
          const finalText = typeof data?.text === "string" ? (data.text as string) : undefined;
          if (finalText !== undefined) accumulatedText = finalText;
          if (data?.fallback) {
            fallback = true;
            this.streamHandler.setErrorBanner("Limited mode - using offline guidance only.");
          }
        } else if (event === "error") {
          const message = typeof data?.message === "string" ? (data.message as string) : "Streaming error";
          throw new Error(message);
        }
      } catch (error) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx = buffer.indexOf("\n\n");
      while (idx !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        flushBlock(block);
        idx = buffer.indexOf("\n\n");
      }
    }

    this.handleResponseBody({ text: accumulatedText, citations, fallback });
  }
}
