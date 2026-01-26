/**
 * Riverside County EMS Protocol Import
 *
 * Imports Riverside County REMSA treatment protocols from local PDFs:
 * - 4000 series treatment protocols downloaded from rivcoready.org
 *
 * Run with: npx tsx scripts/import-riverside-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { chunkProtocol } from '../server/_core/protocol-chunker';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'Riverside County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const PDF_DIR = 'data/riverside-protocols';
const SOURCE_URL_BASE = 'https://rivcoready.org/sites/g/files/aldnop181/files/2023-10';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface ChunkInsert {
  agency_name: string;
  state_code: string;
  protocol_number: string;
  protocol_title: string;
  section: string | null;
  content: string;
  source_pdf_url: string;
  protocol_year: number;
  embedding?: number[];
}

// ============================================================================
// SECTION CATEGORIZATION
// ============================================================================

function categorizeProtocol(num: string, content: string): string {
  const lower = content.toLowerCase();

  // By protocol number series
  if (num.startsWith('41')) return 'Assessment';
  if (num.startsWith('42')) return 'Cardiac';
  if (num.startsWith('43')) return 'Respiratory';
  if (num.startsWith('44')) return 'Cardiovascular';
  if (num.startsWith('45')) return 'Neurological';
  if (num.startsWith('46')) return 'Trauma';
  if (num.startsWith('47')) return 'Toxicology/Environmental';
  if (num.startsWith('48')) return 'OB/GYN';
  if (num.startsWith('49')) return 'Pediatric';

  // Content-based fallback
  if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('stemi') || lower.includes('cpr')) {
    return 'Cardiac';
  }
  if (lower.includes('trauma') || lower.includes('injury') || lower.includes('hemorrhage') || lower.includes('bleeding')) {
    return 'Trauma';
  }
  if (lower.includes('pediatric') || lower.includes('child') || lower.includes('infant') || lower.includes('neonate')) {
    return 'Pediatric';
  }
  if (lower.includes('airway') || lower.includes('respiratory') || lower.includes('breathing') || lower.includes('intubat')) {
    return 'Respiratory';
  }
  if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neurolog') || lower.includes('altered mental')) {
    return 'Neurological';
  }
  if (lower.includes('overdose') || lower.includes('poison') || lower.includes('toxic') || lower.includes('narcan')) {
    return 'Toxicology';
  }
  if (lower.includes('pregnancy') || lower.includes('childbirth') || lower.includes('obstetric') || lower.includes('labor')) {
    return 'OB/GYN';
  }
  if (lower.includes('behavioral') || lower.includes('psychiatric') || lower.includes('agitat') || lower.includes('5150')) {
    return 'Behavioral';
  }

  return 'General';
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return { text: result.text, numPages: result.numpages };
}

function extractProtocolInfo(filename: string): { number: string; title: string } {
  // Parse filename like "4101-Introduction to Treatment Protocols.pdf"
  const match = filename.match(/^(\d{4})-(.+)\.pdf$/);
  if (match) {
    return {
      number: match[1],
      title: match[2].replace(/[-_]/g, ' ').trim(),
    };
  }
  // Fallback
  const numMatch = filename.match(/(\d{4})/);
  return {
    number: numMatch ? numMatch[1] : 'UNKNOWN',
    title: filename.replace('.pdf', ''),
  };
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY not configured');
  }

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: texts.map(t => t.substring(0, 16000)),
      input_type: 'document'
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Voyage API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingChunks(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .eq('agency_name', AGENCY_NAME)
    .eq('state_code', STATE_CODE)
    .select('id');

  if (error) {
    console.warn(`Warning: Could not clear existing chunks: ${error.message}`);
    return 0;
  }

  return data?.length || 0;
}

async function insertChunks(chunks: ChunkInsert[]): Promise<number> {
  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { error } = await supabase
      .from('manus_protocol_chunks')
      .insert(batch);

    if (error) {
      console.error(`  Batch insert error: ${error.message}`);
      for (const chunk of batch) {
        const { error: singleError } = await supabase
          .from('manus_protocol_chunks')
          .insert(chunk);
        if (!singleError) inserted++;
      }
    } else {
      inserted += batch.length;
    }

    const pct = Math.round(((i + batch.length) / chunks.length) * 100);
    process.stdout.write(`\r  Inserting: ${pct}% (${inserted}/${chunks.length})`);
  }

  console.log();
  return inserted;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('RIVERSIDE COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  try {
    // Get list of PDF files
    const pdfDir = path.resolve(process.cwd(), PDF_DIR);
    if (!fs.existsSync(pdfDir)) {
      console.error(`PDF directory not found: ${pdfDir}`);
      process.exit(1);
    }

    const pdfFiles = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf') && f.match(/^\d{4}/));
    console.log(`Found ${pdfFiles.length} protocol PDFs in ${pdfDir}\n`);

    if (pdfFiles.length === 0) {
      console.error('No protocol PDFs found. Run download-riverside-protocols.ps1 first.');
      process.exit(1);
    }

    // Clear existing chunks
    if (!dryRun) {
      console.log('Clearing existing Riverside County chunks...');
      const cleared = await clearExistingChunks();
      console.log(`  Cleared ${cleared} existing chunks\n`);
    }

    const allChunks: ChunkInsert[] = [];
    let totalProtocols = 0;

    // Process each PDF
    for (const pdfFile of pdfFiles) {
      const { number: protocolNumber, title: protocolTitle } = extractProtocolInfo(pdfFile);
      const localPath = path.join(pdfDir, pdfFile);

      console.log(`Processing: ${protocolNumber} - ${protocolTitle}`);

      try {
        const pdfBuffer = fs.readFileSync(localPath);
        const { text, numPages } = await parsePDF(pdfBuffer);
        console.log(`  Pages: ${numPages}, Text: ${text.length} chars`);

        if (text.length < 100) {
          console.log(`  SKIPPED: Insufficient text extracted`);
          continue;
        }

        const section = categorizeProtocol(protocolNumber, text);
        const sourceUrl = `${SOURCE_URL_BASE}/${protocolNumber}.pdf`;

        const chunks = chunkProtocol(text, protocolNumber, protocolTitle);
        console.log(`  Chunks: ${chunks.length}`);

        for (const chunk of chunks) {
          allChunks.push({
            agency_name: AGENCY_NAME,
            state_code: STATE_CODE,
            protocol_number: protocolNumber,
            protocol_title: protocolTitle,
            section,
            content: chunk.content,
            source_pdf_url: sourceUrl,
            protocol_year: PROTOCOL_YEAR,
          });
        }

        totalProtocols++;
      } catch (err: any) {
        console.log(`  ERROR: ${err.message}`);
      }
    }

    console.log(`\nTotal protocols processed: ${totalProtocols}`);
    console.log(`Total chunks generated: ${allChunks.length}`);

    if (dryRun) {
      console.log('\n[DRY RUN] Exiting without database changes.');
      return;
    }

    // Generate embeddings
    if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
      console.log('\nGenerating voyage-large-2 embeddings (1536 dims)...');
      const batchSize = 100;

      for (let i = 0; i < allChunks.length; i += batchSize) {
        const batch = allChunks.slice(i, i + batchSize);
        const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);

        try {
          const embeddings = await generateEmbeddingsBatch(texts);
          for (let j = 0; j < batch.length; j++) {
            batch[j].embedding = embeddings[j];
          }
        } catch (error: any) {
          console.error(`\n  Embedding error: ${error.message}`);
        }

        const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
        process.stdout.write(`\r  Progress: ${pct}%`);
        await new Promise(r => setTimeout(r, 200));
      }
      console.log();
    } else if (!VOYAGE_API_KEY) {
      console.log('\nWARNING: VOYAGE_API_KEY not set - skipping embedding generation');
    }

    // Insert chunks
    console.log('\nInserting into database...');
    const inserted = await insertChunks(allChunks);

    console.log('\n' + '='.repeat(70));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(70));
    console.log(`  Agency: ${AGENCY_NAME}`);
    console.log(`  Protocols: ${totalProtocols}`);
    console.log(`  Chunks inserted: ${inserted}`);
  } catch (error: any) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

main();
