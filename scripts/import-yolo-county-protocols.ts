/**
 * Yolo County EMS Protocol Import
 *
 * Imports Yolo County EMS protocols from the YEMSA website.
 * Downloads PDFs, parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-yolo-county-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
// Using native fetch for downloads

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'Yolo County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const DATA_DIR = 'data/yolo-protocols';
const BASE_URL = 'https://www.yolocounty.gov';

// All YEMSA Treatment Protocols PDFs
const PDF_SOURCES = [
  { path: '/home/showpublisheddocument/59631/638651883526730000', title: 'Protocols Section TOC', section: 'Index' },
  { path: '/home/showpublisheddocument/59577/638855974551570000', title: 'Acute Cerebrovascular Accident (Stroke)', section: 'Neurological' },
  { path: '/home/showpublisheddocument/59579/638211181637600000', title: 'Acute Respiratory Distress', section: 'Respiratory' },
  { path: '/home/showpublisheddocument/59581/638527653352730000', title: 'Agitated and/or Combative Patients', section: 'Behavioral' },
  { path: '/home/showpublisheddocument/59583/638527653679030000', title: 'Airway Obstruction', section: 'Respiratory' },
  { path: '/home/showpublisheddocument/59585/638211182721230000', title: 'Allergic Reaction & Anaphylaxis', section: 'Medical' },
  { path: '/home/showpublisheddocument/59587/638855974967570000', title: 'Altered Level of Consciousness (ALOC)', section: 'Neurological' },
  { path: '/home/showpublisheddocument/59589/638527653986030000', title: 'Burns', section: 'Trauma' },
  { path: '/home/showpublisheddocument/59591/637632311145970000', title: 'Chest Pain/Discomfort with Cardiac Etiology', section: 'Cardiac' },
  { path: '/home/showpublisheddocument/59593/638855975364130000', title: 'Childbirth', section: 'OB/GYN' },
  { path: '/home/showpublisheddocument/59595/638527654599300000', title: 'Crush Injury Syndrome', section: 'Trauma' },
  { path: '/home/showpublisheddocument/59597/637001855745570000', title: 'Determination of Death', section: 'Administrative' },
  { path: '/home/showpublisheddocument/59599/638527654926870000', title: 'Dystonic Reaction', section: 'Neurological' },
  { path: '/home/showpublisheddocument/59601/638855976473600000', title: 'External Hemorrhage Control', section: 'Trauma' },
  { path: '/home/showpublisheddocument/59603/638527655682270000', title: 'Heat Illness', section: 'Environmental' },
  { path: '/home/showpublisheddocument/59605/638527655974570000', title: 'Hypothermia', section: 'Environmental' },
  { path: '/home/showpublisheddocument/59607/638855977485500000', title: 'Ingestion - Overdose - Poisoning', section: 'Toxicology' },
  { path: '/home/showpublisheddocument/59609/638855977955870000', title: 'Medical Cardiac Arrest', section: 'Cardiac' },
  { path: '/home/showpublisheddocument/59611/638855978605000000', title: 'Mental Health Crisis Response Triage', section: 'Behavioral' },
  { path: '/home/showpublisheddocument/59617/638527656335170000', title: 'Nausea & Vomiting', section: 'Medical' },
  { path: '/home/showpublisheddocument/59619/638527656686730000', title: 'Neonatal Resuscitation', section: 'Pediatric' },
  { path: '/home/showpublisheddocument/59621/638855979411030000', title: 'Nerve Agent Treatment', section: 'Toxicology' },
  { path: '/home/showpublisheddocument/59623/638855980792030000', title: 'Pain Management', section: 'Medical' },
  { path: '/home/showpublisheddocument/59625/637001856121930000', title: 'Pediatric BRUE', section: 'Pediatric' },
  { path: '/home/showpublisheddocument/59627/637001856129430000', title: 'Pediatric Patient Care', section: 'Pediatric' },
  { path: '/home/showpublisheddocument/59629/638211184758200000', title: 'Post Resuscitation Care', section: 'Cardiac' },
  { path: '/home/showpublisheddocument/59633/638527657454970000', title: 'Sedation', section: 'Medical' },
  { path: '/home/showpublisheddocument/59635/638855981302830000', title: 'Seizure', section: 'Neurological' },
  { path: '/home/showpublisheddocument/59637/637632298685970000', title: 'Shock', section: 'Medical' },
  { path: '/home/showpublisheddocument/59639/638527658262930000', title: 'Snake Bite', section: 'Environmental' },
  { path: '/home/showpublisheddocument/59641/637632298302830000', title: 'Spinal Motion Restriction (SMR)', section: 'Trauma' },
  { path: '/home/showpublisheddocument/77049/638651884883530000', title: 'Suspected Opioid Withdrawal', section: 'Toxicology' },
  { path: '/home/showpublisheddocument/59643/638527658593570000', title: 'Suspected Sepsis', section: 'Medical' },
  { path: '/home/showpublisheddocument/59645/638527658952370000', title: 'Symptomatic Bradycardia', section: 'Cardiac' },
  { path: '/home/showpublisheddocument/59647/638527659328970000', title: 'Tachycardia with Pulses', section: 'Cardiac' },
  { path: '/home/showpublisheddocument/59649/638527659712830000', title: 'Tasered Patients', section: 'Medical' },
  { path: '/home/showpublisheddocument/59651/638211185117870000', title: 'Tension Pneumothorax', section: 'Trauma' },
  { path: '/home/showpublisheddocument/59655/638855982075370000', title: 'Trauma Patient Care', section: 'Trauma' },
  { path: '/home/showpublisheddocument/67945/638855982993600000', title: 'Traumatic Cardiac Arrest', section: 'Cardiac' },
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

async function downloadPDF(url: string, filename: string): Promise<boolean> {
  const filepath = path.join(DATA_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    if (stats.size > 1000) {  // File exists and has content
      console.log(`  Already exists: ${filename}`);
      return true;
    }
    fs.unlinkSync(filepath);  // Remove empty/corrupt file
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.yolocounty.gov/',
      },
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${filename}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log(`  Downloaded: ${filename}`);
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
  console.log('YOLO COUNTY EMS PROTOCOL IMPORT');
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
    source_url: 'https://www.yolocounty.gov/government/general-government-departments/health-human-services/providers-partners/yolo-emergency-medical-services-agency-yemsa/yemsa-policies-protocols',
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
      const filename = `${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const url = `${BASE_URL}${source.path}`;
      const success = await downloadPDF(url, filename);
      if (success) downloaded++;
      await new Promise(r => setTimeout(r, 300)); // Rate limiting
    }
    console.log(`\nDownloaded: ${downloaded}/${PDF_SOURCES.length} PDFs\n`);
  }

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing Yolo County chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);
  }

  // Process PDFs and generate chunks
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  let totalProtocols = 0;

  for (const source of PDF_SOURCES) {
    const filename = `${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`  SKIP: ${source.title} (file not found)`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filepath);
      const { text, numPages } = await parsePDF(buffer);
      
      if (text.length < 100) {
        console.log(`  SKIP: ${source.title} (insufficient content)`);
        continue;
      }

      const chunks = chunkText(text);
      console.log(`  ${source.title}: ${numPages} pages, ${chunks.length} chunks`);
      totalProtocols++;

      // Generate protocol number from document ID
      const docIdMatch = source.path.match(/showpublisheddocument\/(\d+)/);
      const protocolNumber = docIdMatch ? `YOLO-${docIdMatch[1]}` : `YOLO-${totalProtocols.toString().padStart(3, '0')}`;

      for (const chunk of chunks) {
        allChunks.push({
          agency_name: AGENCY_NAME,
          state_code: STATE_CODE,
          protocol_number: protocolNumber,
          protocol_title: source.title,
          section: source.section,
          content: chunk,
          source_pdf_url: `${BASE_URL}${source.path}`,
          protocol_year: PROTOCOL_YEAR,
        });
      }
    } catch (err: any) {
      console.error(`  ERROR: ${source.title} - ${err.message}`);
    }
  }

  console.log(`\nTotal protocols: ${totalProtocols}`);
  console.log(`Total chunks: ${allChunks.length}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    return;
  }

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
    console.log('\nGenerating embeddings...');
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
  console.log(`  Chunks inserted: ${inserted}`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
