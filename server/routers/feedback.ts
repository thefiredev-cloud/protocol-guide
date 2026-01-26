/**
 * Feedback Router
 * Handles user feedback submissions
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(z.object({
      category: z.enum(["error", "suggestion", "general"]),
      subject: z.string().min(1).max(255),
      message: z.string().min(1),
      protocolRef: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await db.getUserById(ctx.user.id);
        await db.createFeedback({
          userId: ctx.user.id,
          category: input.category,
          subject: input.subject,
          message: input.message,
          protocolRef: input.protocolRef || null,
          countyId: user?.selectedAgencyId || null,
        });
        return { success: true, error: null };
      } catch (error) {
        console.error("[Feedback] submit error:", error);
        return { success: false, error: "Failed to submit feedback" };
      }
    }),

  myFeedback: protectedProcedure.query(async ({ ctx }) => {
    try {
      const feedback = await db.getUserFeedback(ctx.user.id);
      return feedback ?? [];
    } catch (error) {
      console.error("[Feedback] myFeedback error:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch feedback',
        cause: error,
      });
    }
  }),
});

export type FeedbackRouter = typeof feedbackRouter;
