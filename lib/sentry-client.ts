/**
 * Protocol Guide - Client-Side Sentry Configuration
 *
 * Provides error tracking and performance monitoring for React Native/Expo.
 * Works on both mobile and web platforms.
 *
 * Usage:
 *   import { initSentryClient, captureError, captureMessage } from '@/lib/sentry-client';
 *   await initSentryClient();
 */

import { Platform } from 'react-native';

// Sentry client state
let sentryInitialized = false;
let sentryModule: typeof import('@sentry/react-native') | null = null;

// Error context types
export type ErrorContext = {
  componentStack?: string;
  section?: 'search' | 'voice' | 'protocol_viewer' | 'navigation' | 'general';
  userId?: string;
  extra?: Record<string, unknown>;
};

// Severity levels
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Initialize Sentry for client-side error tracking
 *
 * Call this early in app startup (before rendering).
 * Safe to call multiple times - will only initialize once.
 */
export async function initSentryClient(): Promise<void> {
  if (sentryInitialized) return;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    if (__DEV__) {
      console.log('[Sentry Client] No EXPO_PUBLIC_SENTRY_DSN configured, error tracking disabled');
    } else {
      console.warn(
        '[Sentry Client] WARNING: EXPO_PUBLIC_SENTRY_DSN not configured in production!\n' +
        '[Sentry Client] Client-side error tracking is disabled.'
      );
    }
    return;
  }

  try {
    // Dynamic import to handle cases where Sentry might not be installed
    if (Platform.OS === 'web') {
      // Web uses browser SDK which is bundled differently
      // For now, we'll use a fetch-based fallback for web
      sentryInitialized = true;
      console.log('[Sentry Client] Web platform - using lightweight error reporting');
    } else {
      // Native platforms use @sentry/react-native
      const Sentry = await import('@sentry/react-native');
      sentryModule = Sentry;

      Sentry.init({
        dsn,
        environment: __DEV__ ? 'development' : 'production',
        // Sample 10% of transactions in production
        tracesSampleRate: __DEV__ ? 1.0 : 0.1,
        // Enable native crash reporting
        enableNative: true,
        // Auto-capture breadcrumbs
        enableAutoSessionTracking: true,
        // Filter out expected errors
        beforeSend(event) {
          const message = event?.message || '';

          // Don't send rate limit errors
          if (message.includes('rate limit') || message.includes('Too Many Requests')) {
            return null;
          }

          // Don't send network timeout errors (often transient)
          if (message.includes('timeout') && message.includes('network')) {
            return null;
          }

          return event;
        },
      });

      sentryInitialized = true;
      console.log('[Sentry Client] Initialized for', __DEV__ ? 'development' : 'production');
    }
  } catch (error) {
    // Sentry not available - graceful degradation
    console.warn('[Sentry Client] Could not initialize:', error);
    sentryInitialized = false;
  }
}

/**
 * Capture an error to Sentry with optional context
 *
 * @param error - The error to capture
 * @param context - Additional context about where/why the error occurred
 */
export function captureError(error: Error, context?: ErrorContext): void {
  // Always log to console
  console.error('[Error]', error.message);
  if (context?.componentStack) {
    console.error('[Component Stack]', context.componentStack);
  }

  if (!sentryInitialized) return;

  if (Platform.OS === 'web') {
    // Web fallback: POST to server-side endpoint
    reportErrorToServer(error, context);
  } else if (sentryModule) {
    // Native: use Sentry SDK
    sentryModule.withScope((scope) => {
      if (context?.section) {
        scope.setTag('section', context.section);
      }
      if (context?.userId) {
        scope.setUser({ id: context.userId });
      }
      if (context?.componentStack) {
        scope.setExtra('componentStack', context.componentStack);
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      sentryModule?.captureException(error);
    });
  }
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(message: string, level: SeverityLevel = 'info'): void {
  if (__DEV__) {
    console.log(`[Sentry ${level}]`, message);
  }

  if (!sentryInitialized) return;

  if (Platform.OS === 'web') {
    reportMessageToServer(message, level);
  } else if (sentryModule) {
    sentryModule.captureMessage(message, level);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string } | null): void {
  if (!sentryInitialized) return;

  if (sentryModule) {
    sentryModule.setUser(user);
  }
}

/**
 * Add breadcrumb for tracking user actions leading to errors
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  if (!sentryInitialized) return;

  if (sentryModule) {
    sentryModule.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized(): boolean {
  return sentryInitialized;
}

// Web fallback: report errors to server endpoint
async function reportErrorToServer(error: Error, context?: ErrorContext): Promise<void> {
  try {
    const payload = {
      type: 'error',
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: {
        section: context?.section,
        componentStack: context?.componentStack,
        extra: context?.extra,
        platform: 'web',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      timestamp: new Date().toISOString(),
    };

    // Fire and forget - don't block on error reporting
    fetch('/api/client-error', {
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
      type: 'message',
      message,
      level,
      context: {
        platform: 'web',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      timestamp: new Date().toISOString(),
    };

    fetch('/api/client-error', {
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
