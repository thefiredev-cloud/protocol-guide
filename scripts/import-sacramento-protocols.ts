/**
 * Sacramento County EMS Protocol Import
 *
 * Parses locally downloaded Sacramento County protocol PDFs and inserts them into Supabase.
 * Processes PDFs from data/sacramento-protocols/
 *
 * Run with: npx tsx scripts/import-sacramento-protocols.ts
 * Options:
 *   --dry-run     Preview what would be imported
 *   --skip-embed  Skip embedding generation (faster testing)
 *   --no-clear    Don't clear existing data first
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

const PDF_DIR = path.join(__dirname, '../data/sacramento-protocols');
const AGENCY_NAME = 'Sacramento County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2026;
const SOURCE_URL = 'https://dhs.saccounty.gov/PUB/EMS/Pages/Policy%20Pages/Policies.aspx';

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

interface SacramentoMetadata {
  agency_name: string;
  state_code: string;
  categories: {
    [key: string]: {
      name: string;
      description: string;
      count: number;
    };
  };
}

// ============================================================================
// SACRAMENTO PROTOCOL PATTERNS
// ============================================================================

/**
 * Extract protocol number from filename
 * Examples:
 *   "PP-8001 Allergic Reaction  Anaphylaxis 1.pdf" -> "PP-8001"
 *   "PP-9016 Pediatric Parameters 1.pdf" -> "PP-9016"
 *   "4525.01 - PSFA and Optional Skills..." -> "4525.01"
 */
function extractProtocolNumber(filename: string): string {
  // Match PP-XXXX pattern
  const ppMatch = filename.match(/^PP-?\s*(\d+(?:\.\d+)?)/i);
  if (ppMatch) {
    return `PP-${ppMatch[1]}`;
  }

  // Match standalone number pattern
  const numMatch = filename.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) {
    return numMatch[1];
  }

  // Fallback: use sanitized filename
  return filename.replace(/\.pdf$/i, '').substring(0, 20);
}

/**
 * Extract protocol title from filename
 */
function extractProtocolTitle(filename: string): string {
  // Remove .pdf extension
  let title = filename.replace(/\.pdf$/i, '');

  // Remove leading protocol number patterns
  title = title
    .replace(/^PP-?\s*\d+(?:\.\d+)?\s*[-–]?\s*/i, '')
    .replace(/^\d+(?:\.\d+)?\s*[-–]?\s*/i, '')
    .replace(/\s+1$/, '') // Remove trailing " 1" (version indicator)
    .replace(/FLOWCHART\s*/i, '') // Handle flowchart versions
    .replace(/\s+/g, ' ')
    .trim();

  return title || filename.replace(/\.pdf$/i, '');
}

/**
 * Categorize protocol by number range (Sacramento specific)
 */
function categorizeByNumber(protocolNum: string): string {
  // Extract numeric portion
  const numMatch = protocolNum.match(/(\d+)/);
  if (!numMatch) return 'General';

  const num = parseInt(numMatch[1], 10);

  // Sacramento category ranges from metadata
  if (num >= 9000 && num < 10000) return 'Pediatric';
  if (num >= 8800 && num < 9000) return 'Skills/Procedures';
  if (num >= 8000 && num < 8800) return 'Adult Treatment';
  if (num >= 5000 && num < 6000) return 'Transportation/Destination';
  if (num >= 4000 && num < 5000) return 'Accreditation/Certification';
  if (num >= 2000 && num < 3000) return 'EMS System';

  return 'Administrative';
}

/**
 * Enhanced categorization using content keywords
 */
function categorizeProtocol(protocolNum: string, title: string, content: string): string {
  const lower = (title + ' ' + content).toLowerCase();

  // Pediatric (by title or number)
  if (lower.includes('pediatric') || lower.includes('neonatal') || lower.includes('brue')) {
    return 'Pediatric';
  }

  // Skills/Procedures
  if (
    lower.includes('intubation') ||
    lower.includes('vascular access') ||
    lower.includes('pacing') ||
    lower.includes('airway') ||
    protocolNum.includes('88')
  ) {
    return 'Skills/Procedures';
  }

  // Cardiac
  if (
    lower.includes('cardiac') ||
    lower.includes('stemi') ||
    lower.includes('dysrhythmia') ||
    lower.includes('arrest')
  ) {
    return 'Cardiac';
  }

  // Trauma
  if (lower.includes('trauma') || lower.includes('hemorrhage') || lower.includes('burn')) {
    return 'Trauma';
  }

  // Respiratory
  if (lower.includes('respiratory') || lower.includes('asthma') || lower.includes('airway')) {
    return 'Respiratory';
  }

  // Neurological
  if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neurolog')) {
    return 'Neurological';
  }

  // Toxicology
  if (
    lower.includes('overdose') ||
    lower.includes('poison') ||
    lower.includes('narcotic') ||
    lower.includes('naloxone')
  ) {
    return 'Toxicology';
  }

  // Behavioral
  if (lower.includes('behavioral') || lower.includes('restraint') || lower.includes('mental health')) {
    return 'Behavioral';
  }

  // OB
  if (lower.includes('childbirth') || lower.includes('obstetric') || lower.includes('pregnancy')) {
    return 'OB/GYN';
  }

  // Environmental
  if (lower.includes('environmental') || lower.includes('hazmat') || lower.includes('nerve agent')) {
    return 'Environmental';
  }

  // Medications
  if (lower.includes('drug reference') || lower.includes('medication') || lower.includes('buprenorphine')) {
    return 'Medications';
  }

  // Fall back to number-based categorization
  return categorizeByNumber(protocolNum);
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    console.warn('No VOYAGE_API_KEY - skipping embeddings');
    return texts.map(() => []);
  }

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: texts.map((t) => t.substring(0, 16000)),
      input_type: 'document',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Voyage API error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

// ============================================================================
// PDF PROCESSING
// ============================================================================

async function processPDF(filePath: string): Promise<ChunkInsert[]> {
  const filename = path.basename(filePath);
  const protocolNumber = extractProtocolNumber(filename);
  const protocolTitle = extractProtocolTitle(filename);

  // Read and parse PDF
  const dataBuffer = fs.readFileSync(filePath);

  let text: string;
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const pdfData = await pdfParse(dataBuffer);
    text = pdfData.text;
  } catch (error: any) {
    // Silently skip - will be counted in failedFiles
    return [];
  }

  // Clean text
  text = text
    .replace(/\f/g, '\n')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (text.length < 50) {
    return [];
  }

  // Categorize
  const section = categorizeProtocol(protocolNumber, protocolTitle, text);

  // Chunk using existing protocol chunker
  const chunks = chunkProtocol(text, protocolNumber, `${protocolNumber} - ${protocolTitle}`);

  return chunks.map((chunk) => ({
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_number: protocolNumber,
    protocol_title: `${protocolNumber} - ${protocolTitle}`,
    section,
    content: chunk.content,
    source_pdf_url: `${SOURCE_URL}#${encodeURIComponent(filename)}`,
    protocol_year: PROTOCOL_YEAR,
  }));
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingChunks(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .eq('agency_name', AGENCY_NAME)
    .select('id');

  if (error) {
    console.error('Error clearing existing data:', error.message);
    return 0;
  }
  return data?.length || 0;
}

async function insertChunks(
  chunks: ChunkInsert[]
): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { error } = await supabase.from('manus_protocol_chunks').insert(batch);

    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize)}: ${error.message}`);
      // Try individual inserts
      for (const chunk of batch) {
        const { error: singleError } = await supabase
          .from('manus_protocol_chunks')
          .insert(chunk);

        if (!singleError) {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
    }

    // Progress
    const pct = Math.round(((i + batch.length) / chunks.length) * 100);
    process.stdout.write(`\r  Inserting: ${pct}% (${inserted} rows)`);
  }

  console.log();
  return { inserted, errors };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('SACRAMENTO COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`PDF Directory: ${PDF_DIR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');
  const noClear = process.argv.includes('--no-clear');

  // Get all PDF files
  const pdfFiles = fs
    .readdirSync(PDF_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => path.join(PDF_DIR, f));

  console.log(`Found ${pdfFiles.length} PDF files\n`);

  if (pdfFiles.length === 0) {
    console.error('No PDF files found!');
    process.exit(1);
  }

  // Clear existing data
  if (!noClear && !dryRun) {
    console.log('Clearing existing Sacramento County data...');
    const deleted = await clearExistingChunks();
    console.log(`  Deleted ${deleted} existing chunks\n`);
  }

  // Process all PDFs
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  const failedFiles: string[] = [];
  const protocolCounts = new Map<string, number>();

  for (let i = 0; i < pdfFiles.length; i++) {
    const filePath = pdfFiles[i];
    const filename = path.basename(filePath);

    try {
      const chunks = await processPDF(filePath);
      allChunks.push(...chunks);

      // Track protocol for stats
      if (chunks.length > 0) {
        const section = chunks[0].section || 'Unknown';
        protocolCounts.set(section, (protocolCounts.get(section) || 0) + 1);
      }

      const pct = Math.round(((i + 1) / pdfFiles.length) * 100);
      process.stdout.write(
        `\r  Parsing: ${pct}% - ${filename.padEnd(50).substring(0, 50)}`
      );
    } catch (error: any) {
      failedFiles.push(`${filename}: ${error.message}`);
    }
  }
  console.log('\n');

  console.log(`Parsed ${pdfFiles.length - failedFiles.length} PDFs successfully`);
  console.log(`Generated ${allChunks.length} chunks\n`);

  // Show breakdown
  console.log('Protocol breakdown by category:');
  for (const [section, count] of Array.from(protocolCounts.entries()).sort()) {
    console.log(`  ${section}: ${count} protocols`);
  }
  console.log();

  // Show chunk breakdown
  const chunksBySection = new Map<string, number>();
  allChunks.forEach((c) => {
    chunksBySection.set(c.section || 'Unknown', (chunksBySection.get(c.section || 'Unknown') || 0) + 1);
  });

  console.log('Chunk breakdown by category:');
  for (const [section, count] of Array.from(chunksBySection.entries()).sort()) {
    console.log(`  ${section}: ${count} chunks`);
  }
  console.log();

  if (failedFiles.length > 0) {
    console.log('Failed files:');
    failedFiles.slice(0, 10).forEach((f) => console.log(`  - ${f}`));
    if (failedFiles.length > 10) {
      console.log(`  ... and ${failedFiles.length - 10} more`);
    }
    console.log();
  }

  if (dryRun) {
    console.log('[DRY RUN] Would insert these chunks. Exiting.');
    return;
  }

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY) {
    console.log('Generating embeddings...');
    const batchSize = 96;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const texts = batch.map((c) => `${c.protocol_title}\n\n${c.content}`);

      try {
        const embeddings = await generateEmbeddingsBatch(texts);
        for (let j = 0; j < batch.length; j++) {
          batch[j].embedding = embeddings[j];
        }

        const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
        process.stdout.write(`\r  Embeddings: ${pct}%`);
      } catch (error: any) {
        console.error(`\n  Embedding error at batch ${i}: ${error.message}`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log('\n');
  } else {
    console.log('Skipping embeddings\n');
  }

  // Insert into database
  console.log('Inserting into database...');
  const { inserted, errors } = await insertChunks(allChunks);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n  Agency: ${AGENCY_NAME}`);
  console.log(`  State: ${STATE_CODE}`);
  console.log(`  PDFs processed: ${pdfFiles.length - failedFiles.length}/${pdfFiles.length}`);
  console.log(`  Chunks generated: ${allChunks.length}`);
  console.log(`  Chunks inserted: ${inserted}`);
  console.log(`  Embeddings: ${skipEmbed || !VOYAGE_API_KEY ? 'Skipped' : 'Generated'}`);

  if (errors.length > 0) {
    console.log(`\n  Errors: ${errors.length}`);
    errors.slice(0, 5).forEach((e) => console.log(`    - ${e}`));
  }

  console.log('\n✓ Import complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
