/**
 * Fix null state_name and agency_id in protocol_chunks
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('=== Fixing null values in protocol_chunks ===\n');
  
  // 1. Fix state_name for CA in batches
  console.log('1. Fixing CA state_name in batches...');
  let totalFixed = 0;
  
  while (true) {
    // Get a batch of chunks with null state_name
    const { data: nullChunks, error: fetchError } = await supabase
      .from('protocol_chunks')
      .select('id')
      .eq('state_code', 'CA')
      .is('state_name', null)
      .limit(200);

    if (fetchError) {
      console.error('Error fetching:', fetchError.message);
      break;
    }

    if (!nullChunks || nullChunks.length === 0) {
      break;
    }

    const ids = nullChunks.map(c => c.id);
    
    const { error: updateError } = await supabase
      .from('protocol_chunks')
      .update({ state_name: 'California' })
      .in('id', ids);

    if (updateError) {
      console.error('Error updating:', updateError.message);
      break;
    }

    totalFixed += ids.length;
    console.log(`  Fixed ${totalFixed} chunks...`);
  }
  
  console.log(`✅ Total state_name fixed: ${totalFixed}\n`);

  // 2. Fix agency_id based on agency_name
  console.log('2. Fixing null agency_ids...');
  
  // Get all agencies from agencies table
  const { data: allAgencies, error: agencyError } = await supabase
    .from('agencies')
    .select('id, name');

  if (agencyError) {
    console.error('Error fetching agencies:', agencyError.message);
    return;
  }

  console.log(`Found ${allAgencies?.length || 0} agencies in agencies table`);
  
  for (const agency of allAgencies || []) {
    // Update chunks that match this agency name
    const { data: updated, error: updateError } = await supabase
      .from('protocol_chunks')
      .update({ agency_id: agency.id })
      .eq('agency_name', agency.name)
      .is('agency_id', null)
      .select('id');

    if (updateError) {
      console.error(`  Error updating ${agency.name}:`, updateError.message);
      continue;
    }

    if (updated && updated.length > 0) {
      console.log(`  ${agency.name}: linked ${updated.length} chunks`);
    }
  }

  // 3. Check what's still null
  console.log('\n3. Checking remaining nulls...');
  
  const { data: remainingNull, error: checkError } = await supabase
    .from('protocol_chunks')
    .select('agency_name')
    .is('agency_id', null);

  if (checkError) {
    console.error('Error checking:', checkError.message);
    return;
  }

  if (remainingNull && remainingNull.length > 0) {
    // Group by agency_name
    const grouped: Record<string, number> = {};
    for (const r of remainingNull) {
      const name = r.agency_name || '(null)';
      grouped[name] = (grouped[name] || 0) + 1;
    }
    
    console.log('⚠️ Still have null agency_id:');
    for (const [name, count] of Object.entries(grouped)) {
      console.log(`  - ${name}: ${count} chunks`);
    }
  } else {
    console.log('✅ All chunks have agency_id set');
  }

  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
