require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function backfill() {
  // Load mapping
  const mapping = JSON.parse(fs.readFileSync('./docs/agency-mapping.json', 'utf8'));
  console.log('Loaded', mapping.length, 'agency mappings');

  // Create lookup by agency_id
  const lookup = {};
  mapping.forEach(m => {
    lookup[m.agency_id] = m;
  });

  // Get unique agency_ids from chunks
  console.log('\nFetching unique agency_ids from protocol chunks...');
  const { data: chunks } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_id')
    .limit(50000);

  const uniqueIds = [...new Set(chunks.map(c => c.agency_id))];
  console.log('Found', uniqueIds.length, 'unique agency_ids in chunks');

  // Check coverage
  let matched = 0;
  const unmatched = [];
  uniqueIds.forEach(id => {
    if (lookup[id]) matched++;
    else unmatched.push(id);
  });
  console.log('Matched:', matched, '/', uniqueIds.length);
  if (unmatched.length > 0) console.log('Unmatched IDs (first 10):', unmatched.slice(0, 10));

  // Backfill each agency
  console.log('\nBackfilling agency metadata...');
  let totalUpdated = 0;
  let errors = 0;

  for (const agencyId of uniqueIds) {
    const agencyData = lookup[agencyId];
    if (!agencyData) {
      console.log('  Skipping agency_id', agencyId, '- no mapping');
      continue;
    }

    const { data, error } = await supabase
      .from('manus_protocol_chunks')
      .update({
        agency_name: agencyData.agency_name,
        state_code: agencyData.state_code,
        state_name: agencyData.state_name
      })
      .eq('agency_id', agencyId)
      .select('id');

    if (error) {
      console.log('  Error updating agency_id', agencyId, ':', error.message);
      errors++;
    } else {
      totalUpdated += data ? data.length : 0;
      process.stdout.write('\r  Updated ' + totalUpdated + ' rows...');
    }
  }

  console.log('\n\nBackfill complete!');
  console.log('Total rows updated:', totalUpdated);
  console.log('Errors:', errors);

  // Verify
  console.log('\nVerifying samples...');
  const { data: samples } = await supabase
    .from('manus_protocol_chunks')
    .select('id, protocol_title, agency_name, state_code')
    .not('agency_name', 'is', null)
    .limit(5);

  console.log('Sample backfilled rows:');
  samples.forEach(s => console.log(' ', s.state_code, '-', s.agency_name, '-', s.protocol_title.substring(0, 40)));

  // Check LA County
  console.log('\nChecking LA County (agency_id 2701)...');
  const { data: laChunks } = await supabase
    .from('manus_protocol_chunks')
    .select('id, protocol_title, agency_name, state_code')
    .eq('agency_id', 2701)
    .limit(3);

  if (laChunks && laChunks.length > 0) {
    console.log('LA County chunks found:', laChunks.length);
    laChunks.forEach(c => console.log(' ', c.protocol_title));
  } else {
    console.log('No LA County chunks found (agency_id 2701 may not have protocols yet)');
  }
}

backfill().catch(console.error);
