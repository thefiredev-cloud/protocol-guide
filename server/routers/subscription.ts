/**
 * Subscription Router
 *
 * Handles Stripe subscription and payment operations for Protocol Guide.
 * Supports individual user subscriptions (Pro tier) and department/agency
 * subscriptions with seat-based pricing.
 *
 * @module server/routers/subscription
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserTierInfo } from "../_core/tier-validation";
import * as db from "../db";
import * as stripe from "../stripe";

export const subscriptionRouter = router({
  /**
   * Create a Stripe Checkout session for individual subscription
   *
   * Creates a checkout URL for the user to complete their Pro subscription.
   * Supports both monthly ($4.99) and annual ($39/year) billing cycles.
   *
   * @param plan - Billing interval ("monthly" or "annual")
   * @param successUrl - URL to redirect after successful payment
   * @param cancelUrl - URL to redirect if user cancels
   * @returns Object with success status and checkout URL
   *
   * @example
   * const { url } = await trpc.subscription.createCheckout.mutate({
   *   plan: "annual",
   *   successUrl: "https://protocol-guide.com/success",
   *   cancelUrl: "https://protocol-guide.com/pricing",
   * });
   */
  createCheckout: protectedProcedure
    .input(z.object({
      plan: z.enum(["monthly", "annual"]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await stripe.createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          plan: input.plan,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        });

        if ('error' in result) {
          return { success: false, error: result.error, url: null };
        }

        return { success: true, error: null, url: result.url };
      } catch (error) {
        console.error('[Subscription] createCheckout error:', error);
        return { success: false, error: 'Failed to create checkout session', url: null };
      }
    }),

  /**
   * Create a Stripe Customer Portal session
   *
   * Generates a URL for users to manage their subscription, including:
   * - View billing history
   * - Update payment method
   * - Cancel subscription
   * - Switch between monthly/annual billing
   *
   * @param returnUrl - URL to redirect after portal session ends
   * @returns Object with success status and portal URL
   */
  createPortal: protectedProcedure
    .input(z.object({
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user.stripeCustomerId) {
          return { success: false, error: "No subscription found", url: null };
        }

        const result = await stripe.createCustomerPortalSession({
          stripeCustomerId: ctx.user.stripeCustomerId,
          returnUrl: input.returnUrl,
        });

        if ('error' in result) {
          return { success: false, error: result.error, url: null };
        }

        return { success: true, error: null, url: result.url };
      } catch (error) {
        console.error('[Subscription] createPortal error:', error);
        return { success: false, error: 'Failed to create portal session', url: null };
      }
    }),

  /**
   * Get current subscription status and tier features
   *
   * Returns comprehensive information about the user's subscription including:
   * - Current tier (free/pro/enterprise)
   * - Feature limits (queries/day, search results, etc.)
   * - Subscription status (active, canceled, past_due)
   * - Expiration date if applicable
   *
   * @returns UserTierInfo object with tier details and features
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tierInfo = await getUserTierInfo(ctx.user.id);
      return tierInfo;
    } catch (error) {
      console.error('[Subscription] status error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch subscription status',
        cause: error,
      });
    }
  }),

  // Create department/agency checkout session
  createDepartmentCheckout: protectedProcedure
    .input(z.object({
      agencyId: z.number(),
      tier: z.enum(["starter", "professional", "enterprise"]),
      seatCount: z.number().min(1).max(1000),
      interval: z.enum(["monthly", "annual"]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission to manage this agency
      const isAdmin = await db.isUserAgencyAdmin(ctx.user.id, input.agencyId);
      if (!isAdmin) {
        return { success: false, error: "Not authorized to manage this agency", url: null };
      }

      // Get agency details
      const dbInstance = await db.getDb();
      if (!dbInstance) {
        return { success: false, error: "Database connection failed", url: null };
      }

      const { agencies } = await import("../../drizzle/schema.js");
      const { eq } = await import("drizzle-orm");

      const [agency] = await dbInstance.select().from(agencies)
        .where(eq(agencies.id, input.agencyId))
        .limit(1);

      if (!agency) {
        return { success: false, error: "Agency not found", url: null };
      }

      const result = await stripe.createDepartmentCheckoutSession({
        agencyId: input.agencyId,
        agencyEmail: agency.contactEmail || ctx.user.email || "",
        tier: input.tier,
        seatCount: input.seatCount,
        interval: input.interval,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      });

      if ('error' in result) {
        return { success: false, error: result.error, url: null };
      }

      return { success: true, error: null, url: result.url };
    }),
});

export type SubscriptionRouter = typeof subscriptionRouter;
