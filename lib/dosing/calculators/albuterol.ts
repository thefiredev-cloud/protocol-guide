import type { MedicationCalculationRequest, MedicationCalculationResult, MedicationCalculator, MedicationDoseRecommendation } from "../../../lib/dosing/types";

export class AlbuterolCalculator implements MedicationCalculator {
  public readonly id = "albuterol";
  public readonly name = "Albuterol";
  public readonly aliases = ["ventolin", "neb"];
  public readonly categories = ["Medication", "MCG 1309"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const isAdult = request.patientAgeYears ? request.patientAgeYears >= 15 : weightKg >= 45;

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Nebulizer",
          route: "Neb",
          dose: { quantity: isAdult ? 5 : 2.5, unit: "mg" },
          administrationNotes: [
            isAdult ? "5 mg nebulized; may repeat q20 min" : "2.5 mg nebulized; may repeat q20 min",
            "Use inline with CPAP if severe distress",
          ],
          repeat: { intervalMinutes: 20, criteria: "Severe wheeze persists" },
        } as MedicationDoseRecommendation,
        {
          label: "MDI",
          route: "IN",
          dose: { quantity: isAdult ? 4 : 2, unit: "puffs" },
          administrationNotes: ["Use spacer if available", "Each puff 90 mcg"],
          repeat: { intervalMinutes: 20, maxRepeats: 2 },
        } as MedicationDoseRecommendation,
      ],
      warnings: [],
      citations: ["MCG 1309", "1317.3"],
    };
  }
}


