/**
 * Check chunk counts by state
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Get total count of manus_protocol_chunks
  const { count: total, error: totalErr } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true });
  
  console.log('Total manus_protocol_chunks:', total);

  // Get CA chunks
  const { count: caCount, error: caErr } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', 'CA');
  
  console.log('CA chunks:', caCount);

  // Get unique agencies with CA chunks
  const { data: caAgencies, error: agErr } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_name, agency_id')
    .eq('state_code', 'CA');
  
  if (caAgencies) {
    const uniqueAgencies = new Map<string, { id: string | null; count: number }>();
    for (const r of caAgencies) {
      const name = r.agency_name || '(null)';
      if (!uniqueAgencies.has(name)) {
        uniqueAgencies.set(name, { id: r.agency_id, count: 1 });
      } else {
        uniqueAgencies.get(name)!.count++;
      }
    }
    
    console.log('\nCA agencies:');
    for (const [name, info] of uniqueAgencies) {
      const idStatus = info.id ? `✅` : `❌ null`;
      console.log(`  ${idStatus} ${name}: ${info.count} chunks`);
    }
  }

  // Check if all CA chunks have state_name = 'California'
  const { data: caStateNames, error: snErr } = await supabase
    .from('manus_protocol_chunks')
    .select('state_name')
    .eq('state_code', 'CA');
  
  if (caStateNames) {
    const stateNameCounts: Record<string, number> = {};
    for (const r of caStateNames) {
      const sn = r.state_name || '(null)';
      stateNameCounts[sn] = (stateNameCounts[sn] || 0) + 1;
    }
    console.log('\nCA state_name values:', stateNameCounts);
  }
}

main().catch(console.error);
