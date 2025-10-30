import { mcgPerKgPerDose } from "@/lib/dosing/math";
import type { MedicationCalculationRequest, MedicationCalculationResult, MedicationCalculator, MedicationDoseRecommendation } from "@/lib/dosing/types";

export class FentanylCalculator implements MedicationCalculator {
  public readonly id = "fentanyl";
  public readonly name = "Fentanyl";
  public readonly aliases = ["sublimaze"];
  public readonly categories = ["Medication", "Analgesia"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const isAdult = (request.patientAgeYears ?? 0) >= 15 || weightKg >= 45;

    const adultDose = 50; // mcg
    const pediatricDoseIV = mcgPerKgPerDose(weightKg, 1, 50, 0); // 1 mcg/kg IV/IO/IM
    const pediatricDoseIN = mcgPerKgPerDose(weightKg, 1.5, undefined, 1); // 1.5 mcg/kg IN

    const recommendations: MedicationDoseRecommendation[] = [
      {
        label: "Analgesia IV/IO/IM",
        route: "IV",
        dose: { quantity: isAdult ? adultDose : pediatricDoseIV, unit: "mcg" },
        repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Pain persists; monitor for respiratory depression" },
        maxTotalDose: { quantity: isAdult ? 150 : pediatricDoseIV * 2, unit: "mcg" },
        administrationNotes: [
          "Slow IV/IO push or IM",
          isAdult 
            ? "Contact Base for additional dosing after 150mcg (max total 250mcg)"
            : "Contact Base for additional dosing after 2 doses (max total 4 doses)",
          "Titrate slowly", 
          "Monitor respiratory status"
        ],
      },
      {
        label: "IN",
        route: "IN",
        dose: { quantity: isAdult ? 50 : pediatricDoseIN, unit: "mcg" },
        repeat: { intervalMinutes: 5, maxRepeats: 1 },
        maxTotalDose: { quantity: isAdult ? 150 : pediatricDoseIN * 2, unit: "mcg" },
        administrationNotes: [
          "Divide dose between nares",
          isAdult 
            ? "Contact Base for additional dosing after 150mcg (max total 250mcg)"
            : "Contact Base for additional dosing after 2 doses (max total 4 doses)",
        ],
      },
    ];

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings: [],
      citations: ["MCG 1309", "1317.19"],
    };
  }
}


