# Protocol Guide Manus - Frontend Fixes

## Issues Fixed

### 1. Search Component (app/(tabs)/search.tsx)
**Problem**: Using `useQuery` with `enabled: false` and manual `refetch()` causing unreliable search behavior.

**Fix**: Changed to use `trpcUtils.search.semantic.fetch()` pattern for imperative queries, which is the correct approach for user-triggered searches.

**Changes**:
- Replaced `searchMutation` with manual state management (`isSearching`, `searchError`)
- Added proper try-catch error handling
- Added error display UI with clear error messages
- Now properly handles network failures and shows user-friendly error messages

### 2. API Base URL Configuration (constants/oauth.ts)
**Problem**: URL derivation logic didn't handle localhost:8081 -> localhost:3000 correctly.

**Fix**: Added explicit localhost detection and better logging.

**Changes**:
- Added localhost:8081 detection to map to localhost:3000
- Added comprehensive console logging to debug URL resolution
- Improved fallback logic for different deployment environments

### 3. tRPC Client Configuration (lib/trpc.ts)
**Problem**: No logging or error handling for failed requests.

**Fix**: Added comprehensive logging and error handling.

**Changes**:
- Added console logging for client creation
- Added request/response logging
- Added error handling for failed HTTP requests
- Better error messages for debugging

## Verification Steps

1. **Start the dev server**:
   ```bash
   cd ~/Protocol\ Guide\ Manus
   pnpm dev
   ```

2. **Check browser console** (http://localhost:8081):
   - Should see: `[OAuth] Using API_BASE_URL from env: http://localhost:3000`
   - Should see: `[tRPC] Creating client with URL: http://localhost:3000/api/trpc`

3. **Test search functionality**:
   - Go to Search tab
   - Enter a query like "cardiac arrest"
   - Click "Search Protocols"
   - Should see results or clear error messages

4. **Check for errors**:
   - Open browser DevTools (F12)
   - Check Console tab for any red errors
   - Check Network tab to see API requests going to http://localhost:3000

## Environment Variables

Ensure `.env` has:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Expected Behavior

### Success Case
1. User enters search query
2. Console shows: `[tRPC] Fetching: http://localhost:3000/api/trpc/search.semantic?...`
3. Results appear in ~2-5 seconds
4. Protocol cards display with relevance scores

### Error Case
1. User enters search query
2. If backend is down, shows: "Search failed. Please check your connection and try again."
3. Error displays in red banner with warning icon
4. Console shows detailed error for debugging

## Files Modified

1. `/Users/tanner-osterkamp/Protocol Guide Manus/app/(tabs)/search.tsx`
   - Lines 53-94: Changed search pattern from useQuery to fetch
   - Lines 532-560: Added error display and updated loading states

2. `/Users/tanner-osterkamp/Protocol Guide Manus/constants/oauth.ts`
   - Lines 32-64: Improved getApiBaseUrl() with localhost detection and logging

3. `/Users/tanner-osterkamp/Protocol Guide Manus/lib/trpc.ts`
   - Lines 21-56: Added logging and error handling to tRPC client

## Testing Checklist

- [ ] Search works with backend running
- [ ] Error message appears when backend is stopped
- [ ] Console logs show correct API URL (http://localhost:3000)
- [ ] Network tab shows requests to correct endpoints
- [ ] State filter works correctly
- [ ] Results display with proper formatting
- [ ] Protocol detail view works when tapping results

## Common Issues

### "Search failed" even with backend running
- Check console for `[tRPC]` logs to see actual URL being used
- Verify EXPO_PUBLIC_API_BASE_URL is set correctly
- Restart dev server to pick up env changes

### CORS errors
- Backend should allow localhost:8081
- Check server/_core/index.ts for CORS configuration

### Empty results
- Not an error - database may not have protocols matching query
- Try broader terms like "cardiac" or "seizure"
