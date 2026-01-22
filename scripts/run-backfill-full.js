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

  // Get ALL unique agency_ids from chunks using distinct query approach
  console.log('\nFetching ALL unique agency_ids from protocol chunks...');

  // Use a more efficient approach - query directly for unique agency_ids
  let allAgencyIds = new Set();
  let offset = 0;
  const batchSize = 5000;

  while (true) {
    const { data, error } = await supabase
      .from('manus_protocol_chunks')
      .select('agency_id')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.log('Error fetching at offset', offset, ':', error.message);
      break;
    }

    if (!data || data.length === 0) break;

    data.forEach(d => allAgencyIds.add(d.agency_id));
    offset += batchSize;
    process.stdout.write('\r  Scanned ' + offset + ' rows, found ' + allAgencyIds.size + ' unique agency_ids...');

    if (data.length < batchSize) break;
  }

  const uniqueIds = Array.from(allAgencyIds).sort((a, b) => a - b);
  console.log('\n\nTotal unique agency_ids in chunks:', uniqueIds.length);
  console.log('ID range:', Math.min(...uniqueIds), 'to', Math.max(...uniqueIds));

  // Check coverage
  let matched = 0;
  const unmatched = [];
  uniqueIds.forEach(id => {
    if (lookup[id]) matched++;
    else unmatched.push(id);
  });
  console.log('Matched in agencies table:', matched, '/', uniqueIds.length);
  if (unmatched.length > 0) {
    console.log('Unmatched IDs (first 20):', unmatched.slice(0, 20));
  }

  // Backfill each agency
  console.log('\nBackfilling agency metadata for', matched, 'agencies...');
  let totalUpdated = 0;
  let errors = 0;
  let processed = 0;

  for (const agencyId of uniqueIds) {
    processed++;
    const agencyData = lookup[agencyId];
    if (!agencyData) {
      continue; // Skip unmatched
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
      console.log('\n  Error updating agency_id', agencyId, ':', error.message);
      errors++;
    } else {
      const count = data ? data.length : 0;
      totalUpdated += count;
      process.stdout.write('\r  Processed ' + processed + '/' + uniqueIds.length + ' agencies, updated ' + totalUpdated + ' rows...');
    }
  }

  console.log('\n\nBackfill complete!');
  console.log('Total rows updated:', totalUpdated);
  console.log('Errors:', errors);

  // Verify
  console.log('\nVerifying coverage...');
  const { count: filled } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .not('agency_name', 'is', null);

  const { count: total } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true });

  console.log('Chunks with agency_name:', filled, '/', total, '(' + Math.round(filled/total*100) + '%)');

  // Sample by state
  const { data: stateSamples } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code')
    .not('state_code', 'is', null)
    .limit(10000);

  const stateCounts = {};
  stateSamples.forEach(s => {
    stateCounts[s.state_code] = (stateCounts[s.state_code] || 0) + 1;
  });
  console.log('\nProtocols by state (from sample):');
  Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([st, count]) => console.log('  ', st, ':', count));
}

backfill().catch(console.error);
