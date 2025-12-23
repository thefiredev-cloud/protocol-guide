/**
 * Fentanyl Calculator
 * LA County EMS Protocol Reference: MCG 1309, 1317.19
 * 
 * HIGH-PRIORITY SAFETY: Michigan study shows 68% error rate for pediatric fentanyl.
 * Key error patterns: wrong dose by weight, route confusion (IN vs IV), respiratory depression.
 */

import { mcgPerKgPerDose, roundTo } from "../../../lib/dosing/math";
import { boundsValidator, PediatricBoundsValidator } from "../../../lib/dosing/safety/pediatric-bounds-validator";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
  SolutionConcentration,
} from "../../../lib/dosing/types";

const FENTANYL_CONCENTRATION: SolutionConcentration = {
  amount: 50, amountUnit: "mcg", volume: 1, volumeUnit: "mL", label: "50mcg/mL",
};

const CITATIONS = ["MCG 1309", "1317.19"];

export class FentanylCalculator implements MedicationCalculator {
  public readonly id = "fentanyl";
  public readonly name = "Fentanyl";
  public readonly aliases = ["sublimaze"];
  public readonly categories = ["Medication", "Analgesia", "MCG 1309"];

  private readonly validator = new PediatricBoundsValidator();

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const validation = this.validator.validateRequest(request);
    if (!validation.isValid) {
      return boundsValidator.createErrorResult(this.id, this.name, validation.error ?? "Invalid request", CITATIONS);
    }

    const { recommendations, warnings } = this.buildRecommendations(request, validation.warnings);
    return { medicationId: this.id, medicationName: this.name, recommendations, warnings, citations: CITATIONS };
  }

  private buildRecommendations(request: MedicationCalculationRequest, baseWarnings: string[]) {
    const weightKg = request.patientWeightKg!;
    const isAdult = this.validator.isAdult(request);
    const isPediatric = this.validator.isPediatric(request);

    const recommendations: MedicationDoseRecommendation[] = isAdult
      ? [buildAdultIVRec(), buildAdultINRec()]
      : isPediatric
        ? [buildPediatricIVRec(weightKg), buildPediatricINRec(weightKg)]
        : [buildAdultIVRec(), buildPediatricIVRec(weightKg)];

    const warnings = [...baseWarnings, ...this.getSafetyWarnings(request, isPediatric)];
    return { recommendations, warnings };
  }

  private getSafetyWarnings(request: MedicationCalculationRequest, isPediatric: boolean): string[] {
    const warnings = [
      "⚠️ RESPIRATORY DEPRESSION RISK - Have naloxone immediately available",
      "Monitor SpO2 and respiratory rate continuously",
      "Reduce dose by 50% in elderly (>65), debilitated, or hepatic impairment",
    ];
    if (isPediatric) {
      warnings.push("PEDIATRIC: Start with lower dose range - titrate to effect");
      warnings.push("PEDIATRIC: Weight-based dosing required - verify weight accuracy");
    }
    if (request.spo2 !== undefined && request.spo2 < 94) {
      warnings.push("⚠️ SpO2 <94% - Use extreme caution with opioids, ensure airway support");
    }
    if (request.respiratoryRate !== undefined && request.respiratoryRate < 12) {
      warnings.push("⚠️ Respiratory rate <12 - Consider alternative analgesia or reduced dose");
    }
    return warnings;
  }
}

function buildAdultIVRec(): MedicationDoseRecommendation {
  return {
    label: "Analgesia IV/IO/IM (Adult)",
    route: "IV",
    dose: { quantity: 50, unit: "mcg" },
    concentration: FENTANYL_CONCENTRATION,
    maxSingleDose: { quantity: 100, unit: "mcg" },
    maxTotalDose: { quantity: 250, unit: "mcg" },
    repeat: { intervalMinutes: 5, maxRepeats: 2, criteria: "Pain persists; monitor for respiratory depression" },
    administrationNotes: [
      "Slow IV/IO push over 1-2 minutes", "Volume: 1mL = 50mcg",
      "May repeat 50mcg q5min × 2 (total 150mcg field)",
      "Contact Base Hospital for additional dosing after 150mcg",
      "Maximum total with Base approval: 250mcg", "Titrate slowly to effect",
    ],
    contraindications: ["Respiratory depression (RR <10 or SpO2 <90%)", "Known fentanyl/opioid allergy", "MAO inhibitor use within 14 days"],
  };
}

function buildAdultINRec(): MedicationDoseRecommendation {
  return {
    label: "Analgesia IN (Adult)",
    route: "IN",
    dose: { quantity: 50, unit: "mcg" },
    concentration: FENTANYL_CONCENTRATION,
    maxSingleDose: { quantity: 100, unit: "mcg" },
    maxTotalDose: { quantity: 250, unit: "mcg" },
    repeat: { intervalMinutes: 5, maxRepeats: 2, criteria: "Pain persists; monitor for respiratory depression" },
    administrationNotes: [
      "Divide dose between nares (0.5mL per nare max)", "Volume: 1mL = 50mcg",
      "Onset: 5-10 minutes (slower than IV)",
      "May repeat 50mcg q5min × 2 (total 150mcg field)",
      "Contact Base Hospital for additional dosing after 150mcg",
    ],
    contraindications: ["Nasal trauma or active epistaxis", "Respiratory depression", "Known opioid allergy"],
  };
}

function buildPediatricIVRec(weightKg: number): MedicationDoseRecommendation {
  const dose = mcgPerKgPerDose(weightKg, 1, 50, 0);
  const maxTotal = dose * 4;
  return {
    label: `Analgesia IV/IO/IM (Pediatric, ${weightKg}kg)`,
    route: "IV",
    dose: { quantity: dose, unit: "mcg" },
    concentration: FENTANYL_CONCENTRATION,
    maxSingleDose: { quantity: 50, unit: "mcg" },
    maxTotalDose: { quantity: maxTotal, unit: "mcg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Pain persists; monitor respiratory status closely" },
    administrationNotes: [
      `Calculated: 1mcg/kg × ${weightKg}kg = ${roundTo(weightKg, 0)}mcg`,
      `Volume: ${roundTo(dose / 50, 2)}mL`, "Slow IV/IO push",
      "May repeat × 1 (total 2 doses field)",
      "Contact Base Hospital for additional dosing after 2 doses",
      "Maximum total with Base approval: 4 doses",
    ],
    contraindications: ["Respiratory depression or compromise", "Age <3 months (relative - use morphine if available)", "Known opioid allergy"],
  };
}

function buildPediatricINRec(weightKg: number): MedicationDoseRecommendation {
  const dose = mcgPerKgPerDose(weightKg, 1.5, 100, 0);
  const volumeML = roundTo(dose / 50, 2);
  return {
    label: `Analgesia IN (Pediatric, ${weightKg}kg)`,
    route: "IN",
    dose: { quantity: dose, unit: "mcg" },
    concentration: FENTANYL_CONCENTRATION,
    maxSingleDose: { quantity: 100, unit: "mcg" },
    maxTotalDose: { quantity: dose * 4, unit: "mcg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Pain persists; monitor respiratory status" },
    administrationNotes: [
      `Calculated: 1.5mcg/kg × ${weightKg}kg = ${roundTo(weightKg * 1.5, 0)}mcg`,
      `Volume: ${volumeML}mL`, "Divide dose between nares (max 0.5mL per nare)",
      volumeML > 1 ? "Volume >1mL - consider IV route for reliability" : "Volume appropriate for IN route",
      "Onset: 5-10 minutes", "May repeat × 1 (total 2 doses field)", "Contact Base Hospital after 2 doses",
    ],
    contraindications: ["Nasal trauma or bleeding", "Respiratory compromise", "Volume >1.5mL total (use IV instead)"],
  };
}
