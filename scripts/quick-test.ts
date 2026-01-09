/**
 * Quick Test - PMC Criteria Query Validation
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const testQueries = [
  'PMC Criteria',
  'pediatric trauma center criteria',
  'ECMO eligibility',
  'stroke center criteria',
  'trauma triage criteria'
];

async function main() {
  console.log('='.repeat(60));
  console.log('Criteria Query Validation Test');
  console.log('='.repeat(60));
  console.log();

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);

    // Simple text search on protocol chunks
    const { data, error } = await supabase
      .from('protocol_chunks')
      .select('protocol_id, section_title, content')
      .or(`section_title.ilike.%${query.split(' ')[0]}%,content.ilike.%${query}%`)
      .limit(3);

    if (error) {
      console.log(`  ERROR: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`  ✓ Found ${data.length} results:`);
      data.forEach((r, i) => {
        console.log(`    ${i+1}. ${r.protocol_id} - ${r.section_title}`);
      });
    } else {
      console.log(`  ✗ No results found`);
    }
    console.log();
  }
}

main();
