import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// State code to full name mapping
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
  console.log('Checking all chunks with missing state_name...\n');

  // Find all unique state_codes with null state_name
  const { data: nullStates } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code, agency_name')
    .is('state_name', null)
    .limit(5000);

  if (!nullStates || nullStates.length === 0) {
    console.log('No chunks with null state_name found!');
    return;
  }

  // Group by state_code
  const stateCodeCounts = new Map<string, number>();
  nullStates.forEach(row => {
    const code = row.state_code?.trim();
    if (code) {
      stateCodeCounts.set(code, (stateCodeCounts.get(code) || 0) + 1);
    }
  });

  console.log('State codes with null state_name:');
  stateCodeCounts.forEach((count, code) => {
    console.log(`  ${code}: ${count} chunks → will set to "${STATE_NAMES[code] || 'Unknown'}"`);
  });

  // Fix each state
  console.log('\nFixing...');
  for (const [code, count] of stateCodeCounts) {
    const stateName = STATE_NAMES[code];
    if (!stateName) {
      console.log(`  Skipping unknown state code: ${code}`);
      continue;
    }

    const { error } = await supabase
      .from('manus_protocol_chunks')
      .update({ state_name: stateName })
      .eq('state_code', code)
      .is('state_name', null);

    if (error) {
      console.log(`  Error updating ${code}: ${error.message}`);
    } else {
      console.log(`  ✓ ${code} → ${stateName} (${count} chunks)`);
    }
  }

  // Also check for chunks with null agency_id and try to set them
  console.log('\nChecking for chunks with null agency_id...');
  const { data: nullAgency, count: nullCount } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_name', { count: 'exact' })
    .is('agency_id', null)
    .limit(100);

  if (nullCount && nullCount > 0) {
    const agencyNames = [...new Set(nullAgency?.map(r => r.agency_name))];
    console.log(`Found ${nullCount} chunks with null agency_id:`);
    agencyNames.slice(0, 10).forEach(name => console.log(`  - ${name}`));
    if (agencyNames.length > 10) console.log(`  ... and ${agencyNames.length - 10} more`);
  } else {
    console.log('All chunks have agency_id set!');
  }

  console.log('\nDone!');
}

fixAll();
