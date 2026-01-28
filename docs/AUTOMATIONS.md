# Protocol Guide - Automations & Jobs Documentation

> Last updated: 2026-01-28  
> This document covers all automated processes, scheduled jobs, data ingestion pipelines, and CI/CD workflows.

---

## Table of Contents

1. [GitHub Actions Workflows](#1-github-actions-workflows)
2. [Scheduled Jobs (Cron)](#2-scheduled-jobs-cron)
3. [Server Background Jobs](#3-server-background-jobs)
4. [Data Ingestion Pipeline](#4-data-ingestion-pipeline)
5. [PDF Processing Workflow](#5-pdf-processing-workflow)
6. [Netlify Edge Functions](#6-netlify-edge-functions)
7. [Docker Automation](#7-docker-automation)
8. [npm Scripts](#8-npm-scripts)

---

## 1. GitHub Actions Workflows

Located in: `.github/workflows/`

### 1.1 CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

| Job | Purpose | Timeout |
|-----|---------|---------|
| `lint-and-test` | TypeScript check, ESLint, Vitest unit tests | 15 min |
| `security-scan` | TruffleHog secret scanning, .env file check | 10 min |
| `build` | Build server (esbuild) + web export (Expo) | 20 min |
| `e2e-tests` | Playwright E2E tests on Chromium | 30 min |
| `deploy-netlify-staging` | Deploy to Netlify staging (develop branch only) | 15 min |
| `deploy-netlify` | Deploy to Netlify production (main branch only) | 15 min |
| `deploy-railway` | Deploy API server to Railway (main branch only) | 15 min |

**Pipeline Flow:**
```
push/PR
   │
   ├── lint-and-test ──┬── build ──┬── e2e-tests ──┬── deploy-netlify-staging (develop)
   │                   │           │               │
   └── security-scan ──┘           │               ├── deploy-netlify (main)
                                   │               │
                                   │               └── deploy-railway (main)
```

**Key Features:**
- Playwright browser caching by version (saves ~30-60s)
- pnpm store caching
- Build artifacts uploaded for 7 days
- Health check after Railway deployment
- Visual regression tests (currently disabled - see comments in workflow)

---

### 1.2 Drip Email Sender (`drip-emails.yml`)

**Schedule:** Daily at 9:00 AM UTC (4 AM EST / 1 AM PST)

```yaml
schedule:
  - cron: '0 9 * * *'
```

**Purpose:** Sends onboarding drip emails to users based on signup date:
- **Day 3:** Tips email - "3 tips to get the most out of Protocol Guide"
- **Day 7:** Pro pitch email - "Unlock unlimited Protocol Guide searches" (free users only)

**How it Works:**
1. GitHub Action triggers daily
2. Calls tRPC endpoint: `POST /api/trpc/jobs.runDripEmails`
3. Authenticates with `CRON_SECRET` environment variable
4. Server job queries users who signed up X days ago
5. Sends emails via email service (Resend)
6. Records sent emails in `drip_emails_sent` table

**Required Secrets:**
- `CRON_SECRET` - Authentication token for job endpoint
- `API_URL` (variable) - Defaults to Railway production URL

---

### 1.3 Health Monitor (`health-monitor.yml`)

**Schedule:** Every 15 minutes

```yaml
schedule:
  - cron: '*/15 * * * *'
```

**Purpose:** Production uptime monitoring with automatic issue creation on failure.

**Endpoints Checked:**
- `/api/health` - Full health check (database, services)
- `/api/live` - Liveness probe (basic availability)

**Failure Handling:**
1. Creates GitHub issue with label `health-check-failure`
2. If issue already exists, adds comment with new failure timestamp
3. Issue includes runbook links and action items

**Manual Trigger:**
```bash
gh workflow run "Health Monitor" --field environment=staging
```

---

## 2. Scheduled Jobs (Cron)

| Job | Schedule | Source | Description |
|-----|----------|--------|-------------|
| Drip Emails | Daily 9 AM UTC | GitHub Actions | Onboarding email sequence |
| Health Monitor | Every 15 min | GitHub Actions | Production uptime checks |

**Note:** All scheduled jobs run via GitHub Actions, not server-side cron. This provides:
- Built-in logging and history
- Failure notifications
- No server resource consumption
- Easy manual re-runs

---

## 3. Server Background Jobs

Located in: `server/jobs/`

### 3.1 Protocol Processor (`protocol-processor.ts`)

**Type:** On-demand (triggered by API)

**Purpose:** Processes uploaded PDF protocols through the full RAG pipeline.

**Pipeline Steps:**
1. Download PDF from storage URL
2. Extract text using `pdf-parse`
3. Chunk text into semantic sections (~1500 chars with 200 char overlap)
4. Generate embeddings via Voyage AI (`voyage-3` model)
5. Insert chunks into Supabase `manus_protocol_chunks` table
6. Update upload status throughout

**Status Flow:**
```
pending → processing → chunking → embedding → completed
                                           ↘ failed
```

**Key Functions:**
- `processProtocolUpload(uploadId)` - Process single upload
- `processPendingUploads()` - Batch process up to 5 pending uploads

**Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VOYAGE_API_KEY`

---

### 3.2 Drip Email Job (`send-drip-emails.ts`)

**Type:** Cron-triggered (via GitHub Actions)

**Purpose:** Implements the drip email sequence for user onboarding.

**Sequence:**
| Day | Email Type | Template | Target |
|-----|------------|----------|--------|
| 3 | `tips` | `ONBOARDING_TIPS` | All users |
| 7 | `pro_pitch` | `ONBOARDING_PRO_PITCH` | Free tier users only |

**Logic:**
1. Calculate target signup date (today - N days)
2. Query users who signed up on that date
3. Filter by tier (free users for pro_pitch)
4. Check `drip_emails_sent` table to avoid duplicates
5. Send email via Resend
6. Record sent email

---

## 4. Data Ingestion Pipeline

Located in: `scripts/import-*.ts` (40+ scripts, ~710KB total)

### 4.1 Architecture

```
PDF Source (Web/Local)
       │
       ▼
   Download Script ─────────────────┐
       │                            │
       ▼                            │
   Import Script                    │
       │                            │
       ├── Extract metadata         │
       │   (protocol #, title)      │
       │                            │
       ├── Parse PDF text ──────────┤
       │                            │
       ├── Chunk content            │
       │                            │
       ├── Generate embeddings      │
       │   (Voyage AI)              │
       │                            │
       └── Insert to Supabase       │
           (manus_protocol_chunks)  │
```

### 4.2 Import Scripts by Region

| State | Script | Agency |
|-------|--------|--------|
| CA | `import-alameda-protocols.ts` | Alameda County EMS |
| CA | `import-contra-costa-protocols.ts` | Contra Costa EMS |
| CA | `import-el-dorado-protocols.ts` | El Dorado County EMS |
| CA | `import-imperial-county-protocols.ts` | Imperial County EMS |
| CA | `import-kern-county-protocols.ts` | Kern County EMS |
| CA | `import-la-county-local-pdfs.ts` | Los Angeles County EMS |
| CA | `import-marin-protocols.ts` | Marin County EMS |
| CA | `import-merced-protocols.ts` | Merced County EMS |
| CA | `import-napa-protocols.ts` | Napa County EMS |
| CA | `import-orange-county-protocols.ts` | Orange County EMS |
| CA | `import-riverside-protocols.ts` | Riverside County EMS |
| CA | `import-sacramento-protocols.ts` | Sacramento County EMS |
| CA | `import-san-benito-protocols.ts` | San Benito County EMS |
| CA | `import-san-diego-protocols.ts` | San Diego County EMS |
| CA | `import-san-francisco-protocols.ts` | San Francisco EMS |
| CA | `import-san-joaquin-protocols.ts` | San Joaquin County EMS |
| CA | `import-san-luis-obispo-protocols.ts` | SLO County EMS |
| CA | `import-san-mateo-protocols.ts` | San Mateo County EMS |
| CA | `import-santa-barbara-protocols.ts` | Santa Barbara County EMS |
| CA | `import-santa-clara-protocols.ts` | Santa Clara County EMS |
| CA | `import-santa-cruz-protocols.ts` | Santa Cruz County EMS |
| CA | `import-slo-county-protocols.ts` | SLO County EMS (alt) |
| CA | `import-solano-protocols.ts` | Solano County EMS |
| CA | `import-ssvems-protocols.ts` | South Santa Barbara VEMS |
| CA | `import-ventura-county-protocols.ts` | Ventura County EMS |
| CA | `import-yolo-county-protocols.ts` | Yolo County EMS |
| NY | `import-ny-protocols.ts` | New York State |
| TX | `import-tx-fl-protocols.ts` | Texas |
| FL | `import-tx-fl-protocols.ts` | Florida |
| IL | `import-il-pa-protocols.ts` | Illinois |
| PA | `import-il-pa-protocols.ts` | Pennsylvania |
| OH | `import-oh-ga-protocols.ts` | Ohio |
| GA | `import-oh-ga-protocols.ts` | Georgia |

### 4.3 Running Import Scripts

```bash
# Single agency import
npx tsx scripts/import-la-county-local-pdfs.ts

# With environment variables
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx VOYAGE_API_KEY=xxx npx tsx scripts/import-*.ts
```

### 4.4 Download Scripts

| Script | Purpose |
|--------|---------|
| `download-el-dorado-pdfs.ts` | Download from El Dorado county website |
| `download-riverside-protocols.ps1` | PowerShell downloader for Riverside |
| `download-santa-clara-pdfs.ts` | Playwright-based PDF scraper |
| `cdp-download.js` | Chrome DevTools Protocol PDF downloader |
| `playwright-download-pdf.ts` | Playwright-based PDF downloader |

---

## 5. PDF Processing Workflow

### 5.1 Text Extraction

```typescript
// Using pdf-parse library
const pdfParse = require('pdf-parse');
const data = await pdfParse(pdfBuffer);
const text = data.text;
```

### 5.2 Chunking Strategy

**Parameters:**
- Max chunk size: 1500 characters
- Overlap: 200 characters
- Split on: paragraph breaks (`\n\n`)

**Section Detection Patterns:**
- Markdown headers: `^#{1,3}\s+(.+)$`
- Section markers: `^Section\s*(\d+[\.\d]*)[:\s]+(.+)$`
- Chapter markers: `^Chapter\s*(\d+)[:\s]+(.+)$`
- Numbered sections: `^\d+\.\d+[\.\d]*\s+(.+)$`
- Procedure headers: `^(PROCEDURE|TREATMENT|ASSESSMENT)[:\s]*(.*)$`

### 5.3 Embedding Generation

**Service:** Voyage AI  
**Model:** `voyage-3`  
**Batch Size:** 100 texts per request  
**Rate Limiting:** 100ms delay between batches

```typescript
const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${VOYAGE_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'voyage-3',
    input: texts,
    input_type: 'document',
  }),
});
```

### 5.4 One-Time Embedding Generation

For bulk embedding generation of all protocols:

```bash
npx tsx scripts/generate-embeddings.ts
```

**Features:**
- Progress reporting with ETA
- Configurable batch size (default: 128)
- Error counting

---

## 6. Netlify Edge Functions

Located in: `netlify/edge-functions/`

### 6.1 Static Cache (`cache-static.ts`)

**Path:** `/api/static/*`

**Purpose:** CDN-level caching for protocol statistics and coverage data.

**Cache Durations:**
| Path Pattern | TTL |
|--------------|-----|
| `/api/static/stats/*` | 1 hour |
| `/api/static/coverage/*` | 1 hour |
| `/api/static/agencies/*` | 30 minutes |
| Other `/api/static/*` | 10 minutes |

**Headers Added:**
- `Cache-Control: public, max-age=X, s-maxage=X, stale-while-revalidate=2X`
- `X-Edge-Cache: MISS`
- `X-Edge-Cache-TTL: X`

---

### 6.2 Geo Routing (`geo-route.ts`)

**Path:** `/*` (excludes static assets)

**Purpose:** Adds geolocation headers for personalized state/region content.

**Headers Added:**
| Header | Description |
|--------|-------------|
| `X-Geo-Country` | ISO country code |
| `X-Geo-Region` | ISO 3166-2 region code |
| `X-Geo-State` | US state abbreviation |
| `X-Geo-City` | City name |
| `X-Geo-Lat` | Latitude |
| `X-Geo-Lon` | Longitude |
| `X-Geo-Timezone` | IANA timezone |
| `X-Geo-Data` | JSON object with all geo data |

---

## 7. Docker Automation

Located in: `docker-compose.yml`

### 7.1 Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| `api` | `protocol-guide-api` | 3000 | Express + tRPC API server |
| `web` | `protocol-guide-web` | 8081 | Expo web frontend |
| `dev` | `protocol-guide-dev` | 3000, 8081 | Full dev environment |

### 7.2 Commands

```bash
# Start production-like stack
pnpm docker:up

# Start development mode (with hot reload)
pnpm docker:dev

# View logs
pnpm docker:logs

# Stop all
pnpm docker:down

# Rebuild images
pnpm docker:build
```

### 7.3 Health Checks

API container has built-in health check:
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

---

## 8. npm Scripts

### 8.1 Development

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `concurrently dev:server dev:metro` | Start full dev environment |
| `dev:server` | `tsx watch server/_core/index.ts` | Start API with hot reload |
| `dev:metro` | `expo start --web --port 8081` | Start Expo web server |

### 8.2 Build & Deploy

| Script | Purpose |
|--------|---------|
| `build` | Build server with esbuild |
| `build:web` | Export Expo web, inject PWA meta, copy assets |
| `start` | Run production server |

### 8.3 Testing

| Script | Purpose |
|--------|---------|
| `test` | Run Vitest unit tests |
| `test:integration` | Run integration tests (single fork) |
| `test:e2e` | Run Playwright E2E tests |
| `test:e2e:ui` | Playwright with UI mode |
| `test:e2e:visual` | Visual regression tests |
| `test:all` | Vitest + Playwright |

### 8.4 Database

| Script | Purpose |
|--------|---------|
| `db:push` | Generate and run Drizzle migrations |
| `sitemap` | Generate sitemap.xml |

### 8.5 Analysis

| Script | Purpose |
|--------|---------|
| `analyze` | Build and analyze bundle sizes |
| `bench` | Run Vitest benchmarks |
| `bench:report` | Generate benchmark report |

---

## Environment Variables Reference

### Required for GitHub Actions

| Variable | Used By | Purpose |
|----------|---------|---------|
| `CRON_SECRET` | drip-emails.yml | Auth for job endpoint |
| `RAILWAY_TOKEN` | ci.yml | Railway deployment |
| `NETLIFY_AUTH_TOKEN` | ci.yml | Netlify deployment |
| `NETLIFY_SITE_ID` | ci.yml | Netlify site identifier |
| `SENTRY_DSN` | ci.yml | Error tracking |

### Required for Import Scripts

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access to Supabase |
| `VOYAGE_API_KEY` | Embedding generation |

---

## Monitoring & Alerts

### GitHub Actions

- View runs: `https://github.com/<owner>/Protocol-Guide/actions`
- Failure notifications: GitHub email notifications
- Health check failures: Creates GitHub issues

### Production Health

- Health endpoint: `/api/health`
- Liveness endpoint: `/api/live`
- Monitored every 15 minutes

### Sentry

- Error tracking enabled in production
- DSN configured via `SENTRY_DSN` environment variable

---

## Troubleshooting

### Drip Emails Not Sending

1. Check GitHub Actions workflow run logs
2. Verify `CRON_SECRET` matches server config
3. Check `drip_emails_sent` table for duplicates
4. Verify user has email and correct `createdAt`

### PDF Processing Failing

1. Check `protocol_uploads` table for status
2. Look for `errorMessage` in failed uploads
3. Verify `VOYAGE_API_KEY` is valid
4. Check PDF is accessible at `fileUrl`

### Health Check Failures

1. Check GitHub issue for details
2. Verify Railway deployment is healthy
3. Check database connectivity
4. Review Sentry for errors

---

## Adding New Automations

### New Import Script

1. Copy existing script as template (e.g., `import-la-county-local-pdfs.ts`)
2. Update agency name, state code, URL patterns
3. Adjust PDF parsing for source format
4. Test with single PDF first
5. Run full import with monitoring

### New Scheduled Job

1. Create job in `server/jobs/`
2. Add tRPC endpoint in router
3. Create GitHub Actions workflow with cron schedule
4. Add `CRON_SECRET` authentication
5. Document in this file
