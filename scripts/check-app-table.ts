import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Check if LA County exists in counties table
  const { data: laCounty } = await supabase
    .from('counties')
    .select('id, name, state')
    .ilike('name', '%los angeles%');
  
  console.log('LA County in counties table:', laCounty);

  if (laCounty && laCounty.length > 0) {
    // Check protocol_chunks for this county
    const { data, error, count } = await supabase
      .from('protocol_chunks')
      .select('protocol_title', { count: 'exact' })
      .eq('county_id', laCounty[0].id)
      .limit(10);
    
    if (error) {
      console.log('Error querying protocol_chunks:', error.message);
    } else {
      console.log(`\nprotocol_chunks for LA County (county_id=${laCounty[0].id}):`, count);
      if (data && data.length > 0) {
        console.log('Sample protocols:');
        data.forEach(d => console.log('  -', d.protocol_title));
      }
    }
  }

  // Also check total protocol_chunks
  const { count: totalCount } = await supabase
    .from('protocol_chunks')
    .select('*', { count: 'exact', head: true });
  
  console.log('\nTotal protocol_chunks in app table:', totalCount);

  // Check what counties have protocols
  const { data: countiesWithProtocols } = await supabase
    .from('protocol_chunks')
    .select('county_id')
    .limit(1000);
  
  const uniqueCounties = [...new Set(countiesWithProtocols?.map(p => p.county_id))];
  console.log('Unique county_ids with protocols:', uniqueCounties.length);
  
  // Get county names for those IDs
  if (uniqueCounties.length > 0) {
    const { data: countyNames } = await supabase
      .from('counties')
      .select('id, name, state')
      .in('id', uniqueCounties);
    
    console.log('Counties with protocols:');
    countyNames?.forEach(c => console.log(`  - ${c.name}, ${c.state} (id: ${c.id})`));
  }
}

check();
