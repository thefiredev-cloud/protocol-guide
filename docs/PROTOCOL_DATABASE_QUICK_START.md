# Protocol Database Quick Start Guide

Quick reference for common database operations after migrations 006, 007, 008.

---

## Common Queries

### Search for Protocols

```sql
-- Full-text search for protocols
SELECT * FROM search_protocols_fulltext('chest pain', 10);

-- Get protocol by TP code
SELECT * FROM get_current_protocol('1210');

-- Get protocol by provider impression
SELECT * FROM get_protocol_by_pi_code('CPMI');

-- Search by keyword array
SELECT * FROM protocols
WHERE keywords @> ARRAY['cardiac', 'arrest']
  AND is_current = TRUE
  AND deleted_at IS NULL;
```

### Protocol Details

```sql
-- Get complete protocol with all context
SELECT * FROM get_protocol_with_context('1210');

-- Get protocol medications
SELECT * FROM get_protocol_medications('1210');

-- Get protocol dependencies
SELECT
  dep_p.tp_code,
  dep_p.tp_name,
  pd.dependency_type,
  pd.description
FROM protocol_dependencies pd
JOIN protocols p ON p.id = pd.source_protocol_id
JOIN protocols dep_p ON dep_p.id = pd.target_protocol_id
WHERE p.tp_code = '1210'
  AND p.is_current = TRUE;
```

### Provider Impressions

```sql
-- List all current provider impressions
SELECT * FROM provider_impressions
WHERE is_current = TRUE
ORDER BY pi_code;

-- Search by symptom
SELECT * FROM provider_impressions
WHERE 'chest pain' = ANY(symptoms)
  AND is_current = TRUE;

-- Get provider impression with protocol details
SELECT * FROM pi_protocol_mapping
WHERE pi_code = 'CPMI';
```

### Usage Analytics

```sql
-- Most accessed protocols (last 30 days)
SELECT
  tp_code,
  tp_name,
  access_count,
  unique_users,
  last_accessed_at
FROM most_accessed_protocols
LIMIT 20;

-- Protocol performance metrics
SELECT * FROM get_protocol_performance_metrics('1210', 7);

-- Popular search terms
SELECT * FROM get_popular_search_terms(30, 20);

-- Search quality metrics
SELECT * FROM search_analytics
WHERE search_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY search_date DESC;
```

---

## Insert/Update Operations

### Record Protocol Usage

```sql
-- Record protocol view
SELECT record_protocol_usage(
  protocol_id := (SELECT id FROM protocols WHERE tp_code = '1210' LIMIT 1),
  tp_code := '1210',
  action_type := 'view',
  retrieval_time_ms := 15,
  source := 'chat',
  user_id := 'user_123',
  metadata := '{"query": "cardiac arrest"}'::jsonb
);
```

### Record Search Query

```sql
-- Log search query
SELECT record_protocol_search(
  query := 'chest pain',
  search_type := 'hybrid',
  results_count := 5,
  top_result_tp_code := '1211',
  top_result_score := 0.95,
  execution_time_ms := 25,
  user_id := 'user_123',
  metadata := '{"filters": {"category": "Cardiac"}}'::jsonb
);
```

### Update Protocol

```sql
-- Create new protocol version (admin only)
-- This will auto-create version history entry
UPDATE protocols
SET
  full_text = 'Updated protocol text...',
  version = version + 1,
  effective_date = CURRENT_DATE,
  updated_at = NOW()
WHERE tp_code = '1210'
  AND is_current = TRUE;
```

---

## Embedding Operations

### Check Embedding Status

```sql
-- Overall embedding coverage
SELECT * FROM embedding_coverage_stats;

-- Find chunks needing embeddings
SELECT * FROM get_chunks_needing_embeddings(100);

-- Find outdated embeddings
SELECT * FROM get_chunks_with_outdated_embeddings(100);
```

### Insert Embedding

```sql
-- Upsert embedding for a chunk
SELECT upsert_embedding(
  p_chunk_id := 'md:1210:abc123:s1:c1',
  p_protocol_id := (SELECT id FROM protocols WHERE tp_code = '1210' LIMIT 1),
  p_embedding := '[0.1, 0.2, ...]'::vector(1536),
  p_embedding_model := 'text-embedding-3-small',
  p_embedding_version := 1,
  p_content_preview := 'First 200 chars of content...',
  p_content_hash := 'sha256_hash'
);
```

### Vector Search

```sql
-- Search by embedding similarity
SELECT *
FROM search_protocols_vector(
  '[0.1, 0.2, ...]'::vector(1536),
  10,
  0.7
);

-- Hybrid search (full-text + vector)
SELECT *
FROM search_protocols_hybrid(
  'chest pain',
  '[0.1, 0.2, ...]'::vector(1536),
  10,
  0.4,  -- fulltext weight
  0.6   -- vector weight
);
```

---

## Maintenance Operations

### Refresh Analytics

```sql
-- Refresh all materialized views
SELECT refresh_protocol_analytics();
SELECT refresh_embedding_metrics();

-- Manual refresh specific view
REFRESH MATERIALIZED VIEW CONCURRENTLY most_accessed_protocols;
```

### Clean Up Old Data

```sql
-- Delete old usage stats (>90 days)
DELETE FROM protocol_usage_stats
WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete old search logs (>90 days)
DELETE FROM protocol_search_log
WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum tables
VACUUM ANALYZE protocols;
VACUUM ANALYZE protocol_chunks;
VACUUM ANALYZE protocol_embeddings;
```

### Performance Analysis

```sql
-- Check query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM search_protocols_fulltext('cardiac arrest', 10);

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'protocol%'
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'protocol%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Cache hit ratio
SELECT
  sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 AS cache_hit_ratio
FROM pg_statio_user_tables
WHERE schemaname = 'public';
```

---

## Monitoring Queries

### Health Check

```sql
-- Quick health check
SELECT
  (SELECT COUNT(*) FROM protocols WHERE is_current = TRUE) as active_protocols,
  (SELECT COUNT(*) FROM protocol_chunks) as total_chunks,
  (SELECT COUNT(*) FROM protocol_embeddings) as total_embeddings,
  (SELECT coverage_percent FROM embedding_coverage_stats) as embedding_coverage,
  (SELECT COUNT(*) FROM protocol_usage_stats WHERE created_at >= CURRENT_DATE) as usage_today;
```

### Error Detection

```sql
-- Check for failed operations in audit logs
SELECT
  action,
  resource,
  error_message,
  timestamp
FROM audit_logs
WHERE outcome = 'failure'
  AND timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

### Performance Monitoring

```sql
-- Protocol retrieval performance (last 24 hours)
SELECT
  tp_code,
  COUNT(*) as access_count,
  ROUND(AVG(retrieval_time_ms), 2) as avg_time_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY retrieval_time_ms), 2) as p95_time_ms
FROM protocol_usage_stats
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND retrieval_time_ms IS NOT NULL
GROUP BY tp_code
ORDER BY access_count DESC
LIMIT 20;
```

---

## Useful Views

```sql
-- Active protocols only
SELECT * FROM active_protocols;

-- Provider impressions with protocols
SELECT * FROM pi_protocol_mapping;

-- Embedding statistics
SELECT * FROM embedding_coverage_stats;
SELECT * FROM outdated_embeddings_summary;

-- Analytics
SELECT * FROM most_accessed_protocols LIMIT 20;
SELECT * FROM search_analytics WHERE search_date >= CURRENT_DATE - INTERVAL '7 days';
```

---

## Common Patterns

### Search and Track

```sql
-- 1. Search for protocols
WITH search_results AS (
  SELECT * FROM search_protocols_fulltext('chest pain', 10)
)
-- 2. Log the search
SELECT record_protocol_search(
  'chest pain',
  'fulltext',
  (SELECT COUNT(*) FROM search_results),
  (SELECT tp_code FROM search_results LIMIT 1),
  (SELECT rank FROM search_results LIMIT 1),
  15,
  'user_123'
);

-- 3. Return results
SELECT * FROM search_results;
```

### Get Protocol and Track Usage

```sql
-- 1. Get protocol with full context
WITH protocol AS (
  SELECT * FROM get_protocol_with_context('1210')
)
-- 2. Record usage
, usage AS (
  SELECT record_protocol_usage(
    (SELECT (protocol->>'id')::uuid FROM protocol),
    '1210',
    'view',
    12,
    'direct_access',
    'user_123'
  )
)
-- 3. Return protocol
SELECT * FROM protocol;
```

### Update Protocol Version

```sql
BEGIN;

-- 1. Archive current version
UPDATE protocols
SET is_current = FALSE
WHERE tp_code = '1210'
  AND is_current = TRUE;

-- 2. Insert new version
INSERT INTO protocols (
  tp_code,
  tp_name,
  tp_category,
  full_text,
  keywords,
  version,
  effective_date,
  is_current
)
VALUES (
  '1210',
  'Cardiac Arrest',
  'Cardiac',
  'Updated protocol text...',
  ARRAY['cardiac', 'arrest', 'cpr'],
  (SELECT MAX(version) + 1 FROM protocols WHERE tp_code = '1210'),
  CURRENT_DATE,
  TRUE
);

COMMIT;
```

---

## TypeScript/JavaScript Examples

### Using with Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Search protocols
const { data, error } = await supabase
  .rpc('search_protocols_fulltext', {
    p_query: 'chest pain',
    p_limit: 10
  });

// Get protocol by TP code
const { data: protocol } = await supabase
  .rpc('get_current_protocol', {
    p_tp_code: '1210'
  });

// Get protocol with context
const { data: fullProtocol } = await supabase
  .rpc('get_protocol_with_context', {
    p_tp_code: '1210'
  });

// Record usage
await supabase.rpc('record_protocol_usage', {
  p_protocol_id: protocol.id,
  p_tp_code: '1210',
  p_action_type: 'view',
  p_retrieval_time_ms: 15,
  p_source: 'chat',
  p_user_id: user.id,
  p_metadata: { query: 'cardiac arrest' }
});
```

### Direct PostgreSQL Connection

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Search protocols
const result = await pool.query(
  'SELECT * FROM search_protocols_fulltext($1, $2)',
  ['chest pain', 10]
);

// Get protocol with context
const protocol = await pool.query(
  'SELECT * FROM get_protocol_with_context($1)',
  ['1210']
);

// Record usage
await pool.query(
  'SELECT record_protocol_usage($1, $2, $3, $4, $5, $6, $7)',
  [protocolId, '1210', 'view', 15, 'chat', userId, JSON.stringify({ query: 'cardiac arrest' })]
);

await pool.end();
```

---

## Troubleshooting

### No Results from Search

```sql
-- Check if protocols exist
SELECT COUNT(*) FROM protocols WHERE is_current = TRUE;

-- Check if full-text index is being used
EXPLAIN SELECT * FROM search_protocols_fulltext('chest pain', 10);

-- Rebuild search statistics
ANALYZE protocols;
```

### Slow Query Performance

```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE tablename = 'protocols';

-- Update statistics
ANALYZE protocols;
ANALYZE protocol_chunks;

-- Check for missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename LIKE 'protocol%';
```

### Embedding Coverage Low

```sql
-- Check coverage
SELECT * FROM embedding_coverage_stats;

-- Find chunks needing embeddings
SELECT COUNT(*) FROM get_chunks_needing_embeddings();

-- Check for errors
SELECT * FROM audit_logs
WHERE resource LIKE '%embedding%'
  AND outcome = 'failure'
ORDER BY timestamp DESC;
```

---

**Document Version:** 1.0
**Last Updated:** November 4, 2025
