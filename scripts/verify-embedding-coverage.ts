/**
 * Embedding Coverage Verification Script
 *
 * Queries Supabase manus_protocol_chunks to check:
 * - Total chunks vs chunks with embeddings
 * - Missing embeddings by agency
 * - State-level coverage breakdown
 *
 * Run with: npx tsx scripts/verify-embedding-coverage.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CoverageStats {
  totalChunks: number;
  chunksWithEmbeddings: number;
  chunksWithoutEmbeddings: number;
  coveragePercent: number;
}

interface AgencyStats {
  agencyName: string;
  stateCode: string;
  missingEmbeddings: number;
}

interface StateStats {
  stateCode: string;
  chunkCount: number;
  agencies: number;
}

async function getOverallCoverage(): Promise<CoverageStats> {
  const { data, error } = await supabase.rpc('get_embedding_coverage_stats');

  if (error) {
    // Fallback to direct query if RPC doesn't exist
    const { data: chunks, error: queryError } = await supabase
      .from('manus_protocol_chunks')
      .select('id, embedding', { count: 'exact' });

    if (queryError) throw queryError;

    const total = chunks?.length || 0;
    const withEmbeddings = chunks?.filter(c => c.embedding !== null).length || 0;

    return {
      totalChunks: total,
      chunksWithEmbeddings: withEmbeddings,
      chunksWithoutEmbeddings: total - withEmbeddings,
      coveragePercent: total > 0 ? (withEmbeddings / total) * 100 : 0
    };
  }

  return data;
}

async function getMissingEmbeddingsByAgency(): Promise<AgencyStats[]> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_name, state_code')
    .is('embedding', null);

  if (error) throw error;

  // Group by agency
  const agencyMap = new Map<string, { stateCode: string; count: number }>();

  for (const chunk of data || []) {
    const key = chunk.agency_name || 'Unknown';
    const existing = agencyMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      agencyMap.set(key, { stateCode: chunk.state_code || 'XX', count: 1 });
    }
  }

  return Array.from(agencyMap.entries())
    .map(([agencyName, { stateCode, count }]) => ({
      agencyName,
      stateCode,
      missingEmbeddings: count
    }))
    .sort((a, b) => b.missingEmbeddings - a.missingEmbeddings);
}

async function getStateBreakdown(): Promise<StateStats[]> {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .select('state_code, agency_name');

  if (error) throw error;

  // Group by state
  const stateMap = new Map<string, { count: number; agencies: Set<string> }>();

  for (const chunk of data || []) {
    const state = chunk.state_code || 'XX';
    const existing = stateMap.get(state);
    if (existing) {
      existing.count++;
      existing.agencies.add(chunk.agency_name || 'Unknown');
    } else {
      stateMap.set(state, { count: 1, agencies: new Set([chunk.agency_name || 'Unknown']) });
    }
  }

  return Array.from(stateMap.entries())
    .map(([stateCode, { count, agencies }]) => ({
      stateCode,
      chunkCount: count,
      agencies: agencies.size
    }))
    .sort((a, b) => b.chunkCount - a.chunkCount);
}

async function getCaliforniaAgencyBreakdown() {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .select('agency_name, protocol_number')
    .eq('state_code', 'CA');

  if (error) throw error;

  // Group by agency
  const agencyMap = new Map<string, { count: number; uniqueProtocols: Set<string> }>();

  for (const chunk of data || []) {
    const agency = chunk.agency_name || 'Unknown';
    const existing = agencyMap.get(agency);
    if (existing) {
      existing.count++;
      existing.uniqueProtocols.add(chunk.protocol_number || '');
    } else {
      agencyMap.set(agency, {
        count: 1,
        uniqueProtocols: new Set([chunk.protocol_number || ''])
      });
    }
  }

  return Array.from(agencyMap.entries())
    .map(([agencyName, { count, uniqueProtocols }]) => ({
      agencyName,
      chunkCount: count,
      uniqueProtocols: uniqueProtocols.size
    }))
    .sort((a, b) => b.chunkCount - a.chunkCount);
}

async function getLACountyStats() {
  const { data, error } = await supabase
    .from('manus_protocol_chunks')
    .select('protocol_number, protocol_title')
    .or('agency_name.ilike.%Los Angeles%,agency_name.ilike.%LA County%');

  if (error) throw error;

  const dateFormatCount = (data || []).filter(c =>
    c.protocol_number && /^\d{2}\/\d{2}\/\d{4}$/.test(c.protocol_number)
  ).length;

  const properFormatCount = (data || []).filter(c =>
    c.protocol_number && !/^\d{2}\/\d{2}\/\d{4}$/.test(c.protocol_number)
  ).length;

  return {
    totalChunks: data?.length || 0,
    dateFormatProtocols: dateFormatCount,
    properFormatProtocols: properFormatCount,
    uniqueProtocols: new Set(data?.map(c => c.protocol_number) || []).size
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log('PROTOCOL GUIDE - EMBEDDING COVERAGE VERIFICATION');
  console.log('='.repeat(70));
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Overall coverage
    console.log('--- OVERALL EMBEDDING COVERAGE ---\n');
    const coverage = await getOverallCoverage();
    console.log(`  Total chunks:              ${coverage.totalChunks.toLocaleString()}`);
    console.log(`  Chunks with embeddings:    ${coverage.chunksWithEmbeddings.toLocaleString()}`);
    console.log(`  Chunks without embeddings: ${coverage.chunksWithoutEmbeddings.toLocaleString()}`);
    console.log(`  Coverage:                  ${coverage.coveragePercent.toFixed(2)}%`);

    if (coverage.coveragePercent === 100) {
      console.log('\n  Status: COMPLETE');
    } else {
      console.log('\n  Status: INCOMPLETE - Run generate-embeddings.ts');
    }

    // State breakdown
    console.log('\n--- STATE BREAKDOWN (Top 15) ---\n');
    const states = await getStateBreakdown();
    console.log('  State | Chunks  | Agencies');
    console.log('  ------|---------|----------');
    for (const state of states.slice(0, 15)) {
      console.log(`  ${state.stateCode.padEnd(5)} | ${state.chunkCount.toString().padStart(7)} | ${state.agencies}`);
    }

    // California agencies
    console.log('\n--- CALIFORNIA AGENCY BREAKDOWN ---\n');
    const caAgencies = await getCaliforniaAgencyBreakdown();
    console.log('  Agency                                    | Chunks | Protocols');
    console.log('  ------------------------------------------|--------|----------');
    for (const agency of caAgencies.slice(0, 15)) {
      const name = agency.agencyName.substring(0, 42).padEnd(42);
      console.log(`  ${name}| ${agency.chunkCount.toString().padStart(6)} | ${agency.uniqueProtocols}`);
    }

    // LA County specific
    console.log('\n--- LA COUNTY STATUS ---\n');
    const laStats = await getLACountyStats();
    console.log(`  Total chunks:             ${laStats.totalChunks}`);
    console.log(`  Unique protocols:         ${laStats.uniqueProtocols}`);
    console.log(`  Properly formatted:       ${laStats.properFormatProtocols}`);
    console.log(`  Date-format (needs fix):  ${laStats.dateFormatProtocols}`);

    if (laStats.dateFormatProtocols > 0) {
      console.log('\n  WARNING: Some LA County protocols have date-based protocol_numbers');
      console.log('  Run: npx tsx scripts/fix-la-county-metadata.ts');
    }

    // Missing embeddings by agency
    const missing = await getMissingEmbeddingsByAgency();
    if (missing.length > 0) {
      console.log('\n--- MISSING EMBEDDINGS BY AGENCY ---\n');
      console.log('  Agency                                    | State | Missing');
      console.log('  ------------------------------------------|-------|--------');
      for (const agency of missing.slice(0, 20)) {
        const name = agency.agencyName.substring(0, 42).padEnd(42);
        console.log(`  ${name}| ${agency.stateCode.padEnd(5)} | ${agency.missingEmbeddings}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));

    const issues: string[] = [];
    if (coverage.coveragePercent < 100) {
      issues.push(`Embedding coverage at ${coverage.coveragePercent.toFixed(1)}%`);
    }
    if (laStats.dateFormatProtocols > 0) {
      issues.push(`${laStats.dateFormatProtocols} LA County protocols need metadata fix`);
    }

    if (issues.length === 0) {
      console.log('\n  All checks passed!\n');
    } else {
      console.log('\n  Issues found:');
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
      console.log();
    }

  } catch (error: any) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
