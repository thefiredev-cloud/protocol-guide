"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, Mic, FileText } from "lucide-react";

import { ProtocolAutocomplete } from "@/app/components/protocol-autocomplete";
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
  const resizer = useMemo(() => new TextAreaAutoResizer({ minHeight: 72, maxHeight: 208 }), []);
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

      {/* Chat Action Buttons - Expandable */}
      {showControls && (
        <div className="inputActions expanded-controls">
          {/* Chat Button with Dropdown */}
          <div className="button-group" ref={chatDropdownRef}>
            <button
              type="button"
              onClick={handleChatClick}
              disabled={loading}
              className="action-button chat-button"
              title="Send message"
              aria-label="Send message"
              aria-expanded={showChatDropdown}
            >
              <MessageCircle size={18} />
              Chat
              <ChevronDown size={16} className={`dropdown-icon ${showChatDropdown ? "open" : ""}`} />
            </button>
            {showChatDropdown && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="dropdown-item send-item"
                  title="Send message (Cmd+Enter)"
                >
                  <MessageCircle size={16} />
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={handleVoiceClick}
                  disabled={loading || !voiceSupported}
                  className={`dropdown-item voice-item ${listening ? "listening" : ""}`}
                  title={voiceSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice not supported"}
                >
                  <Mic size={16} />
                  {listening ? "Stop Voice Input" : "Start Voice Input"}
                </button>
              </div>
            )}
          </div>

          {/* Voice Button - Standalone */}
          <button
            type="button"
            className={`action-button voice-button ${listening ? "listening" : ""}`}
            onClick={handleVoiceClick}
            disabled={loading || !voiceSupported}
            aria-label={voiceSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice not supported"}
            title={voiceSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice not supported in this browser"}
            aria-pressed={listening}
          >
            <Mic size={18} />
            {listening ? "Stop" : "Voice"}
            {listening && <span className="voice-recording-indicator" aria-hidden="true"></span>}
          </button>

          {/* Build Narrative Button with Dropdown */}
          <div className="button-group" ref={narrativeDropdownRef}>
            <button
              type="button"
              onClick={handleNarrativeClick}
              disabled={loading}
              className="action-button narrative-button"
              title="Build narrative"
              aria-label="Build narrative"
              aria-expanded={showNarrativeDropdown}
            >
              <FileText size={18} />
              Narrative
              <ChevronDown size={16} className={`dropdown-icon ${showNarrativeDropdown ? "open" : ""}`} />
            </button>
            {showNarrativeDropdown && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  onClick={onBuildNarrative}
                  disabled={loading}
                  className="dropdown-item narrative-item"
                  title="Build SOAP, Chronological, NEMSIS narrative + care plan"
                >
                  <FileText size={16} />
                  Build Full Narrative
                </button>
                <button
                  type="button"
                  onClick={onBuildNarrative}
                  disabled={loading}
                  className="dropdown-item narrative-item"
                  title="Build SOAP narrative"
                >
                  <FileText size={16} />
                  SOAP Format
                </button>
                <button
                  type="button"
                  onClick={onBuildNarrative}
                  disabled={loading}
                  className="dropdown-item narrative-item"
                  title="Build chronological narrative"
                >
                  <FileText size={16} />
                  Chronological Format
                </button>
              </div>
            )}
          </div>
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
