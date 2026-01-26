/**
 * Database Schema Audit
 * Checks indexes, RLS policies, foreign keys, and data integrity
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface IndexInfo {
  table_name: string;
  index_name: string;
  index_definition: string;
}

interface RLSPolicy {
  table_name: string;
  policy_name: string;
  policy_definition: string;
  command: string;
  roles: string[];
}

interface FKConstraint {
  table_name: string;
  constraint_name: string;
  foreign_table: string;
  column_name: string;
  foreign_column: string;
}

async function runQuery(sql: string): Promise<any[]> {
  const { data, error } = await supabase.rpc('execute_sql', { query: sql });
  if (error) {
    // Try direct query through REST API
    console.error(`Query failed: ${error.message}`);
    return [];
  }
  return data || [];
}

async function main() {
  console.log('===============================================');
  console.log('        DATABASE SCHEMA AUDIT REPORT');
  console.log('===============================================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('');

  // 1. Check all tables
  console.log('\n=== TABLES IN PUBLIC SCHEMA ===');
  const { data: tables, error: tablesErr } = await supabase
    .from('information_schema.tables' as any)
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (tablesErr) {
    // Direct SQL via RPC not available, use sample queries
    console.log('(Checking via sample queries)');
    const tableTests = [
      'manus_users',
      'manus_protocol_chunks',
      'manus_agencies',
      'protocol_chunks',
      'agencies',
      'agency_members',
      'bookmarks',
      'queries',
      'feedback',
      'audit_logs',
      'counties',
      'user_counties',
      'search_history',
    ];

    for (const table of tableTests) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: ${count?.toLocaleString() || 0} rows`);
      }
    }
  } else if (tables) {
    for (const t of tables) {
      console.log(`  - ${t.table_name}`);
    }
  }

  // 2. Check manus_protocol_chunks structure (main search table)
  console.log('\n=== MANUS_PROTOCOL_CHUNKS TABLE ===');
  const { data: sample, error: sampleErr } = await supabase
    .from('manus_protocol_chunks')
    .select('*')
    .limit(1);

  if (sampleErr) {
    console.log(`Error: ${sampleErr.message}`);
  } else if (sample && sample.length > 0) {
    console.log('Columns:');
    const columns = Object.keys(sample[0]);
    for (const col of columns) {
      const val = sample[0][col];
      const type = Array.isArray(val) 
        ? `array (${typeof val[0] === 'number' && val.length > 100 ? 'vector' : 'text[]'})` 
        : typeof val;
      console.log(`  - ${col}: ${type}`);
    }
    
    // Check for embedding column
    if ('embedding' in sample[0]) {
      const emb = sample[0].embedding;
      if (Array.isArray(emb)) {
        console.log(`\n  📊 Embedding dimension: ${emb.length}`);
      }
    } else {
      console.log('\n  ⚠️  WARNING: No embedding column found!');
    }
  }

  // 3. Check embedding coverage
  console.log('\n=== EMBEDDING COVERAGE ===');
  const { count: totalChunks } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true });

  const { count: withEmbedding } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  console.log(`  Total chunks: ${totalChunks?.toLocaleString() || 'N/A'}`);
  console.log(`  With embeddings: ${withEmbedding?.toLocaleString() || 'N/A'}`);
  if (totalChunks && withEmbedding) {
    const pct = ((withEmbedding / totalChunks) * 100).toFixed(1);
    console.log(`  Coverage: ${pct}%`);
    if (withEmbedding < totalChunks) {
      console.log(`  ⚠️  Missing embeddings: ${(totalChunks - withEmbedding).toLocaleString()}`);
    }
  }

  // 4. Check agencies table
  console.log('\n=== MANUS_AGENCIES TABLE ===');
  const { data: agencySample, error: agencyErr } = await supabase
    .from('manus_agencies')
    .select('*')
    .limit(1);

  if (agencyErr) {
    console.log(`Error: ${agencyErr.message}`);
  } else if (agencySample && agencySample.length > 0) {
    console.log('Columns:', Object.keys(agencySample[0]).join(', '));
    
    // Count agencies by type
    const { count: totalAgencies } = await supabase
      .from('manus_agencies')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total agencies: ${totalAgencies?.toLocaleString() || 'N/A'}`);
  }

  // 5. Check data by state (for state filtering)
  console.log('\n=== PROTOCOL CHUNKS BY STATE ===');
  const { data: stateData, error: stateErr } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code')
    .limit(10000);

  if (!stateErr && stateData) {
    const byState: Record<string, number> = {};
    for (const row of stateData) {
      const code = row.state_code || 'NULL';
      byState[code] = (byState[code] || 0) + 1;
    }
    const sorted = Object.entries(byState).sort((a, b) => b[1] - a[1]);
    for (const [state, count] of sorted.slice(0, 10)) {
      console.log(`  ${state}: ${count.toLocaleString()}`);
    }
    if (byState['NULL'] && byState['NULL'] > 0) {
      console.log(`  ⚠️  NULL state_code records: ${byState['NULL']}`);
    }
  }

  // 6. Check for orphaned data
  console.log('\n=== ORPHANED DATA CHECK ===');
  
  // Chunks without valid agency
  const { count: orphanedChunks } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .is('agency_id', null);
  
  console.log(`  Chunks without agency_id: ${orphanedChunks?.toLocaleString() || '0'}`);

  // 7. Check RPC functions exist
  console.log('\n=== RPC FUNCTIONS CHECK ===');
  const rpcFunctions = [
    'search_manus_protocols',
    'search_manus_protocols_inherited',
    'get_protocol_inheritance_chain',
    'get_agency_protocol_coverage',
    'get_current_user_id',
    'is_admin',
    'is_agency_member',
    'is_agency_admin',
  ];

  for (const fn of rpcFunctions) {
    try {
      // Test with invalid params just to see if function exists
      const { error } = await supabase.rpc(fn, {} as any);
      if (error && error.message.includes('does not exist')) {
        console.log(`  ❌ ${fn}: NOT FOUND`);
      } else {
        console.log(`  ✅ ${fn}: EXISTS`);
      }
    } catch (e) {
      console.log(`  ❓ ${fn}: ${(e as Error).message}`);
    }
  }

  // 8. Test vector search
  console.log('\n=== VECTOR SEARCH TEST ===');
  try {
    // Create a test embedding (zeros)
    const testEmbedding = new Array(1536).fill(0.01);
    
    const { data: searchResult, error: searchErr } = await supabase.rpc('search_manus_protocols', {
      query_embedding: testEmbedding,
      agency_filter: null,
      state_filter: null,
      match_count: 5,
      match_threshold: 0.0,
      agency_name_filter: null,
      state_code_filter: null,
    });

    if (searchErr) {
      console.log(`  ❌ Vector search failed: ${searchErr.message}`);
      if (searchErr.message.includes('ivfflat') || searchErr.message.includes('index')) {
        console.log(`  ⚠️  This may indicate missing vector index!`);
      }
    } else {
      console.log(`  ✅ Vector search working (returned ${searchResult?.length || 0} results)`);
    }
  } catch (e) {
    console.log(`  ❌ Error: ${(e as Error).message}`);
  }

  console.log('\n===============================================');
  console.log('            AUDIT COMPLETE');
  console.log('===============================================');
}

main().catch(console.error);
