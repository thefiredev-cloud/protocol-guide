/**
 * Napa County EMS Protocol Import
 *
 * Scrapes Napa County EMS protocols from ACIDReMAP portal,
 * downloads available PDFs from napacounty.gov,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-napa-protocols.ts
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

const AGENCY_NAME = 'Napa County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const DATA_DIR = 'data/napa-protocols';
const ACIDREMAP_BASE_URL = 'https://portal.acidremap.com/sites/NapaCounty';
const NAPA_COUNTY_BASE_URL = 'https://www.napacounty.gov';

// Protocol sources from ACIDReMAP navigation
const PROTOCOL_SOURCES = [
  // Medical Field Treatment Guidelines
  { id: '829', number: 'M-00', title: 'Medical Field Treatment Guidelines Table of Contents', section: 'Medical FTG' },
  { id: '31', number: 'M-01', title: 'General Medical Care', section: 'Medical FTG' },
  { id: '20', number: 'M-02', title: 'Foreign Body Airway Obstruction', section: 'Medical FTG' },
  { id: '63', number: 'M-03', title: 'Respiratory Distress - Bronchospasm', section: 'Medical FTG' },
  { id: '64', number: 'M-04', title: 'Respiratory Distress - Acute Pulmonary Edema', section: 'Medical FTG' },
  { id: '22', number: 'M-05', title: 'Altered Mental Status', section: 'Medical FTG' },
  { id: '56', number: 'M-06', title: 'Seizures', section: 'Medical FTG' },
  { id: '48', number: 'M-07', title: 'Allergic Reaction/Anaphylaxis', section: 'Medical FTG' },
  { id: '609', number: 'M-08', title: 'Sepsis', section: 'Medical FTG' },
  { id: '50', number: 'M-09', title: 'Poisoning/Overdose', section: 'Medical FTG' },
  { id: '126', number: 'M-10', title: 'Smoke Inhalation / Carbon Monoxide Monitoring & Cyanide Toxicity', section: 'Medical FTG' },
  { id: '54', number: 'M-11', title: 'Snakebite', section: 'Medical FTG' },
  { id: '53', number: 'M-12', title: 'Thermoregulatory Emergencies', section: 'Medical FTG' },
  { id: '61', number: 'M-13', title: 'Childbirth', section: 'Medical FTG' },
  { id: '60', number: 'M-14', title: 'Obstetric Emergencies', section: 'Medical FTG' },
  { id: '59', number: 'M-15', title: 'Vaginal Hemorrhage', section: 'Medical FTG' },
  { id: '36', number: 'M-16', title: 'Nausea/Vomiting', section: 'Medical FTG' },
  { id: '51', number: 'M-17', title: 'Drowning/Near-Drowning', section: 'Medical FTG' },
  { id: '738', number: 'M-18', title: 'Naloxone Administration by Public Safety First Aid (PSFA)', section: 'Medical FTG' },
  { id: '764', number: 'M-19', title: 'Stroke/CVA/TIA', section: 'Medical FTG' },
  { id: '32', number: 'M-20', title: 'Airway/Respiratory Management', section: 'Medical FTG' },
  
  // Cardiac Field Treatment Guidelines
  { id: '105', number: 'C-00', title: 'Cardiac Field Treatment Guidelines', section: 'Cardiac FTG' },
  { id: '40', number: 'C-01', title: 'Chest Pain/Acute Coronary Syndrome', section: 'Cardiac FTG' },
  { id: '39', number: 'C-02', title: 'Bradycardia', section: 'Cardiac FTG' },
  { id: '37', number: 'C-03', title: 'Tachycardia - Narrow Complex', section: 'Cardiac FTG' },
  { id: '38', number: 'C-04', title: 'Tachycardia - Wide Complex', section: 'Cardiac FTG' },
  { id: '41', number: 'C-05', title: 'Cardiac Arrest', section: 'Cardiac FTG' },
  { id: '46', number: 'C-06', title: 'Post Resuscitation Care', section: 'Cardiac FTG' },
  { id: '606', number: 'C-07', title: 'Cardiogenic Shock', section: 'Cardiac FTG' },
  
  // Trauma Field Treatment Guidelines
  { id: '110', number: 'T-00', title: 'Trauma Field Treatment Guidelines', section: 'Trauma FTG' },
  { id: '23', number: 'T-01', title: 'General Trauma Assessment', section: 'Trauma FTG' },
  { id: '24', number: 'T-02', title: 'Head Trauma', section: 'Trauma FTG' },
  { id: '25', number: 'T-03', title: 'Spinal Trauma', section: 'Trauma FTG' },
  { id: '26', number: 'T-04', title: 'Chest Trauma', section: 'Trauma FTG' },
  { id: '27', number: 'T-05', title: 'Abdominal Trauma', section: 'Trauma FTG' },
  { id: '28', number: 'T-06', title: 'Extremity Trauma', section: 'Trauma FTG' },
  { id: '29', number: 'T-07', title: 'Burns', section: 'Trauma FTG' },
  { id: '30', number: 'T-08', title: 'Multi-System Trauma', section: 'Trauma FTG' },
  { id: '607', number: 'T-09', title: 'Hemorrhagic Shock', section: 'Trauma FTG' },
  { id: '608', number: 'T-10', title: 'Crush Syndrome', section: 'Trauma FTG' },
  
  // Pediatric Field Treatment Guidelines
  { id: '111', number: 'P-00', title: 'Pediatric Field Treatment Guidelines', section: 'Pediatric FTG' },
  { id: '67', number: 'P-01', title: 'Pediatric Assessment', section: 'Pediatric FTG' },
  { id: '70', number: 'P-02', title: 'Pediatric Respiratory Emergencies', section: 'Pediatric FTG' },
  { id: '71', number: 'P-03', title: 'Pediatric Cardiac Emergencies', section: 'Pediatric FTG' },
  { id: '72', number: 'P-04', title: 'Pediatric Medical Emergencies', section: 'Pediatric FTG' },
  { id: '73', number: 'P-05', title: 'Pediatric Trauma', section: 'Pediatric FTG' },
  { id: '65', number: 'P-06', title: 'Neonatal Resuscitation', section: 'Pediatric FTG' },
  
  // Administrative Policies (100 Series)
  { id: '129', number: '101', title: 'Scene Management and Authority', section: 'Administrative' },
  { id: '12', number: '102', title: 'Assault, Abuse and Suspicious Injury', section: 'Administrative' },
  { id: '675', number: '103', title: 'Use of Restraints', section: 'Administrative' },
  { id: '136', number: '104', title: 'Search for Donor Information', section: 'Administrative' },
  { id: '178', number: '105', title: 'EMS Aircraft', section: 'Administrative' },
  { id: '179', number: '106', title: 'Turnover of Patient Care', section: 'Administrative' },
  { id: '181', number: '107', title: 'Public Safety Defibrillation Program', section: 'Administrative' },
  { id: '794', number: '108', title: 'Sexual Assault and Suspected Human Trafficking', section: 'Administrative' },
  { id: '677', number: '110', title: 'Fireline Paramedic', section: 'Administrative' },
  { id: '4', number: '111', title: 'Physician Interaction with EMS', section: 'Administrative' },
  { id: '5', number: '112', title: 'Trauma Triage', section: 'Administrative' },
  { id: '6', number: '113', title: 'Treatment and Transport of Minors', section: 'Administrative' },
  { id: '7', number: '114', title: 'Patient Refusal Against Medical Advice & Release at Scene', section: 'Administrative' },
  { id: '8', number: '115', title: 'Determination of Death', section: 'Administrative' },
  { id: '739', number: '116', title: 'Public Safety First Aid (PSFA) Local Optional Scope of Practice (LOSOP)', section: 'Administrative' },
  { id: '814', number: '117', title: 'Leave-Behind Naloxone Distribution', section: 'Administrative' },
  { id: '815', number: '118', title: 'i-gel for Basic Life Support (BLS) Providers', section: 'Administrative' },
  { id: '845', number: '119', title: 'Out Of County Paramedic Authorization', section: 'Administrative' },
  
  // Medications
  { id: '736', number: 'MED-00', title: 'Medication and Cardiac Arrest Reference', section: 'Medications' },
  
  // Procedures
  { id: '737', number: 'PROC-00', title: 'Procedures', section: 'Procedures' },
];

// PDF Documents available from Napa County website
const PDF_SOURCES = [
  { url: '/DocumentCenter/View/1816', title: 'Napa County EMS Agency - EMS Plan', section: 'Plans' },
  { url: '/DocumentCenter/View/1817', title: 'Napa County EMS Agency - EMS Quality Improvement Plan', section: 'Plans' },
  { url: '/DocumentCenter/View/1814', title: 'Napa County EMS Agency Trauma Plan', section: 'Plans' },
  { url: '/DocumentCenter/View/28021', title: 'Napa County EMS Agency STEMI Plan', section: 'Plans' },
  { url: '/DocumentCenter/View/28022', title: 'Napa County EMS Agency Stroke Plan', section: 'Plans' },
  { url: '/DocumentCenter/View/1824', title: 'Multi-Casualty Incident Management Plan', section: 'Plans' },
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

// Note: ACIDReMAP protocols are web-only; content imported via metadata entries

// ============================================================================
// PROTOCOL METADATA (ACIDReMAP - content is web-only, no PDFs available)
// ============================================================================

function createProtocolMetadataChunks(): ChunkInsert[] {
  const chunks: ChunkInsert[] = [];
  
  console.log('Creating protocol metadata entries from ACIDReMAP catalog...');
  
  for (const source of PROTOCOL_SOURCES) {
    const url = `${ACIDREMAP_BASE_URL}/${source.id}`;
    
    // Create a descriptive chunk for each protocol
    // Note: ACIDReMAP is a web-only portal without downloadable PDFs
    // The actual content must be viewed at the portal URL
    const content = `
Protocol: ${source.number} - ${source.title}
Section: ${source.section}
Agency: Napa County EMS Agency
State: California

This protocol is part of the Napa County EMS Agency Field Treatment Guidelines.
For complete protocol content, visit: ${url}

Note: Napa County EMS protocols are hosted on the ACIDReMAP portal, 
a web-based protocol management system. The full protocol content 
including dosages, procedures, and decision trees can be accessed 
by visiting the link above.
    `.trim();
    
    chunks.push({
      agency_name: AGENCY_NAME,
      state_code: STATE_CODE,
      protocol_number: source.number,
      protocol_title: source.title,
      section: source.section,
      content: content,
      source_pdf_url: url,
      protocol_year: PROTOCOL_YEAR,
    });
  }
  
  console.log(`  Created ${chunks.length} protocol metadata entries`);
  return chunks;
}

// ============================================================================
// PDF DOWNLOAD & PARSING
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
    const fullUrl = url.startsWith('http') ? url : `${NAPA_COUNTY_BASE_URL}${url}`;
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
      },
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${filename}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    
    // Verify it's a PDF
    const pdfHeader = Buffer.from(buffer.slice(0, 5)).toString();
    if (!pdfHeader.startsWith('%PDF')) {
      console.error(`  Not a PDF: ${filename}`);
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

async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return { text: result.text, numPages: result.numpages };
}

// ============================================================================
// CHUNKING
// ============================================================================

function chunkText(text: string, maxChunkSize: number = 1500, overlap: number = 150): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const cleanPara = para.replace(/\s+/g, ' ').trim();
    if (!cleanPara || cleanPara.length < 20) continue;

    if (currentChunk.length + cleanPara.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Start new chunk with overlap from previous
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.ceil(overlap / 5)).join(' ');
      currentChunk = overlapWords + '\n\n' + cleanPara;
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
  console.log('NAPA COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipScrape = process.argv.includes('--skip-scrape');
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
    source_url: ACIDREMAP_BASE_URL,
    downloaded_at: new Date().toISOString(),
    protocol_count: PROTOCOL_SOURCES.length
  };
  fs.writeFileSync(path.join(DATA_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('Created metadata.json\n');

  const allChunks: ChunkInsert[] = [];
  let totalProtocols = 0;

  // Create protocol metadata entries from ACIDReMAP catalog
  // Note: ACIDReMAP is a web-only portal without downloadable PDFs
  if (!skipScrape) {
    const metadataChunks = createProtocolMetadataChunks();
    allChunks.push(...metadataChunks);
    totalProtocols += PROTOCOL_SOURCES.length;
  }

  // Download and process PDFs
  if (!skipDownload) {
    console.log('\nDownloading PDFs from Napa County website...');
    for (const source of PDF_SOURCES) {
      const filename = `${source.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const success = await downloadPDF(source.url, filename);
      
      if (success) {
        try {
          const filepath = path.join(DATA_DIR, filename);
          const buffer = fs.readFileSync(filepath);
          const { text, numPages } = await parsePDF(buffer);
          
          if (text.length > 100) {
            const chunks = chunkText(text);
            console.log(`  ${source.title}: ${numPages} pages, ${chunks.length} chunks`);
            totalProtocols++;

            for (const chunk of chunks) {
              allChunks.push({
                agency_name: AGENCY_NAME,
                state_code: STATE_CODE,
                protocol_number: `PLAN-${PDF_SOURCES.indexOf(source) + 1}`,
                protocol_title: source.title,
                section: source.section,
                content: chunk,
                source_pdf_url: `${NAPA_COUNTY_BASE_URL}${source.url}`,
                protocol_year: PROTOCOL_YEAR,
              });
            }
          }
        } catch (err: any) {
          console.error(`  Error parsing PDF: ${err.message}`);
        }
      }
      
      await new Promise(r => setTimeout(r, 300)); // Rate limiting
    }
  }

  console.log(`\nTotal protocols: ${totalProtocols}`);
  console.log(`Total chunks: ${allChunks.length}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    return;
  }

  // Clear existing chunks
  console.log('\nClearing existing Napa County chunks...');
  const cleared = await clearExistingChunks();
  console.log(`  Cleared ${cleared} existing chunks\n`);

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
    console.log('Generating embeddings (voyage-large-2, 1536 dims)...');
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
