/**
 * Orange County EMS Protocol Import
 * 
 * Parses 237 local Orange County EMS protocol PDFs and inserts them into Supabase.
 * Uses the protocol-chunker for semantic chunking.
 * 
 * Run with: npx tsx scripts/import-orange-county-protocols.ts
 * Options:
 *   --dry-run     Preview what would be imported
 *   --skip-embed  Skip embedding generation
 *   --no-clear    Don't clear existing data
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

const PDF_DIR = path.join(__dirname, '../data/orange-county-protocols');
const AGENCY_NAME = 'Orange County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2024;

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
// ORANGE COUNTY PROTOCOL PATTERNS
// ============================================================================

/**
 * Orange County uses several naming conventions:
 * - SO-M-## (Medical)
 * - SO-P-## (Pediatric)
 * - SO-T-## (Trauma)
 * - SO-O-## (OB)
 * - SPC-SO-# (Special/Tactical)
 * - Numeric IDs (12028, 102906, etc.)
 * - Named protocols with section numbers (100.30 EMCC Bylaws)
 */

function extractProtocolNumber(filename: string): string {
  // SO-M-55, SO-P-40, SO-T-10, SPC-SO-1 patterns
  const soMatch = filename.match(/^(S(?:O|PC)-[A-Z]-?\d+)/i);
  if (soMatch) return soMatch[1].toUpperCase();
  
  // Numbered section pattern (100.30 EMCC Bylaws)
  const sectionMatch = filename.match(/^(\d+\.\d+)/);
  if (sectionMatch) return sectionMatch[1];
  
  // Pure numeric ID (12028)
  const numMatch = filename.match(/^(\d{5,6})/);
  if (numMatch) return numMatch[1];
  
  // Fallback: use filename without extension
  return filename.replace(/\.pdf$/i, '').substring(0, 30);
}

function extractProtocolTitle(filename: string): string {
  const base = filename.replace(/\.pdf$/i, '');
  
  // For SO-X-## patterns, extract the descriptive part
  const soMatch = base.match(/^S(?:O|PC)-[A-Z]-?\d+\s+(.+?)(?:\s*\d{1,2}-\d{4})?(?:_\d)?$/i);
  if (soMatch) {
    return soMatch[1]
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // For numbered sections (100.30 EMCC Bylaws 10-2025)
  const sectionMatch = base.match(/^\d+\.\d+\s+(.+?)(?:\s*\d{1,2}-\d{4})?$/i);
  if (sectionMatch) {
    return sectionMatch[1].trim();
  }
  
  // Pure numeric - no meaningful title, use protocol number
  if (/^\d{5,6}$/.test(base)) {
    return `Protocol ${base}`;
  }
  
  // Generic cleanup
  return base
    .replace(/_/g, ' ')
    .replace(/\s*\d{1,2}-\d{4}(?:_\d)?$/, '') // Remove dates like 4-2024_0
    .replace(/\s+/g, ' ')
    .trim();
}

function categorizeProtocol(num: string, filename: string): string {
  const lower = filename.toLowerCase();
  const numUpper = num.toUpperCase();
  
  // By protocol code prefix
  if (numUpper.startsWith('SO-P-') || lower.includes('peds') || lower.includes('pediatric') || lower.includes('newborn')) {
    return 'Pediatric';
  }
  if (numUpper.startsWith('SO-T-') || lower.includes('trauma') || lower.includes('taser') || lower.includes('crush')) {
    return 'Trauma';
  }
  if (numUpper.startsWith('SO-O-') || lower.includes('pregnancy') || lower.includes('obstetric')) {
    return 'OB/GYN';
  }
  if (numUpper.startsWith('SPC-') || lower.includes('tac med') || lower.includes('tactical')) {
    return 'Special Operations';
  }
  if (numUpper.startsWith('SO-M-') || lower.includes('medical')) {
    // Further categorize medical protocols
    if (lower.includes('cardiac') || lower.includes('stemi') || lower.includes('arrest')) return 'Cardiac';
    if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neuro')) return 'Neurological';
    if (lower.includes('respiratory') || lower.includes('asthma') || lower.includes('copd')) return 'Respiratory';
    if (lower.includes('overdose') || lower.includes('poison') || lower.includes('toxic')) return 'Toxicology';
    if (lower.includes('sepsis') || lower.includes('diabetic') || lower.includes('hypo')) return 'Medical';
    if (lower.includes('behavioral') || lower.includes('psych')) return 'Behavioral';
    if (lower.includes('allergic') || lower.includes('anaphyl')) return 'Allergic/Anaphylaxis';
    if (lower.includes('sedation') || lower.includes('pain')) return 'Medications';
    return 'Medical';
  }
  
  // By content keywords
  if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('bradycardia') || lower.includes('tachycardia')) return 'Cardiac';
  if (lower.includes('respiratory') || lower.includes('airway') || lower.includes('ventil')) return 'Respiratory';
  if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('mental status')) return 'Neurological';
  if (lower.includes('shock') || lower.includes('hypovolemic')) return 'Shock';
  if (lower.includes('burn')) return 'Burns';
  if (lower.includes('drowning') || lower.includes('hypothermia') || lower.includes('hyperthermia')) return 'Environmental';
  if (lower.includes('lvad') || lower.includes('vad')) return 'Specialty';
  if (lower.includes('emcc') || lower.includes('bylaw') || lower.includes('policy')) return 'Administrative';
  if (lower.includes('amputation')) return 'Trauma';
  if (lower.includes('vomit') || lower.includes('nausea')) return 'Medical';
  
  // Pure numeric IDs - likely reference documents
  if (/^\d{5,6}$/.test(num)) return 'Reference';
  
  return 'General';
}

function extractYear(filename: string): number {
  // Look for date patterns like "10-2025", "4-2024", "11-25"
  const fullYearMatch = filename.match(/(\d{1,2})-(\d{4})/);
  if (fullYearMatch) {
    return parseInt(fullYearMatch[2], 10);
  }
  
  const shortYearMatch = filename.match(/(\d{1,2})-(\d{2})(?:\.pdf)?$/i);
  if (shortYearMatch) {
    const year = parseInt(shortYearMatch[2], 10);
    return year > 50 ? 1900 + year : 2000 + year;
  }
  
  return PROTOCOL_YEAR;
}

// ============================================================================
// PDF PROCESSING
// ============================================================================

async function parsePDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text
      .replace(/\f/g, '\n')
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch (error: any) {
    throw new Error(`PDF parse failed: ${error.message}`);
  }
}

async function processPDF(filePath: string): Promise<ChunkInsert[]> {
  const filename = path.basename(filePath);
  const protocolNumber = extractProtocolNumber(filename);
  const protocolTitle = extractProtocolTitle(filename);
  const section = categorizeProtocol(protocolNumber, filename);
  const year = extractYear(filename);
  
  const text = await parsePDF(filePath);
  
  if (text.length < 50) {
    return [];
  }
  
  // Use semantic chunker
  const chunks = chunkProtocol(text, protocolNumber, protocolTitle);
  
  return chunks.map(chunk => ({
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_number: protocolNumber,
    protocol_title: `${protocolNumber} - ${protocolTitle}`,
    section: section, // Use our categorization, not chunker's auto-detect
    content: chunk.content,
    source_pdf_url: `file://${filePath.replace(/\\/g, '/')}`,
    protocol_year: year
  }));
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_API_KEY) {
    return texts.map(() => []);
  }

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-3',
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

async function clearExisting(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .eq('agency_name', AGENCY_NAME)
    .eq('state_code', STATE_CODE)
    .select('id');
  
  if (error) {
    console.error('Error clearing existing data:', error.message);
    return 0;
  }
  return data?.length || 0;
}

async function insertChunks(chunks: ChunkInsert[]): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { error } = await supabase
      .from('manus_protocol_chunks')
      .insert(batch);

    if (error) {
      errors.push(`Batch ${Math.floor(i/batchSize)}: ${error.message}`);
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
  return { inserted, errors };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('ORANGE COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`PDF Directory: ${PDF_DIR}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');
  const noClear = process.argv.includes('--no-clear');

  // Get all PDF files
  const pdfFiles = fs.readdirSync(PDF_DIR)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => path.join(PDF_DIR, f));

  console.log(`Found ${pdfFiles.length} PDF files\n`);

  if (pdfFiles.length === 0) {
    console.error('No PDF files found!');
    process.exit(1);
  }

  // Clear existing data
  if (!noClear && !dryRun) {
    console.log('Clearing existing Orange County data...');
    const deleted = await clearExisting();
    console.log(`  Deleted ${deleted} existing chunks\n`);
  }

  // Process all PDFs
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  const failedFiles: string[] = [];
  const processedProtocols = new Map<string, number>();

  for (let i = 0; i < pdfFiles.length; i++) {
    const filePath = pdfFiles[i];
    const filename = path.basename(filePath);
    
    try {
      const chunks = await processPDF(filePath);
      allChunks.push(...chunks);
      
      if (chunks.length > 0) {
        const num = extractProtocolNumber(filename);
        processedProtocols.set(num, (processedProtocols.get(num) || 0) + chunks.length);
      }
      
      const pct = Math.round(((i + 1) / pdfFiles.length) * 100);
      process.stdout.write(`\r  Parsing: ${pct}% (${i + 1}/${pdfFiles.length}) - ${filename.substring(0, 35).padEnd(35)}`);
    } catch (error: any) {
      failedFiles.push(`${filename}: ${error.message}`);
    }
  }
  console.log('\n');

  console.log(`Parsed ${pdfFiles.length - failedFiles.length}/${pdfFiles.length} PDFs successfully`);
  console.log(`Generated ${allChunks.length} chunks from ${processedProtocols.size} unique protocols\n`);

  // Show breakdown by section
  const bySection = new Map<string, number>();
  allChunks.forEach(c => {
    bySection.set(c.section || 'Unknown', (bySection.get(c.section || 'Unknown') || 0) + 1);
  });
  
  console.log('Chunks by section:');
  for (const [section, count] of Array.from(bySection.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${section.padEnd(25)} ${count}`);
  }
  console.log();

  if (failedFiles.length > 0) {
    console.log(`Failed files (${failedFiles.length}):`);
    failedFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    if (failedFiles.length > 10) {
      console.log(`  ... and ${failedFiles.length - 10} more`);
    }
    console.log();
  }

  if (dryRun) {
    console.log('[DRY RUN] Would have inserted these chunks. Exiting.');
    return;
  }

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY) {
    console.log('Generating embeddings...');
    const batchSize = 96;
    
    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);
      
      try {
        const embeddings = await generateEmbeddingsBatch(texts);
        for (let j = 0; j < batch.length; j++) {
          if (embeddings[j] && embeddings[j].length > 0) {
            batch[j].embedding = embeddings[j];
          }
        }
        
        const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
        process.stdout.write(`\r  Embeddings: ${pct}% (${i + batch.length}/${allChunks.length})`);
      } catch (error: any) {
        console.error(`\n  Embedding error at batch ${Math.floor(i/batchSize)}: ${error.message}`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 250));
    }
    console.log('\n');
  } else {
    console.log(VOYAGE_API_KEY ? 'Skipping embeddings (--skip-embed)\n' : 'No VOYAGE_API_KEY - skipping embeddings\n');
  }

  // Insert into database
  console.log('Inserting into database...');
  const { inserted, errors } = await insertChunks(allChunks);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n  Agency: ${AGENCY_NAME}`);
  console.log(`  State: ${STATE_CODE}`);
  console.log(`  PDFs processed: ${pdfFiles.length - failedFiles.length}/${pdfFiles.length}`);
  console.log(`  Unique protocols: ${processedProtocols.size}`);
  console.log(`  Chunks generated: ${allChunks.length}`);
  console.log(`  Chunks inserted: ${inserted}`);
  console.log(`  Embeddings: ${skipEmbed || !VOYAGE_API_KEY ? 'Skipped' : 'Generated'}`);
  
  if (errors.length > 0) {
    console.log(`\n  Insert errors: ${errors.length}`);
    errors.slice(0, 5).forEach(e => console.log(`    - ${e}`));
  }
  
  console.log('\n✓ Orange County EMS protocols imported successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
