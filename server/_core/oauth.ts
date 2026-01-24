import type { Express } from "express";

/**
 * OAuth routes - DEPRECATED
 *
 * Legacy OAuth endpoints have been migrated to tRPC for better CSRF protection:
 * - POST /api/auth/logout → auth.logout mutation (with built-in CSRF protection)
 * - GET /api/auth/csrf-token → No longer needed (tRPC handles CSRF automatically)
 *
 * tRPC provides superior CSRF protection via:
 * 1. Double-submit cookie pattern (x-csrf-token header + csrf_token cookie)
 * 2. SameSite=Strict cookies (prevents cross-site cookie sending)
 * 3. Constant-time token comparison (prevents timing attacks)
 * 4. Automatic mutation protection (queries exempt, mutations protected)
 *
 * This function is kept for backward compatibility but does nothing.
 * It will be removed in a future version.
 */
export function registerOAuthRoutes(_app: Express) {
  // All OAuth/auth functionality migrated to tRPC (authRouter)
  // See server/routers/auth.ts for logout procedures
}
