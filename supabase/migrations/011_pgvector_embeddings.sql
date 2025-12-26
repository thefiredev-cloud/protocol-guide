-- =============================================================================
-- pgvector Extension and Protocol Embeddings for Semantic Search
-- Purpose: Enable vector similarity search for medical protocols in Medic-Bot
-- Dependencies: None (standalone extension)
-- Vector Model: OpenAI text-embedding-3-small (1536 dimensions)
-- =============================================================================

-- =============================================================================
-- ENABLE PGVECTOR EXTENSION
-- =============================================================================
-- pgvector adds support for vector similarity search in PostgreSQL

CREATE EXTENSION IF NOT EXISTS vector;

COMMENT ON EXTENSION vector IS 'Vector similarity search for embeddings (cosine, L2, inner product)';

-- =============================================================================
-- PROTOCOL_EMBEDDINGS TABLE
-- =============================================================================
-- Stores vector embeddings of medical protocols for semantic search
-- Each protocol document is chunked and embedded for retrieval

CREATE TABLE IF NOT EXISTS protocol_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Protocol identification (matches knowledge base document ID)
  protocol_id TEXT UNIQUE NOT NULL,

  -- Protocol metadata
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,

  -- Full text content (for reference and re-embedding)
  content TEXT NOT NULL,

  -- Change detection (SHA-256 hash of content)
  -- Allows efficient detection of protocol updates
  content_hash TEXT NOT NULL,

  -- Vector embedding (1536 dimensions for text-embedding-3-small)
  -- Used for cosine similarity search
  embedding vector(1536) NOT NULL,

  -- Additional metadata (JSONB for flexibility)
  -- Examples: keywords, protocol_codes, severity_level, provider_level, etc.
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- IVFFlat index for fast approximate nearest neighbor search
-- Lists = rows/1000 is a good starting point (will auto-adjust as data grows)
-- Using cosine distance (most common for normalized embeddings)
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_vector
  ON protocol_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index on protocol_id for lookup and deduplication
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_protocol_id
  ON protocol_embeddings(protocol_id);

-- Index on category for filtered search
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_category
  ON protocol_embeddings(category);

-- Index on content_hash for efficient change detection
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_content_hash
  ON protocol_embeddings(content_hash);

-- GIN index on metadata JSONB for flexible filtering
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_metadata
  ON protocol_embeddings USING gin(metadata);

COMMENT ON TABLE protocol_embeddings IS 'Vector embeddings of medical protocols for semantic search';
COMMENT ON COLUMN protocol_embeddings.protocol_id IS 'Unique identifier matching KB document ID';
COMMENT ON COLUMN protocol_embeddings.embedding IS '1536-dim vector from text-embedding-3-small';
COMMENT ON COLUMN protocol_embeddings.content_hash IS 'SHA-256 hash for change detection';
COMMENT ON COLUMN protocol_embeddings.metadata IS 'Flexible JSONB storage for keywords, codes, etc.';

-- =============================================================================
-- UPDATE TRIGGER
-- =============================================================================

-- Reuse existing update_updated_at_column function from earlier migrations
CREATE TRIGGER trigger_protocol_embeddings_updated
  BEFORE UPDATE ON protocol_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEMANTIC SEARCH FUNCTION
-- =============================================================================
-- Performs cosine similarity search to find most relevant protocols

CREATE OR REPLACE FUNCTION search_protocols(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_category TEXT DEFAULT NULL,
  filter_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  protocol_id TEXT,
  title TEXT,
  category TEXT,
  subcategory TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.protocol_id,
    pe.title,
    pe.category,
    pe.subcategory,
    pe.content,
    pe.metadata,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM protocol_embeddings pe
  WHERE
    -- Similarity threshold filter
    1 - (pe.embedding <=> query_embedding) > match_threshold
    -- Optional category filter
    AND (filter_category IS NULL OR pe.category = filter_category)
    -- Optional metadata filter (contains check)
    AND (filter_metadata IS NULL OR pe.metadata @> filter_metadata)
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_protocols IS 'Semantic search using cosine similarity with optional filters';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Upsert embedding (insert or update if content changed)
CREATE OR REPLACE FUNCTION upsert_protocol_embedding(
  p_protocol_id TEXT,
  p_title TEXT,
  p_category TEXT,
  p_subcategory TEXT,
  p_content TEXT,
  p_content_hash TEXT,
  p_embedding vector(1536),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO protocol_embeddings (
    protocol_id,
    title,
    category,
    subcategory,
    content,
    content_hash,
    embedding,
    metadata
  )
  VALUES (
    p_protocol_id,
    p_title,
    p_category,
    p_subcategory,
    p_content,
    p_content_hash,
    p_embedding,
    p_metadata
  )
  ON CONFLICT (protocol_id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    embedding = EXCLUDED.embedding,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  WHERE protocol_embeddings.content_hash != EXCLUDED.content_hash
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_protocol_embedding IS 'Insert or update embedding if content hash changed';

-- Get embedding statistics
CREATE OR REPLACE FUNCTION get_embedding_stats()
RETURNS TABLE (
  total_embeddings BIGINT,
  categories_count BIGINT,
  avg_content_length NUMERIC,
  last_updated TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_embeddings,
    COUNT(DISTINCT category)::BIGINT as categories_count,
    AVG(LENGTH(content))::NUMERIC as avg_content_length,
    MAX(updated_at) as last_updated
  FROM protocol_embeddings;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_embedding_stats IS 'Get statistics about protocol embeddings';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- Embeddings are read-only for all authenticated users
-- Only backend services should write/update embeddings

ALTER TABLE protocol_embeddings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read embeddings (for semantic search)
CREATE POLICY "Anyone can read protocol embeddings"
  ON protocol_embeddings FOR SELECT
  USING (true);

-- Only service role can insert/update/delete embeddings
-- This should be done via backend API or edge functions
CREATE POLICY "Only service role can modify embeddings"
  ON protocol_embeddings FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- PERFORMANCE NOTES
-- =============================================================================
-- 1. IVFFlat index parameters:
--    - lists: Should be ~sqrt(rows) for best performance
--    - Current setting (100) is good for ~10K protocols
--    - Reindex periodically: REINDEX INDEX idx_protocol_embeddings_vector;
--
-- 2. Vector operations:
--    - <=> : cosine distance (1 - cosine similarity)
--    - <-> : L2 distance (Euclidean)
--    - <#> : inner product (negative dot product)
--
-- 3. Query optimization:
--    - Set probes for index: SET ivfflat.probes = 10;
--    - Higher probes = better recall, slower queries
--    - Default is typically adequate for most use cases
--
-- 4. Memory considerations:
--    - Each vector(1536) uses ~6KB storage
--    - Index uses additional memory proportional to dataset size
-- =============================================================================
