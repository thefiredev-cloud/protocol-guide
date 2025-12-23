import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class KetorolacCalculator implements MedicationCalculator {
  public readonly id = "ketorolac";
  public readonly name = "Ketorolac";
  public readonly aliases = ["toradol"];
  public readonly categories = ["Medication", "Analgesia"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const age = request.patientAgeYears ?? 30;
    const isAdult = age >= 15 || weightKg >= 45;
    const elderly = age >= 65;

    const adultDose = elderly ? 15 : 30;
    const pediatricDose = mgPerKgPerDose(weightKg, 0.5, 15, 2);

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Pain",
          route: "IV",
          dose: { quantity: isAdult ? adultDose : pediatricDose, unit: "mg" },
          administrationNotes: ["Contraindicated in renal failure or GI bleed", "IV over 15 seconds"],
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "1317.22"],
    };
  }
}


