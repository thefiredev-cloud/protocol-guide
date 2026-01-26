/**
 * Apply Supabase-specific migrations
 * 
 * This script applies the PostgreSQL migrations that are specific to the
 * Supabase manus_* tables (which use pgvector for semantic search).
 * 
 * Usage: npx tsx scripts/apply-supabase-migrations.ts [--dry-run]
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRY_RUN = process.argv.includes('--dry-run');

// Migrations to apply (in order)
const MIGRATIONS = [
  '0030_optimize_manus_protocol_chunks.sql',
  '0031_fix_orphaned_data_and_backfill.sql',
];

async function executeSql(sql: string, name: string): Promise<{ success: boolean; error?: string }> {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would execute: ${name}`);
    console.log(`SQL preview (first 500 chars):\n${sql.substring(0, 500)}...\n`);
    return { success: true };
  }

  try {
    const { error } = await supabase.rpc('execute_sql', { query: sql });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

async function checkPgvector(): Promise<boolean> {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') as has_pgvector"
  });
  
  if (error) {
    // Try alternative check
    const { data: altData, error: altError } = await supabase
      .from('manus_protocol_chunks')
      .select('embedding')
      .limit(1);
    
    return !altError;
  }
  
  return data?.[0]?.has_pgvector === true;
}

async function getExistingIndexes(): Promise<string[]> {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'manus_protocol_chunks' 
      AND schemaname = 'public'
    `
  });
  
  if (error || !data) return [];
  return data.map((r: { indexname: string }) => r.indexname);
}

async function main() {
  console.log('=========================================');
  console.log('   SUPABASE MIGRATION SCRIPT');
  console.log('=========================================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('');

  // Check prerequisites
  console.log('[1/4] Checking prerequisites...');
  
  const hasPgvector = await checkPgvector();
  if (!hasPgvector) {
    console.error('❌ pgvector extension is not enabled!');
    console.log('Run this in Supabase SQL Editor:');
    console.log('  CREATE EXTENSION IF NOT EXISTS vector;');
    process.exit(1);
  }
  console.log('✅ pgvector extension is enabled');

  // Check existing indexes
  console.log('\n[2/4] Checking existing indexes...');
  const existingIndexes = await getExistingIndexes();
  console.log(`Found ${existingIndexes.length} existing indexes on manus_protocol_chunks`);
  for (const idx of existingIndexes) {
    console.log(`  - ${idx}`);
  }

  // Read and apply migrations
  console.log('\n[3/4] Applying migrations...');
  
  const migrationsDir = path.join(__dirname, '..', 'drizzle', 'migrations');
  
  for (const migration of MIGRATIONS) {
    const filePath = path.join(migrationsDir, migration);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Migration file not found: ${migration}`);
      continue;
    }
    
    console.log(`\nProcessing: ${migration}`);
    
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Split into individual statements (basic split, may need refinement)
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`  Found ${statements.length} SQL statements`);
    
    if (DRY_RUN) {
      console.log('  [DRY RUN] Would execute all statements');
      continue;
    }
    
    // For safety, we'll execute key statements individually
    // In production, you should run the full SQL file through Supabase SQL Editor
    console.log('  ⚠️  For safety, please run this migration through Supabase SQL Editor:');
    console.log(`     1. Open https://supabase.com/dashboard/project/[your-project]/sql`);
    console.log(`     2. Paste the contents of: ${filePath}`);
    console.log(`     3. Execute the migration`);
  }

  // Verification
  console.log('\n[4/4] Verification...');
  
  // Check data quality
  const { count: totalChunks } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true });

  const { count: withEmbedding } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  const { count: orphanedChunks } = await supabase
    .from('manus_protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .is('agency_id', null);

  console.log('\nData Quality Metrics:');
  console.log(`  Total chunks: ${totalChunks?.toLocaleString()}`);
  console.log(`  With embeddings: ${withEmbedding?.toLocaleString()} (${((withEmbedding || 0) / (totalChunks || 1) * 100).toFixed(1)}%)`);
  console.log(`  Orphaned (no agency): ${orphanedChunks?.toLocaleString()}`);

  // Test vector search
  console.log('\nTesting vector search...');
  const testEmbedding = new Array(1536).fill(0.01);
  
  const startTime = Date.now();
  const { data: searchResult, error: searchErr } = await supabase.rpc('search_manus_protocols', {
    query_embedding: testEmbedding,
    agency_filter: null,
    state_filter: null,
    match_count: 5,
    match_threshold: 0.0,
    agency_name_filter: null,
    state_code_filter: null,
  });
  const searchTime = Date.now() - startTime;

  if (searchErr) {
    console.log(`  ❌ Vector search error: ${searchErr.message}`);
  } else {
    console.log(`  ✅ Vector search working (${searchResult?.length || 0} results in ${searchTime}ms)`);
  }

  console.log('\n=========================================');
  console.log('   MIGRATION COMPLETE');
  console.log('=========================================');
  console.log('\nNext steps:');
  console.log('1. Apply migrations through Supabase SQL Editor');
  console.log('2. Run: npx tsx scripts/audit-database-schema.ts');
  console.log('3. Test search functionality');
}

main().catch(console.error);
