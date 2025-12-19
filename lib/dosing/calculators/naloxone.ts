/**
 * Naloxone (Narcan) Calculator
 * LA County EMS Protocol References:
 * - TP 1241 (Overdose/Poisoning/Ingestion)
 * - MCG 1317.29 (Drug Reference - Naloxone)
 * - MCG 1309 (Pediatric Dosing)
 *
 * Source: LA County Department of Health Services EMS Agency
 * Last Verified: 2024-07-01 (Revision date from MCG 1317.29)
 */

import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
  SolutionConcentration,
} from "@/lib/dosing/types";

const NALOXONE_CONCENTRATIONS: Record<string, SolutionConcentration> = {
  standard: { amount: 1, amountUnit: "mg", volume: 1, volumeUnit: "mL", label: "1mg/mL" },
  intranasal: { amount: 4, amountUnit: "mg", volume: 0.1, volumeUnit: "mL", label: "4mg/0.1mL IN spray" },
};

const CITATIONS = ["TP 1241", "MCG 1317.29", "MCG 1309"];
const MAX_DOSE_MG = 8;

function buildAdultIN(): MedicationDoseRecommendation {
  return {
    label: "Opioid Overdose IN (Adult)",
    route: "IN",
    dose: { quantity: 4, unit: "mg" },
    concentration: NALOXONE_CONCENTRATIONS.intranasal,
    maxSingleDose: { quantity: 4, unit: "mg" },
    maxTotalDose: { quantity: MAX_DOSE_MG, unit: "mg" },
    repeat: { intervalMinutes: 3, criteria: "Titrate to RR >12" },
    administrationNotes: ["2mg per nostril OR 4mg/0.1mL spray", "Per MCG 1317.29: 2-4mg IN"],
  };
}

function buildAdultIM(): MedicationDoseRecommendation {
  return {
    label: "Opioid Overdose IM (Adult)",
    route: "IM",
    dose: { quantity: 2, unit: "mg" },
    concentration: NALOXONE_CONCENTRATIONS.standard,
    maxSingleDose: { quantity: 2, unit: "mg" },
    maxTotalDose: { quantity: MAX_DOSE_MG, unit: "mg" },
    repeat: { intervalMinutes: 3, criteria: "Titrate to adequate respiratory rate" },
    administrationNotes: ["Inject deltoid/thigh, onset 2-5 min", "Per MCG 1317.29: 2mg IM"],
  };
}

function buildAdultIV(): MedicationDoseRecommendation {
  return {
    label: "Opioid Overdose IV (Adult)",
    route: "IV",
    dose: { quantity: 0.8, unit: "mg" },
    concentration: NALOXONE_CONCENTRATIONS.standard,
    maxSingleDose: { quantity: 2, unit: "mg" },
    maxTotalDose: { quantity: MAX_DOSE_MG, unit: "mg" },
    repeat: { intervalMinutes: 2, criteria: "Titrate to RR >12" },
    administrationNotes: ["IV push, titrate slowly", "Per MCG 1317.29: 0.8-2mg IV"],
  };
}

export class NaloxoneCalculator implements MedicationCalculator {
  public readonly id = "naloxone";
  public readonly name = "Naloxone";
  public readonly aliases = ["narcan", "evzio"];
  public readonly categories = ["Medication", "Opioid Antagonist", "MCG 1309"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const age = request.patientAgeYears ?? 30;
    const weightKg = request.patientWeightKg ?? 70;
    const isAdult = age >= 12 || weightKg >= 40;
    const recommendations: MedicationDoseRecommendation[] = [];
    const warnings: string[] = [];

    if (isAdult) {
      recommendations.push(...this.buildAdultRecommendations());
    } else {
      recommendations.push(...this.buildPediatricRecommendations(weightKg));
    }

    warnings.push(
      "May precipitate acute opioid withdrawal (agitation, vomiting, tachycardia)",
      "Fentanyl/carfentanil may require higher doses (4-10mg+)",
      "Re-sedation possible - monitor for 2+ hours",
      "Duration of action: 30-90 minutes (shorter than most opioids)",
    );

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings,
      citations: CITATIONS,
    };
  }

  private buildAdultRecommendations(): MedicationDoseRecommendation[] {
    return [buildAdultIN(), buildAdultIM(), buildAdultIV()];
  }

  private buildPediatricRecommendations(weightKg: number): MedicationDoseRecommendation[] {
    const dosePerKg = 0.1; // 0.1mg/kg per MCG 1317.29
    const calculatedDose = Math.min(weightKg * dosePerKg, 2);
    const roundedDose = Math.round(calculatedDose * 100) / 100;

    return [
      {
        label: `Opioid Overdose (Pediatric, ${weightKg}kg)`,
        route: "IV",
        dose: { quantity: roundedDose, unit: "mg" },
        concentration: NALOXONE_CONCENTRATIONS.standard,
        maxSingleDose: { quantity: 2, unit: "mg" },
        maxTotalDose: { quantity: MAX_DOSE_MG, unit: "mg" },
        repeat: { intervalMinutes: 3, criteria: "Titrate to age-appropriate respiratory rate" },
        administrationNotes: [
          `Calculated: ${dosePerKg}mg/kg × ${weightKg}kg = ${roundedDose}mg`,
          "Per MCG 1317.29 & MCG 1309",
          "IV/IM/IN routes all acceptable",
          "Excludes newborns per LA County protocol",
        ],
      },
      {
        label: `Opioid Overdose IN (Pediatric, ${weightKg}kg)`,
        route: "IN",
        dose: { quantity: 4, unit: "mg" },
        concentration: NALOXONE_CONCENTRATIONS.intranasal,
        maxTotalDose: { quantity: MAX_DOSE_MG, unit: "mg" },
        repeat: { intervalMinutes: 3, criteria: "Titrate to respiratory effort" },
        administrationNotes: [
          "Use pre-packaged nasal spray if available",
          "Per MCG 1317.29: 2-4mg IN for pediatrics",
          "Weight-based dosing preferred when IV access available",
        ],
      },
    ];
  }
}
