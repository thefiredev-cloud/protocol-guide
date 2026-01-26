/**
 * Detailed state_name check
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Count CA with non-null state_name
  const { count: withName } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', 'CA')
    .not('state_name', 'is', null);
  
  console.log('CA with state_name:', withName);

  // Count CA with null state_name
  const { count: withoutName } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', 'CA')
    .is('state_name', null);
  
  console.log('CA with null state_name:', withoutName);

  // Sample some CA without state_name
  const { data: sample } = await supabase
    .from('manus_protocol_chunks')
    .select('id, agency_name, state_code, state_name')
    .eq('state_code', 'CA')
    .is('state_name', null)
    .limit(5);
  
  console.log('\nSample CA without state_name:', sample);
  
  // Get count by state_name for CA
  const { data: all } = await supabase
    .from('manus_protocol_chunks')
    .select('state_name')
    .eq('state_code', 'CA')
    .limit(15000);
  
  if (all) {
    const counts: Record<string, number> = {};
    for (const r of all) {
      const key = r.state_name ?? '(null)';
      counts[key] = (counts[key] || 0) + 1;
    }
    console.log('\nAll CA state_name values:', counts);
  }
}

main().catch(console.error);
