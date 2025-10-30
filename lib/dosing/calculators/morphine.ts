import { mgPerKgPerDose } from "@/lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
} from "@/lib/dosing/types";

export class MorphineCalculator implements MedicationCalculator {
  public readonly id = "morphine";
  public readonly name = "Morphine";
  public readonly aliases = [];
  public readonly categories = ["Medication", "Analgesia"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const age = request.patientAgeYears ?? 30;
    const isAdult = age >= 15 || weightKg >= 45;

    // Adult: 4mg IV/IO/IM, repeat every 5 min prn
    // Max total dose prior to Base contact: 12mg
    // Contact Base for additional: may repeat for max total 20mg
    const adultDose = 4; // mg
    
    // Pediatric: 0.1mg/kg IV/IO/IM, repeat in 5 min x1
    // Maximum 2 total doses prior to Base contact
    // Contact Base for additional: may repeat for max 4 total doses
    const pediatricDose = mgPerKgPerDose(weightKg, 0.1, undefined, 2);

    const recommendations: MedicationDoseRecommendation[] = [
      {
        label: "Analgesia IV/IO/IM",
        route: "IV",
        dose: { quantity: isAdult ? adultDose : pediatricDose, unit: "mg" },
        repeat: { 
          intervalMinutes: 5, 
          maxRepeats: isAdult ? 2 : 1, // Adult: 2 repeats (3 total), Pediatric: 1 repeat (2 total)
          criteria: "Pain persists; monitor for respiratory depression" 
        },
        maxTotalDose: { 
          quantity: isAdult ? 12 : pediatricDose * 2, // Adult: 12mg before Base, Pediatric: 2 doses before Base
          unit: "mg" 
        },
        administrationNotes: [
          "Slow IV/IO push or IM",
          isAdult 
            ? "Contact Base for additional dosing after 12mg (max total 20mg)"
            : "Contact Base for additional dosing after 2 doses (max total 4 doses)",
          "Monitor respiratory status closely",
        ],
      },
    ];

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings: [],
      citations: ["MCG 1309", "1317.27"],
    };
  }
}

