# Protocol Guide - Project Organization Guide

## 🚨 FILES OVER 500 LINES (Must Split)

| File | Lines | Split Recommendation |
|------|-------|---------------------|
| `scripts/seed-protocols.ts` | 1147 | Split by state/region batches |
| `app/(tabs)/profile.tsx` | 1086 | Extract into components below |
| `server/db.ts` | 817 | Split by domain (users, protocols, queries) |
| `scripts/seed-ems-entities.ts` | 680 | Split by entity type |
| `app/(tabs)/search.tsx` | 639 | Extract search components |
| `app/(tabs)/index.tsx` | 564 | Extract home screen sections |
| `app/(tabs)/coverage.tsx` | 548 | Extract coverage components |

---

## 📁 RECOMMENDED SPLITS

### 1. `app/(tabs)/profile.tsx` → Split into:
```
components/profile/
├── profile-header.tsx        # User info, avatar, tier badge
├── usage-stats.tsx           # Daily queries, limits display
├── subscription-card.tsx     # Pro status, manage subscription
├── favorites-list.tsx        # Saved protocols list
├── cache-management.tsx      # Offline cache controls
├── settings-section.tsx      # App settings, logout
└── index.ts                  # Re-exports
```

### 2. `server/db.ts` → Split into:
```
server/db/
├── index.ts                  # Main exports, getDb()
├── config.ts                 # TIER_CONFIG, PRICING constants
├── users.ts                  # upsertUser, getUserByOpenId, etc.
├── protocols.ts              # Protocol CRUD operations
├── queries.ts                # Query logging operations
├── counties.ts               # County/agency operations
└── feedback.ts               # Feedback operations
```

### 3. `app/(tabs)/search.tsx` → Split into:
```
components/search/
├── search-input.tsx          # Search bar component
├── search-results.tsx        # Results list
├── search-filters.tsx        # State/county filters
├── search-suggestions.tsx    # Autocomplete suggestions
└── index.ts
```

### 4. `app/(tabs)/index.tsx` → Split into:
```
components/home/
├── hero-section.tsx          # Main search prompt
├── quick-actions.tsx         # (already exists, reuse)
├── recent-searches.tsx       # (already exists, reuse)
├── stats-banner.tsx          # Protocol count stats
└── index.ts
```

---

## 🗂️ CURRENT FOLDER STRUCTURE (Good)

```
Protocol Guide Manus/
├── agents/                   # ✅ Well organized by category
│   ├── bonus/
│   ├── design/
│   ├── engineering/
│   ├── marketing/
│   ├── product/
│   ├── project-management/
│   ├── studio-operations/
│   └── testing/
├── app/                      # ✅ Expo Router structure
│   ├── (tabs)/               # Main tab screens
│   ├── dev/                  # Dev tools
│   └── oauth/                # Auth callbacks
├── components/               # ⚠️ Needs subdirectories
│   └── ui/                   # Base UI components
├── server/                   # ✅ Good structure
│   ├── _core/                # Core utilities
│   ├── api/                  # API routes
│   └── webhooks/             # Webhook handlers
├── lib/                      # Shared utilities
├── hooks/                    # React hooks
├── constants/                # App constants
└── scripts/                  # Data scripts
```

---

## 🔧 RECOMMENDED CHANGES

### 1. Add component subdirectories:
```bash
mkdir -p components/profile
mkdir -p components/search
mkdir -p components/home
mkdir -p components/protocol
```

### 2. Split `server/db.ts`:
```bash
mkdir -p server/db
# Then split the file
```

### 3. Clean up unused Manus files:
```bash
rm lib/_core/manus-runtime.ts           # After migration
rm -rf .manus/                           # Manus config folder
```

### 4. Consolidate scripts by purpose:
```
scripts/
├── seed/                     # All seeding scripts
│   ├── protocols.ts
│   ├── ems-entities.ts
│   └── demo.ts
├── import/                   # All import scripts
│   ├── ca-protocols.ts
│   ├── tx-fl-protocols.ts
│   └── ...
└── utils/                    # Helper scripts
```

---

## 📏 500-LINE RULE

**For Claude Code:** Keep all files under 500 lines. When a file approaches this limit:

1. **Components:** Extract sub-components into a folder with the same name
   - `profile.tsx` → `profile/index.tsx` + `profile/section-name.tsx`

2. **Utilities:** Split by domain or function type
   - `db.ts` → `db/users.ts`, `db/protocols.ts`, etc.

3. **Scripts:** Split by data source or batch
   - One file per state/region for imports

**Benefits:**
- Reduces LLM hallucination
- Faster file loading and parsing
- Better git diffs
- Easier to maintain

---

## ✅ ALREADY GOOD

- `agents/` folder - well organized by category
- `server/_core/` - proper separation of concerns
- `components/ui/` - base components isolated
- `hooks/` - custom hooks in dedicated folder
- New `claude.ts` and `embeddings.ts` - good size (~290 lines each)

---

## 🎯 PRIORITY ORDER

1. **Split `server/db.ts`** - Most impactful, used everywhere
2. **Split `profile.tsx`** - Largest UI file
3. **Split `search.tsx`** - Core feature
4. **Clean up Manus remnants** - After migration complete
5. **Reorganize scripts/** - Lower priority, not runtime code
