/**
 * Search Cache Tests
 *
 * Tests for Redis search result caching:
 * - Cache hit returns same results
 * - Cache miss triggers search
 * - TTL expiration
 * - Cache key generation
 * - Performance improvements
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Use vi.hoisted to declare mock store and availability flag before mocks are hoisted
const { mockRedisStore, mockState } = vi.hoisted(() => {
  return {
    mockRedisStore: new Map<string, { value: string; expiresAt: number }>(),
    mockState: { redisAvailable: true },
  };
});

// Mock the redis module before importing search-cache
vi.mock("../server/_core/redis", () => ({
  isRedisAvailable: () => mockState.redisAvailable,
  getRedis: () => mockState.redisAvailable ? {
    get: async <T>(key: string): Promise<T | null> => {
      const entry = mockRedisStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        mockRedisStore.delete(key);
        return null;
      }
      return entry.value as T;
    },
    setex: async (key: string, ttl: number, value: string) => {
      mockRedisStore.set(key, {
        value,
        expiresAt: Date.now() + ttl * 1000,
      });
      return "OK";
    },
    del: async (...keys: string[]) => {
      keys.forEach(key => mockRedisStore.delete(key));
      return keys.length;
    },
    scan: async (cursor: number, options: { match: string; count: number }) => {
      const prefix = options.match.replace("*", "");
      const keys = Array.from(mockRedisStore.keys()).filter(key =>
        key.startsWith(prefix)
      );
      return [0, keys]; // Return all keys in one scan
    },
  } : null,
}));

// Mock logger to suppress console output during tests
vi.mock("../server/_core/logger", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import after mocking
import {
  getSearchCacheKey,
  getCachedSearchResults,
  cacheSearchResults,
  invalidateSearchCache,
  invalidateAllSearchCache,
  getSearchCacheStats,
  resetSearchCacheStats,
  getSearchCacheHeaders,
  setSearchCacheHeaders,
  CACHE_TTL,
  CACHE_HEADER_MAX_AGE,
  CACHE_HEADER_STALE_WHILE_REVALIDATE,
  type SearchCacheParams,
  type CachedSearchResult,
} from "../server/_core/search-cache";

// Mock search results
const mockSearchResults: CachedSearchResult = {
  results: [
    {
      id: 1,
      protocolNumber: "C-101",
      protocolTitle: "Cardiac Arrest",
      section: "Cardiac Protocols",
      content: "Begin CPR immediately...",
      fullContent: "Full cardiac arrest protocol content...",
      sourcePdfUrl: "https://test.com/protocols.pdf",
      relevanceScore: 0.95,
      countyId: 1,
      protocolEffectiveDate: "2024-01-01",
      lastVerifiedAt: "2024-01-15",
      protocolYear: 2024,
    },
    {
      id: 2,
      protocolNumber: "C-102",
      protocolTitle: "ROSC Care",
      section: "Cardiac Protocols",
      content: "Post-resuscitation care...",
      fullContent: "Full ROSC protocol content...",
      sourcePdfUrl: "https://test.com/protocols.pdf",
      relevanceScore: 0.88,
      countyId: 1,
      protocolEffectiveDate: "2024-01-01",
      lastVerifiedAt: "2024-01-15",
      protocolYear: 2024,
    },
  ],
  totalFound: 2,
  query: "cardiac arrest protocol",
  cachedAt: Date.now(),
};

describe("Search Cache", () => {
  beforeEach(() => {
    mockRedisStore.clear();
    mockState.redisAvailable = true;
    vi.clearAllMocks();
    resetSearchCacheStats();
  });

  afterEach(() => {
    mockRedisStore.clear();
  });

  describe("Cache Key Generation", () => {
    it("should generate consistent keys for same parameters", () => {
      const params: SearchCacheParams = {
        query: "cardiac arrest",
        agencyId: 1,
        stateCode: "CA",
        limit: 10,
      };

      const key1 = getSearchCacheKey(params);
      const key2 = getSearchCacheKey(params);

      expect(key1).toBe(key2);
      expect(key1).toContain("search:");
    });

    it("should generate different keys for different queries", () => {
      const params1: SearchCacheParams = {
        query: "cardiac arrest",
        agencyId: 1,
      };

      const params2: SearchCacheParams = {
        query: "stroke protocol",
        agencyId: 1,
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).not.toBe(key2);
    });

    it("should normalize query case for consistent keys", () => {
      const params1: SearchCacheParams = {
        query: "CARDIAC ARREST",
        agencyId: 1,
      };

      const params2: SearchCacheParams = {
        query: "cardiac arrest",
        agencyId: 1,
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).toBe(key2);
    });

    it("should trim whitespace in queries", () => {
      const params1: SearchCacheParams = {
        query: "  cardiac arrest  ",
        agencyId: 1,
      };

      const params2: SearchCacheParams = {
        query: "cardiac arrest",
        agencyId: 1,
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).toBe(key2);
    });

    it("should include agency in key generation", () => {
      const params1: SearchCacheParams = {
        query: "cardiac arrest",
        agencyId: 1,
      };

      const params2: SearchCacheParams = {
        query: "cardiac arrest",
        agencyId: 2,
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).not.toBe(key2);
    });

    it("should include state code in key generation", () => {
      const params1: SearchCacheParams = {
        query: "cardiac arrest",
        stateCode: "CA",
      };

      const params2: SearchCacheParams = {
        query: "cardiac arrest",
        stateCode: "TX",
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).not.toBe(key2);
    });

    it("should normalize state codes to uppercase", () => {
      const params1: SearchCacheParams = {
        query: "cardiac arrest",
        stateCode: "ca",
      };

      const params2: SearchCacheParams = {
        query: "cardiac arrest",
        stateCode: "CA",
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).toBe(key2);
    });
  });

  describe.skip("Cache Hit Behavior", () => {
    it("should return cached results on cache hit (when Redis available)", async () => {
      const key = "search:test123";
      const cachedData: CachedSearchResult = {
        ...mockSearchResults,
        cachedAt: Date.now(),
      };

      // Manually set in mock store
      mockRedisStore.set(key, {
        value: JSON.stringify(cachedData),
        expiresAt: Date.now() + 300000,
      });

      const result = await getCachedSearchResults(key);

      expect(result).not.toBeNull();
      expect(result!.query).toBe(mockSearchResults.query);
      expect(result!.results).toHaveLength(2);
    });

    it("should return null on cache miss", async () => {
      const key = "search:nonexistent";

      const result = await getCachedSearchResults(key);

      expect(result).toBeNull();
    });

    it("should track cache statistics", async () => {
      const key = "search:test123";
      mockRedisStore.set(key, {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });

      // Hit
      await getCachedSearchResults(key);
      // Miss
      await getCachedSearchResults("search:miss");

      const stats = getSearchCacheStats();
      expect(stats).toHaveProperty("hits");
      expect(stats).toHaveProperty("misses");
      expect(stats).toHaveProperty("hitRate");
    });

    it("should calculate hit rate correctly", async () => {
      // Reset stats to ensure clean state
      resetSearchCacheStats();
      
      const key1 = "search:hitrate1";

      mockRedisStore.set(key1, {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });

      // 2 hits, 2 misses = 50% hit rate
      await getCachedSearchResults(key1); // hit
      await getCachedSearchResults(key1); // hit
      await getCachedSearchResults("search:miss1"); // miss
      await getCachedSearchResults("search:miss2"); // miss

      const stats = getSearchCacheStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe.skip("Cache Write Operations", () => {
    it("should cache search results with TTL", async () => {
      const key = "search:write123";
      const results: Omit<CachedSearchResult, "cachedAt"> = {
        results: mockSearchResults.results,
        totalFound: 2,
        query: "test query",
      };

      const success = await cacheSearchResults(key, results);

      expect(success).toBe(true);
      // Verify by reading back
      const cached = await getCachedSearchResults(key);
      expect(cached).not.toBeNull();
      expect(cached!.query).toBe("test query");
    });

    it("should add cachedAt timestamp when caching", async () => {
      const key = "search:timestamp123";
      const results: Omit<CachedSearchResult, "cachedAt"> = {
        results: mockSearchResults.results,
        totalFound: 2,
        query: "test query",
      };

      await cacheSearchResults(key, results);

      const cached = await getCachedSearchResults(key);
      expect(cached?.cachedAt).toBeTruthy();
      expect(cached?.cachedAt).toBeGreaterThan(Date.now() - 1000);
    });

    it("should serialize results as JSON", async () => {
      const key = "search:json123";
      const results: Omit<CachedSearchResult, "cachedAt"> = {
        results: mockSearchResults.results,
        totalFound: 2,
        query: "test query",
      };

      await cacheSearchResults(key, results);

      const cached = await getCachedSearchResults(key);
      expect(cached).toBeTruthy();
      expect(cached!.query).toBe("test query");
      expect(cached!.totalFound).toBe(2);
    });
  });

  describe.skip("TTL Expiration", () => {
    it("should expire cache entries after TTL", async () => {
      const key = "search:expire123";

      // Set with very short expiration
      mockRedisStore.set(key, {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 100, // 100ms
      });

      // Should exist immediately
      let result = await getCachedSearchResults(key);
      expect(result).toBeTruthy();

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired now
      result = await getCachedSearchResults(key);
      expect(result).toBeNull();
    });

    it("should use configured TTL by default", async () => {
      const key = "search:ttl123";

      await cacheSearchResults(key, {
        results: mockSearchResults.results,
        totalFound: 2,
        query: "test",
      });

      // Verify the cache entry exists and can be retrieved
      const cached = await getCachedSearchResults(key);
      expect(cached).toBeTruthy();
      expect(cached!.query).toBe("test");
      // The TTL constant should be 1 hour (3600 seconds)
      expect(CACHE_TTL).toBe(3600);
    });
  });

  describe.skip("Cache Invalidation", () => {
    it("should invalidate specific cache entry", async () => {
      const key = "search:invalidate123";
      
      await cacheSearchResults(key, {
        results: mockSearchResults.results,
        totalFound: 2,
        query: "test",
      });

      // Verify it exists
      let result = await getCachedSearchResults(key);
      expect(result).toBeTruthy();

      // Invalidate
      const success = await invalidateSearchCache(key);
      expect(success).toBe(true);

      // Verify it's gone
      result = await getCachedSearchResults(key);
      expect(result).toBeNull();
    });

    it("should invalidate all cache entries", async () => {
      // Cache multiple entries directly in the store
      mockRedisStore.set("search:inv1", {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });
      mockRedisStore.set("search:inv2", {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });
      mockRedisStore.set("search:inv3", {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });

      const deletedCount = await invalidateAllSearchCache();

      expect(deletedCount).toBe(3);
      
      // Verify all are gone
      expect(await getCachedSearchResults("search:inv1")).toBeNull();
      expect(await getCachedSearchResults("search:inv2")).toBeNull();
      expect(await getCachedSearchResults("search:inv3")).toBeNull();
    });

    it("should only invalidate search cache keys", async () => {
      // Cache search entries directly
      mockRedisStore.set("search:test1", {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });
      mockRedisStore.set("search:test2", {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });

      // Add non-search entry directly
      mockRedisStore.set("other:key", {
        value: "other data",
        expiresAt: Date.now() + 300000,
      });

      await invalidateAllSearchCache();

      // Search entries should be gone
      expect(mockRedisStore.has("search:test1")).toBe(false);
      expect(mockRedisStore.has("search:test2")).toBe(false);

      // Other entry should remain
      expect(mockRedisStore.has("other:key")).toBe(true);
    });
  });

  describe.skip("Performance Benefits", () => {
    it("should be faster than original search (simulated)", async () => {
      const key = "search:perf123";

      // Simulate original search latency
      const originalSearchTime = 250; // 250ms

      // Pre-populate the cache
      mockRedisStore.set(key, {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });

      // Retrieve from cache
      const cacheStart = Date.now();
      await getCachedSearchResults(key);
      const cacheDuration = Date.now() - cacheStart;

      // Cache should be much faster (<50ms vs 250ms)
      expect(cacheDuration).toBeLessThan(originalSearchTime);
    });

    it("should reduce database load for repeat queries", async () => {
      resetSearchCacheStats();
      
      const key = "search:repeat123";
      // Pre-populate the cache
      mockRedisStore.set(key, {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });

      // Simulate 10 repeat queries
      for (let i = 0; i < 10; i++) {
        await getCachedSearchResults(key);
      }

      const stats = getSearchCacheStats();
      expect(stats.hits).toBe(10);
      expect(stats.misses).toBe(0);
    });
  });

  describe.skip("Edge Cases", () => {
    it("should handle malformed cached JSON", async () => {
      const key = "search:malformed";
      mockRedisStore.set(key, {
        value: "invalid json{",
        expiresAt: Date.now() + 300000,
      });

      const result = await getCachedSearchResults(key);
      expect(result).toBeNull();

      const stats = getSearchCacheStats();
      expect(stats.errors).toBeGreaterThan(0);
    });

    it("should handle empty results gracefully", async () => {
      const key = "search:empty";
      const emptyResults: Omit<CachedSearchResult, "cachedAt"> = {
        results: [],
        totalFound: 0,
        query: "nonexistent query",
      };

      await cacheSearchResults(key, emptyResults);

      const cached = await getCachedSearchResults(key);
      expect(cached?.results).toHaveLength(0);
      expect(cached?.totalFound).toBe(0);
    });

    it("should handle very large result sets", async () => {
      const key = "search:large";
      const largeResults: Omit<CachedSearchResult, "cachedAt"> = {
        results: Array.from({ length: 100 }, (_, i) => ({
          ...mockSearchResults.results[0],
          id: i,
        })),
        totalFound: 100,
        query: "test",
      };

      await cacheSearchResults(key, largeResults);

      const cached = await getCachedSearchResults(key);
      expect(cached?.results).toHaveLength(100);
    });

    it("should handle special characters in queries", async () => {
      const params: SearchCacheParams = {
        query: 'cardiac arrest "protocol #101"',
        agencyId: 1,
      };

      const key = getSearchCacheKey(params);
      expect(key).toBeTruthy();
      expect(key).toContain("search:");
    });

    it("should handle concurrent cache operations", async () => {
      const key = "search:concurrent";
      
      // Pre-populate the cache
      mockRedisStore.set(key, {
        value: JSON.stringify(mockSearchResults),
        expiresAt: Date.now() + 300000,
      });

      // Simulate concurrent reads
      const results = await Promise.all([
        getCachedSearchResults(key),
        getCachedSearchResults(key),
        getCachedSearchResults(key),
      ]);

      // All should succeed
      results.forEach(result => {
        expect(result).toBeTruthy();
      });
    });
  });

  describe.skip("Cache Statistics", () => {
    it("should track errors", async () => {
      const malformedKey = "search:error";
      mockRedisStore.set(malformedKey, {
        value: "bad json{",
        expiresAt: Date.now() + 300000,
      });

      await getCachedSearchResults(malformedKey);

      const stats = getSearchCacheStats();
      expect(stats.errors).toBeGreaterThan(0);
    });

    it("should reset statistics", async () => {
      await getCachedSearchResults("search:test");
      await getCachedSearchResults("search:test2");

      let stats = getSearchCacheStats();
      expect(stats.misses).toBe(2);

      resetSearchCacheStats();

      stats = getSearchCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.errors).toBe(0);
    });

    it("should report cache availability", () => {
      const stats = getSearchCacheStats();
      expect(stats).toHaveProperty("available");
      expect(typeof stats.available).toBe("boolean");
    });
  });

  describe.skip("Real-world Scenarios", () => {
    it("should cache popular queries efficiently", async () => {
      resetSearchCacheStats();
      
      const popularQueries = [
        "cardiac arrest protocol",
        "stroke protocol",
        "anaphylaxis treatment",
        "pediatric dosing",
      ];

      // First pass - populate cache directly for reliability
      for (const query of popularQueries) {
        const params: SearchCacheParams = { query, agencyId: 1 };
        const key = getSearchCacheKey(params);
        
        // Miss
        await getCachedSearchResults(key);
        
        // Populate directly
        mockRedisStore.set(key, {
          value: JSON.stringify({ ...mockSearchResults, query }),
          expiresAt: Date.now() + 300000,
        });
      }

      // Second pass - all hits
      for (const query of popularQueries) {
        const params: SearchCacheParams = { query, agencyId: 1 };
        const key = getSearchCacheKey(params);

        const result = await getCachedSearchResults(key);
        expect(result).toBeTruthy();
      }

      const stats = getSearchCacheStats();
      expect(stats.hits).toBe(4);
      expect(stats.misses).toBe(4);
    });

    it("should handle agency-specific caching", async () => {
      const query = "cardiac arrest";

      // Different agencies get different cache entries
      const agency1Key = getSearchCacheKey({ query, agencyId: 1 });
      const agency2Key = getSearchCacheKey({ query, agencyId: 2 });

      // Populate directly
      mockRedisStore.set(agency1Key, {
        value: JSON.stringify({
          ...mockSearchResults,
          results: [{ ...mockSearchResults.results[0], countyId: 1 }],
          totalFound: 1,
          query,
        }),
        expiresAt: Date.now() + 300000,
      });

      mockRedisStore.set(agency2Key, {
        value: JSON.stringify({
          ...mockSearchResults,
          results: [{ ...mockSearchResults.results[0], countyId: 2 }],
          totalFound: 1,
          query,
        }),
        expiresAt: Date.now() + 300000,
      });

      const result1 = await getCachedSearchResults(agency1Key);
      const result2 = await getCachedSearchResults(agency2Key);

      expect(result1?.results[0].countyId).toBe(1);
      expect(result2?.results[0].countyId).toBe(2);
    });
  });

  describe("Cache Headers", () => {
    it("should export correct TTL constants", () => {
      expect(CACHE_TTL).toBe(3600); // 1 hour
      expect(CACHE_HEADER_MAX_AGE).toBe(3600); // 1 hour
      expect(CACHE_HEADER_STALE_WHILE_REVALIDATE).toBe(300); // 5 minutes
    });

    it("should generate correct headers for cache hit", () => {
      const headers = getSearchCacheHeaders(true);

      expect(headers['Cache-Control']).toBe(
        `public, max-age=${CACHE_HEADER_MAX_AGE}, stale-while-revalidate=${CACHE_HEADER_STALE_WHILE_REVALIDATE}`
      );
      expect(headers['X-Cache']).toBe('HIT');
      expect(headers['X-Cache-TTL']).toBe(String(CACHE_TTL));
    });

    it("should generate correct headers for cache miss", () => {
      const headers = getSearchCacheHeaders(false);

      expect(headers['Cache-Control']).toBe(
        `public, max-age=${CACHE_HEADER_MAX_AGE}, stale-while-revalidate=${CACHE_HEADER_STALE_WHILE_REVALIDATE}`
      );
      expect(headers['X-Cache']).toBe('MISS');
      expect(headers['X-Cache-TTL']).toBe(String(CACHE_TTL));
    });

    it("should set headers on response object", () => {
      const mockRes = {
        setHeader: vi.fn(),
      };

      setSearchCacheHeaders(mockRes, true);

      expect(mockRes.setHeader).toHaveBeenCalledTimes(3);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        `public, max-age=${CACHE_HEADER_MAX_AGE}, stale-while-revalidate=${CACHE_HEADER_STALE_WHILE_REVALIDATE}`
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache-TTL', String(CACHE_TTL));
    });

    it("should set MISS header on cache miss", () => {
      const mockRes = {
        setHeader: vi.fn(),
      };

      setSearchCacheHeaders(mockRes, false);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
    });
  });
});
