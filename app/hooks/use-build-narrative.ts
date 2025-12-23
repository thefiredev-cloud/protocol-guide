import { useCallback } from "react";

import type { CarePlan, ChatMessage, Citation, NarrativeDraft, NemsisNarrative } from "../types/chat";

type ChatState = {
  messages: ChatMessage[];
  loading: boolean;
  setLoading: (value: boolean) => void;
};

type NarrativeState = {
  setSoap: React.Dispatch<React.SetStateAction<NarrativeDraft | undefined>>;
  setChronological: React.Dispatch<React.SetStateAction<NarrativeDraft | undefined>>;
  setNemsis: React.Dispatch<React.SetStateAction<NemsisNarrative | undefined>>;
  setCarePlan: React.Dispatch<React.SetStateAction<CarePlan | undefined>>;
};

type BuildDeps = {
  chat: ChatState;
  narrative: NarrativeState;
  taRef: React.RefObject<HTMLTextAreaElement>;
  appendAssistant: (text: string, citations?: Citation[]) => void;
  handleCitations: (value: unknown) => void;
  handleOrders: (text: string | undefined) => void;
  request: (payload: unknown) => Promise<{ text?: string; citations?: Citation[]; narrative?: Record<string, unknown>; carePlan?: CarePlan } & Record<string, unknown>>;
  setErrorBanner: (message: string | null) => void;
};

export function useBuildNarrative({ chat, narrative, taRef, appendAssistant, handleCitations, handleOrders, request, setErrorBanner }: BuildDeps) {
  return useCallback(async () => {
    if (chat.loading) return;
    chat.setLoading(true);
    setErrorBanner(null);
    try {
      const data = await request({ messages: chat.messages, mode: "narrative" });
      if (data?.narrative) {
        narrative.setSoap(data.narrative.soap as NarrativeDraft | undefined);
        narrative.setChronological(data.narrative.chronological as NarrativeDraft | undefined);
        narrative.setNemsis(data.narrative.nemsis as NemsisNarrative | undefined);
      }
      if (data?.carePlan) narrative.setCarePlan(data.carePlan as CarePlan);
      handleCitations(data?.citations);
      handleOrders(data?.text);
      appendAssistant("Built narrative and care plan from current conversation.");
      if ((data as { fallback?: boolean })?.fallback) {
        setErrorBanner("Limited mode - using offline guidance only.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      appendAssistant(`Sorry, something went wrong: ${message}`);
      setErrorBanner("Unable to build narrative. Please retry once connectivity restores.");
    } finally {
      chat.setLoading(false);
      (taRef as React.MutableRefObject<HTMLTextAreaElement | null>).current?.focus();
    }
  }, [appendAssistant, chat, handleCitations, handleOrders, narrative, request, setErrorBanner, taRef]);
}
