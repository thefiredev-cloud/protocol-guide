// Apply integration_partner migration
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('Adding integration_partner column...');
  
  // Add column
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE public.manus_agencies ADD COLUMN IF NOT EXISTS integration_partner TEXT DEFAULT 'none';`
  });
  
  if (alterError) {
    // Try direct approach - the column might already exist
    console.log('Column may already exist, continuing...');
  }

  // Update LA County agencies
  const { data, error } = await supabase
    .from('manus_agencies')
    .update({ integration_partner: 'imagetrend' })
    .or('name.ilike.%los angeles%,name.ilike.%la county%')
    .select();

  if (error) {
    console.error('Error updating agencies:', error);
    process.exit(1);
  }

  console.log('Updated agencies:', data?.length || 0);
  
  // Check what agencies we have
  const { data: agencies } = await supabase
    .from('manus_agencies')
    .select('id, name, state_code, integration_partner')
    .eq('state_code', 'CA')
    .limit(10);
    
  console.log('CA agencies:', agencies);
}

runMigration();
