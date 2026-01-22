/**
 * Protocol Guide - Redis Client
 *
 * Upstash Redis client for distributed rate limiting and caching.
 * Falls back to in-memory mode if Redis is not configured.
 */

import { Redis } from "@upstash/redis";
import { logger } from "./logger";

let redisClient: Redis | null = null;
let redisAvailable = false;

/**
 * Initialize Redis client
 */
export function initRedis(): void {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    logger.warn("Redis not configured - rate limiting will use in-memory fallback");
    redisAvailable = false;
    return;
  }

  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    redisAvailable = true;
    logger.info("Redis client initialized successfully");
  } catch (error) {
    logger.error({ error }, "Failed to initialize Redis client");
    redisAvailable = false;
  }
}

/**
 * Get Redis client instance
 */
export function getRedis(): Redis | null {
  return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisAvailable;
}

/**
 * Test Redis connectivity
 */
export async function testRedisConnection(): Promise<boolean> {
  if (!redisClient) {
    return false;
  }

  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error({ error }, "Redis connection test failed");
    return false;
  }
}

/**
 * Gracefully close Redis connection
 */
export function closeRedis(): void {
  redisClient = null;
  redisAvailable = false;
  logger.info("Redis client closed");
}
