/**
 * Advanced Scoring Engine
 * 
 * Enhances basic weighted keyword scoring with:
 * 1. Negative keyword detection (downweight denied symptoms)
 * 2. Demographic-aware adjustments (age/sex/pregnancy)
 * 3. Severity amplifiers (severe vs mild)
 * 4. Multi-symptom pattern matching (clinical signatures)
 * 5. Vital signs integration (abnormal vitals boost protocols)
 */

import { getKeywordWeight } from "./keyword-weights";
import { detectProtocolSignature } from "./protocol-signatures";
import { getDemographicModifier, type DemographicProfile } from "./demographic-modifiers";
import type { Vitals } from "@/lib/triage/parsers/vitals";

export interface AdvancedScoringContext {
  lowerText: string;
  demographics: DemographicProfile;
  vitals: Vitals;
  keywords: Set<string>;
}

export class AdvancedScoringEngine {
  /**
   * Calculate advanced score for a protocol
   */
  public scoreProtocol(
    context: AdvancedScoringContext,
    protocolCode: string,
    baseScore: number
  ): number {
    let score = baseScore;

    // Layer 1: Negative keyword penalties
    score += this.applyNegativeKeywordPenalties(context.lowerText, context.keywords);

    // Layer 2: Severity amplifiers
    score = this.applySeverityAmplifiers(context.lowerText, score);

    // Layer 3: Multi-symptom signature bonuses
    score += detectProtocolSignature(context.lowerText, protocolCode);

    // Layer 4: Demographic modifiers
    score *= getDemographicModifier(protocolCode, context.demographics);

    // Layer 5: Vital signs modifiers
    score *= this.getVitalSignsModifier(context.vitals, protocolCode);

    return Math.max(0, score); // Never negative
  }

  /**
   * Detect negated keywords and apply penalties
   * Patterns: "no [symptom]", "denies [symptom]", "without [symptom]", "negative for [symptom]"
   */
  private applyNegativeKeywordPenalties(lowerText: string, keywords: Set<string>): number {
    let penalty = 0;

    // Negation patterns - capture up to 3 words to handle multi-word symptoms
    const negationPatterns = [
      /\bno\s+(\w+(?:\s+\w+){0,2})\b/gi,
      /\bdenies?\s+(\w+(?:\s+\w+){0,2})\b/gi,
      /\bwithout\s+(\w+(?:\s+\w+){0,2})\b/gi,
      /\bnegative\s+for\s+(\w+(?:\s+\w+){0,2})\b/gi,
      /\babsence\s+of\s+(\w+(?:\s+\w+){0,2})\b/gi,
    ];

    for (const pattern of negationPatterns) {
      let match;
      while ((match = pattern.exec(lowerText)) !== null) {
        const negatedTerm = match[1].trim();
        
        // Check exact match in keywords
        if (keywords.has(negatedTerm)) {
          const weight = getKeywordWeight(negatedTerm);
          penalty -= weight * 2.0; // Aggressive penalty (200%)
        } else {
          // Check if any individual word from negated term is in keywords
          const words = negatedTerm.split(/\s+/);
          for (const word of words) {
            if (keywords.has(word) && word.length > 3) {
              const weight = getKeywordWeight(word);
              penalty -= weight * 1.5; // Moderate penalty for partial match
            }
          }
        }
      }
    }

    return penalty;
  }

  /**
   * Apply severity modifiers based on intensity words
   * "severe", "acute", "sudden", "crushing" → amplify
   * "mild", "minor", "slight" → reduce
   */
  private applySeverityAmplifiers(lowerText: string, score: number): number {
    const severeTerms = [
      "severe",
      "acute",
      "sudden",
      "crushing",
      "critical",
      "extreme",
      "intense",
      "excruciating",
    ];
    const mildTerms = ["mild", "minor", "slight", "minimal"];

    const hasSevere = severeTerms.some((term) => lowerText.includes(term));
    const hasMild = mildTerms.some((term) => lowerText.includes(term));

    if (hasSevere && !hasMild) {
      return score * 1.4; // Amplify by 40%
    } else if (hasMild && !hasSevere) {
      return score * 0.6; // Reduce by 40%
    }

    return score;
  }

  /**
   * Calculate vital signs modifier based on abnormal values
   */
  private getVitalSignsModifier(vitals: Vitals, protocolCode: string): number {
    let multiplier = 1.0;

    // Hypotension (SBP <90) → boost shock/sepsis/cardiac protocols
    if (vitals.systolic !== undefined && vitals.systolic < 90) {
      if (["1207", "1207-P", "1204", "1204-P", "1211", "1211-P"].includes(protocolCode)) {
        multiplier *= 1.5;
      }
    }

    // Hypoxia (SpO2 <90) → boost respiratory protocols
    if (vitals.spo2 !== undefined && vitals.spo2 < 90) {
      if (["1237", "1237-P", "1236", "1236-P", "1234", "1234-P", "1214", "1214-P"].includes(protocolCode)) {
        multiplier *= 1.4;
      }
    }

    // Tachycardia (HR >120 adult, >160 pediatric) → boost cardiac/shock/sepsis
    if (vitals.heartRate !== undefined) {
      const isTachycardic = vitals.heartRate > 120; // Simplified, could be age-adjusted
      if (isTachycardic) {
        if (["1213", "1213-P", "1207", "1207-P", "1204", "1204-P", "1211", "1211-P"].includes(protocolCode)) {
          multiplier *= 1.3;
        }
      }
    }

    // Bradycardia (HR <50) → boost bradycardia protocols
    if (vitals.heartRate !== undefined && vitals.heartRate < 50) {
      if (["1212", "1212-P"].includes(protocolCode)) {
        multiplier *= 1.6;
      }
    }

    // Fever (temp >100.4°F or 38°C) → boost sepsis/fever protocols
    const hasFever =
      (vitals.temperatureF !== undefined && vitals.temperatureF > 100.4) ||
      (vitals.temperatureC !== undefined && vitals.temperatureC > 38);
    if (hasFever) {
      if (["1204", "1204-P"].includes(protocolCode)) {
        multiplier *= 1.4;
      }
    }

    // Tachypnea (RR >24 adult) → boost respiratory protocols
    if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate > 24) {
      if (["1237", "1237-P", "1236", "1236-P", "1234", "1234-P"].includes(protocolCode)) {
        multiplier *= 1.2;
      }
    }

    // Hypoglycemia (glucose <60) → boost diabetic protocols
    if (vitals.glucose !== undefined && vitals.glucose < 60) {
      if (["1203", "1203-P"].includes(protocolCode)) {
        multiplier *= 1.8;
      }
    }

    return multiplier;
  }
}

