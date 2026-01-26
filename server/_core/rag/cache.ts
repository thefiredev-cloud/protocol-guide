/**
 * Query Result Cache for RAG Pipeline
 * Separated to avoid circular dependencies
 */

import { normalizeEmsQuery } from '../ems-query-normalizer';
import { RAG_CONFIG } from './config';
import type { RetrievalResult, OptimizedSearchParams } from './types';

interface CachedQueryResult {
  results: RetrievalResult[];
  timestamp: number;
  queryHash: string;
}

/**
 * In-memory query cache (can be replaced with Redis for distributed)
 */
class QueryCache {
  private cache: Map<string, CachedQueryResult> = new Map();
  private accessOrder: string[] = [];

  /**
   * Generate cache key from query parameters
   */
  private generateKey(params: OptimizedSearchParams): string {
    const normalized = normalizeEmsQuery(params.query);
    const agencyPart = params.agencyId || 'all';
    const statePart = params.stateCode || 'all';
    return normalized.normalized + ':' + agencyPart + ':' + statePart;
  }

  /**
   * Get cached result if valid
   */
  get(params: OptimizedSearchParams): RetrievalResult[] | null {
    const key = this.generateKey(params);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check TTL
    if (Date.now() - cached.timestamp > RAG_CONFIG.cache.queryTtlMs) {
      this.cache.delete(key);
      return null;
    }

    // Update access order (LRU)
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
    }
    this.accessOrder.push(key);

    return cached.results;
  }

  /**
   * Store result in cache
   */
  set(params: OptimizedSearchParams, results: RetrievalResult[]): void {
    const key = this.generateKey(params);

    // Evict if at capacity
    while (this.cache.size >= RAG_CONFIG.cache.maxQueries) {
      const oldest = this.accessOrder.shift();
      if (oldest) {
        this.cache.delete(oldest);
      }
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now(),
      queryHash: key,
    });
    this.accessOrder.push(key);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: RAG_CONFIG.cache.maxQueries,
    };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }
}

// Global query cache instance
export const queryCache = new QueryCache();
