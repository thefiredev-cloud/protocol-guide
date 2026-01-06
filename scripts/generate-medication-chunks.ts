/**
 * Generate Medication Chunks Script
 *
 * Creates searchable chunks from medications for semantic search.
 * Each medication is chunked into: overview, adult_dosing, pediatric_dosing, contraindications
 *
 * Run with: npx tsx scripts/generate-medication-chunks.ts
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ============================================
// Initialize Supabase
// ============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// Types
// ============================================

interface MedicationChunk {
  medication_id: string;
  medication_name: string;
  chunk_type: 'overview' | 'adult_dosing' | 'pediatric_dosing' | 'contraindications' | 'indications';
  patient_type: 'adult' | 'pediatric' | 'all';
  content: string;
}

interface MedicationRecord {
  medication_id: string;
  name: string;
  classification: string | null;
  mechanism: string | null;
  indications: string[] | null;
  contraindications: string[] | null;
  adult_dosing: {
    indications?: Array<{ indication: string; dose: string; route: string; frequency?: string }>;
    notes?: string;
  } | null;
  pediatric_dosing: {
    indications?: Array<{ indication: string; dose: string; route: string; frequency?: string; max_dose?: string }>;
    notes?: string;
  } | null;
  routes: string[] | null;
}

// ============================================
// Chunk Generation Functions
// ============================================

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<b>/gi, '')
    .replace(/<\/b>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function generateOverviewChunk(med: MedicationRecord): MedicationChunk {
  const parts: string[] = [
    `Medication: ${med.name}`,
  ];

  if (med.classification) {
    parts.push(`Classification: ${med.classification}`);
  }

  if (med.mechanism) {
    parts.push(`Mechanism of Action: ${med.mechanism}`);
  }

  if (med.routes && med.routes.length > 0) {
    parts.push(`Routes: ${med.routes.join(', ')}`);
  }

  return {
    medication_id: med.medication_id,
    medication_name: med.name,
    chunk_type: 'overview',
    patient_type: 'all',
    content: parts.join('\n'),
  };
}

function generateIndicationsChunk(med: MedicationRecord): MedicationChunk | null {
  if (!med.indications || med.indications.length === 0) {
    return null;
  }

  const content = [
    `Medication: ${med.name}`,
    `Indications:`,
    ...med.indications.map(ind => `• ${stripHtml(ind)}`),
  ].join('\n');

  return {
    medication_id: med.medication_id,
    medication_name: med.name,
    chunk_type: 'indications',
    patient_type: 'all',
    content,
  };
}

function generateContraindicationsChunk(med: MedicationRecord): MedicationChunk | null {
  if (!med.contraindications || med.contraindications.length === 0) {
    return null;
  }

  const content = [
    `Medication: ${med.name}`,
    `Contraindications:`,
    ...med.contraindications.map(c => `• ${stripHtml(c)}`),
  ].join('\n');

  return {
    medication_id: med.medication_id,
    medication_name: med.name,
    chunk_type: 'contraindications',
    patient_type: 'all',
    content,
  };
}

function generateAdultDosingChunk(med: MedicationRecord): MedicationChunk | null {
  if (!med.adult_dosing) {
    return null;
  }

  const parts: string[] = [
    `Medication: ${med.name}`,
    `Adult Dosing:`,
  ];

  if (med.adult_dosing.indications) {
    for (const dose of med.adult_dosing.indications) {
      parts.push(`• ${dose.indication}: ${dose.dose} ${dose.route}${dose.frequency ? ` ${dose.frequency}` : ''}`);
    }
  }

  if (med.adult_dosing.notes) {
    parts.push(`Notes: ${stripHtml(med.adult_dosing.notes)}`);
  }

  // If only notes exist or nothing, check if we have meaningful content
  if (parts.length <= 2) {
    return null;
  }

  return {
    medication_id: med.medication_id,
    medication_name: med.name,
    chunk_type: 'adult_dosing',
    patient_type: 'adult',
    content: parts.join('\n'),
  };
}

function generatePediatricDosingChunk(med: MedicationRecord): MedicationChunk | null {
  if (!med.pediatric_dosing) {
    return null;
  }

  const parts: string[] = [
    `Medication: ${med.name}`,
    `Pediatric Dosing:`,
  ];

  if (med.pediatric_dosing.indications) {
    for (const dose of med.pediatric_dosing.indications) {
      let doseStr = `• ${dose.indication}: ${dose.dose} ${dose.route}`;
      if (dose.frequency) doseStr += ` ${dose.frequency}`;
      if (dose.max_dose) doseStr += ` (Max: ${dose.max_dose})`;
      parts.push(doseStr);
    }
  }

  if (med.pediatric_dosing.notes) {
    parts.push(`Notes: ${stripHtml(med.pediatric_dosing.notes)}`);
  }

  if (parts.length <= 2) {
    return null;
  }

  return {
    medication_id: med.medication_id,
    medication_name: med.name,
    chunk_type: 'pediatric_dosing',
    patient_type: 'pediatric',
    content: parts.join('\n'),
  };
}

function generateChunksForMedication(med: MedicationRecord): MedicationChunk[] {
  const chunks: MedicationChunk[] = [];

  // Always add overview
  chunks.push(generateOverviewChunk(med));

  // Add optional chunks
  const indications = generateIndicationsChunk(med);
  if (indications) chunks.push(indications);

  const contraindications = generateContraindicationsChunk(med);
  if (contraindications) chunks.push(contraindications);

  const adultDosing = generateAdultDosingChunk(med);
  if (adultDosing) chunks.push(adultDosing);

  const pediatricDosing = generatePediatricDosingChunk(med);
  if (pediatricDosing) chunks.push(pediatricDosing);

  return chunks;
}

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Protocol Guide - Medication Chunk Generation');
  console.log('='.repeat(60));

  // Check configuration
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables:');
    console.error('  - SUPABASE_URL or VITE_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Fetch all medications from database
  console.log('\nFetching medications from database...');
  const { data: medications, error: fetchError } = await supabase
    .from('medications')
    .select('*');

  if (fetchError) {
    console.error('Error fetching medications:', fetchError);
    process.exit(1);
  }

  if (!medications || medications.length === 0) {
    console.log('No medications found in database.');
    process.exit(0);
  }

  console.log(`Found ${medications.length} medications`);

  // Clear existing medication chunks
  console.log('\nClearing existing medication chunks...');
  const { error: deleteError } = await supabase
    .from('medication_chunks')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.warn('Warning: Could not clear existing chunks:', deleteError.message);
  }

  // Generate chunks for all medications
  console.log('\nGenerating chunks...');
  const allChunks: MedicationChunk[] = [];

  for (const med of medications) {
    const chunks = generateChunksForMedication(med as MedicationRecord);
    allChunks.push(...chunks);
    console.log(`  ${med.name}: ${chunks.length} chunks`);
  }

  console.log(`\nTotal chunks generated: ${allChunks.length}`);

  // Insert chunks in batches
  console.log('\nInserting chunks into database...');
  const BATCH_SIZE = 50;
  let insertedCount = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);

    const { error: insertError } = await supabase
      .from('medication_chunks')
      .insert(batch);

    if (insertError) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, insertError);
    } else {
      insertedCount += batch.length;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Medication Chunk Generation Complete');
  console.log('='.repeat(60));
  console.log(`  Medications processed: ${medications.length}`);
  console.log(`  Chunks generated: ${allChunks.length}`);
  console.log(`  Chunks inserted: ${insertedCount}`);
  console.log('\nNote: Run generate-embeddings.ts to generate embeddings for medication chunks');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
