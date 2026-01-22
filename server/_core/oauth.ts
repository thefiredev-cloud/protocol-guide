import { COOKIE_NAME } from "../../shared/const.js";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";

/**
 * OAuth routes - simplified for Supabase Auth
 * Only logout endpoint needed; auth is handled by Supabase client-side
 */
export function registerOAuthRoutes(app: Express) {
  // Logout - clears session cookie
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}
