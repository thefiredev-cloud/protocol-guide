/**
 * Sacramento County EMS Protocols Import
 * 
 * Parses locally downloaded Sacramento County protocol PDFs and inserts them into Supabase.
 * Processes 139 PDFs from data/sacramento-protocols/
 * 
 * Run with: npx tsx scripts/import-sacramento-county-pdfs.ts
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

const PDF_DIR = path.join(__dirname, '../data/sacramento-protocols');
const AGENCY_NAME = 'Sacramento County EMS Agency';
const STATE_CODE = 'CA';
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

// ============================================================================
// HELPERS
// ============================================================================

function extractProtocolInfo(filename: string): { number: string; title: string } {
  // Handle various Sacramento naming conventions:
  // "PP-2001 Document Management System.pdf"
  // "PP- 4202 Mobile Intensive Care Nurse (MICN) Course.pdf"
  // "PP-8001 Allergic Reaction  Anaphylaxis 1.pdf"
  // "4525.01 - PSFA and Optional Skills Provider Approval - Requirements.pdf"
  // "Drug Reference Guide 2024- Effective 11.1.2025.pdf"
  
  const basename = filename.replace('.pdf', '');
  
  // Pattern: PP-XXXX or PP- XXXX
  const ppMatch = basename.match(/^PP-?\s*(\d+(?:\.\d+)?)\s+(.+)$/i);
  if (ppMatch) {
    return {
      number: ppMatch[1],
      title: ppMatch[2].replace(/\s+1$/, '').replace(/\s+/g, ' ').trim()
    };
  }
  
  // Pattern: XXXX.XX - Title
  const numMatch = basename.match(/^(\d+(?:\.\d+)?)\s*-\s*(.+)$/);
  if (numMatch) {
    return {
      number: numMatch[1],
      title: numMatch[2].replace(/\s+/g, ' ').trim()
    };
  }
  
  // Fallback: use filename as title
  return {
    number: 'REF',
    title: basename.replace(/\s+/g, ' ').trim()
  };
}

function categorizeProtocol(num: string, title: string): string {
  const n = parseFloat(num);
  const lower = title.toLowerCase();
  
  // Check for flowcharts
  if (lower.includes('flowchart')) return 'Flowcharts';
  
  // Sacramento uses number ranges per the metadata:
  // 2000: EMS System
  // 4000: Accreditation/Certification
  // 5000: Transportation/Patient Destination
  // 8000: Adult Treatment
  // 8800: Skills
  // 9000: Pediatric Treatment
  
  if (n >= 2000 && n < 3000) return 'EMS System';
  if (n >= 4000 && n < 5000) return 'Accreditation/Certification';
  if (n >= 5000 && n < 6000) return 'Transportation/Destination';
  if (n >= 8000 && n < 8800) return 'Adult Treatment';
  if (n >= 8800 && n < 9000) return 'Skills';
  if (n >= 9000 && n < 10000) return 'Pediatric Treatment';
  
  // Content-based fallbacks
  if (lower.includes('pediatric') || lower.includes('neonatal')) return 'Pediatric Treatment';
  if (lower.includes('cardiac') || lower.includes('stemi') || lower.includes('ecg')) return 'Adult Treatment';
  if (lower.includes('trauma') || lower.includes('burn') || lower.includes('shock')) return 'Adult Treatment';
  if (lower.includes('respiratory') || lower.includes('airway')) return 'Adult Treatment';
  if (lower.includes('drug') || lower.includes('reference')) return 'Reference';
  if (lower.includes('certification') || lower.includes('training')) return 'Accreditation/Certification';
  if (lower.includes('transport') || lower.includes('destination')) return 'Transportation/Destination';
  
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

// Import pdf-parse at module level to avoid repeated import issues
const pdfParse = require('pdf-parse');

async function processPDF(filePath: string): Promise<ChunkInsert[]> {
  const filename = path.basename(filePath);
  const { number: protocolNumber, title: protocolTitle } = extractProtocolInfo(filename);
  const section = categorizeProtocol(protocolNumber, protocolTitle);
  
  const dataBuffer = fs.readFileSync(filePath);
  
  // Parse PDF
  const data = await pdfParse(dataBuffer);
  
  const text = data.text
    .replace(/\f/g, '\n')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  if (text.length < 50) {
    return [];
  }
  
  const chunks = chunkText(text);
  
  return chunks.map(content => ({
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_number: protocolNumber,
    protocol_title: `${protocolNumber} - ${protocolTitle}`,
    section,
    content,
    source_pdf_url: SOURCE_URL,
    protocol_year: 2026
  }));
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearExistingSacramento(): Promise<number> {
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
  console.log('SACRAMENTO COUNTY EMS PROTOCOLS IMPORT');
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
    console.log('Clearing existing Sacramento County data...');
    const deleted = await clearExistingSacramento();
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
      process.stdout.write(`\r  Parsing: ${pct}% - ${filename.substring(0,45).padEnd(45)}`);
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
    
    // Show sample
    console.log('\nSample chunk:');
    if (allChunks.length > 0) {
      const sample = allChunks[0];
      console.log(`  Protocol: ${sample.protocol_title}`);
      console.log(`  Section: ${sample.section}`);
      console.log(`  Content preview: ${sample.content.substring(0, 150)}...`);
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
  
  // Breakdown by section
  const bySection = new Map<string, number>();
  allChunks.forEach(c => {
    bySection.set(c.section || 'Unknown', (bySection.get(c.section || 'Unknown') || 0) + 1);
  });
  
  console.log('\n  By section:');
  for (const [section, count] of Array.from(bySection.entries()).sort()) {
    console.log(`    ${section}: ${count} chunks`);
  }
  
  console.log('\n✓ Import complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
