"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo } from "react";

import type { RecorderState } from "../../../lib/AudioRecorderManager";
import { TextAreaAutoResizer } from "../../tools/text-area-auto-resizer";
import { MaterialIcon } from "../ui/material-icon";
import { ProtocolAutocomplete } from "./protocol-autocomplete";

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
 * Pill-shaped input with send button, matching new frontend design
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
  const resizer = useMemo(
    () => new TextAreaAutoResizer({ minHeight: 40, maxHeight: 120 }),
    []
  );

  useEffect(() => {
    if (taRef.current) {
      resizer.adjust(taRef.current);
    }
  }, [input, resizer, taRef]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInput(event.target.value);
    },
    [onInput]
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
    [onInput, taRef]
  );

  const isTranscribing = voiceState === "transcribing";

  return (
    <div className="fixed bottom-[85px] left-0 w-full px-5 z-40">
      <div className="max-w-md mx-auto">
        {/* Protocol Autocomplete */}
        {input.trim() && (
          <div className="mb-2">
            <ProtocolAutocomplete
              input={input}
              onSelect={handleProtocolSelect}
              onInputChange={onInput}
            />
          </div>
        )}

        {/* Voice status indicator */}
        {(listening || isTranscribing) && (
          <div className="flex justify-center mb-2">
            <span
              className={`
                text-xs font-medium px-3 py-1 rounded-full
                ${listening ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : ""}
                ${isTranscribing ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""}
              `}
            >
              {isTranscribing ? "Transcribing..." : "Listening... tap mic to stop"}
            </span>
          </div>
        )}

        {/* Input row */}
        <div className="relative flex items-end gap-2">
          {/* Pill-shaped input container */}
          <div
            className={`
              flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-lg
              border border-gray-200 dark:border-gray-700
              flex items-center p-1.5 pl-4
              transition-all
              focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50
            `}
          >
            <textarea
              ref={taRef}
              value={input}
              placeholder="Ask about a protocol..."
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent border-none p-0 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 focus:outline-none resize-none"
              aria-label="Message input"
              rows={1}
            />

            {/* Attach/Voice button inside input */}
            <button
              type="button"
              onClick={onToggleVoice}
              disabled={loading || !voiceSupported || isTranscribing}
              className={`
                p-2 rounded-full transition-colors
                ${listening
                  ? "text-primary bg-red-50 dark:bg-red-900/20"
                  : "text-gray-400 hover:text-primary dark:hover:text-primary"
                }
                disabled:opacity-50
              `}
              aria-label={listening ? "Stop listening" : "Start voice input"}
            >
              <MaterialIcon
                name={isTranscribing ? "hourglass_top" : "mic"}
                size={20}
                className={isTranscribing ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className={`
              w-11 h-11 rounded-full flex items-center justify-center
              transition-colors active:scale-95
              ${input.trim() && !loading
                ? "bg-primary text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              }
              disabled:opacity-50
            `}
            aria-label="Send message"
          >
            {loading ? (
              <MaterialIcon name="hourglass_top" size={20} className="animate-spin" />
            ) : (
              <MaterialIcon name="send" size={20} className="ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
