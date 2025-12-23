import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class KetamineCalculator implements MedicationCalculator {
  public readonly id = "ketamine";
  public readonly name = "Ketamine";
  public readonly aliases = ["ketalar"];
  public readonly categories = ["Medication", "Sedation"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;

    const analgesiaDose = mgPerKgPerDose(weightKg, 0.2, undefined, 2);
    const sedationDose = mgPerKgPerDose(weightKg, 1, undefined, 2);

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Analgesia",
          route: "IV",
          dose: { quantity: analgesiaDose, unit: "mg" },
          administrationNotes: ["Dilute in 100 mL NS", "Infuse over 10 min"],
        },
        {
          label: "Excited Delirium",
          route: "IM",
          dose: { quantity: sedationDose, unit: "mg" },
          administrationNotes: ["Consider airway support", "Monitor closely"],
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "Agency Ketamine guidance"],
    };
  }
}


