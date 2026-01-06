-- Hybrid Search Functions for Protocol Guide RAG
-- Combines keyword (full-text) + semantic (vector) search
-- Uses Reciprocal Rank Fusion for result merging

-- ============================================
-- SEMANTIC SEARCH FUNCTION
-- Vector similarity search using pgvector
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
  similarity FLOAT
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
    1 - (pc.embedding <=> query_embedding) AS similarity
  FROM protocol_chunks pc
  WHERE pc.embedding IS NOT NULL
    AND 1 - (pc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================
-- FULL-TEXT SEARCH FUNCTION
-- PostgreSQL ts_vector keyword search
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
  rank FLOAT
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
    ts_rank_cd(to_tsvector('english', pc.content), websearch_to_tsquery('english', query_text)) AS rank
  FROM protocol_chunks pc
  WHERE to_tsvector('english', pc.content) @@ websearch_to_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- ============================================
-- HYBRID SEARCH FUNCTION
-- Combines keyword + semantic with Reciprocal Rank Fusion
-- ============================================
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
  match_type TEXT
)
LANGUAGE sql
STABLE
AS $$
WITH
-- Full-text search results with ranking
full_text AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank_cd(to_tsvector('english', content), websearch_to_tsquery('english', query_text)) DESC
    ) AS rank_ix
  FROM protocol_chunks
  WHERE to_tsvector('english', content) @@ websearch_to_tsquery('english', query_text)
  ORDER BY rank_ix
  LIMIT match_count * 3
),

-- Semantic search results with ranking
semantic AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY embedding <=> query_embedding) AS rank_ix
  FROM protocol_chunks
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
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
  c.match_type
FROM combined c
JOIN protocol_chunks pc ON c.id = pc.id
ORDER BY c.score DESC
LIMIT match_count;
$$;

-- ============================================
-- SEARCH PROTOCOLS BY REFERENCE
-- Direct lookup by protocol ID or ref_no
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
  chunk_index INTEGER
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
    pc.chunk_index
  FROM protocol_chunks pc
  WHERE pc.protocol_id ILIKE '%' || search_ref || '%'
     OR pc.protocol_ref ILIKE '%' || search_ref || '%'
  ORDER BY pc.protocol_id, pc.chunk_index;
$$;

-- ============================================
-- SEARCH MEDICATIONS
-- Full-text search on medications table
-- ============================================
CREATE OR REPLACE FUNCTION search_medications(
  query_text TEXT,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  medication_id VARCHAR(50),
  name VARCHAR(255),
  classification VARCHAR(100),
  indications TEXT[],
  contraindications TEXT[],
  adult_dosing JSONB,
  pediatric_dosing JSONB,
  routes TEXT[],
  is_approved_formulary BOOLEAN,
  rank FLOAT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    m.medication_id,
    m.name,
    m.classification,
    m.indications,
    m.contraindications,
    m.adult_dosing,
    m.pediatric_dosing,
    m.routes,
    m.is_approved_formulary,
    ts_rank_cd(
      to_tsvector('english', m.name || ' ' || COALESCE(m.mechanism, '') || ' ' || array_to_string(m.indications, ' ')),
      websearch_to_tsquery('english', query_text)
    ) AS rank
  FROM medications m
  WHERE
    to_tsvector('english', m.name || ' ' || COALESCE(m.mechanism, '') || ' ' || array_to_string(m.indications, ' '))
    @@ websearch_to_tsquery('english', query_text)
    OR m.name ILIKE '%' || query_text || '%'
  ORDER BY rank DESC, m.name
  LIMIT match_count;
$$;

-- ============================================
-- GET PROTOCOL BY ID (full protocol with all sections)
-- ============================================
CREATE OR REPLACE FUNCTION get_protocol_by_id(
  p_protocol_id VARCHAR(50)
)
RETURNS TABLE (
  id UUID,
  protocol_id VARCHAR(50),
  ref_no VARCHAR(50),
  title VARCHAR(500),
  category VARCHAR(100),
  protocol_type VARCHAR(50),
  sections JSONB,
  last_updated DATE,
  source_verified BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.protocol_id,
    p.ref_no,
    p.title,
    p.category,
    p.protocol_type,
    p.sections,
    p.last_updated,
    p.source_verified
  FROM protocols p
  WHERE p.protocol_id = p_protocol_id
  LIMIT 1;
$$;

-- ============================================
-- LIST PROTOCOLS BY CATEGORY
-- For Browse page
-- ============================================
CREATE OR REPLACE FUNCTION list_protocols_by_category(
  p_category VARCHAR(100) DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  protocol_id VARCHAR(50),
  ref_no VARCHAR(50),
  title VARCHAR(500),
  category VARCHAR(100),
  protocol_type VARCHAR(50),
  icon VARCHAR(50),
  color VARCHAR(30),
  last_updated DATE
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.protocol_id,
    p.ref_no,
    p.title,
    p.category,
    p.protocol_type,
    p.icon,
    p.color,
    p.last_updated
  FROM protocols p
  WHERE p_category IS NULL OR p.category = p_category
  ORDER BY
    CASE WHEN p.category = 'Pharmacology' THEN 0 ELSE 1 END,
    p.ref_no
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- ============================================
-- GET PROTOCOL CATEGORIES
-- For filter dropdown
-- ============================================
CREATE OR REPLACE FUNCTION get_protocol_categories()
RETURNS TABLE (
  category VARCHAR(100),
  count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.category,
    COUNT(*) AS count
  FROM protocols p
  GROUP BY p.category
  ORDER BY
    CASE WHEN p.category = 'Pharmacology' THEN 0 ELSE 1 END,
    p.category;
$$;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION hybrid_search_protocols IS 'Combines keyword and semantic search with Reciprocal Rank Fusion for optimal retrieval';
COMMENT ON FUNCTION semantic_search_protocols IS 'Vector similarity search using pgvector embeddings';
COMMENT ON FUNCTION fulltext_search_protocols IS 'PostgreSQL full-text search using ts_vector';
COMMENT ON FUNCTION search_protocols_by_ref IS 'Direct lookup by protocol ID or reference number';
COMMENT ON FUNCTION search_medications IS 'Search medications by name, indication, or classification';
