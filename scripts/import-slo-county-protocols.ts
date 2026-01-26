/**
 * San Luis Obispo County EMS Protocol Import
 *
 * Downloads SLO County EMS protocols from slocounty.ca.gov,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-slo-county-protocols.ts
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

const AGENCY_NAME = 'San Luis Obispo County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2026;

const DATA_DIR = 'data/slo-protocols';
const BASE_URL = 'https://www.slocounty.ca.gov';

// SLO County EMS Protocol PDFs - Treatment Guidelines (600-720 series)
const PDF_SOURCES = [
  // Core Treatment Protocols
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/600-bls-and-als-treatment-protocols-4-15-2017', number: '600', title: 'BLS and ALS Treatment Protocols', section: 'Treatment Guidelines' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/601-universal-3-1-2022', number: '601', title: 'Universal Protocol', section: 'Treatment Guidelines' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/601-attachment-a-universal-definitions-4-15-2017', number: '601-A', title: 'Universal Definitions', section: 'Treatment Guidelines' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/602-airway-management-7-1-2023', number: '602', title: 'Airway Management', section: 'Treatment Guidelines' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/603-pain-management-3-1-2022', number: '603', title: 'Pain Management', section: 'Treatment Guidelines' },

  // Medical Emergencies (610-622)
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/610-abdominal-flank-pain-medical-8-1-19', number: '610', title: 'Abdominal Flank Pain Medical', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/611-allergic-reaction-anaphylaxis-5-1-2021', number: '611', title: 'Allergic Reaction Anaphylaxis', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/612-altered-mental-status-6-1-2019', number: '612', title: 'Altered Mental Status', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/613-behavioral-emergencies-8-1-19', number: '613', title: 'Behavioral Emergencies', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/614-ingestion-poisoning-od-8-1-19', number: '614', title: 'Ingestion Poisoning OD', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/615-severe-nausea-vomiting-8-1-19', number: '615', title: 'Severe Nausea Vomiting', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/616-respiratory-bronchospasm-asthma-copd-croup-7-1', number: '616', title: 'Respiratory Bronchospasm Asthma COPD Croup', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/617-respiratory-distress-pulmonary-edema-8-1-2019', number: '617', title: 'Respiratory Distress Pulmonary Edema', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/618-respiratory-distress-opiate-overdose-11-2-2022', number: '618', title: 'Respiratory Distress Opiate Overdose', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/619-shock-medical-hypotension-sepsis-8-1-2019', number: '619', title: 'Shock Medical Hypotension Sepsis', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/620-seizure-active-8-1-2019', number: '620', title: 'Seizure Active', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/621-suspected-cva-tia-6-1-2019', number: '621', title: 'Suspected CVA TIA', section: 'Medical Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/622-opioid-withdrawal-1-1-2026', number: '622', title: 'Opioid Withdrawal', section: 'Medical Emergencies' },

  // Environmental Emergencies (630-632)
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/630-bites-stings-snake-bites-8-1-2019', number: '630', title: 'Bites Stings Snake Bites', section: 'Environmental Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/631-hyperthermia-hypothermia-8-1-2019', number: '631', title: 'Hyperthermia Hypothermia', section: 'Environmental Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/661-drowning-1-1-2026', number: '632', title: 'Drowning', section: 'Environmental Emergencies' },

  // Cardiac Emergencies (640-645)
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/640-adult-cardiac-chest-pain-acute-coronary-syndro', number: '640', title: 'Adult Cardiac Chest Pain Acute Coronary Syndrome', section: 'Cardiac Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/641-pulselss-cardiac-arrest-atraumatic-7-1-2023', number: '641', title: 'Pulseless Cardiac Arrest Atraumatic', section: 'Cardiac Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/642-supraventricular-tachycarida-8-1-2019', number: '642', title: 'Supraventricular Tachycardia', section: 'Cardiac Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/643-ventricular-tachycarida-with-pulses-8-1-2019', number: '643', title: 'Ventricular Tachycardia with Pulses', section: 'Cardiac Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/644-symptomatic-bradycardia-10-1-21', number: '644', title: 'Symptomatic Bradycardia', section: 'Cardiac Emergencies' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/645-atrial-fibrillation-with-rvr-1-1-2026', number: '645', title: 'Atrial Fibrillation with RVR', section: 'Cardiac Emergencies' },

  // OB/GYN (650-651)
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/650-childbirth-8-1-2019', number: '650', title: 'Childbirth', section: 'OB/GYN' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/651-newborn-care-8-1-2019', number: '651', title: 'Newborn Care', section: 'OB/GYN' },

  // Trauma (660-662)
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/660-general-trauma-8-1-2019', number: '660', title: 'General Trauma', section: 'Trauma' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/661-traumatic-cardiac-arrest-8-1-2019', number: '661', title: 'Traumatic Cardiac Arrest', section: 'Trauma' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/662-burns-8-1-2019', number: '662', title: 'Burns', section: 'Trauma' },

  // Procedures (701-718)
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/701-capnography-end-tidal-co2-monitoring-8-1-2019', number: '701', title: 'Capnography End Tidal CO2 Monitoring', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/702-spinal-motion-restriction-smr-8-1-2019', number: '702', title: 'Spinal Motion Restriction SMR', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/703-continuous-positive-airway-pressure-cpap-6-1-2', number: '703', title: 'Continuous Positive Airway Pressure CPAP', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/704-needle-cricothyrotomy-8-1-2019', number: '704', title: 'Needle Cricothyrotomy', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/705-needle-thoracostomy-8-1-2019', number: '705', title: 'Needle Thoracostomy', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/706-hemorrhage-control-toutniquet-hemostatic-dress', number: '706', title: 'Hemorrhage Control Tourniquet Hemostatic Dressings', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/706-attachment-a-state-emsa-approved-hemostatic-dr', number: '706-A', title: 'State EMSA Approved Hemostatic Dressings and Tourniquets', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/707-12-lead-ecg-8-1-2019', number: '707', title: '12 Lead ECG', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/708-automatic-external-defibrillator-aed-8-1-2019', number: '708', title: 'Automatic External Defibrillator AED', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/709-intranasal-medication-8-1-2019', number: '709', title: 'Intranasal Medication', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/710-vascular-access-and-monitoring-7-1-2023', number: '710', title: 'Vascular Access and Monitoring', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/711-use-of-restraints-8-1-2019', number: '711', title: 'Use of Restraints', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/712-high-performance-cpr-(hpcpr)-8-1-2019', number: '712', title: 'High Performance CPR HPCPR', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/713-pelvic-binder-application-8-1-2019', number: '713', title: 'Pelvic Binder Application', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/714-tranexamic-acid-txa-administration-8-1-2019', number: '714', title: 'Tranexamic Acid TXA Administration', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/716-transcutaneous-pacing-tcp-10-1-21', number: '716', title: 'Transcutaneous Pacing TCP', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/717-endotracheal-intubation-7-01-2023', number: '717', title: 'Endotracheal Intubation', section: 'Procedures' },
  { path: '/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines/718-supraglottic-airway-device-7-01-2023', number: '718', title: 'Supraglottic Airway Device', section: 'Procedures' },
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
        'Referer': 'https://www.slocounty.ca.gov/',
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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create metadata.json
  const metadata = {
    agency_name: AGENCY_NAME,
    state_code: STATE_CODE,
    protocol_year: PROTOCOL_YEAR,
    source_url: 'https://www.slocounty.ca.gov/departments/health-agency/public-health/emergency-medical-services/emergency-medical-services-agency/forms-documents/policies,-procedures,-and-protocols-(includes-form/600-720-bls-and-als-treatment-guidelines',
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
      await new Promise(r => setTimeout(r, 500)); // Rate limiting
    }
    console.log(`\nDownloaded: ${downloaded}/${PDF_SOURCES.length} PDFs\n`);
  }

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing SLO County chunks...');
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
