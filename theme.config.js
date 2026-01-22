/** @type {const} */
// Professional medical app color palette - Deep Slate dark theme
const themeColors = {
  // Primary brand color - Signal Red (brightened for dark theme visibility)
  primary: { light: '#A31621', dark: '#EF4444' },

  // Deep Slate background
  background: { light: '#FFFFFF', dark: '#0F172A' },

  // Charcoal surface for cards and elevated surfaces
  surface: { light: '#F9FAFB', dark: '#1E293B' },

  // Cloud White text for maximum readability on dark
  foreground: { light: '#111827', dark: '#F1F5F9' },

  // Secondary text - brightened for dark theme
  muted: { light: '#6B7280', dark: '#94A3B8' },

  // Dark border color
  border: { light: '#E5E7EB', dark: '#334155' },

  // Status colors - brightened for dark theme
  success: { light: '#059669', dark: '#10B981' },
  warning: { light: '#D97706', dark: '#F59E0B' },
  error: { light: '#DC2626', dark: '#EF4444' },
};

module.exports = { themeColors };
