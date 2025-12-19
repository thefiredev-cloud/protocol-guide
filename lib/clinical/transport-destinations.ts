/**
 * LA County EMS Transport Destination Decision Support
 *
 * Provides guidance on appropriate transport destinations based on:
 * - Patient condition (trauma level, specialty needs)
 * - Time-sensitive emergencies (STEMI, Stroke, Trauma)
 * - Pediatric considerations
 * - Available specialty centers
 *
 * Reference: LA County EMS Agency Destination Policies
 * - Ref 502: Patient Destination
 * - Ref 506: Trauma Triage
 * - Ref 512: Burn Patient Destination
 * - Ref 513: STEMI Patient Destination
 * - Ref 516: Cardiac Arrest Destination
 * - Ref 521: Stroke Patient Destination
 * - Ref 526: Behavioral Patient Destination
 * - Ref 528: Intoxicated Patient Destination
 */

import { facilityManager } from "./FacilityManager";
import type { Facility } from "./facilities";

export type PatientCondition =
  | "trauma-major"
  | "trauma-minor"
  | "stemi"
  | "stroke"
  | "stroke-lvo"
  | "cardiac-arrest"
  | "cardiac-arrest-ecpr"
  | "burns-major"
  | "burns-minor"
  | "pediatric-critical"
  | "pediatric-trauma"
  | "obstetric-emergency"
  | "psychiatric"
  | "psychiatric-tad"
  | "intoxicated-tad"
  | "medical-general"
  | "overdose"
  | "drowning"
  | "hyperbaric";

export interface TransportRecommendation {
  condition: PatientCondition;
  recommendedDestinations: string[];
  justification: string;
  timeConstraint?: string;
  baseContactRequired: boolean;
  specialConsiderations?: string[];
  /** Protocol references for this recommendation */
  citations?: string[];
}

// === Dynamic Destination Lists (from FacilityManager) ===

/**
 * Get trauma center names by level.
 */
function getTraumaCenterNames(level?: "I" | "II", pediatric?: boolean): string[] {
  return facilityManager.getTraumaCenters(level, pediatric).map((h) => h.name);
}

/**
 * Get STEMI center names.
 */
function getSTEMICenterNames(): string[] {
  return facilityManager.getSTEMICenters().map((h) => h.name);
}

/**
 * Get ECPR center names.
 */
function getECPRCenterNames(): string[] {
  return facilityManager.getECPRCenters().map((h) => h.name);
}

/**
 * Get stroke center names by type.
 */
function getStrokeCenterNames(type?: "PSC" | "CSC"): string[] {
  return facilityManager.getStrokeCenters(type).map((h) => h.name);
}

/**
 * Get burn center names.
 */
function getBurnCenterNames(): string[] {
  return facilityManager.getBurnCenters().map((h) => h.name);
}

/**
 * Get pediatric center names.
 */
function getPediatricCenterNames(): string[] {
  return facilityManager.getPediatricCenters().map((h) => h.name);
}

/**
 * Get base hospital names.
 */
function getBaseHospitalNames(): string[] {
  return facilityManager.getBaseHospitals().map((h) => h.name);
}

/**
 * Get PUCC names for patient age.
 */
function getPUCCNames(patientAge: number): string[] {
  return facilityManager.getPUCCs(patientAge).map((p) => p.name);
}

/**
 * Get sobering center names.
 */
function getSoberingCenterNames(): string[] {
  return facilityManager.getSoberingCenters().map((s) => s.name);
}

// === Legacy Static Exports (for backwards compatibility) ===

/** @deprecated Use facilityManager.getTraumaCenters() instead */
export const TRAUMA_CENTERS = {
  get levelI() {
    return getTraumaCenterNames("I");
  },
  get levelII() {
    return getTraumaCenterNames("II");
  },
  get pediatricTrauma() {
    return getTraumaCenterNames(undefined, true);
  },
};

/** @deprecated Use facilityManager.getSTEMICenters() instead */
export const STEMI_CENTERS = getSTEMICenterNames();

/** @deprecated Use facilityManager.getStrokeCenters() instead */
export const STROKE_CENTERS = {
  get comprehensive() {
    return getStrokeCenterNames("CSC");
  },
  get primary() {
    return getStrokeCenterNames("PSC");
  },
};

/** @deprecated Use facilityManager.getBurnCenters() instead */
export const BURN_CENTERS = getBurnCenterNames();

/** @deprecated Use facilityManager.getPediatricCenters() instead */
export const PEDIATRIC_EDS = getPediatricCenterNames();

// === Main Recommendation Function ===

/**
 * Get transport recommendation based on patient condition.
 *
 * @param condition - The patient's clinical condition
 * @param isPediatric - Whether the patient is pediatric (age < 18)
 * @param patientAge - Patient age in years (for TAD destinations)
 */
export function getTransportRecommendation(
  condition: PatientCondition,
  isPediatric: boolean = false,
  patientAge?: number
): TransportRecommendation {
  switch (condition) {
    case "trauma-major":
      return {
        condition,
        recommendedDestinations: isPediatric
          ? getTraumaCenterNames(undefined, true)
          : getTraumaCenterNames("I"),
        justification: "Major trauma requires Level I Trauma Center capabilities",
        timeConstraint: "Golden Hour - transport within 60 minutes of injury",
        baseContactRequired: false,
        specialConsiderations: [
          "Consider air transport if ground time >30 minutes",
          "Apply trauma triage criteria (Ref 506)",
          "Notify destination hospital en route",
        ],
        citations: ["Ref 506 - Trauma Triage"],
      };

    case "trauma-minor":
      return {
        condition,
        recommendedDestinations: [
          ...getTraumaCenterNames("I"),
          ...getTraumaCenterNames("II"),
        ],
        justification: "Minor trauma with potential for deterioration",
        baseContactRequired: false,
        specialConsiderations: [
          "Monitor for signs of occult injury",
          "Re-assess trauma triage criteria",
        ],
        citations: ["Ref 506 - Trauma Triage"],
      };

    case "stemi":
      return {
        condition,
        recommendedDestinations: getSTEMICenterNames(),
        justification: "STEMI requires immediate PCI capability",
        timeConstraint: "Door-to-balloon time goal <90 minutes",
        baseContactRequired: true,
        specialConsiderations: [
          "Transmit 12-lead ECG to receiving facility",
          "Contact base hospital for STEMI alert",
          "Consider aspirin, nitroglycerin per protocol",
          "Cath lab activation en route",
        ],
        citations: ["Ref 513 - STEMI Patient Destination", "TP 1211 - Chest Pain/ACS"],
      };

    case "stroke":
      return {
        condition,
        recommendedDestinations: getStrokeCenterNames(),
        justification: "Stroke requires rapid assessment for thrombolytic candidacy",
        timeConstraint: "Door-to-needle time goal <60 minutes for tPA",
        baseContactRequired: true,
        specialConsiderations: [
          "Document last known well time",
          "Perform and document stroke scale (mLAPSS/LAMS)",
          "Contact base hospital for stroke alert",
          "If LVO suspected, prefer Comprehensive Stroke Center",
        ],
        citations: ["Ref 521 - Stroke Patient Destination", "TP 1232 - Stroke/CVA/TIA"],
      };

    case "stroke-lvo":
      return {
        condition,
        recommendedDestinations: getStrokeCenterNames("CSC"),
        justification: "Large vessel occlusion requires thrombectomy-capable center",
        timeConstraint: "Thrombectomy window up to 24 hours in select patients",
        baseContactRequired: true,
        specialConsiderations: [
          "Document last known well time",
          "LAMS ≥4 or RACE ≥5 suggests LVO",
          "Transport directly to CSC if within reasonable time",
          "Contact base hospital for stroke alert",
        ],
        citations: ["Ref 521 - Stroke Patient Destination"],
      };

    case "cardiac-arrest":
      return {
        condition,
        recommendedDestinations: getSTEMICenterNames(),
        justification: "Post-cardiac arrest requires advanced cardiac care",
        baseContactRequired: true,
        specialConsiderations: [
          "Consider targeted temperature management",
          "Document initial rhythm and ROSC time",
          "Continue post-arrest care per protocol",
          "Consider cardiac cath if suspected cardiac etiology",
          "Assess for ECPR candidacy if refractory VF/VT",
        ],
        citations: ["Ref 516 - Cardiac Arrest Destination", "TP 1210 - Cardiac Arrest"],
      };

    case "cardiac-arrest-ecpr":
      return {
        condition,
        recommendedDestinations: getECPRCenterNames(),
        justification: "ECPR candidate requires designated ECPR Receiving Center",
        timeConstraint: "Transport to ECPR center within 30 minutes optimal",
        baseContactRequired: false,
        specialConsiderations: [
          "Do NOT delay for base hospital contact - contact ECPR center directly",
          "Mechanical CPR device strongly recommended",
          "Minimize scene time",
          "Must meet all MCG 1318 criteria",
          "ECPR center must be SRC + Base Hospital per Ref 321",
        ],
        citations: ["Ref 321 - ECPR Receiving Center Standards", "Ref 516 - Cardiac Arrest"],
      };

    case "burns-major":
      return {
        condition,
        recommendedDestinations: getBurnCenterNames(),
        justification: "Major burns require specialized burn center care",
        baseContactRequired: true,
        specialConsiderations: [
          "Calculate burn percentage (Rule of 9s)",
          "Initiate fluid resuscitation per Parkland formula",
          "Cover burns with dry sterile dressings",
          "Major burn criteria: >20% TBSA, face/hands/feet/genitals, inhalation",
        ],
        citations: ["Ref 512 - Burn Patient Destination", "TP 1220 - Burns"],
      };

    case "burns-minor":
      return {
        condition,
        recommendedDestinations: getBaseHospitalNames(),
        justification: "Minor burns can be managed at general emergency departments",
        baseContactRequired: false,
        specialConsiderations: [
          "Cool burns with room temperature water (not ice)",
          "Cover with dry sterile dressing",
        ],
        citations: ["Ref 512 - Burn Patient Destination"],
      };

    case "pediatric-critical":
      return {
        condition,
        recommendedDestinations: getPediatricCenterNames(),
        justification: "Critical pediatric patients require specialized pediatric care",
        baseContactRequired: true,
        specialConsiderations: [
          "Use Broselow tape for weight-based dosing",
          "Notify pediatric-capable receiving facility",
          "Consider CHLA for complex cases",
        ],
        citations: ["Ref 510 - Pediatric Patient Destination"],
      };

    case "pediatric-trauma":
      return {
        condition,
        recommendedDestinations: getTraumaCenterNames(undefined, true),
        justification: "Pediatric trauma requires pediatric trauma center capabilities",
        timeConstraint: "Golden Hour applies to pediatric trauma",
        baseContactRequired: false,
        specialConsiderations: [
          "Higher threshold for concern - children compensate then crash",
          "Use pediatric GCS for assessment",
          "Consider non-accidental trauma indicators",
        ],
        citations: ["Ref 506 - Trauma Triage", "Ref 510 - Pediatric Patient Destination"],
      };

    case "obstetric-emergency":
      return {
        condition,
        recommendedDestinations: getBaseHospitalNames(),
        justification: "OB emergency requires facility with OB services",
        baseContactRequired: true,
        specialConsiderations: [
          "Notify receiving facility of imminent delivery",
          "Position for left uterine displacement if hypotensive",
          "Prepare for neonatal resuscitation",
        ],
        citations: ["Ref 511 - Perinatal Patient Destination"],
      };

    case "psychiatric":
      return {
        condition,
        recommendedDestinations: getBaseHospitalNames(),
        justification: "Psychiatric emergency requires medical clearance at ED",
        baseContactRequired: false,
        specialConsiderations: [
          "Medical clearance before psychiatric facility",
          "Document 5150 criteria if applicable",
          "Ensure patient and crew safety",
          "If TAD-approved unit, consider PUCC per Ref 526",
        ],
        citations: ["Ref 526 - Behavioral Patient Destination", "TP 1209 - Behavioral Crisis"],
      };

    case "psychiatric-tad":
      return {
        condition,
        recommendedDestinations:
          patientAge !== undefined ? getPUCCNames(patientAge) : getPUCCNames(18),
        justification: "TAD-approved transport to Psychiatric Urgent Care Center",
        baseContactRequired: false,
        specialConsiderations: [
          "Only TAD-approved units can transport to PUCC",
          "Patient must meet Ref 526.1 medical clearance criteria",
          "Adolescents 13-17 only accepted at select PUCCs",
          "If criteria not met, transport to ED for medical clearance",
        ],
        citations: ["Ref 526 - Behavioral Patient Destination", "Ref 526.1 - PUCC Criteria"],
      };

    case "intoxicated-tad":
      return {
        condition,
        recommendedDestinations: getSoberingCenterNames(),
        justification: "TAD-approved transport to Sobering Center",
        baseContactRequired: false,
        specialConsiderations: [
          "Only TAD-approved units can transport to Sobering Center",
          "Patient must meet Ref 528.1 medical clearance criteria",
          "Primary issue must be uncomplicated alcohol intoxication",
          "Vitals must be within defined ranges",
          "No head trauma, seizures, pregnancy, or co-ingestants",
          "If criteria not met, transport to ED",
        ],
        citations: ["Ref 528 - Intoxicated Patient Destination", "Ref 528.1 - SC Criteria"],
      };

    case "overdose":
      return {
        condition,
        recommendedDestinations: getBaseHospitalNames(),
        justification: "Overdose requires medical evaluation and monitoring",
        baseContactRequired: false,
        specialConsiderations: [
          "Bring pill bottles/substances if safe",
          "Document substance and amount if known",
          "Monitor for respiratory depression",
          "Naloxone may need redosing (short half-life)",
        ],
        citations: ["TP 1233 - Toxic Ingestion/Exposure"],
      };

    case "drowning":
      return {
        condition,
        recommendedDestinations: [
          ...getTraumaCenterNames("I"),
          ...getBaseHospitalNames(),
        ],
        justification: "Drowning requires monitoring for pulmonary complications",
        baseContactRequired: isPediatric,
        specialConsiderations: [
          "All submersion patients need hospital evaluation",
          "Consider cervical spine precautions",
          "Monitor for delayed pulmonary edema",
          "Consider hypothermia treatment",
        ],
        citations: ["TP 1226 - Drowning/Submersion"],
      };

    case "hyperbaric":
      return {
        condition,
        recommendedDestinations: [
          "Catalina Hyperbaric Chamber (310-510-1053)",
          "Contact Medical Alert Center (MAC) for nearest chamber",
        ],
        justification: "Decompression illness requires hyperbaric oxygen therapy",
        baseContactRequired: true,
        specialConsiderations: [
          "High-flow oxygen therapy",
          "Do not transport by helicopter (altitude worsens)",
          "Contact MAC for chamber availability: (562) 347-1789",
        ],
        citations: ["Ref 518 - Decompression Emergencies"],
      };

    default:
      return {
        condition: "medical-general",
        recommendedDestinations: getBaseHospitalNames(),
        justification: "General medical complaint - transport to nearest appropriate facility",
        baseContactRequired: false,
        citations: ["Ref 502 - Patient Destination"],
      };
  }
}

/**
 * Get destinations by specific capability query.
 */
export function getDestinationsByCapability(capability: string): Facility[] {
  return facilityManager.getBySpecialService(capability);
}

/**
 * Format transport recommendation for display.
 */
export function formatTransportRecommendation(rec: TransportRecommendation): string {
  const lines: string[] = [];

  lines.push(`TRANSPORT RECOMMENDATION`);
  lines.push(`Condition: ${rec.condition}`);
  lines.push(`\nRecommended Destinations:`);
  rec.recommendedDestinations.forEach((dest, i) => {
    lines.push(`  ${i + 1}. ${dest}`);
  });

  lines.push(`\nJustification: ${rec.justification}`);

  if (rec.timeConstraint) {
    lines.push(`\nTIME CONSTRAINT: ${rec.timeConstraint}`);
  }

  lines.push(`\nBase Contact Required: ${rec.baseContactRequired ? "YES" : "No"}`);

  if (rec.specialConsiderations && rec.specialConsiderations.length > 0) {
    lines.push(`\nSpecial Considerations:`);
    rec.specialConsiderations.forEach((note) => {
      lines.push(`  - ${note}`);
    });
  }

  if (rec.citations && rec.citations.length > 0) {
    lines.push(`\nReferences:`);
    rec.citations.forEach((cite) => {
      lines.push(`  - ${cite}`);
    });
  }

  return lines.join("\n");
}
