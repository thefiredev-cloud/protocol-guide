import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { count } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .ilike('agency_name', '%san benito%');
  
  console.log('San Benito chunks:', count);
}

main();
