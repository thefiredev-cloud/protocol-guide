# Protocol Guide - Enterprise Database Schema Documentation

**Version:** 2.0  
**Last Updated:** January 2026  
**Database:** Supabase (PostgreSQL 15 with pgvector)

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Tables](#core-tables)
3. [Search Infrastructure](#search-infrastructure)
4. [Security & Compliance](#security--compliance)
5. [Performance Optimization](#performance-optimization)
6. [Enterprise Features](#enterprise-features)
7. [Scaling Considerations](#scaling-considerations)

---

## Architecture Overview

Protocol Guide uses a hybrid database architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                     │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │  manus_protocol_    │  │  manus_agencies             │  │
│  │  chunks             │  │  (22K+ agencies)            │  │
│  │  (58K+ chunks)      │  │                             │  │
│  │  • Vector embeddings │  │  • State hierarchy          │  │
│  │  • Full-text search  │  │  • Protocol inheritance     │  │
│  │  • State/agency FK   │  │  • Subscription data        │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  User Tables (manus_users, agencies, agency_members) │   │
│  │  • RLS-protected user data                           │   │
│  │  • HIPAA-compliant audit logs                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Vector Search | pgvector + Voyage AI | Semantic protocol search |
| Full-Text Search | PostgreSQL tsvector | Keyword-based fallback |
| Caching | Redis (Upstash) | Query result caching |
| Row-Level Security | PostgreSQL RLS | HIPAA compliance |

---

## Core Tables

### manus_protocol_chunks

**Purpose:** Stores searchable protocol content with vector embeddings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `agency_id` | INTEGER | FK to manus_agencies |
| `protocol_number` | TEXT | Protocol identifier (e.g., "502") |
| `protocol_title` | TEXT | Full protocol title |
| `section` | TEXT | Section within protocol |
| `content` | TEXT | Chunk content (typically 500-1000 words) |
| `embedding` | vector(1536) | Voyage AI embedding |
| `search_vector` | tsvector | Full-text search index |
| `state_code` | TEXT | 2-letter state code |
| `state_name` | TEXT | Full state name |
| `agency_name` | TEXT | Denormalized agency name |
| `image_urls` | TEXT[] | Associated images |
| `has_images` | BOOLEAN | Quick image check |
| `source_pdf_url` | TEXT | Original PDF source |
| `created_at` | TIMESTAMP | Creation timestamp |
| `last_verified_at` | TIMESTAMP | Last verification date |

**Indexes:**

| Index | Type | Purpose |
|-------|------|---------|
| `idx_manus_chunks_embedding_hnsw` | HNSW | Vector similarity search |
| `idx_manus_chunks_search_vector` | GIN | Full-text keyword search |
| `idx_manus_chunks_agency_id` | B-tree | Agency filtering |
| `idx_manus_chunks_state_code` | B-tree | State filtering |
| `idx_manus_chunks_state_agency` | B-tree | Combined filtering |

### manus_agencies

**Purpose:** Master agency directory with protocol hierarchy.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `name` | TEXT | Agency name |
| `state_code` | TEXT | 2-letter state code |
| `state` | TEXT | Full state name |
| `agency_type` | ENUM | fire_dept, ems_agency, hospital, state_office, regional_council |
| `parent_protocol_source_id` | INTEGER | For protocol inheritance |
| `call_volume_tier` | TEXT | Size classification |
| `is_active` | BOOLEAN | Active status |
| `uses_state_protocols` | BOOLEAN | Inherits state protocols |
| `integration_partner` | ENUM | imagetrend, esos, zoll, etc. |
| `is_verified` | BOOLEAN | Verification status |
| `protocol_count` | INTEGER | Cached protocol count |

**Indexes:**

| Index | Type | Purpose |
|-------|------|---------|
| `idx_manus_agencies_state_code` | B-tree | State filtering |
| `idx_manus_agencies_type` | B-tree | Agency type filtering |
| `idx_manus_agencies_parent` | B-tree | Inheritance lookups |
| `idx_manus_agencies_name_lower` | B-tree | Name search |

---

## Search Infrastructure

### Semantic Search Flow

```
User Query
    ↓
┌─────────────────────┐
│ Query Normalization │ ← EMS abbreviation expansion
│ (ems-query-normalizer) │   Typo correction
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Redis Cache Check   │ ← 1-hour TTL
└─────────────────────┘
    ↓ (cache miss)
┌─────────────────────┐
│ Voyage AI Embedding │ ← voyage-large-2 (1536 dim)
│ Generation          │
└─────────────────────┘
    ↓
┌─────────────────────┐
│ pgvector HNSW       │ ← Cosine similarity
│ Similarity Search   │   Top-k retrieval
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Re-ranking          │ ← Cross-encoder scoring
│ (optional)          │
└─────────────────────┘
    ↓
Results
```

### Search RPC Functions

```sql
-- Primary semantic search
search_manus_protocols(
    query_embedding vector(1536),
    agency_filter INTEGER,
    state_code_filter TEXT,
    match_count INTEGER,
    match_threshold FLOAT
) → TABLE

-- Hybrid search (vector + keyword)
search_manus_protocols_fts(
    query_text TEXT,
    query_embedding vector(1536),
    agency_filter INTEGER,
    state_code_filter TEXT,
    match_count INTEGER,
    match_threshold FLOAT
) → TABLE

-- Inheritance-aware search
search_manus_protocols_inherited(
    query_embedding vector(1536),
    agency_id_param INTEGER,
    match_count INTEGER,
    match_threshold FLOAT
) → TABLE
```

---

## Security & Compliance

### Row-Level Security (RLS)

Protocol Guide implements comprehensive RLS policies for HIPAA compliance:

| Table | Anonymous | Authenticated | Admin | Service Role |
|-------|-----------|---------------|-------|--------------|
| `manus_protocol_chunks` | ✅ SELECT | ✅ SELECT | ✅ ALL | ✅ ALL |
| `agencies` | ✅ SELECT | ✅ SELECT | ✅ ALL | ✅ ALL |
| `users` | ❌ | Own row only | ✅ ALL | ✅ ALL |
| `queries` | ❌ | Own rows only | ✅ SELECT | ✅ ALL |
| `bookmarks` | ❌ | Own rows only | ❌ | ✅ ALL |
| `audit_logs` | ❌ | ❌ | ✅ SELECT | ✅ ALL |

### Helper Functions

```sql
-- Get current user's internal ID
get_current_user_id() → INTEGER

-- Check if current user is admin
is_admin() → BOOLEAN

-- Check agency membership
is_agency_member(agency_id INTEGER) → BOOLEAN

-- Check agency admin status
is_agency_admin(agency_id INTEGER) → BOOLEAN
```

### HIPAA Compliance Notes

1. **Query Isolation**: Users can only access their own query history
2. **PHI Removal**: Integration logs do not store patient data (see migration 0012)
3. **Audit Trail**: All data modifications are logged
4. **Access Control**: Service role required for sensitive operations

---

## Performance Optimization

### Index Strategy

**Vector Search:**
- HNSW index with `m=16, ef_construction=64`
- Optimized for ~60K vectors at 1536 dimensions
- Query-time ef_search configurable (default: 40)

**Filtering:**
- Pre-filter on agency_id/state_code BEFORE vector search
- Composite indexes for common filter combinations

**Full-Text Search:**
- GIN index on tsvector column
- Weighted search: title (A), section (B), content (C)
- Auto-updated via trigger

### Query Patterns

**DO:**
```sql
-- Filter first, then vector search
SELECT * FROM search_manus_protocols(
    embedding,
    agency_filter := 123,  -- ✅ Pre-filter
    match_count := 10
);
```

**DON'T:**
```sql
-- Avoid post-filtering large result sets
SELECT * FROM search_manus_protocols(
    embedding,
    agency_filter := NULL,
    match_count := 1000  -- ❌ Too many
) WHERE agency_id = 123;  -- ❌ Post-filter
```

### Caching Strategy

| Cache | TTL | Purpose |
|-------|-----|---------|
| Search results | 1 hour | Common query caching |
| Embeddings | 24 hours | Query embedding reuse |
| Agency mapping | 10 minutes | Agency ID lookups |

---

## Enterprise Features

### Protocol Inheritance

Agencies can inherit protocols from parent organizations:

```
State Office (e.g., California EMS Authority)
    ↓ inherits from
Regional Council (e.g., LA County EMS Agency)
    ↓ inherits from
Fire Department (e.g., LAFD)
```

**Implementation:**
```sql
-- Get inheritance chain
SELECT * FROM get_protocol_inheritance_chain(agency_id);

-- Search with inherited protocols
SELECT * FROM search_manus_protocols_inherited(
    embedding,
    agency_id_param := 123
);
```

### Multi-Tenant Architecture

Each agency operates in isolation with:
- Agency-scoped protocol uploads
- Agency-specific search results
- Agency member management
- Subscription-based feature gating

### Analytics Tables

| Table | Purpose |
|-------|---------|
| `analytics_events` | User interaction events |
| `search_analytics` | Search query analytics |
| `protocol_access_logs` | Protocol view tracking |
| `session_analytics` | Session-level metrics |
| `conversion_events` | Subscription conversions |

---

## Scaling Considerations

### Current Scale (January 2026)
- 58,000+ protocol chunks
- 22,000+ agencies
- ~100-200ms average search latency

### Scaling Path

**50K → 500K chunks:**
- Tune HNSW parameters (`m=32, ef_construction=128`)
- Consider partitioning by state_code
- Implement read replicas for search

**500K → 5M chunks:**
- Migrate to dedicated pgvector hosting
- Shard by region/state
- Implement async embedding generation

**Query Volume:**
- Current: Redis caching handles burst traffic
- Scale: Add regional cache nodes
- Enterprise: Dedicated search clusters

### Monitoring

**Key Metrics:**
```sql
-- Check data quality
SELECT * FROM data_quality_metrics;

-- Monitor embedding coverage
SELECT 
    COUNT(*) FILTER (WHERE embedding IS NOT NULL) AS with_embedding,
    COUNT(*) AS total,
    ROUND(COUNT(*) FILTER (WHERE embedding IS NOT NULL)::NUMERIC / COUNT(*) * 100, 2) AS coverage_pct
FROM manus_protocol_chunks;

-- Check index usage
SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## Contact

For enterprise support or schema questions:
- Technical: support@protocolguide.app
- Enterprise Sales: enterprise@protocolguide.app
