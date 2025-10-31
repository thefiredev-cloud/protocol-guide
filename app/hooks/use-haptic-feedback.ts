'use client';

import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Hook for triggering haptic feedback (vibration) on supported devices
 * Useful for critical actions in EMS context (medications, protocols, etc.)
 */
export function useHapticFeedback() {
  const triggerHaptic = useCallback((pattern: HapticPattern = 'light') => {
    // Check if device supports vibration API
    if (!navigator.vibrate) {
      return;
    }

    // Different vibration patterns for different feedback types
    const patterns: Record<HapticPattern, number | number[]> = {
      light: 10,           // Single light tap
      medium: 20,          // Single medium tap
      heavy: 50,           // Single strong tap
      success: [20, 30, 20], // Double tap
      warning: [30, 50, 30], // Long-short-long pattern
      error: [50, 100, 50, 100, 50], // Repeating alert pattern
      selection: [10, 20, 10], // Selection/toggle pattern
    };

    try {
      navigator.vibrate(patterns[pattern]);
    } catch (error) {
      // Silently fail if vibration is not supported
      console.debug('Haptic feedback not supported:', error);
    }
  }, []);

  // Convenience methods for common actions
  return {
    triggerHaptic,
    // Common action feedback
    tap: () => triggerHaptic('light'),
    buttonPress: () => triggerHaptic('medium'),
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
    selection: () => triggerHaptic('selection'),
    // EMS-specific feedback
    medicationSelected: () => triggerHaptic('success'),
    protocolActivated: () => triggerHaptic('heavy'),
    callBaseAlert: () => triggerHaptic('error'),
    emergencyAction: () => triggerHaptic('error'),
  };
}
