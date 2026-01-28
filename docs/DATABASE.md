# Protocol Guide Database Schema

**Last Updated:** 2026-01-28  
**Database System:** PostgreSQL 17 (Supabase)  
**ORM:** Drizzle ORM  
**Source of Truth:** `/drizzle/schema.ts`

---

## Table of Contents

1. [Overview](#overview)
2. [Tables](#tables)
   - [Core Tables](#core-tables)
   - [Analytics Tables](#analytics-tables)
   - [Supabase-Only Tables](#supabase-only-tables)
3. [Enums](#enums)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Database Functions](#database-functions)
8. [Triggers](#triggers)
9. [Vector/Embedding Storage](#vectorembedding-storage)

---

## Overview

Protocol Guide uses a PostgreSQL database hosted on Supabase with the following key characteristics:

- **Primary Database:** Supabase PostgreSQL 17
- **Schema Management:** Drizzle ORM migrations
- **Vector Search:** pgvector extension with 1536-dimension embeddings (Voyage AI)
- **Security:** Row Level Security (RLS) policies for HIPAA compliance
- **Full-Text Search:** PostgreSQL tsvector with GIN indexes

### Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Supabase PostgreSQL                     │
├─────────────────────────────────────────────────────────────┤
│  Core Tables          │  Analytics Tables  │  Vector Search  │
│  ────────────         │  ────────────────  │  ─────────────  │
│  manus_users          │  analytics_events  │  manus_protocol │
│  agencies             │  search_analytics  │  _chunks        │
│  agency_members       │  session_analytics │  (pgvector)     │
│  protocol_chunks      │  daily_metrics     │                 │
│  queries              │  retention_cohorts │                 │
│  bookmarks            │  conversion_events │                 │
│  feedback             │  content_gaps      │                 │
│  ...                  │  ...               │                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Tables

### Core Tables

#### `manus_users`

User accounts and authentication. Maps to `users` export in schema.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `auth_id` | uuid | YES | - | Supabase auth.users.id |
| `manus_open_id` | text | YES | - | Legacy Manus OAuth ID |
| `name` | text | YES | - | Display name |
| `email` | text | YES | - | Email address |
| `login_method` | text | YES | - | OAuth provider used |
| `role` | text | YES | 'user' | User role (user/admin) |
| `created_at` | timestamptz | YES | now() | Account creation |
| `updated_at` | timestamptz | YES | now() | Last update |
| `last_signed_in` | timestamptz | YES | - | Last login timestamp |
| `tier` | text | YES | 'free' | Subscription tier |
| `query_count_today` | integer | YES | 0 | Daily query count |
| `last_query_date` | date | YES | - | Date of last query |
| `selected_agency_id` | integer | YES | - | Currently selected agency |
| `stripe_customer_id` | text | YES | - | Stripe customer ID |
| `subscription_id` | text | YES | - | Stripe subscription ID |
| `subscription_status` | text | YES | - | active/canceled/etc |
| `subscription_end_date` | timestamptz | YES | - | Subscription expiry |

---

#### `agencies`

EMS agencies and organizations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `name` | varchar(255) | NO | - | Agency name |
| `slug` | varchar(100) | NO | - | URL-safe identifier |
| `state_code` | varchar(2) | NO | - | Two-letter state code |
| `state` | varchar(2) | YES | - | State code (duplicate) |
| `county` | varchar(100) | YES | - | County name |
| `agency_type` | agency_type | YES | - | Type of agency |
| `logo_url` | varchar(500) | YES | - | Logo URL |
| `contact_email` | varchar(320) | YES | - | Contact email |
| `contact_phone` | varchar(20) | YES | - | Contact phone |
| `address` | text | YES | - | Physical address |
| `supabase_agency_id` | integer | YES | - | Legacy mapping ID |
| `stripe_customer_id` | varchar(255) | YES | - | Stripe customer ID |
| `subscription_tier` | subscription_tier | YES | 'starter' | Subscription level |
| `subscription_status` | varchar(50) | YES | - | Subscription status |
| `settings` | json | YES | - | Agency settings JSON |
| `created_at` | timestamp | NO | now() | Creation timestamp |
| `updated_at` | timestamp | NO | now() | Last update |

**Indexes:**
- `idx_agencies_slug` on (slug)
- `idx_agencies_state` on (state)
- `idx_agencies_state_code` on (state_code)

---

#### `agency_members`

Agency membership and roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `agency_id` | integer | NO | - | FK to agencies.id |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `role` | member_role | NO | 'member' | Member role |
| `invited_by` | integer | YES | - | FK to inviting user |
| `invited_at` | timestamp | YES | - | Invitation timestamp |
| `accepted_at` | timestamp | YES | - | Acceptance timestamp |
| `status` | member_status | YES | 'pending' | Membership status |
| `created_at` | timestamp | NO | now() | Creation timestamp |

**Indexes:**
- `idx_agency_members_agency` on (agency_id)
- `idx_agency_members_user` on (user_id)

---

#### `protocol_chunks`

Legacy protocol storage (county-based).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `county_id` | integer | NO | - | FK to counties.id |
| `protocol_number` | varchar(50) | NO | - | Protocol identifier |
| `protocol_title` | varchar(255) | NO | - | Protocol title |
| `section` | varchar(255) | YES | - | Category/section |
| `content` | text | NO | - | Protocol text content |
| `source_pdf_url` | varchar(500) | YES | - | Source PDF URL |
| `created_at` | timestamp | NO | now() | Creation timestamp |
| `protocol_effective_date` | varchar(20) | YES | - | Effective date |
| `last_verified_at` | timestamp | YES | - | Last verification |
| `protocol_year` | integer | YES | - | Protocol year |

**Indexes:**
- `idx_protocols_county` on (county_id)
- `idx_protocols_section` on (section)
- `idx_protocols_number` on (protocol_number)
- `idx_protocols_year` on (protocol_year)

---

#### `counties`

Geographic county reference data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `name` | varchar(255) | NO | - | County name |
| `state` | varchar(64) | NO | - | State name |
| `uses_state_protocols` | boolean | NO | - | Uses state protocols |
| `protocol_version` | varchar(50) | YES | - | Protocol version |
| `created_at` | timestamp | NO | now() | Creation timestamp |

**Indexes:**
- `idx_counties_state` on (state)

---

#### `queries`

User query history (AI-powered searches).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `county_id` | integer | NO | - | FK to counties.id |
| `query_text` | text | NO | - | User's query |
| `response_text` | text | YES | - | AI response |
| `protocol_refs` | json | YES | - | Referenced protocols |
| `created_at` | timestamp | NO | now() | Query timestamp |

---

#### `bookmarks`

User-saved protocol bookmarks.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `protocol_number` | varchar(50) | NO | - | Protocol identifier |
| `protocol_title` | varchar(255) | NO | - | Protocol title |
| `section` | varchar(255) | YES | - | Section bookmarked |
| `content` | text | NO | - | Bookmarked content |
| `agency_id` | integer | YES | - | FK to agencies.id |
| `agency_name` | varchar(255) | YES | - | Agency name |
| `created_at` | timestamp | NO | now() | Bookmark timestamp |

---

#### `feedback`

User feedback and error reports.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `category` | feedback_category | NO | - | Feedback type |
| `protocol_ref` | varchar(255) | YES | - | Related protocol |
| `county_id` | integer | YES | - | FK to counties.id |
| `subject` | varchar(255) | NO | - | Feedback subject |
| `message` | text | NO | - | Feedback message |
| `status` | feedback_status | NO | 'pending' | Review status |
| `admin_notes` | text | YES | - | Admin notes |
| `created_at` | timestamp | NO | now() | Submission time |
| `updated_at` | timestamp | NO | now() | Last update |

---

#### `contact_submissions`

Contact form submissions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `name` | varchar(255) | NO | - | Submitter name |
| `email` | varchar(320) | NO | - | Contact email |
| `message` | text | NO | - | Message content |
| `status` | contact_status | NO | 'pending' | Review status |
| `created_at` | timestamp | NO | now() | Submission time |

---

#### `audit_logs`

HIPAA-compliant audit trail.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | YES | - | FK to manus_users.id |
| `action` | varchar(50) | NO | - | Action performed |
| `entity_type` | varchar(50) | YES | - | Entity type affected |
| `entity_id` | varchar(100) | YES | - | Entity ID affected |
| `metadata` | json | YES | - | Additional data |
| `ip_address` | varchar(45) | YES | - | Client IP |
| `user_agent` | text | YES | - | Client user agent |
| `created_at` | timestamp | NO | now() | Action timestamp |

**Indexes:**
- `idx_audit_logs_user` on (user_id)
- `idx_audit_logs_action` on (action)
- `idx_audit_logs_created` on (created_at)

---

#### `integration_logs`

Partner integration analytics (HIPAA-compliant - no PHI).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `partner` | integration_partner | NO | - | Partner name |
| `agency_id` | varchar(100) | YES | - | Partner agency ID |
| `agency_name` | varchar(255) | YES | - | Partner agency name |
| `search_term` | varchar(500) | YES | - | Search query |
| `response_time_ms` | integer | YES | - | Response latency |
| `result_count` | integer | YES | - | Results returned |
| `ip_address` | varchar(45) | YES | - | Client IP |
| `user_agent` | varchar(500) | YES | - | Client user agent |
| `created_at` | timestamp | NO | now() | Log timestamp |

**Note:** PHI fields (userAge, impression) were intentionally removed for HIPAA compliance.

**Indexes:**
- `idx_integration_logs_partner` on (partner)
- `idx_integration_logs_created_at` on (created_at)
- `idx_integration_logs_agency_id` on (agency_id)

---

#### `user_auth_providers`

OAuth provider connections.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `provider` | varchar(50) | NO | - | OAuth provider name |
| `provider_user_id` | varchar(255) | NO | - | Provider's user ID |
| `access_token` | text | YES | - | OAuth access token |
| `refresh_token` | text | YES | - | OAuth refresh token |
| `expires_at` | timestamp | YES | - | Token expiry |
| `created_at` | timestamp | NO | now() | Link creation |
| `updated_at` | timestamp | NO | now() | Last update |

**Indexes:**
- `idx_auth_providers_user` on (user_id)
- `idx_auth_providers_provider` on (provider, provider_user_id)

---

#### `user_counties`

User-county associations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `county_id` | integer | NO | - | FK to counties.id |
| `is_primary` | boolean | YES | false | Primary county flag |
| `created_at` | timestamp | NO | now() | Association created |

**Indexes:**
- `idx_user_counties_user` on (user_id)
- `idx_user_counties_county` on (county_id)

---

#### `user_states`

User state subscriptions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `state_code` | varchar(2) | NO | - | Two-letter state code |
| `access_level` | access_level | YES | 'view' | Access permissions |
| `subscribed_at` | timestamp | YES | now() | Subscription start |
| `expires_at` | timestamp | YES | - | Subscription expiry |

**Indexes:**
- `idx_user_states_user` on (user_id)
- `idx_user_states_state` on (state_code)

---

#### `user_agencies`

User-agency subscriptions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `agency_id` | integer | NO | - | FK to agencies.id |
| `access_level` | access_level | YES | 'view' | Access permissions |
| `is_primary` | boolean | YES | false | Primary agency flag |
| `role` | varchar(100) | YES | - | Role in agency |
| `verified_at` | timestamp | YES | - | Verification date |
| `subscribed_at` | timestamp | YES | now() | Subscription start |
| `expires_at` | timestamp | YES | - | Subscription expiry |

**Indexes:**
- `idx_user_agencies_user` on (user_id)
- `idx_user_agencies_agency` on (agency_id)

---

#### `search_history`

User search history for cloud sync.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `county_id` | integer | YES | - | FK to counties.id |
| `search_query` | text | NO | - | Search query text |
| `results_count` | integer | YES | - | Number of results |
| `created_at` | timestamp | NO | now() | Search timestamp |

**Indexes:**
- `idx_search_history_user` on (user_id)
- `idx_search_history_created` on (created_at)

---

#### `protocol_versions`

Protocol version control for agencies.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `agency_id` | integer | NO | - | FK to agencies.id |
| `protocol_number` | varchar(50) | NO | - | Protocol identifier |
| `title` | varchar(255) | NO | - | Protocol title |
| `version` | varchar(20) | NO | - | Version string |
| `status` | protocol_status | NO | 'draft' | Publication status |
| `source_file_url` | varchar(500) | YES | - | Source file URL |
| `effective_date` | timestamp | YES | - | Effective date |
| `expires_date` | timestamp | YES | - | Expiration date |
| `approved_by` | integer | YES | - | FK to approving user |
| `approved_at` | timestamp | YES | - | Approval timestamp |
| `published_at` | timestamp | YES | - | Publication time |
| `published_by` | integer | YES | - | FK to publishing user |
| `chunks_generated` | integer | YES | 0 | Number of chunks |
| `metadata` | json | YES | - | Additional metadata |
| `change_log` | text | YES | - | Version changes |
| `created_at` | timestamp | NO | now() | Creation time |
| `created_by` | integer | NO | - | FK to creating user |
| `updated_at` | timestamp | NO | now() | Last update |

**Indexes:**
- `idx_protocol_versions_agency` on (agency_id)
- `idx_protocol_versions_status` on (status)

---

#### `protocol_uploads`

Protocol file upload tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `agency_id` | integer | NO | - | FK to agencies.id |
| `user_id` | integer | NO | - | FK to uploading user |
| `file_name` | varchar(255) | NO | - | Original filename |
| `file_url` | varchar(500) | NO | - | Storage URL |
| `file_size` | integer | YES | - | File size in bytes |
| `mime_type` | varchar(100) | YES | - | MIME type |
| `status` | upload_status | YES | 'pending' | Processing status |
| `progress` | integer | YES | 0 | Processing progress % |
| `chunks_created` | integer | YES | 0 | Chunks generated |
| `error_message` | text | YES | - | Error details |
| `processing_started_at` | timestamp | YES | - | Processing start |
| `completed_at` | timestamp | YES | - | Completion time |
| `created_at` | timestamp | NO | now() | Upload time |

**Indexes:**
- `idx_protocol_uploads_agency` on (agency_id)
- `idx_protocol_uploads_user` on (user_id)

---

#### `stripe_webhook_events`

Stripe payment webhook processing.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `event_id` | varchar(255) | NO | - | Stripe event ID |
| `event_type` | varchar(100) | NO | - | Event type |
| `payload` | json | YES | - | Event payload |
| `processed` | boolean | YES | false | Processing status |
| `processed_at` | timestamp | YES | - | Processing time |
| `error` | text | YES | - | Error message |
| `created_at` | timestamp | NO | now() | Receipt time |

**Indexes:**
- `idx_stripe_events_id` on (event_id)
- `idx_stripe_events_type` on (event_type)
- `idx_stripe_events_processed` on (processed)

---

#### `push_tokens`

Push notification tokens.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `token` | text | NO | - | Push token |
| `platform` | varchar(20) | YES | - | ios/android/web |
| `created_at` | timestamp | NO | now() | Registration time |
| `last_used_at` | timestamp | NO | now() | Last used |

**Indexes:**
- `push_tokens_user_idx` on (user_id)

---

#### `drip_emails_sent`

Email campaign tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `user_id` | integer | NO | - | FK to manus_users.id |
| `email_type` | varchar(50) | NO | - | Email template type |
| `sent_at` | timestamp | NO | now() | Send timestamp |

**Indexes:**
- `drip_emails_user_idx` on (user_id)
- `drip_emails_type_idx` on (email_type)

---

#### `waitlist_signups`

Pre-launch email capture.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | serial | NO | auto | Primary key |
| `email` | varchar(320) | NO | - | Email address |
| `source` | varchar(100) | YES | 'landing_page' | Signup source |
| `created_at` | timestamp | NO | now() | Signup time |

**Indexes:**
- `waitlist_signups_email_idx` on (email)
- `waitlist_signups_created_idx` on (created_at)

---

### Analytics Tables

See `/drizzle/analytics-schema.ts` for full definitions.

#### `analytics_events`

Generic event tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `user_id` | integer | Optional user reference |
| `session_id` | varchar(64) | Session identifier |
| `event_type` | varchar(50) | search/protocol/user/conversion |
| `event_name` | varchar(100) | Specific event name |
| `properties` | json | Event properties |
| `device_type` | varchar(20) | ios/android/web/pwa |
| `timestamp` | timestamp | Event time |

---

#### `search_analytics`

Detailed search behavior tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `user_id` | integer | Optional user reference |
| `session_id` | varchar(64) | Session identifier |
| `query_text` | varchar(500) | Search query |
| `state_filter` | varchar(2) | State filter applied |
| `results_count` | integer | Number of results |
| `selected_result_rank` | integer | Which result clicked |
| `search_method` | varchar(20) | text/voice/example_click |
| `timestamp` | timestamp | Search time |

---

#### `protocol_access_logs`

Protocol viewing analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `user_id` | integer | Optional user reference |
| `protocol_chunk_id` | integer | FK to protocol chunk |
| `access_source` | varchar(50) | search/history/bookmark/deep_link |
| `time_spent_seconds` | integer | View duration |
| `scroll_depth` | real | 0-1 scroll percentage |
| `timestamp` | timestamp | Access time |

---

#### `session_analytics`

Session-level usage tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `user_id` | integer | Optional user reference |
| `session_id` | varchar(64) | Unique session ID |
| `device_type` | varchar(20) | Device type |
| `start_time` | timestamp | Session start |
| `end_time` | timestamp | Session end |
| `search_count` | integer | Searches in session |
| `protocols_viewed` | integer | Protocols viewed |

---

#### `daily_metrics`

Pre-aggregated daily metrics for dashboards.

---

#### `retention_cohorts`

User retention cohort analysis.

---

#### `content_gaps`

Zero-result searches for content improvement.

---

#### `conversion_events`

Subscription conversion funnel tracking.

---

#### `feature_usage_stats`

Aggregated feature usage statistics.

---

### Supabase-Only Tables

These tables exist only in Supabase and are not in the Drizzle schema.

#### `manus_protocol_chunks`

**Primary protocol storage with vector embeddings.**

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Primary key |
| `agency_id` | integer | FK to manus_agencies |
| `protocol_number` | text | Protocol identifier (e.g., "R-001") |
| `protocol_title` | text | Protocol name |
| `section` | text | Category (Cardiac, Respiratory, etc.) |
| `content` | text | Protocol text (1000-1200 chars) |
| `embedding` | vector(1536) | Voyage AI embedding |
| `source_pdf_url` | text | Original PDF source |
| `has_images` | boolean | Contains images flag |
| `image_urls` | jsonb | Array of image URLs |
| `state_code` | char(2) | Denormalized state code |
| `agency_name` | text | Denormalized agency name |
| `search_vector` | tsvector | Full-text search vector |
| `created_at` | timestamptz | Creation timestamp |
| `last_verified_at` | timestamptz | Last verification |

**Indexes (comprehensive):**
- `idx_manus_chunks_embedding_hnsw` - HNSW vector index for cosine similarity
- `idx_manus_chunks_agency_id` - Agency filtering
- `idx_manus_chunks_state_code` - State filtering
- `idx_manus_chunks_protocol_number` - Protocol lookup
- `idx_manus_chunks_state_agency` - Composite state + agency
- `idx_manus_chunks_search_vector` - GIN full-text search

---

#### `manus_agencies`

**EMS agencies with protocol inheritance.**

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Primary key |
| `name` | text | Agency name |
| `state_code` | char(2) | Two-letter state code |
| `state_name` | text | Full state name |
| `protocol_count` | integer | Number of protocol chunks |
| `parent_protocol_source_id` | integer | FK for inheritance |
| `agency_type` | agency_type_enum | Agency classification |
| `call_volume_tier` | call_volume_tier_enum | high/mid/low |
| `is_verified` | boolean | Verification status |
| `integration_partner` | integration_partner_enum | Partner system |

---

## Enums

```sql
-- Contact/Feedback Status
CREATE TYPE contact_status AS ENUM ('pending', 'reviewed', 'resolved');
CREATE TYPE feedback_category AS ENUM ('error', 'suggestion', 'general');
CREATE TYPE feedback_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Integration Partners
CREATE TYPE integration_partner AS ENUM ('imagetrend', 'esos', 'zoll', 'emscloud', 'none');

-- User Roles & Tiers
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE user_tier AS ENUM ('free', 'pro', 'enterprise');

-- Agency Types
CREATE TYPE agency_type AS ENUM ('fire_dept', 'ems_agency', 'hospital', 'state_office', 'regional_council');
CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'enterprise');

-- Membership
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'protocol_author', 'member');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'suspended');

-- Protocol Status
CREATE TYPE protocol_status AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE upload_status AS ENUM ('pending', 'processing', 'chunking', 'embedding', 'completed', 'failed');

-- Access Levels
CREATE TYPE access_level AS ENUM ('view', 'contribute', 'admin');
```

---

## Relationships

### Entity Relationship Diagram

```
manus_users (1) ───< (many) queries
manus_users (1) ───< (many) bookmarks
manus_users (1) ───< (many) feedback
manus_users (1) ───< (many) search_history
manus_users (1) ───< (many) user_counties ────> (1) counties
manus_users (1) ───< (many) user_states
manus_users (1) ───< (many) user_agencies ────> (1) agencies
manus_users (1) ───< (many) user_auth_providers
manus_users (1) ───< (many) agency_members ────> (1) agencies
manus_users (1) ───< (many) push_tokens
manus_users (1) ───< (many) drip_emails_sent
manus_users (1) ───< (many) audit_logs
manus_users (1) ───< (many) analytics_events

agencies (1) ───< (many) agency_members
agencies (1) ───< (many) protocol_versions
agencies (1) ───< (many) protocol_uploads
agencies (1) ───< (many) user_agencies

counties (1) ───< (many) protocol_chunks
counties (1) ───< (many) queries
counties (1) ───< (many) user_counties
counties (1) ───< (many) search_history

manus_agencies (1) ───< (many) manus_protocol_chunks
manus_agencies (1) ───< (many) manus_agencies (self-ref: parent_protocol_source_id)
```

---

## Indexes

### Performance-Critical Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| manus_protocol_chunks | idx_manus_chunks_embedding_hnsw | HNSW | Vector similarity search |
| manus_protocol_chunks | idx_manus_chunks_search_vector | GIN | Full-text search |
| manus_protocol_chunks | idx_manus_chunks_state_agency | B-tree | State + agency filtering |
| manus_users | idx_users_auth_id | B-tree | Auth lookup |
| agencies | idx_agencies_slug | B-tree | URL routing |
| audit_logs | idx_audit_logs_created | B-tree | Time-based queries |

### Index Count by Table

| Table | Index Count |
|-------|-------------|
| manus_protocol_chunks | 12+ |
| manus_users | 5+ |
| agencies | 3 |
| agency_members | 2 |
| audit_logs | 3 |
| search_history | 2 |

---

## Row Level Security (RLS)

### RLS Helper Functions

```sql
-- Get current user's internal ID from auth.uid()
CREATE FUNCTION get_current_user_id() RETURNS INTEGER;

-- Check if current user is admin
CREATE FUNCTION is_admin() RETURNS BOOLEAN;

-- Check if user is member of agency
CREATE FUNCTION is_agency_member(agency_id_param INTEGER) RETURNS BOOLEAN;

-- Check if user is agency admin/owner
CREATE FUNCTION is_agency_admin(agency_id_param INTEGER) RETURNS BOOLEAN;
```

### RLS Policies Summary

| Table | Public Read | User Self-Access | Admin Access | Service Role |
|-------|-------------|------------------|--------------|--------------|
| manus_users | No | Yes | Yes | Full |
| agencies | Yes | - | Yes | Full |
| agency_members | No | Yes (own) | Yes | Full |
| queries | No | Yes | Yes | Full |
| bookmarks | No | Yes | - | Full |
| search_history | No | Yes | - | Full |
| feedback | No | Yes | Yes | Full |
| audit_logs | No | No | Read-only | Full |
| counties | Yes | - | Yes | Full |
| protocol_chunks | Yes | - | - | Full |
| contact_submissions | No | No | Yes | Full |
| integration_logs | No | No | Read-only | Full |
| stripe_webhook_events | No | No | No | Full |
| push_tokens | No | Yes | - | Full |
| drip_emails_sent | No | Read-only | - | Full |

### Key Security Principles

1. **User Isolation:** Users can only access their own data
2. **Agency Scoping:** Agency members access agency data per role
3. **Admin Elevation:** Admins have elevated access where needed
4. **Service Role:** Backend has full access for operations
5. **Public Safety:** Medical protocols remain publicly accessible
6. **HIPAA Compliance:** No unauthorized PHI access

---

## Database Functions

### Search Functions

#### `search_manus_protocols`

Semantic protocol search with vector embeddings.

```sql
CREATE FUNCTION search_manus_protocols(
  query_embedding vector(1536),
  agency_filter integer DEFAULT NULL,
  state_filter text DEFAULT NULL,
  match_count integer DEFAULT 10,
  match_threshold float DEFAULT 0.3,
  agency_name_filter text DEFAULT NULL,
  state_code_filter char(2) DEFAULT NULL
) RETURNS TABLE (
  id integer,
  agency_id integer,
  protocol_number text,
  protocol_title text,
  section text,
  content text,
  image_urls text[],
  similarity float
);
```

#### `search_manus_protocols_fts`

Hybrid search combining vector similarity with full-text keyword relevance.

```sql
CREATE FUNCTION search_manus_protocols_fts(
    query_text TEXT,
    query_embedding vector(1536),
    agency_filter INTEGER DEFAULT NULL,
    state_code_filter TEXT DEFAULT NULL,
    match_count INTEGER DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.3
) RETURNS TABLE (
    id INTEGER,
    agency_id INTEGER,
    protocol_number TEXT,
    protocol_title TEXT,
    section TEXT,
    content TEXT,
    image_urls TEXT[],
    similarity FLOAT,
    fts_rank FLOAT
);
```

### Helper Functions

#### `get_protocol_inheritance_chain`

Returns protocol inheritance hierarchy: Agency → Regional → State.

```sql
CREATE FUNCTION get_protocol_inheritance_chain(agency_id_param INTEGER)
RETURNS TABLE (
    level INTEGER,
    id INTEGER,
    name TEXT,
    agency_type agency_type_enum,
    state_code CHAR(2)
);
```

#### `update_updated_at_column`

Auto-updates `updated_at` column on row changes.

```sql
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

---

## Triggers

### `updated_at` Auto-Update Triggers

Applied to tables with `updated_at` columns:

| Table | Trigger Name |
|-------|--------------|
| manus_users | update_users_updated_at |
| feedback | update_feedback_updated_at |
| agencies | update_agencies_updated_at |
| user_auth_providers | update_user_auth_providers_updated_at |
| protocol_versions | update_protocol_versions_updated_at |

### Full-Text Search Trigger

Auto-updates `search_vector` on `manus_protocol_chunks`:

```sql
CREATE TRIGGER manus_chunks_search_update
    BEFORE INSERT OR UPDATE OF protocol_title, section, content
    ON manus_protocol_chunks
    FOR EACH ROW
    EXECUTE FUNCTION manus_chunks_search_vector_trigger();
```

### Protocol Count Sync Trigger

Keeps `manus_agencies.protocol_count` in sync:

```sql
CREATE TRIGGER trg_update_agency_protocol_count
    AFTER INSERT OR UPDATE OR DELETE ON manus_protocol_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_agency_protocol_count();
```

---

## Vector/Embedding Storage

### Embedding Model

- **Model:** Voyage AI `voyage-large-2`
- **Dimensions:** 1536
- **Similarity Metric:** Cosine distance

### Vector Index Configuration

```sql
-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX idx_manus_chunks_embedding_hnsw 
ON manus_protocol_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Index Parameters:**
- `m = 16`: Number of bi-directional links (default, balanced)
- `ef_construction = 64`: Higher = better index quality, slower build
- `vector_cosine_ops`: Optimized for cosine similarity

### Vector Search Performance

- **Dataset Size:** ~58K+ protocol chunks
- **Search Latency:** <100ms for top-10 results
- **Index Size:** ~200MB
- **Accuracy:** 95%+ recall with HNSW

### Hybrid Search Approach

The system uses a hybrid search strategy:

1. **Vector Similarity (70% weight):** Semantic understanding of query intent
2. **Full-Text Search (30% weight):** Keyword matching for precise terms

```sql
-- Combined score formula
ORDER BY (vector_similarity * 0.7) + (fts_rank * 0.3) DESC
```

### Full-Text Search Configuration

```sql
-- Weighted tsvector: title (A) > section (B) > content (C)
search_vector = 
    setweight(to_tsvector('english', protocol_title), 'A') ||
    setweight(to_tsvector('english', section), 'B') ||
    setweight(to_tsvector('english', content), 'C')
```

---

## Migration Files

Key migration files in `/drizzle/migrations/`:

| Migration | Description |
|-----------|-------------|
| 0025_add_notification_tables.sql | Push tokens, drip emails |
| 0026_postgresql_updated_at_triggers.sql | Auto-update triggers |
| 0027_add_row_level_security_policies.sql | Comprehensive RLS |
| 0030_optimize_manus_protocol_chunks.sql | Vector & FTS indexes |
| 0032_add_waitlist_signups.sql | Waitlist table |

---

## Related Documentation

- [DATABASE-ARCHITECTURE-ANALYSIS.md](./DATABASE-ARCHITECTURE-ANALYSIS.md) - Architecture overview
- [supabase-schema-audit.md](./supabase-schema-audit.md) - Supabase-specific audit
- [INDEX_ANALYSIS.md](/drizzle/INDEX_ANALYSIS.md) - Index optimization analysis
- [SCHEMA_RELATIONSHIPS_DIAGRAM.md](./SCHEMA_RELATIONSHIPS_DIAGRAM.md) - Visual diagrams
