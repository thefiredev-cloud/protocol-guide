/**
 * Protocol Guide - Embedding Pipeline
 *
 * Handles vector embedding generation using Google's text-embedding API.
 * Embeddings are stored in Supabase pgvector for semantic search.
 */

import { GoogleGenAI } from '@google/genai';
import { supabase } from '../supabase';

// ============================================
// Configuration
// ============================================

const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSIONS = 768;
const MAX_TOKENS_PER_CHUNK = 2048;
const BATCH_SIZE = 20;

// Query embedding cache for performance
const queryCache = new Map<string, { embedding: number[]; timestamp: number }>();
const QUERY_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ============================================
// Types
// ============================================

export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
  tokenCount?: number;
}

export interface ChunkToEmbed {
  id: string;
  content: string;
}

export interface EmbeddingStats {
  totalChunks: number;
  successfulEmbeddings: number;
  failedEmbeddings: number;
  errors: Array<{ chunkId: string; error: string }>;
}

// ============================================
// Embedding Client
// ============================================

let genAI: GoogleGenAI | null = null;

/**
 * Initialize Google GenAI client
 */
function getGenAIClient(): GoogleGenAI {
  if (!genAI) {
    // @ts-expect-error - Vite provides import.meta.env at runtime
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY not configured');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// ============================================
// Embedding Functions
// ============================================

/**
 * Generate embedding for a single text string
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGenAIClient();

  // Truncate if too long (rough estimate: 4 chars per token)
  const maxChars = MAX_TOKENS_PER_CHUNK * 4;
  const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text;

  try {
    const result = await client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: truncatedText,
    });

    if (!result.embeddings || result.embeddings.length === 0) {
      throw new Error('No embedding returned from API');
    }

    return result.embeddings[0].values || [];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<Array<number[] | null>> {
  const results: Array<number[] | null> = [];

  for (const text of texts) {
    try {
      const embedding = await generateEmbedding(text);
      results.push(embedding);
    } catch (error) {
      console.error('Batch embedding error:', error);
      results.push(null);
    }
    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Generate embeddings for protocol chunks and store in Supabase
 */
export async function embedAllChunks(): Promise<EmbeddingStats> {
  const stats: EmbeddingStats = {
    totalChunks: 0,
    successfulEmbeddings: 0,
    failedEmbeddings: 0,
    errors: [],
  };

  console.log('Fetching chunks without embeddings...');

  // Fetch chunks that don't have embeddings yet
  const { data: chunks, error: fetchError } = await supabase
    .from('protocol_chunks')
    .select('id, content')
    .is('embedding', null)
    .limit(1000);

  if (fetchError) {
    console.error('Error fetching chunks:', fetchError);
    throw fetchError;
  }

  if (!chunks || chunks.length === 0) {
    console.log('No chunks to embed.');
    return stats;
  }

  stats.totalChunks = chunks.length;
  console.log(`Found ${chunks.length} chunks to embed.`);

  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);

    for (const chunk of batch) {
      try {
        const embedding = await generateEmbedding(chunk.content);

        // Update chunk with embedding
        const { error: updateError } = await supabase
          .from('protocol_chunks')
          .update({ embedding })
          .eq('id', chunk.id);

        if (updateError) {
          throw updateError;
        }

        stats.successfulEmbeddings++;
      } catch (error) {
        stats.failedEmbeddings++;
        stats.errors.push({
          chunkId: chunk.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  console.log(`Embedding complete: ${stats.successfulEmbeddings}/${stats.totalChunks} successful`);
  return stats;
}

/**
 * Generate embedding for a user query (with caching)
 */
export async function embedQuery(query: string): Promise<number[]> {
  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  const cached = queryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < QUERY_CACHE_TTL) {
    console.log('[Embeddings] Cache hit for query');
    return cached.embedding;
  }

  // Add query prefix for better search alignment
  const prefixedQuery = `search_query: ${query}`;
  const embedding = await generateEmbedding(prefixedQuery);

  // Store in cache
  queryCache.set(cacheKey, { embedding, timestamp: Date.now() });

  // Clean old entries periodically (keep cache from growing unbounded)
  if (queryCache.size > 100) {
    const now = Date.now();
    Array.from(queryCache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > QUERY_CACHE_TTL) {
        queryCache.delete(key);
      }
    });
  }

  return embedding;
}

// ============================================
// Utilities
// ============================================

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Estimate token count for text
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
