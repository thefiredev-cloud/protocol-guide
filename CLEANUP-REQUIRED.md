# Protocol Guide - Cleanup Required

**Audit Date:** January 20, 2026
**Purpose:** Consolidate documentation and remove stale references

---

## 🚨 CRITICAL: Documentation Issues Found

### My MIGRATION-TODO.md Has Errors

I created `MIGRATION-TODO.md` with incorrect information:

1. **`server/_core/llm.ts` doesn't exist** - I said to modify it, but there is no such file
2. **`lib/_core/manus-runtime.ts` doesn't exist** - Already deleted
3. **Claude SDK is ALREADY wired** - `routers.ts` already imports and uses `invokeClaudeRAG` from `claude.ts`
4. **Voyage AI is ALREADY wired** - `embeddings.ts` is complete and `routers.ts` uses `semanticSearchProtocols`

**The migration to Claude/Voyage is essentially DONE in the code.**

---

## 📁 FILES TO DELETE (Stale Documentation)

| File | Reason |
|------|--------|
| `MIGRATION-TODO.md` | Contains incorrect info - migration is actually complete |
| `MIGRATION-PLAN.md` | 27KB of planning that's been executed |
| `PROJECT-ORGANIZATION.md` | Still valid but should be merged into CLAUDE.md |
| `STATUS_REPORT.md` | Outdated (Jan 17, 2026) - references old issues |
| `audit-notes.md` | Outdated - same issues |
| `todo.md` | 590+ lines of mostly completed items - needs massive cleanup |
| `WHITEBOARD-DIAGRAM.md` | 21KB - useful but could be condensed |
| `unknown-agencies-findings.md` | Completed work - can archive |
| `design.md` | Old design doc - partially outdated |

---

## 📁 FILES TO KEEP (Good Documentation)

| File | Status |
|------|--------|
| `CLAUDE.md` | ✅ Current and accurate |
| `AI-CHEATSHEET.md` | ✅ Current and accurate |
| `docs/STRIPE_SETUP_GUIDE.md` | ✅ Useful reference |
| `docs/PAYMENT_TESTING_GUIDE.md` | ✅ Useful reference |
| `docs/APP_STORE_ASSETS.md` | ✅ Useful reference |
| `research/ems_protocols.md` | ✅ Reference material |

---

## 🗑️ CODE CLEANUP NEEDED

### 1. Remove Forge API References (Low Priority - Not Breaking)

These files have Forge references but the code paths may not be actively used:

```
server/_core/dataApi.ts       - forgeApiUrl, forgeApiKey
server/_core/notification.ts  - forgeApiUrl, forgeApiKey
server/_core/imageGeneration.ts - forgeApiUrl, forgeApiKey
server/_core/voiceTranscription.ts - forgeApiUrl, forgeApiKey
server/storage.ts             - forgeApiUrl, forgeApiKey
server/_core/env.ts           - forgeApiUrl, forgeApiKey (keep but mark deprecated)
constants/oauth.ts            - USER_INFO_KEY = "manus-runtime-user-info"
```

### 2. Delete Stale Folders

```bash
rm -rf .manus/                # 117 cached query JSON files (3.8MB)
rm -rf rust-server/           # Rust backend - appears abandoned
```

### 3. Files Over 500 Lines (Still Valid)

From PROJECT-ORGANIZATION.md - this is still accurate:

| File | Lines | Action Needed |
|------|-------|---------------|
| `scripts/seed-protocols.ts` | 1147 | Split by region |
| `app/(tabs)/profile.tsx` | 1086 | Extract components |
| `server/db.ts` | 817 | Split by domain |
| `scripts/seed-ems-entities.ts` | 680 | Split by type |
| `app/(tabs)/search.tsx` | 639 | Extract components |
| `app/(tabs)/index.tsx` | 564 | Extract components |
| `app/(tabs)/coverage.tsx` | 548 | Extract components |

---

## ✅ WHAT'S ACTUALLY WORKING

1. **Claude SDK** - `server/_core/claude.ts` is complete with Haiku/Sonnet routing
2. **Voyage AI** - `server/_core/embeddings.ts` is complete with batch support
3. **Integration** - `server/routers.ts` already wires both together
4. **Environment** - `server/_core/env.ts` has all needed vars configured

---

## 📝 RECOMMENDED ACTIONS FOR CLAUDE CODE

### Phase 1: Documentation Cleanup
```bash
# Delete stale docs
rm MIGRATION-TODO.md
rm MIGRATION-PLAN.md
rm PROJECT-ORGANIZATION.md
rm STATUS_REPORT.md
rm audit-notes.md
rm unknown-agencies-findings.md

# Archive or heavily trim
# todo.md - reduce from 590 lines to ~50 (keep only incomplete items)
```

### Phase 2: Code Cleanup (Optional)
```bash
# Remove abandoned folders
rm -rf .manus/
rm -rf rust-server/

# Clean up Forge references in env.ts (mark as deprecated or remove)
```

### Phase 3: File Splitting (Lower Priority)
Split the 7 files over 500 lines per PROJECT-ORGANIZATION.md recommendations.

---

## 🎯 SUMMARY

**The Claude/Voyage migration is 95% complete in the code.**

The main issue is documentation debt - too many .md files with overlapping/outdated information. The codebase is cleaner than the docs suggest.

Recommended single source of truth:
- `CLAUDE.md` - Project overview and architecture
- `AI-CHEATSHEET.md` - Quick reference
- `todo.md` - Trimmed to only incomplete items (currently 590 lines of mostly [x] completed items)
