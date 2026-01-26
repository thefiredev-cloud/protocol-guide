import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
};

async function fixAll() {
  // 1. Fix state_name for CA chunks in batches
  console.log('1. Fixing CA state_name in batches...');
  let fixed = 0;
  while (true) {
    const { data: batch } = await supabase
      .from('manus_protocol_chunks')
      .select('id')
      .eq('state_code', 'CA')
      .is('state_name', null)
      .limit(500);
    
    if (!batch || batch.length === 0) break;
    
    const ids = batch.map(r => r.id);
    await supabase
      .from('manus_protocol_chunks')
      .update({ state_name: 'California' })
      .in('id', ids);
    
    fixed += batch.length;
    console.log(`  Fixed ${fixed} CA chunks...`);
  }
  console.log(`  ✓ Total CA state_name fixed: ${fixed}`);

  // 2. Get agency name to ID mapping from agencies table
  console.log('\n2. Getting agency ID mapping...');
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('state_code', 'CA');
  
  const agencyMap = new Map<string, number>();
  agencies?.forEach(a => agencyMap.set(a.name, a.id));
  console.log(`  Found ${agencyMap.size} CA agencies in agencies table`);

  // 3. Fix agency_id for chunks with null agency_id
  console.log('\n3. Fixing agency_id for chunks...');
  const { data: nullAgencyChunks } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_name')
    .is('agency_id', null)
    .eq('state_code', 'CA')
    .limit(5000);
  
  const uniqueAgencies = [...new Set(nullAgencyChunks?.map(r => r.agency_name))];
  console.log(`  Agencies needing fix: ${uniqueAgencies.join(', ')}`);

  for (const agencyName of uniqueAgencies) {
    let agencyId = agencyMap.get(agencyName);
    
    // If not in agencies table, create it
    if (!agencyId) {
      console.log(`  Creating agency: ${agencyName}`);
      const { data: newAgency } = await supabase
        .from('agencies')
        .insert({ name: agencyName, state: 'California', state_code: 'CA', is_active: true })
        .select('id')
        .single();
      
      if (newAgency) {
        agencyId = newAgency.id;
        agencyMap.set(agencyName, agencyId);
      }
    }

    if (agencyId) {
      // Update chunks in batches
      let agencyFixed = 0;
      while (true) {
        const { data: batch } = await supabase
          .from('manus_protocol_chunks')
          .select('id')
          .eq('agency_name', agencyName)
          .is('agency_id', null)
          .limit(500);
        
        if (!batch || batch.length === 0) break;
        
        await supabase
          .from('manus_protocol_chunks')
          .update({ agency_id: agencyId })
          .in('id', batch.map(r => r.id));
        
        agencyFixed += batch.length;
      }
      console.log(`  ✓ ${agencyName}: ${agencyFixed} chunks → agency_id=${agencyId}`);
    }
  }

  // 4. Update protocol_count in agencies table
  console.log('\n4. Updating protocol_count in agencies table...');
  for (const [name, id] of agencyMap) {
    const { count } = await supabase
      .from('manus_protocol_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', id);
    
    if (count && count > 0) {
      await supabase
        .from('agencies')
        .update({ protocol_count: count })
        .eq('id', id);
      console.log(`  ${name}: ${count} protocols`);
    }
  }

  console.log('\n✓ All fixes complete!');
}

fixAll();
