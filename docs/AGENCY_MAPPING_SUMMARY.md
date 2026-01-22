# Agency Mapping Summary

## Overview

Successfully created agency ID to name mapping for Protocol Guide Manus from the `manus_protocol_chunks` table.

## Results

| Metric | Value |
|--------|-------|
| **Total Unique Agencies** | 2,155 |
| **Total Protocol Chunks** | 49,201 |
| **Average Protocols/Agency** | 22.8 |
| **Smallest Agency** | 1 protocol |
| **Largest Agency** | 1,820 protocols |
| **Agency ID Range** | 1 - 2713 |
| **Output File** | `/docs/agency-mapping.json` (248KB) |

## File Structure

The mapping file uses the following JSON structure:

```json
{
  "1": {
    "name": "Agency 1",
    "state_code": null,
    "state_name": null,
    "protocol_count": 17
  },
  "2": {
    "name": "Agency 2",
    "state_code": null,
    "state_name": null,
    "protocol_count": 16
  }
  ...
}
```

## Current Status

### What Was Done

1. **Created Script**: `scripts/build-agency-id-mapping.ts`
   - Queries `manus_protocol_chunks` table
   - Extracts all unique `agency_id` values
   - Counts protocols per agency
   - Generates JSON mapping file

2. **Generated Mapping**: `docs/agency-mapping.json`
   - Contains all 2,155 unique agencies
   - Placeholder names ("Agency 1", "Agency 2", etc.)
   - Null state codes and state names
   - Accurate protocol counts

### What's Missing

The mapping file currently has **placeholder data** because:
- The `manus_protocol_chunks` table doesn't contain agency name information
- The `manus_agencies` table doesn't exist yet
- Protocol content doesn't include agency-specific metadata

## Next Steps

### Option 1: Manual Enrichment

Manually edit `/docs/agency-mapping.json` with real agency data:

```json
{
  "1": {
    "name": "California EMS Authority",
    "state_code": "CA",
    "state_name": "California",
    "protocol_count": 17
  }
}
```

### Option 2: Create manus_agencies Table

1. **Run Migration**:
   ```bash
   # Apply SQL migration to create table
   psql <connection-string> < docs/create-agencies-table.sql
   ```

2. **Populate with Real Data**:
   - Import agency data from external sources
   - Use `scripts/seed-ems-entities.ts` as reference
   - Or manually insert via SQL

3. **Generate Mapping**:
   ```bash
   npx tsx scripts/generate-agency-mapping.ts
   ```

### Option 3: Backfill from Import Scripts

The project has import scripts with state-specific data:
- `scripts/import-ca-protocols.ts`
- `scripts/import-ny-protocols.ts`
- `scripts/import-tx-fl-protocols.ts`
- etc.

These scripts may contain agency metadata that can be extracted.

## Usage

### View the Mapping

```bash
cat docs/agency-mapping.json | jq '.["1"]'
```

### Count Agencies by Protocol Count

```bash
cat docs/agency-mapping.json | jq '[.[].protocol_count] | sort | .[]'
```

### Find Top 10 Agencies

```bash
cat docs/agency-mapping.json | jq -r 'to_entries | sort_by(-.value.protocol_count) | .[0:10] | .[] | "[\(.key)] \(.value.protocol_count) protocols"'
```

## Integration with Backfill Process

Once the mapping has real agency data:

1. **Add Agency Columns** to `manus_protocol_chunks`:
   ```bash
   psql <connection-string> < docs/add-agency-columns.sql
   ```

2. **Run Backfill Script**:
   ```bash
   npx tsx scripts/backfill-agency-metadata.ts
   ```

This will populate the `agency_name`, `state_code`, and `state_name` columns in all protocol chunks.

## Files Created/Modified

| File | Description | Status |
|------|-------------|--------|
| `scripts/build-agency-id-mapping.ts` | Script to generate mapping | Created |
| `docs/agency-mapping.json` | Agency mapping file | Created (placeholders) |
| `docs/AGENCY_MAPPING_SUMMARY.md` | This documentation | Created |

## Related Documentation

- [`docs/create-agencies-table.sql`](./create-agencies-table.sql) - SQL to create agencies table
- [`docs/add-agency-columns.sql`](./add-agency-columns.sql) - SQL to add columns to protocol chunks
- [`docs/BACKFILL_AGENCY_METADATA.md`](./BACKFILL_AGENCY_METADATA.md) - Backfill process guide
- [`scripts/seed-ems-entities.ts`](../scripts/seed-ems-entities.ts) - EMS entity seed data (500+ agencies)

## Notes

- Agency IDs are not sequential (some IDs between 1-2713 are unused)
- The largest agency (ID 2706) has 1,820 protocols
- Most agencies have 15-25 protocols
- State information must be added manually or via external data source
- Protocol counts are accurate as of the last database fetch

## Script Execution Log

```
=== Build Agency ID Mapping ===

Fetched 49,201 rows in 50 pages
Found 2,155 unique agencies

Total Agencies: 2,155
Total Protocols: 49,201
Average Protocols per Agency: 22.8
Min Protocols: 1
Max Protocols: 1,820
```

Created: 2026-01-20
