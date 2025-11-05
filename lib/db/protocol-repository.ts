import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { createLogger } from '../log';
import type {
  HybridSearchOptions,
  Protocol,
  ProtocolChunk,
  ProtocolSearchResult,
  ProtocolWithContext,
  ProviderImpression,
  SearchOptions,
} from '../protocols/protocol-schema';

const logger = createLogger('ProtocolRepository');

/**
 * Protocol Repository - Data access layer for protocol database operations
 *
 * Provides methods for:
 * - Protocol retrieval (by code, search, hybrid search)
 * - Embedding management
 * - Usage tracking and analytics
 * - Validation helpers
 */
export class ProtocolRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase URL and key are required. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    this.supabase = createClient(url, key);
  }

  // =============================================================================
  // CORE RETRIEVAL METHODS
  // =============================================================================

  /**
   * Get a protocol by TP code (e.g., "1210", "1211-P")
   * Returns only the current version
   */
  async getProtocolByCode(tpCode: string): Promise<Protocol | null> {
    try {
      const { data, error } = await this.supabase
        .from('protocols')
        .select('*')
        .eq('tp_code', tpCode)
        .eq('is_current', true)
        .is('deleted_at', null)
        .single();

      // Handle not found error gracefully
      if (error?.code === 'PGRST116') {
        logger.debug('Protocol not found', { tpCode });
        return null;
      }

      if (error) throw error;

      return data as Protocol;
    } catch (error) {
      logger.error('Failed to get protocol by code', { tpCode, error });
      throw new Error(`Failed to retrieve protocol ${tpCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple protocols by TP codes
   */
  async getProtocolsByCodes(tpCodes: string[]): Promise<Protocol[]> {
    if (tpCodes.length === 0) return [];

    try {
      const { data, error } = await this.supabase
        .from('protocols')
        .select('*')
        .in('tp_code', tpCodes)
        .eq('is_current', true)
        .is('deleted_at', null);

      if (error) throw error;

      return (data || []) as Protocol[];
    } catch (error) {
      logger.error('Failed to get protocols by codes', { tpCodes, error });
      throw new Error(`Failed to retrieve protocols: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search protocols using full-text search
   * Uses PostgreSQL's ts_rank for relevance scoring
   */
  async searchProtocols(query: string, options: SearchOptions = {}): Promise<Protocol[]> {
    const {
      limit = 10,
      category,
      offset = 0,
    } = options;

    try {
      // Use the database function for optimized full-text search
      const { data, error } = await this.supabase.rpc('search_protocols_fulltext', {
        p_query: query,
        p_limit: limit,
      });

      if (error) throw error;

      // Filter by category if specified
      let results = (data || []) as Protocol[];
      if (category) {
        results = results.filter(p => p.tp_category === category);
      }

      // Apply offset
      if (offset > 0) {
        results = results.slice(offset);
      }

      return results;
    } catch (error) {
      logger.error('Failed to search protocols', { query, options, error });
      // Don't throw - return empty array for graceful degradation
      return [];
    }
  }

  /**
   * Search protocol chunks using full-text search
   * More granular than protocol search - returns specific content sections
   */
  async searchProtocolChunks(query: string, options: SearchOptions = {}): Promise<ProtocolChunk[]> {
    const { limit = 10, category, offset = 0 } = options;

    try {
      let queryBuilder = this.supabase
        .from('protocol_chunks')
        .select('*')
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english',
        })
        .limit(limit);

      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }

      if (offset > 0) {
        queryBuilder = queryBuilder.range(offset, offset + limit - 1);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return (data || []) as ProtocolChunk[];
    } catch (error) {
      logger.error('Failed to search protocol chunks', { query, options, error });
      return [];
    }
  }

  /**
   * Hybrid search combining full-text and vector similarity
   * Uses database function for optimized performance
   */
  async searchProtocolsHybrid(
    query: string,
    embedding?: number[],
    options: HybridSearchOptions = {}
  ): Promise<ProtocolSearchResult[]> {
    const {
      limit = 10,
      fulltextWeight = 0.4,
      vectorWeight = 0.6,
      similarityThreshold = 0.7,
    } = options;

    try {
      const { data, error } = await this.supabase.rpc('search_protocols_hybrid', {
        p_query: query,
        p_embedding: embedding || null,
        p_limit: limit,
        p_fulltext_weight: fulltextWeight,
        p_vector_weight: vectorWeight,
      });

      if (error) throw error;

      // Filter by similarity threshold if embedding provided
      let results = (data || []) as ProtocolSearchResult[];
      if (embedding && similarityThreshold > 0) {
        results = results.filter(r => r.relevance_score >= similarityThreshold);
      }

      return results;
    } catch (error) {
      logger.error('Failed to perform hybrid search', { query, options, error });
      // Fall back to text-only search
      logger.warn('Falling back to full-text search only');
      const protocols = await this.searchProtocols(query, { limit });
      return protocols.map((p, index) => ({
        protocol_id: p.id,
        tp_code: p.tp_code,
        tp_name: p.tp_name,
        relevance_score: 1 - (index * 0.1), // Decreasing relevance
        match_type: 'fulltext' as const,
      }));
    }
  }

  /**
   * Get protocol with full context (dependencies, medications, warnings)
   * Uses database function for single-query efficiency
   */
  async getProtocolWithContext(tpCode: string): Promise<ProtocolWithContext | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_protocol_with_context', {
        p_tp_code: tpCode,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        logger.debug('Protocol with context not found', { tpCode });
        return null;
      }

      // The database function returns a single row with JSONB fields
      const result = data[0];
      return {
        ...(result.protocol as Protocol),
        dependencies: result.dependencies || [],
        medications: result.medications || [],
        base_contact_info: result.base_contact_info || {},
      } as ProtocolWithContext;
    } catch (error) {
      logger.error('Failed to get protocol with context', { tpCode, error });
      // Fall back to basic protocol retrieval
      return await this.getProtocolByCode(tpCode);
    }
  }

  /**
   * Get provider impression by code (e.g., "CPMI", "SOBB")
   */
  async getProviderImpressionByCode(piCode: string): Promise<ProviderImpression | null> {
    try {
      const { data, error } = await this.supabase
        .from('provider_impressions')
        .select('*')
        .eq('pi_code', piCode)
        .eq('is_current', true)
        .single();

      // Handle not found error gracefully
      if (error?.code === 'PGRST116') {
        return null;
      }

      if (error) throw error;

      return data as ProviderImpression;
    } catch (error) {
      logger.error('Failed to get provider impression', { piCode, error });
      return null;
    }
  }

  /**
   * Get protocol by provider impression code
   * Combines provider impression lookup with protocol retrieval
   */
  async getProtocolByProviderImpression(piCode: string): Promise<Protocol | null> {
    const pi = await this.getProviderImpressionByCode(piCode);
    if (!pi) return null;

    return await this.getProtocolByCode(pi.tp_code);
  }

  // =============================================================================
  // EMBEDDING OPERATIONS
  // =============================================================================

  /**
   * Get embedding for a specific chunk
   */
  async getChunkEmbedding(chunkId: string): Promise<number[] | null> {
    const { data, error } = await this.supabase
      .from('protocol_embeddings')
      .select('embedding')
      .eq('chunk_id', chunkId)
      .eq('embedding_model', 'text-embedding-3-small')
      .eq('embedding_version', 1)
      .single();

    // Handle not found error gracefully
    if (error?.code === 'PGRST116') {
      return null;
    }

    if (error) {
      logger.error('Failed to get chunk embedding', { chunkId, error });
      return null;
    }

    return data.embedding as number[];
  }

  /**
   * Store or update an embedding for a chunk
   */
  async upsertEmbedding(
    chunkId: string,
    protocolId: string,
    embedding: number[],
    contentHash: string,
    contentPreview?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('upsert_embedding', {
        p_chunk_id: chunkId,
        p_protocol_id: protocolId,
        p_embedding: embedding,
        p_embedding_model: 'text-embedding-3-small',
        p_embedding_version: 1,
        p_content_preview: contentPreview || null,
        p_content_hash: contentHash,
      });

      if (error) throw error;

      return data as string;
    } catch (error) {
      logger.error('Failed to upsert embedding', { chunkId, error });
      return null;
    }
  }

  /**
   * Get chunks that need embeddings
   */
  async getChunksNeedingEmbeddings(limit: number = 100): Promise<ProtocolChunk[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_chunks_needing_embeddings', {
        p_embedding_model: 'text-embedding-3-small',
        p_embedding_version: 1,
        p_limit: limit,
      });

      if (error) throw error;

      return (data || []) as ProtocolChunk[];
    } catch (error) {
      logger.error('Failed to get chunks needing embeddings', { error });
      return [];
    }
  }

  /**
   * Get chunks with outdated embeddings (content changed)
   */
  async getChunksWithOutdatedEmbeddings(limit: number = 100): Promise<ProtocolChunk[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_chunks_with_outdated_embeddings', {
        p_embedding_model: 'text-embedding-3-small',
        p_embedding_version: 1,
        p_limit: limit,
      });

      if (error) throw error;

      return (data || []) as ProtocolChunk[];
    } catch (error) {
      logger.error('Failed to get chunks with outdated embeddings', { error });
      return [];
    }
  }

  // =============================================================================
  // ANALYTICS & USAGE TRACKING
  // =============================================================================

  /**
   * Record protocol usage for analytics
   */
  async recordUsage(
    protocolId: string,
    tpCode: string,
    actionType: 'view' | 'search_result' | 'copy' | 'export' | 'recommend',
    options: {
      retrievalTime?: number;
      source?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<void> {
    try {
      await this.supabase.rpc('record_protocol_usage', {
        p_protocol_id: protocolId,
        p_tp_code: tpCode,
        p_action_type: actionType,
        p_retrieval_time_ms: options.retrievalTime || null,
        p_source: options.source || 'unknown',
        p_user_id: options.userId || null,
        p_metadata: options.metadata || {},
      });
    } catch (error) {
      // Don't throw - analytics failures shouldn't break the app
      logger.warn('Failed to record protocol usage', { protocolId, tpCode, error });
    }
  }

  /**
   * Log a search query for analytics
   */
  async logSearch(
    query: string,
    searchType: 'fulltext' | 'vector' | 'hybrid' | 'tp_code' | 'keyword' | 'symptom',
    results: ProtocolSearchResult[] | Protocol[],
    options: {
      executionTime?: number;
      userId?: string;
      sessionId?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<void> {
    try {
      const topResult = results[0];
      const topResultTpCode = 'tp_code' in topResult ? topResult.tp_code : undefined;
      const topResultScore = 'relevance_score' in topResult ? topResult.relevance_score : undefined;

      await this.supabase.rpc('record_protocol_search', {
        p_query: query,
        p_search_type: searchType,
        p_results_count: results.length,
        p_top_result_tp_code: topResultTpCode || null,
        p_top_result_score: topResultScore || null,
        p_execution_time_ms: options.executionTime || null,
        p_user_id: options.userId || null,
        p_metadata: {
          session_id: options.sessionId,
          ...options.metadata,
        },
      });
    } catch (error) {
      // Don't throw - analytics failures shouldn't break the app
      logger.warn('Failed to log search', { query, error });
    }
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  /**
   * Check if a protocol exists
   */
  async validateProtocolExists(tpCode: string): Promise<boolean> {
    try {
      const { count, error } = await this.supabase
        .from('protocols')
        .select('id', { count: 'exact', head: true })
        .eq('tp_code', tpCode)
        .eq('is_current', true)
        .is('deleted_at', null);

      if (error) return false;

      return (count || 0) > 0;
    } catch (error) {
      logger.error('Failed to validate protocol exists', { tpCode, error });
      return false;
    }
  }

  /**
   * Get all active protocols (for administrative purposes)
   */
  async getAllActiveProtocols(options: { limit?: number; offset?: number } = {}): Promise<Protocol[]> {
    const { limit = 100, offset = 0 } = options;

    try {
      const { data, error } = await this.supabase
        .from('protocols')
        .select('*')
        .eq('is_current', true)
        .is('deleted_at', null)
        .order('tp_code')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []) as Protocol[];
    } catch (error) {
      logger.error('Failed to get all active protocols', { error });
      return [];
    }
  }

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<{
    total_protocols: number;
    total_chunks: number;
    total_embeddings: number;
    embedding_coverage_percent: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('embedding_coverage_stats')
        .select('*')
        .single();

      if (error) throw error;

      return {
        total_protocols: data.total_chunks || 0,
        total_chunks: data.total_chunks || 0,
        total_embeddings: data.chunks_with_embeddings || 0,
        embedding_coverage_percent: data.coverage_percent || 0,
      };
    } catch (error) {
      logger.error('Failed to get protocol stats', { error });
      return {
        total_protocols: 0,
        total_chunks: 0,
        total_embeddings: 0,
        embedding_coverage_percent: 0,
      };
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: ProtocolRepository | null = null;

/**
 * Get the singleton instance of ProtocolRepository
 * Creates one if it doesn't exist
 */
export function getProtocolRepository(): ProtocolRepository {
  if (!instance) {
    instance = new ProtocolRepository();
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetProtocolRepository(): void {
  instance = null;
}
