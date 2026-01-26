import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Check what's in protocol_chunks
  const { data, count } = await supabase
    .from('protocol_chunks')
    .select('protocol_title, category, section_title, source_url', { count: 'exact' })
    .limit(20);
  
  console.log('Total protocol_chunks:', count);
  console.log('\nSample protocols:');
  data?.forEach(d => {
    console.log(`  - [${d.category || 'N/A'}] ${d.protocol_title}`);
    if (d.source_url) console.log(`    Source: ${d.source_url.substring(0, 60)}...`);
  });

  // Check for LA County references
  const { data: laData, count: laCount } = await supabase
    .from('protocol_chunks')
    .select('protocol_title, category', { count: 'exact' })
    .or('content.ilike.%los angeles%,source_url.ilike.%lacounty%,protocol_title.ilike.%la county%')
    .limit(10);

  console.log('\n\nLA County references in protocol_chunks:', laCount);
  laData?.forEach(d => console.log(`  - [${d.category}] ${d.protocol_title}`));

  // Check protocols table
  const { data: protocols, count: protocolCount } = await supabase
    .from('protocols')
    .select('title, agency_name, state', { count: 'exact' })
    .limit(10);

  console.log('\n\nprotocols table total:', protocolCount);
  protocols?.forEach(p => console.log(`  - ${p.title} (${p.agency_name}, ${p.state})`));
}

check();
