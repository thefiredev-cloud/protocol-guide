import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "../../shared/const.js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Middleware that requires paid tier (pro or enterprise)
const requirePaidTier = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.user.tier !== "pro" && ctx.user.tier !== "enterprise") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires a Pro or Enterprise subscription",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const paidProcedure = t.procedure.use(requirePaidTier);

// Middleware that enforces daily query limits based on tier
const enforceRateLimit = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // Import getUserUsage dynamically to avoid circular dependency
  const { getUserUsage } = await import("../db.js");
  const usage = await getUserUsage(ctx.user.id);

  if (usage.count >= usage.limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Daily query limit reached (${usage.limit}). Upgrade to Pro for unlimited queries.`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const rateLimitedProcedure = t.procedure.use(enforceRateLimit);
