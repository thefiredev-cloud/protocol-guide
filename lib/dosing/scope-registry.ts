/**
 * LA County EMS Scope of Practice Registry
 * Based on Reference No. 802 (EMT Scope) and Reference No. 803.1 (Paramedic Scope)
 * Source: LA County DHS Prehospital Care Manual / MCG 1317 Drug Reference
 *
 * EMT Scope (Ref 802 Section III - Local Additional Scope with EMS Agency approval):
 * - Naloxone (IN/IM routes only, including Leave Behind per MCG 1337)
 * - Epinephrine autoinjector
 * - Aspirin
 * - Oral glucose (finger stick blood glucose testing)
 *
 * EMT Can ASSIST with patient's own prescribed medications (Ref 802 Section I.E):
 * - Sublingual nitroglycerin (patient's own)
 * - Aspirin (patient's own)
 * - Bronchodilator inhaler/nebulizer (patient's own)
 * - Epinephrine autoinjector (patient's own)
 *
 * All other medications require Paramedic scope (Ref 803.1)
 * Per MCG 1317 Drug Reference List (23 approved medications)
 */

import type { ProviderLevel } from "../../lib/dosing/types";

export type ScopeEntry = {
  medicationId: string;
  authorizedProviders: ProviderLevel[];
  emtRestrictions?: string;
  policyReference: string;
};

/**
 * Medication scope registry per LA County Ref 802 and Ref 803.1
 * Updated to match MCG 1317 Drug Reference and actual LA County protocols
 */
export const MEDICATION_SCOPE_REGISTRY: Record<string, ScopeEntry> = {
  // EMT-authorized medications (Ref 802 Section III - requires EMS Agency approval)
  aspirin: {
    medicationId: "aspirin",
    authorizedProviders: ["EMT", "Paramedic"],
    emtRestrictions: "Requires EMS Agency approval and training",
    policyReference: "Ref No. 802",
  },
  naloxone: {
    medicationId: "naloxone",
    authorizedProviders: ["EMT", "Paramedic"],
    emtRestrictions: "IN/IM routes only; includes Leave Behind per MCG 1337",
    policyReference: "Ref No. 802",
  },
  epinephrine: {
    medicationId: "epinephrine",
    authorizedProviders: ["EMT", "Paramedic"],
    emtRestrictions: "Auto-injector only; IV/IO/IM requires Paramedic",
    policyReference: "Ref No. 802",
  },
  glucose: {
    medicationId: "glucose",
    authorizedProviders: ["EMT", "Paramedic"],
    emtRestrictions: "Oral glucose only; IV dextrose requires Paramedic",
    policyReference: "Ref No. 802",
  },

  // Paramedic-only medications (Ref 803.1 / MCG 1317 Drug Reference)
  adenosine: {
    medicationId: "adenosine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.1",
  },
  albuterol: {
    medicationId: "albuterol",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.3",
  },
  amiodarone: {
    medicationId: "amiodarone",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.5",
  },
  atropine: {
    medicationId: "atropine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.9",
  },
  "calcium-chloride": {
    medicationId: "calcium-chloride",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.11",
  },
  dextrose: {
    medicationId: "dextrose",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.13",
  },
  diphenhydramine: {
    medicationId: "diphenhydramine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.15",
  },
  fentanyl: {
    medicationId: "fentanyl",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.19",
  },
  glucagon: {
    medicationId: "glucagon",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.21",
  },
  ketorolac: {
    medicationId: "ketorolac",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.22",
  },
  lidocaine: {
    medicationId: "lidocaine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.23",
  },
  midazolam: {
    medicationId: "midazolam",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.25",
  },
  morphine: {
    medicationId: "morphine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.27",
  },
  nitroglycerin: {
    medicationId: "nitroglycerin",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.31",
  },
  olanzapine: {
    medicationId: "olanzapine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.32",
  },
  ondansetron: {
    medicationId: "ondansetron",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.33",
  },
  pralidoxime: {
    medicationId: "pralidoxime",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.37",
  },
  "sodium-bicarbonate": {
    medicationId: "sodium-bicarbonate",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.39",
  },
  "tranexamic-acid": {
    medicationId: "tranexamic-acid",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref No. 803.1, MCG 1317.41",
  },
};

/**
 * Get scope entry for a medication
 */
export function getScopeEntry(medicationId: string): ScopeEntry | undefined {
  return MEDICATION_SCOPE_REGISTRY[medicationId.toLowerCase()];
}

/**
 * Check if a medication is authorized for a provider level
 * Returns authorization status and any applicable warnings
 */
export function isAuthorizedForProvider(
  medicationId: string,
  providerLevel: ProviderLevel
): { authorized: boolean; warning?: string; policyRef?: string } {
  const entry = getScopeEntry(medicationId);

  // Unknown medication - allow with no warning (conservative)
  if (!entry) {
    return { authorized: true };
  }

  const authorized = entry.authorizedProviders.includes(providerLevel);

  if (!authorized) {
    return {
      authorized: false,
      warning: `${entry.medicationId} requires Paramedic scope (${entry.policyReference})`,
      policyRef: entry.policyReference,
    };
  }

  // EMT authorized but with restrictions
  if (providerLevel === "EMT" && entry.emtRestrictions) {
    return {
      authorized: true,
      warning: `EMT scope: ${entry.emtRestrictions} (${entry.policyReference})`,
      policyRef: entry.policyReference,
    };
  }

  return { authorized: true };
}

/**
 * Get all EMT-authorized medications
 */
export function getEMTAuthorizedMedications(): string[] {
  return Object.entries(MEDICATION_SCOPE_REGISTRY)
    .filter(([, entry]) => entry.authorizedProviders.includes("EMT"))
    .map(([id]) => id);
}

/**
 * Get all Paramedic-only medications
 */
export function getParamedicOnlyMedications(): string[] {
  return Object.entries(MEDICATION_SCOPE_REGISTRY)
    .filter(([, entry]) => !entry.authorizedProviders.includes("EMT"))
    .map(([id]) => id);
}
