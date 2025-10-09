import type { KBDoc } from "@/lib/retrieval";
import type { TriageResult } from "@/lib/triage";

export type Citation = { title: string; category: string; subcategory?: string };

export class CitationService {
  public build(hits: KBDoc[], triage: TriageResult): Citation[] {
    const preferred = this.prioritizeProtocolHits(hits, triage.matchedProtocols?.[0]?.tp_code);
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


