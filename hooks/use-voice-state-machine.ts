/**
 * Voice State Machine Hook
 *
 * Manages voice recording state transitions with proper validation.
 * Prevents invalid state changes and provides synchronous state access.
 */

import { useState, useCallback, useRef } from "react";
import { RecordingState, VALID_TRANSITIONS } from "@/components/voice/voice-constants";

export function useVoiceStateMachine() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");

  // Use ref to track current state synchronously (prevents race conditions)
  const stateRef = useRef<RecordingState>("idle");

  /**
   * State machine transition function
   * Validates transitions and prevents invalid state changes
   * @returns true if transition was successful, false otherwise
   */
  const transitionTo = useCallback((newState: RecordingState): boolean => {
    const currentState = stateRef.current;
    const validNextStates = VALID_TRANSITIONS[currentState];

    if (!validNextStates.includes(newState)) {
      console.warn(`Invalid state transition: ${currentState} -> ${newState}`);
      return false;
    }

    stateRef.current = newState;
    setRecordingState(newState);
    return true;
  }, []);

  /**
   * Reset state to idle
   */
  const resetState = useCallback(() => {
    stateRef.current = "idle";
    setRecordingState("idle");
  }, []);

  return {
    recordingState,
    stateRef,
    transitionTo,
    resetState,
  };
}
