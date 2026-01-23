import { useState, useRef, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useAudioRecorder, AudioModule, RecordingPresets } from "@/lib/audio";
import * as FileSystem from "expo-file-system/legacy";
import { trpc } from "@/lib/trpc";

// Proper state machine states
type RecordingState = "idle" | "recording" | "processing" | "complete";

// Valid state transitions
const VALID_TRANSITIONS: Record<RecordingState, RecordingState[]> = {
  idle: ["recording"],
  recording: ["processing", "idle"], // idle for cancel/error
  processing: ["complete", "idle"], // idle for error
  complete: ["idle"],
};

type VoiceInputState = {
  recordingState: RecordingState;
  error: string | null;
};

// Legacy computed properties for backwards compatibility
type VoiceInputStateComputed = VoiceInputState & {
  isRecording: boolean;
  isProcessing: boolean;
};

export function useVoiceInput(onTranscription: (text: string) => void) {
  const [state, setState] = useState<VoiceInputState>({
    recordingState: "idle",
    error: null,
  });

  // Use ref to track current state synchronously (prevents race conditions)
  const stateRef = useRef<RecordingState>("idle");

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const uploadMutation = trpc.voice.uploadAudio.useMutation();
  const transcribeMutation = trpc.voice.transcribe.useMutation();

  // State machine transition function - validates transitions
  const transitionTo = useCallback((newState: RecordingState): boolean => {
    const currentState = stateRef.current;
    const validNextStates = VALID_TRANSITIONS[currentState];

    if (!validNextStates.includes(newState)) {
      console.warn(`useVoiceInput: Invalid state transition: ${currentState} -> ${newState}`);
      return false;
    }

    stateRef.current = newState;
    setState(prev => ({ ...prev, recordingState: newState }));
    return true;
  }, []);

  const startRecording = useCallback(async () => {
    // Guard: Only allow starting from idle state
    if (stateRef.current !== "idle") {
      console.warn(`startRecording called in invalid state: ${stateRef.current}`);
      return;
    }

    try {
      // Request permissions first (before changing state)
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setState(prev => ({ ...prev, error: "Microphone permission denied" }));
        if (Platform.OS !== "web") {
          Alert.alert("Permission Required", "Please enable microphone access in settings.");
        }
        return;
      }

      // Verify state hasn't changed during async operation
      if (stateRef.current !== "idle") {
        console.warn("State changed during permission check, aborting startRecording");
        return;
      }

      // Transition to recording state
      if (!transitionTo("recording")) return;
      setState(prev => ({ ...prev, error: null }));

      // Start recording
      await audioRecorder.record();
    } catch (error) {
      console.error("Failed to start recording:", error);
      stateRef.current = "idle";
      setState({
        recordingState: "idle",
        error: "Failed to start recording"
      });
    }
  }, [audioRecorder, transitionTo]);

  const stopRecording = useCallback(async () => {
    // Guard: Only allow stopping from recording state
    if (stateRef.current !== "recording") {
      console.warn(`stopRecording called in invalid state: ${stateRef.current}`);
      return;
    }

    try {
      // Transition to processing state
      if (!transitionTo("processing")) return;

      // Stop recording
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) {
        transitionTo("idle");
        setState(prev => ({ ...prev, error: "No recording found" }));
        return;
      }

      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload to storage
      const { url } = await uploadMutation.mutateAsync({
        audioBase64: base64,
        mimeType: "audio/m4a",
      });

      // Transcribe
      const result = await transcribeMutation.mutateAsync({
        audioUrl: url,
        language: "en",
      });

      if (result.success && result.text) {
        // Transition to complete, then back to idle
        transitionTo("complete");
        onTranscription(result.text);
        // Reset to idle after completion
        setTimeout(() => {
          if (stateRef.current === "complete") {
            transitionTo("idle");
          }
        }, 100);
        setState(prev => ({ ...prev, error: null }));
      } else {
        transitionTo("idle");
        setState(prev => ({
          ...prev,
          error: result.error || "Transcription failed"
        }));
      }

      // Clean up the local file
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // Ignore cleanup errors
      }
    } catch (error) {
      console.error("Failed to process recording:", error);
      stateRef.current = "idle";
      setState({
        recordingState: "idle",
        error: "Failed to process recording"
      });
    }
  }, [audioRecorder, transitionTo, uploadMutation, transcribeMutation, onTranscription]);

  const toggleRecording = useCallback(async () => {
    const currentState = stateRef.current;
    if (currentState === "recording") {
      await stopRecording();
    } else if (currentState === "idle") {
      await startRecording();
    }
    // Ignore toggle during processing or complete states
  }, [startRecording, stopRecording]);

  // Compute legacy boolean flags for backwards compatibility
  const computedState: VoiceInputStateComputed = {
    ...state,
    isRecording: state.recordingState === "recording",
    isProcessing: state.recordingState === "processing",
  };

  return {
    ...computedState,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
