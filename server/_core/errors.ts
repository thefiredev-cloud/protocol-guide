/**
 * Protocol Guide - Custom Error Types
 *
 * Specific error types for Claude and Voyage API failures.
 * Provides user-friendly messages while preserving technical details for logging.
 * Includes distributed tracing support with request ID propagation.
 */

import type { TraceContext } from "./tracing";

/**
 * Base error class for all Protocol Guide API errors
 * Supports distributed tracing with optional request ID
 */
export class ProtocolGuideError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly statusCode: number;
  public readonly retryable: boolean;
  public readonly originalError?: Error;
  /** Request ID for distributed tracing */
  public requestId?: string;
  /** Full trace context for debugging */
  public traceContext?: TraceContext;
  /** Timestamp when error occurred */
  public readonly timestamp: string;

  constructor(params: {
    code: string;
    message: string;
    userMessage: string;
    statusCode?: number;
    retryable?: boolean;
    originalError?: Error;
    requestId?: string;
    traceContext?: TraceContext;
  }) {
    super(params.message);
    this.name = 'ProtocolGuideError';
    this.code = params.code;
    this.userMessage = params.userMessage;
    this.statusCode = params.statusCode ?? 500;
    this.retryable = params.retryable ?? false;
    this.originalError = params.originalError;
    this.requestId = params.requestId || params.traceContext?.requestId;
    this.traceContext = params.traceContext;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Attach trace context to an existing error
   */
  withTrace(traceContext: TraceContext): this {
    this.requestId = traceContext.requestId;
    this.traceContext = traceContext;
    return this;
  }

  toJSON() {
    return {
      error: this.code,
      message: this.userMessage,
      statusCode: this.statusCode,
      retryable: this.retryable,
      requestId: this.requestId,
      timestamp: this.timestamp,
    };
  }

  /**
   * Convert to a detailed object for logging
   */
  toLogObject() {
    return {
      error: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      retryable: this.retryable,
      requestId: this.requestId,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack,
      } : undefined,
    };
  }
}

// ============================================================================
// CLAUDE API ERRORS
// ============================================================================

/**
 * Claude API rate limit exceeded
 */
export class ClaudeRateLimitError extends ProtocolGuideError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number, originalError?: Error) {
    super({
      code: 'CLAUDE_RATE_LIMITED',
      message: `Claude API rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ''}`,
      userMessage: 'The AI service is temporarily busy. Please try again in a moment.',
      statusCode: 429,
      retryable: true,
      originalError,
    });
    this.name = 'ClaudeRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Claude API authentication failure
 */
export class ClaudeAuthError extends ProtocolGuideError {
  constructor(originalError?: Error) {
    super({
      code: 'CLAUDE_AUTH_ERROR',
      message: 'Claude API authentication failed - invalid or missing API key',
      userMessage: 'AI service configuration error. Please contact support.',
      statusCode: 500,
      retryable: false,
      originalError,
    });
    this.name = 'ClaudeAuthError';
  }
}

/**
 * Claude API server error (5xx)
 */
export class ClaudeServerError extends ProtocolGuideError {
  constructor(statusCode: number, originalError?: Error) {
    super({
      code: 'CLAUDE_SERVER_ERROR',
      message: `Claude API server error: ${statusCode}`,
      userMessage: 'The AI service is experiencing issues. Please try again shortly.',
      statusCode: 503,
      retryable: true,
      originalError,
    });
    this.name = 'ClaudeServerError';
  }
}

/**
 * Claude API overloaded
 */
export class ClaudeOverloadedError extends ProtocolGuideError {
  constructor(originalError?: Error) {
    super({
      code: 'CLAUDE_OVERLOADED',
      message: 'Claude API is overloaded',
      userMessage: 'The AI service is currently at capacity. Please try again in a few seconds.',
      statusCode: 503,
      retryable: true,
      originalError,
    });
    this.name = 'ClaudeOverloadedError';
  }
}

/**
 * Claude API timeout
 */
export class ClaudeTimeoutError extends ProtocolGuideError {
  constructor(timeoutMs: number, originalError?: Error) {
    super({
      code: 'CLAUDE_TIMEOUT',
      message: `Claude API request timed out after ${timeoutMs}ms`,
      userMessage: 'The AI request took too long. Please try a simpler query.',
      statusCode: 504,
      retryable: true,
      originalError,
    });
    this.name = 'ClaudeTimeoutError';
  }
}

/**
 * Claude API invalid request (4xx excluding rate limit/auth)
 */
export class ClaudeInvalidRequestError extends ProtocolGuideError {
  constructor(message: string, originalError?: Error) {
    super({
      code: 'CLAUDE_INVALID_REQUEST',
      message: `Claude API invalid request: ${message}`,
      userMessage: 'There was an issue processing your request. Please try rephrasing your question.',
      statusCode: 400,
      retryable: false,
      originalError,
    });
    this.name = 'ClaudeInvalidRequestError';
  }
}

/**
 * Generic Claude API error
 */
export class ClaudeApiError extends ProtocolGuideError {
  constructor(message: string, statusCode?: number, originalError?: Error) {
    super({
      code: 'CLAUDE_API_ERROR',
      message: `Claude API error: ${message}`,
      userMessage: 'An error occurred with the AI service. Please try again.',
      statusCode: statusCode ?? 500,
      retryable: true,
      originalError,
    });
    this.name = 'ClaudeApiError';
  }
}

// ============================================================================
// VOYAGE API ERRORS
// ============================================================================

/**
 * Voyage API rate limit exceeded
 */
export class VoyageRateLimitError extends ProtocolGuideError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number, originalError?: Error) {
    super({
      code: 'VOYAGE_RATE_LIMITED',
      message: `Voyage API rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ''}`,
      userMessage: 'Search service is temporarily busy. Please try again in a moment.',
      statusCode: 429,
      retryable: true,
      originalError,
    });
    this.name = 'VoyageRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Voyage API authentication failure
 */
export class VoyageAuthError extends ProtocolGuideError {
  constructor(originalError?: Error) {
    super({
      code: 'VOYAGE_AUTH_ERROR',
      message: 'Voyage API authentication failed - invalid or missing API key',
      userMessage: 'Search service configuration error. Please contact support.',
      statusCode: 500,
      retryable: false,
      originalError,
    });
    this.name = 'VoyageAuthError';
  }
}

/**
 * Voyage API server error
 */
export class VoyageServerError extends ProtocolGuideError {
  constructor(statusCode: number, originalError?: Error) {
    super({
      code: 'VOYAGE_SERVER_ERROR',
      message: `Voyage API server error: ${statusCode}`,
      userMessage: 'Search service is experiencing issues. Please try again shortly.',
      statusCode: 503,
      retryable: true,
      originalError,
    });
    this.name = 'VoyageServerError';
  }
}

/**
 * Voyage API timeout
 */
export class VoyageTimeoutError extends ProtocolGuideError {
  constructor(timeoutMs: number, originalError?: Error) {
    super({
      code: 'VOYAGE_TIMEOUT',
      message: `Voyage API request timed out after ${timeoutMs}ms`,
      userMessage: 'Search request took too long. Please try again.',
      statusCode: 504,
      retryable: true,
      originalError,
    });
    this.name = 'VoyageTimeoutError';
  }
}

/**
 * Generic Voyage API error
 */
export class VoyageApiError extends ProtocolGuideError {
  constructor(message: string, statusCode?: number, originalError?: Error) {
    super({
      code: 'VOYAGE_API_ERROR',
      message: `Voyage API error: ${message}`,
      userMessage: 'An error occurred with the search service. Please try again.',
      statusCode: statusCode ?? 500,
      retryable: true,
      originalError,
    });
    this.name = 'VoyageApiError';
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse Claude API error response and return appropriate error type
 */
export function parseClaudeError(error: unknown): ProtocolGuideError {
  if (error instanceof ProtocolGuideError) {
    return error;
  }

  const err = error as Error & { status?: number; statusCode?: number; code?: string };
  const statusCode = err.status || err.statusCode;
  const message = err.message || 'Unknown error';

  // Rate limit
  if (statusCode === 429 || message.includes('rate_limit')) {
    const retryMatch = message.match(/retry after (\d+)/i);
    const retryAfter = retryMatch ? parseInt(retryMatch[1]) : undefined;
    return new ClaudeRateLimitError(retryAfter, err);
  }

  // Authentication
  if (statusCode === 401 || statusCode === 403 || message.includes('authentication')) {
    return new ClaudeAuthError(err);
  }

  // Overloaded
  if (statusCode === 529 || message.includes('overloaded')) {
    return new ClaudeOverloadedError(err);
  }

  // Server error
  if (statusCode && statusCode >= 500) {
    return new ClaudeServerError(statusCode, err);
  }

  // Invalid request
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return new ClaudeInvalidRequestError(message, err);
  }

  // Timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' || message.includes('timeout')) {
    return new ClaudeTimeoutError(30000, err);
  }

  // Generic
  return new ClaudeApiError(message, statusCode, err);
}

/**
 * Parse Voyage API error response and return appropriate error type
 */
export function parseVoyageError(statusCode: number, message: string): ProtocolGuideError {
  // Rate limit
  if (statusCode === 429) {
    const retryMatch = message.match(/retry after (\d+)/i);
    const retryAfter = retryMatch ? parseInt(retryMatch[1]) : undefined;
    return new VoyageRateLimitError(retryAfter);
  }

  // Authentication
  if (statusCode === 401 || statusCode === 403) {
    return new VoyageAuthError();
  }

  // Server error
  if (statusCode >= 500) {
    return new VoyageServerError(statusCode);
  }

  // Generic
  return new VoyageApiError(message, statusCode);
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ProtocolGuideError) {
    return error.retryable;
  }

  // Network errors are generally retryable
  const err = error as Error & { code?: string };
  const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND'];
  return retryableCodes.includes(err.code || '');
}

// ============================================================================
// TRACE CONTEXT HELPERS
// ============================================================================

/**
 * Attach trace context to any error
 * If error is ProtocolGuideError, uses withTrace method
 * Otherwise, attaches traceContext as a property
 */
export function attachTraceToError<T extends Error>(
  error: T,
  traceContext: TraceContext
): T & { requestId: string; traceContext: TraceContext } {
  if (error instanceof ProtocolGuideError) {
    error.withTrace(traceContext);
    return error as T & { requestId: string; traceContext: TraceContext };
  }

  // For non-ProtocolGuideError errors, attach trace as properties
  const tracedError = error as T & { requestId: string; traceContext: TraceContext };
  tracedError.requestId = traceContext.requestId;
  tracedError.traceContext = traceContext;
  return tracedError;
}

/**
 * Extract request ID from an error if present
 */
export function getRequestIdFromError(error: unknown): string | undefined {
  if (error instanceof ProtocolGuideError) {
    return error.requestId;
  }

  if (error && typeof error === 'object' && 'requestId' in error) {
    return (error as { requestId: string }).requestId;
  }

  return undefined;
}

/**
 * Create a standardized error response object for API responses
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string
): {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    timestamp: string;
    retryable: boolean;
  };
} {
  const timestamp = new Date().toISOString();

  if (error instanceof ProtocolGuideError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.userMessage,
        requestId: error.requestId || requestId,
        timestamp: error.timestamp,
        retryable: error.retryable,
      },
    };
  }

  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: errorMessage,
      requestId,
      timestamp,
      retryable: false,
    },
  };
}
