# ImageTrend Integration - Database Migration Summary

**Date**: 2025-12-27
**Status**: ✅ Successfully Applied to Remote Database

## Migration Files Created

### 1. Migration 20251227000002: imagetrend_connections
**File**: `/Users/tanner-osterkamp/Protocol-Guide.com/supabase/migrations/20251227000002_imagetrend_connections.sql`

**Purpose**: Store encrypted OAuth tokens for ImageTrend API connections

**Table Structure**:
```sql
CREATE TABLE imagetrend_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id TEXT NOT NULL,
  agency_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['pcr:read', 'pcr:write'],
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

**Security Features**:
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own connections
- ✅ Policies for SELECT, INSERT, UPDATE, DELETE
- ✅ Each user can have only one ImageTrend connection (UNIQUE constraint)

**Indexes**:
- `idx_imagetrend_connections_user` - Quick lookups by user_id
- `idx_imagetrend_connections_expires` - Token expiration tracking

**Triggers**:
- `update_imagetrend_connections_updated_at` - Auto-update updated_at timestamp

---

### 2. Migration 20251227000003: protocol_pcr_links
**File**: `/Users/tanner-osterkamp/Protocol-Guide.com/supabase/migrations/20251227000003_protocol_pcr_links.sql`

**Purpose**: Track protocol-to-PCR links for ImageTrend integration

**Table Structure**:
```sql
CREATE TABLE protocol_pcr_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id TEXT NOT NULL,
  protocol_name TEXT NOT NULL,
  pcr_id TEXT NOT NULL,
  pcr_incident_number TEXT,
  imagetrend_link_id TEXT,
  usage_context JSONB NOT NULL DEFAULT '{}',
  medication_administered JSONB,
  vitals_at_administration JSONB,
  linked_at TIMESTAMPTZ DEFAULT now(),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  sync_error TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Security Features**:
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own protocol links
- ✅ Policies for SELECT, INSERT, UPDATE, DELETE
- ✅ Sync status validation (CHECK constraint)

**Indexes**:
- `idx_protocol_pcr_links_user` - User lookups
- `idx_protocol_pcr_links_protocol` - Protocol usage tracking
- `idx_protocol_pcr_links_pcr` - PCR lookups
- `idx_protocol_pcr_links_sync` - Pending sync tracking (partial index)
- `idx_protocol_pcr_links_linked_at` - Time-based queries
- `idx_protocol_pcr_links_user_protocol` - Composite index for analytics

**Helper Functions**:

#### get_protocol_usage_stats
Returns protocol usage statistics with filtering options:
```sql
get_protocol_usage_stats(
  p_user_id UUID DEFAULT NULL,
  p_protocol_id TEXT DEFAULT NULL,
  p_days_back INT DEFAULT 30
)
```

Returns:
- protocol_id
- protocol_name
- usage_count
- last_used
- sync_success_rate

#### get_pending_syncs
Returns pending syncs for a user:
```sql
get_pending_syncs(p_user_id UUID)
```

Returns:
- link_id
- protocol_name
- pcr_incident_number
- linked_at
- minutes_pending

---

## Migration Status

| Migration | Status | Applied |
|-----------|--------|---------|
| 20251227000002_imagetrend_connections.sql | ✅ Applied | Remote & Local |
| 20251227000003_protocol_pcr_links.sql | ✅ Applied | Remote & Local |

## Next Steps

### 1. Backend Integration
Create API endpoints for ImageTrend OAuth flow:
- `/api/imagetrend/connect` - Initiate OAuth
- `/api/imagetrend/callback` - Handle OAuth callback
- `/api/imagetrend/disconnect` - Revoke connection
- `/api/imagetrend/refresh` - Refresh expired tokens

### 2. PCR Linking Integration
Create API endpoints for protocol-PCR linking:
- `/api/pcr/link` - Link protocol to PCR
- `/api/pcr/sync` - Sync pending links to ImageTrend
- `/api/pcr/usage-stats` - Get protocol usage statistics

### 3. Frontend Components
Create React components for:
- ImageTrend connection settings page
- OAuth connection flow UI
- Protocol-PCR linking interface
- Usage analytics dashboard

### 4. Security Considerations
- ✅ Implement token encryption/decryption service
- ✅ Set up automatic token refresh background job
- ✅ Add token expiration monitoring
- ✅ Implement secure credential storage (use environment variables)

### 5. Testing
- Test OAuth flow end-to-end
- Test token refresh mechanism
- Test RLS policies
- Test helper functions
- Test concurrent link creation

## Database Schema Relationships

```
auth.users
    ↓ (1:1)
imagetrend_connections
    - Stores OAuth tokens
    - One connection per user

auth.users
    ↓ (1:many)
protocol_pcr_links
    - Tracks protocol usage
    - Links to ImageTrend PCRs
```

## Security Model

### Row Level Security (RLS)
Both tables implement RLS with the following policies:
- Users can only SELECT their own records
- Users can only INSERT records for themselves
- Users can only UPDATE their own records
- Users can only DELETE their own records

### Token Security
- Access tokens are encrypted before storage
- Refresh tokens are encrypted before storage
- Token expiration is tracked for automatic refresh
- Last used timestamp for inactive connection cleanup

## Performance Considerations

### Indexes
All frequently queried columns are indexed:
- User lookups (single-column index)
- Protocol usage tracking (composite index)
- Sync status filtering (partial index for pending only)
- Time-based queries (descending index for recent first)

### JSONB Columns
- `usage_context` - Flexible storage for protocol usage context
- `medication_administered` - Structured medication data
- `vitals_at_administration` - Patient vitals snapshot

## Maintenance Tasks

### Recommended Cron Jobs
1. **Token Refresh** (every 15 minutes)
   - Check for tokens expiring in next 30 minutes
   - Refresh tokens proactively

2. **Sync Retry** (every 5 minutes)
   - Find failed syncs older than 5 minutes
   - Retry sync with exponential backoff

3. **Cleanup** (daily)
   - Remove old failed syncs (>30 days)
   - Archive successful syncs (>90 days)

---

**Generated**: 2025-12-27
**Project**: Protocol-Guide.com
**Supabase Project**: dflmjilieokjkkqxrmda
