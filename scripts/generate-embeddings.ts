#!/usr/bin/env npx tsx
/**
 * Knowledge Base Embedding Generation Script
 *
 * Generates OpenAI embeddings for knowledge base documents and stores them in Supabase.
 *
 * Features:
 * - Loads knowledge base from data/ems_kb_clean.json
 * - Uses text-embedding-3-small model (1536 dimensions)
 * - Content hashing to skip unchanged documents
 * - Batch processing (100 docs at a time)
 * - Rate limiting and retry logic
 * - Progress tracking with console output
 *
 * Usage:
 *   npx tsx scripts/generate-embeddings.ts
 *   npx tsx scripts/generate-embeddings.ts --limit=500
 *   npx tsx scripts/generate-embeddings.ts --batch-size=50
 *
 * Environment Variables:
 *   OPENAI_API_KEY or LLM_API_KEY (when LLM_PROVIDER=openai)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

// =============================================================================
// TYPES
// =============================================================================

type KBDoc = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  content: string;
};

type EmbeddingRecord = {
  doc_id: string;
  embedding: number[];
  content_hash: string;
  content_preview: string;
  embedding_model: string;
  embedding_version: number;
  metadata?: {
    title: string;
    category: string;
    subcategory?: string;
  };
};

type ProcessingStats = {
  total: number;
  processed: number;
  skipped: number;
  failed: number;
  startTime: number;
};

// =============================================================================
// CONFIGURATION
// =============================================================================

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_VERSION = 1;
const EMBEDDING_DIMENSIONS = 1536;
const MAX_INPUT_LENGTH = 8191; // OpenAI's max input length

// Parse CLI arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));

const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : null;
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const RATE_LIMIT_DELAY_MS = 100; // Delay between batches

// Paths
const KB_PATH = path.join(process.cwd(), 'data/ems_kb_clean.json');

// =============================================================================
// UTILITIES
// =============================================================================

function log(message: string, data?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const dataStr = data && Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : '';
  console.log(`[${timestamp}] ${message}${dataStr}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function showProgress(stats: ProcessingStats): void {
  const elapsed = Date.now() - stats.startTime;
  const rate = stats.processed / (elapsed / 1000);
  const remaining = stats.total - stats.processed;
  const eta = remaining / rate;

  log(`Progress: ${stats.processed}/${stats.total} processed, ${stats.skipped} skipped, ${stats.failed} failed | Rate: ${rate.toFixed(1)}/s | ETA: ${formatDuration(eta * 1000)}`);
}

// =============================================================================
// KNOWLEDGE BASE LOADING
// =============================================================================

async function loadKnowledgeBase(): Promise<KBDoc[]> {
  log(`Loading knowledge base from ${KB_PATH}...`);

  if (!fs.existsSync(KB_PATH)) {
    throw new Error(`Knowledge base file not found: ${KB_PATH}`);
  }

  const content = fs.readFileSync(KB_PATH, 'utf-8');
  const docs = JSON.parse(content) as KBDoc[];

  log(`Loaded ${docs.length} documents from knowledge base`);

  // Apply limit if specified
  if (LIMIT && LIMIT < docs.length) {
    log(`Limiting to first ${LIMIT} documents`);
    return docs.slice(0, LIMIT);
  }

  return docs;
}

// =============================================================================
// EXISTING EMBEDDINGS MANAGEMENT
// =============================================================================

async function getExistingEmbeddings(supabase: SupabaseClient): Promise<Map<string, string>> {
  log('Fetching existing embeddings...');

  const { data, error } = await supabase
    .from('protocol_embeddings')
    .select('doc_id, content_hash')
    .eq('embedding_model', EMBEDDING_MODEL)
    .eq('embedding_version', EMBEDDING_VERSION);

  if (error) {
    throw new Error(`Failed to fetch existing embeddings: ${error.message}`);
  }

  const existingMap = new Map<string, string>();
  if (data) {
    for (const record of data) {
      existingMap.set(record.doc_id, record.content_hash);
    }
  }

  log(`Found ${existingMap.size} existing embeddings`);
  return existingMap;
}

function filterDocumentsNeedingEmbeddings(
  docs: KBDoc[],
  existingEmbeddings: Map<string, string>
): { toProcess: KBDoc[]; skipped: number } {
  const toProcess: KBDoc[] = [];
  let skipped = 0;

  for (const doc of docs) {
    const contentHash = generateContentHash(doc.content);
    const existingHash = existingEmbeddings.get(doc.id);

    if (existingHash === contentHash) {
      // Document unchanged, skip
      skipped++;
    } else {
      // New or changed document, process
      toProcess.push(doc);
    }
  }

  log(`${toProcess.length} documents need embeddings (${skipped} unchanged)`);
  return { toProcess, skipped };
}

// =============================================================================
// EMBEDDING GENERATION
// =============================================================================

async function generateEmbeddingWithRetry(
  openai: OpenAI,
  text: string,
  retries = MAX_RETRIES
): Promise<number[] | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      if (attempt === retries) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`Failed to generate embedding after ${retries} attempts: ${errorMessage}`);
        return null;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Attempt ${attempt} failed, retrying...`, { error: errorMessage });
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  return null;
}

async function generateBatchEmbeddings(
  openai: OpenAI,
  docs: KBDoc[]
): Promise<(number[] | null)[]> {
  // Prepare inputs: combine title and content, truncate to max length
  const inputs = docs.map(doc => {
    const text = `${doc.title}\n\n${doc.content}`.trim();
    return text.substring(0, MAX_INPUT_LENGTH);
  });

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: inputs,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    // If batch fails, fall back to individual generation
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Batch generation failed, falling back to individual generation: ${errorMessage}`);

    const embeddings: (number[] | null)[] = [];
    for (const input of inputs) {
      const embedding = await generateEmbeddingWithRetry(openai, input);
      embeddings.push(embedding);
      await sleep(50); // Small delay between individual requests
    }

    return embeddings;
  }
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function upsertEmbeddings(
  supabase: SupabaseClient,
  docs: KBDoc[],
  embeddings: (number[] | null)[]
): Promise<{ success: number; failed: number }> {
  const records: EmbeddingRecord[] = [];

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const embedding = embeddings[i];

    if (!embedding) {
      continue; // Skip failed embeddings
    }

    records.push({
      doc_id: doc.id,
      embedding,
      content_hash: generateContentHash(doc.content),
      content_preview: doc.content.substring(0, 200),
      embedding_model: EMBEDDING_MODEL,
      embedding_version: EMBEDDING_VERSION,
      metadata: {
        title: doc.title,
        category: doc.category,
        subcategory: doc.subcategory,
      },
    });
  }

  if (records.length === 0) {
    return { success: 0, failed: docs.length };
  }

  const { error } = await supabase
    .from('protocol_embeddings')
    .upsert(records, {
      onConflict: 'doc_id,embedding_model,embedding_version',
      ignoreDuplicates: false,
    });

  if (error) {
    log(`Failed to upsert embeddings: ${error.message}`);
    return { success: 0, failed: docs.length };
  }

  const failed = docs.length - records.length;
  return { success: records.length, failed };
}

// =============================================================================
// MAIN PROCESSING
// =============================================================================

async function processDocuments(
  supabase: SupabaseClient,
  openai: OpenAI,
  docs: KBDoc[]
): Promise<ProcessingStats> {
  const stats: ProcessingStats = {
    total: docs.length,
    processed: 0,
    skipped: 0,
    failed: 0,
    startTime: Date.now(),
  };

  if (docs.length === 0) {
    log('No documents to process');
    return stats;
  }

  log(`Processing ${docs.length} documents in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, Math.min(i + BATCH_SIZE, docs.length));
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(docs.length / BATCH_SIZE);

    log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} documents)...`);

    try {
      // Generate embeddings
      const embeddings = await generateBatchEmbeddings(openai, batch);

      // Store in database
      const result = await upsertEmbeddings(supabase, batch, embeddings);

      stats.processed += result.success;
      stats.failed += result.failed;

      showProgress(stats);

      // Rate limiting
      if (i + BATCH_SIZE < docs.length) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Batch ${batchNum} failed: ${errorMessage}`);
      stats.failed += batch.length;
    }
  }

  return stats;
}

// =============================================================================
// VALIDATION
// =============================================================================

async function validateEmbeddings(supabase: SupabaseClient): Promise<void> {
  log('Validating embeddings...');

  try {
    const { data, error } = await supabase
      .from('protocol_embeddings')
      .select('embedding_model, embedding_version, count:doc_id.count()', { count: 'exact' })
      .eq('embedding_model', EMBEDDING_MODEL)
      .eq('embedding_version', EMBEDDING_VERSION)
      .single();

    if (error) {
      log(`Validation query failed: ${error.message}`);
      return;
    }

    if (data) {
      log(`Total embeddings in database: ${data.count || 0}`);
      log(`Model: ${data.embedding_model}, Version: ${data.embedding_version}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Validation failed: ${errorMessage}`);
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  log('Starting knowledge base embedding generation...');
  log(`Configuration: model=${EMBEDDING_MODEL}, batch_size=${BATCH_SIZE}, limit=${LIMIT || 'none'}`);

  // 1. Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Support both OPENAI_API_KEY and LLM_API_KEY (when provider is openai)
  const llmProvider = process.env.LLM_PROVIDER?.toLowerCase();
  let openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey && llmProvider === 'openai') {
    openaiKey = process.env.LLM_API_KEY;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - SUPABASE_SERVICE_ROLE_KEY\n\n' +
      'Set these in your .env.local file'
    );
  }

  if (!openaiKey) {
    throw new Error(
      'Missing OpenAI API key:\n' +
      '  - OPENAI_API_KEY\n' +
      '  - or LLM_API_KEY with LLM_PROVIDER=openai\n\n' +
      'Set this in your .env.local file'
    );
  }

  // 2. Initialize clients
  log('Connecting to services...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  const openai = new OpenAI({ apiKey: openaiKey });
  log('Connected successfully');

  // 3. Load knowledge base
  const allDocs = await loadKnowledgeBase();

  // 4. Get existing embeddings
  const existingEmbeddings = await getExistingEmbeddings(supabase);

  // 5. Filter documents needing embeddings
  const { toProcess, skipped } = filterDocumentsNeedingEmbeddings(allDocs, existingEmbeddings);

  // 6. Process documents
  const stats = await processDocuments(supabase, openai, toProcess);
  stats.skipped = skipped;

  // 7. Validate
  await validateEmbeddings(supabase);

  // 8. Summary
  const duration = Date.now() - stats.startTime;
  log('');
  log('='.repeat(60));
  log('SUMMARY');
  log('='.repeat(60));
  log(`Total documents: ${stats.total}`);
  log(`Processed: ${stats.processed}`);
  log(`Skipped (unchanged): ${stats.skipped}`);
  log(`Failed: ${stats.failed}`);
  log(`Duration: ${formatDuration(duration)}`);
  log(`Success rate: ${stats.processed + stats.failed > 0 ? Math.round((stats.processed / (stats.processed + stats.failed)) * 100) : 0}%`);
  log('='.repeat(60));

  if (stats.failed > 0) {
    log(`Warning: ${stats.failed} documents failed to process`);
    process.exit(1);
  }

  log('Embedding generation complete!');
}

// Run the script
main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`Embedding generation failed: ${errorMessage}`);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
