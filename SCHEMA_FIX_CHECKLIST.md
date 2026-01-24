# Schema Fix Checklist - Protocol Guide

**Quick Start Guide - Track Your Progress**

---

## Pre-Flight Checks

- [ ] Read `/docs/EXECUTIVE_SUMMARY_SCHEMA_FIXES.md` (5 min)
- [ ] Review migration files in `/drizzle/migrations/` (5 min)
- [ ] Ensure `DATABASE_URL` environment variable is set
- [ ] Confirm database access (can connect to MySQL)

---

## Development Environment

### Step 1: Backup

```bash
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus
mkdir -p backups
mysqldump -u [user] -p [database] > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

- [ ] Database backup created
- [ ] Backup file size looks correct (not empty)
- [ ] Backup location noted: `backups/backup_[timestamp].sql`

### Step 2: Validation

```bash
mysql -u [user] -p [database] < drizzle/migrations/0018_pre_migration_validation.sql > validation_report.txt
cat validation_report.txt
```

- [ ] Validation ran successfully
- [ ] All orphaned record counts are 0
- [ ] If orphans found: cleaned up (see migration guide)

### Step 3: Run Migrations

**Option A: Automated**
```bash
./scripts/run-fk-migration.sh --dry-run  # Test first
./scripts/run-fk-migration.sh            # Run for real
```

**Option B: Manual**
```bash
mysql -u [user] -p [db] < drizzle/migrations/0019_fix_data_type_mismatches.sql
mysql -u [user] -p [db] < drizzle/migrations/0020_add_unique_constraints.sql
mysql -u [user] -p [db] < drizzle/migrations/0021_add_foreign_keys_part1_users.sql
mysql -u [user] -p [db] < drizzle/migrations/0022_add_foreign_keys_part2_complete.sql
```

- [ ] Migration 0019 completed (type fixes)
- [ ] Migration 0020 completed (unique constraints)
- [ ] Migration 0021 completed (user FKs)
- [ ] Migration 0022 completed (remaining FKs)
- [ ] No errors during migrations

### Step 4: Verify

```sql
-- Check foreign key count
SELECT COUNT(*) as total_fks
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL;
-- Should be 35+
```

- [ ] Foreign keys created: _____ (should be 35+)
- [ ] Unique constraints added
- [ ] No migration errors in logs

### Step 5: Update Schema

```bash
cp drizzle/schema.ts drizzle/schema.ts.backup
cp drizzle/schema-updated.ts drizzle/schema.ts
```

- [ ] Schema backed up
- [ ] New schema in place
- [ ] TypeScript compiles without errors

### Step 6: Testing

```bash
npm test
```

- [ ] All tests pass
- [ ] No FK constraint errors
- [ ] Application starts successfully

**Manual Testing:**

- [ ] Create new user
- [ ] Create bookmark for user
- [ ] Delete user → bookmark automatically deleted (CASCADE)
- [ ] Try to delete county with protocols → blocked (RESTRICT)
- [ ] Create agency membership
- [ ] Leave agency → membership removed
- [ ] No errors in application logs

---

## Staging Environment (Optional but Recommended)

- [ ] Deploy to staging
- [ ] Run full test suite
- [ ] Manual QA testing
- [ ] Performance testing (check query times)
- [ ] No degradation observed
- [ ] Rollback tested (restore backup)

---

## Production Deployment

### Pre-Deployment

- [ ] Maintenance window scheduled: _____________
- [ ] Team notified of deployment
- [ ] Backup strategy confirmed
- [ ] Rollback plan reviewed
- [ ] Database credentials verified

### During Deployment

**Downtime Start:** _____________

- [ ] Take application offline (optional, recommended)
- [ ] Create production backup
- [ ] Backup verified (file size looks correct)
- [ ] Run validation queries
- [ ] No orphaned data found
- [ ] Run migration 0019 (type fixes)
- [ ] Run migration 0020 (unique constraints)
- [ ] Run migration 0021 (user FKs)
- [ ] Run migration 0022 (remaining FKs)
- [ ] Verify foreign keys created (35+)
- [ ] Update schema file
- [ ] Deploy application code
- [ ] Smoke test critical flows

**Downtime End:** _____________

**Total Downtime:** _______ minutes

### Post-Deployment Verification

**Immediate (0-30 minutes):**

- [ ] Application accessible
- [ ] Users can log in
- [ ] Users can create queries
- [ ] Bookmarks work
- [ ] Agency features work
- [ ] No errors in logs

**Short-term (1-24 hours):**

- [ ] Monitor error logs
- [ ] Check slow query log
- [ ] Verify data integrity
- [ ] User reports normal
- [ ] Performance metrics normal

**Long-term (1-7 days):**

- [ ] No data corruption issues
- [ ] CASCADE deletes working correctly
- [ ] RESTRICT constraints preventing invalid deletes
- [ ] No performance degradation

---

## Rollback (If Needed)

**If something goes wrong:**

```bash
# Option 1: Full restore (30 seconds)
mysql -u [user] -p [db] < backups/backup_[timestamp].sql

# Option 2: Remove FKs only (1 minute)
mysql -u [user] -p [db] < drizzle/migrations/ROLLBACK_FOREIGN_KEYS.sql
```

- [ ] Rollback performed: _____ (datetime)
- [ ] Reason: _________________________________
- [ ] Database restored
- [ ] Application functional
- [ ] Issue logged for investigation

---

## Issue Tracking

**Issues Encountered:**

1. ___________________________________________________
   - Resolution: __________________________________________
   - Time spent: _______ minutes

2. ___________________________________________________
   - Resolution: __________________________________________
   - Time spent: _______ minutes

3. ___________________________________________________
   - Resolution: __________________________________________
   - Time spent: _______ minutes

---

## Metrics

**Development:**
- Start time: _____________
- End time: _____________
- Duration: _______ minutes
- Issues: _______

**Staging:**
- Start time: _____________
- End time: _____________
- Duration: _______ minutes
- Issues: _______

**Production:**
- Start time: _____________
- End time: _____________
- Duration: _______ minutes
- Downtime: _______ minutes
- Issues: _______

---

## Sign-Off

**Development Testing Complete:**
- Name: _______________________
- Date: _______________________
- Notes: ________________________________________________

**Staging Testing Complete:**
- Name: _______________________
- Date: _______________________
- Notes: ________________________________________________

**Production Deployment Complete:**
- Name: _______________________
- Date: _______________________
- Notes: ________________________________________________

**Post-Deployment Review:**
- Name: _______________________
- Date: _______________________
- Notes: ________________________________________________

---

## Quick Reference

**Files:**
- Summary: `/docs/EXECUTIVE_SUMMARY_SCHEMA_FIXES.md`
- Guide: `/docs/MIGRATION_GUIDE_FOREIGN_KEYS.md`
- Diagram: `/docs/SCHEMA_RELATIONSHIPS_DIAGRAM.md`
- Report: `/docs/SCHEMA_ISSUES_REPORT.md`

**Migrations:**
- Validation: `/drizzle/migrations/0018_pre_migration_validation.sql`
- Type fixes: `/drizzle/migrations/0019_fix_data_type_mismatches.sql`
- Unique: `/drizzle/migrations/0020_add_unique_constraints.sql`
- User FKs: `/drizzle/migrations/0021_add_foreign_keys_part1_users.sql`
- All FKs: `/drizzle/migrations/0022_add_foreign_keys_part2_complete.sql`

**Tools:**
- Migration script: `/scripts/run-fk-migration.sh`
- Rollback: `/drizzle/migrations/ROLLBACK_FOREIGN_KEYS.sql`

**Schema:**
- Updated: `/drizzle/schema-updated.ts`
- Current: `/drizzle/schema.ts`

---

**Status:** ☐ Not Started | ☐ In Progress | ☐ Completed | ☐ Rolled Back

**Last Updated:** _______________________
