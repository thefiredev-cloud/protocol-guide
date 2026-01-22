// No-op haptics wrapper for web PWA
// Replaces expo-haptics which only works on native iOS/Android

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

export async function impactAsync(
  _style?: (typeof ImpactFeedbackStyle)[keyof typeof ImpactFeedbackStyle]
): Promise<void> {
  // No-op on web
}

export async function notificationAsync(
  _type?: (typeof NotificationFeedbackType)[keyof typeof NotificationFeedbackType]
): Promise<void> {
  // No-op on web
}

export async function selectionAsync(): Promise<void> {
  // No-op on web
}
