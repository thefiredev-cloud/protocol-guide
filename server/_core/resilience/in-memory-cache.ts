/**
 * Protocol Guide - In-Memory Cache with LRU Eviction
 *
 * Fallback cache when Redis is unavailable.
 * Features:
 * - LRU (Least Recently Used) eviction policy
 * - TTL support for automatic expiration
 * - Memory-bounded with configurable max entries
 * - Thread-safe for Node.js event loop
 */

import { logger } from '../logger';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
  createdAt: number;
  accessedAt: number;
}

export interface InMemoryCacheConfig {
  /** Maximum number of entries (default: 1000) */
  maxEntries?: number;
  /** Default TTL in milliseconds (default: 5 minutes) */
  defaultTtlMs?: number;
  /** Name for logging */
  name?: string;
  /** Callback when evicting entries */
  onEvict?: (key: string, reason: 'expired' | 'lru' | 'manual') => void;
}

export interface CacheStats {
  entries: number;
  maxEntries: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsageBytes: number;
}

/**
 * In-Memory LRU Cache
 */
export class InMemoryCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;
  private readonly name: string;
  private readonly onEvict?: InMemoryCacheConfig['onEvict'];

  // Metrics
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(config: InMemoryCacheConfig = {}) {
    this.maxEntries = config.maxEntries ?? 1000;
    this.defaultTtlMs = config.defaultTtlMs ?? 5 * 60 * 1000; // 5 minutes
    this.name = config.name ?? 'in-memory-cache';
    this.onEvict = config.onEvict;

    // Periodic cleanup of expired entries (every minute)
    setInterval(() => this.cleanupExpired(), 60000).unref();
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key, 'expired');
      this.misses++;
      return null;
    }

    // Update access time for LRU
    entry.accessedAt = Date.now();
    this.hits++;

    return entry.value;
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttlMs?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    const now = Date.now();
    const effectiveTtl = ttlMs ?? this.defaultTtlMs;

    this.cache.set(key, {
      value,
      expiresAt: effectiveTtl > 0 ? now + effectiveTtl : null,
      createdAt: now,
      accessedAt: now,
    });
  }

  /**
   * Check if key exists (without updating access time)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key, 'expired');
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string, reason: 'expired' | 'lru' | 'manual' = 'manual'): boolean {
    const existed = this.cache.delete(key);
    if (existed) {
      this.evictions++;
      this.onEvict?.(key, reason);
    }
    return existed;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info({ cache: this.name, cleared: size }, 'Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      entries: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? Math.round((this.hits / total) * 100) / 100 : 0,
      evictions: this.evictions,
      memoryUsageBytes: this.estimateMemoryUsage(),
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Get all keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get entry count
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey, 'lru');
    }
  }

  /**
   * Remove all expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.delete(key, 'expired');
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(
        { cache: this.name, cleaned, remaining: this.cache.size },
        'Cache cleanup completed'
      );
    }
  }

  /**
   * Estimate memory usage (rough approximation)
   */
  private estimateMemoryUsage(): number {
    let total = 0;
    for (const [key, entry] of this.cache) {
      // Key size (rough: 2 bytes per char)
      total += key.length * 2;
      // Entry metadata (~48 bytes)
      total += 48;
      // Value size (estimate based on JSON serialization)
      try {
        total += JSON.stringify(entry.value).length * 2;
      } catch {
        total += 1024; // Fallback estimate
      }
    }
    return total;
  }
}

// ============================================================================
// Singleton Caches for Different Use Cases
// ============================================================================

/** Search results cache - larger, shorter TTL */
export const searchCache = new InMemoryCache({
  name: 'search-fallback',
  maxEntries: 500,
  defaultTtlMs: 5 * 60 * 1000, // 5 minutes
  onEvict: (key, reason) => {
    if (reason === 'lru') {
      logger.debug({ key, reason }, 'Search cache eviction');
    }
  },
});

/** AI response cache - smaller, longer TTL */
export const aiResponseCache = new InMemoryCache({
  name: 'ai-response-fallback',
  maxEntries: 200,
  defaultTtlMs: 30 * 60 * 1000, // 30 minutes
  onEvict: (key, reason) => {
    if (reason === 'lru') {
      logger.debug({ key, reason }, 'AI response cache eviction');
    }
  },
});

/** Rate limit cache - many entries, short TTL */
export const rateLimitCache = new InMemoryCache<number>({
  name: 'rate-limit-fallback',
  maxEntries: 10000,
  defaultTtlMs: 60 * 1000, // 1 minute
});

/** General purpose cache */
export const generalCache = new InMemoryCache({
  name: 'general-fallback',
  maxEntries: 1000,
  defaultTtlMs: 10 * 60 * 1000, // 10 minutes
});
