/**
 * San Luis Obispo County EMS Protocol Import
 *
 * Downloads and imports San Luis Obispo County EMS protocols.
 *
 * Run with: npx tsx scripts/import-san-luis-obispo-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { chunkProtocol } from '../server/_core/protocol-chunker';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const AGENCY_NAME = 'San Luis Obispo County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2024;

const BASE_URL = 'https://www.slocounty.ca.gov';
const PROTOCOLS_BASE = '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines';

// Protocol URLs extracted from the site
const PROTOCOL_PAGES = [
  '/600-bls-and-als-treatment-protocols-4-15-2017',
  '/601-attachment-a-universal-definitions-4-15-2017',
  '/601-universal-3-1-2022',
  '/602-airway-management-7-1-2023',
  '/603-pain-management-3-1-2022',
  '/610-abdominal-flank-pain-medical-8-1-19',
  '/611-allergic-reaction-anaphylaxis-5-1-2021',
  '/612-altered-mental-status-6-1-2019',
  '/613-behavioral-emergencies-8-1-19',
  '/614-ingestion-poisoning-od-8-1-19',
  '/615-severe-nausea-vomiting-8-1-19',
  '/616-respiratory-bronchospasm-asthma-copd-croup-7-1',
  '/617-respiratory-distress-pulmonary-edema-8-1-2019',
  '/618-respiratory-distress-opiate-overdose-11-2-2022',
  '/619-shock-medical-hypotension-sepsis-8-1-2019',
  '/620-seizure-active-8-1-2019',
  '/621-suspected-cva-tia-6-1-2019',
  '/622-opioid-withdrawal-1-1-2026',
  '/630-bites-stings-snake-bites-8-1-2019',
  '/631-hyperthermia-hypothermia-8-1-2019',
  '/640-adult-cardiac-chest-pain-acute-coronary-syndro',
  '/641-pulselss-cardiac-arrest-atraumatic-7-1-2023',
  '/642-supraventricular-tachycarida-8-1-2019',
  '/643-ventricular-tachycarida-with-pulses-8-1-2019',
  '/644-symptomatic-bradycardia-10-1-21',
  '/645-atrial-fibrillation-with-rvr-1-1-2026',
  '/650-childbirth-8-1-2019',
  '/651-newborn-care-8-1-2019',
  '/660-general-trauma-8-1-2019',
  '/661-drowning-1-1-2026',
  '/661-traumatic-cardiac-arrest-8-1-2019',
  '/662-burns-8-1-2019',
  '/701-capnography-end-tidal-co2-monitoring-8-1-2019',
  '/702-spinal-motion-restriction-smr-8-1-2019',
  '/703-continuous-positive-airway-pressure-cpap-6-1-2',
  '/704-needle-cricothyrotomy-8-1-2019',
  '/705-needle-thoracostomy-8-1-2019',
  '/706-attachment-a-state-emsa-approved-hemostatic-dr',
  '/706-hemorrhage-control-toutniquet-hemostatic-dress',
  '/707-12-lead-ecg-8-1-2019',
  '/708-automatic-external-defibrillator-aed-8-1-2019',
  '/709-intranasal-medication-8-1-2019',
  '/710-vascular-access-and-monitoring-7-1-2023',
  '/711-use-of-restraints-8-1-2019',
  '/712-high-performance-cpr-(hpcpr)-8-1-2019',
  '/713-pelvic-binder-application-8-1-2019',
  '/714-tranexamic-acid-txa-administration-8-1-2019',
  '/716-transcutaneous-pacing-tcp-10-1-21',
  '/717-endotracheal-intubation-7-01-2023',
  '/718-supraglottic-airway-device-7-01-2023',
];

const DATA_DIR = 'data/san-luis-obispo-protocols';

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
  sourceUrl: string;
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
// SECTION CATEGORIZATION
// ============================================================================

function categorizeProtocol(num: string, content: string): string {
  const lower = content.toLowerCase();
  const numLower = num.toLowerCase();

  // By protocol number ranges
  if (num.startsWith('6') && parseInt(num.substring(0, 3)) >= 640 && parseInt(num.substring(0, 3)) <= 649) {
    return 'Cardiac';
  }
  if (num.startsWith('6') && parseInt(num.substring(0, 3)) >= 660 && parseInt(num.substring(0, 3)) <= 669) {
    return 'Trauma';
  }
  if (num.startsWith('6') && parseInt(num.substring(0, 3)) >= 650 && parseInt(num.substring(0, 3)) <= 659) {
    return 'OB/GYN';
  }
  if (num.startsWith('7')) {
    return 'Procedures';
  }
  if (num.startsWith('6') && parseInt(num.substring(0, 3)) >= 601 && parseInt(num.substring(0, 3)) <= 603) {
    return 'General';
  }
  
  // By content
  if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('stemi') || lower.includes('cpr') || lower.includes('tachycardia') || lower.includes('bradycardia') || lower.includes('fibrillation')) {
    return 'Cardiac';
  }
  if (lower.includes('trauma') || lower.includes('injury') || lower.includes('hemorrhage') || lower.includes('bleeding') || lower.includes('burn')) {
    return 'Trauma';
  }
  if (lower.includes('pediatric') || lower.includes('child') || lower.includes('infant') || lower.includes('neonate') || lower.includes('newborn')) {
    return 'Pediatric';
  }
  if (lower.includes('airway') || lower.includes('respiratory') || lower.includes('breathing') || lower.includes('intubat') || lower.includes('asthma') || lower.includes('copd') || lower.includes('pulmonary')) {
    return 'Respiratory';
  }
  if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neurolog') || lower.includes('altered mental') || lower.includes('cva')) {
    return 'Neurological';
  }
  if (lower.includes('overdose') || lower.includes('poison') || lower.includes('toxic') || lower.includes('opioid') || lower.includes('ingestion')) {
    return 'Toxicology';
  }
  if (lower.includes('pregnancy') || lower.includes('childbirth') || lower.includes('obstetric') || lower.includes('labor') || lower.includes('delivery')) {
    return 'OB/GYN';
  }
  if (lower.includes('behavioral') || lower.includes('psychiatric') || lower.includes('agitat')) {
    return 'Behavioral';
  }
  if (lower.includes('hyperthermia') || lower.includes('hypothermia') || lower.includes('environmental') || lower.includes('bite') || lower.includes('sting') || lower.includes('drown')) {
    return 'Environmental';
  }
  if (lower.includes('pain') || lower.includes('nausea') || lower.includes('vomiting')) {
    return 'Medical';
  }
  if (lower.includes('allergic') || lower.includes('anaphylaxis')) {
    return 'Allergic/Immunologic';
  }
  if (lower.includes('shock') || lower.includes('sepsis') || lower.includes('hypotension')) {
    return 'Shock';
  }

  return 'General';
}

// ============================================================================
// PDF DOWNLOAD AND PARSING
// ============================================================================

async function downloadPDF(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(outputPath);
          downloadPDF(redirectUrl.startsWith('http') ? redirectUrl : BASE_URL + redirectUrl, outputPath)
            .then(resolve);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        console.warn(`  Warning: HTTP ${response.statusCode} for ${url}`);
        file.close();
        resolve(false);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      console.warn(`  Download error: ${err.message}`);
      resolve(false);
    });
  });
}

async function parsePDF(filePath: string): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default;
  const buffer = fs.readFileSync(filePath);
  const result = await pdfParse(buffer);
  return { text: result.text, numPages: result.numpages };
}

function extractProtocolInfo(url: string): { number: string; title: string } {
  // Extract protocol number and title from URL
  const parts = url.split('/').pop() || '';
  const match = parts.match(/^(\d{3})/);
  const protocolNumber = match ? match[1] : parts.substring(0, 3);
  
  // Create title from URL
  const titlePart = parts
    .replace(/^\d{3}-/, '')
    .replace(/-\d{1,2}-\d{1,2}-\d{2,4}$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  
  return {
    number: protocolNumber,
    title: `${protocolNumber} - ${titlePart}`,
  };
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
  console.log('SAN LUIS OBISPO COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipDownload = process.argv.includes('--skip-download');
  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  // Ensure data directory exists
  const dataDir = path.resolve(process.cwd(), DATA_DIR);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const protocols: ParsedProtocol[] = [];

  // Download and parse each protocol
  console.log(`Processing ${PROTOCOL_PAGES.length} protocols...\n`);

  for (let i = 0; i < PROTOCOL_PAGES.length; i++) {
    const page = PROTOCOL_PAGES[i];
    const url = BASE_URL + PROTOCOLS_BASE + page;
    const info = extractProtocolInfo(page);
    const pdfPath = path.join(dataDir, `${info.number}.pdf`);

    process.stdout.write(`[${i + 1}/${PROTOCOL_PAGES.length}] ${info.number}: `);

    // Download if needed
    if (!skipDownload || !fs.existsSync(pdfPath)) {
      const success = await downloadPDF(url, pdfPath);
      if (!success) {
        console.log('Download failed, skipping');
        continue;
      }
      process.stdout.write('Downloaded, ');
    } else {
      process.stdout.write('Using cached, ');
    }

    // Parse PDF
    try {
      const { text, numPages } = await parsePDF(pdfPath);
      
      if (text.length < 50) {
        console.log('Empty or invalid PDF');
        continue;
      }

      protocols.push({
        protocolNumber: info.number,
        protocolTitle: info.title,
        section: categorizeProtocol(info.number, text),
        content: text,
        sourceUrl: url,
      });

      console.log(`${numPages} pages, ${text.length} chars`);
    } catch (error: any) {
      console.log(`Parse error: ${error.message}`);
    }

    // Small delay between downloads
    if (!skipDownload) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\nSuccessfully parsed ${protocols.length} protocols`);

  // Show section breakdown
  const bySection = new Map<string, number>();
  for (const p of protocols) {
    bySection.set(p.section, (bySection.get(p.section) || 0) + 1);
  }
  console.log('\nProtocol breakdown by section:');
  for (const [section, count] of Array.from(bySection.entries()).sort()) {
    console.log(`  ${section}: ${count}`);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    return;
  }

  // Clear existing chunks
  console.log('\nClearing existing San Luis Obispo chunks...');
  const cleared = await clearExistingChunks();
  console.log(`  Cleared ${cleared} existing chunks`);

  // Generate chunks
  console.log('\nGenerating chunks...');
  const allChunks: ChunkInsert[] = [];

  for (const protocol of protocols) {
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
        source_pdf_url: protocol.sourceUrl,
        protocol_year: PROTOCOL_YEAR,
      });
    }
  }

  console.log(`  Generated ${allChunks.length} chunks`);

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
    console.log('\nGenerating embeddings with voyage-large-2 (1536 dimensions)...');
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
        console.error(`\n  Embedding error: ${error.message}`);
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
  console.log(`  Protocols: ${protocols.length}`);
  console.log(`  Chunks inserted: ${inserted}`);
}

main();
