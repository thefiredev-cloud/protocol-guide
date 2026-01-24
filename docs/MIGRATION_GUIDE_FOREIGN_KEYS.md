# Migration Guide: Adding Foreign Key Constraints

**Date:** 2026-01-23
**Impact:** Database-level schema changes with potential application impact
**Downtime Required:** Recommended (5-15 minutes)
**Rollback Available:** Yes

## Overview

This migration adds foreign key constraints to enforce referential integrity at the database level. Currently, all relationships are managed only at the application level, which risks data corruption.

## Prerequisites

### 1. Backup Database
```bash
# Create full backup before proceeding
mysqldump -u [user] -p [database] > backup_before_fk_$(date +%Y%m%d_%H%M%S).sql

# Or via Supabase/PlanetScale dashboard backup feature
```

### 2. Check Node/Database Version
```bash
node --version  # Should be >= 18
mysql --version # Should be >= 8.0
```

### 3. Verify No Active Users
```bash
# Check for active sessions (if applicable)
# Coordinate deployment during low-traffic period
```

## Migration Steps

### Step 1: Validate Current Data

Run the pre-migration validation to find orphaned records:

```bash
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus

# Run validation queries
mysql -u [user] -p [database] < drizzle/migrations/0018_pre_migration_validation.sql > validation_report.txt

# Review the report
cat validation_report.txt
```

**Expected Output:**
```
issue_type                          | count
------------------------------------|------
Orphaned bookmarks                  |     0
Orphaned feedback (user)            |     0
...
```

**If count > 0:** You have orphaned data that must be cleaned up first.

### Step 2: Clean Up Orphaned Data (if needed)

If validation found orphaned records, clean them up:

```sql
-- Example: Remove orphaned bookmarks
DELETE FROM bookmarks
WHERE userId NOT IN (SELECT id FROM users);

-- Example: Set NULL for optional foreign keys
UPDATE feedback
SET countyId = NULL
WHERE countyId IS NOT NULL
  AND countyId NOT IN (SELECT id FROM counties);

-- Repeat for each table with orphaned data
```

**Re-run validation** until all counts are 0.

### Step 3: Fix Data Type Mismatches

```bash
# Apply type fixes
mysql -u [user] -p [database] < drizzle/migrations/0019_fix_data_type_mismatches.sql
```

This adds `internalAgencyId` column to `integration_logs` and attempts to populate it.

**Verify:**
```sql
SELECT COUNT(*) as total,
       COUNT(internalAgencyId) as mapped,
       COUNT(*) - COUNT(internalAgencyId) as unmapped
FROM integration_logs;
```

### Step 4: Add Unique Constraints

```bash
# Add unique constraints to prevent duplicates
mysql -u [user] -p [database] < drizzle/migrations/0020_add_unique_constraints.sql
```

**Warning:** This will fail if duplicate data exists!

**If it fails:**
```sql
-- Find duplicates in user_auth_providers
SELECT userId, provider, COUNT(*)
FROM user_auth_providers
GROUP BY userId, provider
HAVING COUNT(*) > 1;

-- Remove duplicates (keep most recent)
DELETE uap1 FROM user_auth_providers uap1
INNER JOIN user_auth_providers uap2
WHERE uap1.userId = uap2.userId
  AND uap1.provider = uap2.provider
  AND uap1.id < uap2.id;

-- Repeat for other tables, then retry step 4
```

### Step 5: Add Foreign Keys (User Relationships)

```bash
# Add all user-related foreign keys
mysql -u [user] -p [database] < drizzle/migrations/0021_add_foreign_keys_part1_users.sql
```

**Verify:**
```sql
-- Check foreign keys were created
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'users'
ORDER BY TABLE_NAME;
```

Should show 17+ foreign keys referencing `users.id`.

### Step 6: Add Foreign Keys (Complete)

```bash
# Add remaining foreign keys (counties, agencies, protocols)
mysql -u [user] -p [database] < drizzle/migrations/0022_add_foreign_keys_part2_complete.sql
```

**Verify:**
```sql
-- Count total foreign keys
SELECT COUNT(*) as total_foreign_keys
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

Should show 35+ foreign keys total.

### Step 7: Update Schema Definition

```bash
# Backup current schema
cp drizzle/schema.ts drizzle/schema.ts.backup

# Replace with updated schema (includes .references())
cp drizzle/schema-updated.ts drizzle/schema.ts

# Regenerate migrations if needed
npx drizzle-kit generate:mysql
```

### Step 8: Test Application

```bash
# Run application tests
npm test

# Start dev server and test manually
npm run dev
```

**Test Scenarios:**
- ✅ Create new user
- ✅ Delete user (should cascade delete bookmarks, queries, etc.)
- ✅ Create bookmark
- ✅ Delete county with no protocols (should succeed)
- ✅ Delete county with protocols (should fail with FK constraint error)
- ✅ Join agency
- ✅ Leave agency

## Rollback Procedure

If something goes wrong:

```bash
# Restore from backup
mysql -u [user] -p [database] < backup_before_fk_[timestamp].sql

# Or remove foreign keys manually
mysql -u [user] -p [database]
```

```sql
-- Drop all foreign keys (example for one table)
ALTER TABLE bookmarks DROP FOREIGN KEY fk_bookmarks_user;
ALTER TABLE bookmarks DROP FOREIGN KEY fk_bookmarks_agency;

-- Repeat for each table
-- See drizzle/migrations/ROLLBACK_FOREIGN_KEYS.sql for full list
```

## Post-Migration Verification

### 1. Test CASCADE DELETE

```sql
-- Create test user
INSERT INTO users (openId, name, email, queryCountToday)
VALUES ('test_fk_user', 'Test FK User', 'test@example.com', 0);

SET @test_user_id = LAST_INSERT_ID();

-- Create related records
INSERT INTO bookmarks (userId, protocolNumber, protocolTitle, content)
VALUES (@test_user_id, 'TEST-001', 'Test Protocol', 'Test content');

-- Verify bookmark exists
SELECT COUNT(*) FROM bookmarks WHERE userId = @test_user_id;

-- Delete user (should cascade)
DELETE FROM users WHERE id = @test_user_id;

-- Verify bookmark was deleted
SELECT COUNT(*) FROM bookmarks WHERE userId = @test_user_id;
-- Should return 0
```

### 2. Test RESTRICT

```sql
-- Try to delete county with protocols (should fail)
DELETE FROM counties WHERE id = (
  SELECT DISTINCT countyId FROM protocolChunks LIMIT 1
);
-- Should error: Cannot delete or update a parent row: a foreign key constraint fails
```

### 3. Check for Errors in Application Logs

```bash
# Monitor application logs for FK constraint violations
tail -f logs/app.log | grep "foreign key constraint"
```

## Performance Impact

### Expected Changes
- **Insert/Update:** Negligible (<5ms additional per operation)
- **Delete:** Slightly slower due to CASCADE checks (<10ms)
- **Queries:** No impact (foreign keys don't affect SELECT)

### Monitoring
```sql
-- Check slow query log after migration
SELECT * FROM mysql.slow_log
WHERE start_time > NOW() - INTERVAL 1 HOUR
ORDER BY query_time DESC
LIMIT 20;
```

## Common Issues & Solutions

### Issue 1: "Cannot add foreign key constraint"

**Cause:** Orphaned data exists or data types don't match

**Solution:**
```sql
-- Find the problematic records
SELECT * FROM child_table c
WHERE NOT EXISTS (
  SELECT 1 FROM parent_table p WHERE p.id = c.parent_id
);

-- Clean up
DELETE FROM child_table WHERE parent_id NOT IN (SELECT id FROM parent_table);
```

### Issue 2: "Duplicate entry for key 'unique_user_provider'"

**Cause:** Duplicate auth providers exist

**Solution:**
```sql
-- Find duplicates
SELECT userId, provider, COUNT(*) as cnt
FROM user_auth_providers
GROUP BY userId, provider
HAVING cnt > 1;

-- Keep most recent, delete older
DELETE uap1 FROM user_auth_providers uap1
INNER JOIN (
  SELECT userId, provider, MAX(id) as max_id
  FROM user_auth_providers
  GROUP BY userId, provider
) uap2 ON uap1.userId = uap2.userId
  AND uap1.provider = uap2.provider
WHERE uap1.id < uap2.max_id;
```

### Issue 3: Application throws "RESTRICT constraint failed"

**Cause:** Application trying to delete record with dependent records

**Solution:**
```javascript
// Update application code to handle cascade deletes
// Before deleting user, check if they have critical data
const hasConversions = await db.select()
  .from(conversionEvents)
  .where(eq(conversionEvents.userId, userId))
  .limit(1);

if (hasConversions.length > 0) {
  throw new Error('Cannot delete user with conversion history');
}
```

## Timeline Estimate

| Step | Duration | Can Run In Background |
|------|----------|----------------------|
| Backup | 2-5 min | No |
| Validation | 1 min | Yes |
| Cleanup | 5-30 min | No |
| Type fixes | 30 sec | No |
| Unique constraints | 30 sec | No |
| FK Part 1 | 1-2 min | No |
| FK Part 2 | 1-2 min | No |
| Schema update | 30 sec | Yes |
| Testing | 5-10 min | Yes |
| **Total** | **15-50 min** | - |

## Success Criteria

- ✅ All migrations run without errors
- ✅ Zero orphaned records in validation
- ✅ 35+ foreign keys created
- ✅ Application tests pass
- ✅ Manual testing successful
- ✅ No performance degradation
- ✅ CASCADE DELETE works as expected
- ✅ RESTRICT prevents invalid deletes

## Support

If you encounter issues:

1. **Check validation report** for data issues
2. **Review error logs** for specific constraint violations
3. **Use rollback procedure** if migration fails
4. **Contact database admin** for production issues

## Files Created

1. `/docs/SCHEMA_ISSUES_REPORT.md` - Detailed analysis
2. `/drizzle/migrations/0018_pre_migration_validation.sql` - Validation queries
3. `/drizzle/migrations/0019_fix_data_type_mismatches.sql` - Type fixes
4. `/drizzle/migrations/0020_add_unique_constraints.sql` - Unique constraints
5. `/drizzle/migrations/0021_add_foreign_keys_part1_users.sql` - User FKs
6. `/drizzle/migrations/0022_add_foreign_keys_part2_complete.sql` - Remaining FKs
7. `/drizzle/schema-updated.ts` - Updated schema with references
8. This guide - `/docs/MIGRATION_GUIDE_FOREIGN_KEYS.md`
