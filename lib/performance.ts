/**
 * Performance Monitoring Utilities
 *
 * Tracks key performance metrics for EMS field use:
 * - Search response times (target: <500ms)
 * - Cache hit rates
 * - Network latency
 * - Offline fallback usage
 */

import { Platform } from "react-native";

// Performance thresholds (milliseconds)
export const PERF_THRESHOLDS = {
  search: {
    excellent: 200,
    good: 500,
    acceptable: 1000,
    slow: 2000,
  },
  render: {
    excellent: 16, // 60fps
    good: 33, // 30fps
    acceptable: 100,
    slow: 250,
  },
  ttfb: {
    excellent: 100,
    good: 300,
    acceptable: 800,
    slow: 1500,
  },
} as const;

// Metrics storage
interface PerformanceMetrics {
  searchLatency: number[];
  cacheHits: number;
  cacheMisses: number;
  offlineFallbacks: number;
  errors: number;
  sessionStart: number;
}

const metrics: PerformanceMetrics = {
  searchLatency: [],
  cacheHits: 0,
  cacheMisses: 0,
  offlineFallbacks: 0,
  errors: 0,
  sessionStart: Date.now(),
};

/**
 * Performance timer for measuring operation duration
 */
export class PerfTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  stop(): number {
    const duration = performance.now() - this.startTime;
    if (__DEV__) {
      console.log(`[Perf] ${this.name}: ${duration.toFixed(2)}ms`);
    }
    return duration;
  }

  stopAndRecord(category: "search" | "render"): number {
    const duration = this.stop();
    if (category === "search") {
      recordSearchLatency(duration);
    }
    return duration;
  }
}

/**
 * Record search latency
 */
export function recordSearchLatency(ms: number): void {
  metrics.searchLatency.push(ms);
  // Keep only last 100 measurements
  if (metrics.searchLatency.length > 100) {
    metrics.searchLatency.shift();
  }
}

/**
 * Record cache hit/miss
 */
export function recordCacheResult(hit: boolean): void {
  if (hit) {
    metrics.cacheHits++;
  } else {
    metrics.cacheMisses++;
  }
}

/**
 * Record offline fallback
 */
export function recordOfflineFallback(): void {
  metrics.offlineFallbacks++;
}

/**
 * Record error
 */
export function recordError(): void {
  metrics.errors++;
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  const { searchLatency, cacheHits, cacheMisses, offlineFallbacks, errors, sessionStart } =
    metrics;

  const totalCacheRequests = cacheHits + cacheMisses;
  const cacheHitRate = totalCacheRequests > 0 ? cacheHits / totalCacheRequests : 0;

  const avgLatency =
    searchLatency.length > 0
      ? searchLatency.reduce((a, b) => a + b, 0) / searchLatency.length
      : 0;

  const p95Latency =
    searchLatency.length > 0
      ? searchLatency.sort((a, b) => a - b)[Math.floor(searchLatency.length * 0.95)]
      : 0;

  const p50Latency =
    searchLatency.length > 0
      ? searchLatency.sort((a, b) => a - b)[Math.floor(searchLatency.length * 0.5)]
      : 0;

  const sessionDuration = Date.now() - sessionStart;

  return {
    searchLatency: {
      avg: Math.round(avgLatency),
      p50: Math.round(p50Latency),
      p95: Math.round(p95Latency),
      samples: searchLatency.length,
    },
    cache: {
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: Math.round(cacheHitRate * 100),
    },
    reliability: {
      offlineFallbacks,
      errors,
    },
    session: {
      durationMs: sessionDuration,
      durationFormatted: formatDuration(sessionDuration),
    },
  };
}

/**
 * Get performance rating based on thresholds
 */
export function getPerformanceRating(
  ms: number,
  category: keyof typeof PERF_THRESHOLDS = "search"
): "excellent" | "good" | "acceptable" | "slow" | "critical" {
  const thresholds = PERF_THRESHOLDS[category];

  if (ms <= thresholds.excellent) return "excellent";
  if (ms <= thresholds.good) return "good";
  if (ms <= thresholds.acceptable) return "acceptable";
  if (ms <= thresholds.slow) return "slow";
  return "critical";
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Log performance report (for debugging)
 */
export function logPerformanceReport(): void {
  if (!__DEV__) return;

  const stats = getPerformanceStats();
  console.log("\n=== Performance Report ===");
  console.log(`Session Duration: ${stats.session.durationFormatted}`);
  console.log(`\nSearch Latency:`);
  console.log(`  Average: ${stats.searchLatency.avg}ms`);
  console.log(`  P50: ${stats.searchLatency.p50}ms`);
  console.log(`  P95: ${stats.searchLatency.p95}ms`);
  console.log(`  Samples: ${stats.searchLatency.samples}`);
  console.log(`\nCache Performance:`);
  console.log(`  Hit Rate: ${stats.cache.hitRate}%`);
  console.log(`  Hits: ${stats.cache.hits}, Misses: ${stats.cache.misses}`);
  console.log(`\nReliability:`);
  console.log(`  Offline Fallbacks: ${stats.reliability.offlineFallbacks}`);
  console.log(`  Errors: ${stats.reliability.errors}`);
  console.log("========================\n");
}

/**
 * Network quality detection
 */
export async function getNetworkQuality(): Promise<"fast" | "slow" | "offline"> {
  if (Platform.OS === "web") {
    // Use Navigation Timing API on web
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.downlink < 1) return "slow";
      if (connection.downlink > 5) return "fast";
    }
  }

  // Fallback: measure actual latency
  try {
    const start = performance.now();
    const response = await fetch("/api/health", {
      method: "HEAD",
      cache: "no-store",
    });
    const latency = performance.now() - start;

    if (!response.ok) return "slow";
    if (latency < 100) return "fast";
    if (latency < 500) return "slow";
    return "slow";
  } catch {
    return "offline";
  }
}

/**
 * Reset metrics (useful for testing)
 */
export function resetMetrics(): void {
  metrics.searchLatency = [];
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  metrics.offlineFallbacks = 0;
  metrics.errors = 0;
  metrics.sessionStart = Date.now();
}
