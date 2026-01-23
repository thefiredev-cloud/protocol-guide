/**
 * Haptic Feedback Utilities for Protocol Guide
 *
 * Provides platform-aware haptic feedback for critical user interactions.
 * Falls back gracefully on web with Web Vibration API when available.
 */

import { Platform } from "react-native";

// Re-export types for compatibility
export const ImpactFeedbackStyle = {
  Light: "light",
  Medium: "medium",
  Heavy: "heavy",
} as const;

export const NotificationFeedbackType = {
  Success: "success",
  Warning: "warning",
  Error: "error",
} as const;

// Lazy load expo-haptics only when needed on native platforms
let ExpoHaptics: typeof import("expo-haptics") | null = null;
let hapticsLoaded = false;

async function loadHaptics(): Promise<typeof import("expo-haptics") | null> {
  if (hapticsLoaded) return ExpoHaptics;
  hapticsLoaded = true;

  if (Platform.OS === "web") {
    return null;
  }

  try {
    ExpoHaptics = await import("expo-haptics");
    return ExpoHaptics;
  } catch {
    console.warn("[Haptics] expo-haptics not available on this platform");
    return null;
  }
}

/**
 * Trigger impact feedback with specified intensity
 */
export async function impactAsync(
  style?: (typeof ImpactFeedbackStyle)[keyof typeof ImpactFeedbackStyle]
): Promise<void> {
  // Web fallback using Vibration API
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const duration = style === "heavy" ? 50 : style === "medium" ? 30 : 15;
      navigator.vibrate(duration);
    }
    return;
  }

  const haptics = await loadHaptics();
  if (haptics) {
    const styleMap = {
      light: haptics.ImpactFeedbackStyle.Light,
      medium: haptics.ImpactFeedbackStyle.Medium,
      heavy: haptics.ImpactFeedbackStyle.Heavy,
    };
    await haptics.impactAsync(styleMap[style || "medium"]);
  }
}

/**
 * Trigger notification feedback (success, warning, error)
 */
export async function notificationAsync(
  type?: (typeof NotificationFeedbackType)[keyof typeof NotificationFeedbackType]
): Promise<void> {
  // Web fallback using Vibration API
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      if (type === "error") {
        navigator.vibrate([50, 50, 50]); // Triple pulse for error
      } else if (type === "warning") {
        navigator.vibrate([50, 30, 50]); // Double pulse for warning
      } else {
        navigator.vibrate(30); // Single pulse for success
      }
    }
    return;
  }

  const haptics = await loadHaptics();
  if (haptics) {
    const typeMap = {
      success: haptics.NotificationFeedbackType.Success,
      warning: haptics.NotificationFeedbackType.Warning,
      error: haptics.NotificationFeedbackType.Error,
    };
    await haptics.notificationAsync(typeMap[type || "success"]);
  }
}

/**
 * Trigger selection feedback (light tap for UI interactions)
 */
export async function selectionAsync(): Promise<void> {
  // Web fallback using Vibration API
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
    return;
  }

  const haptics = await loadHaptics();
  if (haptics) {
    await haptics.selectionAsync();
  }
}

// ============================================
// Protocol Guide Specific Haptic Patterns
// ============================================

/**
 * Convenience wrappers for common app interactions
 */
export const haptics = {
  /** Light tap for UI selections */
  selection: selectionAsync,

  /** Success notification */
  success: () => notificationAsync(NotificationFeedbackType.Success),

  /** Warning notification */
  warning: () => notificationAsync(NotificationFeedbackType.Warning),

  /** Error notification */
  error: () => notificationAsync(NotificationFeedbackType.Error),

  /** Light impact */
  light: () => impactAsync(ImpactFeedbackStyle.Light),

  /** Medium impact */
  medium: () => impactAsync(ImpactFeedbackStyle.Medium),

  /** Heavy impact */
  heavy: () => impactAsync(ImpactFeedbackStyle.Heavy),
};

/**
 * Protocol Guide specific haptic patterns for medical app context
 */
export const protocolHaptics = {
  /** User taps on a protocol card */
  protocolTap: selectionAsync,

  /** Protocol successfully loaded */
  protocolFound: () => notificationAsync(NotificationFeedbackType.Success),

  /** Protocol not found or search failed */
  protocolNotFound: () => notificationAsync(NotificationFeedbackType.Error),

  /** Drug interaction or contraindication warning - critical double pulse */
  criticalAlert: async (): Promise<void> => {
    await impactAsync(ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await impactAsync(ImpactFeedbackStyle.Heavy);
  },

  /** Voice search activated */
  voiceSearchStart: () => impactAsync(ImpactFeedbackStyle.Medium),

  /** Voice search result received */
  voiceSearchResult: () => notificationAsync(NotificationFeedbackType.Success),

  /** Bookmark added/removed */
  bookmarkToggle: () => impactAsync(ImpactFeedbackStyle.Light),

  /** Emergency button pressed - triple pulse for maximum attention */
  emergencyAction: async (): Promise<void> => {
    await impactAsync(ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 80));
    await impactAsync(ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 80));
    await impactAsync(ImpactFeedbackStyle.Heavy);
  },

  /** Timer tick for critical procedures */
  timerTick: () => impactAsync(ImpactFeedbackStyle.Light),

  /** Dose calculation complete */
  doseCalculated: () => notificationAsync(NotificationFeedbackType.Success),

  /** Invalid input or validation error */
  validationError: () => notificationAsync(NotificationFeedbackType.Error),
};

export default haptics;
