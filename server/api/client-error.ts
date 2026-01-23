/**
 * Client Error Reporting API
 *
 * Receives error reports from the client-side ErrorBoundary
 * and forwards them to Sentry for centralized tracking.
 */

import type { Request, Response } from 'express';
import { captureException, captureMessage } from '../_core/sentry';
import { logger } from '../_core/logger';

// Error payload types
interface ClientErrorPayload {
  type: 'error';
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: {
    section?: string;
    componentStack?: string;
    extra?: Record<string, unknown>;
    platform?: string;
    url?: string;
    userAgent?: string;
  };
  user?: {
    id?: string;
    email?: string;
  } | null;
  breadcrumbs?: {
    message: string;
    category: string;
    data?: Record<string, unknown>;
    timestamp: string;
  }[];
  timestamp: string;
}

interface ClientMessagePayload {
  type: 'message';
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  context: {
    platform?: string;
    url?: string;
  };
  user?: {
    id?: string;
    email?: string;
  } | null;
  timestamp: string;
}

type ClientPayload = ClientErrorPayload | ClientMessagePayload;

/**
 * Handle client error reports
 *
 * POST /api/client-error
 */
export async function clientErrorHandler(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as ClientPayload;

    if (!payload || !payload.type) {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    if (payload.type === 'error') {
      handleErrorReport(payload);
    } else if (payload.type === 'message') {
      handleMessageReport(payload);
    } else {
      res.status(400).json({ error: 'Unknown payload type' });
      return;
    }

    // Always return success to client (don't block on error reporting)
    res.status(200).json({ received: true });
  } catch (err) {
    // Log but don't expose internal errors
    logger.error({ err }, '[ClientError] Failed to process error report');
    res.status(200).json({ received: true }); // Still return success
  }
}

/**
 * Process error report from client
 */
function handleErrorReport(payload: ClientErrorPayload): void {
  const { error, context, user, breadcrumbs, timestamp } = payload;

  // Create a proper Error object for Sentry
  const clientError = new Error(error.message);
  clientError.name = error.name || 'ClientError';
  if (error.stack) {
    clientError.stack = error.stack;
  }

  // Log the error
  logger.error({
    errorName: error.name,
    errorMessage: error.message,
    section: context.section,
    platform: context.platform,
    url: context.url,
    userId: user?.id,
    timestamp,
  }, '[ClientError] Client-side error reported');

  // Forward to Sentry with context
  try {
    captureException(clientError);
  } catch (sentryErr) {
    logger.warn({ sentryErr }, '[ClientError] Failed to forward to Sentry');
  }
}

/**
 * Process message report from client
 */
function handleMessageReport(payload: ClientMessagePayload): void {
  const { message, level, context, user, timestamp } = payload;

  // Log the message
  logger.info({
    level,
    message,
    platform: context.platform,
    url: context.url,
    userId: user?.id,
    timestamp,
  }, '[ClientError] Client-side message reported');

  // Forward to Sentry if warning or above
  if (level === 'warning' || level === 'error' || level === 'fatal') {
    try {
      captureMessage(message, level);
    } catch (sentryErr) {
      logger.warn({ sentryErr }, '[ClientError] Failed to forward message to Sentry');
    }
  }
}
