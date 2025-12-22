/**
 * Current User API Endpoint
 * GET /api/auth/me - Get currently authenticated user
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { withApiHandler } from '@/lib/api/handler';
import { authService } from '@/lib/auth/auth-service';

/**
 * GET /api/auth/me
 * Return current user info if authenticated
 */
export const GET = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    const token = req.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = await authService.validateToken(token);
    return NextResponse.json({ user });
  },
  {
    loggerName: 'api.auth.me',
  }
);
