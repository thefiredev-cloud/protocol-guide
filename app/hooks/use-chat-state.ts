import { useCallback, useState } from "react";

import type { ChatMessage } from "../types/chat";

type ChatState = {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  setInput: (value: string) => void;
  setLoading: (value: boolean) => void;
  appendMessage: (message: ChatMessage) => void;
  replaceMessages: (messages: ChatMessage[]) => void;
};

export function useChatState(initialMessages: ChatMessage[]): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const replaceMessages = useCallback((next: ChatMessage[]) => {
    setMessages(next);
  }, []);

  return {
    messages,
    input,
    loading,
    setInput,
    setLoading,
    appendMessage,
    replaceMessages,
  };
}
