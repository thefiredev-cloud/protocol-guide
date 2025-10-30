import type { KBDoc } from "@/lib/retrieval";
import type { TriageResult } from "@/lib/triage";

export type Citation = { title: string; category: string; subcategory?: string };

export class CitationService {
  public build(hits: KBDoc[], triage: TriageResult): Citation[] {
    // Filter to only include protocols in top 3 matches
    const topProtocolCodes = new Set(
      triage.matchedProtocols.slice(0, 3).map((p) => p.tp_code)
    );
    
    // Filter hits to only include relevant protocols
    const relevantHits = hits.filter((doc) => {
      // Extract protocol codes from document title (e.g., "1236", "1242-P")
      const protocolMatch = doc.title.match(/\b(\d{4})(?:-P)?\b/);
      if (!protocolMatch) {
        // Keep non-protocol documents (like MCG references)
        return true;
      }
      const docProtocolCode = protocolMatch[1];
      return topProtocolCodes.has(docProtocolCode);
    });
    
    // Prioritize hits matching the top protocol
    const preferred = this.prioritizeProtocolHits(
      relevantHits,
      triage.matchedProtocols?.[0]?.tp_code
    );
    
    // Build unique citation list (max 4)
    return preferred.reduce<Citation[]>((acc, doc) => {
      if (acc.length >= 4 || acc.some((c) => c.title === doc.title)) return acc;
      acc.push({ title: doc.title, category: doc.category, subcategory: doc.subcategory });
      return acc;
    }, []);
  }

  private prioritizeProtocolHits(hits: KBDoc[], bestCode?: string): KBDoc[] {
    if (!bestCode) return hits;
    const regex = new RegExp(`\\b${bestCode}\\b`);
    const preferred = hits.filter((h) => regex.test(h.title));
    const others = hits.filter((h) => !regex.test(h.title));
    return [...preferred, ...others];
  }
}


