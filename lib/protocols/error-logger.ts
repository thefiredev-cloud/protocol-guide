import { createLogger } from '../log';
import type { RecoveryResult } from './error-recovery';

const logger = createLogger('ErrorLogger');

export interface ErrorLogEntry {
  timestamp: string;
  operation: string;
  error?: Error;
  strategyUsed: string;
  attempts: number;
  fallbacksUsed: string[];
  recoveryTimeMs?: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Error Logger for monitoring and debugging
 * Structured logging for all recovery operations
 */
export class ProtocolErrorLogger {
  private errorLog: ErrorLogEntry[] = [];
  private readonly maxLogSize = 1000;

  /**
   * Log a recovery operation result
   */
  logRecovery<T>(
    operation: string,
    result: RecoveryResult<T>,
    metadata?: Record<string, unknown>
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      operation,
      error: result.error,
      strategyUsed: result.strategyUsed,
      attempts: result.attempts,
      fallbacksUsed: result.fallbacksUsed,
      recoveryTimeMs: result.recoveryTimeMs,
      success: result.success,
      metadata,
    };

    this.errorLog.push(entry);

    // Trim log if it gets too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console based on severity
    const logPayload = { ...entry, error: entry.error?.message };
    if (!result.success) {
      logger.error(`Recovery failed: ${operation}`, logPayload);
    } else if (result.fallbacksUsed.length > 0) {
      logger.warn(`Recovery used fallbacks: ${operation}`, logPayload);
    } else {
      logger.info(`Recovery successful: ${operation}`, logPayload);
    }
  }

  /**
   * Get recent error logs
   */
  getRecentLogs(count: number = 50): ErrorLogEntry[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    total: number;
    successful: number;
    failed: number;
    withFallbacks: number;
    averageRecoveryTime: number;
    strategyBreakdown: Record<string, number>;
  } {
    const total = this.errorLog.length;
    const successful = this.errorLog.filter(e => e.success).length;
    const failed = total - successful;
    const withFallbacks = this.errorLog.filter(e => e.fallbacksUsed.length > 0).length;

    const recoveryTimes = this.errorLog
      .filter(e => e.recoveryTimeMs !== undefined)
      .map(e => e.recoveryTimeMs!);
    const averageRecoveryTime = recoveryTimes.length > 0
      ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length
      : 0;

    const strategyBreakdown: Record<string, number> = {};
    for (const entry of this.errorLog) {
      strategyBreakdown[entry.strategyUsed] = (strategyBreakdown[entry.strategyUsed] || 0) + 1;
    }

    return {
      total,
      successful,
      failed,
      withFallbacks,
      averageRecoveryTime,
      strategyBreakdown,
    };
  }

  /**
   * Get failed operations
   */
  getFailedOperations(): ErrorLogEntry[] {
    return this.errorLog.filter(e => !e.success);
  }

  /**
   * Clear logs (for testing or maintenance)
   */
  clearLogs(): void {
    logger.info('Clearing error logs', { count: this.errorLog.length });
    this.errorLog = [];
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: ProtocolErrorLogger | null = null;

/**
 * Get the singleton instance of ProtocolErrorLogger
 */
export function getProtocolErrorLogger(): ProtocolErrorLogger {
  if (!instance) {
    instance = new ProtocolErrorLogger();
  }
  return instance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetProtocolErrorLogger(): void {
  instance = null;
}
