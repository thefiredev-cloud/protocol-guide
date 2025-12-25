/**
 * Sentry Client Configuration
 * For browser-side error tracking and performance monitoring
 *
 * HIPAA Note: PHI scrubbing is enabled to prevent sensitive data exposure
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// PHI patterns to scrub from error reports
const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
  /\b\d{9}\b/g, // SSN without dashes
  /\b[A-Z]{2}\d{6,8}\b/g, // Driver's license patterns
  /\b\d{10}\b/g, // Phone numbers
  /\b\d{1,3}\s*(yo|years?|y\.o\.?)\b/gi, // Age patterns
  /patient\s+name[:\s]+\S+/gi, // Patient name mentions
];

/**
 * Scrub potential PHI from strings
 */
function scrubPHI(value: unknown): unknown {
  if (typeof value === "string") {
    let scrubbed = value;
    for (const pattern of PHI_PATTERNS) {
      scrubbed = scrubbed.replace(pattern, "[REDACTED]");
    }
    return scrubbed;
  }
  if (Array.isArray(value)) {
    return value.map(scrubPHI);
  }
  if (value && typeof value === "object") {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      scrubbed[key] = scrubPHI(val);
    }
    return scrubbed;
  }
  return value;
}

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production" && !!SENTRY_DSN,

  // Performance monitoring - sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session replay disabled for HIPAA compliance
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Environment tag
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Scrub PHI from error reports
  beforeSend(event) {
    // Scrub event message
    if (event.message) {
      event.message = scrubPHI(event.message) as string;
    }

    // Scrub extra data
    if (event.extra) {
      event.extra = scrubPHI(event.extra) as Record<string, unknown>;
    }

    // Scrub breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
        ...breadcrumb,
        message: breadcrumb.message
          ? (scrubPHI(breadcrumb.message) as string)
          : undefined,
        data: breadcrumb.data
          ? (scrubPHI(breadcrumb.data) as Record<string, unknown>)
          : undefined,
      }));
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop",
    // Network errors (handled separately)
    "Failed to fetch",
    "NetworkError",
    // User aborted
    "AbortError",
  ],
});
