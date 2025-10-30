/**
 * ProtocolCacheService provides in-memory caching for protocol matches.
 * Reduces redundant protocol searches and improves response latency.
 * Target: 60%+ cache hit rate
 */

import crypto from "crypto";
import { createLogger } from "@/lib/log";
import { metrics } from "@/lib/managers/metrics-manager";
import type { ProtocolSearchResult } from "./protocol-retrieval-service";

type CacheEntry = {
  result: ProtocolSearchResult;
  expiresAt: number;
  hitCount: number;
};

export class ProtocolCacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly logger = createLogger("ProtocolCacheService");
  private readonly defaultTtlMs = 60 * 60 * 1000; // 1 hour

  /**
   * Generate cache key from search parameters
   */
  private generateCacheKey(
    method: string,
    params: Record<string, unknown>,
  ): string {
    // Sort params for consistent keys
    const sorted = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join("|");

    const input = `${method}|${sorted}`;
    return crypto.createHash("sha256").update(input).digest("hex").substring(0, 32);
  }

  /**
   * Get cached result if available and not expired
   */
  public get(
    method: string,
    params: Record<string, unknown>,
  ): ProtocolSearchResult | null {
    const key = this.generateCacheKey(method, params);
    const entry = this.cache.get(key);

    if (!entry) {
      metrics.inc("protocol.cache.miss");
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      metrics.inc("protocol.cache.expired");
      return null;
    }

    // Cache hit
    entry.hitCount += 1;
    metrics.inc("protocol.cache.hit");
    metrics.observe("protocol.cache.hit_count", entry.hitCount);

    this.logger.debug("Cache hit", {
      method,
      key: key.substring(0, 8),
      hitCount: entry.hitCount,
    });

    return entry.result;
  }

  /**
   * Store result in cache
   */
  public set(
    method: string,
    params: Record<string, unknown>,
    result: ProtocolSearchResult,
    ttlMs?: number,
  ): void {
    const key = this.generateCacheKey(method, params);
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);

    this.cache.set(key, {
      result,
      expiresAt,
      hitCount: 0,
    });

    metrics.inc("protocol.cache.set");
    this.logger.debug("Cache set", {
      method,
      key: key.substring(0, 8),
      expiresAt: new Date(expiresAt).toISOString(),
    });

    // Periodic cleanup to prevent memory leaks
    if (this.cache.size % 100 === 0) {
      this.cleanup();
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed += 1;
      }
    }

    if (removed > 0) {
      this.logger.debug("Cache cleanup", { removed, remaining: this.cache.size });
      metrics.inc("protocol.cache.cleanup", removed);
    }
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info("Cache cleared", { entriesRemoved: size });
    metrics.inc("protocol.cache.clear");
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    size: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    const hits = metrics.snapshot().counters.find((c) => c.name === "protocol.cache.hit")?.count ?? 0;
    const misses = metrics.snapshot().counters.find((c) => c.name === "protocol.cache.miss")?.count ?? 0;
    const total = hits + misses;
    const hitRate = total > 0 ? hits / total : 0;

    return {
      size: this.cache.size,
      hitRate,
      totalHits: hits,
      totalMisses: misses,
    };
  }
}

// Singleton instance
export const protocolCache = new ProtocolCacheService();

