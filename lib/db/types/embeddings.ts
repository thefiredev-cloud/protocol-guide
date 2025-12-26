/**
 * TypeScript types for protocol_embeddings table
 * Generated from: supabase/migrations/011_pgvector_embeddings.sql
 */

/**
 * Protocol embedding record in the database
 * Represents a vector embedding of a medical protocol for semantic search
 */
export type ProtocolEmbedding = {
  id: string; // UUID
  protocol_id: string; // Unique identifier matching KB document ID
  title: string;
  category: string;
  subcategory: string | null;
  content: string; // Full text content
  content_hash: string; // SHA-256 hash for change detection
  embedding: number[]; // 1536-dimensional vector from text-embedding-3-small
  metadata: Record<string, unknown>; // JSONB field for flexible metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};

/**
 * Insert payload for creating a new protocol embedding
 */
export type ProtocolEmbeddingInsert = {
  protocol_id: string;
  title: string;
  category: string;
  subcategory?: string | null;
  content: string;
  content_hash: string;
  embedding: number[]; // Must be exactly 1536 dimensions
  metadata?: Record<string, unknown>;
};

/**
 * Update payload for modifying an existing protocol embedding
 */
export type ProtocolEmbeddingUpdate = {
  title?: string;
  category?: string;
  subcategory?: string | null;
  content?: string;
  content_hash?: string;
  embedding?: number[]; // Must be exactly 1536 dimensions
  metadata?: Record<string, unknown>;
};

/**
 * Search result from semantic similarity search
 * Includes similarity score between 0 and 1
 */
export type ProtocolSearchResult = {
  id: string;
  protocol_id: string;
  title: string;
  category: string;
  subcategory: string | null;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number; // Cosine similarity score (0-1, higher is better)
};

/**
 * Parameters for semantic search function
 */
export type ProtocolSearchParams = {
  query_embedding: number[]; // Must be exactly 1536 dimensions
  match_threshold?: number; // Minimum similarity score (default: 0.7)
  match_count?: number; // Maximum number of results (default: 10)
  filter_category?: string | null; // Optional category filter
  filter_metadata?: Record<string, unknown> | null; // Optional metadata filter
};

/**
 * Parameters for upserting a protocol embedding
 */
export type UpsertProtocolEmbeddingParams = {
  protocol_id: string;
  title: string;
  category: string;
  subcategory: string | null;
  content: string;
  content_hash: string;
  embedding: number[]; // Must be exactly 1536 dimensions
  metadata?: Record<string, unknown>;
};

/**
 * Statistics about protocol embeddings
 */
export type EmbeddingStats = {
  total_embeddings: number;
  categories_count: number;
  avg_content_length: number;
  last_updated: string; // ISO timestamp
};

/**
 * Metadata structure for protocol embeddings
 * This is a suggested schema - actual metadata is flexible JSONB
 */
export type ProtocolMetadata = {
  keywords?: string[];
  protocol_codes?: string[];
  severity_level?: 'low' | 'medium' | 'high' | 'critical';
  provider_level?: 'EMT' | 'Paramedic' | 'All';
  tags?: string[];
  version?: string;
  last_reviewed?: string;
  related_protocols?: string[];
  [key: string]: unknown; // Allow additional fields
};
