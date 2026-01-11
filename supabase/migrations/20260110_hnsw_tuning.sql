-- HNSW Index Tuning for Medical Domain
-- Migration: 20260110_hnsw_tuning.sql
--
-- Optimizations based on RAG performance analysis:
-- 1. Improved HNSW parameters (m=24, ef_construction=100) for higher recall
-- 2. Server-side timeouts to prevent runaway queries
-- 3. Configurable ef_search for query-time tuning

-- ============================================
-- 1. REBUILD HNSW INDEX WITH OPTIMIZED PARAMS
-- ============================================

-- Drop existing index (if exists)
DROP INDEX IF EXISTS idx_chunks_embedding;

-- Recreate with optimized parameters for medical domain
-- m=24 (up from 16): denser graph improves recall for overlapping terminology
-- ef_construction=100 (up from 64): better index quality, one-time cost
CREATE INDEX idx_chunks_embedding ON protocol_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 24, ef_construction = 100);

-- ============================================
-- 2. SERVER-SIDE TIMEOUT CONFIGURATION
-- ============================================

-- Set statement timeouts on search functions to prevent runaway queries
-- These match the client-side timeouts for consistent behavior

-- Semantic search: 3 second timeout
ALTER FUNCTION semantic_search_protocols SET statement_timeout = '3s';

-- Hybrid search v2: 4 second timeout
ALTER FUNCTION hybrid_search_protocols_v2 SET statement_timeout = '4s';

-- Fulltext search: 2 second timeout (should be fast)
ALTER FUNCTION fulltext_search_protocols SET statement_timeout = '2s';

-- ============================================
-- 3. CONFIGURABLE EF_SEARCH WRAPPER
-- ============================================

-- Function to set ef_search dynamically for the current transaction
-- Higher values = better recall, slower queries
-- Recommended: 40 (fast), 100 (balanced), 150-200 (critical protocols)
CREATE OR REPLACE FUNCTION set_hnsw_ef_search(ef_value INT DEFAULT 40)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate range (20-500 is reasonable)
  IF ef_value < 20 THEN
    ef_value := 20;
  ELSIF ef_value > 500 THEN
    ef_value := 500;
  END IF;

  EXECUTE format('SET LOCAL hnsw.ef_search = %s', ef_value);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION set_hnsw_ef_search TO authenticated;
GRANT EXECUTE ON FUNCTION set_hnsw_ef_search TO anon;

-- ============================================
-- 4. ENHANCED SEMANTIC SEARCH WITH EF_SEARCH
-- ============================================

-- Drop and recreate semantic search with ef_search parameter
CREATE OR REPLACE FUNCTION semantic_search_protocols_v2(
  query_embedding vector(768),
  match_count INT DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.45,
  ef_search_value INT DEFAULT 40
)
RETURNS TABLE (
  chunk_id UUID,
  protocol_id TEXT,
  protocol_ref TEXT,
  protocol_title TEXT,
  category TEXT,
  section_title TEXT,
  content TEXT,
  similarity FLOAT,
  source_url TEXT,
  source_verified BOOLEAN
)
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
AS $$
BEGIN
  -- Set ef_search for this query (higher = better recall, slower)
  PERFORM set_hnsw_ef_search(ef_search_value);

  RETURN QUERY
  SELECT
    pc.id AS chunk_id,
    pc.protocol_id,
    pc.protocol_ref,
    pc.protocol_title,
    pc.category,
    pc.section_title,
    pc.content,
    (1 - (pc.embedding <=> query_embedding))::FLOAT AS similarity,
    pc.source_url,
    pc.source_verified
  FROM protocol_chunks pc
  WHERE pc.embedding IS NOT NULL
    AND pc.source_verified = true
    AND (1 - (pc.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION semantic_search_protocols_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION semantic_search_protocols_v2 TO anon;

-- ============================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION set_hnsw_ef_search IS
'Sets HNSW ef_search parameter for current transaction. Higher values improve recall at cost of speed.
Recommended values:
- 40: Fast queries, normal chat
- 100: Balanced, important queries
- 150-200: Critical protocols (stroke, ECMO, trauma)';

COMMENT ON FUNCTION semantic_search_protocols_v2 IS
'Enhanced semantic search with configurable ef_search. Default threshold lowered to 0.45 for medical terminology.';

-- ============================================
-- 6. VERIFY INDEX REBUILD
-- ============================================

-- This will show the new index parameters after migration
DO $$
DECLARE
  index_info RECORD;
BEGIN
  SELECT * INTO index_info
  FROM pg_indexes
  WHERE indexname = 'idx_chunks_embedding';

  IF index_info IS NOT NULL THEN
    RAISE NOTICE 'HNSW index rebuilt successfully: %', index_info.indexdef;
  END IF;
END;
$$;
