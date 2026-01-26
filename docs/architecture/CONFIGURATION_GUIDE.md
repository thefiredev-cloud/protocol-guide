# Configuration Guide

## Overview

Protocol Guide uses environment variables for configuration, validated at startup using Zod schemas. This ensures early failure with helpful error messages if configuration is invalid.

## Quick Start

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Fill in required values (see below)
# 3. Start the server
npm run dev:server
```

## Environment Variables

### Required - AI Services

| Variable | Format | Description | How to Get |
|----------|--------|-------------|------------|
| `ANTHROPIC_API_KEY` | `sk-ant-*` | Claude API key | [Anthropic Console](https://console.anthropic.com/) |
| `VOYAGE_API_KEY` | `pa-*` | Voyage AI embeddings | [Voyage AI](https://www.voyageai.com/) |

### Required - Database

| Variable | Format | Description | How to Get |
|----------|--------|-------------|------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection | Railway dashboard |
| `SUPABASE_URL` | `https://*.supabase.co` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | JWT (`eyJ...`) | Public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT (`eyJ...`) | Secret key (server only) | Supabase Dashboard → Settings → API |

### Required - Authentication

| Variable | Format | Description | How to Get |
|----------|--------|-------------|------------|
| `JWT_SECRET` | 32+ chars | Session cookie signing | `openssl rand -base64 32` |
| `NEXT_AUTH_SECRET` | 32+ chars | OAuth secret | `openssl rand -base64 32` |
| `NEXT_AUTH_URL` | URL | OAuth callback URL | Your app URL |

### Required - Payments (Stripe)

| Variable | Format | Description | How to Get |
|----------|--------|-------------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_*` or `sk_live_*` | API secret key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_*` or `pk_live_*` | Public key | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` | Webhook signing | Stripe Dashboard → Webhooks |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | `price_*` | Monthly price ID | Stripe Products |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | `price_*` | Annual price ID | Stripe Products |

### Optional - Redis

| Variable | Format | Default | Description |
|----------|--------|---------|-------------|
| `REDIS_URL` | URL | N/A | Upstash Redis REST URL |
| `REDIS_TOKEN` | String | N/A | Upstash Redis token |

**Note:** If Redis is not configured, the server uses in-memory caching. This works for development but is not recommended for production (rate limits aren't distributed).

### Optional - Email

| Variable | Format | Default | Description |
|----------|--------|---------|-------------|
| `RESEND_API_KEY` | `re_*` | N/A | Resend API key |
| `EMAIL_FROM_ADDRESS` | `Name <email>` | `Protocol Guide <noreply@...>` | From address |
| `EMAIL_REPLY_TO` | Email | N/A | Reply-to address |

### Optional - Monitoring

| Variable | Format | Default | Description |
|----------|--------|---------|-------------|
| `SENTRY_DSN` | URL | N/A | Sentry error tracking |
| `LOG_LEVEL` | `debug\|info\|warn\|error` | `info` | Pino log level |

### Optional - Server

| Variable | Format | Default | Description |
|----------|--------|---------|-------------|
| `PORT` | Number | `3000` | Server port |
| `NODE_ENV` | `development\|production\|test` | `development` | Environment |

## Configuration by Environment

### Development

```env
NODE_ENV=development
PORT=3000

# AI (required even for dev)
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...

# Database (can use local or shared dev)
DATABASE_URL=postgresql://localhost:5432/protocol_guide
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
JWT_SECRET=dev-secret-min-32-characters-long
NEXT_AUTH_SECRET=dev-secret-min-32-characters-long
NEXT_AUTH_URL=http://localhost:3000

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...

# Redis (optional for dev)
# REDIS_URL=
# REDIS_TOKEN=

# Logging
LOG_LEVEL=debug
```

### Production

```env
NODE_ENV=production
PORT=3000

# AI (production keys)
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...

# Database (Railway + Supabase production)
DATABASE_URL=postgresql://...railway.app...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth (strong secrets)
JWT_SECRET=<secure-random-64-chars>
NEXT_AUTH_SECRET=<secure-random-64-chars>
NEXT_AUTH_URL=https://protocol-guide.com

# Stripe (live mode)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...

# Redis (required for production)
REDIS_URL=https://xxx.upstash.io
REDIS_TOKEN=...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=Protocol Guide <noreply@protocol-guide.com>

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info
```

## Validation Errors

If configuration is invalid, you'll see helpful error messages at startup:

```
❌ Environment validation failed:

  ANTHROPIC_API_KEY:
    Error: ANTHROPIC_API_KEY must start with "sk-ant-"
    Help: Anthropic Claude API key - Get from: https://console.anthropic.com/

  JWT_SECRET:
    Error: JWT_SECRET must be at least 32 characters for security
    Help: JWT secret for session cookies - Generate with: openssl rand -base64 32

📖 See .env.example for required environment variables
```

## Secrets Management

### Local Development
- Use `.env` file (gitignored)
- Never commit secrets to git

### Railway (Production)
- Set in Railway Dashboard → Variables
- Or use Railway CLI: `railway variables set KEY=value`

### Netlify (Frontend)
- Set in Netlify Dashboard → Site settings → Environment variables
- Prefix with `VITE_` for client-side access

## Feature Flags

Currently implemented via environment/tier:

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Search queries/day | 20 | Unlimited | Unlimited |
| AI queries/day | 10 | Unlimited | Unlimited |
| Results per search | 10 | 25 | 50 |
| Voice search | ❌ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ✅ |

## Rate Limit Configuration

Configured in `server/_core/rateLimitRedis.ts`:

```typescript
const TIER_LIMITS = {
  search: {
    free: { requests: 30, window: 60 },      // 30/min
    pro: { requests: 100, window: 60 },      // 100/min
    enterprise: { requests: 500, window: 60 }, // 500/min
  },
  ai: {
    free: { requests: 10, window: 60 },      // 10/min
    pro: { requests: 50, window: 60 },       // 50/min
    enterprise: { requests: 200, window: 60 }, // 200/min
  },
};
```

## Timeout Configuration

```typescript
// Request timeout (server/_core/timeout.ts)
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

// Database query timeout (server/db/connection.ts)
const QUERY_TIMEOUT_MS = 10000; // 10 seconds (transactions: 30s)

// AI API timeout
const AI_TIMEOUT_MS = 30000; // 30 seconds

// Cache TTL
const SEARCH_CACHE_TTL_SECONDS = 3600; // 1 hour
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute
```

## Connection Pool Settings

```typescript
// PostgreSQL (server/db/connection.ts)
const POOL_CONFIG = {
  development: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  production: {
    max: 20,
    idleTimeoutMillis: 45000,
    connectionTimeoutMillis: 10000,
  },
};
```

## Troubleshooting

### "Missing required environment variables"
- Check all required variables are set
- Verify format (API keys must have correct prefix)
- Check for typos in variable names

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check network connectivity
- Ensure database server is running

### "Redis not available"
- Check `REDIS_URL` and `REDIS_TOKEN`
- Server will fall back to in-memory (dev only)
- Verify Upstash credentials

### "Stripe webhook signature verification failed"
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Ensure webhook URL is correct in Stripe
- Check for clock skew between servers
