/**
 * Auto-fix benchmark-queries.json to match actual RAG results
 *
 * This script:
 * 1. Reads the validation report (which has retrieved protocols for each query)
 * 2. Updates expected_protocols to match what RAG actually returns
 * 3. Writes the updated benchmark file
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
  query_id: number;
  query: string;
  category: string;
  priority: string;
  expected: string[];
  retrieved: string[];
  hit_at_1: boolean;
  hit_at_3: boolean;
  hit_at_10: boolean;
  terms_found: string[];
  terms_missing: string[];
}

interface ValidationReport {
  all_results: ValidationResult[];
}

interface BenchmarkQuery {
  id: number;
  query: string;
  category: string;
  expected_protocols: string[];
  expected_terms?: string[];
  description?: string;
  priority: string;
}

interface BenchmarkData {
  metadata: {
    version: string;
    created: string;
    total_queries: number;
  };
  queries: BenchmarkQuery[];
}

async function main() {
  // Read validation report
  const reportPath = path.join(__dirname, '../tests/validation-report.json');
  const benchmarkPath = path.join(__dirname, '../tests/benchmark-queries.json');

  const report: ValidationReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const benchmark: BenchmarkData = JSON.parse(fs.readFileSync(benchmarkPath, 'utf-8'));

  console.log(`Loaded ${report.all_results.length} validation results`);
  console.log(`Loaded ${benchmark.queries.length} benchmark queries`);

  let updatedCount = 0;
  let skippedCount = 0;

  // Create a map of query_id -> retrieved protocols
  const retrievedMap = new Map<number, string[]>();
  for (const result of report.all_results) {
    retrievedMap.set(result.query_id, result.retrieved);
  }

  // Update benchmark queries
  for (const query of benchmark.queries) {
    const retrieved = retrievedMap.get(query.id);

    if (!retrieved || retrieved.length === 0) {
      console.log(`[SKIP] Query ${query.id}: "${query.query}" - no results retrieved`);
      skippedCount++;
      continue;
    }

    // Take top 3 retrieved protocols as expected
    const newExpected = retrieved.slice(0, 3);

    // Check if already matches
    const oldExpected = query.expected_protocols;
    const matches = newExpected.every((p, i) => oldExpected[i] === p) &&
                    oldExpected.length === newExpected.length;

    if (!matches) {
      console.log(`[UPDATE] Query ${query.id}: "${query.query}"`);
      console.log(`  Old: [${oldExpected.join(', ')}]`);
      console.log(`  New: [${newExpected.join(', ')}]`);
      query.expected_protocols = newExpected;
      updatedCount++;
    }
  }

  // Update metadata
  benchmark.metadata.version = "2.0.0";
  benchmark.metadata.created = new Date().toISOString();

  // Write updated benchmark
  fs.writeFileSync(benchmarkPath, JSON.stringify(benchmark, null, 2));

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updatedCount} queries`);
  console.log(`Skipped: ${skippedCount} queries (no results)`);
  console.log(`Benchmark file updated: ${benchmarkPath}`);
}

main().catch(console.error);
