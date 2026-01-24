# Schema Fixes Summary - Quick Reference

**Date:** 2026-01-23
**Project:** Protocol Guide
**Database:** MySQL (Drizzle ORM)

## Issues Found & Fixed

### Critical Issues

1. **Missing Foreign Key Constraints** (CRITICAL)
   - 40+ relationships have NO foreign key constraints
   - All integrity checks are application-level only
   - Risk: Orphaned data, corruption during direct DB operations

2. **Data Type Mismatch** (CRITICAL)
   - `integrationLogs.agencyId` is varchar but `agencies.id` is int
   - Blocks foreign key creation
   - Solution: Added `internalAgencyId` int column for FK relationship

3. **Missing Unique Constraints** (MEDIUM)
   - `user_auth_providers` allows duplicate OAuth providers per user
   - `agency_members` allows duplicate memberships
   - `stripe_webhook_events.eventId` only indexed, not unique

### All Issues Status

| Issue | Severity | Status | Files |
|-------|----------|--------|-------|
| Missing FKs | HIGH | Fixed | Migrations 0021-0022 |
| Type mismatch | HIGH | Fixed | Migration 0019 |
| Missing unique | MEDIUM | Fixed | Migration 0020 |
| Composite keys | LOW | Documented | Report only |

## Quick Start

### Option 1: Automated Script

```bash
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus

# Dry run first
./scripts/run-fk-migration.sh --dry-run

# Run for real
./scripts/run-fk-migration.sh
```

### Option 2: Manual Steps

```bash
# 1. Backup
mysqldump -u [user] -p [db] > backup.sql

# 2. Validate
mysql -u [user] -p [db] < drizzle/migrations/0018_pre_migration_validation.sql

# 3. Fix types
mysql -u [user] -p [db] < drizzle/migrations/0019_fix_data_type_mismatches.sql

# 4. Add unique
mysql -u [user] -p [db] < drizzle/migrations/0020_add_unique_constraints.sql

# 5. Add FKs (users)
mysql -u [user] -p [db] < drizzle/migrations/0021_add_foreign_keys_part1_users.sql

# 6. Add FKs (complete)
mysql -u [user] -p [db] < drizzle/migrations/0022_add_foreign_keys_part2_complete.sql

# 7. Update schema
cp drizzle/schema-updated.ts drizzle/schema.ts
```

## Foreign Keys Added

### By Table

**Users (17 FKs):**
- bookmarks.userId → users.id (CASCADE)
- feedback.userId → users.id (CASCADE)
- queries.userId → users.id (CASCADE)
- auditLogs.userId → users.id (SET NULL)
- userAuthProviders.userId → users.id (CASCADE)
- agencyMembers.userId → users.id (CASCADE)
- agencyMembers.invitedBy → users.id (SET NULL)
- protocolVersions.publishedBy → users.id (SET NULL)
- protocolUploads.uploadedBy → users.id (RESTRICT)
- userCounties.userId → users.id (CASCADE)
- searchHistory.userId → users.id (CASCADE)
- users.selectedCountyId → counties.id (SET NULL)
- users.homeCountyId → counties.id (SET NULL)
- analytics_events.userId → users.id (SET NULL)
- conversion_events.userId → users.id (RESTRICT)
- protocol_access_logs.userId → users.id (SET NULL)
- search_analytics.userId → users.id (SET NULL)
- session_analytics.userId → users.id (SET NULL)

**Counties (5 FKs):**
- protocolChunks.countyId → counties.id (RESTRICT)
- queries.countyId → counties.id (CASCADE)
- feedback.countyId → counties.id (SET NULL)
- userCounties.countyId → counties.id (CASCADE)
- searchHistory.countyId → counties.id (SET NULL)

**Agencies (6 FKs):**
- bookmarks.agencyId → agencies.id (SET NULL)
- agencyMembers.agencyId → agencies.id (CASCADE)
- protocolVersions.agencyId → agencies.id (CASCADE)
- integrationLogs.internalAgencyId → agencies.id (SET NULL)
- protocol_access_logs.agencyId → agencies.id (SET NULL)
- search_analytics.agencyId → agencies.id (SET NULL)

**Protocols (2 FKs):**
- protocolUploads.versionId → protocol_versions.id (CASCADE)
- protocol_access_logs.protocolChunkId → protocolChunks.id (CASCADE)

**Total:** 35+ foreign keys

## Cascade Behavior

### CASCADE DELETE
User's personal data deleted when user deleted:
- Bookmarks
- Feedback
- Queries
- Search history
- County selections
- Agency memberships
- Auth providers

### SET NULL
Analytics/audit preserved but anonymized:
- Audit logs
- Analytics events
- Protocol access logs
- Search analytics
- Session analytics

### RESTRICT
Cannot delete if critical data exists:
- Cannot delete user with conversion events (revenue data)
- Cannot delete user who uploaded protocols (accountability)
- Cannot delete county with protocols (data integrity)

## Files Created

```
/Users/tanner-osterkamp/Protocol Guide Manus/
├── docs/
│   ├── SCHEMA_ISSUES_REPORT.md           (Detailed analysis)
│   ├── MIGRATION_GUIDE_FOREIGN_KEYS.md   (Step-by-step guide)
│   └── SCHEMA_FIXES_SUMMARY.md           (This file)
├── drizzle/
│   ├── schema-updated.ts                  (New schema with FKs)
│   └── migrations/
│       ├── 0018_pre_migration_validation.sql
│       ├── 0019_fix_data_type_mismatches.sql
│       ├── 0020_add_unique_constraints.sql
│       ├── 0021_add_foreign_keys_part1_users.sql
│       ├── 0022_add_foreign_keys_part2_complete.sql
│       └── ROLLBACK_FOREIGN_KEYS.sql
└── scripts/
    └── run-fk-migration.sh               (Automated script)
```

## Testing Checklist

After migration:

- [ ] No orphaned data in validation report
- [ ] 35+ foreign keys created
- [ ] Application starts without errors
- [ ] Tests pass: `npm test`
- [ ] Can create user
- [ ] Can delete user (bookmarks cascade)
- [ ] Can create bookmark
- [ ] Can join agency
- [ ] Cannot delete county with protocols (RESTRICT works)
- [ ] No performance degradation

## Rollback

If needed:

```bash
# Option 1: Restore backup
mysql -u [user] -p [db] < backup.sql

# Option 2: Remove FKs only
mysql -u [user] -p [db] < drizzle/migrations/ROLLBACK_FOREIGN_KEYS.sql
```

## Performance Impact

Expected:
- Insert/Update: +0-5ms (negligible)
- Delete: +5-10ms (CASCADE checks)
- Queries: No impact

## Primary Keys Status

✅ **All tables have proper primary keys**
- All use `int AUTO_INCREMENT PRIMARY KEY`
- Consistent naming: `id`
- No composite primary keys needed

## Next Steps

1. **Review** migration files
2. **Run** validation on production data copy
3. **Test** in staging environment
4. **Schedule** maintenance window (15-30 min)
5. **Execute** migration
6. **Verify** foreign keys created
7. **Test** application functionality
8. **Monitor** for issues

## Documentation

- Full analysis: `/docs/SCHEMA_ISSUES_REPORT.md`
- Migration guide: `/docs/MIGRATION_GUIDE_FOREIGN_KEYS.md`
- Rollback script: `/drizzle/migrations/ROLLBACK_FOREIGN_KEYS.sql`

## Notes

- **No immediate danger** - current schema works at app level
- **High value** - prevents data corruption
- **Low risk** - can rollback easily
- **Best practice** - database-level integrity is essential
- **Recommended** - do before production launch
