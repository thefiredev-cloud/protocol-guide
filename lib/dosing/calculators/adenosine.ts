import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class AdenosineCalculator implements MedicationCalculator {
  public readonly id = "adenosine";
  public readonly name = "Adenosine";
  public readonly aliases = ["adenocard"];
  public readonly categories = ["Medication", "Cardiac"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const isAdult = (request.patientAgeYears ?? 0) >= 15 || weightKg >= 45;

    const firstDose = isAdult ? 6 : Math.min(mgPerKgPerDose(weightKg, 0.1, 6, 2), 6);
    const secondDose = isAdult ? 12 : Math.min(mgPerKgPerDose(weightKg, 0.2, 12, 2), 12);

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "SVT First Dose",
          route: "IV",
          dose: { quantity: firstDose, unit: "mg" },
          administrationNotes: ["Rapid IV push proximal line", "Immediate 20 mL flush"],
        },
        {
          label: "SVT Second Dose",
          route: "IV",
          dose: { quantity: secondDose, unit: "mg" },
          administrationNotes: ["May repeat once if rhythm persists"],
          repeat: { intervalMinutes: 2, maxRepeats: 1 },
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "1317.1"],
    };
  }
}


