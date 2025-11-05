"use client";

import { ChevronUp, Pause, Phone, Pill, Play, Square, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { CarePlan } from "@/app/types/chat";

type QuickActionsBarProps = {
  carePlan?: CarePlan | null;
  onCallBase?: () => void;
};

export function QuickActionsBar({ carePlan, onCallBase }: QuickActionsBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check for Web Speech API support
  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleTimerToggle = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const handleTimerReset = useCallback(() => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  }, []);

  const handleCallBase = useCallback(() => {
    if (onCallBase) {
      onCallBase();
    } else {
      // Default behavior: scroll to base contact section or show alert
      const baseContactSection = document.querySelector('[data-section="base-contact"]');
      if (baseContactSection) {
        baseContactSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [onCallBase]);

  const handleDosingCalc = useCallback(() => {
    window.location.href = "/dosing";
  }, []);

  const handleReadAloud = useCallback(() => {
    if (!speechSupported) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      // Stop current speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Collect content to read aloud
    const narrativePanel = document.querySelector(".narrative-panel");
    if (!narrativePanel) {
      alert("No narrative content to read.");
      return;
    }

    // Extract text content, filtering out empty lines
    const textContent = narrativePanel.textContent || "";
    const cleanedText = textContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join(". ");

    if (!cleanedText) {
      alert("No narrative content to read.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [speechSupported, isSpeaking]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Determine if base contact is required
  const baseContactRequired =
    carePlan?.baseContact && !carePlan.baseContact.toLowerCase().includes("no base contact");

  // When closed, render only the toggle button (no bar wrapper)
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="quick-actions-toggle quick-actions-toggle-closed"
        aria-label="Show quick actions"
        title="Show Actions"
      >
        <ChevronUp size={20} />
      </button>
    );
  }

  // When open, render the full bar
  return (
    <div className="quick-actions quick-actions-open">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="quick-actions-toggle quick-actions-toggle-open"
        aria-label="Hide quick actions"
        title="Hide Actions"
      >
        <ChevronUp size={20} className="rotate-180" />
      </button>

      {/* Quick Actions Content */}
      <div className="quick-actions-inner">
        {/* Scene Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="timer-display" aria-live="polite" aria-atomic="true">
            {formatTime(timerSeconds)}
          </div>
          <button
            type="button"
            onClick={handleTimerToggle}
            className="action-button-secondary"
            aria-label={isTimerRunning ? "Pause scene timer" : "Start scene timer"}
            title={isTimerRunning ? "Pause Timer" : "Start Timer"}
          >
            {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            type="button"
            onClick={handleTimerReset}
            className="action-button-secondary"
            aria-label="Reset scene timer"
            title="Reset Timer"
          >
            <Square size={18} />
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Call Base button - only show if base contact is required */}
          {baseContactRequired && (
            <button
              type="button"
              onClick={handleCallBase}
              className="action-button-primary"
              aria-label="Call base hospital"
              title="Call Base - Contact Required"
            >
              <Phone size={20} /> Call Base
            </button>
          )}

          {/* Dosing Calculator */}
          <button
            type="button"
            onClick={handleDosingCalc}
            className="action-button-secondary"
            aria-label="Open dosing calculator"
            title="Dosing Calculator"
          >
            <Pill size={20} /> Dosing
          </button>

          {/* Read Aloud */}
          <button
            type="button"
            onClick={handleReadAloud}
            className="action-button-secondary"
            disabled={!speechSupported}
            aria-label={isSpeaking ? "Stop reading aloud" : "Read narrative aloud"}
            title={isSpeaking ? "Stop Reading" : "Read Aloud"}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />} {isSpeaking ? "Stop" : "Read"}
          </button>
        </div>
      </div>
    </div>
  );
}
