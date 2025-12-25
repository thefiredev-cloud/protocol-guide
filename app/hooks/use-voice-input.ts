import { useCallback, useEffect, useRef, useState } from "react";

import { AudioRecorderManager, RecorderState } from "../../lib/AudioRecorderManager";

export type VoiceInputController = {
  /** Current state: idle, recording, or transcribing */
  state: RecorderState;
  /** Convenience check for recording state */
  listening: boolean;
  /** Whether browser supports audio recording */
  voiceSupported: boolean;
  /** Toggle recording on/off */
  toggle: () => void;
};

export function useVoiceInput(
  setInput: (text: string) => void, 
  onAutoSend: () => void
): VoiceInputController {
  const [state, setState] = useState<RecorderState>("idle");
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  // Use ref to maintain stable instance across re-renders
  const recorderRef = useRef<AudioRecorderManager | null>(null);
  
  // Store callbacks in refs to avoid recreating the manager
  const setInputRef = useRef(setInput);
  const onAutoSendRef = useRef(onAutoSend);
  
  // Keep refs updated
  useEffect(() => {
    setInputRef.current = setInput;
    onAutoSendRef.current = onAutoSend;
  }, [setInput, onAutoSend]);

  // Initialize recorder once
  useEffect(() => {
    console.log("[useVoiceInput] Initializing AudioRecorderManager");
    
    const manager = new AudioRecorderManager({
      onStateChange: (newState) => {
        console.log("[useVoiceInput] State changed to:", newState);
        setState(newState);
      },
      onResult: (text) => {
        console.log("[useVoiceInput] Got result:", text);
        setInputRef.current(text);
        // Small delay to ensure input is set before sending
        setTimeout(() => {
          onAutoSendRef.current();
        }, 50);
      },
      onError: (error) => {
        console.error("[useVoiceInput] Error:", error);
        if (error === "not-allowed") {
          alert("Microphone access denied.\n\nTo fix:\n1. Click the lock icon in your browser's address bar\n2. Set Microphone to 'Allow'\n3. Refresh the page");
        } else if (error === "no-microphone") {
          alert("No microphone detected. Please connect a microphone and try again.");
        } else if (error === "transcription-timeout") {
          alert("Transcription timed out.\n\nThe server took too long to respond. Please try again with a shorter recording, or check your connection.");
        }
      },
    });
    
    recorderRef.current = manager;
    setVoiceSupported(manager.supported);
    
    return () => {
      console.log("[useVoiceInput] Cleaning up");
      manager.dispose();
      recorderRef.current = null;
    };
  }, []); // Empty deps - only run once

  const toggle = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) {
      console.warn("[useVoiceInput] No recorder");
      return;
    }
    void recorder.toggle();
  }, []);

  return { 
    state,
    listening: state === "recording", 
    voiceSupported, 
    toggle 
  };
}
