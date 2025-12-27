/**
 * LRU Cache with TTL support
 * Uses native Map which maintains insertion order in ES6+
 * O(1) get/set operations with automatic LRU eviction
 */

export interface CacheConfig {
  /** Maximum number of entries in cache */
  maxSize: number;
  /** Time-to-live in milliseconds */
  ttlMs: number;
  /** Optional callback when entry is evicted */
  onEvict?: (key: string, value: unknown) => void;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hitCount: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private readonly onEvict?: (key: string, value: unknown) => void;

  // Stats tracking
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.maxSize = config.maxSize;
    this.ttlMs = config.ttlMs;
    this.onEvict = config.onEvict;
  }

  /**
   * Get a value from cache
   * Returns null if not found or expired
   * Moves entry to end of Map for LRU tracking
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Move to end for LRU (delete and re-insert)
    this.cache.delete(key);
    entry.hitCount++;
    this.cache.set(key, entry);
    this.hits++;

    return entry.value;
  }

  /**
   * Set a value in cache
   * Evicts oldest entries if at capacity
   */
  set(key: string, value: T, customTtlMs?: number): void {
    // If key exists, delete first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const ttl = customTtlMs ?? this.ttlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      hitCount: 0,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete an entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry && this.onEvict) {
      this.onEvict(key, entry.value);
    }
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache) {
        this.onEvict(key, entry.value);
      }
    }
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  stats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Prune expired entries
   * Called automatically on set, but can be called manually
   */
  prune(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.delete(key);
        pruned++;
      }
    }

    return pruned;
  }

  /**
   * Get all keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  private evictOldest(): void {
    // Map.keys().next() gives oldest entry (first inserted)
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey !== undefined) {
      const entry = this.cache.get(oldestKey);
      if (entry && this.onEvict) {
        this.onEvict(oldestKey, entry.value);
      }
      this.cache.delete(oldestKey);
      this.evictions++;
    }
  }
}

/**
 * Create a pre-configured cache for specific use cases
 */
export function createEmbeddingCache(): LRUCache<number[]> {
  return new LRUCache({
    maxSize: 500,                    // ~500 queries * 1536 floats * 4 bytes = ~3MB
    ttlMs: 4 * 60 * 60 * 1000,       // 4 hours
  });
}

export function createExpansionCache(): LRUCache<string[]> {
  return new LRUCache({
    maxSize: 1000,                   // 1000 unique query expansions
    ttlMs: 24 * 60 * 60 * 1000,      // 24 hours - expansions rarely change
  });
}

export function createRerankCache(): LRUCache<string[]> {
  return new LRUCache({
    maxSize: 500,                    // 500 ranked result sets
    ttlMs: 2 * 60 * 60 * 1000,       // 2 hours
  });
}

export function createProtocolCache<T>(): LRUCache<T> {
  return new LRUCache({
    maxSize: 1000,                   // 1000 protocol search results
    ttlMs: 60 * 60 * 1000,           // 1 hour
  });
}
