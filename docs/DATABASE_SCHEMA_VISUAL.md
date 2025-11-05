# Database Schema Visual Guide
## Medic-Bot Entity Relationship Diagrams

**Date:** October 31, 2025
**Version:** 2.0

---

## Complete Entity Relationship Diagram

```mermaid
erDiagram
    %% Core User Management
    USERS ||--o{ SESSIONS : "has multiple"
    USERS ||--o{ AUDIT_LOGS : "generates"
    USERS ||--o{ PATIENT_CONTEXTS : "creates"
    USERS ||--o{ NARRATIVE_HISTORY : "writes"
    USERS ||--o{ PROTOCOL_USAGE : "accesses"
    USERS ||--o{ DOSING_CALCULATIONS : "performs"

    %% Protocol Management
    PROTOCOLS ||--o{ PROTOCOL_VERSIONS : "has versions"
    PROTOCOLS ||--o{ PROTOCOL_USAGE : "tracked in"
    PROTOCOLS ||--|| PROVIDER_IMPRESSIONS : "mapped to"

    %% Medication Management
    MEDICATIONS ||--o{ DOSING_CALCULATIONS : "used in"

    %% Patient Context & ImageTrend
    PATIENT_CONTEXTS ||--|| IMAGETREND_SYNC : "syncs with"
    PATIENT_CONTEXTS ||--o{ NARRATIVE_HISTORY : "contains"
    PATIENT_CONTEXTS ||--o{ PROTOCOL_USAGE : "references"
    PATIENT_CONTEXTS ||--o{ DOSING_CALCULATIONS : "requires"

    %% Rate Limiting
    RATE_LIMIT_CONFIG ||--o{ RATE_LIMIT_VIOLATIONS : "enforces"

    %% Entity Details
    USERS {
        uuid id PK
        text email UK "Unique email address"
        text badge_number UK "LA County Fire badge"
        text full_name
        user_role role "paramedic, emt, medical_director, admin"
        text station_id "Fire station assignment"
        text department "Default: lacfd"
        timestamptz created_at
        timestamptz last_login
        timestamptz deleted_at "Soft delete"
    }

    SESSIONS {
        uuid id PK
        uuid user_id FK
        text fingerprint "SHA256 device hash"
        inet ip_address
        text user_agent
        timestamptz expires_at
        timestamptz last_activity
        jsonb metadata
    }

    PROTOCOLS {
        uuid id PK
        varchar tp_code UK "Treatment Protocol code"
        text tp_name "Protocol name"
        varchar pi_code "Provider Impression code"
        text category "cardiac, respiratory, trauma, etc"
        jsonb content "Full protocol text"
        text[] keywords "Search keywords"
        integer version
        date effective_date
        boolean medical_director_approved
        integer popularity_score
        tsvector search_vector "Full-text search"
        timestamptz deleted_at "Soft delete"
    }

    PROTOCOL_VERSIONS {
        uuid id PK
        uuid protocol_id FK
        integer version
        jsonb content "Version snapshot"
        text change_summary
        uuid approved_by FK
        timestamptz approved_at
        date effective_date
    }

    PROVIDER_IMPRESSIONS {
        uuid id PK
        varchar pi_code UK
        text pi_name
        varchar tp_code FK
        varchar tp_code_pediatric
        text[] keywords
        text guidelines
    }

    MEDICATIONS {
        uuid id PK
        text medication_name UK
        text medication_class
        jsonb adult_dosing
        jsonb pediatric_dosing
        text[] indications
        text[] contraindications
        text[] routes
        numeric max_single_dose
        tsvector search_vector
    }

    PATIENT_CONTEXTS {
        uuid id PK
        uuid session_id FK
        uuid user_id FK
        text epcr_id UK "ImageTrend ePCR ID"
        text incident_number
        integer age_years
        text sex "male, female, unknown"
        numeric weight_kg
        text chief_complaint
        jsonb vitals "Array of vital signs"
        text[] allergies
        timestamptz expires_at "Auto-purge after 24h"
        boolean contains_phi
    }

    IMAGETREND_SYNC {
        uuid id PK
        uuid patient_context_id FK
        text epcr_id
        text sync_direction "inbound, outbound, bidirectional"
        text sync_status "pending, in_progress, completed, failed"
        text[] fields_synced
        jsonb sync_payload
        integer retry_count
        timestamptz last_successful_sync
    }

    NARRATIVE_HISTORY {
        uuid id PK
        uuid user_id FK
        uuid patient_context_id FK
        text narrative_text
        text narrative_format "soap, chronological, nemsis"
        text generation_method "llm, template, manual"
        text[] protocols_referenced
        boolean synced_to_imagetrend
        timestamptz created_at
    }

    PROTOCOL_USAGE {
        uuid id PK
        uuid protocol_id FK
        uuid user_id FK
        uuid patient_context_id FK
        text access_type "viewed, applied, referenced"
        text access_method "search, quick_access, triage"
        integer duration_seconds
        timestamptz accessed_at
    }

    DOSING_CALCULATIONS {
        uuid id PK
        uuid user_id FK
        uuid patient_context_id FK
        text medication_name
        numeric weight_kg
        numeric calculated_dose
        text dose_unit "mg, mcg, mL"
        text route "IV, IO, IM, PO"
        jsonb calculation_details
        boolean within_max_dose
        text[] warnings
        timestamptz created_at
    }

    AUDIT_LOGS {
        uuid event_id PK
        timestamptz timestamp
        varchar user_id
        user_role user_role
        audit_action action
        varchar resource
        audit_outcome outcome "success, failure, partial"
        jsonb metadata
        inet ip_address
        integer duration_ms
    }

    METRICS {
        uuid id PK
        text metric_name
        text metric_type "counter, histogram"
        date date
        integer hour "0-23"
        bigint count
        numeric p50 "50th percentile"
        numeric p95 "95th percentile"
        numeric p99 "99th percentile"
    }

    RATE_LIMIT_CONFIG {
        uuid id PK
        text limit_type UK "CHAT, API, DOSING, AUTH, PHI"
        integer requests_per_window
        integer window_ms
        boolean enabled
    }

    RATE_LIMIT_VIOLATIONS {
        uuid id PK
        text fingerprint
        inet ip_address
        text limit_type
        integer violation_count
        integer reputation_score "0-100"
        boolean is_banned
        timestamptz banned_until
    }
```

---

## Core User & Session Management

```mermaid
graph TD
    A[User Login] --> B{Authentication}
    B -->|Success| C[Create Session]
    B -->|Failure| D[Log Audit Event]
    C --> E[Generate Fingerprint]
    E --> F[Store Session in DB]
    F --> G[Set Expiration 60 min]
    G --> H[User Active]
    H --> I{Activity?}
    I -->|Yes| J[Update last_activity]
    I -->|No| K{Session Expired?}
    K -->|Yes| L[Auto Cleanup]
    K -->|No| H
    J --> H

    style C fill:#90EE90
    style D fill:#FFB6C1
    style L fill:#FFA500
```

**Key Features:**
- Session fingerprinting (SHA256 of IP + User-Agent + headers)
- Multi-device support (multiple active sessions per user)
- Automatic cleanup of expired sessions (trigger-based)
- 60-minute session timeout (configurable)

---

## Protocol Search & Retrieval Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Cache
    participant DB
    participant FTS as Full-Text Search

    User->>App: Search "chest pain"
    App->>Cache: Check L1 (memory)
    alt Cache Hit
        Cache-->>App: Return cached results
    else Cache Miss
        App->>DB: Query protocols table
        DB->>FTS: GIN index search
        FTS-->>DB: Matching protocols
        DB-->>App: Top 10 results (ranked)
        App->>Cache: Store in L1
    end
    App->>DB: INSERT protocol_usage
    App-->>User: Display protocols
```

**Performance Optimization:**
- L1 Cache: In-memory LRU (5-minute TTL)
- L2 Cache: Redis (optional, 15-minute TTL)
- GIN Index: Full-text search vector
- Weighted Search: Protocol name (A) > Keywords (B) > Content (C)
- Popularity Boost: 70% relevance + 30% popularity score

---

## Patient Context Lifecycle (HIPAA-Compliant)

```mermaid
stateDiagram-v2
    [*] --> Created: Paramedic starts call
    Created --> Active: Vitals added
    Active --> Updated: Chief complaint, vitals, allergies
    Updated --> Active: Continue adding data
    Active --> NarrativeGenerated: Generate narrative
    NarrativeGenerated --> SyncedToImageTrend: Sync to ePCR
    SyncedToImageTrend --> Expired: 24 hours elapsed
    Expired --> Purged: Auto-purge trigger
    Purged --> [*]

    note right of Created
        epcr_id: ImageTrend link
        expires_at: NOW + 24h
        auto_purge: TRUE
    end note

    note right of SyncedToImageTrend
        Narrative synced to ePCR
        Source of truth: ImageTrend
    end note

    note right of Purged
        HIPAA Minimum Necessary
        No PHI retained longer than needed
    end note
```

**HIPAA Compliance:**
- Auto-purge after 24 hours (minimum necessary principle)
- Field-level encryption for PHI (chief_complaint, allergies)
- All access logged to audit_logs table
- No patient names or identifiers stored (only demographics)

---

## ImageTrend Bidirectional Sync

```mermaid
flowchart TB
    subgraph ImageTrend ePCR
        IT[ImageTrend Elite]
    end

    subgraph Medic-Bot
        MB[Medic-Bot App]
        PC[patient_contexts]
        NH[narrative_history]
        IS[imagetrend_sync]
    end

    IT -->|1. Patient demographics| MB
    MB -->|2. Create context| PC
    MB -->|3. Log sync| IS
    PC -->|4. Generate narrative| NH
    NH -->|5. Sync narrative| IS
    IS -->|6. Send to ePCR| IT
    IS -->|7. Update status| IS

    IT -.->|Error/Retry| IS
    IS -.->|Exponential backoff| IT

    style IT fill:#FFE4B5
    style MB fill:#ADD8E6
    style PC fill:#90EE90
    style NH fill:#FFB6C1
    style IS fill:#FFA500
```

**Sync Strategy:**
- **Inbound:** Patient demographics, vitals, dispatch code
- **Outbound:** Generated narrative, protocols used, medications
- **Retry Logic:** Exponential backoff (1min, 2min, 4min) max 3 retries
- **Error Handling:** Log failures to audit_logs, alert on-call

---

## Audit Trail & Compliance Logging

```mermaid
graph LR
    A[User Action] --> B{Requires Audit?}
    B -->|Yes| C[Log to audit_logs]
    B -->|No| D[Skip]
    C --> E[Immutable Record]
    E --> F{Contains PHI?}
    F -->|Yes| G[Encrypt metadata]
    F -->|No| H[Store plaintext]
    G --> I[6-year retention]
    H --> I
    I --> J{Age > 1 year?}
    J -->|Yes| K[Archive to cold storage]
    J -->|No| L[Keep in main table]
    K --> M{Age > 6 years?}
    M -->|Yes| N[Purge HIPAA compliant]
    M -->|No| K

    style E fill:#FFB6C1
    style G fill:#FFA500
    style N fill:#FF6347
```

**Audit Actions Tracked:**
- User: login, logout, session start/end
- Protocol: view, search, apply
- Patient: create, view, update, delete
- Medication: dose calculation
- Narrative: generate, sync
- PHI: any access to patient data
- Admin: config changes, user management

**HIPAA Requirements Met:**
- Immutable audit trail (triggers prevent UPDATE/DELETE)
- 6-year retention period
- All PHI access logged
- Includes: who, what, when, where (IP), outcome

---

## Protocol Version Control & Approval Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: Medical Director creates update
    Draft --> Review: Submit for review
    Review --> Approved: Medical Director approves
    Review --> Rejected: Changes requested
    Rejected --> Draft: Revise
    Approved --> Scheduled: Set effective_date
    Scheduled --> Active: effective_date reached
    Active --> Superseded: Newer version active
    Superseded --> Archived: expiration_date passed
    Archived --> [*]

    note right of Approved
        approved_by: user_id
        approved_at: timestamp
        version: auto-increment
    end note

    note right of Active
        Current protocol version
        Used for all searches
    end note

    note right of Archived
        Historical record only
        Kept for regulatory compliance
    end note
```

**Version Control Features:**
- Every protocol change creates new version
- Previous versions retained permanently
- Medical director approval required
- Effective date scheduling
- Audit trail of all changes

---

## Medication Dosing Safety Checks

```mermaid
flowchart TD
    A[User requests dose] --> B[Get patient weight]
    B --> C[Get medication]
    C --> D[Calculate dose]
    D --> E{Within max single dose?}
    E -->|No| F[Add WARNING]
    E -->|Yes| G{Check contraindications}
    F --> G
    G -->|Found| H[Add WARNING]
    G -->|None| I{Check interactions}
    H --> I
    I -->|Found| J[Add WARNING]
    I -->|None| K[Calculate final dose]
    J --> K
    K --> L[Log to dosing_calculations]
    L --> M[Return dose + warnings]
    M --> N{User confirms?}
    N -->|Yes| O[Apply dose]
    N -->|No| P[Cancel]

    style F fill:#FF6347
    style H fill:#FF6347
    style J fill:#FF6347
    style L fill:#90EE90
```

**Safety Features:**
- Max single dose validation
- Max daily dose validation
- Contraindication checking
- Drug interaction alerts
- Pediatric vs adult dosing
- Weight-based calculations
- Audit trail of all calculations

---

## Rate Limiting & Security

```mermaid
graph TD
    A[Incoming Request] --> B[Generate Fingerprint]
    B --> C{Check rate_limit_violations}
    C -->|Banned| D[Reject: 429 Too Many Requests]
    C -->|Not banned| E{Check request count}
    E -->|Exceeded| F[Increment violation_count]
    E -->|Within limit| G[Process request]
    F --> H{Reputation score < 10?}
    H -->|Yes| I[Auto-ban 1-24 hours]
    H -->|No| J[Decrement reputation]
    I --> D
    J --> D
    G --> K[Log to audit_logs]
    K --> L[Return response]

    style D fill:#FF6347
    style I fill:#FFA500
    style L fill:#90EE90
```

**Rate Limit Tiers:**
- CHAT: 20 requests/minute
- API: 60 requests/minute
- DOSING: 30 requests/minute
- AUTH: 5 requests/15 minutes
- PHI: 50 requests/minute
- GLOBAL: 500 requests/15 minutes

**Reputation System:**
- Start: 100 points
- Violation: -5 points
- Ban threshold: <10 points
- Ban duration: 1 hour (score 6-10), 24 hours (score 0-5)

---

## Data Retention & Archival Strategy

```mermaid
timeline
    title Data Lifecycle (HIPAA Compliant)
    section Active
        0-24 hours : Patient Contexts (auto-purge)
        0-30 days : Metrics (hot data)
                   : Narratives (cache)
        0-90 days : Protocol Usage
                   : Rate Limit Violations
    section Archive
        1-6 years : Audit Logs (warm storage)
                   : Dosing Calculations
        5+ years : Protocol Versions (cold storage)
    section Purge
        >24 hours : Patient Contexts (DELETED)
        >90 days : Metrics (DELETED)
                   : Protocol Usage (DELETED)
        >6 years : Audit Logs (DELETED)
                   : Dosing Calculations (DELETED)
```

**Automated Retention Jobs:**
- **Daily (3 AM):** Purge expired patient contexts, sessions, old metrics
- **Hourly:** Refresh materialized views for analytics
- **Monthly:** Create new audit log partition
- **Annually:** Archive audit logs >1 year to cold storage

---

## Backup & Disaster Recovery

```mermaid
flowchart LR
    subgraph Continuous
        A[Supabase PITR] -->|7 days| B[Point-in-Time Recovery]
    end

    subgraph Daily
        C[Automated Backup] -->|Encrypted| D[S3 Bucket]
        D -->|30-day retention| E[Daily Backups]
    end

    subgraph Weekly
        F[Full Backup] -->|Encrypted| G[S3 Archive]
        G -->|1-year retention| H[Weekly Backups]
    end

    subgraph Disaster
        I[Database Failure] --> J{Within 7 days?}
        J -->|Yes| B
        J -->|No| K[Restore from S3]
        K --> L[Decrypt]
        L --> M[pg_restore]
        M --> N[Validate]
        N --> O[Resume Operations]
    end

    style B fill:#90EE90
    style D fill:#ADD8E6
    style G fill:#FFE4B5
    style O fill:#90EE90
```

**Recovery Objectives:**
- **RTO (Recovery Time Objective):** <2 hours
- **RPO (Recovery Point Objective):** <1 second (PITR), <24 hours (daily backup)
- **Backup Encryption:** AES-256-CBC
- **Backup Location:** S3 us-west-2 (same region as Supabase)

---

## Performance Monitoring & Alerting

```mermaid
graph TD
    A[Database Queries] --> B[pg_stat_statements]
    B --> C[Slow Query Detection]
    C --> D{Query > 1 second?}
    D -->|Yes| E[Log to metrics]
    D -->|No| F[Continue]
    E --> G[Alert on-call]

    H[Connection Pool] --> I[pg_stat_activity]
    I --> J{Connections > 80%?}
    J -->|Yes| K[Scale up pool]
    J -->|No| L[Continue]
    K --> G

    M[Materialized Views] --> N[Scheduled Refresh]
    N --> O[Update analytics]
    O --> P[Dashboard]

    Q[Audit Logs] --> R[Breach Detection]
    R --> S{Suspicious pattern?}
    S -->|Yes| T[Alert security team]
    S -->|No| U[Continue]

    style E fill:#FF6347
    style K fill:#FFA500
    style T fill:#FF6347
    style P fill:#90EE90
```

**Key Metrics Monitored:**
- Response time (P50, P95, P99)
- Error rate by endpoint
- Connection pool utilization
- Slow queries (>1 second)
- Cache hit ratio (target: >95%)
- Database CPU/memory
- Breach detection patterns

---

## Schema Migration Strategy

```mermaid
gantt
    title Database Migration Roadmap (10 Weeks)
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Security & BAAs           :crit, p1a, 2025-11-01, 1w
    Protocol Migration        :crit, p1b, 2025-11-01, 2w
    Authentication           :p1c, 2025-11-08, 1w
    section Phase 2: ImageTrend
    Patient Data Model       :p2a, 2025-11-15, 1w
    Sync Infrastructure      :p2b, 2025-11-22, 1w
    section Phase 3: Analytics
    Usage Tracking           :p3a, 2025-11-29, 1w
    Performance Optimization :p3b, 2025-12-06, 1w
    section Phase 4: Compliance
    HIPAA Compliance         :crit, p4a, 2025-12-13, 1w
    Security Audit           :p4b, 2025-12-20, 1w
    section Phase 5: Production
    Deployment               :crit, p5a, 2025-12-27, 1w
    User Training            :p5b, 2026-01-03, 1w
```

**Critical Path:**
1. Week 1-2: Foundation (Security + Protocol Migration)
2. Week 3-4: ImageTrend Integration
3. Week 5-6: Analytics & Optimization
4. Week 7-8: HIPAA Compliance & Security
5. Week 9-10: Production Deployment & Training

**Rollback Plan:**
- Keep JSON files for 30 days post-migration
- Feature flag to switch between database and file-based
- Blue-green deployment for zero downtime
- Automated rollback if error rate >5%

---

## Summary Statistics

### Current State (October 2025)

| Entity | Count | Growth Rate | Retention |
|--------|-------|-------------|-----------|
| Protocols | 7,012 | Stable | Permanent |
| Provider Impressions | 102 | Stable | Permanent |
| Medications | ~50 | Stable | Permanent |
| Users | ~100 (estimated) | +10/month | Permanent |
| Active Sessions | ~20 (peak) | Variable | 60 minutes |
| Audit Logs | ~100K/year | +20%/year | 6 years |
| Patient Contexts | ~50 (concurrent) | Variable | 24 hours |

### Projected Growth (Year 1)

| Metric | Current | +6 months | +12 months |
|--------|---------|-----------|------------|
| Users | 100 | 200 | 400 |
| Daily Active Users | 20 | 50 | 100 |
| Protocols Accessed/Day | 500 | 1,500 | 3,000 |
| Narratives Generated/Day | 50 | 150 | 300 |
| Database Size | <1GB | 2-3GB | 5-8GB |
| Audit Log Rows | 100K | 600K | 1.2M |

### Performance Benchmarks

| Operation | Current (File) | Target (DB) | Improvement |
|-----------|---------------|-------------|-------------|
| Protocol Search | 50-200ms | <50ms | 4x faster |
| Full KB Load | 500ms | N/A | Eliminated |
| Triage Matching | 100-300ms | <100ms | 2x faster |
| Dosing Calc | 10-20ms | <15ms | Same/Better |

---

**Document Version:** 2.0
**Last Updated:** October 31, 2025
**Next Review:** Post-migration (December 2025)
