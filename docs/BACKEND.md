# Backend Architecture

> **Last Updated:** 2026-01-28  
> **Audited From:** Actual codebase in `server/`

Protocol Guide uses an **Express + tRPC** hybrid architecture deployed on Railway. The server provides type-safe RPC endpoints via tRPC with Express handling raw HTTP routes for webhooks and integrations.

## Table of Contents

- [Server Architecture](#server-architecture)
- [tRPC Routers](#trpc-routers)
- [REST API Endpoints](#rest-api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Middleware Stack](#middleware-stack)
- [External Services](#external-services)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Database Layer](#database-layer)

---

## Server Architecture

### Entry Point

```
server/_core/index.ts
```

The server is a single Express application that:
1. Mounts security middleware (Helmet, CORS, CSP nonce)
2. Registers raw Express routes (webhooks, OAuth, health)
3. Mounts tRPC router at `/api/trpc`
4. Serves static files in production

### Start Commands

```bash
# Development (with hot reload)
pnpm dev:server

# Production
pnpm build && pnpm start
```

### Production Deployment

- **Platform:** Railway
- **Build:** esbuild bundles to `dist/index.js`
- **Static Assets:** Served from `dist/` after Expo web build

---

## tRPC Routers

tRPC provides type-safe API calls. All routers are composed in `server/routers.ts`.

### Router Overview

| Router | Path | Description |
|--------|------|-------------|
| `system` | `system.*` | Health checks, admin notifications |
| `auth` | `auth.*` | Login/logout, session management, password change |
| `counties` | `counties.*` | County listing and retrieval |
| `user` | `user.*` | User profile, counties, usage, push tokens |
| `search` | `search.*` | Semantic search with Voyage AI + pgvector |
| `query` | `query.*` | Protocol RAG queries with Claude |
| `voice` | `voice.*` | Voice transcription (OpenAI Whisper) |
| `feedback` | `feedback.*` | User feedback submissions |
| `contact` | `contact.*` | Public contact form, waitlist |
| `subscription` | `subscription.*` | Stripe checkout/portal |
| `admin` | `admin.*` | Admin-only operations |
| `agencyAdmin` | `agencyAdmin.*` | B2B agency management |
| `integration` | `integration.*` | Partner tracking (ImageTrend) |
| `referral` | `referral.*` | Referral/viral growth system |
| `jobs` | `jobs.*` | Cron job triggers |

### Detailed Procedure List

#### `system` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `health` | query | public | Health check |
| `notifyOwner` | mutation | admin | Send notification to owner |

#### `auth` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `me` | query | public (rate limited) | Get current user |
| `logout` | mutation | CSRF | Clear session, revoke token |
| `logoutAllDevices` | mutation | protected | Revoke all tokens |
| `changePassword` | mutation | protected | Change password (verifies current) |
| `updateEmail` | mutation | protected | Update email address |
| `securityStatus` | query | protected | Check token revocation status |

#### `counties` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `list` | query | public (rate limited) | List all counties grouped by state |
| `get` | query | public (rate limited) | Get county by ID |

#### `user` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `usage` | query | protected | Get daily query usage |
| `acknowledgeDisclaimer` | mutation | protected | Record disclaimer acceptance |
| `hasAcknowledgedDisclaimer` | query | protected | Check disclaimer status |
| `selectCounty` | mutation | protected | Set user's selected county |
| `queries` | query | protected | Get query history |
| `savedCounties` | query | protected | Get saved counties (tier-limited) |
| `addCounty` | mutation | protected | Add county to saved list |
| `removeCounty` | mutation | protected | Remove county from saved list |
| `setPrimaryCounty` | mutation | protected | Set primary county |
| `primaryCounty` | query | protected | Get primary county |
| `savePushToken` | mutation | protected | Save push notification token |

#### `search` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `semantic` | query | public (rate limited) | Semantic search with Voyage AI |
| `getProtocol` | query | public (rate limited) | Get protocol by ID |
| `stats` | query | public (rate limited) | Protocol statistics |
| `coverageByState` | query | public (rate limited) | Protocol coverage by state |
| `totalStats` | query | public (rate limited) | Total protocol counts |
| `agenciesByState` | query | public (rate limited) | Agencies in a state |
| `agenciesWithProtocols` | query | public (rate limited) | All agencies with protocols |
| `searchByAgency` | query | public (rate limited) | Search within specific agency |
| `summarize` | query | public (rate limited) | Summarize protocol content |

#### `query` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `submit` | mutation | protected | Submit RAG query to Claude |
| `history` | query | protected | Get query history |
| `searchHistory` | query | protected | Get search history (Pro) |
| `syncHistory` | mutation | protected (Pro) | Sync local history to cloud |
| `clearHistory` | mutation | protected | Clear search history |
| `deleteHistoryEntry` | mutation | protected | Delete single history entry |

#### `voice` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `transcribe` | mutation | rate limited | Transcribe audio (Whisper) |
| `uploadAudio` | mutation | rate limited | Upload audio for transcription |

#### `feedback` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `submit` | mutation | protected | Submit feedback |
| `myFeedback` | query | protected | Get user's feedback |

#### `contact` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `submit` | mutation | strict public rate limited | Submit contact form |
| `subscribeWaitlist` | mutation | strict public rate limited | Join waitlist |

#### `subscription` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `createCheckout` | mutation | protected | Create Stripe checkout session |
| `createPortal` | mutation | protected | Create Stripe portal session |
| `status` | query | protected | Get subscription status |
| `createDepartmentCheckout` | mutation | protected | Create agency checkout |

#### `admin` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `listFeedback` | query | admin | List all feedback |
| `updateFeedback` | mutation | admin | Update feedback status |
| `listUsers` | query | admin | List all users |
| `updateUserRole` | mutation | admin | Change user role |
| `listContactSubmissions` | query | admin | List contact forms |
| `updateContactStatus` | mutation | admin | Update contact status |
| `getAuditLogs` | query | admin | Get audit logs |

#### `agencyAdmin` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `myAgencies` | query | protected | Get user's agencies |
| `getAgency` | query | protected | Get agency details |
| `updateAgency` | mutation | protected | Update agency |
| `listMembers` | query | protected | List agency members |
| `inviteMember` | mutation | protected | Invite member |
| `updateMemberRole` | mutation | protected | Change member role |
| `removeMember` | mutation | protected | Remove member |
| `listProtocols` | query | protected | List agency protocols |
| `uploadProtocol` | mutation | protected | Upload protocol |
| `getUploadStatus` | query | protected | Check upload progress |
| `updateProtocolStatus` | mutation | protected | Change protocol status |
| `publishProtocol` | mutation | protected | Publish protocol |
| `archiveProtocol` | mutation | protected | Archive protocol |
| `listVersions` | query | protected | List protocol versions |
| `createVersion` | mutation | protected | Create new version |
| `getSearchAnalytics` | query | protected | Search analytics |
| `getProtocolAnalytics` | query | protected | Protocol analytics |
| `getUserAnalytics` | query | protected | User analytics |
| `getErrorAnalytics` | query | protected | Error analytics |
| `exportAnalytics` | mutation | protected | Export analytics |

#### `integration` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `logAccess` | mutation | strict public rate limited | Log partner access |
| `getStats` | query | admin | Integration statistics |
| `getRecentLogs` | query | admin | Recent integration logs |
| `getDailyUsage` | query | admin | Daily usage charts |

#### `referral` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getMyReferralCode` | query | protected | Get user's referral code |
| `getMyStats` | query | protected | Get referral statistics |
| `getMyReferrals` | query | protected | List referrals |
| `validateCode` | query | protected | Validate referral code |
| `redeemCode` | mutation | protected | Redeem referral code |
| `getShareTemplates` | query | protected | Get share templates |
| `getLeaderboard` | query | protected | Referral leaderboard |
| `trackViralEvent` | mutation | protected | Track viral event |

#### `jobs` Router
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `runDripEmails` | mutation | CRON_SECRET | Trigger drip email job |

---

## REST API Endpoints

These are raw Express routes outside of tRPC:

### Health & Monitoring
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Basic health check |
| `/api/ready` | GET | Kubernetes readiness probe |
| `/api/live` | GET | Kubernetes liveness probe |
| `/api/resilience` | GET | Circuit breaker status |

### OAuth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/supabase/callback` | GET | Supabase OAuth callback |

### Webhooks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/webhook` | POST | Stripe webhook handler |

### Integrations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/imagetrend/launch` | GET | ImageTrend deep link |
| `/api/imagetrend/health` | GET | ImageTrend integration health |
| `/api/imagetrend/suggest` | POST | AI protocol suggestions (mock) |
| `/api/imagetrend/export` | POST | Export to ePCR (mock) |

### Other
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/summarize` | POST | Protocol summarization (Claude) |
| `/api/client-error` | POST | Client error reporting (Sentry) |

---

## Authentication Flow

### Supabase Auth + Custom DB

1. **Login/Signup:** Client uses Supabase Auth (email/password or OAuth)
2. **Token Exchange:** Client receives Supabase JWT
3. **API Calls:** Client sends `Authorization: Bearer <jwt>`
4. **Context Creation:** Server validates JWT via Supabase Admin SDK
5. **User Lookup:** Server finds/creates user in MySQL by `supabase_id`
6. **Token Blacklist:** Check if user's tokens have been revoked

### Context Creation (`server/_core/context.ts`)

```typescript
export async function createContext(opts): Promise<TrpcContext> {
  // 1. Extract Bearer token
  const token = authHeader?.replace("Bearer ", "");
  
  // 2. Verify with Supabase
  const { data: { user: supabaseUser } } = await supabaseAdmin.auth.getUser(token);
  
  // 3. Find/create in our DB
  user = await db.findOrCreateUserBySupabaseId(supabaseUser.id, {...});
  
  // 4. Check token blacklist
  if (await isTokenRevoked(user.id)) user = null;
  
  return { req, res, user, trace };
}
```

### CSRF Protection

- **Pattern:** Double-submit cookie
- **Cookie:** `csrf_token` (httpOnly: false so JS can read)
- **Header:** `x-csrf-token`
- **Validation:** Constant-time comparison (prevents timing attacks)
- **Scope:** All mutations (queries are exempt)

---

## Middleware Stack

Order matters. Here's the actual order from `server/_core/index.ts`:

1. **CSP Nonce Generation** - Per-request nonce for inline scripts
2. **Helmet** - Security headers (CSP, HSTS, X-Frame-Options, etc.)
3. **Timeout** - 30s request timeout
4. **HTTP Logger** - Pino structured logging
5. **CORS** - Whitelist-based origin validation
6. **Stripe Webhook** - Raw body handler (before JSON parsing)
7. **JSON Parser** - 10MB limit
8. **Cookie Middleware** - Parse cookies, set CSRF token
9. **OAuth Routes** - Supabase callback
10. **Health Endpoints** - With rate limiting
11. **AI Endpoint** - `/api/summarize` with AI rate limiter
12. **ImageTrend Routes** - Integration endpoints
13. **tRPC Middleware** - Main API at `/api/trpc`
14. **Static Files** - Production only
15. **Sentry Error Handler** - Last, catches all errors

### Security Headers (Helmet)

```javascript
contentSecurityPolicy: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
  imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co"],
  connectSrc: ["'self'", "https://*.supabase.co", /* whitelisted domains */],
}
hsts: { maxAge: 31536000, preload: true }
frameguard: "deny"
```

---

## External Services

### Required Services

| Service | Purpose | Env Variable |
|---------|---------|--------------|
| **Supabase** | Auth, vector storage (pgvector) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **MySQL** | Primary database (users, queries, etc.) | `DATABASE_URL` |
| **Anthropic (Claude)** | RAG responses | `ANTHROPIC_API_KEY` |
| **Voyage AI** | Embedding generation | `VOYAGE_API_KEY` |
| **Stripe** | Payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

### Optional Services

| Service | Purpose | Env Variable |
|---------|---------|--------------|
| **Redis/Upstash** | Distributed rate limiting, caching | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Resend** | Transactional emails | `RESEND_API_KEY` |
| **Sentry** | Error tracking | `SENTRY_DSN` |
| **OpenAI** | Voice transcription (Whisper) | `OPENAI_API_KEY` |
| **Forge Storage** | File uploads | `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` |

### AI Model Usage

| Tier | Query Type | Model | Cost |
|------|------------|-------|------|
| Free | All queries | Claude Haiku 4.5 | ~$0.0003-0.0005/query |
| Pro | Simple queries | Claude Haiku 4.5 | ~$0.0003-0.0005/query |
| Pro | Complex queries | Claude Sonnet 4.5 | ~$0.002-0.004/query |

Complex query indicators: "multiple", "compare", "differential", "pediatric", "pregnancy", "mechanism"

---

## Error Handling

### Custom Error Types (`server/_core/errors.ts`)

```typescript
// Base class
class ProtocolGuideError extends Error {
  code: string;
  userMessage: string;
  statusCode: number;
  retryable: boolean;
  requestId?: string;
}

// Claude errors
ClaudeRateLimitError   // 429 - retryable
ClaudeAuthError        // 500 - not retryable
ClaudeServerError      // 503 - retryable
ClaudeOverloadedError  // 503 - retryable
ClaudeTimeoutError     // 504 - retryable

// Voyage errors
VoyageRateLimitError
VoyageAuthError
VoyageServerError
VoyageTimeoutError
```

### Retry Strategy

Claude API calls use exponential backoff:
- Max retries: 3
- Initial delay: 1000ms
- Max delay: 10000ms
- Backoff multiplier: 2x
- Jitter: 10-20% random variation

### tRPC Error Formatting

All tRPC errors include:
```json
{
  "code": "UNAUTHORIZED",
  "message": "User-friendly message",
  "data": {
    "requestId": "uuid-for-support",
    "timestamp": "ISO-8601"
  }
}
```

---

## Rate Limiting

### tRPC Procedures

| Procedure Type | Limit | Notes |
|----------------|-------|-------|
| `publicProcedure` | None | Open access |
| `publicRateLimitedProcedure` | 10 req/15min per IP | Public endpoints |
| `strictPublicRateLimitedProcedure` | 5 req/15min per IP | Sensitive public endpoints |
| `rateLimitedProcedure` | Tier-based daily limits | Authenticated endpoints |

### Daily Query Limits (tRPC)

| Tier | Daily Queries |
|------|---------------|
| Free | 10/day |
| Pro | 100/day |
| Enterprise | Unlimited |

### Express Rate Limiters (Redis-based)

| Limiter | Endpoint | Limit |
|---------|----------|-------|
| `publicLimiter` | Most endpoints | Tier-aware, IP-based |
| `searchLimiter` | Search endpoints | Free: 30/min, Pro: 100/min |
| `aiLimiter` | `/api/summarize` | Free: 10/min, Pro: 50/min |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706054400
X-RateLimit-Daily-Limit: 10
X-RateLimit-Daily-Remaining: 8
X-RateLimit-Daily-Reset: 1706140800
Retry-After: 300
```

---

## Database Layer

### Dual Database Architecture

1. **MySQL (Drizzle ORM)** - Primary database
   - Users, queries, feedback, agencies
   - Connection pooling with resilience wrapper

2. **Supabase (PostgreSQL + pgvector)** - Vector storage
   - Protocol embeddings
   - Semantic search via `search_protocols_semantic` RPC

### Database Modules (`server/db/`)

| Module | Purpose |
|--------|---------|
| `connection.ts` | Connection management, pooling |
| `users.ts` | User CRUD |
| `users-auth.ts` | OAuth, auth operations |
| `users-usage.ts` | Usage tracking, tier management |
| `counties.ts` | County operations |
| `protocols.ts` | Protocol CRUD |
| `protocols-search.ts` | Semantic search |
| `queries.ts` | Query history |
| `feedback.ts` | Feedback, contact forms |
| `admin.ts` | Admin ops, audit logs |
| `agencies.ts` | Agency management |
| `protocol-versions.ts` | Version control |

### Resilience

- **Circuit Breaker:** Prevents cascade failures
- **Fallback Cache:** In-memory cache when Redis unavailable
- **Slow Query Monitoring:** Logs queries >500ms as warning, >2000ms as error

---

## Netlify Edge Functions

Located in `netlify/edge-functions/`:

| Function | Path | Purpose |
|----------|------|---------|
| `cache-static.ts` | `/api/static/*` | CDN caching for stats/coverage |
| `geo-route.ts` | - | Geo-based routing |

---

## File Structure

```
server/
├── _core/                  # Core infrastructure
│   ├── index.ts           # Express server entry
│   ├── trpc.ts            # tRPC setup, procedures
│   ├── context.ts         # Request context creation
│   ├── claude.ts          # Claude AI integration
│   ├── errors.ts          # Custom error types
│   ├── logger.ts          # Pino logging
│   ├── rateLimit.ts       # In-memory rate limiting
│   ├── rateLimitRedis.ts  # Redis rate limiting
│   ├── redis.ts           # Redis client
│   ├── sentry.ts          # Sentry integration
│   ├── health.ts          # Health check handlers
│   ├── oauth.ts           # OAuth routes
│   ├── email.ts           # Resend email service
│   ├── cookies.ts         # Cookie utilities
│   ├── csrf.ts            # CSRF (deprecated, use tRPC)
│   ├── tier-validation.ts # Subscription tier checks
│   ├── token-blacklist.ts # Token revocation
│   ├── timeout.ts         # Request timeout
│   ├── tracing.ts         # Distributed tracing
│   ├── env.ts             # Environment validation
│   ├── embeddings/        # Voyage AI embeddings
│   ├── guardrails/        # Dose safety checks
│   ├── rag/               # RAG optimization
│   └── resilience/        # Circuit breakers, caches
│
├── api/                    # Express route handlers
│   ├── imagetrend.ts      # ImageTrend launch
│   ├── imagetrend-suggest.ts # AI suggestions
│   ├── summarize.ts       # Protocol summarization
│   └── client-error.ts    # Error reporting
│
├── routers/               # tRPC routers
│   ├── index.ts           # Router exports
│   ├── auth.ts
│   ├── counties.ts
│   ├── user.ts
│   ├── search.ts
│   ├── query.ts
│   ├── voice.ts
│   ├── feedback.ts
│   ├── contact.ts
│   ├── subscription.ts
│   ├── admin.ts
│   ├── integration.ts
│   ├── jobs.ts
│   ├── agency-admin/      # Agency management
│   │   ├── agency.ts
│   │   ├── analytics.ts
│   │   ├── middleware.ts
│   │   ├── protocols.ts
│   │   ├── staff.ts
│   │   └── versions.ts
│   └── referral/          # Referral system
│       ├── analytics-procedures.ts
│       ├── code-procedures.ts
│       ├── constants.ts
│       └── user-procedures.ts
│
├── db/                    # Database modules
│   ├── index.ts
│   ├── config.ts
│   ├── connection.ts
│   ├── users.ts
│   ├── users-auth.ts
│   ├── users-usage.ts
│   ├── counties.ts
│   ├── protocols.ts
│   ├── protocols-search.ts
│   ├── queries.ts
│   ├── feedback.ts
│   ├── admin.ts
│   ├── agencies.ts
│   └── protocol-versions.ts
│
├── webhooks/
│   └── stripe.ts          # Stripe webhook handler
│
├── jobs/
│   ├── protocol-processor.ts
│   └── send-drip-emails.ts
│
├── emails/
│   └── templates/
│       └── index.ts       # Email templates
│
├── lib/
│   ├── pricing.ts         # Pricing configuration
│   └── state-codes.ts     # State code utilities
│
├── routers.ts             # Main router composition
├── db.ts                  # DB re-exports
├── storage.ts             # File storage (Forge)
├── stripe.ts              # Stripe client
└── subscription-access.ts # Subscription helpers
```

---

## Quick Reference

### Adding a New tRPC Procedure

1. Create procedure in appropriate router (`server/routers/*.ts`)
2. Choose correct procedure type:
   - `publicProcedure` - No auth
   - `publicRateLimitedProcedure` - No auth + rate limit
   - `protectedProcedure` - Auth + CSRF
   - `adminProcedure` - Admin only
   - `rateLimitedProcedure` - Auth + daily limits
3. Add to router export
4. Types auto-propagate to client via `lib/trpc.ts`

### Adding a New Express Route

1. Add handler in `server/api/*.ts`
2. Register in `server/_core/index.ts`
3. Add appropriate rate limiter
4. Update CORS if needed

### Environment Variables

See `docs/ENVIRONMENT.md` for complete list. Critical ones:

```bash
# Required
DATABASE_URL=mysql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production
NODE_ENV=production
APP_URL=https://protocol-guide.com
```
