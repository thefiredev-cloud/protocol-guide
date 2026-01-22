/**
 * Generate Agency Mapping File
 *
 * Exports all agencies from manus_agencies table to agency-mapping.json
 * This file is used by the backfill-agency-metadata.ts script.
 *
 * Usage: npx tsx scripts/generate-agency-mapping.ts
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
interface Agency {
  id: number;
  name: string;
  state_code: string;
  state_name: string;
}

interface AgencyMapping {
  agency_id: number;
  agency_name: string;
  state_code: string;
  state_name: string;
}

/**
 * Fetch all agencies from database
 */
async function fetchAllAgencies(): Promise<Agency[]> {
  console.log('Fetching agencies from manus_agencies table...');

  const { data, error } = await supabase
    .from('manus_agencies')
    .select('id, name, state_code, state_name')
    .order('state_code')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch agencies: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No agencies found in database');
  }

  console.log(`Found ${data.length} agencies\n`);
  return data as Agency[];
}

/**
 * Convert agency data to mapping format
 */
function convertToMapping(agencies: Agency[]): AgencyMapping[] {
  return agencies.map(agency => ({
    agency_id: agency.id,
    agency_name: agency.name,
    state_code: agency.state_code,
    state_name: agency.state_name
  }));
}

/**
 * Display summary by state
 */
function displaySummary(mapping: AgencyMapping[]): void {
  const byState = mapping.reduce((acc, agency) => {
    if (!acc[agency.state_code]) {
      acc[agency.state_code] = {
        name: agency.state_name,
        count: 0
      };
    }
    acc[agency.state_code].count++;
    return acc;
  }, {} as Record<string, { name: string; count: number }>);

  console.log('Agencies by State:');
  console.log('─'.repeat(50));

  Object.entries(byState)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([code, { name, count }]) => {
      console.log(`${code.padEnd(4)} ${name.padEnd(30)} ${count.toString().padStart(4)} agencies`);
    });

  console.log('─'.repeat(50));
  console.log(`Total: ${mapping.length} agencies across ${Object.keys(byState).length} states\n`);
}

/**
 * Main function
 */
async function generateAgencyMapping() {
  console.log('=== Generate Agency Mapping ===\n');

  try {
    // Fetch agencies
    const agencies = await fetchAllAgencies();

    // Convert to mapping format
    const mapping = convertToMapping(agencies);

    // Display summary
    displaySummary(mapping);

    // Write to file
    console.log(`Writing to: ${OUTPUT_PATH}`);
    writeFileSync(OUTPUT_PATH, JSON.stringify(mapping, null, 2), 'utf-8');

    console.log('✓ Agency mapping file generated successfully\n');
    console.log('Next step: Run the backfill script');
    console.log('  npx tsx scripts/backfill-agency-metadata.ts\n');

    process.exit(0);

  } catch (error) {
    console.error('\nError:', error);
    process.exit(1);
  }
}

// Run the generator
generateAgencyMapping().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
