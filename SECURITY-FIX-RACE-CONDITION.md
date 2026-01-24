# Security Fix: Query Limit Race Condition (TOCTOU)

**Severity**: HIGH
**Date**: 2026-01-23
**Status**: FIXED

## Vulnerability Description

A Time-of-Check to Time-of-Use (TOCTOU) race condition existed in the query limit enforcement mechanism. The vulnerability allowed users to exceed their daily query limits by sending parallel requests.

### Attack Scenario

1. User with free tier has 9/10 queries used
2. Attacker sends 5 parallel requests simultaneously
3. All 5 requests check the limit and see 9/10 (under limit)
4. All 5 requests pass validation
5. All 5 requests increment the counter
6. Final result: 14/10 queries used (4 unauthorized queries executed)

## Root Cause

The check and increment operations were separated:

**Vulnerable Code** (`server/routers/query.ts`):
```typescript
// Line 58-66: Check limit (TOCTOU window opens here)
const { count, limit } = await checkQueryLimit(userId);
if (count >= limit) {
  throw new TRPCError({ code: "FORBIDDEN", message: "Daily limit exceeded" });
}

// ... query processing (100+ lines) ...

// Line 179: Increment count (race window closes)
await incrementQueryCount(userId);
```

The race window existed between:
- **Time of Check** (line 58-66): Reading count and comparing to limit
- **Time of Use** (line 179): Incrementing the count

Multiple concurrent requests could all read the same count value before any of them incremented it.

## Fix Implementation

### 1. Created Atomic Function (`server/db/users-usage.ts`)

```typescript
export async function incrementAndCheckQueryLimit(
  userId: number,
  limit: number
): Promise<{ allowed: boolean; newCount: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];

  // Atomic operation: reset if new day, increment, and return new count
  // This prevents race conditions by doing everything in a single UPDATE
  const result = await db
    .update(users)
    .set({
      queryCountToday: sql`CASE
        WHEN ${users.lastQueryDate} != ${today} THEN 1
        ELSE ${users.queryCountToday} + 1
      END`,
      lastQueryDate: today,
    })
    .where(eq(users.id, userId))
    .returning({ newCount: users.queryCountToday });

  const newCount = result[0]?.newCount ?? 1;

  return {
    allowed: newCount <= limit,
    newCount,
  };
}
```

**Key Properties**:
- Single database transaction
- Increment happens first (no race window)
- Returns both the new count and whether it's allowed
- Handles day rollover atomically

### 2. Updated Query Router (`server/routers/query.ts`)

```typescript
// SECURITY FIX: Use atomic increment-and-check to prevent TOCTOU race condition
// Get tier limit for atomic check
const features = await getUserTierFeatures(ctx.user.id);
const tierLimit = features.dailyQueryLimit;

// Skip atomic check if unlimited (Infinity)
if (tierLimit !== Infinity) {
  const { allowed, newCount } = await db.incrementAndCheckQueryLimit(ctx.user.id, tierLimit);
  if (!allowed) {
    return {
      success: false,
      error: `Daily query limit (${tierLimit}) exceeded. Current count: ${newCount}. Upgrade to Pro for unlimited queries.`,
      response: null,
    };
  }
}

// ... process query ...

// Note: Query count already incremented atomically before query execution
// This prevents TOCTOU race condition where parallel requests could exceed limits
```

### 3. Exported Function (`server/db/index.ts`)

```typescript
export {
  // ... other exports ...
  incrementAndCheckQueryLimit,
} from "./users-usage";
```

## Security Impact

### Before Fix
- 5 parallel requests at 9/10 limit → All succeed → 14/10 queries
- Users could abuse free tier for unlimited queries
- No cost control for API usage

### After Fix
- 5 parallel requests at 9/10 limit → Only 1 succeeds → 10/10 queries
- Race condition eliminated at database level
- Proper enforcement of tier limits

## Database Behavior

The atomic operation increments the count **before** checking the limit. This means:

1. Request arrives with user at 9/10 queries
2. Database atomically increments to 10
3. Function returns `{ allowed: true, newCount: 10 }`
4. Query is processed

If a parallel request arrives:
1. Database atomically increments to 11
2. Function returns `{ allowed: false, newCount: 11 }`
3. Request is rejected before processing

The counter will reflect attempted requests (11) even though only 10 were allowed. This is intentional and provides accurate rate limiting.

## Testing

Comprehensive test suite created: `tests/query-limit-race-condition.test.ts`

Test cases include:
- ✅ Atomic increment and check
- ✅ Preventing limit bypass
- ✅ Parallel request race conditions
- ✅ Edge case at exact limit
- ✅ Day rollover behavior
- ✅ TOCTOU attack simulation (10 parallel requests at 9/10 limit)

## Files Modified

1. `/Users/tanner-osterkamp/Protocol Guide Manus/server/db/users-usage.ts`
   - Added `incrementAndCheckQueryLimit()` function (lines 105-151)

2. `/Users/tanner-osterkamp/Protocol Guide Manus/server/routers/query.ts`
   - Replaced separate check/increment with atomic operation (lines 57-72)
   - Removed redundant increment call (line 184-185)
   - Added import for `getUserTierFeatures` (line 20)

3. `/Users/tanner-osterkamp/Protocol Guide Manus/server/db/index.ts`
   - Exported `incrementAndCheckQueryLimit` (line 44)

4. `/Users/tanner-osterkamp/Protocol Guide Manus/tests/query-limit-race-condition.test.ts`
   - Created comprehensive test suite (new file, 320 lines)

## Performance Impact

**Positive Impact**:
- Eliminated separate SELECT + UPDATE operations
- Single UPDATE operation is faster than SELECT then UPDATE
- Reduced network round trips to database
- Better database lock contention (shorter lock duration)

**No Negative Impact**:
- Same number of database calls (1 instead of 2)
- Same transaction isolation level
- No additional indexes needed

## Recommendations

1. **Deploy Immediately**: This is a high-severity security issue
2. **Monitor Metrics**: Track rejected requests at limit to detect abuse attempts
3. **Audit Logs**: Consider logging when users hit the limit with parallel requests
4. **Rate Limiting**: Consider adding application-level rate limiting as defense-in-depth
5. **Schema Fix**: Fix the unrelated `boolean()` import issue in `drizzle/schema.ts` line 296

## References

- **TOCTOU Attacks**: https://owasp.org/www-community/vulnerabilities/Time_of_check_to_time_of_use
- **Database Atomicity**: https://en.wikipedia.org/wiki/Atomicity_(database_systems)
- **Race Condition Security**: https://cwe.mitre.org/data/definitions/367.html

## Verification

To verify the fix is working:

```bash
# Run the security test suite
npm test query-limit-race-condition.test.ts

# Check that atomic function exists
grep -n "incrementAndCheckQueryLimit" server/db/users-usage.ts

# Verify query router uses atomic function
grep -n "incrementAndCheckQueryLimit" server/routers/query.ts
```

## Rollback Plan

If issues arise:

1. Revert changes to `server/routers/query.ts`
2. Use previous check-then-increment pattern
3. Add application-level locking as temporary mitigation

**Note**: Rollback reintroduces the security vulnerability. Only rollback if critical production issue occurs, and fix forward as soon as possible.
