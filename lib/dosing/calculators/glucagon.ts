/**
 * Glucagon Calculator
 * LA County EMS Protocol Reference: TP 1203 (Diabetic Emergencies), TP 1241 (Overdose)
 * 
 * HIGH-PRIORITY SAFETY: Michigan study shows 75% error rate for pediatric glucagon.
 * Key error patterns: wrong dose by weight, wrong route selection.
 */

import { roundTo } from "@/lib/dosing/math";
import { boundsValidator, PediatricBoundsValidator } from "@/lib/dosing/safety/pediatric-bounds-validator";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
  SolutionConcentration,
} from "@/lib/dosing/types";

const GLUCAGON_CONCENTRATION: SolutionConcentration = {
  amount: 1, amountUnit: "mg", volume: 1, volumeUnit: "mL",
  label: "1mg/mL (reconstitute with provided diluent)",
};

const CITATIONS = ["TP 1203", "TP 1241", "MCG 1309"];
const STANDARD_WARNINGS = [
  "Less effective if glycogen stores depleted (alcoholism, starvation, prolonged hypoglycemia)",
  "May cause nausea/vomiting - position patient appropriately",
  "IV/IO dextrose preferred when vascular access available",
];

export class GlucagonCalculator implements MedicationCalculator {
  public readonly id = "glucagon";
  public readonly name = "Glucagon";
  public readonly aliases = ["glucagen", "baqsimi", "gvoke"];
  public readonly categories = ["Medication", "Metabolic", "MCG 1309"];

  private readonly validator = new PediatricBoundsValidator();

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const validation = this.validator.validateRequest(request);
    if (!validation.isValid) {
      return boundsValidator.createErrorResult(this.id, this.name, validation.error ?? "Invalid request", CITATIONS);
    }

    const { recommendations, warnings } = this.buildRecommendations(request, validation.warnings);
    return { medicationId: this.id, medicationName: this.name, recommendations, warnings, citations: CITATIONS };
  }

  private buildRecommendations(request: MedicationCalculationRequest, baseWarnings: string[]) {
    const weightKg = request.patientWeightKg!;
    const isPediatric = this.validator.isPediatric(request);
    const isAdult = this.validator.isAdult(request);
    const scenario = (request.scenario ?? "").toLowerCase();
    const isBetaBlockerOD = scenario.includes("beta") || scenario.includes("overdose") || scenario.includes("toxicity");

    const recommendations: MedicationDoseRecommendation[] = [];

    if (isAdult) {
      recommendations.push(buildAdultHypoglycemiaIM(), buildAdultHypoglycemiaIN());
    } else if (isPediatric) {
      recommendations.push(buildPediatricHypoglycemiaIM(weightKg), buildPediatricHypoglycemiaIN(weightKg));
    } else {
      recommendations.push(buildAdultHypoglycemiaIM(), buildPediatricHypoglycemiaIM(weightKg));
    }

    if ((isBetaBlockerOD || !scenario) && (isAdult || !isPediatric)) {
      recommendations.push(buildBetaBlockerODDosing());
    }

    return { recommendations, warnings: [...baseWarnings, ...STANDARD_WARNINGS] };
  }
}

function buildAdultHypoglycemiaIM(): MedicationDoseRecommendation {
  return {
    label: "Hypoglycemia IM/SubQ (Adult)",
    route: "IM",
    dose: { quantity: 1, unit: "mg" },
    concentration: GLUCAGON_CONCENTRATION,
    maxSingleDose: { quantity: 1, unit: "mg" },
    repeat: { intervalMinutes: 15, maxRepeats: 1, criteria: "No response after 15 minutes and no IV access available" },
    administrationNotes: [
      "Use when IV access cannot be obtained",
      "Inject into deltoid, lateral thigh, or buttock",
      "Onset: 10-20 minutes (slower than IV dextrose)",
      "Recheck glucose in 15-20 minutes",
      "Give oral glucose when patient can safely swallow",
    ],
  };
}

function buildAdultHypoglycemiaIN(): MedicationDoseRecommendation {
  return {
    label: "Hypoglycemia IN (Adult - Baqsimi)",
    route: "IN",
    dose: { quantity: 3, unit: "mg" },
    maxSingleDose: { quantity: 3, unit: "mg" },
    repeat: { intervalMinutes: 15, maxRepeats: 1, criteria: "No response after 15 minutes" },
    administrationNotes: [
      "Baqsimi: single-use nasal device",
      "Insert into one nostril, press plunger fully",
      "Do not inhale - drug absorbed through nasal mucosa",
      "Onset: 10-20 minutes",
      "Give oral glucose when patient alert and able to swallow",
    ],
  };
}

function buildPediatricHypoglycemiaIM(weightKg: number): MedicationDoseRecommendation {
  const dosePerKg = 0.03;
  const maxDoseMg = 1;
  const calculatedDose = roundTo(weightKg * dosePerKg, 2);
  const finalDose = Math.min(calculatedDose, maxDoseMg);
  const fixedDose = weightKg < 25 ? 0.5 : 1;

  return {
    label: `Hypoglycemia IM/SubQ (Pediatric, ${weightKg}kg)`,
    route: "IM",
    dose: { quantity: finalDose, unit: "mg" },
    concentration: GLUCAGON_CONCENTRATION,
    maxSingleDose: { quantity: maxDoseMg, unit: "mg" },
    repeat: { intervalMinutes: 15, maxRepeats: 1, criteria: "No response after 15 minutes and no IV/IO access available" },
    administrationNotes: [
      `Calculated: ${dosePerKg}mg/kg × ${weightKg}kg = ${calculatedDose}mg`,
      `Alternative fixed dosing: ${fixedDose}mg (${weightKg < 25 ? "<25kg" : "≥25kg"})`,
      "Use when IV/IO access unavailable",
      "Inject into lateral thigh",
      "Onset: 10-20 minutes",
      "Recheck glucose in 15-20 minutes",
    ],
  };
}

function buildPediatricHypoglycemiaIN(weightKg: number): MedicationDoseRecommendation {
  const isApproved = weightKg >= 16;
  return {
    label: `Hypoglycemia IN (Pediatric, ${weightKg}kg - Baqsimi)`,
    route: "IN",
    dose: { quantity: 3, unit: "mg" },
    maxSingleDose: { quantity: 3, unit: "mg" },
    repeat: { intervalMinutes: 15, maxRepeats: 1, criteria: "No response after 15 minutes" },
    administrationNotes: [
      "Baqsimi: approved for children ≥4 years old",
      "Single-use nasal device",
      "Insert into one nostril, press plunger fully",
      "Do not inhale - absorbed through nasal mucosa",
      isApproved ? "Age-appropriate for this patient" : "⚠️ Not FDA-approved for children <4 years - consider IM route",
    ],
    contraindications: isApproved ? [] : ["Not FDA-approved for children <4 years"],
  };
}

function buildBetaBlockerODDosing(): MedicationDoseRecommendation {
  return {
    label: "Beta-Blocker/CCB Overdose (Adult)",
    route: "IV",
    dose: { quantity: 5, unit: "mg" },
    concentration: GLUCAGON_CONCENTRATION,
    maxSingleDose: { quantity: 10, unit: "mg" },
    maxTotalDose: { quantity: 10, unit: "mg" },
    repeat: { intervalMinutes: 5, maxRepeats: 1, criteria: "Persistent bradycardia/hypotension" },
    administrationNotes: [
      "Initial: 3-5mg IV push over 1-2 minutes",
      "May repeat up to 10mg total",
      "Consider infusion: 2-5mg/hour after initial bolus",
      "Works independently of beta-receptor blockade",
      "BASE HOSPITAL CONTACT REQUIRED for this indication",
    ],
    contraindications: ["Pheochromocytoma (relative)", "Insulinoma (may cause rebound hypoglycemia)"],
  };
}
