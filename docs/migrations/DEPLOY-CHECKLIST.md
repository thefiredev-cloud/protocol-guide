# Database Fixes Deployment Checklist

**Date**: 2026-01-22
**Fixes**: ID Mapping + RLS Policies
**Time Required**: 15-20 minutes

---

## Pre-Deployment

### 1. Backup Everything
- [ ] Take Supabase database snapshot (Dashboard → Database → Backups)
- [ ] Git commit all changes: `git add . && git commit -m "feat: Add database ID mapping and RLS policies"`
- [ ] Tag release: `git tag database-fixes-v1.0`
- [ ] Push to remote: `git push && git push --tags`

### 2. Review Changes
- [ ] Read `/docs/DATABASE-FIXES-SUMMARY.md`
- [ ] Review `/docs/migrations/001-add-rls-policies.sql`
- [ ] Review `/server/db-agency-mapping.ts`
- [ ] Review `/server/routers.ts` changes

### 3. Environment Check
- [ ] Verify `SUPABASE_URL` in `.env`
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- [ ] Verify `DATABASE_URL` (MySQL) in `.env`
- [ ] Test database connectivity

---

## Deployment: Fix #1 - ID Mapping Layer

### Step 1: Deploy Code
```bash
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus

# Ensure dependencies installed
npm install

# Build TypeScript
npm run build

# Start development server (or deploy to staging)
npm run dev
```

### Step 2: Verify Mapping Cache
Check server logs for:
```
[Agency Mapping] Initializing ID mapping cache...
[Agency Mapping] Cache initialized: XX/YY counties mapped
```

**Expected**: At least 40/51 counties mapped (80%+)

### Step 3: Test County Filter
```bash
# Run integration tests
npm test tests/county-filter-integration.test.ts

# Expected: All tests pass
```

**Manual Test**:
1. Open app
2. Select a county (e.g., "Los Angeles County")
3. Search for "cardiac arrest"
4. Verify results are filtered to that county
5. Check logs for: `[Search] Mapped MySQL X -> Supabase Y`

### Step 4: Monitor for Issues
- [ ] Check for "No match for MySQL county" warnings in logs
- [ ] Verify search latency acceptable (<200ms first request, <50ms after)
- [ ] Confirm no errors in error logs

**If Issues**: See Rollback section below

---

## Deployment: Fix #2 - RLS Policies

### Step 1: Backup Database
```bash
# Via Supabase Dashboard:
# Settings → Database → Backups → "Create Backup"

# Wait for backup to complete (1-2 minutes)
```

### Step 2: Run Migration

**Option A: Supabase Dashboard (Recommended)**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire contents of `/docs/migrations/001-add-rls-policies.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Wait for completion (30-60 seconds)
7. Review output for errors

**Option B: Command Line**
```bash
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus

# Via psql
psql $SUPABASE_URL -f docs/migrations/001-add-rls-policies.sql

# Or via Supabase CLI (if installed)
supabase db push --file docs/migrations/001-add-rls-policies.sql
```

### Step 3: Verify Policies

Run verification queries from SQL Editor:

```sql
-- Check RLS enabled (should all be true)
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('manus_protocol_chunks', 'agencies', 'users', 'queries', 'feedback')
ORDER BY tablename;

-- Check policies created (should see 10-15 policies)
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('manus_protocol_chunks', 'agencies', 'users', 'queries', 'feedback')
ORDER BY tablename, policyname;
```

**Expected Output**:
```
manus_protocol_chunks | true
agencies              | true
users                 | true (if exists)
queries               | true (if exists)
feedback              | true (if exists)
```

### Step 4: Test Access Controls

**Test 1: Public Protocol Access (Should Work)**
```typescript
// In Supabase SQL Editor or via API
SELECT id, protocol_title FROM manus_protocol_chunks LIMIT 5;
-- Should return results (public read allowed)
```

**Test 2: Anonymous Write (Should Fail)**
```typescript
// Try to insert without auth
INSERT INTO manus_protocol_chunks (protocol_title, content)
VALUES ('Test', 'Test content');
-- Should error: "new row violates row-level security policy"
```

**Test 3: User Isolation (Should Work)**
```typescript
// Login as a user, try to read own data
SELECT * FROM users WHERE supabase_id = auth.uid();
-- Should return only that user's data
```

### Step 5: Test Search Functionality

**Critical**: Verify search still works!

1. Open app
2. Try a search without county filter: "cardiac arrest"
3. Verify results returned (public protocols readable)
4. Try with county filter selected
5. Verify filtered results returned

**If search broken**: Check service role key has proper permissions

---

## Post-Deployment Validation

### Immediate Checks (5 minutes)

- [ ] **Search Works**: Can search protocols without errors
- [ ] **County Filter Works**: Selecting county filters results correctly
- [ ] **State Filter Works**: Selecting state filters results correctly
- [ ] **No Auth Errors**: No "permission denied" or RLS errors in logs
- [ ] **Performance OK**: Search latency <500ms

### Monitoring (24 hours)

- [ ] **Error Rate**: Check error logs for RLS policy violations
- [ ] **Performance**: Monitor query latency (should be <2ms overhead)
- [ ] **Mapping Success**: Check logs for unmapped county warnings
- [ ] **User Reports**: Monitor support channels for filter issues

### Metrics to Track

```sql
-- Search performance
SELECT
    COUNT(*) as total_searches,
    AVG(duration_ms) as avg_duration,
    MAX(duration_ms) as max_duration
FROM search_logs
WHERE timestamp > NOW() - INTERVAL '24 hours';

-- RLS policy overhead
SELECT query, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%manus_protocol_chunks%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Mapping success rate
-- Check server logs:
grep "Mapped MySQL" logs/server.log | wc -l  # Successful mappings
grep "No match for MySQL county" logs/server.log | wc -l  # Failed mappings
```

---

## Rollback Procedures

### Rollback ID Mapping (If Needed)

**Symptoms**: Search broken, mapping errors in logs, incorrect results

```bash
# 1. Revert code changes
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus
git revert HEAD  # Or specific commit

# 2. Rebuild and redeploy
npm run build
npm run dev  # Or deploy to production

# 3. Verify search works without mapping
# (County filter will be broken again, but search functional)
```

**Time**: 2-3 minutes

### Rollback RLS Policies (If Needed)

**Symptoms**: Permission denied errors, users can't access data, search broken

**Option A: Disable RLS (Quick)**
```sql
-- Disable RLS on all tables
ALTER TABLE public.manus_protocol_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
```

**Option B: Drop Policies (Cleaner)**
```sql
-- Drop all policies
DROP POLICY IF EXISTS "Allow public read access to protocol chunks" ON manus_protocol_chunks;
DROP POLICY IF EXISTS "Allow service_role to insert protocol chunks" ON manus_protocol_chunks;
-- ... (drop all policies from migration)
```

**Option C: Restore Backup (Safest)**
1. Go to Supabase Dashboard → Database → Backups
2. Select backup from before migration
3. Click "Restore"
4. Wait 2-5 minutes
5. Verify data intact

**Time**: 5-10 minutes

---

## Common Issues & Solutions

### Issue: "No match for MySQL county X"
**Cause**: County name differs between MySQL and Supabase
**Solution**:
1. Check both databases for county name
2. Update normalization logic in `db-agency-mapping.ts` if needed
3. Or manually add mapping to cache

### Issue: "Permission denied for table manus_protocol_chunks"
**Cause**: RLS policy too restrictive or service role key not set
**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` in environment
2. Check policy USING/WITH CHECK clauses
3. Grant permissions: `GRANT SELECT ON manus_protocol_chunks TO anon;`

### Issue: Search returns no results after RLS
**Cause**: RLS blocking public reads
**Solution**:
1. Verify public read policy exists
2. Check policy: `SELECT * FROM pg_policies WHERE tablename = 'manus_protocol_chunks'`
3. Re-run migration if policy missing

### Issue: Slow queries after RLS
**Cause**: RLS policy JOIN overhead
**Solution**:
1. Add index: `CREATE INDEX idx_users_supabase_id ON users(supabase_id);`
2. Analyze slow queries: `EXPLAIN ANALYZE SELECT ...`
3. Optimize policy USING clauses

---

## Success Criteria

### Fix #1: ID Mapping
- ✅ County filter functional (users can filter by county)
- ✅ Mapping cache initialized (>80% counties mapped)
- ✅ No performance regression (search <500ms)
- ✅ Logs show successful mappings

### Fix #2: RLS Policies
- ✅ All tables have RLS enabled
- ✅ Public protocols accessible (anon users can search)
- ✅ User data isolated (users only see own data)
- ✅ No permission errors in logs
- ✅ Performance acceptable (<2ms overhead)

---

## Communication Templates

### Staging Deployment
```
🚀 Database fixes deployed to staging

**Changes**:
- County/agency filter now works correctly
- Row-Level Security policies applied
- Search functionality improved

**Testing**: Please test county filter and report any issues
**Rollback**: Available if issues found
**Production**: Pending staging validation
```

### Production Deployment
```
✅ Database fixes deployed to production

**Fixed**:
- County filter now filters search results correctly
- Enhanced database security with RLS policies
- Improved search performance

**Impact**: Users can now filter protocols by county/state
**Monitoring**: Tracking performance and error rates
**Support**: Contact support if you experience any issues
```

### Rollback Notice
```
⚠️ Database fixes rolled back

**Reason**: [Describe issue]
**Status**: Investigating root cause
**Impact**: County filter temporarily disabled
**Timeline**: Fix expected within [timeframe]
**Action**: No action required from users
```

---

## Contact & Support

**Questions**: Review `/docs/DATABASE-FIXES-SUMMARY.md`
**Issues**: Check rollback procedures above
**Monitoring**: Review logs and metrics queries

**Deployment Team**:
- Database Architecture: Claude Code
- Backend: Protocol Guide Team
- DevOps: [Your DevOps Contact]

---

**Deployment Ready**: ✅ Yes
**Estimated Time**: 15-20 minutes
**Risk Level**: Low (non-breaking changes)
**Rollback Time**: <5 minutes
**Documentation**: Complete
