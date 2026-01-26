/**
 * Search Cache Tests
 *
 * Tests for Redis search result caching:
 * - Cache key generation (pure functions, no Redis needed)
 * - Cache headers (pure functions, no Redis needed)
 * - Cache constants
 *
 * Note: Tests that require actual Redis operations are challenging to mock
 * in vitest due to module caching. The key generation and header tests
 * provide coverage for the most critical logic.
 */

import { describe, it, expect, vi } from "vitest";

// Mock logger to suppress console output
vi.mock("../server/_core/logger", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock redis module - returns unavailable to avoid requiring real Redis
vi.mock("../server/_core/redis", () => ({
  isRedisAvailable: () => false,
  getRedis: () => null,
}));

// Import after mocking
import {
  getSearchCacheKey,
  getSearchCacheHeaders,
  setSearchCacheHeaders,
  getSearchCacheStats,
  resetSearchCacheStats,
  CACHE_TTL,
  CACHE_HEADER_MAX_AGE,
  CACHE_HEADER_STALE_WHILE_REVALIDATE,
  type SearchCacheParams,
} from "../server/_core/search-cache";

describe("Search Cache", () => {
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

    it("should handle special characters in queries", () => {
      const params: SearchCacheParams = {
        query: 'cardiac arrest "protocol #101"',
        agencyId: 1,
      };

      const key = getSearchCacheKey(params);
      expect(key).toBeTruthy();
      expect(key).toContain("search:");
    });

    it("should generate keys with limit parameter", () => {
      const params1: SearchCacheParams = {
        query: "cardiac arrest",
        limit: 10,
      };

      const params2: SearchCacheParams = {
        query: "cardiac arrest",
        limit: 20,
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).not.toBe(key2);
    });

    it("should use default limit when not specified", () => {
      const params1: SearchCacheParams = {
        query: "cardiac arrest",
      };

      const params2: SearchCacheParams = {
        query: "cardiac arrest",
        limit: 10, // Default limit
      };

      const key1 = getSearchCacheKey(params1);
      const key2 = getSearchCacheKey(params2);

      expect(key1).toBe(key2);
    });
  });

  describe("Cache Constants", () => {
    it("should export correct TTL constants", () => {
      expect(CACHE_TTL).toBe(3600); // 1 hour
      expect(CACHE_HEADER_MAX_AGE).toBe(3600); // 1 hour
      expect(CACHE_HEADER_STALE_WHILE_REVALIDATE).toBe(300); // 5 minutes
    });

    it("should have reasonable TTL values", () => {
      // TTL should be at least 5 minutes
      expect(CACHE_TTL).toBeGreaterThanOrEqual(300);
      // TTL should be at most 24 hours
      expect(CACHE_TTL).toBeLessThanOrEqual(86400);
    });
  });

  describe("Cache Headers", () => {
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

    it("should include stale-while-revalidate directive", () => {
      const headers = getSearchCacheHeaders(true);
      
      expect(headers['Cache-Control']).toContain('stale-while-revalidate=');
    });

    it("should use public cacheability", () => {
      const headers = getSearchCacheHeaders(true);
      
      expect(headers['Cache-Control']).toContain('public');
    });
  });

  describe("Cache Statistics", () => {
    it("should report initial stats", () => {
      resetSearchCacheStats();
      const stats = getSearchCacheStats();
      
      expect(stats).toHaveProperty("hits");
      expect(stats).toHaveProperty("misses");
      expect(stats).toHaveProperty("hitRate");
      expect(stats).toHaveProperty("available");
    });

    it("should report cache availability", () => {
      const stats = getSearchCacheStats();
      
      expect(typeof stats.available).toBe("boolean");
      // With our mock, Redis is not available
      expect(stats.available).toBe(false);
    });

    it("should reset statistics", () => {
      resetSearchCacheStats();
      
      const stats = getSearchCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.errors).toBe(0);
    });

    it("should calculate hit rate correctly when no operations", () => {
      resetSearchCacheStats();
      
      const stats = getSearchCacheStats();
      expect(stats.hitRate).toBe(0);
    });
  });
});
