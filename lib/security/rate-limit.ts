/**
 * Enhanced Rate Limiting Utilities with Request Fingerprinting
 *
 * Provides advanced rate limiting for HIPAA-compliant API security with:
 * - Request fingerprinting for better identification
 * - IP reputation tracking
 * - Automatic cleanup of stale records
 * - Enhanced logging for security monitoring
 *
 * HIPAA Requirement: Access controls and audit logging for PHI access
 */

import crypto from "crypto";

/**
 * Rate limit configurations by endpoint type
 * Reduced limits for public access security
 */
export const RATE_LIMITS = {
  CHAT: {
    limit: 20, // Reduced for public access
    windowMs: 60 * 1000, // 1 minute
    message: "Too many chat requests. Please slow down.",
  },
  API: {
    limit: 60, // Reduced from 100
    windowMs: 60 * 1000,
    message: "Rate limit exceeded. Please wait.",
  },
  DOSING: {
    limit: 30,
    windowMs: 60 * 1000,
    message: "Too many dosing calculations.",
  },
  AUTH: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many authentication attempts. Please try again later.",
  },
  PHI: {
    limit: 50,
    windowMs: 60 * 1000,
    message: "Access rate limit exceeded for sensitive data.",
  },
  GLOBAL: {
    limit: 500,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Global rate limit exceeded.",
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Generate a unique fingerprint for a request based on multiple headers
 * This provides better identification than IP alone, especially for users behind NAT
 *
 * @param req - NextRequest or compatible request object
 * @returns SHA256 hash of request components (first 16 chars)
 */
export function generateFingerprint(req: {
  headers: { get: (key: string) => string | null };
}): string {
  const components = [
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "",
    req.headers.get("user-agent") || "",
    req.headers.get("accept-language") || "",
    req.headers.get("accept-encoding") || "",
  ];

  const raw = components.join("|");
  return crypto.createHash("sha256").update(raw).digest("hex").substring(0, 16);
}

/**
 * Enhanced rate limiter with reputation tracking
 * Tracks request patterns and automatically bans abusive clients
 */
export class EnhancedRateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();
  private reputation = new Map<string, { score: number; lastSeen: number }>();

  /**
   * Check if a request is allowed under the rate limit
   *
   * @param key - Unique identifier (fingerprint or IP)
   * @param limitType - Type of rate limit to apply
   * @returns Result with allowed status, remaining requests, and reset time
   */
  check(
    key: string,
    limitType: RateLimitType
  ): {
    allowed: boolean;
    remaining: number;
    reset: number;
  } {
    const config = RATE_LIMITS[limitType];
    const now = Date.now();
    const record = this.requests.get(key);

    // Clean up expired entries
    if (!record || now > record.resetAt) {
      this.requests.set(key, { count: 1, resetAt: now + config.windowMs });
      this.updateReputation(key, "good");
      return {
        allowed: true,
        remaining: config.limit - 1,
        reset: now + config.windowMs,
      };
    }

    if (record.count >= config.limit) {
      this.updateReputation(key, "bad");
      return { allowed: false, remaining: 0, reset: record.resetAt };
    }

    record.count++;
    return {
      allowed: true,
      remaining: config.limit - record.count,
      reset: record.resetAt,
    };
  }

  /**
   * Update reputation score based on behavior
   * Good behavior slowly increases score, bad behavior rapidly decreases it
   *
   * @param key - Unique identifier
   * @param behavior - 'good' or 'bad' behavior indicator
   */
  private updateReputation(key: string, behavior: "good" | "bad"): void {
    const rep = this.reputation.get(key) || {
      score: 100,
      lastSeen: Date.now(),
    };

    if (behavior === "bad") {
      rep.score = Math.max(0, rep.score - 10);
    } else {
      rep.score = Math.min(100, rep.score + 1);
    }

    rep.lastSeen = Date.now();
    this.reputation.set(key, rep);

    // Log warning for low reputation scores
    if (rep.score < 20) {
      console.warn(`⚠️  Low reputation score for ${key}: ${rep.score}`);
    }
  }

  /**
   * Get current reputation score for a key
   *
   * @param key - Unique identifier
   * @returns Reputation score (0-100, default 100)
   */
  getReputation(key: string): number {
    return this.reputation.get(key)?.score ?? 100;
  }

  /**
   * Check if a key is banned due to low reputation
   *
   * @param key - Unique identifier
   * @returns True if reputation is below ban threshold (10)
   */
  isBanned(key: string): boolean {
    return this.getReputation(key) < 10;
  }

  /**
   * Clean up expired request records and stale reputation entries
   * Should be called periodically to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    // Clean expired request records
    for (const [key, record] of this.requests) {
      if (now > record.resetAt) {
        this.requests.delete(key);
      }
    }

    // Clean stale reputation records (not seen in 1 hour)
    for (const [key, rep] of this.reputation) {
      if (now - rep.lastSeen > ONE_HOUR) {
        this.reputation.delete(key);
      }
    }
  }

  /**
   * Get statistics about current rate limiting state
   * Used for monitoring and debugging
   */
  getStats(): {
    activeFingerprints: number;
    reputationTracked: number;
    lowReputationCount: number;
    bannedCount: number;
  } {
    const reputationValues = Array.from(this.reputation.values());
    return {
      activeFingerprints: this.requests.size,
      reputationTracked: this.reputation.size,
      lowReputationCount: reputationValues.filter((r) => r.score < 50).length,
      bannedCount: reputationValues.filter((r) => r.score < 10).length,
    };
  }
}

/**
 * Global rate limiter instance
 * In production, consider using Redis for distributed rate limiting
 */
export const rateLimiter = new EnhancedRateLimiter();

// Cleanup every 5 minutes to prevent memory leaks
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

/**
 * Standard rate limit response headers (RFC 6585)
 *
 * @param remaining - Number of requests remaining in the current window
 * @param limit - Maximum requests allowed per window
 * @param reset - Unix timestamp (milliseconds) when the limit resets
 * @returns Headers object for HTTP response
 */
export function getRateLimitHeaders(
  remaining: number,
  limit: number,
  reset: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
    "X-RateLimit-Reset": new Date(reset).toISOString(),
    "Retry-After": Math.max(
      0,
      Math.ceil((reset - Date.now()) / 1000)
    ).toString(),
  };
}

/**
 * Calculate rate limit window reset time
 *
 * @param windowMs - Window duration in milliseconds (e.g., 60000 for 1 minute)
 * @returns Unix timestamp (seconds) when the window resets
 */
export function getResetTimestamp(windowMs: number): number {
  return Math.floor((Date.now() + windowMs) / 1000);
}

/**
 * Check if rate limit has been exceeded
 *
 * @param attempts - Number of attempts made
 * @param limit - Maximum allowed attempts
 * @returns True if limit exceeded
 */
export function isRateLimitExceeded(attempts: number, limit: number): boolean {
  return attempts >= limit;
}

/**
 * Create a rate limit key for storage (Redis, memory, etc.)
 *
 * @param identifier - User identifier (IP, userId, apiKey, etc.)
 * @param endpoint - API endpoint or route
 * @returns Unique key for rate limit tracking
 */
export function createRateLimitKey(identifier: string, endpoint: string): string {
  return `ratelimit:${endpoint}:${identifier}`;
}

/**
 * Format rate limit error response
 *
 * @param limit - Rate limit configuration
 * @param resetTimestamp - When the limit resets
 * @returns Error response object
 */
export function createRateLimitErrorResponse(
  limit: (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS],
  resetTimestamp: number
) {
  return {
    error: limit.message,
    retryAfter: Math.max(0, resetTimestamp - Math.floor(Date.now() / 1000)),
    limit: limit.limit,
    windowMs: limit.windowMs,
  };
}

/**
 * Legacy in-memory rate limiter for backward compatibility
 * WARNING: Not suitable for production with multiple server instances
 * Use Redis or similar distributed cache in production
 */
export class InMemoryRateLimiter {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  check(
    key: string,
    limit: number,
    windowMs: number
  ): {
    allowed: boolean;
    remaining: number;
    reset: number;
  } {
    const now = Date.now();
    const record = this.store.get(key);

    // Reset if window expired
    if (!record || now > record.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: limit - 1,
        reset: Math.floor(resetAt / 1000),
      };
    }

    // Increment counter
    record.count += 1;
    const allowed = record.count <= limit;
    const remaining = Math.max(0, limit - record.count);

    return {
      allowed,
      remaining,
      reset: Math.floor(record.resetAt / 1000),
    };
  }

  // Cleanup expired entries (call periodically)
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
