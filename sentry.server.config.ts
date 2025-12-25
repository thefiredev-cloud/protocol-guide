/**
 * Sentry Server Configuration
 * For server-side error tracking in API routes and SSR
 *
 * HIPAA Note: PHI scrubbing is enabled to prevent sensitive data exposure
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production" && !!SENTRY_DSN,

  // Performance monitoring - sample 10% of transactions
  tracesSampleRate: 0.1,

  // Environment tag
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Scrub sensitive data from server errors
  beforeSend(event) {
    // Remove any request body data (may contain PHI)
    if (event.request) {
      delete event.request.data;
      delete event.request.cookies;
    }

    // Scrub user data except ID
    if (event.user) {
      event.user = { id: event.user.id };
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Rate limiting
    "RateLimitError",
    // Auth errors (expected)
    "AuthSessionMissingError",
  ],
});
