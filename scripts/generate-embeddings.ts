/**
 * Generate Embeddings Script
 *
 * Generates vector embeddings for all protocol chunks using Google text-embedding-004.
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

const EMBEDDING_MODEL = 'text-embedding-004';
const BATCH_SIZE = 20;
const RATE_LIMIT_DELAY_MS = 150;

// ============================================
// Initialize Clients
// ============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ============================================
// Embedding Functions
// ============================================

async function generateEmbedding(text: string): Promise<number[]> {
  const maxChars = 8000; // ~2000 tokens
  const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text;

  const result = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: truncatedText,
  });

  if (!result.embeddings || result.embeddings.length === 0) {
    throw new Error('No embedding returned from API');
  }

  return result.embeddings[0].values || [];
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Protocol Guide - Embedding Generation');
  console.log('='.repeat(60));

  // Check current embedding status
  const { count: totalCount } = await supabase
    .from('protocol_chunks')
    .select('*', { count: 'exact', head: true });

  const { count: embeddedCount } = await supabase
    .from('protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  console.log(`\nCurrent status:`);
  console.log(`  Total chunks: ${totalCount}`);
  console.log(`  With embeddings: ${embeddedCount}`);
  console.log(`  Missing embeddings: ${(totalCount || 0) - (embeddedCount || 0)}`);

  // Fetch chunks without embeddings
  const { data: chunks, error: fetchError } = await supabase
    .from('protocol_chunks')
    .select('id, content, protocol_id, section_title')
    .is('embedding', null)
    .order('protocol_id')
    .limit(500);

  if (fetchError) {
    console.error('Error fetching chunks:', fetchError);
    process.exit(1);
  }

  if (!chunks || chunks.length === 0) {
    console.log('\nAll chunks already have embeddings!');
    return;
  }

  console.log(`\nProcessing ${chunks.length} chunks...`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const progress = `[${i + 1}/${chunks.length}]`;

    try {
      // Generate embedding
      const embedding = await generateEmbedding(chunk.content);

      // Update chunk with embedding
      const { error: updateError } = await supabase
        .from('protocol_chunks')
        .update({ embedding })
        .eq('id', chunk.id);

      if (updateError) {
        throw updateError;
      }

      successCount++;
      console.log(`${progress} ${chunk.protocol_id} - ${chunk.section_title?.substring(0, 40) || 'chunk'}`);
    } catch (error) {
      errorCount++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ id: chunk.id, error: errorMsg });
      console.error(`${progress} ERROR: ${chunk.protocol_id} - ${errorMsg}`);
    }

    // Rate limiting
    await sleep(RATE_LIMIT_DELAY_MS);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Embedding Generation Complete');
  console.log('='.repeat(60));
  console.log(`  Successful: ${successCount}`);
  console.log(`  Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((e) => console.log(`  - ${e.id}: ${e.error}`));
  }

  // Final count
  const { count: finalEmbedded } = await supabase
    .from('protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  console.log(`\nFinal embedding count: ${finalEmbedded}/${totalCount}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
