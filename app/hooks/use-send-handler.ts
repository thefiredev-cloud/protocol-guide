import { useCallback, useMemo } from "react";

import { MessageSendManager } from "@/app/managers/message-send-manager";
import type { CarePlan, ChatMessage, Citation } from "@/app/types/chat";

type ChatState = {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  replaceMessages: (messages: ChatMessage[]) => void;
  setInput: (value: string) => void;
  setLoading: (value: boolean) => void;
};

type NarrativeState = {
  reset: () => void;
};

type SendDeps = {
  chat: ChatState;
  narrative: NarrativeState;
  taRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  appendAssistant: (text: string, citations?: Citation[]) => void;
  handleCitations: (value: unknown) => void;
  handleOrders: (text: string | undefined) => void;
  request: (payload: unknown, options?: { stream?: boolean }) => Promise<
    | ({
        text?: string;
        citations?: Citation[];
        carePlan?: CarePlan;
        fallback?: boolean;
        error?: { message?: string };
      } & Record<string, unknown>)
    | ReadableStream<Uint8Array>
  >;
  setErrorBanner: (message: string | null) => void;
  enableStreaming?: boolean;
  /** Provider level for scope of practice (default: Paramedic) */
  providerLevel?: "EMT" | "Paramedic";
};

export function useSendHandler({ chat, narrative, taRef, appendAssistant, handleCitations, handleOrders, request, setErrorBanner, enableStreaming, providerLevel = "Paramedic" }: SendDeps) {
  const resetNarrative = narrative.reset;

  const manager = useMemo(
    () =>
      new MessageSendManager({
        request,
        streamHandler: {
          appendAssistant,
          resetNarrative,
          handleCitations,
          handleOrders,
          setErrorBanner,
        },
      }),
    [appendAssistant, handleCitations, handleOrders, request, resetNarrative, setErrorBanner],
  );

  return useCallback(async () => {
    if (chat.loading) return;

    const trimmedInput = chat.input.trim();
    if (!trimmedInput) return;

    const nextMessages: ChatMessage[] = [...chat.messages, { role: "user", content: trimmedInput }];
    chat.replaceMessages(nextMessages);
    chat.setInput("");
    chat.setLoading(true);
    setErrorBanner(null);

    try {
      await manager.send({ messages: nextMessages, providerLevel }, enableStreaming ? { stream: true } : undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      appendAssistant(`Sorry, something went wrong: ${message}`);
      setErrorBanner("Unable to reach Medic Bot. Please retry shortly.");
    } finally {
      chat.setLoading(false);
      taRef.current?.focus();
    }
  }, [appendAssistant, chat, enableStreaming, manager, setErrorBanner, taRef]);
}
