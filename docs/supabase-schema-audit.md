# Supabase Database Schema Audit - Protocol Guide Manus

**Audit Date:** 2026-01-20
**Database:** dflmjilieokjkkqxrmda.supabase.co
**Audited By:** Claude Code

## Executive Summary

The Protocol Guide Manus database contains two main tables:
- **manus_protocol_chunks**: 49,201 protocol chunks with embeddings (Voyage AI, 1536 dimensions)
- **agencies**: 2,713 EMS agencies across all US states

**Key Finding:** There is a data inconsistency - `manus_protocol_chunks` references `agency_id` values (1-51) that exist in the `agencies` table, but the `agencies.protocol_count` column does not accurately reflect the actual chunks in `manus_protocol_chunks` for agencies 52+.

## Table 1: manus_protocol_chunks

### Schema

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | integer | NOT NULL | Primary key |
| `agency_id` | integer | NULL | Foreign key to agencies.id |
| `protocol_number` | text | NULL | Protocol identifier (e.g., "R-001") |
| `protocol_title` | text | NULL | Protocol name |
| `section` | text | NULL | Category (Cardiac, Respiratory, Trauma, etc.) |
| `content` | text | NULL | Protocol text content (chunked) |
| `embedding` | vector(1536) | NULL | Voyage AI embedding for semantic search |
| `source_pdf_url` | text | NULL | Original PDF source |
| `has_images` | boolean | NULL | Whether protocol contains images |
| `image_urls` | jsonb | NULL | Array of image URLs |
| `protocol_effective_date` | timestamp | NULL | When protocol became effective |
| `last_verified_at` | timestamp | NULL | Last verification timestamp |
| `protocol_year` | integer | NULL | Protocol year |
| `created_at` | timestamp | NOT NULL | Record creation timestamp |

### Statistics

- **Total Rows:** 49,201
- **Unique Agency IDs:** 51 (agency_id 1-51)
- **Null Agency IDs:** 0 (all chunks have an agency_id)
- **Embedding Dimensions:** 1536 (Voyage AI voyage-large-2)
- **Content Length:** Typically 1,000-1,200 characters per chunk

### Data Distribution

**Top 5 Agencies by Protocol Chunk Count:**

| Agency ID | Agency Name | State | Chunk Count |
|-----------|-------------|-------|-------------|
| 51 | Montgomery | Alabama | 199 |
| 1 | Autauga | Alabama | 17 |
| 2-50 | Various Alabama counties | Alabama | 16 each |

**Protocol Sections (Categories):**
- Cardiac
- Respiratory
- Trauma
- Medical
- Toxicology
- Neurological
- Pediatric
- General

### Sample Record

```json
{
  "id": 10119,
  "agency_id": 1442,
  "protocol_number": "R-001",
  "protocol_title": "Asthma/COPD/Bronchospasm Protocol",
  "section": "Respiratory",
  "content": "ASTHMA/COPD/BRONCHOSPASM PROTOCOL\\n\\nASSESSMENT: History of asthma/COPD...",
  "embedding": "[-0.005850339,-0.00287231,0.021405801,...]",
  "source_pdf_url": null,
  "has_images": false,
  "image_urls": null,
  "protocol_effective_date": null,
  "last_verified_at": "2025-01-11T08:00:00+00:00",
  "protocol_year": null,
  "created_at": "2026-01-19T00:34:23.634685+00:00"
}
```

### Indexes & Functions

**Note:** Attempted to verify the `search_manus_protocols` RPC function but received:
```
Could not find the function public.search_manus_protocols(filter_agency_id, match_count, match_threshold, query_embedding) in the schema cache
```

This function likely exists in the database but may have different parameter names/order or permissions issues with the service role key.

## Table 2: agencies

### Schema

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | integer | NOT NULL | Primary key |
| `name` | text | NULL | Agency/County name |
| `state` | text | NULL | State full name |
| `state_code` | text | NULL | Two-letter state code |
| `is_active` | boolean | NULL | Whether agency has active protocols |
| `uses_state_protocols` | boolean | NULL | Whether using state-level protocols |
| `protocol_version` | text | NULL | Protocol version identifier |
| `protocol_effective_date` | timestamp | NULL | When current protocols became effective |
| `source_pdf_url` | text | NULL | Source PDF URL |
| `protocol_count` | integer | NULL | **Stored count of protocols (may be outdated)** |
| `created_at` | timestamp | NOT NULL | Record creation timestamp |
| `updated_at` | timestamp | NOT NULL | Record update timestamp |

### Statistics

- **Total Agencies:** 2,713
- **States Covered:** All 50 US states + territories
- **Active Agencies:** Most agencies have `is_active: false` (needs verification)

### State Distribution (Top 10)

| State | Agency Count |
|-------|--------------|
| Georgia | 159 |
| Kansas | 105 |
| Illinois | 102 |
| Iowa | 99 |
| Indiana | 92 |
| Arkansas | 75 |
| Kentucky | 68 |
| Florida | 67 |
| Alabama | 64 |
| Colorado | 64 |

### Sample Record

```json
{
  "id": 1442,
  "name": "Carroll",
  "state": "Missouri",
  "state_code": "MO",
  "is_active": false,
  "uses_state_protocols": false,
  "protocol_version": null,
  "protocol_effective_date": null,
  "source_pdf_url": null,
  "protocol_count": 0,
  "created_at": "2026-01-19T00:31:54.876754+00:00",
  "updated_at": "2026-01-19T00:31:54.876754+00:00"
}
```

## Table 3: manus_agencies (NOT FOUND)

**Status:** Table does not exist in the current schema.

**Error:** `Could not find the table 'public.manus_agencies' in the schema cache`

This table may have been:
1. Renamed to `agencies`
2. Removed during migration
3. Never created in this database instance

## Data Integrity Issues

### Issue 1: Agency Metadata Mismatch

**Problem:** The `agencies` table contains agency ID 1442 (Carroll, Missouri), which is referenced in `manus_protocol_chunks`, but most chunks (agency_id 1-51) reference Alabama counties.

**Evidence:**
- Protocol chunks contain agency_id values 1-51 (mostly Alabama)
- Sample chunk shows agency_id 1442 (Missouri)
- Agencies table has 2,713 agencies spanning all states

**Impact:** It's unclear if the protocol chunks are properly linked to the correct agencies.

### Issue 2: Protocol Count Discrepancy

**Problem:** The `agencies.protocol_count` column does not match actual protocol chunks.

**Evidence:**
- Agency 1 (Autauga): protocol_count = 17, actual chunks = 17 ✓
- Agency 51 (Montgomery): protocol_count = 199, actual chunks = 199 ✓
- Agency 1442 (Carroll, MO): protocol_count = 0, but has chunks in the system
- Most agencies (52-2713): protocol_count = 0

**Impact:** Cannot rely on `protocol_count` for agencies 52+.

### Issue 3: Missing Agency Metadata

**Problem:** No agency metadata is stored in `manus_protocol_chunks` beyond `agency_id`.

**Missing Fields:**
- Agency name
- State
- State code
- Protocol version

**Impact:** Must JOIN with `agencies` table for every query that needs agency context.

## Recommendations

### 1. Verify Agency Relationships

Run this query to check which agencies actually have protocols:

```sql
SELECT
  a.id,
  a.name,
  a.state,
  COUNT(p.id) as actual_chunk_count,
  a.protocol_count as stored_count
FROM agencies a
LEFT JOIN manus_protocol_chunks p ON p.agency_id = a.id
GROUP BY a.id, a.name, a.state, a.protocol_count
HAVING COUNT(p.id) > 0
ORDER BY COUNT(p.id) DESC;
```

### 2. Update Protocol Counts

Create a trigger or scheduled job to keep `agencies.protocol_count` in sync:

```sql
CREATE OR REPLACE FUNCTION update_agency_protocol_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agencies
  SET protocol_count = (
    SELECT COUNT(*)
    FROM manus_protocol_chunks
    WHERE agency_id = NEW.agency_id
  )
  WHERE id = NEW.agency_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_protocol_count
AFTER INSERT OR DELETE ON manus_protocol_chunks
FOR EACH ROW
EXECUTE FUNCTION update_agency_protocol_count();
```

### 3. Add Indexes

Recommended indexes for query performance:

```sql
-- Speed up agency filtering
CREATE INDEX idx_protocol_chunks_agency_id
ON manus_protocol_chunks(agency_id);

-- Speed up protocol searches
CREATE INDEX idx_protocol_chunks_protocol_number
ON manus_protocol_chunks(protocol_number);

-- Speed up section filtering
CREATE INDEX idx_protocol_chunks_section
ON manus_protocol_chunks(section);

-- Speed up agency lookups by state
CREATE INDEX idx_agencies_state_code
ON agencies(state_code);

-- Vector similarity search (if not already exists)
CREATE INDEX idx_protocol_chunks_embedding
ON manus_protocol_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 4. Verify search_manus_protocols Function

Check if the RPC function exists and has correct permissions:

```sql
-- List all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%manus%';

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_manus_protocols TO authenticated;
GRANT EXECUTE ON FUNCTION search_manus_protocols TO anon;
```

### 5. Add Denormalized Agency Fields

Consider adding frequently-needed agency fields to `manus_protocol_chunks`:

```sql
ALTER TABLE manus_protocol_chunks
ADD COLUMN agency_name TEXT,
ADD COLUMN agency_state TEXT,
ADD COLUMN agency_state_code TEXT;

-- Backfill data
UPDATE manus_protocol_chunks p
SET
  agency_name = a.name,
  agency_state = a.state,
  agency_state_code = a.state_code
FROM agencies a
WHERE p.agency_id = a.id;
```

### 6. Data Quality Checks

Run regular data quality checks:

```sql
-- Find orphaned chunks (agency_id doesn't exist in agencies)
SELECT COUNT(*), agency_id
FROM manus_protocol_chunks p
WHERE NOT EXISTS (
  SELECT 1 FROM agencies a WHERE a.id = p.agency_id
)
GROUP BY agency_id;

-- Find duplicate protocols
SELECT protocol_number, protocol_title, agency_id, COUNT(*)
FROM manus_protocol_chunks
GROUP BY protocol_number, protocol_title, agency_id
HAVING COUNT(*) > 1;
```

## Connection Details

**Supabase Project:** dflmjilieokjkkqxrmda
**Database URL:** https://dflmjilieokjkkqxrmda.supabase.co
**Environment File:** /Users/tanner-osterkamp/Protocol Guide Manus/.env

**Required Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Next Steps

1. **Fix protocol_count discrepancy** - Update all agency records with accurate counts
2. **Verify search function** - Ensure `search_manus_protocols` is accessible
3. **Add indexes** - Improve query performance
4. **Document RLS policies** - Check Row Level Security settings
5. **Test semantic search** - Verify embedding-based search works correctly
6. **Audit data quality** - Check for orphaned records and duplicates

---

**Audit Method:** Direct Supabase client queries via Node.js
**Scripts Used:**
- `/tmp/supabase-audit.mjs` - Main schema audit
- `/tmp/agencies-detail.mjs` - Agency table details
- `/tmp/db-indexes.mjs` - Indexes and functions check
