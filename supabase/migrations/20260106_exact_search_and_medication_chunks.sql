-- Protocol Guide: Exact Search Fix & Medication Chunks
-- Fixes fuzzy ILIKE matching and adds semantic search for medications
-- Migration: 20260106_exact_search_and_medication_chunks.sql

-- ============================================
-- 1. EXACT PROTOCOL SEARCH FUNCTION
-- Replaces fuzzy ILIKE with exact matching
-- ============================================

-- First, create the new exact search function
CREATE OR REPLACE FUNCTION search_protocols_by_ref_exact(
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
  match_quality TEXT
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
    CASE
      -- Exact matches (highest priority)
      WHEN pc.protocol_id = search_ref THEN 'exact_id'
      WHEN pc.protocol_ref = search_ref THEN 'exact_ref'
      -- Common format variations
      WHEN pc.protocol_id = 'TP-' || search_ref THEN 'tp_prefix'
      WHEN pc.protocol_ref = 'TP-' || search_ref THEN 'tp_prefix'
      WHEN pc.protocol_ref = 'Ref. ' || search_ref THEN 'ref_prefix'
      WHEN pc.protocol_ref = 'MCG ' || search_ref THEN 'mcg_prefix'
      -- Numeric extraction (e.g., "1201" matches "TP-1201")
      WHEN pc.protocol_id ~ ('^[A-Za-z-]*' || search_ref || '$') THEN 'suffix_match'
      ELSE 'partial'
    END AS match_quality
  FROM protocol_chunks pc
  WHERE
    -- Exact matches
    pc.protocol_id = search_ref
    OR pc.protocol_ref = search_ref
    -- With common prefixes
    OR pc.protocol_id = 'TP-' || search_ref
    OR pc.protocol_ref = 'TP-' || search_ref
    OR pc.protocol_ref = 'Ref. ' || search_ref
    OR pc.protocol_ref = 'MCG ' || search_ref
    -- Ends with the number (handles "TP-1201" when searching "1201")
    OR (search_ref ~ '^\d+$' AND pc.protocol_id ~ (search_ref || '$'))
  ORDER BY
    -- Prioritize exact matches
    CASE
      WHEN pc.protocol_id = search_ref THEN 1
      WHEN pc.protocol_ref = search_ref THEN 1
      WHEN pc.protocol_id = 'TP-' || search_ref THEN 2
      WHEN pc.protocol_ref = 'TP-' || search_ref THEN 2
      ELSE 3
    END,
    pc.chunk_index;
$$;

-- Update the original function to use stricter matching while maintaining backwards compatibility
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
  chunk_index INTEGER
)
LANGUAGE sql
STABLE
AS $$
  -- Use exact matching for numeric queries
  SELECT
    pc.id AS chunk_id,
    pc.protocol_id,
    pc.protocol_ref,
    pc.protocol_title,
    pc.category,
    pc.section_title,
    pc.content,
    pc.chunk_index
  FROM protocol_chunks pc
  WHERE
    -- For numeric-only queries, use exact suffix matching
    CASE WHEN search_ref ~ '^\d+$' THEN
      pc.protocol_id ~ (search_ref || '$')
      OR pc.protocol_ref ~ (search_ref || '$')
    ELSE
      -- For queries with text, allow bounded matching
      pc.protocol_id = search_ref
      OR pc.protocol_ref = search_ref
      OR pc.protocol_id = 'TP-' || search_ref
      OR pc.protocol_ref = 'TP-' || search_ref
      OR pc.protocol_ref ILIKE search_ref || '%'  -- Prefix match only, not contains
    END
  ORDER BY pc.protocol_id, pc.chunk_index;
$$;

-- ============================================
-- 2. MEDICATION CHUNKS TABLE
-- Enables semantic search for medications
-- ============================================

CREATE TABLE IF NOT EXISTS medication_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id VARCHAR(50) NOT NULL,
  medication_name VARCHAR(255) NOT NULL,
  chunk_type VARCHAR(50) NOT NULL,  -- 'overview', 'adult_dosing', 'pediatric_dosing', 'contraindications'
  patient_type VARCHAR(20),  -- 'adult', 'pediatric', 'all'
  content TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key reference (soft - medication_id is VARCHAR)
  CONSTRAINT fk_medication FOREIGN KEY (medication_id)
    REFERENCES medications(medication_id) ON DELETE CASCADE
);

-- Indexes for medication_chunks
CREATE INDEX IF NOT EXISTS idx_med_chunks_medication_id ON medication_chunks(medication_id);
CREATE INDEX IF NOT EXISTS idx_med_chunks_type ON medication_chunks(chunk_type);
CREATE INDEX IF NOT EXISTS idx_med_chunks_patient ON medication_chunks(patient_type);
CREATE INDEX IF NOT EXISTS idx_med_chunks_embedding ON medication_chunks
  USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_med_chunks_fts ON medication_chunks
  USING gin(to_tsvector('english', content));

-- ============================================
-- 3. HYBRID MEDICATION SEARCH
-- Combines keyword + semantic for medications
-- ============================================

CREATE OR REPLACE FUNCTION hybrid_search_medications(
  query_text TEXT,
  query_embedding vector(768),
  match_count INT DEFAULT 10,
  full_text_weight FLOAT DEFAULT 1.2,
  semantic_weight FLOAT DEFAULT 1.0,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  chunk_id UUID,
  medication_id VARCHAR(50),
  medication_name VARCHAR(255),
  chunk_type VARCHAR(50),
  patient_type VARCHAR(20),
  content TEXT,
  relevance_score FLOAT,
  match_type TEXT
)
LANGUAGE sql
STABLE
AS $$
WITH
-- Full-text search results
full_text AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank_cd(to_tsvector('english', content), websearch_to_tsquery('english', query_text)) DESC
    ) AS rank_ix
  FROM medication_chunks
  WHERE to_tsvector('english', content) @@ websearch_to_tsquery('english', query_text)
  ORDER BY rank_ix
  LIMIT match_count * 2
),

-- Semantic search results
semantic AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY embedding <=> query_embedding) AS rank_ix
  FROM medication_chunks
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count * 2
),

-- Combine with RRF
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
  mc.id AS chunk_id,
  mc.medication_id,
  mc.medication_name,
  mc.chunk_type,
  mc.patient_type,
  mc.content,
  c.score AS relevance_score,
  c.match_type
FROM combined c
JOIN medication_chunks mc ON c.id = mc.id
ORDER BY c.score DESC
LIMIT match_count;
$$;

-- ============================================
-- 4. RLS POLICIES FOR MEDICATION_CHUNKS
-- ============================================

ALTER TABLE medication_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_authenticated_med_chunks" ON medication_chunks
  FOR SELECT TO authenticated USING (true);

-- Allow service role full access for embedding generation
CREATE POLICY "service_role_med_chunks" ON medication_chunks
  FOR ALL TO service_role USING (true);

-- ============================================
-- 5. COMMENTS
-- ============================================

COMMENT ON FUNCTION search_protocols_by_ref_exact IS 'Exact protocol matching with quality indicators - prevents false positives';
COMMENT ON FUNCTION hybrid_search_medications IS 'Hybrid keyword+semantic search for medication chunks';
COMMENT ON TABLE medication_chunks IS 'Chunked medication content for semantic search (dosing, indications, etc.)';
