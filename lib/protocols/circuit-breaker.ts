import { createLogger } from '../log';

const logger = createLogger('CircuitBreaker');

export interface CircuitBreakerConfig {
  threshold: number;       // Number of failures before opening
  timeout: number;         // Time to wait before attempting operation
  resetTimeout: number;    // Time to wait before closing circuit
  halfOpenRequests?: number; // Number of requests to allow in half-open state
}

/**
 * Circuit Breaker implementation
 * Prevents cascade failures by temporarily blocking operations after repeated failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private halfOpenRequests = 0;

  constructor(
    private key: string,
    private options: CircuitBreakerConfig
  ) {}

  isOpen(): boolean {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailTime >= this.options.resetTimeout) {
        logger.info(`Circuit breaker transitioning to half-open: ${this.key}`);
        this.state = 'half-open';
        this.halfOpenRequests = 0;
        return false;
      }
      return true;
    }

    if (this.state === 'half-open') {
      const maxHalfOpenRequests = this.options.halfOpenRequests || 3;
      if (this.halfOpenRequests >= maxHalfOpenRequests) {
        return true;
      }
      this.halfOpenRequests++;
    }

    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    if (this.state === 'half-open') {
      logger.info(`Circuit breaker closed after successful half-open requests: ${this.key}`);
    }
    this.state = 'closed';
    this.halfOpenRequests = 0;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailTime = Date.now();

    if (this.state === 'half-open') {
      logger.warn(`Circuit breaker reopened after half-open failure: ${this.key}`);
      this.state = 'open';
      return;
    }

    if (this.failures >= this.options.threshold) {
      this.state = 'open';
      logger.error(`Circuit breaker opened after ${this.failures} failures: ${this.key}`, {
        threshold: this.options.threshold,
        resetTimeout: this.options.resetTimeout,
      });
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.halfOpenRequests = 0;
    logger.info(`Circuit breaker manually reset: ${this.key}`);
  }
}
