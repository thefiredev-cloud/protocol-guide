# Protocol Guide Manus - MySQL Database Schema Audit

**Date:** 2026-01-20
**Database:** TiDB Cloud (MySQL-compatible)
**Connection:** `gateway03.us-east-1.prod.aws.tidbcloud.com:4000`

---

## Executive Summary

- **Total Counties:** 2,713
- **Total States:** 51
- **California Counties:** 34
- **LA County ID:** 240009
- **ID Generation:** AUTO_INCREMENT (sequential integer)
- **Notable Gap:** 207,320 missing IDs in range (30001 to 240033)

---

## 1. Counties Table Structure

### Columns

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI | NULL | auto_increment |
| name | varchar(255) | NO | | NULL | |
| state | varchar(64) | NO | MUL | NULL | |
| usesStateProtocols | tinyint(1) | NO | | 0 | |
| protocolVersion | varchar(50) | YES | | NULL | |
| createdAt | timestamp | NO | | CURRENT_TIMESTAMP | |

### Indexes

| Index Name | Type | Columns |
|------------|------|---------|
| PRIMARY | PRIMARY KEY | (id) |
| idx_counties_state | INDEX | (state) |

### Schema Definition (Drizzle ORM)

```typescript
export const counties = mysqlTable("counties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  state: varchar("state", { length: 64 }).notNull(),
  usesStateProtocols: boolean("usesStateProtocols").default(false).notNull(),
  protocolVersion: varchar("protocolVersion", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

---

## 2. California Counties

**Total:** 34 California counties in database

| ID | Name | Uses State | Protocol Version |
|----|------|------------|------------------|
| 180001 | Alameda County EMS Agency | No | 2025 |
| 210089 | Central California EMS Agency | No | 2025 |
| 210090 | Coastal Valleys EMS Agency | No | 2025 |
| 150003 | Contra Costa County EMS | No | 2026 |
| 210091 | El Dorado County EMS Agency | No | 2025 |
| 240006 | Imperial County EMS Agency | No | N/A |
| 210092 | Inland Counties EMS Agency | No | 2025 |
| 210093 | Kern County EMS | No | 2025 |
| 30203 | Lake | No | N/A |
| **240009** | **Los Angeles County EMS Agency** | **No** | **N/A** |
| 240010 | Marin County EMS | No | N/A |
| 210094 | Merced County EMS Agency | No | 2025 |
| 240012 | Monterey County EMS Agency | No | N/A |
| 210095 | Mountain-Valley EMS Agency | No | 2025 |
| 240014 | Napa County EMS | No | N/A |
| 240015 | North Coast EMS | No | N/A |
| 210096 | Northern California EMS Inc | No | 2025 |
| 150005 | Orange County EMS Agency | No | 2025 |
| 240018 | Riverside County EMS Agency | No | N/A |
| 150006 | Sacramento County EMS Agency | No | 2025 |
| 240020 | San Benito County EMS | No | N/A |
| 150004 | San Diego County EMS | No | 2025-2026 |
| 210100 | San Francisco EMS Agency | No | 2025 |
| 150001 | San Joaquin County EMS Agency | No | 1.9.1 |
| 240024 | San Luis Obispo County EMS Agency | No | N/A |
| 210102 | San Mateo County EMS Agency | No | 2025 |
| 240026 | Santa Barbara County EMS Agency | No | N/A |
| 240027 | Santa Clara County EMS Agency | No | N/A |
| 210103 | Santa Cruz County EMS | No | 2025 |
| 210104 | Sierra-Sacramento Valley EMS Agency | No | 2025 |
| 240030 | Solano County EMS | No | N/A |
| 240031 | Stanislaus County EMS Agency | No | N/A |
| 210105 | Ventura County EMS Agency | No | 2025 |
| 240033 | Yolo County EMS Agency | No | N/A |

---

## 3. LA County (Los Angeles County)

**County ID:** 240009

**Full Record:**
```json
{
  "id": 240009,
  "name": "Los Angeles County EMS Agency",
  "state": "California",
  "usesStateProtocols": false,
  "protocolVersion": null,
  "createdAt": "2026-01-17 17:07:57"
}
```

**Key Details:**
- Official name in database: "Los Angeles County EMS Agency"
- Does NOT use state-level protocols (county-specific)
- Protocol version: NULL (not set)
- Created: January 17, 2026

---

## 4. County ID Generation Analysis

### ID Range Statistics

```
First County ID: 30001
Last County ID:  240033
ID Range:        210033
Total Counties:  2713
Missing IDs:     207320 (gaps in sequence)
```

### ID Generation Method

**Type:** MySQL AUTO_INCREMENT

**Behavior:**
- Sequential integer starting from 1
- Automatically increments on each INSERT
- Gaps occur when records are deleted or inserts fail
- Starting ID appears to be offset (begins at 30001, not 1)

**Implementation:**
```sql
id INT(11) AUTO_INCREMENT PRIMARY KEY
```

**Why the Gap?**
The large gap (207,320 missing IDs) between first and last ID suggests:
1. Many records were deleted after initial data load
2. IDs were assigned in batches with gaps (e.g., state prefixes)
3. Data migration from another system with preserved IDs
4. ID scheme follows a pattern (e.g., state/county codes)

**ID Pattern Analysis:**
- IDs appear to use prefixes: 30xxx, 150xxx, 180xxx, 210xxx, 240xxx
- Likely represents FIPS codes or state/region identifiers
- Not strictly sequential AUTO_INCREMENT behavior

---

## 5. Protocol Coverage by State

**Top 10 States by County Count:**

| State | County Count |
|-------|--------------|
| Georgia | 166 |
| Kentucky | 135 |
| Kansas | 127 |
| Missouri | 126 |
| Mississippi | 120 |
| Iowa | 118 |
| Illinois | 116 |
| Colorado | 112 |
| Nebraska | 105 |
| Indiana | 98 |

**California Rank:** 34 counties (likely outside top 10)

---

## 6. Protocol Version Analysis

| Protocol Version | County Count | Percentage |
|------------------|--------------|------------|
| NULL (not set) | 2,382 | 87.8% |
| 2025 | 328 | 12.1% |
| 2026 | 1 | <0.1% |
| 1.9.1 | 1 | <0.1% |
| 2025-2026 | 1 | <0.1% |

**Key Findings:**
- Most counties (87.8%) do not have protocol version specified
- 328 counties have 2025 protocols
- Only 1 county has 2026 protocols (Contra Costa County EMS)
- Very few counties track protocol versions in the database

---

## 7. State Protocol Usage

| Uses State Protocols | County Count |
|---------------------|--------------|
| No | 2,713 (100%) |
| Yes | 0 (0%) |

**Finding:** ALL counties in the database use county-specific protocols, not state-level protocols. The `usesStateProtocols` field is always set to `false`.

---

## 8. Database Performance Considerations

### Indexes Present
1. **PRIMARY KEY** on `id` - Fast lookups by county ID
2. **INDEX** on `state` - Optimized for state filtering queries

### Missing Indexes (Potential Optimization)
Consider adding indexes for:
- `name` - If searching counties by name frequently
- `protocolVersion` - If filtering by protocol year
- `usesStateProtocols` - Already boolean, probably not needed

### Query Patterns
Based on `server/db.ts`, common queries include:
- `getAllCounties()` - Full table scan with ORDER BY state, name
- `getCountyById(id)` - Uses PRIMARY KEY index
- `getAgenciesByState(state)` - Uses `idx_counties_state` index
- State grouping/aggregations - Uses `idx_counties_state` index

---

## 9. Data Quality Issues

### Missing Protocol Versions
- **87.8% of counties** have NULL protocol versions
- Only California counties appear to have version data
- Suggests incomplete data migration or lack of tracking

### Naming Consistency
- Mix of naming conventions:
  - "County EMS Agency" (most common)
  - "County EMS" (some entries)
  - Just county name (e.g., "Lake")

### Date Fields
- All counties show `createdAt` timestamps
- Most recent: 2026-01-17 (LA County and others)
- Suggests recent data load/migration

---

## 10. Recommendations

### Schema Improvements
1. **Add Protocol Effective Date Tracking**
   - Add `protocolEffectiveDate` timestamp to counties table
   - Add `protocolLastUpdated` timestamp
   - Track protocol currency at county level

2. **Normalize State Names**
   - Ensure consistent state naming (full names vs abbreviations)
   - Add state code column (2-letter abbreviation)

3. **Add Metadata Fields**
   - `protocolCount` - Cached count of protocols per county
   - `lastProtocolUpdate` - When protocols were last modified
   - `isActive` - Flag for active/inactive counties

### Data Quality
1. **Populate Protocol Versions**
   - Fill in missing `protocolVersion` for all 2,382 counties
   - Establish version tracking process

2. **Standardize County Names**
   - Ensure all entries follow "County EMS Agency" format
   - Add `shortName` field for display purposes

3. **Document ID Scheme**
   - Clarify if IDs follow FIPS codes or custom scheme
   - Document prefix meaning (30xxx, 150xxx, etc.)

### Performance
1. **Current indexes are adequate** for query patterns
2. Consider composite index `(state, name)` if sorting by both frequently
3. Monitor query performance as data grows

---

## Appendix A: SQL Queries Used

```sql
-- Table structure
DESCRIBE counties;

-- Indexes
SHOW INDEX FROM counties;

-- Total counties
SELECT COUNT(*) as total FROM counties;

-- California counties
SELECT * FROM counties WHERE state = 'California' ORDER BY name;

-- LA County search
SELECT * FROM counties WHERE name LIKE '%Los Angeles%';

-- ID range analysis
SELECT MIN(id), MAX(id) FROM counties;

-- State distribution
SELECT state, COUNT(*) as count
FROM counties
GROUP BY state
ORDER BY count DESC
LIMIT 10;

-- Protocol version stats
SELECT protocolVersion, COUNT(*) as count
FROM counties
GROUP BY protocolVersion
ORDER BY count DESC;
```

---

## Appendix B: Related Files

- **Schema Definition:** `/Users/tanner-osterkamp/Protocol Guide Manus/drizzle/schema.ts`
- **Database Functions:** `/Users/tanner-osterkamp/Protocol Guide Manus/server/db.ts`
- **Audit Script:** `/Users/tanner-osterkamp/Protocol Guide Manus/scripts/audit-mysql-schema.ts`
- **Environment Config:** `/Users/tanner-osterkamp/Protocol Guide Manus/.env`

---

**Generated:** 2026-01-20
**Generated By:** MySQL Schema Audit Script
**Database:** TiDB Cloud (MySQL 5.7 compatible)
