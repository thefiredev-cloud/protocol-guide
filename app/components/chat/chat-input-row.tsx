"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Mic, FileText } from "lucide-react";

import { ProtocolAutocomplete } from "@/app/components/chat/protocol-autocomplete";
import { TextAreaAutoResizer } from "@/app/tools/text-area-auto-resizer";
import "./chat-input-styles.css";

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
  // iPad-optimized: Fixed height for better gloved-hand interaction
  const resizer = useMemo(() => new TextAreaAutoResizer({ minHeight: 100, maxHeight: 160 }), []);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [showNarrativeDropdown, setShowNarrativeDropdown] = useState(false);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const chatDropdownRef = useRef<HTMLDivElement>(null);
  const narrativeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (taRef.current) {
      resizer.adjust(taRef.current);
    }
  }, [input, resizer, taRef]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatDropdownRef.current && !chatDropdownRef.current.contains(event.target as Node)) {
        setShowChatDropdown(false);
      }
      if (narrativeDropdownRef.current && !narrativeDropdownRef.current.contains(event.target as Node)) {
        setShowNarrativeDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleChatClick = useCallback(() => {
    setShowChatDropdown((prev) => !prev);
    setShowNarrativeDropdown(false);
  }, []);

  const handleNarrativeClick = useCallback(() => {
    setShowNarrativeDropdown((prev) => !prev);
    setShowChatDropdown(false);
  }, []);

  const handleVoiceClick = useCallback(() => {
    setShowChatDropdown(false);
    setShowNarrativeDropdown(false);
    onToggleVoice();
  }, [onToggleVoice]);

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

      {/* Chat Action Buttons - SIMPLIFIED for Tablet (No Dropdowns) */}
      {showControls && (
        <div className="inputActions expanded-controls-simplified">
          {/* Send Message Button - Direct Action */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="action-button send-button-tablet"
            title="Send message (Cmd+Enter)"
            aria-label="Send message"
          >
            <MessageCircle size={20} />
            <span className="button-label">Send</span>
          </button>

          {/* Voice Button - Standalone, Enhanced for Tablet */}
          <button
            type="button"
            className={`action-button voice-button-tablet ${listening ? "listening" : ""}`}
            onClick={handleVoiceClick}
            disabled={loading || !voiceSupported}
            aria-label={voiceSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice not supported"}
            title={voiceSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice not supported in this browser"}
            aria-pressed={listening}
          >
            <Mic size={28} />
            {listening && <span className="voice-recording-indicator" aria-hidden="true"></span>}
          </button>

          {/* Build Narrative Button - Direct Action */}
          <button
            type="button"
            onClick={onBuildNarrative}
            disabled={loading}
            className="action-button narrative-button-tablet"
            title="Build patient narrative report"
            aria-label="Build narrative"
          >
            <FileText size={20} />
            <span className="button-label">Narrative</span>
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
