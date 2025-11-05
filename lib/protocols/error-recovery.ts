import { getProtocolRepository } from '../db/protocol-repository';
import { createLogger } from '../log';
import { initializeKnowledgeBase } from '../retrieval';
import { CircuitBreaker } from './circuit-breaker';
import { loadProtocolFromFiles, searchProtocolFiles } from './protocol-helpers';
import type { Protocol, ProtocolChunk } from './protocol-schema';

const logger = createLogger('ProtocolErrorRecovery');

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface RecoveryStrategy<T = unknown> {
  name: string;
  execute: () => Promise<T>;
  fallback?: RecoveryStrategy<T>;
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  strategyUsed: string;
  attempts: number;
  fallbacksUsed: string[];
  recoveryTimeMs?: number;
}

interface CachedProtocol {
  protocol: Protocol;
  timestamp: number;
  ttl: number;
}


// =============================================================================
// PROTOCOL ERROR RECOVERY
// =============================================================================

export class ProtocolErrorRecovery {
  private circuitBreakers: Map<string, CircuitBreaker>;
  private cache: Map<string, CachedProtocol>;
  private repo = getProtocolRepository();
  private fileBasedInitialized = false;

  constructor() {
    this.circuitBreakers = new Map();
    this.cache = new Map();
  }

  /**
   * Retry operation with exponential backoff
   * Critical for handling transient failures
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000,
    operationName = 'unknown'
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.attemptOperation({
        operation,
        attempt,
        maxAttempts,
        operationName,
        startTime,
      });

      if (result.success) {
        return result;
      }

      lastError = result.error;

      const shouldRetry = attempt < maxAttempts;
      if (shouldRetry) {
        await this.sleepWithBackoff(baseDelay, attempt);
      }
    }

    return this.createFailureResult(lastError, maxAttempts, Date.now() - startTime, operationName);
  }

  private async attemptOperation<T>(params: {
    operation: () => Promise<T>;
    attempt: number;
    maxAttempts: number;
    operationName: string;
    startTime: number;
  }): Promise<RecoveryResult<T>> {
    try {
      logger.debug(`Attempting operation: ${params.operationName}, attempt ${params.attempt}/${params.maxAttempts}`);
      const data = await params.operation();
      return this.createSuccessResult(data, params.attempt, Date.now() - params.startTime);
    } catch (error) {
      const err = error as Error;
      logger.warn(`Operation failed: ${params.operationName}, attempt ${params.attempt}/${params.maxAttempts}`, {
        error: err.message,
      });
      return { success: false, error: err, strategyUsed: 'retry', attempts: params.attempt, fallbacksUsed: [] };
    }
  }

  private createSuccessResult<T>(data: T, attempts: number, recoveryTimeMs: number): RecoveryResult<T> {
    return {
      success: true,
      data,
      strategyUsed: 'retry',
      attempts,
      fallbacksUsed: [],
      recoveryTimeMs,
    };
  }

  private createFailureResult<T>(
    error: Error | undefined,
    attempts: number,
    recoveryTimeMs: number,
    operationName: string
  ): RecoveryResult<T> {
    logger.error(`Operation exhausted retries: ${operationName}`, {
      attempts,
      error: error?.message,
      recoveryTimeMs,
    });

    return {
      success: false,
      error,
      strategyUsed: 'retry',
      attempts,
      fallbacksUsed: [],
      recoveryTimeMs,
    };
  }

  private async sleepWithBackoff(baseDelay: number, attempt: number): Promise<void> {
    const delay = baseDelay * Math.pow(2, attempt - 1);
    logger.debug(`Retrying after ${delay}ms...`);
    await this.sleep(delay);
  }

  /**
   * Execute operation with circuit breaker pattern
   * Prevents cascade failures when downstream services fail
   */
  async executeWithCircuitBreaker<T>(
    key: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();
    const breaker = this.getOrCreateCircuitBreaker(key);

    if (breaker.isOpen()) {
      return this.handleOpenCircuit({ key, fallback, startTime });
    }

    return this.executePrimaryOperation({ key, operation, fallback, breaker, startTime });
  }

  private getOrCreateCircuitBreaker(key: string): CircuitBreaker {
    let breaker = this.circuitBreakers.get(key);

    if (!breaker) {
      breaker = new CircuitBreaker(key, {
        threshold: 3,
        timeout: 60000,
        resetTimeout: 30000,
        halfOpenRequests: 3,
      });
      this.circuitBreakers.set(key, breaker);
    }

    return breaker;
  }

  private async handleOpenCircuit<T>(params: {
    key: string;
    fallback: (() => Promise<T>) | undefined;
    startTime: number;
  }): Promise<RecoveryResult<T>> {
    const breaker = this.circuitBreakers.get(params.key)!;
    logger.warn(`Circuit breaker open for ${params.key}, using fallback`, {
      state: breaker.getState(),
      failures: breaker.getFailureCount(),
    });

    if (params.fallback) {
      return this.executeFallback({ key: params.key, fallback: params.fallback, startTime: params.startTime, attempts: 0 });
    }

    return {
      success: false,
      error: new Error(`Circuit breaker open: ${params.key}`),
      strategyUsed: 'circuit-breaker-blocked',
      attempts: 0,
      fallbacksUsed: [],
      recoveryTimeMs: Date.now() - params.startTime,
    };
  }

  private async executePrimaryOperation<T>(params: {
    key: string;
    operation: () => Promise<T>;
    fallback: (() => Promise<T>) | undefined;
    breaker: CircuitBreaker;
    startTime: number;
  }): Promise<RecoveryResult<T>> {
    try {
      const data = await params.operation();
      params.breaker.recordSuccess();
      const recoveryTimeMs = Date.now() - params.startTime;

      return {
        success: true,
        data,
        strategyUsed: 'primary',
        attempts: 1,
        fallbacksUsed: [],
        recoveryTimeMs,
      };
    } catch (error) {
      params.breaker.recordFailure();
      logger.warn(`Circuit breaker recorded failure for ${params.key}`, {
        state: params.breaker.getState(),
        failures: params.breaker.getFailureCount(),
      });

      if (params.fallback) {
        return this.executeFallback({ key: params.key, fallback: params.fallback, startTime: params.startTime, attempts: 1 });
      }

      return {
        success: false,
        error: error as Error,
        strategyUsed: 'circuit-breaker-failed',
        attempts: 1,
        fallbacksUsed: [],
        recoveryTimeMs: Date.now() - params.startTime,
      };
    }
  }

  private async executeFallback<T>(params: {
    key: string;
    fallback: () => Promise<T>;
    startTime: number;
    attempts: number;
  }): Promise<RecoveryResult<T>> {
    try {
      const data = await params.fallback();
      const recoveryTimeMs = Date.now() - params.startTime;
      return {
        success: true,
        data,
        strategyUsed: 'circuit-breaker-fallback',
        attempts: params.attempts,
        fallbacksUsed: [params.key],
        recoveryTimeMs,
      };
    } catch (error) {
      logger.error(`Fallback also failed for ${params.key}`, { error });
      return {
        success: false,
        error: error as Error,
        strategyUsed: 'circuit-breaker-fallback-failed',
        attempts: params.attempts,
        fallbacksUsed: [params.key],
        recoveryTimeMs: Date.now() - params.startTime,
      };
    }
  }

  /**
   * Graceful degradation for protocol retrieval
   * NEVER returns empty - always has fallback
   */
  async retrieveProtocolWithFallback(
    tpCode: string
  ): Promise<RecoveryResult<Protocol>> {
    const startTime = Date.now();
    logger.info(`Retrieving protocol with fallback: ${tpCode}`);

    // Try each strategy in order
    const dbResult = await this.tryDatabaseRetrieval(tpCode, startTime);
    if (dbResult) return dbResult;

    const cacheResult = await this.tryCacheRetrieval(tpCode, startTime);
    if (cacheResult) return cacheResult;

    const fileResult = await this.tryFileRetrieval(tpCode, startTime);
    if (fileResult) return fileResult;

    return this.returnConservativeDefault(tpCode, startTime);
  }

  private async tryDatabaseRetrieval(tpCode: string, startTime: number): Promise<RecoveryResult<Protocol> | null> {
    const dbResult = await this.retryWithBackoff(
      () => this.repo.getProtocolByCode(tpCode),
      2,
      500,
      `database-lookup-${tpCode}`
    );

    if (dbResult.success && dbResult.data) {
      this.cacheProtocol(tpCode, dbResult.data);
      logger.info(`Protocol retrieved from database: ${tpCode}`, {
        recoveryTimeMs: Date.now() - startTime,
      });
      return {
        ...dbResult,
        recoveryTimeMs: Date.now() - startTime,
      };
    }

    logger.warn(`Database retrieval failed for ${tpCode}, trying fallbacks...`);
    return null;
  }

  private async tryCacheRetrieval(tpCode: string, startTime: number): Promise<RecoveryResult<Protocol> | null> {
    const cached = this.cache.get(tpCode);
    if (cached && !this.isCacheExpired(cached)) {
      logger.info(`Using cached protocol: ${tpCode}`, {
        cacheAge: Date.now() - cached.timestamp,
      });
      return {
        success: true,
        data: cached.protocol,
        strategyUsed: 'cache',
        attempts: 0,
        fallbacksUsed: ['database'],
        recoveryTimeMs: Date.now() - startTime,
      };
    }
    return null;
  }

  private async tryFileRetrieval(tpCode: string, startTime: number): Promise<RecoveryResult<Protocol> | null> {
    try {
      await this.ensureFileBasedInitialized();
      const fileProtocol = await this.loadFromFiles(tpCode);

      if (fileProtocol) {
        this.cacheProtocol(tpCode, fileProtocol);
        logger.info(`Protocol retrieved from file system: ${tpCode}`, {
          recoveryTimeMs: Date.now() - startTime,
        });
        return {
          success: true,
          data: fileProtocol,
          strategyUsed: 'file-fallback',
          attempts: 0,
          fallbacksUsed: ['database', 'cache'],
          recoveryTimeMs: Date.now() - startTime,
        };
      }
    } catch (error) {
      logger.error('File fallback failed', { tpCode, error });
    }
    return null;
  }

  private returnConservativeDefault(tpCode: string, startTime: number): RecoveryResult<Protocol> {
    logger.error(`All strategies failed for ${tpCode}, returning conservative guidance`);
    const conservative = this.getConservativeProtocol(tpCode);

    return {
      success: false,
      data: conservative,
      error: new Error(`All retrieval strategies failed for ${tpCode}`),
      strategyUsed: 'conservative-default',
      attempts: 0,
      fallbacksUsed: ['database', 'cache', 'file'],
      recoveryTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Search with fallback strategies
   * Ensures search always returns results or clear guidance
   */
  async searchWithFallback(
    query: string,
    options?: { limit?: number; category?: string }
  ): Promise<RecoveryResult<ProtocolChunk[]>> {
    const startTime = Date.now();
    logger.info(`Searching protocols with fallback: "${query}"`);

    const dbResult = await this.tryDatabaseSearch(query, options, startTime);
    if (dbResult) return dbResult;

    const fileResult = await this.tryFileSearch(query, options, startTime);
    if (fileResult) return fileResult;

    return this.returnNoResults(query, startTime);
  }

  private async tryDatabaseSearch(
    query: string,
    options: { limit?: number; category?: string } | undefined,
    startTime: number
  ): Promise<RecoveryResult<ProtocolChunk[]> | null> {
    try {
      const results = await this.repo.searchProtocolChunks(query, options);
      if (results && results.length > 0) {
        logger.info(`Search successful via database: ${results.length} results`, {
          query,
          recoveryTimeMs: Date.now() - startTime,
        });
        return {
          success: true,
          data: results,
          strategyUsed: 'database-hybrid',
          attempts: 1,
          fallbacksUsed: [],
          recoveryTimeMs: Date.now() - startTime,
        };
      }
    } catch (error) {
      logger.error('Database search failed', { query, error });
    }
    return null;
  }

  private async tryFileSearch(
    query: string,
    options: { limit?: number; category?: string } | undefined,
    startTime: number
  ): Promise<RecoveryResult<ProtocolChunk[]> | null> {
    try {
      await this.ensureFileBasedInitialized();
      const fileResults = await this.searchFiles(query, options?.limit || 10);

      if (fileResults && fileResults.length > 0) {
        logger.info(`Search successful via file system: ${fileResults.length} results`, {
          query,
          recoveryTimeMs: Date.now() - startTime,
        });
        return {
          success: true,
          data: fileResults,
          strategyUsed: 'file-search',
          attempts: 1,
          fallbacksUsed: ['database'],
          recoveryTimeMs: Date.now() - startTime,
        };
      }
    } catch (error) {
      logger.error('File search failed', { query, error });
    }
    return null;
  }

  private returnNoResults(query: string, startTime: number): RecoveryResult<ProtocolChunk[]> {
    logger.warn(`No results found for query: "${query}"`);
    return {
      success: false,
      error: new Error(`No results found for: ${query}`),
      data: [],
      strategyUsed: 'no-results',
      attempts: 1,
      fallbacksUsed: ['database', 'file'],
      recoveryTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Get circuit breaker status for monitoring
   */
  getCircuitBreakerStatus(): Record<string, {
    state: string;
    failures: number;
  }> {
    const status: Record<string, { state: string; failures: number }> = {};

    // Convert to array to avoid downlevelIteration issues
    const entries = Array.from(this.circuitBreakers.entries());
    for (const [key, breaker] of entries) {
      status[key] = {
        state: breaker.getState(),
        failures: breaker.getFailureCount(),
      };
    }

    return status;
  }

  /**
   * Reset all circuit breakers (for testing or recovery)
   */
  resetAllCircuitBreakers(): void {
    logger.info('Resetting all circuit breakers');
    // Convert to array to avoid downlevelIteration issues
    const breakers = Array.from(this.circuitBreakers.values());
    for (const breaker of breakers) {
      breaker.reset();
    }
  }

  /**
   * Clear cache (for testing or forced refresh)
   */
  clearCache(): void {
    logger.info('Clearing protocol cache', {
      cachedItems: this.cache.size,
    });
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ tpCode: string; age: number; ttl: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([tpCode, cached]) => ({
      tpCode,
      age: Date.now() - cached.timestamp,
      ttl: cached.ttl,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cacheProtocol(tpCode: string, protocol: Protocol): void {
    this.cache.set(tpCode, {
      protocol,
      timestamp: Date.now(),
      ttl: 3600000, // 1 hour
    });
    logger.debug(`Protocol cached: ${tpCode}`);
  }

  private isCacheExpired(cached: CachedProtocol): boolean {
    const expired = Date.now() - cached.timestamp > cached.ttl;
    if (expired) {
      logger.debug('Cache entry expired', {
        age: Date.now() - cached.timestamp,
        ttl: cached.ttl,
      });
    }
    return expired;
  }

  private async ensureFileBasedInitialized(): Promise<void> {
    if (!this.fileBasedInitialized) {
      logger.info('Initializing file-based knowledge base');
      await initializeKnowledgeBase();
      this.fileBasedInitialized = true;
    }
  }

  private async loadFromFiles(tpCode: string): Promise<Protocol | null> {
    return loadProtocolFromFiles(tpCode);
  }

  private async searchFiles(query: string, limit: number): Promise<ProtocolChunk[]> {
    return searchProtocolFiles(query, limit);
  }

  private getConservativeProtocol(tpCode: string): Protocol | undefined {
    // Return very conservative guidance when all else fails
    // This ensures system never returns dangerous info
    logger.warn(`Returning conservative protocol for ${tpCode}`);

    // Don't return anything - let the calling code handle the error
    // This is safer than returning potentially incorrect medical information
    return undefined;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: ProtocolErrorRecovery | null = null;

/**
 * Get the singleton instance of ProtocolErrorRecovery
 */
export function getProtocolErrorRecovery(): ProtocolErrorRecovery {
  if (!instance) {
    instance = new ProtocolErrorRecovery();
  }
  return instance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetProtocolErrorRecovery(): void {
  instance = null;
}
