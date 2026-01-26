# Service Dependency Map

## Overview

This document maps all service dependencies in Protocol Guide, including their criticality, failure modes, and fallback strategies.

## Dependency Matrix

| Service | Type | Critical? | Circuit Breaker | Fallback Strategy |
|---------|------|-----------|-----------------|-------------------|
| PostgreSQL (Railway) | Database | ✅ YES | 5 failures/60s | None - fail request |
| Supabase (pgvector) | Vector DB | ✅ YES | 5 failures/60s | Keyword search |
| Redis (Upstash) | Cache | ❌ No | 3 failures/30s | In-memory cache |
| Claude API | AI | ❌ No | 3 failures/120s | Cached responses |
| Voyage AI | Embeddings | ⚠️ Partial | 3 failures/120s | Cached embeddings |
| Stripe | Payments | ❌ No | None | Queue for retry |
| Resend | Email | ❌ No | None | Log + retry later |
| Sentry | Monitoring | ❌ No | None | Log locally |

## Service Flow Diagrams

### Authentication Flow

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ Client  │────▶│ Express  │────▶│  Supabase  │────▶│ Database │
│         │     │ Context  │     │   Auth     │     │  (Users) │
└─────────┘     └──────────┘     └────────────┘     └──────────┘
                     │                                    │
                     │         ┌────────────┐             │
                     └────────▶│   Redis    │◀────────────┘
                               │ (Blacklist)│
                               └────────────┘

Critical Path: Supabase Auth → Database
Fallback: None (auth is critical)
Degraded Mode: N/A
```

### Search Flow

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ Query   │────▶│Normalizer│────▶│   Redis    │────▶│ Cache    │
│         │     │          │     │   Cache    │     │   HIT?   │
└─────────┘     └──────────┘     └────────────┘     └────┬─────┘
                                                        │
                    ┌───────────────────────────────────┘
                    │ MISS
                    ▼
              ┌──────────┐     ┌────────────┐     ┌──────────┐
              │ Voyage   │────▶│  Supabase  │────▶│  Rerank  │
              │ Embed    │     │  pgvector  │     │          │
              └──────────┘     └────────────┘     └──────────┘
                    │                                    │
                    ▼                                    ▼
              ┌──────────┐                        ┌──────────┐
              │ Circuit  │                        │  Cache   │
              │ Breaker  │                        │  Store   │
              └──────────┘                        └──────────┘

Critical Path: Voyage → Supabase
Fallback: Cached results, then keyword search
Degraded Mode: Stale results with warning
```

### AI Query Flow

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ User    │────▶│  Search  │────▶│  Context   │────▶│  Claude  │
│ Query   │     │ (RAG)    │     │  Builder   │     │   API    │
└─────────┘     └──────────┘     └────────────┘     └──────────┘
                     │                                    │
                     ▼                                    ▼
              ┌──────────┐                        ┌──────────┐
              │ Supabase │                        │ Circuit  │
              │ Chunks   │                        │ Breaker  │
              └──────────┘                        └──────────┘
                                                        │
                                                        ▼
                                                 ┌──────────┐
                                                 │ Response │
                                                 │ Cache    │
                                                 └──────────┘

Critical Path: Supabase → Claude
Fallback: Return retrieved context without AI summary
Degraded Mode: "AI temporarily unavailable" + raw context
```

### Payment Flow

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ User    │────▶│ Checkout │────▶│  Stripe    │────▶│ Webhook  │
│ Upgrade │     │ Session  │     │   API      │     │ Handler  │
└─────────┘     └──────────┘     └────────────┘     └──────────┘
                                                        │
                                                        ▼
                                                 ┌──────────┐
                                                 │ Database │
                                                 │ (Update) │
                                                 └──────────┘

Critical Path: Stripe API → Database
Fallback: Webhook retry (Stripe handles)
Degraded Mode: Delayed subscription activation
```

## Circuit Breaker Configurations

### Database Circuit Breaker
```typescript
{
  name: 'database',
  failureThreshold: 5,      // Open after 5 failures
  successThreshold: 3,      // Close after 3 successes
  resetTimeout: 30000,      // Try again after 30s
  failureWindow: 60000,     // Within 1 minute
}
```

### AI Service Circuit Breaker
```typescript
{
  name: 'ai-claude',
  failureThreshold: 3,      // Open after 3 failures
  successThreshold: 2,      // Close after 2 successes
  resetTimeout: 60000,      // Try again after 60s
  failureWindow: 120000,    // Within 2 minutes
}
```

### Redis Circuit Breaker
```typescript
{
  name: 'redis',
  failureThreshold: 3,      // Open after 3 failures
  successThreshold: 2,      // Close after 2 successes
  resetTimeout: 15000,      // Try again after 15s
  failureWindow: 30000,     // Within 30 seconds
}
```

## Failure Scenarios

### Scenario 1: Database Unavailable

**Symptoms:**
- All auth fails
- All queries fail
- Health check returns `unhealthy`

**Response:**
- Circuit breaker opens
- Return 503 Service Unavailable
- Alert operations team

**Recovery:**
- Wait for database reconnection
- Circuit breaker auto-recovers in HALF_OPEN state
- Gradual traffic restoration

### Scenario 2: Redis Unavailable

**Symptoms:**
- Rate limiting falls back to in-memory
- Search cache misses increase
- Health check returns `degraded`

**Response:**
- Automatic fallback to in-memory caching
- Log warning
- Continue serving requests

**Impact:**
- Rate limits may be per-instance (not distributed)
- Search latency increases
- No user-facing errors

### Scenario 3: Claude API Rate Limited

**Symptoms:**
- AI queries fail with 429
- Circuit breaker may open

**Response:**
- Return cached AI responses if available
- Fall back to "context only" mode
- User sees retrieved context without AI summary

**Impact:**
- Degraded AI experience
- Core search still functional

### Scenario 4: Voyage API Unavailable

**Symptoms:**
- New search embeddings fail
- Circuit breaker opens

**Response:**
- Use cached embeddings if available
- Fall back to keyword search
- Log error

**Impact:**
- Search quality degrades
- Exact matches still work

## Health Check Dependencies

```
/api/live
├── Process running? ✓

/api/ready
├── Database connected? ✓

/api/health (detailed)
├── Database (PostgreSQL)
│   ├── Connected?
│   └── Latency < 500ms?
├── Supabase
│   ├── Connected?
│   └── Latency < 1000ms?
├── Claude API
│   ├── API key valid?
│   └── Not rate limited?
├── Voyage API
│   ├── API key valid?
│   └── Not rate limited?
└── Redis
    ├── Connected?
    └── Using fallback?
```

## Monitoring Alerts

### Critical (Page On-Call)
- Database circuit breaker OPEN
- Health status = unhealthy
- Authentication failures > 10/min

### Warning (Slack Alert)
- Any circuit breaker OPEN
- Health status = degraded
- Search latency p99 > 3s
- Redis using fallback mode

### Info (Dashboard)
- Circuit breaker state changes
- Rate limit hits by tier
- Cache hit ratios
- Slow query counts

## Connection Limits

| Service | Pool Size (Dev) | Pool Size (Prod) | Timeout |
|---------|-----------------|------------------|---------|
| PostgreSQL | 10 | 20 | 10s |
| Supabase | N/A | N/A | 10s |
| Redis | N/A | N/A | 5s |
| Claude API | N/A | N/A | 30s |
| Voyage API | N/A | N/A | 15s |

## Environment-Specific Behavior

### Development
- Redis: Falls back to in-memory (no Redis required)
- Rate limits: More lenient
- Logging: Pretty-printed
- Health checks: Skip external API validation

### Production
- Redis: Required for distributed rate limiting
- Rate limits: Enforced per tier
- Logging: JSON structured
- Health checks: Full service validation
