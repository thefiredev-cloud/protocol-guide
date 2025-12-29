'use client';
// v1.0 - Floating Mic Button with Push-to-Talk (Dec 29, 2025)

import { useCallback, useEffect, useRef, useState } from 'react';

import { AudioRecorderManager, RecorderState } from '../../../lib/AudioRecorderManager';
import { useHapticFeedback } from '../../hooks/use-haptic-feedback';
import { MaterialIcon } from './material-icon';

interface FloatingMicButtonProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function FloatingMicButton({
  onTranscription,
  onError,
  disabled = false
}: FloatingMicButtonProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [isPressed, setIsPressed] = useState(false);
  const recorderRef = useRef<AudioRecorderManager | null>(null);
  const { buttonPress, success, error: hapticError } = useHapticFeedback();

  // Initialize recorder
  useEffect(() => {
    recorderRef.current = new AudioRecorderManager({
      onStateChange: setRecorderState,
      onResult: (text) => {
        success();
        onTranscription(text);
      },
      onError: (err) => {
        hapticError();
        onError?.(err);
      },
    });

    return () => {
      recorderRef.current?.dispose();
    };
  }, [onTranscription, onError, success, hapticError]);

  const startRecording = useCallback(() => {
    if (disabled || !recorderRef.current || recorderState !== 'idle') return;

    buttonPress();
    setIsPressed(true);
    recorderRef.current.toggle();
  }, [disabled, recorderState, buttonPress]);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current || recorderState !== 'recording') return;

    setIsPressed(false);
    recorderRef.current.toggle();
  }, [recorderState]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    startRecording();
  }, [startRecording]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    stopRecording();
  }, [stopRecording]);

  const handlePointerLeave = useCallback(() => {
    // User dragged away - cancel recording
    if (recorderState === 'recording') {
      stopRecording();
    }
    setIsPressed(false);
  }, [recorderState, stopRecording]);

  const isRecording = recorderState === 'recording';
  const isTranscribing = recorderState === 'transcribing';

  return (
    <button
      type="button"
      disabled={disabled || isTranscribing}
      className={`
        relative flex items-center justify-center
        w-14 h-14 rounded-full
        transition-all duration-200 ease-out
        touch-none select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2
        ${isRecording
          ? 'bg-red-600 scale-110 animate-pulse-glow'
          : 'bg-primary hover:bg-primary-dark'
        }
        ${isTranscribing ? 'opacity-70' : ''}
        ${isPressed && !isRecording ? 'scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        boxShadow: isRecording
          ? '0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3)'
          : '0 4px 15px rgba(220, 38, 38, 0.4)',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      aria-label={
        isRecording
          ? 'Recording... Release to send'
          : isTranscribing
            ? 'Processing...'
            : 'Hold to speak'
      }
    >
      {/* White ring border */}
      <span
        className={`
          absolute inset-0 rounded-full border-2 border-white/30
          ${isRecording ? 'animate-recording' : ''}
        `}
      />

      {/* Icon */}
      {isTranscribing ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <MaterialIcon
          name={isRecording ? 'graphic_eq' : 'mic'}
          size={24}
          className="text-white"
        />
      )}

      {/* Recording indicator dot */}
      {isRecording && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
      )}
    </button>
  );
}
