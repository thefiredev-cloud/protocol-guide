/* eslint-disable unicorn/filename-case */
import { createDefaultMedicationManager } from "@/lib/dosing/registry";
import type { MedicationCalculationResult } from "@/lib/dosing/types";

export type GuardrailDetection = {
  pcmCitationsPresent: boolean;
  containsUnauthorizedMed: boolean;
  outsideScope: boolean;
  pediatricMarkerMissing: boolean;
  sceneSafetyConcern: boolean;
  unauthorizedMedications: string[];
  notes: string[];
};

export type GuardrailCorrection = {
  original: string;
  replacement: string;
  citations: string[];
};

export type GuardrailCheck = GuardrailDetection & {
  dosingIssues: string[];
  corrections: GuardrailCorrection[];
};

const UNAUTHORIZED_MEDICATIONS = ["lorazepam", "diazepam", "ativan", "valium"] as const;
const SCENE_SAFETY_TERMS = ["scene unsafe", "leave patient", "exit immediately", "retreat"] as const;
// TODO: Use PEDIATRIC_TERMS for enhanced pediatric-specific guardrails in future
// const PEDIATRIC_TERMS = ["pediatric", "child", "infant", "neonate", "mcg 1309", "color code"] as const;

export class GuardrailManager {
  private readonly medicationManager = createDefaultMedicationManager();

  public evaluate(text: string): GuardrailCheck {
    const lower = (text || "").toLowerCase();
    const notes: string[] = [];
    const dosingIssues: string[] = [];
    const corrections: GuardrailCorrection[] = [];

    const pcmCitationsPresent = /(protocol\s*\d{3,4}|reference\s*no\.?\s*\d{3,4}|mcg\s*\d{3,4})/.test(lower);
    if (!pcmCitationsPresent) notes.push("Missing explicit PCM citation.");

    const unauthorizedMedications = this.findUnauthorizedMedications(lower);
    const containsUnauthorizedMed = unauthorizedMedications.length > 0;
    if (containsUnauthorizedMed) {
      notes.push(`Contains non-LA County medication: ${unauthorizedMedications.join(", ")}.`);
    }

    const outsideScope = /(other counties|general medicine advice|non-ems)/.test(lower);
    if (outsideScope) notes.push("Potentially outside LA County EMS scope.");

    const pediatricMarkerMissing = this.detectPediatricGap(lower);
    if (pediatricMarkerMissing) {
      notes.push("Pediatric context detected without PCM pediatric marker (MCG 1309).");
    }

    const sceneSafetyConcern = this.detectSceneSafety(lower);
    if (sceneSafetyConcern) {
      notes.push("Scene safety guidance may be unsafe—review PCM Scene Safety flow.");
    }

    for (const finding of this.evaluateDosing(text)) {
      dosingIssues.push(finding.issue);
      corrections.push(finding.correction);
    }

    return {
      pcmCitationsPresent,
      containsUnauthorizedMed,
      outsideScope,
      pediatricMarkerMissing,
      sceneSafetyConcern,
      unauthorizedMedications,
      notes,
      dosingIssues,
      corrections,
    };
  }

  private evaluateDosing(text: string): Array<{ issue: string; correction: GuardrailCorrection }> {
    const findings: Array<{ issue: string; correction: GuardrailCorrection }> = [];
    const matches = Array.from(text.matchAll(/([A-Za-z]+)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|mEq)/g));

    for (const match of matches) {
      const med = match[1].toLowerCase();
      const quantity = Number(match[2]);
      const unit = match[3];
      const calculation = this.medicationManager.calculate(med, { patientWeightKg: 70, scenario: "guardrail" });
      if (!calculation) continue;

      const allowed = flattenRecommendations(calculation);
      const acceptable = allowed.some((recommendation) => recommendation.unit === unit && withinRange(quantity, recommendation.quantity));
      if (acceptable) continue;

      const issue = `${match[0]} outside PCM ranges.`;
      const replacement = allowed
        .map((recommendation) => `${recommendation.name.toLowerCase()} ${recommendation.route} ${recommendation.quantity} ${recommendation.unit}`)
        .join("; ");
      findings.push({
        issue,
        correction: { original: match[0], replacement, citations: calculation.citations },
      });
    }

    return findings;
  }

  private detectSceneSafety(text: string): boolean {
    return SCENE_SAFETY_TERMS.some((term) => text.includes(term));
  }

  private detectPediatricGap(text: string): boolean {
    const mentionsPediatric = /\b(pediatric|child|infant|neonate|age\s*(?:under|less than)\s*18)\b/.test(text);
    if (!mentionsPediatric) return false;
    // If pediatric mentioned but no explicit pediatric PCM marker like MCG 1309 or "color code", flag it.
    const hasMarker = /\b(mcg\s*1309|color\s*code|broslow|length-?based)\b/.test(text);
    return !hasMarker;
  }

  private findUnauthorizedMedications(text: string): string[] {
    return UNAUTHORIZED_MEDICATIONS.filter((med) => text.includes(med));
  }
}

function flattenRecommendations(result: MedicationCalculationResult) {
  return result.recommendations.map((rec) => ({
    name: result.medicationName,
    route: rec.route,
    quantity: rec.dose.quantity,
    unit: rec.dose.unit,
  }));
}

function withinRange(value: number, expected: number): boolean {
  const tolerance = expected * 0.15;
  return Math.abs(value - expected) <= Math.max(tolerance, 0.05);
}


