import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
  console.log('Updating LA County chunks with agency_id = 2701...');
  
  // Update LA County chunks to have agency_id = 2701
  const { error, count } = await supabase
    .from('manus_protocol_chunks')
    .update({ agency_id: 2701 })
    .eq('agency_name', 'Los Angeles County EMS Agency');
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  console.log('Update complete');

  // Verify
  const { data, count: laCount } = await supabase
    .from('manus_protocol_chunks')
    .select('id, agency_id', { count: 'exact' })
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .limit(5);
  
  console.log('LA County chunks total:', laCount);
  console.log('Sample agency_ids:', data?.map(d => d.agency_id));
}

fix();
