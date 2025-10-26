/* eslint-disable complexity */
function normalizeQuadrant(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/\b(luq|left upper quadrant|upper left quadrant)\b/.test(lower)) return "LUQ";
  if (/\b(ruq|right upper quadrant|upper right quadrant)\b/.test(lower)) return "RUQ";
  if (/\b(llq|left lower quadrant|lower left quadrant)\b/.test(lower)) return "LLQ";
  if (/\b(rlq|right lower quadrant|lower right quadrant)\b/.test(lower)) return "RLQ";
  return undefined;
}

export function parseChiefComplaint(text: string): { cc?: string; painLocation?: string } {
  const lower = text.toLowerCase();
  const painLoc = normalizeQuadrant(lower);
  if (/\babdominal|abd\b|stomach|belly\b/.test(lower) || painLoc) {
    return { cc: "abdominal pain", painLocation: painLoc };
  }
  if (/\b(chest pain|cp)\b/.test(lower)) return { cc: "chest pain" };
  if (/\b(asthma|bronchospasm|copd)\b/.test(lower)) return { cc: "asthma" };
  if (/\b(short(ness)? of breath|sob|dyspnea|wheez(?:e|ing))\b/.test(lower)) {
    return { cc: "shortness of breath" };
  }
  if (/\bstroke|cva|tia|facial droop\b/.test(lower)) return { cc: "stroke" };
  if (/\bseizure|postictal\b/.test(lower)) return { cc: "seizure" };
  if (/\bsyncope|faint(?:ed|ing)|passed out\b/.test(lower)) return { cc: "syncope" };
  if (/\boverdose|ingestion|poison\b/.test(lower)) return { cc: "overdose" };
  if (/\bcrush(?:\s+injury|\s+syndrome)?\b/.test(lower)) return { cc: "crush injury" };
  if (/\btrauma|injur(y|ies)|fall|mvc|accident\b/.test(lower)) return { cc: "traumatic injury" };
  return {};
}


