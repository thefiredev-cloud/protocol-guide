import type { DoseUnit, MedicationCalculationRequest, MedicationCalculationResult, MedicationCalculator } from "../../../lib/dosing/types";

export class PralidoximeCalculator implements MedicationCalculator {
  public readonly id = "pralidoxime";
  public readonly name = "Pralidoxime Chloride";
  public readonly aliases = ["duodote", "2pam"];
  public readonly categories = ["Medication", "MCG 1309"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const weightKg = request.patientWeightKg ?? 70;
    const isAdult = weightKg >= 36 || (request.patientAgeYears ?? 0) >= 15;
    const pediatricCategory = weightKg < 36 ? determinePedsCategory(weightKg) : null;

    const recommendations: MedicationCalculationResult["recommendations"] = [];

    recommendations.push({
      label: "Mild Exposure",
      route: "IM",
      dose: { quantity: 1, unit: "DuoDote" as unknown as DoseUnit },
      administrationNotes: ["Administer sequentially with atropine"],
    });
    recommendations.push({
      label: "Moderate Exposure",
      route: "IM",
      dose: { quantity: 2, unit: "DuoDote" as unknown as DoseUnit },
      administrationNotes: ["Administer back-to-back"],
    });
    recommendations.push({
      label: "Severe Exposure",
      route: "IM",
      dose: { quantity: 3, unit: "DuoDote" as unknown as DoseUnit },
      administrationNotes: ["Administer sequentially; reassess"],
    });

    if (!isAdult && pediatricCategory) {
      recommendations.push({
        label: "Pediatric Dosing",
        route: "IM",
        dose: { quantity: 1, unit: pediatricCategory as unknown as DoseUnit },
        administrationNotes: ["Refer to Broselow/length-based tape", "Provide atropine per weight"],
      });
    }

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings: [],
      citations: ["MCG 1309", "1317.37"],
    };
  }
}

function determinePedsCategory(weightKg: number): string {
  if (weightKg < 7) return "Atropine 0.05 mg/kg + consult";
  if (weightKg <= 18) return "Mark I Jr. (600 mg)";
  if (weightKg <= 36) return "Auto-injector 2 mg";
  return "Adult dose";
}


