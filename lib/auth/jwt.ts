/**
 * JWT Utilities for Medic-Bot
 * Helper functions for extracting and validating JWT tokens from requests
 */

import type { NextRequest } from 'next/server';

import type { AuthUser } from './types';
import { authService } from './auth-service';

/**
 * Extract authenticated user from request
 * Checks Authorization header first, then falls back to cookie
 *
 * @param req - Next.js request object
 * @returns Authenticated user if valid token, null otherwise
 */
export async function extractAuthUser(
  req: NextRequest
): Promise<AuthUser | null> {
  const token = extractToken(req);
  if (!token) {
    return null;
  }

  return authService.validateToken(token);
}

/**
 * Extract JWT token from request
 * Priority: Authorization header > Cookie
 *
 * @param req - Next.js request object
 * @returns JWT token string or null
 */
export function extractToken(req: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fall back to cookie
  return extractTokenFromCookie(req);
}

/**
 * Extract JWT token from cookie
 *
 * @param req - Next.js request object
 * @returns JWT token string or null
 */
export function extractTokenFromCookie(req: NextRequest): string | null {
  const cookie = req.cookies.get('sb-access-token');
  return cookie?.value ?? null;
}

/**
 * Extract refresh token from cookie
 *
 * @param req - Next.js request object
 * @returns Refresh token string or null
 */
export function extractRefreshToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('sb-refresh-token');
  return cookie?.value ?? null;
}
