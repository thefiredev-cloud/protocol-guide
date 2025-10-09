export function parseAllergies(text: string): string[] | undefined {
  const m = text.match(/(?:allerg(?:y|ies)\s*[:\-]\s*)([^\n;\.]+)/i);
  if (!m) {
    if (/\b(nkda|no known drug allergies)\b/i.test(text)) return ["NKDA"];
    return undefined;
  }
  return m[1]
    .split(/[,;\/]|\band\b/i)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function parseMedications(text: string): string[] | undefined {
  const m = text.match(/\b(?:meds?|medications?)\s*[:\-]\s*([^\n;\.]+)/i);
  if (!m) return undefined;
  return m[1]
    .split(/[,;\/]|\band\b/i)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}


