# Database Architecture Quick Reference
## Medic-Bot - LA County Fire EMS

**Last Updated:** October 31, 2025

---

## Current State Summary

### What Exists Today

**Database Tables (Supabase PostgreSQL):**
- ✅ `audit_logs` - HIPAA-compliant event tracking (6-year retention)
- ✅ `users` - Paramedic/staff accounts with soft delete
- ✅ `sessions` - Multi-device session management
- ✅ `metrics` - Performance monitoring (90-day retention)
- ✅ `rate_limit_config` - Dynamic rate limiting
- ✅ `rate_limit_violations` - Abuse tracking with reputation scoring

**File-Based Storage (JSON):**
- ⚠️ `ems_kb_clean.json` - 11MB, 7,012 protocol documents
- ⚠️ `provider_impressions.json` - 28KB, 102 provider impressions
- ⚠️ `ems_epinephrine_dosing.json` - 230KB, medication dosing tables

**Total Migration Lines:** 1,586 SQL lines across 5 migrations

### What's Missing for Production

**Critical Gaps:**
1. No protocol data in database (file-based, can't query efficiently)
2. No ImageTrend ePCR integration schema
3. No patient context storage (needed for field use)
4. No audit trail for medication dosing
5. No analytics on protocol usage
6. Authentication exists but not enforced
7. Encryption at rest not verified
8. No Business Associate Agreements (BAAs) executed

**Production Readiness Score:** 60/100

---

## Schema at a Glance

### Core Entities

```
USERS (102 rows estimated)
├── Paramedics (60%)
├── EMTs (30%)
├── Medical Directors (5%)
└── Admins (5%)

PROTOCOLS (7,012 protocols)
├── Cardiac (12%)
├── Respiratory (8%)
├── Trauma (15%)
├── Neurological (10%)
└── Other (55%)

PATIENT_CONTEXTS (volatile, <24h retention)
├── Active calls (~50 concurrent during peak)
└── Auto-purged after 24 hours

AUDIT_LOGS (1.2M/year estimated)
├── 6-year retention (HIPAA)
└── Immutable (triggers prevent modification)
```

### Key Relationships

```
users (1) ──< (many) sessions
users (1) ──< (many) audit_logs
users (1) ──< (many) patient_contexts
patient_contexts (1) ──< (many) narrative_history
protocols (1) ──< (many) protocol_usage
protocols (1) ──< (many) protocol_versions
```

---

## Quick Commands

### Common Queries

```sql
-- Find protocol by TP code
SELECT * FROM protocols WHERE tp_code = '1210' AND deleted_at IS NULL;

-- Get user audit trail (last 30 days)
SELECT * FROM get_user_audit_trail('user_id', NOW() - INTERVAL '30 days', NOW());

-- Check current performance metrics
SELECT * FROM performance_metrics_dashboard;

-- Get top 10 most accessed protocols
SELECT tp_code, tp_name, access_count
FROM protocols
WHERE deleted_at IS NULL
ORDER BY access_count DESC, popularity_score DESC
LIMIT 10;

-- Find failed authentication attempts (last 24 hours)
SELECT * FROM get_failed_auth_attempts(24);

-- Check active sessions for user
SELECT * FROM get_user_sessions('user_uuid');

-- View recent patient contexts (expires soon)
SELECT id, epcr_id, chief_complaint, expires_at
FROM patient_contexts
WHERE expires_at < NOW() + INTERVAL '1 hour'
  AND auto_purge = TRUE;
```

### Maintenance Commands

```sql
-- Refresh materialized views (run hourly)
SELECT refresh_performance_views();

-- Archive old audit logs (run annually)
SELECT archive_old_audit_logs(CURRENT_DATE - INTERVAL '1 year');

-- Purge expired data (run daily)
SELECT * FROM purge_expired_data();

-- Create new monthly partition for audit logs
SELECT create_monthly_audit_partition();

-- Get slow queries (>3 seconds)
SELECT * FROM get_slow_queries(3000, 50);

-- Detect potential security breaches
SELECT * FROM detect_breach_patterns();
```

### Performance Analysis

```sql
-- Query execution plan
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM protocols WHERE search_vector @@ plainto_tsquery('english', 'chest pain');

-- Index usage statistics
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC;

-- Database cache hit ratio (should be >99%)
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

---

## Migration Priority Matrix

### Phase 1: Foundation (Weeks 1-2) - CRITICAL

**Priority 1A: Security & Compliance**
- [ ] Execute BAA with Supabase (upgrade to Pro: $25/month)
- [ ] Execute BAA with Netlify
- [ ] Enable database encryption at rest
- [ ] Verify TLS 1.3 for all connections
- [ ] Implement authentication (Supabase Auth)
- [ ] Test RLS policies with real users

**Priority 1B: Protocol Migration**
- [ ] Create `protocols` table
- [ ] Create `provider_impressions` table
- [ ] Create `medications` table
- [ ] Create `protocol_versions` table
- [ ] Write migration script (JSON → PostgreSQL)
- [ ] Create full-text search indexes
- [ ] Test protocol search performance (<50ms target)
- [ ] Deploy to staging
- [ ] Validate all 7,012 protocols migrated
- [ ] Cutover to database-backed search

**Estimated Effort:** 60-80 hours
**Risk Level:** MEDIUM
**Rollback Plan:** Keep JSON files as fallback for 30 days

### Phase 2: ImageTrend Integration (Weeks 3-4) - HIGH

**Priority 2A: Patient Data Model**
- [ ] Create `patient_contexts` table
- [ ] Create `narrative_history` table
- [ ] Create `imagetrend_sync` table
- [ ] Implement auto-purge triggers (24-hour expiration)
- [ ] Test encryption for PHI fields
- [ ] Create API endpoints for context creation

**Priority 2B: Sync Infrastructure**
- [ ] Build PostMessage communication layer
- [ ] Implement sync retry logic with exponential backoff
- [ ] Create sync status monitoring dashboard
- [ ] Test with ImageTrend sandbox
- [ ] Document integration protocol
- [ ] UAT with pilot users

**Estimated Effort:** 80-100 hours
**Risk Level:** MEDIUM-HIGH
**Dependencies:** Phase 1 complete, ImageTrend sandbox access

### Phase 3: Analytics & Optimization (Weeks 5-6) - MEDIUM

**Priority 3A: Usage Tracking**
- [ ] Create `protocol_usage` table
- [ ] Create `dosing_calculations` table
- [ ] Implement usage tracking triggers
- [ ] Create materialized views for analytics
- [ ] Set up pg_cron for automated refreshes

**Priority 3B: Performance**
- [ ] Implement connection pooling (5-20 connections)
- [ ] Deploy Redis cache (optional but recommended)
- [ ] Implement multi-level caching (L1: memory, L2: Redis)
- [ ] Load testing (100+ concurrent users)
- [ ] Query optimization based on load test results

**Estimated Effort:** 40-60 hours
**Risk Level:** LOW-MEDIUM

### Phase 4: Compliance & Security (Weeks 7-8) - CRITICAL

**Priority 4A: HIPAA Compliance**
- [ ] Implement field-level encryption for PHI
- [ ] Create breach detection system
- [ ] Implement data masking for non-admin users
- [ ] Add MFA support (Google Authenticator)
- [ ] Create HIPAA compliance report
- [ ] Document all security controls

**Priority 4B: Operational Readiness**
- [ ] Create security incident response plan
- [ ] User HIPAA training materials
- [ ] Automated backup testing (weekly)
- [ ] Disaster recovery runbook
- [ ] Third-party security audit (recommended)

**Estimated Effort:** 60-80 hours
**Risk Level:** HIGH (compliance critical)

### Phase 5: Production Deployment (Weeks 9-10) - CRITICAL

**Priority 5A: Deployment**
- [ ] Final staging validation
- [ ] Production database provisioning
- [ ] Data migration dry-run with production-like data
- [ ] Blue-green deployment to production
- [ ] Monitor error rates (first 24 hours)
- [ ] Monitor performance metrics (first week)

**Priority 5B: User Enablement**
- [ ] User training sessions (3 sessions: paramedics, EMTs, supervisors)
- [ ] Field testing with 3-5 pilot stations
- [ ] Collect feedback and iterate
- [ ] Document lessons learned
- [ ] Create support runbook

**Estimated Effort:** 60-80 hours
**Risk Level:** HIGH (production deployment)

**Total Estimated Effort:** 300-400 hours (8-10 weeks with 2 engineers)

---

## HIPAA Compliance Checklist

### Administrative Safeguards

- [ ] **Security Management Process:** Formal risk assessment documented
- [ ] **Assigned Security Responsibility:** Designate security officer
- [ ] **Workforce Training:** HIPAA training for all users (paramedics, admins)
- [ ] **Breach Response Plan:** Document incident response procedures
- [ ] **Business Associate Agreements:** Execute with Supabase, Netlify, (NOT OpenAI)

### Physical Safeguards

- [ ] **Facility Access:** N/A (cloud-based)
- [ ] **Workstation Security:** iPad security policies for field use
- [ ] **Device Encryption:** Enforce iPad encryption + passcode

### Technical Safeguards

- [ ] **Access Control:** Implement authentication + MFA
- [ ] **Audit Controls:** ✅ Already implemented (comprehensive logging)
- [ ] **Integrity Controls:** ✅ Already implemented (immutable audit trail)
- [ ] **Transmission Security:** ✅ TLS 1.3 enforced
- [ ] **Encryption at Rest:** Verify Supabase encryption enabled

### Privacy Safeguards

- [ ] **Minimum Necessary:** Auto-purge patient contexts after 24 hours
- [ ] **Notice of Privacy Practices:** Create user-facing privacy notice
- [ ] **Patient Rights:** N/A (not patient-facing application)
- [ ] **De-identification:** Anonymize audit logs after 1 year

**Current Compliance Score:** 50/100
**Target Score (Production):** 100/100

---

## Performance Targets

### Current Performance (File-Based)

| Metric | Current | Target (Database) |
|--------|---------|-------------------|
| Protocol search | 50-200ms | <50ms |
| Full KB load | 500ms | N/A (eliminated) |
| Cache lookup | 1-5ms | 1-5ms |
| Triage matching | 100-300ms | 50-100ms |

### Expected Database Performance

| Query Type | Target | SLA |
|------------|--------|-----|
| Protocol lookup (TP code) | <10ms | 99.9% |
| Full-text search (top 10) | <50ms | 99.5% |
| Insert audit log | <5ms | 99.9% |
| Patient context create | <20ms | 99% |
| Narrative save | <15ms | 99% |
| Analytics query | <100ms | 95% |

### Scalability Targets

| Users | Requests/min | Database CPU | Connections | Notes |
|-------|--------------|--------------|-------------|-------|
| 10 | 100 | <5% | <5 | Current load |
| 50 | 500 | <15% | <15 | Expected at launch |
| 100 | 1,000 | <30% | <30 | Peak hours |
| 500 | 5,000 | <70% | <50 | Future growth |

**Connection Pool Configuration:**
- Minimum: 5 connections
- Maximum: 20 connections (can scale to 50)
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

---

## Data Retention & Archival

### Retention Policy Summary

| Data Type | Retention | Archive After | Purge After |
|-----------|-----------|---------------|-------------|
| Audit logs | 6 years | 1 year | 6 years |
| Patient contexts | 24 hours | N/A | 24 hours |
| Narratives | 90 days | 30 days | 90 days |
| Protocols | Permanent | 5 years | Never |
| Users | Permanent | N/A | Soft delete only |
| Sessions | 60 minutes | N/A | On expiration |
| Metrics | 90 days | 30 days | 90 days |
| Dosing calculations | 6 years | 1 year | 6 years |

### Automated Jobs (pg_cron)

```sql
-- Daily purge (3 AM)
'0 3 * * *' → purge_expired_data()

-- Hourly materialized view refresh
'*/5 * * * *' → refresh_performance_views()

-- Monthly partition creation (1st of month)
'0 0 1 * *' → create_monthly_audit_partition()

-- Annual archival (January 1st, 2 AM)
'0 2 1 1 *' → archive_old_audit_logs()

-- Breach detection (every 15 minutes)
'*/15 * * * *' → detect_breach_patterns()
```

---

## Emergency Procedures

### Database Connection Failure

```bash
# Check Supabase status
curl -I https://your-project.supabase.co/rest/v1/

# Check connection pool
SELECT count(*) FROM pg_stat_activity WHERE datname = 'postgres';

# Kill idle connections (if pool exhausted)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes';
```

### Performance Degradation

```sql
-- Find slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '1 second'
ORDER BY duration DESC;

-- Kill slow query
SELECT pg_cancel_backend(pid);

-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) <your_slow_query>;

-- Refresh statistics
ANALYZE;
```

### Data Loss / Corruption

```bash
# Point-in-Time Recovery (within 7 days)
# Via Supabase dashboard: Settings > Database > Point-in-Time Recovery

# Full restore from backup
aws s3 cp s3://medic-bot-backups/daily/latest.dump.enc .
openssl enc -aes-256-cbc -d -in latest.dump.enc -out latest.dump -pass file:/keys/backup.key
pg_restore --host=new-host --username=postgres --clean --if-exists latest.dump
```

### Security Breach

```sql
-- Check for suspicious activity
SELECT * FROM detect_breach_patterns();

-- Get failed auth attempts
SELECT * FROM get_failed_auth_attempts(24);

-- Ban IP address
INSERT INTO rate_limit_violations (fingerprint, ip_address, is_banned, banned_until)
VALUES ('suspicious_user_hash', '192.168.1.100', TRUE, NOW() + INTERVAL '24 hours');

-- Revoke user access
UPDATE users SET deleted_at = NOW() WHERE email = 'compromised@example.com';
DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = 'compromised@example.com');
```

---

## Key Contacts & Resources

### Documentation
- **Full Architecture:** `/docs/DATABASE_ARCHITECTURE_COMPREHENSIVE.md`
- **Schema Diagrams:** `/docs/DATABASE_SCHEMA_DIAGRAM.md`
- **Setup Guide:** `/docs/DATABASE_SETUP.md`
- **Migrations:** `/supabase/migrations/`

### Support
- **Supabase Support:** support@supabase.com (Pro plan: priority)
- **Database Issues:** Check Supabase status page first
- **Security Incidents:** Follow incident response plan in comprehensive doc

### Monitoring
- **Supabase Dashboard:** https://app.supabase.com/project/[your-project]
- **Performance Metrics:** Query `performance_metrics_dashboard` table
- **Audit Logs:** Query `audit_logs` table with date filters

---

## Frequently Asked Questions

### Why migrate from JSON files to database?

**Current Issues:**
- 11MB JSON loaded into memory on every request
- No versioning or audit trail for protocol changes
- Can't efficiently query or filter protocols
- No analytics on protocol usage
- Memory-intensive for server instances

**Database Benefits:**
- Efficient querying with indexes (<50ms vs 50-200ms)
- Version control for regulatory compliance
- Real-time analytics on protocol usage
- Reduced memory footprint
- Medical director approval workflow
- Ability to update protocols without deployment

### How long will the migration take?

**Estimated Timeline:**
- Development & Testing: 6 weeks
- Staging Validation: 1 week
- Production Deployment: 1 week
- Pilot Testing: 2 weeks
- **Total: 10 weeks**

### What happens if the database goes down?

**Failover Strategy:**
1. Supabase has 99.9% uptime SLA
2. Point-in-Time Recovery (7 days)
3. Daily backups to S3
4. Can restore to new region within 2-4 hours
5. Keep JSON files as emergency fallback (30 days post-migration)

### How do we ensure HIPAA compliance?

**Required Steps:**
1. Execute BAAs with Supabase and Netlify
2. Enable encryption at rest and in transit
3. Implement audit logging (already done)
4. Auto-purge patient data after 24 hours
5. Never send PHI to OpenAI (sanitize prompts)
6. Implement breach detection and monitoring
7. User HIPAA training
8. Third-party security audit (recommended)

### What's the cost for Supabase Pro?

**Supabase Pro Plan:**
- Base: $25/month
- Compute: ~$10/month (estimated for 8GB RAM)
- Storage: ~$5/month (estimated for 50GB)
- **Total: ~$40/month**

Compared to managing own PostgreSQL infrastructure: Significant cost savings + reduced operational burden.

### How do we test the migration without breaking production?

**Testing Strategy:**
1. Development environment: Local PostgreSQL
2. Staging environment: Separate Supabase project
3. Migrate subset of data (1,000 protocols) first
4. Performance testing with realistic load
5. Blue-green deployment to production
6. Feature flag to switch between file-based and database
7. Monitor for 48 hours before full cutover
8. Keep rollback plan ready

---

**Document Version:** 2.0
**Last Updated:** October 31, 2025
**Next Review:** November 15, 2025 (post-Phase 1 completion)
