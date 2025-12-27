-- =============================================================================
-- HNSW Index Migration for Protocol Embeddings
-- Migrates from IVFFlat to HNSW for better recall and consistent performance
-- =============================================================================

-- Ensure pgvector extension is available
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- 1. CREATE NEW HNSW INDEX
-- =============================================================================

-- HNSW parameters:
--   m = 16: connections per node (default, good balance)
--   ef_construction = 64: search extent during construction (higher = better quality)
--
-- HNSW advantages over IVFFlat:
--   - Better recall (fewer missed results)
--   - Consistent query performance
--   - No reindexing needed after insertions
--   - Better for datasets > 10K embeddings

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_protocol_embeddings_hnsw
  ON protocol_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- =============================================================================
-- 2. DROP OLD IVFFLAT INDEX (after HNSW is built)
-- =============================================================================

-- Drop the old IVFFlat index if it exists
DROP INDEX IF EXISTS idx_protocol_embeddings_vector;

-- =============================================================================
-- 3. UPDATE MATCH FUNCTION WITH ADAPTIVE THRESHOLD
-- =============================================================================

-- Updated match function with better defaults and probes hint
CREATE OR REPLACE FUNCTION match_protocol_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.65,  -- Lowered from 0.7 for better recall
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id TEXT,
  title TEXT,
  content TEXT,
  category TEXT,
  subcategory TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set HNSW ef_search for query-time accuracy/speed tradeoff
  -- Higher = better recall, slower queries
  PERFORM set_config('hnsw.ef_search', '40', true);

  RETURN QUERY
  SELECT
    pe.protocol_id AS chunk_id,
    pe.title,
    pe.content,
    pe.category,
    pe.subcategory,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM protocol_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- 4. ADD SEARCH PROTOCOLS WITH FILTER SUPPORT
-- =============================================================================

-- Updated search function with category filtering and metadata support
CREATE OR REPLACE FUNCTION search_protocols(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 10,
  filter_category TEXT DEFAULT NULL,
  filter_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  chunk_id TEXT,
  title TEXT,
  content TEXT,
  category TEXT,
  subcategory TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set HNSW ef_search for better recall
  PERFORM set_config('hnsw.ef_search', '40', true);

  RETURN QUERY
  SELECT
    pe.protocol_id AS chunk_id,
    pe.title,
    pe.content,
    pe.category,
    pe.subcategory,
    1 - (pe.embedding <=> query_embedding) AS similarity,
    pe.metadata
  FROM protocol_embeddings pe
  WHERE
    1 - (pe.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR pe.category = filter_category)
    AND (filter_metadata IS NULL OR pe.metadata @> filter_metadata)
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- 5. GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION match_protocol_chunks TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_protocols TO anon, authenticated;

-- =============================================================================
-- NOTES
-- =============================================================================

-- After running this migration:
-- 1. Monitor query performance with: EXPLAIN ANALYZE SELECT ...
-- 2. If recall is insufficient, increase hnsw.ef_search (max 200)
-- 3. For very large datasets (>100K), consider ef_construction = 100

-- To verify HNSW index is being used:
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM protocol_embeddings
-- ORDER BY embedding <=> '[...]'::vector
-- LIMIT 10;
