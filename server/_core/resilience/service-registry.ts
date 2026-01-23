/**
 * Protocol Guide - Service Registry
 *
 * Centralized service health tracking and circuit breaker management.
 * Provides a single point of truth for service availability.
 */

import { logger } from '../logger';
import {
  CircuitBreaker,
  CircuitState,
  createDatabaseCircuitBreaker,
  createAICircuitBreaker,
  createRedisCircuitBreaker,
} from './circuit-breaker';

export type ServiceName = 'database' | 'redis' | 'ai-claude' | 'ai-voyage' | 'supabase';

export interface ServiceStatus {
  name: ServiceName;
  available: boolean;
  circuitState: CircuitState;
  lastHealthCheck: number | null;
  consecutiveFailures: number;
  degraded: boolean;
  message?: string;
}

export interface ServiceRegistryStats {
  services: Record<ServiceName, ServiceStatus>;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated: string;
}

/**
 * Centralized service registry for health tracking
 */
class ServiceRegistryImpl {
  private circuitBreakers: Map<ServiceName, CircuitBreaker> = new Map();
  private healthChecks: Map<ServiceName, number> = new Map();
  private consecutiveFailures: Map<ServiceName, number> = new Map();
  private serviceMessages: Map<ServiceName, string> = new Map();
  private listeners: Set<(service: ServiceName, status: ServiceStatus) => void> = new Set();

  constructor() {
    this.initializeCircuitBreakers();
  }

  /**
   * Initialize circuit breakers for all services
   */
  private initializeCircuitBreakers(): void {
    const onStateChange = (name: string, from: CircuitState, to: CircuitState) => {
      this.notifyListeners(name as ServiceName);
      logger.info(
        { service: name, from, to },
        'Service circuit breaker state changed'
      );
    };

    this.circuitBreakers.set('database', createDatabaseCircuitBreaker(onStateChange));
    this.circuitBreakers.set('redis', createRedisCircuitBreaker(onStateChange));
    this.circuitBreakers.set('ai-claude', createAICircuitBreaker(onStateChange));
    this.circuitBreakers.set('ai-voyage', createAICircuitBreaker(onStateChange));
    this.circuitBreakers.set(
      'supabase',
      new CircuitBreaker({
        name: 'supabase',
        failureThreshold: 5,
        successThreshold: 3,
        resetTimeout: 30000,
        failureWindow: 60000,
        onStateChange,
      })
    );
  }

  /**
   * Get circuit breaker for a service
   */
  getCircuitBreaker(service: ServiceName): CircuitBreaker | undefined {
    return this.circuitBreakers.get(service);
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(
    service: ServiceName,
    operation: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    const cb = this.circuitBreakers.get(service);
    if (!cb) {
      return operation();
    }

    try {
      const result = await cb.execute(operation, fallback);
      this.recordSuccess(service);
      return result;
    } catch (error) {
      this.recordFailure(service, error);
      throw error;
    }
  }

  /**
   * Record successful operation
   */
  recordSuccess(service: ServiceName): void {
    this.consecutiveFailures.set(service, 0);
    this.healthChecks.set(service, Date.now());
    this.serviceMessages.delete(service);
  }

  /**
   * Record failed operation
   */
  recordFailure(service: ServiceName, error?: unknown): void {
    const current = this.consecutiveFailures.get(service) || 0;
    this.consecutiveFailures.set(service, current + 1);
    this.healthChecks.set(service, Date.now());

    if (error instanceof Error) {
      this.serviceMessages.set(service, error.message);
    }

    this.notifyListeners(service);
  }

  /**
   * Mark service as healthy
   */
  markHealthy(service: ServiceName): void {
    this.recordSuccess(service);
    const cb = this.circuitBreakers.get(service);
    if (cb && cb.getState() !== 'CLOSED') {
      cb.recordSuccess();
    }
  }

  /**
   * Mark service as unhealthy
   */
  markUnhealthy(service: ServiceName, message?: string): void {
    this.recordFailure(service);
    if (message) {
      this.serviceMessages.set(service, message);
    }
    const cb = this.circuitBreakers.get(service);
    if (cb) {
      cb.recordFailure();
    }
  }

  /**
   * Get status for a specific service
   */
  getServiceStatus(service: ServiceName): ServiceStatus {
    const cb = this.circuitBreakers.get(service);
    const circuitState = cb?.getState() || 'CLOSED';
    const consecutiveFailures = this.consecutiveFailures.get(service) || 0;

    return {
      name: service,
      available: circuitState !== 'OPEN',
      circuitState,
      lastHealthCheck: this.healthChecks.get(service) || null,
      consecutiveFailures,
      degraded: circuitState === 'HALF_OPEN' || consecutiveFailures > 0,
      message: this.serviceMessages.get(service),
    };
  }

  /**
   * Check if service is available
   */
  isAvailable(service: ServiceName): boolean {
    const cb = this.circuitBreakers.get(service);
    return cb ? cb.canExecute() : true;
  }

  /**
   * Check if service is degraded
   */
  isDegraded(service: ServiceName): boolean {
    const status = this.getServiceStatus(service);
    return status.degraded;
  }

  /**
   * Get overall system status
   */
  getStats(): ServiceRegistryStats {
    const services: Record<ServiceName, ServiceStatus> = {
      database: this.getServiceStatus('database'),
      redis: this.getServiceStatus('redis'),
      'ai-claude': this.getServiceStatus('ai-claude'),
      'ai-voyage': this.getServiceStatus('ai-voyage'),
      supabase: this.getServiceStatus('supabase'),
    };

    // Determine overall health
    const statuses = Object.values(services);
    const unavailableCount = statuses.filter((s) => !s.available).length;
    const degradedCount = statuses.filter((s) => s.degraded && s.available).length;

    let overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    if (unavailableCount >= 2 || !services.database.available) {
      overallHealth = 'unhealthy';
    } else if (unavailableCount > 0 || degradedCount >= 2) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'healthy';
    }

    return {
      services,
      overallHealth,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Add listener for service status changes
   */
  addListener(callback: (service: ServiceName, status: ServiceStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(service: ServiceName): void {
    const status = this.getServiceStatus(service);
    for (const listener of this.listeners) {
      try {
        listener(service, status);
      } catch (error) {
        logger.error({ error, service }, 'Error in service status listener');
      }
    }
  }

  /**
   * Reset all circuit breakers (for testing)
   */
  resetAll(): void {
    for (const cb of this.circuitBreakers.values()) {
      cb.reset();
    }
    this.consecutiveFailures.clear();
    this.serviceMessages.clear();
    logger.info('All service circuit breakers reset');
  }
}

// Singleton instance
export const ServiceRegistry = new ServiceRegistryImpl();
