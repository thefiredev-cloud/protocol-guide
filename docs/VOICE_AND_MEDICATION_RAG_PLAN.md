# Protocol Guide: Voice Input & Medication RAG Integration Plan

## Executive Summary

This document outlines the architecture for adding:
1. **Voice Input** - Whisper-based speech-to-text for the search interface
2. **Medication RAG** - 10,000+ medication database for drug reference lookups

---

## Part 1: Voice Input Architecture

### Component Created
`/components/voice-input.tsx` - Standalone component ready for integration

### Integration Point
**File:** `app/(tabs)/search.tsx`
**Location:** Inside the search input row (line ~424-446)

### Recommended Integration Code

```tsx
// In search.tsx, import the component
import { VoiceInput } from "@/components/voice-input";

// Inside the search input View (around line 424-446):
<View
  className="flex-row items-center rounded-xl px-4 mb-4"
  style={{ backgroundColor: colors.surface, height: 52 }}
>
  <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
  <TextInput
    ref={inputRef}
    value={query}
    onChangeText={setQuery}
    placeholder="e.g., pediatric asthma treatment"
    placeholderTextColor={colors.muted}
    className="flex-1 ml-3 text-base text-foreground"
    returnKeyType="search"
    onSubmitEditing={handleSearch}
  />

  {/* Voice Input - ADD THIS */}
  <VoiceInput
    onTranscription={(text) => {
      setQuery(text);
      // Optionally auto-search after voice input
      // setTimeout(() => handleSearch(), 100);
    }}
    onError={(error) => setSearchError(error)}
    disabled={isSearching}
  />

  {query.length > 0 && (
    <TouchableOpacity onPress={handleClear} className="p-2 -mr-2">
      <IconSymbol name="xmark" size={18} color={colors.muted} />
    </TouchableOpacity>
  )}
</View>
```

### Environment Variables Required
Add to `.env`:
```bash
EXPO_PUBLIC_WHISPER_API_URL=https://api.openai.com/v1/audio/transcriptions
EXPO_PUBLIC_WHISPER_API_KEY=sk-your-openai-key-here
```

### Self-Hosted Whisper Option
For HIPAA compliance and cost control, consider self-hosting:
- **Whisper.cpp** - C++ port, very fast
- **faster-whisper** - Python, CTranslate2 optimized
- **whisper-jax** - JAX implementation, GPU optimized

Deploy endpoint and update `EXPO_PUBLIC_WHISPER_API_URL`.

---

## Part 2: Medication RAG System

### Data Source Options

#### Option A: RxNorm (Recommended)
**Source:** [National Library of Medicine RxNorm](https://www.nlm.nih.gov/research/umls/rxnorm/overview.html)

**Stats (December 2025):**
- 14,592 base ingredients
- 5,151 brand names
- 17,544 clinical drugs
- 9,721 branded drugs
- Total: ~47,000+ unique drug entries

**Download:** https://download.nlm.nih.gov/umls/kss/rxnorm/RxNorm_full_current.zip

**Pros:**
- Free, no license required
- Official US government source
- Updated monthly
- Includes NDC codes, relationships

**Cons:**
- Large file (~500MB+ compressed)
- Needs parsing (RRF format)

#### Option B: OpenFDA Drug Database
**Source:** [openFDA](https://open.fda.gov/)

**Download:** `https://download.open.fda.gov/drug/drugsfda/drug-drugsfda-0001-of-0001.json.zip`

**Stats:**
- ~26,316 FDA-approved drugs
- JSON format (easier to parse)

**Pros:**
- JSON format
- Includes adverse events data
- FDA approval info

**Cons:**
- Less comprehensive than RxNorm
- US FDA drugs only

#### Option C: Drugs.com Linking
**Note:** Drugs.com is NOT open source. They have a commercial API.

**Alternative approach:** Link to Drugs.com pages for detailed info:
```
https://www.drugs.com/search.php?searchterm={medication_name}
```

This can provide:
- Full drug information pages
- Dosing calculators
- Interaction checkers
- Patient education materials

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Medication RAG System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌─────────────────────────────┐   │
│  │ RxNorm Database  │    │ Medication Vector Index     │   │
│  │ (PostgreSQL)     │───▶│ (pgvector embeddings)       │   │
│  │                  │    │                             │   │
│  │ - drug_name      │    │ - embedding (1536 dims)     │   │
│  │ - rxcui          │    │ - drug_id (FK)              │   │
│  │ - brand_names    │    │                             │   │
│  │ - ingredients    │    └─────────────────────────────┘   │
│  │ - dosage_forms   │                   │                   │
│  │ - drug_class     │                   │                   │
│  │ - ndc_codes      │                   ▼                   │
│  └──────────────────┘    ┌─────────────────────────────┐   │
│                          │ Semantic Search API          │   │
│                          │                             │   │
│                          │ POST /api/medications/search │   │
│                          │ { query: "epinephrine" }    │   │
│                          │                             │   │
│                          │ Returns:                    │   │
│                          │ - Matching medications      │   │
│                          │ - EMS dosing info           │   │
│                          │ - Drugs.com link            │   │
│                          └─────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### LLM Token Requirements

For RAG with 10,000 medications:

**Embedding Storage:**
- 10,000 medications × ~100 tokens avg = 1M tokens to embed once
- Using OpenAI ada-002: ~$0.10 one-time cost
- Storage: 10,000 × 1536 dims × 4 bytes = ~60MB in pgvector

**Runtime Retrieval (per query):**
- Query embedding: ~10-50 tokens
- Retrieved context: 5-10 medications × ~200 tokens = 1,000-2,000 tokens
- Total per search: ~2,000-3,000 tokens

**Cost per 1,000 searches:**
- Embedding queries: ~$0.01
- If using GPT-4 for augmentation: ~$0.06-0.20

### Database Schema

```sql
-- Medications table
CREATE TABLE medications (
  id SERIAL PRIMARY KEY,
  rxcui VARCHAR(20) UNIQUE,
  drug_name VARCHAR(500) NOT NULL,
  brand_names TEXT[], -- Array of brand names
  generic_name VARCHAR(500),
  drug_class VARCHAR(200),
  route VARCHAR(100), -- oral, IV, IM, etc.
  dosage_forms TEXT[],
  strength VARCHAR(200),

  -- EMS-specific fields
  ems_indication TEXT,
  ems_adult_dose TEXT,
  ems_pedi_dose TEXT,
  ems_contraindications TEXT,
  ems_notes TEXT,

  -- External links
  drugs_com_url VARCHAR(500),
  dailymed_url VARCHAR(500),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vector embeddings for semantic search
CREATE TABLE medication_embeddings (
  id SERIAL PRIMARY KEY,
  medication_id INTEGER REFERENCES medications(id),
  embedding vector(1536), -- OpenAI embedding dimensions
  embedding_text TEXT, -- The text that was embedded
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON medication_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### tRPC Router Addition

```typescript
// server/routers/medications.ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "../db";

export const medicationsRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      // Generate embedding for query
      const queryEmbedding = await generateEmbedding(input.query);

      // Semantic search
      const results = await db.execute(sql`
        SELECT
          m.*,
          1 - (me.embedding <=> ${queryEmbedding}::vector) as similarity
        FROM medications m
        JOIN medication_embeddings me ON m.id = me.medication_id
        ORDER BY me.embedding <=> ${queryEmbedding}::vector
        LIMIT ${input.limit}
      `);

      return results;
    }),

  byName: publicProcedure
    .input(z.object({
      name: z.string(),
    }))
    .query(async ({ input }) => {
      return db.query.medications.findFirst({
        where: (medications, { ilike }) =>
          ilike(medications.drug_name, `%${input.name}%`),
      });
    }),

  getDrugsComUrl: publicProcedure
    .input(z.object({ drugName: z.string() }))
    .query(async ({ input }) => {
      const encoded = encodeURIComponent(input.drugName);
      return `https://www.drugs.com/search.php?searchterm=${encoded}`;
    }),
});
```

### Data Import Script

```typescript
// scripts/import-rxnorm.ts
import { parse } from "csv-parse";
import { db } from "../server/db";

async function importRxNorm() {
  // Parse RXNCONSO.RRF (pipe-delimited)
  const rxnconsoPath = "./data/rxnorm/rrf/RXNCONSO.RRF";

  const records: any[] = [];

  const parser = fs.createReadStream(rxnconsoPath)
    .pipe(parse({
      delimiter: "|",
      columns: [
        "RXCUI", "LAT", "TS", "LUI", "STT", "SUI", "ISPREF",
        "RXAUI", "SAUI", "SCUI", "SDUI", "SAB", "TTY", "CODE",
        "STR", "SRL", "SUPPRESS", "CVF"
      ],
    }));

  for await (const record of parser) {
    // Filter to RxNorm normalized names only
    if (record.SAB === "RXNORM" && record.TTY === "SCD") {
      records.push({
        rxcui: record.RXCUI,
        drug_name: record.STR,
        // ... map other fields
      });
    }
  }

  // Batch insert
  await db.insert(medications).values(records);

  console.log(`Imported ${records.length} medications`);
}
```

---

## Part 3: Integration Flow

### User Experience Flow

```
User speaks: "What's the pediatric dose for epinephrine?"
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Voice Input captures audio                           │
│ 2. Whisper transcribes: "pediatric dose epinephrine"   │
│ 3. Medical term correction applied                      │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Query sent to search API                             │
│ 5. Parallel searches:                                   │
│    a) Protocol search (existing)                        │
│    b) Medication RAG search (new)                       │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Results displayed:                                   │
│    - Protocol matches (current behavior)                │
│    - Medication card with:                              │
│      • EMS pediatric dosing                             │
│      • Route/administration                             │
│      • "View on Drugs.com" link                         │
└─────────────────────────────────────────────────────────┘
```

### Estimated Implementation Timeline

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 1 | Voice input integration into search.tsx | 2 hours |
| 2 | Download & parse RxNorm data | 4 hours |
| 3 | Database schema + migration | 2 hours |
| 4 | Generate embeddings for medications | 2 hours |
| 5 | tRPC medication search endpoint | 3 hours |
| 6 | UI for medication results display | 4 hours |
| 7 | EMS dosing data enrichment | 8 hours |
| 8 | Testing & refinement | 4 hours |
| **Total** | | **~29 hours** |

---

## Part 4: Quick Start Commands

### 1. Set up environment
```bash
# Add to .env
EXPO_PUBLIC_WHISPER_API_KEY=sk-your-key
EXPO_PUBLIC_WHISPER_API_URL=https://api.openai.com/v1/audio/transcriptions
```

### 2. Download RxNorm data
```bash
mkdir -p data/rxnorm
cd data/rxnorm
curl -O https://download.nlm.nih.gov/umls/kss/rxnorm/RxNorm_full_current.zip
unzip RxNorm_full_current.zip
```

### 3. Create database migration
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 4. Import medications
```bash
pnpm tsx scripts/import-rxnorm.ts
```

### 5. Generate embeddings
```bash
pnpm tsx scripts/generate-embeddings.ts
```

---

## Appendix A: Common EMS Medications (Top 100)

For initial testing, prioritize these commonly used EMS medications:

1. Epinephrine (1:1000, 1:10000)
2. Albuterol
3. Aspirin
4. Atropine
5. Amiodarone
6. Adenosine
7. Diphenhydramine (Benadryl)
8. Dextrose (D50, D25, D10)
9. Diazepam (Valium)
10. Dopamine
11. Fentanyl
12. Glucagon
13. Ipratropium (Atrovent)
14. Ketamine
15. Lidocaine
16. Lorazepam (Ativan)
17. Magnesium Sulfate
18. Methylprednisolone (Solu-Medrol)
19. Midazolam (Versed)
20. Morphine
21. Naloxone (Narcan)
22. Nitroglycerin
23. Ondansetron (Zofran)
24. Oxygen
25. Sodium Bicarbonate
... (continue to 100)

---

## Appendix B: Drugs.com Integration

Since Drugs.com isn't open source, use deep linking:

```typescript
// Generate Drugs.com search URL
function getDrugsComUrl(drugName: string): string {
  const encoded = encodeURIComponent(drugName);
  return `https://www.drugs.com/search.php?searchterm=${encoded}`;
}

// Generate specific drug page URL (if you know the slug)
function getDrugPageUrl(drugSlug: string): string {
  return `https://www.drugs.com/${drugSlug}.html`;
}

// Example usage in UI
<TouchableOpacity
  onPress={() => Linking.openURL(getDrugsComUrl("epinephrine"))}
>
  <Text>View on Drugs.com</Text>
</TouchableOpacity>
```

---

## Questions to Resolve

1. **HIPAA Compliance**: Should medication queries be logged? What PHI concerns?
2. **Offline Support**: Should medications be cached locally for field use?
3. **EMS Dosing Source**: Where to get authoritative EMS dosing guidelines?
4. **Update Frequency**: How often to refresh RxNorm data?
5. **Drugs.com Partnership**: Worth exploring official API access?

---

*Document created: January 22, 2026*
*Protocol Guide v1.x*
