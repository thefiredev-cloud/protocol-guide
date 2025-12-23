import { mgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
} from "../../../lib/dosing/types";

export class AmiodaroneCalculator implements MedicationCalculator {
  public readonly id = "amiodarone";
  public readonly name = "Amiodarone";
  public readonly aliases = ["cordarone"];
  public readonly categories = ["Medication", "Cardiac"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const isAdult = (request.patientAgeYears ?? 0) >= 15 || weightKg >= 45;

    const pediatricDose = mgPerKgPerDose(weightKg, 5, 300, 0);

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations: [
        {
          label: "Cardiac Arrest (VT/VF)",
          route: "IV",
          dose: { quantity: isAdult ? 300 : pediatricDose, unit: "mg" },
          repeat: { intervalMinutes: 3, maxRepeats: 1, criteria: "After additional defibrillation" },
          administrationNotes: ["Push IV/IO", "Second dose 150 mg (adult) or 5 mg/kg"],
        },
        {
          label: "Tachycardia with Pulse",
          route: "IV",
          dose: { quantity: isAdult ? 150 : Math.min(pediatricDose, 150), unit: "mg" },
          administrationNotes: ["Infuse over 10 minutes", "Repeat as needed to max 450 mg"],
          repeat: { intervalMinutes: 10, criteria: "Recurrent VT with pulse" },
        },
      ],
      warnings: [],
      citations: ["MCG 1309", "1317.5"],
    };
  }
}


