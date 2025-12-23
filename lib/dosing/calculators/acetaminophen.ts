import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type { MedicationCalculationRequest, MedicationCalculationResult, MedicationCalculator, MedicationDoseRecommendation } from "../../../lib/dosing/types";

export class AcetaminophenCalculator implements MedicationCalculator {
  public readonly id = "acetaminophen";
  public readonly name = "Acetaminophen";
  public readonly aliases = ["tylenol"];
  public readonly categories = ["Medication", "Analgesia"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const age = request.patientAgeYears ?? 30;
    const isAdult = age >= 15 || weightKg >= 45;

    const pediatricDose = mgPerKgPerDose(weightKg, 15, 650, 0);

    const recommendations: MedicationDoseRecommendation[] = [
      {
        label: "PO",
        route: "PO",
        dose: { quantity: isAdult ? 1000 : pediatricDose, unit: "mg" },
        repeat: { intervalMinutes: 240, maxRepeats: 5, criteria: "Max daily 4 g adult / 75 mg/kg peds" },
        administrationNotes: ["Use liquid 160 mg/5 mL for <40 kg"],
      },
    ];

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings: [],
      citations: ["MCG 1309", "1317.22"],
    };
  }
}


