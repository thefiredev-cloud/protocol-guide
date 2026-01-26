import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Check LA County chunks with agency_id
  const { count: laCount } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .not('agency_id', 'is', null);
  
  console.log('LA chunks with agency_id NOT NULL:', laCount);

  // Check state_code
  const { data: sample } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_id, agency_name, state_code, state_name')
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .limit(3);
  
  console.log('LA sample:', sample);

  // Try the exact query the app uses
  const { data: caData } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_id, agency_name, state_code, state_name')
    .or('state_code.eq.CA,state_name.eq.California')
    .not('agency_id', 'is', null)
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .limit(5);
  
  console.log('LA chunks matching CA filter:', caData?.length);
  console.log('Sample:', caData);
}

check();
