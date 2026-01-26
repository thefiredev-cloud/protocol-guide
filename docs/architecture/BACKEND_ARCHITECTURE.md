# Protocol Guide - Backend Architecture Documentation

## Overview

Protocol Guide uses a Node.js/Express backend with tRPC for type-safe APIs. The architecture emphasizes resilience, observability, and scalability.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │   Web App    │  │  Mobile App  │  │   API/CLI    │                       │
│  │ (React/Expo) │  │   (Expo)     │  │              │                       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                       │
└─────────┼────────────────┼────────────────┼─────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                  │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                    Express Server (index.ts)                        │     │
│  │  ┌──────────────────────────────────────────────────────────────┐  │     │
│  │  │  Middleware Chain:                                            │  │     │
│  │  │  1. CSP Nonce → 2. Helmet Security → 3. Timeout               │  │     │
│  │  │  4. HTTP Logger → 5. Rate Limiter → 6. CORS                   │  │     │
│  │  │  7. Body Parser → 8. Cookie/CSRF → 9. Sentry Error            │  │     │
│  │  └──────────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ROUTING LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      tRPC Router (appRouter)                         │    │
│  │  ┌─────────────────┬─────────────────┬─────────────────────────┐    │    │
│  │  │  Auth Router    │  Search Router  │  Query Router           │    │    │
│  │  │  User Router    │  Admin Router   │  Subscription Router    │    │    │
│  │  │  Voice Router   │  Agency Admin   │  Referral Router        │    │    │
│  │  │  Feedback       │  Contact        │  Integration Router     │    │    │
│  │  └─────────────────┴─────────────────┴─────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    REST Endpoints                                    │    │
│  │  /api/health  /api/ready  /api/live  /api/stripe/webhook            │    │
│  │  /api/summarize  /api/imagetrend/*  /api/resilience                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORE SERVICES LAYER                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │   Logger    │ │   Tracing   │ │   Errors    │ │   Rate Limiting     │    │
│  │   (Pino)    │ │ (Request ID)│ │ (Custom)    │ │   (Redis/Memory)    │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │   Health    │ │    CSRF     │ │   Cookies   │ │   Token Blacklist   │    │
│  │   Checks    │ │ Protection  │ │  Middleware │ │   (Revocation)      │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESILIENCE LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Service Registry                                  │    │
│  │  Tracks health of: database, redis, ai-claude, ai-voyage, supabase  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │  Circuit    │ │  In-Memory  │ │  Resilient  │ │   Resilient         │    │
│  │  Breakers   │ │   Cache     │ │   Redis     │ │   Database          │    │
│  │  (per svc)  │ │  (fallback) │ │   Client    │ │   Client            │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA ACCESS LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Database Functions (server/db/)                   │    │
│  │  users.ts  protocols.ts  agencies.ts  feedback.ts  queries.ts       │    │
│  │  admin.ts  counties.ts   config.ts    protocol-versions.ts          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │  Drizzle    │ │  Supabase   │ │   Redis     │ │   External APIs     │    │
│  │    ORM      │ │   Client    │ │   (Upstash) │ │  (Claude, Voyage)   │    │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘    │
└─────────┼────────────────┼────────────────┼──────────────────┼───────────────┘
          │                │                │                  │
          ▼                ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │  PostgreSQL │ │  Supabase   │ │   Upstash   │ │   AI Services       │    │
│  │  (Railway)  │ │  (pgvector) │ │   Redis     │ │  Claude + Voyage    │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                            │
│  │   Stripe    │ │   Resend    │ │   Sentry    │                            │
│  │  (Payments) │ │  (Email)    │ │ (Monitoring)│                            │
│  └─────────────┘ └─────────────┘ └─────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
server/
├── _core/                    # Core infrastructure (shared services)
│   ├── embeddings/           # Voyage AI embedding generation
│   ├── rag/                  # RAG pipeline (search, scoring, caching)
│   ├── resilience/           # Circuit breakers, fallback caches
│   │   ├── circuit-breaker.ts
│   │   ├── in-memory-cache.ts
│   │   ├── resilient-ai.ts
│   │   ├── resilient-db.ts
│   │   ├── resilient-redis.ts
│   │   └── service-registry.ts
│   ├── types/                # Shared type definitions
│   ├── index.ts              # Main server entry point
│   ├── claude.ts             # Claude AI integration
│   ├── context.ts            # tRPC context creation
│   ├── cookie-middleware.ts  # Cookie parsing + CSRF tokens
│   ├── csrf.ts               # CSRF protection utilities
│   ├── email.ts              # Email service (Resend)
│   ├── env.ts                # Environment validation (Zod)
│   ├── errors.ts             # Custom error types
│   ├── health.ts             # Health check handlers
│   ├── logger.ts             # Structured logging (Pino)
│   ├── oauth.ts              # OAuth routes (Supabase)
│   ├── rateLimit.ts          # Rate limiting core
│   ├── rateLimitRedis.ts     # Redis-based rate limiting
│   ├── redis.ts              # Redis client initialization
│   ├── search-cache.ts       # Search result caching
│   ├── sentry.ts             # Error tracking
│   ├── tier-validation.ts    # Subscription tier validation
│   ├── timeout.ts            # Request timeout middleware
│   ├── token-blacklist.ts    # Token revocation
│   ├── tracing.ts            # Distributed tracing
│   └── trpc.ts               # tRPC setup + procedures
│
├── api/                      # REST API handlers
│   ├── client-error.ts       # Client error reporting
│   ├── imagetrend.ts         # ImageTrend integration
│   └── summarize.ts          # AI summarization endpoint
│
├── db/                       # Database access layer
│   ├── index.ts              # Re-exports all DB functions
│   ├── connection.ts         # PostgreSQL connection pooling
│   ├── users.ts              # User CRUD operations
│   ├── protocols.ts          # Protocol queries
│   ├── agencies.ts           # Agency management
│   └── ...                   # Other domain-specific modules
│
├── jobs/                     # Background job processors
│   ├── protocol-processor.ts # PDF → chunks → embeddings
│   └── send-drip-emails.ts   # Email automation
│
├── lib/                      # Utility libraries
│   ├── pricing.ts            # Pricing calculations
│   └── state-codes.ts        # State code utilities
│
├── routers/                  # tRPC routers (controllers)
│   ├── index.ts              # Router composition
│   ├── auth.ts               # Authentication
│   ├── search.ts             # Semantic search
│   ├── query.ts              # AI query handling
│   ├── subscription.ts       # Stripe subscriptions
│   ├── agency-admin/         # Agency admin routes
│   └── referral/             # Referral system
│
├── webhooks/                 # Webhook handlers
│   └── stripe.ts             # Stripe webhook processing
│
└── emails/                   # Email templates
    └── templates/
```

## Core Patterns

### 1. tRPC Procedure Types

```typescript
// Public - no auth required, traced
publicProcedure

// Public rate-limited - IP-based limits (10/15min)
publicRateLimitedProcedure

// CSRF protected - for public mutations
csrfProtectedProcedure

// Protected - requires authentication + CSRF
protectedProcedure

// Admin - requires admin role + CSRF
adminProcedure

// Paid - requires Pro/Enterprise tier + CSRF
paidProcedure

// Rate-limited - enforces daily query limits
rateLimitedProcedure
```

### 2. Circuit Breaker Pattern

```typescript
// All external services wrapped in circuit breakers
const result = await ServiceRegistry.execute(
  'ai-claude',
  () => callClaude(params),
  () => fallbackResponse  // Optional fallback
);

// Circuit states: CLOSED → OPEN → HALF_OPEN → CLOSED
// Automatic recovery after resetTimeout (30-60s)
```

### 3. Request Tracing

```typescript
// Every request gets a trace context
interface TraceContext {
  requestId: string;    // req_<uuid>
  startTime: number;
  source: 'web' | 'mobile' | 'api';
  userId?: string;
  userTier?: string;
}

// All logs include requestId for correlation
logger.info({ requestId }, 'Operation completed');
```

### 4. Error Handling

```typescript
// Custom errors with user-friendly messages
class ProtocolGuideError extends Error {
  code: string;          // Machine-readable code
  userMessage: string;   // Safe for display
  statusCode: number;    // HTTP status
  retryable: boolean;    // Can retry?
  requestId?: string;    // For debugging
}

// Specific error types for each service
ClaudeRateLimitError, ClaudeTimeoutError, etc.
VoyageRateLimitError, VoyageServerError, etc.
```

### 5. Rate Limiting Tiers

| Tier       | Search/min | AI/min | Daily Queries |
|------------|-----------|--------|---------------|
| Free       | 30        | 10     | 20            |
| Pro        | 100       | 50     | Unlimited     |
| Enterprise | 500       | 200    | Unlimited     |

### 6. Health Check Levels

```
/api/live   → Process alive (instant)
/api/ready  → Can accept traffic (DB check)
/api/health → Full service check (all dependencies)
```

## Service Dependencies

```
┌──────────────────────────────────────────────────────────────────┐
│                     CRITICAL PATH                                 │
│  User Request → Auth → Database → Response                       │
│                                                                   │
│  Circuit Breaker: 5 failures / 60s → OPEN for 30s               │
│  Fallback: Return cached user data / graceful degradation        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     SEARCH PATH                                   │
│  Query → Normalize → Cache Check → Voyage (embed) →              │
│  Supabase (pgvector) → Rerank → Cache Store → Response           │
│                                                                   │
│  Circuit Breaker: 3 failures / 120s → OPEN for 60s              │
│  Fallback: Return cached results / keyword search                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     AI QUERY PATH                                 │
│  Query → Context Retrieval → Claude (generate) →                 │
│  Response Validation → Usage Tracking → Response                 │
│                                                                   │
│  Circuit Breaker: 3 failures / 120s → OPEN for 60s              │
│  Fallback: Return "AI unavailable" with cached context           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     CACHING LAYER                                 │
│  Primary: Upstash Redis (distributed)                            │
│  Fallback: In-memory LRU cache (per-instance)                    │
│                                                                   │
│  Circuit Breaker: 3 failures / 30s → OPEN for 15s               │
│  Fallback: Always available (in-memory)                          │
└──────────────────────────────────────────────────────────────────┘
```

## Database Architecture

### PostgreSQL (via Drizzle ORM)

- **Connection Pooling**: 10-20 connections based on environment
- **Slow Query Detection**: Warning at 500ms, Error at 2000ms
- **Timeout**: 10-30s depending on operation type

### Supabase (pgvector)

- **Vector Storage**: Protocol chunks with 1024-dim embeddings
- **Similarity Search**: Cosine similarity with RLS policies
- **Row-Level Security**: Agency-scoped data access

## Configuration Management

Environment variables validated at startup with Zod:

```typescript
const envSchema = z.object({
  // Required - AI Services
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  VOYAGE_API_KEY: z.string().startsWith('pa-'),
  
  // Required - Database
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  
  // Required - Auth
  JWT_SECRET: z.string().min(32),
  
  // Optional - Redis (falls back to in-memory)
  REDIS_URL: z.string().url().optional(),
});
```

## Graceful Shutdown

```typescript
const shutdown = async () => {
  logger.info("Shutting down gracefully...");
  
  // 1. Stop accepting new connections
  server.close();
  
  // 2. Wait for in-flight requests (up to 10s)
  await Promise.race([
    waitForConnections(),
    setTimeout(10000)
  ]);
  
  // 3. Close database connections
  await closeDb();
  
  // 4. Exit
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

## Security Headers

All responses include:
- `Content-Security-Policy` (nonce-based)
- `Strict-Transport-Security` (1 year, preload)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (restrictive)

## Monitoring & Observability

### Logging (Pino)
- Structured JSON in production
- Pretty-printed in development
- Request ID correlation
- User context (ID, tier)

### Error Tracking (Sentry)
- Automatic error capture
- Request context enrichment
- Source maps for stack traces

### Health Monitoring
- `/api/health` for full service status
- `/api/resilience` for circuit breaker states
- Memory usage tracking

## For New Developers

### Quick Start

1. **Copy environment**:
   ```bash
   cp .env.example .env
   # Fill in required values
   ```

2. **Start development**:
   ```bash
   npm run dev:server
   ```

3. **Key files to understand**:
   - `server/_core/index.ts` - Server setup
   - `server/_core/trpc.ts` - Procedure definitions
   - `server/_core/context.ts` - Request context
   - `server/routers/index.ts` - All routes

### Adding a New Endpoint

1. Create router in `server/routers/`:
   ```typescript
   import { router, protectedProcedure } from '../_core/trpc';
   
   export const myRouter = router({
     myEndpoint: protectedProcedure
       .input(z.object({ ... }))
       .mutation(async ({ input, ctx }) => {
         // Use ctx.user, ctx.trace, ctx.log
       }),
   });
   ```

2. Export from `server/routers/index.ts`

3. Add to `appRouter` in `server/routers.ts`

### Adding a New External Service

1. Create circuit breaker in `service-registry.ts`
2. Create resilient wrapper in `_core/resilience/`
3. Add health check in `health.ts`
4. Add to service dependency documentation

## References

- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Pino Logger](https://getpino.io/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
