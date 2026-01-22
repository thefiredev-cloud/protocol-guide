/**
 * Protocol Guide - Rate Limiting Middleware
 *
 * In-memory rate limiting for Express routes.
 * Uses sliding window algorithm for accurate rate limiting.
 *
 * Features:
 * - IP-based rate limiting (default)
 * - Per-user subscription tier limits
 * - Daily query limits by tier (Free: 10, Pro: 100, Unlimited: no limit)
 */

import { Request, Response, NextFunction } from "express";

// ============================================================================
// SUBSCRIPTION TIER CONFIGURATION
// ============================================================================

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'pro' | 'unlimited';

/**
 * Daily query limits by subscription tier
 */
export const TIER_DAILY_LIMITS: Record<SubscriptionTier, number> = {
  free: 10,       // Free tier: 10 queries/day
  pro: 100,       // Pro tier: 100 queries/day
  unlimited: -1,  // Unlimited tier: no limit (-1 = unlimited)
} as const;

/**
 * Per-minute rate limits by subscription tier (for burst protection)
 */
export const TIER_MINUTE_LIMITS: Record<SubscriptionTier, number> = {
  free: 5,        // Free tier: 5 queries/minute
  pro: 20,        // Pro tier: 20 queries/minute
  unlimited: 60,  // Unlimited tier: 60 queries/minute
} as const;

// ============================================================================
// INTERFACES
// ============================================================================

export interface RateLimitConfig {
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number;
  /** Max requests per window (default: 100) */
  max?: number;
  /** Message to return when rate limited */
  message?: string;
  /** HTTP status code when rate limited (default: 429) */
  statusCode?: number;
  /** Key generator function (default: uses IP) */
  keyGenerator?: (req: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Creates a rate limiting middleware
 */
export function createRateLimiter(config: RateLimitConfig = {}) {
  const {
    windowMs = 60000,
    max = 100,
    message = "Too many requests, please try again later.",
    statusCode = 429,
    keyGenerator = getClientKey,
  } = config;

  // In-memory store for rate limit tracking
  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries every minute
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    const entries = Array.from(store.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i];
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 60000);

  // Prevent interval from keeping process alive (Node.js only)
  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    (cleanupInterval as NodeJS.Timeout).unref();
  }

  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = store.get(key);

    // Reset if window has passed
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    entry.count++;
    store.set(key, entry);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetTime - now) / 1000));
      res.status(statusCode).json({
        error: "RATE_LIMITED",
        message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Extract client key from request for rate limiting
 * Uses X-Forwarded-For for proxied requests, falls back to IP
 */
function getClientKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // X-Forwarded-For can be a comma-separated list, use first IP
    const firstIp = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0];
    return firstIp.trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  /** Public endpoints: 100 requests per minute */
  public: { windowMs: 60000, max: 100 },
  /** Search endpoints: 30 requests per minute */
  search: { windowMs: 60000, max: 30 },
  /** AI query endpoints: 10 requests per minute */
  ai: { windowMs: 60000, max: 10 },
  /** Auth endpoints: 5 requests per minute (prevent brute force) */
  auth: { windowMs: 60000, max: 5 },
} as const;

// ============================================================================
// PER-USER SUBSCRIPTION TIER RATE LIMITING
// ============================================================================

interface UserRateLimitEntry {
  /** Queries used in current minute window */
  minuteCount: number;
  /** Minute window reset time */
  minuteResetTime: number;
  /** Queries used in current day */
  dailyCount: number;
  /** Daily window reset time (midnight UTC) */
  dailyResetTime: number;
}

/**
 * Result of rate limit check
 */
export interface RateLimitResult {
  allowed: boolean;
  reason?: 'minute_limit' | 'daily_limit';
  limit: number;
  remaining: number;
  resetTime: number;
  /** Daily usage stats */
  daily: {
    limit: number;
    used: number;
    remaining: number;
    resetTime: number;
  };
}

/**
 * User rate limit tracker for subscription tier limits
 */
class UserRateLimitTracker {
  private store = new Map<string, UserRateLimitEntry>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Get the start of next UTC day
   */
  private getNextDayResetTime(): number {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    return tomorrow.getTime();
  }

  /**
   * Check if user is within rate limits and increment counters
   */
  checkAndIncrement(userId: string, tier: SubscriptionTier): RateLimitResult {
    const now = Date.now();
    const minuteLimit = TIER_MINUTE_LIMITS[tier];
    const dailyLimit = TIER_DAILY_LIMITS[tier];

    let entry = this.store.get(userId);

    // Initialize or reset expired entries
    if (!entry) {
      entry = {
        minuteCount: 0,
        minuteResetTime: now + 60000,
        dailyCount: 0,
        dailyResetTime: this.getNextDayResetTime(),
      };
    } else {
      // Reset minute window if expired
      if (now > entry.minuteResetTime) {
        entry.minuteCount = 0;
        entry.minuteResetTime = now + 60000;
      }

      // Reset daily window if expired
      if (now > entry.dailyResetTime) {
        entry.dailyCount = 0;
        entry.dailyResetTime = this.getNextDayResetTime();
      }
    }

    // Check minute limit
    if (entry.minuteCount >= minuteLimit) {
      this.store.set(userId, entry);
      return {
        allowed: false,
        reason: 'minute_limit',
        limit: minuteLimit,
        remaining: 0,
        resetTime: entry.minuteResetTime,
        daily: {
          limit: dailyLimit === -1 ? Infinity : dailyLimit,
          used: entry.dailyCount,
          remaining: dailyLimit === -1 ? Infinity : Math.max(0, dailyLimit - entry.dailyCount),
          resetTime: entry.dailyResetTime,
        },
      };
    }

    // Check daily limit (skip for unlimited tier)
    if (dailyLimit !== -1 && entry.dailyCount >= dailyLimit) {
      this.store.set(userId, entry);
      return {
        allowed: false,
        reason: 'daily_limit',
        limit: dailyLimit,
        remaining: 0,
        resetTime: entry.dailyResetTime,
        daily: {
          limit: dailyLimit,
          used: entry.dailyCount,
          remaining: 0,
          resetTime: entry.dailyResetTime,
        },
      };
    }

    // Increment counters
    entry.minuteCount++;
    entry.dailyCount++;
    this.store.set(userId, entry);

    return {
      allowed: true,
      limit: minuteLimit,
      remaining: minuteLimit - entry.minuteCount,
      resetTime: entry.minuteResetTime,
      daily: {
        limit: dailyLimit === -1 ? Infinity : dailyLimit,
        used: entry.dailyCount,
        remaining: dailyLimit === -1 ? Infinity : Math.max(0, dailyLimit - entry.dailyCount),
        resetTime: entry.dailyResetTime,
      },
    };
  }

  /**
   * Get current usage for a user without incrementing
   */
  getUsage(userId: string, tier: SubscriptionTier): RateLimitResult {
    const now = Date.now();
    const minuteLimit = TIER_MINUTE_LIMITS[tier];
    const dailyLimit = TIER_DAILY_LIMITS[tier];

    const entry = this.store.get(userId);

    if (!entry) {
      return {
        allowed: true,
        limit: minuteLimit,
        remaining: minuteLimit,
        resetTime: now + 60000,
        daily: {
          limit: dailyLimit === -1 ? Infinity : dailyLimit,
          used: 0,
          remaining: dailyLimit === -1 ? Infinity : dailyLimit,
          resetTime: this.getNextDayResetTime(),
        },
      };
    }

    // Calculate actual remaining after checking for expired windows
    let minuteRemaining = minuteLimit - entry.minuteCount;
    let dailyRemaining = dailyLimit === -1 ? Infinity : dailyLimit - entry.dailyCount;

    if (now > entry.minuteResetTime) {
      minuteRemaining = minuteLimit;
    }
    if (now > entry.dailyResetTime) {
      dailyRemaining = dailyLimit === -1 ? Infinity : dailyLimit;
    }

    return {
      allowed: minuteRemaining > 0 && (dailyLimit === -1 || dailyRemaining > 0),
      limit: minuteLimit,
      remaining: Math.max(0, minuteRemaining),
      resetTime: entry.minuteResetTime,
      daily: {
        limit: dailyLimit === -1 ? Infinity : dailyLimit,
        used: now > entry.dailyResetTime ? 0 : entry.dailyCount,
        remaining: Math.max(0, dailyRemaining),
        resetTime: entry.dailyResetTime,
      },
    };
  }

  /**
   * Reset a user's rate limits (for testing or admin override)
   */
  reset(userId: string): void {
    this.store.delete(userId);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i];
      // Remove if both windows are expired
      if (now > entry.minuteResetTime && now > entry.dailyResetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Get stats about the tracker
   */
  getStats(): { trackedUsers: number } {
    return {
      trackedUsers: this.store.size,
    };
  }
}

// Global instance for user rate limiting
const userRateLimitTracker = new UserRateLimitTracker();

/**
 * Check and increment rate limit for a user
 * @param userId - Unique user identifier
 * @param tier - User's subscription tier
 * @returns Rate limit result with allowed status and usage info
 */
export function checkUserRateLimit(
  userId: string,
  tier: SubscriptionTier
): RateLimitResult {
  return userRateLimitTracker.checkAndIncrement(userId, tier);
}

/**
 * Get current rate limit usage for a user without incrementing
 * @param userId - Unique user identifier
 * @param tier - User's subscription tier
 * @returns Current usage info
 */
export function getUserRateLimitUsage(
  userId: string,
  tier: SubscriptionTier
): RateLimitResult {
  return userRateLimitTracker.getUsage(userId, tier);
}

/**
 * Reset rate limits for a user (admin function)
 * @param userId - User to reset
 */
export function resetUserRateLimit(userId: string): void {
  userRateLimitTracker.reset(userId);
}

/**
 * Get rate limiter stats
 */
export function getRateLimitStats(): { trackedUsers: number } {
  return userRateLimitTracker.getStats();
}

/**
 * Express middleware for per-user rate limiting
 * Requires req.userId and req.userTier to be set by auth middleware
 */
export function createUserRateLimiter() {
  return function userRateLimitMiddleware(
    req: Request & { userId?: string; userTier?: SubscriptionTier },
    res: Response,
    next: NextFunction
  ): void {
    // Skip if no user ID (not authenticated)
    if (!req.userId) {
      next();
      return;
    }

    const tier = req.userTier || 'free';
    const result = checkUserRateLimit(req.userId, tier);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));
    res.setHeader("X-RateLimit-Daily-Limit", result.daily.limit === Infinity ? "unlimited" : result.daily.limit);
    res.setHeader("X-RateLimit-Daily-Remaining", result.daily.remaining === Infinity ? "unlimited" : result.daily.remaining);
    res.setHeader("X-RateLimit-Daily-Reset", Math.ceil(result.daily.resetTime / 1000));

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.setHeader("Retry-After", retryAfter);

      const message = result.reason === 'daily_limit'
        ? `Daily query limit reached (${result.daily.limit} queries/day for ${tier} tier). Resets at midnight UTC.`
        : `Too many requests. Please wait ${retryAfter} seconds.`;

      res.status(429).json({
        error: "RATE_LIMITED",
        reason: result.reason,
        message,
        retryAfter,
        tier,
        daily: {
          limit: result.daily.limit,
          used: result.daily.used,
          remaining: result.daily.remaining,
        },
      });
      return;
    }

    next();
  };
}
