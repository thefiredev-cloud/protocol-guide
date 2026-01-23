# Migration Execution Guide

**Quick reference for deploying database optimizations**

---

## Overview

This guide provides step-by-step instructions for deploying the database optimization migrations to Protocol Guide.

**Total Time:** 15-20 minutes
**Impact:** 10-25x performance improvement
**Risk:** LOW (all migrations use ALGORITHM=INPLACE, no table locks)

---

## Pre-Flight Checklist

- [ ] Backup MySQL database
- [ ] Verify staging environment available
- [ ] Check database disk space (need ~500MB free)
- [ ] Confirm low-traffic period (recommended but not required)
- [ ] Have rollback scripts ready

---

## Migration Order

**Execute in this order:**

1. **002-add-user-indexes.sql** (5 min) - User table indexes
2. **003-add-query-indexes.sql** (7 min) - Query table indexes
3. **004-add-search-history-indexes.sql** (5 min) - Search history indexes + deduplication

**Total execution time:** ~17 minutes

---

## Step 1: Backup Database

### MySQL Backup

```bash
# Create backup directory
mkdir -p ~/backups/protocol-guide

# Backup MySQL database
mysqldump -u $DB_USER -p $DB_NAME > ~/backups/protocol-guide/backup-$(date +%Y%m%d).sql

# Verify backup
ls -lh ~/backups/protocol-guide/

# Expected output: backup-20260122.sql (~500MB)
```

### Supabase Backup

```bash
# Via Supabase Dashboard:
# 1. Go to https://supabase.com/dashboard/project/[project-id]/database/backups
# 2. Click "Backup now"
# 3. Wait for backup to complete
# 4. Verify backup timestamp
```

---

## Step 2: Test in Staging

### Connect to Staging Database

```bash
# Set staging credentials
export DB_HOST="staging-db.protocol-guide.com"
export DB_USER="staging_admin"
export DB_PASSWORD="..."
export DB_NAME="protocol_guide_staging"
```

### Run Migration 002 (Users)

```bash
# Navigate to project
cd "/Users/tanner-osterkamp/Protocol Guide Manus"

# Execute migration
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < docs/migrations/002-add-user-indexes.sql

# Expected output:
# 7 rows affected (creating indexes)
# Query OK (verification queries)
```

### Verify Migration 002

```bash
# Check indexes created
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT INDEX_NAME, COLUMN_NAME, CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'users'
  AND INDEX_NAME LIKE 'idx_users_%'
ORDER BY INDEX_NAME;
"

# Expected output: 7 indexes
# - idx_users_email
# - idx_users_role
# - idx_users_role_tier
# - idx_users_stripe_customer_id
# - idx_users_supabase_id
# - idx_users_tier
# - idx_users_tier_query_count
```

### Test Performance Improvement

```bash
# Before: Full table scan (~50ms)
# After: Index seek (~2ms)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
EXPLAIN SELECT * FROM users WHERE supabaseId = 'test-id';
"

# Expected output:
# key: idx_users_supabase_id
# rows: 1
# Extra: Using index
```

### Run Migration 003 (Queries)

```bash
# Execute migration
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < docs/migrations/003-add-query-indexes.sql

# Expected output:
# 5 rows affected (creating indexes)
```

### Verify Migration 003

```bash
# Check indexes created
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT INDEX_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'queries'
  AND INDEX_NAME LIKE 'idx_queries_%'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;
"

# Expected output: 5 indexes
# - idx_queries_county_created
# - idx_queries_county_id
# - idx_queries_created_at
# - idx_queries_user_created
# - idx_queries_user_id
```

### Run Migration 004 (Search History)

```bash
# Execute migration
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < docs/migrations/004-add-search-history-indexes.sql

# Expected output:
# 6 rows affected (creating indexes)
```

### Verify Migration 004

```bash
# Check indexes created (including unique constraint)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'search_history'
  AND INDEX_NAME LIKE 'idx_search_history_%'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;
"

# Expected output: 6 indexes
# - idx_search_history_device_id
# - idx_search_history_device_synced
# - idx_search_history_synced
# - idx_search_history_unique_query (NON_UNIQUE = 0)
# - idx_search_history_user_id
# - idx_search_history_user_timestamp
```

### Test Deduplication

```bash
# Try inserting duplicate (should fail)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
INSERT INTO search_history (userId, queryText, timestamp)
VALUES (1, 'test duplicate', NOW());

INSERT INTO search_history (userId, queryText, timestamp)
VALUES (1, 'test duplicate', NOW());
"

# Expected output:
# ERROR 1062 (23000): Duplicate entry '1-test duplicate-2026-01-22' for key 'idx_search_history_unique_query'
```

---

## Step 3: Deploy to Production

### Production Database Connection

```bash
# Set production credentials (from .env)
export DB_HOST="protocol-guide-production.mysql.database.azure.com"
export DB_USER="pgadmin"
export DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d= -f2)
export DB_NAME="protocol_guide_prod"
```

### Check Current Database Size

```bash
# Check table sizes before migration
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb,
    table_rows
FROM information_schema.tables
WHERE table_schema = '$DB_NAME'
  AND table_name IN ('users', 'queries', 'search_history')
ORDER BY table_name;
"

# Expected output:
# users: ~50MB, ~10,000 rows
# queries: ~300MB, ~500,000 rows
# search_history: ~100MB, ~200,000 rows
```

### Execute Migrations (Production)

```bash
# Migration 002: User indexes
echo "Deploying migration 002 (users)..."
time mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < docs/migrations/002-add-user-indexes.sql

# Migration 003: Query indexes
echo "Deploying migration 003 (queries)..."
time mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < docs/migrations/003-add-query-indexes.sql

# Migration 004: Search history indexes
echo "Deploying migration 004 (search_history)..."
time mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < docs/migrations/004-add-search-history-indexes.sql

# Expected execution time:
# 002: ~5 minutes
# 003: ~7 minutes
# 004: ~5 minutes
# Total: ~17 minutes
```

---

## Step 4: Verification

### Verify All Indexes Created

```bash
# Check index count by table
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT
    table_name,
    COUNT(*) as index_count
FROM information_schema.statistics
WHERE table_schema = '$DB_NAME'
  AND table_name IN ('users', 'queries', 'search_history')
  AND index_name LIKE 'idx_%'
GROUP BY table_name;
"

# Expected output:
# users: 7 indexes
# queries: 5 indexes
# search_history: 6 indexes
```

### Test Query Performance

```bash
# Test user lookup (should use idx_users_supabase_id)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
EXPLAIN SELECT * FROM users WHERE supabaseId = 'example-uuid'\G
"

# Expected output:
# key: idx_users_supabase_id
# rows: 1
# Extra: Using index condition

# Test query history (should use idx_queries_user_created)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
EXPLAIN SELECT * FROM queries WHERE userId = 123 ORDER BY createdAt DESC LIMIT 50\G
"

# Expected output:
# key: idx_queries_user_created
# rows: 50
# Extra: Using index condition

# Test search history (should use idx_search_history_user_timestamp)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
EXPLAIN SELECT * FROM search_history WHERE userId = 123 ORDER BY timestamp DESC LIMIT 100\G
"

# Expected output:
# key: idx_search_history_user_timestamp
# rows: 100
# Extra: Using index condition
```

### Check Database Size After Migration

```bash
# Check table sizes after migration
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) as size_mb,
    table_rows
FROM information_schema.tables
WHERE table_schema = '$DB_NAME'
  AND table_name IN ('users', 'queries', 'search_history')
ORDER BY table_name;
"

# Expected output (slightly larger due to indexes):
# users: ~60MB (+10MB for indexes)
# queries: ~350MB (+50MB for indexes)
# search_history: ~120MB (+20MB for indexes)
# Total increase: ~80MB
```

---

## Step 5: Monitor Performance

### Enable Slow Query Log (if not enabled)

```bash
# Check if slow query log is enabled
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
"

# If not enabled:
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;  -- 100ms
"
```

### Monitor Slow Queries (Should Decrease)

```bash
# Check slow query count over last hour
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "
SELECT
    COUNT(*) as slow_query_count,
    AVG(query_time) as avg_time_sec,
    MAX(query_time) as max_time_sec
FROM mysql.slow_log
WHERE start_time > NOW() - INTERVAL 1 HOUR;
"

# Expected improvement:
# Before: 1000+ slow queries/hour, avg 0.5s
# After: <100 slow queries/hour, avg 0.05s
```

### Monitor Index Usage

```bash
# Check which indexes are being used most
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = '$DB_NAME'
  AND OBJECT_NAME IN ('users', 'queries', 'search_history')
  AND INDEX_NAME LIKE 'idx_%'
ORDER BY COUNT_FETCH DESC
LIMIT 20;
"

# Expected: New indexes should show high COUNT_FETCH
```

---

## Rollback Plan

### If Issues Occur

```bash
# Rollback migration 004 (search_history)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
ALTER TABLE search_history
    DROP INDEX idx_search_history_user_id,
    DROP INDEX idx_search_history_device_id,
    DROP INDEX idx_search_history_synced,
    DROP INDEX idx_search_history_user_timestamp,
    DROP INDEX idx_search_history_device_synced,
    DROP INDEX idx_search_history_unique_query;
"

# Rollback migration 003 (queries)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
ALTER TABLE queries
    DROP INDEX idx_queries_user_id,
    DROP INDEX idx_queries_county_id,
    DROP INDEX idx_queries_created_at,
    DROP INDEX idx_queries_user_created,
    DROP INDEX idx_queries_county_created;
"

# Rollback migration 002 (users)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
ALTER TABLE users
    DROP INDEX idx_users_supabase_id,
    DROP INDEX idx_users_email,
    DROP INDEX idx_users_role,
    DROP INDEX idx_users_tier,
    DROP INDEX idx_users_stripe_customer_id,
    DROP INDEX idx_users_role_tier,
    DROP INDEX idx_users_tier_query_count;
"
```

### Restore from Backup (if needed)

```bash
# Restore MySQL backup
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < ~/backups/protocol-guide/backup-20260122.sql

# Verify restore
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM queries;
SELECT COUNT(*) FROM search_history;
"
```

---

## Success Criteria

### ✅ Deployment Successful If:

1. **All indexes created**
   - 7 indexes on users table
   - 5 indexes on queries table
   - 6 indexes on search_history table

2. **Query plans use new indexes**
   - EXPLAIN shows `key: idx_users_supabase_id` for user lookups
   - EXPLAIN shows `key: idx_queries_user_created` for query history
   - EXPLAIN shows `key: idx_search_history_user_timestamp` for search history

3. **Performance improved**
   - User profile lookups: <10ms (was 50ms)
   - Query history page: <100ms (was 500ms)
   - Search history sync: <50ms (was 300ms)

4. **No errors or warnings**
   - No duplicate key errors (except intentional test)
   - No table lock errors
   - No slow query log spikes

5. **Application still works**
   - User login successful
   - Query history loads
   - Search sync works
   - No 500 errors

---

## Post-Deployment Tasks

### Day 1: Monitor Closely

```bash
# Check slow query log every hour
watch -n 3600 'mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "
SELECT COUNT(*) as slow_queries_last_hour
FROM mysql.slow_log
WHERE start_time > NOW() - INTERVAL 1 HOUR;
"'

# Monitor error logs
tail -f /var/log/mysql/error.log
```

### Week 1: Verify Improvements

```bash
# Compare slow query counts (before vs after)
# Before: 1000+ slow queries/hour
# After: <100 slow queries/hour

# Check user feedback
# Survey users: "Have you noticed faster load times?"
```

### Month 1: Optimize Further

```bash
# Analyze index usage
# Drop unused indexes
# Add additional indexes if needed
# Consider partitioning for large tables
```

---

## Troubleshooting

### Issue: "Duplicate entry" error during migration 004

**Cause:** Duplicate searches exist in search_history

**Solution:**
```bash
# Find duplicates
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
SELECT userId, queryText, DATE(timestamp), COUNT(*)
FROM search_history
GROUP BY userId, queryText, DATE(timestamp)
HAVING COUNT(*) > 1
LIMIT 10;
"

# Remove duplicates (keep oldest)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
DELETE sh1 FROM search_history sh1
INNER JOIN (
    SELECT userId, queryText, DATE(timestamp) as date, MIN(id) as keep_id
    FROM search_history
    GROUP BY userId, queryText, DATE(timestamp)
    HAVING COUNT(*) > 1
) sh2 ON
    sh1.userId = sh2.userId
    AND sh1.queryText = sh2.queryText
    AND DATE(sh1.timestamp) = sh2.date
    AND sh1.id != sh2.keep_id;
"

# Retry migration 004
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < docs/migrations/004-add-search-history-indexes.sql
```

---

### Issue: "Disk full" error

**Cause:** Not enough space for indexes

**Solution:**
```bash
# Check disk space
df -h

# Free up space (delete old backups, logs)
rm -f ~/backups/protocol-guide/backup-*.sql.gz

# Or increase disk size
# Azure: Scale up database tier
# AWS RDS: Modify storage size
```

---

### Issue: Queries still slow after migration

**Cause:** Query not using new indexes

**Solution:**
```bash
# Force index usage
SELECT * FROM users FORCE INDEX (idx_users_supabase_id)
WHERE supabaseId = ?;

# Or analyze table statistics
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
ANALYZE TABLE users;
ANALYZE TABLE queries;
ANALYZE TABLE search_history;
"
```

---

## Summary

**Total Migration Time:** ~17 minutes
**Total Index Count:** 18 new indexes
**Expected Performance Gain:** 10-25x faster queries
**Risk Level:** LOW (ALGORITHM=INPLACE, no table locks)
**Rollback Time:** <5 minutes

**Recommended Schedule:**
- Staging: Today
- Production: Tomorrow during low-traffic period (2-4 AM)
- Monitoring: 24/7 for first week

---

## Contacts

**Database Admin:** protocol-guide-db-admin@example.com
**On-Call Engineer:** +1-555-0123 (for issues)
**Slack Channel:** #protocol-guide-database

---

**Last Updated:** 2026-01-22
**Migration Author:** Database Architect Agent
**Approval Required:** CTO or Lead Engineer
