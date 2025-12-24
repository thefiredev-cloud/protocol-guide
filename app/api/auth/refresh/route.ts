/**
 * Token Refresh API Endpoint
 * POST /api/auth/refresh - Refresh access token using refresh token
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { withApiHandler } from '../../../../lib/api/handler';
import { authService } from '../../../../lib/auth/auth-service';
import { SESSION_TIMEOUT_MS } from '../../../../lib/auth/types';

/**
 * POST /api/auth/refresh
 * Refresh session tokens
 */
export const POST = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    const refreshToken = req.cookies.get('sb-refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token' } },
        { status: 401 }
      );
    }

    const session = await authService.refreshSession(refreshToken);

    if (!session) {
      const response = NextResponse.json(
        { error: { code: 'REFRESH_FAILED', message: 'Session expired' } },
        { status: 401 }
      );
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return response;
    }

    const response = NextResponse.json({
      user: session.user,
      expiresAt: session.expiresAt,
    });

    // Update cookies with new tokens
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAgeSeconds = Math.floor(SESSION_TIMEOUT_MS / 1000);

    response.cookies.set('sb-access-token', session.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict', // Strict to prevent CSRF
      maxAge: maxAgeSeconds,
      path: '/',
    });

    response.cookies.set('sb-refresh-token', session.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict', // Strict to prevent CSRF
      maxAge: 24 * 60 * 60, // 24 hours (reduced from 7 days)
      path: '/',
    });

    return response;
  },
  {
    rateLimit: 'AUTH',
    loggerName: 'api.auth.refresh',
  }
);
