/**
 * Merced County EMS Protocol Import
 *
 * Downloads Merced County EMS protocols from countyofmerced.com,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-merced-protocols.ts
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

const AGENCY_NAME = 'Merced County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const DATA_DIR = 'data/merced-protocols';
const BASE_URL = 'https://www.countyofmerced.com';

// All Merced County EMS Protocol PDFs from document center
const PDF_SOURCES = [
  // Comprehensive Manuals
  { id: '394', number: 'Manual', title: 'EMS Policies and Procedures Manual', section: 'Reference Manual' },
  { id: '395', number: 'Adult-Protocols', title: 'Adult Treatment Protocols', section: 'Treatment Protocols' },
  { id: '396', number: 'Pediatric-Protocols', title: 'Pediatric Treatment Protocols', section: 'Treatment Protocols' },
  
  // Administrative Policies (100-200 series)
  { id: '35221', number: '130', title: 'EMS Policy Development, Revision, Deletion and Implementation', section: 'Administrative' },
  { id: '37486', number: '217', title: 'Layperson AED Programs', section: 'Administrative' },
  { id: '37470', number: '220', title: 'Emergency Medical Technician (EMT) Certification', section: 'Personnel' },
  
  // Dispatch/Response (300 series)
  { id: '17921', number: '302', title: 'ALS/BLS Tiered Dispatch and Ambulance Response', section: 'Dispatch' },
  
  // Operations (400 series)
  { id: '37693', number: '401', title: 'Physician Involvement with EMS Personnel', section: 'Operations' },
  { id: '37479', number: '402', title: 'Patient Destination', section: 'Operations' },
  { id: '29722', number: '430', title: 'First Responder System Resource Response Management', section: 'Operations' },
  { id: '36056', number: '431', title: 'Equipment Standards - EMS Units', section: 'Equipment' },
  { id: '35252', number: '450', title: 'Air and Ground Ambulance Response Time Incentive', section: 'Operations' },
  { id: '35457', number: '470', title: 'EMS Aircraft Utilization', section: 'Air Medical' },
  { id: '35306', number: '490', title: 'Fireline Emergency Medical Technician Paramedic (FEMP)', section: 'Personnel' },
  
  // Transport/Procedures (500 series)
  { id: '37082', number: '512', title: 'Trauma System Organization and Management', section: 'Trauma' },
  { id: '34307', number: '520', title: 'EMT and Paramedic Interfacility Transfer', section: 'Transport' },
  { id: '35307', number: '542', title: 'Patient Refusal of Emergency Medical Service', section: 'Operations' },
  { id: '35268', number: '560', title: 'Critical Care Transport Ambulance Authorization', section: 'Transport' },
  { id: '35270', number: '580', title: 'Monitoring of IVs by EMT Personnel', section: 'Procedures' },
  
  // Reporting (600 series)
  { id: '36858', number: '650', title: 'EMS Quality Improvement Committee', section: 'Quality Improvement' },
  { id: '18874', number: '630', title: 'Ambulance Patient Offload Time (APOT)', section: 'Reporting' },
  
  // Adult Treatment Protocols (700 series)
  { id: '48319', number: '700', title: 'General Procedures', section: 'Treatment Protocols - Adult' },
  { id: '48295', number: '702', title: 'Cardiac Arrest', section: 'Treatment Protocols - Adult' },
  { id: '35277', number: '704', title: 'Cardiac Chest Pain', section: 'Treatment Protocols - Adult' },
  { id: '37379', number: '710', title: 'Return Of Spontaneous Circulation (ROSC)', section: 'Treatment Protocols - Adult' },
  { id: '37699', number: '714', title: 'Respiratory Distress', section: 'Treatment Protocols - Adult' },
  { id: '29734', number: '706', title: 'Bradycardia', section: 'Treatment Protocols - Adult' },
  { id: '48316', number: '754', title: 'Traumatic Arrest', section: 'Treatment Protocols - Adult' },
  
  // Individual Adult Treatment Protocols from July 2022
  { id: '29732', number: 'C1', title: 'Adult Cardiac Arrest', section: 'Treatment Protocols - Adult' },
  { id: '29733', number: 'C2', title: 'Adult Cardiac Chest Pain', section: 'Treatment Protocols - Adult' },
  { id: '29734', number: 'C3', title: 'Adult Bradycardia', section: 'Treatment Protocols - Adult' },
  { id: '29736', number: 'C5', title: 'Adult ROSC', section: 'Treatment Protocols - Adult' },
  { id: '29738', number: 'R2', title: 'Adult Respiratory Distress', section: 'Treatment Protocols - Adult' },
  { id: '29721', number: 'T3', title: 'Adult Traumatic Arrest', section: 'Treatment Protocols - Adult' },
  
  // Pediatric Treatment Protocols (800 series)
  { id: '36064', number: '802', title: 'Pediatric Cardiac Arrest', section: 'Treatment Protocols - Pediatric' },
  { id: '29725', number: 'Ped-C1', title: 'Pediatric Cardiac Arrest', section: 'Treatment Protocols - Pediatric' },
  { id: '29730', number: 'Ped-T2', title: 'Pediatric Trauma', section: 'Treatment Protocols - Pediatric' },
  
  // Additional Treatment Protocols from older format
  { id: '6397', number: 'GenProc-2011', title: 'General Procedures (2011)', section: 'Reference' },
  { id: '6406', number: '9', title: 'Airway Obstruction', section: 'Treatment Protocols' },
  { id: '6416', number: '19', title: 'Childbirth', section: 'Treatment Protocols' },
  { id: '6418', number: '21', title: 'Trauma', section: 'Treatment Protocols' },
];

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
// DOWNLOAD FUNCTIONS
// ============================================================================

async function downloadPDF(docId: string, filename: string): Promise<boolean> {
  const filepath = path.join(DATA_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    if (stats.size > 1000) {
      console.log(`  Already exists: ${filename}`);
      return true;
    }
    fs.unlinkSync(filepath);
  }

  const url = `${BASE_URL}/DocumentCenter/View/${docId}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.countyofmerced.com/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${filename}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    
    // Verify it's actually a PDF
    const pdfHeader = Buffer.from(buffer.slice(0, 5)).toString();
    if (!pdfHeader.startsWith('%PDF')) {
      console.error(`  Not a PDF: ${filename} (got ${pdfHeader.substring(0, 20)})`);
      return false;
    }
    
    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log(`  Downloaded: ${filename} (${Math.round(buffer.byteLength / 1024)}KB)`);
    return true;
  } catch (err: any) {
    console.error(`  Error downloading ${filename}: ${err.message}`);
    return false;
  }
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
  console.log('MERCED COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipDownload = process.argv.includes('--skip-download');
  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create metadata.json
  const metadata = {
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_year: PROTOCOL_YEAR,
    source_url: 'https://www.countyofmerced.com/2261/Emergency-Medical-Services',
    downloaded_at: new Date().toISOString(),
    protocol_count: PDF_SOURCES.length
  };
  fs.writeFileSync(path.join(DATA_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('Created metadata.json\n');

  // Download PDFs
  if (!skipDownload) {
    console.log('Downloading PDFs...');
    let downloaded = 0;
    for (let i = 0; i < PDF_SOURCES.length; i++) {
      const source = PDF_SOURCES[i];
      const filename = `${source.number}_${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const success = await downloadPDF(source.id, filename);
      if (success) downloaded++;
      await new Promise(r => setTimeout(r, 500)); // Rate limiting
    }
    console.log(`\nDownloaded: ${downloaded}/${PDF_SOURCES.length} PDFs\n`);
  }

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing Merced County chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);
  }

  // Process PDFs and generate chunks
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  let totalProtocols = 0;
  let totalPages = 0;

  for (const source of PDF_SOURCES) {
    const filename = `${source.number}_${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`  SKIP: ${source.title} (file not found)`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filepath);
      const { text, numPages } = await parsePDF(buffer);
      totalPages += numPages;
      
      if (text.length < 100) {
        console.log(`  SKIP: ${source.title} (insufficient content)`);
        continue;
      }

      const chunks = chunkText(text);
      console.log(`  ${source.number} ${source.title}: ${numPages} pages, ${chunks.length} chunks`);
      totalProtocols++;

      for (const chunk of chunks) {
        allChunks.push({
          agency_name: AGENCY_NAME,
          state_code: STATE_CODE,
          protocol_number: source.number,
          protocol_title: source.title,
          section: source.section,
          content: chunk,
          source_pdf_url: `${BASE_URL}/DocumentCenter/View/${source.id}`,
          protocol_year: PROTOCOL_YEAR,
        });
      }
    } catch (err: any) {
      console.error(`  ERROR: ${source.title} - ${err.message}`);
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
      await new Promise(r => setTimeout(r, 200));
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
