/**
 * Admin Router
 * Handles admin-only procedures for feedback, users, and audit logs
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const adminRouter = router({
  // List all feedback with optional status filter and pagination
  listFeedback: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      try {
        const { status, limit, offset } = input || {};
        const result = await db.getAllFeedbackPaginated({ status, limit, offset });
        return result ?? { feedback: [], total: 0 };
      } catch (error) {
        console.error('[Admin] listFeedback error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch feedback',
          cause: error,
        });
      }
    }),

  // Update feedback status and admin notes
  updateFeedback: adminProcedure
    .input(z.object({
      feedbackId: z.number(),
      status: z.enum(["pending", "reviewed", "resolved", "dismissed"]),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current feedback to log the change
        const currentFeedback = await db.getFeedbackById(input.feedbackId);
        if (!currentFeedback) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Feedback not found",
          });
        }

        const oldStatus = currentFeedback.status;

        // Update feedback
        await db.updateFeedbackStatus(input.feedbackId, input.status, input.adminNotes);

        // Log audit event
        await db.logAuditEvent({
          userId: ctx.user.id,
          action: "FEEDBACK_STATUS_CHANGED",
          entityType: "feedback",
          entityId: String(input.feedbackId),
          metadata: {
            oldStatus,
            newStatus: input.status,
            adminNotes: input.adminNotes,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Admin] updateFeedback error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feedback',
          cause: error,
        });
      }
    }),

  // List all users with optional filters and pagination
  listUsers: adminProcedure
    .input(z.object({
      tier: z.enum(["free", "pro", "enterprise"]).optional(),
      role: z.enum(["user", "admin"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      try {
        const { tier, role, limit, offset } = input || {};
        const result = await db.getAllUsersPaginated({ tier, role, limit, offset });
        return result ?? { users: [], total: 0 };
      } catch (error) {
        console.error('[Admin] listUsers error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
          cause: error,
        });
      }
    }),

  // Update a user's role
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Cannot change own role
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot change your own role",
          });
        }

        // Get current user to log the change
        const targetUser = await db.getUserById(input.userId);
        if (!targetUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const oldRole = targetUser.role;

        // Update role
        await db.updateUserRole(input.userId, input.role);

        // Log audit event
        await db.logAuditEvent({
          userId: ctx.user.id,
          action: "USER_ROLE_CHANGED",
          entityType: "user",
          entityId: String(input.userId),
          metadata: {
            targetEmail: targetUser.email,
            oldRole,
            newRole: input.role,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Admin] updateUserRole error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role',
          cause: error,
        });
      }
    }),

  // List contact form submissions with optional status filter and pagination
  listContactSubmissions: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "reviewed", "resolved"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      try {
        const { status, limit, offset } = input || {};
        const result = await db.getAllContactSubmissionsPaginated({ status, limit, offset });
        return result ?? { submissions: [], total: 0 };
      } catch (error) {
        console.error('[Admin] listContactSubmissions error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contact submissions',
          cause: error,
        });
      }
    }),

  // Update contact submission status
  updateContactStatus: adminProcedure
    .input(z.object({
      submissionId: z.number(),
      status: z.enum(["pending", "reviewed", "resolved"]),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current submission to log the change
        const currentSubmission = await db.getContactSubmissionById(input.submissionId);
        if (!currentSubmission) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Contact submission not found",
          });
        }

        const oldStatus = currentSubmission.status;

        // Update status
        await db.updateContactSubmissionStatus(input.submissionId, input.status);

        // Log audit event
        await db.logAuditEvent({
          userId: ctx.user.id,
          action: "CONTACT_STATUS_CHANGED",
          entityType: "contact",
          entityId: String(input.submissionId),
          metadata: {
            contactEmail: currentSubmission.email,
            oldStatus,
            newStatus: input.status,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Admin] updateContactStatus error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update contact status',
          cause: error,
        });
      }
    }),

  // Get audit logs (admin can view all audit logs)
  getAuditLogs: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      try {
        const { limit, offset } = input || {};
        const logs = await db.getAuditLogs({ limit, offset });
        return logs ?? { logs: [], total: 0 };
      } catch (error) {
        console.error('[Admin] getAuditLogs error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs',
          cause: error,
        });
      }
    }),
});

export type AdminRouter = typeof adminRouter;
