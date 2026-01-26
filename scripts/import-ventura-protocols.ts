/**
 * Ventura County EMS Protocol Import
 *
 * Downloads Ventura County EMS protocols from hca.venturacounty.gov,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-ventura-protocols.ts
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

const AGENCY_NAME = 'Ventura County EMS Agency';
const STATE_CODE = 'CA';
const PROTOCOL_YEAR = 2025;

const DATA_DIR = 'data/ventura-protocols';
const BASE_URL = 'https://hca.venturacounty.gov';

// All Ventura County EMS Protocol PDFs scraped from the policies page
const PDF_SOURCES = [
  // Administrative (0100 series)
  { slug: '0100-local-ems-agency-oct03', number: '0100', title: 'Local EMS Agency', section: 'Administrative' },
  { slug: '0105-psc-guidelines-apr22', number: '0105', title: 'PSC Guidelines', section: 'Administrative' },
  { slug: '0106-dev-of-proposed-policy-sep18', number: '0106', title: 'Development of Proposed Policy', section: 'Administrative' },
  { slug: '0107-stroke-and-stemi-committees-oct24', number: '0107', title: 'Stroke and STEMI Committees', section: 'Administrative' },
  { slug: '0110-ord-4099-amb-business-lic-sep18', number: '0110', title: 'Ambulance Business Licensing Ord 4099', section: 'Administrative' },
  { slug: '0111-ambulance-company-licensing-procedure-nov24', number: '0111', title: 'Ambulance Company Licensing Procedure', section: 'Administrative' },
  { slug: '0112-ambulance-rates-jul-25', number: '0112', title: 'Ambulance Rates', section: 'Administrative' },
  { slug: '0120-ems-qip-nov23', number: '0120', title: 'EMS Quality Improvement Plan', section: 'Administrative' },
  { slug: '0121-safety-event-review-apr23', number: '0121', title: 'Safety Event Review', section: 'Administrative' },
  { slug: '0122-ems-education-committee-guidelines-feb24', number: '0122', title: 'EMS Education Committee Guidelines', section: 'Administrative' },
  { slug: '0124-hospital-emergency-services-reduction-impact-assessment-nov24', number: '0124', title: 'Hospital Emergency Services Reduction Impact Assessment', section: 'Administrative' },

  // Reporting (0200 series)
  { slug: '0210-abuse-reporting-guidelines-nov24', number: '0210', title: 'Abuse Reporting Guidelines', section: 'Reporting' },

  // Personnel - EMT (0300 series)
  { slug: '0300-emt-scope-of-practice-nov22', number: '0300', title: 'EMT Scope of Practice', section: 'Personnel - EMT' },
  { slug: '0301-emt-certification-nov22', number: '0301', title: 'EMT Certification', section: 'Personnel - EMT' },
  { slug: '0302-emt-renewal-oct22', number: '0302', title: 'EMT Renewal', section: 'Personnel - EMT' },
  { slug: '0303-b-vc-optional-skills-plan-sep23', number: '0303B', title: 'VC Optional Skills Plan', section: 'Personnel - EMT' },
  { slug: '0303-emt-optional-skills-dec23', number: '0303', title: 'EMT Optional Skills', section: 'Personnel - EMT' },
  { slug: '0304-emt-challenge-exam-nov22', number: '0304', title: 'EMT Challenge Exam', section: 'Personnel - EMT' },
  { slug: '0305-emt-accreditation-sep23', number: '0305', title: 'EMT Accreditation', section: 'Personnel - EMT' },

  // Personnel - Paramedic (0310 series)
  { slug: '0310-paramedic-scope-of-practice-aug25', number: '0310', title: 'Paramedic Scope of Practice', section: 'Personnel - Paramedic' },
  { slug: '0315-paramedic-accreditation-to-practice-sep25', number: '0315', title: 'Paramedic Accreditation to Practice', section: 'Personnel - Paramedic' },
  { slug: '0318-independent-practice-paramedic-sep25', number: '0318', title: 'Independent Practice Paramedic', section: 'Personnel - Paramedic' },
  { slug: '0319-paramedic-preceptor-feb25', number: '0319', title: 'Paramedic Preceptor', section: 'Personnel - Paramedic' },

  // Personnel - MICN (0320 series)
  { slug: '0321-micn-authorization-apr25', number: '0321', title: 'MICN Authorization', section: 'Personnel - MICN' },
  { slug: '0322-micn-reauthorization-apr25', number: '0322', title: 'MICN Reauthorization', section: 'Personnel - MICN' },
  { slug: '0323-micn-auth-challenge-jun24', number: '0323', title: 'MICN Authorization Challenge', section: 'Personnel - MICN' },
  { slug: '0324-micn-reactivation-apr25', number: '0324', title: 'MICN Reactivation', section: 'Personnel - MICN' },

  // Personnel - General (0330 series)
  { slug: '0330-emt-and-micn-decert-and-discipline-feb23', number: '0330', title: 'EMT and MICN Decertification and Discipline', section: 'Personnel' },
  { slug: '0332-ems-personnel-background-check-req-oct24', number: '0332', title: 'EMS Personnel Background Check Requirements', section: 'Personnel' },
  { slug: '0333-accreditation-authorization-certification-review-process-jun24', number: '0333', title: 'Accreditation Authorization Certification Review Process', section: 'Personnel' },
  { slug: '0334-prehospital-personnel-mandatory-training-sep25', number: '0334', title: 'Prehospital Personnel Mandatory Training', section: 'Personnel' },
  { slug: '0335-out-of-county-internship-aug25', number: '0335', title: 'Out of County Internship', section: 'Personnel' },
  { slug: '0342-notif-of-personnel-changes-providers-apr21', number: '0342', title: 'Notification of Personnel Changes Providers', section: 'Personnel' },
  { slug: '0350-pcc-job-duties-sep23', number: '0350', title: 'PCC Job Duties', section: 'Personnel' },

  // Hospitals (0400 series)
  { slug: '0400-ventura-county-emergency-departments-oct-2024', number: '0400', title: 'Ventura County Emergency Departments', section: 'Hospitals' },
  { slug: '0402-patient-diversion-and-ed-closures-aug25', number: '0402', title: 'Patient Diversion and ED Closures', section: 'Hospitals' },
  { slug: '0403-ambulance-patient-offload-time-nov25', number: '0403', title: 'Ambulance Patient Offload Time', section: 'Hospitals' },
  { slug: '0410-als-base-hospital-standards-feb24', number: '0410', title: 'ALS Base Hospital Standards', section: 'Hospitals' },
  { slug: '0420-receiving-and-standby-hospital-standards-aug24', number: '0420', title: 'Receiving and Standby Hospital Standards', section: 'Hospitals' },
  { slug: '0430-src-and-srh-standards-oct24', number: '0430', title: 'SRC and SRH Standards', section: 'Hospitals' },
  { slug: '0440-code-stemi-interfacility-transfer-feb25', number: '0440', title: 'Code STEMI Interfacility Transfer', section: 'Specialty Care' },
  { slug: '0450-asc-standards-sep24', number: '0450', title: 'ASC Standards', section: 'Specialty Care' },
  { slug: '0451-stroke-triage-and-destination-sept23', number: '0451', title: 'Stroke Triage and Destination', section: 'Specialty Care' },
  { slug: '0452-tcasc-standards-jan25', number: '0452', title: 'TCASC Standards', section: 'Specialty Care' },
  { slug: '0460-ift-emergency-dept-stroke-patients-sep24', number: '0460', title: 'IFT Emergency Dept Stroke Patients', section: 'Specialty Care' },

  // Providers (0500 series)
  { slug: '0500-ems-providers-agencies-sep22', number: '0500', title: 'EMS Providers Agencies', section: 'Providers' },
  { slug: '0501-als-provider-criteria-sep22', number: '0501', title: 'ALS Provider Criteria', section: 'Providers' },
  { slug: '0502-advanced-life-support-service-provider-approval-process-sep22', number: '0502', title: 'Advanced Life Support Service Provider Approval Process', section: 'Providers' },
  { slug: '0504-bls-and-als-equipment-and-supplies-aug25', number: '0504', title: 'BLS and ALS Equipment and Supplies', section: 'Providers' },
  { slug: '0504-waiver-request', number: '0504W', title: 'Waiver Request', section: 'Providers' },
  { slug: '0506-paramedic-support-vehicle-sep22', number: '0506', title: 'Paramedic Support Vehicle', section: 'Providers' },
  { slug: '0507-critical-care-transports-oct-2014', number: '0507', title: 'Critical Care Transports', section: 'Providers' },
  { slug: '0508-fr-als-units-sep22', number: '0508', title: 'FR ALS Units', section: 'Providers' },

  // Operations (0600 series)
  { slug: '0600-scene-control-at-a-medical-emergency-oct22', number: '0600', title: 'Scene Control at a Medical Emergency', section: 'Operations' },
  { slug: '0601-medical-control-at-the-scene-apr24', number: '0601', title: 'Medical Control at the Scene', section: 'Operations' },
  { slug: '0603-refusal-of-ems-services-feb22', number: '0603', title: 'Refusal of EMS Services', section: 'Operations' },
  { slug: '0604-transport-destination-guidelines-nov24', number: '0604', title: 'Transport Destination Guidelines', section: 'Operations' },
  { slug: '0605-interfaciity-transfer-of-patients-oct22', number: '0605', title: 'Interfacility Transfer of Patients', section: 'Operations' },
  { slug: '0606-determination-of-death-apr25', number: '0606', title: 'Determination of Death', section: 'Operations' },
  { slug: '0606-dod-flowchart-apr25', number: '0606F', title: 'Determination of Death Flowchart', section: 'Operations' },
  { slug: '0607-hazmat-incident-jun22', number: '0607', title: 'Hazmat Incident', section: 'Operations' },
  { slug: '0612-notification-of-exposure-to-communicable-disease-oct22', number: '0612', title: 'Notification of Exposure to Communicable Disease', section: 'Operations' },
  { slug: '0613-do-not-resuscitate-feb25', number: '0613', title: 'Do Not Resuscitate', section: 'Operations' },
  { slug: '0614-spinal-motion-restriction-sept22', number: '0614', title: 'Spinal Motion Restriction', section: 'Operations' },
  { slug: '0615-organ-donor-jun24', number: '0615', title: 'Organ Donor', section: 'Operations' },
  { slug: '0618-unaccompanied-minors-jun24', number: '0618', title: 'Unaccompanied Minors', section: 'Operations' },
  { slug: '0619-safely-surrendered-baby-jun24', number: '0619', title: 'Safely Surrendered Baby', section: 'Operations' },
  { slug: '0624-patient-medications-jun24', number: '0624', title: 'Patient Medications', section: 'Operations' },
  { slug: '0625-polst-feb25', number: '0625', title: 'POLST', section: 'Operations' },
  { slug: '0625-polstform-2017rv2', number: '0625F', title: 'POLST Form', section: 'Operations' },
  { slug: '0626-chempack-deployment-jan23', number: '0626', title: 'Chempack Deployment', section: 'Operations' },
  { slug: '0627-fireline-medic-aug24', number: '0627', title: 'Fireline Medic', section: 'Operations' },
  { slug: '0628-rescue-task-force-operations-feb23', number: '0628', title: 'Rescue Task Force Operations', section: 'Operations' },
  { slug: '0629-hospice-patient-care-nov24', number: '0629', title: 'Hospice Patient Care', section: 'Operations' },
  { slug: '0630-ventura-county-infectious-disease-policy-dec21', number: '0630', title: 'Ventura County Infectious Disease Policy', section: 'Operations' },
  { slug: '0631-mechanical-cpr-jan23', number: '0631', title: 'Mechanical CPR', section: 'Operations' },

  // Medical Control (0700 series)
  { slug: '0701-medical-control-paramedic-liaison-physician-jan14', number: '0701', title: 'Medical Control Paramedic Liaison Physician', section: 'Medical Control' },
  { slug: '0703-medical-control-at-scene-private-physician-physician-on-scene-sept-2022', number: '0703', title: 'Medical Control at Scene - Private Physician/Physician On Scene', section: 'Medical Control' },
  { slug: '0704-guidelines-for-base-hospital-contact-oct21', number: '0704', title: 'Guidelines for Base Hospital Contact', section: 'Medical Control' },

  // Treatment Protocols (0705 series) - MAIN CLINICAL PROTOCOLS
  { slug: '0705-00-general-patient-guidelines-sep25', number: '0705.00', title: 'General Patient Guidelines', section: 'Treatment Protocols' },
  { slug: '0705-01-trauma-treatment-guidelines-apr25', number: '0705.01', title: 'Trauma Treatment Guidelines', section: 'Treatment Protocols' },
  { slug: '0705-02-allergic-reaction-and-anaphylaxis-feb25', number: '0705.02', title: 'Allergic Reaction and Anaphylaxis', section: 'Treatment Protocols' },
  { slug: '0705-03-altered-neurologic-function-oct21', number: '0705.03', title: 'Altered Neurologic Function', section: 'Treatment Protocols' },
  { slug: '0705-04-behavioral-emergencies-feb24', number: '0705.04', title: 'Behavioral Emergencies', section: 'Treatment Protocols' },
  { slug: '0705-05-bites-and-stings-feb24', number: '0705.05', title: 'Bites and Stings', section: 'Treatment Protocols' },
  { slug: '0705-06-burns-feb22', number: '0705.06', title: 'Burns', section: 'Treatment Protocols' },
  { slug: '0705-07-cardiac-arrest-asystole-and-pea-may20', number: '0705.07', title: 'Cardiac Arrest Asystole and PEA', section: 'Treatment Protocols' },
  { slug: '0705-08-cardiac-arrest-vf-vt-oct20', number: '0705.08', title: 'Cardiac Arrest VF/VT', section: 'Treatment Protocols' },
  { slug: '0705-09-chest-pain-jun24', number: '0705.09', title: 'Chest Pain', section: 'Treatment Protocols' },
  { slug: '0705-10-childbirth-sept17', number: '0705.10', title: 'Childbirth', section: 'Treatment Protocols' },
  { slug: '0705-11-crush-injury-apr25', number: '0705.11', title: 'Crush Injury', section: 'Treatment Protocols' },
  { slug: '0705-12-heat-emergencies-apr23', number: '0705.12', title: 'Heat Emergencies', section: 'Treatment Protocols' },
  { slug: '0705-13-cold-emergencies-apr23', number: '0705.13', title: 'Cold Emergencies', section: 'Treatment Protocols' },
  { slug: '0705-14-hypovolemic-shock-apr25', number: '0705.14', title: 'Hypovolemic Shock', section: 'Treatment Protocols' },
  { slug: '0705-15-nausea-vomiting-jan23', number: '0705.15', title: 'Nausea Vomiting', section: 'Treatment Protocols' },
  { slug: '0705-16-neonatal-resuscitation-nov25', number: '0705.16', title: 'Neonatal Resuscitation', section: 'Treatment Protocols' },
  { slug: '0705-17-nerve-agent-organophosphate-dec23', number: '0705.17', title: 'Nerve Agent Organophosphate', section: 'Treatment Protocols' },
  { slug: '0705-18-overdose-oct24', number: '0705.18', title: 'Overdose', section: 'Treatment Protocols' },
  { slug: '0705-19-pain-control-may25', number: '0705.19', title: 'Pain Control', section: 'Treatment Protocols' },
  { slug: '0705-20-seizures-jun23', number: '0705.20', title: 'Seizures', section: 'Treatment Protocols' },
  { slug: '0705-21-respiratory-emergencies-jan23', number: '0705.21', title: 'Respiratory Emergencies', section: 'Treatment Protocols' },
  { slug: '0705-22-sepsis-oct22', number: '0705.22', title: 'Sepsis', section: 'Treatment Protocols' },
  { slug: '0705-23-bradycardia-oct21', number: '0705.23', title: 'Bradycardia', section: 'Treatment Protocols' },
  { slug: '0705-24-tachycardia-stable-and-unstable-oct21', number: '0705.24', title: 'Tachycardia Stable and Unstable', section: 'Treatment Protocols' },
  { slug: '0705-25-stroke-sept23', number: '0705.25', title: 'Stroke', section: 'Treatment Protocols' },
  { slug: '0705-26-diabetic-emergencies-apr23', number: '0705.26', title: 'Diabetic Emergencies', section: 'Treatment Protocols' },
  { slug: '0705-27-submersion-and-drowning-apr22', number: '0705.27', title: 'Submersion and Drowning', section: 'Treatment Protocols' },
  { slug: '0705-28-pediatrics-sep25', number: '0705.28', title: 'Pediatrics', section: 'Treatment Protocols' },
  { slug: '0705-29-obstetrical-emergencies-jan23', number: '0705.29', title: 'Obstetrical Emergencies', section: 'Treatment Protocols' },
  { slug: '0705-30-suspected-abuse-and-neglect-sep24', number: '0705.30', title: 'Suspected Abuse and Neglect', section: 'Treatment Protocols' },
  { slug: '0705-31-active-shooter-hostile-event-feb25', number: '0705.31', title: 'Active Shooter Hostile Event', section: 'Treatment Protocols' },
  { slug: '0705-32-excited-delirium-syndrome-feb24', number: '0705.32', title: 'Excited Delirium Syndrome', section: 'Treatment Protocols' },

  // Medications (0706 series)
  { slug: '0706-medication-reference-sep25', number: '0706', title: 'Medication Reference', section: 'Medications' },
  { slug: '0707-blood-products-jan24', number: '0707', title: 'Blood Products', section: 'Medications' },
  { slug: '0709-controlled-substances-oct24', number: '0709', title: 'Controlled Substances', section: 'Medications' },

  // Training & Education (0800 series)
  { slug: '0800-ce-provider-accreditation-jun22', number: '0800', title: 'CE Provider Accreditation', section: 'Training' },
  { slug: '0801-community-emt-and-aed-program-dec22', number: '0801', title: 'Community EMT and AED Program', section: 'Training' },

  // Trauma (0900 series)
  { slug: '0900-trauma-evaluation-and-triage-feb24', number: '0900', title: 'Trauma Evaluation and Triage', section: 'Trauma' },
  { slug: '0901-trauma-center-standards-feb24', number: '0901', title: 'Trauma Center Standards', section: 'Trauma' },
  { slug: '0902-trauma-patient-destination-feb24', number: '0902', title: 'Trauma Patient Destination', section: 'Trauma' },

  // Communications (1000 series)
  { slug: '1000-ems-communications-jan14', number: '1000', title: 'EMS Communications', section: 'Communications' },
  { slug: '1001-ems-communications-radio-protocol-codes-jan14', number: '1001', title: 'EMS Communications Radio Protocol Codes', section: 'Communications' },

  // Documentation (1100 series)
  { slug: '1100-epcr-documentation-and-data-sep25', number: '1100', title: 'ePCR Documentation and Data', section: 'Documentation' },

  // Air Medical (1200 series)
  { slug: '1200-air-ambulance-standards-sep25', number: '1200', title: 'Air Ambulance Standards', section: 'Air Medical' },
  { slug: '1201-air-ambulance-request-for-service-jun24', number: '1201', title: 'Air Ambulance Request for Service', section: 'Air Medical' },
  { slug: '1202-helipad-landing-zones-apr21', number: '1202', title: 'Helipad Landing Zones', section: 'Air Medical' },

  // Disaster (1300 series)
  { slug: '1300-multi-casualty-incident-plan-feb22', number: '1300', title: 'Multi-Casualty Incident Plan', section: 'Disaster' },
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
        'Referer': 'https://hca.venturacounty.gov/',
      },
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${filename}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    
    // Verify it's actually a PDF
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
  console.log('VENTURA COUNTY EMS PROTOCOL IMPORT');
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
    source_url: 'https://hca.venturacounty.gov/public-health/ems/policies/',
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
      const url = `${BASE_URL}/public-health/~documents/ems/policies/${source.slug}/?layout=file`;
      const success = await downloadPDF(url, filename);
      if (success) downloaded++;
      await new Promise(r => setTimeout(r, 300)); // Rate limiting
    }
    console.log(`\nDownloaded: ${downloaded}/${PDF_SOURCES.length} PDFs\n`);
  }

  // Clear existing chunks
  if (!dryRun) {
    console.log('Clearing existing Ventura County chunks...');
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
          source_pdf_url: `${BASE_URL}/public-health/~documents/ems/policies/${source.slug}/?layout=file`,
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
