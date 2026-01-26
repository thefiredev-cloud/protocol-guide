/**
 * Check actual table schemas
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Check protocol_chunks columns
  console.log('=== protocol_chunks table ===');
  const { data: pc, error: pcErr } = await supabase
    .from('protocol_chunks')
    .select('*')
    .limit(1);
  
  if (pcErr) {
    console.log('Error:', pcErr.message);
  } else if (pc && pc.length > 0) {
    console.log('Columns:', Object.keys(pc[0]).join(', '));
  } else {
    console.log('No data');
  }

  // Check manus_protocol_chunks columns
  console.log('\n=== manus_protocol_chunks table ===');
  const { data: mpc, error: mpcErr } = await supabase
    .from('manus_protocol_chunks')
    .select('*')
    .limit(1);
  
  if (mpcErr) {
    console.log('Error:', mpcErr.message);
  } else if (mpc && mpc.length > 0) {
    console.log('Columns:', Object.keys(mpc[0]).join(', '));
  } else {
    console.log('No data');
  }
  
  // Check for null state_name in manus_protocol_chunks
  console.log('\n=== Null state_name in manus_protocol_chunks ===');
  const { data: nullState, error: nsErr } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code')
    .is('state_name', null)
    .limit(1000);
  
  if (nsErr) {
    console.log('Error:', nsErr.message);
  } else if (nullState) {
    const byCode: Record<string, number> = {};
    for (const r of nullState) {
      byCode[r.state_code] = (byCode[r.state_code] || 0) + 1;
    }
    console.log('By state_code:', byCode);
    console.log('Total checked:', nullState.length);
  }
  
  // Check for null agency_id in manus_protocol_chunks
  console.log('\n=== Null agency_id in manus_protocol_chunks ===');
  const { count, error: countErr } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .is('agency_id', null);
  
  if (countErr) {
    console.log('Error:', countErr.message);
  } else {
    console.log('Count:', count);
  }
}

main().catch(console.error);
