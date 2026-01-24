/**
 * Extract key steps from protocol content (fallback when LLM summary fails)
 */
export function extractKeySteps(content: string, query: string): string {
  const lines = content.split('\n').filter(l => l.trim());
  const keyLines: string[] = [];

  // Look for medication dosages and key actions
  const patterns = [
    /\d+\s*(mg|mcg|ml|mL|g|units?)/i,
    /IV|IO|IM|SQ|PO|ET|IN/,
    /CPR|AED|defib|shock|epi|amio|narcan|nalox/i,
    /assess|monitor|establish|admin|give|push/i,
  ];

  for (const line of lines) {
    if (patterns.some(p => p.test(line))) {
      const clean = line.replace(/^[-•*]\s*/, '').trim();
      if (clean.length > 10 && clean.length < 100) {
        keyLines.push(clean);
      }
    }
    if (keyLines.length >= 5) break;
  }

  if (keyLines.length === 0) {
    return "Protocol found. Tap to view full content.";
  }

  return keyLines.map((l, i) => `${i + 1}. ${l}`).join('\n');
}

/**
 * Get color for protocol year based on age
 */
export function getYearColor(year: number | undefined, colors: {
  muted: string;
  success: string;
  primary: string;
  warning: string;
}): string {
  if (!year) return colors.muted;
  const age = new Date().getFullYear() - year;
  if (age <= 1) return colors.success;
  if (age <= 2) return colors.primary;
  return colors.warning;
}
