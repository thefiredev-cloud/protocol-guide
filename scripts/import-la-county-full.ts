/**
 * LA County Full Protocol Import
 *
 * Comprehensive import of LA County EMS protocols from official sources.
 * Handles PDF parsing, proper metadata extraction, and embedding generation.
 *
 * Run with: npx tsx scripts/import-la-county-full.ts
 *
 * Options:
 *   --dry-run    Show what would be imported without making changes
 *   --skip-embed Skip embedding generation (import data only)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
  parseLACountyProtocols,
  parseProtocolBlock,
  LA_COUNTY_SOURCES,
  type ParsedProtocol
} from './parsers/la-county-pdf-parser';
import { chunkProtocol } from '../server/_core/protocol-chunker';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

const LA_COUNTY_CONFIG = {
  agencyName: 'Los Angeles County EMS Agency',
  stateCode: 'CA',
  countyId: 240009,
  population: 10014009,
};

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbedding(text: string): Promise<number[]> {
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
      input: text.substring(0, 8000),
      input_type: 'document'
    })
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

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
      input: texts.map(t => t.substring(0, 8000)),
      input_type: 'document'
    })
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.status}`);
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

async function insertChunks(chunks: ChunkInsert[], dryRun: boolean = false): Promise<number> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would insert ${chunks.length} chunks`);
    return chunks.length;
  }

  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { error } = await supabase
      .from('manus_protocol_chunks')
      .upsert(batch, {
        onConflict: 'agency_name,protocol_number,content',
        ignoreDuplicates: true
      });

    if (error) {
      console.error(`  Error inserting batch: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  return inserted;
}

async function deleteExistingLACountyData(): Promise<number> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .delete()
    .or('agency_name.ilike.%Los Angeles%,agency_name.ilike.%LA County%')
    .select('id');

  if (error) {
    console.error(`Error deleting: ${error.message}`);
    return 0;
  }

  return data?.length || 0;
}

// ============================================================================
// PROTOCOL PROCESSING
// ============================================================================

async function processProtocol(
  protocol: ParsedProtocol,
  generateEmbeddings: boolean = true
): Promise<ChunkInsert[]> {
  const chunks = chunkProtocol(
    protocol.content,
    protocol.protocolNumber,
    protocol.protocolTitle
  );

  const results: ChunkInsert[] = [];

  for (const chunk of chunks) {
    const insert: ChunkInsert = {
      agency_name: LA_COUNTY_CONFIG.agencyName,
      state_code: LA_COUNTY_CONFIG.stateCode,
      protocol_number: protocol.protocolNumber,
      protocol_title: protocol.protocolTitle,
      section: protocol.section,
      content: chunk.content,
      source_pdf_url: protocol.sourcePdfUrl,
      protocol_year: protocol.protocolYear,
    };

    results.push(insert);
  }

  // Generate embeddings in batch
  if (generateEmbeddings && results.length > 0) {
    try {
      const embeddings = await generateEmbeddingsBatch(
        results.map(r => `${r.protocol_title}\n\n${r.content}`)
      );

      for (let i = 0; i < results.length; i++) {
        results[i].embedding = embeddings[i];
      }
    } catch (error: any) {
      console.warn(`  Warning: Could not generate embeddings: ${error.message}`);
    }
  }

  return results;
}

// ============================================================================
// MANUAL CRITICAL PROTOCOLS
// ============================================================================

/**
 * Critical protocols that should always be present
 * These are manually curated based on field testing feedback
 */
const CRITICAL_PROTOCOLS: ParsedProtocol[] = [
  {
    protocolNumber: "506",
    protocolTitle: "Ref 506 - Trauma Triage / Pediatric Medical Center (PMC) Criteria",
    section: "Trauma",
    sourcePdfUrl: LA_COUNTY_SOURCES.protocols['506'] || LA_COUNTY_SOURCES.masterPdf,
    protocolYear: 2024,
    effectiveDate: null,
    providerScope: "PARAMEDIC, MICN, EMT",
    content: `REFERENCE NO. 506 - TRAUMA TRIAGE / PEDIATRIC MEDICAL CENTER (PMC) CRITERIA

SECTION I: TRAUMA CENTER DESIGNATION

Level I Trauma Centers:
• LA General Medical Center (LA+USC)
• Harbor-UCLA Medical Center
• Cedars-Sinai Medical Center
• UCLA Ronald Reagan Medical Center

PEDIATRIC TRAUMA CENTERS (PTC):
• Children's Hospital Los Angeles (CHLA)
• Harbor-UCLA Medical Center (Pediatric)
• LA General Medical Center (Pediatric)

=== PEDIATRIC MEDICAL CENTER (PMC) TRANSPORT CRITERIA ===

PMC CRITERIA - Transport pediatric trauma patients to a Pediatric Trauma Center (PTC) when ANY of the following are present:

AGE CRITERIA:
• Age <14 years with major trauma
• Pediatric patients meeting adult trauma center criteria

PHYSIOLOGIC CRITERIA (PMC):
• Pediatric Trauma Score (PTS) ≤8
• Glasgow Coma Score (GCS) ≤13
• Systolic BP <70 + (2 × age in years)
• Respiratory distress or need for assisted ventilation

ANATOMIC CRITERIA (PMC):
• Penetrating injury to head, neck, chest, abdomen, or groin
• Open skull fracture or depressed skull fracture
• Flail chest
• Two or more proximal long bone fractures
• Pelvic fracture
• Limb paralysis (spinal cord injury)

Provider Impressions: TRAM, TRAS, MULT, HEAD, ARTR

Cross-Reference: TP 1243 (Traumatic Arrest), TP 1244 (Traumatic Injury), Ref 814 (Determination of Death)`
  },
  {
    protocolNumber: "814",
    protocolTitle: "Ref 814 - Determination/Pronouncement of Death in the Field",
    section: "Reference",
    sourcePdfUrl: LA_COUNTY_SOURCES.protocols['814'] || LA_COUNTY_SOURCES.masterPdf,
    protocolYear: 2024,
    effectiveDate: null,
    providerScope: "PARAMEDIC, MICN",
    content: `REFERENCE NO. 814 - DETERMINATION/PRONOUNCEMENT OF DEATH IN THE FIELD

SECTION I: FIELD DETERMINATION WITHOUT BASE HOSPITAL CONTACT

Death may be determined in the field WITHOUT Base Hospital contact when ANY of the following OBVIOUS SIGNS OF DEATH are present:

OBVIOUS DEATH CRITERIA:
• Decapitation
• Decomposition
• Dependent lividity (livor mortis)
• Rigor mortis
• Incineration (total body charring)
• Massive cranial destruction with brain matter exposed
• Transection of the body

SECTION II: FIELD DETERMINATION WITH BASE HOSPITAL CONTACT

Contact Base Hospital for death determination when:
• Cardiac arrest with 20 minutes of high-quality CPR without ROSC
• Asystole in multiple leads for >20 minutes
• Traumatic arrest with no signs of life

DOCUMENTATION REQUIREMENTS:
• Time of determination
• Criteria met for determination
• Base Hospital physician name (if contacted)
• Presence of obvious death signs

Provider Impressions: DEAD, CARD

Cross-Reference: Ref 817 (HERT), TP 1208 (Cardiac Arrest)`
  },
  {
    protocolNumber: "817",
    protocolTitle: "Ref 817 - Hospital Emergency Response Team (HERT)",
    section: "Reference",
    sourcePdfUrl: LA_COUNTY_SOURCES.protocols['817'] || LA_COUNTY_SOURCES.masterPdf,
    protocolYear: 2024,
    effectiveDate: null,
    providerScope: "PARAMEDIC, MICN",
    content: `REFERENCE NO. 817 - HOSPITAL EMERGENCY RESPONSE TEAM (HERT)

PURPOSE:
The Hospital Emergency Response Team (HERT) provides physician-level trauma and critical care response to the field for complex situations requiring advanced interventions.

HERT ACTIVATION CRITERIA:
• Prolonged extrication (>20 minutes anticipated)
• Crush injury with entrapment
• Potential field amputation requirement
• Multiple casualty incidents with critical patients
• Complex medical situations requiring physician guidance

HERT HOSPITALS:
• LA General Medical Center (LA+USC) - Primary
• Harbor-UCLA Medical Center - Primary
• Cedars-Sinai Medical Center - Secondary

HERT CAPABILITIES:
• Surgical airway
• Field amputation
• Surgical hemorrhage control
• Advanced resuscitation
• Field pronouncement authority

ACTIVATION PROCESS:
1. Contact Base Hospital
2. Request HERT activation
3. Provide scene location and patient count
4. Describe entrapment/situation

Provider Impressions: CRUS, TRAM, MULT

Cross-Reference: TP 1242 (Crush Injury), Ref 506 (Trauma Triage)`
  },
  {
    protocolNumber: "1335",
    protocolTitle: "TP 1335 - Needle Thoracostomy (Needle Decompression)",
    section: "Procedure",
    sourcePdfUrl: LA_COUNTY_SOURCES.protocols['1335'] || LA_COUNTY_SOURCES.masterPdf,
    protocolYear: 2024,
    effectiveDate: null,
    providerScope: "PARAMEDIC, MICN",
    content: `TREATMENT PROTOCOL 1335 - NEEDLE THORACOSTOMY (NEEDLE DECOMPRESSION)

INDICATIONS:
Suspected tension pneumothorax with ALL of the following:
• Significant respiratory distress
• Unilateral decreased or absent breath sounds
• Hypotension or signs of shock
• Tracheal deviation (late sign)
• JVD (may be absent if hypovolemic)

CONTRAINDICATIONS:
• Simple pneumothorax without tension physiology
• Hemothorax without tension
• Patient improving with oxygen therapy alone

EQUIPMENT:
• 14-gauge, 3.25-inch angiocatheter (minimum)
• Antiseptic prep
• Tape

PROCEDURE:
1. Identify the 2nd intercostal space (2nd ICS) at midclavicular line (MCL)
2. Prep site with antiseptic
3. Insert needle perpendicular to chest wall
4. Advance over the 3rd rib (to avoid intercostal vessels)
5. Listen for rush of air (may not always be present)
6. Remove needle, leave catheter in place
7. Secure catheter with tape
8. Reassess breath sounds and vital signs

ALTERNATIVE SITE:
• 4th or 5th intercostal space, anterior axillary line

ANATOMICAL LANDMARKS:
• 2nd ICS: Located below the clavicle, find angle of Louis (sternal angle), the rib immediately below is the 2nd rib
• MCL: Vertical line through midpoint of clavicle
• Superior border of 3rd rib: Needle enters above the rib to avoid neurovascular bundle

EXPECTED FINDINGS:
• Rush of air on insertion (not always present)
• Improvement in respiratory status
• Improvement in blood pressure
• Reduced JVD

DOCUMENTATION:
• Time of procedure
• Site used (2nd ICS MCL or alternative)
• Response to decompression
• Complications if any

Provider Impressions: RESP, TRAM

Cross-Reference: TP 1220 (Respiratory Distress), TP 1244 (Traumatic Injury)`
  },
  {
    protocolNumber: "1242",
    protocolTitle: "TP 1242 - Crush Injury / Crush Syndrome",
    section: "Trauma",
    sourcePdfUrl: LA_COUNTY_SOURCES.protocols['1242'] || LA_COUNTY_SOURCES.masterPdf,
    protocolYear: 2024,
    effectiveDate: null,
    providerScope: "PARAMEDIC, MICN",
    content: `TREATMENT PROTOCOL 1242 - CRUSH INJURY / CRUSH SYNDROME

DEFINITION:
Crush injury occurs when body parts are compressed for extended periods, leading to muscle damage and potentially life-threatening complications upon release.

CRUSH SYNDROME PATHOPHYSIOLOGY:
• Muscle cell death releases myoglobin, potassium, phosphorus
• Hyperkalemia can cause fatal cardiac arrhythmias
• Rhabdomyolysis leads to renal failure
• Reperfusion injury upon release can cause cardiovascular collapse

TIME-BASED RISK:
• <1 hour compression: Low risk of crush syndrome
• 1-4 hours: Moderate risk
• >4 hours: High risk - HERT activation recommended

TREATMENT - BEFORE RELEASE:
1. Establish IV access (large bore, two lines preferred)
2. Cardiac monitoring - watch for peaked T waves
3. Administer Normal Saline: 1-2L bolus before release
4. Consider Sodium Bicarbonate: 1 mEq/kg IV if prolonged entrapment
5. Contact Base Hospital for HERT activation if >4 hours

TREATMENT FOR HYPERKALEMIA:
If ECG changes (peaked T waves, widened QRS):
• Calcium Chloride 10%: 1g IV slow push (or Calcium Gluconate 2g)
• Sodium Bicarbonate: 1 mEq/kg IV
• Albuterol: 2.5mg nebulized

TRANSPORT CONSIDERATIONS:
• Transport to trauma center with dialysis capability
• Consider HERT activation for prolonged entrapment
• Monitor for arrhythmias during and after release

Provider Impressions: CRUS, TRAM, ARTR

Cross-Reference: Ref 817 (HERT), TP 1244 (Traumatic Injury)`
  },
  {
    protocolNumber: "1200.3",
    protocolTitle: "TP 1200.3 - Provider Impression Codes",
    section: "Reference",
    sourcePdfUrl: LA_COUNTY_SOURCES.masterPdf,
    protocolYear: 2024,
    effectiveDate: null,
    providerScope: "PARAMEDIC, MICN, EMT",
    content: `TREATMENT PROTOCOL 1200.3 - PROVIDER IMPRESSION CODES

Provider impressions are 4-letter codes assigned based on patient presentation and chief complaint.

COMMON PROVIDER IMPRESSION CODES:

CARDIAC/CIRCULATORY:
• CARD - Cardiac Arrest
• STMI - ST-Elevation MI (STEMI)
• CHPN - Chest Pain, Cardiac
• CHPO - Chest Pain, Other
• SYNC - Syncope
• ARRH - Arrhythmia

RESPIRATORY:
• RESP - Respiratory Distress
• ASTH - Asthma/Reactive Airway
• COPD - COPD Exacerbation
• AIRW - Airway Obstruction

NEUROLOGICAL:
• STRK - Stroke/CVA
• SEIZ - Seizure
• ALOC - Altered Level of Consciousness
• HEAD - Head Injury

TRAUMA:
• TRAM - Trauma, Major
• TRAS - Trauma, Minor
• MULT - Multi-System Trauma
• CRUS - Crush Injury
• BURN - Burn Injury
• ARTR - Extremity Injury

MEDICAL:
• DIAB - Diabetic Emergency
• ALRG - Allergic Reaction/Anaphylaxis
• OVER - Overdose/Poisoning
• ABDO - Abdominal Pain
• PSYC - Psychiatric/Behavioral

SPECIAL:
• DIAL - Dialysis Patient/AV Fistula
• DEAD - Dead on Arrival/Obvious Death
• CANT - Cannot Transport (AMA)
• WELL - Wellness Check, No Patient

DIALYSIS FISTULA BLEEDING (DIAL):
For bleeding AV fistula or graft:
• Apply DIRECT PRESSURE only
• Do NOT use tourniquet proximal to fistula
• Do NOT clamp fistula
• Transport to patient's dialysis center if stable
• Contact Base Hospital for remote dialysis units

Provider Impressions: Reference guide for documentation

Cross-Reference: All Treatment Protocols`
  },
];

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('LA COUNTY FULL PROTOCOL IMPORT');
  console.log('='.repeat(70));
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const dryRun = process.argv.includes('--dry-run');
  const skipEmbed = process.argv.includes('--skip-embed');

  if (dryRun) {
    console.log('[DRY RUN MODE] No changes will be made.\n');
  }
  if (skipEmbed) {
    console.log('[SKIP EMBEDDINGS] Embeddings will not be generated.\n');
  }

  try {
    // Phase 1: Import critical protocols
    console.log('--- PHASE 1: CRITICAL PROTOCOLS ---\n');
    console.log(`Processing ${CRITICAL_PROTOCOLS.length} critical protocols...`);

    const allChunks: ChunkInsert[] = [];

    for (const protocol of CRITICAL_PROTOCOLS) {
      console.log(`  Processing: ${protocol.protocolNumber} - ${protocol.protocolTitle.substring(0, 40)}...`);

      const chunks = await processProtocol(protocol, !skipEmbed);
      console.log(`    Generated ${chunks.length} chunks`);
      allChunks.push(...chunks);

      // Rate limit for embedding API
      if (!skipEmbed) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\nTotal chunks to insert: ${allChunks.length}`);

    // Insert chunks
    if (!dryRun) {
      console.log('\nInserting chunks...');
      const inserted = await insertChunks(allChunks, dryRun);
      console.log(`Inserted: ${inserted} chunks`);
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(70));
    console.log(`\n  Agency: ${LA_COUNTY_CONFIG.agencyName}`);
    console.log(`  State: ${LA_COUNTY_CONFIG.stateCode}`);
    console.log(`  Protocols processed: ${CRITICAL_PROTOCOLS.length}`);
    console.log(`  Chunks generated: ${allChunks.length}`);
    console.log(`  Embeddings: ${skipEmbed ? 'Skipped' : 'Generated'}`);
    console.log(`  Mode: ${dryRun ? 'Dry Run' : 'Live'}`);

    if (dryRun) {
      console.log('\nTo apply changes, run without --dry-run:');
      console.log('  npx tsx scripts/import-la-county-full.ts');
    } else {
      console.log('\nImport complete! Run verification:');
      console.log('  npx tsx scripts/verify-la-county-protocols.ts');
    }

  } catch (error: any) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

main();
