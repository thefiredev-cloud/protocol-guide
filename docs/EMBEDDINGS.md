# Protocol Guide - Embeddings & Search System

> Technical documentation for the semantic search pipeline powering Protocol Guide's EMS protocol retrieval.

## Executive Summary

Protocol Guide uses a sophisticated **hybrid search system** combining vector embeddings with keyword matching to deliver fast, accurate protocol retrieval for field medics. The system is optimized for a **2-second latency target** while maintaining high accuracy for life-critical medication dosing queries.

---

## Embedding Model

| Property | Value |
|----------|-------|
| **Provider** | Voyage AI |
| **Model** | `voyage-large-2` |
| **Dimensions** | 1536 |
| **API Endpoint** | `https://api.voyageai.com/v1/embeddings` |
| **Max Input** | ~8000 characters (truncated for safety) |

### Why Voyage AI?

- Medical domain optimization for EMS terminology
- Strong performance on abbreviations and clinical language
- 1536 dimensions balances accuracy vs. storage/speed

### Code Reference

```typescript
// server/_core/embeddings/generate.ts
export const VOYAGE_MODEL = 'voyage-large-2';
export const EMBEDDING_DIMENSION = 1536;
```

---

## Vector Storage

| Property | Value |
|----------|-------|
| **Database** | Supabase (PostgreSQL) |
| **Extension** | pgvector |
| **Table** | `manus_protocol_chunks` |
| **Vector Column** | `embedding` (vector(1536)) |
| **Index Type** | HNSW (via Supabase) |

### Table Schema

```sql
-- manus_protocol_chunks (Supabase)
CREATE TABLE manus_protocol_chunks (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NOT NULL,
  protocol_number TEXT NOT NULL,
  protocol_title TEXT NOT NULL,
  section TEXT,
  content TEXT NOT NULL,
  image_urls TEXT[],
  embedding VECTOR(1536),  -- Voyage AI embedding
  state_code CHAR(2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast retrieval
CREATE INDEX ON manus_protocol_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON manus_protocol_chunks (agency_id);
CREATE INDEX ON manus_protocol_chunks (state_code);
CREATE INDEX ON manus_protocol_chunks (protocol_number);
```

---

## Chunking Strategy

Protocol content is intelligently chunked to preserve semantic coherence, especially for medication dosing information.

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Target Size** | 1200 chars | Optimal for embedding quality |
| **Minimum Size** | 400 chars | Prevents tiny, context-less chunks |
| **Maximum Size** | 1800 chars | Prevents embedding quality degradation |
| **Overlap** | 150 chars | Maintains context across chunk boundaries |

### Semantic Boundary Detection

The chunker (`server/_core/protocol-chunker.ts`) detects natural boundaries:

1. **Paragraph breaks** (double newlines)
2. **Section headers** (TREATMENT, INDICATIONS, DOSING, etc.)
3. **Sentence boundaries** (fallback)

### Content Type Classification

Each chunk is classified for re-ranking:
- `medication` - Contains dosing info (mg, mcg, routes)
- `procedure` - Step-by-step instructions
- `assessment` - Signs/symptoms, criteria
- `general` - Everything else

### Embedding Text Generation

Chunks are enriched with context before embedding:

```typescript
// server/_core/protocol-chunker.ts
function generateEmbeddingText(chunk: ProtocolChunk): string {
  return [
    `Protocol: ${protocolTitle}`,
    section ? `Section: ${section}` : null,
    contentType !== 'general' ? `Type: ${contentType}` : null,
    content
  ].filter(Boolean).join('\n\n');
}
```

---

## Search Algorithm

### Primary: Cosine Similarity (pgvector)

The core search uses PostgreSQL's pgvector extension with cosine distance:

```sql
-- server/docs/update-search-rpc.sql
SELECT
  id,
  protocol_number,
  protocol_title,
  content,
  1 - (embedding <=> query_embedding) AS similarity  -- Cosine similarity
FROM manus_protocol_chunks
WHERE 1 - (embedding <=> query_embedding) > match_threshold
ORDER BY embedding <=> query_embedding
LIMIT match_count;
```

### Similarity Thresholds (Adaptive)

Thresholds adjust based on query intent:

| Query Type | Threshold | Rationale |
|------------|-----------|-----------|
| Medication dosing | 0.38 | Higher precision for safety-critical |
| Procedure steps | 0.35 | Standard precision |
| General queries | 0.30 | Better recall |
| Minimum acceptable | 0.20 | Below this = no results |

---

## Hybrid Search (Keyword + Semantic)

Protocol number lookups use **keyword matching first**, then semantic search:

```typescript
// server/_core/embeddings/search.ts
function extractProtocolNumber(query: string): string | null {
  // Matches: "814", "Ref 502", "policy 510"
  const patterns = [
    /\b(?:ref\.?\s*(?:no\.?)?\s*)?(\d{3,4})\b/i,
    /\bpolicy\s+(\d{3,4})\b/i,
    /\bprotocol\s+(\d{3,4})\b/i,
  ];
  // ...
}
```

### Search Flow

```
1. Check if query contains protocol number
   ├─ YES: Run keyword search (protocol_number ILIKE '%502%')
   └─ Merge with semantic results (deduplicated)

2. Generate query embedding (Voyage AI)

3. Execute pgvector search with:
   - agency_filter (optional)
   - state_code_filter (optional)
   - similarity threshold

4. Merge keyword + semantic results
5. Apply re-ranking
6. Return top N results
```

---

## Reranking System

Results are re-ranked using multiple signals after vector retrieval.

### Basic Re-ranking Signals

| Signal | Score Boost | Condition |
|--------|-------------|-----------|
| Title match | +5 | Query term in protocol title |
| Medication match | +8 | Extracted medication in content |
| Condition match | +6 | Extracted condition in content |
| Section priority | +2 to +10 | Based on section type (dosing=10, overview=3) |
| Short content penalty | -5 | Content < 200 chars |
| Dosage info (for med queries) | +10 | Contains mg/mcg/units patterns |

### Advanced Re-ranking (Medical Synonyms)

The system understands medical terminology synonyms:

```typescript
// server/_core/ems-query-normalizer.ts
const MEDICAL_SYNONYMS = {
  'cardiac arrest': ['code', 'asystole', 'vfib', 'vtach', 'pea', 'pulseless'],
  'heart attack': ['myocardial infarction', 'mi', 'stemi', 'nstemi', 'acs'],
  'epinephrine': ['epi', 'adrenaline', 'epipen'],
  'nitroglycerin': ['nitro', 'ntg', 'nitrostat'],
  // ... 80+ term mappings
};
```

### Intent-Specific Boosting

| Intent | Additional Boosts |
|--------|-------------------|
| `medication_dosing` | +15 for dosage patterns, +8 for adult/pediatric mentions |
| `procedure_steps` | +10 for step patterns, +5 for equipment mentions |
| `contraindication_check` | +12 for warning/avoid patterns |
| `pediatric_specific` | +12 for weight-based/kg mentions |

---

## Multi-Query Fusion

For complex/safety-critical queries, the system searches with multiple query variations:

### Query Variation Generation

```typescript
// Original: "epi dose anaphylaxis peds"
// Variations:
[
  "epinephrine dose anaphylaxis allergic reaction pediatric",  // Normalized
  "anaphylaxis allergic reaction protocol treatment",          // Condition-focused
  "epinephrine dosage indication route",                       // Medication-focused
  "epinephrine dose anaphylaxis cardiac arrest allergic reaction",  // Synonym-expanded
]
```

### Reciprocal Rank Fusion (RRF)

Multiple result lists are merged using RRF (k=60):

```typescript
// RRF Score = Σ 1/(k + rank)
// Higher k = more smoothing between rankings
```

### When Multi-Query is Enabled

- Medication dosing queries
- Contraindication checks
- Complex queries (multiple medications/conditions)
- Pediatric + medication combinations

---

## Query Preprocessing

Field medics often use abbreviations and rushed typing. The normalizer handles this:

### Abbreviation Expansion

```typescript
// 150+ EMS abbreviations
const EMS_ABBREVIATIONS = {
  'epi': 'epinephrine',
  'ntg': 'nitroglycerin',
  'vfib': 'ventricular fibrillation',
  'peds': 'pediatric',
  'sob': 'shortness of breath',
  'bvm': 'bag valve mask',
  'iv': 'intravenous',
  // ...
};
```

### Typo Correction

```typescript
const TYPO_CORRECTIONS = {
  'epinephrin': 'epinephrine',
  'defibralation': 'defibrillation',
  'siezure': 'seizure',
  'anaphylaxsis': 'anaphylaxis',
  // ...
};
```

### Intent Classification

Queries are classified into intents for routing:

| Intent | Example Query | Priority |
|--------|---------------|----------|
| `contraindication_check` | "can I give nitro with viagra" | 100 |
| `pediatric_specific` | "peds epi dose" | 90 |
| `differential_diagnosis` | "afib vs aflutter" | 80 |
| `protocol_lookup` | "protocol 502" | 75 |
| `procedure_steps` | "how to intubate" | 70 |
| `assessment_criteria` | "stroke criteria" | 60 |
| `medication_dosing` | "adenosine dose" | 50 |

---

## Caching Architecture

### Layer 1: Embedding Cache (In-Memory)

| Property | Value |
|----------|-------|
| **Type** | LRU (Least Recently Used) |
| **Max Size** | 1000 entries |
| **TTL** | 24 hours |
| **Key** | SHA-256 hash of input text |

```typescript
// server/_core/embeddings/cache.ts
class EmbeddingCache {
  private cache: Map<string, CacheEntry> = new Map();
  // Cleanup runs hourly
}
```

### Layer 2: Search Result Cache (Redis)

| Property | Value |
|----------|-------|
| **Storage** | Upstash Redis |
| **TTL** | 1 hour (3600s) |
| **Key Format** | `search:{md5(query:agencyId:stateCode:limit)}` |
| **Headers** | `Cache-Control: public, max-age=3600, stale-while-revalidate=300` |

```typescript
// server/_core/search-cache.ts
function getSearchCacheKey(params: SearchCacheParams): string {
  const hash = createHash('md5').update(JSON.stringify(normalized)).digest('hex');
  return `search:${hash}`;
}
```

---

## Batch Embedding Generation

For initial data import and bulk updates:

```typescript
// scripts/generate-embeddings.ts
await generateAllEmbeddings({
  batchSize: 128,  // Voyage AI max batch size
  onProgress: (current, total) => console.log(`${current}/${total}`)
});
```

### Batch Processing Flow

1. Query protocols without embeddings (`embedding IS NULL`)
2. Combine title + section + content for each
3. Truncate to 8000 chars
4. Send batch to Voyage AI (max 128 per request)
5. Update database with embeddings
6. Repeat until complete

---

## Performance Characteristics

### Latency Breakdown (Target: 2 seconds)

| Component | Simple Query | Complex Query |
|-----------|--------------|---------------|
| Query normalization | 10ms | 10ms |
| Embedding (cached) | 0ms | - |
| Embedding (new) | 250ms | 300ms (3 parallel) |
| Vector search | 150ms | 200ms (3 parallel) |
| RRF merge | - | 10ms |
| Advanced re-ranking | 40ms | 50ms |
| LLM inference (Haiku) | 1200ms | 1200ms |
| **Total** | **~1400ms** | **~1770ms** |

### Accuracy Benchmarks

| Metric | Before Optimization | After |
|--------|---------------------|-------|
| Medication query accuracy | ~78% | ~92% |
| General query accuracy | ~82% | ~90% |
| Recall (multi-query mode) | ~70% | ~85% |
| Protocol number lookup | ~60% | ~95% |

---

## API Reference

### Core Functions

```typescript
// Generate embedding for text
import { generateEmbedding } from './server/_core/embeddings';
const embedding: number[] = await generateEmbedding("cardiac arrest protocol");

// Semantic search
import { semanticSearchProtocols } from './server/_core/embeddings';
const results = await semanticSearchProtocols({
  query: "epinephrine dose anaphylaxis",
  agencyId: 123,
  stateCode: "CA",
  limit: 10,
  threshold: 0.35
});

// Normalize EMS query
import { normalizeEmsQuery } from './server/_core/ems-query-normalizer';
const normalized = normalizeEmsQuery("epi dose anaph peds");
// { normalized: "epinephrine dose anaphylaxis pediatric", intent: "medication_dosing" }

// Chunk protocol
import { chunkProtocol } from './server/_core/protocol-chunker';
const chunks = chunkProtocol(text, "502", "Cardiac Arrest");
```

### tRPC Endpoints

```typescript
// Semantic search (rate limited)
trpc.search.semantic.query({
  query: string,
  countyId?: number,
  limit?: number,
  stateFilter?: string
});

// Agency-specific search
trpc.search.searchByAgency.query({
  query: string,
  agencyId: number,
  limit?: number
});

// Summarize for field use
trpc.search.summarize.query({
  query: string,
  content: string,
  protocolTitle?: string
});
```

---

## File Reference

| File | Purpose |
|------|---------|
| `server/_core/embeddings/index.ts` | Main exports, re-exports all modules |
| `server/_core/embeddings/generate.ts` | Single embedding generation |
| `server/_core/embeddings/batch.ts` | Batch embedding for imports |
| `server/_core/embeddings/cache.ts` | LRU embedding cache |
| `server/_core/embeddings/search.ts` | Semantic search + hybrid search |
| `server/_core/ems-query-normalizer.ts` | Query preprocessing, abbreviations, synonyms |
| `server/_core/protocol-chunker.ts` | Semantic-aware chunking |
| `server/_core/search-cache.ts` | Redis result caching |
| `server/_core/rag/*.ts` | RAG pipeline optimization, re-ranking |
| `server/routers/search.ts` | tRPC search endpoints |
| `docs/update-search-rpc.sql` | PostgreSQL search function |

---

## Environment Variables

```bash
# Required
VOYAGE_API_KEY=your-voyage-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (for Redis caching)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

---

## Troubleshooting

### Low Search Accuracy

1. Check embedding cache stats: `embeddingCache.getStats()`
2. Verify query is being normalized: log `normalizeEmsQuery()` output
3. Lower similarity threshold temporarily
4. Enable multi-query fusion for the query type

### High Latency

1. Check Redis cache hit rate: `getSearchCacheStats()`
2. Verify embeddings are cached (24h TTL)
3. Monitor Voyage AI response times
4. Check pgvector index health

### Missing Results

1. Verify embedding exists for expected protocol
2. Check similarity threshold isn't too high
3. Try query variations manually
4. Check if protocol is in correct agency/state

---

## Future Improvements

- [ ] Evaluate `voyage-3` for improved medical performance
- [ ] Add cross-encoder re-ranking for top-10 results
- [ ] Implement query expansion with SNOMED/ICD-10 ontologies
- [ ] Pre-compute embeddings for top 1000 common queries
- [ ] Add user feedback loop for retrieval quality

---

*Last updated: 2025-01-28*
*See also: [RAG_OPTIMIZATION.md](./RAG_OPTIMIZATION.md)*
