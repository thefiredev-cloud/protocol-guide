/** @type {const} */
// Professional medical app color palette - matches red caduceus/book logo
const themeColors = {
  // Primary brand color - deep medical red from logo (#A31621)
  primary: { light: '#A31621', dark: '#A31621' },
  
  // Clean white background for medical clarity
  background: { light: '#FFFFFF', dark: '#FFFFFF' },
  
  // Subtle warm gray for cards and elevated surfaces
  surface: { light: '#F9FAFB', dark: '#F9FAFB' },
  
  // Rich dark text for maximum readability
  foreground: { light: '#111827', dark: '#111827' },
  
  // Warm gray for secondary text
  muted: { light: '#6B7280', dark: '#6B7280' },
  
  // Subtle border color
  border: { light: '#E5E7EB', dark: '#E5E7EB' },
  
  // Status colors - medical standard
  success: { light: '#059669', dark: '#059669' },
  warning: { light: '#D97706', dark: '#D97706' },
  error: { light: '#DC2626', dark: '#DC2626' },
};

module.exports = { themeColors };
