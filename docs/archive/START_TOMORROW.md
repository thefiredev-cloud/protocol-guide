# 🚀 Start Medic-Bot Locally - Quick Start Guide

## Current Status

✅ All work committed to git (commit `cbd8595`)
✅ UI spacing fixes applied (Send button has proper breathing room above nav bar)
✅ Supabase stopped cleanly (data backed up to Docker volume)
✅ Next.js dev servers stopped

## What Works Right Now

- **UI Layout**: Chat input controls properly spaced 88px above bottom nav bar (72px nav + 16px breathing room)
- **Supabase Migrations**: Simplified migration (006_protocol_foundation_simple.sql) ready to use
- **Test Validation**: STEMI scenario (10/10) and Epinephrine dosing (10/10) passing
- **File Organization**: Components reorganized into logical directories (chat/, layout/, protocols/, etc.)

## Quick Start (Tomorrow)

### 1. Start Supabase
```bash
cd /Users/tanner-osterkamp/Medic-Bot
supabase start
```

**Expected output:**
- API URL: `http://127.0.0.1:54321`
- GraphQL URL: `http://127.0.0.1:54321/graphql/v1`
- DB URL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio URL: `http://127.0.0.1:54323`
- Inbucket URL: `http://127.0.0.1:54324`

**Credentials (already in .env.local):**
- Anon key: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- Service role key: `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`

### 2. Start Next.js Dev Server
```bash
PORT=3002 npm run dev
```

**Expected:**
- Server running at: `http://localhost:3002`
- Hot reload enabled
- TypeScript checking active

### 3. Verify Everything Works
Open browser to `http://localhost:3002` and check:

**Visual Verification:**
- [ ] Send button has clear space above bottom nav bar (not cramped)
- [ ] 16px breathing room visible between input controls and nav bar
- [ ] All 5 nav tabs visible (Chat, Dosing, Protocols, Base, Scene)
- [ ] No UI element overlap

**Functional Verification:**
```bash
# Check API health
curl http://localhost:3002/api/health/quick

# Check Supabase connection
curl http://127.0.0.1:54321/rest/v1/
```

## Test Scenarios (Optional)

Run the validated test scenarios:

```bash
# Manual testing
# 1. Complex STEMI scenario (should correctly identify hypotension contraindication)
# 2. Epinephrine dosing (should return correct dose/route/concentration)

# See full scenarios in:
cat TEST_SCENARIOS.md
```

## Current State Snapshot

### Environment
- **Working Directory**: `/Users/tanner-osterkamp/Medic-Bot`
- **Git Branch**: `main`
- **Last Commit**: `cbd8595` (UI spacing fixes and comprehensive system setup)
- **Database**: Empty (migrations applied but no data loaded)

### Active Configuration Files
1. **`.env.local`** (local Supabase credentials)
2. **`supabase/config.toml`** (Supabase project config)
3. **`next.config.mjs`** (Next.js configuration)

### Key Files Modified Today
1. [app/globals.css:669](app/globals.css#L669) - Input row bottom offset (88px)
2. [app/components/chat/chat-input-styles.css:200](app/components/chat/chat-input-styles.css#L200) - Control padding (20px bottom)
3. [app/globals.css:603](app/globals.css#L603) - Container padding (280px)

## What's NOT Done (Future Work)

### Database Population
Database exists but is empty. To populate:

```bash
# Migrate protocols to database (optional - file-based fallback works)
node scripts/migrate-protocols-to-db.mjs

# Generate embeddings (optional - requires OpenAI API key)
node scripts/generate-embeddings.mjs
```

**Note**: System works WITHOUT database population via file-based fallback in `lib/retrieval.ts`

### Remaining Test Scenarios
3 of 5 test scenarios not yet validated:
- Basic protocol lookup
- Vague query handling
- Pediatric dosing calculation

See [TEST_SCENARIOS.md](TEST_SCENARIOS.md) for details.

### Documentation Files Not Committed
Excluded from commit due to API key placeholders (false positives):
- `docs/LOCAL_SETUP.md`
- `docs/LOCAL_DEVELOPMENT_COMPLETE_GUIDE.md`
- `QUICK_START_DATABASE.md`
- `PROTOCOL_REPOSITORY_IMPLEMENTATION.md`
- `data/protocol-metadata.json`

These files exist locally but aren't in git.

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill

# Or use different port
PORT=3003 npm run dev
```

### Supabase Already Running
```bash
# Check status
supabase status

# Stop if needed
supabase stop

# Restart
supabase start
```

### Database Connection Issues
```bash
# Check Supabase logs
supabase logs

# Verify migration status
supabase db reset  # WARNING: Destroys data
```

## Layout Reference

Current UI stack (bottom to top):
```
┌─────────────────────────────────────┐
│    Content Area (280px padding)     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Input Row - Send/Voice/Narrative   │  ← 88px from bottom
│     (16px 16px 20px padding)        │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│    BREATHING ROOM (16px)            │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   Mobile Nav Bar (72px height)      │  ← 0px from bottom
└─────────────────────────────────────┘
```

## Documentation Quick Links

- **UI Fix Summary**: [UI_SPACING_FIXED.md](UI_SPACING_FIXED.md)
- **Test Scenarios**: [TEST_SCENARIOS.md](TEST_SCENARIOS.md)
- **Testing Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Database Schema**: `supabase/migrations/006_protocol_foundation_simple.sql`

## Session Notes

**What was accomplished today:**
1. Fixed Send button overlapping bottom navigation (2 iterations for perfect spacing)
2. Set up local Supabase environment with simplified migrations
3. Validated 2 critical test scenarios (STEMI + Epinephrine)
4. Reorganized component file structure
5. Added comprehensive validation pipeline and error recovery
6. Committed 155 files (101,959 insertions)

**Next session priorities:**
1. Verify UI spacing looks good on device
2. Test remaining 3 scenarios
3. Consider populating database (optional - fallback works)
4. Review documentation files excluded from commit

---

**Status**: ✅ Ready to start fresh tomorrow
**Estimated startup time**: 2-3 minutes (Supabase + Next.js)
**No blockers**: All systems operational
