type Counter = { count: number };
type Histogram = { sum: number; count: number; min: number; max: number };

class MetricsRegistry {
  public readonly counters = new Map<string, Counter>();
  public readonly histograms = new Map<string, Histogram>();

  inc(name: string, value = 1): void {
    const c = this.counters.get(name) ?? { count: 0 };
    c.count += value;
    this.counters.set(name, c);
  }

  observe(name: string, value: number): void {
    const h = this.histograms.get(name) ?? { sum: 0, count: 0, min: Number.POSITIVE_INFINITY, max: 0 };
    h.sum += value;
    h.count += 1;
    h.min = Math.min(h.min, value);
    h.max = Math.max(h.max, value);
    this.histograms.set(name, h);
  }

  snapshot() {
    const counters = Array.from(this.counters.entries()).map(([name, { count }]) => ({ name, count }));
    const histograms = Array.from(this.histograms.entries()).map(([name, h]) => ({
      name,
      count: h.count,
      p50: h.count ? h.sum / h.count : 0,
      min: h.count ? h.min : 0,
      max: h.count ? h.max : 0,
    }));
    return { counters, histograms, ts: Date.now() };
  }
}

export const metrics = new MetricsRegistry();


