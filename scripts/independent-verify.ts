/**
 * Independent verification of LA County protocol data
 * No relation to the fix scripts - pure data validation
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getDb } from '../server/db';
import { protocolChunks } from '../drizzle/schema';
import { eq, and, like } from 'drizzle-orm';

const LA_COUNTY_ID = 240009;

async function main() {
  console.log('='.repeat(60));
  console.log('INDEPENDENT LA COUNTY PROTOCOL VERIFICATION');
  console.log('='.repeat(60));
  console.log('\nThis script independently validates protocol data.\n');

  // ===== CHECK MYSQL =====
  console.log('--- MySQL (TiDB) Database Check ---\n');

  const db = await getDb();
  if (!db) {
    console.log('❌ MySQL connection failed');
    return;
  }

  const mysqlProtocols = ['814', '817', '1242', '1335', '1200.3', '1210-PEDS-BICARB'];

  for (const pNum of mysqlProtocols) {
    const result = await db.select()
      .from(protocolChunks)
      .where(and(
        eq(protocolChunks.countyId, LA_COUNTY_ID),
        eq(protocolChunks.protocolNumber, pNum)
      ))
      .limit(1);

    if (result.length > 0) {
      console.log(`✅ MySQL ${pNum}: Found`);
      console.log(`   Title: ${result[0].protocolTitle.substring(0, 50)}...`);
      console.log(`   Content: ${result[0].content.substring(0, 80)}...`);
    } else {
      console.log(`❌ MySQL ${pNum}: NOT FOUND`);
    }
  }

  // ===== CHECK SUPABASE =====
  console.log('\n--- Supabase (pgvector) Database Check ---\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials missing');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  for (const pNum of mysqlProtocols) {
    const { data, error } = await supabase
      .from('manus_protocol_chunks')
      .select('id, protocol_number, protocol_title, embedding, agency_name')
      .eq('agency_name', 'Los Angeles County EMS Agency')
      .ilike('protocol_number', `%${pNum}%`)
      .limit(1);

    if (error) {
      console.log(`❌ Supabase ${pNum}: Query error - ${error.message}`);
    } else if (!data || data.length === 0) {
      console.log(`❌ Supabase ${pNum}: NOT FOUND`);
    } else {
      const hasEmbedding = data[0].embedding && Array.isArray(data[0].embedding) && data[0].embedding.length === 1536;
      console.log(`✅ Supabase ${pNum}: Found (id=${data[0].id})`);
      console.log(`   Title: ${data[0].protocol_title?.substring(0, 50)}...`);
      console.log(`   Embedding: ${hasEmbedding ? '1536 dimensions ✓' : 'MISSING ❌'}`);
    }
  }

  // ===== COUNT TOTALS =====
  console.log('\n--- Protocol Counts ---\n');

  const mysqlCount = await db.select()
    .from(protocolChunks)
    .where(eq(protocolChunks.countyId, LA_COUNTY_ID));
  console.log(`MySQL LA County protocols: ${mysqlCount.length}`);

  const { count } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('agency_name', 'Los Angeles County EMS Agency');
  console.log(`Supabase LA County protocols: ${count}`);

  // ===== SAMPLE CONTENT CHECK =====
  console.log('\n--- Sample Content Verification ---\n');

  // Check Ref 814 content has key phrases
  const { data: ref814 } = await supabase
    .from('manus_protocol_chunks')
    .select('content')
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .eq('protocol_number', '814')
    .limit(1);

  if (ref814 && ref814.length > 0) {
    const content = ref814[0].content.toLowerCase();
    const requiredPhrases = ['20 minutes', 'rigor mortis', 'decapitation', 'asystole'];
    console.log('Ref 814 content check:');
    for (const phrase of requiredPhrases) {
      const found = content.includes(phrase);
      console.log(`  ${found ? '✓' : '✗'} "${phrase}"`);
    }
  }

  // Check Ref 817 content has key phrases
  const { data: ref817 } = await supabase
    .from('manus_protocol_chunks')
    .select('content')
    .eq('agency_name', 'Los Angeles County EMS Agency')
    .eq('protocol_number', '817')
    .limit(1);

  if (ref817 && ref817.length > 0) {
    const content = ref817[0].content.toLowerCase();
    const requiredPhrases = ['hert', 'harbor-ucla', 'field amputation', 'crush'];
    console.log('\nRef 817 content check:');
    for (const phrase of requiredPhrases) {
      const found = content.includes(phrase);
      console.log(`  ${found ? '✓' : '✗'} "${phrase}"`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
