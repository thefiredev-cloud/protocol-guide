# Database Schema Diagram
## LA County Fire Medic-Bot - Supabase PostgreSQL

**Version**: 2.0.0
**Last Updated**: October 25, 2025

---

## Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LA COUNTY MEDIC-BOT DATABASE                     │
│                           Supabase PostgreSQL 15                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│         users                │
├──────────────────────────────┤
│ PK id                  UUID  │
│    email               TEXT  │◄─────┐
│    badge_number        TEXT  │      │
│    full_name           TEXT  │      │
│    role           user_role  │      │
│    station_id          TEXT  │      │
│    department          TEXT  │      │
│    created_at   TIMESTAMPTZ  │      │
│    updated_at   TIMESTAMPTZ  │      │
│    last_login   TIMESTAMPTZ  │      │
│    deleted_at   TIMESTAMPTZ  │      │
└──────────────────────────────┘      │
                │                     │
                │                     │
                ▼                     │
┌──────────────────────────────┐     │
│        sessions              │     │
├──────────────────────────────┤     │
│ PK id                  UUID  │     │
│ FK user_id             UUID  ├─────┘
│    fingerprint         TEXT  │
│    ip_address          INET  │
│    user_agent          TEXT  │
│    created_at   TIMESTAMPTZ  │
│    expires_at   TIMESTAMPTZ  │
│    last_activity TIMESTAMPTZ │
│    metadata           JSONB  │
└──────────────────────────────┘
                │
                │
                ▼
┌──────────────────────────────┐
│       audit_logs             │
├──────────────────────────────┤
│ PK event_id            UUID  │
│    timestamp    TIMESTAMPTZ  │
│ FK user_id          VARCHAR  │ (nullable - public access)
│    user_role      user_role  │
│    session_id       VARCHAR  │
│    action      audit_action  │ ◄─── ENUM (16 actions)
│    resource         VARCHAR  │
│    outcome     audit_outcome │ ◄─── ENUM (success|failure|partial)
│    metadata           JSONB  │
│    ip_address          INET  │
│    user_agent          TEXT  │
│    error_message       TEXT  │
│    duration_ms          INT  │
│    created_at   TIMESTAMPTZ  │
└──────────────────────────────┘
        │     │     │
        │     │     └─────────────────────────┐
        │     │                               │
        │     └───────────────────┐           │
        │                         │           │
        ▼                         ▼           ▼
┌──────────────────┐  ┌─────────────────────────────┐
│  audit_stats     │  │    audit_logs_recent        │
│ (Materialized)   │  │       (View)                │
├──────────────────┤  ├─────────────────────────────┤
│ date       DATE  │  │ All columns from audit_logs │
│ action          │  │ WHERE timestamp >= NOW()    │
│ outcome         │  │        - INTERVAL '30 days' │
│ event_count     │  │ ORDER BY timestamp DESC     │
│ avg_duration_ms │  └─────────────────────────────┘
│ p50_duration    │
│ p95_duration    │
│ p99_duration    │
└──────────────────┘


┌──────────────────────────────┐
│         metrics              │
├──────────────────────────────┤
│ PK id                  UUID  │
│    metric_name         TEXT  │
│    metric_type         TEXT  │ (counter | histogram)
│    date                DATE  │
│    hour                 INT  │
│    count             BIGINT  │
│    p50              NUMERIC  │
│    p95              NUMERIC  │
│    p99              NUMERIC  │
│    min_value        NUMERIC  │
│    max_value        NUMERIC  │
│    avg_value        NUMERIC  │
│    created_at   TIMESTAMPTZ  │
└──────────────────────────────┘
  UNIQUE(metric_name, date, hour)


┌──────────────────────────────┐
│   rate_limit_config          │
├──────────────────────────────┤
│ PK id                  UUID  │
│    limit_type          TEXT  │ UNIQUE
│    requests_per_window  INT  │
│    window_ms            INT  │
│    error_message       TEXT  │
│    enabled          BOOLEAN  │
│    updated_at   TIMESTAMPTZ  │
│ FK updated_by          UUID  ├───┐
└──────────────────────────────┘   │
                                   │
                                   │
┌──────────────────────────────┐   │
│  rate_limit_violations       │   │
├──────────────────────────────┤   │
│ PK id                  UUID  │   │
│    fingerprint         TEXT  │   │
│    ip_address          INET  │   │
│    limit_type          TEXT  │   │
│    violation_count      INT  │   │
│    reputation_score     INT  │   │
│    is_banned        BOOLEAN  │   │
│    first_violation TIMESTAMP │   │
│    last_violation  TIMESTAMP │   │
│    banned_until    TIMESTAMP │   │
└──────────────────────────────┘   │
                                   │
                                   ▼
                          (references users.id)


┌──────────────────────────────┐
│     knowledge_base           │
│    (Future: Phase 3)         │
├──────────────────────────────┤
│ PK id                  UUID  │
│    title               TEXT  │
│    content             TEXT  │
│    category            TEXT  │
│    protocol_section    TEXT  │
│    version              INT  │
│    is_active        BOOLEAN  │
│    embedding      VECTOR(1536)│ ◄─── pgvector extension
│    metadata           JSONB  │
│    created_at   TIMESTAMPTZ  │
│    updated_at   TIMESTAMPTZ  │
└──────────────────────────────┘
        │
        │
        ▼
┌──────────────────────────────┐
│    protocol_access           │
│    (Analytics)               │
├──────────────────────────────┤
│ PK id                  UUID  │
│    protocol_id         TEXT  │
│    protocol_name       TEXT  │
│    protocol_section    TEXT  │
│    query               TEXT  │
│ FK user_id             UUID  ├───┐
│    session_id          TEXT  │   │
│    search_rank          INT  │   │
│    was_helpful      BOOLEAN  │   │
│    accessed_at  TIMESTAMPTZ  │   │
└──────────────────────────────┘   │
                                   │
                                   └─► (references users.id)
```

---

## Table Relationships

### Primary Relationships

1. **users → sessions** (One-to-Many)
   - One user can have multiple active sessions (multi-device)
   - Cascade delete: When user deleted, all sessions removed

2. **users → audit_logs** (One-to-Many)
   - One user generates many audit events
   - Nullable: Public access mode supports anonymous users
   - Set null on delete: Audit logs preserved when user deleted

3. **users → protocol_access** (One-to-Many)
   - Track which protocols each user accessed
   - Set null on delete: Analytics preserved

4. **users → rate_limit_config** (One-to-Many)
   - Track which admin updated rate limit settings
   - Set null on delete: Config preserved

### Derived Relationships

5. **audit_logs → audit_stats** (Materialized View)
   - Daily aggregation of audit events
   - Refreshed via cron job (daily at 2am)

6. **audit_logs → audit_logs_recent** (View)
   - Rolling 30-day window for quick access
   - No storage overhead (virtual view)

---

## Index Strategy Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    INDEX COVERAGE MAP                           │
└─────────────────────────────────────────────────────────────────┘

audit_logs (8 indexes):
├─ B-tree: timestamp DESC ████████████ (time-series queries)
├─ B-tree: user_id ████████████████████ (user audit trails)
├─ B-tree: session_id ██████████████ (session correlation)
├─ B-tree: action ████████████████████ (action filtering)
├─ B-tree: outcome ██████████████ (success/failure queries)
├─ B-tree: resource ████████████ (resource access tracking)
├─ B-tree: (user_id, timestamp DESC) ████████ (user timeline)
└─ GIN: metadata ████████████████ (JSONB searches)

metrics (3 indexes):
├─ Unique: (metric_name, date, hour) ████████████ (prevent duplicates)
├─ B-tree: date DESC ████████████████ (time-series analytics)
└─ B-tree: metric_name ████████████ (metric filtering)

sessions (3 indexes):
├─ B-tree: user_id ████████████████████ (user sessions lookup)
├─ B-tree: expires_at ████████████ (cleanup expired)
└─ B-tree: fingerprint ████████████ (device tracking)

rate_limit_violations (3 indexes):
├─ B-tree: fingerprint ████████████████████ (rate limit checks)
├─ B-tree: ip_address ████████████ (IP-based blocking)
└─ Partial: is_banned ████████ (WHERE is_banned = TRUE)

knowledge_base (3 indexes):
├─ IVFFlat: embedding ████████████████ (vector similarity)
├─ GIN: to_tsvector(content) ████████████ (full-text search)
└─ Partial: is_active ████████ (WHERE is_active = TRUE)
```

---

## Data Flow Diagrams

### 1. Audit Log Flow

```
┌─────────────────┐
│  User Action    │
│ (Chat Query)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      API Route Handler              │
│  (/app/api/chat/route.ts)           │
│                                     │
│  1. Receive request                 │
│  2. Extract user info (if any)      │
│  3. Process query                   │
│  4. Generate response               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     AuditLogger.logChatStream()     │
│  (/lib/audit/audit-logger.ts)       │
│                                     │
│  • Generate UUID event_id           │
│  • Add timestamp                    │
│  • Extract IP, User-Agent           │
│  • Calculate duration_ms            │
│  • Sanitize metadata (no PHI)       │
└────────┬────────────────────────────┘
         │
         ├──────────────────┬─────────────────┐
         ▼                  ▼                 ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────┐
│  File Sink     │  │ Database     │  │   Console    │
│  (Backup)      │  │  (Primary)   │  │   (Dev)      │
│                │  │              │  │              │
│ audit-{date}   │  │ INSERT INTO  │  │ console.log  │
│   .jsonl       │  │ audit_logs   │  │ [AUDIT]...   │
└────────────────┘  └──────┬───────┘  └──────────────┘
                           │
                           ▼
                   ┌──────────────────┐
                   │  PostgreSQL      │
                   │  audit_logs      │
                   │   table          │
                   └──────────────────┘
```

### 2. Metrics Collection Flow

```
┌──────────────────────┐
│   API Request        │
│  (Any endpoint)      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Request Handler (middleware)       │
│                                      │
│   const startTime = Date.now();      │
│   // Process request...              │
│   const duration = Date.now() - start│
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   MetricsRegistry                    │
│   (/lib/managers/metrics-manager.ts) │
│                                      │
│   metrics.inc('api.requests')        │
│   metrics.observe('api.latency', dur)│
└──────────┬───────────────────────────┘
           │
           │ (In-memory accumulation)
           │
           ▼
┌──────────────────────────────────────┐
│   Hourly Flush (Cron Job)            │
│   /api/cron/flush-metrics            │
│                                      │
│   1. Calculate percentiles           │
│   2. Prepare batch insert            │
│   3. Upsert to database              │
│   4. Clear in-memory cache           │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   PostgreSQL metrics table           │
│                                      │
│   UPSERT ON CONFLICT                 │
│   (metric_name, date, hour)          │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Analytics Dashboard                │
│   /api/metrics/summary               │
│                                      │
│   SELECT * FROM metrics              │
│   WHERE date >= NOW() - INTERVAL...  │
└──────────────────────────────────────┘
```

### 3. Rate Limiting Flow

```
┌──────────────────┐
│  Incoming Request│
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Generate Fingerprint              │
│   (IP + User-Agent + Headers)       │
│                                     │
│   fingerprint = sha256(...)         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Check In-Memory Cache             │
│   (5-minute TTL)                    │
│                                     │
│   if (cache.has(fingerprint))       │
│     return cache.get(fingerprint)   │
└────────┬────────────────────────────┘
         │ Cache Miss
         ▼
┌─────────────────────────────────────┐
│   Query Database                    │
│   rate_limit_config table           │
│                                     │
│   SELECT * FROM rate_limit_config   │
│   WHERE limit_type = 'CHAT'         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   EnhancedRateLimiter.check()       │
│                                     │
│   • Increment request counter       │
│   • Check against limit             │
│   • Update reputation score         │
│   • Return: { allowed, remaining }  │
└────────┬────────────────────────────┘
         │
         ├──────────────┬─────────────┐
         ▼              ▼             ▼
┌────────────┐  ┌──────────────┐  ┌────────────────┐
│  Allowed   │  │  Rate Limited│  │  Banned        │
│            │  │              │  │                │
│ Process    │  │ 429 Too Many │  │ 403 Forbidden  │
│ Request    │  │ Requests     │  │                │
└────────────┘  └──────┬───────┘  └────────┬───────┘
                       │                   │
                       └─────────┬─────────┘
                                 ▼
                   ┌──────────────────────────────┐
                   │  Log Violation               │
                   │  rate_limit_violations table │
                   │                              │
                   │  • Decrement reputation      │
                   │  • Log violation event       │
                   │  • Auto-ban if score < 10    │
                   └──────────────────────────────┘
```

---

## Database Size Projections

### Growth Estimates (3,200 Users, 450K Queries/Year)

```
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE SIZE PROJECTIONS                     │
└─────────────────────────────────────────────────────────────────┘

audit_logs:
├─ Year 1:   50,000 events/day × 365 days × 500 bytes = 9.1 GB
├─ Year 2:   18.2 GB (cumulative)
├─ Year 3:   27.3 GB
├─ Year 4:   36.4 GB
├─ Year 5:   45.5 GB
└─ Year 6:   54.6 GB ◄── 6-year retention limit

metrics (90-day rolling):
├─ 100 metrics/hour × 24 hours × 90 days × 200 bytes = 43 MB
└─ Constant (after 90 days, old data deleted)

sessions (active only):
├─ 500 concurrent users × 300 bytes = 150 KB
└─ Negligible

rate_limit_violations (30-day rolling):
├─ ~1,000 violations/day × 30 days × 400 bytes = 12 MB
└─ Constant (after 30 days, old data deleted)

knowledge_base (future):
├─ 1,500 protocol sections × 2 KB content = 3 MB
├─ + 1,500 embeddings × 1536 dimensions × 4 bytes = 9 MB
└─ Total: 12 MB

protocol_access (1-year retention):
├─ 450,000 queries/year × 300 bytes = 135 MB/year
└─ Archived annually

TOTAL (6 years):
├─ audit_logs: 54.6 GB
├─ metrics: 0.043 GB
├─ sessions: 0.0001 GB
├─ violations: 0.012 GB
├─ knowledge_base: 0.012 GB
├─ protocol_access: 0.135 GB/year × 1 year = 0.135 GB
└─ GRAND TOTAL: ~55 GB (6-year max)

Recommended Supabase Plan:
├─ Free Tier: 500 MB ❌ INSUFFICIENT
├─ Pro Tier: 8 GB + overage ❌ INSUFFICIENT (after Year 1)
└─ Team Tier: 100 GB ✅ RECOMMENDED ($599/mo)
    Alternative: Implement archival to S3 after 1 year
```

---

## Backup & Recovery Strategy

### Backup Schedule

```
┌────────────────────────────────────────────────────────────┐
│                    BACKUP SCHEDULE                         │
└────────────────────────────────────────────────────────────┘

Daily Full Backup (Automated by Supabase):
├─ Time: 2:00 AM PST
├─ Retention: 30 days
├─ Location: Supabase managed storage
└─ Restore: Point-in-time recovery (7-day window)

Weekly Archive to S3:
├─ Time: Sunday 3:00 AM PST
├─ Retention: 1 year
├─ Location: AWS S3 (us-west-2)
├─ Format: Compressed CSV (gzip)
└─ Purpose: Long-term archival, compliance

Monthly Cold Storage:
├─ Time: 1st of month, 4:00 AM PST
├─ Retention: 6 years
├─ Location: AWS S3 Glacier
├─ Format: Encrypted, compressed
└─ Purpose: HIPAA 6-year retention

Annual Compliance Archive:
├─ Time: January 1st
├─ Retention: 10 years
├─ Location: S3 Glacier Deep Archive
├─ Format: Encrypted, audited
└─ Purpose: Legal compliance, audit defense
```

### Recovery Procedures

```
┌────────────────────────────────────────────────────────────┐
│              DISASTER RECOVERY PROCEDURES                  │
└────────────────────────────────────────────────────────────┘

Scenario 1: Accidental Table Drop
├─ RTO: 15 minutes
├─ RPO: 0 minutes (point-in-time recovery)
└─ Steps:
    1. Stop all writes to database
    2. Use Supabase dashboard: Database → Backups
    3. Select backup point (within 7-day window)
    4. Restore specific table
    5. Validate data integrity
    6. Resume application

Scenario 2: Database Corruption
├─ RTO: 1 hour
├─ RPO: 24 hours (daily backup)
└─ Steps:
    1. Create new Supabase project
    2. Restore from latest daily backup
    3. Update connection strings
    4. Run validation queries
    5. Switch DNS to new database
    6. Monitor for errors

Scenario 3: Regional Failure (AWS us-west-2)
├─ RTO: 4 hours
├─ RPO: 24 hours
└─ Steps:
    1. Create Supabase project in us-east-1
    2. Restore from S3 weekly archive
    3. Run migration scripts
    4. Update environment variables
    5. Failover via DNS
    6. Notify users of potential data loss

Scenario 4: Compliance Audit (Historical Data)
├─ RTO: N/A (read-only)
├─ RPO: N/A
└─ Steps:
    1. Identify audit date range
    2. Download from S3 Glacier (3-5 hours retrieval)
    3. Decompress and decrypt
    4. Import to temporary database
    5. Generate compliance reports
    6. Provide to auditors
```

---

## Migration Checklist

### Pre-Migration Validation

```
□ Supabase project created (us-west-2 region)
□ Connection strings added to .env
□ Supabase client installed (@supabase/supabase-js)
□ Migration files reviewed and tested
□ Backup of current file-based audit logs
□ RLS policies documented
□ Index strategy reviewed
□ Performance benchmarks established
```

### Migration Execution

```
Phase 1: Foundation (Week 1)
□ Run migration 001_audit_logs.sql
□ Run migration 002_users_sessions.sql
□ Run migration 003_metrics.sql
□ Run migration 004_rate_limits.sql
□ Run migration 005_protocol_access.sql
□ Run migration 006_rls_policies.sql
□ Verify all tables created
□ Verify all indexes created
□ Test helper functions

Phase 2: Dual-Write (Week 2)
□ Update AuditLogger for database writes
□ Deploy dual-write code
□ Monitor for errors
□ Validate data consistency
□ Backfill historical audit logs

Phase 3: Migration (Week 3)
□ Update API routes to query database
□ Migrate metrics to database
□ Migrate rate limit config
□ Test all endpoints
□ Performance testing

Phase 4: Cutover (Week 4)
□ Disable file-based audit logging
□ Remove file-based code
□ Archive old log files to S3
□ Update monitoring dashboards
□ Document new architecture
```

---

**Document Version**: 1.0
**Last Updated**: October 25, 2025
**Related Documents**:
- DATABASE_ARCHITECTURE_ANALYSIS.md
- technical-architecture.md
