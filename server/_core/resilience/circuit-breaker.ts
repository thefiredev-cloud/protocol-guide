/**
 * Protocol Guide - Circuit Breaker Pattern
 *
 * Prevents cascading failures by tracking service health and
 * temporarily rejecting requests to failing services.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are rejected immediately
 * - HALF_OPEN: Testing if service has recovered
 */

import { logger } from '../logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Name for logging/monitoring */
  name: string;
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Number of successes in half-open to close circuit */
  successThreshold: number;
  /** Time in ms before attempting recovery (half-open) */
  resetTimeout: number;
  /** Time window in ms for counting failures */
  failureWindow: number;
  /** Callback when state changes */
  onStateChange?: (name: string, from: CircuitState, to: CircuitState) => void;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  circuitOpenCount: number;
}

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number[] = []; // Timestamps of recent failures
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private openedAt: number | null = null;

  // Metrics
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;
  private circuitOpenCount = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    this.totalRequests++;

    // Check if we should allow the request
    if (!this.canExecute()) {
      logger.warn(
        { circuit: this.config.name, state: this.state },
        'Circuit breaker rejected request'
      );

      if (fallback) {
        return fallback();
      }

      throw new CircuitBreakerOpenError(this.config.name, this.getTimeUntilReset());
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Check if request should be allowed
   */
  canExecute(): boolean {
    this.cleanupOldFailures();

    switch (this.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        // Check if reset timeout has passed
        if (this.openedAt && Date.now() - this.openedAt >= this.config.resetTimeout) {
          this.transitionTo('HALF_OPEN');
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return true;
    }
  }

  /**
   * Record a successful operation
   */
  recordSuccess(): void {
    this.totalSuccesses++;
    this.lastSuccessTime = Date.now();
    this.successCount++;

    if (this.state === 'HALF_OPEN') {
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo('CLOSED');
      }
    }
  }

  /**
   * Record a failed operation
   */
  recordFailure(): void {
    this.totalFailures++;
    this.lastFailureTime = Date.now();
    this.failures.push(Date.now());
    this.successCount = 0;

    if (this.state === 'HALF_OPEN') {
      // Single failure in half-open reopens the circuit
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      // Check if we've exceeded failure threshold
      if (this.failures.length >= this.config.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === 'OPEN') {
      this.openedAt = Date.now();
      this.circuitOpenCount++;
    } else if (newState === 'CLOSED') {
      this.openedAt = null;
      this.failures = [];
      this.successCount = 0;
    } else if (newState === 'HALF_OPEN') {
      this.successCount = 0;
    }

    logger.info(
      {
        circuit: this.config.name,
        from: oldState,
        to: newState,
        failureCount: this.failures.length,
      },
      'Circuit breaker state transition'
    );

    this.config.onStateChange?.(this.config.name, oldState, newState);
  }

  /**
   * Remove failures outside the time window
   */
  private cleanupOldFailures(): void {
    const cutoff = Date.now() - this.config.failureWindow;
    this.failures = this.failures.filter((timestamp) => timestamp > cutoff);
  }

  /**
   * Get time until circuit might reset (for OPEN state)
   */
  private getTimeUntilReset(): number {
    if (!this.openedAt) return 0;
    return Math.max(0, this.config.resetTimeout - (Date.now() - this.openedAt));
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitState {
    this.cleanupOldFailures();

    // Check for automatic transition from OPEN to HALF_OPEN
    if (
      this.state === 'OPEN' &&
      this.openedAt &&
      Date.now() - this.openedAt >= this.config.resetTimeout
    ) {
      this.transitionTo('HALF_OPEN');
    }

    return this.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    this.cleanupOldFailures();
    return {
      state: this.getState(),
      failures: this.failures.length,
      successes: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      circuitOpenCount: this.circuitOpenCount,
    };
  }

  /**
   * Force the circuit to a specific state (for testing/manual intervention)
   */
  forceState(state: CircuitState): void {
    const oldState = this.state;
    this.state = state;

    if (state === 'OPEN') {
      this.openedAt = Date.now();
    } else {
      this.openedAt = null;
    }

    logger.warn(
      { circuit: this.config.name, from: oldState, to: state },
      'Circuit breaker state forced'
    );
  }

  /**
   * Reset the circuit breaker to initial state
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = [];
    this.successCount = 0;
    this.openedAt = null;

    logger.info({ circuit: this.config.name }, 'Circuit breaker reset');
  }
}

/**
 * Error thrown when circuit breaker is open
 */
export class CircuitBreakerOpenError extends Error {
  public readonly code = 'CIRCUIT_BREAKER_OPEN';
  public readonly retryAfterMs: number;

  constructor(serviceName: string, retryAfterMs: number) {
    super(`Circuit breaker open for service: ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
    this.retryAfterMs = retryAfterMs;
  }
}

// ============================================================================
// Pre-configured Circuit Breakers
// ============================================================================

/**
 * Create a circuit breaker with default settings for database operations
 */
export function createDatabaseCircuitBreaker(
  onStateChange?: CircuitBreakerConfig['onStateChange']
): CircuitBreaker {
  return new CircuitBreaker({
    name: 'database',
    failureThreshold: 5,
    successThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    failureWindow: 60000, // 1 minute
    onStateChange,
  });
}

/**
 * Create a circuit breaker with default settings for AI service
 */
export function createAICircuitBreaker(
  onStateChange?: CircuitBreakerConfig['onStateChange']
): CircuitBreaker {
  return new CircuitBreaker({
    name: 'ai-service',
    failureThreshold: 3,
    successThreshold: 2,
    resetTimeout: 60000, // 1 minute
    failureWindow: 120000, // 2 minutes
    onStateChange,
  });
}

/**
 * Create a circuit breaker with default settings for Redis
 */
export function createRedisCircuitBreaker(
  onStateChange?: CircuitBreakerConfig['onStateChange']
): CircuitBreaker {
  return new CircuitBreaker({
    name: 'redis',
    failureThreshold: 3,
    successThreshold: 2,
    resetTimeout: 15000, // 15 seconds
    failureWindow: 30000, // 30 seconds
    onStateChange,
  });
}
