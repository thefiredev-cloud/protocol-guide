/**
 * Drug Lookup Service
 *
 * Provides drug information lookup by name (brand or generic).
 * Returns compact, field-friendly summaries for paramedic use.
 *
 * IMPORTANT: LA County scope enforcement is applied at lookup level.
 * Unauthorized medications (ketamine, etc.) are blocked and alternatives suggested.
 */

import type {
  DrugLookupResult,
  DrugRecord,
  FieldSummaryBullet,
} from '../types';
import { isInLACountyFormulary } from '../types';
import { getDrugDB } from '../storage/drug-database';
import {
  isLACountyUnauthorized,
  getUnauthorizedReplacement,
  isLACountyAuthorized,
} from '../../formulary/la-county-formulary';

// ============================================================================
// SERVICE
// ============================================================================

export class DrugLookupService {
  /**
   * Look up a drug by name (brand or generic)
   * Applies LA County scope enforcement - unauthorized medications are blocked
   */
  async lookupDrug(query: string, enforceScope = true): Promise<DrugLookupResult> {
    const db = await getDrugDB();
    const normalizedQuery = query.toLowerCase().trim();

    // SCOPE CHECK: Block unauthorized medications early
    if (enforceScope && isLACountyUnauthorized(normalizedQuery)) {
      const replacement = getUnauthorizedReplacement(normalizedQuery);
      return {
        found: false,
        scopeBlocked: true,
        scopeMessage: `${query.toUpperCase()} is NOT authorized in LA County EMS protocols.${
          replacement ? ` Use ${replacement} instead.` : ''
        }`,
        suggestions: replacement ? [replacement.split(' ')[0]] : [],
      };
    }

    // Try exact match by generic name first
    let drug = await db.getDrugByName(normalizedQuery);
    let normalizedFrom: string | undefined;

    if (drug) {
      return this.buildResult(drug);
    }

    // Search for matches
    const searchResults = await db.searchDrugs(query, 5);

    if (searchResults.length === 0) {
      // No matches found
      const suggestions = await this.getSuggestions(query);
      return {
        found: false,
        suggestions,
      };
    }

    // Check if top result is a brand name match
    const topResult = searchResults[0];
    const isBrandMatch = topResult.brandNames.some(
      (brand) => brand.toLowerCase() === normalizedQuery
    );

    if (isBrandMatch) {
      normalizedFrom = query;
    }

    return this.buildResult(topResult, normalizedFrom);
  }

  /**
   * Look up multiple drugs at once
   */
  async lookupDrugs(queries: string[]): Promise<DrugLookupResult[]> {
    return Promise.all(queries.map((q) => this.lookupDrug(q)));
  }

  /**
   * Get drug by RxCUI (exact lookup)
   */
  async getDrugByRxCUI(rxcui: string): Promise<DrugRecord | undefined> {
    const db = await getDrugDB();
    return db.getDrug(rxcui);
  }

  /**
   * Search drugs by query
   */
  async searchDrugs(query: string, limit = 10): Promise<DrugRecord[]> {
    const db = await getDrugDB();
    return db.searchDrugs(query, limit);
  }

  /**
   * Build result object from drug record
   */
  private buildResult(
    drug: DrugRecord,
    normalizedFrom?: string
  ): DrugLookupResult {
    return {
      found: true,
      drug,
      fieldBullets: this.formatFieldBullets(drug.fieldSummary),
      normalizedFrom,
    };
  }

  /**
   * Format field summary bullets for display
   */
  private formatFieldBullets(bullets: FieldSummaryBullet[]): string[] {
    const prefixes: Record<FieldSummaryBullet['type'], string> = {
      use: 'USE:',
      warning: 'WARNING:',
      dose: 'DOSE:',
      interaction: 'INTERACTION:',
      reversal: 'REVERSAL:',
    };

    return bullets.map((b) => `${prefixes[b.type]} ${b.text}`);
  }

  /**
   * Get suggestions for unknown drug
   */
  private async getSuggestions(query: string): Promise<string[]> {
    const db = await getDrugDB();
    const results = await db.searchDrugs(query, 3);
    return results.map((r) => r.displayName || r.name);
  }
}

// ============================================================================
// RESPONSE FORMATTERS
// ============================================================================

/**
 * Format drug lookup result for chat response
 */
export function formatDrugLookupForChat(result: DrugLookupResult): string {
  // Handle scope-blocked medications first
  if (result.scopeBlocked && result.scopeMessage) {
    return `⚠️ ${result.scopeMessage}`;
  }

  if (!result.found || !result.drug) {
    if (result.suggestions && result.suggestions.length > 0) {
      return `Drug not found. Did you mean: ${result.suggestions.join(', ')}?`;
    }
    return 'Drug not found in database. Recommend Base Hospital consult for unknown medication.';
  }

  const drug = result.drug;
  const lines: string[] = [];

  // Header
  const displayName = drug.displayName || drug.name;
  if (result.normalizedFrom) {
    lines.push(`**${result.normalizedFrom.toUpperCase()}** (${displayName}) - ${drug.drugClass}`);
  } else {
    lines.push(`**${displayName.toUpperCase()}** - ${drug.drugClass}`);
  }

  lines.push('');

  // Field bullets
  if (result.fieldBullets && result.fieldBullets.length > 0) {
    for (const bullet of result.fieldBullets) {
      lines.push(`- ${bullet}`);
    }
  } else {
    lines.push(`- CLASS: ${drug.drugClass}`);
    if (drug.brandNames.length > 0) {
      lines.push(`- BRANDS: ${drug.brandNames.slice(0, 3).join(', ')}`);
    }
  }

  lines.push('');

  // LA County formulary status
  const inFormulary = drug.laCountyFormulary || isInLACountyFormulary(drug.name);
  lines.push(`LA County Formulary: ${inFormulary ? 'Yes' : 'No'}`);

  // EMS relevance
  if (drug.emsRelevance === 'high') {
    lines.push('EMS Relevance: HIGH');
  }

  return lines.join('\n');
}

/**
 * Format drug lookup result for function call response
 */
export function formatDrugLookupForFunction(result: DrugLookupResult): Record<string, unknown> {
  // Handle scope-blocked medications
  if (result.scopeBlocked) {
    return {
      found: false,
      scopeBlocked: true,
      error: result.scopeMessage || 'Medication not authorized in LA County EMS',
      suggestions: result.suggestions || [],
    };
  }

  if (!result.found || !result.drug) {
    return {
      found: false,
      error: 'Drug not found',
      suggestions: result.suggestions || [],
    };
  }

  const drug = result.drug;

  return {
    found: true,
    drugName: drug.displayName || drug.name,
    genericName: drug.name,
    normalizedFrom: result.normalizedFrom,
    drugClass: drug.drugClass,
    brandNames: drug.brandNames.slice(0, 5),
    fieldBullets: result.fieldBullets,
    laCountyFormulary: drug.laCountyFormulary || isInLACountyFormulary(drug.name),
    emsRelevance: drug.emsRelevance,
    schedule: drug.schedule,
  };
}

// ============================================================================
// SINGLETON
// ============================================================================

let serviceInstance: DrugLookupService | null = null;

/**
 * Get the singleton DrugLookupService
 */
export function getDrugLookupService(): DrugLookupService {
  if (!serviceInstance) {
    serviceInstance = new DrugLookupService();
  }
  return serviceInstance;
}
