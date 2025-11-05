-- Protocol Query Performance Benchmark
-- Purpose: Measure query performance for protocol database operations
-- Target: <50ms for search queries, <10ms for direct lookups
-- Usage: psql -f benchmark-protocol-queries.sql

\set ON_ERROR_STOP on
\timing on

-- =============================================================================
-- BENCHMARK SETUP
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'PROTOCOL DATABASE PERFORMANCE BENCHMARK'
\echo '==============================================================================='
\echo ''

-- Create results table
CREATE TEMP TABLE benchmark_results (
  benchmark_name TEXT,
  iteration INTEGER,
  execution_time_ms NUMERIC,
  rows_returned INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BENCHMARK 1: Direct protocol lookup by TP code (Target: <10ms)
-- =============================================================================

\echo 'Benchmark 1: Direct protocol lookup by TP code (Target: <10ms)'
\echo '----------------------------------------------------------------'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_row_count INTEGER;
  v_iteration INTEGER;
BEGIN
  FOR v_iteration IN 1..10 LOOP
    v_start := clock_timestamp();

    SELECT COUNT(*) INTO v_row_count
    FROM protocols
    WHERE tp_code = '1210'
      AND is_current = TRUE
      AND deleted_at IS NULL;

    v_end := clock_timestamp();
    v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

    INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
    VALUES ('Direct TP code lookup', v_iteration, v_duration, v_row_count);
  END LOOP;
END $$;

-- =============================================================================
-- BENCHMARK 2: Full-text search (Target: <50ms)
-- =============================================================================

\echo ''
\echo 'Benchmark 2: Full-text search (Target: <50ms)'
\echo '----------------------------------------------'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_row_count INTEGER;
  v_iteration INTEGER;
BEGIN
  FOR v_iteration IN 1..10 LOOP
    v_start := clock_timestamp();

    SELECT COUNT(*) INTO v_row_count
    FROM search_protocols_fulltext('chest pain', 10);

    v_end := clock_timestamp();
    v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

    INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
    VALUES ('Full-text search', v_iteration, v_duration, v_row_count);
  END LOOP;
END $$;

-- =============================================================================
-- BENCHMARK 3: Vector similarity search (Target: <10ms)
-- =============================================================================

\echo ''
\echo 'Benchmark 3: Vector similarity search (Target: <10ms)'
\echo '------------------------------------------------------'
\echo '(Skipped if no embeddings exist)'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_row_count INTEGER;
  v_iteration INTEGER;
  v_test_embedding vector(1536);
  v_has_embeddings BOOLEAN;
BEGIN
  -- Check if embeddings exist
  SELECT EXISTS (SELECT 1 FROM protocol_embeddings LIMIT 1) INTO v_has_embeddings;

  IF v_has_embeddings THEN
    -- Get a sample embedding for testing
    SELECT embedding INTO v_test_embedding
    FROM protocol_embeddings
    LIMIT 1;

    FOR v_iteration IN 1..10 LOOP
      v_start := clock_timestamp();

      SELECT COUNT(*) INTO v_row_count
      FROM search_protocols_vector(v_test_embedding, 10, 0.7);

      v_end := clock_timestamp();
      v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

      INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
      VALUES ('Vector similarity search', v_iteration, v_duration, v_row_count);
    END LOOP;
  ELSE
    RAISE NOTICE 'Skipped: No embeddings found in database';
  END IF;
END $$;

-- =============================================================================
-- BENCHMARK 4: Protocol with context (Target: <20ms)
-- =============================================================================

\echo ''
\echo 'Benchmark 4: Get protocol with full context (Target: <20ms)'
\echo '------------------------------------------------------------'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_row_count INTEGER;
  v_iteration INTEGER;
BEGIN
  FOR v_iteration IN 1..10 LOOP
    v_start := clock_timestamp();

    SELECT COUNT(*) INTO v_row_count
    FROM get_protocol_with_context('1210');

    v_end := clock_timestamp();
    v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

    INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
    VALUES ('Protocol with context', v_iteration, v_duration, v_row_count);
  END LOOP;
END $$;

-- =============================================================================
-- BENCHMARK 5: Provider impression lookup (Target: <5ms)
-- =============================================================================

\echo ''
\echo 'Benchmark 5: Provider impression lookup (Target: <5ms)'
\echo '-------------------------------------------------------'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_row_count INTEGER;
  v_iteration INTEGER;
BEGIN
  FOR v_iteration IN 1..10 LOOP
    v_start := clock_timestamp();

    SELECT COUNT(*) INTO v_row_count
    FROM provider_impressions
    WHERE pi_code = 'CPMI'
      AND is_current = TRUE;

    v_end := clock_timestamp();
    v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

    INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
    VALUES ('Provider impression lookup', v_iteration, v_duration, v_row_count);
  END LOOP;
END $$;

-- =============================================================================
-- BENCHMARK 6: Protocol medications (Target: <15ms)
-- =============================================================================

\echo ''
\echo 'Benchmark 6: Get protocol medications (Target: <15ms)'
\echo '------------------------------------------------------'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_row_count INTEGER;
  v_iteration INTEGER;
BEGIN
  FOR v_iteration IN 1..10 LOOP
    v_start := clock_timestamp();

    SELECT COUNT(*) INTO v_row_count
    FROM get_protocol_medications('1210');

    v_end := clock_timestamp();
    v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

    INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
    VALUES ('Protocol medications', v_iteration, v_duration, v_row_count);
  END LOOP;
END $$;

-- =============================================================================
-- BENCHMARK 7: Complex aggregate query (Target: <100ms)
-- =============================================================================

\echo ''
\echo 'Benchmark 7: Complex aggregate - usage stats (Target: <100ms)'
\echo '--------------------------------------------------------------'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_row_count INTEGER;
  v_iteration INTEGER;
BEGIN
  FOR v_iteration IN 1..5 LOOP
    v_start := clock_timestamp();

    SELECT COUNT(*) INTO v_row_count
    FROM protocol_usage_stats
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY tp_code;

    v_end := clock_timestamp();
    v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

    INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
    VALUES ('Usage stats aggregate', v_iteration, v_duration, v_row_count);
  END LOOP;
END $$;

-- =============================================================================
-- BENCHMARK 8: Insert operations (Target: <5ms)
-- =============================================================================

\echo ''
\echo 'Benchmark 8: Insert protocol usage (Target: <5ms)'
\echo '--------------------------------------------------'

DO $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_duration NUMERIC;
  v_iteration INTEGER;
  v_protocol_id UUID;
BEGIN
  -- Get a sample protocol ID
  SELECT id INTO v_protocol_id
  FROM protocols
  WHERE is_current = TRUE
  LIMIT 1;

  FOR v_iteration IN 1..10 LOOP
    v_start := clock_timestamp();

    INSERT INTO protocol_usage_stats (protocol_id, tp_code, action_type, retrieval_time_ms)
    VALUES (v_protocol_id, '1210', 'view', 25);

    v_end := clock_timestamp();
    v_duration := EXTRACT(MILLISECONDS FROM (v_end - v_start));

    INSERT INTO benchmark_results (benchmark_name, iteration, execution_time_ms, rows_returned)
    VALUES ('Insert usage stat', v_iteration, v_duration, 1);
  END LOOP;

  -- Cleanup
  DELETE FROM protocol_usage_stats WHERE tp_code = '1210' AND action_type = 'view';
END $$;

-- =============================================================================
-- BENCHMARK RESULTS
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'BENCHMARK RESULTS SUMMARY'
\echo '==============================================================================='
\echo ''

-- Summary statistics
SELECT
  benchmark_name,
  COUNT(*) as iterations,
  ROUND(MIN(execution_time_ms), 2) as min_ms,
  ROUND(AVG(execution_time_ms), 2) as avg_ms,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY execution_time_ms), 2) as p50_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms), 2) as p95_ms,
  ROUND(MAX(execution_time_ms), 2) as max_ms,
  CASE
    WHEN benchmark_name LIKE '%lookup%' OR benchmark_name LIKE '%impression%' THEN
      CASE WHEN AVG(execution_time_ms) <= 10 THEN 'PASS' ELSE 'FAIL' END
    WHEN benchmark_name LIKE '%search%' OR benchmark_name LIKE '%context%' THEN
      CASE WHEN AVG(execution_time_ms) <= 50 THEN 'PASS' ELSE 'FAIL' END
    WHEN benchmark_name LIKE '%aggregate%' THEN
      CASE WHEN AVG(execution_time_ms) <= 100 THEN 'PASS' ELSE 'FAIL' END
    ELSE
      CASE WHEN AVG(execution_time_ms) <= 20 THEN 'PASS' ELSE 'FAIL' END
  END as status
FROM benchmark_results
GROUP BY benchmark_name
ORDER BY benchmark_name;

\echo ''
\echo '==============================================================================='
\echo 'PERFORMANCE TARGETS'
\echo '==============================================================================='
\echo 'Direct lookups:        <10ms  (TP code, provider impression)'
\echo 'Search operations:     <50ms  (full-text, vector, hybrid)'
\echo 'Context retrieval:     <20ms  (protocol with medications/dependencies)'
\echo 'Insert operations:     <5ms   (usage stats, search logs)'
\echo 'Aggregations:          <100ms (analytics queries)'
\echo ''

-- =============================================================================
-- INDEX USAGE ANALYSIS
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'INDEX USAGE STATISTICS'
\echo '==============================================================================='
\echo ''

SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 10 THEN 'LOW'
    WHEN idx_scan < 100 THEN 'MEDIUM'
    ELSE 'HIGH'
  END as usage_level
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND (tablename LIKE 'protocol%' OR tablename = 'medications' OR tablename = 'provider_impressions')
ORDER BY idx_scan DESC;

-- =============================================================================
-- QUERY PLAN ANALYSIS
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'SAMPLE QUERY PLANS'
\echo '==============================================================================='
\echo ''

\echo 'Query Plan: Direct TP code lookup'
\echo '----------------------------------'
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT *
FROM protocols
WHERE tp_code = '1210'
  AND is_current = TRUE
  AND deleted_at IS NULL;

\echo ''
\echo 'Query Plan: Full-text search'
\echo '----------------------------'
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  id,
  tp_code,
  tp_name,
  tp_category,
  ts_rank(
    to_tsvector('english', full_text || ' ' || tp_name),
    plainto_tsquery('english', 'chest pain')
  ) AS rank
FROM protocols
WHERE is_current = TRUE
  AND deleted_at IS NULL
  AND to_tsvector('english', full_text || ' ' || tp_name)
      @@ plainto_tsquery('english', 'chest pain')
ORDER BY rank DESC
LIMIT 10;

-- =============================================================================
-- DATABASE CACHE STATISTICS
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'DATABASE CACHE STATISTICS'
\echo '==============================================================================='
\echo ''

-- Cache hit ratio (should be >99%)
SELECT
  'Cache Hit Ratio' as metric,
  ROUND(
    sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100,
    2
  ) as percentage,
  CASE
    WHEN sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) > 0.99
      THEN 'EXCELLENT'
    WHEN sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) > 0.95
      THEN 'GOOD'
    ELSE 'POOR'
  END as status
FROM pg_statio_user_tables
WHERE schemaname = 'public';

-- =============================================================================
-- TABLE STATISTICS
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'TABLE STATISTICS'
\echo '==============================================================================='
\echo ''

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  CASE
    WHEN n_live_tup > 0 THEN ROUND((n_dead_tup::numeric / n_live_tup) * 100, 2)
    ELSE 0
  END as dead_row_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND (tablename LIKE 'protocol%' OR tablename IN ('medications', 'provider_impressions'))
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =============================================================================
-- RECOMMENDATIONS
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'PERFORMANCE RECOMMENDATIONS'
\echo '==============================================================================='
\echo ''

DO $$
DECLARE
  v_cache_hit_ratio NUMERIC;
  v_unused_indexes INTEGER;
  v_dead_rows INTEGER;
BEGIN
  -- Check cache hit ratio
  SELECT
    sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)
  INTO v_cache_hit_ratio
  FROM pg_statio_user_tables
  WHERE schemaname = 'public';

  IF v_cache_hit_ratio < 0.95 THEN
    RAISE NOTICE '⚠ Cache hit ratio is low (%.2f%%). Consider increasing shared_buffers.', v_cache_hit_ratio * 100;
  ELSE
    RAISE NOTICE '✓ Cache hit ratio is good (%.2f%%)', v_cache_hit_ratio * 100;
  END IF;

  -- Check for unused indexes
  SELECT COUNT(*) INTO v_unused_indexes
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
    AND idx_scan = 0
    AND tablename LIKE 'protocol%';

  IF v_unused_indexes > 0 THEN
    RAISE NOTICE '⚠ Found % unused indexes. Consider dropping them.', v_unused_indexes;
  ELSE
    RAISE NOTICE '✓ All indexes are being used';
  END IF;

  -- Check for dead rows
  SELECT SUM(n_dead_tup) INTO v_dead_rows
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND tablename LIKE 'protocol%';

  IF v_dead_rows > 1000 THEN
    RAISE NOTICE '⚠ Found % dead rows. Run VACUUM ANALYZE.', v_dead_rows;
  ELSE
    RAISE NOTICE '✓ Dead row count is acceptable';
  END IF;
END $$;

\echo ''
\echo '==============================================================================='
\echo 'BENCHMARK COMPLETE'
\echo '==============================================================================='
\echo ''
