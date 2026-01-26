/**
 * Kern County EMS Protocol Import
 *
 * Downloads Kern County EMS protocols from kernpublichealth.com,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-kern-county-protocols.ts
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

const AGENCY_NAME = 'Kern County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2026;

const DATA_DIR = 'data/kern-protocols';
const BASE_URL = 'https://www.kernpublichealth.com';

// All Kern County EMS Protocol PDFs scraped from the policies page
const PDF_SOURCES = [
  // Administrative Policies (1000 series)
  { path: '/home/showpublisheddocument/15035/638699377343170000', number: '1001.00', title: 'Investigation-Regulatory-Discipline Procedure', section: 'Administrative' },
  { path: '/home/showpublisheddocument/18757/638699399068170000', number: '1002.00', title: 'EMS Quality Improvement Program', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15037/638699399315200000', number: '1003.00', title: 'Patient Medical Record Security and Privacy Policies and Procedures', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15039/638720290856400000', number: '1004.00', title: 'EPCR Policies and Procedures', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15041/638699399859970000', number: '1004.02', title: 'EPCR QI', section: 'Administrative' },
  { path: '/home/showpublisheddocument/17074/638598248201530000', number: '1004.03', title: 'CARES Mandate Directive', section: 'Administrative' },
  { path: '/home/showpublisheddocument/14679/638598254203530000', number: '1005.00', title: 'Ambulance Service Performance Standards', section: 'Administrative' },
  { path: '/home/showpublisheddocument/14673/638518901002830000', number: '1006.00', title: 'Ambulance Rates Process', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15045/638720291684630000', number: '1007.00', title: 'Scene Control Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15047/638720293984570000', number: '1008.00', title: 'Withholding Resuscitative Measures', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15049/638699400536630000', number: '1009.00', title: 'Public Access/Layperson AED Implementation Guidelines', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15051/638699400710870000', number: '1010.00', title: 'Against Medical Advice (AMA) Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15053/638699400897400000', number: '1011.00', title: 'Accreditation of EMS Personnel Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15055/638796296386070000', number: '1012.00', title: 'Special Events Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15057/638699401452270000', number: '1013.00', title: 'Kern County Annual Protocol Update Procedure', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15059/638839422711400000', number: '1014.00', title: 'Emergency Medical Services Inappropriate Use Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15061/638699401787030000', number: '1015.00', title: 'Narcan Leave Behind Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15063/638699401964700000', number: '1016.00', title: 'Naloxone Use by Law Enforcement Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15065/638870698281600000', number: '1017.00', title: 'Telehealth Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15069/638966567317570000', number: '1018.00', title: 'Metro-Kern Hospital Redirect Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/18981/638721140411370000', number: '1019.00', title: 'EMT Provider Policy', section: 'Administrative' },
  { path: '/home/showpublisheddocument/15115/639017573950330000', number: '1020.00', title: 'Air Ambulance Performance Standards', section: 'Administrative' },
  { path: '/home/showpublisheddocument/17084/638598273744370000', number: '1021.00', title: 'Mandatory HandTevy Use', section: 'Administrative' },

  // Dispatch and Communications (2000 series)
  { path: '/home/showpublisheddocument/15071/638889690729670000', number: '2000.00', title: 'EMD Policy', section: 'Dispatch' },
  { path: '/home/showpublisheddocument/15073/638889690879400000', number: '2000.01', title: 'Directive: Implementation of MPDS v.14.0', section: 'Dispatch' },
  { path: '/home/showpublisheddocument/15117/638890324134370000', number: '2001.00', title: 'EMS Aircraft Dispatch Response Utilization Policy', section: 'Dispatch' },
  { path: '/home/showpublisheddocument/21440/638920769633030000', number: '2002.00', title: 'Second in Air Ambulance List', section: 'Dispatch' },

  // Disaster (3000 series)
  { path: '/home/showpublisheddocument/15075/638889691840330000', number: '3002.00', title: 'Kern County Operational Area CHEMPACK Deployment Protocol', section: 'Disaster' },
  { path: '/home/showpublisheddocument/15077/638889692172970000', number: '3003.00', title: 'Hospital Surge Protocol', section: 'Disaster' },
  { path: '/home/showpublisheddocument/15079/638889692690000000', number: '3004.00', title: 'Emerging Infectious Disease Response Plan', section: 'Disaster' },

  // Hospital / Specialty Care Centers (4000 series)
  { path: '/home/showpublisheddocument/15161/638889694348730000', number: '4002.00', title: 'Stroke System of Care Policy', section: 'Specialty Care' },
  { path: '/home/showpublisheddocument/15081/638889693484430000', number: '4003.00', title: 'STEMI System of Care', section: 'Specialty Care' },
  { path: '/home/showpublisheddocument/15083/638889693627570000', number: '4004.00', title: 'Pediatric Receiving Center Designation Policy', section: 'Specialty Care' },
  { path: '/home/showpublisheddocument/15085/638889693982430000', number: '4005.00', title: 'Trauma Policies and Procedures', section: 'Specialty Care' },
  { path: '/home/showpublisheddocument/15087/638889694149230000', number: '4006.00', title: 'Burn Center Designation', section: 'Specialty Care' },

  // All Provider Protocols (5000 series) - MAIN TREATMENT PROTOCOLS
  { path: '/home/showpublisheddocument/15091/639016721874570000', number: '5000.00', title: 'All Provider Protocols', section: 'Treatment Protocols' },
  { path: '/home/showpublisheddocument/19839/638792910236970000', number: '5000.01', title: 'Annual Protocol Update', section: 'Treatment Protocols' },
  { path: '/home/showpublisheddocument/19835/638799776269670000', number: '5000.02', title: 'Upcoming Provider Protocols', section: 'Treatment Protocols' },

  // EMS Non-transport Policies (6000 series)
  { path: '/home/showpublisheddocument/15125/638966601319770000', number: '6000.00', title: 'Public Safety First Aid Optional Skills Policy', section: 'Non-transport' },
  { path: '/home/showpublisheddocument/15097/638890320855430000', number: '6003.00', title: 'Fireline Paramedic Policies and Procedures', section: 'Non-transport' },
  { path: '/home/showpublisheddocument/15099/638890321136670000', number: '6003.01', title: 'Wildland Fire/Mutual Aid Paramedic Authorization Process', section: 'Non-transport' },
  { path: '/home/showpublisheddocument/15101/638890321312730000', number: '6004.00', title: 'Paramedic First Responder Policies and Procedures', section: 'Non-transport' },
  { path: '/home/showpublisheddocument/17080/638598273732470000', number: '6007.00', title: 'Advance Life Support Boat Medic Program Policy', section: 'Non-transport' },
  { path: '/home/showpublisheddocument/17082/638598273738270000', number: '6008.00', title: 'Advanced Life Support Bike Medic Program Policy', section: 'Non-transport' },

  // Critical Care Policies (7000 series)
  { path: '/home/showpublisheddocument/17076/638598272672070000', number: '7000.00', title: 'Critical Care Paramedic (CCP)', section: 'Critical Care' },
  { path: '/home/showpublisheddocument/15123/638890325004670000', number: '7005.00', title: 'FP-C CCP-C Unified Optional Scope', section: 'Critical Care' },

  // Training Programs (8000 series)
  { path: '/home/showpublisheddocument/15127/638890323006470000', number: '8001.00', title: 'Pre-Hospital Continuing Education Provider Policies and Procedures', section: 'Training' },

  // Response Units (9000 series)
  { path: '/home/showpublisheddocument/15129/638890323324600000', number: '9001.00', title: 'Provider Mandatory Inventory', section: 'Response Units' },
  { path: '/home/showpublisheddocument/15131/638890323505600000', number: '9002.00', title: 'MICU Ground Policies and Procedures', section: 'Response Units' },
  { path: '/home/showpublisheddocument/15133/638890323674300000', number: '9002.01', title: 'MICU Inspection Record', section: 'Response Units' },
  { path: '/home/showpublisheddocument/15119/638890324588470000', number: '9003.00', title: 'BLS Rescue Aircraft Policies & Procedures', section: 'Response Units' },
  { path: '/home/showpublisheddocument/15121/638890324845500000', number: '9004.00', title: 'EMS Aircraft MICU Policies & Procedures', section: 'Response Units' },
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
    if (stats.size > 1000) {
      console.log(`  Already exists: ${filename}`);
      return true;
    }
    fs.unlinkSync(filepath);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.kernpublichealth.com/',
      },
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${filename}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
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
  console.log('KERN COUNTY EMS PROTOCOL IMPORT');
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
    source_url: 'https://www.kernpublichealth.com/emergency-medical-services/policies',
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
      const url = `${BASE_URL}${source.path}`;
      const success = await downloadPDF(url, filename);
      if (success) downloaded++;
      await new Promise(r => setTimeout(r, 300)); // Rate limiting
    }
    console.log(`\nDownloaded: ${downloaded}/${PDF_SOURCES.length} PDFs\n`);
  }

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing Kern County chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);
  }

  // Process PDFs and generate chunks
  console.log('Processing PDFs...');
  const allChunks: ChunkInsert[] = [];
  let totalProtocols = 0;

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
  console.log(`  Chunks inserted: ${inserted}`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
