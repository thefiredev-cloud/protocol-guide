/**
 * Dextrose (D50, D25, D10) Calculator
 * LA County EMS Protocol Reference: TP 1203 (Diabetic Emergencies)
 * 
 * HIGH-PRIORITY SAFETY: Michigan study shows 75% error rate for pediatric dextrose.
 * Key error patterns: wrong concentration, wrong volume, wrong patient population.
 */

import { roundTo } from "../../../lib/dosing/math";
import { boundsValidator, PediatricBoundsValidator } from "../../../lib/dosing/safety/pediatric-bounds-validator";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
  SolutionConcentration,
} from "../../../lib/dosing/types";

const DEXTROSE_CONCENTRATIONS: Record<"d50" | "d25" | "d10", SolutionConcentration> = {
  d50: { amount: 0.5, amountUnit: "g", volume: 1, volumeUnit: "mL", label: "D50W (50% = 0.5g/mL)" },
  d25: { amount: 0.25, amountUnit: "g", volume: 1, volumeUnit: "mL", label: "D25W (25% = 0.25g/mL)" },
  d10: { amount: 0.1, amountUnit: "g", volume: 1, volumeUnit: "mL", label: "D10W (10% = 0.1g/mL)" },
};

const CITATIONS = ["TP 1203", "MCG 1309"];

export class DextroseCalculator implements MedicationCalculator {
  public readonly id = "dextrose";
  public readonly name = "Dextrose";
  public readonly aliases = ["d50", "d50w", "d25", "d25w", "d10", "d10w", "glucose", "dextrose 50%"];
  public readonly categories = ["Medication", "Metabolic", "MCG 1309"];

  private readonly validator = new PediatricBoundsValidator();

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const validation = this.validator.validateRequest(request);
    
    if (!validation.isValid) {
      return boundsValidator.createErrorResult(
        this.id,
        this.name,
        validation.error ?? "Invalid request",
        CITATIONS
      );
    }

    const weightKg = request.patientWeightKg!;
    const isNeonate = this.validator.isNeonate(request);
    const isPediatric = this.validator.isPediatric(request);
    const isAdult = this.validator.isAdult(request);

    const recommendations: MedicationDoseRecommendation[] = [];
    const warnings: string[] = [...validation.warnings];

    if (isNeonate) {
      recommendations.push(this.buildNeonateRecommendation(weightKg));
      warnings.push("NEONATE: Use D10W ONLY - higher concentrations cause hyperosmolar injury");
    } else if (isPediatric) {
      const ageYears = request.patientAgeYears ?? 5;
      recommendations.push(this.buildPediatricRecommendation(weightKg, ageYears));
      warnings.push("PEDIATRIC: Never use D50W - use age-appropriate concentration");
    } else if (isAdult) {
      recommendations.push(this.buildAdultRecommendation());
    } else {
      // Ambiguous age - provide both
      recommendations.push(this.buildAdultRecommendation());
      recommendations.push(this.buildPediatricRecommendation(weightKg, 10));
    }

    // Always add extravasation warning for IV dextrose
    warnings.push("ENSURE IV PATENCY - extravasation causes severe tissue necrosis");

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings,
      citations: CITATIONS,
    };
  }

  private buildAdultRecommendation(): MedicationDoseRecommendation {
    return {
      label: "Hypoglycemia (Adult)",
      route: "IV",
      dose: { quantity: 25, unit: "g" },
      concentration: DEXTROSE_CONCENTRATIONS.d50,
      maxSingleDose: { quantity: 25, unit: "g" },
      repeat: {
        intervalMinutes: 5,
        maxRepeats: 1,
        criteria: "Glucose remains <60mg/dL after recheck",
      },
      administrationNotes: [
        "Give IV push slowly over 1-2 minutes",
        "Volume: 50mL of D50W",
        "Recheck glucose 5 minutes after administration",
        "If no IV: give Glucagon 1mg IM",
        "Consider underlying cause (sepsis, overdose, adrenal insufficiency)",
      ],
      contraindications: [
        "Known corn allergy (rare)",
        "Avoid in suspected stroke until glucose confirmed <60mg/dL",
      ],
    };
  }

  private buildPediatricRecommendation(weightKg: number, ageYears: number): MedicationDoseRecommendation {
    const dosePerKg = 0.5; // 0.5g/kg (conservative)
    const maxDoseGrams = 25;
    const calculatedGrams = roundTo(weightKg * dosePerKg, 1);
    const finalDoseGrams = Math.min(calculatedGrams, maxDoseGrams);

    // Age-appropriate concentration selection
    const useD10 = ageYears < 2;
    const concentration = useD10 ? DEXTROSE_CONCENTRATIONS.d10 : DEXTROSE_CONCENTRATIONS.d25;
    const volumeML = roundTo(finalDoseGrams / concentration.amount, 0);

    const concentrationLabel = useD10 ? "D10W" : "D25W";
    const notes = [
      `Calculated: ${dosePerKg}g/kg × ${weightKg}kg = ${calculatedGrams}g`,
      `Volume: ${volumeML}mL of ${concentrationLabel}`,
      "Recheck glucose 5 minutes after administration",
      useD10 ? "D10W preferred for age <2 years" : "D25W for children ≥2 years",
      "If no IV/IO: give Glucagon 0.03mg/kg IM (max 1mg)",
    ];

    return {
      label: `Hypoglycemia (Pediatric, ${weightKg}kg)`,
      route: "IV",
      dose: { quantity: finalDoseGrams, unit: "g" },
      concentration,
      maxSingleDose: { quantity: maxDoseGrams, unit: "g" },
      repeat: {
        intervalMinutes: 5,
        maxRepeats: 1,
        criteria: "Glucose remains <60mg/dL after recheck",
      },
      administrationNotes: notes,
      contraindications: [
        "NEVER use D50W in pediatrics - too hyperosmolar",
        "D25W contraindicated in children <2 years",
      ],
    };
  }

  private buildNeonateRecommendation(weightKg: number): MedicationDoseRecommendation {
    const volumePerKg = 2; // 2mL/kg of D10W
    const volumeML = roundTo(weightKg * volumePerKg, 1);
    const doseGrams = roundTo(volumeML * 0.1, 2); // D10W = 0.1g/mL

    return {
      label: `Hypoglycemia (Neonate, ${weightKg}kg)`,
      route: "IV",
      dose: { quantity: doseGrams, unit: "g" },
      concentration: DEXTROSE_CONCENTRATIONS.d10,
      maxSingleDose: { quantity: 5, unit: "g" },
      repeat: {
        intervalMinutes: 5,
        maxRepeats: 1,
        criteria: "Glucose remains <40mg/dL after recheck",
      },
      administrationNotes: [
        `Calculated: ${volumePerKg}mL/kg × ${weightKg}kg = ${volumeML}mL`,
        "D10W ONLY for neonates",
        "Give slowly over 1-2 minutes",
        "Consider continuous D10W infusion after bolus",
        "Target glucose 40-100mg/dL in neonates",
      ],
      contraindications: [
        "NEVER use D25W or D50W in neonates",
        "Higher concentrations cause severe hyperosmolar injury",
      ],
    };
  }
}
