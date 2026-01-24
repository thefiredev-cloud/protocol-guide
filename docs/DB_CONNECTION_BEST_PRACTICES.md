# Database Connection Best Practices

Quick reference guide for working with database connections in Protocol Guide.

## TL;DR

✅ **DO:** Use `getDb()` from `server/db/connection.ts`
❌ **DON'T:** Create standalone connections in application code
✅ **DO:** Use `try-catch-finally` in scripts
❌ **DON'T:** Forget to close connections in `finally` blocks

## Application Code (Server/API)

### ✅ Correct Pattern

```typescript
import { getDb } from '../db/connection';

export async function getUser(userId: number) {
  const db = await getDb();
  // Connection is managed by pool automatically
  return db.select().from(users).where(eq(users.id, userId));
  // No need to close - pool handles it
}
```

### ❌ Incorrect Pattern

```typescript
import mysql from 'mysql2/promise';

export async function getUser(userId: number) {
  // DON'T create standalone connections!
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const result = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
  await connection.end(); // This defeats pooling
  return result;
}
```

## Scripts (CLI/Migrations/Seed)

### ✅ Correct Pattern - Using Pool

```typescript
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

async function myScript() {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);

  try {
    // All your database operations here
    const result = await db.select().from(users);
    console.log(`Found ${result.length} users`);

    // More operations...
  } catch (error) {
    console.error("Script error:", error);
    throw error; // Re-throw after logging
  } finally {
    // ALWAYS close pool, even on error
    await pool.end();
  }
}

myScript().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### ✅ Correct Pattern - Single Connection

```typescript
import mysql from 'mysql2/promise';

async function quickQuery() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables:', rows);
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  } finally {
    // ALWAYS close connection, even on error
    await connection.end();
  }
}

quickQuery().catch(console.error);
```

### ❌ Incorrect Pattern - Connection Leak

```typescript
async function badScript() {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);

  const result = await db.select().from(users);
  console.log(`Found ${result.length} users`);

  if (result.length === 0) {
    throw new Error("No users found");
    // LEAK! Pool not closed on error path
  }

  await pool.end(); // Only reached on success
}
```

## Connection Pool Configuration

Pool is automatically configured based on `NODE_ENV`:

| Environment  | Connections | Queue Limit | Idle Timeout |
|-------------|-------------|-------------|--------------|
| development | 10          | 20          | 30s          |
| production  | 20          | 50          | 45s          |
| test        | 5           | 10          | 20s          |

### Pool Features:
- **Queue Limit:** Prevents memory exhaustion from unbounded queues
- **Acquire Timeout:** 10s max wait for connection (fail fast)
- **Keep-Alive:** Pings every 10s to prevent stale connections
- **Connection Validation:** Tests connection on pool creation

## Error Handling

### Pool Exhaustion

```typescript
try {
  const db = await getDb();
  await db.select().from(users);
} catch (error) {
  if (error.code === 'POOL_ENQUEUE_LIMIT') {
    // Pool queue is full - too many concurrent requests
    // Options:
    // 1. Increase pool size (check if database can handle it)
    // 2. Implement rate limiting
    // 3. Add backoff/retry logic
  }
}
```

### Connection Timeout

```typescript
try {
  const db = await getDb();
  await db.select().from(users);
} catch (error) {
  if (error.code === 'ETIMEDOUT' || error.code === 'POOL_ACQUIRE_TIMEOUT') {
    // Connection acquisition timed out (10s)
    // Possible causes:
    // 1. Pool exhausted (all connections in use)
    // 2. Slow queries blocking connections
    // 3. Database overloaded
  }
}
```

## Monitoring

### Watch for These Logs:

**Warning Signs:**
```
[Database] Connection request queued - pool may be saturated
```
**Action:** Consider increasing pool size or optimizing slow queries

**Critical Issues:**
```
[Database] Connection pool creation failed
[Database] Initial connection test failed
```
**Action:** Check database connectivity and credentials

## Common Mistakes

### 1. Not Closing Connections in Scripts

```typescript
// ❌ BAD
async function seed() {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  await db.insert(users).values([...]);
  // LEAK! Pool not closed
}

// ✅ GOOD
async function seed() {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  try {
    await db.insert(users).values([...]);
  } finally {
    await pool.end();
  }
}
```

### 2. Creating Connections in Loops

```typescript
// ❌ BAD - Creates pool on every request
export async function getUser(userId: number) {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);
  return db.select().from(users).where(eq(users.id, userId));
  // Pool never closed!
}

// ✅ GOOD - Use existing pool
export async function getUser(userId: number) {
  const db = await getDb(); // Reuses existing pool
  return db.select().from(users).where(eq(users.id, userId));
}
```

### 3. Forgetting Error Handling

```typescript
// ❌ BAD - Connection leaks on error
async function migrate() {
  const connection = await mysql.createConnection(DATABASE_URL);
  await connection.query(sql); // Error here = leak
  await connection.end();
}

// ✅ GOOD - Always closes
async function migrate() {
  const connection = await mysql.createConnection(DATABASE_URL);
  try {
    await connection.query(sql);
  } finally {
    await connection.end();
  }
}
```

## Performance Tips

### 1. Use Transactions for Multiple Operations

```typescript
async function createUserWithProfile(userData, profileData) {
  const db = await getDb();

  // Wraps multiple operations in single transaction
  return await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values(userData);
    await tx.insert(profiles).values({ ...profileData, userId: user.id });
    return user;
  });
}
```

### 2. Batch Operations

```typescript
// ✅ GOOD - Single query
await db.insert(users).values([user1, user2, user3, ...]);

// ❌ BAD - Multiple queries
for (const user of users) {
  await db.insert(users).values(user); // Creates pool pressure
}
```

### 3. Use Connection Pool Stats (Debug)

```typescript
import { getPool } from '../db/connection';

const pool = await getPool();
console.log('Pool stats:', {
  active: pool.pool.totalConnections - pool.pool.freeConnections,
  idle: pool.pool.freeConnections,
  waiting: pool.pool.waitingClients,
});
```

## Testing Connection Pooling

### Test for Leaks

```bash
# Run a script 100 times
for i in {1..100}; do npm run db:check; done

# Check database connections
mysql -e "SHOW PROCESSLIST;" | grep "Sleep" | wc -l
# Should be stable, not growing
```

### Test Pool Exhaustion

```bash
# High concurrent load
ab -n 10000 -c 100 http://localhost:3000/api/trpc/search.byQuery

# Check logs for warnings
grep "Connection request queued" logs/*.log
```

## Quick Checklist

Before committing database code:

- [ ] Using `getDb()` in application code (not creating connections)
- [ ] Scripts have `try-catch-finally` pattern
- [ ] Connections closed in `finally` block
- [ ] No connections created in loops
- [ ] Errors properly propagated
- [ ] No standalone connections in server code

## Resources

- **Main Config:** `server/db/connection.ts`
- **DB Operations:** `server/db/*.ts`
- **Scripts:** `scripts/*.ts`
- **Full Guide:** `CONNECTION_POOLING_FIXES.md`

## Questions?

If you're unsure about connection handling:
1. Check this guide first
2. Look at similar files for patterns
3. Ask in #backend channel
4. When in doubt, use `try-finally`

---

Remember: **Every connection opened must be closed. Use try-finally to guarantee it.**
