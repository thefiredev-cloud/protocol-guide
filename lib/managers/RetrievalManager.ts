/* eslint-disable unicorn/filename-case */
import { PediatricDoseCalculator } from "@/lib/clinical/pediatric-dose-calculator";
import { extractPediatricWeightMedQueries } from "@/lib/parsers/pediatric-weight-med";
import type { KBDoc } from "@/lib/retrieval";
import { buildContext, searchKB } from "@/lib/retrieval";
import type { TriageResult } from "@/lib/triage";

export type RetrievalQuery = {
  rawText: string;
  triage?: TriageResult;
  maxChunks?: number;
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

  constructor(options?: { defaultLimit?: number }) {
    this.defaultLimit = options?.defaultLimit ?? 6;
  }

  public async search(query: RetrievalQuery): Promise<RetrievalResult> {
    const limit = query.maxChunks ?? this.defaultLimit;
    let context = await buildContext(query.rawText, limit);
    const hits = await searchKB(query.rawText, limit);

    // Inject pediatric dosing section when query contains weight + medication pattern(s)
    const extracted = extractPediatricWeightMedQueries(query.rawText);
    if (extracted.length) {
      const pedLines = buildPediatricLines(extracted);
      context = pedLines + context;
    }
    return { context, hits };
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


