import { getProtocolRepository } from '../db/protocol-repository';
import { createLogger } from '../log';
import { getProtocolErrorRecovery } from './error-recovery';

const logger = createLogger('HealthCheck');

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: ComponentHealth;
    cache: ComponentHealth;
    circuitBreakers: ComponentHealth;
    fileSystem: ComponentHealth;
  };
  responseTimeMs: number;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Health Check System
 * Monitors system components and provides health status
 */
export class ProtocolHealthCheck {
  private repo = getProtocolRepository();
  private recovery = getProtocolErrorRecovery();

  /**
   * Perform comprehensive health check
   */
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    logger.info('Starting health check');

    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      circuitBreakers: await this.checkCircuitBreakers(),
      fileSystem: await this.checkFileSystem(),
    };

    const statuses = Object.values(checks).map(c => c.status);
    const overallStatus = this.determineOverallStatus(statuses);

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      responseTimeMs: Date.now() - startTime,
    };

    logger.info('Health check completed', {
      status: overallStatus,
      responseTimeMs: result.responseTimeMs,
    });

    return result;
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<ComponentHealth> {
    try {
      const startTime = Date.now();
      const stats = await this.repo.getProtocolStats();
      const responseTime = Date.now() - startTime;

      if (responseTime > 5000) {
        return {
          status: 'degraded',
          message: 'Database response time is slow',
          details: { responseTimeMs: responseTime, ...stats },
        };
      }

      if (stats.embedding_coverage_percent < 50) {
        return {
          status: 'degraded',
          message: 'Low embedding coverage',
          details: stats,
        };
      }

      return {
        status: 'healthy',
        message: 'Database operational',
        details: stats,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check cache status
   */
  private async checkCache(): Promise<ComponentHealth> {
    try {
      const stats = this.recovery.getCacheStats();

      if (stats.size === 0) {
        return {
          status: 'degraded',
          message: 'Cache is empty',
          details: stats,
        };
      }

      return {
        status: 'healthy',
        message: 'Cache operational',
        details: stats,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Cache error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check circuit breaker status
   */
  private async checkCircuitBreakers(): Promise<ComponentHealth> {
    try {
      const breakerStatus = this.recovery.getCircuitBreakerStatus();
      const openBreakers = Object.entries(breakerStatus).filter(
        ([, status]) => status.state === 'open'
      );

      if (openBreakers.length > 0) {
        return {
          status: 'degraded',
          message: `${openBreakers.length} circuit breaker(s) open`,
          details: { openBreakers: openBreakers.map(([key]) => key), ...breakerStatus },
        };
      }

      return {
        status: 'healthy',
        message: 'All circuit breakers closed',
        details: breakerStatus,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Circuit breaker error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check file system access
   */
  private async checkFileSystem(): Promise<ComponentHealth> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const metadataPath = path.join(process.cwd(), 'data', 'protocol-metadata.json');
      await fs.access(metadataPath);

      return {
        status: 'healthy',
        message: 'File system accessible',
      };
    } catch (error) {
      return {
        status: 'degraded',
        message: 'File system access issues',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Determine overall status from component statuses
   */
  private determineOverallStatus(
    statuses: Array<'healthy' | 'degraded' | 'unhealthy'>
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Quick health check (fast, minimal checks)
   */
  async quickCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTimeMs: number }> {
    const startTime = Date.now();

    try {
      // Just check if database is reachable
      await this.repo.getProtocolStats();

      return {
        status: 'healthy',
        responseTimeMs: Date.now() - startTime,
      };
    } catch {
      return {
        status: 'unhealthy',
        responseTimeMs: Date.now() - startTime,
      };
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: ProtocolHealthCheck | null = null;

/**
 * Get the singleton instance of ProtocolHealthCheck
 */
export function getProtocolHealthCheck(): ProtocolHealthCheck {
  if (!instance) {
    instance = new ProtocolHealthCheck();
  }
  return instance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetProtocolHealthCheck(): void {
  instance = null;
}
