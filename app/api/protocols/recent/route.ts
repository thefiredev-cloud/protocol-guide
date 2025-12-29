/**
 * Recently Viewed Protocols API
 * GET /api/protocols/recent - Get recently viewed
 * POST /api/protocols/recent - Record a view
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../lib/api/handler';
import { authService } from '../../../../lib/auth/auth-service';

/**
 * GET /api/protocols/recent
 * Get user's recently viewed protocols
 */
export const GET = withApiHandler(
  async (input: unknown, req: NextRequest) => {
    void input;
    const token = req.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Placeholder - will query protocol_views table once migration is applied
    return NextResponse.json({ recent: [] });
  },
  { loggerName: 'api.protocols.recent' }
);

/**
 * POST /api/protocols/recent
 * Record a protocol view
 */
export const POST = withApiHandler(
  async (input: unknown, req: NextRequest) => {
    void input;
    const token = req.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { protocolId } = body;

    if (!protocolId) {
      return NextResponse.json({ error: 'protocolId is required' }, { status: 400 });
    }

    // Placeholder - will use RPC function once migration is applied
    return NextResponse.json({ success: true });
  },
  { loggerName: 'api.protocols.recent' }
);
