"use client";

import { Loader2, Mic, Send } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo } from "react";

import { ProtocolAutocomplete } from "@/app/components/chat/protocol-autocomplete";
import { TextAreaAutoResizer } from "@/app/tools/text-area-auto-resizer";
import type { RecorderState } from "@/lib/AudioRecorderManager";

export interface VoiceFirstInputProps {
  input: string;
  loading: boolean;
  onInput: (value: string) => void;
  onSend: () => void;
  taRef: React.RefObject<HTMLTextAreaElement>;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleVoice: () => void;
  voiceSupported: boolean;
  listening: boolean;
  /** Voice recorder state for better UI feedback */
  voiceState?: RecorderState;
}

/**
 * Voice-first input component for chatbot
 * Large microphone button as primary input, text as secondary
 */
export function VoiceFirstInput({
  input,
  loading,
  onInput,
  onSend,
  taRef,
  onKeyDown,
  onToggleVoice,
  voiceSupported,
  listening,
  voiceState = "idle",
}: VoiceFirstInputProps) {
  const resizer = useMemo(() => new TextAreaAutoResizer({ minHeight: 48, maxHeight: 120 }), []);

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

  const handleProtocolSelect = useCallback(
    (protocol: string) => {
      onInput(protocol);
      setTimeout(() => {
        taRef.current?.focus();
      }, 0);
    },
    [onInput, taRef],
  );

  const getVoiceStatus = () => {
    if (!voiceSupported) return "Voice not supported";
    switch (voiceState) {
      case "recording":
        return "Listening... (tap to stop)";
      case "transcribing":
        return "Transcribing...";
      default:
        return "Tap to speak";
    }
  };

  const isTranscribing = voiceState === "transcribing";
  const isDisabled = loading || !voiceSupported || isTranscribing;

  return (
    <div className="chatbot-input-area">
      <div className="voice-input-container">
        {/* Voice button - primary input */}
        <button
          type="button"
          className={`voice-button ${listening ? "listening" : ""} ${isTranscribing ? "transcribing" : ""}`}
          onClick={onToggleVoice}
          disabled={isDisabled}
          aria-label={listening ? "Stop listening" : "Start voice input"}
        >
          {isTranscribing ? <Loader2 className="animate-spin" /> : <Mic />}
        </button>
        <span className={`voice-status ${listening ? "active" : ""} ${isTranscribing ? "transcribing" : ""}`}>
          {getVoiceStatus()}
        </span>

        {/* Text input row - secondary */}
        <div className="text-input-row">
          {input.trim() && (
            <ProtocolAutocomplete
              input={input}
              onSelect={handleProtocolSelect}
              onInputChange={onInput}
            />
          )}
          <textarea
            ref={taRef}
            value={input}
            placeholder="Type your question..."
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            className="text-input"
            aria-label="Message input"
            rows={1}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="send-button"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
