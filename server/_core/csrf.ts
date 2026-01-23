/**
 * CSRF Protection Middleware
 * Protects auth endpoints from Cross-Site Request Forgery attacks
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import crypto from "crypto";

const CSRF_TOKEN_HEADER = "x-csrf-token";
const CSRF_COOKIE_NAME = "csrf_token";
const TOKEN_EXPIRY_MS = 3600000; // 1 hour

interface CsrfTokenData {
  token: string;
  createdAt: number;
}

// In-memory store for CSRF tokens (use Redis in production for distributed systems)
const tokenStore = new Map<string, CsrfTokenData>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of tokenStore.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRY_MS) {
      tokenStore.delete(key);
    }
  }
}, 300000); // Clean every 5 minutes

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Store CSRF token
 */
function storeToken(sessionId: string, token: string): void {
  tokenStore.set(sessionId, {
    token,
    createdAt: Date.now(),
  });
}

/**
 * Validate CSRF token
 */
function validateToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);

  if (!stored) {
    return false;
  }

  // Check expiration
  if (Date.now() - stored.createdAt > TOKEN_EXPIRY_MS) {
    tokenStore.delete(sessionId);
    return false;
  }

  // Compare tokens (constant-time comparison to prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(stored.token),
    Buffer.from(token)
  );
}

/**
 * Get session ID from request (use existing session cookie or create temp ID)
 */
function getSessionId(req: Request): string {
  // Use existing session cookie if available
  const sessionCookie = req.cookies?.app_session_id;
  if (sessionCookie) {
    return sessionCookie;
  }

  // For unauthenticated requests, use IP + User-Agent as identifier
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  return crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex");
}

/**
 * CSRF middleware - generates and validates tokens
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const sessionId = getSessionId(req);

  // For GET requests, generate and send token
  if (req.method === "GET") {
    const token = generateCsrfToken();
    storeToken(sessionId, token);

    // Send token in cookie (httpOnly for security)
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: req.protocol === "https",
      sameSite: "strict",
      maxAge: TOKEN_EXPIRY_MS,
    });

    return next();
  }

  // For state-changing methods (POST, PUT, DELETE), validate token
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const token = req.headers[CSRF_TOKEN_HEADER] as string;
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    // Token must be present in both header and cookie
    if (!token || !cookieToken) {
      logger.warn(
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          hasToken: !!token,
          hasCookie: !!cookieToken,
        },
        "CSRF token missing"
      );

      return res.status(403).json({
        error: "CSRF token missing",
        code: "CSRF_MISSING",
      });
    }

    // Tokens must match
    if (token !== cookieToken) {
      logger.warn(
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
        },
        "CSRF token mismatch"
      );

      return res.status(403).json({
        error: "CSRF token mismatch",
        code: "CSRF_MISMATCH",
      });
    }

    // Validate stored token
    if (!validateToken(sessionId, token)) {
      logger.warn(
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
        },
        "CSRF token invalid or expired"
      );

      return res.status(403).json({
        error: "CSRF token invalid or expired",
        code: "CSRF_INVALID",
      });
    }

    // Token is valid - regenerate for next request
    const newToken = generateCsrfToken();
    storeToken(sessionId, newToken);

    res.cookie(CSRF_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: req.protocol === "https",
      sameSite: "strict",
      maxAge: TOKEN_EXPIRY_MS,
    });

    logger.debug(
      {
        method: req.method,
        path: req.path,
      },
      "CSRF token validated successfully"
    );
  }

  next();
}

/**
 * Get CSRF token for client use
 */
export function getCsrfToken(req: Request, res: Response): void {
  const token = req.cookies?.[CSRF_COOKIE_NAME];

  if (!token) {
    const sessionId = getSessionId(req);
    const newToken = generateCsrfToken();
    storeToken(sessionId, newToken);

    res.cookie(CSRF_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: req.protocol === "https",
      sameSite: "strict",
      maxAge: TOKEN_EXPIRY_MS,
    });

    return res.json({ csrfToken: newToken });
  }

  res.json({ csrfToken: token });
}

/**
 * Exempt specific routes from CSRF protection (e.g., webhooks)
 */
export function csrfExempt(_req: Request, _res: Response, next: NextFunction): void {
  next();
}
