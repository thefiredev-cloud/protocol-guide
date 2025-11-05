/**
 * Medication Formulary Validator
 *
 * Ensures all medication recommendations:
 * 1. Use only LA County authorized medications
 * 2. Use generic names (not brand names)
 * 3. Are not hallucinated from general medical knowledge
 */

// LA County EMS Authorized Medication Formulary (MCG 1309 and Treatment Protocols)
const AUTHORIZED_MEDICATIONS = new Set([
  // Cardiac
  "epinephrine",
  "norepinephrine",
  "nitroglycerin",
  "aspirin",
  "atropine",
  "adenosine",
  "amiodarone",
  "lidocaine",
  "dopamine",

  // Respiratory
  "albuterol",

  // Neurological
  "midazolam",

  // Pain Management
  "fentanyl",
  "morphine",
  "ketorolac",
  "acetaminophen",

  // Antiemetics
  "ondansetron",

  // Allergic Reactions
  "diphenhydramine",

  // Antidotes/Reversal
  "naloxone",
  "glucagon",
  "calcium chloride",
  "calcium gluconate",

  // Metabolic
  "dextrose",
  "sodium bicarbonate",
  "magnesium sulfate",

  // OB
  "oxytocin",

  // Other
  "activated charcoal",
  "tranexamic acid",
]);

// Common brand name to generic mappings
const BRAND_TO_GENERIC: Record<string, string> = {
  // Pain Management
  "narcan": "naloxone",
  "versed": "midazolam",
  "toradol": "ketorolac",
  "tylenol": "acetaminophen",

  // Antiemetics
  "zofran": "ondansetron",

  // Allergy
  "benadryl": "diphenhydramine",

  // Respiratory
  "proventil": "albuterol",
  "ventolin": "albuterol",

  // Cardiac
  "epipen": "epinephrine",
  "adrenalin": "epinephrine",

  // NOT authorized in LA County
  "ativan": "lorazepam",
  "valium": "diazepam",
  "xanax": "alprazolam",
  "klonopin": "clonazepam",
};

// Medications explicitly NOT authorized in LA County
const UNAUTHORIZED_MEDICATIONS = new Set([
  "lorazepam",
  "diazepam",
  "alprazolam",
  "clonazepam",
  "haloperidol",
  "haldol",
  "ketamine", // Not in current protocols
  "etomidate", // Not in current protocols
  "succinylcholine", // Not in current protocols
  "rocuronium", // Not in current protocols
  "vecuronium", // Not in current protocols
  "propofol", // Not in current protocols
]);

export interface MedicationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all medication mentions in text
 */
export function validateMedications(text: string): MedicationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract potential medication names (common patterns)
  const medicationPattern = /\b([A-Z][a-z]{3,}(?:ine|ol|lam|ide|cin|pine|xone|amine|cillin|mycin|azole))\b/g;
  const matches = Array.from(text.matchAll(medicationPattern));

  const mentionedMeds = new Set(matches.map(m => m[1].toLowerCase()));
  const mentionedMedsArray = Array.from(mentionedMeds);

  for (const med of mentionedMedsArray) {
    // Check if it's a brand name
    if (BRAND_TO_GENERIC[med]) {
      const generic = BRAND_TO_GENERIC[med];

      // Check if the generic is authorized
      if (UNAUTHORIZED_MEDICATIONS.has(generic)) {
        errors.push(
          `UNAUTHORIZED MEDICATION: "${med}" (${generic}) is NOT in LA County formulary - do not recommend`
        );
      } else if (AUTHORIZED_MEDICATIONS.has(generic)) {
        warnings.push(
          `Use generic name: "${med}" should be "${generic}" per LA County protocols`
        );
      }
      continue;
    }

    // Check if explicitly unauthorized
    if (UNAUTHORIZED_MEDICATIONS.has(med)) {
      errors.push(
        `UNAUTHORIZED MEDICATION: "${med}" is NOT authorized in LA County EMS - do not recommend. Use midazolam for sedation.`
      );
      continue;
    }

    // Check if not in authorized list
    if (!AUTHORIZED_MEDICATIONS.has(med)) {
      // Could be a false positive (not actually a medication)
      // Only flag if it looks like a real medication
      if (med.length > 6 && (
        med.endsWith('ine') ||
        med.endsWith('lam') ||
        med.endsWith('ide') ||
        med.endsWith('xone')
      )) {
        warnings.push(
          `UNRECOGNIZED MEDICATION: "${med}" - verify this is in LA County formulary. If not in the knowledge base, do not recommend.`
        );
      }
    }
  }

  // Check for specific brand names that are commonly confused
  const commonBrandMistakes = [
    { brand: /\bativan\b/i, generic: "lorazepam", replacement: "midazolam" },
    { brand: /\bvalium\b/i, generic: "diazepam", replacement: "midazolam" },
    { brand: /\bversed\b/i, generic: "midazolam", replacement: "midazolam" },
    { brand: /\bnarcan\b/i, generic: "naloxone", replacement: "naloxone" },
  ];

  for (const mistake of commonBrandMistakes) {
    if (mistake.brand.test(text)) {
      const brandMatch = text.match(mistake.brand);
      if (brandMatch && UNAUTHORIZED_MEDICATIONS.has(mistake.generic)) {
        errors.push(
          `UNAUTHORIZED: ${brandMatch[0]} (${mistake.generic}) is not authorized - use ${mistake.replacement} instead`
        );
      } else if (brandMatch) {
        warnings.push(
          `Use generic name: ${brandMatch[0]} → ${mistake.replacement}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a medication is authorized in LA County
 */
export function isAuthorizedMedication(medication: string): boolean {
  const med = medication.toLowerCase();

  // Check if it's a brand name first
  if (BRAND_TO_GENERIC[med]) {
    const generic = BRAND_TO_GENERIC[med];
    return AUTHORIZED_MEDICATIONS.has(generic) && !UNAUTHORIZED_MEDICATIONS.has(generic);
  }

  // Check directly
  return AUTHORIZED_MEDICATIONS.has(med) && !UNAUTHORIZED_MEDICATIONS.has(med);
}

/**
 * Convert brand name to generic if applicable
 */
export function normalizeToGeneric(medication: string): string {
  const med = medication.toLowerCase();
  return BRAND_TO_GENERIC[med] || med;
}

/**
 * Get list of all authorized medications
 */
export function getAuthorizedMedications(): string[] {
  return Array.from(AUTHORIZED_MEDICATIONS).sort();
}
