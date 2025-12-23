import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class OndansetronCalculator implements MedicationCalculator {
  public readonly id = "ondansetron";
  public readonly name = "Ondansetron";
  public readonly aliases = ["zofran"];
  public readonly categories = ["Medication", "Sedation"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const age = request.patientAgeYears ?? 30;
    const isAdult = age >= 15 || weightKg >= 45;

    const pediatricDose = mgPerKgPerDose(weightKg, 0.1, 4, 2);

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Nausea (IV/PO)",
          route: "IV",
          dose: { quantity: isAdult ? 4 : pediatricDose, unit: "mg" },
          repeat: { intervalMinutes: 10, maxRepeats: 1 },
          administrationNotes: ["Slow IV over 2-5 min", "ODT 4 mg as alternative"],
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "1317.33"],
    };
  }
}


