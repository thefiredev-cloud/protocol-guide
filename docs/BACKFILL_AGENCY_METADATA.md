# Agency Metadata Backfill Guide

This guide documents the process for backfilling agency metadata (agency_name, state_code, state_name) into the `manus_protocol_chunks` table.

## Overview

The backfill process updates all rows in `manus_protocol_chunks` with agency metadata from the `manus_agencies` table. This enables:
- State-specific protocol filtering
- Agency attribution in search results
- Better analytics and reporting

## Prerequisites

1. **Database Migration Applied**
   ```bash
   # The add-agency-columns.sql migration must be applied first
   # This adds agency_name, state_code, state_name columns to manus_protocol_chunks
   ```

2. **Environment Variables**
   ```bash
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. **Dependencies Installed**
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

## Step 1: Generate Agency Mapping

Extract agency data from the database into a JSON file:

```bash
npx tsx scripts/generate-agency-mapping.ts
```

This creates `docs/agency-mapping.json` with all agencies from the `manus_agencies` table.

**Output:**
```json
[
  {
    "agency_id": 1,
    "agency_name": "California EMS Authority",
    "state_code": "CA",
    "state_name": "California"
  },
  ...
]
```

## Step 2: Run Backfill Script

Update all protocol chunks with agency metadata:

```bash
npx tsx scripts/backfill-agency-metadata.ts
```

### What It Does

1. **Loads agency mapping** from `docs/agency-mapping.json`
2. **Validates data** (checks required fields, state_code format)
3. **Processes in batches** (1,000 rows at a time for performance)
4. **Updates chunks** for each agency_id with corresponding metadata
5. **Logs progress** with real-time status updates
6. **Verifies results** at the end

### Example Output

```
=== Agency Metadata Backfill ===

Loading agency mapping from: /path/to/docs/agency-mapping.json
Loaded 2738 agency mappings

Starting backfill process...

[1/2738] California EMS Authority (CA)
  Processing 12,450 rows for agency_id 1
  Progress: 100% (12,450/12,450 rows)
  ✓ Updated 12,450 rows

[2/2738] New York State Department of Health (NY)
  Processing 8,320 rows for agency_id 2
  Progress: 100% (8,320/8,320 rows)
  ✓ Updated 8,320 rows

...

=== Backfill Complete ===
Total agencies: 2738
Processed: 2738
Total rows updated: 55,056
Errors: 0
Time elapsed: 847s (14min)
Average rate: 65 rows/sec

Verifying results...
✓ All rows have agency metadata
```

## Performance

- **Batch Size**: 1,000 rows per update
- **Expected Rate**: 50-100 rows/second
- **Estimated Time**: 10-20 minutes for 55,000 chunks

## Verification Queries

After running the backfill, verify the results in Supabase:

```sql
-- Check for any null values
SELECT COUNT(*) as null_count
FROM manus_protocol_chunks
WHERE agency_name IS NULL
   OR state_code IS NULL
   OR state_name IS NULL;

-- Count by state
SELECT state_code, state_name, COUNT(*) as chunk_count
FROM manus_protocol_chunks
GROUP BY state_code, state_name
ORDER BY chunk_count DESC;

-- Sample records
SELECT id, agency_id, agency_name, state_code, state_name, protocol_title
FROM manus_protocol_chunks
LIMIT 10;
```

## Troubleshooting

### Missing agency-mapping.json

```
Error: Agency mapping file not found
```

**Solution:** Run the generator first:
```bash
npx tsx scripts/generate-agency-mapping.ts
```

### Missing Environment Variables

```
Error: Missing required environment variables
Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

**Solution:** Add to `.env` file:
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Update Errors

If individual updates fail, the script will:
1. Log the error
2. Continue with the next batch
3. Report errors in the final summary

Check the console output for specific error messages.

## Re-running the Script

The script is idempotent - it can be run multiple times safely. Each run will:
- Update all matching rows (overwriting previous values)
- Skip agencies with no protocol chunks
- Produce the same final result

## Files

| File | Purpose |
|------|---------|
| `scripts/generate-agency-mapping.ts` | Export agencies from database to JSON |
| `scripts/backfill-agency-metadata.ts` | Update protocol chunks with metadata |
| `docs/agency-mapping.json` | Agency data (generated) |
| `docs/add-agency-columns.sql` | Database migration (must run first) |

## Notes

- The script uses the **service role key** to bypass Row Level Security (RLS)
- Updates are performed in batches for memory efficiency
- Progress is logged in real-time
- The final count verification ensures completeness
- State codes are validated (2 uppercase characters)

## Related Documentation

- [create-agencies-table.sql](./create-agencies-table.sql) - Agencies table schema
- [add-agency-columns.sql](./add-agency-columns.sql) - Protocol chunks migration
