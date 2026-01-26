import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  // Simulate the app's query
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_id, agency_name, state_code')
    .or('state_code.eq.CA,state_name.eq.California')
    .not('agency_id', 'is', null)
    .limit(2000);

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  // Aggregate like the app does
  const agencyMap = new Map<number, { name: string; count: number }>();
  data?.forEach(row => {
    if (row.agency_id) {
      const existing = agencyMap.get(row.agency_id);
      if (existing) {
        existing.count++;
      } else {
        agencyMap.set(row.agency_id, { name: row.agency_name, count: 1 });
      }
    }
  });

  // Sort and display
  const sorted = [...agencyMap.entries()]
    .map(([id, { name, count }]) => ({ id, name, count }))
    .sort((a, b) => b.count - a.count);

  console.log('CA Agencies that will show in dropdown:');
  sorted.forEach(a => console.log(`  ${a.name}: ${a.count}`));
}

test();
