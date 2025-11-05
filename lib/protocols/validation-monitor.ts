/**
 * Validation Monitoring System
 *
 * Tracks validation failures, patterns, and performance metrics
 * to maintain 99%+ accuracy
 */

import type { ValidationError, ValidationResult, ValidationWarning } from './validation-pipeline';

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationMetrics {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  successRate: number;
  criticalErrors: number;
  errors: number;
  warnings: number;
  averageValidationTime: number;
}

export interface ValidationFailure {
  timestamp: Date;
  stage: 'pre-retrieval' | 'during-retrieval' | 'pre-response' | 'post-response';
  query?: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  context?: Record<string, unknown>;
}

export interface ValidationPattern {
  errorCode: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  examples: string[];
}

// =============================================================================
// VALIDATION MONITOR
// =============================================================================

export class ValidationMonitor {
  private failures: ValidationFailure[] = [];
  private validations: Array<{ success: boolean; duration: number; timestamp: Date }> = [];
  private patterns: Map<string, ValidationPattern> = new Map();
  private readonly maxFailures = 1000;
  private readonly maxValidations = 10000;

  /**
   * Record a validation result
   */
  recordValidation(
    stage: ValidationFailure['stage'],
    result: ValidationResult,
    duration: number,
    context?: { query?: string; [key: string]: unknown }
  ): void {
    const timestamp = new Date();

    // Record validation
    this.validations.push({
      success: result.valid,
      duration,
      timestamp,
    });

    // Trim old validations
    if (this.validations.length > this.maxValidations) {
      this.validations = this.validations.slice(-this.maxValidations);
    }

    // Record failure if validation failed
    if (!result.valid || result.errors.length > 0) {
      const failure: ValidationFailure = {
        timestamp,
        stage,
        query: context?.query,
        errors: result.errors,
        warnings: result.warnings,
        context,
      };

      this.failures.push(failure);

      // Trim old failures
      if (this.failures.length > this.maxFailures) {
        this.failures = this.failures.slice(-this.maxFailures);
      }

      // Update patterns
      this.updatePatterns(result.errors, timestamp);
    }

    // Also track warning patterns
    if (result.warnings.length > 0) {
      this.updateWarningPatterns(result.warnings, timestamp);
    }
  }

  /**
   * Get validation metrics
   */
  getMetrics(timeWindowMs?: number): ValidationMetrics {
    let validations = this.validations;

    // Filter by time window if specified
    if (timeWindowMs) {
      const cutoff = new Date(Date.now() - timeWindowMs);
      validations = validations.filter(v => v.timestamp >= cutoff);
    }

    const total = validations.length;
    const successful = validations.filter(v => v.success).length;
    const failed = total - successful;

    // Calculate error counts from recent failures
    let criticalErrors = 0;
    let errors = 0;
    let warnings = 0;

    const recentFailures = timeWindowMs
      ? this.failures.filter(f => f.timestamp >= new Date(Date.now() - timeWindowMs))
      : this.failures;

    for (const failure of recentFailures) {
      criticalErrors += failure.errors.filter(e => e.severity === 'critical').length;
      errors += failure.errors.filter(e => e.severity === 'error').length;
      warnings += failure.warnings.length;
    }

    const avgDuration = total > 0
      ? validations.reduce((sum, v) => sum + v.duration, 0) / total
      : 0;

    return {
      totalValidations: total,
      successfulValidations: successful,
      failedValidations: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      criticalErrors,
      errors,
      warnings,
      averageValidationTime: avgDuration,
    };
  }

  /**
   * Get validation patterns
   */
  getPatterns(minFrequency = 2): ValidationPattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.frequency >= minFrequency)
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get recent failures
   */
  getRecentFailures(limit = 10): ValidationFailure[] {
    return this.failures.slice(-limit).reverse();
  }

  /**
   * Get failures by stage
   */
  getFailuresByStage(stage: ValidationFailure['stage']): ValidationFailure[] {
    return this.failures.filter(f => f.stage === stage);
  }

  /**
   * Get failure rate by stage
   */
  getFailureRateByStage(): Record<string, number> {
    const stages: ValidationFailure['stage'][] = [
      'pre-retrieval',
      'during-retrieval',
      'pre-response',
      'post-response',
    ];

    const rates: Record<string, number> = {};

    for (const stage of stages) {
      const stageFailures = this.failures.filter(f => f.stage === stage).length;
      const stageValidations = this.validations.length;

      rates[stage] = stageValidations > 0
        ? (stageFailures / stageValidations) * 100
        : 0;
    }

    return rates;
  }

  /**
   * Check if success rate meets target
   */
  meetsSuccessTarget(targetRate = 99, timeWindowMs?: number): boolean {
    const metrics = this.getMetrics(timeWindowMs);
    return metrics.successRate >= targetRate;
  }

  /**
   * Generate validation report
   */
  generateReport(timeWindowMs?: number): string {
    const metrics = this.getMetrics(timeWindowMs);
    const patterns = this.getPatterns();
    const recentFailures = this.getRecentFailures(5);

    const lines: string[] = [];
    this.addReportHeader(lines);
    this.addMetricsSection(lines, metrics, timeWindowMs);
    this.addPatternsSection(lines, patterns);
    this.addFailuresSection(lines, recentFailures);
    lines.push('='.repeat(80));

    return lines.join('\n');
  }

  private addReportHeader(lines: string[]): void {
    lines.push('='.repeat(80));
    lines.push('VALIDATION MONITORING REPORT');
    lines.push('='.repeat(80));
    lines.push('');
  }

  private addMetricsSection(lines: string[], metrics: ValidationMetrics, timeWindowMs?: number): void {
    lines.push('METRICS:');
    lines.push(`  Total Validations: ${metrics.totalValidations}`);
    lines.push(`  Successful: ${metrics.successfulValidations}`);
    lines.push(`  Failed: ${metrics.failedValidations}`);
    lines.push(`  Success Rate: ${metrics.successRate.toFixed(2)}%`);
    lines.push(`  Critical Errors: ${metrics.criticalErrors}`);
    lines.push(`  Errors: ${metrics.errors}`);
    lines.push(`  Warnings: ${metrics.warnings}`);
    lines.push(`  Avg Validation Time: ${metrics.averageValidationTime.toFixed(2)}ms`);
    lines.push('');

    const targetMet = this.meetsSuccessTarget(99, timeWindowMs);
    lines.push(`TARGET (99%): ${targetMet ? '✓ MET' : '✗ NOT MET'}`);
    lines.push('');
  }

  private addPatternsSection(lines: string[], patterns: ValidationPattern[]): void {
    if (patterns.length === 0) return;

    lines.push('TOP ERROR PATTERNS:');
    for (const pattern of patterns.slice(0, 5)) {
      lines.push(`  ${pattern.errorCode}: ${pattern.frequency} occurrences`);
      const hasExamples = pattern.examples.length > 0;
      if (hasExamples) {
        lines.push(`    Example: ${pattern.examples[0].substring(0, 60)}...`);
      }
    }
    lines.push('');
  }

  private addFailuresSection(lines: string[], recentFailures: ValidationFailure[]): void {
    if (recentFailures.length === 0) return;

    lines.push('RECENT FAILURES:');
    for (const failure of recentFailures) {
      this.addFailureDetails(lines, failure);
    }
    lines.push('');
  }

  private addFailureDetails(lines: string[], failure: ValidationFailure): void {
    lines.push(`  [${failure.timestamp.toISOString()}] ${failure.stage}`);
    if (failure.query) {
      lines.push(`    Query: ${failure.query.substring(0, 60)}...`);
    }
    for (const error of failure.errors.slice(0, 2)) {
      lines.push(`    ${error.severity.toUpperCase()}: ${error.code} - ${error.message}`);
    }
  }

  /**
   * Clear all monitoring data
   */
  clear(): void {
    this.failures = [];
    this.validations = [];
    this.patterns.clear();
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): {
    metrics: ValidationMetrics;
    patterns: ValidationPattern[];
    recentFailures: ValidationFailure[];
  } {
    return {
      metrics: this.getMetrics(),
      patterns: this.getPatterns(),
      recentFailures: this.getRecentFailures(20),
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private updatePatterns(errors: ValidationError[], timestamp: Date): void {
    for (const error of errors) {
      this.updatePattern(error.code, error.message, timestamp);
    }
  }

  private updateWarningPatterns(warnings: ValidationWarning[], timestamp: Date): void {
    for (const warning of warnings) {
      this.updatePattern(warning.code, warning.message, timestamp);
    }
  }

  private updatePattern(code: string, message: string | undefined, timestamp: Date): void {
    const pattern = this.patterns.get(code);

    if (pattern) {
      pattern.frequency++;
      pattern.lastSeen = timestamp;
      const canAddExample = pattern.examples.length < 5 && message;
      if (canAddExample) {
        pattern.examples.push(message);
      }
    } else {
      this.patterns.set(code, {
        errorCode: code,
        frequency: 1,
        firstSeen: timestamp,
        lastSeen: timestamp,
        examples: message ? [message] : [],
      });
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let monitorInstance: ValidationMonitor | null = null;

/**
 * Get singleton validation monitor instance
 */
export function getValidationMonitor(): ValidationMonitor {
  if (!monitorInstance) {
    monitorInstance = new ValidationMonitor();
  }
  return monitorInstance;
}

/**
 * Reset validation monitor instance (for testing)
 */
export function resetValidationMonitor(): void {
  monitorInstance = null;
}
