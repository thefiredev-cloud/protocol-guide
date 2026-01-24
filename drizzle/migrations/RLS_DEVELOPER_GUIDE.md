# RLS Developer Quick Reference

## Overview
Row Level Security (RLS) policies are automatically enforced at the database level. This guide helps developers understand how to work with RLS in application code.

---

## Key Concepts

### 1. RLS is Transparent
RLS policies filter queries automatically. You don't need to add `WHERE user_id = currentUser` clauses - the database handles this.

### 2. Service Role Bypasses RLS
Backend operations use the service role key which has full access. Frontend uses anon/authenticated keys which are restricted by RLS.

### 3. Supabase Auth Integration
RLS policies use `auth.uid()` which is automatically set from the JWT token sent with each request.

---

## Supabase Client Setup

### Frontend (RLS Enforced)
```typescript
import { createClient } from '@supabase/supabase-js';

// Uses anon key - RLS policies apply
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// After user logs in, auth.uid() is automatically set
const { data: user } = await supabase.auth.getUser();

// This query is automatically filtered to current user's data
const { data: queries } = await supabase
  .from('queries')
  .select('*');
// Returns only queries where user_id matches current user
```

### Backend/Server (Service Role - Bypasses RLS)
```typescript
import { createClient } from '@supabase/supabase-js';

// Uses service_role key - bypasses RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// This returns ALL queries (not filtered by RLS)
const { data: allQueries } = await supabase
  .from('queries')
  .select('*');
```

---

## Common Patterns

### 1. Reading User's Own Data
```typescript
// ✅ GOOD - RLS automatically filters to current user
const { data: bookmarks } = await supabase
  .from('bookmarks')
  .select('*');

// ❌ BAD - Redundant filter (RLS already does this)
const { data: bookmarks } = await supabase
  .from('bookmarks')
  .select('*')
  .eq('user_id', currentUserId);
```

### 2. Creating User Data
```typescript
// ✅ GOOD - Include user_id from current session
const { data, error } = await supabase
  .from('queries')
  .insert({
    user_id: currentUserId, // Get from auth session
    county_id: selectedCounty,
    query_text: userQuery
  });

// RLS policy verifies user_id matches auth.uid()
```

### 3. Agency-Scoped Data
```typescript
// ✅ GOOD - RLS automatically filters to user's agencies
const { data: protocols } = await supabase
  .from('protocol_versions')
  .select('*')
  .eq('agency_id', selectedAgencyId);

// RLS ensures user is a member of selectedAgencyId
```

### 4. Admin Operations (Frontend)
```typescript
// ✅ GOOD - RLS checks if user has admin role
const { data: allFeedback } = await supabase
  .from('feedback')
  .select('*');

// If user is admin: returns all feedback
// If user is regular: returns only their feedback
```

### 5. Public Data
```typescript
// ✅ GOOD - No auth required for public tables
const { data: counties } = await supabase
  .from('counties')
  .select('*');

// Works for anon and authenticated users
```

---

## Authentication Patterns

### 1. Get Current User ID
```typescript
// Frontend
const { data: { user } } = await supabase.auth.getUser();
const supabaseId = user?.id; // This is the auth.uid()

// Get internal user ID
const { data: userData } = await supabase
  .from('users')
  .select('id')
  .eq('supabase_id', supabaseId)
  .single();

const userId = userData.id;
```

### 2. Check User Role
```typescript
const { data: { user } } = await supabase.auth.getUser();

const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('supabase_id', user.id)
  .single();

const isAdmin = userData.role === 'admin';
```

### 3. Check Agency Membership
```typescript
const { data: membership } = await supabase
  .from('agency_members')
  .select('role')
  .eq('agency_id', agencyId)
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

const isAgencyAdmin = membership?.role in ['owner', 'admin'];
```

---

## Error Handling

### 1. RLS Policy Violation
```typescript
const { data, error } = await supabase
  .from('audit_logs')
  .select('*');

if (error) {
  // Error may occur if user doesn't have access
  // RLS typically returns empty result instead of error
  console.error('Access denied or query error:', error);
}
```

### 2. Insert with Invalid user_id
```typescript
// ❌ BAD - Trying to insert for different user
const { data, error } = await supabase
  .from('queries')
  .insert({
    user_id: differentUserId, // RLS will reject this
    query_text: 'test'
  });

// error.message: "new row violates row-level security policy"
```

### 3. Empty Results vs Access Denied
```typescript
const { data: queries, error } = await supabase
  .from('queries')
  .select('*');

// data = [] - User has no queries (or no access)
// error = null - RLS returns empty array, not error
```

---

## Backend/API Routes

### 1. Using Service Role for Admin Operations
```typescript
// app/api/admin/users/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Verify user is admin first
  const token = request.headers.get('authorization');

  // Validate admin token...

  // Use service role for admin operations
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users } = await supabase
    .from('users')
    .select('*');

  return Response.json({ users });
}
```

### 2. Using Authenticated User Context
```typescript
// app/api/queries/route.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  // RLS automatically filters to current user
  const { data: queries } = await supabase
    .from('queries')
    .select('*');

  return Response.json({ queries });
}
```

---

## Testing RLS in Development

### 1. Test as Different Users
```typescript
// Login as user1
await supabase.auth.signInWithPassword({
  email: 'user1@test.com',
  password: 'password'
});

// Query should return user1's data only
const { data } = await supabase.from('queries').select('*');
console.log('User1 queries:', data);

// Logout and login as user2
await supabase.auth.signOut();
await supabase.auth.signInWithPassword({
  email: 'user2@test.com',
  password: 'password'
});

// Query should return user2's data only
const { data: user2Data } = await supabase.from('queries').select('*');
console.log('User2 queries:', user2Data);
```

### 2. Test Anonymous Access
```typescript
// Ensure user is logged out
await supabase.auth.signOut();

// Try accessing user data (should be empty/error)
const { data: userData } = await supabase
  .from('users')
  .select('*');
console.log('Anon user data:', userData); // Should be empty

// Try accessing public data (should work)
const { data: counties } = await supabase
  .from('counties')
  .select('*');
console.log('Counties:', counties); // Should return data
```

### 3. Test Admin Access
```typescript
// Login as admin
await supabase.auth.signInWithPassword({
  email: 'admin@protocolguide.com',
  password: 'password'
});

// Should return all queries
const { data: allQueries } = await supabase
  .from('queries')
  .select('*');
console.log('All queries (admin):', allQueries);

// Should access audit logs
const { data: auditLogs } = await supabase
  .from('audit_logs')
  .select('*');
console.log('Audit logs:', auditLogs);
```

---

## Common Pitfalls

### ❌ Don't Manually Filter User Data
```typescript
// BAD - RLS already does this
const { data } = await supabase
  .from('bookmarks')
  .select('*')
  .eq('user_id', currentUserId);

// GOOD - Let RLS handle it
const { data } = await supabase
  .from('bookmarks')
  .select('*');
```

### ❌ Don't Use Service Role in Frontend
```typescript
// VERY BAD - Exposes service role key to browser
const supabase = createClient(
  publicUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // NEVER do this
);
```

### ❌ Don't Assume Empty Results Mean Error
```typescript
// BAD - Empty results are normal
const { data } = await supabase.from('queries').select('*');
if (!data || data.length === 0) {
  throw new Error('Access denied'); // Wrong!
}

// GOOD - Check error object
const { data, error } = await supabase.from('queries').select('*');
if (error) {
  throw new Error('Database error: ' + error.message);
}
if (!data || data.length === 0) {
  console.log('No queries found'); // This is normal
}
```

### ❌ Don't Cache User Data Globally
```typescript
// BAD - User data can change, and RLS context matters
const cachedUserQueries = await supabase.from('queries').select('*');
// If user logs out/in, cache is stale

// GOOD - Fetch per-request or use React Query with proper invalidation
const { data: queries } = useQuery('user-queries', async () => {
  const { data } = await supabase.from('queries').select('*');
  return data;
});
```

---

## Performance Considerations

### 1. RLS Policies Use Indexes
The RLS policies are optimized with indexes on filter columns:
- `user_id` columns have indexes
- `agency_id` columns have indexes
- `supabase_id` column has index

### 2. Avoid N+1 Queries
```typescript
// ❌ BAD - N+1 query problem
const { data: agencies } = await supabase.from('agencies').select('*');
for (const agency of agencies) {
  const { data: members } = await supabase
    .from('agency_members')
    .select('*')
    .eq('agency_id', agency.id);
}

// ✅ GOOD - Use joins
const { data: agencies } = await supabase
  .from('agencies')
  .select(`
    *,
    agency_members(*)
  `);
```

### 3. Use Select Specific Columns
```typescript
// ❌ BAD - Fetches all columns
const { data } = await supabase.from('users').select('*');

// ✅ GOOD - Fetch only needed columns
const { data } = await supabase
  .from('users')
  .select('id, email, name, role');
```

---

## Debugging RLS Issues

### 1. Check Current User Auth State
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
console.log('Current user:', user);
console.log('Auth error:', error);

if (!user) {
  console.log('User is not authenticated');
}
```

### 2. Verify User's Internal ID
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('*')
  .eq('supabase_id', user.id)
  .single();

console.log('Internal user ID:', userData?.id);
console.log('User role:', userData?.role);
```

### 3. Check Agency Membership
```typescript
const { data: memberships } = await supabase
  .from('agency_members')
  .select('*, agencies(name, slug)')
  .eq('user_id', internalUserId);

console.log('User memberships:', memberships);
```

### 4. Test Service Role Query
```typescript
// In backend/API route only
const serviceSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data: allData } = await serviceSupabase
  .from('queries')
  .select('*');

console.log('Total queries (service role):', allData?.length);

// Compare with user query
const { data: userData } = await supabase
  .from('queries')
  .select('*');

console.log('User queries (RLS filtered):', userData?.length);
```

---

## Migration and Rollback

### Apply RLS Migration
```bash
# Run the migration
psql $DATABASE_URL -f drizzle/migrations/0027_add_row_level_security_policies.sql

# Test the policies
psql $DATABASE_URL -f drizzle/migrations/0027_test_rls_policies.sql
```

### Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Policies
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Support and Documentation

### Internal Resources
- Full RLS documentation: `RLS_POLICIES_DOCUMENTATION.md`
- Test suite: `0027_test_rls_policies.sql`
- Migration file: `0027_add_row_level_security_policies.sql`

### External Resources
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Last Updated:** 2026-01-23
**Migration:** 0027
