import { PediatricDoseCalculator } from "@/lib/clinical/pediatric-dose-calculator";
import { extractPediatricWeightMedQueries } from "@/lib/parsers/pediatric-weight-med";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { createLogger } from "@/lib/log";
import type { KBDoc } from "@/lib/retrieval";
import { buildContext, searchKB } from "@/lib/retrieval";
import { MarkdownPreprocessor } from "@/lib/services/chat/markdown-preprocessor";
import type { TriageResult } from "@/lib/triage";

export type RetrievalQuery = {
  rawText: string;
  triage?: TriageResult;
  maxChunks?: number;
  useMarkdown?: boolean; // Optional flag to enable markdown preprocessing
};

export type RetrievalResult = {
  context: string; // Render-ready concatenated context
  hits: KBDoc[];   // Raw docs in case callers need more control
};

/**
 * RetrievalManager centralizes KB query expansion and context assembly.
 * It wraps existing retrieval utilities to keep the API surface stable and testable.
 */
// eslint-disable-next-line unicorn/filename-case
export class RetrievalManager {
  private readonly defaultLimit: number;
  private readonly markdownPreprocessor: MarkdownPreprocessor;
  private readonly env: ReturnType<typeof EnvironmentManager.load>;
  private readonly logger = createLogger("RetrievalManager");

  constructor(options?: { defaultLimit?: number }) {
    this.defaultLimit = options?.defaultLimit ?? 6;
    this.markdownPreprocessor = new MarkdownPreprocessor();
    this.env = EnvironmentManager.loadSafe();
  }

  public async search(query: RetrievalQuery): Promise<RetrievalResult> {
    const limit = query.maxChunks ?? this.defaultLimit;
    const useMarkdown = query.useMarkdown ?? this.env.enableMarkdownPreprocessing;

    let context = await buildContext(query.rawText, limit);
    const hits = await searchKB(query.rawText, limit);

    // Inject pediatric dosing section when query contains weight + medication pattern(s)
    const extracted = extractPediatricWeightMedQueries(query.rawText);
    if (extracted.length) {
      const pedLines = buildPediatricLines(extracted);
      context = pedLines + context;
    }

    // Convert to markdown if enabled
    if (useMarkdown) {
      context = this.convertToMarkdown(context, hits);
    }

    return { context, hits };
  }

  /**
   * Convert context and hits to markdown format
   */
  private convertToMarkdown(context: string, hits: KBDoc[]): string {
    try {
      // Build markdown from hits
      const markdownContext = this.markdownPreprocessor.buildContextMarkdown(hits);

      // Preserve pediatric dosing section if present
      const pediatricSection = context.match(/\*\*PEDIATRIC WEIGHT-BASED DOSING[\s\S]*?---/);
      const pediatricPrefix = pediatricSection ? `${pediatricSection[0]}\n\n` : "";

      // Combine pediatric section with markdown context
      return pediatricPrefix + markdownContext;
    } catch (error) {
      // Fallback to original context if markdown conversion fails
      this.logger.warn("Markdown conversion failed, using original context", { error });
      return context;
    }
  }
}

function buildPediatricLines(
  items: Array<{ medicationKey: string; weightKg: number }>,
): string {
  const lines: string[] = ["**PEDIATRIC WEIGHT-BASED DOSING (LA County MCG 1309):**"];
  for (const item of items) {
    const result = PediatricDoseCalculator.calculate({ medicationKey: item.medicationKey, weightKg: item.weightKg });
    if (!result) continue;
    const citationText = result.citations.join(", ");
    lines.push(`• ${result.summaryLine}`);
    if (result.notes?.length) lines.push(`  Notes: ${result.notes.join("; ")}`);
    lines.push(`  Citations: ${citationText}`);
  }
  lines.push("---\n");
  return lines.join("\n");
}


