/**
 * San Mateo County EMS Protocol Import
 *
 * Downloads and imports San Mateo County 2025 EMS Field Treatment Guidelines.
 * Source: https://www.smchealth.org/general-information/2025-ems-field-treatment-guidelines
 *
 * Run with: npx tsx scripts/import-san-mateo-protocols.ts
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

const AGENCY_NAME = 'San Mateo County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const BASE_URL = 'https://www.smchealth.org/sites/main/files/file-attachments';
const DATA_DIR = path.resolve(process.cwd(), 'data/san-mateo-protocols');

// Protocol definitions with sections based on the 2025 Field Treatment Guidelines
const PROTOCOL_SOURCES = [
  // Index and Reference Materials
  { file: 'index.pdf', section: 'Reference', title: 'Protocol Index' },
  { file: 'rf01_-_pediatric_dosing_guide.pdf', section: 'Reference', title: 'Pediatric Dosing Guide' },
  { file: 'rf02_-_adult_dosing_guide.pdf', section: 'Reference', title: 'Adult Dosing Guide' },
  { file: 'rf03_-_approved_abbreviations.pdf', section: 'Reference', title: 'Approved Abbreviations' },
  
  // Section 1 - General Treatment Protocols
  { file: 'g00.pdf', section: 'General', title: 'G00 - Introduction' },
  { file: 'g01.pdf', section: 'General', title: 'G01 - Routine Medical Care' },
  { file: 'g02_-_end_of_life.pdf', section: 'General', title: 'G02 - End of Life' },
  { file: 'g03.pdf', section: 'General', title: 'G03 - Pain Management' },
  { file: 'g04.pdf', section: 'General', title: 'G04 - Nausea and Vomiting' },
  { file: 'g05_-_law_enforcement_-_suspected_opioid_overdose.pdf', section: 'General', title: 'G05 - Law Enforcement Suspected Opioid Overdose' },
  
  // Section 2 - Adult Cardiac Arrest
  { file: 'ca01.pdf', section: 'Cardiac Arrest', title: 'CA01 - Adult Cardiac Arrest' },
  { file: 'ca02.pdf', section: 'Cardiac Arrest', title: 'CA02 - Asystole/PEA' },
  { file: 'ca03_-_v-fib_and_pulseless_v-tach1_0.pdf', section: 'Cardiac Arrest', title: 'CA03 - V-Fib and Pulseless V-Tach' },
  { file: 'ca04.pdf', section: 'Cardiac Arrest', title: 'CA04 - Post Resuscitation Care' },
  { file: 'ca05.pdf', section: 'Cardiac Arrest', title: 'CA05 - Termination of Resuscitation' },
  
  // Section 3 - Adult Cardiac Dysrhythmia
  { file: 'cd01_-_bradycardia_symptomatic.pdf', section: 'Cardiac Dysrhythmia', title: 'CD01 - Bradycardia Symptomatic' },
  { file: 'cd02_-_narrow_complex_tachycardia.pdf', section: 'Cardiac Dysrhythmia', title: 'CD02 - Narrow Complex Tachycardia' },
  { file: 'cd03_-_wide_complex_tachycardia.pdf', section: 'Cardiac Dysrhythmia', title: 'CD03 - Wide Complex Tachycardia' },
  
  // Section 4 - Adult Respiratory
  { file: 'r01.pdf', section: 'Respiratory', title: 'R01 - Respiratory Distress' },
  { file: 'r02.pdf', section: 'Respiratory', title: 'R02 - Asthma/COPD' },
  { file: 'r03.pdf', section: 'Respiratory', title: 'R03 - Anaphylaxis' },
  { file: 'r04.pdf', section: 'Respiratory', title: 'R04 - Pulmonary Edema' },
  { file: 'r05.pdf', section: 'Respiratory', title: 'R05 - Respiratory Support' },
  { file: 'r06.pdf', section: 'Respiratory', title: 'R06 - CPAP/BiPAP' },
  { file: 'r07.pdf', section: 'Respiratory', title: 'R07 - Croup' },
  { file: 'r08.pdf', section: 'Respiratory', title: 'R08 - Allergic Reaction' },
  { file: 'r09.pdf', section: 'Respiratory', title: 'R09 - Foreign Body Obstruction' },
  { file: 'r10.pdf', section: 'Respiratory', title: 'R10 - Tracheostomy Care' },
  
  // Section 5 - Adult Environmental
  { file: 'e01.pdf', section: 'Environmental', title: 'E01 - Hypothermia' },
  { file: 'e02_-_hyperthermia_1.pdf', section: 'Environmental', title: 'E02 - Hyperthermia' },
  { file: 'e03.pdf', section: 'Environmental', title: 'E03 - Drowning/Submersion' },
  { file: 'e04.pdf', section: 'Environmental', title: 'E04 - Electrical/Lightning Injury' },
  
  // Section 6 - Adult Toxic Exposure
  { file: 'x01.pdf', section: 'Toxicology', title: 'X01 - General Toxic Exposure' },
  { file: 'x02.pdf', section: 'Toxicology', title: 'X02 - Overdose/Poisoning' },
  { file: 'x03.pdf', section: 'Toxicology', title: 'X03 - Organophosphate/Nerve Agent' },
  { file: 'x04.pdf', section: 'Toxicology', title: 'X04 - Smoke Inhalation' },
  { file: 'x05_-_hyperactive_delirium.pdf', section: 'Toxicology', title: 'X05 - Hyperactive Delirium' },
  
  // Section 7 - Adult Behavioral
  { file: 'b01_-_behavioral_and_psychiatric_crisis_0.pdf', section: 'Behavioral', title: 'B01 - Behavioral and Psychiatric Crisis' },
  
  // Section 8 - Adult Medical
  { file: 'a01.pdf', section: 'Medical', title: 'A01 - Abdominal Pain' },
  { file: 'a02.pdf', section: 'Medical', title: 'A02 - Acute Coronary Syndrome' },
  { file: 'a03.pdf', section: 'Medical', title: 'A03 - Altered Mental Status' },
  { file: 'a04.pdf', section: 'Medical', title: 'A04 - Back Pain' },
  { file: 'a05_-_chest_pain_-_not_cardiac_0.pdf', section: 'Medical', title: 'A05 - Chest Pain (Not Cardiac)' },
  { file: 'a06.pdf', section: 'Medical', title: 'A06 - Diabetic Emergency' },
  { file: 'a07.pdf', section: 'Medical', title: 'A07 - GI Bleeding' },
  { file: 'a08.pdf', section: 'Medical', title: 'A08 - Headache' },
  { file: 'a09.pdf', section: 'Medical', title: 'A09 - Hypertensive Crisis' },
  { file: 'a10.pdf', section: 'Medical', title: 'A10 - Seizure' },
  { file: 'a11.pdf', section: 'Medical', title: 'A11 - Stroke' },
  { file: 'a12.pdf', section: 'Medical', title: 'A12 - Syncope' },
  { file: 'a13.pdf', section: 'Medical', title: 'A13 - General Weakness' },
  { file: 'a14.pdf', section: 'Medical', title: 'A14 - Dialysis Emergency' },
  { file: 'a15.pdf', section: 'Medical', title: 'A15 - Gynecological Emergency' },
  { file: 'a16.pdf', section: 'Medical', title: 'A16 - Obstetric Emergency' },
  { file: 'a17.pdf', section: 'Medical', title: 'A17 - Childbirth' },
  { file: 'a18.pdf', section: 'Medical', title: 'A18 - Post-Partum Hemorrhage' },
  { file: 'a19.pdf', section: 'Medical', title: 'A19 - Prolapsed Cord' },
  { file: 'a20.pdf', section: 'Medical', title: 'A20 - Breech Delivery' },
  { file: 'a21.pdf', section: 'Medical', title: 'A21 - Limb Presentation' },
  { file: 'a22.pdf', section: 'Medical', title: 'A22 - Pre-eclampsia/Eclampsia' },
  { file: 'a23.pdf', section: 'Medical', title: 'A23 - Preterm Labor' },
  { file: 'a24.pdf', section: 'Medical', title: 'A24 - Vaginal Bleeding' },
  { file: 'a25.pdf', section: 'Medical', title: 'A25 - Sepsis' },
  { file: 'a26.pdf', section: 'Medical', title: 'A26 - Fever' },
  { file: 'a27.pdf', section: 'Medical', title: 'A27 - Shock' },
  { file: 'a28.pdf', section: 'Medical', title: 'A28 - Sickle Cell Crisis' },
  { file: 'a29.pdf', section: 'Medical', title: 'A29 - Eye Injury' },
  { file: 'a30.pdf', section: 'Medical', title: 'A30 - Epistaxis' },
  { file: 'a31.pdf', section: 'Medical', title: 'A31 - Dental Emergency' },
  { file: 'a32.pdf', section: 'Medical', title: 'A32 - Adrenal Insufficiency' },
  { file: 'a33.pdf', section: 'Medical', title: 'A33 - Hyperkalemia' },
  { file: 'a34.pdf', section: 'Medical', title: 'A34 - Implanted Device Emergency' },
  { file: 'a34t.pdf', section: 'Medical', title: 'A34T - Implanted Device Table' },
  { file: 'a35.pdf', section: 'Medical', title: 'A35 - Diarrhea/Vomiting' },
  { file: 'a36.pdf', section: 'Medical', title: 'A36 - Urinary Retention' },
  { file: 'a37.pdf', section: 'Medical', title: 'A37 - Urinary Catheter' },
  { file: 'a38_-_opioid_withdrawal.pdf', section: 'Medical', title: 'A38 - Opioid Withdrawal' },
  
  // Section 9 - Pediatric Cardiac Arrest
  { file: 'pc01.pdf', section: 'Pediatric Cardiac', title: 'PC01 - Pediatric Cardiac Arrest' },
  { file: 'pc02.pdf', section: 'Pediatric Cardiac', title: 'PC02 - Pediatric Asystole/PEA' },
  { file: 'pc03_-_pediatric_v-fib_and_pulseless_v-tach.pdf', section: 'Pediatric Cardiac', title: 'PC03 - Pediatric V-Fib and Pulseless V-Tach' },
  { file: 'pc04.pdf', section: 'Pediatric Cardiac', title: 'PC04 - Pediatric Post Resuscitation' },
  { file: 'pc05.pdf', section: 'Pediatric Cardiac', title: 'PC05 - Pediatric Termination of Resuscitation' },
  
  // Section 10 - Pediatric Cardiac Dysrhythmia
  { file: 'pd01.pdf', section: 'Pediatric Dysrhythmia', title: 'PD01 - Pediatric Bradycardia' },
  { file: 'pd02.pdf', section: 'Pediatric Dysrhythmia', title: 'PD02 - Pediatric Narrow Complex Tachycardia' },
  { file: 'pd03.pdf', section: 'Pediatric Dysrhythmia', title: 'PD03 - Pediatric Wide Complex Tachycardia' },
  
  // Section 11 - Pediatric Respiratory
  { file: 'pr01.pdf', section: 'Pediatric Respiratory', title: 'PR01 - Pediatric Respiratory Distress' },
  { file: 'pr02.pdf', section: 'Pediatric Respiratory', title: 'PR02 - Pediatric Asthma' },
  { file: 'pr03.pdf', section: 'Pediatric Respiratory', title: 'PR03 - Pediatric Anaphylaxis' },
  { file: 'pr04.pdf', section: 'Pediatric Respiratory', title: 'PR04 - Pediatric Bronchiolitis' },
  { file: 'pr05.pdf', section: 'Pediatric Respiratory', title: 'PR05 - Pediatric Croup' },
  { file: 'pr06.pdf', section: 'Pediatric Respiratory', title: 'PR06 - Pediatric Allergic Reaction' },
  { file: 'pr07.pdf', section: 'Pediatric Respiratory', title: 'PR07 - Pediatric Foreign Body Obstruction' },
  { file: 'pr08.pdf', section: 'Pediatric Respiratory', title: 'PR08 - Pediatric Tracheostomy' },
  { file: 'pr09.pdf', section: 'Pediatric Respiratory', title: 'PR09 - Pediatric CPAP' },
  { file: 'pr10.pdf', section: 'Pediatric Respiratory', title: 'PR10 - Pediatric Respiratory Support' },
  
  // Section 12 - Pediatric Environmental
  { file: 'pe01.pdf', section: 'Pediatric Environmental', title: 'PE01 - Pediatric Hypothermia' },
  { file: 'pe02.pdf', section: 'Pediatric Environmental', title: 'PE02 - Pediatric Hyperthermia' },
  { file: 'pe03.pdf', section: 'Pediatric Environmental', title: 'PE03 - Pediatric Drowning' },
  { file: 'pe04.pdf', section: 'Pediatric Environmental', title: 'PE04 - Pediatric Electrical Injury' },
  
  // Section 13 - Pediatric Toxic Exposure
  { file: 'px01.pdf', section: 'Pediatric Toxicology', title: 'PX01 - Pediatric Toxic Exposure' },
  { file: 'px02.pdf', section: 'Pediatric Toxicology', title: 'PX02 - Pediatric Overdose/Poisoning' },
  { file: 'px03.pdf', section: 'Pediatric Toxicology', title: 'PX03 - Pediatric Organophosphate' },
  { file: 'px04.pdf', section: 'Pediatric Toxicology', title: 'PX04 - Pediatric Smoke Inhalation' },
  { file: 'px05.pdf', section: 'Pediatric Toxicology', title: 'PX05 - Pediatric Hyperactive Delirium' },
  
  // Section 14 - Pediatric Behavioral
  { file: 'pb01.pdf', section: 'Pediatric Behavioral', title: 'PB01 - Pediatric Behavioral Crisis' },
  
  // Section 15 - Pediatric Medical
  { file: 'p01.pdf', section: 'Pediatric Medical', title: 'P01 - Pediatric Abdominal Pain' },
  { file: 'p02.pdf', section: 'Pediatric Medical', title: 'P02 - Pediatric Altered Mental Status' },
  { file: 'p03.pdf', section: 'Pediatric Medical', title: 'P03 - Pediatric Diabetic Emergency' },
  { file: 'p04.pdf', section: 'Pediatric Medical', title: 'P04 - Pediatric Fever' },
  { file: 'p05.pdf', section: 'Pediatric Medical', title: 'P05 - Pediatric GI Bleeding' },
  { file: 'p06.pdf', section: 'Pediatric Medical', title: 'P06 - Pediatric Headache' },
  { file: 'p07.pdf', section: 'Pediatric Medical', title: 'P07 - Pediatric Seizure' },
  { file: 'p08.pdf', section: 'Pediatric Medical', title: 'P08 - Pediatric Sepsis' },
  { file: 'p09.pdf', section: 'Pediatric Medical', title: 'P09 - Pediatric Shock' },
  { file: 'p10.pdf', section: 'Pediatric Medical', title: 'P10 - Pediatric Sickle Cell' },
  { file: 'p11.pdf', section: 'Pediatric Medical', title: 'P11 - Pediatric Syncope' },
  { file: 'p12.pdf', section: 'Pediatric Medical', title: 'P12 - Pediatric Eye Injury' },
  { file: 'p13_-_pediatric_general_weakness.pdf', section: 'Pediatric Medical', title: 'P13 - Pediatric General Weakness' },
  { file: 'p14.pdf', section: 'Pediatric Medical', title: 'P14 - Pediatric Epistaxis' },
  { file: 'p15.pdf', section: 'Pediatric Medical', title: 'P15 - Pediatric Dental Emergency' },
  { file: 'p16.pdf', section: 'Pediatric Medical', title: 'P16 - Pediatric Adrenal Insufficiency' },
  { file: 'p17.pdf', section: 'Pediatric Medical', title: 'P17 - Pediatric Hyperkalemia' },
  { file: 'p18.pdf', section: 'Pediatric Medical', title: 'P18 - Pediatric Dialysis Emergency' },
  { file: 'p19.pdf', section: 'Pediatric Medical', title: 'P19 - Pediatric Implanted Device' },
  { file: 'p20.pdf', section: 'Pediatric Medical', title: 'P20 - Pediatric Child Abuse' },
  { file: 'p21.pdf', section: 'Pediatric Medical', title: 'P21 - Pediatric Apparent Life Threatening Event' },
  { file: 'p22.pdf', section: 'Pediatric Medical', title: 'P22 - Pediatric Crying Infant' },
  { file: 'p23.pdf', section: 'Pediatric Medical', title: 'P23 - Pediatric Special Needs' },
  { file: 'p24.pdf', section: 'Pediatric Medical', title: 'P24 - Pediatric Diarrhea/Vomiting' },
  { file: 'p25.pdf', section: 'Pediatric Medical', title: 'P25 - Pediatric Urinary Retention' },
  { file: 'p26.pdf', section: 'Pediatric Medical', title: 'P26 - Pediatric Urinary Catheter' },
  { file: 'p27.pdf', section: 'Pediatric Medical', title: 'P27 - Pediatric Pain Management' },
  { file: 'p28_-_shock.pdf', section: 'Pediatric Medical', title: 'P28 - Pediatric Shock Protocol' },
  { file: 'p29.pdf', section: 'Pediatric Medical', title: 'P29 - Pediatric Nausea/Vomiting' },
  { file: 'p30.pdf', section: 'Pediatric Medical', title: 'P30 - Pediatric Back Pain' },
  { file: 'p31.pdf', section: 'Pediatric Medical', title: 'P31 - Pediatric Hypertensive Crisis' },
  { file: 'p32.pdf', section: 'Pediatric Medical', title: 'P32 - Pediatric Stroke' },
  { file: 'p33_-_newly_born.pdf', section: 'Pediatric Medical', title: 'P33 - Newly Born' },
  
  // Section 16 - Trauma
  { file: 't01.pdf', section: 'Trauma', title: 'T01 - Trauma Assessment' },
  { file: 't02.pdf', section: 'Trauma', title: 'T02 - Burns' },
  { file: 't03.pdf', section: 'Trauma', title: 'T03 - Head Injury' },
  { file: 't04.pdf', section: 'Trauma', title: 'T04 - Spinal Injury' },
  { file: 't05.pdf', section: 'Trauma', title: 'T05 - Chest Trauma' },
  { file: 't06.pdf', section: 'Trauma', title: 'T06 - Extremity Trauma' },
  
  // Section 17 - Field Procedures
  { file: 'fp01.pdf', section: 'Procedures', title: 'FP01 - Airway Management' },
  { file: 'fp02.pdf', section: 'Procedures', title: 'FP02 - Bag Valve Mask' },
  { file: 'fp03.pdf', section: 'Procedures', title: 'FP03 - Oropharyngeal Airway' },
  { file: 'fp04.pdf', section: 'Procedures', title: 'FP04 - Nasopharyngeal Airway' },
  { file: 'fp05.pdf', section: 'Procedures', title: 'FP05 - Suctioning' },
  { file: 'fp06.pdf', section: 'Procedures', title: 'FP06 - Oxygen Administration' },
  { file: 'fp07-supraglottic_airway_device.pdf', section: 'Procedures', title: 'FP07 - Supraglottic Airway Device' },
  { file: 'fp08.pdf', section: 'Procedures', title: 'FP08 - Endotracheal Intubation' },
  { file: 'fp09.pdf', section: 'Procedures', title: 'FP09 - Video Laryngoscopy' },
  { file: 'fp10.pdf', section: 'Procedures', title: 'FP10 - Cricothyrotomy' },
  { file: 'fp11.pdf', section: 'Procedures', title: 'FP11 - Needle Decompression' },
  { file: 'fp12.pdf', section: 'Procedures', title: 'FP12 - IV Access' },
  { file: 'fp13.pdf', section: 'Procedures', title: 'FP13 - IO Access' },
  { file: 'fp14.pdf', section: 'Procedures', title: 'FP14 - Cardiac Monitoring' },
  { file: 'fp15.pdf', section: 'Procedures', title: 'FP15 - 12-Lead ECG' },
  { file: 'fp16.pdf', section: 'Procedures', title: 'FP16 - Cardioversion' },
  { file: 'fp17.pdf', section: 'Procedures', title: 'FP17 - Defibrillation' },
  { file: 'fp18.pdf', section: 'Procedures', title: 'FP18 - Transcutaneous Pacing' },
  { file: 'fp19.pdf', section: 'Procedures', title: 'FP19 - Splinting' },
  { file: 'fp20.pdf', section: 'Procedures', title: 'FP20 - Traction Splint' },
  { file: 'fp21.pdf', section: 'Procedures', title: 'FP21 - Spinal Immobilization' },
  { file: 'fp22.pdf', section: 'Procedures', title: 'FP22 - Hemorrhage Control' },
  { file: 'fp23.pdf', section: 'Procedures', title: 'FP23 - Tourniquet' },
  { file: 'fp24.pdf', section: 'Procedures', title: 'FP24 - Nebulizer' },
  { file: 'fp25.pdf', section: 'Procedures', title: 'FP25 - CPAP Application' },
  { file: 'fp26.pdf', section: 'Procedures', title: 'FP26 - Blood Glucose' },
  { file: 'fp27_-_wound_packing_-_hemostatic_gauze.pdf', section: 'Procedures', title: 'FP27 - Wound Packing/Hemostatic Gauze' },
  { file: 'fp28_-_intramuscular_im_injection.pdf', section: 'Procedures', title: 'FP28 - Intramuscular Injection' },
  { file: 'fp29_-_high_performance_cpr.pdf', section: 'Procedures', title: 'FP29 - High Performance CPR' },
  { file: 'fp30_-_existing_vascular_access.pdf', section: 'Procedures', title: 'FP30 - Existing Vascular Access' },
  
  // Epidemic/Pandemic
  { file: 'ep01_-_assess_and_refer.pdf', section: 'Epidemic', title: 'EP01 - Assess and Refer' },
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
// PDF DOWNLOADING
// ============================================================================

async function downloadPDF(filename: string): Promise<Buffer | null> {
  const localPath = path.join(DATA_DIR, filename);
  
  // Check if already downloaded
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath);
  }
  
  // Download from website
  const url = `${BASE_URL}/${filename}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`    Failed to download ${filename}: ${response.status}`);
      return null;
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    return buffer;
  } catch (error: any) {
    console.error(`    Error downloading ${filename}: ${error.message}`);
    return null;
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

function extractProtocolNumber(filename: string, title: string): string {
  // Extract from filename pattern like g01.pdf, ca01.pdf, etc.
  const match = filename.match(/^([a-z]+\d+[a-z]?)/i);
  if (match) {
    return match[1].toUpperCase();
  }
  
  // Fallback: extract from title
  const titleMatch = title.match(/^([A-Z]+\d+)/);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  return filename.replace('.pdf', '').toUpperCase();
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
      // Try one by one
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
  console.log('SAN MATEO COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Protocol Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');
  const skipDownload = process.argv.includes('--skip-download');

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  try {
    // Clear existing chunks
    if (!dryRun) {
      console.log('Clearing existing San Mateo County chunks...');
      const cleared = await clearExistingChunks();
      console.log(`  Cleared ${cleared} existing chunks\n`);
    }

    const allChunks: ChunkInsert[] = [];
    let totalProtocols = 0;
    let downloadedCount = 0;
    let failedDownloads: string[] = [];

    console.log(`Processing ${PROTOCOL_SOURCES.length} protocols...\n`);

    // Process each PDF
    for (let i = 0; i < PROTOCOL_SOURCES.length; i++) {
      const source = PROTOCOL_SOURCES[i];
      const progress = Math.round(((i + 1) / PROTOCOL_SOURCES.length) * 100);
      process.stdout.write(`\r  [${progress}%] ${source.title.substring(0, 50).padEnd(50)}  `);

      let pdfBuffer: Buffer | null;
      
      if (skipDownload) {
        const localPath = path.join(DATA_DIR, source.file);
        if (fs.existsSync(localPath)) {
          pdfBuffer = fs.readFileSync(localPath);
        } else {
          pdfBuffer = null;
        }
      } else {
        pdfBuffer = await downloadPDF(source.file);
      }

      if (!pdfBuffer) {
        failedDownloads.push(source.file);
        continue;
      }

      downloadedCount++;

      try {
        const { text, numPages } = await parsePDF(pdfBuffer);
        
        if (text.trim().length < 50) {
          continue;
        }

        const protocolNumber = extractProtocolNumber(source.file, source.title);
        totalProtocols++;

        // Chunk the protocol
        const chunks = chunkProtocol(text, protocolNumber, source.title);

        for (const chunk of chunks) {
          allChunks.push({
            agency_name: AGENCY_NAME,
            state_code: STATE_CODE,
            protocol_number: protocolNumber,
            protocol_title: source.title,
            section: source.section,
            content: chunk.content,
            source_pdf_url: `${BASE_URL}/${source.file}`,
            protocol_year: PROTOCOL_YEAR,
          });
        }
      } catch (parseError: any) {
        console.error(`\n    Parse error for ${source.file}: ${parseError.message}`);
      }

      // Small delay between downloads
      if (!skipDownload) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    console.log(`\n\nDownload Summary:`);
    console.log(`  Downloaded: ${downloadedCount}/${PROTOCOL_SOURCES.length}`);
    if (failedDownloads.length > 0) {
      console.log(`  Failed: ${failedDownloads.length}`);
      console.log(`    ${failedDownloads.slice(0, 5).join(', ')}${failedDownloads.length > 5 ? '...' : ''}`);
    }

    console.log(`\nTotal protocols parsed: ${totalProtocols}`);
    console.log(`Total chunks generated: ${allChunks.length}`);

    if (dryRun) {
      console.log('\n[DRY RUN] Exiting without database changes.');
      console.log('\nSample chunks:');
      allChunks.slice(0, 5).forEach(c => {
        console.log(`  - ${c.protocol_number}: ${c.protocol_title.substring(0, 40)} (${c.section})`);
      });
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
          console.error(`\n  Embedding error: ${error.message}`);
        }

        const pct = Math.round(((i + batch.length) / allChunks.length) * 100);
        process.stdout.write(`\r  Progress: ${pct}%`);
        await new Promise(r => setTimeout(r, 200));
      }
      console.log();
    } else if (skipEmbed) {
      console.log('\nSkipping embedding generation (--skip-embed flag)');
    } else if (!VOYAGE_API_KEY) {
      console.log('\nWARNING: VOYAGE_API_KEY not set, skipping embeddings');
    }

    // Insert chunks
    console.log('\nInserting into database...');
    const inserted = await insertChunks(allChunks);

    console.log('\n' + '='.repeat(70));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(70));
    console.log(`  Agency: ${AGENCY_NAME}`);
    console.log(`  State: ${STATE_CODE}`);
    console.log(`  Protocols: ${totalProtocols}`);
    console.log(`  Chunks inserted: ${inserted}`);
  } catch (error: any) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

main();
