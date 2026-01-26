import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Check LA County in agencies
  const { data: la } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', 2701)
    .single();
  
  console.log('LA County agency record:');
  console.log(JSON.stringify(la, null, 2));

  // Check the query the frontend likely uses
  const { data: caAgencies } = await supabase
    .from('agencies')
    .select('id, name, protocol_count, is_active, state_code')
    .eq('state_code', 'CA')
    .eq('is_active', true)
    .gt('protocol_count', 0)
    .order('protocol_count', { ascending: false });
  
  console.log('\nCA agencies with protocol_count > 0 and is_active=true:');
  caAgencies?.forEach(a => console.log(`  ${a.name}: ${a.protocol_count}`));

  // Is LA County in this list?
  const laInList = caAgencies?.find(a => a.name.toLowerCase().includes('los angeles'));
  console.log('\nLA County in filtered list?', laInList ? 'YES' : 'NO');
}

check();
