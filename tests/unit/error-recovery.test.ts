import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CircuitBreaker } from '@/lib/protocols/circuit-breaker';
import { ProtocolErrorRecovery } from '@/lib/protocols/error-recovery';

describe('Error Recovery System', () => {
  let recovery: ProtocolErrorRecovery;

  beforeEach(() => {
    recovery = new ProtocolErrorRecovery();
  });

  describe('Retry with Backoff', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await recovery.retryWithBackoff(operation, 3, 100, 'test-op');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await recovery.retryWithBackoff(operation, 3, 10, 'test-op');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

      const result = await recovery.retryWithBackoff(operation, 3, 10, 'test-op');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Always fails');
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('Circuit Breaker', () => {
    it('should execute operation when circuit is closed', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await recovery.executeWithCircuitBreaker('test-key', operation);

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.strategyUsed).toBe('primary');
    });

    it('should use fallback when circuit is open', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Fail'));
      const fallback = vi.fn().mockResolvedValue('fallback-success');

      // Trigger circuit breaker to open (need 3 failures)
      await recovery.executeWithCircuitBreaker('test-key', operation, fallback);
      await recovery.executeWithCircuitBreaker('test-key', operation, fallback);
      await recovery.executeWithCircuitBreaker('test-key', operation, fallback);

      // Circuit should now be open
      const result = await recovery.executeWithCircuitBreaker('test-key', operation, fallback);

      expect(result.success).toBe(true);
      expect(result.data).toBe('fallback-success');
      expect(result.fallbacksUsed).toContain('test-key');
    });

    it('should block operations when circuit is open without fallback', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Fail'));

      // Trigger circuit breaker to open
      await recovery.executeWithCircuitBreaker('test-key', operation);
      await recovery.executeWithCircuitBreaker('test-key', operation);
      await recovery.executeWithCircuitBreaker('test-key', operation);

      // Circuit should now be open
      const result = await recovery.executeWithCircuitBreaker('test-key', operation);

      expect(result.success).toBe(false);
      expect(result.strategyUsed).toBe('circuit-breaker-blocked');
      expect(result.error?.message).toContain('Circuit breaker open');
    });
  });

  describe('Cache Operations', () => {
    it('should cache and retrieve protocols', async () => {
      const mockProtocol = {
        id: '1210',
        tp_code: '1210',
        tp_name: 'Cardiac Arrest',
        tp_category: 'Cardiac',
        full_text: 'Test protocol content',
        keywords: ['cardiac', 'arrest'],
        chief_complaints: ['no pulse'],
        base_contact_required: true,
        warnings: [],
        contraindications: [],
        version: 1,
        effective_date: new Date().toISOString(),
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock the repository to fail so cache is used
      vi.spyOn(recovery['repo'], 'getProtocolByCode').mockRejectedValue(new Error('DB fail'));

      // First call should fail and not use cache
      const firstResult = await recovery.retrieveProtocolWithFallback('1210');
      expect(firstResult.success).toBe(false);

      // Manually cache the protocol
      recovery['cacheProtocol']('1210', mockProtocol);

      // Second call should use cache
      const secondResult = await recovery.retrieveProtocolWithFallback('1210');
      expect(secondResult.success).toBe(true);
      expect(secondResult.strategyUsed).toBe('cache');
      expect(secondResult.data?.tp_code).toBe('1210');
    });

    it('should return cache statistics', () => {
      const stats = recovery.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(Array.isArray(stats.entries)).toBe(true);
    });

    it('should clear cache', () => {
      recovery.clearCache();
      const stats = recovery.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Circuit Breaker Status', () => {
    it('should return circuit breaker status', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Fail'));

      // Trigger some failures
      await recovery.executeWithCircuitBreaker('test-1', operation);
      await recovery.executeWithCircuitBreaker('test-2', operation);

      const status = recovery.getCircuitBreakerStatus();
      expect(status).toHaveProperty('test-1');
      expect(status).toHaveProperty('test-2');
    });

    it('should reset all circuit breakers', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Fail'));

      // Trigger failures
      await recovery.executeWithCircuitBreaker('test-key', operation);

      recovery.resetAllCircuitBreakers();

      const status = recovery.getCircuitBreakerStatus();
      if (status['test-key']) {
        expect(status['test-key'].state).toBe('closed');
        expect(status['test-key'].failures).toBe(0);
      }
    });
  });
});

describe('CircuitBreaker', () => {
  it('should transition through states correctly', () => {
    const breaker = new CircuitBreaker('test', {
      threshold: 2,
      timeout: 1000,
      resetTimeout: 1000,
      halfOpenRequests: 1,
    });

    // Initial state: closed
    expect(breaker.getState()).toBe('closed');
    expect(breaker.isOpen()).toBe(false);

    // Record failures to open circuit
    breaker.recordFailure();
    expect(breaker.getState()).toBe('closed');

    breaker.recordFailure();
    expect(breaker.getState()).toBe('open');
    expect(breaker.isOpen()).toBe(true);

    // Reset should close circuit
    breaker.reset();
    expect(breaker.getState()).toBe('closed');
    expect(breaker.isOpen()).toBe(false);
  });

  it('should track failure count', () => {
    const breaker = new CircuitBreaker('test', {
      threshold: 3,
      timeout: 1000,
      resetTimeout: 1000,
    });

    expect(breaker.getFailureCount()).toBe(0);

    breaker.recordFailure();
    expect(breaker.getFailureCount()).toBe(1);

    breaker.recordFailure();
    expect(breaker.getFailureCount()).toBe(2);

    breaker.recordSuccess();
    expect(breaker.getFailureCount()).toBe(0);
  });
});
