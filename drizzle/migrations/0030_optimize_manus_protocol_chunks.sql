-- ============================================================================
-- Migration 0030: Optimize manus_protocol_chunks for Enterprise Scale
-- ============================================================================
-- Database: Supabase (PostgreSQL)
-- Table: manus_protocol_chunks (primary search table with 58K+ chunks)
--
-- This migration adds comprehensive indexing for:
-- 1. Vector similarity search (HNSW index on embeddings)
-- 2. State/agency filtering (B-tree indexes)
-- 3. Full-text keyword search (GIN index with tsvector)
-- 4. Composite indexes for common query patterns
--
-- Prerequisites:
-- - pgvector extension must be enabled
-- - Run as service_role or superuser
-- ============================================================================

-- ============================================================================
-- 1. VECTOR INDEX FOR EMBEDDING SIMILARITY SEARCH
-- ============================================================================
-- HNSW index is faster for queries than IVFFlat and doesn't require training
-- Parameters optimized for ~60K vectors with 1536 dimensions (Voyage AI)
-- m=16: number of bi-directional links (default is 16, higher = better recall)
-- ef_construction=64: higher = better index quality, slower to build

-- Check if pgvector extension is enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE EXCEPTION 'pgvector extension is not enabled. Run: CREATE EXTENSION vector;';
    END IF;
END $$;

-- Drop existing index if it's IVFFlat (we're upgrading to HNSW)
DROP INDEX IF EXISTS idx_manus_protocol_chunks_embedding_ivfflat;
DROP INDEX IF EXISTS manus_protocol_chunks_embedding_idx;

-- Create HNSW index for cosine similarity (used by Voyage AI embeddings)
-- This is the most critical index for semantic search performance
CREATE INDEX IF NOT EXISTS idx_manus_chunks_embedding_hnsw 
ON manus_protocol_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

COMMENT ON INDEX idx_manus_chunks_embedding_hnsw IS 'HNSW index for fast cosine similarity search on Voyage AI embeddings (1536 dim)';

-- ============================================================================
-- 2. B-TREE INDEXES FOR FILTERING
-- ============================================================================
-- These indexes enable fast filtering before vector search

-- Agency ID filter (critical for agency-specific searches)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_agency_id 
ON manus_protocol_chunks(agency_id);

COMMENT ON INDEX idx_manus_chunks_agency_id IS 'B-tree index for agency-specific protocol searches';

-- State code filter (critical for state-wide searches)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_state_code 
ON manus_protocol_chunks(state_code);

COMMENT ON INDEX idx_manus_chunks_state_code IS 'B-tree index for state-wide protocol searches';

-- Protocol number lookup (for direct protocol access)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_protocol_number 
ON manus_protocol_chunks(protocol_number);

COMMENT ON INDEX idx_manus_chunks_protocol_number IS 'B-tree index for protocol number lookups';

-- ============================================================================
-- 3. COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================
-- These cover the most common multi-column filter patterns

-- State + Agency (for state-scoped agency searches)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_state_agency 
ON manus_protocol_chunks(state_code, agency_id);

COMMENT ON INDEX idx_manus_chunks_state_agency IS 'Composite index for state + agency filtered searches';

-- Agency + Protocol Number (for agency protocol lookup)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_agency_protocol 
ON manus_protocol_chunks(agency_id, protocol_number);

COMMENT ON INDEX idx_manus_chunks_agency_protocol IS 'Composite index for agency-specific protocol lookups';

-- State + Protocol Number (for state protocol lookup)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_state_protocol 
ON manus_protocol_chunks(state_code, protocol_number);

COMMENT ON INDEX idx_manus_chunks_state_protocol IS 'Composite index for state-wide protocol lookups';

-- ============================================================================
-- 4. FULL-TEXT SEARCH INDEX (PostgreSQL GIN)
-- ============================================================================
-- Create a tsvector column for efficient full-text search
-- This enables fast keyword searches without ILIKE scans

-- Add tsvector column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manus_protocol_chunks' 
        AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE manus_protocol_chunks 
        ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Populate tsvector from content, title, and section
-- Using 'english' dictionary for stemming (cardiac -> cardiac, arrest -> arrest)
UPDATE manus_protocol_chunks 
SET search_vector = 
    setweight(to_tsvector('english', coalesce(protocol_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(section, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
WHERE search_vector IS NULL;

-- Create GIN index on the tsvector column
CREATE INDEX IF NOT EXISTS idx_manus_chunks_search_vector 
ON manus_protocol_chunks 
USING gin(search_vector);

COMMENT ON INDEX idx_manus_chunks_search_vector IS 'GIN index for full-text search on protocol content (weighted: title A, section B, content C)';

-- Create trigger to auto-update search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION manus_chunks_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.protocol_title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.section, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS manus_chunks_search_update ON manus_protocol_chunks;

-- Create trigger
CREATE TRIGGER manus_chunks_search_update
    BEFORE INSERT OR UPDATE OF protocol_title, section, content
    ON manus_protocol_chunks
    FOR EACH ROW
    EXECUTE FUNCTION manus_chunks_search_vector_trigger();

COMMENT ON TRIGGER manus_chunks_search_update ON manus_protocol_chunks IS 'Auto-updates search_vector when content changes';

-- ============================================================================
-- 5. PARTIAL INDEXES FOR COMMON FILTERS
-- ============================================================================
-- Partial indexes are smaller and faster for specific query patterns

-- Index for chunks WITH embeddings (most common query)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_with_embedding 
ON manus_protocol_chunks(id) 
WHERE embedding IS NOT NULL;

COMMENT ON INDEX idx_manus_chunks_with_embedding IS 'Partial index for chunks that have embeddings';

-- Index for active agencies only (if has_images is used as filter)
CREATE INDEX IF NOT EXISTS idx_manus_chunks_with_images 
ON manus_protocol_chunks(id, agency_id) 
WHERE has_images = true;

COMMENT ON INDEX idx_manus_chunks_with_images IS 'Partial index for chunks with images';

-- ============================================================================
-- 6. TIMESTAMP INDEXES FOR ANALYTICS
-- ============================================================================

-- Created at for recent protocols
CREATE INDEX IF NOT EXISTS idx_manus_chunks_created_at 
ON manus_protocol_chunks(created_at DESC);

COMMENT ON INDEX idx_manus_chunks_created_at IS 'Index for sorting/filtering by creation date';

-- Last verified for data quality monitoring
CREATE INDEX IF NOT EXISTS idx_manus_chunks_last_verified 
ON manus_protocol_chunks(last_verified_at DESC NULLS LAST);

COMMENT ON INDEX idx_manus_chunks_last_verified IS 'Index for finding stale protocols needing verification';

-- ============================================================================
-- 7. UPDATE SEARCH RPC TO USE FULL-TEXT INDEX
-- ============================================================================
-- Create an enhanced search function that uses the new full-text index

CREATE OR REPLACE FUNCTION search_manus_protocols_fts(
    query_text TEXT,
    query_embedding vector(1536),
    agency_filter INTEGER DEFAULT NULL,
    state_code_filter TEXT DEFAULT NULL,
    match_count INTEGER DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
    id INTEGER,
    agency_id INTEGER,
    protocol_number TEXT,
    protocol_title TEXT,
    section TEXT,
    content TEXT,
    image_urls TEXT[],
    similarity FLOAT,
    fts_rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH fts_results AS (
        -- Full-text search for keyword relevance
        SELECT 
            c.id,
            ts_rank_cd(c.search_vector, websearch_to_tsquery('english', query_text)) AS fts_score
        FROM manus_protocol_chunks c
        WHERE c.search_vector @@ websearch_to_tsquery('english', query_text)
          AND (agency_filter IS NULL OR c.agency_id = agency_filter)
          AND (state_code_filter IS NULL OR c.state_code = state_code_filter)
          AND c.embedding IS NOT NULL
        LIMIT match_count * 3
    ),
    vector_results AS (
        -- Vector similarity search
        SELECT 
            c.id,
            c.agency_id,
            c.protocol_number,
            c.protocol_title,
            c.section,
            c.content,
            c.image_urls,
            1 - (c.embedding <=> query_embedding) AS similarity
        FROM manus_protocol_chunks c
        WHERE (agency_filter IS NULL OR c.agency_id = agency_filter)
          AND (state_code_filter IS NULL OR c.state_code = state_code_filter)
          AND c.embedding IS NOT NULL
        ORDER BY c.embedding <=> query_embedding
        LIMIT match_count * 2
    )
    SELECT 
        vr.id,
        vr.agency_id,
        vr.protocol_number,
        vr.protocol_title,
        vr.section,
        vr.content,
        vr.image_urls,
        vr.similarity,
        COALESCE(fts.fts_score, 0.0)::FLOAT AS fts_rank
    FROM vector_results vr
    LEFT JOIN fts_results fts ON vr.id = fts.id
    WHERE vr.similarity >= match_threshold
    ORDER BY 
        -- Combined score: 70% vector similarity + 30% FTS relevance
        (vr.similarity * 0.7) + (COALESCE(fts.fts_score, 0) * 0.3) DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_manus_protocols_fts IS 'Hybrid search combining vector similarity with full-text keyword relevance';

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify indexes were created:

-- List all indexes on manus_protocol_chunks
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'manus_protocol_chunks';

-- Check index sizes
-- SELECT
--     indexname,
--     pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
-- FROM pg_indexes
-- WHERE tablename = 'manus_protocol_chunks'
-- ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Test HNSW index is being used
-- EXPLAIN ANALYZE
-- SELECT id, 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
-- FROM manus_protocol_chunks
-- WHERE embedding IS NOT NULL
-- ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
-- LIMIT 10;

-- Test full-text search
-- EXPLAIN ANALYZE
-- SELECT id, protocol_title, ts_rank(search_vector, websearch_to_tsquery('cardiac arrest'))
-- FROM manus_protocol_chunks
-- WHERE search_vector @@ websearch_to_tsquery('cardiac arrest')
-- ORDER BY ts_rank(search_vector, websearch_to_tsquery('cardiac arrest')) DESC
-- LIMIT 10;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
/*
To rollback this migration:

DROP INDEX IF EXISTS idx_manus_chunks_embedding_hnsw;
DROP INDEX IF EXISTS idx_manus_chunks_agency_id;
DROP INDEX IF EXISTS idx_manus_chunks_state_code;
DROP INDEX IF EXISTS idx_manus_chunks_protocol_number;
DROP INDEX IF EXISTS idx_manus_chunks_state_agency;
DROP INDEX IF EXISTS idx_manus_chunks_agency_protocol;
DROP INDEX IF EXISTS idx_manus_chunks_state_protocol;
DROP INDEX IF EXISTS idx_manus_chunks_search_vector;
DROP INDEX IF EXISTS idx_manus_chunks_with_embedding;
DROP INDEX IF EXISTS idx_manus_chunks_with_images;
DROP INDEX IF EXISTS idx_manus_chunks_created_at;
DROP INDEX IF EXISTS idx_manus_chunks_last_verified;

DROP TRIGGER IF EXISTS manus_chunks_search_update ON manus_protocol_chunks;
DROP FUNCTION IF EXISTS manus_chunks_search_vector_trigger();
DROP FUNCTION IF EXISTS search_manus_protocols_fts;

ALTER TABLE manus_protocol_chunks DROP COLUMN IF EXISTS search_vector;
*/
