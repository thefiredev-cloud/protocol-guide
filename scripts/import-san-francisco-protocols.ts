/**
 * San Francisco EMS Agency Protocol Import
 *
 * Imports 60 San Francisco EMS PDFs (policies, protocols, references)
 * into Supabase manus_protocol_chunks table with Voyage embeddings.
 *
 * Run with: npx tsx scripts/import-san-francisco-protocols.ts
 * Options:
 *   --dry-run     Preview what would be imported
 *   --skip-embed  Skip embedding generation (faster testing)
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

const PDF_DIR = 'data/san-francisco-protocols';
const AGENCY_NAME = 'San Francisco EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface ParsedProtocol {
  protocolNumber: string;
  protocolTitle: string;
  section: string;
  content: string;
  sourceFile: string;
}

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
// FILENAME PARSING
// ============================================================================

/**
 * Extract protocol info from San Francisco EMSA filename
 * Examples:
 *   EMSA-Policy-2000-Prehospital-Personnel-Standards... -> Policy 2000
 *   EMSA-Protocol-2.04-Cardiac-Arrest... -> Protocol 2.04
 *   EMSA-Reference-14-Droperidol... -> Reference 14
 */
function parseFilename(filename: string): { type: string; number: string; title: string } {
  // Remove .pdf and clean up hash suffixes
  let clean = filename.replace(/\.pdf$/i, '').replace(/_[A-Za-z0-9]{7}$/, '');
  
  // Extract type and number patterns
  const policyMatch = clean.match(/EMSA-Policy-(\d+(?:\.\d+)?[a-z]?)-(.+)/i);
  const protocolMatch = clean.match(/EMSA-Protocol-(\d+(?:\.\d+)?(?:\.[A-Z])?)-(.+)/i);
  const referenceMatch = clean.match(/EMSA-Reference-(\d+(?:\.\d+)?)-(.+)/i);
  
  let type = 'Document';
  let number = '';
  let title = '';
  
  if (policyMatch) {
    type = 'Policy';
    number = policyMatch[1];
    title = policyMatch[2];
  } else if (protocolMatch) {
    type = 'Protocol';
    number = protocolMatch[1];
    title = protocolMatch[2];
  } else if (referenceMatch) {
    type = 'Reference';
    number = referenceMatch[1];
    title = referenceMatch[2];
  } else {
    // Fallback for other filenames
    title = clean.replace(/^EMSA[-_]?/i, '').replace(/[-_]/g, ' ');
    number = 'SF-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  
  // Clean up title
  title = title
    .replace(/[-_]/g, ' ')
    .replace(/Post[\s-]?Pub(lic)?[\s-]?Comment/gi, '')
    .replace(/EMSAC[\s-]?\w+[\s-]?\d+/gi, '')
    .replace(/Final[\s-]?\d+[\s-]?\d+[\s-]?\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (title.length < 3) title = `${type} ${number}`;
  
  return { type, number, title };
}

/**
 * Categorize protocol based on content
 */
function categorizeProtocol(content: string, fileType: string): string {
  const lower = content.toLowerCase();
  
  // Policy sections
  if (fileType === 'Policy') {
    if (lower.includes('personnel') || lower.includes('accreditation') || lower.includes('scope of practice')) {
      return 'Personnel/Scope';
    }
    if (lower.includes('equipment') || lower.includes('vehicle') || lower.includes('supply')) {
      return 'Equipment';
    }
    if (lower.includes('destination') || lower.includes('transfer') || lower.includes('triage')) {
      return 'Transport/Triage';
    }
    if (lower.includes('consent') || lower.includes('refusal') || lower.includes('dnr') || lower.includes('polst')) {
      return 'Consent/End-of-Life';
    }
    return 'Administrative';
  }
  
  // Protocol sections
  if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('dysrhythmia') || lower.includes('tachycardia')) {
    return 'Cardiac';
  }
  if (lower.includes('trauma') || lower.includes('bleeding') || lower.includes('extremity')) {
    return 'Trauma';
  }
  if (lower.includes('pediatric') || lower.includes('child')) {
    return 'Pediatric';
  }
  if (lower.includes('airway') || lower.includes('cpap') || lower.includes('pulmonary') || lower.includes('respiratory')) {
    return 'Respiratory';
  }
  if (lower.includes('seizure') || lower.includes('altered mental') || lower.includes('stroke')) {
    return 'Neurological';
  }
  if (lower.includes('overdose') || lower.includes('poison') || lower.includes('hazmat')) {
    return 'Toxicology';
  }
  if (lower.includes('agitat') || lower.includes('violent') || lower.includes('behavioral')) {
    return 'Behavioral';
  }
  if (lower.includes('sepsis') || lower.includes('shock')) {
    return 'Medical';
  }
  if (lower.includes('pain') || lower.includes('analgesia')) {
    return 'Pain Management';
  }
  if (lower.includes('allergic') || lower.includes('anaphylax')) {
    return 'Allergic';
  }
  if (lower.includes('assessment') || lower.includes('survey')) {
    return 'Assessment';
  }
  if (lower.includes('special') || lower.includes('austere') || lower.includes('blast')) {
    return 'Special Circumstances';
  }
  if (lower.includes('medication') || lower.includes('droperidol') || lower.includes('olanzapine')) {
    return 'Medications';
  }
  
  return 'General';
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function parsePDF(filePath: string): Promise<{ text: string; numPages: number }> {
  const buffer = fs.readFileSync(filePath);
  
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return { text: result.text || '', numPages: result.total || 0 };
  } catch (error: any) {
    console.error(`  PDF parse error for ${path.basename(filePath)}: ${error.message}`);
    return { text: '', numPages: 0 };
  }
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
      // Try individual inserts if batch fails
      for (const chunk of batch) {
        const { error: singleError } = await supabase
          .from('manus_protocol_chunks')
          .insert(chunk);

        if (!singleError) {
          inserted++;
        } else {
          console.error(`    Single insert failed: ${singleError.message}`);
        }
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
  console.log('SAN FRANCISCO EMS AGENCY PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  // Get PDF files
  const pdfDir = path.resolve(process.cwd(), PDF_DIR);
  if (!fs.existsSync(pdfDir)) {
    console.error(`PDF directory not found: ${pdfDir}`);
    process.exit(1);
  }

  const pdfFiles = fs.readdirSync(pdfDir)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .sort();

  console.log(`Found ${pdfFiles.length} PDF files in ${PDF_DIR}\n`);

  // Parse all PDFs
  const allProtocols: ParsedProtocol[] = [];
  const sectionCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();

  for (let i = 0; i < pdfFiles.length; i++) {
    const filename = pdfFiles[i];
    const filePath = path.join(pdfDir, filename);
    
    process.stdout.write(`\rParsing: ${i + 1}/${pdfFiles.length} - ${filename.substring(0, 50)}...`);

    // Parse filename for metadata
    const { type, number, title } = parseFilename(filename);
    
    // Parse PDF content
    const { text, numPages } = await parsePDF(filePath);
    
    if (text.length < 100) {
      console.log(`\n  Skipping ${filename} - too little content (${text.length} chars)`);
      continue;
    }

    // Categorize
    const section = categorizeProtocol(text, type);
    
    // Build protocol record
    const protocolNumber = type === 'Document' ? number : `${type[0]}-${number}`;
    const fullTitle = `${type} ${number}: ${title}`;
    
    allProtocols.push({
      protocolNumber,
      protocolTitle: fullTitle.substring(0, 200),
      section,
      content: text,
      sourceFile: filename,
    });
    
    // Track stats
    sectionCounts.set(section, (sectionCounts.get(section) || 0) + 1);
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  }

  console.log('\n');
  console.log(`Parsed ${allProtocols.length} protocols\n`);

  // Show breakdown
  console.log('By Type:');
  for (const [type, count] of Array.from(typeCounts.entries()).sort()) {
    console.log(`  ${type}: ${count}`);
  }
  console.log('\nBy Section:');
  for (const [section, count] of Array.from(sectionCounts.entries()).sort()) {
    console.log(`  ${section}: ${count}`);
  }
  console.log();

  // Sample protocols
  console.log('Sample protocols:');
  for (const p of allProtocols.slice(0, 8)) {
    console.log(`  ${p.protocolNumber}: ${p.protocolTitle.substring(0, 55)}...`);
  }
  if (allProtocols.length > 8) {
    console.log(`  ... and ${allProtocols.length - 8} more`);
  }
  console.log();

  if (dryRun) {
    console.log('[DRY RUN] Exiting without database changes.');
    return;
  }

  // Clear existing
  console.log('Clearing existing San Francisco chunks...');
  const cleared = await clearExistingChunks();
  console.log(`  Cleared ${cleared} existing chunks\n`);

  // Generate chunks
  console.log('Generating chunks...');
  const allChunks: ChunkInsert[] = [];

  for (const protocol of allProtocols) {
    const chunks = chunkProtocol(
      protocol.content,
      protocol.protocolNumber,
      protocol.protocolTitle
    );

    for (const chunk of chunks) {
      allChunks.push({
        agency_name: AGENCY_NAME,
        state_code: STATE_CODE,
        protocol_number: protocol.protocolNumber,
        protocol_title: protocol.protocolTitle,
        section: protocol.section,
        content: chunk.content,
        source_pdf_url: `San Francisco EMSA: ${protocol.sourceFile}`,
        protocol_year: PROTOCOL_YEAR,
      });
    }
  }

  console.log(`  Generated ${allChunks.length} chunks from ${allProtocols.length} protocols\n`);

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY) {
    console.log('Generating embeddings...');
    const batchSize = 100;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const texts = batch.map(c => `${c.protocol_title}\n\n${c.content}`);

      try {
        const embeddings = await generateEmbeddingsBatch(texts);
        for (let j = 0; j < batch.length; j++) {
          batch[j].embedding = embeddings[j];
        }

        const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
        process.stdout.write(`\r  Embedding progress: ${pct}%`);
      } catch (error: any) {
        console.error(`\n  Embedding error at batch ${i}: ${error.message}`);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 250));
    }
    console.log('\n');
  } else if (!VOYAGE_API_KEY) {
    console.log('VOYAGE_API_KEY not set - skipping embeddings\n');
  }

  // Insert
  console.log('Inserting into database...');
  const inserted = await insertChunks(allChunks);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n  PDFs processed: ${pdfFiles.length}`);
  console.log(`  Protocols extracted: ${allProtocols.length}`);
  console.log(`  Chunks generated: ${allChunks.length}`);
  console.log(`  Chunks inserted: ${inserted}`);
  console.log(`  Embeddings: ${skipEmbed || !VOYAGE_API_KEY ? 'Skipped' : 'Generated'}`);
  console.log(`\n  Target table: manus_protocol_chunks`);
  console.log(`  Agency: ${AGENCY_NAME}`);
  console.log(`  State: ${STATE_CODE}`);
}

main();
