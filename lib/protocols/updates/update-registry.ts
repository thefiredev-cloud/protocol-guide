/**
 * Protocol Update Registry
 *
 * Registry of 2024-2025 protocol changes for the LA County PCM.
 * This serves as the source of truth for protocol version tracking.
 *
 * Reference: LA County EMS Agency 2024-2025 PCM Updates
 */

import type {
  ProtocolChange,
  MCGChange,
  ProtocolUpdateSummary,
  ProtocolBatchUpdate,
  ClinicalImpact,
} from "./types";

/**
 * 2024-2025 Treatment Protocol Changes (1200 series).
 */
export const PROTOCOL_CHANGES_2024_2025: ProtocolChange[] = [
  // TP 1210 - Cardiac Arrest
  {
    tpCode: "1210",
    fromVersion: 1,
    toVersion: 2,
    changeType: "modification",
    section: "ECPR Criteria",
    description:
      "Updated ECPR transport criteria - added requirement for mechanical CPR device and shortened transport time window",
    clinicalImpact: "high",
    requiresTraining: true,
    citations: ["MCG 1318", "Ref 516"],
  },
  {
    tpCode: "1210",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    section: "Epinephrine Timing",
    description:
      "Clarified epinephrine administration timing - initial dose immediately after rhythm check for non-shockable rhythms",
    clinicalImpact: "medium",
    requiresTraining: true,
    citations: ["MCG 1306"],
  },

  // TP 1211 - Chest Pain/ACS
  {
    tpCode: "1211",
    fromVersion: 1,
    toVersion: 2,
    changeType: "modification",
    section: "STEMI Alert Criteria",
    description:
      "Expanded STEMI alert criteria to include posterior MI patterns",
    clinicalImpact: "high",
    requiresTraining: true,
    citations: ["Ref 513"],
  },
  {
    tpCode: "1211",
    fromVersion: 1,
    toVersion: 2,
    changeType: "clarification",
    section: "Aspirin Administration",
    description:
      "Clarified aspirin not to be given if patient has taken within 24 hours",
    clinicalImpact: "low",
    requiresTraining: false,
  },

  // TP 1214 - Bradycardia
  {
    tpCode: "1214",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    section: "Atropine Dosing",
    description:
      "Updated atropine maximum cumulative dose from 3mg to 3mg for adults, clarified no maximum for pediatrics with weight-based dosing",
    clinicalImpact: "medium",
    requiresTraining: true,
    citations: ["MCG 1303"],
  },

  // TP 1220 - Burns
  {
    tpCode: "1220",
    fromVersion: 1,
    toVersion: 2,
    changeType: "procedure_change",
    section: "Fluid Resuscitation",
    description:
      "Updated Parkland formula guidance - added specific guidance for pediatric burns and geriatric considerations",
    clinicalImpact: "high",
    requiresTraining: true,
    citations: ["Ref 512"],
  },

  // TP 1232 - Stroke/CVA/TIA
  {
    tpCode: "1232",
    fromVersion: 1,
    toVersion: 2,
    changeType: "modification",
    section: "Stroke Scale",
    description:
      "Updated from CPSS to mLAPSS (modified Los Angeles Prehospital Stroke Screen) for LVO detection",
    clinicalImpact: "high",
    requiresTraining: true,
    citations: ["Ref 521"],
  },
  {
    tpCode: "1232",
    fromVersion: 1,
    toVersion: 2,
    changeType: "modification",
    section: "Transport Destination",
    description:
      "Added LAMS score ≥4 as indicator for direct transport to CSC",
    clinicalImpact: "high",
    requiresTraining: true,
    citations: ["Ref 521"],
  },

  // TP 1233 - Toxic Ingestion/Exposure
  {
    tpCode: "1233",
    fromVersion: 1,
    toVersion: 2,
    changeType: "addition",
    section: "Fentanyl Exposure",
    description:
      "Added specific guidance for suspected fentanyl/opioid exposure including multi-dose naloxone protocol",
    clinicalImpact: "high",
    requiresTraining: true,
    citations: ["MCG 1321"],
  },

  // TP 1240 - Pediatric Assessment
  {
    tpCode: "1240",
    fromVersion: 1,
    toVersion: 2,
    changeType: "modification",
    section: "Weight Estimation",
    description:
      "Updated weight estimation - Broselow tape remains primary, added PAWPER tape as backup",
    clinicalImpact: "medium",
    requiresTraining: true,
  },

  // TP 1209 - Behavioral Emergency
  {
    tpCode: "1209",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    section: "Chemical Restraint",
    description:
      "Updated ketamine dosing for excited delirium - IM dose changed to 4mg/kg (max 400mg)",
    clinicalImpact: "high",
    requiresTraining: true,
    citations: ["MCG 1314"],
  },
  {
    tpCode: "1209",
    fromVersion: 1,
    toVersion: 2,
    changeType: "addition",
    section: "TAD Destinations",
    description: "Added PUCC (Psychiatric Urgent Care Center) as destination option for TAD units",
    clinicalImpact: "medium",
    requiresTraining: true,
    citations: ["Ref 526"],
  },

  // TP 1201 - Universal Patient Care
  {
    tpCode: "1201",
    fromVersion: 1,
    toVersion: 2,
    changeType: "clarification",
    section: "Spinal Motion Restriction",
    description:
      "Updated terminology from spinal immobilization to spinal motion restriction throughout",
    clinicalImpact: "low",
    requiresTraining: false,
  },

  // TP 1250 - Pain Management
  {
    tpCode: "1250",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    section: "Fentanyl Dosing",
    description:
      "Increased initial fentanyl dose to 1mcg/kg (max 100mcg) with repeat dosing clarification",
    clinicalImpact: "medium",
    requiresTraining: true,
    citations: ["MCG 1307"],
  },
];

/**
 * 2024-2025 MCG (Medication) Changes (1300 series).
 */
export const MCG_CHANGES_2024_2025: MCGChange[] = [
  // MCG 1306 - Epinephrine
  {
    mcgNumber: "1306",
    medicationName: "Epinephrine",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    field: "adult_dose",
    description:
      "Push-dose epinephrine concentration standardized to 10mcg/mL",
    clinicalImpact: "high",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },

  // MCG 1314 - Ketamine
  {
    mcgNumber: "1314",
    medicationName: "Ketamine",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    field: "adult_dose",
    description:
      "Excited delirium IM dose updated to 4mg/kg (max 400mg), IV dose 2mg/kg (max 200mg)",
    clinicalImpact: "high",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    mcgNumber: "1314",
    medicationName: "Ketamine",
    fromVersion: 1,
    toVersion: 2,
    changeType: "contraindication_change",
    field: "contraindication",
    description:
      "Removed age <16 as absolute contraindication for sedation indication",
    clinicalImpact: "medium",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },

  // MCG 1321 - Naloxone
  {
    mcgNumber: "1321",
    medicationName: "Naloxone",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    field: "adult_dose",
    description:
      "Added high-dose naloxone protocol for suspected fentanyl - up to 10mg total if needed",
    clinicalImpact: "high",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },

  // MCG 1307 - Fentanyl
  {
    mcgNumber: "1307",
    medicationName: "Fentanyl",
    fromVersion: 1,
    toVersion: 2,
    changeType: "dosing_change",
    field: "adult_dose",
    description:
      "Initial dose increased to 1mcg/kg (max 100mcg), repeat doses 0.5mcg/kg q5min",
    clinicalImpact: "medium",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },

  // MCG 1303 - Atropine
  {
    mcgNumber: "1303",
    medicationName: "Atropine",
    fromVersion: 1,
    toVersion: 2,
    changeType: "clarification",
    field: "peds_dose",
    description:
      "Clarified minimum single dose 0.1mg for pediatrics to prevent paradoxical bradycardia",
    clinicalImpact: "medium",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },

  // MCG 1304 - Calcium Chloride
  {
    mcgNumber: "1304",
    medicationName: "Calcium Chloride",
    fromVersion: 1,
    toVersion: 2,
    changeType: "indication_change",
    field: "indication",
    description:
      "Added hyperkalemia as indication with specific dosing guidance",
    clinicalImpact: "medium",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },

  // MCG 1318 - ECPR Medications
  {
    mcgNumber: "1318",
    medicationName: "ECPR Protocol Medications",
    fromVersion: 1,
    toVersion: 2,
    changeType: "modification",
    field: "other",
    description:
      "Updated ECPR medication administration - continue full resuscitation medications during transport",
    clinicalImpact: "high",
    requiresTraining: true,
    effectiveDate: new Date("2024-07-01"),
  },
];

/**
 * Get all high-impact changes.
 */
export function getHighImpactChanges(): (ProtocolChange | MCGChange)[] {
  const protocolHighImpact = PROTOCOL_CHANGES_2024_2025.filter(
    (c) => c.clinicalImpact === "high"
  );
  const mcgHighImpact = MCG_CHANGES_2024_2025.filter(
    (c) => c.clinicalImpact === "high"
  );
  return [...protocolHighImpact, ...mcgHighImpact];
}

/**
 * Get changes requiring training.
 */
export function getChangesRequiringTraining(): (ProtocolChange | MCGChange)[] {
  const protocolTraining = PROTOCOL_CHANGES_2024_2025.filter(
    (c) => c.requiresTraining
  );
  const mcgTraining = MCG_CHANGES_2024_2025.filter((c) => c.requiresTraining);
  return [...protocolTraining, ...mcgTraining];
}

/**
 * Get changes by protocol code.
 */
export function getChangesByProtocol(tpCode: string): ProtocolChange[] {
  return PROTOCOL_CHANGES_2024_2025.filter((c) => c.tpCode === tpCode);
}

/**
 * Get changes by MCG number.
 */
export function getChangesByMCG(mcgNumber: string): MCGChange[] {
  return MCG_CHANGES_2024_2025.filter((c) => c.mcgNumber === mcgNumber);
}

/**
 * Build the 2024-2025 batch update summary.
 */
export function get2024_2025BatchUpdate(): ProtocolBatchUpdate {
  // Group protocol changes by TP code
  const protocolMap = new Map<string, ProtocolChange[]>();
  PROTOCOL_CHANGES_2024_2025.forEach((change) => {
    const existing = protocolMap.get(change.tpCode) ?? [];
    existing.push(change);
    protocolMap.set(change.tpCode, existing);
  });

  const protocolUpdates: ProtocolUpdateSummary[] = Array.from(
    protocolMap.entries()
  ).map(([tpCode, changes]) => ({
    tpCode,
    tpName: getProtocolName(tpCode),
    fromVersion: 1,
    toVersion: 2,
    effectiveDate: new Date("2024-07-01"),
    totalChanges: changes.length,
    highImpactChanges: changes.filter((c) => c.clinicalImpact === "high").length,
    changesRequiringTraining: changes.filter((c) => c.requiresTraining).length,
    changes,
  }));

  return {
    id: "PCM-2024-2025",
    name: "LA County PCM 2024-2025 Annual Update",
    description:
      "Annual revision of LA County Prehospital Care Manual including treatment protocols (1200 series) and medication cross-reference guides (1300 series)",
    effectiveDate: new Date("2024-07-01"),
    announcedDate: new Date("2024-05-15"),
    protocolUpdates,
    mcgUpdates: MCG_CHANGES_2024_2025,
    totalProtocolsAffected: protocolMap.size,
    totalMedicationsAffected: new Set(MCG_CHANGES_2024_2025.map((c) => c.mcgNumber))
      .size,
  };
}

/**
 * Helper to get protocol name from code.
 */
function getProtocolName(tpCode: string): string {
  const names: Record<string, string> = {
    "1201": "Universal Patient Care",
    "1209": "Behavioral Emergency",
    "1210": "Cardiac Arrest",
    "1211": "Chest Pain/Acute Coronary Syndrome",
    "1214": "Bradycardia",
    "1220": "Burns",
    "1232": "Stroke/CVA/TIA",
    "1233": "Toxic Ingestion/Exposure",
    "1240": "Pediatric Assessment",
    "1250": "Pain Management",
  };
  return names[tpCode] ?? `Protocol ${tpCode}`;
}
