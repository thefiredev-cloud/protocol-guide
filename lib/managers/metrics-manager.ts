type Counter = { count: number };
type Histogram = { sum: number; count: number; min: number; max: number; values: number[] };

interface MetricSnapshot {
  counters: Array<{ name: string; count: number }>;
  histograms: Array<{
    name: string;
    count: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  }>;
  ts: number;
}

interface HistoricalMetric {
  date: string;
  metric_type: string;
  count: number;
  p50?: number;
  p95?: number;
  p99?: number;
  min?: number;
  max?: number;
}

class MetricsRegistry {
  public readonly counters = new Map<string, Counter>();
  public readonly histograms = new Map<string, Histogram>();
  private readonly maxHistogramValues = 1000; // Limit memory usage
  private historicalMetrics: HistoricalMetric[] = [];

  inc(name: string, value = 1): void {
    const c = this.counters.get(name) ?? { count: 0 };
    c.count += value;
    this.counters.set(name, c);
  }

  observe(name: string, value: number): void {
    const h = this.histograms.get(name) ?? {
      sum: 0,
      count: 0,
      min: Number.POSITIVE_INFINITY,
      max: 0,
      values: []
    };
    h.sum += value;
    h.count += 1;
    h.min = Math.min(h.min, value);
    h.max = Math.max(h.max, value);

    // Store values for percentile calculations, but limit memory
    if (h.values.length < this.maxHistogramValues) {
      h.values.push(value);
    } else {
      // Reservoir sampling to maintain representative sample
      const randomIndex = Math.floor(Math.random() * h.count);
      if (randomIndex < this.maxHistogramValues) {
        h.values[randomIndex] = value;
      }
    }

    this.histograms.set(name, h);
  }

  snapshot(): MetricSnapshot {
    const counters = Array.from(this.counters.entries()).map(([name, { count }]) => ({ name, count }));
    const histograms = Array.from(this.histograms.entries()).map(([name, h]) => {
      const percentiles = this.calculatePercentiles(h.values);
      return {
        name,
        count: h.count,
        p50: percentiles.p50,
        p95: percentiles.p95,
        p99: percentiles.p99,
        min: h.count ? h.min : 0,
        max: h.count ? h.max : 0,
      };
    });
    return { counters, histograms, ts: Date.now() };
  }

  private calculatePercentiles(values: number[]): { p50: number; p95: number; p99: number } {
    if (values.length === 0) return { p50: 0, p95: 0, p99: 0 };

    const sorted = [...values].sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)] ?? 0;
    };

    return {
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99),
    };
  }

  /**
   * Flush current metrics to persistent storage
   * In-memory implementation - override with database storage in production
   */
  async flushMetrics(): Promise<void> {
    const snapshot = this.snapshot();
    const date = new Date().toISOString().split('T')[0];

    // Store counters
    for (const counter of snapshot.counters) {
      this.historicalMetrics.push({
        date,
        metric_type: counter.name,
        count: counter.count,
      });
    }

    // Store histograms with percentiles
    for (const histogram of snapshot.histograms) {
      this.historicalMetrics.push({
        date,
        metric_type: histogram.name,
        count: histogram.count,
        p50: histogram.p50,
        p95: histogram.p95,
        p99: histogram.p99,
        min: histogram.min,
        max: histogram.max,
      });
    }

    // Keep only last 30 days of historical data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.historicalMetrics = this.historicalMetrics.filter(m => m.date >= thirtyDaysAgo);

    // Reset in-memory counters after flush
    this.counters.clear();
    this.histograms.clear();
  }

  /**
   * Get historical metrics for a date range
   */
  async getMetrics(startDate: string, endDate: string): Promise<HistoricalMetric[]> {
    return this.historicalMetrics.filter(
      m => m.date >= startDate && m.date <= endDate
    );
  }

  /**
   * Get aggregated metrics summary
   */
  async getSummary(days = 7): Promise<Record<string, unknown>> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const historical = await this.getMetrics(startDate, endDate);

    const summary: Record<string, unknown> = {
      period: { startDate, endDate, days },
      totals: {},
      averages: {},
    };

    // Aggregate by metric type
    const metricGroups = new Map<string, HistoricalMetric[]>();
    for (const metric of historical) {
      const existing = metricGroups.get(metric.metric_type) ?? [];
      existing.push(metric);
      metricGroups.set(metric.metric_type, existing);
    }

    // Calculate totals and averages
    for (const [metricType, metrics] of metricGroups) {
      const total = metrics.reduce((sum, m) => sum + m.count, 0);
      const avg = total / Math.max(metrics.length, 1);

      (summary.totals as Record<string, number>)[metricType] = total;
      (summary.averages as Record<string, number>)[metricType] = avg;
    }

    return summary;
  }

  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
    this.historicalMetrics = [];
  }
}

export const metrics = new MetricsRegistry();


