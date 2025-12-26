/**
 * Haiku-based Query Expander for Medic-Bot
 * Uses Claude 3.5 Haiku to expand queries with medical variations
 */

const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";
const HAIKU_MODEL = "claude-3-5-haiku-20241022";
const TIMEOUT_MS = 5000;

type HaikuResponse = {
  content: Array<{ type: string; text?: string }>;
  stop_reason?: string;
};

/**
 * QueryExpander - Uses Claude Haiku to expand queries with medical variations
 * Generates alternative phrasings to improve retrieval coverage
 */
export class QueryExpander {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY || "";
    this.baseUrl = ANTHROPIC_BASE_URL;

    if (!this.apiKey) {
      console.warn("[QueryExpander] No API key provided. Expansion will fall back to original query.");
    }
  }

  /**
   * Expand query into alternative medical phrasings
   * @param query - Original user query
   * @returns Array of expanded queries (includes original + 3 variations)
   */
  async expand(query: string): Promise<string[]> {
    // Fallback to original query if no API key
    if (!this.apiKey) {
      return [query];
    }

    try {
      const variations = await this.generateVariations(query);

      // Return original query + variations (max 4 total)
      return [query, ...variations].slice(0, 4);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[QueryExpander] Expansion failed, falling back to original query:", errorMessage);

      // Fallback to original query on error
      return [query];
    }
  }

  /**
   * Generate query variations using Haiku
   */
  private async generateVariations(query: string): Promise<string[]> {
    const prompt = this.buildExpansionPrompt(query);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: HAIKU_MODEL,
          max_tokens: 100,
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Haiku API error ${response.status}: ${text}`);
      }

      const body = (await response.json()) as HaikuResponse;
      const text = this.extractText(body);
      const variations = this.parseVariations(text);

      return variations;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Build prompt for query expansion
   */
  private buildExpansionPrompt(query: string): string {
    return `You are a medical query expander for EMS/Paramedic search.

Original query: "${query}"

Generate 3 alternative phrasings using:
- Medical terminology (e.g., "heart attack" → "myocardial infarction", "STEMI")
- Protocol codes (e.g., "chest pain" → "protocol 1211")
- Treatment terms (e.g., "seizure" → "benzodiazepine", "midazolam")
- Layman terms → Medical terms and vice versa

Respond with ONLY a JSON array of 3 alternative queries:
["alternative 1", "alternative 2", "alternative 3"]

Example: ["myocardial infarction STEMI", "protocol 1211 cardiac chest pain", "nitroglycerin aspirin"]`;
  }

  /**
   * Parse variations from Haiku response
   */
  private parseVariations(text: string): string[] {
    try {
      // Extract JSON array from response
      const match = text.match(/\[([\s\S]*?)\]/);
      if (!match) {
        throw new Error("No JSON array found in response");
      }

      const variations = JSON.parse(`[${match[1]}]`) as string[];

      // Validate variations
      if (!Array.isArray(variations) || variations.length === 0) {
        throw new Error("Invalid variations format");
      }

      // Filter to valid strings only, limit to 3
      const validVariations = variations
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .slice(0, 3);

      return validVariations;
    } catch (error) {
      console.error("[QueryExpander] Failed to parse variations:", error);

      // Fallback: return empty array
      return [];
    }
  }

  /**
   * Extract text from Haiku response
   */
  private extractText(response: HaikuResponse): string {
    const textBlocks = response.content.filter((block) => block.type === "text");
    return textBlocks.map((block) => block.text || "").join("\n");
  }

  /**
   * Build request headers
   */
  private buildHeaders(): Record<string, string> {
    return {
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    };
  }
}
