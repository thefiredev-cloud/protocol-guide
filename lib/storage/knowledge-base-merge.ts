import type { KnowledgeBaseAsset } from "@/lib/storage/knowledge-base-manager";

export function mergeKnowledgeBases(primary: KnowledgeBaseAsset[], supplemental: KnowledgeBaseAsset[]): KnowledgeBaseAsset[] {
  const byId = new Map<string, KnowledgeBaseAsset>();
  for (const doc of primary) byId.set(doc.id, doc);
  for (const doc of supplemental) {
    const existing = byId.get(doc.id);
    if (!existing) {
      byId.set(doc.id, doc);
      continue;
    }
    // Merge content by concatenation with separator; prefer supplemental fields if present.
    byId.set(doc.id, {
      id: existing.id,
      title: doc.title || existing.title,
      category: doc.category || existing.category,
      subcategory: doc.subcategory || existing.subcategory,
      keywords: Array.from(new Set([...(existing.keywords || []), ...(doc.keywords || [])])),
      content: `${existing.content}\n\n--- Supplemental ---\n\n${doc.content}`,
    });
  }
  return Array.from(byId.values());
}


