/**
 * Paginated state_name check
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Total CA chunks
  const { count: total } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', 'CA');
  
  console.log('Total CA chunks:', total);

  // CA with state_name = 'California'
  const { count: cali } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', 'CA')
    .eq('state_name', 'California');
  
  console.log('CA with state_name = "California":', cali);

  // CA with null state_name
  const { count: nullName } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', 'CA')
    .is('state_name', null);
  
  console.log('CA with null state_name:', nullName);

  // CA with other state_name values
  const diff = (total || 0) - (cali || 0) - (nullName || 0);
  console.log('CA with other state_name values:', diff);

  // Sample a chunk with state_name != 'California' and not null
  if (diff > 0) {
    const { data: other } = await supabase
      .from('manus_protocol_chunks')
      .select('id, agency_name, state_name')
      .eq('state_code', 'CA')
      .not('state_name', 'eq', 'California')
      .not('state_name', 'is', null)
      .limit(5);
    
    console.log('Sample with other state_name:', other);
  }
}

main().catch(console.error);
