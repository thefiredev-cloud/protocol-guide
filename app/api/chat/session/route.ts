/**
 * Chat Session API Endpoint
 * POST /api/chat/session - Create a new chat session
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { withApiHandler } from '@/lib/api/handler';
import { chatHistoryService } from '@/lib/services/chat/chat-history-service';
import { generateDeviceFingerprint } from '@/lib/utils/device-fingerprint';

/**
 * Create session request schema
 */
const createSessionSchema = z.object({
  title: z.string().optional(),
  providerLevel: z.enum(['EMT', 'Paramedic']),
});

type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * POST /api/chat/session
 * Create a new chat session
 */
export const POST = withApiHandler<CreateSessionInput>(
  async (input, req: NextRequest) => {
    const deviceFingerprint = generateDeviceFingerprint(req);
    const userId = req.headers.get('x-user-id') ?? undefined;

    const sessionId = await chatHistoryService.createSession({
      userId,
      deviceFingerprint,
      providerLevel: input.providerLevel,
      title: input.title,
    });

    if (!sessionId) {
      // Return a temporary session ID for offline/no-DB mode
      return NextResponse.json({
        sessionId: crypto.randomUUID(),
        persisted: false,
      });
    }

    return NextResponse.json({
      sessionId,
      persisted: true,
    });
  },
  {
    schema: createSessionSchema,
    rateLimit: 'API',
    loggerName: 'api.chat.session.create',
  }
);
