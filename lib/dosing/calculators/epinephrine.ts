import { mcgPerKgPerDose } from "../../../lib/dosing/math";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  MedicationDoseRecommendation,
  SolutionConcentration,
} from "../../../lib/dosing/types";

const EPINEPHRINE_CONCENTRATIONS: Record<"im" | "iv", SolutionConcentration> = {
  im: { amount: 1, amountUnit: "mg", volume: 1, volumeUnit: "mL", label: "1 mg/mL (1:1,000)" },
  iv: { amount: 0.1, amountUnit: "mg", volume: 1, volumeUnit: "mL", label: "0.1 mg/mL (1:10,000)" },
};

type BuildRecOpts = {
  label: string;
  route: MedicationDoseRecommendation["route"];
  quantity: number;
  unit: MedicationDoseRecommendation["dose"]["unit"];
  repeat?: number;
  maxRepeats?: number;
  notes?: string[];
};

function buildRecommendation(opts: BuildRecOpts): MedicationDoseRecommendation {
  const recommendation: MedicationDoseRecommendation = {
    label: opts.label,
    route: opts.route,
    dose: { quantity: opts.quantity, unit: opts.unit },
    concentration:
      opts.route === "IM"
        ? EPINEPHRINE_CONCENTRATIONS.im
        : opts.route === "Neb"
          ? undefined
          : EPINEPHRINE_CONCENTRATIONS.iv,
    administrationNotes: opts.notes,
  };
  if (opts.repeat) {
    recommendation.repeat = { intervalMinutes: opts.repeat, maxRepeats: opts.maxRepeats };
  }
  return recommendation;
}

export class EpinephrineCalculator implements MedicationCalculator {
  public readonly id = "epinephrine";
  public readonly name = "Epinephrine";
  public readonly aliases = ["epi", "adrenaline"];
  public readonly categories = ["Medication", "MCG 1309"];

  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    const ctx = buildDoseContext(request);
    const warnings: string[] = [];
    const recommendations: MedicationDoseRecommendation[] = [];

    if (ctx.imNeeded) recommendations.push(...calcIMAnaphylaxis(ctx));
    if (ctx.ivNeeded) {
      recommendations.push(...calcCardiacArrest(ctx));
      const push = calcPushDose(ctx);
      if (push.warning) warnings.push(push.warning);
      recommendations.push(push.rec);
    }
    if (ctx.nebNeeded) recommendations.push(...calcNebStridor());
    if (ctx.bronchospasmIM) recommendations.push(...calcBronchospasmIM(ctx));

    return {
      medicationId: this.id,
      medicationName: this.name,
      recommendations,
      warnings,
      citations: ["MCG 1309", "1317.17"],
    };
  }

}

type DoseContext = {
  weightKg: number;
  age: number;
  isAdult: boolean;
  sbp: number;
  scenario: string;
  route?: MedicationDoseRecommendation["route"];
  imNeeded: boolean;
  ivNeeded: boolean;
  nebNeeded: boolean;
  bronchospasmIM: boolean;
};

function buildDoseContext(request: MedicationCalculationRequest): DoseContext {
  const weightKg = request.patientWeightKg ?? 70;
  const age = request.patientAgeYears ?? 30;
  const isAdult = age >= 15 || weightKg >= 45;
  const sbp = request.systolicBP ?? 80;
  const scenario = (request.scenario || "").toLowerCase();
  const route = request.route as DoseContext["route"] | undefined;

  const flags = computeRouteFlags(route, scenario);
  return { weightKg, age, isAdult, sbp, scenario, route, ...flags };
}

function computeRouteFlags(
  route: DoseContext["route"] | undefined,
  scenario: string,
): Pick<DoseContext, "imNeeded" | "ivNeeded" | "nebNeeded" | "bronchospasmIM"> {
  const has = (token: string) => scenario.includes(token);
  return {
    imNeeded: !route || route === "IM" || has("anaphylaxis"),
    ivNeeded: !route || route === "IV" || has("arrest"),
    nebNeeded: !route || route === "Neb" || has("stridor"),
    bronchospasmIM: !route || route === "IM" || has("bronchospasm"),
  };
}

function calcIMAnaphylaxis(ctx: DoseContext): MedicationDoseRecommendation[] {
  const dose = ctx.isAdult ? 0.5 : mcgPerKgPerDose(ctx.weightKg, 0.01, 0.3, 2);
  const notes = ["Administer in lateral thigh", "Maximum total 3 doses, 10 min apart"];
  return [buildRecommendation({ label: "Anaphylaxis IM", route: "IM", quantity: dose, unit: "mg", repeat: 10, maxRepeats: 2, notes })];
}

function calcCardiacArrest(ctx: DoseContext): MedicationDoseRecommendation[] {
  const doseMg = ctx.isAdult ? 1 : mcgPerKgPerDose(ctx.weightKg, 0.01, 1, 2);
  return [buildRecommendation({ label: "Cardiac Arrest IV/IO", route: "IV", quantity: doseMg, unit: "mg", repeat: 5 })];
}

function calcPushDose(ctx: DoseContext): { rec: MedicationDoseRecommendation; warning?: string } {
  const warning = ctx.sbp < 70 ? "Push-dose epi requires cautious titration; SBP <70." : undefined;
  return {
    warning,
    rec: {
      label: "Push-Dose (Hypotension/Rosc)",
      route: "IV",
      dose: { quantity: 10, unit: "mcg" },
      concentration: { amount: 0.1, amountUnit: "mg", volume: 10, volumeUnit: "mL", label: "10 mcg/mL mixture" },
      repeat: { intervalMinutes: 1, criteria: "Titrate to SBP > 90" },
      administrationNotes: ["Prepare by mixing 9 mL NS with 1 mL of 0.1 mg/mL (1:10,000) solution."],
    },
  };
}

function calcNebStridor(): MedicationDoseRecommendation[] {
  return [
    {
      label: "Airway Swelling (Neb)",
      route: "Neb",
      dose: { quantity: 5, unit: "mg" },
      administrationNotes: ["Use 1 mg/mL concentration", "Repeat x1 in 10 min prn"],
    },
  ];
}

function calcBronchospasmIM(ctx: DoseContext): MedicationDoseRecommendation[] {
  const doseMg = ctx.isAdult ? 0.5 : mcgPerKgPerDose(ctx.weightKg, 0.01, 0.3, 2);
  return [buildRecommendation({ label: "Severe Bronchospasm IM", route: "IM", quantity: doseMg, unit: "mg", repeat: 10, maxRepeats: 2 })];
}


