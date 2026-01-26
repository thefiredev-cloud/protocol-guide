import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function verify() {
  const { count, error } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('agency_name', 'Marin County EMS Agency')
    .eq('state_code', 'CA');
  
  if (error) throw error;
  console.log('Marin County EMS chunks in database:', count);
  
  // Get sample data
  const { data } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_number, protocol_title, section')
    .eq('agency_name', 'Marin County EMS Agency')
    .limit(5);
  
  console.log('\nSample protocols:');
  data?.forEach(d => console.log('  -', d.protocol_number, d.protocol_title, '(' + d.section + ')'));
  
  // Check embeddings
  const { data: withEmbed } = await supabase
    .from('manus_protocol_chunks')
    .select('id, embedding')
    .eq('agency_name', 'Marin County EMS Agency')
    .not('embedding', 'is', null)
    .limit(1);
  
  console.log('\nEmbeddings present:', withEmbed && withEmbed.length > 0 ? 'Yes' : 'No');
  if (withEmbed && withEmbed[0]?.embedding) {
    console.log('Embedding dimension:', Array.isArray(withEmbed[0].embedding) ? withEmbed[0].embedding.length : 'N/A');
  }
}

verify().catch(console.error);
