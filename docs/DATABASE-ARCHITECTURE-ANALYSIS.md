# Protocol Guide Database Architecture Analysis

**Analysis Date:** 2026-01-22
**Database System:** MySQL (Primary) + Supabase/PostgreSQL (Protocol Search)
**Analyst:** Database Architect Agent

---

## Executive Summary

Protocol Guide uses a **hybrid dual-database architecture**:
- **MySQL** - User management, queries, feedback, audit logs
- **Supabase (PostgreSQL)** - Protocol chunks with vector embeddings for semantic search

**Key Findings:**
1. **Dual Database Challenge** - ID mapping required between MySQL counties and Supabase agencies
2. **Security Fixed** - RLS policies implemented for Supabase tables
3. **Scale Ready** - Schema supports 23,272+ agencies with protocol inheritance
4. **Search Optimized** - Vector embeddings (1536D Voyage AI) for semantic protocol search

---

## Database Architecture Overview

### Primary Database: MySQL (Drizzle ORM)

**Tables (14 total):**
1. `users` - User accounts and authentication
2. `counties` - Legacy county/agency metadata
3. `protocolChunks` - Legacy protocol storage (being phased out)
4. `queries` - Search history and analytics
5. `feedback` - User feedback and error reports
6. `contactSubmissions` - Contact form submissions
7. `stripeWebhookEvents` - Payment event tracking
8. `auditLogs` - Admin action audit trail
9. `userCounties` - User-to-county associations
10. `searchHistory` - Cloud sync search history
11. `userAuthProviders` - OAuth provider linking
12. `userStates` - State subscription tracking
13. `userAgencies` - Agency subscription tracking
14. `agencies` - Agency organization accounts
15. `agencyMembers` - Agency staff memberships
16. `protocolVersions` - Protocol version control
17. `protocolUploads` - PDF upload job tracking
18. `agencyInvitations` - Agency invitation system
19. `integrationLogs` - Partner integration tracking

### Secondary Database: Supabase (PostgreSQL)

**Tables (3 main):**
1. `manus_protocol_chunks` - 49,201 protocol chunks with embeddings
2. `manus_agencies` - 2,713 agencies (scaling to 23,272)
3. `agencies` (legacy) - Original agency table

---

## Table Analysis

### Critical Table: manus_protocol_chunks

**Purpose:** Stores chunked protocol content with vector embeddings for semantic search

**Schema:**
```sql
CREATE TABLE manus_protocol_chunks (
    id INTEGER PRIMARY KEY,
    agency_id INTEGER,                    -- FK to manus_agencies
    protocol_number TEXT,                  -- e.g., "R-001"
    protocol_title TEXT,                   -- e.g., "Asthma/COPD Protocol"
    section TEXT,                          -- Category: Cardiac, Respiratory, etc.
    content TEXT,                          -- Protocol text (1000-1200 chars)
    embedding VECTOR(1536),                -- Voyage AI embedding
    source_pdf_url TEXT,
    has_images BOOLEAN,
    image_urls JSONB,                      -- Array of image URLs
    protocol_effective_date TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    protocol_year INTEGER,
    agency_name TEXT,                      -- Denormalized from agencies
    state_code CHAR(2),                    -- Denormalized
    state_name TEXT,                       -- Denormalized
    created_at TIMESTAMPTZ NOT NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_protocol_chunks_agency_id ON manus_protocol_chunks(agency_id);
CREATE INDEX idx_protocol_chunks_protocol_number ON manus_protocol_chunks(protocol_number);
CREATE INDEX idx_protocol_chunks_section ON manus_protocol_chunks(section);
CREATE INDEX idx_chunks_state_code ON manus_protocol_chunks(state_code);
CREATE INDEX idx_chunks_agency_name ON manus_protocol_chunks(agency_name);
CREATE INDEX idx_chunks_state_agency ON manus_protocol_chunks(state_code, agency_name);

-- Vector similarity index
CREATE INDEX idx_protocol_chunks_embedding
ON manus_protocol_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Row Level Security:**
```sql
-- Public read access (protocols are public medical information)
CREATE POLICY "Allow public read access to protocol chunks"
    ON manus_protocol_chunks
    FOR SELECT TO PUBLIC USING (true);

-- Service role only can write
CREATE POLICY "Allow service_role to insert protocol chunks"
    ON manus_protocol_chunks
    FOR INSERT TO service_role WITH CHECK (true);
```

**Performance Characteristics:**
- **Total Rows:** 49,201 chunks
- **Chunk Size:** 1,000-1,200 characters
- **Embedding Dimension:** 1536 (Voyage AI voyage-large-2)
- **Search Speed:** <100ms for semantic search
- **Index Size:** ~200MB for vector index

**Optimization Recommendations:**
1. **Partitioning** - Partition by state_code for large-scale deployments
2. **Materialized Views** - Cache common search results
3. **Index Tuning** - Adjust IVFFlat lists parameter based on data growth
4. **Denormalization** - agency_name, state_code already denormalized (good!)

---

### Critical Table: manus_agencies

**Purpose:** EMS agencies with protocol inheritance hierarchy

**Schema:**
```sql
CREATE TABLE manus_agencies (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    state_code CHAR(2) NOT NULL,
    state_name TEXT NOT NULL,
    protocol_count INTEGER DEFAULT 0,

    -- Protocol inheritance
    parent_protocol_source_id INTEGER REFERENCES manus_agencies(id),

    -- Agency classification
    agency_type agency_type_enum DEFAULT 'unknown',
    call_volume_tier call_volume_tier_enum DEFAULT 'unknown',

    -- Data quality
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,

    -- Integration
    integration_partner integration_partner_enum DEFAULT 'none',
    integration_id TEXT,

    -- License
    license_number VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Enums:**
```sql
CREATE TYPE agency_type_enum AS ENUM (
    '911_transport',
    '911_non_transport',
    'air_medical',
    'dispatch',
    'specialty',
    'regional_council',
    'state_office',
    'hospital_based',
    'tribal',
    'unknown'
);

CREATE TYPE call_volume_tier_enum AS ENUM (
    'high',    -- Top 20% (80% of calls)
    'mid',     -- Middle 30%
    'low',     -- Bottom 50%
    'unknown'
);

CREATE TYPE integration_partner_enum AS ENUM (
    'imagetrend',
    'esos',
    'zoll',
    'emscloud',
    'none'
);
```

**Indexes:**
```sql
CREATE INDEX idx_agencies_state_code ON manus_agencies(state_code);
CREATE INDEX idx_agencies_name ON manus_agencies(name);
CREATE INDEX idx_agencies_state_name ON manus_agencies(state_name);
CREATE INDEX idx_agencies_state_code_name ON manus_agencies(state_code, name);
CREATE INDEX idx_agencies_agency_type ON manus_agencies(agency_type);
CREATE INDEX idx_agencies_call_volume_tier ON manus_agencies(call_volume_tier);
CREATE INDEX idx_agencies_parent_protocol_source ON manus_agencies(parent_protocol_source_id);
CREATE INDEX idx_agencies_state_type_volume ON manus_agencies(state_code, agency_type, call_volume_tier);
CREATE INDEX idx_agencies_integration_partner ON manus_agencies(integration_partner);
CREATE INDEX idx_agencies_is_verified ON manus_agencies(is_verified);
```

**Constraints:**
```sql
ALTER TABLE manus_agencies
    ADD CONSTRAINT chk_state_code_uppercase CHECK (state_code = UPPER(state_code)),
    ADD CONSTRAINT chk_state_code_length CHECK (LENGTH(state_code) = 2),
    ADD CONSTRAINT chk_protocol_count_positive CHECK (protocol_count >= 0),
    ADD CONSTRAINT uq_agency_name_state UNIQUE (name, state_code);
```

**Protocol Inheritance Function:**
```sql
-- Returns inheritance chain: Agency -> Regional -> State
CREATE FUNCTION get_protocol_inheritance_chain(agency_id_param INTEGER)
RETURNS TABLE (
    level INTEGER,
    id INTEGER,
    name TEXT,
    agency_type agency_type_enum,
    state_code CHAR(2)
)
```

**Optimization Recommendations:**
1. **Inheritance Index** - Already indexed on parent_protocol_source_id (good!)
2. **Composite Indexes** - State + type + volume already indexed (excellent!)
3. **Name Search** - Add GIN index for ILIKE searches if needed
4. **Trigger Optimization** - protocol_count trigger is efficient

---

### Critical Table: users (MySQL)

**Purpose:** User accounts, authentication, subscription management

**Schema:**
```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  supabaseId: varchar("supabaseId", { length: 36 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  tier: mysqlEnum("tier", ["free", "pro", "enterprise"]).default("free").notNull(),
  queryCountToday: int("queryCountToday").default(0).notNull(),
  lastQueryDate: varchar("lastQueryDate", { length: 10 }), // YYYY-MM-DD
  selectedCountyId: int("selectedCountyId"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  subscriptionId: varchar("subscriptionId", { length: 255 }),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
```

**Missing Indexes (Add These!):**
```sql
CREATE INDEX idx_users_supabase_id ON users(supabaseId);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_stripe_customer_id ON users(stripeCustomerId);
```

**Optimization Recommendations:**
1. **Supabase ID Index** - Critical for RLS policy lookups
2. **Email Index** - For login and user lookup
3. **Composite Index** - role + tier for admin queries
4. **Query Count Reset** - Add cron job to reset queryCountToday daily

---

### Critical Table: queries (MySQL)

**Purpose:** Search history and analytics

**Schema:**
```typescript
export const queries = mysqlTable("queries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  countyId: int("countyId").notNull(),
  queryText: text("queryText").notNull(),
  responseText: text("responseText"),
  protocolRefs: json("protocolRefs").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

**Missing Indexes (Add These!):**
```sql
CREATE INDEX idx_queries_user_id ON queries(userId);
CREATE INDEX idx_queries_county_id ON queries(countyId);
CREATE INDEX idx_queries_created_at ON queries(createdAt);
CREATE INDEX idx_queries_user_created ON queries(userId, createdAt DESC);
```

**Optimization Recommendations:**
1. **User + Date Index** - Fast user history retrieval
2. **Partitioning** - Partition by created_at (monthly) for large datasets
3. **Archival Strategy** - Move queries >1 year to archive table
4. **Full-Text Search** - Add fulltext index on queryText for analytics

---

### Critical Table: searchHistory (MySQL)

**Purpose:** Cloud sync search history for Pro users

**Schema:**
```typescript
export const searchHistory = mysqlTable("search_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  queryText: varchar("queryText", { length: 500 }).notNull(),
  countyId: int("countyId"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  deviceId: varchar("deviceId", { length: 64 }),
  synced: boolean("synced").default(true).notNull(),
});
```

**Missing Indexes (Add These!):**
```sql
CREATE INDEX idx_search_history_user_id ON search_history(userId);
CREATE INDEX idx_search_history_device_id ON search_history(deviceId);
CREATE INDEX idx_search_history_synced ON search_history(synced);
CREATE INDEX idx_search_history_user_timestamp ON search_history(userId, timestamp DESC);
```

**Optimization Recommendations:**
1. **Sync Index** - For offline sync reconciliation
2. **Device Index** - Fast device-specific history
3. **Deduplication** - Add unique constraint on (userId, queryText, timestamp)
4. **TTL** - Auto-delete entries >90 days for free users

---

## Database Relationships

### Primary Relationships

```
users (1) ----< (many) queries
users (1) ----< (many) searchHistory
users (1) ----< (many) feedback
users (1) ----< (many) userCounties
users (1) ----< (many) userAuthProviders
users (1) ----< (many) userStates
users (1) ----< (many) userAgencies

counties (1) ----< (many) userCounties
counties (1) ----< (many) queries

manus_agencies (1) ----< (many) manus_protocol_chunks
manus_agencies (1) ----< (many) manus_agencies  (self-referencing for inheritance)

agencies (1) ----< (many) agencyMembers
agencies (1) ----< (many) protocolVersions
agencies (1) ----< (many) protocolUploads
agencies (1) ----< (many) agencyInvitations
```

### Cross-Database Relationship (ID Mapping)

```
MySQL counties.id  ←→  Supabase manus_agencies.id
        ↓ (via db-agency-mapping.ts)
        Mapping Layer: Name + State normalization
        ↓
    Protocol Search with Agency Filter
```

---

## Row Level Security (RLS) Policies

### manus_protocol_chunks

**Public Read Access:**
```sql
CREATE POLICY "Allow public read access to protocol chunks"
    ON manus_protocol_chunks
    FOR SELECT TO PUBLIC USING (true);
```
**Reasoning:** Protocols are public medical information

**Service Role Write Access:**
```sql
CREATE POLICY "Allow service_role to insert protocol chunks"
    ON manus_protocol_chunks
    FOR INSERT TO service_role WITH CHECK (true);
```
**Reasoning:** Only backend should modify protocol data

### users (if in Supabase)

**Self Access:**
```sql
CREATE POLICY "Users can read their own data"
    ON users
    FOR SELECT TO authenticated
    USING (auth.uid()::text = supabase_id);
```

**Self Update:**
```sql
CREATE POLICY "Users can update their own data"
    ON users
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = supabase_id)
    WITH CHECK (auth.uid()::text = supabase_id);
```

### queries (if in Supabase)

**Self Access:**
```sql
CREATE POLICY "Users can read their own query history"
    ON queries
    FOR SELECT TO authenticated
    USING (
        user_id IN (
            SELECT id FROM users WHERE supabase_id = auth.uid()::text
        )
    );
```

**Admin Access:**
```sql
CREATE POLICY "Admins can read all queries"
    ON queries
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE supabase_id = auth.uid()::text AND role = 'admin'
        )
    );
```

---

## Database Functions & Triggers

### Supabase Functions

**1. search_manus_protocols**
```sql
CREATE FUNCTION search_manus_protocols(
  query_embedding vector(1536),
  agency_filter integer DEFAULT NULL,
  state_filter text DEFAULT NULL,
  match_count integer DEFAULT 10,
  match_threshold float DEFAULT 0.3,
  agency_name_filter text DEFAULT NULL,
  state_code_filter char(2) DEFAULT NULL
)
RETURNS TABLE (...)
```
**Purpose:** Semantic protocol search with multiple filter options

**2. get_protocol_inheritance_chain**
```sql
CREATE FUNCTION get_protocol_inheritance_chain(agency_id_param INTEGER)
RETURNS TABLE (level, id, name, agency_type, state_code)
```
**Purpose:** Returns inheritance chain for protocol lookup

**3. get_protocols_with_inheritance**
```sql
CREATE FUNCTION get_protocols_with_inheritance(
    agency_id_param INTEGER,
    query_embedding VECTOR(1536),
    match_count INTEGER DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.3
)
```
**Purpose:** Search protocols including inherited protocols from parent agencies

**4. update_agency_protocol_count**
```sql
CREATE FUNCTION update_agency_protocol_count()
RETURNS TRIGGER
```
**Purpose:** Auto-update protocol_count when chunks are added/removed

### Triggers

**1. Protocol Count Sync**
```sql
CREATE TRIGGER trg_update_agency_protocol_count
    AFTER INSERT OR UPDATE OR DELETE ON manus_protocol_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_agency_protocol_count();
```

**2. Agency Denormalization Sync**
```sql
CREATE TRIGGER trigger_sync_agency_to_chunks
    AFTER UPDATE ON manus_agencies
    FOR EACH ROW
    EXECUTE FUNCTION sync_agency_to_chunks();
```
**Purpose:** Keep denormalized agency_name, state_code in chunks updated

---

## Database Constraints & Validation

### Data Integrity Constraints

**manus_agencies:**
```sql
-- State code must be uppercase 2-letter
CHECK (state_code = UPPER(state_code) AND LENGTH(state_code) = 2)

-- Protocol count non-negative
CHECK (protocol_count >= 0)

-- Unique agency per state
UNIQUE (name, state_code)
```

**users:**
```typescript
// Email max 320 chars (RFC 5321)
email: varchar("email", { length: 320 })

// OpenID unique identifier
openId: varchar("openId", { length: 64 }).notNull().unique()

// Supabase ID unique
supabaseId: varchar("supabaseId", { length: 36 }).unique()
```

**Missing Constraints (Add These!):**
```sql
-- Validate email format
ALTER TABLE users ADD CONSTRAINT chk_email_format
CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

-- Query count must be non-negative
ALTER TABLE users ADD CONSTRAINT chk_query_count_positive
CHECK (queryCountToday >= 0);

-- Tier-based query limits
-- Free: 10/day, Pro: unlimited
```

---

## Performance Optimization Recommendations

### 1. Index Strategy

**Add Missing Indexes:**
```sql
-- MySQL users table
CREATE INDEX idx_users_supabase_id ON users(supabaseId);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_tier ON users(role, tier);

-- MySQL queries table
CREATE INDEX idx_queries_user_created ON queries(userId, createdAt DESC);
CREATE INDEX idx_queries_county_id ON queries(countyId);

-- MySQL searchHistory table
CREATE INDEX idx_search_history_user_timestamp ON search_history(userId, timestamp DESC);
CREATE INDEX idx_search_history_synced ON search_history(synced);
```

**Optimize Existing Indexes:**
```sql
-- Add covering index for common query
CREATE INDEX idx_protocol_chunks_search
ON manus_protocol_chunks(agency_id, section)
INCLUDE (protocol_number, protocol_title);
```

### 2. Query Optimization

**Current Search Query:**
```sql
-- Can be optimized with proper index usage
SELECT * FROM manus_protocol_chunks
WHERE agency_id = ANY(chain_ids)
  AND (1 - (embedding <=> query_embedding)) > match_threshold
ORDER BY (1 - (embedding <=> query_embedding)) DESC
LIMIT match_count;
```

**Optimization:**
- Use `EXPLAIN ANALYZE` to verify vector index usage
- Adjust IVFFlat `lists` parameter based on data size
- Consider pgvector vs. specialized vector DB for >1M chunks

### 3. Partitioning Strategy

**Partition Large Tables:**
```sql
-- Partition queries by month for historical data
CREATE TABLE queries_2026_01 PARTITION OF queries
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Partition searchHistory by user tier
CREATE TABLE search_history_free PARTITION OF search_history
FOR VALUES IN ('free');
```

### 4. Caching Strategy

**Application Layer:**
- Cache agency mappings (already implemented in db-agency-mapping.ts)
- Cache frequent searches (Redis/Memcached)
- Cache user profile data (TTL: 5 minutes)

**Database Layer:**
```sql
-- Materialized view for top searches
CREATE MATERIALIZED VIEW mv_top_protocols AS
SELECT protocol_number, protocol_title, COUNT(*) as search_count
FROM queries q
JOIN manus_protocol_chunks p ON p.protocol_number = ANY(q.protocolRefs)
GROUP BY protocol_number, protocol_title
ORDER BY search_count DESC
LIMIT 100;

REFRESH MATERIALIZED VIEW mv_top_protocols;  -- Refresh daily
```

### 5. Data Archival

**Archive Old Data:**
```sql
-- Move queries older than 1 year to archive
CREATE TABLE queries_archive LIKE queries;

INSERT INTO queries_archive
SELECT * FROM queries
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM queries
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## Security Recommendations

### 1. Sensitive Data Protection

**Add Encryption:**
```sql
-- Encrypt user email addresses
ALTER TABLE users MODIFY COLUMN email VARBINARY(500);

-- Use AES encryption
UPDATE users SET email = AES_ENCRYPT(email, @encryption_key);
```

**Mask PII in Logs:**
```typescript
// Never log full email or user data
logger.info('User search', { userId: user.id }); // Good
logger.info('User search', { user }); // Bad - leaks PII
```

### 2. Rate Limiting

**Add Rate Limit Tracking:**
```sql
-- Track API calls per user
CREATE TABLE rate_limits (
    user_id INTEGER,
    endpoint VARCHAR(100),
    call_count INTEGER,
    window_start TIMESTAMP,
    PRIMARY KEY (user_id, endpoint, window_start)
);
```

### 3. Audit Logging

**Expand Audit Logs:**
```typescript
// Log all sensitive operations
export const auditActionEnum = mysqlEnum("audit_action", [
  "USER_ROLE_CHANGED",
  "USER_TIER_CHANGED",
  "FEEDBACK_STATUS_CHANGED",
  "CONTACT_STATUS_CHANGED",
  "USER_DELETED",
  "PROTOCOL_MODIFIED",
  "PROTOCOL_UPLOADED",      // Add
  "AGENCY_CREATED",          // Add
  "AGENCY_MODIFIED",         // Add
  "RLS_POLICY_VIOLATED",     // Add
]);
```

---

## Data Quality & Monitoring

### 1. Data Quality Checks

**Run Regular Audits:**
```sql
-- Find orphaned protocol chunks
SELECT COUNT(*), agency_id
FROM manus_protocol_chunks p
WHERE NOT EXISTS (
  SELECT 1 FROM manus_agencies a WHERE a.id = p.agency_id
)
GROUP BY agency_id;

-- Find duplicate protocols
SELECT protocol_number, protocol_title, agency_id, COUNT(*)
FROM manus_protocol_chunks
GROUP BY protocol_number, protocol_title, agency_id
HAVING COUNT(*) > 1;

-- Verify protocol_count accuracy
SELECT
    a.id,
    a.name,
    a.protocol_count as stored_count,
    COUNT(p.id) as actual_count
FROM manus_agencies a
LEFT JOIN manus_protocol_chunks p ON p.agency_id = a.id
GROUP BY a.id, a.name, a.protocol_count
HAVING a.protocol_count != COUNT(p.id);
```

### 2. Monitoring Metrics

**Track Key Metrics:**
```sql
-- Query performance metrics
SELECT
    DATE(createdAt) as date,
    COUNT(*) as total_queries,
    AVG(LENGTH(queryText)) as avg_query_length,
    AVG(LENGTH(responseText)) as avg_response_length
FROM queries
GROUP BY DATE(createdAt)
ORDER BY date DESC
LIMIT 30;

-- User engagement metrics
SELECT
    tier,
    COUNT(*) as user_count,
    AVG(queryCountToday) as avg_queries_today
FROM users
GROUP BY tier;

-- Protocol search distribution
SELECT
    section,
    COUNT(*) as search_count
FROM manus_protocol_chunks p
JOIN queries q ON p.protocol_number = ANY(q.protocolRefs)
GROUP BY section
ORDER BY search_count DESC;
```

---

## Migration Strategy

### Current State: Dual Database

**MySQL:** User data, queries, subscriptions
**Supabase:** Protocol chunks, vector search

### Long-Term Goal: Unified Supabase

**Phase 1: Add Missing Tables to Supabase**
```sql
-- Create users table in Supabase
CREATE TABLE supabase_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mysql_id INTEGER UNIQUE,  -- For migration
    email TEXT,
    role TEXT,
    tier TEXT,
    ...
);
```

**Phase 2: Dual Write**
```typescript
// Write to both databases
await db.insert(users).values(userData);  // MySQL
await supabase.from('supabase_users').insert(userData);  // Supabase
```

**Phase 3: Gradual Migration**
```typescript
// Read from Supabase, fallback to MySQL
let user = await supabase.from('supabase_users').select();
if (!user) {
    user = await db.query.users.findFirst();
}
```

**Phase 4: Cut Over**
```typescript
// Switch to Supabase only
await supabase.from('supabase_users').select();
// Remove MySQL dependency
```

---

## Conclusion

**Strengths:**
1. Well-normalized MySQL schema with proper constraints
2. Efficient vector search with Supabase pgvector
3. RLS policies implemented for security
4. Protocol inheritance system for scaling
5. Comprehensive audit logging

**Weaknesses:**
1. Missing indexes on critical columns (users, queries, searchHistory)
2. No data archival strategy for old queries
3. Dual database complexity requires ID mapping
4. No query result caching
5. No partitioning for large tables

**Priority Fixes:**
1. **Add missing indexes** (users.supabaseId, queries.userId, etc.)
2. **Implement data archival** for queries older than 1 year
3. **Add query result caching** (Redis)
4. **Monitor RLS policy performance** after deployment
5. **Plan migration to unified Supabase** (6-12 months)

**Performance Targets:**
- Protocol search: <100ms (currently meeting)
- User lookup: <10ms (add indexes to meet)
- Query history: <50ms (add indexes + partitioning)
- Agency mapping: <1ms (already meeting with cache)

---

## File References

**Schema Files:**
- MySQL Schema: `/Users/tanner-osterkamp/Protocol Guide Manus/drizzle/schema.ts`
- Supabase Migrations: `/Users/tanner-osterkamp/Protocol Guide Manus/docs/migrations/`
- RLS Policies: `/Users/tanner-osterkamp/Protocol Guide Manus/docs/migrations/001-add-rls-policies.sql`
- Agency Migration: `/Users/tanner-osterkamp/Protocol Guide Manus/docs/migrate-agencies-nasemso.sql`

**Implementation Files:**
- Supabase Client: `/Users/tanner-osterkamp/Protocol Guide Manus/lib/supabase.ts`
- ID Mapping Layer: `/Users/tanner-osterkamp/Protocol Guide Manus/server/db-agency-mapping.ts`
- Search Router: `/Users/tanner-osterkamp/Protocol Guide Manus/server/routers.ts`

**Documentation:**
- Schema Audit: `/Users/tanner-osterkamp/Protocol Guide Manus/docs/supabase-schema-audit.md`
- Database Fixes: `/Users/tanner-osterkamp/Protocol Guide Manus/docs/DATABASE-FIXES-SUMMARY.md`
