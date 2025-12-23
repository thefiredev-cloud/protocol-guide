import { useCallback } from "react";

import type { ChatMessage, Citation } from "../types/chat";

type ChatState = {
  appendMessage: (message: ChatMessage) => void;
};

export function useAppendAssistant(chat: ChatState) {
  return useCallback(
    (text: string, citations?: Citation[]) => {
      chat.appendMessage({ role: "assistant", content: text, citations });
    },
    [chat],
  );
}
