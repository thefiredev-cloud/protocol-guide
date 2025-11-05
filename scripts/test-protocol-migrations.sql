-- Migration Testing Script
-- Purpose: Validate migrations 006, 007, 008 are correctly applied
-- Usage: psql -f test-protocol-migrations.sql
-- Expected: All tests should pass with no errors

-- =============================================================================
-- TEST SETUP
-- =============================================================================

\set ON_ERROR_STOP on
\timing on

BEGIN;

-- Create a test results table
CREATE TEMP TABLE test_results (
  test_name TEXT,
  status TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to record test results
CREATE OR REPLACE FUNCTION record_test(p_test_name TEXT, p_status TEXT, p_details TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO test_results (test_name, status, details)
  VALUES (p_test_name, p_status, p_details);
  RAISE NOTICE '% - % %', p_test_name, p_status, COALESCE(': ' || p_details, '');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TEST 1: Verify all tables exist
-- =============================================================================

DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'protocols',
    'protocol_chunks',
    'provider_impressions',
    'protocol_embeddings',
    'medications',
    'protocol_medications',
    'protocol_dependencies',
    'protocol_version_history',
    'protocol_usage_stats',
    'protocol_search_log'
  ];
  v_table TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = v_table
    ) INTO v_exists;

    IF v_exists THEN
      PERFORM record_test('Table exists: ' || v_table, 'PASS');
    ELSE
      PERFORM record_test('Table exists: ' || v_table, 'FAIL', 'Table not found');
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- TEST 2: Verify all indexes exist
-- =============================================================================

DO $$
DECLARE
  v_expected_indexes TEXT[] := ARRAY[
    'idx_protocols_tp_code',
    'idx_protocols_current',
    'idx_protocols_fulltext',
    'idx_protocols_keywords',
    'idx_chunks_protocol_id',
    'idx_chunks_fulltext',
    'idx_embeddings_vector_hnsw',
    'idx_embeddings_chunk_id',
    'idx_medications_name',
    'idx_protocol_medications_protocol',
    'idx_usage_stats_protocol',
    'idx_search_log_query'
  ];
  v_index TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_index IN ARRAY v_expected_indexes LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = v_index
    ) INTO v_exists;

    IF v_exists THEN
      PERFORM record_test('Index exists: ' || v_index, 'PASS');
    ELSE
      PERFORM record_test('Index exists: ' || v_index, 'FAIL', 'Index not found');
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- TEST 3: Verify pgvector extension
-- =============================================================================

DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) INTO v_exists;

  IF v_exists THEN
    PERFORM record_test('Extension: pgvector', 'PASS');
  ELSE
    PERFORM record_test('Extension: pgvector', 'FAIL', 'pgvector extension not installed');
  END IF;
END $$;

-- =============================================================================
-- TEST 4: Verify all functions exist
-- =============================================================================

DO $$
DECLARE
  v_functions TEXT[] := ARRAY[
    'get_current_protocol',
    'search_protocols_fulltext',
    'search_protocols_vector',
    'search_protocols_hybrid',
    'get_protocol_with_context',
    'record_protocol_usage',
    'record_protocol_search',
    'get_protocol_medications',
    'upsert_embedding',
    'get_chunks_needing_embeddings'
  ];
  v_function TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_function IN ARRAY v_functions LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = v_function
    ) INTO v_exists;

    IF v_exists THEN
      PERFORM record_test('Function exists: ' || v_function, 'PASS');
    ELSE
      PERFORM record_test('Function exists: ' || v_function, 'FAIL', 'Function not found');
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- TEST 5: Verify all triggers exist
-- =============================================================================

DO $$
DECLARE
  v_triggers TEXT[] := ARRAY[
    'trigger_prevent_current_protocol_deletion',
    'trigger_protocols_updated_at',
    'trigger_ensure_single_current_protocol',
    'trigger_embeddings_updated_at',
    'trigger_protocol_version_history'
  ];
  v_trigger TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_trigger IN ARRAY v_triggers LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = v_trigger
    ) INTO v_exists;

    IF v_exists THEN
      PERFORM record_test('Trigger exists: ' || v_trigger, 'PASS');
    ELSE
      PERFORM record_test('Trigger exists: ' || v_trigger, 'FAIL', 'Trigger not found');
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- TEST 6: Verify RLS is enabled
-- =============================================================================

DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'protocols',
    'protocol_chunks',
    'provider_impressions',
    'protocol_embeddings',
    'medications',
    'protocol_usage_stats'
  ];
  v_table TEXT;
  v_rls_enabled BOOLEAN;
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    SELECT relrowsecurity INTO v_rls_enabled
    FROM pg_class
    WHERE relname = v_table AND relnamespace = 'public'::regnamespace;

    IF v_rls_enabled THEN
      PERFORM record_test('RLS enabled: ' || v_table, 'PASS');
    ELSE
      PERFORM record_test('RLS enabled: ' || v_table, 'FAIL', 'RLS not enabled');
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- TEST 7: Insert sample data and verify constraints
-- =============================================================================

DO $$
DECLARE
  v_protocol_id UUID;
  v_chunk_id TEXT;
  v_embedding_id UUID;
BEGIN
  -- Insert sample protocol
  INSERT INTO protocols (
    tp_code,
    tp_name,
    tp_category,
    full_text,
    keywords,
    chief_complaints,
    base_contact_required,
    version,
    effective_date,
    is_current
  )
  VALUES (
    'TEST-001',
    'Test Protocol',
    'Testing',
    'This is a test protocol for validation purposes.',
    ARRAY['test', 'validation'],
    ARRAY['test complaint'],
    FALSE,
    1,
    CURRENT_DATE,
    TRUE
  )
  RETURNING id INTO v_protocol_id;

  PERFORM record_test('Insert protocol', 'PASS', 'Protocol ID: ' || v_protocol_id);

  -- Insert sample chunk
  v_chunk_id := 'md:test:abc123:s1:c1';
  INSERT INTO protocol_chunks (
    id,
    protocol_id,
    tp_code,
    source_type,
    chunk_index,
    title,
    content,
    content_hash,
    category,
    keywords
  )
  VALUES (
    v_chunk_id,
    v_protocol_id,
    'TEST-001',
    'manual',
    1,
    'Test Chunk',
    'Test chunk content for validation.',
    'hash123',
    'Testing',
    ARRAY['test']
  );

  PERFORM record_test('Insert protocol chunk', 'PASS', 'Chunk ID: ' || v_chunk_id);

  -- Insert sample provider impression
  INSERT INTO provider_impressions (
    pi_code,
    pi_name,
    tp_code,
    category,
    keywords,
    version,
    is_current
  )
  VALUES (
    'TEST',
    'Test Impression',
    'TEST-001',
    'Testing',
    ARRAY['test'],
    1,
    TRUE
  );

  PERFORM record_test('Insert provider impression', 'PASS');

  -- Insert sample medication
  INSERT INTO medications (
    medication_name,
    medication_class,
    adult_dosing,
    routes,
    is_available
  )
  VALUES (
    'Test Medication',
    'Testing',
    '{"dose": "1mg", "max_dose": "10mg"}'::jsonb,
    ARRAY['IV'],
    TRUE
  );

  PERFORM record_test('Insert medication', 'PASS');

EXCEPTION WHEN OTHERS THEN
  PERFORM record_test('Insert sample data', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 8: Test full-text search functionality
-- =============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM search_protocols_fulltext('test', 10);

  IF v_count > 0 THEN
    PERFORM record_test('Full-text search', 'PASS', v_count || ' results');
  ELSE
    PERFORM record_test('Full-text search', 'FAIL', 'No results returned');
  END IF;

EXCEPTION WHEN OTHERS THEN
  PERFORM record_test('Full-text search', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 9: Test protocol context retrieval
-- =============================================================================

DO $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT * INTO v_result
  FROM get_protocol_with_context('TEST-001')
  LIMIT 1;

  IF v_result.protocol IS NOT NULL THEN
    PERFORM record_test('Get protocol with context', 'PASS');
  ELSE
    PERFORM record_test('Get protocol with context', 'FAIL', 'No data returned');
  END IF;

EXCEPTION WHEN OTHERS THEN
  PERFORM record_test('Get protocol with context', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 10: Test usage tracking
-- =============================================================================

DO $$
DECLARE
  v_protocol_id UUID;
  v_count INTEGER;
BEGIN
  SELECT id INTO v_protocol_id FROM protocols WHERE tp_code = 'TEST-001' LIMIT 1;

  PERFORM record_protocol_usage(
    v_protocol_id,
    'TEST-001',
    'view',
    25,
    'test',
    'test_user',
    '{"test": true}'::jsonb
  );

  SELECT COUNT(*) INTO v_count
  FROM protocol_usage_stats
  WHERE tp_code = 'TEST-001';

  IF v_count > 0 THEN
    PERFORM record_test('Record protocol usage', 'PASS', v_count || ' records');
  ELSE
    PERFORM record_test('Record protocol usage', 'FAIL', 'No usage recorded');
  END IF;

EXCEPTION WHEN OTHERS THEN
  PERFORM record_test('Record protocol usage', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 11: Test search logging
-- =============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  PERFORM record_protocol_search(
    'test query',
    'fulltext',
    5,
    'TEST-001',
    0.95,
    25,
    'test_user',
    '{}'::jsonb
  );

  SELECT COUNT(*) INTO v_count
  FROM protocol_search_log
  WHERE query = 'test query';

  IF v_count > 0 THEN
    PERFORM record_test('Record protocol search', 'PASS', v_count || ' records');
  ELSE
    PERFORM record_test('Record protocol search', 'FAIL', 'No search logged');
  END IF;

EXCEPTION WHEN OTHERS THEN
  PERFORM record_test('Record protocol search', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 12: Verify constraint enforcement
-- =============================================================================

DO $$
BEGIN
  -- Try to insert duplicate current protocol (should fail)
  INSERT INTO protocols (
    tp_code,
    tp_name,
    full_text,
    version,
    is_current
  )
  VALUES (
    'TEST-001',
    'Duplicate Test',
    'Should fail',
    2,
    TRUE
  );

  PERFORM record_test('Unique current protocol constraint', 'FAIL', 'Constraint not enforced');

EXCEPTION WHEN unique_violation THEN
  PERFORM record_test('Unique current protocol constraint', 'PASS', 'Duplicate prevented');
WHEN OTHERS THEN
  PERFORM record_test('Unique current protocol constraint', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 13: Verify trigger functionality
-- =============================================================================

DO $$
DECLARE
  v_updated_at_before TIMESTAMPTZ;
  v_updated_at_after TIMESTAMPTZ;
BEGIN
  SELECT updated_at INTO v_updated_at_before
  FROM protocols
  WHERE tp_code = 'TEST-001';

  -- Small delay to ensure timestamp difference
  PERFORM pg_sleep(0.1);

  UPDATE protocols
  SET keywords = ARRAY['test', 'validation', 'updated']
  WHERE tp_code = 'TEST-001';

  SELECT updated_at INTO v_updated_at_after
  FROM protocols
  WHERE tp_code = 'TEST-001';

  IF v_updated_at_after > v_updated_at_before THEN
    PERFORM record_test('Auto-update timestamp trigger', 'PASS');
  ELSE
    PERFORM record_test('Auto-update timestamp trigger', 'FAIL', 'Timestamp not updated');
  END IF;

EXCEPTION WHEN OTHERS THEN
  PERFORM record_test('Auto-update timestamp trigger', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 14: Test materialized views
-- =============================================================================

DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_matviews
    WHERE schemaname = 'public' AND matviewname = 'most_accessed_protocols'
  ) INTO v_exists;

  IF v_exists THEN
    PERFORM record_test('Materialized view: most_accessed_protocols', 'PASS');
  ELSE
    PERFORM record_test('Materialized view: most_accessed_protocols', 'FAIL', 'View not found');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM pg_matviews
    WHERE schemaname = 'public' AND matviewname = 'search_analytics'
  ) INTO v_exists;

  IF v_exists THEN
    PERFORM record_test('Materialized view: search_analytics', 'PASS');
  ELSE
    PERFORM record_test('Materialized view: search_analytics', 'FAIL', 'View not found');
  END IF;

EXCEPTION WHEN OTHERS THEN
  PERFORM record_test('Materialized views', 'FAIL', SQLERRM);
END $$;

-- =============================================================================
-- TEST 15: Verify views
-- =============================================================================

DO $$
DECLARE
  v_views TEXT[] := ARRAY[
    'active_protocols',
    'pi_protocol_mapping',
    'embedding_coverage_stats',
    'outdated_embeddings_summary'
  ];
  v_view TEXT;
  v_exists BOOLEAN;
BEGIN
  FOREACH v_view IN ARRAY v_views LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = v_view
    ) INTO v_exists;

    IF v_exists THEN
      PERFORM record_test('View exists: ' || v_view, 'PASS');
    ELSE
      PERFORM record_test('View exists: ' || v_view, 'FAIL', 'View not found');
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- DISPLAY RESULTS
-- =============================================================================

\echo ''
\echo '==============================================================================='
\echo 'TEST RESULTS SUMMARY'
\echo '==============================================================================='

SELECT
  status,
  COUNT(*) as count
FROM test_results
GROUP BY status
ORDER BY status;

\echo ''
\echo '==============================================================================='
\echo 'FAILED TESTS (if any)'
\echo '==============================================================================='

SELECT
  test_name,
  details,
  timestamp
FROM test_results
WHERE status = 'FAIL'
ORDER BY timestamp;

\echo ''
\echo '==============================================================================='
\echo 'DATABASE STATISTICS'
\echo '==============================================================================='

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'protocols', 'protocol_chunks', 'provider_impressions',
    'protocol_embeddings', 'medications', 'protocol_usage_stats'
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
\echo ''
\echo 'Index Usage Statistics:'
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'protocol%'
ORDER BY idx_scan DESC
LIMIT 10;

-- =============================================================================
-- CLEANUP
-- =============================================================================

-- Remove test data
DELETE FROM protocol_usage_stats WHERE tp_code = 'TEST-001';
DELETE FROM protocol_search_log WHERE query = 'test query';
DELETE FROM protocol_chunks WHERE tp_code = 'TEST-001';
DELETE FROM provider_impressions WHERE pi_code = 'TEST';
DELETE FROM protocols WHERE tp_code = 'TEST-001';
DELETE FROM medications WHERE medication_name = 'Test Medication';

ROLLBACK;

\echo ''
\echo '==============================================================================='
\echo 'MIGRATION TESTING COMPLETE'
\echo '==============================================================================='
\echo 'All test data has been rolled back (transaction not committed).'
\echo ''
