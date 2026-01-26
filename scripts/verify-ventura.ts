import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function verify() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Count chunks
  const { count, error } = await supabase
    .from('manus_protocol_chunks')
    .select('id', { count: 'exact', head: true })
    .eq('agency_name', 'Ventura County EMS Agency')
    .eq('state_code', 'CA');
  
  if (error) {
    console.log('Error:', error.message);
    process.exit(1);
  }
  
  console.log('Ventura County EMS Agency chunks:', count);
  
  // Get unique protocols
  const { data: protocols } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_number')
    .eq('agency_name', 'Ventura County EMS Agency')
    .eq('state_code', 'CA');
  
  const uniqueProtocols = new Set(protocols?.map(p => p.protocol_number));
  console.log('Unique protocols:', uniqueProtocols.size);
  
  // Sample some protocol titles
  const { data: samples } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_number, protocol_title, section')
    .eq('agency_name', 'Ventura County EMS Agency')
    .eq('state_code', 'CA')
    .limit(5);
  
  console.log('\nSample entries:');
  samples?.forEach(s => {
    console.log(`  ${s.protocol_number}: ${s.protocol_title} [${s.section}]`);
  });
  
  process.exit(0);
}

verify();
