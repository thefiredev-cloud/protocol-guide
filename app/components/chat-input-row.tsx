"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo } from "react";

import { TextAreaAutoResizer } from "@/app/tools/text-area-auto-resizer";

export type ChatInputRowProps = {
  input: string;
  loading: boolean;
  onInput: (value: string) => void;
  onSend: () => void;
  taRef: React.RefObject<HTMLTextAreaElement>;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleVoice: () => void;
  voiceSupported: boolean;
  listening: boolean;
  onBuildNarrative: () => void;
};

export function ChatInputRow({
  input,
  loading,
  onInput,
  onSend,
  taRef,
  onKeyDown,
  onToggleVoice,
  voiceSupported,
  listening,
  onBuildNarrative,
}: ChatInputRowProps) {
  const resizer = useMemo(() => new TextAreaAutoResizer({ minHeight: 64, maxHeight: 208 }), []);

  useEffect(() => {
    if (taRef.current) {
      resizer.adjust(taRef.current);
    }
  }, [input, resizer, taRef]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInput(event.target.value);
    },
    [onInput],
  );

  const handleSubmit = useCallback(() => {
    if (!input.trim() || loading) return;
    onSend();
  }, [input, loading, onSend]);

  return (
    <div className="inputRow" role="form" aria-label="Chat controls">
      <div className="inputInner">
        <textarea
          ref={taRef}
          value={input}
          placeholder="Ask about protocols, treatments, procedures…"
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          aria-label="Message Medic Bot"
        />
        <ChatActionButtons
          loading={loading}
          listening={listening}
          onBuildNarrative={onBuildNarrative}
          onSubmit={handleSubmit}
          onToggleVoice={onToggleVoice}
          voiceSupported={voiceSupported}
        />
      </div>
    </div>
  );
}

type ChatActionButtonsProps = Pick<
  ChatInputRowProps,
  "loading" | "onToggleVoice" | "voiceSupported" | "listening" | "onBuildNarrative"
> & { onSubmit: () => void };

function ChatActionButtons({
  loading,
  onToggleVoice,
  voiceSupported,
  listening,
  onBuildNarrative,
  onSubmit,
}: ChatActionButtonsProps) {
  return (
    <div className="inputActions">
      <VoiceToggleButton
        listening={listening}
        loading={loading}
        onToggleVoice={onToggleVoice}
        voiceSupported={voiceSupported}
      />
      <button type="button" onClick={onSubmit} disabled={loading}>
        {loading ? "Thinking…" : "Send"}
      </button>
      <button type="button" onClick={onBuildNarrative} disabled={loading} title="Build SOAP/Chrono/NEMSIS narrative + care plan">
        Build Narrative
      </button>
    </div>
  );
}

type VoiceToggleButtonProps = Pick<ChatInputRowProps, "listening" | "onToggleVoice" | "voiceSupported" | "loading">;

function VoiceToggleButton({ listening, onToggleVoice, voiceSupported, loading }: VoiceToggleButtonProps) {
  const disabled = loading || !voiceSupported;
  const label = voiceSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice not supported";

  return (
    <button
      type="button"
      className={`micButton${listening ? " listening" : ""}`}
      onClick={onToggleVoice}
      disabled={disabled}
      aria-label={label}
      title={voiceSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice not supported in this browser"}
    >
      {listening ? "Stop" : "Voice"}
    </button>
  );
}
