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
  
  // Respiratory/Airway - check specific conditions before general SOB
  if (/\b(inhal(?:e|ed|ation)|gas|fumes|stridor|hoarse(?:ness)?)\b/.test(lower)) {
    return { cc: "inhalation injury" };
  }
  if (/\bairway\s+obstruction|choking|foreign\s+body\b/.test(lower)) {
    return { cc: "airway obstruction" };
  }
  if (/\b(asthma|bronchospasm|copd)\b/.test(lower)) return { cc: "asthma" };
  if (/\b(short(ness)? of breath|sob|dyspnea|wheez(?:e|ing))\b/.test(lower)) {
    return { cc: "shortness of breath" };
  }
  
  // Trauma - check BEFORE medical chest pain to prevent misclassification
  if (/\bimpalement|impaled|penetrating\s+trauma|penetrating\s+injury\b/.test(lower)) {
    return { cc: "traumatic injury" };
  }
  
  // Cardiovascular
  if (/\b(chest pain|cp)\b/.test(lower)) return { cc: "chest pain" };
  if (/\bcardiac\s+arrest|cpr|pulseless\b/.test(lower)) return { cc: "cardiac arrest" };
  
  // Neurological
  if (/\bstroke|cva|tia|facial droop\b/.test(lower)) return { cc: "stroke" };
  if (/\bseizure|postictal\b/.test(lower)) return { cc: "seizure" };
  if (/\bsyncope|faint(?:ed|ing)|passed out\b/.test(lower)) return { cc: "syncope" };
  
  // Toxicology
  if (/\b(poison(?:ed|ing)?|toxic|exposure|contamination)\b/.test(lower)) {
    return { cc: "poisoning" };
  }
  if (/\boverdose|ingestion\b/.test(lower)) return { cc: "overdose" };
  
  // Environmental
  if (/\b(drown(?:ing|ed)?|submersion|water\s+rescue)\b/.test(lower)) {
    return { cc: "drowning" };
  }
  if (/\b(hypotherm(?:ia|ic)?|cold\s+exposure|frostbite|frozen)\b/.test(lower)) {
    return { cc: "hypothermia" };
  }
  if (/\b(hypertherm(?:ia|ic)?|heat\s+stroke|heat\s+exhaustion)\b/.test(lower)) {
    return { cc: "hyperthermia" };
  }
  
  // Trauma
  if (/\bcrush(?:\s+injury|\s+syndrome)?\b/.test(lower)) return { cc: "crush injury" };
  if (/\bburn(?:s|ed)?\b/.test(lower)) return { cc: "burns" };
  if (/\btrauma|injur(y|ies)|fall|mvc|accident\b/.test(lower)) return { cc: "traumatic injury" };
  
  // Abdominal - check last to avoid overmatching
  if (/\babdominal|abd\b|stomach|belly\b/.test(lower) || painLoc) {
    return { cc: "abdominal pain", painLocation: painLoc };
  }
  
  return {};
}


