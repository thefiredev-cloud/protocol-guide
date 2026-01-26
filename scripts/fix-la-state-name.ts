import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
  // Check what state values the app uses
  console.log('Checking state values in coverage...');
  
  const { data: coverage } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code, state_name')
    .limit(100);
  
  const stateCodeToName = new Map<string, Set<string | null>>();
  coverage?.forEach(c => {
    const codes = stateCodeToName.get(c.state_code) || new Set();
    codes.add(c.state_name);
    stateCodeToName.set(c.state_code, codes);
  });
  
  console.log('State code to name mapping:');
  stateCodeToName.forEach((names, code) => {
    console.log(`  ${code}: ${[...names].join(', ')}`);
  });

  // Check LA County specifically
  const { data: laCheck } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code, state_name')
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .limit(3);
  
  console.log('\nLA County state values:', laCheck);

  // Fix: Update LA County to have state_name = 'California'
  console.log('\nUpdating LA County state_name to California...');
  const { error } = await supabase
    .from('manus_protocol_chunks')
    .update({ state_name: 'California' })
    .eq('agency_name', 'Los Angeles County EMS Agency');
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Updated successfully!');
  }

  // Verify
  const { data: verify } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code, state_name')
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .limit(3);
  
  console.log('\nAfter fix:', verify);
}

fix();
