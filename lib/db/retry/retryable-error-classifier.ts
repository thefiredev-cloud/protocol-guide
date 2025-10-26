/* eslint-disable max-lines-per-function, complexity, max-depth */
import { PostgrestError } from '@supabase/supabase-js';

import { TransientDatabaseError } from './transient-database-error';
import type { RetryableClassification, TransientErrorCategory } from './types';

export class RetryableErrorClassifier {
  private static readonly POSTGREST_RETRYABLE_CODES = new Set([
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '53300', // too_many_connections
    '57P03', // cannot_connect_now
  ]);

  private static readonly NODE_TRANSIENT_ERROR_CODES = new Set([
    'ECONNRESET',
    'ECONNREFUSED',
    'ECONNABORTED',
    'EPIPE',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'ETIMEDOUT',
  ]);

  private static readonly RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

  private static readonly NETWORK_ERROR_NAMES = new Set(['FetchError', 'NetworkError']);

  private static readonly TIMEOUT_ERROR_NAMES = new Set(['AbortError', 'TimeoutError']);

  private static readonly FALLBACK_PATTERNS: Array<{
    category: TransientErrorCategory;
    pattern: RegExp;
  }> = [
    { pattern: /\b(?:failed to )?fetch\b/i, category: 'network' },
    { pattern: /\bnetwork(?:\s+error)?\b/i, category: 'network' },
    { pattern: /\b(?:request|operation)\s+timed?\s*out\b/i, category: 'timeout' },
    { pattern: /\btimeout\b/i, category: 'timeout' },
  ];

  static classify(error: unknown): RetryableClassification {
    if (!error) {
      return { retryable: false };
    }

    if (error instanceof TransientDatabaseError) {
      return { retryable: true, category: error.category };
    }

    if (this.isPostgrestError(error)) {
      if (error.code && this.POSTGREST_RETRYABLE_CODES.has(error.code)) {
        const category: TransientErrorCategory = error.code.startsWith('08') ? 'connection' : 'network';
        return { retryable: true, category };
      }
    }

    if (typeof error === 'object' && error !== null) {
      const status = (error as { status?: number }).status;
      if (typeof status === 'number' && this.RETRYABLE_HTTP_STATUSES.has(status)) {
        const category: TransientErrorCategory = status === 408 || status === 504 ? 'timeout' : 'network';
        return { retryable: true, category };
      }
    }

    if (error instanceof Error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code && this.NODE_TRANSIENT_ERROR_CODES.has(nodeError.code)) {
        const category: TransientErrorCategory = nodeError.code === 'ETIMEDOUT' ? 'timeout' : 'network';
        return { retryable: true, category };
      }

      if (this.TIMEOUT_ERROR_NAMES.has(error.name)) {
        return { retryable: true, category: 'timeout' };
      }

      if (this.NETWORK_ERROR_NAMES.has(error.name)) {
        return { retryable: true, category: 'network' };
      }
    }

    const message = this.extractMessage(error);
    if (message) {
      for (const { pattern, category } of this.FALLBACK_PATTERNS) {
        if (pattern.test(message)) {
          // Message-based detection is a last-resort fallback when structured metadata is unavailable.
          return { retryable: true, category };
        }
      }
    }

    return { retryable: false };
  }

  private static isPostgrestError(value: unknown): value is PostgrestError {
    return (
      typeof value === 'object' &&
      value !== null &&
      'code' in value &&
      typeof (value as PostgrestError).code === 'string'
    );
  }

  private static extractMessage(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof Error) {
      return value.message;
    }

    if (typeof value === 'object' && value !== null && 'message' in value) {
      const rawMessage = (value as { message?: unknown }).message;
      if (typeof rawMessage === 'string') {
        return rawMessage;
      }
    }

    return undefined;
  }
}

