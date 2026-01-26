/**
 * Protocol Guide - Retry Utility
 *
 * Provides retry logic for transient failures with exponential backoff.
 * Use for network requests, API calls, and database operations.
 *
 * Features:
 * - Configurable retry count and delay
 * - Exponential backoff with jitter
 * - Custom retry condition function
 * - Abort signal support
 * - Timeout support
 *
 * Usage:
 * ```tsx
 * const result = await withRetry(
 *   () => fetchData(),
 *   { maxRetries: 3, baseDelayMs: 1000 }
 * );
 * ```
 */

import { addBreadcrumb } from './sentry-client';

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds before first retry (default: 1000) */
  baseDelayMs?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelayMs?: number;
  /** Exponential backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Whether to add jitter to delay (default: true) */
  jitter?: boolean;
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
  /** Callback called before each retry */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
  /** AbortSignal to cancel retries */
  signal?: AbortSignal;
  /** Total timeout in milliseconds for all retries combined */
  timeoutMs?: number;
  /** Label for logging/breadcrumbs */
  label?: string;
}

/** Default retry options */
const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'signal' | 'timeoutMs' | 'label' | 'onRetry' | 'isRetryable'>> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Default function to determine if an error is retryable
 */
function defaultIsRetryable(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Check for retryable property on error
  if (error && typeof error === 'object' && 'retryable' in error) {
    return Boolean((error as { retryable: unknown }).retryable);
  }

  // Check HTTP status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    // Retry on server errors (5xx) and rate limits (429)
    return status >= 500 || status === 429;
  }

  // Check error codes (Node.js network errors)
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    const retryableCodes = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'EPIPE',
      'ENOTFOUND',
      'EAI_AGAIN',
      'EHOSTUNREACH',
      'ENETUNREACH',
    ];
    return retryableCodes.includes(code);
  }

  // Check message for common transient errors
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  const transientPatterns = [
    'network',
    'timeout',
    'timed out',
    'socket hang up',
    'econnreset',
    'connection refused',
    'rate limit',
    'too many requests',
    'service unavailable',
    'internal server error',
    'bad gateway',
    'gateway timeout',
  ];

  return transientPatterns.some(pattern => message.includes(pattern));
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
  jitter: boolean
): number {
  // Exponential backoff: baseDelay * (multiplier ^ attempt)
  let delay = baseDelayMs * Math.pow(backoffMultiplier, attempt);

  // Cap at max delay
  delay = Math.min(delay, maxDelayMs);

  // Add jitter (±25% random variation)
  if (jitter) {
    const jitterRange = delay * 0.25;
    delay = delay - jitterRange + Math.random() * jitterRange * 2;
  }

  return Math.round(delay);
}

/**
 * Sleep for specified milliseconds with optional abort signal
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new RetryAbortedError('Retry aborted'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new RetryAbortedError('Retry aborted'));
    });
  });
}

/**
 * Error thrown when retries are exhausted
 */
export class RetryExhaustedError extends Error {
  public readonly attempts: number;
  public readonly lastError: unknown;

  constructor(attempts: number, lastError: unknown) {
    const message = lastError instanceof Error
      ? `Retry exhausted after ${attempts} attempts: ${lastError.message}`
      : `Retry exhausted after ${attempts} attempts`;
    super(message);
    this.name = 'RetryExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * Error thrown when retry is aborted
 */
export class RetryAbortedError extends Error {
  constructor(message = 'Retry aborted') {
    super(message);
    this.name = 'RetryAbortedError';
  }
}

/**
 * Error thrown when retry times out
 */
export class RetryTimeoutError extends Error {
  public readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Retry timed out after ${timeoutMs}ms`);
    this.name = 'RetryTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Execute a function with retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws RetryExhaustedError if all retries fail
 * @throws RetryAbortedError if aborted via signal
 * @throws RetryTimeoutError if total timeout exceeded
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_OPTIONS.maxRetries,
    baseDelayMs = DEFAULT_OPTIONS.baseDelayMs,
    maxDelayMs = DEFAULT_OPTIONS.maxDelayMs,
    backoffMultiplier = DEFAULT_OPTIONS.backoffMultiplier,
    jitter = DEFAULT_OPTIONS.jitter,
    isRetryable = defaultIsRetryable,
    onRetry,
    signal,
    timeoutMs,
    label = 'operation',
  } = options;

  const startTime = Date.now();
  let lastError: unknown;
  let attempt = 0;

  while (attempt <= maxRetries) {
    // Check for abort
    if (signal?.aborted) {
      throw new RetryAbortedError();
    }

    // Check for timeout
    if (timeoutMs && Date.now() - startTime > timeoutMs) {
      throw new RetryTimeoutError(timeoutMs);
    }

    try {
      const result = await fn();

      // Success on retry - log recovery
      if (attempt > 0) {
        addBreadcrumb(`${label} succeeded after ${attempt} retries`, 'retry', {
          attempts: attempt + 1,
          totalTimeMs: Date.now() - startTime,
        });
      }

      return result;
    } catch (error) {
      lastError = error;
      attempt++;

      // Check if we should retry
      if (attempt > maxRetries) {
        break;
      }

      if (!isRetryable(error)) {
        // Non-retryable error - throw immediately
        throw error;
      }

      // Calculate delay for this retry
      const delay = calculateDelay(
        attempt - 1, // 0-indexed for first retry
        baseDelayMs,
        maxDelayMs,
        backoffMultiplier,
        jitter
      );

      // Log the retry attempt
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (__DEV__) {
        console.warn(
          `[Retry] ${label} attempt ${attempt}/${maxRetries} failed: ${errorMessage}. Retrying in ${delay}ms...`
        );
      }

      // Add breadcrumb for debugging
      addBreadcrumb(`${label} retry attempt ${attempt}`, 'retry', {
        error: errorMessage,
        delayMs: delay,
        attempt,
        maxRetries,
      });

      // Call onRetry callback
      onRetry?.(attempt, error, delay);

      // Wait before retrying
      await sleep(delay, signal);
    }
  }

  // All retries exhausted
  addBreadcrumb(`${label} retry exhausted`, 'error', {
    attempts: maxRetries + 1,
    totalTimeMs: Date.now() - startTime,
  });

  throw new RetryExhaustedError(maxRetries + 1, lastError);
}

/**
 * Create a retry-wrapped version of an async function
 *
 * @param fn - Async function to wrap
 * @param options - Retry configuration options
 * @returns Wrapped function that retries on failure
 */
export function createRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}

/**
 * React hook for managing retry state
 * Returns current attempt count and whether retrying
 */
export function useRetryState() {
  // This is a placeholder for a React hook implementation
  // Import and use from a React component context
  return {
    attempts: 0,
    isRetrying: false,
    error: null as Error | null,
  };
}

export default withRetry;
