/**
 * Simple LA County Embeddings Generator
 * Generates embeddings for chunks that don't have them yet
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY || !VOYAGE_API_KEY) {
  console.error('Missing required env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    throw new Error(`Voyage API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

async function main() {
  console.log('LA County Embeddings Generator');
  console.log('==============================\n');

  // Get chunks without embeddings for LA County
  const { data: chunks, error } = await supabase
    .from('manus_protocol_chunks')
    .select('id, protocol_title, content')
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching chunks:', error.message);
    process.exit(1);
  }

  if (!chunks || chunks.length === 0) {
    console.log('All chunks already have embeddings!');
    return;
  }

  console.log(`Found ${chunks.length} chunks without embeddings\n`);

  const batchSize = 96;
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);

    try {
      const embeddings = await generateEmbeddingsBatch(texts);

      // Update each chunk
      for (let j = 0; j < batch.length; j++) {
        const { error: updateError } = await supabase
          .from('manus_protocol_chunks')
          .update({ embedding: embeddings[j] })
          .eq('id', batch[j].id);

        if (updateError) {
          errors++;
        } else {
          processed++;
        }
      }

      const pct = Math.round(((i + batch.length) / chunks.length) * 100);
      process.stdout.write(`\rProgress: ${pct}% (${processed} done, ${errors} errors)`);

      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    } catch (err: any) {
      console.error(`\nBatch error: ${err.message}`);
      errors += batch.length;
    }
  }

  console.log('\n\n==============================');
  console.log(`Processed: ${processed}`);
  console.log(`Errors: ${errors}`);
  console.log('Done!');
}

main();
