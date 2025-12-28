-- Verify ImageTrend tables exist and have correct structure
\echo 'Checking imagetrend_connections table...'
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'imagetrend_connections'
ORDER BY ordinal_position;

\echo '\nChecking protocol_pcr_links table...'
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'protocol_pcr_links'
ORDER BY ordinal_position;

\echo '\nChecking RLS policies on imagetrend_connections...'
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'imagetrend_connections';

\echo '\nChecking RLS policies on protocol_pcr_links...'
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'protocol_pcr_links';

\echo '\nChecking indexes on imagetrend_connections...'
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'imagetrend_connections';

\echo '\nChecking indexes on protocol_pcr_links...'
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'protocol_pcr_links';
