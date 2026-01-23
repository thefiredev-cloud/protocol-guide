/**
 * Protocol Guide - Client-Side Error Reporting
 *
 * Provides error tracking by reporting to the server-side Sentry.
 * Works on both mobile and web platforms without requiring native SDK.
 *
 * Usage:
 *   import { captureError, captureMessage, addBreadcrumb } from '@/lib/sentry-client';
 */

import { Platform } from 'react-native';

/**
 * Get the API base URL for error reporting
 */
function getApiBaseUrl(): string {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

  if (API_BASE_URL) {
    return API_BASE_URL.replace(/\/$/, '');
  }

  // On web, derive from current hostname
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;

    if (hostname === 'localhost' && port === '8081') {
      return `${protocol}//localhost:3000`;
    }

    const apiHostname = hostname.replace(/^8081-/, '3000-');
    if (apiHostname !== hostname) {
      return `${protocol}//${apiHostname}`;
    }
  }

  return '';
}

// Error context types
export type ErrorContext = {
  componentStack?: string;
  section?: 'search' | 'voice' | 'protocol_viewer' | 'navigation' | 'general';
  userId?: string;
  extra?: Record<string, unknown>;
};

// Severity levels
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Breadcrumb storage (in-memory, limited to last 20)
const breadcrumbs: {
  message: string;
  category: string;
  data?: Record<string, unknown>;
  timestamp: string;
}[] = [];
const MAX_BREADCRUMBS = 20;

// User context
let currentUser: { id?: string; email?: string } | null = null;

/**
 * Capture an error to server-side Sentry with optional context
 *
 * @param error - The error to capture
 * @param context - Additional context about where/why the error occurred
 */
export function captureError(error: Error, context?: ErrorContext): void {
  // Always log to console
  console.error('[Error]', error.message);
  if (context?.componentStack) {
    console.error('[Component Stack]', context.componentStack.slice(0, 500));
  }

  // Don't report errors in development unless explicitly enabled
  if (__DEV__ && !process.env.EXPO_PUBLIC_REPORT_DEV_ERRORS) {
    return;
  }

  reportErrorToServer(error, context);
}

/**
 * Capture a message to server-side Sentry
 */
export function captureMessage(message: string, level: SeverityLevel = 'info'): void {
  if (__DEV__) {
    console.log(`[Sentry ${level}]`, message);
  }

  // Only report warnings and above in production
  if (!__DEV__ && (level === 'warning' || level === 'error' || level === 'fatal')) {
    reportMessageToServer(message, level);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string } | null): void {
  currentUser = user;
}

/**
 * Add breadcrumb for tracking user actions leading to errors
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  breadcrumbs.push({
    message,
    category,
    data,
    timestamp: new Date().toISOString(),
  });

  // Keep only last N breadcrumbs
  while (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

/**
 * Clear breadcrumbs (e.g., after successful navigation)
 */
export function clearBreadcrumbs(): void {
  breadcrumbs.length = 0;
}

// Report errors to server endpoint
async function reportErrorToServer(error: Error, context?: ErrorContext): Promise<void> {
  try {
    const payload = {
      type: 'error' as const,
      error: {
        message: error.message,
        stack: error.stack?.slice(0, 2000), // Limit stack trace size
        name: error.name,
      },
      context: {
        section: context?.section || 'general',
        componentStack: context?.componentStack?.slice(0, 1000),
        extra: context?.extra,
        platform: Platform.OS,
        url: Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.href
          : undefined,
        userAgent: Platform.OS === 'web' && typeof navigator !== 'undefined'
          ? navigator.userAgent
          : undefined,
      },
      user: currentUser,
      breadcrumbs: [...breadcrumbs],
      timestamp: new Date().toISOString(),
    };

    const apiUrl = getApiBaseUrl();

    // Fire and forget - don't block on error reporting
    fetch(`${apiUrl}/api/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail - we don't want error reporting to cause errors
    });
  } catch {
    // Silently fail
  }
}

async function reportMessageToServer(message: string, level: SeverityLevel): Promise<void> {
  try {
    const payload = {
      type: 'message' as const,
      message,
      level,
      context: {
        platform: Platform.OS,
        url: Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.href
          : undefined,
      },
      user: currentUser,
      timestamp: new Date().toISOString(),
    };

    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/api/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail
    });
  } catch {
    // Silently fail
  }
}
