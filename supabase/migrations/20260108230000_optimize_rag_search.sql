-- Optimize RAG Search Performance
-- Migration: 20260108230000_optimize_rag_search.sql
--
-- Performance optimizations for Protocol Guide RAG system:
-- 1. Partial indexes for verified chunks
-- 2. Trigram indexes for fuzzy text matching
-- 3. Optimized hybrid search with parallel CTEs
-- 4. Specialized medication search functions
-- 5. Criteria-based protocol lookup with caching hints
-- 6. Query plan optimizations

-- ============================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================

-- Enable pg_trgm for trigram similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- 2. OPTIMIZED INDEXES
-- ============================================

-- Partial index for source-verified chunks only (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_chunks_verified_with_embedding
ON protocol_chunks (protocol_id, category)
WHERE source_verified = true AND embedding IS NOT NULL;

-- Trigram index for fuzzy text matching on content
CREATE INDEX IF NOT EXISTS idx_chunks_content_trgm
ON protocol_chunks USING gin (content gin_trgm_ops);

-- Trigram index for protocol titles
CREATE INDEX IF NOT EXISTS idx_chunks_title_trgm
ON protocol_chunks USING gin (protocol_title gin_trgm_ops);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_chunks_category_section
ON protocol_chunks (category, section_type)
WHERE source_verified = true;

-- Partial index for high-value chunk types
CREATE INDEX IF NOT EXISTS idx_chunks_critical_sections
ON protocol_chunks (protocol_id, chunk_index)
WHERE section_type IN ('indications', 'contraindications', 'procedure', 'dosing')
  AND source_verified = true;

-- Index for medication chunk optimization
CREATE INDEX IF NOT EXISTS idx_chunks_medication_content
ON protocol_chunks (protocol_id)
WHERE category = 'Pharmacology' AND source_verified = true;

-- ============================================
-- 3. OPTIMIZED HYBRID SEARCH V2
-- Uses MATERIALIZED CTEs for better query planning
-- ============================================

CREATE OR REPLACE FUNCTION hybrid_search_protocols_v2(
  query_text TEXT,
  query_embedding vector(768),
  match_count INT DEFAULT 10,
  keyword_weight FLOAT DEFAULT 1.0,
  semantic_weight FLOAT DEFAULT 1.5,
  min_relevance FLOAT DEFAULT 0.01,
  verified_only BOOLEAN DEFAULT true,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  chunk_id UUID,
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  section_type VARCHAR(50),
  section_title VARCHAR(255),
  content TEXT,
  relevance_score FLOAT,
  keyword_score FLOAT,
  semantic_score FLOAT,
  match_type TEXT,
  source_url TEXT,
  source_verified BOOLEAN
)
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
WITH
-- Materialize full-text search results (runs in parallel)
full_text AS MATERIALIZED (
  SELECT
    pc.id,
    ts_rank_cd(
      to_tsvector('english', pc.content),
      websearch_to_tsquery('english', query_text),
      4  -- rank with cover density
    ) AS ft_score,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank_cd(
        to_tsvector('english', pc.content),
        websearch_to_tsquery('english', query_text),
        4
      ) DESC
    ) AS rank_ix
  FROM protocol_chunks pc
  WHERE to_tsvector('english', pc.content) @@ websearch_to_tsquery('english', query_text)
    AND (NOT verified_only OR pc.source_verified = true)
  ORDER BY ft_score DESC
  LIMIT match_count * 3
),

-- Materialize semantic search results (runs in parallel)
semantic AS MATERIALIZED (
  SELECT
    pc.id,
    (1 - (pc.embedding <=> query_embedding)) AS sem_score,
    ROW_NUMBER() OVER (ORDER BY pc.embedding <=> query_embedding) AS rank_ix
  FROM protocol_chunks pc
  WHERE pc.embedding IS NOT NULL
    AND (NOT verified_only OR pc.source_verified = true)
    AND (1 - (pc.embedding <=> query_embedding)) > min_relevance
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count * 3
),

-- Combine with Reciprocal Rank Fusion (RRF)
combined AS (
  SELECT
    COALESCE(ft.id, sem.id) AS id,
    COALESCE(ft.ft_score, 0.0) AS keyword_score,
    COALESCE(sem.sem_score, 0.0) AS semantic_score,
    (
      COALESCE(1.0 / (rrf_k + ft.rank_ix), 0.0) * keyword_weight +
      COALESCE(1.0 / (rrf_k + sem.rank_ix), 0.0) * semantic_weight
    ) AS rrf_score,
    CASE
      WHEN ft.id IS NOT NULL AND sem.id IS NOT NULL THEN 'hybrid'
      WHEN ft.id IS NOT NULL THEN 'keyword'
      ELSE 'semantic'
    END AS match_type
  FROM full_text ft
  FULL OUTER JOIN semantic sem ON ft.id = sem.id
  WHERE (
    COALESCE(1.0 / (rrf_k + ft.rank_ix), 0.0) * keyword_weight +
    COALESCE(1.0 / (rrf_k + sem.rank_ix), 0.0) * semantic_weight
  ) > min_relevance
)

SELECT
  pc.id AS chunk_id,
  pc.protocol_id,
  pc.protocol_ref,
  pc.protocol_title,
  pc.category,
  pc.section_type,
  pc.section_title,
  pc.content,
  c.rrf_score AS relevance_score,
  c.keyword_score,
  c.semantic_score,
  c.match_type,
  pc.source_url,
  pc.source_verified
FROM combined c
JOIN protocol_chunks pc ON c.id = pc.id
ORDER BY c.rrf_score DESC
LIMIT match_count;
$$;

-- ============================================
-- 4. FUZZY TEXT SIMILARITY SEARCH
-- Uses trigram similarity for typo-tolerant search
-- ============================================

CREATE OR REPLACE FUNCTION fuzzy_search_protocols(
  query_text TEXT,
  match_count INT DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  chunk_id UUID,
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  section_title VARCHAR(255),
  content TEXT,
  similarity_score FLOAT,
  match_type TEXT
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
    GREATEST(
      similarity(pc.content, query_text),
      similarity(pc.protocol_title, query_text)
    ) AS similarity_score,
    CASE
      WHEN similarity(pc.protocol_title, query_text) > similarity(pc.content, query_text)
        THEN 'title'
      ELSE 'content'
    END AS match_type
  FROM protocol_chunks pc
  WHERE pc.source_verified = true
    AND (
      similarity(pc.content, query_text) > similarity_threshold
      OR similarity(pc.protocol_title, query_text) > similarity_threshold
    )
  ORDER BY similarity_score DESC
  LIMIT match_count;
$$;

-- ============================================
-- 5. MEDICATION-SPECIFIC OPTIMIZED SEARCH
-- Specialized function for medication queries
-- ============================================

CREATE OR REPLACE FUNCTION search_medications_optimized(
  query_text TEXT,
  query_embedding vector(768) DEFAULT NULL,
  match_count INT DEFAULT 10,
  include_contraindicated BOOLEAN DEFAULT true
)
RETURNS TABLE (
  medication_id VARCHAR(50),
  name VARCHAR(255),
  brand_names TEXT[],
  classification VARCHAR(100),
  indications TEXT[],
  contraindications TEXT[],
  adult_dosing JSONB,
  pediatric_dosing JSONB,
  routes TEXT[],
  is_approved_formulary BOOLEAN,
  is_rsi_drug BOOLEAN,
  protocol_references TEXT[],
  relevance_score FLOAT,
  match_type TEXT
)
LANGUAGE sql
STABLE
AS $$
WITH
-- Keyword search on medications
keyword_search AS (
  SELECT
    m.medication_id,
    ts_rank_cd(
      to_tsvector('english',
        m.name || ' ' ||
        COALESCE(array_to_string(m.brand_names, ' '), '') || ' ' ||
        COALESCE(m.mechanism, '') || ' ' ||
        array_to_string(m.indications, ' ')
      ),
      websearch_to_tsquery('english', query_text)
    ) AS kw_score
  FROM medications m
  WHERE
    to_tsvector('english',
      m.name || ' ' ||
      COALESCE(array_to_string(m.brand_names, ' '), '') || ' ' ||
      COALESCE(m.mechanism, '') || ' ' ||
      array_to_string(m.indications, ' ')
    ) @@ websearch_to_tsquery('english', query_text)
    OR m.name ILIKE '%' || query_text || '%'
    OR query_text ILIKE '%' || m.name || '%'
  ORDER BY kw_score DESC
  LIMIT match_count * 2
),

-- Fuzzy name matching (handles typos)
fuzzy_search AS (
  SELECT
    m.medication_id,
    similarity(m.name, query_text) AS fuzzy_score
  FROM medications m
  WHERE similarity(m.name, query_text) > 0.3
  ORDER BY fuzzy_score DESC
  LIMIT match_count
),

-- Combine results
combined AS (
  SELECT
    COALESCE(ks.medication_id, fs.medication_id) AS medication_id,
    GREATEST(COALESCE(ks.kw_score, 0.0), COALESCE(fs.fuzzy_score, 0.0)) AS score,
    CASE
      WHEN ks.medication_id IS NOT NULL AND fs.medication_id IS NOT NULL THEN 'exact+fuzzy'
      WHEN ks.medication_id IS NOT NULL THEN 'keyword'
      ELSE 'fuzzy'
    END AS match_type
  FROM keyword_search ks
  FULL OUTER JOIN fuzzy_search fs ON ks.medication_id = fs.medication_id
)

SELECT
  m.medication_id,
  m.name,
  m.brand_names,
  m.classification,
  m.indications,
  m.contraindications,
  m.adult_dosing,
  m.pediatric_dosing,
  m.routes,
  m.is_approved_formulary,
  m.is_rsi_drug,
  m.protocol_references,
  c.score AS relevance_score,
  c.match_type
FROM combined c
JOIN medications m ON c.medication_id = m.medication_id
WHERE include_contraindicated OR m.is_approved_formulary = true
ORDER BY c.score DESC
LIMIT match_count;
$$;

-- ============================================
-- 6. CRITERIA-BASED PROTOCOL LOOKUP
-- Fast lookup by specific criteria (age, symptoms, conditions)
-- Includes query plan caching hints
-- ============================================

CREATE OR REPLACE FUNCTION search_protocols_by_criteria(
  patient_age_years INT DEFAULT NULL,
  symptoms TEXT[] DEFAULT NULL,
  conditions TEXT[] DEFAULT NULL,
  category_filter VARCHAR(100) DEFAULT NULL,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  protocol_type VARCHAR(50),
  icon VARCHAR(50),
  color VARCHAR(30),
  relevance_score FLOAT,
  matched_criteria TEXT[]
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH matched_protocols AS (
    SELECT DISTINCT ON (p.protocol_id)
      p.protocol_id,
      p.ref_no AS protocol_ref,
      p.title AS protocol_title,
      p.category,
      p.protocol_type,
      p.icon,
      p.color,
      -- Score based on criteria matches
      (
        CASE WHEN patient_age_years IS NOT NULL THEN
          CASE
            WHEN patient_age_years < 1 THEN
              CASE WHEN p.full_text_content ~* 'infant|neonate|newborn' THEN 2.0 ELSE 0.0 END
            WHEN patient_age_years < 12 THEN
              CASE WHEN p.full_text_content ~* 'pediatric|child|children' THEN 2.0 ELSE 0.0 END
            WHEN patient_age_years >= 65 THEN
              CASE WHEN p.full_text_content ~* 'geriatric|elderly' THEN 1.5 ELSE 0.0 END
            ELSE 1.0
          END
        ELSE 0.0 END +
        CASE WHEN symptoms IS NOT NULL THEN
          (SELECT COUNT(*) FROM unnest(symptoms) s
           WHERE p.full_text_content ~* s) * 3.0
        ELSE 0.0 END +
        CASE WHEN conditions IS NOT NULL THEN
          (SELECT COUNT(*) FROM unnest(conditions) c
           WHERE p.full_text_content ~* c) * 4.0
        ELSE 0.0 END
      ) AS relevance_score,
      -- Track which criteria matched
      (
        COALESCE(
          CASE WHEN patient_age_years IS NOT NULL AND patient_age_years < 12
            AND p.full_text_content ~* 'pediatric'
            THEN ARRAY['pediatric']
          ELSE ARRAY[]::TEXT[] END, ARRAY[]::TEXT[]
        ) ||
        COALESCE(
          CASE WHEN symptoms IS NOT NULL THEN
            ARRAY(SELECT unnest(symptoms) WHERE p.full_text_content ~* unnest(symptoms))
          ELSE ARRAY[]::TEXT[] END, ARRAY[]::TEXT[]
        ) ||
        COALESCE(
          CASE WHEN conditions IS NOT NULL THEN
            ARRAY(SELECT unnest(conditions) WHERE p.full_text_content ~* unnest(conditions))
          ELSE ARRAY[]::TEXT[] END, ARRAY[]::TEXT[]
        )
      ) AS matched_criteria
    FROM protocols p
    WHERE p.source_verified = true
      AND (category_filter IS NULL OR p.category = category_filter)
      AND (
        patient_age_years IS NULL
        OR symptoms IS NOT NULL
        OR conditions IS NOT NULL
      )
  )
  SELECT *
  FROM matched_protocols
  WHERE relevance_score > 0
  ORDER BY relevance_score DESC
  LIMIT match_count;
END;
$$;

-- ============================================
-- 7. PROTOCOL RECOMMENDATION ENGINE
-- Context-aware protocol suggestions
-- ============================================

CREATE OR REPLACE FUNCTION recommend_related_protocols(
  current_protocol_id VARCHAR(50),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  protocol_id VARCHAR(50),
  protocol_ref VARCHAR(50),
  protocol_title VARCHAR(500),
  category VARCHAR(100),
  relevance_score FLOAT,
  relation_type TEXT
)
LANGUAGE sql
STABLE
AS $$
WITH current_protocol AS (
  SELECT
    p.category,
    p.tags,
    pc.embedding
  FROM protocols p
  LEFT JOIN protocol_chunks pc ON pc.protocol_id = p.protocol_id
  WHERE p.protocol_id = current_protocol_id
  LIMIT 1
),
-- Find protocols in same category
category_matches AS (
  SELECT
    p.protocol_id,
    p.ref_no AS protocol_ref,
    p.title AS protocol_title,
    p.category,
    2.0 AS score,
    'same_category' AS relation_type
  FROM protocols p, current_protocol cp
  WHERE p.category = cp.category
    AND p.protocol_id != current_protocol_id
    AND p.source_verified = true
  LIMIT match_count * 2
),
-- Find protocols with similar embeddings
semantic_matches AS (
  SELECT
    pc.protocol_id,
    pc.protocol_ref,
    pc.protocol_title,
    pc.category,
    (1 - (pc.embedding <=> cp.embedding)) * 3.0 AS score,
    'semantic_similarity' AS relation_type
  FROM protocol_chunks pc, current_protocol cp
  WHERE pc.embedding IS NOT NULL
    AND cp.embedding IS NOT NULL
    AND pc.protocol_id != current_protocol_id
    AND pc.source_verified = true
  ORDER BY pc.embedding <=> cp.embedding
  LIMIT match_count * 2
),
-- Combine and deduplicate
combined AS (
  SELECT DISTINCT ON (protocol_id)
    protocol_id,
    protocol_ref,
    protocol_title,
    category,
    MAX(score) AS relevance_score,
    STRING_AGG(DISTINCT relation_type, ', ') AS relation_type
  FROM (
    SELECT * FROM category_matches
    UNION ALL
    SELECT * FROM semantic_matches
  ) all_matches
  GROUP BY protocol_id, protocol_ref, protocol_title, category
)
SELECT *
FROM combined
ORDER BY relevance_score DESC
LIMIT match_count;
$$;

-- ============================================
-- 8. SEARCH PERFORMANCE STATISTICS
-- Track and analyze search performance
-- ============================================

CREATE TABLE IF NOT EXISTS search_performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_function TEXT NOT NULL,
  query_text TEXT,
  embedding_provided BOOLEAN DEFAULT false,
  match_count INT,
  result_count INT,
  execution_time_ms FLOAT,
  cache_hit BOOLEAN DEFAULT false,
  filters_applied JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_perf_function ON search_performance_stats(search_function);
CREATE INDEX IF NOT EXISTS idx_search_perf_time ON search_performance_stats(execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_search_perf_created ON search_performance_stats(created_at DESC);

-- Enable RLS
ALTER TABLE search_performance_stats ENABLE ROW LEVEL SECURITY;

-- Admin-only access for performance monitoring
CREATE POLICY "search_perf_admin_only" ON search_performance_stats
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- 9. MATERIALIZED VIEW FOR PROTOCOL STATS
-- Pre-computed protocol popularity and quality
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS protocol_search_stats AS
SELECT
  p.protocol_id,
  p.ref_no,
  p.title,
  p.category,
  COUNT(DISTINCT cm.session_id) as search_count,
  AVG(cm.confidence) as avg_confidence,
  COUNT(DISTINCT uf.id) FILTER (WHERE uf.rating = 'positive') as positive_feedback_count,
  COUNT(DISTINCT uf.id) FILTER (WHERE uf.rating = 'negative') as negative_feedback_count,
  MAX(cm.created_at) as last_searched_at
FROM protocols p
LEFT JOIN chat_messages cm ON cm.protocols_referenced @> ARRAY[p.protocol_id]
LEFT JOIN user_feedback uf ON uf.message_id = cm.id::text
WHERE p.source_verified = true
GROUP BY p.protocol_id, p.ref_no, p.title, p.category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_protocol_search_stats_id
ON protocol_search_stats(protocol_id);

CREATE INDEX IF NOT EXISTS idx_protocol_search_stats_count
ON protocol_search_stats(search_count DESC);

-- Refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_protocol_search_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY protocol_search_stats;
END;
$$;

-- ============================================
-- 10. QUERY PLAN HINTS AND OPTIMIZATIONS
-- ============================================

-- Increase work_mem for complex RAG queries (session-level)
-- Application should call this before heavy search operations:
-- SELECT set_config('work_mem', '256MB', false);

-- Set better statistics target for frequently queried columns
ALTER TABLE protocol_chunks ALTER COLUMN content SET STATISTICS 1000;
ALTER TABLE protocol_chunks ALTER COLUMN category SET STATISTICS 100;
ALTER TABLE protocol_chunks ALTER COLUMN section_type SET STATISTICS 100;
ALTER TABLE medications ALTER COLUMN name SET STATISTICS 500;

-- Ensure autovacuum runs frequently on high-churn tables
ALTER TABLE chat_messages SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE protocol_chunks SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

-- ============================================
-- 11. COMMENTS AND DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION hybrid_search_protocols_v2 IS 'Optimized hybrid search with materialized CTEs, parallel execution, and configurable relevance threshold';
COMMENT ON FUNCTION fuzzy_search_protocols IS 'Trigram-based fuzzy search for typo-tolerant protocol lookup';
COMMENT ON FUNCTION search_medications_optimized IS 'Optimized medication search with keyword + fuzzy matching, supports brand names and contraindication filtering';
COMMENT ON FUNCTION search_protocols_by_criteria IS 'Criteria-based protocol lookup (age, symptoms, conditions) with relevance scoring';
COMMENT ON FUNCTION recommend_related_protocols IS 'Context-aware protocol recommendations based on category and semantic similarity';
COMMENT ON FUNCTION refresh_protocol_search_stats IS 'Refresh materialized view of protocol search statistics (run via cron)';

COMMENT ON INDEX idx_chunks_verified_with_embedding IS 'Partial index for verified chunks with embeddings - most common query pattern';
COMMENT ON INDEX idx_chunks_content_trgm IS 'Trigram GIN index for fuzzy text similarity search';
COMMENT ON INDEX idx_chunks_critical_sections IS 'Partial index for high-value protocol sections (indications, contraindications, procedures)';

COMMENT ON TABLE search_performance_stats IS 'Performance monitoring for search functions - track execution times and optimization opportunities';
COMMENT ON MATERIALIZED VIEW protocol_search_stats IS 'Pre-computed protocol popularity and quality metrics - refresh daily via cron';

-- ============================================
-- 12. INITIAL ANALYSIS AND STATS
-- ============================================

-- Force statistics update on key tables
ANALYZE protocols;
ANALYZE protocol_chunks;
ANALYZE medications;
ANALYZE medication_chunks;

-- Initial refresh of materialized view
SELECT refresh_protocol_search_stats();
