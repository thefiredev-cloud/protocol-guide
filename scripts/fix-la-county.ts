import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
  // 1. Count LA County chunks with exact agency name
  const { count: exactCount } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('agency_name', 'Los Angeles County EMS Agency');
  
  console.log('Chunks with "Los Angeles County EMS Agency":', exactCount);

  // 2. Check for other LA-related names
  const { data: laChunks } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_name, id')
    .or('agency_name.ilike.%los angeles%,agency_name.ilike.%la county%,agency_name.ilike.%lacounty%')
    .limit(10);
  
  const uniqueNames = [...new Set(laChunks?.map(c => c.agency_name))];
  console.log('LA-related agency names found:', uniqueNames);

  // 3. Update agencies table protocol_count
  const { error: updateError } = await supabase
    .from('agencies')
    .update({ protocol_count: exactCount || 0 })
    .eq('id', 2701);  // LA County agency ID
  
  if (updateError) {
    console.log('Error updating agencies:', updateError.message);
  } else {
    console.log('Updated agencies.protocol_count to:', exactCount);
  }

  // 4. Verify
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name, protocol_count')
    .eq('id', 2701)
    .single();
  
  console.log('Updated agency:', agency);
}

fix();
