# Database Setup Guide
## LA County Fire Medic-Bot - Supabase PostgreSQL

**Version**: 2.0.0
**Last Updated**: October 25, 2025
**Status**: Production-Ready Infrastructure

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Project Creation](#supabase-project-creation)
4. [Environment Configuration](#environment-configuration)
5. [Running Migrations](#running-migrations)
6. [Testing the Connection](#testing-the-connection)
7. [Dual-Write Strategy](#dual-write-strategy)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)
10. [Backup and Recovery](#backup-and-recovery)

---

## Overview

Medic-Bot uses **Supabase** (PostgreSQL 15) for:
- **Audit logs** - HIPAA-compliant 6-year retention
- **Metrics** - Performance analytics and monitoring
- **User management** - Future authentication system
- **Rate limiting** - Dynamic configuration and violation tracking

### Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Audit Logger │  │   Metrics    │  │ Rate Limiter │  │
│  │ (Dual-Write) │  │   Manager    │  │   (Config)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│               DATABASE CONNECTION LAYER                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  lib/db/client.ts (Supabase Client Singleton)    │  │
│  │  - Connection pooling                            │  │
│  │  - Retry logic with exponential backoff          │  │
│  │  - Health checks                                 │  │
│  │  - Graceful degradation                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE POSTGRESQL 15                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ audit_logs   │  │   metrics    │  │    users     │  │
│  │ sessions     │  │ rate_limits  │  │   (future)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  Features:                                              │
│  - Row Level Security (RLS)                             │
│  - Automatic backups (daily)                            │
│  - Point-in-time recovery (7 days)                      │
│  - TLS 1.3 encryption                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Software

- **Node.js**: v20+ (check: `node --version`)
- **npm**: v10+ (check: `npm --version`)
- **Supabase Account**: [Sign up here](https://app.supabase.com)

### Required Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

Install:

```bash
npm install @supabase/supabase-js
```

---

## Supabase Project Creation

### Step 1: Create New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `medic-bot-production` (or `medic-bot-dev`)
   - **Database Password**: Generate strong password (save securely!)
   - **Region**: `us-west-2` (closest to LA County)
   - **Pricing Plan**:
     - **Development**: Free tier (500 MB)
     - **Production**: Pro tier ($25/mo, 8 GB + overage)

4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get API Credentials

Once project is ready:

1. Navigate to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (safe for client)
   - **service_role secret key**: `eyJhbGc...` (NEVER expose!)

### Step 3: Configure Database

1. Navigate to **Database** → **Settings**
2. Verify PostgreSQL version: **15+**
3. Connection pooling: **Enabled** (default)
4. SSL mode: **Require** (default)

---

## Environment Configuration

### Development (.env.local)

Create `/Users/tanner-osterkamp/Medic-Bot/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Enable database audit logging (dual-write)
ENABLE_DB_AUDIT=true

# Other required variables
LLM_API_KEY=your_openai_key
```

### Production (Netlify)

Set environment variables in Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (anon key) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (service key) | Build & Functions |
| `ENABLE_DB_AUDIT` | `true` | All |

**IMPORTANT**:
- ✅ `NEXT_PUBLIC_*` variables are safe for client
- ❌ `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to client
- ✅ Only use service role key in API routes and server components

---

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for First-Time)

1. Navigate to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy contents of migration files in order:

```bash
# Order matters! Run in sequence:
1. supabase/migrations/001_audit_logs.sql
2. supabase/migrations/002_users_sessions.sql
3. supabase/migrations/003_metrics.sql
4. supabase/migrations/004_rate_limits.sql
```

4. Click **"Run"** for each migration
5. Verify success: Check **Table Editor** for new tables

### Option 2: Supabase CLI

Install Supabase CLI:

```bash
npm install -g supabase
```

Login to Supabase:

```bash
supabase login
```

Link to your project:

```bash
supabase link --project-ref your-project-id
```

Run migrations:

```bash
supabase db push
```

### Option 3: PostgreSQL Direct Connection

Get direct connection string:

1. Navigate to **Database** → **Settings** → **Connection string**
2. Select **URI** format
3. Replace `[YOUR-PASSWORD]` with your database password

Run migrations:

```bash
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  -f supabase/migrations/001_audit_logs.sql

psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  -f supabase/migrations/002_users_sessions.sql

# ... repeat for all migrations
```

---

## Testing the Connection

### Quick Test (Node.js Script)

Create `scripts/test-db.ts`:

```typescript
import { db, dbHelpers } from '../lib/db';

async function main() {
  console.log('Testing database connection...\n');

  const success = await dbHelpers.testConnection();

  if (success) {
    console.log('✅ Database connection successful!');
    process.exit(0);
  } else {
    console.error('❌ Database connection failed!');
    process.exit(1);
  }
}

main();
```

Run test:

```bash
npx tsx scripts/test-db.ts
```

### Expected Output

```text
=== Database Connection Test ===

1. Configuration check...
   PASSED: Environment variables set

2. Health check...
   PASSED: Database healthy (latency: 45ms)

3. Query test...
   PASSED: Found 0 audit logs

4. Write test...
   PASSED: Test event inserted (ID: a1b2c3d4-...)

=== All Tests Passed ===
```

### Manual Health Check

```typescript
import { dbHelpers } from '@/lib/db/helpers';

const health = await dbHelpers.checkHealth();
console.log(health);

// Output:
// {
//   healthy: true,
//   latencyMs: 42,
//   timestamp: '2025-10-25T20:00:00.000Z'
// }
```

---

## Dual-Write Strategy

The audit logger implements a **dual-write strategy** for reliability:

### Phase 1: File-Only (Current Default)

```bash
ENABLE_DB_AUDIT=false  (or unset)
```

- All audit logs written to `logs/audit-{date}.jsonl`
- No database dependency
- Existing behavior (backwards compatible)

### Phase 2: Dual-Write (Transition Period)

```bash
ENABLE_DB_AUDIT=true
```

- Primary: File-based logging (always succeeds)
- Secondary: Database logging (fails gracefully)
- Both destinations receive same events
- File acts as backup if database fails

**Error Handling**:
```typescript
// File write - MUST succeed
await writeToFile(event);  // Throws on failure

// Database write - CAN fail
await writeToDatabase(event).catch(err => {
  console.error('DB write failed (file preserved):', err);
  // Application continues normally
});
```

### Phase 3: Database-Primary (Future)

```bash
ENABLE_DB_AUDIT=true
FILE_AUDIT_ENABLED=false  (future flag)
```

- Database becomes primary storage
- Files disabled or used only for local dev
- Requires verified database reliability

### Backfill Historical Logs

Create `scripts/backfill-audit-logs.ts`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { db, dbHelpers } from '../lib/db';

async function backfillAuditLogs() {
  const logDir = path.join(process.cwd(), 'logs');
  const files = fs.readdirSync(logDir)
    .filter(f => f.startsWith('audit-') && f.endsWith('.jsonl'))
    .sort();

  console.log(`Found ${files.length} audit log files to backfill\n`);

  for (const file of files) {
    const filePath = path.join(logDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');

    const events = [];
    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        events.push({
          event_id: event.eventId,
          timestamp: event.timestamp,
          user_id: event.userId ?? null,
          user_role: event.userRole ?? null,
          session_id: event.sessionId ?? null,
          action: event.action,
          resource: event.resource,
          outcome: event.outcome,
          metadata: event.metadata ?? null,
          ip_address: event.ipAddress ?? null,
          user_agent: event.userAgent ?? null,
          error_message: event.errorMessage ?? null,
          duration_ms: event.durationMs ?? null,
        });
      } catch (err) {
        console.error(`Malformed line in ${file}:`, err);
      }
    }

    // Batch insert
    if (events.length > 0) {
      console.log(`Processing ${file}: ${events.length} events...`);
      await dbHelpers.batchInsert('audit_logs', events);
      console.log(`✅ Completed ${file}\n`);
    }
  }

  console.log('Backfill complete!');
}

backfillAuditLogs().catch(console.error);
```

Run backfill:

```bash
npx tsx scripts/backfill-audit-logs.ts
```

---

## Troubleshooting

### Issue 1: "Supabase credentials not configured"

**Error**:
```text
Error: Supabase credentials not configured
```

**Solution**:
1. Verify `.env.local` exists with correct variables
2. Restart development server: `npm run dev`
3. Check variable names (must be exact):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Issue 2: "Connection refused" or "Network error"

**Error**:
```text
Error: fetch failed (connection refused)
```

**Possible Causes**:
1. **Firewall**: Supabase requires outbound HTTPS (port 443)
2. **VPN**: Some VPNs block Supabase domains
3. **Project paused**: Free tier projects pause after 7 days inactivity

**Solution**:
1. Check project status in Supabase dashboard
2. Disable VPN and retry
3. Verify network connectivity: `ping db.xxxxx.supabase.co`

### Issue 3: "Row Level Security" policy violation

**Error**:
```text
Error: new row violates row-level security policy
```

**Solution**:
- Use `db.admin` instead of `db.client` for privileged operations
- Admin client bypasses RLS (service role key required)

```typescript
// ❌ Wrong (RLS blocks insert)
const { error } = await db.client.from('audit_logs').insert(event);

// ✅ Correct (bypasses RLS)
const { error } = await db.admin.from('audit_logs').insert(event);
```

### Issue 4: Database migrations fail

**Error**:
```text
ERROR: type "audit_action" already exists
```

**Solution**:
1. Migrations already run - check Table Editor
2. To re-run: Drop existing types/tables first (DANGER!)
3. For clean slate: Create new Supabase project

**Safe Reset** (development only):

```sql
-- Drop all tables (order matters - foreign keys!)
DROP TABLE IF EXISTS rate_limit_violations CASCADE;
DROP TABLE IF EXISTS rate_limit_config CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS audit_outcome CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;

-- Now re-run migrations
```

### Issue 5: Slow queries (> 1 second)

**Diagnostics**:

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Solution**:
1. Verify indexes exist (see migrations)
2. Add missing indexes for common queries
3. Use `EXPLAIN ANALYZE` to debug query plans

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Supabase project created in `us-west-2` region
- [ ] Database migrations run successfully
- [ ] Environment variables set in Netlify
- [ ] Test connection passes (`npm run test:db`)
- [ ] RLS policies enabled on all tables
- [ ] Backups enabled (automatic in Supabase Pro)
- [ ] Monitoring configured (Supabase dashboard)

### Deployment Steps

1. **Set Environment Variables** (Netlify):

```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGc..."
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGc..."
netlify env:set ENABLE_DB_AUDIT "true"
```

2. **Deploy Application**:

```bash
git push origin main
# Netlify auto-deploys from main branch
```

3. **Verify Deployment**:

```bash
# Check health endpoint (create this first)
curl https://your-domain.netlify.app/api/health

# Response:
# {
#   "status": "healthy",
#   "database": {
#     "healthy": true,
#     "latencyMs": 42
#   }
# }
```

### Post-Deployment Validation

1. **Check audit logs are being written**:

```sql
SELECT
  COUNT(*) as total_events,
  MAX(timestamp) as last_event,
  COUNT(DISTINCT DATE(timestamp)) as days_with_data
FROM audit_logs;
```

2. **Monitor error rates**:

```sql
SELECT
  COUNT(*) FILTER (WHERE outcome = 'failure') as errors,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE outcome = 'failure') / COUNT(*), 2) as error_rate_percent
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours';
```

3. **Check database size**:

```sql
SELECT
  pg_size_pretty(pg_database_size('postgres')) as total_size,
  pg_size_pretty(pg_total_relation_size('audit_logs')) as audit_logs_size,
  pg_size_pretty(pg_total_relation_size('metrics')) as metrics_size;
```

---

## Backup and Recovery

### Automatic Backups (Supabase Pro)

- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Point-in-time recovery**: 7-day window

### Manual Backup

Create backup:

```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql

# Or using pg_dump directly
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  > backup-$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Restore full database
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  < backup-20251025.sql

# Restore specific table
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
  -c "COPY audit_logs FROM '/path/to/audit_logs_backup.csv' CSV HEADER"
```

### Point-in-Time Recovery (Supabase Dashboard)

1. Navigate to **Database** → **Backups**
2. Select **Point-in-time** tab
3. Choose timestamp (within 7-day window)
4. Click **Restore**
5. Confirm restore (creates new project)

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Database Performance Tuning](https://supabase.com/docs/guides/platform/performance)

---

## Support

For database-related issues:

1. Check this documentation first
2. Review Supabase logs in dashboard
3. Check application logs in Netlify
4. Contact Supabase support (Pro tier includes support)
5. Review internal team documentation

---

**Document Version**: 1.0
**Maintained By**: Technical Architecture Team
**Last Review**: October 25, 2025
**Next Review**: November 25, 2025
