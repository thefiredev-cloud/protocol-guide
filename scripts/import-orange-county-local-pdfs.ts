/**
 * Orange County EMS Protocol Import
 * 
 * Parses locally downloaded Orange County protocol PDFs and inserts them into Supabase.
 * Processes 237 PDFs from data/orange-county-protocols/
 * 
 * Run with: npx tsx scripts/import-orange-county-local-pdfs.ts
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

const PDF_DIR = path.join(__dirname, '../data/orange-county-protocols');
const AGENCY_NAME = 'Orange County EMS Agency';
const STATE_CODE = 'CA';
const BASE_PDF_URL = 'https://ochealthinfo.com/sites/hca/files/';

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
// HELPERS
// ============================================================================

function extractProtocolInfo(filename: string, pdfText: string): { number: string; title: string } {
  const baseName = filename.replace('.pdf', '');
  
  // Try to extract policy number from filename first (e.g., "100.30 EMCC Bylaws 10-2025.pdf")
  const policyMatch = baseName.match(/^(\d+\.\d+)\s+(.+?)(?:\s+\d{1,2}-\d{4})?$/);
  if (policyMatch) {
    return {
      number: policyMatch[1],
      title: policyMatch[2].trim()
    };
  }
  
  // Try to extract from PDF content (first few lines often have policy/protocol number)
  const lines = pdfText.split('\n').filter(l => l.trim().length > 0).slice(0, 20);
  
  // Look for patterns like "Policy 300.40" or "Standing Order 5010"
  for (const line of lines) {
    const policyNumMatch = line.match(/(?:Policy|Procedure|Standing Order|Protocol)\s*#?\s*(\d+(?:\.\d+)?)/i);
    if (policyNumMatch) {
      return {
        number: policyNumMatch[1],
        title: extractTitleFromContent(lines)
      };
    }
    
    // Look for explicit number patterns at start of lines
    const numMatch = line.match(/^(\d{3,4}(?:\.\d+)?)\s*[-–:]\s*(.+)/);
    if (numMatch) {
      return {
        number: numMatch[1],
        title: numMatch[2].trim()
      };
    }
  }
  
  // Fallback: use numeric filename or generate from content
  const numericMatch = baseName.match(/^(\d+)$/);
  if (numericMatch) {
    // Try to get title from PDF content
    const title = extractTitleFromContent(lines);
    return {
      number: numericMatch[1],
      title: title || `Protocol ${numericMatch[1]}`
    };
  }
  
  return {
    number: baseName.substring(0, 20),
    title: baseName.replace(/[-_]/g, ' ')
  };
}

function extractTitleFromContent(lines: string[]): string {
  // Skip headers/footers and look for title-like content
  for (const line of lines.slice(0, 15)) {
    const trimmed = line.trim();
    // Skip short lines, dates, page numbers
    if (trimmed.length < 10) continue;
    if (/^(page|date|effective|revised|approved)/i.test(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(trimmed)) continue;
    
    // Look for all-caps titles or reasonable title lines
    if (trimmed.length > 10 && trimmed.length < 100) {
      return trimmed.substring(0, 80);
    }
  }
  return '';
}

function categorizeProtocol(num: string, content: string): string {
  const n = parseFloat(num);
  const lower = content.toLowerCase().substring(0, 2000);
  
  // Orange County policy number ranges
  if (n >= 10 && n < 100) return 'Authority/Administration';
  if (n >= 100 && n < 200) return 'Emergency Medical Care Committee';
  if (n >= 200 && n < 300) return 'System Service Providers';
  if (n >= 300 && n < 400) return 'Medical Control';
  if (n >= 400 && n < 500) return 'Personnel Certification';
  if (n >= 500 && n < 600) return 'Training Programs';
  if (n >= 600 && n < 700) return 'Medical Facilities';
  if (n >= 700 && n < 800) return 'Transportation/Ambulance';
  if (n >= 800 && n < 900) return 'Communications';
  if (n >= 900 && n < 1000) return 'Disaster Response';
  
  // Standing orders (typically 4-5 digit numbers)
  if (n >= 5000 && n < 6000) {
    if (lower.includes('cardiac') || lower.includes('stemi') || lower.includes('arrest')) return 'Cardiac - ALS';
    if (lower.includes('trauma') || lower.includes('burn') || lower.includes('bleed')) return 'Trauma - ALS';
    if (lower.includes('pediatric') || lower.includes('child') || lower.includes('newborn')) return 'Pediatrics - ALS';
    if (lower.includes('obstetric') || lower.includes('delivery') || lower.includes('labor')) return 'OB - ALS';
    if (lower.includes('environmental') || lower.includes('heat') || lower.includes('hypothermia')) return 'Environmental - ALS';
    return 'General - ALS';
  }
  if (n >= 6000 && n < 7000) return 'BLS Standing Orders';
  if (n >= 7000 && n < 8000) return 'First Responder Standing Orders';
  if (n >= 8000 && n < 9000) return 'Fire Service ARN Standing Orders';
  
  // Content-based categorization fallback
  if (lower.includes('cardiac') || lower.includes('heart') || lower.includes('stemi') || lower.includes('arrest')) return 'Cardiac';
  if (lower.includes('trauma') || lower.includes('injury')) return 'Trauma';
  if (lower.includes('pediatric') || lower.includes('child')) return 'Pediatric';
  if (lower.includes('respiratory') || lower.includes('asthma') || lower.includes('airway')) return 'Respiratory';
  if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neuro')) return 'Neurological';
  if (lower.includes('overdose') || lower.includes('poison') || lower.includes('toxic')) return 'Toxicology';
  if (lower.includes('behavioral') || lower.includes('psych')) return 'Behavioral';
  if (lower.includes('disaster') || lower.includes('mci') || lower.includes('triage')) return 'Disaster/MCI';
  
  return 'General';
}

function chunkText(text: string, maxChunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(c => c.length > 50);
}

function cleanPdfText(text: string): string {
  return text
    .replace(/\f/g, '\n')
    .replace(/\r/g, '')
    .replace(/[^\S\n]+/g, ' ')  // normalize whitespace but keep newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
      'Authorization': `Bearer ${VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: texts.map(t => t.substring(0, 8000)),
      input_type: 'document'
    })
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
  
  const dataBuffer = fs.readFileSync(filePath);
  
  // Dynamic import of pdf-parse v1
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(dataBuffer);
  
  const text = cleanPdfText(data.text || '');
  
  if (text.length < 50) {
    return [];
  }
  
  const { number: protocolNumber, title: protocolTitle } = extractProtocolInfo(filename, text);
  const section = categorizeProtocol(protocolNumber, text);
  
  const chunks = chunkText(text);
  
  return chunks.map(content => ({
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_number: protocolNumber,
    protocol_title: `${protocolNumber} - ${protocolTitle}`,
    section,
    content,
    source_pdf_url: `${BASE_PDF_URL}${encodeURIComponent(filename)}`,
    protocol_year: 2025
  }));
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingOrangeCounty(): Promise<number> {
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

async function insertChunks(chunks: ChunkInsert[]): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];
  const batchSize = 25;

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
  console.log('ORANGE COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
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
    const deleted = await clearExistingOrangeCounty();
    console.log(`  Deleted ${deleted} existing chunks\n`);
  }

  // Process all PDFs
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  const failedFiles: string[] = [];

  for (let i = 0; i < pdfFiles.length; i++) {
    const filePath = pdfFiles[i];
    const filename = path.basename(filePath);
    
    try {
      const chunks = await processPDF(filePath);
      allChunks.push(...chunks);
      
      const pct = Math.round(((i + 1) / pdfFiles.length) * 100);
      process.stdout.write(`\r  Parsing: ${pct}% - ${filename.padEnd(40).substring(0,40)}`);
    } catch (error: any) {
      failedFiles.push(`${filename}: ${error.message}`);
    }
  }
  console.log('\n');

  console.log(`Parsed ${pdfFiles.length - failedFiles.length} PDFs successfully`);
  console.log(`Generated ${allChunks.length} chunks\n`);

  if (failedFiles.length > 0) {
    console.log('Failed files:');
    failedFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    if (failedFiles.length > 10) {
      console.log(`  ... and ${failedFiles.length - 10} more`);
    }
    console.log();
  }

  if (dryRun) {
    console.log('[DRY RUN] Would insert these chunks:');
    const bySection = new Map<string, number>();
    allChunks.forEach(c => {
      bySection.set(c.section || 'Unknown', (bySection.get(c.section || 'Unknown') || 0) + 1);
    });
    
    console.log('\nBy section:');
    for (const [section, count] of Array.from(bySection.entries()).sort()) {
      console.log(`  ${section}: ${count} chunks`);
    }
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
          batch[j].embedding = embeddings[j];
        }
        
        const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
        process.stdout.write(`\r  Embeddings: ${pct}%`);
      } catch (error: any) {
        console.error(`\n  Embedding error at batch ${i}: ${error.message}`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 300));
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
  console.log(`  Embeddings: ${skipEmbed ? 'Skipped' : 'Generated'}`);
  
  if (errors.length > 0) {
    console.log(`\n  Errors: ${errors.length}`);
    errors.slice(0, 5).forEach(e => console.log(`    - ${e}`));
  }
  
  console.log('\n✓ Import complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
