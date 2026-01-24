# Protocol Guide Database Schema Consolidation

**Date:** 2026-01-23
**Status:** Complete

## Overview

Protocol Guide uses a dual-database architecture:
- **PostgreSQL (Supabase)** - Primary runtime database
- **MySQL (TiDB Cloud)** - Secondary database for legacy imports

This document describes the consolidated schema structure and how to maintain synchronization.

## Database Architecture

```
                    +------------------------+
                    |    Protocol Guide      |
                    |      Application       |
                    +------------------------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
    +------------------+           +------------------+
    |   PostgreSQL     |           |     MySQL        |
    |   (Supabase)     |           |   (TiDB Cloud)   |
    +------------------+           +------------------+
    |                  |           |                  |
    | - Primary DB     |           | - Secondary DB   |
    | - All CRUD ops   |           | - Legacy imports |
    | - Real-time      |           | - Batch process  |
    | - pgvector       |           | - Analytics BU   |
    | - RLS policies   |           |                  |
    +------------------+           +------------------+
```

## Schema Files

| File | Database | Purpose |
|------|----------|---------|
| `drizzle/schema.ts` | PostgreSQL | **SOURCE OF TRUTH** - Main schema |
| `drizzle/analytics-schema.ts` | PostgreSQL | Analytics tables |
| `drizzle/mysql-schema.ts` | MySQL | Mirror of PostgreSQL schema |
| `drizzle/shared-types.ts` | Both | Database-agnostic type definitions |
| `drizzle/relations.ts` | PostgreSQL | Drizzle ORM relations |

## Configuration Files

| File | Purpose |
|------|---------|
| `drizzle.config.ts` | PostgreSQL drizzle-kit config |
| `drizzle-mysql.config.ts` | MySQL drizzle-kit config |

## When to Update Each Schema

### PostgreSQL Schema Changes (schema.ts)

1. Make changes to `drizzle/schema.ts`
2. Generate migration: `pnpm drizzle-kit generate`
3. Apply migration: `pnpm drizzle-kit push`
4. Run sync validation: `pnpm tsx scripts/sync-mysql-schema.ts`
5. If needed, update `drizzle/mysql-schema.ts` to match

### MySQL Schema Changes (mysql-schema.ts)

Only update MySQL schema to match PostgreSQL. Never add MySQL-only tables.

```bash
# Generate MySQL migration
pnpm drizzle-kit generate --config=drizzle-mysql.config.ts

# Push to MySQL
pnpm drizzle-kit push --config=drizzle-mysql.config.ts
```

## Type Differences

The schemas handle type differences between PostgreSQL and MySQL:

| PostgreSQL | MySQL | Notes |
|------------|-------|-------|
| `serial` | `int().autoincrement()` | Auto-increment primary keys |
| `boolean` | `tinyint()` | Boolean values (0/1) |
| `numeric(p,s)` | `decimal(p,s)` | Precise decimals |
| `real` | `float()` | Floating point |
| `text` | `text()` / `longtext()` | Text columns |
| `pgEnum()` | `mysqlEnum()` | Enum definitions |
| `timestamp` | `timestamp` | Same, but defaults differ |

## Tables Summary

### Core Tables (29 total)

**User Management:**
- `users` - User accounts
- `userAuthProviders` - OAuth providers
- `userCounties` - User county subscriptions
- `userStates` - User state subscriptions
- `userAgencies` - User agency memberships

**Content:**
- `counties` - County/LEMSA definitions
- `agencies` - EMS agencies
- `agencyMembers` - Agency membership
- `protocolChunks` - Protocol content chunks
- `protocolVersions` - Protocol version tracking
- `protocolUploads` - Upload processing

**User Activity:**
- `bookmarks` - User bookmarks
- `queries` - AI query history
- `searchHistory` - Search history
- `feedback` - User feedback
- `contactSubmissions` - Contact form

**System:**
- `auditLogs` - Audit trail
- `integrationLogs` - Partner API logs
- `stripeWebhookEvents` - Payment events
- `pushTokens` - Push notification tokens
- `dripEmailsSent` - Email tracking

**Analytics:**
- `analyticsEvents` - Generic events
- `searchAnalytics` - Search behavior
- `protocolAccessLogs` - Content access
- `sessionAnalytics` - Session tracking
- `dailyMetrics` - Aggregated metrics
- `retentionCohorts` - Retention data
- `contentGaps` - Missing content tracking
- `conversionEvents` - Conversion funnel
- `featureUsageStats` - Feature usage

## Migration History

### 2026-01-23: Schema Consolidation

**Changes:**
1. Created `drizzle/mysql-schema.ts` - Aligned MySQL schema with PostgreSQL
2. Created `drizzle/shared-types.ts` - Database-agnostic types
3. Updated `drizzle/relations.ts` - Full relation definitions
4. Created `drizzle-mysql.config.ts` - MySQL drizzle-kit config
5. Created `scripts/sync-mysql-schema.ts` - Schema validation tool
6. Deprecated `drizzle/schema-updated.ts` - Old divergent MySQL schema

**Key Fixes:**
- Aligned `agencies` table structure (added stateCode, agencyType, etc.)
- Aligned `protocolVersions` table (added protocolNumber, title, effectiveDate)
- Aligned `protocolUploads` table (changed from versionId to agencyId/userId)
- Aligned `agencyMembers` roles (enum instead of varchar)
- Added missing tables to MySQL schema
- Unified index naming conventions

## Best Practices

### 1. Schema Changes

```typescript
// ALWAYS add to PostgreSQL schema first
// drizzle/schema.ts

export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  // ... columns
});

// THEN mirror in MySQL schema
// drizzle/mysql-schema.ts

export const newTable = mysqlTable("new_table", {
  id: int().autoincrement().primaryKey().notNull(),
  // ... columns (with MySQL types)
});
```

### 2. Type Definitions

```typescript
// Use shared types for application code
import type { UserRole, UserTier } from "../drizzle/shared-types";

// Use schema types for database operations
import type { User, InsertUser } from "../drizzle/schema";
```

### 3. Relations

Always define relations in `drizzle/relations.ts` for type-safe queries:

```typescript
// Good - uses relations
const result = await db.query.users.findFirst({
  with: {
    bookmarks: true,
    selectedCounty: true,
  },
});

// Less type-safe - manual join
const result = await db
  .select()
  .from(users)
  .leftJoin(bookmarks, eq(users.id, bookmarks.userId));
```

## Validation

Run schema validation before deploying:

```bash
# Validate schemas are in sync
pnpm tsx scripts/sync-mysql-schema.ts

# Check for TypeScript errors
pnpm tsc --noEmit
```

## Environment Variables

```bash
# PostgreSQL (Supabase) - Primary
DATABASE_URL=postgresql://user:pass@host:5432/db

# MySQL (TiDB) - Secondary (optional, for imports)
MYSQL_DATABASE_URL=mysql://user:pass@host:4000/db
```

## Troubleshooting

### "Table exists in PostgreSQL but not MySQL"

1. Add the table definition to `drizzle/mysql-schema.ts`
2. Run `pnpm drizzle-kit push --config=drizzle-mysql.config.ts`

### "Type mismatch between schemas"

Check the TYPE_MAPPING in the sync script and update accordingly.

### "Relation not found"

Add the relation definition to `drizzle/relations.ts`.

## Related Documentation

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Supabase Docs](https://supabase.com/docs)
- [TiDB Docs](https://docs.pingcap.com/tidb/stable)
- `/docs/database/INDEX_REFERENCE.md` - Index documentation
- `/docs/DB_CONNECTION_BEST_PRACTICES.md` - Connection pooling
