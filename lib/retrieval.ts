import MiniSearch from "minisearch";

import provider_impressions from "@/data/provider_impressions.json"; // Provider Impressions mapping
import { KnowledgeBaseManager } from "@/lib/storage/knowledge-base-manager";

export type KBDoc = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  content: string;
};

type SynonymRule = {
  patterns: RegExp[];
  expansions: string[];
};

const SYNONYM_RULES: readonly SynonymRule[] = [
  {
    patterns: [
      /\bsodium\s*bi\s*carb\b/,
      /\bbicarb\b/,
      /\bbi\s*carb\b/,
      /\bnahco3\b/,
    ],
    expansions: ["sodium bicarbonate"],
  },
  {
    patterns: [/\bcrush\b/],
    expansions: ["crush injury 1242", "crush syndrome", "hyperkalemia", "sodium bicarbonate"],
  },
  {
    patterns: [/\b(tca|tricyclic)\b/],
    expansions: ["tricyclic overdose", "qrs widening", "sodium bicarbonate"],
  },
  {
    patterns: [/\bhyperk\b/, /\bhyperkalemi\w*/],
    expansions: ["hyperkalemia", "sodium bicarbonate", "cardiac arrest", "bradycardia"],
  },
  {
    patterns: [/\bdialysis\b/, /\brenal failure\b/, /\bckd\b/],
    expansions: ["hyperkalemia", "sodium bicarbonate"],
  },
  {
    patterns: [/\bpeaked\s*t\s*waves?\b/],
    expansions: ["hyperkalemia", "sodium bicarbonate"],
  },
  {
    patterns: [/\bbronchospasm\b/, /\bcopd\b/, /\basthma\b/, /\bwheez(?:e|ing)\b/, /\brespiratory distress\b/],
    expansions: ["shortness of breath", "protocol 1231", "protocol 1233", "albuterol", "nebulizer"],
  },
  {
    patterns: [/\banaphylaxis\b/, /\ballergic reaction\b/],
    expansions: ["protocol 1230", "epinephrine", "diphenhydramine"],
  },
  {
    patterns: [/\bseizure\b/, /\bpostictal\b/, /\bstatus epilepticus\b/],
    expansions: ["protocol 1239", "benzodiazepine", "midazolam", "diazepam"],
  },
  {
    patterns: [/\bstemi\b/, /\bchest pain\b/, /\bacs\b/, /\bmyocardial infarction\b/],
    expansions: ["protocol 1211", "nitroglycerin", "aspirin"],
  },
  {
    patterns: [/\bstroke\b/, /\bcva\b/, /\btia\b/, /\bmLAPSS\b/, /\blams\b/],
    expansions: ["protocol 1232", "stroke assessment", "base contact"],
  },
  {
    patterns: [/\btrauma\b/, /\bmvc\b/, /\bmechanism\b/, /\bblunt\b/, /\bpenetrating\b/],
    expansions: ["protocol 1305", "trauma triage", "base contact"],
  },
  {
    patterns: [/\bimpalement|impaled|penetrating\s+injury|penetrating\s+trauma\b/],
    expansions: ["protocol 1305", "protocol 1244", "trauma triage", "penetrating trauma"],
  },
  {
    patterns: [/\boverdose\b/, /\bpoison\b/, /\bingestion\b/, /\bopioid\b/, /\bnaloxone\b/],
    expansions: ["protocol 1229", "protocol 1235", "naloxone", "activated charcoal"],
  },
  {
    patterns: [/\bbehavioral\b/, /\bagitation\b/, /\bpsych\b/],
    expansions: ["protocol 1231", "protocol 1237", "midazolam"],
  },
  {
    patterns: [/\bpediatric\b/, /\bchild\b/, /\bnewborn\b/, /\bneonate\b/],
    expansions: ["MCG 1309", "color code", "weight based", "pediatric doses"],
  },
];

let index: MiniSearch<KBDoc> | null = null;
let kbDocs: KBDoc[] | null = null;

async function loadKnowledgeBase(): Promise<KBDoc[]> {
  if (!kbDocs) {
    const manager = new KnowledgeBaseManager();
    const docs = await manager.load();
    kbDocs = applyScopeFilter(docs);
  }
  return kbDocs;
}

function getLoadedKB(): KBDoc[] {
  if (!kbDocs) {
    throw new Error("Knowledge base not loaded. Call initializeKnowledgeBase() before using retrieval utilities.");
  }
  return kbDocs;
}

function ensureIndexLoaded() {
  if (index) return;
  const docs = getLoadedKB();
  const ms = new MiniSearch<KBDoc>({
    fields: ["title", "category", "subcategory", "content", "keywords"],
    storeFields: ["id", "title", "category", "subcategory", "content"],
    searchOptions: {
      boost: { title: 3, category: 1.5 },
      prefix: true,
      fuzzy: 0.2
    }
  });
  ms.addAll(docs);
  index = ms;
}

export async function initializeKnowledgeBase(): Promise<void> {
  await loadKnowledgeBase();
  ensureIndexLoaded();
}

function applyQueryNormalization(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

export function augmentQueryWithSynonyms(originalQuery: string): string {
  const normalized = applyQueryNormalization(originalQuery);
  const lower = normalized.toLowerCase();
  const expansions = new Set<string>();

  SYNONYM_RULES.forEach((rule) => {
    const matched = rule.patterns.some((pattern) => pattern.test(lower));
    if (!matched) return;
    rule.expansions.forEach((expansion) => expansions.add(expansion));
  });

  return [normalized, ...expansions].join(" ").trim();
}

export function expandQueryForTesting(query: string): string {
  return augmentQueryWithSynonyms(query);
}

function isPCMDoc(d: KBDoc): boolean {
  const category = String(d.category || "").toLowerCase();
  const subcat = String(d.subcategory || "").toLowerCase();
  // Prehospital Care Manual docs come from our PDFs/Markdown ingest
  // which are categorized as PDF/Markdown with subcategory 'LA County EMS'
  return (category === "markdown" || category === "pdf") && subcat.includes("la county ems");
}

function applyScopeFilter(docs: KBDoc[]): KBDoc[] {
  const scope = (process.env.KB_SCOPE || "pcm").toLowerCase();
  if (scope === "pcm") {
    return docs.filter(isPCMDoc);
  }
  return docs;
}

type SearchHit = { id: string };

export async function searchKB(query: string, limit = 6): Promise<KBDoc[]> {
  ensureIndexLoaded();
  const docs = getLoadedKB();
  const expanded = augmentQueryWithSynonyms(query);
  const results = index!.search(expanded, { combineWith: "OR" }).slice(0, limit) as unknown as SearchHit[];
  const mapped = mapSearchResults(results, docs);
  return augmentWithRelatedDocs(query, mapped, docs);
}

function mapSearchResults(results: SearchHit[], docs: KBDoc[]): KBDoc[] {
  const mapped: KBDoc[] = [];
  for (const r of results) {
    const found = docs.find((d) => d.id === r.id);
    if (found) mapped.push(found);
  }
  return mapped;
}

export async function buildContext(query: string, limit = 6): Promise<string> {
  const hits = await searchKB(query, limit);
  const ql = query.toLowerCase();
  // if (process.env.NODE_ENV !== 'production' && isSpecialDebugQuery(ql)) debugLogQuery(ql, hits);
  if (!hits.length) return "No direct matches in knowledge base.";
  const pcmOnly = (process.env.KB_SCOPE || "").toLowerCase() === "pcm";
  const context = buildProviderImpressionsSection(ql, pcmOnly);
  const chunks = buildKBChunks(hits);
  return context + chunks.join("\n\n---\n\n");
}

// Debug helpers kept for local investigation only
// function isSpecialDebugQuery(ql: string): boolean {
//   const tokens = ['mcg', '1309', 'pink', 'grey', 'red', 'purple', 'yellow', 'white', 'blue', 'orange', 'green', 'stroke'];
//   return tokens.some(t => ql.includes(t));
// }
// function debugLogQuery(ql: string, hits: KBDoc[]) {
//   console.log('Debug Query:', ql);
//   console.log('Search hits:', hits.length);
//   hits.forEach((hit, i) => console.log(`Hit ${i + 1}:`, hit.title));
// }

function buildProviderImpressionsSection(ql: string, pcmOnly: boolean): string {
  const medicalTerms = ['chest pain', 'cardiac', 'stroke', 'seizure', 'trauma', 'respiratory', 'abdominal', 'allergic', 'burn', 'overdose', 'diabetic', 'fever', 'shock', 'hypotension', 'bradycardia', 'tachycardia', 'syncope', 'dizziness', 'headache', 'nausea', 'vomiting', 'bleeding', 'pregnancy', 'childbirth', 'newborn', 'behavioral', 'psychiatric', 'alcohol', 'intoxication', 'electrocution', 'hypothermia', 'hyperthermia', 'carbon monoxide', 'hazmat', 'dystonic', 'epistaxis', 'eye', 'dental', 'ent', 'brue', 'airway', 'obstruction', 'choking', 'inhalation', 'smoke', 'stings', 'bites', 'submersion', 'drowning'];
  const hasMedicalTerms = medicalTerms.some(term => ql.includes(term));
  if (!hasMedicalTerms) return "";

  const relevantPIs = provider_impressions.filter(pi =>
    ql.includes(pi.pi_name.toLowerCase()) ||
    ql.includes(pi.pi_code.toLowerCase()) ||
    ql.includes(pi.tp_name.toLowerCase()) ||
    pi.keywords?.some(keyword => ql.includes(keyword.toLowerCase()))
  ).slice(0, 3);
  if (!relevantPIs.length) return "";

  let section = "**PROVIDER IMPRESSIONS REFERENCE (LA County):**\n";
  for (const pi of relevantPIs) {
    section += `• **${pi.pi_name} (${pi.pi_code})** → **${pi.tp_name} (${pi.tp_code}${pi.tp_code_pediatric ? '/' + pi.tp_code_pediatric : ''})**\n`;
    if (!pcmOnly && pi.guidelines) section += `  ${pi.guidelines}\n\n`;
    else section += `\n`;
  }
  return section + "---\n\n";
}

function buildKBChunks(hits: KBDoc[]): string[] {
  return hits.map((d, i) => {
    const trimmed = d.content.length > 1400 ? d.content.slice(0, 1400) + " …" : d.content;
    return `#${i + 1} • ${d.title} [${d.category}${d.subcategory ? " / " + d.subcategory : ""}]\n${trimmed}`;
  });
}

function augmentWithRelatedDocs(query: string, hits: KBDoc[], allDocs: KBDoc[]): KBDoc[] {
  const augmented: KBDoc[] = [...hits];
  const lowerQuery = query.toLowerCase();

  const ensureDoc = (predicate: (doc: KBDoc) => boolean, priority = false) => {
    const existing = augmented.find(predicate);
    if (existing) return;
    const found = allDocs.find(predicate);
    if (found) {
      if (priority) augmented.unshift(found);
      else augmented.push(found);
    }
  };

  // Ensure protocol documents for any protocol codes mentioned in the query
  const protocolMatches = Array.from(new Set(Array.from(lowerQuery.matchAll(/\b(1[0-3]\d{2})\b/g)).map((match) => match[1])));
  for (const code of protocolMatches) {
    ensureDoc((doc) => doc.title.toLowerCase().includes(code));
  }

  // If the query or existing hits suggest medication guidance, ensure MCG 1309 is present
  const mentionsMedication =
    /\b(dose|dosing|mg|mcg|medication|meds|epinephrine|epi|albuterol|ketorolac|acetaminophen|midazolam|fentanyl|pediatric|weight)\b/.test(
      lowerQuery,
    ) || hits.some((hit) => hit.category.toLowerCase().includes("medication"));
  if (mentionsMedication) {
    ensureDoc(
      (doc) => (doc.subcategory || "").toLowerCase().includes("mcg 1309") || doc.title.toLowerCase().includes("mcg 1309"),
      true,
    );
  }

  // Include base contact guidance when requested explicitly
  if (lowerQuery.includes("base contact")) {
    ensureDoc((doc) => doc.title.toLowerCase().includes("base contact"));
  }

  return augmented;
}
