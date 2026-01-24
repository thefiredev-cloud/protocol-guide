/**
 * Voice Recording Hook
 *
 * Manages audio recording, transcription, and processing logic.
 * Handles permissions, silence detection, and max duration limits.
 */

import { useState, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { Audio, Recording } from "@/lib/audio";
import { uriToBase64 } from "@/lib/blob-utils";
import { trpc } from "@/lib/trpc";
import * as Haptics from "@/lib/haptics";
import {
  VoiceError,
  SILENCE_THRESHOLD_MS,
  MAX_RECORDING_DURATION_MS,
} from "@/components/voice";
import { RippleAnimationValues, startPulseAnimation, stopPulseAnimation } from "@/components/voice";

export interface UseVoiceRecordingProps {
  stateRef: React.MutableRefObject<"idle" | "permission_required" | "recording" | "processing" | "complete" | "error">;
  transitionTo: (newState: "idle" | "permission_required" | "recording" | "processing" | "complete" | "error") => boolean;
  animationValues: RippleAnimationValues;
  onTranscription: (text: string) => void;
  onClose: () => void;
}

export function useVoiceRecording({
  stateRef,
  transitionTo,
  animationValues,
  onTranscription,
  onClose,
}: UseVoiceRecordingProps) {
  const [errorType, setErrorType] = useState<VoiceError | null>(null);
  const [transcriptionPreview, setTranscriptionPreview] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recordingRef = useRef<Recording | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutations
  const uploadMutation = trpc.voice.uploadAudio.useMutation();
  const transcribeMutation = trpc.voice.transcribe.useMutation();

  // Clear only timeouts/intervals (safe to call anytime)
  const clearTimers = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Full cleanup function - stops recording AND clears timers (for unmount/cancel)
  const cleanupRecording = useCallback(() => {
    clearTimers();
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
  }, [clearTimers]);

  // Check and request permissions
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        transitionTo("error");
        setErrorType("permission_denied");
        return false;
      }
      return true;
    } catch {
      transitionTo("error");
      setErrorType("permission_unavailable");
      return false;
    }
  }, [transitionTo]);

  // Reset silence timeout
  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    silenceTimeoutRef.current = setTimeout(() => {
      if (recordingRef.current) {
        // Will be handled by stopRecording
      }
    }, SILENCE_THRESHOLD_MS);
  }, []);

  // Stop recording and process
  const stopRecording = useCallback(async () => {
    // Guard: Only allow stopping from recording state
    if (stateRef.current !== "recording") {
      console.warn(`stopRecording called in invalid state: ${stateRef.current}`);
      return;
    }

    // Guard: Must have an active recording
    if (!recordingRef.current) {
      console.warn("stopRecording called but no recording ref exists");
      transitionTo("error");
      setErrorType("recording_failed");
      return;
    }

    try {
      // Clear timers but DON'T cleanup recording yet - we need the ref!
      clearTimers();
      stopPulseAnimation(animationValues);

      // Transition to processing state
      if (!transitionTo("processing")) return;
      setTranscriptionPreview("Processing your speech...");

      // Haptic feedback
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Capture and clear the recording ref BEFORE async operations
      const recording = recordingRef.current;
      recordingRef.current = null;

      // Now stop and get recording URI
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error("No recording URI");
      }

      // Convert to base64 and upload (cross-platform)
      const base64 = await uriToBase64(uri);

      // Upload audio to server
      const { url: audioUrl } = await uploadMutation.mutateAsync({
        audioBase64: base64,
        mimeType: "audio/webm",
      });

      setTranscriptionPreview("Transcribing...");

      // Transcribe using server-side Whisper
      const transcriptionResult = await transcribeMutation.mutateAsync({
        audioUrl,
        language: "en",
      });

      if (!transcriptionResult.success || !transcriptionResult.text) {
        // Check for specific errors
        if (transcriptionResult.error?.includes("no speech")) {
          transitionTo("error");
          setErrorType("no_speech_detected");
          return;
        }
        throw new Error(transcriptionResult.error || "Transcription failed");
      }

      const transcribedText = transcriptionResult.text.trim();

      if (!transcribedText) {
        transitionTo("error");
        setErrorType("no_speech_detected");
        return;
      }

      // Transition to complete state
      if (!transitionTo("complete")) return;

      // Show transcription preview
      setTranscriptionPreview(transcribedText);

      // Success haptic
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Small delay to show the transcription before closing
      setTimeout(() => {
        onTranscription(transcribedText);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Voice search error:", error);

      // Check for network errors
      if (error instanceof Error && error.message.includes("network")) {
        transitionTo("error");
        setErrorType("network_error");
      } else {
        transitionTo("error");
        setErrorType("transcription_failed");
      }

      // Error haptic
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [clearTimers, animationValues, transitionTo, uploadMutation, transcribeMutation, onTranscription, onClose, stateRef]);

  // Start recording
  const startRecording = useCallback(async () => {
    // Guard: Only allow starting from idle or error state
    if (stateRef.current !== "idle" && stateRef.current !== "error") {
      console.warn(`startRecording called in invalid state: ${stateRef.current}`);
      return;
    }

    try {
      // Haptic feedback
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Check permissions
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;

      // Verify state hasn't changed during async permission check
      if (stateRef.current !== "idle" && stateRef.current !== "error") {
        console.warn("State changed during permission check, aborting startRecording");
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Verify state again after async audio setup
      if (stateRef.current !== "idle" && stateRef.current !== "error") {
        console.warn("State changed during audio setup, aborting startRecording");
        return;
      }

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;

      // Transition to recording state
      if (!transitionTo("recording")) {
        // If transition failed, clean up the recording we just created
        recording.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
        return;
      }

      setTranscriptionPreview("");
      setRecordingDuration(0);
      startPulseAnimation(animationValues);

      // Track duration
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Set up silence detection timeout
      resetSilenceTimeout();

      // Set up max duration timeout
      maxDurationTimeoutRef.current = setTimeout(() => {
        // Only stop if we're still recording
        if (stateRef.current === "recording" && recordingRef.current) {
          stopRecording();
        }
      }, MAX_RECORDING_DURATION_MS);
    } catch (error) {
      console.error("Failed to start recording:", error);
      transitionTo("error");
      setErrorType("recording_failed");
    }
  }, [checkPermissions, transitionTo, animationValues, resetSilenceTimeout, stopRecording, stateRef]);

  // Handle tap on microphone - uses stateRef for synchronous state checking
  const handleMicPress = useCallback(() => {
    const currentState = stateRef.current;

    if (currentState === "idle" || currentState === "error") {
      setErrorType(null);
      startRecording();
    } else if (currentState === "recording") {
      stopRecording();
    }
    // Ignore presses during processing or complete states
  }, [startRecording, stopRecording, stateRef]);

  return {
    errorType,
    setErrorType,
    transcriptionPreview,
    recordingDuration,
    cleanupRecording,
    startRecording,
    stopRecording,
    handleMicPress,
  };
}
