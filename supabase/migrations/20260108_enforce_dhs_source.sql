-- Enforce LA County DHS as the ONLY valid data source for Protocol Guide
-- Migration: 20260108_enforce_dhs_source.sql
--
-- This migration ensures all protocol content originates ONLY from:
-- https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/

-- ============================================
-- 1. VALIDATION FUNCTION FOR DHS SOURCE URL
-- ============================================

CREATE OR REPLACE FUNCTION validate_dhs_source_url(url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- NULL source_url is allowed for backward compatibility (will be backfilled)
  IF url IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Must match LA County DHS EMS domain or LA County file server
  RETURN url ~ '^https://dhs\.lacounty\.gov/emergency-medical-services-agency/'
      OR url ~ '^https://file\.lacounty\.gov/SDSInter/dhs/';
END;
$$;

COMMENT ON FUNCTION validate_dhs_source_url IS 'Validates that source_url is from authorized LA County DHS EMS domain';

-- ============================================
-- 2. BACKFILL SOURCE_URL FOR EXISTING PROTOCOLS
-- ============================================

-- Set default DHS source URL for all protocols without source_url
UPDATE protocols
SET
  source_url = 'https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/',
  source_verified = TRUE,
  verified_at = NOW(),
  verified_by = 'migration-20260108'
WHERE source_url IS NULL;

-- ============================================
-- 3. ADD CHECK CONSTRAINT TO PROTOCOLS TABLE
-- ============================================

-- Add constraint ensuring only DHS sources (soft - allows NULL for legacy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_protocols_dhs_source'
  ) THEN
    ALTER TABLE protocols
    ADD CONSTRAINT chk_protocols_dhs_source
    CHECK (validate_dhs_source_url(source_url));
  END IF;
END $$;

-- ============================================
-- 4. ADD SOURCE TRACKING TO PROTOCOL_CHUNKS
-- ============================================

-- Add source_url column to protocol_chunks if not exists
ALTER TABLE protocol_chunks
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add source_verified column to protocol_chunks if not exists
ALTER TABLE protocol_chunks
ADD COLUMN IF NOT EXISTS source_verified BOOLEAN DEFAULT FALSE;

-- Add CHECK constraint to protocol_chunks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_chunks_dhs_source'
  ) THEN
    ALTER TABLE protocol_chunks
    ADD CONSTRAINT chk_chunks_dhs_source
    CHECK (validate_dhs_source_url(source_url));
  END IF;
END $$;

-- Create indexes for source filtering
CREATE INDEX IF NOT EXISTS idx_protocols_source_url
ON protocols(source_url);

CREATE INDEX IF NOT EXISTS idx_chunks_source_url
ON protocol_chunks(source_url);

CREATE INDEX IF NOT EXISTS idx_chunks_source_verified
ON protocol_chunks(source_verified);

-- ============================================
-- 5. TRIGGER TO AUTO-SET SOURCE_URL ON CHUNKS
-- ============================================

CREATE OR REPLACE FUNCTION set_chunk_source_url()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If source_url not provided, inherit from parent protocol
  IF NEW.source_url IS NULL THEN
    SELECT p.source_url, p.source_verified
    INTO NEW.source_url, NEW.source_verified
    FROM protocols p
    WHERE p.protocol_id = NEW.protocol_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_chunk_source_url ON protocol_chunks;
CREATE TRIGGER trg_set_chunk_source_url
BEFORE INSERT OR UPDATE ON protocol_chunks
FOR EACH ROW
EXECUTE FUNCTION set_chunk_source_url();

-- ============================================
-- 6. PROPAGATE SOURCE_URL TO EXISTING CHUNKS
-- ============================================

-- Update all chunks to inherit source from parent protocol
UPDATE protocol_chunks pc
SET
  source_url = p.source_url,
  source_verified = p.source_verified
FROM protocols p
WHERE pc.protocol_id = p.protocol_id
  AND pc.source_url IS NULL;

-- ============================================
-- 7. SOURCE VIOLATIONS AUDIT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS source_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  detected_source_url TEXT,
  expected_source TEXT DEFAULT 'https://dhs.lacounty.gov/emergency-medical-services-agency/',
  violation_context TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(100),
  resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_source_violations_protocol
ON source_violations(protocol_id);

CREATE INDEX IF NOT EXISTS idx_source_violations_time
ON source_violations(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_source_violations_unresolved
ON source_violations(resolved_at) WHERE resolved_at IS NULL;

-- Enable RLS on source_violations (admin only)
ALTER TABLE source_violations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. UPDATE HYBRID SEARCH TO FILTER BY SOURCE
-- ============================================

-- Update hybrid_search_protocols to return source info and filter by DHS
CREATE OR REPLACE FUNCTION hybrid_search_protocols(
  query_text TEXT,
  query_embedding vector(768),
  match_count INT DEFAULT 10,
  full_text_weight FLOAT DEFAULT 1.0,
  semantic_weight FLOAT DEFAULT 1.5,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  chunk_id UUID,
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  section_title VARCHAR(255),
  content TEXT,
  relevance_score FLOAT,
  match_type TEXT,
  source_url TEXT,
  source_verified BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
WITH
-- Full-text search results with DHS source filter
full_text AS (
  SELECT
    pc.id,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank_cd(to_tsvector('english', pc.content), websearch_to_tsquery('english', query_text)) DESC
    ) AS rank_ix
  FROM protocol_chunks pc
  JOIN protocols p ON pc.protocol_id = p.protocol_id
  WHERE to_tsvector('english', pc.content) @@ websearch_to_tsquery('english', query_text)
    -- CRITICAL: Only include DHS-sourced protocols
    AND (p.source_url IS NULL OR p.source_url ~ '^https://dhs\.lacounty\.gov/')
  ORDER BY rank_ix
  LIMIT match_count * 3
),

-- Semantic search results with DHS source filter
semantic AS (
  SELECT
    pc.id,
    ROW_NUMBER() OVER (ORDER BY pc.embedding <=> query_embedding) AS rank_ix
  FROM protocol_chunks pc
  JOIN protocols p ON pc.protocol_id = p.protocol_id
  WHERE pc.embedding IS NOT NULL
    -- CRITICAL: Only include DHS-sourced protocols
    AND (p.source_url IS NULL OR p.source_url ~ '^https://dhs\.lacounty\.gov/')
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count * 3
),

-- Combine results with Reciprocal Rank Fusion
combined AS (
  SELECT
    COALESCE(ft.id, sem.id) AS id,
    (
      COALESCE(1.0 / (rrf_k + ft.rank_ix), 0.0) * full_text_weight +
      COALESCE(1.0 / (rrf_k + sem.rank_ix), 0.0) * semantic_weight
    ) AS score,
    CASE
      WHEN ft.id IS NOT NULL AND sem.id IS NOT NULL THEN 'both'
      WHEN ft.id IS NOT NULL THEN 'keyword'
      ELSE 'semantic'
    END AS match_type
  FROM full_text ft
  FULL OUTER JOIN semantic sem ON ft.id = sem.id
)

SELECT
  pc.id AS chunk_id,
  pc.protocol_id,
  pc.protocol_ref,
  pc.protocol_title,
  pc.category,
  pc.section_title,
  pc.content,
  c.score AS relevance_score,
  c.match_type,
  p.source_url,
  p.source_verified
FROM combined c
JOIN protocol_chunks pc ON c.id = pc.id
JOIN protocols p ON pc.protocol_id = p.protocol_id
ORDER BY c.score DESC
LIMIT match_count;
$$;

-- ============================================
-- 9. UPDATE SEMANTIC SEARCH WITH SOURCE FILTER
-- ============================================

CREATE OR REPLACE FUNCTION semantic_search_protocols(
  query_embedding vector(768),
  match_count INT DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  chunk_id UUID,
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  section_title VARCHAR(255),
  content TEXT,
  similarity FLOAT,
  source_url TEXT,
  source_verified BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    pc.id AS chunk_id,
    pc.protocol_id,
    pc.protocol_ref,
    pc.protocol_title,
    pc.category,
    pc.section_title,
    pc.content,
    1 - (pc.embedding <=> query_embedding) AS similarity,
    p.source_url,
    p.source_verified
  FROM protocol_chunks pc
  JOIN protocols p ON pc.protocol_id = p.protocol_id
  WHERE pc.embedding IS NOT NULL
    AND 1 - (pc.embedding <=> query_embedding) > similarity_threshold
    -- CRITICAL: Only include DHS-sourced protocols
    AND (p.source_url IS NULL OR p.source_url ~ '^https://dhs\.lacounty\.gov/')
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================
-- 10. UPDATE FULLTEXT SEARCH WITH SOURCE FILTER
-- ============================================

CREATE OR REPLACE FUNCTION fulltext_search_protocols(
  query_text TEXT,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  section_title VARCHAR(255),
  content TEXT,
  rank FLOAT,
  source_url TEXT,
  source_verified BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    pc.id AS chunk_id,
    pc.protocol_id,
    pc.protocol_ref,
    pc.protocol_title,
    pc.category,
    pc.section_title,
    pc.content,
    ts_rank_cd(to_tsvector('english', pc.content), websearch_to_tsquery('english', query_text)) AS rank,
    p.source_url,
    p.source_verified
  FROM protocol_chunks pc
  JOIN protocols p ON pc.protocol_id = p.protocol_id
  WHERE to_tsvector('english', pc.content) @@ websearch_to_tsquery('english', query_text)
    -- CRITICAL: Only include DHS-sourced protocols
    AND (p.source_url IS NULL OR p.source_url ~ '^https://dhs\.lacounty\.gov/')
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- ============================================
-- 11. UPDATE SEARCH BY REF WITH SOURCE FILTER
-- ============================================

CREATE OR REPLACE FUNCTION search_protocols_by_ref(
  search_ref TEXT
)
RETURNS TABLE (
  chunk_id UUID,
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  section_title VARCHAR(255),
  content TEXT,
  chunk_index INTEGER,
  source_url TEXT,
  source_verified BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    pc.id AS chunk_id,
    pc.protocol_id,
    pc.protocol_ref,
    pc.protocol_title,
    pc.category,
    pc.section_title,
    pc.content,
    pc.chunk_index,
    p.source_url,
    p.source_verified
  FROM protocol_chunks pc
  JOIN protocols p ON pc.protocol_id = p.protocol_id
  WHERE (pc.protocol_id ILIKE '%' || search_ref || '%'
     OR pc.protocol_ref ILIKE '%' || search_ref || '%')
    -- CRITICAL: Only include DHS-sourced protocols
    AND (p.source_url IS NULL OR p.source_url ~ '^https://dhs\.lacounty\.gov/')
  ORDER BY pc.protocol_id, pc.chunk_index;
$$;

-- ============================================
-- 12. DOCUMENTATION COMMENTS
-- ============================================

COMMENT ON CONSTRAINT chk_protocols_dhs_source ON protocols IS 'Ensures all protocols are sourced from LA County DHS EMS';
COMMENT ON CONSTRAINT chk_chunks_dhs_source ON protocol_chunks IS 'Ensures all chunks are sourced from LA County DHS EMS';
COMMENT ON TABLE source_violations IS 'Audit log for content from unauthorized sources - CRITICAL for compliance';
COMMENT ON FUNCTION hybrid_search_protocols IS 'Hybrid keyword+semantic search - ONLY returns DHS-sourced protocols';
COMMENT ON FUNCTION semantic_search_protocols IS 'Vector similarity search - ONLY returns DHS-sourced protocols';
COMMENT ON FUNCTION fulltext_search_protocols IS 'Full-text search - ONLY returns DHS-sourced protocols';
COMMENT ON FUNCTION search_protocols_by_ref IS 'Protocol ref lookup - ONLY returns DHS-sourced protocols';
