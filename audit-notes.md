# Protocol Guide Audit Notes

## Home Page Observations (Jan 17, 2026)

### Issues Found:
1. **Stats not loading** - Shows "Search ... protocols across ... agencies" instead of actual numbers (55,056 protocols, 2,738 agencies)
2. **Recent searches not visible** - The RecentSearches component was added but doesn't appear on the home page
3. **State selector shows "Select State"** - Need to verify if clicking it loads the state list

### Working:
- Tab navigation visible (Home, Coverage, History, Profile)
- Search input field present
- Basic layout renders correctly

## Critical Bug Found and FIXED:
**Search was broken** - The home page was calling `/api/search/semantic` but the Rust server uses `/api/search`.

**FIX APPLIED:** Changed the search URL from `/api/search/semantic` to `/api/search`.

**Search now works!** Returns 10 protocols for "cardiac arrest" query with proper results display.

## State Selector - WORKING:
- State dropdown opens correctly
- Shows all 50+ states with protocol counts
- California shows 10,927 protocols
- Selecting a state shows cascading Agency filter
- Stats now show correctly: "Search 55,056 protocols across 2,738 agencies"

## Next Tests:
- Check if search works without state filter
- Check Coverage tab for data
- Check Profile tab for sign-in functionality
- Debug why search is failing
