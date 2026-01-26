/**
 * Check database indexes via Supabase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('=== CHECKING INDEXES ===\n');

  // Use explain to check query plans
  console.log('Testing vector search query plan...');
  
  // Try some test queries to see if indexes are being used
  const tests = [
    { name: 'Agency filter', filter: { agency_id: 1 } },
    { name: 'State filter', filter: { state_code: 'CA' } },
    { name: 'Protocol number', filter: { protocol_number: '502' } },
  ];

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const start = Date.now();
    const { count, error } = await supabase
      .from('manus_protocol_chunks')
      .select('id', { count: 'exact', head: true })
      .match(test.filter);
    const elapsed = Date.now() - start;
    
    if (error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Count: ${count}, Time: ${elapsed}ms`);
    }
  }

  // Check full text search capability
  console.log('\n--- Full-text search test ---');
  const { data: ftsData, error: ftsErr } = await supabase
    .from('manus_protocol_chunks')
    .select('id, protocol_title')
    .textSearch('content', 'cardiac arrest')
    .limit(5);

  if (ftsErr) {
    console.log(`FTS Error: ${ftsErr.message}`);
    console.log('(Full-text search may not be configured)');
  } else {
    console.log(`FTS results: ${ftsData?.length || 0}`);
  }

  // Test ilike search performance
  console.log('\n--- ILIKE search test ---');
  const ilikeStart = Date.now();
  const { data: ilikeData } = await supabase
    .from('manus_protocol_chunks')
    .select('id')
    .ilike('content', '%cardiac arrest%')
    .limit(10);
  const ilikeTime = Date.now() - ilikeStart;
  console.log(`ILIKE results: ${ilikeData?.length || 0}, Time: ${ilikeTime}ms`);

  // Check unique constraints
  console.log('\n=== UNIQUE CONSTRAINT CHECK ===');
  const { data: dupCheck } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_id, protocol_number, section')
    .eq('agency_id', 1)
    .limit(100);
  
  if (dupCheck) {
    const seen = new Set<string>();
    let dupes = 0;
    for (const row of dupCheck) {
      const key = `${row.agency_id}-${row.protocol_number}-${row.section}`;
      if (seen.has(key)) dupes++;
      seen.add(key);
    }
    console.log(`Checked ${dupCheck.length} rows, found ${dupes} duplicates in sample`);
  }

  // Check sample RLS state
  console.log('\n=== RLS STATE ===');
  // Try to access as anon (no auth)
  const anonSupabase = createClient(SUPABASE_URL, process.env.SUPABASE_ANON_KEY || SUPABASE_KEY);
  
  const { data: anonData, error: anonErr } = await anonSupabase
    .from('manus_protocol_chunks')
    .select('id')
    .limit(1);
  
  if (anonErr) {
    console.log(`Anon access: BLOCKED (${anonErr.message})`);
  } else {
    console.log(`Anon access: ALLOWED (protocols are public)`);
  }
}

main().catch(console.error);
