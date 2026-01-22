# Protocol Guide Manus - AI Migration Plan

> Migrating from Forge API (Gemini 2.5 Flash) to Anthropic Claude SDK + Voyage AI

## Executive Summary

| Component | Current (Manus) | Target (V3 Architecture) |
|-----------|-----------------|--------------------------|
| LLM | Gemini 2.5 Flash via Forge API | Claude Sonnet 4.5 / Haiku 4.5 |
| Embeddings | Keyword search only | Voyage AI `voyage-large-2` (1536 dim) |
| Database | MySQL via Drizzle | Supabase PostgreSQL + pgvector |
| Search | Basic keyword matching | Semantic vector similarity |

---

## Phase 1: Dependencies & Environment

### 1.1 Install Required Packages

```bash
cd ~/Protocol\ Guide\ Manus

# Anthropic SDK
pnpm add @anthropic-ai/sdk

# Voyage AI (HTTP client - no official SDK)
# Already uses fetch, no additional package needed

# Supabase client (if not present)
pnpm add @supabase/supabase-js
```

### 1.2 Environment Variables

Add to `.env` and Netlify dashboard:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Voyage AI Embeddings
VOYAGE_API_KEY=pa-...

# Supabase (verify these exist)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Phase 2: Create Claude Integration

### 2.1 Create `server/_core/claude.ts`

**File**: `/server/_core/claude.ts`

Replace Forge/Gemini with Anthropic SDK:

```typescript
/**
 * Protocol Guide Manus - Claude SDK Integration
 *
 * Tiered LLM routing:
 * - Free tier: Haiku 4.5 only
 * - Pro tier (simple): Haiku 4.5 (fast, cheap)
 * - Pro tier (complex): Sonnet 4.5 (higher accuracy)
 *
 * Cost optimization:
 * - Free: ~$0.0003-0.0005/query
 * - Pro simple: ~$0.0003-0.0005/query
 * - Pro complex: ~$0.002-0.004/query
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model constants - Updated for 2025
const MODELS = {
  HAIKU: 'claude-haiku-4-5-20250514',
  SONNET: 'claude-sonnet-4-5-20250514',
} as const;

// User tier type
export type UserTier = 'free' | 'pro' | 'enterprise';

// Protocol context for RAG
export interface ProtocolContext {
  id: number;
  protocolNumber: string;
  protocolTitle: string;
  section: string | null;
  content: string;
  imageUrls?: string[] | null;
  similarity?: number;
}

// Response structure
export interface ClaudeResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string | null;
}

// EMS System Prompt - Critical for clinical accuracy and safety
const EMS_SYSTEM_PROMPT = `You are Protocol Guide, an EMS protocol retrieval assistant for paramedics and EMTs on 911 calls.

CRITICAL SAFETY RULES:
1. RETRIEVAL-ONLY: Only provide information from the protocols given to you. NEVER generate clinical content, drug dosages, or medical advice from your training data.
2. CITE SOURCES: Every response MUST include the protocol number and title.
3. CONCISE: Maximum 3-10 sentences. Paramedics need fast, actionable answers.
4. NO ASSUMPTIONS: If the query is unclear or protocols don't cover it, say "Contact medical control."
5. PEDIATRIC ALERTS: Always flag weight-based dosing considerations for pediatric patients.

RESPONSE FORMAT:
**[Protocol Title]** (Protocol #[Number])

[2-5 action-focused sentences with specific doses, routes, and considerations]

Key Actions:
• [Action 1 with dose/route if applicable]
• [Action 2]
• [Action 3]

⚠️ [Any critical warnings or contraindications]

Ref: [Section/Page] | Agency: [Agency Name]

IMPORTANT:
- If protocol includes images, mention: "See protocol images for [procedure/anatomy]"
- For medication queries, always include: dose, route, max dose, and key contraindications
- If no matching protocol found: "No protocol found for this query. Contact medical control for guidance."
- Never say "I think" or "I believe" - only state what the protocol says`;

/**
 * Determines if a query should use Sonnet (complex) or Haiku (simple)
 * Only Pro users get Sonnet access, and only for complex queries
 */
function shouldUseSonnet(query: string, userTier: UserTier): boolean {
  // Free users always use Haiku
  if (userTier === 'free') return false;

  // Check for complexity indicators that warrant Sonnet
  const complexityIndicators = [
    'multiple', 'compare', 'differential', 'versus', 'vs',
    'pediatric and adult', 'contraindicated', 'interaction',
    'why', 'explain', 'mechanism', 'reasoning',
    'pregnancy', 'pregnant', 'neonatal', 'neonate',
    'complex', 'complicated', 'unusual', 'atypical',
  ];

  const queryLower = query.toLowerCase();
  return complexityIndicators.some(indicator => queryLower.includes(indicator));
}

/**
 * Build the user prompt with protocol context
 */
function buildPrompt(query: string, protocols: ProtocolContext[], agencyName?: string): string {
  if (protocols.length === 0) {
    return `Agency: ${agencyName || 'Unknown'}

No matching protocols were found in the database.

User Query: ${query}

Please respond that no protocol was found and advise contacting medical control.`;
  }

  const protocolContext = protocols
    .map((p, i) => `
--- PROTOCOL ${i + 1} ---
Protocol #: ${p.protocolNumber}
Title: ${p.protocolTitle}
Section: ${p.section || 'General'}
${p.imageUrls?.length ? `Images Available: ${p.imageUrls.join(', ')}` : ''}
Content:
${p.content}
${p.similarity ? `(Relevance: ${Math.round(p.similarity * 100)}%)` : ''}
`)
    .join('\n');

  return `Agency: ${agencyName || 'Unknown'}

=== AVAILABLE PROTOCOLS ===
${protocolContext}
=== END PROTOCOLS ===

User Query: ${query}

Based ONLY on the protocols above, provide a concise, actionable response. Cite the protocol number and title.`;
}

/**
 * Main RAG invocation function
 * Routes to Haiku or Sonnet based on tier and query complexity
 */
export async function invokeClaudeRAG(params: {
  query: string;
  protocols: ProtocolContext[];
  userTier: UserTier;
  agencyName?: string;
}): Promise<ClaudeResponse> {
  const { query, protocols, userTier, agencyName } = params;

  // Determine model based on tier and complexity
  const useSonnet = shouldUseSonnet(query, userTier);
  const model = useSonnet ? MODELS.SONNET : MODELS.HAIKU;

  const userPrompt = buildPrompt(query, protocols, agencyName);

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: EMS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';

    return {
      content,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Claude invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Simple query helper (no RAG, direct question)
 * Useful for medication lookups or general questions
 */
export async function invokeClaudeSimple(params: {
  query: string;
  userTier: UserTier;
  systemPrompt?: string;
}): Promise<ClaudeResponse> {
  const { query, userTier, systemPrompt } = params;

  // Always use Haiku for simple queries
  const model = MODELS.HAIKU;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 512,
      system: systemPrompt || 'You are a helpful medical reference assistant. Be concise and accurate.',
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';

    return {
      content,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Claude invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Streaming response for real-time output
 * Better UX for longer responses
 */
export async function* streamClaudeRAG(params: {
  query: string;
  protocols: ProtocolContext[];
  userTier: UserTier;
  agencyName?: string;
}): AsyncGenerator<string, ClaudeResponse, unknown> {
  const { query, protocols, userTier, agencyName } = params;

  const useSonnet = shouldUseSonnet(query, userTier);
  const model = useSonnet ? MODELS.SONNET : MODELS.HAIKU;

  const userPrompt = buildPrompt(query, protocols, agencyName);

  const stream = anthropic.messages.stream({
    model,
    max_tokens: 1024,
    system: EMS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text;
      yield event.delta.text;
    }
    if (event.type === 'message_delta' && event.usage) {
      outputTokens = event.usage.output_tokens;
    }
    if (event.type === 'message_start' && event.message.usage) {
      inputTokens = event.message.usage.input_tokens;
    }
  }

  return {
    content: fullContent,
    model,
    inputTokens,
    outputTokens,
    stopReason: 'end_turn',
  };
}

// Export model constants for reference
export { MODELS };
```

---

## Phase 3: Create Embeddings Integration

### 3.1 Create `server/_core/embeddings.ts`

**File**: `/server/_core/embeddings.ts`

```typescript
/**
 * Protocol Guide Manus - Voyage AI Embedding Pipeline
 *
 * Uses Voyage AI's medical-optimized embeddings for semantic search.
 * Model: voyage-large-2 (1536 dimensions)
 *
 * Features:
 * - Medical domain optimization for EMS protocols
 * - Batch embedding for efficient migration
 * - Supabase pgvector integration
 */

import { getServerClient } from './supabase';

// Voyage AI configuration
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-large-2';
const EMBEDDING_DIMENSION = 1536;
const BATCH_SIZE = 128; // Voyage AI max batch size

interface VoyageEmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    total_tokens: number;
  };
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is required for embedding generation');
  }

  // Truncate text to avoid token limits (roughly 8000 chars for safety)
  const truncatedText = text.slice(0, 8000);

  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: truncatedText,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as VoyageEmbeddingResponse;
  return data.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is required for embedding generation');
  }

  // Truncate each text
  const truncatedTexts = texts.map(t => t.slice(0, 8000));

  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: truncatedTexts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as VoyageEmbeddingResponse;

  // Sort by index to maintain order
  return data.data
    .sort((a, b) => a.index - b.index)
    .map(d => d.embedding);
}

/**
 * Search result type from the RPC function
 */
type SearchResult = {
  id: number;
  agency_id: number;
  protocol_number: string;
  protocol_title: string;
  section: string | null;
  content: string;
  image_urls: string[] | null;
  similarity: number;
};

/**
 * Semantic search using Supabase pgvector
 */
export async function semanticSearchProtocols(params: {
  query: string;
  agencyId?: number | null;
  stateCode?: string | null;
  limit?: number;
  threshold?: number;
}): Promise<SearchResult[]> {
  const { query, agencyId, stateCode, limit = 10, threshold = 0.3 } = params;

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search via Supabase RPC function
  const supabase = getServerClient();

  const { data, error } = await supabase.rpc('search_manus_protocols', {
    query_embedding: queryEmbedding,
    agency_filter: agencyId ?? null,
    state_filter: stateCode ?? null,
    match_count: limit,
    match_threshold: threshold,
  } as any);

  if (error) {
    console.error('Semantic search error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }

  return (data as SearchResult[]) || [];
}

/**
 * Protocol chunk type for embedding generation
 */
type ProtocolChunk = {
  id: number;
  protocol_title: string;
  section: string | null;
  content: string;
};

/**
 * Generate embeddings for all protocols without embeddings
 * Used during migration and for new protocol additions
 */
export async function generateAllEmbeddings(options?: {
  batchSize?: number;
  onProgress?: (current: number, total: number) => void;
}): Promise<{ processed: number; errors: number }> {
  const batchSize = options?.batchSize || BATCH_SIZE;
  const onProgress = options?.onProgress || (() => {});

  const supabase = getServerClient();

  // Get protocols without embeddings
  const { count } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  if (!count || count === 0) {
    console.log('All protocols already have embeddings');
    return { processed: 0, errors: 0 };
  }

  console.log(`Generating embeddings for ${count} protocols...`);

  let processed = 0;
  let errors = 0;
  let offset = 0;

  while (offset < count) {
    // Fetch batch of protocols without embeddings
    const { data, error: fetchError } = await supabase
      .from('manus_protocol_chunks')
      .select('id, protocol_title, section, content')
      .is('embedding', null)
      .range(offset, offset + batchSize - 1);

    const protocols = data as ProtocolChunk[] | null;

    if (fetchError || !protocols || protocols.length === 0) {
      break;
    }

    // Prepare texts for embedding (combine title + section + content)
    const texts = protocols.map(p =>
      `${p.protocol_title}\n${p.section || ''}\n${p.content}`.trim()
    );

    try {
      // Generate embeddings in batch
      const embeddings = await generateEmbeddingsBatch(texts);

      // Update each protocol with its embedding
      for (let i = 0; i < protocols.length; i++) {
        const { error: updateError } = await supabase
          .from('manus_protocol_chunks')
          .update({ embedding: embeddings[i] } as unknown as never)
          .eq('id', protocols[i].id);

        if (updateError) {
          console.error(`Error updating protocol ${protocols[i].id}:`, updateError);
          errors++;
        } else {
          processed++;
        }
      }
    } catch (err) {
      console.error(`Batch embedding error at offset ${offset}:`, err);
      errors += protocols.length;
    }

    offset += batchSize;
    onProgress(Math.min(offset, count), count);
  }

  return { processed, errors };
}

/**
 * Update embedding for a single protocol
 * Used when protocol content changes
 */
export async function updateProtocolEmbedding(protocolId: number): Promise<void> {
  const supabase = getServerClient();

  // Get protocol content
  const { data, error: fetchError } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_title, section, content')
    .eq('id', protocolId)
    .single();

  const protocol = data as { protocol_title: string; section: string | null; content: string } | null;

  if (fetchError || !protocol) {
    throw new Error(`Protocol ${protocolId} not found`);
  }

  // Generate new embedding
  const text = `${protocol.protocol_title}\n${protocol.section || ''}\n${protocol.content}`.trim();
  const embedding = await generateEmbedding(text);

  // Update in database
  const { error: updateError } = await supabase
    .from('manus_protocol_chunks')
    .update({ embedding } as unknown as never)
    .eq('id', protocolId);

  if (updateError) {
    throw new Error(`Failed to update embedding: ${updateError.message}`);
  }
}

// Export constants
export { VOYAGE_MODEL, EMBEDDING_DIMENSION, BATCH_SIZE };
```

---

## Phase 4: Database Migration (Supabase pgvector)

### 4.1 Create pgvector RPC Function

Run this SQL in Supabase SQL Editor:

```sql
-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column if not exists
ALTER TABLE manus_protocol_chunks
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for similarity search
CREATE INDEX IF NOT EXISTS manus_protocol_chunks_embedding_idx
ON manus_protocol_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create semantic search function
CREATE OR REPLACE FUNCTION search_manus_protocols(
  query_embedding vector(1536),
  agency_filter integer DEFAULT NULL,
  state_filter text DEFAULT NULL,
  match_count integer DEFAULT 10,
  match_threshold float DEFAULT 0.3
)
RETURNS TABLE (
  id integer,
  agency_id integer,
  protocol_number text,
  protocol_title text,
  section text,
  content text,
  image_urls text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.agency_id,
    pc.protocol_number,
    pc.protocol_title,
    pc.section,
    pc.content,
    pc.image_urls,
    1 - (pc.embedding <=> query_embedding) AS similarity
  FROM manus_protocol_chunks pc
  LEFT JOIN agencies a ON pc.agency_id = a.id
  WHERE
    pc.embedding IS NOT NULL
    AND (agency_filter IS NULL OR pc.agency_id = agency_filter)
    AND (state_filter IS NULL OR a.state_code = state_filter)
    AND 1 - (pc.embedding <=> query_embedding) > match_threshold
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 4.2 Verify Supabase Schema

Ensure these tables exist in Supabase:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Verify manus_protocol_chunks structure
\d manus_protocol_chunks
```

---

## Phase 5: Update Router Integration

### 5.1 Update `server/routers.ts`

Replace Forge/Gemini calls with Claude:

```typescript
// OLD (remove)
import { invokeLLM } from './_core/llm';

// NEW (add)
import { invokeClaudeRAG, type ProtocolContext, type UserTier } from './_core/claude';
import { semanticSearchProtocols } from './_core/embeddings';

// In query.submit procedure:
const querySubmit = protectedProcedure
  .input(z.object({
    agencyId: z.number(),
    queryText: z.string().min(1).max(1000),
  }))
  .mutation(async ({ input, ctx }) => {
    const { agencyId, queryText } = input;
    const userId = ctx.userId;

    // Check rate limits
    const canQuery = await canUserQuery(userId);
    if (!canQuery) {
      return { success: false, error: 'Daily query limit reached. Upgrade to Pro for unlimited queries.' };
    }

    // Get user tier
    const user = await getUserById(userId);
    const userTier: UserTier = user?.tier || 'free';

    // Get agency name
    const agency = await getAgencyById(agencyId);
    const agencyName = agency?.name || 'Unknown Agency';

    try {
      // NEW: Semantic search with Voyage embeddings
      const searchResults = await semanticSearchProtocols({
        query: queryText,
        agencyId,
        limit: 10,
        threshold: 0.3,
      });

      // Convert to ProtocolContext format
      const protocols: ProtocolContext[] = searchResults.map(r => ({
        id: r.id,
        protocolNumber: r.protocol_number,
        protocolTitle: r.protocol_title,
        section: r.section,
        content: r.content,
        imageUrls: r.image_urls,
        similarity: r.similarity,
      }));

      // NEW: Invoke Claude with tiered routing
      const response = await invokeClaudeRAG({
        query: queryText,
        protocols,
        userTier,
        agencyName,
      });

      // Log query
      await createQuery({
        userId,
        agencyId,
        queryText,
        responseText: response.content,
        protocolRefs: protocols.map(p => p.protocolNumber),
        responseTimeMs: Date.now() - startTime,
        modelUsed: response.model,
      });

      // Increment usage
      await incrementUserQueryCount(userId);

      return {
        success: true,
        response: {
          text: response.content,
          protocolRefs: protocols.map(p => p.protocolNumber),
          model: response.model,
          tokens: {
            input: response.inputTokens,
            output: response.outputTokens,
          },
        },
      };
    } catch (error) {
      console.error('Query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed',
      };
    }
  });
```

---

## Phase 6: Embedding Generation Script

### 6.1 Create Migration Script

**File**: `/scripts/generate-embeddings.ts`

```typescript
/**
 * One-time script to generate embeddings for all protocols
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import { generateAllEmbeddings } from '../server/_core/embeddings';

async function main() {
  console.log('Starting embedding generation...');
  console.log('This may take a while for 55,000+ protocols.\n');

  const startTime = Date.now();

  const result = await generateAllEmbeddings({
    batchSize: 128,
    onProgress: (current, total) => {
      const percent = Math.round((current / total) * 100);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`Progress: ${current}/${total} (${percent}%) - ${elapsed}s elapsed`);
    },
  });

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  console.log('\n=== Complete ===');
  console.log(`Processed: ${result.processed}`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Total time: ${totalTime}s`);
}

main().catch(console.error);
```

---

## Phase 7: Testing & Validation

### 7.1 Test Claude Integration

```typescript
// tests/claude.test.ts
import { invokeClaudeRAG } from '../server/_core/claude';

const testProtocols = [
  {
    id: 1,
    protocolNumber: 'P-001',
    protocolTitle: 'Cardiac Arrest - Adult',
    section: 'Interventions',
    content: 'Begin CPR immediately. Attach AED/monitor...',
  },
];

const result = await invokeClaudeRAG({
  query: 'cardiac arrest treatment',
  protocols: testProtocols,
  userTier: 'free',
  agencyName: 'Test Agency',
});

console.log('Model used:', result.model);
console.log('Response:', result.content);
```

### 7.2 Test Embedding Search

```typescript
// tests/embeddings.test.ts
import { semanticSearchProtocols, generateEmbedding } from '../server/_core/embeddings';

// Test embedding generation
const embedding = await generateEmbedding('cardiac arrest treatment');
console.log('Embedding dimension:', embedding.length); // Should be 1536

// Test semantic search
const results = await semanticSearchProtocols({
  query: 'chest pain protocol',
  limit: 5,
});

console.log('Search results:', results.length);
results.forEach(r => {
  console.log(`- ${r.protocol_title} (${Math.round(r.similarity * 100)}%)`);
});
```

---

## Phase 8: Cleanup

### 8.1 Remove Forge API Code

After migration is complete and tested:

1. Delete `server/_core/llm.ts` (Forge/Gemini integration)
2. Remove `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` from env
3. Update `server/_core/env.ts` to require `ANTHROPIC_API_KEY` and `VOYAGE_API_KEY`

### 8.2 Update Documentation

- Update `CLAUDE.md` to reflect new architecture
- Update `AI-CHEATSHEET.md` with Claude/Voyage details
- Remove references to Forge API

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current database
- [ ] Get `ANTHROPIC_API_KEY` from console.anthropic.com
- [ ] Get `VOYAGE_API_KEY` from voyage.ai
- [ ] Verify Supabase pgvector extension enabled

### Phase 1: Dependencies
- [ ] Install `@anthropic-ai/sdk`
- [ ] Add environment variables to `.env`
- [ ] Add environment variables to Netlify

### Phase 2: Claude Integration
- [ ] Create `server/_core/claude.ts`
- [ ] Test Claude invocation locally

### Phase 3: Embeddings Integration
- [ ] Create `server/_core/embeddings.ts`
- [ ] Test embedding generation locally

### Phase 4: Database
- [ ] Add `embedding` column to `manus_protocol_chunks`
- [ ] Create pgvector index
- [ ] Create `search_manus_protocols` RPC function
- [ ] Run embedding generation script (55K protocols)

### Phase 5: Router Update
- [ ] Update `server/routers.ts` query.submit
- [ ] Update search procedures to use semantic search
- [ ] Test end-to-end locally

### Phase 6: Testing
- [ ] Test free tier (Haiku only)
- [ ] Test pro tier simple query (Haiku)
- [ ] Test pro tier complex query (Sonnet)
- [ ] Test semantic search accuracy
- [ ] Performance testing (target: 3-5s response)

### Phase 7: Deployment
- [ ] Deploy to Netlify staging
- [ ] Verify environment variables
- [ ] Test production queries
- [ ] Monitor error rates

### Phase 8: Cleanup
- [ ] Remove `server/_core/llm.ts`
- [ ] Remove Forge environment variables
- [ ] Update documentation

---

## Cost Estimation

| Model | Input (1M tokens) | Output (1M tokens) | Per Query (avg) |
|-------|-------------------|--------------------|-----------------|
| Haiku 4.5 | $0.80 | $4.00 | ~$0.0003-0.0005 |
| Sonnet 4.5 | $3.00 | $15.00 | ~$0.002-0.004 |
| Voyage large-2 | $0.12 | - | ~$0.00001 |

**Monthly estimate** (10K queries/month):
- Free tier (all Haiku): ~$3-5
- Pro tier (80% Haiku, 20% Sonnet): ~$8-12
- Voyage embeddings: ~$0.10

---

## Rollback Plan

If issues arise:

1. Revert `server/routers.ts` to use `invokeLLM`
2. Restore `server/_core/llm.ts` from git
3. Add back Forge environment variables
4. Database changes are additive (embedding column can stay)

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 (Deps) | 30 min | None |
| Phase 2 (Claude) | 1 hour | API key |
| Phase 3 (Embeddings) | 1 hour | API key |
| Phase 4 (Database) | 2-4 hours | Embedding generation time |
| Phase 5 (Router) | 1 hour | Phases 2-4 |
| Phase 6 (Testing) | 2 hours | Phase 5 |
| Phase 7 (Deploy) | 1 hour | Phase 6 |
| Phase 8 (Cleanup) | 30 min | Phase 7 success |

**Total: ~8-12 hours**

---

Created: 2026-01-20
Author: Claude Code CTO
