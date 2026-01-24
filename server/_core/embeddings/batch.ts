/**
 * Batch Embedding Generation Module
 * Handles batch processing of embeddings with chunking logic
 */

import { parseVoyageError, VoyageApiError } from '../errors';
import { embeddingCache } from './cache';
import { createClient } from '@supabase/supabase-js';

// Voyage AI configuration
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-large-2';
export const BATCH_SIZE = 128; // Voyage AI max batch size

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
 * Protocol chunk type for embedding generation
 */
type ProtocolChunk = {
  id: number;
  protocol_title: string;
  section: string | null;
  content: string;
};

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate embeddings for multiple texts in batch
 * Uses cache for texts that have been previously embedded
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new VoyageApiError('VOYAGE_API_KEY is required for embedding generation', 500);
  }

  // Truncate each text
  const truncatedTexts = texts.map(t => t.slice(0, 8000));

  // Check cache for each text
  const results: (number[] | null)[] = truncatedTexts.map(text => embeddingCache.get(text));
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  for (let i = 0; i < results.length; i++) {
    if (results[i] === null) {
      uncachedIndices.push(i);
      uncachedTexts.push(truncatedTexts[i]);
    }
  }

  const cacheHits = results.length - uncachedTexts.length;
  console.log(`[Embeddings] Batch: ${cacheHits} cache hits, ${uncachedTexts.length} misses`);

  // If all cached, return immediately
  if (uncachedTexts.length === 0) {
    return results as number[][];
  }

  // Fetch uncached embeddings from API
  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: uncachedTexts,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Embeddings] Voyage API batch error: ${response.status} - ${errorText}`);
    throw parseVoyageError(response.status, errorText);
  }

  const data = (await response.json()) as VoyageEmbeddingResponse;

  // Sort by index to maintain order
  const sortedEmbeddings = data.data
    .sort((a, b) => a.index - b.index)
    .map(d => d.embedding);

  // Merge results and cache new embeddings
  for (let i = 0; i < uncachedIndices.length; i++) {
    const originalIndex = uncachedIndices[i];
    const embedding = sortedEmbeddings[i];
    results[originalIndex] = embedding;

    // Cache the new embedding
    embeddingCache.set(truncatedTexts[originalIndex], embedding);
  }

  return results as number[][];
}

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
export async function updateProtocolEmbedding(
  protocolId: number,
  generateEmbedding: (text: string) => Promise<number[]>
): Promise<void> {
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
