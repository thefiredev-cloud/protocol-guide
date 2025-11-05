/**
 * Validation Monitor Tests
 *
 * Tests metrics tracking, pattern detection, and reporting
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  getValidationMonitor,
  resetValidationMonitor,
  ValidationMonitor,
} from '@/lib/protocols/validation-monitor';
import type { ValidationResult } from '@/lib/protocols/validation-pipeline';

describe('ValidationMonitor - Metrics Tracking', () => {
  let monitor: ValidationMonitor;

  beforeEach(() => {
    resetValidationMonitor();
    monitor = getValidationMonitor();
    monitor.clear();
  });

  it('should track successful validations', () => {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    monitor.recordValidation('pre-retrieval', result, 10);

    const metrics = monitor.getMetrics();
    expect(metrics.totalValidations).toBe(1);
    expect(metrics.successfulValidations).toBe(1);
    expect(metrics.failedValidations).toBe(0);
    expect(metrics.successRate).toBe(100);
  });

  it('should track failed validations', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'INVALID_PROTOCOL_CODE',
          message: 'Protocol not found',
          severity: 'error',
        },
      ],
      warnings: [],
    };

    monitor.recordValidation('pre-retrieval', result, 10, { query: 'test' });

    const metrics = monitor.getMetrics();
    expect(metrics.totalValidations).toBe(1);
    expect(metrics.successfulValidations).toBe(0);
    expect(metrics.failedValidations).toBe(1);
    expect(metrics.successRate).toBe(0);
  });

  it('should calculate success rate correctly', () => {
    const successResult: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    const failResult: ValidationResult = {
      valid: false,
      errors: [{ code: 'TEST_ERROR', message: 'Test', severity: 'error' }],
      warnings: [],
    };

    // Record 9 successes and 1 failure
    for (let i = 0; i < 9; i++) {
      monitor.recordValidation('post-response', successResult, 10);
    }
    monitor.recordValidation('post-response', failResult, 10);

    const metrics = monitor.getMetrics();
    expect(metrics.totalValidations).toBe(10);
    expect(metrics.successRate).toBe(90); // 90%
  });

  it('should track critical errors separately', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'CRITICAL_ERROR',
          message: 'Critical issue',
          severity: 'critical',
        },
        {
          code: 'NORMAL_ERROR',
          message: 'Normal issue',
          severity: 'error',
        },
      ],
      warnings: [
        {
          code: 'WARNING',
          message: 'Warning message',
          severity: 'warning',
        },
      ],
    };

    monitor.recordValidation('post-response', result, 10);

    const metrics = monitor.getMetrics();
    expect(metrics.criticalErrors).toBe(1);
    expect(metrics.errors).toBe(1);
    expect(metrics.warnings).toBe(1);
  });

  it('should calculate average validation time', () => {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    monitor.recordValidation('pre-retrieval', result, 10);
    monitor.recordValidation('pre-retrieval', result, 20);
    monitor.recordValidation('pre-retrieval', result, 30);

    const metrics = monitor.getMetrics();
    expect(metrics.averageValidationTime).toBe(20); // (10+20+30)/3
  });
});

describe('ValidationMonitor - Pattern Detection', () => {
  let monitor: ValidationMonitor;

  beforeEach(() => {
    resetValidationMonitor();
    monitor = getValidationMonitor();
    monitor.clear();
  });

  it('should detect recurring error patterns', () => {
    const result1: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'INVALID_PROTOCOL_CODE',
          message: 'Protocol 1234 not found',
          severity: 'error',
        },
      ],
      warnings: [],
    };

    const result2: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'INVALID_PROTOCOL_CODE',
          message: 'Protocol 5678 not found',
          severity: 'error',
        },
      ],
      warnings: [],
    };

    monitor.recordValidation('pre-retrieval', result1, 10);
    monitor.recordValidation('pre-retrieval', result2, 10);

    const patterns = monitor.getPatterns(2);
    expect(patterns).toHaveLength(1);
    expect(patterns[0].errorCode).toBe('INVALID_PROTOCOL_CODE');
    expect(patterns[0].frequency).toBe(2);
  });

  it('should filter patterns by minimum frequency', () => {
    const errors = [
      { code: 'ERROR_A', frequency: 5 },
      { code: 'ERROR_B', frequency: 3 },
      { code: 'ERROR_C', frequency: 1 },
    ];

    for (const error of errors) {
      for (let i = 0; i < error.frequency; i++) {
        const result: ValidationResult = {
          valid: false,
          errors: [
            {
              code: error.code,
              message: 'Test error',
              severity: 'error',
            },
          ],
          warnings: [],
        };
        monitor.recordValidation('post-response', result, 10);
      }
    }

    const patterns = monitor.getPatterns(3);
    expect(patterns.length).toBe(2); // Only ERROR_A and ERROR_B
    expect(patterns[0].errorCode).toBe('ERROR_A'); // Sorted by frequency
    expect(patterns[1].errorCode).toBe('ERROR_B');
  });

  it('should store example messages for patterns', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'TEST_ERROR',
          message: 'Example error message',
          severity: 'error',
        },
      ],
      warnings: [],
    };

    monitor.recordValidation('post-response', result, 10);

    const patterns = monitor.getPatterns(1);
    expect(patterns[0].examples).toContain('Example error message');
  });
});

describe('ValidationMonitor - Failure Analysis', () => {
  let monitor: ValidationMonitor;

  beforeEach(() => {
    resetValidationMonitor();
    monitor = getValidationMonitor();
    monitor.clear();
  });

  it('should retrieve recent failures', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'TEST_ERROR',
          message: 'Test',
          severity: 'error',
        },
      ],
      warnings: [],
    };

    monitor.recordValidation('post-response', result, 10, { query: 'test query' });

    const failures = monitor.getRecentFailures(10);
    expect(failures).toHaveLength(1);
    expect(failures[0].stage).toBe('post-response');
    expect(failures[0].query).toBe('test query');
  });

  it('should filter failures by stage', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [{ code: 'TEST', message: 'Test', severity: 'error' }],
      warnings: [],
    };

    monitor.recordValidation('pre-retrieval', result, 10);
    monitor.recordValidation('post-response', result, 10);
    monitor.recordValidation('post-response', result, 10);

    const postResponseFailures = monitor.getFailuresByStage('post-response');
    expect(postResponseFailures).toHaveLength(2);

    const preRetrievalFailures = monitor.getFailuresByStage('pre-retrieval');
    expect(preRetrievalFailures).toHaveLength(1);
  });
});

describe('ValidationMonitor - Success Target', () => {
  let monitor: ValidationMonitor;

  beforeEach(() => {
    resetValidationMonitor();
    monitor = getValidationMonitor();
    monitor.clear();
  });

  it('should check if success rate meets target', () => {
    const successResult: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Record 100 successful validations
    for (let i = 0; i < 100; i++) {
      monitor.recordValidation('post-response', successResult, 10);
    }

    expect(monitor.meetsSuccessTarget(99)).toBe(true);
    expect(monitor.meetsSuccessTarget(100)).toBe(true);
    expect(monitor.meetsSuccessTarget(101)).toBe(false);
  });

  it('should return false when success rate is below target', () => {
    const successResult: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    const failResult: ValidationResult = {
      valid: false,
      errors: [{ code: 'TEST', message: 'Test', severity: 'error' }],
      warnings: [],
    };

    // 90 successes, 10 failures = 90% success rate
    for (let i = 0; i < 90; i++) {
      monitor.recordValidation('post-response', successResult, 10);
    }
    for (let i = 0; i < 10; i++) {
      monitor.recordValidation('post-response', failResult, 10);
    }

    expect(monitor.meetsSuccessTarget(85)).toBe(true);
    expect(monitor.meetsSuccessTarget(90)).toBe(true);
    expect(monitor.meetsSuccessTarget(95)).toBe(false);
  });
});

describe('ValidationMonitor - Report Generation', () => {
  let monitor: ValidationMonitor;

  beforeEach(() => {
    resetValidationMonitor();
    monitor = getValidationMonitor();
    monitor.clear();
  });

  it('should generate comprehensive report', () => {
    const successResult: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    const failResult: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'TEST_ERROR',
          message: 'Test error message',
          severity: 'error',
        },
      ],
      warnings: [],
    };

    // Record some validations
    for (let i = 0; i < 95; i++) {
      monitor.recordValidation('post-response', successResult, 10);
    }
    for (let i = 0; i < 5; i++) {
      monitor.recordValidation('post-response', failResult, 10, {
        query: 'test query',
      });
    }

    const report = monitor.generateReport();

    expect(report).toContain('VALIDATION MONITORING REPORT');
    expect(report).toContain('Total Validations: 100');
    expect(report).toContain('Success Rate: 95.00%');
    expect(report).toContain('TARGET (99%): ✗ NOT MET');
  });

  it('should include patterns in report', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          code: 'COMMON_ERROR',
          message: 'This error happens often',
          severity: 'error',
        },
      ],
      warnings: [],
    };

    for (let i = 0; i < 3; i++) {
      monitor.recordValidation('post-response', result, 10);
    }

    const report = monitor.generateReport();

    expect(report).toContain('TOP ERROR PATTERNS');
    expect(report).toContain('COMMON_ERROR');
    expect(report).toContain('3 occurrences');
  });
});

describe('ValidationMonitor - Data Management', () => {
  let monitor: ValidationMonitor;

  beforeEach(() => {
    resetValidationMonitor();
    monitor = getValidationMonitor();
    monitor.clear();
  });

  it('should clear all monitoring data', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [{ code: 'TEST', message: 'Test', severity: 'error' }],
      warnings: [],
    };

    monitor.recordValidation('post-response', result, 10);

    let metrics = monitor.getMetrics();
    expect(metrics.totalValidations).toBe(1);

    monitor.clear();

    metrics = monitor.getMetrics();
    expect(metrics.totalValidations).toBe(0);
  });

  it('should export metrics for external monitoring', () => {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    monitor.recordValidation('post-response', result, 10);

    const exported = monitor.exportMetrics();

    expect(exported.metrics).toBeDefined();
    expect(exported.patterns).toBeDefined();
    expect(exported.recentFailures).toBeDefined();
  });
});

describe('ValidationMonitor - Integration', () => {
  it('should provide singleton instance', () => {
    const instance1 = getValidationMonitor();
    const instance2 = getValidationMonitor();

    expect(instance1).toBe(instance2);
  });

  it('should reset singleton for testing', () => {
    const instance1 = getValidationMonitor();
    resetValidationMonitor();
    const instance2 = getValidationMonitor();

    expect(instance1).not.toBe(instance2);
  });
});
