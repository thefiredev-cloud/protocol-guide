/**
 * Chat Session Detail API Endpoint
 * GET /api/chat/history/[sessionId] - Get session with messages
 * DELETE /api/chat/history/[sessionId] - Soft delete session
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { withApiHandler } from '../../../../../lib/api/handler';
import { chatHistoryService } from '../../../../../lib/services/chat/chat-history-service';

/**
 * GET /api/chat/history/[sessionId]
 * Get full session with messages
 */
export const GET = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    // Extract sessionId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const sessionId = pathParts[pathParts.length - 1];

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Session ID required' } },
        { status: 400 }
      );
    }

    const session = await chatHistoryService.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  },
  {
    rateLimit: 'API',
    loggerName: 'api.chat.history.session',
  }
);

/**
 * DELETE /api/chat/history/[sessionId]
 * Soft delete a session
 */
export const DELETE = withApiHandler(
  async (_input: unknown, req: NextRequest) => {
    // Extract sessionId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const sessionId = pathParts[pathParts.length - 1];

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Session ID required' } },
        { status: 400 }
      );
    }

    const success = await chatHistoryService.deleteSession(sessionId);

    if (!success) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  },
  {
    rateLimit: 'API',
    loggerName: 'api.chat.history.delete',
  }
);
