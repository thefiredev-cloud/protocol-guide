# Protocol Guide - Deployment Health & Monitoring

## Overview

This document outlines the monitoring approach, verification procedures, and rollback plan for Protocol Guide deployments.

---

## Health Check Endpoints

### Primary Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /api/health` | Comprehensive health check | Full service status JSON |
| `GET /api/health?quick=true` | Quick health (critical only) | Faster, DB/Supabase only |
| `GET /api/ready` | Kubernetes readiness probe | `ready` or `not ready` |
| `GET /api/live` | Kubernetes liveness probe | `alive` |

### Health Check Response Format

```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2026-01-22T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "healthy",
      "latencyMs": 45,
      "lastChecked": "2026-01-22T12:00:00.000Z"
    },
    "supabase": {
      "status": "healthy",
      "latencyMs": 120,
      "lastChecked": "2026-01-22T12:00:00.000Z"
    },
    "claude": {
      "status": "healthy",
      "latencyMs": 890,
      "lastChecked": "2026-01-22T12:00:00.000Z"
    },
    "voyage": {
      "status": "healthy",
      "latencyMs": 450,
      "lastChecked": "2026-01-22T12:00:00.000Z"
    }
  },
  "resources": {
    "memoryUsedMB": 256,
    "memoryTotalMB": 16384,
    "memoryPercentage": 2
  }
}
```

### Service Status Definitions

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| `healthy` | Service operating normally | None |
| `degraded` | Service slow or partial issues | Monitor closely |
| `unhealthy` | Service unavailable | Immediate investigation |

### Latency Thresholds

| Service | Healthy | Degraded |
|---------|---------|----------|
| Database (MySQL) | < 500ms | >= 500ms |
| Supabase (pgvector) | < 1000ms | >= 1000ms |
| Claude API | < 2000ms | >= 2000ms |
| Voyage API | < 2000ms | >= 2000ms |

---

## Deployment Monitoring Plan

### Response Time Monitoring

Monitor these endpoints and their P50/P95/P99 latencies:

| Endpoint | Target P95 | Alert Threshold |
|----------|-----------|-----------------|
| `/api/health` | < 200ms | > 500ms |
| `/api/trpc/*` (search) | < 1000ms | > 2000ms |
| `/api/trpc/*` (query) | < 3000ms | > 5000ms |

### Error Rate Monitoring

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| 5xx Error Rate | < 0.1% | > 1% |
| 4xx Error Rate | < 5% | > 10% |
| API Timeout Rate | < 0.5% | > 2% |

### API Usage Metrics

Track daily/hourly:
- Total API requests
- Unique users
- Search queries executed
- Claude API tokens consumed
- Voyage API embeddings generated

### Infrastructure Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Memory Usage | < 75% | > 90% |
| CPU Usage | < 70% | > 85% |
| Database Connections | < 80% pool | > 90% pool |

---

## Post-Deployment Verification Checklist

Run these checks immediately after every deployment:

### Automated Verification Script

```bash
#!/bin/bash
# post-deploy-verify.sh

BASE_URL="${1:-https://protocol-guide.com}"
API_URL="${2:-https://api.protocol-guide.com}"

echo "=== Protocol Guide Post-Deploy Verification ==="
echo "Web: $BASE_URL"
echo "API: $API_URL"
echo ""

# 1. Website loads
echo "[ ] Checking website loads..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$HTTP_CODE" = "200" ]; then
  echo "[x] Website returns 200 OK"
else
  echo "[!] FAIL: Website returned $HTTP_CODE"
fi

# 2. Health check returns 200
echo "[ ] Checking health endpoint..."
HEALTH=$(curl -s "$API_URL/api/health")
HEALTH_STATUS=$(echo "$HEALTH" | jq -r '.status // "error"')
if [ "$HEALTH_STATUS" = "healthy" ] || [ "$HEALTH_STATUS" = "degraded" ]; then
  echo "[x] Health check: $HEALTH_STATUS"
else
  echo "[!] FAIL: Health check returned $HEALTH_STATUS"
fi

# 3. Database connectivity
echo "[ ] Checking database..."
DB_STATUS=$(echo "$HEALTH" | jq -r '.services.database.status // "error"')
if [ "$DB_STATUS" = "healthy" ]; then
  echo "[x] Database: healthy"
else
  echo "[!] WARN: Database status: $DB_STATUS"
fi

# 4. Supabase connectivity
echo "[ ] Checking Supabase..."
SUPA_STATUS=$(echo "$HEALTH" | jq -r '.services.supabase.status // "error"')
if [ "$SUPA_STATUS" = "healthy" ]; then
  echo "[x] Supabase: healthy"
else
  echo "[!] WARN: Supabase status: $SUPA_STATUS"
fi

# 5. Claude API
echo "[ ] Checking Claude API..."
CLAUDE_STATUS=$(echo "$HEALTH" | jq -r '.services.claude.status // "error"')
if [ "$CLAUDE_STATUS" = "healthy" ] || [ "$CLAUDE_STATUS" = "degraded" ]; then
  echo "[x] Claude API: $CLAUDE_STATUS"
else
  echo "[!] WARN: Claude API status: $CLAUDE_STATUS"
fi

# 6. Voyage API
echo "[ ] Checking Voyage API..."
VOYAGE_STATUS=$(echo "$HEALTH" | jq -r '.services.voyage.status // "error"')
if [ "$VOYAGE_STATUS" = "healthy" ] || [ "$VOYAGE_STATUS" = "degraded" ]; then
  echo "[x] Voyage API: $VOYAGE_STATUS"
else
  echo "[!] WARN: Voyage API status: $VOYAGE_STATUS"
fi

# 7. Stripe webhook endpoint accessible
echo "[ ] Checking Stripe webhook endpoint..."
STRIPE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/stripe/webhook")
# 400 is expected without valid payload, 404 would be bad
if [ "$STRIPE_CODE" = "400" ] || [ "$STRIPE_CODE" = "401" ]; then
  echo "[x] Stripe webhook endpoint accessible (returns $STRIPE_CODE without payload)"
else
  echo "[!] WARN: Stripe webhook returned $STRIPE_CODE"
fi

echo ""
echo "=== Verification Complete ==="
```

### Manual Verification Checklist

- [ ] **Website loads**: https://protocol-guide.com returns 200
- [ ] **Health check**: /api/health returns status "healthy" or "degraded"
- [ ] **Auth flow works**: Can sign in via Supabase auth
- [ ] **Search returns results**: Search for "cardiac arrest" returns protocols
- [ ] **Stripe webhook accessible**: POST /api/stripe/webhook returns 400 (not 404)
- [ ] **No console errors**: Browser console shows no critical errors
- [ ] **Mobile responsive**: Site renders correctly on mobile viewport

### Search Verification

Test these searches to verify semantic search is working:

```
1. "cardiac arrest" - Should return cardiac/ACLS protocols
2. "pediatric dose epinephrine" - Should return peds protocols
3. "ref 502" - Should match protocol number directly
```

---

## Sentry Error Tracking Setup

### Installation

```bash
pnpm add @sentry/node @sentry/tracing
```

### Configuration

Create `/server/_core/sentry.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { ENV } from './env';

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.log('[Sentry] No DSN configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: ENV.isProduction ? 'production' : 'development',
    tracesSampleRate: ENV.isProduction ? 0.1 : 1.0, // 10% in prod
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    // Filter out expected errors
    beforeSend(event) {
      // Don't send rate limit errors
      if (event.message?.includes('rate limit')) {
        return null;
      }
      return event;
    },
  });

  console.log('[Sentry] Initialized');
}

export { Sentry };
```

### Environment Variables

Add to Netlify environment:

```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=protocol-guide
SENTRY_PROJECT=api-server
```

### Source Maps (for production debugging)

Add to build script:

```bash
# Upload source maps after build
npx @sentry/cli sourcemaps upload ./dist --org=protocol-guide --project=api-server
```

---

## Rollback Plan

### Netlify Automatic Rollback

Netlify maintains deploy history. To rollback:

1. Go to Netlify Dashboard > protocol-guide > Deploys
2. Find the last known good deploy
3. Click the deploy
4. Click "Publish deploy"

### Manual Rollback via CLI

```bash
# List recent deploys
netlify deploys --site protocol-guide

# Rollback to specific deploy ID
netlify deploy --prod --dir=dist --site=protocol-guide --deploy-id=<deploy-id>
```

### Git-based Rollback

```bash
# Find last good commit
git log --oneline -10

# Revert to specific commit
git revert <bad-commit-hash>
git push origin main

# Or reset to previous commit (use with caution)
git reset --hard <good-commit-hash>
git push --force origin main  # Requires force push
```

### Rollback Decision Matrix

| Symptom | Severity | Action |
|---------|----------|--------|
| Site completely down | Critical | Immediate Netlify rollback |
| Health check unhealthy (DB) | Critical | Investigate DB, rollback if deploy-related |
| Health check unhealthy (API keys) | High | Check env vars, not deploy issue |
| Error rate > 5% | High | Rollback if started after deploy |
| Slow responses (degraded) | Medium | Monitor, rollback if worsening |
| Minor UI issues | Low | Fix forward, no rollback |

### Post-Rollback Verification

After rollback, run the full verification checklist above to confirm stability.

---

## Alerting Configuration

### Recommended Alert Rules

1. **Critical - Immediate (PagerDuty/SMS)**
   - Health endpoint returns `unhealthy`
   - 5xx error rate > 5%
   - Site completely unreachable

2. **High Priority - 15 min (Slack/Email)**
   - Health endpoint returns `degraded`
   - Response time P95 > 3s
   - Error rate > 1%

3. **Warning - Daily Digest**
   - Memory usage > 80%
   - API latency trending up
   - Unusual traffic patterns

### Monitoring Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| Netlify | Deploy monitoring, build logs | Built-in |
| Sentry | Error tracking, performance | SDK integration |
| UptimeRobot | External uptime monitoring | HTTP checks |
| PagerDuty | Incident alerting | Sentry integration |

---

## Contact & Escalation

### On-Call Rotation

- Primary: Engineering Lead
- Secondary: Backend Engineer
- Executive: CTO (for extended outages > 30 min)

### External Support

- **Netlify Support**: For deployment/CDN issues
- **Supabase Support**: For database issues
- **Anthropic Support**: For Claude API issues
- **Voyage AI Support**: For embedding API issues

---

## Appendix: Environment Variables Checklist

Verify these are set in production:

```
# Required
ANTHROPIC_API_KEY      - Claude API key
VOYAGE_API_KEY         - Voyage embeddings API key
SUPABASE_URL           - Supabase project URL
SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
DATABASE_URL           - MySQL/TiDB connection string
JWT_SECRET             - Session cookie signing secret

# Payments
STRIPE_SECRET_KEY      - Stripe API key
STRIPE_WEBHOOK_SECRET  - Stripe webhook signature secret
STRIPE_PUBLISHABLE_KEY - Stripe public key

# Optional
SENTRY_DSN             - Sentry error tracking
```
