/**
 * Referral System Router
 *
 * API endpoints for the viral growth referral program:
 * - Generate/manage referral codes
 * - Track redemptions
 * - Get referral stats and leaderboard
 * - Handle milestone rewards
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import crypto from "crypto";

// ============ Helper Functions ============

/**
 * Generate a unique referral code
 * Format: CREW-XXXXXX (uppercase alphanumeric)
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars (0,O,1,I)
  const randomPart = Array.from(crypto.randomBytes(6))
    .map((byte) => chars[byte % chars.length])
    .join("");
  return `CREW-${randomPart}`;
}

/**
 * Referral reward tiers
 */
const REFERRAL_TIERS = {
  bronze: { minReferrals: 0, rewardDays: 7 },
  silver: { minReferrals: 3, rewardDays: 30, bonusDays: 30 },
  gold: { minReferrals: 5, rewardDays: 180, bonusDays: 180 },
  platinum: { minReferrals: 10, rewardDays: 365, bonusDays: 365 },
  ambassador: { minReferrals: 25, rewardDays: 365, bonusDays: 365 },
} as const;

/**
 * Calculate user's referral tier based on successful referrals
 */
function calculateTier(referralCount: number): keyof typeof REFERRAL_TIERS {
  if (referralCount >= 25) return "ambassador";
  if (referralCount >= 10) return "platinum";
  if (referralCount >= 5) return "gold";
  if (referralCount >= 3) return "silver";
  return "bronze";
}

// ============ Router Definition ============

export const referralRouter = createTRPCRouter({
  /**
   * Get or create the user's referral code
   */
  getMyReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const userId = ctx.user.id;

    // Check for existing code
    const existing = await db
      .select()
      .from(sql`referral_codes`)
      .where(sql`userId = ${userId} AND isActive = true`)
      .limit(1);

    if (existing.length > 0) {
      return {
        code: existing[0].code as string,
        usesCount: existing[0].usesCount as number,
        createdAt: existing[0].createdAt as Date,
      };
    }

    // Generate new code
    let code = generateReferralCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existingCode = await db
        .select()
        .from(sql`referral_codes`)
        .where(sql`code = ${code}`)
        .limit(1);

      if (existingCode.length === 0) break;
      code = generateReferralCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate unique referral code",
      });
    }

    // Insert new code
    await db.execute(sql`
      INSERT INTO referral_codes (userId, code, rewardType, rewardAmount, isActive, createdAt)
      VALUES (${userId}, ${code}, 'pro_days', 7, true, NOW())
    `);

    return {
      code,
      usesCount: 0,
      createdAt: new Date(),
    };
  }),

  /**
   * Get user's referral statistics
   */
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const userId = ctx.user.id;

    // Get or create stats record
    const statsResult = await db.execute(sql`
      SELECT * FROM user_referral_stats WHERE userId = ${userId} LIMIT 1
    `);

    const stats = (statsResult[0] as any[])?.[0];

    if (!stats) {
      // Initialize stats for new user
      await db.execute(sql`
        INSERT INTO user_referral_stats (userId, totalReferrals, successfulReferrals, pendingReferrals, proDaysEarned, creditsEarned, currentTier, updatedAt)
        VALUES (${userId}, 0, 0, 0, 0, 0, 'bronze', NOW())
      `);

      return {
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        proDaysEarned: 0,
        creditsEarned: 0,
        currentTier: "bronze" as const,
        rank: null,
        nextTierProgress: 0,
        nextTierName: "silver",
        referralsToNextTier: 3,
      };
    }

    const tier = calculateTier(stats.successfulReferrals);
    const nextTier = tier === "ambassador" ? null : Object.entries(REFERRAL_TIERS).find(
      ([, config]) => config.minReferrals > stats.successfulReferrals
    );

    return {
      totalReferrals: stats.totalReferrals,
      successfulReferrals: stats.successfulReferrals,
      pendingReferrals: stats.pendingReferrals,
      proDaysEarned: stats.proDaysEarned,
      creditsEarned: stats.creditsEarned,
      currentTier: tier,
      rank: stats.rank,
      nextTierProgress: nextTier
        ? Math.floor((stats.successfulReferrals / nextTier[1].minReferrals) * 100)
        : 100,
      nextTierName: nextTier?.[0] || null,
      referralsToNextTier: nextTier
        ? nextTier[1].minReferrals - stats.successfulReferrals
        : 0,
    };
  }),

  /**
   * Get referral history (who I've referred)
   */
  getMyReferrals: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = ctx.user.id;

      // Get referrals with user info
      const referrals = await db.execute(sql`
        SELECT
          rr.id,
          rr.redeemedAt,
          rr.convertedToPaid,
          rr.conversionDate,
          rr.referrerReward,
          u.name as referredUserName,
          u.email as referredUserEmail
        FROM referral_redemptions rr
        JOIN users u ON u.id = rr.referredUserId
        WHERE rr.referrerUserId = ${userId}
        ORDER BY rr.redeemedAt DESC
        LIMIT ${input.limit}
        OFFSET ${input.offset}
      `);

      const countResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM referral_redemptions WHERE referrerUserId = ${userId}
      `);

      return {
        referrals: ((referrals[0] as any[]) || []).map((r) => ({
          id: r.id,
          redeemedAt: r.redeemedAt,
          convertedToPaid: Boolean(r.convertedToPaid),
          conversionDate: r.conversionDate,
          reward: r.referrerReward,
          referredUser: {
            name: r.referredUserName || "Anonymous",
            // Mask email for privacy
            email: r.referredUserEmail
              ? `${r.referredUserEmail.slice(0, 3)}***@${r.referredUserEmail.split("@")[1]}`
              : null,
          },
        })),
        total: (countResult[0] as any[])?.[0]?.total || 0,
      };
    }),

  /**
   * Validate a referral code (public - for signup flow)
   */
  validateCode: publicProcedure
    .input(z.object({ code: z.string().min(1).max(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { valid: false, error: "Service unavailable" };
      }

      const code = input.code.toUpperCase().trim();

      const result = await db.execute(sql`
        SELECT rc.id, rc.userId, rc.maxUses, rc.usesCount, rc.expiresAt, rc.isActive, u.name as referrerName
        FROM referral_codes rc
        JOIN users u ON u.id = rc.userId
        WHERE rc.code = ${code}
        LIMIT 1
      `);

      const referralCode = (result[0] as any[])?.[0];

      if (!referralCode) {
        return { valid: false, error: "Invalid referral code" };
      }

      if (!referralCode.isActive) {
        return { valid: false, error: "This code is no longer active" };
      }

      if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
        return { valid: false, error: "This code has expired" };
      }

      if (referralCode.maxUses && referralCode.usesCount >= referralCode.maxUses) {
        return { valid: false, error: "This code has reached its usage limit" };
      }

      return {
        valid: true,
        referrerName: referralCode.referrerName || "A Protocol Guide user",
        benefits: {
          trialDays: 14, // Extended trial for referred users
          description: "14-day Pro trial (instead of 7)",
        },
      };
    }),

  /**
   * Redeem a referral code (called during signup)
   */
  redeemCode: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const code = input.code.toUpperCase().trim();
      const newUserId = ctx.user.id;

      // Get and validate code
      const codeResult = await db.execute(sql`
        SELECT * FROM referral_codes WHERE code = ${code} AND isActive = true LIMIT 1
      `);

      const referralCode = (codeResult[0] as any[])?.[0];

      if (!referralCode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired referral code",
        });
      }

      // Prevent self-referral
      if (referralCode.userId === newUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot use your own referral code",
        });
      }

      // Check if user already redeemed a code
      const existingRedemption = await db.execute(sql`
        SELECT id FROM referral_redemptions WHERE referredUserId = ${newUserId} LIMIT 1
      `);

      if ((existingRedemption[0] as any[])?.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already used a referral code",
        });
      }

      // Create redemption record
      const referrerReward = { type: "pro_days", amount: 7, applied: false };
      const refereeReward = { type: "extended_trial", amount: 14, applied: true };

      await db.execute(sql`
        INSERT INTO referral_redemptions (referralCodeId, referredUserId, referrerUserId, referrerReward, refereeReward, redeemedAt)
        VALUES (${referralCode.id}, ${newUserId}, ${referralCode.userId}, ${JSON.stringify(referrerReward)}, ${JSON.stringify(refereeReward)}, NOW())
      `);

      // Update code usage count
      await db.execute(sql`
        UPDATE referral_codes SET usesCount = usesCount + 1 WHERE id = ${referralCode.id}
      `);

      // Update referrer stats
      await db.execute(sql`
        INSERT INTO user_referral_stats (userId, totalReferrals, pendingReferrals, currentTier, updatedAt)
        VALUES (${referralCode.userId}, 1, 1, 'bronze', NOW())
        ON DUPLICATE KEY UPDATE
          totalReferrals = totalReferrals + 1,
          pendingReferrals = pendingReferrals + 1,
          lastReferralAt = NOW(),
          updatedAt = NOW()
      `);

      return {
        success: true,
        benefit: "14-day Pro trial activated",
      };
    }),

  /**
   * Get top referrers leaderboard
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        timeframe: z.enum(["all_time", "this_month", "this_week"]).default("all_time"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // For now, use all-time stats
      // In production, would filter by timeframe
      const result = await db.execute(sql`
        SELECT
          urs.userId,
          urs.totalReferrals,
          urs.successfulReferrals,
          urs.currentTier,
          u.name as userName
        FROM user_referral_stats urs
        JOIN users u ON u.id = urs.userId
        WHERE urs.totalReferrals > 0
        ORDER BY urs.successfulReferrals DESC, urs.totalReferrals DESC
        LIMIT ${input.limit}
      `);

      const leaderboard = ((result[0] as any[]) || []).map((row, index) => ({
        rank: index + 1,
        userId: row.userId,
        userName: row.userName || "Anonymous",
        totalReferrals: row.totalReferrals,
        successfulReferrals: row.successfulReferrals,
        tier: row.currentTier,
      }));

      return { leaderboard, timeframe: input.timeframe };
    }),

  /**
   * Track a viral event (share, view, etc.)
   */
  trackViralEvent: protectedProcedure
    .input(
      z.object({
        eventType: z.enum([
          "referral_code_generated",
          "referral_code_shared",
          "referral_code_copied",
          "share_button_tapped",
          "shift_share_shown",
          "shift_share_accepted",
          "shift_share_dismissed",
          "social_share_completed",
        ]),
        metadata: z
          .object({
            shareMethod: z.enum(["sms", "whatsapp", "email", "copy", "qr"]).optional(),
            referralCode: z.string().optional(),
            platform: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        // Silently fail - tracking should not break user experience
        return { tracked: false };
      }

      try {
        await db.execute(sql`
          INSERT INTO viral_events (userId, eventType, metadata, createdAt)
          VALUES (${ctx.user.id}, ${input.eventType}, ${JSON.stringify(input.metadata || {})}, NOW())
        `);
        return { tracked: true };
      } catch {
        return { tracked: false };
      }
    }),

  /**
   * Get share message templates
   */
  getShareTemplates: protectedProcedure.query(async ({ ctx }) => {
    // Get user's referral code
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const codeResult = await db.execute(sql`
      SELECT code FROM referral_codes WHERE userId = ${ctx.user.id} AND isActive = true LIMIT 1
    `);

    const code = (codeResult[0] as any[])?.[0]?.code || "CREW-XXXXX";
    const shareUrl = `https://protocolguide.app/join?ref=${code}`;

    return {
      sms: `Hey, I've been using Protocol Guide on shift - found the cardiac arrest protocol in 2 seconds instead of flipping through the book. Use my code ${code} for 2 weeks Pro free: ${shareUrl}`,
      whatsapp: `Check this out - Protocol Guide saved me during a call yesterday. 2.3 seconds to find what I needed. Try it free with my code: ${code}\n${shareUrl}`,
      email: {
        subject: "Check out Protocol Guide - 2 weeks free",
        body: `Hey,\n\nI wanted to share an app I've been using on shift called Protocol Guide. It lets you search EMS protocols instantly - found the cardiac arrest protocol in 2 seconds instead of flipping through the book.\n\nUse my referral code ${code} to get 2 weeks of Pro features free (normally just 1 week trial).\n\nDownload here: ${shareUrl}\n\nLet me know what you think!`,
      },
      generic: `Protocol Guide - find any EMS protocol in 2.3 seconds. Use code ${code} for 2 weeks free: ${shareUrl}`,
      shareUrl,
      code,
    };
  }),
});

export type ReferralRouter = typeof referralRouter;
