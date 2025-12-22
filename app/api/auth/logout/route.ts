/**
 * Logout API Endpoint
 * POST /api/auth/logout - End user session and clear tokens
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { withApiHandler } from '@/lib/api/handler';
import { authService } from '@/lib/auth/auth-service';

/**
 * POST /api/auth/logout
 * End session and clear cookies
 */
export const POST = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    const token = req.cookies.get('sb-access-token')?.value;

    if (token) {
      try {
        await authService.logout(token);
      } catch {
        // Ignore logout errors - still clear cookies
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear session cookies
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  },
  {
    loggerName: 'api.auth.logout',
  }
);
