/* eslint-disable unicorn/filename-case */
export type ResearchQuery = {
  question: string;
  scope?: string[]; // e.g., ["LA County EMS", "TCA overdose", "hyperkalemia"]
};

export type ResearchHit = {
  title: string;
  url: string;
  published?: string;
  snippet?: string;
  score?: number;
};

/**
 * Research manager for external web searches.
 * Currently returns empty results as external research is disabled.
 * Future: integrate Hyperbrowser SDK/client or other research APIs.
 */
export class ResearchManager {
  /**
   * Search external sources for research.
   * Currently disabled - returns empty array.
   *
   * @returns Empty array until external research is enabled
   */
  async search(): Promise<ResearchHit[]> {
    // External research disabled for now
    // Future integration points:
    // 1. Hyperbrowser SDK for web research
    // 2. PubMed API for medical literature
    // 3. JEMS/EMS journals
    // 4. CDC/WHO guidelines
    return [];
  }

  /**
   * Check if research is available
   * @returns false - research is currently disabled
   */
  isAvailable(): boolean {
    return false;
  }
}
