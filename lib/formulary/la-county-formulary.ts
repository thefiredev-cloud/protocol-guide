/**
 * LA County EMS Authorized Medication Formulary
 * Single source of truth for all medication scope checks
 *
 * References:
 * - MCG 1309: Pediatric Dosing
 * - MCG 1317.x: Drug Reference List (23 approved medications)
 * - Policy 802: EMT Scope
 * - Policy 803.1: Paramedic Scope
 *
 * IMPORTANT: This file is the ONLY source of truth for medication authorization.
 * All other files should import from here, not maintain separate lists.
 */

/**
 * LA County EMS Authorized Medications
 * These medications are approved for prehospital use by LA County paramedics
 * Per MCG 1317 Drug Reference List
 */
export const LA_COUNTY_AUTHORIZED_MEDICATIONS = new Set([
  // Cardiac - MCG 1317.x references
  "epinephrine", // MCG 1317.17
  "nitroglycerin", // MCG 1317.31
  "aspirin", // MCG 1317.7
  "atropine", // MCG 1317.9
  "adenosine", // MCG 1317.1
  "amiodarone", // MCG 1317.5
  "lidocaine", // MCG 1317.23

  // Respiratory
  "albuterol", // MCG 1317.3

  // Sedation (LA County approved)
  "midazolam", // MCG 1317.25 - LA County authorized sedation

  // Pain Management - MCG 1317.x
  "fentanyl", // MCG 1317.19 - AUTHORIZED for LA County
  "morphine", // MCG 1317.27 - AUTHORIZED
  "ketorolac", // MCG 1317.22 - AUTHORIZED
  "acetaminophen", // MCG 1317.2

  // Antiemetics
  "ondansetron", // MCG 1317.33

  // Allergic Reactions
  "diphenhydramine", // MCG 1317.15

  // Antidotes/Reversal
  "naloxone", // MCG 1317.29
  "glucagon", // MCG 1317.21
  "calcium chloride", // MCG 1317.11
  "calcium gluconate", // Alternative calcium formulation

  // Metabolic
  "dextrose", // MCG 1317.13
  "sodium bicarbonate", // MCG 1317.39
  "magnesium sulfate", // MCG 1317.24

  // OB
  "oxytocin", // MCG 1317.35

  // Behavioral - LA County approved
  "olanzapine", // MCG 1317.32 - Approved for behavioral emergencies

  // Other
  "activated charcoal", // MCG 1317.0
  "tranexamic acid", // MCG 1317.41
  "pralidoxime", // MCG 1317.37 - Nerve agent antidote
]);

/**
 * Medications explicitly NOT authorized in LA County EMS
 * These should NEVER appear in LLM outputs or dosing calculations
 * If queried, suggest LA County authorized alternatives
 */
export const LA_COUNTY_UNAUTHORIZED_MEDICATIONS = new Set([
  // Benzodiazepines (except midazolam which IS authorized)
  "lorazepam", // Use midazolam instead
  "diazepam", // Use midazolam instead
  "alprazolam", // Use midazolam instead
  "clonazepam", // Use midazolam instead

  // Antipsychotics (except olanzapine which IS authorized)
  "haloperidol", // Use olanzapine or midazolam instead
  "haldol", // Brand name for haloperidol

  // Sedation/Anesthetics NOT in LA County protocols
  "ketamine", // NOT AUTHORIZED - use midazolam for sedation
  "etomidate", // NOT in LA County protocols
  "propofol", // NOT in LA County protocols

  // Paralytics (RSI not authorized in LA County EMS)
  "succinylcholine", // NOT authorized
  "rocuronium", // NOT authorized
  "vecuronium", // NOT authorized
  "cisatracurium", // NOT authorized
]);

/**
 * Brand name to generic mapping
 * Used to normalize medication names for lookup
 */
export const BRAND_TO_GENERIC: Record<string, string> = {
  // Authorized medications - brand to generic
  narcan: "naloxone",
  versed: "midazolam",
  toradol: "ketorolac",
  tylenol: "acetaminophen",
  zofran: "ondansetron",
  benadryl: "diphenhydramine",
  proventil: "albuterol",
  ventolin: "albuterol",
  epipen: "epinephrine",
  adrenalin: "epinephrine",
  sublimaze: "fentanyl",
  duramorph: "morphine",
  nitrostat: "nitroglycerin",
  zyprexa: "olanzapine",

  // Unauthorized medications - for detection
  ativan: "lorazepam",
  valium: "diazepam",
  xanax: "alprazolam",
  klonopin: "clonazepam",
  ketalar: "ketamine",
};

/**
 * LA County authorized replacement suggestions
 * When an unauthorized medication is queried, suggest these alternatives
 */
export const UNAUTHORIZED_REPLACEMENTS: Record<string, string> = {
  ketamine: "midazolam for sedation (MCG 1317.25)",
  lorazepam: "midazolam (MCG 1317.25)",
  diazepam: "midazolam (MCG 1317.25)",
  alprazolam: "midazolam (MCG 1317.25)",
  clonazepam: "midazolam (MCG 1317.25)",
  haloperidol: "olanzapine (MCG 1317.32) or midazolam (MCG 1317.25)",
  haldol: "olanzapine (MCG 1317.32) or midazolam (MCG 1317.25)",
  etomidate: "midazolam for sedation (MCG 1317.25)",
  propofol: "midazolam for sedation (MCG 1317.25)",
};

/**
 * Normalize medication name to generic form
 * @param medication - Brand or generic name
 * @returns Generic name (lowercase, trimmed)
 */
export function toGenericName(medication: string): string {
  const normalized = medication.toLowerCase().trim();
  return BRAND_TO_GENERIC[normalized] || normalized;
}

/**
 * Check if medication is authorized in LA County EMS
 * @param medication - Medication name (brand or generic)
 * @returns true if authorized, false otherwise
 */
export function isLACountyAuthorized(medication: string): boolean {
  const generic = toGenericName(medication);

  // If explicitly unauthorized, return false
  if (LA_COUNTY_UNAUTHORIZED_MEDICATIONS.has(generic)) {
    return false;
  }

  // Check authorized list
  return LA_COUNTY_AUTHORIZED_MEDICATIONS.has(generic);
}

/**
 * Check if medication is explicitly unauthorized in LA County
 * @param medication - Medication name (brand or generic)
 * @returns true if explicitly unauthorized, false otherwise
 */
export function isLACountyUnauthorized(medication: string): boolean {
  const generic = toGenericName(medication);
  return LA_COUNTY_UNAUTHORIZED_MEDICATIONS.has(generic);
}

/**
 * Get LA County authorized replacement for an unauthorized medication
 * @param medication - Unauthorized medication name
 * @returns Replacement suggestion or null if no replacement defined
 */
export function getUnauthorizedReplacement(medication: string): string | null {
  const generic = toGenericName(medication);
  return UNAUTHORIZED_REPLACEMENTS[generic] || null;
}

/**
 * Validate medication for LA County scope and return detailed result
 * @param medication - Medication name to validate
 * @returns Validation result with authorization status and details
 */
export function validateMedicationScope(medication: string): {
  authorized: boolean;
  generic: string;
  unauthorized: boolean;
  replacement: string | null;
  message: string;
} {
  const generic = toGenericName(medication);
  const unauthorized = LA_COUNTY_UNAUTHORIZED_MEDICATIONS.has(generic);
  const authorized = LA_COUNTY_AUTHORIZED_MEDICATIONS.has(generic);
  const replacement = getUnauthorizedReplacement(medication);

  let message: string;
  if (unauthorized) {
    message = `${medication} is NOT authorized in LA County EMS protocols.${
      replacement ? ` Use ${replacement} instead.` : ""
    }`;
  } else if (authorized) {
    message = `${medication} is authorized in LA County EMS protocols.`;
  } else {
    message = `${medication} is not in the LA County formulary. Verify authorization before use.`;
  }

  return {
    authorized: authorized && !unauthorized,
    generic,
    unauthorized,
    replacement,
    message,
  };
}

/**
 * Get all authorized medication names (for autocomplete, etc.)
 * @returns Array of authorized medication names
 */
export function getAllAuthorizedMedications(): string[] {
  return Array.from(LA_COUNTY_AUTHORIZED_MEDICATIONS);
}

/**
 * Get all unauthorized medication names (for filtering)
 * @returns Array of unauthorized medication names
 */
export function getAllUnauthorizedMedications(): string[] {
  return Array.from(LA_COUNTY_UNAUTHORIZED_MEDICATIONS);
}
