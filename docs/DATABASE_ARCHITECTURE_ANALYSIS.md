# Database Architecture Analysis & Recommendations
## LA County Fire Medic-Bot

**Date**: October 25, 2025
**Version**: 2.0.0
**Classification**: Internal Technical Documentation

---

## Executive Summary

The Medic-Bot system currently operates with a **hybrid data storage architecture**:
- **File-based audit logging** (JSON Lines format) for HIPAA compliance
- **In-memory metrics tracking** (MetricsRegistry class)
- **In-memory rate limiting** (EnhancedRateLimiter class)
- **Supabase PostgreSQL schema designed** but **NOT IMPLEMENTED**

This analysis identifies critical gaps in data persistence, scalability, and provides a comprehensive migration strategy to a production-ready Supabase architecture.

### Key Findings

**CRITICAL GAPS:**
1. No persistent user management (authentication removed in v2.0)
2. Metrics lost on server restart (in-memory only)
3. Rate limiting not distributed (single-server limitation)
4. Audit logs stored as files (scalability concerns)
5. No database connection established (Supabase schema unused)

**IMMEDIATE PRIORITIES:**
1. Implement Supabase client connection
2. Migrate audit logs from files to PostgreSQL
3. Add metrics persistence with daily aggregation
4. Create rate limit configuration table
5. Implement user session tracking (future authentication)

---

## Current Architecture Overview

### 1. Audit Logging System

**Current Implementation**: File-Based (JSONL)
- **Location**: `/logs/audit-{date}.jsonl`
- **Format**: JSON Lines (one event per line)
- **Rotation**: Daily (2,190 files = 6 years retention)
- **Size**: ~1MB per day (estimated 50,000 events/day)

**Schema (Implemented in Code)**:
```typescript
interface AuditEvent {
  eventId: string;          // UUID v4
  timestamp: string;        // ISO 8601
  userId?: string;          // Optional (public access)
  userRole?: UserRole;      // paramedic | emt | medical_director | admin | guest
  sessionId?: string;       // Session correlation
  action: AuditAction;      // 16 predefined actions
  resource: string;         // Protocol name, medication ID, etc.
  outcome: AuditOutcome;    // success | failure | partial
  metadata?: Record<string, unknown>;  // Flexible JSONB
  ipAddress?: string;       // Client IP
  userAgent?: string;       // Browser/client info
  errorMessage?: string;    // Error details
  durationMs?: number;      // Performance tracking
}
```

**Supported Actions**:
- `chat.query`, `chat.stream` (protocol queries)
- `dosing.calculate`, `dosing.list` (medication dosing)
- `protocol.view`, `protocol.search` (protocol access)
- `user.login`, `user.logout`, `user.session.start`, `user.session.end`
- `auth.failure`, `auth.unauthorized` (security events)
- `api.error`, `api.validation_error` (error tracking)
- `system.startup`, `system.shutdown` (system events)

**Current Issues**:
- File I/O performance degrades with large log volumes
- No efficient querying (full file scan required)
- No aggregation or analytics capabilities
- Difficult to query across date ranges
- Manual cleanup required for old files

### 2. Metrics Management System

**Current Implementation**: In-Memory (MetricsRegistry class)
- **Storage**: JavaScript Map objects (volatile)
- **Types**: Counters and Histograms
- **Retention**: Lost on server restart
- **Aggregation**: In-memory percentile calculations (P50, P95, P99)

**Tracked Metrics**:
- Request counters by endpoint
- Latency histograms (P50/P95/P99)
- Error rates by status code
- LLM API call durations
- Database query times (when implemented)

**Current Issues**:
- No persistence (data lost on restart)
- No historical trending (limited to last 30 days in memory)
- No distributed metrics (multi-server deployment impossible)
- Memory limitations (max 1000 values per histogram)

### 3. Rate Limiting System

**Current Implementation**: In-Memory (EnhancedRateLimiter class)
- **Storage**: JavaScript Map objects
- **Fingerprinting**: SHA256 hash (IP + User-Agent + headers)
- **Reputation Tracking**: 0-100 score (ban threshold: 10)
- **Cleanup**: Every 5 minutes (prevents memory leaks)

**Rate Limit Configurations**:
```typescript
CHAT: { limit: 20, windowMs: 60_000 }          // 20 requests/min
API: { limit: 60, windowMs: 60_000 }           // 60 requests/min
DOSING: { limit: 30, windowMs: 60_000 }        // 30 requests/min
AUTH: { limit: 5, windowMs: 900_000 }          // 5 attempts/15min
PHI: { limit: 50, windowMs: 60_000 }           // 50 requests/min
GLOBAL: { limit: 500, windowMs: 900_000 }      // 500 requests/15min
```

**Current Issues**:
- Not distributed (load balancer breaks rate limiting)
- Reputation scores lost on restart
- No admin dashboard for monitoring
- No configuration management (hardcoded)

### 4. Knowledge Base Storage

**Current Implementation**: Static JSON Files
- **Location**: `/data/ems_kb_clean.json` (11MB)
- **Format**: JSON array of protocol documents
- **Search**: In-memory BM25 index (MiniSearch library)
- **Updates**: Manual file replacement + deploy

**Schema**:
```typescript
interface KnowledgeBaseAsset {
  id: string;
  title: string;
  category: string;
  content: string;
  protocol_section?: string;
  // No embeddings or vector search (planned for Phase 3)
}
```

**Current Issues**:
- No versioning or change tracking
- No real-time updates (requires deployment)
- No semantic search (only keyword-based)
- Large initial load (11MB download)

---

## Supabase Database Schema (Designed but NOT Implemented)

The file `/supabase/migrations/001_audit_logs.sql` contains a **comprehensive PostgreSQL schema** that has been designed but **NEVER EXECUTED**. No database connection exists in the codebase.

### Schema Overview

#### 1. Custom Types (ENUMs)

```sql
CREATE TYPE audit_action AS ENUM (
  'user.login', 'user.logout', 'user.session.start', 'user.session.end',
  'chat.query', 'chat.stream', 'dosing.calculate', 'dosing.list',
  'protocol.view', 'protocol.search',
  'auth.failure', 'auth.unauthorized', 'api.error', 'api.validation_error',
  'system.startup', 'system.shutdown'
);

CREATE TYPE audit_outcome AS ENUM ('success', 'failure', 'partial');

CREATE TYPE user_role AS ENUM (
  'paramedic', 'emt', 'medical_director', 'admin', 'guest'
);
```

#### 2. Audit Logs Table

**Table**: `audit_logs`
**Purpose**: Immutable audit trail for HIPAA compliance
**Retention**: 6 years (2,190 days)

```sql
CREATE TABLE audit_logs (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User identification
  user_id VARCHAR(255),
  user_role user_role,
  session_id VARCHAR(255),

  -- Event details
  action audit_action NOT NULL,
  resource VARCHAR(500) NOT NULL,
  outcome audit_outcome NOT NULL,

  -- Additional context
  metadata JSONB,

  -- Network information
  ip_address INET,
  user_agent TEXT,

  -- Error tracking
  error_message TEXT,

  -- Performance tracking
  duration_ms INTEGER,

  -- Audit trail metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms >= 0),
  CONSTRAINT valid_timestamp CHECK (timestamp <= NOW() + INTERVAL '1 hour')
);
```

**Indexes** (8 total):
```sql
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_outcome ON audit_logs(outcome);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN(metadata);
```

**Immutability Triggers**:
```sql
-- Prevent updates and deletes (append-only)
CREATE TRIGGER audit_logs_prevent_update BEFORE UPDATE
CREATE TRIGGER audit_logs_prevent_delete BEFORE DELETE
```

#### 3. Audit Statistics (Materialized View)

**View**: `audit_stats`
**Purpose**: Daily aggregated statistics
**Refresh**: Daily via cron job

```sql
CREATE MATERIALIZED VIEW audit_stats AS
SELECT
  DATE(timestamp) as date,
  action,
  outcome,
  COUNT(*) as event_count,
  AVG(duration_ms) as avg_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_duration_ms
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '90 days'
  AND duration_ms IS NOT NULL
GROUP BY DATE(timestamp), action, outcome;
```

#### 4. Helper Functions

**Cleanup Function**:
```sql
CREATE FUNCTION cleanup_old_audit_logs() RETURNS INTEGER
-- Deletes logs older than 6 years
```

**User Audit Trail**:
```sql
CREATE FUNCTION get_user_audit_trail(
  p_user_id VARCHAR,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS TABLE (...)
```

**Failed Auth Attempts**:
```sql
CREATE FUNCTION get_failed_auth_attempts(p_hours INTEGER DEFAULT 24)
```

**Audit Summary**:
```sql
CREATE FUNCTION get_audit_summary(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS TABLE (total_events, success_count, failure_count, ...)
```

---

## Identified Schema Gaps

### 1. Missing Tables

#### A. Users Table (Critical for Authentication)
**Status**: Not implemented (authentication removed in v2.0)
**Need**: Required for future user management and session tracking

**Recommended Schema**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  email TEXT UNIQUE NOT NULL,
  badge_number TEXT UNIQUE,
  full_name TEXT NOT NULL,

  -- Role & Department
  role user_role NOT NULL DEFAULT 'paramedic',
  station_id TEXT,
  department TEXT NOT NULL DEFAULT 'lacfd',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_badge_number ON users(badge_number) WHERE badge_number IS NOT NULL;
CREATE INDEX idx_users_station_id ON users(station_id) WHERE station_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
```

#### B. Sessions Table (For User Session Tracking)
**Status**: Not implemented
**Need**: Track active sessions, enable multi-device support

**Recommended Schema**:
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Session details
  fingerprint TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_fingerprint ON sessions(fingerprint);

-- Cleanup expired sessions trigger
CREATE FUNCTION cleanup_expired_sessions() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_sessions
  AFTER INSERT ON sessions
  EXECUTE FUNCTION cleanup_expired_sessions();
```

#### C. Metrics Table (Historical Performance Data)
**Status**: Not implemented (in-memory only)
**Need**: Persistent metrics for analytics and trending

**Recommended Schema**:
```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metric identification
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'counter' | 'histogram'

  -- Time bucket
  date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour < 24),

  -- Counter metrics
  count BIGINT,

  -- Histogram metrics
  p50 NUMERIC,
  p95 NUMERIC,
  p99 NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  avg_value NUMERIC,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_metrics_unique ON metrics(metric_name, date, hour);
CREATE INDEX idx_metrics_date ON metrics(date DESC);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
```

#### D. Rate Limit Configuration Table
**Status**: Hardcoded in application
**Need**: Dynamic rate limit management without deployment

**Recommended Schema**:
```sql
CREATE TABLE rate_limit_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Configuration
  limit_type TEXT UNIQUE NOT NULL, -- 'CHAT' | 'API' | 'DOSING' | etc.
  requests_per_window INTEGER NOT NULL,
  window_ms INTEGER NOT NULL,
  error_message TEXT NOT NULL,

  -- Admin control
  enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Seed with current configuration
INSERT INTO rate_limit_config (limit_type, requests_per_window, window_ms, error_message) VALUES
  ('CHAT', 20, 60000, 'Too many chat requests. Please slow down.'),
  ('API', 60, 60000, 'Rate limit exceeded. Please wait.'),
  ('DOSING', 30, 60000, 'Too many dosing calculations.'),
  ('AUTH', 5, 900000, 'Too many authentication attempts.'),
  ('PHI', 50, 60000, 'Access rate limit exceeded.'),
  ('GLOBAL', 500, 900000, 'Global rate limit exceeded.');
```

#### E. Rate Limit Violations Table
**Status**: Not tracked persistently
**Need**: Reputation tracking and abuse prevention

**Recommended Schema**:
```sql
CREATE TABLE rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifier
  fingerprint TEXT NOT NULL,
  ip_address INET,

  -- Violation details
  limit_type TEXT NOT NULL,
  violation_count INTEGER DEFAULT 1,

  -- Reputation
  reputation_score INTEGER DEFAULT 100,
  is_banned BOOLEAN DEFAULT FALSE,

  -- Timestamps
  first_violation TIMESTAMPTZ DEFAULT NOW(),
  last_violation TIMESTAMPTZ DEFAULT NOW(),
  banned_until TIMESTAMPTZ
);

CREATE INDEX idx_violations_fingerprint ON rate_limit_violations(fingerprint);
CREATE INDEX idx_violations_ip ON rate_limit_violations(ip_address);
CREATE INDEX idx_violations_banned ON rate_limit_violations(is_banned) WHERE is_banned = TRUE;
```

#### F. Knowledge Base Table (Future: Vector Search)
**Status**: Static JSON files
**Need**: Versioning, semantic search, real-time updates

**Recommended Schema (Phase 3)**:
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  protocol_section TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,

  -- Vector search (OpenAI embeddings: 1536 dimensions)
  embedding VECTOR(1536),

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX idx_kb_embedding ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Full-text search index
CREATE INDEX idx_kb_content ON knowledge_base USING GIN(to_tsvector('english', content));
CREATE INDEX idx_kb_active ON knowledge_base(is_active) WHERE is_active = TRUE;
```

#### G. Protocol Access Log (Analytics)
**Status**: Limited metadata in audit logs
**Need**: Detailed analytics on protocol usage

**Recommended Schema**:
```sql
CREATE TABLE protocol_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Protocol details
  protocol_id TEXT NOT NULL,
  protocol_name TEXT NOT NULL,
  protocol_section TEXT,

  -- Access context
  query TEXT, -- Original user query
  user_id UUID REFERENCES users(id),
  session_id TEXT,

  -- Analytics
  search_rank INTEGER, -- Position in search results
  was_helpful BOOLEAN, -- User feedback

  -- Timestamps
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_protocol_access_protocol_id ON protocol_access(protocol_id);
CREATE INDEX idx_protocol_access_user_id ON protocol_access(user_id);
CREATE INDEX idx_protocol_access_date ON protocol_access(accessed_at DESC);
```

### 2. Missing Relationships

Current schema has **no foreign key relationships** except in recommended tables above.

**Recommended Relationships**:
```sql
-- Sessions → Users
ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Audit Logs → Users (optional, for authenticated users)
ALTER TABLE audit_logs
  ADD CONSTRAINT fk_audit_logs_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Protocol Access → Users
ALTER TABLE protocol_access
  ADD CONSTRAINT fk_protocol_access_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Rate Limit Config → Users (admin tracking)
ALTER TABLE rate_limit_config
  ADD CONSTRAINT fk_rate_limit_config_updated_by
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
```

### 3. Missing Indexes for Performance

**Additional Recommended Indexes**:
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_audit_logs_action_outcome_timestamp
  ON audit_logs(action, outcome, timestamp DESC);

CREATE INDEX idx_audit_logs_resource_timestamp
  ON audit_logs(resource, timestamp DESC);

-- Partial indexes for filtered queries
CREATE INDEX idx_audit_logs_failures
  ON audit_logs(timestamp DESC) WHERE outcome = 'failure';

CREATE INDEX idx_sessions_active
  ON sessions(user_id, last_activity DESC) WHERE expires_at > NOW();
```

---

## Row Level Security (RLS) Policies

Supabase requires RLS policies for secure multi-tenant access. The current schema has **NO RLS POLICIES DEFINED**.

### Recommended RLS Policies

#### 1. Audit Logs (Read-Only for Admins)

```sql
-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read all audit logs"
  ON audit_logs FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'medical_director')
  );

-- Policy: System can insert audit logs (bypass RLS)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Prevent all updates and deletes (handled by triggers)
CREATE POLICY "No updates allowed"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed"
  ON audit_logs FOR DELETE
  USING (false);
```

#### 2. Users Table

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policy: Admins can manage users
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

#### 3. Sessions Table

```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own sessions
CREATE POLICY "Users can read own sessions"
  ON sessions FOR SELECT
  USING (user_id = auth.uid());

-- Policy: System can manage sessions
CREATE POLICY "System can manage sessions"
  ON sessions FOR ALL
  WITH CHECK (true);
```

#### 4. Metrics Table (Read-Only)

```sql
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read metrics
CREATE POLICY "Authenticated users can read metrics"
  ON metrics FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: System can insert metrics
CREATE POLICY "System can insert metrics"
  ON metrics FOR INSERT
  WITH CHECK (true);
```

#### 5. Rate Limit Configuration (Admin Only)

```sql
ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read rate limit config
CREATE POLICY "Public read rate limit config"
  ON rate_limit_config FOR SELECT
  USING (enabled = true);

-- Policy: Only admins can modify
CREATE POLICY "Admins can manage rate limits"
  ON rate_limit_config FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Data Migration Strategy

### Phase 1: Database Connection Setup (Week 1)

**Tasks**:
1. Create Supabase project (US-West region for LA County)
2. Install Supabase client: `npm install @supabase/supabase-js`
3. Create connection utility: `/lib/db/supabase.ts`
4. Add environment variables:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

**Implementation**:
```typescript
// /lib/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### Phase 2: Run Database Migrations (Week 1)

**Tasks**:
1. Execute `001_audit_logs.sql` migration
2. Verify indexes and triggers
3. Test helper functions
4. Create additional tables (users, sessions, metrics, rate_limits)

**Migration Files**:
```bash
supabase/migrations/
├── 001_audit_logs.sql           # Existing (review and execute)
├── 002_users_sessions.sql       # NEW: User management
├── 003_metrics.sql              # NEW: Metrics persistence
├── 004_rate_limits.sql          # NEW: Rate limit config
├── 005_protocol_access.sql      # NEW: Analytics
└── 006_rls_policies.sql         # NEW: Row Level Security
```

### Phase 3: Migrate Audit Logs (Week 2)

**Strategy**: Dual-write during transition period

**Step 1**: Update AuditLogger to write to both file and database
```typescript
// /lib/audit/audit-logger.ts
private async writeEvent(event: AuditEvent): Promise<void> {
  // File sink (keep for backup)
  if (this.config.fileEnabled) {
    await this.writeToFile(event);
  }

  // Database sink (new)
  if (process.env.ENABLE_DB_AUDIT === 'true') {
    await this.writeToDatabase(event);
  }
}

private async writeToDatabase(event: AuditEvent): Promise<void> {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      event_id: event.eventId,
      timestamp: event.timestamp,
      user_id: event.userId,
      user_role: event.userRole,
      session_id: event.sessionId,
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      metadata: event.metadata,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      error_message: event.errorMessage,
      duration_ms: event.durationMs
    });

  if (error) {
    console.error('Failed to write audit log to database:', error);
    // Don't throw - audit logging should not crash the app
  }
}
```

**Step 2**: Backfill historical audit logs
```typescript
// /scripts/backfill-audit-logs.ts
import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '@/lib/db/supabase';

async function backfillAuditLogs() {
  const logDir = path.join(process.cwd(), 'logs');
  const files = fs.readdirSync(logDir)
    .filter(f => f.startsWith('audit-') && f.endsWith('.jsonl'))
    .sort();

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(logDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');

    const batch = [];
    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        batch.push({
          event_id: event.eventId,
          timestamp: event.timestamp,
          user_id: event.userId,
          user_role: event.userRole,
          session_id: event.sessionId,
          action: event.action,
          resource: event.resource,
          outcome: event.outcome,
          metadata: event.metadata,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          error_message: event.errorMessage,
          duration_ms: event.durationMs
        });

        // Insert in batches of 1000
        if (batch.length >= 1000) {
          await insertBatch(batch);
          batch.length = 0;
        }
      } catch (error) {
        console.error(`Malformed line in ${file}:`, error);
      }
    }

    // Insert remaining
    if (batch.length > 0) {
      await insertBatch(batch);
    }
  }
}

async function insertBatch(batch: any[]) {
  const { error } = await supabase
    .from('audit_logs')
    .insert(batch);

  if (error) {
    console.error('Batch insert failed:', error);
  } else {
    console.log(`Inserted ${batch.length} records`);
  }
}

backfillAuditLogs().catch(console.error);
```

**Step 3**: Update API route to query database
```typescript
// /app/api/audit/route.ts
async function queryAuditLogs(query: AuditQuery): Promise<AuditLogResponse> {
  let supabaseQuery = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' });

  // Apply filters
  if (query.userId) {
    supabaseQuery = supabaseQuery.eq('user_id', query.userId);
  }
  if (query.action) {
    supabaseQuery = supabaseQuery.eq('action', query.action);
  }
  if (query.outcome) {
    supabaseQuery = supabaseQuery.eq('outcome', query.outcome);
  }
  if (query.resource) {
    supabaseQuery = supabaseQuery.eq('resource', query.resource);
  }
  if (query.startDate) {
    supabaseQuery = supabaseQuery.gte('timestamp', query.startDate);
  }
  if (query.endDate) {
    supabaseQuery = supabaseQuery.lte('timestamp', query.endDate);
  }

  // Pagination
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  const startIndex = (page - 1) * limit;

  supabaseQuery = supabaseQuery
    .order('timestamp', { ascending: false })
    .range(startIndex, startIndex + limit - 1);

  const { data, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(`Audit query failed: ${error.message}`);
  }

  return {
    events: data || [],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > startIndex + limit
  };
}
```

### Phase 4: Migrate Metrics (Week 2)

**Strategy**: Flush metrics to database hourly

**Implementation**:
```typescript
// /lib/managers/metrics-manager.ts
async flushMetrics(): Promise<void> {
  const snapshot = this.snapshot();
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const hour = date.getHours();

  // Prepare batch insert
  const metricsToInsert = [];

  // Counters
  for (const counter of snapshot.counters) {
    metricsToInsert.push({
      metric_name: counter.name,
      metric_type: 'counter',
      date: dateStr,
      hour,
      count: counter.count
    });
  }

  // Histograms
  for (const histogram of snapshot.histograms) {
    metricsToInsert.push({
      metric_name: histogram.name,
      metric_type: 'histogram',
      date: dateStr,
      hour,
      count: histogram.count,
      p50: histogram.p50,
      p95: histogram.p95,
      p99: histogram.p99,
      min_value: histogram.min,
      max_value: histogram.max,
      avg_value: histogram.count > 0 ? (histogram.sum / histogram.count) : 0
    });
  }

  // Insert to database
  const { error } = await supabase
    .from('metrics')
    .upsert(metricsToInsert, {
      onConflict: 'metric_name,date,hour'
    });

  if (error) {
    console.error('Failed to flush metrics to database:', error);
  }

  // Reset in-memory counters
  this.counters.clear();
  this.histograms.clear();
}
```

**Cron Job** (Netlify Scheduled Function):
```typescript
// /app/api/cron/flush-metrics/route.ts
export async function GET() {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await metrics.flushMetrics();

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString()
  });
}
```

### Phase 5: Implement Rate Limit Configuration (Week 3)

**Step 1**: Seed rate limit configuration
```sql
INSERT INTO rate_limit_config (limit_type, requests_per_window, window_ms, error_message)
VALUES
  ('CHAT', 20, 60000, 'Too many chat requests. Please slow down.'),
  ('API', 60, 60000, 'Rate limit exceeded. Please wait.'),
  ('DOSING', 30, 60000, 'Too many dosing calculations.'),
  ('AUTH', 5, 900000, 'Too many authentication attempts.'),
  ('PHI', 50, 60000, 'Access rate limit exceeded.'),
  ('GLOBAL', 500, 900000, 'Global rate limit exceeded.');
```

**Step 2**: Update rate limiter to read from database
```typescript
// /lib/security/rate-limit.ts
async function loadRateLimitConfig(): Promise<typeof RATE_LIMITS> {
  const { data, error } = await supabase
    .from('rate_limit_config')
    .select('*')
    .eq('enabled', true);

  if (error || !data) {
    console.warn('Failed to load rate limits from DB, using defaults');
    return RATE_LIMITS;
  }

  const config: any = {};
  for (const row of data) {
    config[row.limit_type] = {
      limit: row.requests_per_window,
      windowMs: row.window_ms,
      message: row.error_message
    };
  }

  return config;
}

// Cache configuration for 5 minutes
let cachedConfig: typeof RATE_LIMITS | null = null;
let lastFetch = 0;

export async function getRateLimitConfig(): Promise<typeof RATE_LIMITS> {
  const now = Date.now();
  if (cachedConfig && now - lastFetch < 300_000) {
    return cachedConfig;
  }

  cachedConfig = await loadRateLimitConfig();
  lastFetch = now;
  return cachedConfig;
}
```

**Step 3**: Admin endpoint for configuration management
```typescript
// /app/api/admin/rate-limits/route.ts
export async function PUT(req: NextRequest) {
  // Verify admin token
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { limitType, requestsPerWindow, windowMs } = await req.json();

  const { error } = await supabase
    .from('rate_limit_config')
    .update({
      requests_per_window: requestsPerWindow,
      window_ms: windowMs,
      updated_at: new Date().toISOString()
    })
    .eq('limit_type', limitType);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalidate cache
  cachedConfig = null;

  return NextResponse.json({ success: true });
}
```

---

## Indexing Strategy

### Primary Indexes (Already Defined)

**Audit Logs**:
- B-tree on `timestamp DESC` (time-series queries)
- B-tree on `user_id` (user audit trails)
- B-tree on `action` (action-specific queries)
- GIN on `metadata` (JSONB searches)
- Composite on `user_id, timestamp DESC` (user timeline)

**Metrics**:
- Unique composite on `(metric_name, date, hour)` (prevent duplicates)
- B-tree on `date DESC` (time-series analytics)
- B-tree on `metric_name` (metric-specific queries)

### Secondary Indexes (Recommended)

**For Query Performance**:
```sql
-- Audit logs: Common filter combinations
CREATE INDEX idx_audit_logs_action_outcome
  ON audit_logs(action, outcome, timestamp DESC);

CREATE INDEX idx_audit_logs_resource_action
  ON audit_logs(resource, action, timestamp DESC);

-- Sessions: Active session lookup
CREATE INDEX idx_sessions_active
  ON sessions(user_id, last_activity DESC)
  WHERE expires_at > NOW();

-- Metrics: Aggregation queries
CREATE INDEX idx_metrics_name_date
  ON metrics(metric_name, date DESC);

-- Protocol access: Top protocols
CREATE INDEX idx_protocol_access_protocol
  ON protocol_access(protocol_id, accessed_at DESC);
```

### Partial Indexes (For Filtered Queries)

```sql
-- Only index failures (reduce index size)
CREATE INDEX idx_audit_logs_failures
  ON audit_logs(timestamp DESC, action)
  WHERE outcome = 'failure';

-- Only index banned users
CREATE INDEX idx_violations_banned_users
  ON rate_limit_violations(fingerprint, banned_until)
  WHERE is_banned = TRUE;

-- Only index active knowledge base entries
CREATE INDEX idx_kb_active_content
  ON knowledge_base(category, protocol_section)
  WHERE is_active = TRUE;
```

### Covering Indexes (For Read-Heavy Queries)

```sql
-- Include commonly selected columns in index
CREATE INDEX idx_audit_logs_user_timeline
  ON audit_logs(user_id, timestamp DESC)
  INCLUDE (action, resource, outcome, duration_ms);

CREATE INDEX idx_sessions_user_active
  ON sessions(user_id, expires_at DESC)
  INCLUDE (fingerprint, last_activity);
```

---

## Data Retention & Archival Strategy

### Retention Policies

**Audit Logs**:
- **Active**: 6 years (2,190 days) - HIPAA requirement
- **Archive**: 7+ years to cold storage (S3 Glacier)
- **Delete**: After 10 years (verify compliance requirements)

**Metrics**:
- **Active**: 90 days (hot database storage)
- **Archive**: 1-2 years (aggregated daily/weekly summaries)
- **Delete**: After 2 years

**Sessions**:
- **Active**: 60 minutes (session timeout)
- **Cleanup**: Immediate on expiration (trigger-based)

**Rate Limit Violations**:
- **Active**: 30 days (reputation tracking)
- **Cleanup**: Monthly cleanup of resolved violations

### Archival Implementation

**Step 1**: Daily cron job to move old data
```sql
-- Archive audit logs older than 6 years
CREATE FUNCTION archive_old_audit_logs() RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Copy to archive table (partitioned by year)
  INSERT INTO audit_logs_archive
  SELECT * FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '6 years';

  GET DIAGNOSTICS archived_count = ROW_COUNT;

  -- Delete from main table
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '6 years';

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

**Step 2**: Export to S3 (Supabase Storage or AWS S3)
```typescript
// /scripts/export-to-s3.ts
import { supabase } from '@/lib/db/supabase';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function exportAuditLogsToS3(year: number) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Query audit logs for year
  const { data, error } = await supabase
    .from('audit_logs_archive')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate);

  if (error || !data) {
    throw new Error(`Export failed: ${error?.message}`);
  }

  // Convert to CSV
  const csv = convertToCSV(data);

  // Upload to S3
  const s3 = new S3Client({ region: 'us-west-2' });
  await s3.send(new PutObjectCommand({
    Bucket: 'medic-bot-audit-archives',
    Key: `audit-logs/${year}/audit-logs-${year}.csv.gz`,
    Body: gzipSync(csv),
    StorageClass: 'GLACIER'
  }));

  console.log(`Exported ${data.length} records for ${year}`);
}
```

**Step 3**: Automated cleanup
```sql
-- Scheduled function (run daily at 2am)
CREATE FUNCTION daily_cleanup() RETURNS VOID AS $$
BEGIN
  -- Archive old audit logs
  PERFORM archive_old_audit_logs();

  -- Cleanup expired sessions
  DELETE FROM sessions WHERE expires_at < NOW();

  -- Cleanup old rate limit violations (30 days)
  DELETE FROM rate_limit_violations
  WHERE last_violation < NOW() - INTERVAL '30 days'
    AND is_banned = FALSE;

  -- Cleanup old metrics (90 days)
  DELETE FROM metrics
  WHERE date < CURRENT_DATE - INTERVAL '90 days';

  -- Refresh materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY audit_stats;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Timeline & Effort Estimates

### Phase 1: Foundation (Week 1) - 16 hours
- Create Supabase project: 2 hours
- Set up connection utilities: 2 hours
- Create migration files (002-006): 6 hours
- Run migrations and verify: 4 hours
- Test helper functions: 2 hours

### Phase 2: Audit Log Migration (Week 2) - 20 hours
- Update AuditLogger for dual-write: 4 hours
- Backfill historical logs (script): 4 hours
- Run backfill (6 years of data): 8 hours
- Update API routes: 2 hours
- Testing and validation: 2 hours

### Phase 3: Metrics Migration (Week 2) - 12 hours
- Update MetricsManager: 4 hours
- Create cron job for flushing: 2 hours
- Implement database queries: 3 hours
- Testing and monitoring: 3 hours

### Phase 4: Rate Limit Configuration (Week 3) - 10 hours
- Seed configuration table: 1 hour
- Update rate limiter: 4 hours
- Create admin endpoints: 3 hours
- Testing: 2 hours

### Phase 5: Row Level Security (Week 3) - 8 hours
- Create RLS policies: 3 hours
- Test with different roles: 3 hours
- Documentation: 2 hours

### Phase 6: User Management (Week 4) - 16 hours
- Design authentication flow: 4 hours
- Implement user registration: 4 hours
- Implement session management: 4 hours
- Testing: 4 hours

### Total Estimated Effort: 82 hours (~2 developer-weeks)

---

## Performance Benchmarks

### Expected Query Performance

**Audit Log Queries**:
- Single user timeline (30 days): < 50ms
- Action-based filter (7 days): < 100ms
- Full-text metadata search: < 200ms
- Export (100k records): < 5 seconds

**Metrics Queries**:
- Last 24 hours snapshot: < 20ms
- 30-day trend analysis: < 100ms
- Cross-metric aggregation: < 500ms

**Rate Limit Checks**:
- Fingerprint lookup: < 5ms (in-memory cache)
- Configuration fetch: < 10ms (cached for 5 minutes)

### Database Sizing Estimates

**Audit Logs**:
- Events per day: 50,000 (estimated)
- Record size: ~500 bytes (with metadata)
- Daily growth: 25 MB/day
- 6-year retention: 54 GB

**Metrics**:
- Metrics per hour: ~100 (counters + histograms)
- Record size: ~200 bytes
- Daily growth: ~500 KB/day
- 90-day retention: ~45 MB

**Sessions**:
- Active sessions: 500 concurrent users (peak)
- Record size: ~300 bytes
- Total size: ~150 KB (negligible)

**Total Database Size**: ~60 GB (6-year retention)
**Supabase Free Tier**: 500 MB (INSUFFICIENT)
**Recommended Tier**: Pro ($25/mo) - 8 GB included + $0.125/GB overage

---

## Security Considerations

### 1. Connection Security
- **TLS 1.3**: All database connections encrypted
- **Connection pooling**: PgBouncer (max 15 connections)
- **Service role key**: Server-side only (never expose to client)

### 2. SQL Injection Prevention
- **Parameterized queries**: Supabase client handles escaping
- **Type safety**: TypeScript validation before database calls
- **Input validation**: Zod schemas for all user input

### 3. Data Encryption
- **At rest**: AES-256 (Supabase managed)
- **In transit**: TLS 1.3
- **Sensitive fields**: Consider encrypting metadata JSONB fields

### 4. Access Control
- **RLS policies**: Enforce row-level permissions
- **Service role**: Only for server-side operations
- **Anon key**: Public access with strict RLS policies

### 5. Audit Trail Integrity
- **Immutability**: Triggers prevent updates/deletes
- **Checksums**: Consider adding event_hash field
- **Backup verification**: Regular restore testing

---

## Monitoring & Alerting

### Database Health Metrics

**Connection Pool**:
- Active connections
- Idle connections
- Wait time for connections

**Query Performance**:
- Slow query log (> 1 second)
- Index hit rate (> 99% recommended)
- Cache hit rate (> 95% recommended)

**Storage**:
- Database size growth rate
- Table bloat percentage
- Index size vs table size ratio

### Recommended Alerts

**Critical**:
- Connection pool exhausted (> 90% utilization)
- Slow queries (P95 > 5 seconds)
- Database size approaching limit (> 80% of plan)
- Backup failures

**Warning**:
- Cache hit rate < 95%
- Index hit rate < 99%
- Table bloat > 20%
- Audit log growth exceeding baseline

---

## Recommendations Summary

### Immediate (Next Sprint - Week 1)
1. **Create Supabase project** and run migrations
2. **Implement database connection** utility
3. **Migrate audit logs** to database (dual-write)
4. **Set up RLS policies** for security

### Short-term (Month 1)
5. **Migrate metrics** to persistent storage
6. **Implement rate limit configuration** table
7. **Create admin dashboard** for monitoring
8. **Backfill historical audit logs** (6 years)

### Medium-term (Month 2-3)
9. **Implement user management** and authentication
10. **Add session tracking** for multi-device support
11. **Create analytics dashboard** (protocol usage)
12. **Optimize queries** with additional indexes

### Long-term (Month 4+)
13. **Implement vector search** for knowledge base
14. **Add real-time notifications** (Supabase Realtime)
15. **Create data warehouse** for advanced analytics
16. **Implement automated archival** to cold storage

---

## Conclusion

The current architecture has **significant data persistence gaps** that limit scalability and compliance. The designed Supabase schema is comprehensive but **completely unused**.

**Critical Next Steps**:
1. Establish database connection (Priority 1)
2. Migrate audit logs to PostgreSQL (Priority 1 - HIPAA compliance)
3. Implement metrics persistence (Priority 2 - observability)
4. Add user management (Priority 3 - future authentication)

**Estimated ROI**:
- **Scalability**: Support 3,200+ concurrent users (vs. current single-server limit)
- **Compliance**: Efficient 6-year audit retention with queryability
- **Performance**: 50x faster audit queries (database vs. file scanning)
- **Analytics**: Enable real-time dashboards and trending
- **Cost**: $25/mo Supabase Pro + $15/mo overage = $40/mo total (negligible)

**Total Implementation Effort**: 82 hours (~2 developer-weeks)
**Risk**: Low (backward compatible, dual-write migration strategy)
**Priority**: High (enables Phase 2 features: CAD integration, analytics dashboard)

---

**Document Version**: 1.0
**Last Updated**: October 25, 2025
**Next Review**: November 25, 2025
**Owner**: Technical Architecture Team
