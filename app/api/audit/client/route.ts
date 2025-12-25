/**
 * Client Audit Sync Endpoint
 * Receives batched audit events from client-side IndexedDB queue
 * HIPAA-compliant: validates and sanitizes before logging
 */

import * as crypto from 'node:crypto';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { withApiHandler } from '../../../../lib/api/handler';
import { auditLogger } from '../../../../lib/audit/audit-logger';
import type { AuditAction, AuditEvent, AuditOutcome } from '../../../../lib/audit/types';
import { createLogger } from '../../../../lib/log';

export const runtime = 'nodejs';

// Valid client-side audit actions
const CLIENT_AUDIT_ACTIONS: AuditAction[] = [
  'client.kb.search',
  'client.voice.start',
  'client.voice.transcribe',
  'client.offline.query',
  'client.protocol.expand',
  'protocol.view',
  'protocol.search',
];

// Zod schema for client audit events
const clientEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  action: z.enum(CLIENT_AUDIT_ACTIONS as [AuditAction, ...AuditAction[]]),
  resource: z.string().max(500),
  outcome: z.enum(['success', 'failure', 'partial'] as const),
  metadata: z
    .record(z.unknown())
    .optional()
    .transform((meta) => {
      // Strip any potential PHI fields from metadata
      if (!meta) return undefined;
      const sanitized = { ...meta };
      const phiFields = [
        'name',
        'firstName',
        'lastName',
        'dob',
        'dateOfBirth',
        'ssn',
        'address',
        'phone',
        'email',
        'mrn',
        'medicalRecordNumber',
        'patientName',
        'patientId',
      ];
      for (const field of phiFields) {
        delete sanitized[field];
      }
      return sanitized;
    }),
  sessionId: z.string().max(100).optional(),
  durationMs: z.number().int().min(0).max(3600000).optional(),
  errorMessage: z.string().max(1000).optional(),
});

const batchSchema = z.object({
  events: z.array(clientEventSchema).min(1).max(100),
});

/**
 * POST /api/audit/client - Sync client audit events
 *
 * Body:
 * - events: Array of client audit events (max 100)
 *
 * Returns: { synced: number }
 */
export const POST = withApiHandler(
  async (input: unknown, req: NextRequest) => {
    const logger = createLogger('api.audit.client');
    const startTime = Date.now();

    try {
      // Parse request body
      const body = await req.json();
      const parsed = batchSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
            },
          },
          { status: 400 }
        );
      }

      const { events } = parsed.data;

      // Get client info from request
      const ipAddress = getClientIP(req);
      const userAgent = req.headers.get('user-agent') || undefined;

      // Process each event
      let synced = 0;
      const errors: string[] = [];

      for (const clientEvent of events) {
        try {
          // Convert client event to full audit event
          const auditEvent: AuditEvent = {
            eventId: clientEvent.eventId,
            timestamp: clientEvent.timestamp,
            action: clientEvent.action,
            resource: clientEvent.resource,
            outcome: clientEvent.outcome as AuditOutcome,
            metadata: {
              ...clientEvent.metadata,
              source: 'client',
              syncedAt: new Date().toISOString(),
            },
            sessionId: clientEvent.sessionId,
            durationMs: clientEvent.durationMs,
            errorMessage: clientEvent.errorMessage,
            ipAddress,
            userAgent,
          };

          // Write to audit log using existing logger
          await writeClientEvent(auditEvent);
          synced++;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`${clientEvent.eventId}: ${message}`);
        }
      }

      const durationMs = Date.now() - startTime;

      logger.info('Client audit events synced', {
        synced,
        total: events.length,
        errors: errors.length,
        durationMs,
      });

      // Return success even if some events failed
      if (errors.length > 0 && synced === 0) {
        return NextResponse.json(
          {
            error: {
              code: 'SYNC_FAILED',
              message: 'All events failed to sync',
              details: errors.slice(0, 5), // Limit error details
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        synced,
        failed: errors.length,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to sync client audit events', { message });
      return NextResponse.json({ error: { code: 'SYNC_ERROR', message } }, { status: 500 });
    }
  },
  {
    rateLimit: 'API',
    loggerName: 'api.audit.client',
  }
);

/**
 * Write a client audit event using the server-side audit logger
 */
async function writeClientEvent(event: AuditEvent): Promise<void> {
  await auditLogger.writeRawEvent(event);
}

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string | undefined {
  // Check various headers for proxied requests
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return undefined;
}
