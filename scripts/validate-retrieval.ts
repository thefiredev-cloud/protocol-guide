/**
 * Validate Retrieval Accuracy Script
 *
 * Runs benchmark queries against the RAG system and measures:
 * - Precision@1, @3, @10
 * - Recall
 * - Mean Reciprocal Rank (MRR)
 *
 * Run with: npx tsx scripts/validate-retrieval.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { retrieveContext, type RetrievalResult } from '../lib/rag/retrieval';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Flag to use full RAG pipeline (slower but accurate) vs keyword-only (fast)
const USE_FULL_RAG = process.env.USE_FULL_RAG !== 'false';

// ============================================
// Types
// ============================================

interface BenchmarkQuery {
  id: number;
  query: string;
  category: string;
  expected_protocols: string[];
  expected_terms?: string[];
  description?: string;
  priority: 'critical' | 'high' | 'medium';
}

interface BenchmarkData {
  metadata: {
    version: string;
    created: string;
    total_queries: number;
  };
  queries: BenchmarkQuery[];
}

interface SearchResult {
  protocol_id: string;
  protocol_ref: string;
  content: string;
  relevance_score: number;
}

interface QueryResult {
  query_id: number;
  query: string;
  category: string;
  priority: string;
  expected: string[];
  retrieved: string[];
  hit_at_1: boolean;
  hit_at_3: boolean;
  hit_at_10: boolean;
  reciprocal_rank: number;
  recall: number;
  terms_found: string[];
  terms_missing: string[];
  success: boolean;
  error?: string;
}

interface ValidationReport {
  timestamp: string;
  total_queries: number;
  successful_queries: number;
  failed_queries: number;
  metrics: {
    precision_at_1: number;
    precision_at_3: number;
    precision_at_10: number;
    mrr: number;
    overall_recall: number;
  };
  by_category: Record<string, {
    count: number;
    precision_at_1: number;
    mrr: number;
  }>;
  by_priority: Record<string, {
    count: number;
    precision_at_1: number;
    mrr: number;
  }>;
  failures: QueryResult[];
  all_results: QueryResult[];
}

// ============================================
// Search Functions
// ============================================

async function searchProtocolsWithRAG(query: string): Promise<SearchResult[]> {
  try {
    const result: RetrievalResult = await retrieveContext(query, null);

    if (result.declined || result.chunks.length === 0) {
      return [];
    }

    return result.chunks.map((chunk) => ({
      protocol_id: chunk.protocolId,
      protocol_ref: chunk.protocolRef,
      content: chunk.content,
      relevance_score: chunk.relevanceScore,
    }));
  } catch (error) {
    console.error('RAG retrieval error:', error);
    return [];
  }
}

async function searchProtocolsKeywordOnly(query: string): Promise<SearchResult[]> {
  // Try exact search first for protocol numbers
  const numMatch = query.match(/(\d{3,4})/);
  if (numMatch) {
    const { data: exactData } = await supabase.rpc('search_protocols_by_ref', {
      search_ref: numMatch[1],
    });

    if (exactData && exactData.length > 0) {
      return exactData.map((row: any) => ({
        protocol_id: row.protocol_id,
        protocol_ref: row.protocol_ref,
        content: row.content,
        relevance_score: 1.0,
      }));
    }
  }

  // Fall back to full-text search
  const { data: ftsData } = await supabase.rpc('fulltext_search_protocols', {
    query_text: query,
    match_count: 20,
  });

  if (ftsData && ftsData.length > 0) {
    return ftsData.map((row: any) => ({
      protocol_id: row.protocol_id,
      protocol_ref: row.protocol_ref,
      content: row.content,
      relevance_score: row.rank || 0.5,
    }));
  }

  return [];
}

async function searchProtocols(query: string): Promise<SearchResult[]> {
  if (USE_FULL_RAG) {
    return searchProtocolsWithRAG(query);
  }
  return searchProtocolsKeywordOnly(query);
}

// ============================================
// Evaluation Functions
// ============================================

function normalizeProtocolId(id: string): string {
  // Remove all known prefixes and suffixes, normalize for matching
  return id
    .replace(/^(TP-|Ref\.?\s*|MCG\s*|MED-|PROC-)/i, '') // Remove prefixes
    .replace(/-P$/i, '') // Remove pediatric suffix
    .replace(/\s+/g, '')
    .toUpperCase();
}

function checkProtocolMatch(retrieved: string, expected: string[]): boolean {
  const normalizedRetrieved = normalizeProtocolId(retrieved);
  return expected.some(exp => {
    const normalizedExpected = normalizeProtocolId(exp);
    return normalizedRetrieved === normalizedExpected ||
           normalizedRetrieved.includes(normalizedExpected) ||
           normalizedExpected.includes(normalizedRetrieved);
  });
}

function findFirstMatchRank(retrieved: string[], expected: string[]): number {
  for (let i = 0; i < retrieved.length; i++) {
    if (checkProtocolMatch(retrieved[i], expected)) {
      return i + 1; // 1-indexed rank
    }
  }
  return 0; // No match found
}

function calculateRecall(retrieved: string[], expected: string[]): number {
  if (expected.length === 0) return 1;
  const matchedExpected = expected.filter(exp =>
    retrieved.some(ret => checkProtocolMatch(ret, [exp]))
  );
  return matchedExpected.length / expected.length;
}

function findTermsInContent(content: string, terms: string[]): { found: string[]; missing: string[] } {
  const lowerContent = content.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  for (const term of terms) {
    if (lowerContent.includes(term.toLowerCase())) {
      found.push(term);
    } else {
      missing.push(term);
    }
  }

  return { found, missing };
}

async function evaluateQuery(benchmark: BenchmarkQuery): Promise<QueryResult> {
  try {
    const results = await searchProtocols(benchmark.query);
    const retrievedIds = [...new Set(results.map(r => r.protocol_id))];
    const allContent = results.map(r => r.content).join(' ');

    const firstMatchRank = findFirstMatchRank(retrievedIds, benchmark.expected_protocols);
    const recall = calculateRecall(retrievedIds.slice(0, 10), benchmark.expected_protocols);

    // Check for expected terms
    const termCheck = benchmark.expected_terms
      ? findTermsInContent(allContent, benchmark.expected_terms)
      : { found: [], missing: [] };

    return {
      query_id: benchmark.id,
      query: benchmark.query,
      category: benchmark.category,
      priority: benchmark.priority,
      expected: benchmark.expected_protocols,
      retrieved: retrievedIds.slice(0, 10),
      hit_at_1: firstMatchRank === 1,
      hit_at_3: firstMatchRank >= 1 && firstMatchRank <= 3,
      hit_at_10: firstMatchRank >= 1 && firstMatchRank <= 10,
      reciprocal_rank: firstMatchRank > 0 ? 1 / firstMatchRank : 0,
      recall,
      terms_found: termCheck.found,
      terms_missing: termCheck.missing,
      success: true,
    };
  } catch (error) {
    return {
      query_id: benchmark.id,
      query: benchmark.query,
      category: benchmark.category,
      priority: benchmark.priority,
      expected: benchmark.expected_protocols,
      retrieved: [],
      hit_at_1: false,
      hit_at_3: false,
      hit_at_10: false,
      reciprocal_rank: 0,
      recall: 0,
      terms_found: [],
      terms_missing: benchmark.expected_terms || [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Report Generation
// ============================================

function generateReport(results: QueryResult[]): ValidationReport {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success || !r.hit_at_10);

  // Overall metrics
  const precision1 = successful.filter(r => r.hit_at_1).length / successful.length;
  const precision3 = successful.filter(r => r.hit_at_3).length / successful.length;
  const precision10 = successful.filter(r => r.hit_at_10).length / successful.length;
  const mrr = successful.reduce((sum, r) => sum + r.reciprocal_rank, 0) / successful.length;
  const avgRecall = successful.reduce((sum, r) => sum + r.recall, 0) / successful.length;

  // By category
  const categories = [...new Set(results.map(r => r.category))];
  const byCategory: Record<string, { count: number; precision_at_1: number; mrr: number }> = {};
  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat && r.success);
    byCategory[cat] = {
      count: catResults.length,
      precision_at_1: catResults.filter(r => r.hit_at_1).length / catResults.length || 0,
      mrr: catResults.reduce((sum, r) => sum + r.reciprocal_rank, 0) / catResults.length || 0,
    };
  }

  // By priority
  const priorities = ['critical', 'high', 'medium'];
  const byPriority: Record<string, { count: number; precision_at_1: number; mrr: number }> = {};
  for (const pri of priorities) {
    const priResults = results.filter(r => r.priority === pri && r.success);
    byPriority[pri] = {
      count: priResults.length,
      precision_at_1: priResults.filter(r => r.hit_at_1).length / priResults.length || 0,
      mrr: priResults.reduce((sum, r) => sum + r.reciprocal_rank, 0) / priResults.length || 0,
    };
  }

  return {
    timestamp: new Date().toISOString(),
    total_queries: results.length,
    successful_queries: successful.length,
    failed_queries: results.filter(r => !r.success).length,
    metrics: {
      precision_at_1: precision1,
      precision_at_3: precision3,
      precision_at_10: precision10,
      mrr,
      overall_recall: avgRecall,
    },
    by_category: byCategory,
    by_priority: byPriority,
    failures: failed,
    all_results: results,
  };
}

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Protocol Guide - Retrieval Validation');
  console.log(`Mode: ${USE_FULL_RAG ? 'FULL RAG (embeddings + hybrid search)' : 'KEYWORD-ONLY'}`);
  console.log('='.repeat(60));

  // Load benchmark queries
  const benchmarkPath = path.join(__dirname, '../tests/benchmark-queries.json');
  if (!fs.existsSync(benchmarkPath)) {
    console.error('Benchmark file not found:', benchmarkPath);
    process.exit(1);
  }

  const benchmarkData: BenchmarkData = JSON.parse(fs.readFileSync(benchmarkPath, 'utf-8'));
  console.log(`\nLoaded ${benchmarkData.queries.length} benchmark queries`);

  // Run all queries
  console.log('\nRunning validation...\n');
  const results: QueryResult[] = [];

  for (const query of benchmarkData.queries) {
    process.stdout.write(`  [${query.id}/${benchmarkData.queries.length}] ${query.query.substring(0, 40).padEnd(40)} `);
    const result = await evaluateQuery(query);
    results.push(result);

    if (result.hit_at_1) {
      console.log('✓ P@1');
    } else if (result.hit_at_3) {
      console.log('~ P@3');
    } else if (result.hit_at_10) {
      console.log('○ P@10');
    } else {
      console.log('✗ MISS');
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate report
  const report = generateReport(results);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60));
  console.log(`\nOverall Metrics:`);
  console.log(`  Precision@1:  ${(report.metrics.precision_at_1 * 100).toFixed(1)}%`);
  console.log(`  Precision@3:  ${(report.metrics.precision_at_3 * 100).toFixed(1)}%`);
  console.log(`  Precision@10: ${(report.metrics.precision_at_10 * 100).toFixed(1)}%`);
  console.log(`  MRR:          ${report.metrics.mrr.toFixed(3)}`);
  console.log(`  Recall:       ${(report.metrics.overall_recall * 100).toFixed(1)}%`);

  console.log(`\nBy Category:`);
  for (const [cat, metrics] of Object.entries(report.by_category)) {
    console.log(`  ${cat.padEnd(20)} P@1: ${(metrics.precision_at_1 * 100).toFixed(0)}% (n=${metrics.count})`);
  }

  console.log(`\nBy Priority:`);
  for (const [pri, metrics] of Object.entries(report.by_priority)) {
    console.log(`  ${pri.padEnd(10)} P@1: ${(metrics.precision_at_1 * 100).toFixed(0)}% (n=${metrics.count})`);
  }

  if (report.failures.length > 0) {
    console.log(`\nFailed Queries (${report.failures.length}):`);
    for (const f of report.failures.slice(0, 10)) {
      console.log(`  - [${f.query_id}] "${f.query}" (expected: ${f.expected.join(', ')})`);
    }
  }

  // Save report
  const reportPath = path.join(__dirname, '../tests/validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);

  // Exit with appropriate code
  const passThreshold = 0.9;
  if (report.metrics.precision_at_10 < passThreshold) {
    console.log(`\n⚠️  BELOW THRESHOLD: P@10 ${(report.metrics.precision_at_10 * 100).toFixed(1)}% < ${passThreshold * 100}%`);
    process.exit(1);
  } else {
    console.log(`\n✓ PASSED: P@10 ${(report.metrics.precision_at_10 * 100).toFixed(1)}% >= ${passThreshold * 100}%`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
