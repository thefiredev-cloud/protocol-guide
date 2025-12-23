import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class CalciumChlorideCalculator implements MedicationCalculator {
  public readonly id = "calcium-chloride";
  public readonly name = "Calcium Chloride";
  public readonly aliases = ["ca cl"];
  public readonly categories = ["Medication", "Cardiac"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const adultDose = 1000; // mg
    const pediatricDose = mgPerKgPerDose(weightKg, 20, 1000, 0);

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Hyperkalemia/Calcium Channel Blocker/Crush",
          route: "IV",
          dose: { quantity: adultDose, unit: "mg" },
          administrationNotes: ["Slow IV push", "Dilute 1:1 with NS"],
        },
        {
          label: "Pediatric",
          route: "IV",
          dose: { quantity: pediatricDose, unit: "mg" },
          administrationNotes: ["Slow IV push", "Dilute 1:1 with NS"],
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "1317.11"],
    };
  }
}


