"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ProtocolAutocomplete } from "@/app/components/protocol-autocomplete";
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
  const resizer = useMemo(() => new TextAreaAutoResizer({ minHeight: 72, maxHeight: 208 }), []);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

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
      setShowAutocomplete(false);
      setTimeout(() => {
        taRef.current?.focus();
      }, 0);
    },
    [onInput, taRef],
  );

  const handleKeyDownWithAutocomplete = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (showAutocomplete && input.trim()) {
        // Let autocomplete handle its own keyboard events
      }
      onKeyDown(event);
    },
    [onKeyDown, showAutocomplete, input],
  );

  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  return (
    <div className="chat-input-container">
      <div className={`inputRow ${showControls ? "expanded" : "collapsed"}`} role="form" aria-label="Chat controls">
        <div className="inputInner" ref={autocompleteContainerRef} style={{ position: "relative" }}>
          {showAutocomplete && input.trim() && (
            <ProtocolAutocomplete
              input={input}
              onSelect={handleProtocolSelect}
              onInputChange={onInput}
            />
          )}
          <textarea
            ref={taRef}
            value={input}
            placeholder="Ask about LA County protocols, medications, procedures..."
            onChange={handleInputChange}
            onKeyDown={handleKeyDownWithAutocomplete}
            aria-label="Message Medic Bot"
          />
          
          {/* Floating Toggle Button */}
          <button
            type="button"
            className="controls-toggle-button"
            onClick={toggleControls}
            aria-label={showControls ? "Collapse controls" : "Expand controls"}
            title={showControls ? "Hide controls" : "Show controls"}
          >
            {showControls ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>

      {/* Chat Action Buttons - Expandable */}
      {showControls && (
        <div className="inputActions expanded-controls">
          <VoiceToggleButton
            listening={listening}
            loading={loading}
            onToggleVoice={onToggleVoice}
            voiceSupported={voiceSupported}
          />
          <button type="button" onClick={handleSubmit} disabled={loading} className="send-button">
            {loading ? "Thinking…" : "Send"}
          </button>
          <button type="button" onClick={onBuildNarrative} disabled={loading} title="Build SOAP/Chrono/NEMSIS narrative + care plan" className="narrative-button">
            Build Narrative
          </button>
        </div>
      )}

      {/* Collapsed State - Floating Trigger Button */}
      {!showControls && (
        <button
          type="button"
          className="floating-expand-trigger"
          onClick={toggleControls}
          aria-label="Expand chat controls"
          title="Show chat controls"
        >
          <ChevronUp size={24} />
        </button>
      )}
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
      aria-pressed={listening}
    >
      {listening ? (
        <>
          <span className="voice-recording-indicator" aria-hidden="true"></span>
          Stop
        </>
      ) : (
        "Voice"
      )}
    </button>
  );
}
