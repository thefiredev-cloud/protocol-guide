/**
 * CSRF Protection - DEPRECATED
 *
 * This file contains legacy Express-based CSRF protection that has been
 * migrated to tRPC's built-in CSRF middleware.
 *
 * MIGRATION NOTES:
 * ================
 *
 * 1. tRPC Implementation (server/_core/trpc.ts)
 *    - Built-in CSRF protection for all mutations
 *    - Uses double-submit cookie pattern (x-csrf-token header + csrf_token cookie)
 *    - SameSite=Strict cookies prevent cross-site attacks
 *    - Constant-time comparison prevents timing attacks
 *    - Queries are automatically exempt (safe from CSRF)
 *
 * 2. Protected Procedures
 *    - protectedProcedure: CSRF + authentication required
 *    - adminProcedure: CSRF + admin role required
 *    - paidProcedure: CSRF + paid tier required
 *    - rateLimitedProcedure: CSRF + rate limiting
 *
 * 3. CSRF Token Flow (Automatic)
 *    - Client makes request with credentials
 *    - Server sets csrf_token cookie (httpOnly, secure, SameSite=Strict)
 *    - Client reads cookie and sends value in x-csrf-token header
 *    - Server validates header matches cookie (constant-time)
 *
 * 4. Why tRPC is Better
 *    - No in-memory storage (works in distributed systems)
 *    - Automatic protection (no manual middleware application)
 *    - Type-safe (TypeScript end-to-end)
 *    - Better error handling (structured tRPC errors)
 *    - Integration with authentication middleware
 *
 * SECURITY CONSIDERATIONS:
 * ========================
 *
 * - Double-submit cookie pattern is secure when combined with SameSite=Strict
 * - Constant-time comparison prevents timing side-channel attacks
 * - httpOnly cookies prevent XSS-based token theft
 * - Secure flag ensures HTTPS-only transmission
 * - Mutations only (queries are safe from CSRF by design)
 *
 * DO NOT USE THIS FILE - It exists only for documentation and will be removed.
 * Use tRPC's built-in CSRF protection instead.
 */

import { Request, Response, NextFunction } from "express";

/**
 * @deprecated Use tRPC's csrfProtection middleware instead
 * This function is no longer used and will be removed.
 */
export function csrfProtection(_req: Request, _res: Response, next: NextFunction): void {
  console.warn(
    "[DEPRECATED] Legacy csrfProtection middleware called. Migrate to tRPC procedures."
  );
  next();
}

/**
 * @deprecated CSRF tokens are handled automatically by tRPC
 * This function is no longer used and will be removed.
 */
export function getCsrfToken(_req: Request, res: Response): void {
  console.warn(
    "[DEPRECATED] Legacy getCsrfToken endpoint called. Use tRPC auth procedures instead."
  );
  res.status(410).json({
    error: "This endpoint has been deprecated",
    message: "CSRF protection is now handled automatically by tRPC. No action needed.",
    migration: "Use tRPC mutations which include automatic CSRF protection",
  });
}

/**
 * @deprecated Not used with tRPC-based CSRF protection
 */
export function generateCsrfToken(): string {
  throw new Error("generateCsrfToken is deprecated. Use tRPC's automatic CSRF protection.");
}

/**
 * @deprecated Not needed with tRPC
 */
export function csrfExempt(_req: Request, _res: Response, next: NextFunction): void {
  next();
}
