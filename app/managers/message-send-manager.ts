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

export class MessageSendManager {
  private readonly request: SendDependencies["request"];

  private readonly streamHandler: StreamHandler;

  constructor({ request, streamHandler }: SendDependencies) {
    this.request = request;
    this.streamHandler = streamHandler;
  }

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

    const processEventBlock = (raw: string) => {
      if (!raw.trim()) return;
      const lines = raw.split("\n");
      let event = "message";
      let dataRaw = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataRaw += line.slice(5).trim();
      }
      if (!dataRaw) return;
      try {
        const data = JSON.parse(dataRaw) as Record<string, unknown>;
        switch (event) {
          case "citations": {
            citations = data as SendResponse["citations"];
            this.streamHandler.handleCitations(citations);
            break;
          }
          case "delta": {
            const delta = typeof data?.text === "string" ? (data.text as string) : "";
            accumulatedText += delta;
            break;
          }
          case "final": {
            const finalText = typeof data?.text === "string" ? (data.text as string) : undefined;
            if (finalText !== undefined) accumulatedText = finalText;
            if (data?.fallback) {
              fallback = true;
              this.streamHandler.setErrorBanner("Limited mode - using offline guidance only.");
            }
            break;
          }
          case "error": {
            const message = typeof data?.message === "string" ? (data.message as string) : "Streaming error";
            throw new Error(message);
          }
          default:
            break;
        }
      } catch {
        // ignore malformed event
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let sepIndex = buffer.indexOf("\n\n");
      while (sepIndex !== -1) {
        const block = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);
        processEventBlock(block);
        sepIndex = buffer.indexOf("\n\n");
      }
    }

    const response: SendResponse = { text: accumulatedText, citations, fallback };
    this.handleResponseBody(response);
  }
}

