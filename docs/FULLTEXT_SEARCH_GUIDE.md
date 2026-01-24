# FULLTEXT Search Implementation Guide

Quick reference for developers using MySQL FULLTEXT indexes in Protocol Guide.

## Available FULLTEXT Indexes

| Table | Index Name | Columns | Use Case |
|-------|-----------|---------|----------|
| `protocolChunks` | `ft_protocol_content` | content, protocolTitle, section | Protocol search |
| `queries` | `ft_query_text` | queryText | Query history |
| `feedback` | `ft_feedback_content` | subject, message | Feedback search |
| `agencies` | `ft_agencies_search` | name, county | Agency discovery |
| `search_history` | `ft_search_history_query` | searchQuery | Search analytics |
| `contact_submissions` | `ft_contact_search` | name, email, message | Support tickets |
| `integration_logs` | `ft_integration_search` | searchTerm, agencyName | Partner analytics |
| `users` | `ft_users_search` | name, email | User lookup |
| `protocol_versions` | `ft_protocol_versions_search` | title, changeLog | Version management |
| `bookmarks` | `ft_bookmarks_search` | protocolTitle, section, content | Bookmark search |
| `audit_logs` | `ft_audit_logs_useragent` | userAgent | Security monitoring |

## Basic Usage

### Natural Language Search (Default)
Best for user-facing search features.

```typescript
import { sql } from "drizzle-orm";

// Search agencies by name or county
const results = await db.execute(sql`
  SELECT * FROM agencies
  WHERE MATCH(name, county) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE)
  ORDER BY MATCH(name, county) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE) DESC
  LIMIT 20
`);
```

### Boolean Search
Best for advanced filtering with operators.

```typescript
// Search with required (+) and excluded (-) terms
const searchTerm = "+fire -volunteer"; // Must have "fire", exclude "volunteer"

const results = await db.execute(sql`
  SELECT * FROM agencies
  WHERE MATCH(name, county) AGAINST(${searchTerm} IN BOOLEAN MODE)
  LIMIT 20
`);
```

### With Query Expansion
Best for vague queries (searches twice: original + related terms).

```typescript
const results = await db.execute(sql`
  SELECT * FROM search_history
  WHERE MATCH(searchQuery) AGAINST(${term} WITH QUERY EXPANSION)
  LIMIT 10
`);
```

## Common Patterns

### 1. Agency Discovery
```typescript
// server/db/agencies.ts
export async function searchAgencies(searchTerm: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.execute(sql`
    SELECT
      id,
      name,
      state,
      county,
      agencyType,
      MATCH(name, county) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE) as relevance
    FROM agencies
    WHERE MATCH(name, county) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE)
    ORDER BY relevance DESC
    LIMIT ${limit}
  `);

  return results[0];
}
```

### 2. Support Ticket Search
```typescript
// server/db/feedback.ts
export async function searchContactSubmissions(
  searchTerm: string,
  status?: 'pending' | 'reviewed' | 'resolved'
) {
  const db = await getDb();
  if (!db) return [];

  let query = sql`
    SELECT
      id,
      name,
      email,
      message,
      status,
      createdAt,
      MATCH(name, email, message) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE) as relevance
    FROM contact_submissions
    WHERE MATCH(name, email, message) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE)
  `;

  if (status) {
    query = sql`${query} AND status = ${status}`;
  }

  query = sql`${query} ORDER BY relevance DESC, createdAt DESC LIMIT 50`;

  const results = await db.execute(query);
  return results[0];
}
```

### 3. User Lookup (Admin)
```typescript
// server/db/users.ts
export async function searchUsers(searchTerm: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.execute(sql`
    SELECT
      id,
      name,
      email,
      role,
      tier,
      createdAt,
      MATCH(name, email) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE) as relevance
    FROM users
    WHERE MATCH(name, email) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE)
    ORDER BY relevance DESC
    LIMIT ${limit}
  `);

  return results[0];
}
```

### 4. Search Analytics
```typescript
// server/db/analytics.ts
export async function findSimilarSearches(query: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.execute(sql`
    SELECT
      searchQuery,
      COUNT(*) as frequency,
      AVG(resultsCount) as avg_results
    FROM search_history
    WHERE MATCH(searchQuery) AGAINST(${query} IN NATURAL LANGUAGE MODE)
    GROUP BY searchQuery
    ORDER BY frequency DESC
    LIMIT ${limit}
  `);

  return results[0];
}
```

### 5. Integration Analytics
```typescript
// server/db/integrations.ts
export async function analyzePartnerSearches(
  partner: string,
  days = 7
) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.execute(sql`
    SELECT
      searchTerm,
      agencyName,
      COUNT(*) as searches,
      AVG(responseTimeMs) as avg_response_time,
      AVG(resultCount) as avg_results
    FROM integration_logs
    WHERE partner = ${partner}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      AND searchTerm IS NOT NULL
    GROUP BY searchTerm, agencyName
    ORDER BY searches DESC
    LIMIT 50
  `);

  return results[0];
}

// Find what partners search for related to a term
export async function searchIntegrationLogs(term: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.execute(sql`
    SELECT
      searchTerm,
      agencyName,
      partner,
      resultCount,
      responseTimeMs,
      createdAt
    FROM integration_logs
    WHERE MATCH(searchTerm, agencyName) AGAINST(${term} IN NATURAL LANGUAGE MODE)
    ORDER BY MATCH(searchTerm, agencyName) AGAINST(${term} IN NATURAL LANGUAGE MODE) DESC
    LIMIT ${limit}
  `);

  return results[0];
}
```

### 6. Bookmark Search
```typescript
// server/db/bookmarks.ts
export async function searchUserBookmarks(userId: number, searchTerm: string) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.execute(sql`
    SELECT
      id,
      protocolNumber,
      protocolTitle,
      section,
      content,
      createdAt,
      MATCH(protocolTitle, section, content) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE) as relevance
    FROM bookmarks
    WHERE userId = ${userId}
      AND MATCH(protocolTitle, section, content) AGAINST(${searchTerm} IN NATURAL LANGUAGE MODE)
    ORDER BY relevance DESC, createdAt DESC
  `);

  return results[0];
}
```

### 7. Security Monitoring
```typescript
// server/db/security.ts
export async function detectSuspiciousBots(hours = 24) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.execute(sql`
    SELECT
      userAgent,
      COUNT(*) as requests,
      COUNT(DISTINCT userId) as unique_users,
      COUNT(DISTINCT ipAddress) as unique_ips
    FROM audit_logs
    WHERE MATCH(userAgent) AGAINST('bot crawler spider scraper' IN BOOLEAN MODE)
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
    GROUP BY userAgent
    HAVING requests > 100
    ORDER BY requests DESC
  `);

  return results[0];
}
```

## Boolean Mode Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Required word | `+fire +dept` (must have both) |
| `-` | Exclude word | `+fire -volunteer` (fire but not volunteer) |
| `*` | Wildcard | `cardiac*` (cardiac, cardiology, etc.) |
| `""` | Exact phrase | `"Los Angeles"` |
| `()` | Grouping | `+(fire dept) -volunteer` |
| `>` | Increase relevance | `>important keyword` |
| `<` | Decrease relevance | `<less important` |

### Boolean Search Examples

```typescript
// Must have "fire" AND "department"
const term1 = "+fire +department";

// Must have "fire", exclude "volunteer"
const term2 = "+fire -volunteer";

// Exact phrase
const term3 = '"Los Angeles Fire Department"';

// Wildcard - matches "cardiac", "cardiology", etc.
const term4 = "cardiac*";

// Complex: Must have fire or EMS, exclude volunteer
const term5 = "+(fire EMS) -volunteer";
```

## Performance Tips

### DO: Use relevance scoring
```typescript
// Good: Orders by relevance
SELECT *, MATCH(name) AGAINST(?) as relevance
FROM agencies
WHERE MATCH(name) AGAINST(?)
ORDER BY relevance DESC;
```

### DON'T: Use LIKE for full-text search
```typescript
// Bad: Slow full table scan
SELECT * FROM agencies WHERE name LIKE '%fire%';

// Good: Fast FULLTEXT index
SELECT * FROM agencies
WHERE MATCH(name, county) AGAINST('fire' IN NATURAL LANGUAGE MODE);
```

### DO: Combine with other indexes
```typescript
// Good: Uses both state index and FULLTEXT index
SELECT * FROM agencies
WHERE state = 'CA'
  AND MATCH(name, county) AGAINST('fire' IN NATURAL LANGUAGE MODE);
```

### DON'T: Overuse query expansion
```typescript
// Bad: Too slow for user-facing queries
MATCH(col) AGAINST('term' WITH QUERY EXPANSION)

// Good: Use only for vague/failed searches
// Try natural language first, fall back to expansion if no results
```

## Limitations

### Minimum Word Length
MySQL FULLTEXT has minimum word length (default: 4 for InnoDB, 3 for MyISAM).

```typescript
// Won't match (too short)
MATCH(name) AGAINST('EMS' IN NATURAL LANGUAGE MODE)

// Use BOOLEAN mode for short terms
MATCH(name) AGAINST('EMS' IN BOOLEAN MODE)
```

### Stop Words
Common words are ignored: "the", "and", "or", "is", etc.

```typescript
// "the" is ignored
MATCH(name) AGAINST('the fire department')
// Equivalent to:
MATCH(name) AGAINST('fire department')
```

### 50% Threshold
In NATURAL LANGUAGE mode, terms in >50% of rows are ignored.

```typescript
// If "fire" is in >50% of agencies, it's ignored
MATCH(name) AGAINST('fire')

// Solution: Use BOOLEAN mode
MATCH(name) AGAINST('fire' IN BOOLEAN MODE)
```

## Testing FULLTEXT Indexes

### Verify index exists
```sql
SHOW INDEX FROM agencies WHERE Key_name = 'ft_agencies_search';
```

### Test query performance
```sql
-- Without index (slow)
EXPLAIN SELECT * FROM agencies WHERE name LIKE '%fire%';

-- With FULLTEXT (fast)
EXPLAIN SELECT * FROM agencies
WHERE MATCH(name, county) AGAINST('fire' IN NATURAL LANGUAGE MODE);
```

### Check index usage
```sql
-- Enable profiling
SET profiling = 1;

-- Run query
SELECT * FROM agencies
WHERE MATCH(name, county) AGAINST('fire department' IN NATURAL LANGUAGE MODE);

-- Check performance
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

## Maintenance

### Rebuild indexes (quarterly)
```sql
OPTIMIZE TABLE agencies, search_history, contact_submissions,
               integration_logs, users, protocol_versions,
               bookmarks, audit_logs;
```

### Monitor index size
```sql
SELECT
  table_name,
  index_name,
  ROUND(stat_value * @@innodb_page_size / 1024 / 1024, 2) AS size_mb
FROM mysql.innodb_index_stats
WHERE index_name LIKE 'ft_%'
  AND database_name = DATABASE()
ORDER BY stat_value DESC;
```

## Migration Files

- **Migration 0017:** `drizzle/migrations/0017_add_fulltext_indexes.sql` (protocolChunks, queries, feedback)
- **Migration 0023:** `drizzle/migrations/0023_add_additional_fulltext_indexes.sql` (8 additional tables)

## Resources

- [MySQL FULLTEXT Documentation](https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html)
- [FULLTEXT Index Analysis](../FULLTEXT_INDEX_ANALYSIS.md)
- [Database Performance Guide](../docs/database/PERFORMANCE_GUIDE.md)
