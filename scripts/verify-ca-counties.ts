/**
 * Quick verification of newly imported CA county protocols
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verify() {
  console.log('='.repeat(70));
  console.log('VERIFICATION: Smaller CA County Protocol Chunks');
  console.log('='.repeat(70));

  const agencies = [
    'San Diego County EMS',
    'Alameda County EMS Agency',
    'Santa Cruz County EMS',
    'Santa Barbara County EMS Agency'
  ];

  let total = 0;

  for (const agency of agencies) {
    const { count, error } = await supabase
      .from('manus_protocol_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('agency_name', agency)
      .eq('state_code', 'CA');

    if (error) {
      console.log(`${agency}: ERROR - ${error.message}`);
    } else {
      console.log(`${agency}: ${count} chunks`);
      total += count || 0;
    }
  }

  console.log('-'.repeat(70));
  console.log(`TOTAL: ${total} chunks across 4 CA counties`);
  console.log('='.repeat(70));

  // Overall CA count
  const { count: caCount } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', 'CA');

  console.log(`\nTotal CA chunks in database: ${caCount}`);
}

verify().catch(console.error);
