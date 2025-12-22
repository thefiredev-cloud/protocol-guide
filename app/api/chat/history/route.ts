/**
 * Chat History List API Endpoint
 * GET /api/chat/history - List user's chat sessions
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { withApiHandler } from '@/lib/api/handler';
import { chatHistoryService } from '@/lib/services/chat/chat-history-service';
import { generateDeviceFingerprint } from '@/lib/utils/device-fingerprint';

/**
 * GET /api/chat/history
 * List user's chat sessions
 */
export const GET = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    const deviceFingerprint = generateDeviceFingerprint(req);
    const userId = req.headers.get('x-user-id') ?? undefined;

    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') ?? '20', 10), 1),
      100
    );
    const offset = Math.max(
      parseInt(searchParams.get('offset') ?? '0', 10),
      0
    );

    const sessions = await chatHistoryService.listSessions({
      userId,
      deviceFingerprint: userId ? undefined : deviceFingerprint,
      limit,
      offset,
    });

    return NextResponse.json({ sessions });
  },
  {
    rateLimit: 'API',
    loggerName: 'api.chat.history',
  }
);
