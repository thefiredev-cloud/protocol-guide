/**
 * Drug Interaction Checker
 *
 * Checks for drug-drug interactions between multiple patient medications.
 * Returns severity-categorized alerts with field management advice.
 */

import type {
  DrugInteraction,
  DrugRecord,
  InteractionAlert,
  InteractionCheckResult,
  InteractionSeverity,
} from '../types';
import { getDrugDB } from '../storage/drug-database';

// ============================================================================
// SERVICE
// ============================================================================

export class DrugInteractionChecker {
  /**
   * Check interactions between multiple patient medications
   */
  async checkInteractions(
    medications: string[],
    includeMinor = false
  ): Promise<InteractionCheckResult> {
    const db = await getDrugDB();

    // Resolve medication names to drug records
    const drugs: DrugRecord[] = [];
    const unresolved: string[] = [];

    for (const med of medications) {
      const normalized = med.toLowerCase().trim();
      let drug = await db.getDrugByName(normalized);

      if (!drug) {
        // Try search
        const results = await db.searchDrugs(med, 1);
        drug = results[0];
      }

      if (drug) {
        drugs.push(drug);
      } else {
        unresolved.push(med);
      }
    }

    if (drugs.length < 2) {
      return {
        hasInteractions: false,
        majorInteractions: [],
        moderateInteractions: [],
        minorInteractions: [],
        summary: this.buildInsufficientDataSummary(drugs.length, unresolved),
      };
    }

    // Check all pairs for interactions
    const alerts: InteractionAlert[] = [];

    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const drugA = drugs[i];
        const drugB = drugs[j];

        // Check interaction in database
        const interaction = await db.checkInteractionPair(drugA.rxcui, drugB.rxcui);

        if (interaction) {
          alerts.push(this.interactionToAlert(interaction, drugA, drugB));
        }

        // Also check via interactionRxcuis array
        if (drugA.interactionRxcuis.includes(drugB.rxcui)) {
          // Only add if we didn't find it in DB
          if (!interaction) {
            alerts.push({
              drugA: drugA.displayName || drugA.name,
              drugB: drugB.displayName || drugB.name,
              severity: 'moderate',
              mechanism: 'Potential interaction identified',
              management: 'Monitor patient closely',
            });
          }
        }
      }
    }

    // Categorize by severity
    const major = alerts.filter((a) => a.severity === 'major');
    const moderate = alerts.filter((a) => a.severity === 'moderate');
    const minor = alerts.filter((a) => a.severity === 'minor');

    return {
      hasInteractions: alerts.length > 0,
      majorInteractions: major,
      moderateInteractions: moderate,
      minorInteractions: includeMinor ? minor : [],
      summary: this.buildSummary(major, moderate, minor, unresolved),
    };
  }

  /**
   * Quick check if any major interactions exist
   */
  async hasMajorInteractions(medications: string[]): Promise<boolean> {
    const result = await this.checkInteractions(medications);
    return result.majorInteractions.length > 0;
  }

  /**
   * Convert database interaction to alert
   */
  private interactionToAlert(
    interaction: DrugInteraction,
    drugA: DrugRecord,
    drugB: DrugRecord
  ): InteractionAlert {
    return {
      drugA: drugA.displayName || drugA.name,
      drugB: drugB.displayName || drugB.name,
      severity: interaction.severity,
      mechanism: interaction.mechanism,
      management: interaction.management,
    };
  }

  /**
   * Build summary for insufficient data
   */
  private buildInsufficientDataSummary(
    resolvedCount: number,
    unresolved: string[]
  ): string {
    if (resolvedCount === 0) {
      return 'No medications could be identified. Please verify medication names.';
    }

    if (resolvedCount === 1) {
      const parts = ['Only one medication identified - need at least two to check interactions.'];
      if (unresolved.length > 0) {
        parts.push(`Unrecognized: ${unresolved.join(', ')}`);
      }
      return parts.join(' ');
    }

    return 'Insufficient data to check interactions.';
  }

  /**
   * Build field-friendly summary
   */
  private buildSummary(
    major: InteractionAlert[],
    moderate: InteractionAlert[],
    minor: InteractionAlert[],
    unresolved: string[]
  ): string {
    const parts: string[] = [];

    if (major.length === 0 && moderate.length === 0 && minor.length === 0) {
      parts.push('No significant interactions detected');
    } else {
      if (major.length > 0) {
        parts.push(`MAJOR: ${major.length} interaction(s) - REQUIRES ATTENTION`);
      }
      if (moderate.length > 0) {
        parts.push(`MODERATE: ${moderate.length} interaction(s) - monitor patient`);
      }
      if (minor.length > 0) {
        parts.push(`MINOR: ${minor.length} interaction(s) - awareness only`);
      }
    }

    if (unresolved.length > 0) {
      parts.push(`Note: Could not identify: ${unresolved.join(', ')}`);
    }

    return parts.join('. ');
  }
}

// ============================================================================
// RESPONSE FORMATTERS
// ============================================================================

/**
 * Format interaction check result for chat response
 */
export function formatInteractionsForChat(result: InteractionCheckResult): string {
  const lines: string[] = [];

  // Header
  if (result.majorInteractions.length > 0) {
    lines.push('**INTERACTION ALERT**');
    lines.push('');
  }

  // Major interactions (always show first)
  for (const alert of result.majorInteractions) {
    lines.push(`**MAJOR: ${alert.drugA} + ${alert.drugB}**`);
    lines.push(`- Mechanism: ${alert.mechanism}`);
    lines.push(`- FIELD ACTION: ${alert.management}`);
    lines.push('');
  }

  // Moderate interactions
  for (const alert of result.moderateInteractions) {
    lines.push(`**MODERATE: ${alert.drugA} + ${alert.drugB}**`);
    lines.push(`- ${alert.mechanism}`);
    lines.push(`- Monitor: ${alert.management}`);
    lines.push('');
  }

  // Minor interactions (if included)
  if (result.minorInteractions.length > 0) {
    lines.push('Minor interactions:');
    for (const alert of result.minorInteractions) {
      lines.push(`- ${alert.drugA} + ${alert.drugB}: ${alert.mechanism}`);
    }
    lines.push('');
  }

  // Summary
  lines.push(result.summary);

  return lines.join('\n');
}

/**
 * Format interaction check result for function call response
 */
export function formatInteractionsForFunction(
  result: InteractionCheckResult
): Record<string, unknown> {
  return {
    hasInteractions: result.hasInteractions,
    summary: result.summary,
    majorInteractions: result.majorInteractions.map((a) => ({
      drugs: [a.drugA, a.drugB],
      severity: a.severity,
      mechanism: a.mechanism,
      management: a.management,
    })),
    moderateInteractions: result.moderateInteractions.map((a) => ({
      drugs: [a.drugA, a.drugB],
      severity: a.severity,
      mechanism: a.mechanism,
      management: a.management,
    })),
    minorCount: result.minorInteractions.length,
  };
}

// ============================================================================
// SINGLETON
// ============================================================================

let serviceInstance: DrugInteractionChecker | null = null;

/**
 * Get the singleton DrugInteractionChecker
 */
export function getDrugInteractionChecker(): DrugInteractionChecker {
  if (!serviceInstance) {
    serviceInstance = new DrugInteractionChecker();
  }
  return serviceInstance;
}
