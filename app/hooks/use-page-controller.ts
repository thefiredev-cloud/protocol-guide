import { useCallback, useRef, useState } from "react";

import { useAppendAssistant } from "@/app/hooks/use-append-assistant";
import { useBuildNarrative } from "@/app/hooks/use-build-narrative";
import { useChatState } from "@/app/hooks/use-chat-state";
import { useNarrativeState } from "@/app/hooks/use-narrative-state";
import { useOrdersCitations } from "@/app/hooks/use-orders-citations";
import { useScrollAnchor } from "@/app/hooks/use-scroll-anchor";
import { useSendHandler } from "@/app/hooks/use-send-handler";
import { useVoiceInput } from "@/app/hooks/use-voice-input";
import type { ChatMessage } from "@/app/types/chat";

async function requestChat(payload: unknown, options?: { stream?: boolean }) {
  const endpoint = options?.stream ? "/api/chat/stream" : "/api/chat";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Redirect to login page
    window.location.href = "/login";
    throw new Error("Authentication required - redirecting to login...");
  }

  if (!response.ok) throw new Error(await response.text());
  if (options?.stream) {
    return response.body as ReadableStream<Uint8Array>;
  }
  return response.json();
}

type ControllerRefs = {
  taRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  sendRef: React.MutableRefObject<() => Promise<void>>;
};

type ControllerState = {
  chat: ReturnType<typeof useChatState>;
  narrative: ReturnType<typeof useNarrativeState>;
  endRef: React.RefObject<HTMLDivElement>;
  refs: ControllerRefs;
  errorBanner: string | null;
  setErrorBanner: React.Dispatch<React.SetStateAction<string | null>>;
};

function useControllerState(initialMessages: ChatMessage[]): ControllerState {
  const chat = useChatState(initialMessages);
  const narrative = useNarrativeState();
  const endRef = useScrollAnchor([chat.messages]);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const sendRef = useRef<() => Promise<void>>(async () => {});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  return { chat, narrative, endRef, refs: { taRef, sendRef }, errorBanner, setErrorBanner };
}

function useVoiceControls(chat: ReturnType<typeof useChatState>, refs: ControllerRefs) {
  const voice = useVoiceInput(chat.setInput, () => {
    void refs.sendRef.current?.();
  });

  const onToggleVoice = useCallback(() => {
    voice.toggle(refs.taRef, chat.loading, Boolean(chat.input.trim()));
  }, [chat.input, chat.loading, voice, refs.taRef]);

  return { voice, onToggleVoice };
}

function useSelectionHandler(chat: ReturnType<typeof useChatState>, send: () => Promise<void>) {
  return useCallback(
    (protocolKey: string) => {
      chat.setInput(protocolKey);
      if (!chat.loading) {
        setTimeout(() => {
          void send();
        }, 10);
      }
    },
    [chat, send],
  );
}

type PageController = {
  chat: ReturnType<typeof useChatState>;
  narrative: ReturnType<typeof useNarrativeState>;
  endRef: React.RefObject<HTMLDivElement>;
  taRef: React.RefObject<HTMLTextAreaElement>;
  voice: ReturnType<typeof useVoiceInput>;
  send: () => Promise<void>;
  buildNarrative: () => Promise<void>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleVoice: () => void;
  sendProtocolSelection: (protocolKey: string) => void;
  errorBanner: string | null;
  setErrorBanner: React.Dispatch<React.SetStateAction<string | null>>;
};

type ControllerDeps = ReturnType<typeof useControllerState> & {
  appendAssistant: (text: string) => void;
  handlers: ReturnType<typeof useOrdersCitations>;
};

function useChatHandlersConfig({ chat, narrative, refs, appendAssistant, handlers, setErrorBanner }: ControllerDeps & {
  setErrorBanner: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const send = useSendHandler({
    chat,
    narrative,
    taRef: refs.taRef,
    appendAssistant,
    handleCitations: handlers.handleCitations,
    handleOrders: handlers.handleOrders,
    request: requestChat,
    setErrorBanner,
    enableStreaming: true,
  });

  const buildNarrative = useBuildNarrative({
    chat,
    narrative,
    taRef: refs.taRef,
    appendAssistant,
    handleCitations: handlers.handleCitations,
    handleOrders: handlers.handleOrders,
    request: requestChat,
    setErrorBanner,
  });

  refs.sendRef.current = send;

  return { send, buildNarrative };
}

export function usePageController(initialMessages: ChatMessage[]): PageController {
  const controllerState = useControllerState(initialMessages);
  const handlers = useOrdersCitations(controllerState.narrative.setRecentOrders, controllerState.narrative.setCitations);
  const appendAssistant = useAppendAssistant(controllerState.chat);
  const { send, buildNarrative } = useChatHandlersConfig({
    ...controllerState,
    appendAssistant,
    handlers,
    setErrorBanner: controllerState.setErrorBanner,
  });

  const { voice, onToggleVoice } = useVoiceControls(controllerState.chat, controllerState.refs);
  const sendProtocolSelection = useSelectionHandler(controllerState.chat, send);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void send();
      }
    },
    [send],
  );

  return {
    chat: controllerState.chat,
    narrative: controllerState.narrative,
    endRef: controllerState.endRef,
    taRef: controllerState.refs.taRef,
    voice,
    send,
    buildNarrative,
    onKeyDown,
    onToggleVoice,
    sendProtocolSelection,
    errorBanner: controllerState.errorBanner,
    setErrorBanner: controllerState.setErrorBanner,
  };
}
