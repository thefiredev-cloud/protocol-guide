/**
 * Database Retrieval Adapter
 *
 * Adapter to integrate database-based protocol retrieval with existing RetrievalManager
 * Provides backward-compatible interface while using Supabase database
 *
 * Usage:
 *   const adapter = new DatabaseRetrievalAdapter();
 *   const results = await adapter.searchProtocols(query, options);
 */

import { getProtocolRepository } from '../db/protocol-repository';
import { createLogger } from '../log';
import type { Protocol } from '../protocols/protocol-schema';
import type { KBDoc } from '../retrieval';

const logger = createLogger('DatabaseRetrievalAdapter');

export class DatabaseRetrievalAdapter {
  private repository = getProtocolRepository();
  private enabled: boolean;

  constructor() {
    // Check if database retrieval is enabled via environment variable
    this.enabled = process.env.USE_DATABASE_PROTOCOLS === 'true';
    if (this.enabled) {
      logger.info('Database protocol retrieval enabled');
    } else {
      logger.info('Database protocol retrieval disabled (using file-based fallback)');
    }
  }

  /**
   * Check if database retrieval is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Search protocols and convert to KBDoc format for compatibility
   */
  async searchProtocols(query: string, limit: number = 10): Promise<KBDoc[]> {
    if (!this.enabled) {
      return []; // Return empty - caller should use file-based fallback
    }

    try {
      const results = await this.repository.searchProtocols(query, { limit });
      return this.convertProtocolsToKBDocs(results);
    } catch (error) {
      logger.error('Database search failed, falling back to file-based', { error });
      return [];
    }
  }

  /**
   * Get protocol by TP code and convert to KBDoc format
   */
  async getProtocolByCode(tpCode: string): Promise<KBDoc | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const protocol = await this.repository.getProtocolByCode(tpCode);
      if (!protocol) return null;

      return this.convertProtocolToKBDoc(protocol);
    } catch (error) {
      logger.error('Failed to get protocol by code', { tpCode, error });
      return null;
    }
  }

  /**
   * Search protocol chunks for more granular results
   */
  async searchProtocolChunks(query: string, limit: number = 6): Promise<KBDoc[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const chunks = await this.repository.searchProtocolChunks(query, { limit });
      return chunks.map(chunk => ({
        id: chunk.id,
        title: chunk.title,
        category: chunk.category,
        subcategory: chunk.subcategory,
        keywords: chunk.keywords,
        content: chunk.content,
      }));
    } catch (error) {
      logger.error('Database chunk search failed', { error });
      return [];
    }
  }

  /**
   * Hybrid search combining full-text and vector similarity
   * Requires embedding generation to be completed
   */
  async searchHybrid(
    query: string,
    embedding: number[] | undefined,
    limit: number = 10
  ): Promise<KBDoc[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const results = await this.repository.searchProtocolsHybrid(query, embedding, { limit });

      return results.map(result => ({
        id: result.chunk_id || result.protocol_id,
        title: result.chunk_title || result.tp_name,
        category: 'Protocol',
        content: result.chunk_content || '',
        keywords: [],
      }));
    } catch (error) {
      logger.error('Hybrid search failed, falling back to full-text', { error });
      return await this.searchProtocolChunks(query, limit);
    }
  }

  /**
   * Record protocol usage for analytics
   */
  async recordUsage(
    tpCode: string,
    action: 'view' | 'search_result' | 'copy' | 'export' | 'recommend',
    metadata?: {
      userId?: string;
      sessionId?: string;
      retrievalTime?: number;
    }
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const protocol = await this.repository.getProtocolByCode(tpCode);
      if (!protocol) return;

      await this.repository.recordUsage(protocol.id, tpCode, action, {
        source: 'chat',
        userId: metadata?.userId,
        retrievalTime: metadata?.retrievalTime,
        metadata: {
          session_id: metadata?.sessionId,
        },
      });
    } catch (error) {
      // Don't throw - analytics failures shouldn't break the app
      logger.warn('Failed to record protocol usage', { tpCode, error });
    }
  }

  /**
   * Log search for analytics
   */
  async logSearch(
    query: string,
    resultCount: number,
    searchType: 'fulltext' | 'vector' | 'hybrid' = 'fulltext',
    metadata?: {
      userId?: string;
      sessionId?: string;
      executionTime?: number;
    }
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.repository.logSearch(query, searchType, [], {
        userId: metadata?.userId,
        sessionId: metadata?.sessionId,
        executionTime: metadata?.executionTime,
        metadata: {
          result_count: resultCount,
        },
      });
    } catch (error) {
      logger.warn('Failed to log search', { query, error });
    }
  }

  // =============================================================================
  // CONVERSION HELPERS
  // =============================================================================

  /**
   * Convert Protocol to KBDoc format for backward compatibility
   */
  private convertProtocolToKBDoc(protocol: Protocol): KBDoc {
    return {
      id: protocol.tp_code,
      title: `${protocol.tp_code}: ${protocol.tp_name}`,
      category: protocol.tp_category,
      content: protocol.full_text,
      keywords: protocol.keywords,
    };
  }

  /**
   * Convert multiple Protocols to KBDoc format
   */
  private convertProtocolsToKBDocs(protocols: Protocol[]): KBDoc[] {
    return protocols.map(p => this.convertProtocolToKBDoc(p));
  }
}

// Singleton instance
let instance: DatabaseRetrievalAdapter | null = null;

/**
 * Get the singleton instance of DatabaseRetrievalAdapter
 */
export function getDatabaseRetrievalAdapter(): DatabaseRetrievalAdapter {
  if (!instance) {
    instance = new DatabaseRetrievalAdapter();
  }
  return instance;
}
