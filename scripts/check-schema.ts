import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Get actual columns from protocol_chunks
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'protocol_chunks' });
  
  if (error) {
    // Fallback: just select one row and check keys
    const { data: sample } = await supabase.from('protocol_chunks').select('*').limit(1);
    console.log('protocol_chunks columns (from sample):', Object.keys(sample?.[0] || {}));
  } else {
    console.log('protocol_chunks columns:', data);
  }

  // Also check manus_protocol_chunks  
  const { data: manusSample } = await supabase.from('manus_protocol_chunks').select('*').limit(1);
  console.log('\nmanus_protocol_chunks columns:', Object.keys(manusSample?.[0] || {}));
}

check();
