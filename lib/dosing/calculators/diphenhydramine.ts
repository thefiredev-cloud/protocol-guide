/**
 * Diphenhydramine (Benadryl) Calculator
 * LA County EMS Protocol References:
 * - TP 1219 (Allergy/Anaphylaxis)
 * - TP 1239 (Dystonic Reaction)
 * - MCG 1317.15 (Drug Reference - Diphenhydramine)
 * - MCG 1309 (Pediatric Dosing)
 *
 * Source: LA County Department of Health Services EMS Agency
 * Last Verified: 2024-07-01 (Revision date from MCG 1317.15)
 */

import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
  SolutionConcentration,
} from "@/lib/dosing/types";

const DIPHENHYDRAMINE_CONCENTRATION: SolutionConcentration = {
  amount: 50, amountUnit: "mg", volume: 1, volumeUnit: "mL", label: "50mg/mL",
};

const CITATIONS = ["TP 1219", "TP 1239", "MCG 1317.15", "MCG 1309"];

function buildAdultIV(): MedicationDoseRecommendation {
  return {
    label: "Allergic Reaction/Dystonia IV (Adult)",
    route: "IV",
    dose: { quantity: 50, unit: "mg" },
    concentration: DIPHENHYDRAMINE_CONCENTRATION,
    maxSingleDose: { quantity: 50, unit: "mg" },
    repeat: { intervalMinutes: 0, maxRepeats: 0, criteria: "Single dose per LA County" },
    administrationNotes: ["Give slow IV push over 1-2 minutes", "Per MCG 1317.15: 50mg slow IV push"],
  };
}

function buildAdultIM(): MedicationDoseRecommendation {
  return {
    label: "Allergic Reaction/Dystonia IM (Adult)",
    route: "IM",
    dose: { quantity: 50, unit: "mg" },
    concentration: DIPHENHYDRAMINE_CONCENTRATION,
    maxSingleDose: { quantity: 50, unit: "mg" },
    administrationNotes: ["Inject into deltoid or lateral thigh", "Per MCG 1317.15: 50mg IM"],
  };
}

export class DiphenhydramineCalculator implements MedicationCalculator {
  public readonly id = "diphenhydramine";
  public readonly name = "Diphenhydramine";
  public readonly aliases = ["benadryl"];
  public readonly categories = ["Medication", "Antihistamine", "MCG 1309"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const age = request.patientAgeYears ?? 30;
    const weightKg = request.patientWeightKg ?? 70;
    const isAdult = age >= 12 || weightKg >= 40;
    const recommendations: MedicationDoseRecommendation[] = [];
    const warnings: string[] = [];

    if (isAdult) {
      recommendations.push(buildAdultIV(), buildAdultIM());
    } else {
      recommendations.push(...this.buildPediatricRecommendations(weightKg));
    }

    warnings.push(
      "May cause sedation and drowsiness",
      "Use caution in patients with glaucoma or urinary retention",
      "Monitor for hypotension with IV administration",
      "May cause paradoxical excitation in young children",
    );

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings,
      citations: CITATIONS,
    };
  }

  private buildPediatricRecommendations(weightKg: number): MedicationDoseRecommendation[] {
    const dosePerKg = 1; // 1mg/kg per MCG 1317.15
    const maxDose = 50;
    const calculatedDose = Math.min(weightKg * dosePerKg, maxDose);
    const roundedDose = Math.round(calculatedDose);

    return [
      {
        label: `Allergic Reaction/Dystonia IV (Pediatric, ${weightKg}kg)`,
        route: "IV",
        dose: { quantity: roundedDose, unit: "mg" },
        concentration: DIPHENHYDRAMINE_CONCENTRATION,
        maxSingleDose: { quantity: maxDose, unit: "mg" },
        administrationNotes: [
          `Calculated: ${dosePerKg}mg/kg × ${weightKg}kg = ${roundedDose}mg`,
          "Give slow IV push",
          "Per MCG 1317.15 & MCG 1309",
        ],
      },
      {
        label: `Allergic Reaction/Dystonia IM (Pediatric, ${weightKg}kg)`,
        route: "IM",
        dose: { quantity: roundedDose, unit: "mg" },
        concentration: DIPHENHYDRAMINE_CONCENTRATION,
        maxSingleDose: { quantity: maxDose, unit: "mg" },
        administrationNotes: [
          `Calculated: ${dosePerKg}mg/kg × ${weightKg}kg = ${roundedDose}mg`,
          "Deep IM if unable to obtain venous access",
          "Per MCG 1317.15 & MCG 1309",
        ],
      },
    ];
  }
}
