/**
 * Drug Identification Service
 *
 * Helps identify unknown medications based on pill appearance,
 * imprint codes, or patient descriptions.
 */

import type {
  DrugIdentificationMatch,
  DrugRecord,
  IdentificationQuery,
  IdentificationResult,
} from '../types';
import { DRUG_CLASS_KEYWORDS } from '../types';
import { getDrugDB } from '../storage/drug-database';

// ============================================================================
// SERVICE
// ============================================================================

export class DrugIdentificationService {
  /**
   * Identify a drug based on available information
   */
  async identifyDrug(query: IdentificationQuery): Promise<IdentificationResult> {
    const matches: DrugIdentificationMatch[] = [];

    // Search by imprint (highest confidence)
    if (query.imprint) {
      const imprintMatches = await this.searchByImprint(query.imprint);
      matches.push(...imprintMatches);
    }

    // Search by patient description
    if (query.patientDescription) {
      const descMatches = await this.searchByDescription(query.patientDescription);

      for (const match of descMatches) {
        const existing = matches.find((m) => m.drug.rxcui === match.drug.rxcui);
        if (existing) {
          // Boost score for multiple match types
          existing.matchScore += match.matchScore * 0.5;
          existing.matchedOn.push(...match.matchedOn);
        } else {
          matches.push(match);
        }
      }
    }

    // Filter by appearance if provided
    if (query.color || query.shape) {
      this.filterByAppearance(matches, query.color, query.shape);
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Take top 5 matches
    const topMatches = matches.slice(0, 5);
    const confidence = this.assessConfidence(topMatches);

    return {
      matches: topMatches,
      confidence,
      suggestion: this.buildSuggestion(topMatches, confidence, query),
    };
  }

  /**
   * Search by pill imprint code
   */
  private async searchByImprint(imprint: string): Promise<DrugIdentificationMatch[]> {
    const db = await getDrugDB();
    const normalizedImprint = imprint.toUpperCase().replace(/\s/g, '');
    const matches: DrugIdentificationMatch[] = [];

    // Search drugs that might match
    const searchResults = await db.searchDrugs(imprint, 20);

    for (const drug of searchResults) {
      if (drug.pillImprint) {
        const drugImprint = drug.pillImprint.toUpperCase().replace(/\s/g, '');

        if (drugImprint.includes(normalizedImprint) || normalizedImprint.includes(drugImprint)) {
          // High score for imprint match
          const exactMatch = drugImprint === normalizedImprint;
          matches.push({
            drug,
            matchScore: exactMatch ? 95 : 80,
            matchedOn: ['imprint'],
          });
        }
      }
    }

    return matches;
  }

  /**
   * Search by patient description (e.g., "blood pressure pill")
   */
  private async searchByDescription(description: string): Promise<DrugIdentificationMatch[]> {
    const db = await getDrugDB();
    const lowerDesc = description.toLowerCase();
    const matches: DrugIdentificationMatch[] = [];

    // Find matching drug classes
    const matchingClasses: string[] = [];
    for (const [keyword, classes] of Object.entries(DRUG_CLASS_KEYWORDS)) {
      if (lowerDesc.includes(keyword)) {
        matchingClasses.push(...classes);
      }
    }

    if (matchingClasses.length > 0) {
      // Get drugs by matching classes
      for (const drugClass of Array.from(new Set(matchingClasses))) {
        const classDrugs = await db.getDrugsByClass(drugClass);

        for (const drug of classDrugs.slice(0, 10)) {
          const existing = matches.find((m) => m.drug.rxcui === drug.rxcui);
          if (!existing) {
            // Weight by EMS relevance
            let score = 50;
            if (drug.emsRelevance === 'high') score += 20;
            else if (drug.emsRelevance === 'moderate') score += 10;

            matches.push({
              drug,
              matchScore: score,
              matchedOn: ['description', drugClass],
            });
          }
        }
      }
    } else {
      // Fallback to text search
      const searchResults = await db.searchDrugs(description, 10);
      for (const drug of searchResults) {
        matches.push({
          drug,
          matchScore: 40,
          matchedOn: ['search'],
        });
      }
    }

    return matches;
  }

  /**
   * Filter matches by appearance (color/shape)
   */
  private filterByAppearance(
    matches: DrugIdentificationMatch[],
    color?: string,
    shape?: string
  ): void {
    if (!color && !shape) return;

    const lowerColor = color?.toLowerCase();
    const lowerShape = shape?.toLowerCase();

    for (const match of matches) {
      const appearance = match.drug.appearance?.toLowerCase() || '';

      let boost = 0;
      const matchedOn: string[] = [];

      if (lowerColor && appearance.includes(lowerColor)) {
        boost += 10;
        matchedOn.push('color');
      }

      if (lowerShape && appearance.includes(lowerShape)) {
        boost += 10;
        matchedOn.push('shape');
      }

      if (boost > 0) {
        match.matchScore += boost;
        match.matchedOn.push(...matchedOn);
      } else if (lowerColor || lowerShape) {
        // Penalize if appearance doesn't match
        match.matchScore -= 5;
      }
    }
  }

  /**
   * Assess confidence level based on matches
   */
  private assessConfidence(
    matches: DrugIdentificationMatch[]
  ): IdentificationResult['confidence'] {
    if (matches.length === 0) {
      return 'none';
    }

    const topScore = matches[0].matchScore;

    if (topScore >= 90) {
      return 'high';
    }

    if (topScore >= 70) {
      return 'medium';
    }

    if (topScore >= 40) {
      return 'low';
    }

    return 'none';
  }

  /**
   * Build field-friendly suggestion
   */
  private buildSuggestion(
    matches: DrugIdentificationMatch[],
    confidence: IdentificationResult['confidence'],
    query: IdentificationQuery
  ): string {
    if (matches.length === 0 || confidence === 'none') {
      const hints: string[] = [];
      if (!query.imprint) hints.push('pill imprint');
      if (!query.patientDescription) hints.push('what it\'s used for');

      if (hints.length > 0) {
        return `Unable to identify. Try providing: ${hints.join(', ')}. Consider Base Hospital consult.`;
      }
      return 'Unable to identify medication. Recommend Base Hospital consult or photo documentation.';
    }

    const top = matches[0];
    const drugName = top.drug.displayName || top.drug.name;
    const drugClass = top.drug.drugClass;

    if (confidence === 'high') {
      return `LIKELY: ${drugName} (${drugClass})`;
    }

    if (confidence === 'medium') {
      const names = matches.slice(0, 3).map((m) => m.drug.displayName || m.drug.name);
      return `POSSIBLE: ${names.join(', ')}. Verify with patient or pharmacy.`;
    }

    // Low confidence
    return `LOW CONFIDENCE: May be ${drugName} (${drugClass}). Recommend verification.`;
  }
}

// ============================================================================
// RESPONSE FORMATTERS
// ============================================================================

/**
 * Format identification result for chat response
 */
export function formatIdentificationForChat(result: IdentificationResult): string {
  const lines: string[] = [];

  // Confidence header
  const confidenceLabels = {
    high: 'HIGH CONFIDENCE',
    medium: 'MEDIUM CONFIDENCE',
    low: 'LOW CONFIDENCE',
    none: 'UNABLE TO IDENTIFY',
  };

  lines.push(`**${confidenceLabels[result.confidence]}**`);
  lines.push('');

  if (result.matches.length === 0) {
    lines.push(result.suggestion);
    return lines.join('\n');
  }

  // Top match details
  const top = result.matches[0];
  const drugName = top.drug.displayName || top.drug.name;

  lines.push(`**${drugName}** - ${top.drug.drugClass}`);
  lines.push(`Matched on: ${top.matchedOn.join(', ')}`);
  lines.push('');

  // Field summary for top match
  if (top.drug.fieldSummary.length > 0) {
    for (const bullet of top.drug.fieldSummary.slice(0, 4)) {
      const prefix = bullet.type.toUpperCase();
      lines.push(`- ${prefix}: ${bullet.text}`);
    }
    lines.push('');
  }

  // Alternative matches
  if (result.matches.length > 1 && result.confidence !== 'high') {
    lines.push('Other possibilities:');
    for (const match of result.matches.slice(1, 4)) {
      const name = match.drug.displayName || match.drug.name;
      lines.push(`- ${name} (${match.drug.drugClass})`);
    }
    lines.push('');
  }

  lines.push(result.suggestion);

  return lines.join('\n');
}

/**
 * Format identification result for function call response
 */
export function formatIdentificationForFunction(
  result: IdentificationResult
): Record<string, unknown> {
  return {
    confidence: result.confidence,
    suggestion: result.suggestion,
    matches: result.matches.slice(0, 5).map((m) => ({
      drugName: m.drug.displayName || m.drug.name,
      genericName: m.drug.name,
      drugClass: m.drug.drugClass,
      matchScore: m.matchScore,
      matchedOn: m.matchedOn,
      brandNames: m.drug.brandNames.slice(0, 3),
    })),
    topMatch: result.matches.length > 0
      ? {
          drugName: result.matches[0].drug.displayName || result.matches[0].drug.name,
          drugClass: result.matches[0].drug.drugClass,
          fieldSummary: result.matches[0].drug.fieldSummary,
        }
      : null,
  };
}

// ============================================================================
// SINGLETON
// ============================================================================

let serviceInstance: DrugIdentificationService | null = null;

/**
 * Get the singleton DrugIdentificationService
 */
export function getDrugIdentificationService(): DrugIdentificationService {
  if (!serviceInstance) {
    serviceInstance = new DrugIdentificationService();
  }
  return serviceInstance;
}
