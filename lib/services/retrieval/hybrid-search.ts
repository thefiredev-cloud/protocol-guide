import { createClient, SupabaseClient } from '@supabase/supabase-js';
import MiniSearch from 'minisearch';
import OpenAI from 'openai';

import { createLogger } from '../../log';
import type { KBDoc } from '../../retrieval';
import { searchKB } from '../../retrieval';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Search result with relevance score
 */
export interface SearchResult {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  score: number;
  source: 'lexical' | 'semantic' | 'hybrid';
  rank?: number;
}

/**
 * Hybrid search options
 */
export interface HybridSearchOptions {
  /** Weight for lexical (MiniSearch) results (0-1) */
  lexicalWeight?: number;
  /** Weight for semantic (vector) results (0-1) */
  semanticWeight?: number;
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity threshold for semantic search (0-1) */
  similarityThreshold?: number;
  /** RRF constant k (default: 60) */
  rrfK?: number;
}

/**
 * Internal search result with rank
 */
interface RankedResult {
  id: string;
  rank: number;
  score?: number;
  source: 'lexical' | 'semantic';
}

// =============================================================================
// HYBRID SEARCH SERVICE
// =============================================================================

/**
 * HybridSearchService combines lexical and semantic search using Reciprocal Rank Fusion
 *
 * Features:
 * - Lexical search via MiniSearch (existing system)
 * - Semantic search via Supabase pgvector
 * - RRF algorithm for merging results
 * - Query embedding generation via OpenAI
 */
export class HybridSearchService {
  private readonly logger = createLogger('HybridSearchService');
  private supabase: SupabaseClient | null = null;
  private openai: OpenAI | null = null;
  private readonly embeddingModel = 'text-embedding-3-small';
  private readonly embeddingVersion = 1;

  constructor(
    private readonly supabaseUrl?: string,
    private readonly supabaseKey?: string,
    private readonly openaiKey?: string
  ) {
    // Initialize clients lazily to avoid errors if not needed
  }

  /**
   * Initialize Supabase client
   */
  private getSupabaseClient(): SupabaseClient {
    if (this.supabase) return this.supabase;

    const url = this.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = this.supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    this.supabase = createClient(url, key);
    return this.supabase;
  }

  /**
   * Initialize OpenAI client
   */
  private getOpenAIClient(): OpenAI {
    if (this.openai) return this.openai;

    const key = this.openaiKey || process.env.OPENAI_API_KEY;

    if (!key) {
      throw new Error('OpenAI API key missing. Set OPENAI_API_KEY environment variable');
    }

    this.openai = new OpenAI({ apiKey: key });
    return this.openai;
  }

  /**
   * Generate query embedding using OpenAI
   */
  private async generateEmbedding(query: string): Promise<number[]> {
    try {
      const openai = this.getOpenAIClient();

      const response = await openai.embeddings.create({
        model: this.embeddingModel,
        input: query.substring(0, 8191), // OpenAI max input length
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding', { error });
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Perform semantic search using Supabase pgvector
   *
   * Uses cosine similarity to find semantically similar documents
   */
  async semanticSearch(query: string, limit = 20): Promise<SearchResult[]> {
    try {
      // Generate embedding for query
      const embedding = await this.generateEmbedding(query);

      // Query Supabase for similar embeddings
      const supabase = this.getSupabaseClient();

      const { data, error } = await supabase.rpc('match_protocol_chunks', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
      });

      if (error) {
        this.logger.error('Semantic search failed', { error });
        return [];
      }

      if (!data || data.length === 0) {
        this.logger.debug('No semantic search results found', { query });
        return [];
      }

      // Map results to SearchResult format
      return data.map(
        (item: {
          chunk_id: string;
          title: string;
          content: string;
          category: string;
          subcategory?: string;
          similarity: number;
        }) => ({
          id: item.chunk_id,
          title: item.title,
          category: item.category,
          subcategory: item.subcategory,
          content: item.content,
          score: item.similarity,
          source: 'semantic' as const,
        })
      );
    } catch (error) {
      this.logger.error('Semantic search error', { error });
      // Return empty array on error - hybrid search will fall back to lexical only
      return [];
    }
  }

  /**
   * Perform lexical search using existing MiniSearch system
   */
  private async lexicalSearch(query: string, limit = 20): Promise<SearchResult[]> {
    try {
      // Use existing searchKB function which uses MiniSearch
      const results = await searchKB(query, limit);

      // Map KBDoc to SearchResult
      return results.map((doc, index) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        subcategory: doc.subcategory,
        content: doc.content,
        score: 1 - index * 0.05, // Simple descending score
        source: 'lexical' as const,
        rank: index + 1,
      }));
    } catch (error) {
      this.logger.error('Lexical search error', { error });
      return [];
    }
  }

  /**
   * Calculate Reciprocal Rank Fusion (RRF) score
   *
   * RRF formula: score = Σ 1/(k + rank) for each result list
   * where k is a constant (typically 60)
   *
   * @param ranks - Map of result ID to ranks from different search methods
   * @param k - RRF constant (default: 60)
   * @returns Map of result ID to RRF score
   */
  private calculateRRF(
    ranks: Map<string, { lexicalRank?: number; semanticRank?: number }>,
    k = 60
  ): Map<string, number> {
    const scores = new Map<string, number>();

    for (const [id, { lexicalRank, semanticRank }] of ranks.entries()) {
      let score = 0;

      // Add lexical contribution
      if (lexicalRank !== undefined) {
        score += 1 / (k + lexicalRank);
      }

      // Add semantic contribution
      if (semanticRank !== undefined) {
        score += 1 / (k + semanticRank);
      }

      scores.set(id, score);
    }

    return scores;
  }

  /**
   * Merge results from lexical and semantic search using Reciprocal Rank Fusion
   */
  private mergeResults(
    lexicalResults: SearchResult[],
    semanticResults: SearchResult[],
    options: HybridSearchOptions
  ): SearchResult[] {
    const {
      lexicalWeight = 0.5,
      semanticWeight = 0.5,
      limit = 20,
      rrfK = 60,
    } = options;

    // Build rank map
    const ranks = new Map<string, { lexicalRank?: number; semanticRank?: number }>();

    // Add lexical ranks
    lexicalResults.forEach((result, index) => {
      ranks.set(result.id, { lexicalRank: index + 1 });
    });

    // Add semantic ranks
    semanticResults.forEach((result, index) => {
      const existing = ranks.get(result.id);
      ranks.set(result.id, {
        ...existing,
        semanticRank: index + 1,
      });
    });

    // Calculate RRF scores
    const rrfScores = this.calculateRRF(ranks, rrfK);

    // Build result map for deduplication
    const resultMap = new Map<string, SearchResult>();

    for (const result of [...lexicalResults, ...semanticResults]) {
      if (!resultMap.has(result.id)) {
        resultMap.set(result.id, result);
      }
    }

    // Create final results with RRF scores
    const mergedResults: SearchResult[] = [];

    for (const [id, rrfScore] of rrfScores.entries()) {
      const result = resultMap.get(id);
      if (!result) continue;

      // Apply weights to original scores
      let weightedScore = 0;
      const rankInfo = ranks.get(id);

      if (rankInfo?.lexicalRank !== undefined) {
        weightedScore += lexicalWeight * (1 / rankInfo.lexicalRank);
      }

      if (rankInfo?.semanticRank !== undefined) {
        weightedScore += semanticWeight * (1 / rankInfo.semanticRank);
      }

      // Combine RRF score with weighted score
      const finalScore = (rrfScore + weightedScore) / 2;

      mergedResults.push({
        ...result,
        score: finalScore,
        source: 'hybrid',
      });
    }

    // Sort by final score descending
    mergedResults.sort((a, b) => b.score - a.score);

    // Return top N results
    return mergedResults.slice(0, limit);
  }

  /**
   * Perform hybrid search combining lexical and semantic approaches
   *
   * @param query - Search query string
   * @param options - Hybrid search options
   * @returns Merged search results ranked by RRF
   */
  async hybridSearch(query: string, options: HybridSearchOptions = {}): Promise<SearchResult[]> {
    const startTime = Date.now();
    const { limit = 20, similarityThreshold = 0.7 } = options;

    this.logger.debug('Starting hybrid search', { query, options });

    try {
      // Run both searches in parallel
      const [lexicalResults, semanticResults] = await Promise.all([
        this.lexicalSearch(query, limit * 2), // Get more candidates for better fusion
        this.semanticSearch(query, limit * 2),
      ]);

      this.logger.debug('Search results retrieved', {
        lexicalCount: lexicalResults.length,
        semanticCount: semanticResults.length,
      });

      // Filter semantic results by similarity threshold
      const filteredSemanticResults = semanticResults.filter(
        (r) => r.score >= similarityThreshold
      );

      // If both searches returned no results, return empty
      if (lexicalResults.length === 0 && filteredSemanticResults.length === 0) {
        this.logger.warn('No results found from either search method', { query });
        return [];
      }

      // If only one search method has results, return those
      if (lexicalResults.length === 0) {
        this.logger.debug('Returning semantic-only results');
        return filteredSemanticResults.slice(0, limit);
      }

      if (filteredSemanticResults.length === 0) {
        this.logger.debug('Returning lexical-only results');
        return lexicalResults.slice(0, limit);
      }

      // Merge results using RRF
      const merged = this.mergeResults(lexicalResults, filteredSemanticResults, options);

      const duration = Date.now() - startTime;
      this.logger.debug('Hybrid search completed', {
        duration,
        resultCount: merged.length,
        query,
      });

      return merged;
    } catch (error) {
      this.logger.error('Hybrid search failed', { error, query });

      // Fall back to lexical search only
      this.logger.warn('Falling back to lexical search only');
      return await this.lexicalSearch(query, limit);
    }
  }

  /**
   * Search using only semantic (vector) search
   * Useful for testing or when lexical search is not needed
   */
  async searchSemantic(query: string, limit = 20): Promise<SearchResult[]> {
    return await this.semanticSearch(query, limit);
  }

  /**
   * Search using only lexical (MiniSearch) search
   * Useful for testing or when semantic search is not available
   */
  async searchLexical(query: string, limit = 20): Promise<SearchResult[]> {
    return await this.lexicalSearch(query, limit);
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: HybridSearchService | null = null;

/**
 * Get the singleton instance of HybridSearchService
 * Creates one if it doesn't exist
 */
export function getHybridSearchService(): HybridSearchService {
  if (!instance) {
    instance = new HybridSearchService();
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetHybridSearchService(): void {
  instance = null;
}

// Export default instance for convenience
export default getHybridSearchService();
