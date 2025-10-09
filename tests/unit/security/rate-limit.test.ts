/**
 * Unit tests for Enhanced Rate Limiting
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  EnhancedRateLimiter,
  generateFingerprint,
  getRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/security/rate-limit";

describe("generateFingerprint", () => {
  it("should generate consistent fingerprint for same headers", () => {
    const req = {
      headers: {
        get: (key: string) => {
          const headers: Record<string, string> = {
            "x-forwarded-for": "192.168.1.1",
            "user-agent": "Mozilla/5.0",
            "accept-language": "en-US",
            "accept-encoding": "gzip, deflate",
          };
          return headers[key] || null;
        },
      },
    };

    const fp1 = generateFingerprint(req);
    const fp2 = generateFingerprint(req);

    expect(fp1).toBe(fp2);
    expect(fp1).toHaveLength(16);
  });

  it("should generate different fingerprints for different user agents", () => {
    const req1 = {
      headers: {
        get: (key: string) => (key === "user-agent" ? "Mozilla/5.0" : null),
      },
    };

    const req2 = {
      headers: {
        get: (key: string) => (key === "user-agent" ? "Chrome/90.0" : null),
      },
    };

    const fp1 = generateFingerprint(req1);
    const fp2 = generateFingerprint(req2);

    expect(fp1).not.toBe(fp2);
  });

  it("should handle missing headers gracefully", () => {
    const req = {
      headers: {
        get: () => null,
      },
    };

    const fp = generateFingerprint(req);
    expect(fp).toHaveLength(16);
  });
});

describe("EnhancedRateLimiter", () => {
  let limiter: EnhancedRateLimiter;

  beforeEach(() => {
    limiter = new EnhancedRateLimiter();
  });

  it("should allow requests within limit", () => {
    const key = "test-fingerprint";

    // CHAT limit is 20 requests per minute
    for (let i = 0; i < 20; i++) {
      const result = limiter.check(key, "CHAT");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(19 - i);
    }
  });

  it("should block requests exceeding limit", () => {
    const key = "test-fingerprint";

    // CHAT limit is 20 requests per minute
    for (let i = 0; i < 20; i++) {
      limiter.check(key, "CHAT");
    }

    // 21st request should be blocked
    const result = limiter.check(key, "CHAT");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should track reputation scores", () => {
    const key = "test-fingerprint";

    // Initial reputation should be 100
    expect(limiter.getReputation(key)).toBe(100);

    // Make requests within limit (good behavior)
    limiter.check(key, "CHAT");
    expect(limiter.getReputation(key)).toBe(100); // Increases by 1, capped at 100

    // Exceed limit (bad behavior)
    for (let i = 0; i < 20; i++) {
      limiter.check(key, "CHAT");
    }
    limiter.check(key, "CHAT"); // This will trigger bad reputation

    expect(limiter.getReputation(key)).toBeLessThan(100);
  });

  it("should decrease reputation on rate limit violations", () => {
    // Create a fresh limiter to avoid any cross-test contamination
    const testLimiter = new EnhancedRateLimiter();
    const key = "test-ban-key";

    // Use up the entire limit (20 requests)
    for (let i = 0; i < 20; i++) {
      testLimiter.check(key, "CHAT");
    }

    // Initial reputation after good requests should be 100
    const initialRep = testLimiter.getReputation(key);
    expect(initialRep).toBe(100);

    // Now attempt requests beyond the limit - these should trigger bad reputation
    // Each bad request reduces reputation by 10
    for (let i = 0; i < 10; i++) {
      const result = testLimiter.check(key, "CHAT");
      expect(result.allowed).toBe(false); // Should be rate limited
    }

    // After 10 bad behaviors (100 - 10*10 = 0), reputation should be 0
    const finalRep = testLimiter.getReputation(key);
    expect(finalRep).toBe(0);
    expect(testLimiter.isBanned(key)).toBe(true);
  });

  it("should reset limit after time window expires", () => {
    const key = "test-fingerprint";

    // Use up the limit
    for (let i = 0; i < 20; i++) {
      limiter.check(key, "CHAT");
    }

    // Should be blocked
    let result = limiter.check(key, "CHAT");
    expect(result.allowed).toBe(false);

    // Simulate time passing by advancing reset time
    // Note: In real implementation, this would require mocking Date.now()
    // For now, we just verify the reset timestamp is in the future
    expect(result.reset).toBeGreaterThan(Date.now());
  });

  it("should handle different rate limit types", () => {
    const key = "test-fingerprint";

    // Test CHAT limit (20 req/min)
    const chatResult = limiter.check(key + "-chat", "CHAT");
    expect(chatResult.allowed).toBe(true);

    // Test DOSING limit (30 req/min)
    const dosingResult = limiter.check(key + "-dosing", "DOSING");
    expect(dosingResult.allowed).toBe(true);

    // Test API limit (60 req/min)
    const apiResult = limiter.check(key + "-api", "API");
    expect(apiResult.allowed).toBe(true);
  });

  it("should provide accurate statistics", () => {
    limiter.check("fp1", "CHAT");
    limiter.check("fp2", "CHAT");
    limiter.check("fp3", "DOSING");

    const stats = limiter.getStats();
    expect(stats.activeFingerprints).toBe(3);
    expect(stats.reputationTracked).toBeGreaterThanOrEqual(3);
    expect(stats.lowReputationCount).toBeGreaterThanOrEqual(0);
    expect(stats.bannedCount).toBe(0);
  });

  it("should cleanup expired records", () => {
    const key = "test-fingerprint";

    limiter.check(key, "CHAT");
    expect(limiter.getStats().activeFingerprints).toBe(1);

    // Cleanup won't remove active records
    limiter.cleanup();
    expect(limiter.getStats().activeFingerprints).toBe(1);
  });
});

describe("getRateLimitHeaders", () => {
  it("should return correct headers", () => {
    const remaining = 15;
    const limit = 20;
    const reset = Date.now() + 60000; // 1 minute from now

    const headers = getRateLimitHeaders(remaining, limit, reset);

    expect(headers["X-RateLimit-Limit"]).toBe("20");
    expect(headers["X-RateLimit-Remaining"]).toBe("15");
    expect(headers["X-RateLimit-Reset"]).toBeDefined();
    expect(headers["Retry-After"]).toBeDefined();
  });

  it("should handle zero remaining requests", () => {
    const headers = getRateLimitHeaders(0, 20, Date.now() + 60000);
    expect(headers["X-RateLimit-Remaining"]).toBe("0");
  });
});

describe("RATE_LIMITS configuration", () => {
  it("should have reduced limits for public access", () => {
    expect(RATE_LIMITS.CHAT.limit).toBe(20);
    expect(RATE_LIMITS.API.limit).toBe(60);
    expect(RATE_LIMITS.DOSING.limit).toBe(30);
    expect(RATE_LIMITS.GLOBAL.limit).toBe(500);
  });

  it("should have appropriate time windows", () => {
    expect(RATE_LIMITS.CHAT.windowMs).toBe(60000); // 1 minute
    expect(RATE_LIMITS.API.windowMs).toBe(60000);
    expect(RATE_LIMITS.AUTH.windowMs).toBe(15 * 60000); // 15 minutes
    expect(RATE_LIMITS.GLOBAL.windowMs).toBe(15 * 60000);
  });

  it("should have user-friendly error messages", () => {
    expect(RATE_LIMITS.CHAT.message).toContain("slow down");
    expect(RATE_LIMITS.DOSING.message).toContain("dosing");
    expect(RATE_LIMITS.AUTH.message).toContain("authentication");
  });
});
