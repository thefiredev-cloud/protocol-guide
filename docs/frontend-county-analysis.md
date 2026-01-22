# Frontend County Selection Flow Analysis

**Date**: 2026-01-20
**Purpose**: Document current county/agency selection architecture and migration path from MySQL to Supabase

---

## Executive Summary

The Protocol Guide Manus frontend currently uses a **MySQL counties table** for county selection, but the search backend queries **Supabase manus_protocol_chunks** which references **Supabase manus_agencies**. This creates an ID mismatch preventing proper filtering.

**Key Issue**: MySQL county IDs do not map to Supabase agency_ids, causing all county/agency filters to be disabled in search queries.

---

## 1. Current County Selection Architecture

### 1.1 Component Hierarchy

```
CountySelector Component (components/county-selector.tsx)
    ↓
App Context (lib/app-context.tsx)
    ↓
Search Screens (app/(tabs)/index.tsx, app/(tabs)/search.tsx)
    ↓
tRPC Backend (server/routers.ts)
    ↓
Database Layer (server/db.ts)
```

### 1.2 Data Flow

```
User selects county in modal
    ↓
County saved to AsyncStorage + App Context
    ↓
Search queries include countyId
    ↓
Backend receives countyId but IGNORES it
    ↓
Search queries Supabase without agency filter
```

---

## 2. Components Using County Selection

### 2.1 County Selector Component

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/components/county-selector.tsx`

**Key Features**:
- Modal-based selection UI
- Search/filter by county name or state
- Groups counties by state
- Stores selection in app context
- Persists to AsyncStorage

**tRPC Call**:
```typescript
const { data, isLoading } = trpc.counties.list.useQuery(undefined, {
  enabled: visible,
});
```

**County Type**:
```typescript
type County = {
  id: number;              // MySQL county ID
  name: string;            // County/Agency name
  state: string;           // State name (e.g., "California")
  protocolVersion: string | null;
};
```

**Usage**:
- Triggered by `CountySelectorButton` in header
- Selected county stored in app context
- Persisted to AsyncStorage for next session

### 2.2 App Context

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/lib/app-context.tsx`

**State Management**:
```typescript
const [selectedCounty, setSelectedCounty] = useState<County | null>(null);

// Persists to AsyncStorage
const COUNTY_STORAGE_KEY = "protocol_guide_selected_county";
```

**Features**:
- Loads saved county on app mount
- Clears messages when county changes
- Provides `selectedCounty` to all child components

### 2.3 Home Screen (Quick Search)

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/app/(tabs)/index.tsx`

**County Usage**: NOT USED
- This screen uses **state + agency filters** instead
- State filter: `selectedState` (string)
- Agency filter: `selectedAgency` (Agency type with id, name, state, protocolCount)
- **Note**: Agency IDs here are also from MySQL, not Supabase

**Search Queries**:
```typescript
// State-based search
trpcUtils.search.semantic.fetch({
  query: text,
  limit: 3,
  stateFilter: selectedState || undefined,
});

// Agency-based search
trpcUtils.search.searchByAgency.fetch({
  query: text,
  agencyId: selectedAgency.id,  // MySQL ID, ignored by backend
  limit: 3,
});
```

### 2.4 Search Screen

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/app/(tabs)/search.tsx`

**County Usage**: NOT USED
- Uses **state filter only** (`selectedState`)
- No county/agency selection on this screen
- State filter works because backend queries Supabase by state name

**Search Query**:
```typescript
trpc.search.semantic.useQuery({
  query,
  limit: 20,
  stateFilter: selectedState || undefined
});
```

---

## 3. Backend County/Agency Handling

### 3.1 tRPC Counties Router

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/server/routers.ts`

**Endpoints**:

#### `counties.list`
```typescript
counties: router({
  list: publicProcedure.query(async () => {
    const counties = await db.getAllCounties();  // MySQL
    // Groups by state
    return { counties, grouped };
  }),
});
```

**Source**: MySQL `counties` table via Drizzle ORM

#### `counties.get`
```typescript
get: publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    return db.getCountyById(input.id);  // MySQL
  });
```

### 3.2 Search Router - The Problem

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/server/routers.ts` (lines 68-108)

```typescript
search: router({
  semantic: publicProcedure
    .input(z.object({
      query: z.string(),
      countyId: z.number().optional(),  // ❌ Accepted but ignored
      stateFilter: z.string().optional(),
      limit: z.number(),
    }))
    .query(async ({ input }) => {
      // NOTE: County filter disabled - MySQL IDs don't match Supabase
      const results = await semanticSearchProtocols({
        query: input.query,
        agencyId: null,  // ❌ DISABLED - input.countyId doesn't map
        stateCode: null, // ❌ DISABLED - no state_code in chunks
        limit: input.limit,
      });

      return { results: ... };
    }),
});
```

**Issues**:
1. ✅ Accepts `countyId` in input schema
2. ❌ Ignores `countyId` when calling Supabase
3. ❌ Passes `null` for `agencyId` filter
4. ❌ State filter also disabled (no `state_code` column)

### 3.3 Database Layer - MySQL Counties

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/server/db.ts`

**Functions**:

```typescript
// Returns all counties from MySQL
export async function getAllCounties() {
  const db = await getDb();
  return db.select().from(counties).orderBy(counties.state, counties.name);
}

// Returns single county by MySQL ID
export async function getCountyById(id: number) {
  const db = await getDb();
  const result = await db.select().from(counties)
    .where(eq(counties.id, id))
    .limit(1);
  return result[0];
}

// Returns agencies by state with protocol counts (MySQL)
export async function getAgenciesByState(state: string): Promise<AgencyInfo[]> {
  const db = await getDb();
  const results = await db.execute(sql`
    SELECT
      c.id,
      c.name,
      c.state,
      COUNT(pc.id) as protocol_count
    FROM counties c
    LEFT JOIN protocolChunks pc ON pc.countyId = c.id
    WHERE c.state = ${state}
    GROUP BY c.id, c.name, c.state
    ORDER BY protocol_count DESC, c.name ASC
  `);
  return results;
}
```

**MySQL Schema** (drizzle/schema.ts):
```typescript
export const counties = mysqlTable("counties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  state: varchar("state", { length: 64 }),
  usesStateProtocols: boolean("usesStateProtocols"),
  protocolVersion: varchar("protocolVersion", { length: 50 }),
  createdAt: timestamp("createdAt"),
});
```

### 3.4 Embeddings Layer - Supabase Agencies

**File**: `/Users/tanner-osterkamp/Protocol Guide Manus/server/_core/embeddings.ts`

**Semantic Search Function**:
```typescript
export async function semanticSearchProtocols(params: {
  query: string;
  agencyId?: number | null;      // ❌ Ignored due to ID mismatch
  stateCode?: string | null;     // ❌ No state_code column
  limit?: number;
  threshold?: number;
}): Promise<SearchResult[]> {

  // Generate embedding
  const queryEmbedding = await generateEmbedding(query);

  // Call Supabase RPC function
  const { data } = await supabase.rpc('search_manus_protocols', {
    query_embedding: queryEmbedding,
    agency_filter: agencyId ?? null,  // ❌ Always null
    state_filter: stateCode ?? null,  // ❌ Always null
    match_count: limit,
    match_threshold: threshold,
  });

  return data;
}
```

**Supabase Schema** (from analysis):

**manus_agencies table**:
```sql
CREATE TABLE public.manus_agencies (
    id INTEGER PRIMARY KEY,           -- ❌ Different from MySQL counties.id
    name TEXT NOT NULL,
    state_code CHAR(2) NOT NULL,      -- e.g., "CA", "NY"
    state_name TEXT NOT NULL,         -- e.g., "California", "New York"
    protocol_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**manus_protocol_chunks table**:
```sql
CREATE TABLE public.manus_protocol_chunks (
    id INTEGER PRIMARY KEY,
    agency_id INTEGER REFERENCES manus_agencies(id),  -- Links to Supabase agencies
    protocol_number TEXT,
    protocol_title TEXT,
    section TEXT,
    content TEXT,
    embedding VECTOR(1536),
    image_urls TEXT[],
    -- No state_code column
);
```

**RPC Function** (docs/update-search-rpc.sql):
```sql
CREATE OR REPLACE FUNCTION search_manus_protocols(
  query_embedding VECTOR(1536),
  agency_filter INTEGER,      -- Filter by agency_id
  state_filter TEXT,          -- ❌ No state_code to filter by
  match_count INTEGER,
  match_threshold FLOAT
)
RETURNS TABLE (
  id INTEGER,
  agency_id INTEGER,
  protocol_number TEXT,
  protocol_title TEXT,
  section TEXT,
  content TEXT,
  image_urls TEXT[],
  similarity FLOAT
)
```

---

## 4. The ID Mismatch Problem

### 4.1 Two Separate Databases

| Database | Table | ID Column | Record Count | Purpose |
|----------|-------|-----------|--------------|---------|
| **MySQL** | `counties` | `id` (auto-increment) | Unknown | User selection, auth |
| **Supabase** | `manus_agencies` | `id` (auto-increment) | 2,738 | Protocol ownership |

**Problem**: The IDs are generated independently and have no mapping between them.

Example:
```
MySQL: County ID 42 = "Los Angeles County, CA"
Supabase: Agency ID 42 = "Dallas Fire-Rescue, TX"
```

### 4.2 Current Workaround

**Comment in routers.ts (line 79)**:
```typescript
// NOTE: County filter disabled - MySQL county IDs don't match Supabase agency_ids
// TODO: Create mapping table between MySQL counties and Supabase agencies
```

**Result**: All county/agency filters are disabled. Users can select a county but it has no effect on search results.

### 4.3 State Filter Status

**State Name Filter**: ✅ Works (by matching state name strings)
**State Code Filter**: ❌ Broken (no `state_code` column in manus_protocol_chunks)
**Agency Filter**: ❌ Broken (ID mismatch)

---

## 5. What Needs to Change

### 5.1 Option A: Migrate Frontend to Supabase Agencies (Recommended)

**Change**: Fetch agencies directly from Supabase instead of MySQL counties.

**Benefits**:
- Single source of truth
- No ID mapping needed
- Direct filtering in search queries
- Can use state_code for efficient filtering
- Eliminates MySQL dependency for this feature

**Changes Required**:

#### 1. Create new tRPC router for Supabase agencies

**File**: `server/routers.ts`

```typescript
// Add new agencies router
agencies: router({
  // List all agencies from Supabase
  list: publicProcedure.query(async () => {
    const { data } = await supabase
      .from('manus_agencies')
      .select('id, name, state_code, state_name, protocol_count')
      .order('state_name', { ascending: true })
      .order('name', { ascending: true });

    // Group by state
    const grouped: Record<string, typeof data> = {};
    for (const agency of data || []) {
      const key = agency.state_name;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(agency);
    }

    return { agencies: data || [], grouped };
  }),

  // Get single agency by ID
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { data } = await supabase
        .from('manus_agencies')
        .select('*')
        .eq('id', input.id)
        .single();
      return data;
    }),

  // Get agencies by state
  byState: publicProcedure
    .input(z.object({ stateCode: z.string() }))
    .query(async ({ input }) => {
      const { data } = await supabase
        .from('manus_agencies')
        .select('*')
        .eq('state_code', input.stateCode)
        .order('name', { ascending: true });
      return data || [];
    }),
}),
```

#### 2. Update County Selector component

**File**: `components/county-selector.tsx`

```typescript
// Change type to match Supabase
type Agency = {
  id: number;              // Now matches Supabase agency_id
  name: string;
  state_code: string;      // Two-letter code (CA, NY, TX)
  state_name: string;      // Full name (California, New York, Texas)
  protocol_count: number;
};

// Change tRPC query
const { data, isLoading } = trpc.agencies.list.useQuery(undefined, {
  enabled: visible,
});

// Update filtering to use state_name instead of state
const filteredAgencies = useMemo(() => {
  if (!data?.agencies) return [];
  const query = searchQuery.toLowerCase().trim();
  if (!query) return data.agencies;

  return data.agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(query) ||
      agency.state_name.toLowerCase().includes(query) ||
      agency.state_code.toLowerCase().includes(query)
  );
}, [data?.agencies, searchQuery]);

// Update grouping to use state_name
const groupedAgencies = useMemo(() => {
  // Group by state_name instead of state
  const stateMap = new Map<string, Agency[]>();
  for (const agency of filteredAgencies) {
    const existing = stateMap.get(agency.state_name);
    if (existing) {
      existing.push(agency);
    } else {
      stateMap.set(agency.state_name, [agency]);
    }
  }
  // ... rest of grouping logic
}, [filteredAgencies]);
```

**Component Naming**: Consider renaming to `AgencySelector` for clarity.

#### 3. Update App Context

**File**: `lib/app-context.tsx`

```typescript
// Update type
type Agency = {
  id: number;
  name: string;
  state_code: string;
  state_name: string;
  protocol_count: number;
};

type AppContextType = {
  selectedAgency: Agency | null;      // Renamed from selectedCounty
  setSelectedAgency: (agency: Agency | null) => void;
  // ... rest of context
};

// Update storage key
const AGENCY_STORAGE_KEY = "protocol_guide_selected_agency";
```

#### 4. Update Home Screen

**File**: `app/(tabs)/index.tsx`

**Changes**:
- Import agency type from app-context
- Update to use `selectedAgency.id` (now matches Supabase)
- Update state filter to use `state_code` instead of `state_name`

```typescript
// Update imports
import { useAppContext } from "@/lib/app-context";

// In component
const { selectedAgency } = useAppContext();

// Update agency-based search to PASS the ID (it will work now!)
if (selectedAgency) {
  results = await trpcUtils.search.searchByAgency.fetch({
    query: text,
    agencyId: selectedAgency.id,  // ✅ Now matches Supabase
    limit: 3,
  });
}

// Update state filter queries
const { data: coverageData } = trpc.search.coverageByState.useQuery();
const { data: agenciesResult } = trpc.agencies.byState.useQuery(
  { stateCode: selectedStateCode },
  { enabled: !!selectedStateCode }
);
```

#### 5. Update Search Screen

**File**: `app/(tabs)/search.tsx`

```typescript
// Use state_code instead of state_name for filtering
const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);

// Update query to use state code
const searchMutation = trpc.search.semantic.useQuery({
  query,
  limit: 20,
  stateCode: selectedStateCode || undefined  // Changed from stateFilter
});
```

#### 6. Update Backend Search Router

**File**: `server/routers.ts`

```typescript
search: router({
  semantic: publicProcedure
    .input(z.object({
      query: z.string(),
      agencyId: z.number().optional(),
      stateCode: z.string().optional(),  // Change from stateFilter
      limit: z.number(),
    }))
    .query(async ({ input }) => {
      // ✅ Now we can pass filters!
      const results = await semanticSearchProtocols({
        query: input.query,
        agencyId: input.agencyId ?? null,      // ✅ Works now
        stateCode: input.stateCode ?? null,    // ✅ Works now
        limit: input.limit,
      });

      return { results };
    }),
});
```

#### 7. Add state_code column to manus_protocol_chunks

**File**: `docs/add-agency-columns.sql` (already created)

```sql
-- Add state_code for efficient filtering
ALTER TABLE public.manus_protocol_chunks
ADD COLUMN state_code CHAR(2);

-- Populate from manus_agencies
UPDATE public.manus_protocol_chunks pc
SET state_code = a.state_code
FROM public.manus_agencies a
WHERE pc.agency_id = a.id;

-- Make it NOT NULL after population
ALTER TABLE public.manus_protocol_chunks
ALTER COLUMN state_code SET NOT NULL;

-- Add index
CREATE INDEX idx_protocol_chunks_state_code
ON public.manus_protocol_chunks(state_code);
```

#### 8. Update RPC function to use state_code

**File**: `docs/update-search-rpc.sql` (already created)

Update the `search_manus_protocols` function to filter by state_code instead of state_filter.

### 5.2 Option B: Create ID Mapping Table (Not Recommended)

**Description**: Create a mapping table between MySQL counties and Supabase agencies.

**Why Not Recommended**:
- Adds complexity
- Requires manual maintenance
- Doesn't solve state_code issue
- Still requires MySQL dependency
- Two sources of truth for agency data

**If you must do this**:

```sql
CREATE TABLE county_agency_mapping (
  mysql_county_id INTEGER PRIMARY KEY,
  supabase_agency_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Then modify search queries to look up the mapping before querying Supabase.

### 5.3 Option C: Migrate Protocol Chunks to MySQL (Not Recommended)

**Description**: Move all protocols and embeddings from Supabase to MySQL.

**Why Not Recommended**:
- MySQL doesn't support vector similarity search efficiently
- Would require pg_vector extension (PostgreSQL only)
- Massive data migration effort
- Loses pgvector performance benefits
- Goes against project architecture (Supabase for protocols)

---

## 6. Migration Checklist

### Phase 1: Backend Changes
- [ ] Add `manus_agencies` tRPC router (server/routers.ts)
- [ ] Add state_code column to manus_protocol_chunks
- [ ] Update search_manus_protocols RPC function
- [ ] Enable agency filtering in semantic search
- [ ] Test API endpoints with Postman/Insomnia

### Phase 2: Frontend Changes
- [ ] Update County type to Agency type
- [ ] Update CountySelector component (rename to AgencySelector?)
- [ ] Update App Context (selectedCounty → selectedAgency)
- [ ] Update Home Screen agency filters
- [ ] Update Search Screen state filters
- [ ] Update all references to selectedCounty

### Phase 3: Data Migration
- [ ] Populate state_code in manus_protocol_chunks
- [ ] Verify all agencies have protocol_count
- [ ] Test filtering by agency_id
- [ ] Test filtering by state_code

### Phase 4: Testing
- [ ] Test agency selection in modal
- [ ] Test AsyncStorage persistence
- [ ] Test search with agency filter
- [ ] Test search with state filter
- [ ] Test across different states
- [ ] Verify protocol counts are accurate

### Phase 5: Cleanup
- [ ] Remove MySQL counties queries (if not used elsewhere)
- [ ] Update documentation
- [ ] Remove TODO comments about ID mapping
- [ ] Consider renaming "county" to "agency" throughout codebase

---

## 7. Search Query Flow After Migration

### Before (Current - Broken)
```
User selects "Los Angeles County" (MySQL ID 42)
    ↓
Stored in app context as selectedCounty
    ↓
Search query sends countyId: 42
    ↓
Backend IGNORES it (ID doesn't match Supabase)
    ↓
Searches ALL agencies (no filter)
```

### After (Proposed - Fixed)
```
User selects "Los Angeles County" (Supabase ID 128)
    ↓
Stored in app context as selectedAgency
    ↓
Search query sends agencyId: 128
    ↓
Backend USES it (ID matches Supabase manus_agencies.id)
    ↓
Searches only Los Angeles County protocols
    ↓
Returns filtered results
```

---

## 8. Additional Considerations

### 8.1 Protocol Counts

**Issue**: MySQL counties may have different protocol_count than Supabase agencies.

**Solution**: After migration, use Supabase protocol_count as source of truth. The manus_agencies table has a trigger that auto-updates protocol_count.

### 8.2 Agency vs County Terminology

**Current**: Uses "county" throughout UI
**Supabase**: Uses "agency" (more accurate - includes state agencies, fire departments, etc.)

**Recommendation**: Update UI text to use "Agency" or "Service Area" for clarity.

### 8.3 State Coverage Page

**File**: `app/(tabs)/coverage.tsx`

This page likely uses state coverage data. After migration:
- Use `trpc.search.coverageByState` (should already work)
- Update to use `state_code` instead of full state name
- Show agency counts per state

### 8.4 User Profile Page

**File**: `app/(tabs)/profile.tsx`

If this page shows selected county:
- Update to show selectedAgency
- Display state_code alongside name
- Show protocol_count if available

### 8.5 Query History

**MySQL Table**: `queries` table stores `countyId` (MySQL ID)

**After Migration**:
- Consider migrating to store `agencyId` (Supabase ID)
- OR keep for historical data and add new `agencyId` column
- Update query submission to use Supabase agency ID

---

## 9. Performance Implications

### Before Migration
- County list: Fast (MySQL, ~2,738 rows)
- Search: Fast (but no filtering by county)
- State filter: Works (by name matching)

### After Migration
- Agency list: Fast (Supabase, 2,738 rows with indexes)
- Search: Faster (filtered by agency_id or state_code)
- State filter: Faster (indexed state_code)
- Protocol retrieval: Much faster (proper filtering)

**Expected Improvement**:
- Search queries will return more relevant results
- Reduced result set when agency selected
- Better user experience with actual filtering

---

## 10. Testing Scenarios

### Test 1: Agency Selection
1. Open county/agency selector
2. Search for "Los Angeles"
3. Select agency
4. Verify stored in AsyncStorage
5. Verify persists after app restart

### Test 2: Agency-Filtered Search
1. Select "Los Angeles County"
2. Search for "cardiac arrest"
3. Verify results only from LA County
4. Switch to "New York City"
5. Verify results change

### Test 3: State-Filtered Search
1. Select state "California"
2. Search for "stroke protocol"
3. Verify results only from CA agencies
4. Clear state filter
5. Verify results from all states

### Test 4: No Filter Search
1. Deselect agency and state
2. Search for "asthma"
3. Verify results from all agencies nationwide

### Test 5: Protocol Counts
1. View agency list
2. Verify protocol_count shown
3. Select agency with 0 protocols
4. Search should return no results

---

## 11. Rollback Plan

If migration causes issues:

1. **Revert Frontend Changes**:
   - Restore original CountySelector component
   - Restore original App Context
   - Restore original search screens

2. **Keep Backend Compatible**:
   - Don't remove MySQL counties router
   - Add new agencies router alongside
   - Both can coexist during migration

3. **Feature Flag** (optional):
   ```typescript
   const USE_SUPABASE_AGENCIES = process.env.USE_SUPABASE_AGENCIES === 'true';

   const router = USE_SUPABASE_AGENCIES
     ? trpc.agencies.list
     : trpc.counties.list;
   ```

---

## 12. Timeline Estimate

| Phase | Duration | Complexity |
|-------|----------|------------|
| Backend changes | 2-3 hours | Medium |
| Frontend changes | 3-4 hours | Medium-High |
| Data migration | 1 hour | Low |
| Testing | 2-3 hours | Medium |
| Cleanup | 1 hour | Low |
| **Total** | **9-12 hours** | **Medium** |

---

## Summary

The county selection flow is well-structured but points to the wrong database. The migration to Supabase agencies is straightforward and will enable proper filtering. The key changes are:

1. Create new tRPC `agencies` router pointing to Supabase
2. Update frontend components to use Supabase agency IDs
3. Add state_code column for efficient filtering
4. Enable previously-disabled filters in search queries

**Result**: Users will finally get filtered search results based on their selected agency.
