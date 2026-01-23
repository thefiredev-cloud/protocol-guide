/**
 * Shared Redis/Upstash client for edge functions
 * Used for rate limiting and caching
 */

import { Redis } from "https://esm.sh/@upstash/redis@1.22.0";

const redisUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
const redisToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");

// Create Redis client if credentials are available
export const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

/**
 * Simple rate limiter using Redis
 * Returns remaining requests and reset time
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  if (!redis) {
    // If Redis is not configured, allow all requests
    return { allowed: true, remaining: limit, resetAt: 0 };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;
  const rateLimitKey = `ratelimit:${key}`;

  try {
    // Use sorted set with timestamps as scores
    // Remove old entries
    await redis.zremrangebyscore(rateLimitKey, 0, windowStart);

    // Count current requests in window
    const count = await redis.zcard(rateLimitKey);

    if (count >= limit) {
      // Get oldest entry to determine reset time
      const oldest = await redis.zrange(rateLimitKey, 0, 0, { withScores: true });
      const resetAt = oldest.length > 0 ? Number(oldest[0].score) + windowSeconds : now + windowSeconds;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(rateLimitKey, { score: now, member: `${now}-${Math.random()}` });

    // Set expiry on the key
    await redis.expire(rateLimitKey, windowSeconds + 1);

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds,
    };
  } catch (error) {
    console.error("[RateLimit] Redis error:", error);
    // On error, allow the request but log it
    return { allowed: true, remaining: limit, resetAt: 0 };
  }
}

/**
 * Simple cache get/set using Redis
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error("[Cache] Get error:", error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  exSeconds: number
): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.setex(key, exSeconds, value);
    return true;
  } catch (error) {
    console.error("[Cache] Set error:", error);
    return false;
  }
}
