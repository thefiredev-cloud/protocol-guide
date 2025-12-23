import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class SodiumBicarbonateCalculator implements MedicationCalculator {
  public readonly id = "sodium-bicarbonate";
  public readonly name = "Sodium Bicarbonate";
  public readonly aliases = ["bicarb"];
  public readonly categories = ["Medication", "Cardiac"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const adultDose = 50;
    const pediatricDose = mgPerKgPerDose(weightKg, 1, undefined, 2);

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Cardiac Arrest / Crush / TCA",
          route: "IV",
          dose: { quantity: adultDose, unit: "mEq" },
          administrationNotes: ["Slow IV push"],
        },
        {
          label: "Pediatric",
          route: "IV",
          dose: { quantity: pediatricDose, unit: "mEq" },
          administrationNotes: ["Use 4.2% solution for pediatrics"],
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "1317.39"],
    };
  }
}


