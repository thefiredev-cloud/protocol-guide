# Error Recovery and Circuit Breaker System

## Overview

The Error Recovery System ensures the Medic-Bot application **NEVER fails completely** by implementing multiple layers of fallback strategies. This is critical for a medical application where uptime is essential.

## Architecture

### Components

1. **Circuit Breaker** (`/lib/protocols/circuit-breaker.ts`)
   - Prevents cascade failures
   - Three states: closed, open, half-open
   - Configurable failure thresholds and timeouts

2. **Error Recovery Manager** (`/lib/protocols/error-recovery.ts`)
   - Retry with exponential backoff
   - Multi-strategy fallback system
   - Cache management

3. **Error Logger** (`/lib/protocols/error-logger.ts`)
   - Structured error logging
   - Statistics and monitoring
   - Export capabilities

4. **Health Check** (`/lib/protocols/health-check.ts`)
   - System component monitoring
   - Quick health checks for load balancers
   - Detailed diagnostics

## Fallback Strategy

### Protocol Retrieval

```
1. Database lookup (with retry)
   ↓ fails
2. In-memory cache
   ↓ fails
3. File-based system (MiniSearch)
   ↓ fails
4. Conservative default (returns error, NEVER dangerous info)
```

### Search Operations

```
1. Database hybrid search (full-text + vector)
   ↓ fails
2. File-based MiniSearch
   ↓ fails
3. Return empty with helpful message
```

## Usage

### Basic Protocol Retrieval

```typescript
import { getProtocolErrorRecovery } from '@/lib/protocols/error-recovery';

const recovery = getProtocolErrorRecovery();

// Retrieves protocol with automatic fallbacks
const result = await recovery.retrieveProtocolWithFallback('1210');

if (result.success) {
  console.log('Protocol:', result.data);
  console.log('Retrieved via:', result.strategyUsed);
  console.log('Fallbacks used:', result.fallbacksUsed);
} else {
  console.error('All strategies failed:', result.error);
}
```

### Search with Fallback

```typescript
const searchResult = await recovery.searchWithFallback('cardiac arrest', {
  limit: 10,
  category: 'Cardiac'
});

if (searchResult.success) {
  console.log('Found:', searchResult.data.length, 'results');
} else {
  console.log('No results found');
}
```

### Circuit Breaker

```typescript
const result = await recovery.executeWithCircuitBreaker(
  'database-operation',
  () => performDatabaseOperation(),
  () => performFallbackOperation() // Optional fallback
);
```

### Retry with Backoff

```typescript
const result = await recovery.retryWithBackoff(
  () => performOperation(),
  3,      // max attempts
  1000,   // base delay (ms)
  'my-operation'
);
```

## Monitoring

### Health Check

```typescript
import { getProtocolHealthCheck } from '@/lib/protocols/health-check';

const healthCheck = getProtocolHealthCheck();

// Comprehensive check
const health = await healthCheck.check();
console.log('Status:', health.status); // 'healthy' | 'degraded' | 'unhealthy'
console.log('Database:', health.checks.database);
console.log('Cache:', health.checks.cache);
console.log('Circuit Breakers:', health.checks.circuitBreakers);

// Quick check (fast, for load balancers)
const quickHealth = await healthCheck.quickCheck();
console.log('Status:', quickHealth.status);
```

### Error Logging

```typescript
import { getProtocolErrorLogger } from '@/lib/protocols/error-logger';

const errorLogger = getProtocolErrorLogger();

// Get statistics
const stats = errorLogger.getStatistics();
console.log('Total operations:', stats.total);
console.log('Success rate:', (stats.successful / stats.total) * 100);
console.log('Average recovery time:', stats.averageRecoveryTime, 'ms');

// Get recent logs
const recentLogs = errorLogger.getRecentLogs(50);

// Get failed operations
const failures = errorLogger.getFailedOperations();

// Export logs for analysis
const logsJson = errorLogger.exportLogs();
```

### Cache Management

```typescript
const recovery = getProtocolErrorRecovery();

// Get cache statistics
const cacheStats = recovery.getCacheStats();
console.log('Cached protocols:', cacheStats.size);
console.log('Cache entries:', cacheStats.entries);

// Clear cache (forces fresh retrieval)
recovery.clearCache();
```

### Circuit Breaker Management

```typescript
// Get circuit breaker status
const breakerStatus = recovery.getCircuitBreakerStatus();
for (const [key, status] of Object.entries(breakerStatus)) {
  console.log(`${key}: ${status.state} (${status.failures} failures)`);
}

// Reset all circuit breakers (for recovery)
recovery.resetAllCircuitBreakers();
```

## Configuration

### Circuit Breaker Settings

```typescript
const breaker = new CircuitBreaker('my-key', {
  threshold: 3,           // Open after 3 failures
  timeout: 60000,         // Keep open for 60 seconds
  resetTimeout: 30000,    // Try half-open after 30 seconds
  halfOpenRequests: 3     // Allow 3 requests in half-open state
});
```

### Cache Settings

- **TTL**: 1 hour (3600000 ms)
- **Automatic expiration**: Yes
- **Max size**: Unlimited (managed by memory)

### Retry Settings

- **Default max attempts**: 3
- **Base delay**: 1000ms
- **Backoff strategy**: Exponential (2^attempt)
- **Example delays**: 1s, 2s, 4s, 8s...

## API Endpoints

### Health Check Endpoint

Create `/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getProtocolHealthCheck } from '@/lib/protocols/health-check';

export async function GET() {
  const healthCheck = getProtocolHealthCheck();
  const health = await healthCheck.check();

  const statusCode = health.status === 'healthy' ? 200
    : health.status === 'degraded' ? 200
    : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

Usage: `curl http://localhost:3000/api/health`

### Quick Health Check (for Load Balancers)

```typescript
// /app/api/health/quick/route.ts
export async function GET() {
  const healthCheck = getProtocolHealthCheck();
  const health = await healthCheck.quickCheck();

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  });
}
```

## Testing

Run tests:
```bash
npm test tests/unit/error-recovery.test.ts
```

## Performance Metrics

### Expected Performance

- **Cache hit rate**: 90%+ for common protocols
- **Database retrieval**: < 100ms (p95)
- **File fallback**: < 200ms (p95)
- **Circuit breaker overhead**: < 1ms

### Recovery Times

- **Retry with backoff**: 1-8 seconds (depends on attempts)
- **Cache fallback**: < 10ms
- **File fallback**: < 200ms

## Best Practices

1. **Always use recovery methods** instead of direct database calls
2. **Monitor circuit breaker status** in production
3. **Review error logs regularly** to identify systemic issues
4. **Set up alerts** for degraded/unhealthy status
5. **Test fallback paths** in development
6. **Don't clear cache** in production without reason
7. **Reset circuit breakers** only when you've fixed underlying issues

## Troubleshooting

### Circuit Breaker Stuck Open

```typescript
// Check status
const status = recovery.getCircuitBreakerStatus();

// Reset if needed
recovery.resetAllCircuitBreakers();
```

### Cache Not Working

```typescript
// Check cache stats
const stats = recovery.getCacheStats();
console.log('Cache size:', stats.size);

// Verify cache entries
console.log('Entries:', stats.entries);
```

### All Strategies Failing

```typescript
// Check health
const health = await healthCheck.check();

// Check specific components
console.log('Database:', health.checks.database);
console.log('File system:', health.checks.fileSystem);

// Review error logs
const failures = errorLogger.getFailedOperations();
```

## Integration with Existing Code

### Update RetrievalManager

```typescript
// In lib/managers/RetrievalManager.ts
import { getProtocolErrorRecovery } from '@/lib/protocols/error-recovery';

class RetrievalManager {
  private recovery = getProtocolErrorRecovery();

  async getProtocol(tpCode: string) {
    const result = await this.recovery.retrieveProtocolWithFallback(tpCode);

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }
}
```

## Production Deployment

1. **Enable health checks** on all instances
2. **Configure monitoring** for circuit breaker states
3. **Set up alerts** for unhealthy status
4. **Monitor cache hit rates** in metrics
5. **Review error logs** daily
6. **Test fallback paths** before deployment

## Success Criteria

- ✅ System never returns no response (always has fallback)
- ✅ Database failures don't break the app
- ✅ Circuit breakers prevent cascade failures
- ✅ Cache provides 90%+ hit rate for common protocols
- ✅ All recovery paths tested
- ✅ Health checks available for monitoring
- ✅ Error logging provides actionable insights
