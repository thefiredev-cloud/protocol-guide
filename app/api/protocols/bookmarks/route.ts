/**
 * Protocol Bookmarks API
 * GET /api/protocols/bookmarks - Get user's bookmarks
 * POST /api/protocols/bookmarks - Toggle bookmark
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { withApiHandler } from '../../../../lib/api/handler';
import { authService } from '../../../../lib/auth/auth-service';

/**
 * GET /api/protocols/bookmarks
 * Get user's bookmarked protocols
 */
export const GET = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    const token = req.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return empty array - bookmarks table needs to be migrated first
    // Once migration is applied, this will query the protocol_bookmarks table
    return NextResponse.json({ bookmarks: [] });
  },
  { loggerName: 'api.protocols.bookmarks' }
);

/**
 * POST /api/protocols/bookmarks
 * Toggle bookmark for a protocol
 */
export const POST = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
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
    return NextResponse.json({ success: true, action: 'added', bookmarked: true });
  },
  { loggerName: 'api.protocols.bookmarks' }
);
