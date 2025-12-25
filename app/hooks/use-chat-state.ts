import { useCallback, useState } from "react";

import type { ChatMessage } from "../types/chat";

type ChatState = {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  streaming: boolean;
  setInput: (value: string) => void;
  setLoading: (value: boolean) => void;
  setStreaming: (value: boolean) => void;
  appendMessage: (message: ChatMessage) => void;
  replaceMessages: (messages: ChatMessage[]) => void;
  updateLastMessage: (content: string) => void;
};

export function useChatState(initialMessages: ChatMessage[]): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const replaceMessages = useCallback((next: ChatMessage[]) => {
    setMessages(next);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== "assistant") return prev;
      return [...prev.slice(0, -1), { ...last, content }];
    });
  }, []);

  return {
    messages,
    input,
    loading,
    streaming,
    setInput,
    setLoading,
    setStreaming,
    appendMessage,
    replaceMessages,
    updateLastMessage,
  };
}
