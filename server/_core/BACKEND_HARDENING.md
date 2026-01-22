# Backend Infrastructure Hardening - Implementation Guide

## Overview

This document describes the backend infrastructure hardening improvements implemented for Protocol Guide.

## Improvements Implemented

### 1. Redis-Based Rate Limiting

**Problem**: In-memory rate limiting fails under load and resets on every deploy.

**Solution**: Implemented distributed rate limiting with Upstash Redis.

**Files**:
- `/server/_core/redis.ts` - Redis client initialization
- `/server/_core/rateLimitRedis.ts` - Redis-based rate limiting with tier support
- `/server/_core/index.ts` - Integrated Redis rate limiters

**Features**:
- Distributed rate limiting across multiple instances
- Automatic fallback to in-memory for development
- Tier-based limits (free/pro/premium)
- Sliding window algorithm for accurate rate limiting

**Configuration**:
```env
REDIS_URL=your_upstash_redis_url
REDIS_TOKEN=your_upstash_redis_token
# OR
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

**Rate Limits by Tier**:

| Endpoint | Free | Pro | Premium |
|----------|------|-----|---------|
| Search | 30/min | 100/min | 500/min |
| AI | 10/min | 50/min | 200/min |
| Public | 100/min | 300/min | 1000/min |

### 2. Request Timeout Middleware

**Problem**: No timeout protection leads to hanging connections and resource exhaustion.

**Solution**: Implemented 30-second timeout for all requests.

**File**: `/server/_core/timeout.ts`

**Features**:
- Configurable timeout (default: 30s)
- Excludes health checks and webhooks
- Logs slow requests (>5s)
- Returns 408 status with retry information

**Usage**:
```typescript
app.use(createTimeoutMiddleware({ timeout: 30000 }));
```

### 3. Structured Logging with Pino

**Problem**: No structured logging makes debugging and monitoring difficult.

**Solution**: Implemented Pino logger with request ID tracking.

**File**: `/server/_core/logger.ts`

**Features**:
- Structured JSON logging in production
- Pretty-printed logs in development
- Request ID tracking (X-Request-ID header)
- User context (ID, email, subscription tier)
- Performance timing
- Automatic log levels based on status codes

**Log Levels**:
- 500+ errors: `error`
- 400-499 errors: `warn`
- 200-399 success: `info`

**Usage**:
```typescript
import { logger, httpLogger } from './logger';

// HTTP logging middleware
app.use(httpLogger);

// Manual logging
logger.info({ userId: 123 }, "User logged in");
logger.error({ error, userId: 123 }, "Operation failed");
```

### 4. Enhanced Health Checks

**Problem**: Shallow health checks don't verify critical service connectivity.

**Solution**: Deep health checks for all critical services.

**File**: `/server/_core/health.ts` (already existed, now integrated)

**Endpoints**:

1. **`GET /api/health`** - Basic health check
   ```json
   {
     "ok": true,
     "timestamp": 1234567890,
     "uptime": 3600
   }
   ```

2. **`GET /api/health?detailed=true`** - Deep health check
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-22T12:00:00Z",
     "version": "1.0.0",
     "environment": "production",
     "uptime": 3600,
     "services": {
       "database": { "status": "ok", "latencyMs": 45 },
       "supabase": { "status": "ok", "latencyMs": 120 },
       "claude": { "status": "ok", "latencyMs": 890 },
       "voyage": { "status": "ok", "latencyMs": 650 }
     },
     "resources": {
       "memoryUsedMB": 256,
       "memoryTotalMB": 2048,
       "memoryPercentage": 12
     }
   }
   ```

3. **`GET /api/ready`** - Kubernetes readiness probe
   - Returns 200 if ready to accept traffic
   - Returns 503 if not ready

4. **`GET /api/live`** - Kubernetes liveness probe
   - Returns 200 if process is alive

**Health Status**:
- `healthy` - All services operational
- `degraded` - Non-critical services down (e.g., Redis)
- `unhealthy` - Critical services down (e.g., Database)

### 5. Tier-Based Rate Limiting

**Problem**: All users share the same rate limits regardless of subscription.

**Solution**: Per-user rate limits based on subscription tier.

**Implementation**:
- Rate limit key includes user ID (not just IP)
- Looks up subscription tier from user context
- Applies appropriate limits from tier configuration
- Fallback to IP-based for unauthenticated requests

**How It Works**:
1. User authenticated via JWT token
2. Context middleware extracts user and subscription tier
3. Rate limiter uses `user:{userId}` as key
4. Redis stores per-user counters with TTL
5. Different limits applied based on tier

## Environment Variables

Add these to your `.env` file or Netlify environment:

```env
# Redis (Optional - for production)
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your_token_here

# Logging (Optional)
LOG_LEVEL=info  # debug, info, warn, error
```

## Deployment Checklist

### Local Development
- [ ] No Redis required (automatic fallback to in-memory)
- [ ] Logs are pretty-printed for readability
- [ ] Health checks work without Redis

### Production (Netlify)
- [ ] Add Redis environment variables to Netlify
- [ ] Configure Upstash Redis instance
- [ ] Set `LOG_LEVEL=info` for production
- [ ] Test health checks after deploy
- [ ] Verify rate limiting with Redis works

## Testing

### Test Rate Limiting
```bash
# Should fail after tier limit
for i in {1..50}; do
  curl -X POST https://your-api.com/api/trpc/search \
    -H "Authorization: Bearer $TOKEN"
done
```

### Test Timeout
```bash
# Simulate slow endpoint (should timeout at 30s)
curl -X POST https://your-api.com/api/slow-endpoint
```

### Test Health Checks
```bash
# Basic health
curl https://your-api.com/api/health

# Deep health check
curl https://your-api.com/api/health?detailed=true

# Kubernetes probes
curl https://your-api.com/api/ready
curl https://your-api.com/api/live
```

### Test Logging
```bash
# Check logs include request IDs
curl -H "X-Request-ID: test-123" https://your-api.com/api/health

# Verify logs in Netlify dashboard
```

## Monitoring

### Key Metrics to Track

1. **Rate Limit Hits**
   - Monitor 429 responses by tier
   - Alert if free tier hitting limits frequently
   - Track pro/premium upgrades

2. **Request Timeouts**
   - Monitor 408 responses
   - Identify slow endpoints
   - Optimize queries causing timeouts

3. **Service Health**
   - Monitor `/api/health?detailed=true`
   - Alert on `unhealthy` status
   - Track service latencies

4. **Redis Connectivity**
   - Monitor Redis connection errors
   - Alert if falling back to in-memory
   - Track Redis latency

### Recommended Alerts

1. **Critical**:
   - Health status = `unhealthy`
   - Database connectivity fails
   - Redis down in production

2. **Warning**:
   - Health status = `degraded`
   - Request timeouts > 5% of requests
   - Service latency > 2s
   - Memory usage > 80%

3. **Info**:
   - Rate limit hits per tier
   - Slow requests (>5s)
   - Redis fallback events

## Performance Impact

### Before
- Rate limiting: In-memory (lost on deploy)
- Logging: console.log (no structure)
- Timeouts: None (hanging connections)
- Health checks: Basic (no service verification)

### After
- Rate limiting: Redis (distributed, persistent)
- Logging: Structured JSON with request tracking
- Timeouts: 30s with monitoring
- Health checks: Deep service verification

### Expected Overhead
- Redis rate limiting: +5-10ms per request
- Logging middleware: +1-2ms per request
- Timeout middleware: <1ms per request
- Total overhead: +6-13ms per request

## Troubleshooting

### Redis Connection Issues
```typescript
// Check Redis status
import { isRedisAvailable, testRedisConnection } from './redis';

console.log('Redis available:', isRedisAvailable());
await testRedisConnection(); // Returns true/false
```

### Rate Limiting Not Working
1. Verify Redis is connected
2. Check user authentication
3. Verify subscription tier in user object
4. Check Redis keys: `KEYS ratelimit:*`

### Logs Not Showing
1. Check `LOG_LEVEL` environment variable
2. Verify httpLogger middleware is registered
3. Check Netlify function logs

### Timeouts Too Aggressive
```typescript
// Increase timeout for specific routes
app.use('/api/long-task', createTimeoutMiddleware({ timeout: 60000 }));
```

## Future Enhancements

1. **Caching Layer**
   - Add Redis caching for expensive queries
   - Cache search results
   - Cache embeddings lookups

2. **Connection Pooling**
   - Implement database connection pooling
   - Reuse HTTP connections for external APIs

3. **Queue System**
   - Move heavy tasks to async queue
   - Background processing for embeddings
   - Batch operations

4. **Advanced Monitoring**
   - APM integration (DataDog, New Relic)
   - Distributed tracing
   - Real-time metrics dashboard

5. **Auto-Scaling**
   - Horizontal scaling based on metrics
   - Load balancing across instances
   - Edge function optimization

## References

- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Pino Logger Documentation](https://getpino.io/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
