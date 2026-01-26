/**
 * San Joaquin County EMS Protocol Import
 *
 * Imports San Joaquin County EMS protocols from local PDFs,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-san-joaquin-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'San Joaquin County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const DATA_DIR = 'data/san-joaquin-protocols';
const BASE_URL = 'https://www.sjgov.org/department/ems';

// Section mapping based on protocol number ranges
function getSection(number: string): string {
  const num = parseInt(number.split('_')[0], 10);
  if (num >= 1000 && num < 2000) return 'Administrative';
  if (num >= 2000 && num < 2100) return 'Personnel General';
  if (num >= 2100 && num < 2200) return 'Dispatchers';
  if (num >= 2200 && num < 2300) return 'EMR Certification';
  if (num >= 2300 && num < 2400) return 'EMT Certification';
  if (num >= 2400 && num < 2600) return 'Paramedic';
  if (num >= 2600 && num < 2700) return 'MICN';
  if (num >= 2700 && num < 2800) return 'Discipline';
  if (num >= 2800 && num < 3000) return 'Training Programs';
  if (num >= 3000 && num < 3200) return 'Dispatch';
  if (num >= 3200 && num < 3400) return 'Response';
  if (num >= 3400 && num < 4000) return 'Communications';
  if (num >= 4000 && num < 4100) return 'ALS Authorization';
  if (num >= 4100 && num < 4200) return 'Equipment & Medications';
  if (num >= 4200 && num < 4300) return 'Controlled Substances';
  if (num >= 4300 && num < 4400) return 'Field Internship';
  if (num >= 4400 && num < 4500) return 'Specialty Transport';
  if (num >= 4500 && num < 4700) return 'Aircraft';
  if (num >= 4700 && num < 4800) return 'Trauma System';
  if (num >= 4800 && num < 4900) return 'STEMI/Stroke';
  if (num >= 4900 && num < 5000) return 'Hospital Standards';
  if (num >= 5000 && num < 5200) return 'Authority & Policies';
  if (num >= 5200 && num < 5300) return 'Destination';
  if (num >= 5500 && num < 5600) return 'BLS Protocols';
  if (num >= 5700 && num < 5800) return 'ALS Protocols';
  if (num >= 6000 && num < 6400) return 'Reporting & Data';
  if (num >= 6600 && num < 6800) return 'Quality Improvement';
  if (num >= 7000 && num < 8000) return 'Disaster/MCI';
  return 'General';
}

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

interface PDFInfo {
  filename: string;
  number: string;
  title: string;
  section: string;
}

// ============================================================================
// PDF DISCOVERY
// ============================================================================

function discoverPDFs(): PDFInfo[] {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.pdf'));
  const pdfs: PDFInfo[] = [];

  for (const filename of files) {
    // Parse filename like "5700_Advanced_Life_Support_Protocols_Version_1_9_1.pdf"
    const match = filename.match(/^(\d+(?:-\d+)?)[_\s]+(.+)\.pdf$/i);
    if (match) {
      const number = match[1];
      const title = match[2]
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      pdfs.push({
        filename,
        number,
        title,
        section: getSection(number),
      });
    } else if (filename.toLowerCase().includes('toc') || filename.toLowerCase().includes('table_of_contents')) {
      pdfs.push({
        filename,
        number: 'TOC',
        title: 'Table of Contents',
        section: 'Index',
      });
    } else {
      // Fallback - use filename as title
      const title = filename.replace('.pdf', '').replace(/_/g, ' ');
      pdfs.push({
        filename,
        number: 'MISC',
        title,
        section: 'General',
      });
    }
  }

  // Sort by number
  pdfs.sort((a, b) => {
    const numA = parseInt(a.number.split('-')[0], 10) || 0;
    const numB = parseInt(b.number.split('-')[0], 10) || 0;
    return numA - numB;
  });

  return pdfs;
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return { text: result.text, numPages: result.numpages };
}

// ============================================================================
// CHUNKING
// ============================================================================

function chunkText(text: string, maxChunkSize: number = 1500): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const cleanPara = para.replace(/\s+/g, ' ').trim();
    if (!cleanPara || cleanPara.length < 20) continue;

    if (currentChunk.length + cleanPara.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = cleanPara;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + cleanPara;
    }
  }

  if (currentChunk.trim().length > 50) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
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
      // Try individual inserts
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
  console.log('SAN JOAQUIN COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  // Discover PDFs
  console.log('Discovering PDFs...');
  const pdfs = discoverPDFs();
  console.log(`  Found ${pdfs.length} PDF files\n`);

  if (pdfs.length === 0) {
    console.error('No PDFs found in data directory!');
    process.exit(1);
  }

  // Update metadata.json
  const metadata = {
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_year: PROTOCOL_YEAR,
    source_url: BASE_URL,
    imported_at: new Date().toISOString(),
    protocol_count: pdfs.length
  };
  fs.writeFileSync(path.join(DATA_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('Updated metadata.json\n');

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing San Joaquin County chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);
  }

  // Process PDFs and generate chunks
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  let totalProtocols = 0;
  let totalPages = 0;

  for (const pdf of pdfs) {
    const filepath = path.join(DATA_DIR, pdf.filename);

    try {
      const buffer = fs.readFileSync(filepath);
      const { text, numPages } = await parsePDF(buffer);
      totalPages += numPages;

      if (text.length < 100) {
        console.log(`  SKIP: ${pdf.title} (insufficient content)`);
        continue;
      }

      const chunks = chunkText(text);
      console.log(`  ${pdf.number} ${pdf.title}: ${numPages} pages, ${chunks.length} chunks`);
      totalProtocols++;

      for (const chunk of chunks) {
        allChunks.push({
          agency_name: AGENCY_NAME,
          state_code: STATE_CODE,
          protocol_number: pdf.number,
          protocol_title: pdf.title,
          section: pdf.section,
          content: chunk,
          source_pdf_url: `${BASE_URL}/policies#${pdf.number}`,
          protocol_year: PROTOCOL_YEAR,
        });
      }
    } catch (err: any) {
      console.error(`  ERROR: ${pdf.title} - ${err.message}`);
    }
  }

  console.log(`\nTotal protocols: ${totalProtocols}`);
  console.log(`Total pages: ${totalPages}`);
  console.log(`Total chunks: ${allChunks.length}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    return;
  }

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
    console.log('\nGenerating embeddings (voyage-large-2, 1536 dims)...');
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
        console.error(`\n  Embedding error at batch ${i}: ${error.message}`);
      }

      const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
      process.stdout.write(`\r  Progress: ${pct}%`);
      await new Promise(r => setTimeout(r, 200)); // Rate limiting
    }
    console.log();
  }

  // Insert chunks
  console.log('\nInserting into database...');
  const inserted = await insertChunks(allChunks);

  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`  Agency: ${AGENCY_NAME}`);
  console.log(`  Protocols processed: ${totalProtocols}`);
  console.log(`  Total pages: ${totalPages}`);
  console.log(`  Chunks inserted: ${inserted}`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
