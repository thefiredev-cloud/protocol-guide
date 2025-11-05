import * as fs from "fs";
import * as path from "path";

import { PediatricDoseCalculator } from "@/lib/clinical/pediatric-dose-calculator";
import { createLogger } from "@/lib/log";
import { EnvironmentManager } from "@/lib/managers/environment-manager";
import { extractPediatricWeightMedQueries } from "@/lib/parsers/pediatric-weight-med";
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

type ProtocolMetadata = {
  id: string;
  title: string | null;
  category: string | null;
  protocolCodes: string[] | null;
  baseContact: {
    required: boolean;
    criteria: string | null;
    scenarios: string[] | null;
  };
  positioning: {
    position: string;
    context: string | null;
  } | null;
  transport: Array<{
    destination: string;
    criteria: string | null;
  }> | null;
  warnings: string[] | null;
  contraindications: string[] | null;
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
  private metadataCache: ProtocolMetadata[] | null = null;

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

    // Inject critical protocol metadata for ALL retrieved protocols
    const criticalMetadata = this.extractCriticalMetadata(hits);
    if (criticalMetadata) {
      context = criticalMetadata + "\n\n" + context;
    }

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
   * Extract and format critical metadata from retrieved protocol chunks
   * This ensures Base Hospital Contact, positioning, transport, etc. are always included
   */
  private extractCriticalMetadata(hits: KBDoc[]): string | null {
    if (!this.metadataCache) {
      this.loadMetadata();
    }

    if (!this.metadataCache) return null;

    const elements: string[] = [];
    const processedIds = new Set<string>();

    // Extract primary protocol codes from top 3 hits for relevance filtering
    const primaryProtocols = new Set<string>();
    for (let i = 0; i < Math.min(3, hits.length); i++) {
      const protocolMatch = hits[i].title?.match(/\b(1[2-3]\d{2})\b/) ||
                           hits[i].content?.match(/\bTP\s*(\d{4})\b/);
      if (protocolMatch) {
        primaryProtocols.add(protocolMatch[1]);
      }
    }

    // Known base contact required protocols from Ref 1200.2
    const knownRequiredProtocols = new Set([
      '1219', // Anaphylaxis
      '1210', // Cardiac Arrest
      '1215', // Childbirth
      '1229', // Altered LOC (certain conditions)
      '1232', // Stroke/CVA/TIA
      '1220', // Respiratory Failure (certain conditions)
      '1244', // Traumatic Injury (certain conditions)
    ]);

    for (const hit of hits) {
      if (processedIds.has(hit.id)) continue;
      processedIds.add(hit.id);

      const metadata = this.metadataCache.find((m) => m.id === hit.id);
      if (!metadata) continue;

      // Only extract metadata from protocols relevant to the query
      const isRelevant = !metadata.protocolCodes ||
                        metadata.protocolCodes.some(code => {
                          // Normalize code (remove leading '10' if present in metadata)
                          const normalizedCode = code.replace(/^10(\d{2})$/, '1$1');
                          return primaryProtocols.has(normalizedCode) ||
                                 primaryProtocols.has(code);
                        });

      if (!isRelevant) continue;

      // Base Hospital Contact - validate against Ref 1200.2
      if (metadata.baseContact.required) {
        // Only include if protocol is known to require base contact
        const protocolRequiresBase = metadata.protocolCodes?.some(code =>
          knownRequiredProtocols.has(code) ||
          knownRequiredProtocols.has(code.replace(/^10(\d{2})$/, '1$1'))
        );

        if (protocolRequiresBase) {
          const criteria = metadata.baseContact.criteria || "";
          const scenarios = metadata.baseContact.scenarios?.join(", ") || "";
          elements.push(
            `BASE HOSPITAL CONTACT REQUIRED${criteria ? `: ${criteria}` : ""}${scenarios ? ` (${scenarios})` : ""}`
          );
        }
      }

      // Positioning
      if (metadata.positioning) {
        elements.push(
          `POSITIONING: ${metadata.positioning.position}${metadata.positioning.context ? ` - ${metadata.positioning.context}` : ""}`
        );
      }

      // Transport Destination
      if (metadata.transport && metadata.transport.length > 0) {
        for (const t of metadata.transport) {
          elements.push(
            `TRANSPORT: ${t.destination}${t.criteria ? ` - ${t.criteria}` : ""}`
          );
        }
      }

      // Time-Sensitive Warnings
      if (metadata.warnings && metadata.warnings.length > 0) {
        for (const warning of metadata.warnings) {
          // Clean up the warning text
          const cleanWarning = warning.replace(/\*\*/g, "").replace(/\n/g, " ").trim();
          if (cleanWarning.length > 10) {
            elements.push(`WARNING: ${cleanWarning}`);
          }
        }
      }

      // Contraindications
      if (metadata.contraindications && metadata.contraindications.length > 0) {
        for (const ci of metadata.contraindications) {
          elements.push(`CONTRAINDICATION: ${ci}`);
        }
      }
    }

    if (elements.length === 0) return null;

    return `CRITICAL PROTOCOL ELEMENTS:\n${elements.map((e) => `- ${e}`).join("\n")}\n---`;
  }

  /**
   * Load protocol metadata from JSON file
   */
  private loadMetadata(): void {
    try {
      const metadataPath = path.join(process.cwd(), "data", "protocol-metadata.json");
      if (fs.existsSync(metadataPath)) {
        const data = fs.readFileSync(metadataPath, "utf-8");
        this.metadataCache = JSON.parse(data) as ProtocolMetadata[];
        this.logger.debug("Protocol metadata loaded", { count: this.metadataCache.length });
      } else {
        this.logger.warn("Protocol metadata file not found", { path: metadataPath });
      }
    } catch (error) {
      this.logger.error("Failed to load protocol metadata", { error });
    }
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


