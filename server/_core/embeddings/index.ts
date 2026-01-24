/**
 * Protocol Guide (Manus) - Voyage AI Embedding Pipeline
 *
 * Uses Voyage AI's medical-optimized embeddings for semantic search.
 * Model: voyage-large-2 (1536 dimensions)
 *
 * Features:
 * - Medical domain optimization for EMS protocols
 * - Batch embedding for efficient migration
 * - Supabase pgvector integration
 * - LRU cache for embedding responses (24-hour TTL)
 * - Custom error types for better error handling
 */

import { createClient } from '@supabase/supabase-js';
import { parseVoyageError, VoyageApiError } from '../errors';
import { embeddingCache } from './cache';

// Re-export cache for external access
export { embeddingCache } from './cache';

// Re-export batch functions
export {
  generateEmbeddingsBatch,
  generateAllEmbeddings,
  updateProtocolEmbedding,
  BATCH_SIZE,
} from './batch';

// Re-export search functions and types
export {
  semanticSearchProtocols,
  semanticSearchWithInheritance,
  semanticSearchProtocolsEnhanced,
  getProtocolInheritanceChain,
  getAgencyProtocolCoverage,
  getSupabaseClient,
  type SearchResult,
  type InheritedSearchResult,
  type InheritanceChainEntry,
  type ProtocolCoverage,
} from './search';

// Voyage AI configuration
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
export const VOYAGE_MODEL = 'voyage-large-2';
export const EMBEDDING_DIMENSION = 1536;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
 * Uses LRU cache to avoid redundant API calls for identical queries
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new VoyageApiError('VOYAGE_API_KEY is required for embedding generation', 500);
  }

  // Truncate text to avoid token limits (roughly 8000 chars for safety)
  const truncatedText = text.slice(0, 8000);

  // Check cache first
  const cachedEmbedding = embeddingCache.get(truncatedText);
  if (cachedEmbedding) {
    console.log('[Embeddings] Cache hit for query');
    return cachedEmbedding;
  }

  console.log('[Embeddings] Cache miss, calling Voyage API');

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
    const errorText = await response.text();
    console.error(`[Embeddings] Voyage API error: ${response.status} - ${errorText}`);
    throw parseVoyageError(response.status, errorText);
  }

  const data = (await response.json()) as VoyageEmbeddingResponse;
  const embedding = data.data[0].embedding;

  // Store in cache for future requests
  embeddingCache.set(truncatedText, embedding);

  return embedding;
}
