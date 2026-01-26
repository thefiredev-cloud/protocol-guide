/**
 * Latency Monitoring for RAG Pipeline
 * Separated to avoid circular dependencies
 */

import { RAG_CONFIG } from './config';

interface LatencyMetric {
  operation: string;
  durationMs: number;
  timestamp: number;
}

/**
 * Latency monitor for adaptive optimization
 */
class LatencyMonitor {
  private metrics: LatencyMetric[] = [];
  private readonly maxMetrics = 1000;

  /**
   * Record a latency metric
   */
  record(operation: string, durationMs: number): void {
    this.metrics.push({
      operation,
      durationMs,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get average latency for an operation
   */
  getAverage(operation: string, windowMs: number = 60000): number {
    const cutoff = Date.now() - windowMs;
    const relevant = this.metrics.filter(
      m => m.operation === operation && m.timestamp > cutoff
    );

    if (relevant.length === 0) {
      return 0;
    }

    const sum = relevant.reduce((acc, m) => acc + m.durationMs, 0);
    return sum / relevant.length;
  }

  /**
   * Get P95 latency for an operation
   */
  getP95(operation: string, windowMs: number = 60000): number {
    const cutoff = Date.now() - windowMs;
    const relevant = this.metrics
      .filter(m => m.operation === operation && m.timestamp > cutoff)
      .map(m => m.durationMs)
      .sort((a, b) => a - b);

    if (relevant.length === 0) {
      return 0;
    }

    const idx = Math.floor(relevant.length * 0.95);
    return relevant[idx];
  }

  /**
   * Check if we're meeting latency targets
   */
  isHealthy(): boolean {
    const embeddingP95 = this.getP95('embedding');
    const searchP95 = this.getP95('vectorSearch');
    const totalP95 = this.getP95('totalRetrieval');

    return (
      embeddingP95 < RAG_CONFIG.latency.embedding * 1.5 &&
      searchP95 < RAG_CONFIG.latency.vectorSearch * 1.5 &&
      totalP95 < RAG_CONFIG.latency.target * 1.2
    );
  }

  /**
   * Get health report
   */
  getHealthReport(): Record<string, unknown> {
    return {
      embedding: {
        avgMs: Math.round(this.getAverage('embedding')),
        p95Ms: Math.round(this.getP95('embedding')),
        targetMs: RAG_CONFIG.latency.embedding,
      },
      vectorSearch: {
        avgMs: Math.round(this.getAverage('vectorSearch')),
        p95Ms: Math.round(this.getP95('vectorSearch')),
        targetMs: RAG_CONFIG.latency.vectorSearch,
      },
      totalRetrieval: {
        avgMs: Math.round(this.getAverage('totalRetrieval')),
        p95Ms: Math.round(this.getP95('totalRetrieval')),
        targetMs: RAG_CONFIG.latency.target,
      },
      isHealthy: this.isHealthy(),
    };
  }
}

// Global latency monitor
export const latencyMonitor = new LatencyMonitor();
