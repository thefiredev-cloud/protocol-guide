/**
 * Auth Router
 * Handles authentication-related procedures with CSRF protection
 */

import { COOKIE_NAME } from "../../shared/const.js";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { revokeUserTokens } from "../_core/token-blacklist";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../_core/logger";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  /**
   * Logout - requires CSRF protection via protectedProcedure
   * This prevents CSRF attacks where malicious sites log users out
   * Also revokes the token on Supabase for immediate invalidation
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const authHeader = ctx.req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    // Revoke token on Supabase if present for immediate invalidation
    if (token) {
      try {
        await supabaseAdmin.auth.admin.signOut(token);
        logger.info(
          { userId: ctx.user.id, requestId: ctx.trace?.requestId },
          "User logged out with token revocation"
        );
      } catch (error) {
        logger.error(
          { error, userId: ctx.user.id, requestId: ctx.trace?.requestId },
          "Failed to revoke token on logout"
        );
      }
    }

    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  /**
   * Logout from all devices by revoking all existing tokens
   * Useful for password changes, security incidents, or user-initiated logout
   */
  logoutAllDevices: protectedProcedure.mutation(async ({ ctx }) => {
    const revoked = await revokeUserTokens(ctx.user.id.toString(), "user_initiated_logout_all");
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true, revoked } as const;
  }),
});

export type AuthRouter = typeof authRouter;
