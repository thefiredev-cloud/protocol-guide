import { KnowledgeBaseManager } from "../../lib/storage/knowledge-base-manager";

export type MedicationReference = {
  id: string;
  name: string;
  aliases: string[];
  categories: string[];
};

export async function buildMedicationIndex(): Promise<MedicationReference[]> {
  const manager = new KnowledgeBaseManager();
  const docs = await manager.load();
  const medications = docs.filter((doc) => isMedicationDoc(doc));

  const index = new Map<string, MedicationReference>();
  for (const doc of medications) {
    const canonical = canonicalName(doc.title);
    const existing = index.get(canonical);
    const aliases = collectAliases(existing?.aliases, doc.keywords, canonical);
    const categories = collectCategories(existing?.categories, doc.category, doc.subcategory);
    index.set(canonical, { id: doc.id, name: canonical, aliases, categories });
  }

  return Array.from(index.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function isMedicationDoc(doc: { category: string; subcategory?: string | null; title: string }): boolean {
  const category = doc.category.toLowerCase();
  const subcategory = (doc.subcategory || "").toLowerCase();
  const title = doc.title.toLowerCase();
  return (
    category.includes("medication") ||
    category.includes("drug") ||
    title.includes("drug reference") ||
    subcategory.includes("mcg 1309")
  );
}

function canonicalName(title: string): string {
  return title.replace(/^(drug reference\s*[-–]\s*)/i, "").trim();
}

function equalsIgnoreCase(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
}

function collectAliases(existing: string[] | undefined, keywords: string[] | undefined, canonical: string): string[] {
  const set = new Set<string>(existing ?? []);
  for (const keyword of keywords ?? []) {
    const clean = keyword.trim();
    if (clean && !equalsIgnoreCase(clean, canonical)) set.add(clean);
  }
  return Array.from(set);
}

function collectCategories(existing: string[] | undefined, category: string, subcategory?: string | null): string[] {
  const set = new Set<string>(existing ?? []);
  set.add(category);
  if (subcategory) set.add(subcategory);
  return Array.from(set);
}


