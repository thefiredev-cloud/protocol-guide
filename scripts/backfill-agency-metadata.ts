/**
 * Backfill Agency Metadata in manus_protocol_chunks
 *
 * This script reads agency mapping data and updates all matching rows in
 * manus_protocol_chunks with agency_name, state_code, and state_name.
 *
 * Usage: npx tsx scripts/backfill-agency-metadata.ts
 *
 * Requirements:
 * - agency-mapping.json file in docs/ directory
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Configuration
const BATCH_SIZE = 1000;
const AGENCY_MAPPING_PATH = resolve(process.cwd(), 'docs', 'agency-mapping.json');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface AgencyMapping {
  agency_id: number;
  agency_name: string;
  state_code: string;
  state_name: string;
}

interface UpdateStats {
  totalAgencies: number;
  processedAgencies: number;
  totalRowsUpdated: number;
  errors: number;
  startTime: number;
}

/**
 * Load agency mapping from JSON file
 */
function loadAgencyMapping(): AgencyMapping[] {
  try {
    console.log(`Loading agency mapping from: ${AGENCY_MAPPING_PATH}`);
    const fileContent = readFileSync(AGENCY_MAPPING_PATH, 'utf-8');
    const mapping = JSON.parse(fileContent);

    // Validate structure
    if (!Array.isArray(mapping)) {
      throw new Error('Agency mapping must be an array');
    }

    // Validate each entry
    mapping.forEach((entry, index) => {
      if (!entry.agency_id || !entry.agency_name || !entry.state_code || !entry.state_name) {
        throw new Error(`Invalid mapping at index ${index}: missing required fields`);
      }
      if (entry.state_code.length !== 2) {
        throw new Error(`Invalid state_code at index ${index}: must be 2 characters`);
      }
    });

    console.log(`Loaded ${mapping.length} agency mappings\n`);
    return mapping;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Error: Agency mapping file not found at ${AGENCY_MAPPING_PATH}`);
      console.error('\nExpected file format (JSON):');
      console.error(JSON.stringify([
        {
          agency_id: 1,
          agency_name: "California EMS Authority",
          state_code: "CA",
          state_name: "California"
        }
      ], null, 2));
    } else {
      console.error('Error loading agency mapping:', error);
    }
    process.exit(1);
  }
}

/**
 * Get count of rows for a specific agency_id
 */
async function getAgencyRowCount(agencyId: number): Promise<number> {
  const { count, error } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId);

  if (error) {
    throw new Error(`Failed to count rows for agency ${agencyId}: ${error.message}`);
  }

  return count || 0;
}

/**
 * Update chunks for a specific agency in batches
 */
async function updateAgencyChunks(
  agencyId: number,
  agencyName: string,
  stateCode: string,
  stateName: string,
  stats: UpdateStats
): Promise<number> {
  let totalUpdated = 0;
  let offset = 0;

  // Get total count for this agency
  const totalRows = await getAgencyRowCount(agencyId);

  if (totalRows === 0) {
    console.log(`  No rows found for agency_id ${agencyId} - skipping`);
    return 0;
  }

  console.log(`  Processing ${totalRows.toLocaleString()} rows for agency_id ${agencyId}`);

  // Process in batches
  while (offset < totalRows) {
    try {
      // Fetch batch of IDs to update
      const { data: chunks, error: fetchError } = await supabase
        .from('manus_protocol_chunks')
        .select('id')
        .eq('agency_id', agencyId)
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchError) {
        throw new Error(`Fetch error: ${fetchError.message}`);
      }

      if (!chunks || chunks.length === 0) {
        break;
      }

      // Update batch
      const chunkIds = chunks.map(c => c.id);
      const { error: updateError } = await supabase
        .from('manus_protocol_chunks')
        .update({
          agency_name: agencyName,
          state_code: stateCode,
          state_name: stateName
        })
        .in('id', chunkIds);

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }

      totalUpdated += chunks.length;
      offset += BATCH_SIZE;

      // Progress indicator
      const progress = Math.min(100, Math.round((offset / totalRows) * 100));
      process.stdout.write(`\r  Progress: ${progress}% (${totalUpdated.toLocaleString()}/${totalRows.toLocaleString()} rows)`);

    } catch (error) {
      console.error(`\n  Error updating batch at offset ${offset}:`, error);
      stats.errors++;
      offset += BATCH_SIZE; // Skip to next batch
    }
  }

  console.log(''); // New line after progress
  return totalUpdated;
}

/**
 * Main backfill function
 */
async function backfillAgencyMetadata() {
  console.log('=== Agency Metadata Backfill ===\n');

  const stats: UpdateStats = {
    totalAgencies: 0,
    processedAgencies: 0,
    totalRowsUpdated: 0,
    errors: 0,
    startTime: Date.now()
  };

  try {
    // Load agency mapping
    const agencyMapping = loadAgencyMapping();
    stats.totalAgencies = agencyMapping.length;

    console.log('Starting backfill process...\n');

    // Process each agency
    for (const agency of agencyMapping) {
      console.log(`\n[${stats.processedAgencies + 1}/${stats.totalAgencies}] ${agency.agency_name} (${agency.state_code})`);

      try {
        const rowsUpdated = await updateAgencyChunks(
          agency.agency_id,
          agency.agency_name,
          agency.state_code,
          agency.state_name,
          stats
        );

        stats.totalRowsUpdated += rowsUpdated;
        stats.processedAgencies++;

        console.log(`  ✓ Updated ${rowsUpdated.toLocaleString()} rows`);

      } catch (error) {
        console.error(`  ✗ Failed to process agency:`, error);
        stats.errors++;
      }
    }

    // Final summary
    const elapsedSeconds = Math.round((Date.now() - stats.startTime) / 1000);
    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    console.log('\n=== Backfill Complete ===');
    console.log(`Total agencies: ${stats.totalAgencies}`);
    console.log(`Processed: ${stats.processedAgencies}`);
    console.log(`Total rows updated: ${stats.totalRowsUpdated.toLocaleString()}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Time elapsed: ${elapsedSeconds}s (${elapsedMinutes}min)`);
    console.log(`Average rate: ${Math.round(stats.totalRowsUpdated / elapsedSeconds)} rows/sec`);

    // Verification query
    console.log('\nVerifying results...');
    const { count: nullCount } = await supabase
      .from('manus_protocol_chunks')
      .select('*', { count: 'exact', head: true })
      .is('agency_name', null);

    if (nullCount === 0) {
      console.log('✓ All rows have agency metadata');
    } else {
      console.log(`⚠ Warning: ${nullCount} rows still have null agency_name`);
    }

    process.exit(stats.errors > 0 ? 1 : 0);

  } catch (error) {
    console.error('\nFatal error:', error);
    process.exit(1);
  }
}

// Run the backfill
backfillAgencyMetadata().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
