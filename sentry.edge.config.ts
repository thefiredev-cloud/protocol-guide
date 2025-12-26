/**
 * Sentry Edge Configuration
 * For edge runtime error tracking (middleware, edge API routes)
 *
 * HIPAA Note: Minimal configuration for edge runtime
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production" && !!SENTRY_DSN,

  // Performance monitoring - sample 10% of transactions
  tracesSampleRate: 0.1,

  // Environment tag
  environment: process.env.NODE_ENV,
});
