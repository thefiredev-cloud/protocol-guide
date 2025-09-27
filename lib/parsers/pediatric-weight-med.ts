type ExtractedDoseQuery = {
  weightKg: number;
  medicationKey: string; // canonical key for calculator
  routeHint?: string; // e.g., "IV", "IM", "IN"
};

const MED_SYNONYMS: Array<{ pattern: RegExp; key: string; routeHint?: string }> = [
  { pattern: /\batrop(?:ine)?\b/i, key: "atropine", routeHint: "IV/IO" },
  { pattern: /\bepi(?:neph(?:rine)?)?\b/i, key: "epinephrine_im", routeHint: "IM" },
  { pattern: /\bpush\s*dose\s*epi\b|\bepinephrine\s*(0\.01\s*mg\/mL)\b/i, key: "epinephrine_push", routeHint: "IV" },
  { pattern: /\bepinephrine\s*(0\.1\s*mg\/mL)\b|\bepi\s*0\.1\b/i, key: "epinephrine_iv", routeHint: "IV" },
  { pattern: /\bd10\b|\bdextrose\s*10\%?/i, key: "d10", routeHint: "IV" },
  { pattern: /\bcal(?:cium)?\s*chloride\b|\bca\s*cl\b/i, key: "calcium_chloride", routeHint: "IV/IO" },
  { pattern: /\bversed\b|\bmidazolam\b/i, key: "midazolam_ivio", routeHint: "IV/IO" },
  { pattern: /\bbicarb\b|\bsodium\s*bicarbonate\b|\bnahco3\b/i, key: "sodium_bicarbonate", routeHint: "IV" },
  { pattern: /\bns\b|\bnormal\s*saline\b/i, key: "ns_bolus", routeHint: "IV" },
  { pattern: /\badenosine\b/i, key: "adenosine", routeHint: "IV" },
  { pattern: /\bamiodarone\b|\bcordarone\b/i, key: "amiodarone", routeHint: "IV" },
  { pattern: /\bnaloxone\b|\bnarcan\b/i, key: "naloxone", routeHint: "IV/IM/IN" },
  { pattern: /\bmorphine\b/i, key: "morphine", routeHint: "IV/IM/IO" },
  { pattern: /\bdiphenhydramine\b|\bbenadryl\b/i, key: "diphenhydramine", routeHint: "IV/IM" },
  { pattern: /\bglucagon\b/i, key: "glucagon", routeHint: "IM" },
  { pattern: /\bhydroxocobalamin\b|\bcyanokit\b/i, key: "hydroxocobalamin", routeHint: "IV" },
  { pattern: /\blidocaine\b.*\bio\b|\bio\b.*\blidocaine\b/i, key: "lidocaine_io", routeHint: "IO" },
  { pattern: /\balbuterol\b|\bneb\b|\bmdi\b/i, key: "albuterol", routeHint: "Neb/MDI" },
];

export function extractPediatricWeightMedQueries(text: string): ExtractedDoseQuery[] {
  const queries: ExtractedDoseQuery[] = [];
  if (!text) return queries;
  const lower = text.toLowerCase();

  // Weight in kg (e.g., 5kg, 5 kg)
  const weightMatch = lower.match(/(\d+(?:\.\d+)?)\s*kg\b/);
  if (!weightMatch) return queries;
  const weightKg = Number.parseFloat(weightMatch[1]);
  if (!Number.isFinite(weightKg) || weightKg <= 0) return queries;

  for (const syn of MED_SYNONYMS) {
    if (syn.pattern.test(text)) {
      queries.push({ weightKg, medicationKey: syn.key, routeHint: syn.routeHint });
    }
  }

  return queries;
}


