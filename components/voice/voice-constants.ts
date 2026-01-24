/**
 * Voice Search Constants and Types
 *
 * Centralized configuration for voice recording and transcription.
 * Includes error messages, state machine configuration, and timing thresholds.
 */

// Recording state types - proper state machine
export type RecordingState = "idle" | "permission_required" | "recording" | "processing" | "complete" | "error";

// Valid state transitions - prevents invalid state changes
export const VALID_TRANSITIONS: Record<RecordingState, RecordingState[]> = {
  idle: ["recording", "permission_required"],
  permission_required: ["idle", "error"],
  recording: ["processing", "error", "idle"], // idle for cancel
  processing: ["complete", "error"],
  complete: ["idle"],
  error: ["idle", "recording"],
};

// Error types for better UX messaging
export type VoiceError =
  | "permission_denied"
  | "permission_unavailable"
  | "recording_failed"
  | "transcription_failed"
  | "no_speech_detected"
  | "network_error";

export const ERROR_MESSAGES: Record<VoiceError, { title: string; message: string }> = {
  permission_denied: {
    title: "Microphone Access Denied",
    message: "Please enable microphone access in your device settings to use voice search.",
  },
  permission_unavailable: {
    title: "Microphone Unavailable",
    message: "Your device does not support microphone access or it is being used by another app.",
  },
  recording_failed: {
    title: "Recording Failed",
    message: "Could not start recording. Please try again.",
  },
  transcription_failed: {
    title: "Transcription Failed",
    message: "Could not process your speech. Please try again with clearer audio.",
  },
  no_speech_detected: {
    title: "No Speech Detected",
    message: "We didn't hear anything. Tap the microphone and speak clearly.",
  },
  network_error: {
    title: "Connection Error",
    message: "Please check your internet connection and try again.",
  },
};

// Silence detection configuration
export const SILENCE_THRESHOLD_MS = 2500; // 2.5 seconds of silence to auto-stop
export const MAX_RECORDING_DURATION_MS = 30000; // 30 seconds max
