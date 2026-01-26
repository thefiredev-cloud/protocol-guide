import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Check manus_protocol_chunks (the one with embeddings we've been importing)
  const { count: manusCount } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .ilike('agency_name', '%los angeles%');

  console.log('manus_protocol_chunks (embeddings) - LA County:', manusCount);

  // Check protocol_chunks (app's original table)
  const { data: appData, error: appError, count: appCount } = await supabase
    .from('protocol_chunks')
    .select('protocol_title, county_id', { count: 'exact' })
    .limit(5);

  if (appError) {
    console.log('protocol_chunks error:', appError.message);
  } else {
    console.log('protocol_chunks (app table) total:', appCount);
  }

  // Check counties table for LA County
  const { data: laCounty } = await supabase
    .from('counties')
    .select('id, name, state')
    .ilike('name', '%los angeles%');
  
  console.log('\nCounties matching "los angeles":', laCounty);

  // If LA County exists, check how many protocol_chunks it has
  if (laCounty && laCounty.length > 0) {
    const { count: laAppCount } = await supabase
      .from('protocol_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('county_id', laCounty[0].id);
    
    console.log('protocol_chunks for LA County (id ' + laCounty[0].id + '):', laAppCount);
  }
}

check();
