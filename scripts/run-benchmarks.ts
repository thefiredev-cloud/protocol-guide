#!/usr/bin/env npx tsx
/**
 * Protocol Guide Performance Benchmark Runner
 *
 * Runs all performance benchmarks and generates a summary report.
 *
 * Usage:
 *   npx tsx scripts/run-benchmarks.ts
 *   npx tsx scripts/run-benchmarks.ts --quick    # Run subset of tests
 *   npx tsx scripts/run-benchmarks.ts --json     # Output JSON report
 */

import "./load-env.js";
import { performance } from "perf_hooks";

// Performance thresholds matching landing page claims
const TARGETS = {
  RETRIEVAL_TIME: 2300, // 2.3 seconds (landing page claim)
  COLD_START: 2000, // 2 seconds
  WARM_START: 500, // 500ms
  CACHE_READ: 5, // 5ms
  CACHE_WRITE: 10, // 10ms
  EMBEDDING_COLD: 500, // 500ms (API call)
  EMBEDDING_CACHED: 5, // 5ms (cache hit)
  MEMORY_IDLE_MB: 150, // 150MB
  MEMORY_ACTIVE_MB: 250, // 250MB
  OFFLINE_DB_SIZE_MB: 10, // 10MB max
};

interface BenchmarkResult {
  name: string;
  category: string;
  target: number;
  actual: number;
  unit: string;
  passed: boolean;
  samples?: number[];
  percentiles?: { p50: number; p95: number; p99: number };
}

interface BenchmarkReport {
  timestamp: string;
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: string;
  };
  results: BenchmarkResult[];
  recommendations: string[];
}

// Utility functions
function calculatePercentiles(samples: number[]): { p50: number; p95: number; p99: number } {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
}

async function measureExecution<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  return { result, durationMs };
}

// Individual benchmark functions
async function benchmarkSemanticSearch(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  try {
    const { semanticSearchProtocols, embeddingCache, generateEmbedding } = await import(
      "../server/_core/embeddings"
    );

    // Clear cache for cold test
    embeddingCache.clear();

    // Test 1: Simple search (cardiac arrest)
    const simpleSamples: number[] = [];
    const queries = ["cardiac arrest", "stroke", "seizure", "anaphylaxis", "chest pain"];

    for (const query of queries) {
      embeddingCache.clear();
      const { durationMs } = await measureExecution(() =>
        semanticSearchProtocols({ query, limit: 10, threshold: 0.3 })
      );
      simpleSamples.push(durationMs);
    }

    const simplePercentiles = calculatePercentiles(simpleSamples);
    results.push({
      name: "Simple Search (P95)",
      category: "Search Latency",
      target: TARGETS.RETRIEVAL_TIME,
      actual: simplePercentiles.p95,
      unit: "ms",
      passed: simplePercentiles.p95 < TARGETS.RETRIEVAL_TIME,
      samples: simpleSamples,
      percentiles: simplePercentiles,
    });

    // Test 2: Complex natural language search
    const complexSamples: number[] = [];
    const complexQueries = [
      "what do I do for a patient having a heart attack",
      "pediatric respiratory distress management",
      "anaphylaxis treatment epinephrine dosing",
    ];

    for (const query of complexQueries) {
      embeddingCache.clear();
      const { durationMs } = await measureExecution(() =>
        semanticSearchProtocols({ query, limit: 10, threshold: 0.3 })
      );
      complexSamples.push(durationMs);
    }

    const complexPercentiles = calculatePercentiles(complexSamples);
    results.push({
      name: "Complex NL Search (P95)",
      category: "Search Latency",
      target: TARGETS.RETRIEVAL_TIME,
      actual: complexPercentiles.p95,
      unit: "ms",
      passed: complexPercentiles.p95 < TARGETS.RETRIEVAL_TIME,
      samples: complexSamples,
      percentiles: complexPercentiles,
    });

    // Test 3: Cached embedding performance
    const cacheSamples: number[] = [];
    const cacheTestQuery = "cardiac arrest cache test benchmark";
    await generateEmbedding(cacheTestQuery); // Prime cache

    for (let i = 0; i < 10; i++) {
      const { durationMs } = await measureExecution(() => generateEmbedding(cacheTestQuery));
      cacheSamples.push(durationMs);
    }

    const cachePercentiles = calculatePercentiles(cacheSamples);
    results.push({
      name: "Embedding Cache Hit",
      category: "Cache Performance",
      target: TARGETS.EMBEDDING_CACHED,
      actual: cachePercentiles.p50,
      unit: "ms",
      passed: cachePercentiles.p50 < TARGETS.EMBEDDING_CACHED,
      samples: cacheSamples,
      percentiles: cachePercentiles,
    });
  } catch (error) {
    console.error("Search benchmark error:", error);
    results.push({
      name: "Search Benchmark",
      category: "Search Latency",
      target: TARGETS.RETRIEVAL_TIME,
      actual: -1,
      unit: "ms",
      passed: false,
    });
  }

  return results;
}

async function benchmarkStartup(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  try {
    // Cold start - measure module loading
    const coldStart = performance.now();

    await import("../server/db");
    await import("../server/_core/embeddings");
    await import("../server/routers");

    const coldDuration = performance.now() - coldStart;

    results.push({
      name: "Cold Start (Module Load)",
      category: "Startup",
      target: TARGETS.COLD_START,
      actual: coldDuration,
      unit: "ms",
      passed: coldDuration < TARGETS.COLD_START,
    });

    // Warm start - modules already cached
    const warmSamples: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await import("../server/db");
      await import("../server/_core/embeddings");
      await import("../server/routers");
      warmSamples.push(performance.now() - start);
    }

    const warmAvg = warmSamples.reduce((a, b) => a + b, 0) / warmSamples.length;
    results.push({
      name: "Warm Start (Cached)",
      category: "Startup",
      target: TARGETS.WARM_START,
      actual: warmAvg,
      unit: "ms",
      passed: warmAvg < TARGETS.WARM_START,
      samples: warmSamples,
    });
  } catch (error) {
    console.error("Startup benchmark error:", error);
    results.push({
      name: "Startup Benchmark",
      category: "Startup",
      target: TARGETS.COLD_START,
      actual: -1,
      unit: "ms",
      passed: false,
    });
  }

  return results;
}

async function benchmarkMemory(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  // Force GC if available
  if (global.gc) {
    global.gc();
  }

  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const rssMB = memUsage.rss / 1024 / 1024;

  results.push({
    name: "Heap Used (Idle)",
    category: "Memory",
    target: TARGETS.MEMORY_IDLE_MB,
    actual: heapUsedMB,
    unit: "MB",
    passed: heapUsedMB < TARGETS.MEMORY_IDLE_MB,
  });

  results.push({
    name: "RSS Memory",
    category: "Memory",
    target: TARGETS.MEMORY_ACTIVE_MB,
    actual: rssMB,
    unit: "MB",
    passed: rssMB < TARGETS.MEMORY_ACTIVE_MB,
  });

  // Measure memory during search activity
  try {
    const { semanticSearchProtocols, embeddingCache } = await import("../server/_core/embeddings");

    // Run several searches to simulate active usage
    for (let i = 0; i < 10; i++) {
      await semanticSearchProtocols({
        query: `test query ${i} cardiac arrest stroke`,
        limit: 10,
        threshold: 0.3,
      });
    }

    const activeMemUsage = process.memoryUsage();
    const activeHeapMB = activeMemUsage.heapUsed / 1024 / 1024;

    results.push({
      name: "Heap Used (Active Search)",
      category: "Memory",
      target: TARGETS.MEMORY_ACTIVE_MB,
      actual: activeHeapMB,
      unit: "MB",
      passed: activeHeapMB < TARGETS.MEMORY_ACTIVE_MB,
    });

    // Cache stats
    const cacheStats = embeddingCache.getStats();
    results.push({
      name: "Embedding Cache Entries",
      category: "Cache",
      target: 1000, // Max cache size
      actual: cacheStats.size,
      unit: "entries",
      passed: cacheStats.size <= cacheStats.maxSize,
    });
  } catch (error) {
    console.error("Memory benchmark error:", error);
  }

  return results;
}

async function benchmarkDatabase(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  try {
    const { getProtocolStats } = await import("../server/db");

    // Test database query performance
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      const { durationMs } = await measureExecution(() => getProtocolStats());
      samples.push(durationMs);
    }

    const percentiles = calculatePercentiles(samples);
    results.push({
      name: "DB Stats Query",
      category: "Database",
      target: 500,
      actual: percentiles.p50,
      unit: "ms",
      passed: percentiles.p50 < 500,
      samples,
      percentiles,
    });
  } catch (error) {
    console.error("Database benchmark error:", error);
    results.push({
      name: "Database Benchmark",
      category: "Database",
      target: 500,
      actual: -1,
      unit: "ms",
      passed: false,
    });
  }

  return results;
}

function generateRecommendations(results: BenchmarkResult[]): string[] {
  const recommendations: string[] = [];

  const failedResults = results.filter((r) => !r.passed);

  for (const result of failedResults) {
    if (result.name.includes("Search") && result.actual > TARGETS.RETRIEVAL_TIME) {
      recommendations.push(
        `Search latency (${result.actual.toFixed(0)}ms) exceeds 2.3s target. Consider:
   - Adding pgvector index optimization
   - Implementing search result caching
   - Pre-warming embedding cache for common queries`
      );
    }

    if (result.name.includes("Cold Start") && result.actual > TARGETS.COLD_START) {
      recommendations.push(
        `Cold start time (${result.actual.toFixed(0)}ms) is slow. Consider:
   - Lazy loading non-critical modules
   - Database connection pooling
   - Code splitting for server bundle`
      );
    }

    if (result.name.includes("Memory") && result.actual > TARGETS.MEMORY_ACTIVE_MB) {
      recommendations.push(
        `Memory usage (${result.actual.toFixed(0)}MB) is high. Consider:
   - Reducing embedding cache size
   - Implementing result pagination
   - Adding memory leak detection`
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("All benchmarks passed! Performance is within acceptable thresholds.");
  }

  return recommendations;
}

function printReport(report: BenchmarkReport): void {
  console.log("\n" + "=".repeat(70));
  console.log("           PROTOCOL GUIDE PERFORMANCE BENCHMARK REPORT");
  console.log("=".repeat(70));
  console.log(`\nTimestamp: ${report.timestamp}`);
  console.log(`Node.js:   ${report.environment.nodeVersion}`);
  console.log(`Platform:  ${report.environment.platform} (${report.environment.arch})`);

  console.log("\n" + "-".repeat(70));
  console.log("                              SUMMARY");
  console.log("-".repeat(70));
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`Passed:      ${report.summary.passed} (${report.summary.passRate})`);
  console.log(`Failed:      ${report.summary.failed}`);

  console.log("\n" + "-".repeat(70));
  console.log("                              RESULTS");
  console.log("-".repeat(70));
  console.log(
    `${"Test".padEnd(35)} ${"Actual".padStart(12)} ${"Target".padStart(12)} ${"Status".padStart(8)}`
  );
  console.log("-".repeat(70));

  // Group by category
  const categories = [...new Set(report.results.map((r) => r.category))];

  for (const category of categories) {
    console.log(`\n[${category}]`);
    const categoryResults = report.results.filter((r) => r.category === category);

    for (const result of categoryResults) {
      const actualStr =
        result.actual >= 0 ? `${result.actual.toFixed(result.unit === "ms" ? 0 : 2)} ${result.unit}` : "ERROR";
      const targetStr = `${result.target} ${result.unit}`;
      const statusStr = result.passed ? "PASS" : "FAIL";
      const statusColor = result.passed ? "\x1b[32m" : "\x1b[31m";

      console.log(
        `  ${result.name.padEnd(33)} ${actualStr.padStart(12)} ${targetStr.padStart(12)} ${statusColor}${statusStr.padStart(8)}\x1b[0m`
      );

      // Print percentiles if available
      if (result.percentiles) {
        console.log(
          `    ${"".padEnd(33)} P50: ${result.percentiles.p50.toFixed(0)}ms  P95: ${result.percentiles.p95.toFixed(0)}ms  P99: ${result.percentiles.p99.toFixed(0)}ms`
        );
      }
    }
  }

  console.log("\n" + "-".repeat(70));
  console.log("                          RECOMMENDATIONS");
  console.log("-".repeat(70));
  for (const rec of report.recommendations) {
    console.log(`\n${rec}`);
  }

  console.log("\n" + "=".repeat(70));
  console.log(`                    Target: 2.3s protocol retrieval`);
  console.log("=".repeat(70) + "\n");
}

async function runBenchmarks(): Promise<BenchmarkReport> {
  console.log("\nStarting Protocol Guide Performance Benchmarks...\n");

  const allResults: BenchmarkResult[] = [];

  // Run all benchmark suites
  console.log("Running startup benchmarks...");
  allResults.push(...(await benchmarkStartup()));

  console.log("Running search latency benchmarks...");
  allResults.push(...(await benchmarkSemanticSearch()));

  console.log("Running memory benchmarks...");
  allResults.push(...(await benchmarkMemory()));

  console.log("Running database benchmarks...");
  allResults.push(...(await benchmarkDatabase()));

  // Generate report
  const passed = allResults.filter((r) => r.passed).length;
  const failed = allResults.filter((r) => !r.passed).length;

  const report: BenchmarkReport = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    summary: {
      total: allResults.length,
      passed,
      failed,
      passRate: `${((passed / allResults.length) * 100).toFixed(1)}%`,
    },
    results: allResults,
    recommendations: generateRecommendations(allResults),
  };

  return report;
}

// Main execution
const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");

runBenchmarks()
  .then((report) => {
    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    // Exit with error code if any benchmarks failed critical thresholds
    const criticalFailures = report.results.filter(
      (r) => !r.passed && r.name.includes("Search") && r.actual > TARGETS.RETRIEVAL_TIME * 1.5
    );

    if (criticalFailures.length > 0) {
      console.error("\nCRITICAL: Search latency exceeds 3.45s (150% of 2.3s target)");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Benchmark failed:", error);
    process.exit(1);
  });
