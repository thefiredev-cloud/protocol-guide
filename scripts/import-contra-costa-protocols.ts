/**
 * Contra Costa County EMS Protocol Import
 *
 * Downloads and imports Contra Costa County EMS 2021 Treatment Guidelines
 * from the Wayback Machine archive.
 *
 * Run with: npx tsx scripts/import-contra-costa-protocols.ts
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

const AGENCY_NAME = 'Contra Costa County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2021;

const DATA_DIR = 'data/contra-costa-protocols';
const ARCHIVE_BASE = 'https://web.archive.org/web/20210420';

// All 2021 Treatment Guidelines PDFs
const PDF_SOURCES = [
  // Master Document
  { file: 'Field-Treatment-Guidelines.pdf', section: 'Overview', title: '2021 Field Treatment Guidelines - Complete' },
  { file: 'FTGIndex.pdf', section: 'Index', title: 'Field Treatment Guidelines Index' },
  
  // Section 1: General Treatment Guidelines
  { file: '1G01UniversalPatientCare.pdf', section: 'General', title: 'G01 - Universal Patient Care' },
  { file: '1G02DeathWithDignity.pdf', section: 'General', title: 'G02 - Death with Dignity' },
  { file: '1G03EndofLifeCare.pdf', section: 'General', title: 'G03 - End of Life Care' },
  { file: '1G04FeverandInfectionControl.pdf', section: 'General', title: 'G04 - Fever and Infection Control' },
  { file: '1G05IVandIOAccess.pdf', section: 'General', title: 'G05 - IV and IO Access' },
  { file: '1G06VentricularAssistDevice.pdf', section: 'General', title: 'G06 - Ventricular Assist Devices' },
  { file: 'SeasonalInfluenzaVaccination.pdf', section: 'General', title: 'Seasonal Influenza Vaccination' },
  
  // Section 2: Interfacility Transport
  { file: '2I01STEMITransfer.pdf', section: 'Interfacility Transport', title: 'I01 - STEMI Transfer' },
  { file: '2I02IntubatedPatientTransfer.pdf', section: 'Interfacility Transport', title: 'I02 - Intubated Patient Transfer' },
  { file: '2I03StrokeTransfer.pdf', section: 'Interfacility Transport', title: 'I03 - Stroke Transfer' },
  
  // Section 3: Adult Cardiac Treatment Guidelines
  { file: '3AC01CardiacArrest.pdf', section: 'Adult Cardiac', title: 'AC01 - Cardiac Arrest' },
  { file: '3AC02AsystoleandPEA.pdf', section: 'Adult Cardiac', title: 'AC02 - Asystole and PEA' },
  { file: '3AC03V-FibandPulselessV-Tach.pdf', section: 'Adult Cardiac', title: 'AC03 - V-Fib and Pulseless V-Tach' },
  { file: '3AC04PostResuscitation(ROSC).pdf', section: 'Adult Cardiac', title: 'AC04 - Post Resuscitation (ROSC)' },
  { file: '3AC05SymptomaticBradycardia.pdf', section: 'Adult Cardiac', title: 'AC05 - Symptomatic Bradycardia' },
  { file: '3AC06NarrowComplexTachycardia.pdf', section: 'Adult Cardiac', title: 'AC06 - Narrow Complex Tachycardia' },
  { file: '3AC07WideComplexTachycardia.pdf', section: 'Adult Cardiac', title: 'AC07 - Wide Complex Tachycardia' },
  { file: '3AC08ChestPainandSusCardiacSTEMI.pdf', section: 'Adult Cardiac', title: 'AC08 - Chest Pain and Suspected Cardiac or STEMI' },
  
  // Section 4: Adult Medical Treatment Guidelines
  { file: '4A01AbdominalPain.pdf', section: 'Adult Medical', title: 'A01 - Abdominal Pain' },
  { file: '4A02Airway.pdf', section: 'Adult Medical', title: 'A02 - Adult Airway' },
  { file: '4A03Behavioral.pdf', section: 'Adult Medical', title: 'A03 - Adult Behavioral' },
  { file: '4A04AllergicReaction.pdf', section: 'Adult Medical', title: 'A04 - Allergic Reaction and Anaphylaxis' },
  { file: '4A05AlteredMentalStatus.pdf', section: 'Adult Medical', title: 'A05 - Altered Mental Status' },
  { file: '4A06ChildBirth.pdf', section: 'Adult Medical', title: 'A06 - Childbirth and Labor' },
  { file: '4A07Diabetic.pdf', section: 'Adult Medical', title: 'A07 - Diabetic' },
  { file: '4A08DialysisRenalFailure.pdf', section: 'Adult Medical', title: 'A08 - Dialysis and Renal Failure' },
  { file: '4A09ShortnessOfBreath.pdf', section: 'Adult Medical', title: 'A09 - Dyspnea (Excluding CHF)' },
  { file: '4A10DystonicReaction.pdf', section: 'Adult Medical', title: 'A10 - Dystonic Reaction' },
  { file: '4A11EmergenciesInvolvingCentralLines.pdf', section: 'Adult Medical', title: 'A11 - Emergencies Involving Central Lines' },
  { file: '4A12HypotensionShock.pdf', section: 'Adult Medical', title: 'A12 - Hypotension and Shock' },
  { file: '4A13OverdoseToxicIngestion.pdf', section: 'Adult Medical', title: 'A13 - Overdose and Toxic Ingestion' },
  { file: '4A13aSuspectedOpioidOverdose.pdf', section: 'Adult Medical', title: 'A13a - Suspected Opioid Overdose' },
  { file: '4A14PainControl.pdf', section: 'Adult Medical', title: 'A14 - Adult Pain Control' },
  { file: '4A15RespiratoryDistressTrach.pdf', section: 'Adult Medical', title: 'A15 - Respiratory Distress with Tracheostomy' },
  { file: '4A16Seizure.pdf', section: 'Adult Medical', title: 'A16 - Seizure' },
  { file: '4A17Sepsis.pdf', section: 'Adult Medical', title: 'A17 - Suspected Sepsis' },
  { file: '4A18Stroke.pdf', section: 'Adult Medical', title: 'A18 - Suspected Stroke' },
  { file: '4A19Syncope.pdf', section: 'Adult Medical', title: 'A19 - Syncope' },
  { file: '4A20VomitingDiarrhea.pdf', section: 'Adult Medical', title: 'A20 - Vomiting and Diarrhea' },
  
  // Section 5: Pediatric Cardiac Treatment Guidelines
  { file: '5PC01CardiacArrest.pdf', section: 'Pediatric Cardiac', title: 'PC01 - Pediatric Cardiac Arrest' },
  { file: '5PC02AsystolePEA.pdf', section: 'Pediatric Cardiac', title: 'PC02 - Pediatric Asystole and PEA' },
  { file: '5PC03VFibPulselessVTach.pdf', section: 'Pediatric Cardiac', title: 'PC03 - Pediatric V-Fib and Pulseless V-Tach' },
  { file: '5PC04ROSC.pdf', section: 'Pediatric Cardiac', title: 'PC04 - Pediatric Post Resuscitation (ROSC)' },
  { file: '5PC05Bradycardia.pdf', section: 'Pediatric Cardiac', title: 'PC05 - Pediatric Bradycardia' },
  { file: '5PC06Tachycardia.pdf', section: 'Pediatric Cardiac', title: 'PC06 - Pediatric Tachycardia' },
  
  // Section 6: Pediatric Treatment Guidelines
  { file: '6P01Airway.pdf', section: 'Pediatric', title: 'P01 - Pediatric Airway' },
  { file: '6P02AllergicReaction.pdf', section: 'Pediatric', title: 'P02 - Pediatric Allergic Reaction' },
  { file: '6P03AlteredMentalStatus.pdf', section: 'Pediatric', title: 'P03 - Pediatric Altered Mental Status' },
  { file: '6P04Behavorial.pdf', section: 'Pediatric', title: 'P04 - Pediatric Behavioral' },
  { file: '6P05BRUE.pdf', section: 'Pediatric', title: 'P05 - Brief Resolved Unexplained Event (BRUE)' },
  { file: '6P06Diabetic.pdf', section: 'Pediatric', title: 'P06 - Pediatric Diabetic' },
  { file: '6P07HypotensionShock.pdf', section: 'Pediatric', title: 'P07 - Pediatric Hypotension and Shock' },
  { file: '6P008NewlyBorn.pdf', section: 'Pediatric', title: 'P08 - Newly Born' },
  { file: '6P09OverdoseToxicIngestion.pdf', section: 'Pediatric', title: 'P09 - Pediatric Overdose' },
  { file: '6P10PainControl.pdf', section: 'Pediatric', title: 'P10 - Pediatric Pain Control' },
  { file: '6P11RespiratoryDistress.pdf', section: 'Pediatric', title: 'P11 - Pediatric Respiratory Distress' },
  { file: '6P12Seizure.pdf', section: 'Pediatric', title: 'P12 - Pediatric Seizure' },
  { file: '6P13VomitingDiarrhea.pdf', section: 'Pediatric', title: 'P13 - Pediatric Vomiting and Diarrhea' },
  
  // Section 7: Trauma and Environmental Treatment Guidelines
  { file: '7T01TraumaTriage.pdf', section: 'Trauma/Environmental', title: 'T01 - Trauma Triage' },
  { file: '7T02BitesEvenomation.pdf', section: 'Trauma/Environmental', title: 'T02 - Bites and Envenomations' },
  { file: '7T03Burns.pdf', section: 'Trauma/Environmental', title: 'T03 - Burns' },
  { file: '7T04ExtremityTrauma.pdf', section: 'Trauma/Environmental', title: 'T04 - Extremity Trauma' },
  { file: '7T05HeadTrauma.pdf', section: 'Trauma/Environmental', title: 'T05 - Head Trauma' },
  { file: '7T06MultiSystemTrauma.pdf', section: 'Trauma/Environmental', title: 'T06 - Multi-System Trauma' },
  { file: '7T07HeatIllnessHyperthermia.pdf', section: 'Trauma/Environmental', title: 'T07 - Heat Illness and Hyperthermia' },
  { file: '7T08Hypothermia.pdf', section: 'Trauma/Environmental', title: 'T08 - Hypothermia' },
  
  // Section 8: Field Procedures
  { file: '8FP0112LeadECG.pdf', section: 'Field Procedures', title: 'FP01 - 12-Lead ECG' },
  { file: '8FP02AirwayBLSManagement.pdf', section: 'Field Procedures', title: 'FP02 - Airway BLS Management' },
  { file: '8FP03AirwayBougieDevice.pdf', section: 'Field Procedures', title: 'FP03 - Airway Bougie Device' },
  { file: '8FP04AirwayEndotrachealIntubation.pdf', section: 'Field Procedures', title: 'FP04 - Endotracheal Intubation' },
  { file: '8FP05AirwayForeignBodyRemoval.pdf', section: 'Field Procedures', title: 'FP05 - Airway Foreign Body Removal' },
  { file: '8FP06AirwaySAD.pdf', section: 'Field Procedures', title: 'FP06 - Supraglottic Airway Device' },
  { file: '8FP07AirwayStomalIntubation.pdf', section: 'Field Procedures', title: 'FP07 - Airway Stomal Intubation' },
  { file: '8FP08AirwayTracheostomyTubeReplacement.pdf', section: 'Field Procedures', title: 'FP08 - Tracheostomy Tube Replacement' },
  { file: '8FP09CardiacArrestManagement.pdf', section: 'Field Procedures', title: 'FP09 - Cardiac Arrest Management' },
  { file: '8FP10Childbirth.pdf', section: 'Field Procedures', title: 'FP10 - Childbirth' },
  { file: '8FP11CPAP.pdf', section: 'Field Procedures', title: 'FP11 - CPAP' },
  { file: '8FP12EndTidalCO2.pdf', section: 'Field Procedures', title: 'FP12 - End Tidal CO2 Monitoring' },
  { file: '8FP13ExternalPacing.pdf', section: 'Field Procedures', title: 'FP13 - External Pacing' },
  { file: '8FP14Helmet Removal.pdf', section: 'Field Procedures', title: 'FP14 - Helmet Removal' },
  { file: '8FP15IntraosseousAccess.pdf', section: 'Field Procedures', title: 'FP15 - Intraosseous Access' },
  { file: '8FP16NeedleDecompression.pdf', section: 'Field Procedures', title: 'FP16 - Needle Decompression' },
  { file: '8FP17PediatricAssessment.pdf', section: 'Field Procedures', title: 'FP17 - Pediatric Assessment' },
  { file: '8FP18SpinalInjuryAssessment.pdf', section: 'Field Procedures', title: 'FP18 - Spinal Injury Assessment' },
  { file: '8FP19SpinalMotionRestriction.pdf', section: 'Field Procedures', title: 'FP19 - Spinal Motion Restriction' },
  { file: '8FP20TaserDartRemoval.pdf', section: 'Field Procedures', title: 'FP20 - Taser Dart Removal' },
  { file: '8FP21Tourniquet.pdf', section: 'Field Procedures', title: 'FP21 - Tourniquet' },
  { file: '8FP22Valsalva.pdf', section: 'Field Procedures', title: 'FP22 - Valsalva (Modified) Maneuver' },
  { file: '8FP23VascularAccess.pdf', section: 'Field Procedures', title: 'FP23 - Vascular Access' },
  { file: '8FP24PediatricMedicationAdministration.pdf', section: 'Field Procedures', title: 'FP24 - Pediatric Medication Administration' },
  { file: '8FP25FingerStickBloodGlucose.pdf', section: 'Field Procedures', title: 'FP25 - Finger Stick Blood Glucose' },
  { file: '8FP26EMTEpiAdmin.pdf', section: 'Field Procedures', title: 'FP26 - EMT Epinephrine Administration' },
  { file: '8FP27EMTNarcanAdmin.pdf', section: 'Field Procedures', title: 'FP27 - EMT Naloxone Administration' },
  { file: '8FP29InfluenzaCOVID19Vaccination.pdf', section: 'Field Procedures', title: 'FP29 - Influenza and COVID-19 Vaccination' },
  
  // Section 9: Reference
  { file: '9Reference-ApprovedAbbreviations.pdf', section: 'Reference', title: 'Approved Abbreviations' },
  { file: '9Reference-DrugReference.pdf', section: 'Reference', title: 'Drug Reference' },
  { file: '9Reference-PediatricAdenosine.pdf', section: 'Reference', title: 'Pediatric Adenosine' },
  { file: '9Reference-PediatricAmiodarone.pdf', section: 'Reference', title: 'Pediatric Amiodarone' },
  { file: '9Reference-PediatricAtropine.pdf', section: 'Reference', title: 'Pediatric Atropine' },
  { file: '9Reference-PediatricCardioversion.pdf', section: 'Reference', title: 'Pediatric Cardioversion' },
  { file: '9Reference-PediatricDefibrillation.pdf', section: 'Reference', title: 'Pediatric Defibrillation' },
  { file: '9Reference-PediatricDextrose10Percent.pdf', section: 'Reference', title: 'Pediatric Dextrose 10%' },
  { file: '9Reference-PediatricDiphenhydramine.pdf', section: 'Reference', title: 'Pediatric Diphenhydramine' },
  { file: '9Reference-PediatricEpinephrine1to1.pdf', section: 'Reference', title: 'Pediatric Epinephrine 1:1' },
  { file: '9Reference-PediatricEpinephrine1to10.pdf', section: 'Reference', title: 'Pediatric Epinephrine 1:10' },
  { file: '9Reference-PediatricFentanylIN.pdf', section: 'Reference', title: 'Pediatric Fentanyl IN' },
  { file: '9Reference-PediatricFentanyl.pdf', section: 'Reference', title: 'Pediatric Fentanyl' },
  { file: '9Reference-PediatricFluidBolus.pdf', section: 'Reference', title: 'Pediatric Fluid Bolus' },
  { file: '9Reference-PediatricGlucagon.pdf', section: 'Reference', title: 'Pediatric Glucagon' },
  { file: '9Reference-PediatricLidocaine.pdf', section: 'Reference', title: 'Pediatric Lidocaine' },
  { file: '9Reference-PediatricMidazolam.pdf', section: 'Reference', title: 'Pediatric Midazolam - Non Seizure' },
  { file: '9Reference-PediatricMidazolamEpilepticus.pdf', section: 'Reference', title: 'Pediatric Midazolam - Epilepticus' },
  { file: '9Reference-PediatricNaloxone.pdf', section: 'Reference', title: 'Pediatric Naloxone' },
  { file: '9Reference-PediatricOndansetronODT.pdf', section: 'Reference', title: 'Pediatric Ondansetron ODT' },
  { file: '9Reference-PediatricOndansetron.pdf', section: 'Reference', title: 'Pediatric Ondansetron' },
  { file: '9Reference-PediatricWeightConversion.pdf', section: 'Reference', title: 'Pediatric Weight Conversion' },
  
  // Section 10: COVID Related
  { file: '10CFP01NasalSwab.pdf', section: 'COVID-19', title: 'CFP01 - Nasopharyngeal Swabbing' },
  { file: 'COVID19-Emerging-Infectious-Disease.pdf', section: 'COVID-19', title: 'CFTG01 - Emerging Infectious Disease (COVID-19)' },
];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// PDF DOWNLOAD FROM WAYBACK MACHINE
// ============================================================================

async function downloadPDF(filename: string, outputPath: string): Promise<boolean> {
  const url = `${ARCHIVE_BASE}/https://cchealth.org/ems/pdf/2021-tg/${encodeURIComponent(filename)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  Failed to download ${filename}: ${response.status}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      console.error(`  ${filename} is not a PDF (${contentType})`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`  Downloaded: ${filename} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
    return true;
  } catch (error: any) {
    console.error(`  Error downloading ${filename}: ${error.message}`);
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

interface Chunk {
  content: string;
  protocol_number: string;
  protocol_title: string;
  section: string;
}

function chunkProtocol(content: string, protocolNumber: string, protocolTitle: string, section: string): Chunk[] {
  const chunks: Chunk[] = [];
  const maxChunkSize = 1500;
  const overlap = 150;
  
  // Clean content
  const cleaned = content
    .replace(/\r/g, '')
    .replace(/\f/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
  
  if (cleaned.length <= maxChunkSize) {
    chunks.push({
      content: cleaned,
      protocol_number: protocolNumber,
      protocol_title: protocolTitle,
      section,
    });
    return chunks;
  }
  
  // Split by paragraphs
  const paragraphs = cleaned.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length + 2 <= maxChunkSize) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
    } else {
      if (currentChunk) {
        chunks.push({
          content: currentChunk,
          protocol_number: protocolNumber,
          protocol_title: protocolTitle,
          section,
        });
      }
      
      // Handle long paragraphs
      if (para.length > maxChunkSize) {
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length <= maxChunkSize) {
            sentenceChunk += sentence;
          } else {
            if (sentenceChunk) {
              chunks.push({
                content: sentenceChunk,
                protocol_number: protocolNumber,
                protocol_title: protocolTitle,
                section,
              });
            }
            sentenceChunk = sentence;
          }
        }
        currentChunk = sentenceChunk;
      } else {
        currentChunk = para;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      protocol_number: protocolNumber,
      protocol_title: protocolTitle,
      section,
    });
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
  console.log('CONTRA COSTA COUNTY EMS PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Agency: ${AGENCY_NAME}`);
  console.log(`State: ${STATE_CODE}`);
  console.log(`Year: ${PROTOCOL_YEAR}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const skipDownload = process.argv.includes('--skip-download');
  const skipEmbed = process.argv.includes('--skip-embed');
  const dryRun = process.argv.includes('--dry-run');

  // Ensure data directory exists
  const dataDir = path.resolve(process.cwd(), DATA_DIR);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Download PDFs from Wayback Machine
  if (!skipDownload) {
    console.log('Downloading PDFs from Wayback Machine...\n');
    let downloaded = 0;
    let failed = 0;
    
    for (const source of PDF_SOURCES) {
      const outputPath = path.join(dataDir, source.file);
      if (fs.existsSync(outputPath)) {
        console.log(`  Exists: ${source.file}`);
        downloaded++;
        continue;
      }
      
      const success = await downloadPDF(source.file, outputPath);
      if (success) {
        downloaded++;
      } else {
        failed++;
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 500));
    }
    
    console.log(`\nDownloaded: ${downloaded}, Failed: ${failed}\n`);
  }

  // Process PDFs
  console.log('Processing PDFs...\n');
  
  if (!dryRun) {
    console.log('Clearing existing Contra Costa chunks...');
    const cleared = await clearExistingChunks();
    console.log(`  Cleared ${cleared} existing chunks\n`);
  }

  const allChunks: ChunkInsert[] = [];
  let processedCount = 0;

  for (const source of PDF_SOURCES) {
    const filePath = path.join(dataDir, source.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP: ${source.file} (not found)`);
      continue;
    }

    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const { text, numPages } = await parsePDF(pdfBuffer);
      
      if (text.length < 50) {
        console.log(`  SKIP: ${source.file} (no text content)`);
        continue;
      }

      // Extract protocol number from title
      const numMatch = source.title.match(/^([A-Z0-9]+)\s*-/);
      const protocolNumber = numMatch ? `COCO-${numMatch[1]}` : `COCO-${source.file.replace('.pdf', '')}`;

      const chunks = chunkProtocol(text, protocolNumber, source.title, source.section);
      
      for (const chunk of chunks) {
        allChunks.push({
          agency_name: AGENCY_NAME,
          state_code: STATE_CODE,
          protocol_number: chunk.protocol_number,
          protocol_title: chunk.protocol_title,
          section: chunk.section,
          content: chunk.content,
          source_pdf_url: `https://cchealth.org/ems/pdf/2021-tg/${source.file}`,
          protocol_year: PROTOCOL_YEAR,
        });
      }

      processedCount++;
      console.log(`  ${source.title}: ${numPages} pages, ${chunks.length} chunks`);
    } catch (error: any) {
      console.error(`  ERROR: ${source.file} - ${error.message}`);
    }
  }

  console.log(`\nTotal protocols processed: ${processedCount}`);
  console.log(`Total chunks generated: ${allChunks.length}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Exiting without database changes.');
    return;
  }

  // Generate embeddings
  if (!skipEmbed && VOYAGE_API_KEY && allChunks.length > 0) {
    console.log('\nGenerating embeddings (voyage-large-2)...');
    const batchSize = 50;

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
      await new Promise(r => setTimeout(r, 250));
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
  console.log(`  Protocols: ${processedCount}`);
  console.log(`  Chunks inserted: ${inserted}`);
}

main().catch(console.error);
