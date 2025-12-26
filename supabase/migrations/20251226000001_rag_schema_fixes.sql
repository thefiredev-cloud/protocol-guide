-- =============================================================================
-- RAG Schema Fixes for Protocol Embeddings
-- Purpose: Add missing columns and match_protocol_chunks function for hybrid search
-- Dependencies: 20251222000011_pgvector_embeddings.sql
-- =============================================================================

-- =============================================================================
-- ADD MISSING COLUMNS TO protocol_embeddings
-- =============================================================================

-- Add doc_id as an alias for protocol_id (for script compatibility)
-- This allows both protocol_id and doc_id to reference the same document
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'protocol_embeddings' AND column_name = 'doc_id'
  ) THEN
    ALTER TABLE protocol_embeddings
    ADD COLUMN doc_id TEXT;

    -- Populate doc_id with protocol_id for existing records
    UPDATE protocol_embeddings SET doc_id = protocol_id WHERE doc_id IS NULL;

    -- Make doc_id NOT NULL after populating
    ALTER TABLE protocol_embeddings ALTER COLUMN doc_id SET NOT NULL;
  END IF;
END $$;

-- Add embedding_model to track which OpenAI model was used
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'protocol_embeddings' AND column_name = 'embedding_model'
  ) THEN
    ALTER TABLE protocol_embeddings
    ADD COLUMN embedding_model TEXT DEFAULT 'text-embedding-3-small';

    -- Set default for existing records
    UPDATE protocol_embeddings
    SET embedding_model = 'text-embedding-3-small'
    WHERE embedding_model IS NULL;

    -- Make NOT NULL
    ALTER TABLE protocol_embeddings ALTER COLUMN embedding_model SET NOT NULL;
  END IF;
END $$;

-- Add embedding_version for tracking model version changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'protocol_embeddings' AND column_name = 'embedding_version'
  ) THEN
    ALTER TABLE protocol_embeddings
    ADD COLUMN embedding_version INTEGER DEFAULT 1;

    -- Set default for existing records
    UPDATE protocol_embeddings
    SET embedding_version = 1
    WHERE embedding_version IS NULL;

    -- Make NOT NULL
    ALTER TABLE protocol_embeddings ALTER COLUMN embedding_version SET NOT NULL;
  END IF;
END $$;

-- Add content_preview for quick reference without loading full content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'protocol_embeddings' AND column_name = 'content_preview'
  ) THEN
    ALTER TABLE protocol_embeddings
    ADD COLUMN content_preview TEXT;

    -- Populate preview from first 200 chars of content for existing records
    UPDATE protocol_embeddings
    SET content_preview = LEFT(content, 200)
    WHERE content_preview IS NULL;
  END IF;
END $$;

COMMENT ON COLUMN protocol_embeddings.doc_id IS 'Document ID alias for protocol_id (script compatibility)';
COMMENT ON COLUMN protocol_embeddings.embedding_model IS 'OpenAI embedding model used (e.g., text-embedding-3-small)';
COMMENT ON COLUMN protocol_embeddings.embedding_version IS 'Embedding model version for migration tracking';
COMMENT ON COLUMN protocol_embeddings.content_preview IS 'First 200 chars of content for quick reference';

-- =============================================================================
-- CREATE UNIQUE CONSTRAINTS AND INDEXES
-- =============================================================================

-- Create unique constraint on (doc_id, embedding_model, embedding_version)
-- This allows multiple embeddings per document with different models/versions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'protocol_embeddings_doc_model_version_unique'
  ) THEN
    CREATE UNIQUE INDEX protocol_embeddings_doc_model_version_unique
    ON protocol_embeddings(doc_id, embedding_model, embedding_version);
  END IF;
END $$;

-- Create index on doc_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_doc_id
  ON protocol_embeddings(doc_id);

-- Create index on embedding_model for filtering by model
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_model
  ON protocol_embeddings(embedding_model);

-- Create composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_protocol_embeddings_model_version
  ON protocol_embeddings(embedding_model, embedding_version);

-- =============================================================================
-- CREATE match_protocol_chunks FUNCTION
-- =============================================================================
-- This function is expected by hybrid-search.ts for semantic search
-- Returns protocol chunks matching the query embedding above similarity threshold

CREATE OR REPLACE FUNCTION match_protocol_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
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
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.doc_id AS chunk_id,
    pe.title,
    pe.content,
    pe.category,
    pe.subcategory,
    -- Calculate cosine similarity: 1 - cosine_distance
    (1 - (pe.embedding <=> query_embedding))::FLOAT AS similarity
  FROM protocol_embeddings pe
  WHERE
    -- Filter by similarity threshold
    1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY
    -- Order by cosine distance (ascending = more similar)
    pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_protocol_chunks IS 'Semantic search for protocol chunks using cosine similarity. Used by hybrid-search.ts for RAG retrieval.';
 Semantic search for protocol chunks using cosine similarity. 
 Used by hybrid-search.ts for RAG retrieval. 
 Returns chunk_id (doc_id), title, content, category, subcategory, and similarity score.';

-- =============================================================================
-- UPDATE EXISTING FUNCTIONS TO SUPPORT NEW COLUMNS
-- =============================================================================

-- Update upsert_protocol_embedding to handle new columns
CREATE OR REPLACE FUNCTION upsert_protocol_embedding(
  p_protocol_id TEXT,
  p_title TEXT,
  p_category TEXT,
  p_subcategory TEXT,
  p_content TEXT,
  p_content_hash TEXT,
  p_embedding vector(1536),
  p_metadata JSONB DEFAULT '{}',
  p_embedding_model TEXT DEFAULT 'text-embedding-3-small',
  p_embedding_version INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  result_id UUID;
  v_doc_id TEXT;
  v_content_preview TEXT;
BEGIN
  -- Use protocol_id as doc_id
  v_doc_id := p_protocol_id;

  -- Generate content preview (first 200 chars)
  v_content_preview := LEFT(p_content, 200);

  INSERT INTO protocol_embeddings (
    protocol_id,
    doc_id,
    title,
    category,
    subcategory,
    content,
    content_hash,
    embedding,
    metadata,
    embedding_model,
    embedding_version,
    content_preview
  )
  VALUES (
    p_protocol_id,
    v_doc_id,
    p_title,
    p_category,
    p_subcategory,
    p_content,
    p_content_hash,
    p_embedding,
    p_metadata,
    p_embedding_model,
    p_embedding_version,
    v_content_preview
  )
  ON CONFLICT (doc_id, embedding_model, embedding_version)
  DO UPDATE SET
    protocol_id = EXCLUDED.protocol_id,
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    embedding = EXCLUDED.embedding,
    metadata = EXCLUDED.metadata,
    content_preview = EXCLUDED.content_preview,
    updated_at = NOW()
  WHERE protocol_embeddings.content_hash != EXCLUDED.content_hash
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_protocol_embedding IS 'Insert or update embedding if content hash changed. Now supports embedding_model and embedding_version for multi-model support.';

-- =============================================================================
-- ADDITIONAL HELPER FUNCTIONS
-- =============================================================================

-- Function to get embeddings by document ID
CREATE OR REPLACE FUNCTION get_embeddings_by_doc_id(
  p_doc_id TEXT,
  p_embedding_model TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  doc_id TEXT,
  protocol_id TEXT,
  title TEXT,
  category TEXT,
  subcategory TEXT,
  content_preview TEXT,
  embedding_model TEXT,
  embedding_version INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.doc_id,
    pe.protocol_id,
    pe.title,
    pe.category,
    pe.subcategory,
    pe.content_preview,
    pe.embedding_model,
    pe.embedding_version,
    pe.created_at,
    pe.updated_at
  FROM protocol_embeddings pe
  WHERE
    pe.doc_id = p_doc_id
    AND (p_embedding_model IS NULL OR pe.embedding_model = p_embedding_model)
  ORDER BY pe.embedding_version DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_embeddings_by_doc_id IS
 Get all embeddings for a document ID, optionally filtered by model. 
 Returns metadata without heavy content field.';

-- Function to delete outdated embeddings
CREATE OR REPLACE FUNCTION delete_outdated_embeddings(
  p_embedding_model TEXT,
  p_current_version INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM protocol_embeddings
  WHERE
    embedding_model = p_embedding_model
    AND embedding_version < p_current_version;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION delete_outdated_embeddings IS
 Delete embeddings with outdated model versions. 
 Returns count of deleted rows.';

-- Enhanced stats function including new columns
CREATE OR REPLACE FUNCTION get_embedding_stats()
RETURNS TABLE (
  total_embeddings BIGINT,
  categories_count BIGINT,
  models_count BIGINT,
  avg_content_length NUMERIC,
  last_updated TIMESTAMPTZ,
  model_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_embeddings,
    COUNT(DISTINCT category)::BIGINT as categories_count,
    COUNT(DISTINCT embedding_model)::BIGINT as models_count,
    AVG(LENGTH(content))::NUMERIC as avg_content_length,
    MAX(updated_at) as last_updated,
    jsonb_object_agg(
      embedding_model,
      json_build_object(
        'count', count,
        'avg_version', avg_version
      )
    ) as model_breakdown
  FROM (
    SELECT
      embedding_model,
      COUNT(*)::INTEGER as count,
      AVG(embedding_version)::NUMERIC as avg_version
    FROM protocol_embeddings
    GROUP BY embedding_model
  ) model_stats;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_embedding_stats IS
 Get comprehensive statistics about protocol embeddings including model breakdown.';

-- =============================================================================
-- PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Analyze table to update statistics after adding columns
ANALYZE protocol_embeddings;

-- =============================================================================
-- MIGRATION VERIFICATION
-- =============================================================================

-- Verify all columns exist
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  SELECT array_agg(col) INTO missing_columns
  FROM (
    SELECT unnest(ARRAY['doc_id', 'embedding_model', 'embedding_version', 'content_preview']) AS col
  ) expected
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'protocol_embeddings' AND column_name = expected.col
  );

  IF missing_columns IS NOT NULL AND array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration failed: Missing columns: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'Migration successful: All columns added to protocol_embeddings';
  END IF;
END $$;

-- Verify function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'match_protocol_chunks'
  ) THEN
    RAISE EXCEPTION 'Migration failed: match_protocol_chunks function not created';
  ELSE
    RAISE NOTICE 'Migration successful: match_protocol_chunks function created';
  END IF;
END $$;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- This migration adds:
-- 1. New columns: doc_id, embedding_model, embedding_version, content_preview
-- 2. Unique constraint on (doc_id, embedding_model, embedding_version)
-- 3. Performance indexes for new columns
-- 4. match_protocol_chunks function for hybrid-search.ts
-- 5. Updated upsert function supporting new columns
-- 6. Helper functions for embedding management
-- 7. Enhanced statistics function
--
-- All changes are idempotent and can be safely re-run
-- =============================================================================
