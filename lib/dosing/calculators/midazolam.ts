/**
 * Midazolam Calculator
 * LA County EMS Protocol Reference: MCG 1309, MCG 1317.25
 *
 * REVISED: 07-03-25 per LA County Prehospital Care Manual
 *
 * KEY DOSING:
 * - Seizure: 10mg IM/IN adult, age-based pediatric (Broselow)
 * - Agitation/Behavioral: 5mg adult, 0.1mg/kg IV or 0.2mg/kg IM/IN pediatric
 * - Cardiac sedation: Same as agitation dosing
 */

import { mgPerKgPerDose, roundTo } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
  SolutionConcentration,
} from "../../../lib/dosing/types";

const MIDAZOLAM_CONCENTRATION: SolutionConcentration = {
  amount: 5, amountUnit: "mg", volume: 1, volumeUnit: "mL", label: "5mg/mL",
};

const CITATIONS = ["MCG 1309", "1317.25"];

type BroselowDose = { dose: number; colorCode: string };

function getPediatricSeizureDose(ageYears: number): BroselowDose {
  const ageMonths = ageYears * 12;
  if (ageMonths < 12) return { dose: -1, colorCode: "Gray/Pink (0-11 mo)" };
  if (ageMonths < 17) return { dose: 1.25, colorCode: "Red (12-16 mo)" };
  if (ageYears < 6) return { dose: 2.5, colorCode: "Purple/Yellow/White (17mo-5yr)" };
  if (ageYears < 12) return { dose: 5, colorCode: "Blue/Orange/Green (6-11yr)" };
  return { dose: 10, colorCode: "≥12 years (adult)" };
}

function buildAdultSeizureINRec(): MedicationDoseRecommendation {
  return {
    label: "Seizure - Active (IM/IN Adult)",
    route: "IN",
    dose: { quantity: 10, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 10, unit: "mg" },
    maxTotalDose: { quantity: 20, unit: "mg" },
    repeat: { intervalMinutes: 2, maxRepeats: 0, criteria: "Single dose; contact Base" },
    administrationNotes: [
      "Volume: 2mL (divide between nares)", "IM alternative if no atomizer",
      "Contact Base after 10mg", "Max with Base: 20mg",
    ],
  };
}

function buildAdultSeizureIVRec(): MedicationDoseRecommendation {
  return {
    label: "Seizure - Active (IV/IO Adult)",
    route: "IV",
    dose: { quantity: 5, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    maxTotalDose: { quantity: 10, unit: "mg" },
    repeat: { intervalMinutes: 2, maxRepeats: 1, criteria: "Seizure persists" },
    administrationNotes: [
      "Volume: 1mL slow IV/IO push", "May repeat x1 in 2 min",
      "Max 10mg before Base", "Max with Base: 20mg",
    ],
  };
}

function buildInfantSeizureRec(weightKg: number): MedicationDoseRecommendation {
  const dose = mgPerKgPerDose(weightKg, 0.2, 5, 2);
  return {
    label: `Seizure (IM/IN Infant ${weightKg}kg)`,
    route: "IN",
    dose: { quantity: dose, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    maxTotalDose: { quantity: 10, unit: "mg" },
    repeat: { intervalMinutes: 2, maxRepeats: 1, criteria: "Seizure persists" },
    administrationNotes: [
      `Calculated: 0.2mg/kg × ${weightKg}kg = ${roundTo(dose, 2)}mg`,
      `Volume: ${roundTo(dose / 5, 2)}mL`, "Broselow: Gray/Pink (0-11 mo)",
      "May repeat x1 in 2 min", "Max with Base: 3 doses or 20mg",
    ],
  };
}

function buildPedsSeizureRec(broselow: BroselowDose): MedicationDoseRecommendation {
  return {
    label: `Seizure (IM/IN Pediatric - ${broselow.colorCode})`,
    route: "IN",
    dose: { quantity: broselow.dose, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: broselow.dose, unit: "mg" },
    maxTotalDose: { quantity: Math.min(broselow.dose * 3, 20), unit: "mg" },
    repeat: { intervalMinutes: 2, maxRepeats: 1, criteria: "Seizure persists" },
    administrationNotes: [
      `Broselow dose: ${broselow.dose}mg`, `Volume: ${roundTo(broselow.dose / 5, 2)}mL`,
      "Divide between nares", "May repeat x1 in 2 min", "Max with Base: 3 doses or 20mg",
    ],
  };
}

function buildAdultAgitationIMRec(): MedicationDoseRecommendation {
  return {
    label: "Behavioral Crisis/Agitation (IM/IN Adult)",
    route: "IM",
    dose: { quantity: 5, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 10, unit: "mg" },
    maxTotalDose: { quantity: 20, unit: "mg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Agitation persists" },
    administrationNotes: [
      "Volume: 1mL IM or IN", "10mg single dose for severe ALOC",
      "Repeat x1 in 5 min, max 10mg before Base", "Max with Base: 20mg",
    ],
  };
}

function buildAdultAgitationIVRec(): MedicationDoseRecommendation {
  return {
    label: "Behavioral Crisis/Agitation (IV Adult)",
    route: "IV",
    dose: { quantity: 5, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    maxTotalDose: { quantity: 10, unit: "mg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Agitation persists" },
    administrationNotes: ["Volume: 1mL slow IV push", "Max 10mg before Base", "Max with Base: 20mg"],
  };
}

function buildPedsAgitationIMRec(weightKg: number): MedicationDoseRecommendation {
  const imDose = mgPerKgPerDose(weightKg, 0.2, 5, 2);
  return {
    label: `Behavioral Crisis (IM/IN Pediatric ${weightKg}kg)`,
    route: "IM",
    dose: { quantity: imDose, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    maxTotalDose: { quantity: 10, unit: "mg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Agitation persists" },
    administrationNotes: [
      `Calculated: 0.2mg/kg × ${weightKg}kg = ${roundTo(imDose, 2)}mg`,
      `Volume: ${roundTo(imDose / 5, 2)}mL`,
      "⚠️ Behavioral Crisis requires Base order BEFORE administration",
      "Severe ALOC with IMMEDIATE RISK may give before Base",
    ],
  };
}

function buildPedsAgitationIVRec(weightKg: number): MedicationDoseRecommendation {
  const ivDose = mgPerKgPerDose(weightKg, 0.1, 5, 2);
  return {
    label: `Behavioral Crisis (IV Pediatric ${weightKg}kg)`,
    route: "IV",
    dose: { quantity: ivDose, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    maxTotalDose: { quantity: 10, unit: "mg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Agitation persists" },
    administrationNotes: [
      `Calculated: 0.1mg/kg × ${weightKg}kg = ${roundTo(ivDose, 2)}mg`,
      `Volume: ${roundTo(ivDose / 5, 2)}mL slow IV push`,
      "⚠️ Behavioral Crisis requires Base order BEFORE administration",
    ],
  };
}

function buildAdultCardiacRec(): MedicationDoseRecommendation {
  return {
    label: "Cardiac Sedation - Cardioversion/Pacing (Adult)",
    route: "IV",
    dose: { quantity: 5, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    maxTotalDose: { quantity: 10, unit: "mg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Additional sedation needed" },
    administrationNotes: ["Volume: 1mL slow IV/IO push", "Prior to and/or during procedure", "Max 10mg before Base"],
  };
}

function buildPedsCardiacIVRec(weightKg: number): MedicationDoseRecommendation {
  const ivDose = mgPerKgPerDose(weightKg, 0.1, 5, 2);
  return {
    label: `Cardiac Sedation (IV/IO Pediatric ${weightKg}kg)`,
    route: "IV",
    dose: { quantity: ivDose, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    repeat: { intervalMinutes: 5, criteria: "Per Base order" },
    administrationNotes: [
      `Calculated: 0.1mg/kg × ${weightKg}kg = ${roundTo(ivDose, 2)}mg`,
      `Volume: ${roundTo(ivDose / 5, 2)}mL slow IV/IO push`, "Repeat per Base order",
    ],
  };
}

function buildPedsCardiacIMRec(weightKg: number): MedicationDoseRecommendation {
  const imDose = mgPerKgPerDose(weightKg, 0.2, 5, 2);
  return {
    label: `Cardiac Sedation (IM/IN Pediatric ${weightKg}kg)`,
    route: "IM",
    dose: { quantity: imDose, unit: "mg" },
    concentration: MIDAZOLAM_CONCENTRATION,
    maxSingleDose: { quantity: 5, unit: "mg" },
    repeat: { intervalMinutes: 5, criteria: "Per Base order" },
    administrationNotes: [
      `Calculated: 0.2mg/kg × ${weightKg}kg = ${roundTo(imDose, 2)}mg`,
      `Volume: ${roundTo(imDose / 5, 2)}mL`, "Repeat per Base order",
    ],
  };
}

export class MidazolamCalculator implements MedicationCalculator {
  public readonly id = "midazolam";
  public readonly name = "Midazolam";
  public readonly aliases = ["versed"];
  public readonly categories = ["Medication", "Sedation", "Anticonvulsant", "MCG 1309"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const age = request.patientAgeYears ?? 30;
    const isAdult = age >= 15 || weightKg >= 45;
    const isPediatric = age < 15 && weightKg < 45;

    const recommendations = [
      ...this.buildSeizureRecs(isAdult, age, weightKg),
      ...this.buildAgitationRecs(isAdult, weightKg),
      ...this.buildCardiacRecs(isAdult, weightKg),
    ];

    const warnings = [
      "⚠️ Monitor airway, respiratory rate, and SpO2 continuously",
      "Respiratory depression risk increases with opioids/sedatives",
    ];
    if (isPediatric) warnings.push("PEDIATRIC: Verify weight accuracy before dosing");

    return { medicationId: this.id, medicationName: this.name, recommendations, warnings, citations: CITATIONS };
  }

  private buildSeizureRecs(isAdult: boolean, age: number, weightKg: number): MedicationDoseRecommendation[] {
    if (isAdult) return [buildAdultSeizureINRec(), buildAdultSeizureIVRec()];
    const ageMonths = age * 12;
    if (ageMonths < 12) return [buildInfantSeizureRec(weightKg)];
    return [buildPedsSeizureRec(getPediatricSeizureDose(age))];
  }

  private buildAgitationRecs(isAdult: boolean, weightKg: number): MedicationDoseRecommendation[] {
    if (isAdult) return [buildAdultAgitationIMRec(), buildAdultAgitationIVRec()];
    return [buildPedsAgitationIMRec(weightKg), buildPedsAgitationIVRec(weightKg)];
  }

  private buildCardiacRecs(isAdult: boolean, weightKg: number): MedicationDoseRecommendation[] {
    if (isAdult) return [buildAdultCardiacRec()];
    return [buildPedsCardiacIVRec(weightKg), buildPedsCardiacIMRec(weightKg)];
  }
}
