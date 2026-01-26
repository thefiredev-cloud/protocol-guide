import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('Verifying Orange County EMS Agency data...\n');
  
  // Count total chunks
  const { count, error: countError } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('agency_name', 'Orange County EMS Agency');
  
  if (countError) {
    console.error('Count error:', countError.message);
    return;
  }
  
  console.log('Total chunks:', count);
  
  // Get unique protocol numbers
  const { data: protocols, error: protocolError } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_number')
    .eq('agency_name', 'Orange County EMS Agency');
  
  if (protocolError) {
    console.error('Protocol error:', protocolError.message);
    return;
  }
  
  const uniqueProtocols = new Set(protocols?.map(p => p.protocol_number));
  console.log('Unique protocols:', uniqueProtocols.size);
  
  // Sample records
  const { data: samples } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_number, protocol_title, section')
    .eq('agency_name', 'Orange County EMS Agency')
    .limit(10);
  
  console.log('\nSample protocols:');
  samples?.forEach((s, i) => {
    console.log(`  ${i+1}. ${s.protocol_number} - ${s.protocol_title?.substring(0,50)}`);
    console.log(`     Section: ${s.section}`);
  });
  
  console.log('\n✓ Verification complete');
}

verify();
