# Protocol Guide - Build & Deployment Verification Summary

**Date:** January 26, 2026  
**Status:** ✅ Build passes, ready for deployment

---

## Build Verification

### ✅ Full Build Success
```
npm run build
> esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
  dist\index.js  416.4kb
Done in 72ms
```

### ✅ TypeScript Check Passes
```
npm run check
> tsc --noEmit
(no errors)
```

### ✅ Circular Dependencies Fixed
- **Fixed 4 circular dependencies** in the codebase:
  1. `embeddings/index.ts` ↔ `embeddings/search.ts` → Created `embeddings/generate.ts`
  2. `rag/index.ts` ↔ `rag/model-selection.ts` → Created `rag/config.ts`
  3. `rag/index.ts` ↔ `rag/scoring.ts` → Created `rag/types.ts`
  4. `rag/index.ts` ↔ `rag/search-execution.ts` → Created `rag/cache.ts` and `rag/latency.ts`

---

## Code Changes Made

### New Files Created:
1. `server/_core/embeddings/generate.ts` - Extracted embedding generation logic
2. `server/_core/rag/config.ts` - Extracted RAG configuration
3. `server/_core/rag/types.ts` - Extracted RAG types
4. `server/_core/rag/cache.ts` - Extracted query cache
5. `server/_core/rag/latency.ts` - Extracted latency monitor

### Files Modified:
1. `server/_core/embeddings/index.ts` - Updated imports/exports
2. `server/_core/embeddings/search.ts` - Changed to import from generate.ts
3. `server/_core/rag/index.ts` - Updated imports/exports
4. `server/_core/rag/model-selection.ts` - Changed to import from config.ts
5. `server/_core/rag/scoring.ts` - Changed to import from types.ts/config.ts
6. `server/_core/rag/search-execution.ts` - Changed to import from cache.ts/latency.ts
7. `components/landing/simulation-section.tsx` - Fixed type import

---

## Railway Deployment Configuration

### ✅ Railway Config Verified
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/api/live",
    "healthcheckTimeout": 60,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

## Required Environment Variables

The following environment variables must be configured in Railway:

### Required
- `ANTHROPIC_API_KEY` - Claude API key
- `VOYAGE_API_KEY` - Voyage AI for embeddings
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `JWT_SECRET` - Session JWT secret

### Recommended
- `REDIS_URL` / `UPSTASH_REDIS_REST_URL` - For rate limiting
- `RESEND_API_KEY` - For email notifications
- `SENTRY_DSN` - For error tracking
- `CRON_SECRET` - For scheduled tasks

---

## Security Vulnerabilities (npm audit)

**9 moderate vulnerabilities** found in `esbuild` related to development server exposure.

**Status:** These affect the development server only, not production. They are transitive dependencies from:
- `drizzle-kit`
- `vitest`
- `vite`

**Recommendation:** These do not affect production deployments since esbuild is only used for building, not serving. No immediate action required.

---

## Database Migrations

Migrations are located in `drizzle/migrations/` with 31 migration files.

**Latest migrations:**
- `0030_optimize_manus_protocol_chunks.sql`
- `0031_fix_orphaned_data_and_backfill.sql`

**Note:** Run `npm run db:push` before deployment if schema changes have been made.

---

## Outdated Dependencies

Several packages can be updated (non-breaking):
- `drizzle-orm`: 0.44.7 → 0.45.1
- `jose`: 6.1.0 → 6.1.3
- `react` / `react-dom`: 19.1.0 → 19.2.3
- `react-native`: 0.81.5 → 0.83.1

**Major version upgrades available (breaking):**
- `vitest`: 2.1.9 → 4.0.18
- `dotenv`: 16.6.1 → 17.2.3
- `tailwindcss`: 3.4.19 → 4.1.18

**Recommendation:** Update minor versions as needed; major versions require testing.

---

## Deployment Checklist

- [x] Build succeeds (`npm run build`)
- [x] TypeScript passes (`npm run check`)
- [x] No circular dependencies
- [x] Railway config verified
- [ ] Environment variables set in Railway
- [ ] Database migrations run (`npm run db:push`)
- [ ] Stripe webhooks configured
- [ ] Sentry DSN configured (optional)

---

## Manual Steps for Deployment

1. **Set environment variables in Railway dashboard**
   - Copy values from `.env` or configure new ones

2. **Push to main branch** (triggers Railway deployment)

3. **Verify health check**
   - `GET /api/live` should return 200

4. **Run database migrations** (if schema changed)
   ```bash
   npm run db:push
   ```

5. **Configure Stripe webhooks** (if not already done)
   - Endpoint: `https://your-domain.railway.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`
