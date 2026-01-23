/**
 * User usage tracking and tier management
 * Handles query limits, subscriptions, and feature access
 */

import { eq, sql } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "./connection";
import { TIER_CONFIG } from "./config";

export async function updateUserCounty(userId: number, countyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ selectedCountyId: countyId }).where(eq(users.id, userId));
}

export async function incrementUserQueryCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];

  // Get current user
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");

  // Reset count if it's a new day
  if (user.lastQueryDate !== today) {
    await db.update(users).set({
      queryCountToday: 1,
      lastQueryDate: today,
    }).where(eq(users.id, userId));
    return 1;
  }

  // Increment count
  const newCount = user.queryCountToday + 1;
  await db.update(users).set({ queryCountToday: newCount }).where(eq(users.id, userId));
  return newCount;
}

export async function getUserUsage(userId: number) {
  const db = await getDb();
  if (!db) return {
    count: 0,
    limit: TIER_CONFIG.free.dailyQueryLimit,
    tier: 'free' as const,
    features: TIER_CONFIG.free,
  };

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return {
    count: 0,
    limit: TIER_CONFIG.free.dailyQueryLimit,
    tier: 'free' as const,
    features: TIER_CONFIG.free,
  };

  const today = new Date().toISOString().split('T')[0];
  const count = user.lastQueryDate === today ? user.queryCountToday : 0;
  const tierConfig = TIER_CONFIG[user.tier];

  return {
    count,
    limit: tierConfig.dailyQueryLimit,
    tier: user.tier,
    features: tierConfig,
  };
}

export async function canUserQuery(userId: number): Promise<boolean> {
  const usage = await getUserUsage(userId);
  return usage.count < usage.limit;
}

export async function getRemainingQueries(userId: number): Promise<number> {
  const usage = await getUserUsage(userId);
  if (usage.limit === Infinity) return Infinity;
  return Math.max(0, usage.limit - usage.count);
}

export async function updateUserTier(userId: number, tier: 'free' | 'pro' | 'enterprise') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ tier }).where(eq(users.id, userId));
}

export async function canUserAccessOffline(userId: number): Promise<boolean> {
  const usage = await getUserUsage(userId);
  return usage.features.offlineAccess;
}

export async function getUserBookmarkLimit(userId: number): Promise<number> {
  const usage = await getUserUsage(userId);
  return usage.features.maxBookmarks;
}

export async function canUserAddCounty(userId: number, currentCountyCount: number): Promise<boolean> {
  const usage = await getUserUsage(userId);
  return currentCountyCount < usage.features.maxCounties;
}
