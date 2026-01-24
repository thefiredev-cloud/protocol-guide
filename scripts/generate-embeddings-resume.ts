/**
 * Resumable Embedding Generation Script
 *
 * Generates embeddings for chunks without embeddings, with support for:
 * - Resuming from last position after interruption
 * - Progress tracking with ETA
 * - Rate limiting to avoid API throttling
 * - Batch processing for efficiency
 *
 * Run with: npx tsx scripts/generate-embeddings-resume.ts
 *
 * Options:
 *   --batch-size <n>  Number of chunks per batch (default: 128)
 *   --delay <ms>      Delay between batches in ms (default: 200)
 *   --dry-run         Show what would be processed without making changes
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const DEFAULT_BATCH_SIZE = 128;
const DEFAULT_DELAY_MS = 200;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!VOYAGE_API_KEY) {
  console.error('Missing VOYAGE_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: texts.map(t => t.substring(0, 8000)),
      input_type: 'document'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Voyage API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

interface ProcessingStats {
  totalWithoutEmbeddings: number;
  processed: number;
  errors: number;
  startTime: number;
}

async function getChunksWithoutEmbeddings(limit: number, offset: number = 0) {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .select('id, protocol_title, content')
    .is('embedding', null)
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

async function getTotalWithoutEmbeddings(): Promise<number> {
  const { count, error } = await supabase
    .from('manus_protocol_chunks')
    .select('id', { count: 'exact', head: true })
    .is('embedding', null);

  if (error) throw error;
  return count || 0;
}

async function updateChunkEmbedding(id: number, embedding: number[]): Promise<boolean> {
  const { error } = await supabase
    .from('manus_protocol_chunks')
    .update({ embedding })
    .eq('id', id);

  return !error;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

async function processChunks(
  batchSize: number,
  delayMs: number,
  dryRun: boolean
): Promise<ProcessingStats> {
  const stats: ProcessingStats = {
    totalWithoutEmbeddings: 0,
    processed: 0,
    errors: 0,
    startTime: Date.now(),
  };

  // Get total count
  stats.totalWithoutEmbeddings = await getTotalWithoutEmbeddings();

  if (stats.totalWithoutEmbeddings === 0) {
    console.log('All chunks already have embeddings!');
    return stats;
  }

  console.log(`Found ${stats.totalWithoutEmbeddings.toLocaleString()} chunks without embeddings\n`);

  if (dryRun) {
    console.log('[DRY RUN] Would process these chunks without making changes.\n');
    return stats;
  }

  // Process in batches
  let offset = 0;

  while (true) {
    const chunks = await getChunksWithoutEmbeddings(batchSize, 0);

    if (chunks.length === 0) break;

    // Prepare texts for embedding
    const texts = chunks.map(c => `${c.protocol_title}\n\n${c.content}`);

    try {
      // Generate embeddings
      const embeddings = await generateEmbeddingsBatch(texts);

      // Update each chunk
      for (let i = 0; i < chunks.length; i++) {
        const success = await updateChunkEmbedding(chunks[i].id, embeddings[i]);
        if (success) {
          stats.processed++;
        } else {
          stats.errors++;
        }
      }

      // Progress update
      const elapsed = Date.now() - stats.startTime;
      const rate = stats.processed / (elapsed / 1000);
      const remaining = stats.totalWithoutEmbeddings - stats.processed;
      const eta = remaining / rate;

      process.stdout.write(
        `\rProgress: ${stats.processed.toLocaleString()}/${stats.totalWithoutEmbeddings.toLocaleString()} ` +
        `(${((stats.processed / stats.totalWithoutEmbeddings) * 100).toFixed(1)}%) | ` +
        `Rate: ${rate.toFixed(1)}/s | ` +
        `ETA: ${formatDuration(eta * 1000)}     `
      );

    } catch (error: any) {
      console.error(`\nBatch error: ${error.message}`);
      stats.errors += chunks.length;

      // If rate limited, wait longer
      if (error.message.includes('429') || error.message.includes('rate')) {
        console.log('Rate limited, waiting 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }

    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, delayMs));

    offset += batchSize;
  }

  console.log('\n');
  return stats;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('RESUMABLE EMBEDDING GENERATION');
  console.log('='.repeat(70));
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Parse options
  const dryRun = process.argv.includes('--dry-run');

  const batchSizeIdx = process.argv.indexOf('--batch-size');
  const batchSize = batchSizeIdx !== -1
    ? parseInt(process.argv[batchSizeIdx + 1])
    : DEFAULT_BATCH_SIZE;

  const delayIdx = process.argv.indexOf('--delay');
  const delayMs = delayIdx !== -1
    ? parseInt(process.argv[delayIdx + 1])
    : DEFAULT_DELAY_MS;

  console.log('--- CONFIGURATION ---\n');
  console.log(`  Batch size: ${batchSize}`);
  console.log(`  Delay between batches: ${delayMs}ms`);
  console.log(`  Mode: ${dryRun ? 'Dry Run' : 'Live'}`);
  console.log(`  Voyage model: voyage-large-2`);
  console.log();

  try {
    const stats = await processChunks(batchSize, delayMs, dryRun);

    // Summary
    console.log('='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`\n  Total without embeddings: ${stats.totalWithoutEmbeddings.toLocaleString()}`);
    console.log(`  Processed: ${stats.processed.toLocaleString()}`);
    console.log(`  Errors: ${stats.errors}`);

    if (stats.processed > 0) {
      const elapsed = Date.now() - stats.startTime;
      console.log(`  Total time: ${formatDuration(elapsed)}`);
      console.log(`  Average rate: ${(stats.processed / (elapsed / 1000)).toFixed(1)} chunks/sec`);
    }

    // Cost estimate
    if (stats.processed > 0) {
      const avgTokens = 300; // Estimated average tokens per chunk
      const totalTokens = stats.processed * avgTokens;
      const cost = (totalTokens / 1000000) * 0.3; // $0.30 per 1M tokens for voyage-large-2
      console.log(`\n  Estimated cost: $${cost.toFixed(2)}`);
    }

    console.log();

  } catch (error: any) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

main();
