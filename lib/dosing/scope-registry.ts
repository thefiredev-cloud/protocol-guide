/**
 * LA County EMS Scope of Practice Registry
 * Based on Policy 802 (EMT) and Policy 803 (Paramedic)
 *
 * EMT-authorized medications per Policy 802:
 * - Aspirin 324mg (chest pain protocol)
 * - Epinephrine auto-injector (anaphylaxis)
 * - Naloxone (opioid overdose, IN/IM routes)
 * - Albuterol (with MICN authorization)
 *
 * All other medications require Paramedic scope (Policy 803)
 */

import type { ProviderLevel } from "@/lib/dosing/types";

export type ScopeEntry = {
  medicationId: string;
  authorizedProviders: ProviderLevel[];
  emtRestrictions?: string;
  policyReference: string;
};

/**
 * Medication scope registry per LA County Policy 802/803
 */
export const MEDICATION_SCOPE_REGISTRY: Record<string, ScopeEntry> = {
  // EMT-authorized medications (Policy 802)
  aspirin: {
    medicationId: "aspirin",
    authorizedProviders: ["EMT", "Paramedic"],
    policyReference: "Ref 802",
  },
  naloxone: {
    medicationId: "naloxone",
    authorizedProviders: ["EMT", "Paramedic"],
    emtRestrictions: "IN/IM routes only; no IV for EMT",
    policyReference: "Ref 802",
  },
  epinephrine: {
    medicationId: "epinephrine",
    authorizedProviders: ["EMT", "Paramedic"],
    emtRestrictions: "Auto-injector only (anaphylaxis); IV/IO/push-dose requires Paramedic",
    policyReference: "Ref 802",
  },
  albuterol: {
    medicationId: "albuterol",
    authorizedProviders: ["EMT", "Paramedic"],
    emtRestrictions: "Requires MICN authorization",
    policyReference: "Ref 802",
  },

  // Paramedic-only medications (Policy 803)
  acetaminophen: {
    medicationId: "acetaminophen",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  adenosine: {
    medicationId: "adenosine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  amiodarone: {
    medicationId: "amiodarone",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  atropine: {
    medicationId: "atropine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  "calcium-chloride": {
    medicationId: "calcium-chloride",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  dextrose: {
    medicationId: "dextrose",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  diphenhydramine: {
    medicationId: "diphenhydramine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  fentanyl: {
    medicationId: "fentanyl",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  glucagon: {
    medicationId: "glucagon",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  ketamine: {
    medicationId: "ketamine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  ketorolac: {
    medicationId: "ketorolac",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  "magnesium-sulfate": {
    medicationId: "magnesium-sulfate",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  midazolam: {
    medicationId: "midazolam",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  morphine: {
    medicationId: "morphine",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  nitroglycerin: {
    medicationId: "nitroglycerin",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  ondansetron: {
    medicationId: "ondansetron",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  pralidoxime: {
    medicationId: "pralidoxime",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  "push-dose-epi": {
    medicationId: "push-dose-epi",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
  },
  "sodium-bicarbonate": {
    medicationId: "sodium-bicarbonate",
    authorizedProviders: ["Paramedic"],
    policyReference: "Ref 803",
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
