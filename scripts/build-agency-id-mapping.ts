/**
 * Build Agency ID to Name Mapping for Protocol Guide Manus
 *
 * Creates a mapping of agency_ids to placeholder names since the actual
 * agency data isn't yet in the manus_protocol_chunks table. This mapping
 * can be manually enriched with real agency names later.
 *
 * Usage: npx tsx scripts/build-agency-id-mapping.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Configuration
const OUTPUT_PATH = resolve(process.cwd(), 'docs', 'agency-mapping.json');

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
  [agency_id: string]: {
    name: string;
    state_code: string | null;
    state_name: string | null;
    protocol_count: number;
  };
}

/**
 * Fetch all unique agency IDs from protocol chunks
 */
async function fetchUniqueAgencyIds(): Promise<number[]> {
  console.log('Fetching unique agency IDs from manus_protocol_chunks...\n');

  let allData: any[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all data using pagination
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('manus_protocol_chunks')
      .select('agency_id')
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch protocols: ${error.message}`);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allData = allData.concat(data);
      console.log(`  Fetched ${allData.length} rows...`);

      if (data.length < pageSize) {
        hasMore = false;
      }
      page++;
    }
  }

  if (allData.length === 0) {
    throw new Error('No protocol chunks found in database');
  }

  // Extract unique agency IDs and sort
  const uniqueIds = [...new Set(allData.map(row => row.agency_id))].sort((a, b) => a - b);

  console.log(`\nFound ${uniqueIds.length} unique agencies in ${allData.length} protocol chunks\n`);

  return uniqueIds;
}

/**
 * Count protocols for each agency
 */
async function getAgencyProtocolCounts(agencyIds: number[]): Promise<Map<number, number>> {
  console.log('Counting protocols per agency...\n');

  const counts = new Map<number, number>();

  let allData: any[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all data using pagination
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('manus_protocol_chunks')
      .select('agency_id')
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch protocols: ${error.message}`);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allData = allData.concat(data);

      if (data.length < pageSize) {
        hasMore = false;
      }
      page++;
    }
  }

  // Count protocols per agency
  allData.forEach(row => {
    counts.set(row.agency_id, (counts.get(row.agency_id) || 0) + 1);
  });

  return counts;
}

/**
 * Build agency mapping with placeholder data
 */
async function buildAgencyMapping(): Promise<AgencyMapping> {
  const mapping: AgencyMapping = {};

  // Fetch unique agency IDs
  const agencyIds = await fetchUniqueAgencyIds();

  // Get protocol counts
  const protocolCounts = await getAgencyProtocolCounts(agencyIds);

  // Create placeholder entries
  console.log('Building agency mapping...\n');

  for (const agencyId of agencyIds) {
    const count = protocolCounts.get(agencyId) || 0;

    mapping[agencyId] = {
      name: `Agency ${agencyId}`,
      state_code: null,
      state_name: null,
      protocol_count: count
    };

    console.log(`  [${agencyId}] ${count} protocols`);
  }

  return mapping;
}

/**
 * Display summary statistics
 */
function displaySummary(mapping: AgencyMapping): void {
  const agencies = Object.values(mapping);
  const totalProtocols = agencies.reduce((sum, a) => sum + a.protocol_count, 0);
  const avgProtocols = (totalProtocols / agencies.length).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Agencies: ${agencies.length}`);
  console.log(`Total Protocols: ${totalProtocols}`);
  console.log(`Average Protocols per Agency: ${avgProtocols}`);
  console.log(`Min Protocols: ${Math.min(...agencies.map(a => a.protocol_count))}`);
  console.log(`Max Protocols: ${Math.max(...agencies.map(a => a.protocol_count))}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main function
 */
async function main() {
  console.log('=== Build Agency ID Mapping ===\n');

  try {
    // Build the mapping
    const mapping = await buildAgencyMapping();

    // Display summary
    displaySummary(mapping);

    // Write to file
    console.log(`Writing mapping to: ${OUTPUT_PATH}`);
    writeFileSync(OUTPUT_PATH, JSON.stringify(mapping, null, 2), 'utf-8');

    console.log('✓ Agency mapping file created successfully\n');

    console.log('NOTE: This file contains placeholder agency names.');
    console.log('To add real agency information:');
    console.log('  1. Manually edit docs/agency-mapping.json');
    console.log('  2. Update name, state_code, and state_name for each agency');
    console.log('  3. Or create/populate the manus_agencies table and run:');
    console.log('     npx tsx scripts/generate-agency-mapping.ts\n');

    process.exit(0);

  } catch (error) {
    console.error('\nError:', error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
