/**
 * RAG Pipeline Optimizer for Protocol Guide
 *
 * Optimizations for 2-second latency target:
 * 1. Parallel execution where possible
 * 2. Tiered similarity thresholds
 * 3. Query result caching (Redis-ready)
 * 4. Re-ranking for improved accuracy
 * 5. Latency monitoring and adaptive routing
 * 6. Multi-query fusion for better recall
 * 7. Reciprocal Rank Fusion (RRF) for result merging
 * 8. Context-aware boosting
 */

// ============================================================================
// CONFIGURATION (imported from separate file to avoid circular deps)
// ============================================================================

export { RAG_CONFIG } from './config';

// ============================================================================
// TYPES (imported from separate file to avoid circular deps)
// ============================================================================

export type {
  RetrievalResult,
  RagMetrics,
  OptimizedSearchParams,
  OptimizedSearchResult,
} from './types';

// ============================================================================
// CACHE & MONITORING (imported from separate files to avoid circular deps)
// ============================================================================

export { queryCache } from './cache';
export { latencyMonitor } from './latency';

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export all scoring functions
export {
  rerankResults,
  advancedRerank,
  applyContextBoost,
  reciprocalRankFusion,
} from './scoring';

// Re-export all search execution functions
export {
  optimizedSearch,
  highAccuracySearch,
  multiQueryFusion,
  type OptimizedSearchOptions,
} from './search-execution';

// Re-export all model selection functions
export {
  selectModel,
  selectSimilarityThreshold,
  selectResultLimit,
} from './model-selection';
