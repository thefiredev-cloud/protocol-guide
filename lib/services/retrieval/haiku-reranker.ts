/**
 * Haiku-based Re-ranker for Medic-Bot
 * Uses Claude 3.5 Haiku for fast, cost-effective document re-ranking
 */

import type { KBDoc } from "../../retrieval";

const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";
const HAIKU_MODEL = "claude-3-5-haiku-20241022";
const TIMEOUT_MS = 5000;

type HaikuResponse = {
  content: Array<{ type: string; text?: string }>;
  stop_reason?: string;
};

/**
 * HaikuReranker - Uses Claude Haiku to re-rank documents by relevance
 * Fast execution optimized for speed over accuracy
 */
export class HaikuReranker {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY || "";
    this.baseUrl = ANTHROPIC_BASE_URL;

    if (!this.apiKey) {
      console.warn("[HaikuReranker] No API key provided. Reranking will fall back to original order.");
    }
  }

  /**
   * Re-rank documents by relevance to query using Claude Haiku
   * @param query - User's search query
   * @param docs - Documents to re-rank
   * @param topK - Number of top documents to return
   * @returns Top K documents sorted by relevance score
   */
  async rerank(query: string, docs: KBDoc[], topK: number): Promise<KBDoc[]> {
    // Fallback to original order if no API key or no docs
    if (!this.apiKey || docs.length === 0) {
      return docs.slice(0, topK);
    }

    // If we have fewer docs than topK, no need to rerank
    if (docs.length <= topK) {
      return docs;
    }

    try {
      const scores = await this.scoreDocuments(query, docs);

      // Sort documents by score (descending) and return top K
      const rankedDocs = docs
        .map((doc, index) => ({ doc, score: scores[index] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((item) => item.doc);

      return rankedDocs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[HaikuReranker] Reranking failed, falling back to original order:", errorMessage);

      // Fallback to original order on error
      return docs.slice(0, topK);
    }
  }

  /**
   * Score each document's relevance to the query (1-10 scale)
   */
  private async scoreDocuments(query: string, docs: KBDoc[]): Promise<number[]> {
    const prompt = this.buildScoringPrompt(query, docs);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: HAIKU_MODEL,
          max_tokens: 200,
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
      const scores = this.parseScores(text, docs.length);

      return scores;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Build prompt for document scoring
   */
  private buildScoringPrompt(query: string, docs: KBDoc[]): string {
    const docSummaries = docs
      .map((doc, i) => {
        const preview = doc.content.slice(0, 300);
        return `Doc ${i + 1}: ${doc.title}\n${preview}...`;
      })
      .join("\n\n");

    return `You are a medical document relevance scorer for EMS/Paramedic protocols.

Query: "${query}"

Documents to score:
${docSummaries}

Rate each document's relevance to the query on a scale of 1-10 (10 = highly relevant, 1 = not relevant).
Consider:
- Medical terminology match
- Protocol relevance
- Treatment guidance applicability

Respond with ONLY a JSON array of scores, one per document:
[score1, score2, score3, ...]

Example: [9, 7, 3, 8, 2, 5]`;
  }

  /**
   * Parse scores from Haiku response
   */
  private parseScores(text: string, expectedCount: number): number[] {
    try {
      // Extract JSON array from response
      const match = text.match(/\[[\d,\s]+\]/);
      if (!match) {
        throw new Error("No JSON array found in response");
      }

      const scores = JSON.parse(match[0]) as number[];

      // Validate scores
      if (!Array.isArray(scores) || scores.length !== expectedCount) {
        throw new Error(`Expected ${expectedCount} scores, got ${scores.length}`);
      }

      // Ensure all scores are valid numbers between 1-10
      const validScores = scores.map((score) => {
        const num = Number(score);
        if (isNaN(num) || num < 1 || num > 10) {
          return 5; // Default to middle score on invalid values
        }
        return num;
      });

      return validScores;
    } catch (error) {
      console.error("[HaikuReranker] Failed to parse scores, using default scores:", error);

      // Fallback: return descending scores to preserve original order
      return Array.from({ length: expectedCount }, (_, i) => expectedCount - i);
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
