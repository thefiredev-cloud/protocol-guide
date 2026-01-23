/**
 * Subscription Router
 * Handles Stripe subscription and payment operations
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as stripe from "../stripe";

export const subscriptionRouter = router({
  // Create checkout session for subscription
  createCheckout: protectedProcedure
    .input(z.object({
      plan: z.enum(["monthly", "annual"]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
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
    }),

  // Create customer portal session for managing subscription
  createPortal: protectedProcedure
    .input(z.object({
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
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
    }),

  // Get current subscription status
  status: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) {
      return {
        tier: "free" as const,
        subscriptionStatus: null,
        subscriptionEndDate: null,
      };
    }

    return {
      tier: user.tier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
    };
  }),
});

export type SubscriptionRouter = typeof subscriptionRouter;
