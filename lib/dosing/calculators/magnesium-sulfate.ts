import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class MagnesiumSulfateCalculator implements MedicationCalculator {
  public readonly id = "magnesium-sulfate";
  public readonly name = "Magnesium Sulfate";
  public readonly aliases = ["mag sulfate"];
  public readonly categories = ["Medication", "Cardiac"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const adultDose = 2; // grams
    const pediatricDose = mgPerKgPerDose(weightKg, 25, 2000, 0) / 1000;

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Torsades / Asthma (Adult)",
          route: "IV",
          dose: { quantity: adultDose, unit: "g" },
          administrationNotes: ["Infuse over 5-20 min"],
        },
        {
          label: "Pediatric Asthma",
          route: "IV",
          dose: { quantity: pediatricDose, unit: "g" },
          administrationNotes: ["Dilute in NS", "Infuse over 20 min"],
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "Drug Reference - Magnesium"],
    };
  }
}


