# Analytics Database Migration Summary

## Implementation Complete ✓

Successfully implemented comprehensive analytics tracking infrastructure for Protocol Guide.

---

## What Was Implemented

### 1. Analytics Schema (`drizzle/analytics-schema.ts`)
Created 9 new analytics tables with proper indexes and relationships:

#### Core Analytics Tables
1. **`analytics_events`** - Generic event tracking
   - Tracks all user actions with flexible properties
   - Indexed on: eventType, userId, timestamp, sessionId
   - Supports anonymous events (userId can be NULL)

2. **`search_analytics`** - Search behavior tracking
   - Query patterns, performance metrics, result quality
   - Indexed on: userId+timestamp, noResultsFound+timestamp, stateFilter, queryCategory
   - Tracks voice queries, search methods, result rankings

3. **`protocol_access_logs`** - Content engagement
   - Protocol views, time spent, scroll depth
   - Indexed on: protocolChunkId, userId+timestamp, stateCode, accessSource
   - Tracks content sharing, copying, source attribution

4. **`session_analytics`** - Usage patterns
   - Session-level metrics, device info, user journey
   - Indexed on: userId, startTime
   - Unique constraint on sessionId

#### Pre-aggregated Analytics
5. **`daily_metrics`** - Dashboard performance
   - Pre-calculated daily statistics by dimension
   - Unique constraint on: date+metricType+dimension+dimensionValue
   - Indexed on: date, metricType

6. **`retention_cohorts`** - User retention analysis
   - D1, D7, D14, D30, D60, D90 retention tracking
   - Unique constraint on: cohortDate+cohortType+segment
   - Indexed on: cohortDate

7. **`content_gaps`** - Zero-result searches
   - Identifies missing content opportunities
   - Indexed on: occurrences, priority, status
   - Tracks state demand and resolution status

8. **`conversion_events`** - Revenue funnel
   - Upgrade prompts, checkouts, subscriptions
   - Indexed on: userId, eventType, timestamp
   - Tracks conversion attribution and revenue

9. **`feature_usage_stats`** - Feature adoption
   - Daily feature usage by tier and device
   - Unique constraint on: date+featureName
   - Indexed on: featureName

---

## Files Modified

### ✓ `/drizzle/schema.ts`
- Added analytics exports (lines 432-466)
- Exports all 9 tables with TypeScript types
- Exports helper types: EventType, SearchMethod, AccessSource, QueryCategory

### ✓ `/drizzle/analytics-schema.ts`
- Created comprehensive analytics schema (352 lines)
- Full table definitions with indexes
- Type exports for insert and select operations

### ✓ `/server/db.ts`
- Added analytics table imports (lines 12-24)
- All analytics types available for server-side operations

### ✓ `/drizzle/0012_add_analytics_tables.sql`
- Generated SQL migration with CREATE TABLE statements
- 9 tables + 23 indexes created
- Includes ALTER statements for existing tables

---

## Database Schema Details

### Table Sizes (Estimated)
- `analytics_events`: High volume (millions of rows)
- `search_analytics`: High volume (millions of rows)
- `protocol_access_logs`: High volume (millions of rows)
- `session_analytics`: Medium volume (hundreds of thousands)
- `daily_metrics`: Low volume (thousands - pre-aggregated)
- `retention_cohorts`: Very low volume (hundreds)
- `content_gaps`: Low volume (thousands)
- `conversion_events`: Low volume (thousands)
- `feature_usage_stats`: Low volume (thousands)

### Index Strategy
- **Event tracking**: Indexed on timestamp for time-series queries
- **User analytics**: Composite indexes on userId+timestamp
- **Aggregation tables**: Unique constraints to prevent duplicates
- **Lookups**: Single-column indexes on frequently filtered fields

### JSON Columns
Used for flexible data storage:
- `analytics_events.properties` - Custom event data
- `content_gaps.statesRequested` - State demand tracking
- `feature_usage_stats.tierBreakdown` - Usage by tier
- `feature_usage_stats.deviceBreakdown` - Usage by device

---

## Migration Deployment

### To Apply Migration:
```bash
# Review the migration
cat drizzle/0012_add_analytics_tables.sql

# Apply to database (using drizzle-kit or manual SQL execution)
npx drizzle-kit push

# Or apply manually to your MySQL database
mysql -u user -p database < drizzle/0012_add_analytics_tables.sql
```

### Rollback Strategy:
```sql
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS search_analytics;
DROP TABLE IF EXISTS protocol_access_logs;
DROP TABLE IF EXISTS session_analytics;
DROP TABLE IF EXISTS daily_metrics;
DROP TABLE IF EXISTS retention_cohorts;
DROP TABLE IF EXISTS content_gaps;
DROP TABLE IF EXISTS conversion_events;
DROP TABLE IF EXISTS feature_usage_stats;

-- Rollback ALTER statements
ALTER TABLE agencies DROP COLUMN seatCount;
ALTER TABLE agencies DROP COLUMN annualBilling;
ALTER TABLE users DROP COLUMN disclaimerAcknowledgedAt;
ALTER TABLE integration_logs ADD COLUMN userAge int;
ALTER TABLE integration_logs ADD COLUMN impression varchar(255);
```

---

## Usage Examples

### Track a Search Event
```typescript
import { searchAnalytics, type InsertSearchAnalytics } from '@/drizzle/schema';
import { getDb } from '@/server/db';

const db = await getDb();
await db.insert(searchAnalytics).values({
  userId: 123,
  sessionId: 'abc123',
  queryText: 'cardiac arrest protocol',
  resultsCount: 5,
  timeToFirstResult: 250,
  totalSearchTime: 1200,
  timestamp: new Date(),
});
```

### Track Protocol Access
```typescript
import { protocolAccessLogs } from '@/drizzle/schema';

await db.insert(protocolAccessLogs).values({
  userId: 123,
  sessionId: 'abc123',
  protocolChunkId: 456,
  protocolNumber: 'CA-001',
  protocolTitle: 'Cardiac Arrest',
  accessSource: 'search',
  timeSpentSeconds: 45,
  scrollDepth: 0.8,
  timestamp: new Date(),
});
```

### Query Daily Metrics
```typescript
import { dailyMetrics } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

const metrics = await db
  .select()
  .from(dailyMetrics)
  .where(
    and(
      eq(dailyMetrics.date, '2026-01-22'),
      eq(dailyMetrics.metricType, 'dau')
    )
  );
```

---

## Next Steps

### Recommended Implementation Order:
1. **Create analytics tracking middleware** - Track sessions and events
2. **Implement search analytics** - Log all search queries
3. **Add protocol access tracking** - Track content engagement
4. **Build aggregation jobs** - Daily/weekly metric calculations
5. **Create analytics dashboard** - Visualize key metrics
6. **Set up retention analysis** - Cohort tracking
7. **Monitor content gaps** - Identify missing content

### Performance Considerations:
- Consider partitioning high-volume tables by date
- Archive old analytics data after 90-180 days
- Use batch inserts for high-throughput events
- Monitor index usage and optimize as needed

---

## Verification

Run the verification script:
```bash
npx tsx -e "
import {
  analyticsEvents, searchAnalytics, protocolAccessLogs,
  sessionAnalytics, dailyMetrics, retentionCohorts,
  contentGaps, conversionEvents, featureUsageStats
} from './drizzle/schema';

console.log('✓ All analytics tables imported successfully');
"
```

Expected output:
```
✓ All analytics tables imported successfully
```

---

## Files Checklist

- [x] `/drizzle/analytics-schema.ts` - Analytics table definitions
- [x] `/drizzle/schema.ts` - Export analytics tables
- [x] `/server/db.ts` - Import analytics tables
- [x] `/drizzle/0012_add_analytics_tables.sql` - SQL migration
- [x] Verification - All tables compile and export correctly

---

## Summary

**Status**: ✅ Complete
**Tables Created**: 9
**Indexes Created**: 23
**TypeScript Types**: 27
**Migration File**: `0012_add_analytics_tables.sql`

All analytics infrastructure is ready for implementation. The database schema supports comprehensive tracking of user behavior, search patterns, content engagement, and business metrics.
