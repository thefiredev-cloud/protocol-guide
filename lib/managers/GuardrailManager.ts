/* eslint-disable unicorn/filename-case */
import { createDefaultMedicationManager } from "../../lib/dosing/registry";
import type { MedicationCalculationResult } from "../../lib/dosing/types";
import {
  extractProtocolCodes,
  isValidProtocol,
  normalizeProtocolCode,
} from "../../lib/protocols/la-county-protocol-whitelist";

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

    const protocolValidation = this.validateProtocolNumbers(text);
    const medValidation = this.validateMedicationFormulary(text);
    const dosing = this.evaluateDosing(text);

    this.addProtocolNotes(protocolValidation, notes);
    this.addMedicationNotes(medValidation, notes);

    const outsideScope = /(other counties|general medicine advice|non-ems)/.test(lower);
    const pediatricMarkerMissing = this.detectPediatricGap(lower);
    const sceneSafetyConcern = this.detectSceneSafety(lower);

    if (outsideScope) notes.push("Potentially outside LA County EMS scope.");
    if (pediatricMarkerMissing) notes.push("Pediatric context without MCG 1309.");
    if (sceneSafetyConcern) notes.push("Scene safety concern—review PCM.");

    return {
      pcmCitationsPresent: protocolValidation.citationsFound,
      containsUnauthorizedMed: medValidation.unauthorized.length > 0,
      outsideScope,
      pediatricMarkerMissing,
      sceneSafetyConcern,
      unauthorizedMedications: medValidation.unauthorized,
      notes,
      dosingIssues: dosing.map((d) => d.issue),
      corrections: dosing.map((d) => d.correction),
    };
  }

  private addProtocolNotes(
    validation: { citationsFound: boolean; invalidProtocols: string[] },
    notes: string[],
  ): void {
    if (!validation.citationsFound) notes.push("Missing explicit PCM citation.");
    if (validation.invalidProtocols.length > 0) {
      notes.push(`CRITICAL: Invalid protocols: ${validation.invalidProtocols.join(", ")}`);
    }
  }

  private addMedicationNotes(
    validation: { unauthorized: string[]; brandNames: string[] },
    notes: string[],
  ): void {
    if (validation.unauthorized.length > 0) {
      notes.push(`CRITICAL: Non-LA County meds: ${validation.unauthorized.join(", ")}`);
    }
    if (validation.brandNames.length > 0) {
      notes.push(`Use generic names: ${validation.brandNames.join(", ")}`);
    }
  }

  /**
   * Validate protocol numbers against LA County whitelist.
   * Uses auto-generated whitelist from official LA County DHS documents.
   */
  private validateProtocolNumbers(text: string): {
    citationsFound: boolean;
    invalidProtocols: string[];
    validProtocols: string[];
  } {
    // Extract all protocol codes from text using whitelist utilities
    const extractedCodes = extractProtocolCodes(text);

    const validProtocols: string[] = [];
    const invalidProtocols: string[] = [];

    for (const code of extractedCodes) {
      const normalized = normalizeProtocolCode(code);
      if (isValidProtocol(normalized)) {
        validProtocols.push(normalized);
        continue;
      }
      // Only flag as invalid if it looks like a protocol number
      const looksLikeProtocol = /^1[0-3]\d{2}/.test(normalized) || /^[2-8]\d{2}/.test(normalized);
      if (looksLikeProtocol) invalidProtocols.push(code);
    }

    return {
      citationsFound: validProtocols.length > 0,
      invalidProtocols,
      validProtocols,
    };
  }

  /**
   * Validate medications against LA County formulary
   */
  private validateMedicationFormulary(text: string): {
    unauthorized: string[];
    brandNames: string[];
  } {
    const unauthorized: string[] = [];
    const brandNames: string[] = [];

    // Check for explicitly unauthorized medications
    const strictlyBanned = ["lorazepam", "ativan", "diazepam", "valium", "xanax", "alprazolam"];
    for (const med of strictlyBanned) {
      const regex = new RegExp(`\\b${med}\\b`, 'i');
      if (regex.test(text)) {
        unauthorized.push(med);
      }
    }

    // Check for brand names that should be generic
    const brandMappings: Record<string, string> = {
      "narcan": "naloxone",
      "versed": "midazolam",
      "benadryl": "diphenhydramine",
      "zofran": "ondansetron",
      "toradol": "ketorolac",
    };

    for (const [brand, generic] of Object.entries(brandMappings)) {
      const regex = new RegExp(`\\b${brand}\\b`, 'i');
      if (regex.test(text)) {
        brandNames.push(`${brand} → ${generic}`);
      }
    }

    return { unauthorized, brandNames };
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


