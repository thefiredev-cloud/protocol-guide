/**
 * Query Analytics and Logging for RAG Improvements
 * 
 * Captures query data for analysis and tuning:
 * - Query text and normalized form
 * - Results quality metrics
 * - User feedback signals
 * - Latency and performance data
 * 
 * This data helps improve:
 * - Synonym dictionary coverage
 * - Similarity thresholds
 * - Re-ranking weights
 * - Model selection
 */

import { createClient } from '@supabase/supabase-js';
import type { NormalizedQuery } from './ems-query-normalizer';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// TYPES
// ============================================================================

export interface QueryLogEntry {
  id?: number;
  // Query Information
  originalQuery: string;
  normalizedQuery: string;
  queryIntent: string;
  isComplex: boolean;
  isEmergent: boolean;
  extractedMedications: string[];
  extractedConditions: string[];
  expandedAbbreviations: string[];
  
  // Search Context
  agencyId?: number | null;
  agencyName?: string | null;
  stateCode?: string | null;
  userTier: 'free' | 'pro' | 'enterprise';
  
  // Results Metrics
  resultCount: number;
  topSimilarityScore: number;
  avgSimilarityScore: number;
  usedMultiQueryFusion: boolean;
  cacheHit: boolean;
  
  // Performance
  totalLatencyMs: number;
  embeddingLatencyMs: number;
  searchLatencyMs: number;
  rerankLatencyMs: number;
  llmLatencyMs: number;
  
  // Model Used
  modelUsed: 'haiku' | 'sonnet';
  inputTokens: number;
  outputTokens: number;
  
  // Timestamp
  createdAt?: Date;
}

export interface QueryFeedback {
  queryLogId: number;
  userId?: string;
  feedbackType: 'helpful' | 'not_helpful' | 'incorrect' | 'missing_info';
  comment?: string;
  createdAt?: Date;
}

export interface QueryAnalytics {
  totalQueries: number;
  avgLatencyMs: number;
  cacheHitRate: number;
  avgResultCount: number;
  intentDistribution: Record<string, number>;
  topQueriesNoResults: string[];
  lowSimilarityQueries: string[];
}

// ============================================================================
// IN-MEMORY BUFFER FOR BATCHING
// ============================================================================

// Buffer for batch inserts (reduces DB calls)
const queryLogBuffer: QueryLogEntry[] = [];
const BUFFER_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds

let flushTimer: NodeJS.Timeout | null = null;

/**
 * Start the periodic flush timer
 */
function startFlushTimer() {
  if (!flushTimer) {
    flushTimer = setInterval(() => {
      flushQueryLogBuffer().catch(console.error);
    }, FLUSH_INTERVAL_MS);
    
    // Don't keep process alive
    if (flushTimer.unref) {
      flushTimer.unref();
    }
  }
}

/**
 * Flush the query log buffer to the database
 */
async function flushQueryLogBuffer(): Promise<void> {
  if (queryLogBuffer.length === 0) return;
  
  const entries = queryLogBuffer.splice(0, queryLogBuffer.length);
  
  try {
    const { error } = await supabase
      .from('query_analytics_log')
      .insert(entries.map(e => ({
        original_query: e.originalQuery,
        normalized_query: e.normalizedQuery,
        query_intent: e.queryIntent,
        is_complex: e.isComplex,
        is_emergent: e.isEmergent,
        extracted_medications: e.extractedMedications,
        extracted_conditions: e.extractedConditions,
        expanded_abbreviations: e.expandedAbbreviations,
        agency_id: e.agencyId,
        agency_name: e.agencyName,
        state_code: e.stateCode,
        user_tier: e.userTier,
        result_count: e.resultCount,
        top_similarity_score: e.topSimilarityScore,
        avg_similarity_score: e.avgSimilarityScore,
        used_multi_query_fusion: e.usedMultiQueryFusion,
        cache_hit: e.cacheHit,
        total_latency_ms: e.totalLatencyMs,
        embedding_latency_ms: e.embeddingLatencyMs,
        search_latency_ms: e.searchLatencyMs,
        rerank_latency_ms: e.rerankLatencyMs,
        llm_latency_ms: e.llmLatencyMs,
        model_used: e.modelUsed,
        input_tokens: e.inputTokens,
        output_tokens: e.outputTokens,
      })));
    
    if (error) {
      console.error('[QueryAnalytics] Failed to flush log buffer:', error.message);
      // Re-add entries to buffer on failure (will retry on next flush)
      queryLogBuffer.unshift(...entries);
    } else {
      console.log(`[QueryAnalytics] Flushed ${entries.length} query logs`);
    }
  } catch (err) {
    console.error('[QueryAnalytics] Error flushing buffer:', err);
    // Re-add entries to buffer
    queryLogBuffer.unshift(...entries);
  }
}

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

/**
 * Log a query for analytics
 * Uses buffered writes to minimize DB load
 */
export function logQuery(entry: QueryLogEntry): void {
  // Add to buffer
  queryLogBuffer.push({
    ...entry,
    createdAt: new Date(),
  });
  
  // Start flush timer if not running
  startFlushTimer();
  
  // Flush if buffer is full
  if (queryLogBuffer.length >= BUFFER_SIZE) {
    flushQueryLogBuffer().catch(console.error);
  }
}

/**
 * Log query feedback from user
 */
export async function logQueryFeedback(feedback: QueryFeedback): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('query_feedback')
      .insert({
        query_log_id: feedback.queryLogId,
        user_id: feedback.userId,
        feedback_type: feedback.feedbackType,
        comment: feedback.comment,
      });
    
    if (error) {
      console.error('[QueryAnalytics] Failed to log feedback:', error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('[QueryAnalytics] Error logging feedback:', err);
    return false;
  }
}

/**
 * Helper to create a log entry from search results
 */
export function createQueryLogEntry(
  normalized: NormalizedQuery,
  params: {
    agencyId?: number | null;
    agencyName?: string | null;
    stateCode?: string | null;
    userTier: 'free' | 'pro' | 'enterprise';
  },
  results: {
    resultCount: number;
    topSimilarityScore: number;
    avgSimilarityScore: number;
  },
  metrics: {
    totalLatencyMs: number;
    embeddingLatencyMs: number;
    searchLatencyMs: number;
    rerankLatencyMs: number;
    llmLatencyMs: number;
    cacheHit: boolean;
    usedMultiQueryFusion: boolean;
  },
  llm: {
    modelUsed: 'haiku' | 'sonnet';
    inputTokens: number;
    outputTokens: number;
  }
): QueryLogEntry {
  return {
    originalQuery: normalized.original,
    normalizedQuery: normalized.normalized,
    queryIntent: normalized.intent,
    isComplex: normalized.isComplex,
    isEmergent: normalized.isEmergent,
    extractedMedications: normalized.extractedMedications,
    extractedConditions: normalized.extractedConditions,
    expandedAbbreviations: normalized.expandedAbbreviations,
    agencyId: params.agencyId,
    agencyName: params.agencyName,
    stateCode: params.stateCode,
    userTier: params.userTier,
    resultCount: results.resultCount,
    topSimilarityScore: results.topSimilarityScore,
    avgSimilarityScore: results.avgSimilarityScore,
    usedMultiQueryFusion: metrics.usedMultiQueryFusion,
    cacheHit: metrics.cacheHit,
    totalLatencyMs: metrics.totalLatencyMs,
    embeddingLatencyMs: metrics.embeddingLatencyMs,
    searchLatencyMs: metrics.searchLatencyMs,
    rerankLatencyMs: metrics.rerankLatencyMs,
    llmLatencyMs: metrics.llmLatencyMs,
    modelUsed: llm.modelUsed,
    inputTokens: llm.inputTokens,
    outputTokens: llm.outputTokens,
  };
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get query analytics for a time period
 */
export async function getQueryAnalytics(
  startDate: Date,
  endDate: Date
): Promise<QueryAnalytics | null> {
  try {
    // Get basic stats
    const { data: stats, error: statsError } = await supabase
      .from('query_analytics_log')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (statsError || !stats) {
      console.error('[QueryAnalytics] Failed to get stats:', statsError?.message);
      return null;
    }
    
    if (stats.length === 0) {
      return {
        totalQueries: 0,
        avgLatencyMs: 0,
        cacheHitRate: 0,
        avgResultCount: 0,
        intentDistribution: {},
        topQueriesNoResults: [],
        lowSimilarityQueries: [],
      };
    }
    
    // Calculate metrics
    const totalQueries = stats.length;
    const avgLatencyMs = stats.reduce((sum, s) => sum + s.total_latency_ms, 0) / totalQueries;
    const cacheHits = stats.filter(s => s.cache_hit).length;
    const cacheHitRate = cacheHits / totalQueries;
    const avgResultCount = stats.reduce((sum, s) => sum + s.result_count, 0) / totalQueries;
    
    // Intent distribution
    const intentDistribution: Record<string, number> = {};
    for (const stat of stats) {
      intentDistribution[stat.query_intent] = (intentDistribution[stat.query_intent] || 0) + 1;
    }
    
    // Queries with no results
    const noResultQueries = stats
      .filter(s => s.result_count === 0)
      .map(s => s.original_query)
      .slice(0, 20);
    
    // Low similarity queries (might indicate missing content)
    const lowSimilarityQueries = stats
      .filter(s => s.top_similarity_score < 0.35 && s.result_count > 0)
      .map(s => s.original_query)
      .slice(0, 20);
    
    return {
      totalQueries,
      avgLatencyMs: Math.round(avgLatencyMs),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      avgResultCount: Math.round(avgResultCount * 10) / 10,
      intentDistribution,
      topQueriesNoResults: noResultQueries,
      lowSimilarityQueries,
    };
  } catch (err) {
    console.error('[QueryAnalytics] Error getting analytics:', err);
    return null;
  }
}

/**
 * Get common queries that returned no results
 * Useful for identifying gaps in protocol coverage
 */
export async function getFailedQueries(
  limit: number = 50
): Promise<{ query: string; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('query_analytics_log')
      .select('original_query')
      .eq('result_count', 0)
      .limit(1000);
    
    if (error || !data) {
      return [];
    }
    
    // Count occurrences
    const counts: Record<string, number> = {};
    for (const row of data) {
      const q = row.original_query.toLowerCase().trim();
      counts[q] = (counts[q] || 0) + 1;
    }
    
    // Sort by count
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  } catch (err) {
    console.error('[QueryAnalytics] Error getting failed queries:', err);
    return [];
  }
}

/**
 * Get queries that might need synonym expansion
 * (queries with results but low similarity scores)
 */
export async function getSynonymCandidates(
  limit: number = 50
): Promise<{ query: string; avgSimilarity: number; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('query_analytics_log')
      .select('original_query, top_similarity_score')
      .gt('result_count', 0)
      .lt('top_similarity_score', 0.4)
      .limit(1000);
    
    if (error || !data) {
      return [];
    }
    
    // Group and average
    const groups: Record<string, { total: number; count: number }> = {};
    for (const row of data) {
      const q = row.original_query.toLowerCase().trim();
      if (!groups[q]) {
        groups[q] = { total: 0, count: 0 };
      }
      groups[q].total += row.top_similarity_score;
      groups[q].count++;
    }
    
    // Calculate averages and sort
    return Object.entries(groups)
      .map(([query, { total, count }]) => ({
        query,
        avgSimilarity: Math.round((total / count) * 100) / 100,
        count,
      }))
      .filter(item => item.count >= 2) // Only queries that appeared multiple times
      .sort((a, b) => a.avgSimilarity - b.avgSimilarity)
      .slice(0, limit);
  } catch (err) {
    console.error('[QueryAnalytics] Error getting synonym candidates:', err);
    return [];
  }
}

// Export flush function for graceful shutdown
export { flushQueryLogBuffer };
