/**
 * User Router
 * Handles user-related procedures including profile, counties, and queries
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { getDb } from "../db";
import * as dbUserCounties from "../db-user-counties";
import { pushTokens } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export const userRouter = router({
  usage: protectedProcedure.query(async ({ ctx }) => {
    try {
      const usage = await db.getUserUsage(ctx.user.id);
      return usage ?? { queryCount: 0, queryLimit: 10 };
    } catch (error) {
      console.error('[User] usage error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch usage data',
      });
    }
  }),

  /**
   * P0 CRITICAL: Medical Disclaimer Acknowledgment
   * Records timestamp when user acknowledges medical disclaimer
   * Required for legal compliance before accessing protocol search
   */
  acknowledgeDisclaimer: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        return await db.acknowledgeDisclaimer(ctx.user.id);
      } catch (error) {
        console.error('[User] acknowledgeDisclaimer error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to acknowledge disclaimer',
        });
      }
    }),

  /**
   * Check if user has acknowledged the medical disclaimer
   */
  hasAcknowledgedDisclaimer: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const hasAcknowledged = await db.hasAcknowledgedDisclaimer(ctx.user.id);
        return { hasAcknowledged };
      } catch (error) {
        console.error('[User] hasAcknowledgedDisclaimer error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check disclaimer status',
        });
      }
    }),

  selectCounty: protectedProcedure
    .input(z.object({ countyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db.updateUserCounty(ctx.user.id, input.countyId);
        return { success: true };
      } catch (error) {
        console.error('[User] selectCounty error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update selected county',
        });
      }
    }),

  queries: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ ctx, input }) => {
      try {
        const queries = await db.getUserQueries(ctx.user.id, input.limit);
        return queries ?? [];
      } catch (error) {
        console.error('[User] queries error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch queries',
        });
      }
    }),

  // Saved counties for tier-restricted access
  savedCounties: protectedProcedure.query(async ({ ctx }) => {
    try {
      const counties = await dbUserCounties.getUserCounties(ctx.user.id);
      const { canAdd, currentCount, maxAllowed, tier } = await dbUserCounties.canUserAddCounty(ctx.user.id);
      return {
        counties: counties ?? [],
        canAdd,
        currentCount,
        maxAllowed,
        tier,
      };
    } catch (error) {
      console.error('[User] savedCounties error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch saved counties',
      });
    }
  }),

  addCounty: protectedProcedure
    .input(z.object({
      countyId: z.number(),
      isPrimary: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await dbUserCounties.addUserCounty(
        ctx.user.id,
        input.countyId,
        input.isPrimary
      );
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to add county",
        });
      }
      return result;
    }),

  removeCounty: protectedProcedure
    .input(z.object({ countyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await dbUserCounties.removeUserCounty(ctx.user.id, input.countyId);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to remove county",
        });
      }
      return { success: true };
    }),

  setPrimaryCounty: protectedProcedure
    .input(z.object({ countyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await dbUserCounties.setUserPrimaryCounty(ctx.user.id, input.countyId);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to set primary county",
        });
      }
      return { success: true };
    }),

  primaryCounty: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await dbUserCounties.getUserPrimaryCounty(ctx.user.id);
    } catch (error) {
      console.error('[User] primaryCounty error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch primary county',
      });
    }
  }),

  savePushToken: protectedProcedure
    .input(z.object({
      token: z.string(),
      platform: z.enum(['ios', 'android']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { token, platform } = input;
        const userId = ctx.user.id;

        // Upsert - update lastUsedAt if exists, insert if new
        const database = await getDb();
        if (!database) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection unavailable',
          });
        }
        
        const existing = await database
          .select()
          .from(pushTokens)
          .where(and(eq(pushTokens.userId, userId), eq(pushTokens.token, token)))
          .limit(1);

        if (existing.length > 0) {
          await database
            .update(pushTokens)
            .set({ lastUsedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(pushTokens.id, existing[0].id));
        } else {
          await database.insert(pushTokens).values({ userId, token, platform });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[User] savePushToken error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save push token',
        });
      }
    }),
});

export type UserRouter = typeof userRouter;
