# Analytics Migration - Quick Reference 🚀

**Status:** ✅ COMPLETE | **Date:** 2026-01-23 | **Database:** MySQL (TiDB Cloud)

---

## ✅ What Was Done

1. **Created Analytics Schema** - 9 new tables for comprehensive tracking
2. **Applied Migration** - All tables pushed to production database
3. **Added Indexes** - 23 performance indexes created
4. **Updated Imports** - Server database exports updated
5. **Created Verification** - Validation script for future checks

---

## 📊 Analytics Tables (9)

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `analytics_events` | Generic event tracking | event_type, user_id, timestamp, session |
| `search_analytics` | Search behavior | user+timestamp, no_results+timestamp, state |
| `protocol_access_logs` | Protocol engagement | protocol_id, user+timestamp, state, source |
| `session_analytics` | Session metrics | user_id, start_time |
| `daily_metrics` | Pre-aggregated stats | date, metric_type |
| `retention_cohorts` | Retention analysis | cohort_date |
| `content_gaps` | Missing content | occurrences, priority, status |
| `conversion_events` | Revenue funnel | user_id, event_type, timestamp |
| `feature_usage_stats` | Feature adoption | feature_name |

---

## 🎯 Quick Start

### View Tables in Browser:
```bash
# Drizzle Studio is already running!
open http://localhost:4983
```

### Stop Drizzle Studio:
```bash
lsof -ti:4983 | xargs kill
```

### Restart Drizzle Studio:
```bash
cd "/Users/tanner-osterkamp/Protocol Guide Manus"
npx drizzle-kit studio --port 4983
```

### Verify Migration:
```bash
npx tsx scripts/verify-analytics-migration.ts
```

---

## 📝 Usage Example

```typescript
// Track a search event
import { searchAnalytics } from '@/drizzle/schema';
import { getDb } from '@/server/db';

const db = await getDb();
await db.insert(searchAnalytics).values({
  userId: user.id,
  sessionId: session.id,
  queryText: 'cardiac arrest',
  resultsCount: 10,
  timeToFirstResult: 150,
  totalSearchTime: 850,
});
```

---

## 📂 Key Files

| File | Path | Purpose |
|------|------|---------|
| Analytics Schema | `/drizzle/analytics-schema.ts` | Table definitions |
| Migration SQL | `/drizzle/0012_add_analytics_tables.sql` | SQL migration |
| Server Imports | `/server/db.ts` | Database exports |
| Verification | `/scripts/verify-analytics-migration.ts` | Validation |
| Full Docs | `/ANALYTICS_MIGRATION_COMPLETE.md` | Complete guide |

---

## 🔍 Supabase Note

**Important:** This migration is for the **MySQL (TiDB)** database, not Supabase!

Protocol Guide uses a hybrid architecture:
- **MySQL (TiDB):** User data, queries, **analytics** ← This migration
- **Supabase (PostgreSQL):** Protocol chunks with vector embeddings

The Supabase migrations in `/docs/migrations/` are separate and apply to PostgreSQL.

---

## 🎉 Next Steps

1. ✅ Migration complete
2. ⏳ Implement analytics middleware
3. ⏳ Add event tracking to app
4. ⏳ Create analytics dashboard
5. ⏳ Set up aggregation jobs

See `/ANALYTICS_MIGRATION_COMPLETE.md` for full implementation roadmap.

---

## 🔧 Troubleshooting

**Tables not showing?**
```bash
npx drizzle-kit push --force
```

**Type errors?**
```bash
npx drizzle-kit generate
```

**Need to rollback?**
```sql
DROP TABLE IF EXISTS analytics_events, search_analytics,
  protocol_access_logs, session_analytics, daily_metrics,
  retention_cohorts, content_gaps, conversion_events,
  feature_usage_stats;
```

---

**Migration Status:** ✅ COMPLETE
**Tables:** 9 / 9
**Indexes:** 23
**Ready for:** Production use
