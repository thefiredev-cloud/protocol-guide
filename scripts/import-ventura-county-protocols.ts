/**
 * Ventura County EMS Protocol Import
 *
 * Downloads Ventura County EMS protocols from hca.venturacounty.gov,
 * parses content, generates Voyage embeddings, and inserts into Supabase.
 *
 * Run with: npx tsx scripts/import-ventura-county-protocols.ts
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

// All Ventura County EMS Policies/Protocols from hca.venturacounty.gov/public-health/ems/policies/
const PDF_SOURCES = [
  // Section 0100 - Administrative/LEMSA
  { path: '/public-health/~documents/ems/policies/0100-local-ems-agency-oct03/?layout=file', number: '0100', title: 'Local EMS Agency', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0105-psc-guidelines-apr22/?layout=file', number: '0105', title: 'PSC Guidelines', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0106-dev-of-proposed-policy-sep18/?layout=file', number: '0106', title: 'Development of Proposed Policy', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0107-stroke-and-stemi-committees-oct24/?layout=file', number: '0107', title: 'Stroke and STEMI Committees', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0110-ord-4099-amb-business-lic-sep18/?layout=file', number: '0110', title: 'Ordinance 4099 Ambulance Business License', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0111-ambulance-company-licensing-procedure-nov24/?layout=file', number: '0111', title: 'Ambulance Company Licensing Procedure', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0112-ambulance-rates-jul-25/?layout=file', number: '0112', title: 'Ambulance Rates', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0120-ems-qip-nov23/?layout=file', number: '0120', title: 'EMS Quality Improvement Program', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0121-safety-event-review-apr23/?layout=file', number: '0121', title: 'Safety Event Review', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0122-ems-education-committee-guidelines-feb24/?layout=file', number: '0122', title: 'EMS Education Committee Guidelines', section: 'Administrative' },
  { path: '/public-health/~documents/ems/policies/0124-hospital-emergency-services-reduction-impact-assessment-nov24/?layout=file', number: '0124', title: 'Hospital Emergency Services Reduction Impact Assessment', section: 'Administrative' },

  // Section 0200 - Reporting
  { path: '/public-health/~documents/ems/policies/0210-abuse-reporting-guidelines-nov24/?layout=file', number: '0210', title: 'Abuse Reporting Guidelines', section: 'Reporting' },

  // Section 0300 - Personnel
  { path: '/public-health/~documents/ems/policies/0300-emt-scope-of-practice-nov22/?layout=file', number: '0300', title: 'EMT Scope of Practice', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0301-emt-certification-nov22/?layout=file', number: '0301', title: 'EMT Certification', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0302-emt-renewal-oct22/?layout=file', number: '0302', title: 'EMT Renewal', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0303-b-vc-optional-skills-plan-sep23/?layout=file', number: '0303-B', title: 'VC Optional Skills Plan', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0303-emt-optional-skills-dec23/?layout=file', number: '0303', title: 'EMT Optional Skills', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0304-emt-challenge-exam-nov22/?layout=file', number: '0304', title: 'EMT Challenge Exam', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0305-emt-accreditation-sep23/?layout=file', number: '0305', title: 'EMT Accreditation', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0310-paramedic-scope-of-practice-aug25/?layout=file', number: '0310', title: 'Paramedic Scope of Practice', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0315-paramedic-accreditation-to-practice-sep25/?layout=file', number: '0315', title: 'Paramedic Accreditation to Practice', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0318-independent-practice-paramedic-sep25/?layout=file', number: '0318', title: 'Independent Practice Paramedic', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0319-paramedic-preceptor-feb25/?layout=file', number: '0319', title: 'Paramedic Preceptor', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0321-micn-authorization-apr25/?layout=file', number: '0321', title: 'MICN Authorization', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0322-micn-reauthorization-apr25/?layout=file', number: '0322', title: 'MICN Reauthorization', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0323-micn-auth-challenge-jun24/?layout=file', number: '0323', title: 'MICN Authorization Challenge', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0324-micn-reactivation-apr25/?layout=file', number: '0324', title: 'MICN Reactivation', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0330-emt-and-micn-decert-and-discipline-feb23/?layout=file', number: '0330', title: 'EMT and MICN Decertification and Discipline', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0332-ems-personnel-background-check-req-oct24/?layout=file', number: '0332', title: 'EMS Personnel Background Check Requirements', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0333-accreditation-authorization-certification-review-process-jun24/?layout=file', number: '0333', title: 'Accreditation Authorization Certification Review Process', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0334-prehospital-personnel-mandatory-training-sep25/?layout=file', number: '0334', title: 'Prehospital Personnel Mandatory Training', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0335-out-of-county-internship-aug25/?layout=file', number: '0335', title: 'Out of County Internship', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0342-notif-of-personnel-changes-providers-apr21/?layout=file', number: '0342', title: 'Notification of Personnel Changes - Providers', section: 'Personnel' },
  { path: '/public-health/~documents/ems/policies/0350-pcc-job-duties-sep23/?layout=file', number: '0350', title: 'PCC Job Duties', section: 'Personnel' },

  // Section 0400 - Hospitals/Receiving Facilities
  { path: '/public-health/~documents/ems/policies/0400-ventura-county-emergency-departments-oct-2024/?layout=file', number: '0400', title: 'Ventura County Emergency Departments', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0402-patient-diversion-and-ed-closures-aug25/?layout=file', number: '0402', title: 'Patient Diversion and ED Closures', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0403-ambulance-patient-offload-time-nov25/?layout=file', number: '0403', title: 'Ambulance Patient Offload Time', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0410-als-base-hospital-standards-feb24/?layout=file', number: '0410', title: 'ALS Base Hospital Standards', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0420-receiving-and-standby-hospital-standards-aug24/?layout=file', number: '0420', title: 'Receiving and Standby Hospital Standards', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0430-src-and-srh-standards-oct24/?layout=file', number: '0430', title: 'SRC and SRH Standards', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0440-code-stemi-interfacility-transfer-feb25/?layout=file', number: '0440', title: 'Code STEMI Interfacility Transfer', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0450-asc-standards-sep24/?layout=file', number: '0450', title: 'ASC Standards', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0451-stroke-triage-and-destination-sept23/?layout=file', number: '0451', title: 'Stroke Triage and Destination', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0452-tcasc-standards-jan25/?layout=file', number: '0452', title: 'TCASC Standards', section: 'Hospitals' },
  { path: '/public-health/~documents/ems/policies/0460-ift-emergency-dept-stroke-patients-sep24/?layout=file', number: '0460', title: 'IFT Emergency Dept Stroke Patients', section: 'Hospitals' },

  // Section 0500 - Providers/Agencies
  { path: '/public-health/~documents/ems/policies/0500-ems-providers-agencies-sep22/?layout=file', number: '0500', title: 'EMS Providers Agencies', section: 'Providers' },
  { path: '/public-health/~documents/ems/policies/0501-als-provider-criteria-sep22/?layout=file', number: '0501', title: 'ALS Provider Criteria', section: 'Providers' },
  { path: '/public-health/~documents/ems/policies/0502-advanced-life-support-service-provider-approval-process-sep22/?layout=file', number: '0502', title: 'Advanced Life Support Service Provider Approval Process', section: 'Providers' },
  { path: '/public-health/~documents/ems/policies/0504-bls-and-als-equipment-and-supplies-aug25/?layout=file', number: '0504', title: 'BLS and ALS Equipment and Supplies', section: 'Providers' },
  { path: '/public-health/~documents/ems/policies/0504-waiver-request/?layout=file', number: '0504-W', title: 'Equipment Waiver Request Form', section: 'Providers' },
  { path: '/public-health/~documents/ems/policies/0506-paramedic-support-vehicle-sep22/?layout=file', number: '0506', title: 'Paramedic Support Vehicle', section: 'Providers' },
  { path: '/public-health/~documents/ems/policies/0507-critical-care-transports-oct-2014/?layout=file', number: '0507', title: 'Critical Care Transports', section: 'Providers' },
  { path: '/public-health/~documents/ems/policies/0508-fr-als-units-sep22/?layout=file', number: '0508', title: 'FR ALS Units', section: 'Providers' },

  // Section 0600 - Operations
  { path: '/public-health/~documents/ems/policies/0600-scene-control-at-a-medical-emergency-oct22/?layout=file', number: '0600', title: 'Scene Control at a Medical Emergency', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0601-medical-control-at-the-scene-apr24/?layout=file', number: '0601', title: 'Medical Control at the Scene', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0603-refusal-of-ems-services-feb22/?layout=file', number: '0603', title: 'Refusal of EMS Services', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0604-transport-destination-guidelines-nov24/?layout=file', number: '0604', title: 'Transport Destination Guidelines', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0605-interfaciity-transfer-of-patients-oct22/?layout=file', number: '0605', title: 'Interfacility Transfer of Patients', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0606-determination-of-death-apr25/?layout=file', number: '0606', title: 'Determination of Death', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0606-dod-flowchart-apr25/?layout=file', number: '0606-F', title: 'Determination of Death Flowchart', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0607-hazmat-incident-jun22/?layout=file', number: '0607', title: 'Hazmat Incident', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0612-notification-of-exposure-to-communicable-disease-oct22/?layout=file', number: '0612', title: 'Notification of Exposure to Communicable Disease', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0613-do-not-resuscitate-feb25/?layout=file', number: '0613', title: 'Do Not Resuscitate', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0614-spinal-motion-restriction-sept22/?layout=file', number: '0614', title: 'Spinal Motion Restriction', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0615-organ-donor-jun24/?layout=file', number: '0615', title: 'Organ Donor', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0618-unaccompanied-minors-jun24/?layout=file', number: '0618', title: 'Unaccompanied Minors', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0619-safely-surrendered-baby-jun24/?layout=file', number: '0619', title: 'Safely Surrendered Baby', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0624-patient-medications-jun24/?layout=file', number: '0624', title: 'Patient Medications', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0625-polst-feb25/?layout=file', number: '0625', title: 'POLST', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0625-polstform-2017rv2/?layout=file', number: '0625-F', title: 'POLST Form', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0626-chempack-deployment-jan23/?layout=file', number: '0626', title: 'Chempack Deployment', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0627-fireline-medic-aug24/?layout=file', number: '0627', title: 'Fireline Medic', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0628-rescue-task-force-operations-feb23/?layout=file', number: '0628', title: 'Rescue Task Force Operations', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0629-hospice-patient-care-nov24/?layout=file', number: '0629', title: 'Hospice Patient Care', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0630-ventura-county-infectious-disease-policy-dec21/?layout=file', number: '0630', title: 'Ventura County Infectious Disease Policy', section: 'Operations' },
  { path: '/public-health/~documents/ems/policies/0631-mechanical-cpr-jan23/?layout=file', number: '0631', title: 'Mechanical CPR', section: 'Operations' },

  // Section 0700 - Medical Control and Treatment Guidelines
  { path: '/public-health/~documents/ems/policies/0701-medical-control-paramedic-liaison-physician-jan14/?layout=file', number: '0701', title: 'Medical Control Paramedic Liaison Physician', section: 'Medical Control' },
  { path: '/public-health/~documents/ems/policies/0703-medical-control-at-scene-private-physician-physician-on-scene-sept-2022/?layout=file', number: '0703', title: 'Medical Control at Scene - Private Physician/Physician On Scene', section: 'Medical Control' },
  { path: '/public-health/~documents/ems/policies/0704-guidelines-for-base-hospital-contact-oct21/?layout=file', number: '0704', title: 'Guidelines for Base Hospital Contact', section: 'Medical Control' },
  
  // Section 0705 - Treatment Protocols
  { path: '/public-health/~documents/ems/policies/0705-00-general-patient-guidelines-sep25/?layout=file', number: '0705.00', title: 'General Patient Guidelines', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-01-trauma-treatment-guidelines-apr25/?layout=file', number: '0705.01', title: 'Trauma Treatment Guidelines', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-02-allergic-reaction-and-anaphylaxis-feb25/?layout=file', number: '0705.02', title: 'Allergic Reaction and Anaphylaxis', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-03-altered-neurologic-function-oct21/?layout=file', number: '0705.03', title: 'Altered Neurologic Function', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-04-behavioral-emergencies-feb24/?layout=file', number: '0705.04', title: 'Behavioral Emergencies', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-05-bites-and-stings-feb24/?layout=file', number: '0705.05', title: 'Bites and Stings', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-06-burns-feb22/?layout=file', number: '0705.06', title: 'Burns', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-07-cardiac-arrest-asystole-and-pea-may20/?layout=file', number: '0705.07', title: 'Cardiac Arrest Asystole and PEA', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-08-cardiac-arrest-vf-vt-oct20/?layout=file', number: '0705.08', title: 'Cardiac Arrest VF/VT', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-09-chest-pain-jun24/?layout=file', number: '0705.09', title: 'Chest Pain', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-10-childbirth-sept17/?layout=file', number: '0705.10', title: 'Childbirth', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-11-crush-injury-apr25/?layout=file', number: '0705.11', title: 'Crush Injury', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-12-heat-emergencies-apr23/?layout=file', number: '0705.12', title: 'Heat Emergencies', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-13-cold-emergencies-apr23/?layout=file', number: '0705.13', title: 'Cold Emergencies', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-14-hypovolemic-shock-apr25/?layout=file', number: '0705.14', title: 'Hypovolemic Shock', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-15-nausea-vomiting-jan23/?layout=file', number: '0705.15', title: 'Nausea Vomiting', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-16-neonatal-resuscitation-nov25/?layout=file', number: '0705.16', title: 'Neonatal Resuscitation', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-17-nerve-agent-organophosphate-dec23/?layout=file', number: '0705.17', title: 'Nerve Agent Organophosphate', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-18-overdose-oct24/?layout=file', number: '0705.18', title: 'Overdose', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-19-pain-control-may25/?layout=file', number: '0705.19', title: 'Pain Control', section: 'Treatment Protocols' },
  { path: '/public-health/~documents/ems/policies/0705-20-seizures-jun23/?layout=file', number: '0705.20', title: 'Seizures', section: 'Treatment Protocols' },
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
      redirect: 'follow',
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
      const url = `${BASE_URL}${source.path}`;
      const success = await downloadPDF(url, filename);
      if (success) downloaded++;
      await new Promise(r => setTimeout(r, 200)); // Rate limiting
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
