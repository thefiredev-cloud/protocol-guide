import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type { MedicationCalculationRequest, MedicationCalculationResult, MedicationCalculator, MedicationDoseRecommendation } from "../../../lib/dosing/types";

export class AtropineCalculator implements MedicationCalculator {
  public readonly id = "atropine";
  public readonly name = "Atropine";
  public readonly aliases = [];
  public readonly categories = ["Medication", "Cardiac"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const age = request.patientAgeYears ?? 30;
    const isAdult = age >= 15 || weightKg >= 45;

    const bradyFirstDose = isAdult ? 0.5 : Math.max(0.1, mgPerKgPerDose(weightKg, 0.02, 0.5, 2));

    const recommendations: MedicationDoseRecommendation[] = [
      {
        label: "Symptomatic Bradycardia",
        route: "IV",
        dose: { quantity: bradyFirstDose, unit: "mg" },
        repeat: { intervalMinutes: 3, maxRepeats: 5, criteria: "Until HR improves or max 3 mg" },
        maxTotalDose: { quantity: isAdult ? 3 : 1, unit: "mg" },
        administrationNotes: ["Do not give less than 0.1 mg in pediatrics", "Avoid in high-degree blocks"],
      },
    ];

    if (!isAdult) {
      recommendations.push({
        label: "Organophosphate Poisoning",
        route: "IV",
        dose: { quantity: mgPerKgPerDose(weightKg, 0.02, undefined, 2), unit: "mg" },
        repeat: { intervalMinutes: 5, maxRepeats: 100, criteria: "Repeat until drying of secretions" },
        administrationNotes: ["Consider continuous infusion if severe poisoning"],
      });
    }

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings: [],
      citations: ["MCG 1309", "1317.9"],
    };
  }
}


