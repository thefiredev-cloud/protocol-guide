import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Check agencies table for LA
  const { data: laAgency } = await supabase
    .from('agencies')
    .select('*')
    .ilike('name', '%los angeles%');
  
  console.log('LA in agencies table:', laAgency);

  // Get distinct agency_names from manus_protocol_chunks
  const { data: chunks } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_name, agency_id')
    .limit(2000);
  
  const agencyMap = new Map<string, number>();
  chunks?.forEach(c => {
    const count = agencyMap.get(c.agency_name) || 0;
    agencyMap.set(c.agency_name, count + 1);
  });
  
  console.log('\nAgencies in manus_protocol_chunks:');
  [...agencyMap.entries()].sort((a,b) => b[1] - a[1]).forEach(([name, count]) => {
    console.log(`  ${name}: ${count} chunks`);
  });

  // Check if LA County needs to be added to agencies table
  const laChunks = chunks?.filter(c => c.agency_name?.toLowerCase().includes('los angeles'));
  console.log('\nLA County chunks found:', laChunks?.length);
  if (laChunks && laChunks.length > 0) {
    console.log('Sample LA chunk agency_id:', laChunks[0].agency_id);
  }
}

check();
