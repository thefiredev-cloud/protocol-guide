#!/usr/bin/env node

/**
 * Embedding Generation Script
 *
 * Generates OpenAI embeddings for protocol chunks and stores them in Supabase
 *
 * Features:
 * - Batch processing for efficiency
 * - Rate limiting to respect OpenAI API limits
 * - Progress tracking and resumability
 * - Error handling and retry logic
 *
 * Usage:
 *   node scripts/generate-embeddings.mjs [--limit=1000] [--batch-size=100] [--update-outdated]
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import OpenAI from 'openai';

// =============================================================================
// CONFIGURATION
// =============================================================================

const BATCH_SIZE = parseInt(process.env.EMBEDDING_BATCH_SIZE || '100');
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const RATE_LIMIT_DELAY_MS = 100; // Delay between batches to avoid rate limits

// Parse CLI arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : null;
const UPDATE_OUTDATED = args.includes('--update-outdated');

// =============================================================================
// UTILITIES
// =============================================================================

function log(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateContentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// =============================================================================
// EMBEDDING GENERATION
// =============================================================================

async function generateEmbeddingWithRetry(openai, text, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      log(`  ⚠️  Attempt ${attempt} failed, retrying...`, {
        error: error.message,
        delay: RETRY_DELAY_MS * attempt
      });

      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
}

async function generateBatchEmbeddings(openai, chunks) {
  const inputs = chunks.map(c => {
    const text = `${c.title || ''}\n\n${c.content || ''}`.trim();
    return text.substring(0, 8191); // OpenAI's max input length
  });

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: inputs,
      encoding_format: 'float'
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    // If batch fails, try individual generation
    log('  ⚠️  Batch generation failed, falling back to individual generation');

    const embeddings = [];
    for (const input of inputs) {
      try {
        const embedding = await generateEmbeddingWithRetry(openai, input);
        embeddings.push(embedding);
        await sleep(50); // Small delay between individual requests
      } catch (err) {
        log(`  ❌ Failed to generate embedding: ${err.message}`);
        embeddings.push(null);
      }
    }

    return embeddings;
  }
}

// =============================================================================
// MAIN PROCESSING
// =============================================================================

async function processChunksNeedingEmbeddings(supabase, openai) {
  log('📝 Finding chunks that need embeddings...');

  const { data: chunks, error } = await supabase
    .rpc('get_chunks_needing_embeddings', {
      p_embedding_model: 'text-embedding-3-small',
      p_embedding_version: 1,
      p_limit: LIMIT || 10000
    });

  if (error) {
    throw new Error(`Failed to get chunks needing embeddings: ${error.message}`);
  }

  log(`  ✅ Found ${chunks.length} chunks needing embeddings`);

  return await processChunks(supabase, openai, chunks);
}

async function processOutdatedEmbeddings(supabase, openai) {
  log('📝 Finding chunks with outdated embeddings...');

  const { data: chunks, error } = await supabase
    .rpc('get_chunks_with_outdated_embeddings', {
      p_embedding_model: 'text-embedding-3-small',
      p_embedding_version: 1,
      p_limit: LIMIT || 10000
    });

  if (error) {
    throw new Error(`Failed to get chunks with outdated embeddings: ${error.message}`);
  }

  log(`  ✅ Found ${chunks.length} chunks with outdated embeddings`);

  return await processChunks(supabase, openai, chunks);
}

async function processChunks(supabase, openai, chunks) {
  if (chunks.length === 0) {
    log('  ℹ️  No chunks to process');
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;
  const total = chunks.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    try {
      // Generate embeddings for batch
      log(`  ⏳ Generating embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
      const embeddings = await generateBatchEmbeddings(openai, batch);

      // Store embeddings in database
      const embeddingRecords = batch
        .map((chunk, idx) => {
          if (!embeddings[idx]) return null;

          return {
            chunk_id: chunk.chunk_id || chunk.id,
            protocol_id: chunk.protocol_id,
            embedding: embeddings[idx],
            content_hash: chunk.content_hash || generateContentHash(chunk.content),
            content_preview: chunk.content.substring(0, 200),
            embedding_model: 'text-embedding-3-small',
            embedding_version: 1
          };
        })
        .filter(Boolean);

      if (embeddingRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('protocol_embeddings')
          .upsert(embeddingRecords, {
            onConflict: 'chunk_id,embedding_model,embedding_version',
            ignoreDuplicates: false
          });

        if (insertError) {
          log(`  ❌ Failed to store embeddings for batch: ${insertError.message}`);
          failed += batch.length;
        } else {
          processed += embeddingRecords.length;
          log(`  ✅ Generated ${processed}/${total} embeddings...`);
        }
      } else {
        failed += batch.length;
      }

      // Rate limiting
      if (i + BATCH_SIZE < total) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    } catch (error) {
      log(`  ❌ Failed batch at ${i}: ${error.message}`);
      failed += batch.length;
    }
  }

  return { processed, failed };
}

// =============================================================================
// VALIDATION
// =============================================================================

async function validateEmbeddings(supabase) {
  log('\n✅ Validating embeddings...');

  try {
    const { data: stats } = await supabase
      .from('embedding_coverage_stats')
      .select('*')
      .single();

    if (stats) {
      log('📊 Embedding Coverage:');
      log(`  Total Chunks: ${stats.total_chunks}`);
      log(`  Chunks with Embeddings: ${stats.chunks_with_embeddings}`);
      log(`  Coverage: ${stats.coverage_percent}%`);
      log(`  Embeddings (small): ${stats.embeddings_small || 0}`);
      log(`  Embeddings (large): ${stats.embeddings_large || 0}`);
      log(`  Embeddings (ada): ${stats.embeddings_ada || 0}`);
    }

    return stats;
  } catch (error) {
    log('❌ Validation failed:', { error });
    throw error;
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  log('🚀 Starting embedding generation...\n');

  // 1. Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !openaiKey) {
    throw new Error(
      'Missing required environment variables:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - SUPABASE_SERVICE_ROLE_KEY\n' +
      '  - OPENAI_API_KEY\n\n' +
      'Set these in your .env.local file or environment'
    );
  }

  // 2. Initialize clients
  log('🔌 Connecting to services...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  const openai = new OpenAI({ apiKey: openaiKey });
  log('  ✅ Connected\n');

  // 3. Process chunks
  let result;
  if (UPDATE_OUTDATED) {
    result = await processOutdatedEmbeddings(supabase, openai);
  } else {
    result = await processChunksNeedingEmbeddings(supabase, openai);
  }

  // 4. Validate
  await validateEmbeddings(supabase);

  // 5. Summary
  log('\n📊 Summary:');
  log(`  Processed: ${result.processed}`);
  log(`  Failed: ${result.failed}`);
  log(`  Success Rate: ${result.processed + result.failed > 0 ? Math.round((result.processed / (result.processed + result.failed)) * 100) : 0}%`);

  log('\n🎉 Embedding generation complete!');
}

// Run embedding generation
main().catch(error => {
  console.error('❌ Embedding generation failed:', error);
  process.exit(1);
});
