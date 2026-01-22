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

  // Scan ALL rows to get unique agency_ids
  console.log('\nScanning all 49K rows for unique agency_ids...');
  let allAgencyIds = new Set();
  let offset = 0;

  while (offset < 60000) {
    const { data, error } = await supabase
      .from('manus_protocol_chunks')
      .select('agency_id')
      .range(offset, offset + 1000 - 1);

    if (error || !data || data.length === 0) break;

    data.forEach(d => allAgencyIds.add(d.agency_id));
    offset += data.length;
    process.stdout.write('\r  Scanned ' + offset + ' rows, found ' + allAgencyIds.size + ' unique IDs...');
  }

  const uniqueIds = Array.from(allAgencyIds).sort((a, b) => a - b);
  console.log('\n\nTotal unique agency_ids:', uniqueIds.length);

  // Check coverage
  let matched = 0;
  const unmatched = [];
  uniqueIds.forEach(id => {
    if (lookup[id]) matched++;
    else unmatched.push(id);
  });
  console.log('Matched in agencies table:', matched, '/', uniqueIds.length);
  if (unmatched.length > 0) {
    console.log('Unmatched IDs (sample):', unmatched.slice(0, 10));
  }

  // Backfill each agency
  console.log('\nBackfilling agency metadata for', matched, 'agencies...');
  let totalUpdated = 0;
  let errors = 0;
  let processed = 0;
  const startTime = Date.now();

  for (const agencyId of uniqueIds) {
    processed++;
    const agencyData = lookup[agencyId];
    if (!agencyData) continue;

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
      errors++;
    } else {
      totalUpdated += data ? data.length : 0;
    }

    if (processed % 100 === 0 || processed === uniqueIds.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      process.stdout.write('\r  Processed ' + processed + '/' + uniqueIds.length + ' agencies, updated ' + totalUpdated + ' rows (' + elapsed + 's)...');
    }
  }

  console.log('\n\nBackfill complete!');
  console.log('Total rows updated:', totalUpdated);
  console.log('Errors:', errors);
  console.log('Time:', Math.round((Date.now() - startTime) / 1000), 'seconds');

  // Final verification
  console.log('\nFinal verification...');
  const { count: filled } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .not('agency_name', 'is', null);

  const { count: total } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true });

  console.log('Chunks with agency_name:', filled, '/', total, '(' + Math.round(filled/total*100) + '%)');

  // Sample by state
  console.log('\nSample protocols by state:');
  const states = ['CA', 'IL', 'TX', 'AL', 'GA'];
  for (const st of states) {
    const { count } = await supabase
      .from('manus_protocol_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('state_code', st);
    console.log('  ', st, ':', count || 0);
  }
}

backfill().catch(console.error);
