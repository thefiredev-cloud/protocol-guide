/**
 * Client Audit Sync Endpoint
 * Receives batched audit events from client-side IndexedDB queue
 * HIPAA-compliant: validates and sanitizes before logging
 */

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

// PHI fields to strip from metadata
const PHI_FIELDS = [
  'name', 'firstName', 'lastName', 'dob', 'dateOfBirth',
  'ssn', 'address', 'phone', 'email', 'mrn',
  'medicalRecordNumber', 'patientName', 'patientId',
];

// Zod schema for client audit events
const clientEventSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  action: z.enum(CLIENT_AUDIT_ACTIONS as [AuditAction, ...AuditAction[]]),
  resource: z.string().max(500),
  outcome: z.enum(['success', 'failure', 'partial'] as const),
  metadata: z.record(z.unknown()).optional().transform(sanitizeMetadata),
  sessionId: z.string().max(100).optional(),
  durationMs: z.number().int().min(0).max(3600000).optional(),
  errorMessage: z.string().max(1000).optional(),
});

const batchSchema = z.object({
  events: z.array(clientEventSchema).min(1).max(100),
});

type ClientEvent = z.infer<typeof clientEventSchema>;

/** Sanitize metadata by removing PHI fields */
function sanitizeMetadata(meta: Record<string, unknown> | undefined) {
  if (!meta) return undefined;
  const sanitized = { ...meta };
  for (const field of PHI_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}

/** Convert client event to full audit event */
function toAuditEvent(
  clientEvent: ClientEvent,
  ipAddress: string | undefined,
  userAgent: string | undefined
): AuditEvent {
  return {
    eventId: clientEvent.eventId,
    timestamp: clientEvent.timestamp,
    action: clientEvent.action,
    resource: clientEvent.resource,
    outcome: clientEvent.outcome as AuditOutcome,
    metadata: { ...clientEvent.metadata, source: 'client', syncedAt: new Date().toISOString() },
    sessionId: clientEvent.sessionId,
    durationMs: clientEvent.durationMs,
    errorMessage: clientEvent.errorMessage,
    ipAddress,
    userAgent,
  };
}

/** Process batch of events and return sync results */
async function processBatch(
  events: ClientEvent[],
  ipAddress: string | undefined,
  userAgent: string | undefined
): Promise<{ synced: number; errors: string[] }> {
  let synced = 0;
  const errors: string[] = [];

  for (const clientEvent of events) {
    try {
      const auditEvent = toAuditEvent(clientEvent, ipAddress, userAgent);
      await auditLogger.writeRawEvent(auditEvent);
      synced++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${clientEvent.eventId}: ${message}`);
    }
  }

  return { synced, errors };
}

/** Get client IP address from request headers */
function getClientIP(req: NextRequest): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || undefined;
}

/**
 * POST /api/audit/client - Sync client audit events
 */
export const POST = withApiHandler(
  async (input: unknown, req: NextRequest) => {
    const logger = createLogger('api.audit.client');
    const startTime = Date.now();

    const body = await req.json();
    const parsed = batchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') } },
        { status: 400 }
      );
    }

    const { synced, errors } = await processBatch(
      parsed.data.events,
      getClientIP(req),
      req.headers.get('user-agent') || undefined
    );

    logger.info('Client audit events synced', { synced, total: parsed.data.events.length, errors: errors.length, durationMs: Date.now() - startTime });

    if (errors.length > 0 && synced === 0) {
      return NextResponse.json({ error: { code: 'SYNC_FAILED', message: 'All events failed to sync', details: errors.slice(0, 5) } }, { status: 500 });
    }

    return NextResponse.json({ synced, failed: errors.length });
  },
  { rateLimit: 'API', loggerName: 'api.audit.client' }
);
