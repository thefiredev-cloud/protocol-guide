# Routers.ts County Filtering Update Plan

## Current State Analysis

The county filtering is currently disabled across three key endpoints in `server/routers.ts`:

1. **search.semantic** (lines 70-108)
2. **searchByAgency** (lines 158-190)
3. **query.submit** (lines 195-297)

### Problem
The frontend sends MySQL-based county IDs (from the `counties` table), but Supabase uses different agency IDs in the `manus_agencies` and `manus_protocol_chunks` tables. This ID mismatch causes filtering to fail, so it's currently disabled with `agencyId: null`.

### Root Cause
- **Frontend Layer**: Uses MySQL county IDs from `db.getAllCounties()` / `db.getCountyById()`
- **Backend Layer**: Supabase protocols database uses its own agency IDs
- **No Mapping**: No mapping table exists between MySQL county IDs and Supabase agency IDs

## Solution Strategy

Instead of mapping IDs, **use name-based filtering**:
1. Accept county/agency ID from frontend (MySQL-based)
2. Look up the county/agency details (name, state) from MySQL
3. Pass **name and state** to semantic search instead of ID
4. Update `semanticSearchProtocols()` to filter by name/state

This approach avoids the need for a mapping table and leverages existing data.

---

## Required Changes

### 1. Update `search.semantic` Endpoint (Lines 70-108)

**Current Implementation:**
```typescript
semantic: publicProcedure
  .input(z.object({
    query: z.string().min(1).max(500),
    countyId: z.number().optional(),  // ← Not used
    limit: z.number().min(1).max(50).default(10),
    stateFilter: z.string().optional(),  // ← Not used
  }))
  .query(async ({ input }) => {
    const results = await semanticSearchProtocols({
      query: input.query,
      agencyId: null,  // ← Disabled
      stateCode: null, // ← Disabled
      limit: input.limit,
      threshold: 0.3,
    });
    // ... rest of implementation
  })
```

**Proposed Changes:**
1. Keep `countyId` optional (for backward compatibility)
2. When `countyId` is provided:
   - Look up county details: `const county = await db.getCountyById(input.countyId);`
   - Extract agency name and state: `const agencyName = county?.name; const stateName = county?.state;`
3. Pass agency name to semantic search:
   ```typescript
   const results = await semanticSearchProtocols({
     query: input.query,
     agencyName: agencyName || null,  // ← Pass name instead of ID
     stateName: stateName || null,    // ← Pass state name
     limit: input.limit,
     threshold: 0.3,
   });
   ```
4. Remove `stateFilter` from input (replace with county-derived state)
5. Update comments to reflect name-based filtering

**Expected Outcome:**
- When `countyId` is provided, results are filtered to that specific agency
- When `countyId` is not provided, returns results from all agencies
- State filtering handled automatically via county lookup

---

### 2. Update `searchByAgency` Endpoint (Lines 158-190)

**Current Implementation:**
```typescript
searchByAgency: publicProcedure
  .input(z.object({
    query: z.string().min(1).max(500),
    agencyId: z.number(),  // ← MySQL-based ID
    limit: z.number().min(1).max(50).default(10),
  }))
  .query(async ({ input }) => {
    const results = await semanticSearchProtocols({
      query: input.query,
      agencyId: null,  // ← Disabled
      limit: input.limit,
      threshold: 0.3,
    });
    // ... rest of implementation
  })
```

**Proposed Changes:**
1. Rename input parameter from `agencyId` to `countyId` for consistency (or keep `agencyId` if frontend already uses it)
2. Look up agency details:
   ```typescript
   const county = await db.getCountyById(input.agencyId);
   if (!county) {
     return {
       results: [],
       totalFound: 0,
       query: input.query,
       error: 'Agency not found',
     };
   }
   ```
3. Pass agency name to semantic search:
   ```typescript
   const results = await semanticSearchProtocols({
     query: input.query,
     agencyName: county.name,  // ← Use name-based filter
     stateName: county.state,  // ← Include state for accuracy
     limit: input.limit,
     threshold: 0.3,
   });
   ```
4. Update comments to reflect name-based filtering

**Expected Outcome:**
- Results are always filtered to the specific agency
- Returns empty array with error if agency ID doesn't exist
- More precise filtering using both agency name and state

---

### 3. Update `query.submit` Endpoint (Lines 195-297)

**Current Implementation:**
```typescript
submit: protectedProcedure
  .input(z.object({
    countyId: z.number(),
    queryText: z.string().min(1).max(1000),
  }))
  .mutation(async ({ ctx, input }) => {
    // ... usage checks ...

    // Get agency name for context
    const county = await db.getCountyById(input.countyId);
    const agencyName = county?.name || 'Unknown Agency';

    try {
      // Semantic search with Voyage AI embeddings
      // NOTE: County filter disabled - MySQL IDs don't match Supabase agency_ids
      const searchResults = await semanticSearchProtocols({
        query: input.queryText,
        agencyId: null,  // ← Disabled
        limit: 10,
        threshold: 0.3,
      });

      // ... Claude invocation and response handling ...
    }
  })
```

**Proposed Changes:**
1. County lookup already exists (line 218), so we have the data
2. Pass agency name and state to semantic search:
   ```typescript
   const searchResults = await semanticSearchProtocols({
     query: input.queryText,
     agencyName: county?.name || null,  // ← Enable name-based filter
     stateName: county?.state || null,  // ← Include state
     limit: 10,
     threshold: 0.3,
   });
   ```
3. Update comment to reflect that filtering is now enabled
4. Consider handling the case where `county` is null:
   ```typescript
   if (!county) {
     return {
       success: false,
       error: "Invalid county selected. Please select a county from the list.",
       response: null,
     };
   }
   ```

**Expected Outcome:**
- Query results are scoped to the user's selected county
- More relevant protocol matches for location-specific queries
- Better user experience with county-specific responses

---

## Dependencies & Related Files

### Files That Need Updates
1. **server/routers.ts** (primary changes above)
2. **server/_core/embeddings.ts** - Update `semanticSearchProtocols()` function signature
   - Change `agencyId?: number | null` to `agencyName?: string | null`
   - Add `stateName?: string | null` parameter
   - Update Supabase query to filter by agency name instead of ID

### Database Schema Verification Needed
Before implementing, verify the following in Supabase:
1. **manus_agencies table**:
   - Has `name` column (agency name)
   - Has `state` column (state name or abbreviation)

2. **manus_protocol_chunks table**:
   - Has `agency_id` column that references `manus_agencies.id`
   - Can join to agencies table to get agency name

3. **Search RPC function** (`search_manus_protocols`):
   - If using a stored procedure, may need to update it to accept agency_name parameter
   - Or modify the query in `embeddings.ts` to join and filter by name

### Frontend Considerations
**No frontend changes needed** - all changes are backend-only:
- Frontend continues to send MySQL-based `countyId` values
- Backend translates county ID to name for Supabase filtering
- This maintains backward compatibility

---

## Implementation Steps

### Phase 1: Update Embeddings Function
1. Read `server/_core/embeddings.ts`
2. Update `semanticSearchProtocols()` function signature:
   - Replace `agencyId?: number | null` with `agencyName?: string | null`
   - Add `stateName?: string | null`
3. Update Supabase query logic:
   - Join with `manus_agencies` table
   - Filter by agency name (exact match or ILIKE for fuzzy)
   - Optionally filter by state for accuracy
4. Test the updated function independently

### Phase 2: Update Routers
1. Update `search.semantic`:
   - Add county lookup when `countyId` provided
   - Pass `agencyName` and `stateName` to embeddings function
   - Update comments
2. Update `searchByAgency`:
   - Add county lookup with error handling
   - Pass `agencyName` and `stateName` to embeddings function
   - Update comments
3. Update `query.submit`:
   - Use existing county lookup
   - Pass `agencyName` and `stateName` to embeddings function
   - Add null check for invalid county
   - Update comments

### Phase 3: Testing
1. **Unit Tests**: Test each endpoint with various county IDs
2. **Integration Tests**: Test full flow from frontend to results
3. **Edge Cases**:
   - Invalid county ID
   - County with no protocols in Supabase
   - Name matching (exact vs fuzzy)
   - State filtering accuracy
4. **Performance**: Verify query times remain under 3-5 second goal

### Phase 4: Documentation
1. Update API documentation with new filtering behavior
2. Add comments explaining name-based approach
3. Document any naming conventions or edge cases discovered

---

## Risk Assessment

### Low Risk
- **Backward Compatible**: Frontend doesn't change, only backend logic
- **Graceful Degradation**: If county lookup fails, can still return unfiltered results
- **Type Safe**: Using existing TypeScript types and Zod validation

### Medium Risk
- **Name Matching**: Agency names in MySQL vs Supabase might not match exactly
  - **Mitigation**: Use case-insensitive matching (ILIKE) or fuzzy matching
  - **Mitigation**: Include state filtering to reduce false positives
- **Performance**: Adding county lookup adds 1 DB query per request
  - **Mitigation**: County lookups are fast (indexed by ID)
  - **Mitigation**: Could add caching layer if needed

### High Risk
- **Data Quality**: If agency names differ between MySQL and Supabase, filtering will fail
  - **Mitigation**: Run data quality audit before implementation
  - **Mitigation**: Create name normalization function if needed
  - **Mitigation**: Log failed matches for monitoring

---

## Success Metrics

### Functional
- [ ] County filtering works in `search.semantic` endpoint
- [ ] Agency filtering works in `searchByAgency` endpoint
- [ ] County filtering works in `query.submit` endpoint
- [ ] Invalid county IDs handled gracefully
- [ ] Results are correctly scoped to selected county/agency

### Performance
- [ ] Response times remain under 5 seconds (p95)
- [ ] County lookup adds < 50ms to request time
- [ ] No increase in database connection issues

### Quality
- [ ] All TypeScript types updated correctly
- [ ] All comments reflect new implementation
- [ ] Test coverage for county filtering scenarios
- [ ] No breaking changes to frontend API

---

## Next Steps

1. **Review This Plan**: Confirm approach with team/stakeholders
2. **Data Audit**: Verify agency name consistency between MySQL and Supabase
3. **Update Embeddings**: Implement changes to `server/_core/embeddings.ts`
4. **Update Routers**: Implement changes to `server/routers.ts`
5. **Test Thoroughly**: Run through all test cases
6. **Deploy**: Push to staging, test, then production
7. **Monitor**: Watch logs for any name matching issues

---

## Questions to Resolve Before Implementation

1. **Agency Name Format**: Are agency names in MySQL and Supabase identical?
   - Example: "Los Angeles County EMS" vs "Los Angeles County" vs "LA County EMS"

2. **State Format**: Does Supabase use state abbreviations (CA) or full names (California)?

3. **Fuzzy Matching**: Should we use exact match or fuzzy matching (ILIKE, Levenshtein)?

4. **Caching**: Should we cache county lookups to reduce DB calls?

5. **Fallback Behavior**: If agency name not found in Supabase, should we:
   - Return empty results?
   - Return all results with warning?
   - Try fuzzy matching?

---

## Appendix: Code Snippets

### Example County Lookup Pattern
```typescript
// Reusable pattern for all three endpoints
const county = await db.getCountyById(input.countyId);
if (!county) {
  // Handle missing county
  return { error: 'County not found', results: [] };
}

const results = await semanticSearchProtocols({
  query: input.query,
  agencyName: county.name,
  stateName: county.state,
  limit: input.limit,
  threshold: 0.3,
});
```

### Example Embeddings Function Update
```typescript
// Before
export async function semanticSearchProtocols(params: {
  query: string;
  agencyId?: number | null;  // ← ID-based
  stateCode?: string | null;
  limit?: number;
  threshold?: number;
}) {
  // ... implementation
}

// After
export async function semanticSearchProtocols(params: {
  query: string;
  agencyName?: string | null;  // ← Name-based
  stateName?: string | null;   // ← State for accuracy
  limit?: number;
  threshold?: number;
}) {
  // ... implementation with name filtering
}
```

---

**Document Created**: 2026-01-20
**Status**: Awaiting Approval
**Estimated Effort**: 4-6 hours (including testing)
