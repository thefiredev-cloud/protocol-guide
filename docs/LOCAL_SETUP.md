# Local Development Setup - Error Recovery System

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase project (for database features)
- Git

## Quick Start

### 1. Clone and Install

```bash
cd /Users/tanner-osterkamp/Medic-Bot
npm install
```

### 2. Environment Variables

Create `.env.local` file:

```bash
# Supabase (for database fallback)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: LLM configuration
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4
```

### 3. Start Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## Testing Error Recovery

### Unit Tests

```bash
# Run all error recovery tests
npm test tests/unit/error-recovery.test.ts

# Watch mode
npm test tests/unit/error-recovery.test.ts -- --watch

# With coverage
npm test tests/unit/error-recovery.test.ts -- --coverage
```

### Manual Testing

#### 1. Test Health Checks

```bash
# Comprehensive health check
curl http://localhost:3000/api/health/protocols

# Quick health check
curl http://localhost:3000/api/health/quick
```

Expected response (healthy):
```json
{
  "status": "healthy",
  "timestamp": "2025-01-04T10:30:00Z",
  "checks": {
    "database": { "status": "healthy" },
    "cache": { "status": "healthy" },
    "circuitBreakers": { "status": "healthy" },
    "fileSystem": { "status": "healthy" }
  },
  "responseTimeMs": 125
}
```

#### 2. Test Protocol Retrieval with Fallbacks

Create a test file `test-recovery.ts`:

```typescript
import { getProtocolErrorRecovery } from './lib/protocols/error-recovery';

async function testRecovery() {
  const recovery = getProtocolErrorRecovery();

  // Test successful retrieval
  console.log('Testing protocol retrieval...');
  const result = await recovery.retrieveProtocolWithFallback('1210');

  if (result.success) {
    console.log('✅ Success!');
    console.log('  Protocol:', result.data?.tp_name);
    console.log('  Strategy:', result.strategyUsed);
    console.log('  Time:', result.recoveryTimeMs, 'ms');
    console.log('  Fallbacks:', result.fallbacksUsed);
  } else {
    console.log('❌ Failed:', result.error?.message);
    console.log('  Fallbacks tried:', result.fallbacksUsed);
  }

  // Test search
  console.log('\nTesting search...');
  const searchResult = await recovery.searchWithFallback('cardiac arrest');
  console.log('  Found:', searchResult.data?.length, 'results');
  console.log('  Strategy:', searchResult.strategyUsed);
}

testRecovery().catch(console.error);
```

Run it:
```bash
npx tsx test-recovery.ts
```

#### 3. Test Circuit Breaker

```typescript
import { getProtocolErrorRecovery } from './lib/protocols/error-recovery';

async function testCircuitBreaker() {
  const recovery = getProtocolErrorRecovery();

  // Simulate failures
  const failingOp = () => Promise.reject(new Error('Simulated failure'));
  const fallback = () => Promise.resolve('fallback-data');

  console.log('Triggering circuit breaker...');

  // Trigger 3 failures
  for (let i = 0; i < 3; i++) {
    await recovery.executeWithCircuitBreaker('test-key', failingOp, fallback);
  }

  // Check circuit breaker status
  const status = recovery.getCircuitBreakerStatus();
  console.log('Circuit breaker status:', status['test-key']);

  // Try again (should use fallback immediately)
  const result = await recovery.executeWithCircuitBreaker('test-key', failingOp, fallback);
  console.log('Result with open circuit:', result);
}

testCircuitBreaker().catch(console.error);
```

#### 4. Test Cache

```typescript
import { getProtocolErrorRecovery } from './lib/protocols/error-recovery';

async function testCache() {
  const recovery = getProtocolErrorRecovery();

  // Get cache stats
  console.log('Initial cache:', recovery.getCacheStats());

  // Retrieve a protocol (will cache it)
  await recovery.retrieveProtocolWithFallback('1210');

  // Check cache again
  console.log('After retrieval:', recovery.getCacheStats());

  // Clear cache
  recovery.clearCache();
  console.log('After clear:', recovery.getCacheStats());
}

testCache().catch(console.error);
```

## Simulating Failures

### 1. Database Failure

```typescript
// Temporarily disable Supabase connection
// Remove or invalidate NEXT_PUBLIC_SUPABASE_URL in .env.local

// The system should automatically fall back to cache → files
```

### 2. Network Latency

```typescript
// Add artificial delay to database operations
// System should retry with exponential backoff
```

### 3. Circuit Breaker Activation

```typescript
// Send multiple rapid failing requests
// Circuit breaker should open and use fallbacks
```

## Monitoring in Development

### 1. Check Health Status

```bash
# Watch health status
watch -n 5 'curl -s http://localhost:3000/api/health/protocols | jq .'
```

### 2. Monitor Error Logs

```typescript
import { getProtocolErrorLogger } from './lib/protocols/error-logger';

// In your code
const logger = getProtocolErrorLogger();

setInterval(() => {
  const stats = logger.getStatistics();
  console.log('Error stats:', {
    total: stats.total,
    successRate: (stats.successful / stats.total * 100).toFixed(2) + '%',
    avgRecoveryTime: stats.averageRecoveryTime.toFixed(0) + 'ms',
  });
}, 10000); // Every 10 seconds
```

### 3. View Circuit Breaker Status

```typescript
import { getProtocolErrorRecovery } from './lib/protocols/error-recovery';

const recovery = getProtocolErrorRecovery();

setInterval(() => {
  const status = recovery.getCircuitBreakerStatus();
  console.log('Circuit breakers:', status);
}, 5000); // Every 5 seconds
```

## Development Workflow

### 1. Make Changes

```bash
# Edit files
vim lib/protocols/error-recovery.ts

# TypeScript will auto-compile
```

### 2. Run Tests

```bash
# Run specific test
npm test tests/unit/error-recovery.test.ts

# Run all tests
npm test

# Watch mode during development
npm test -- --watch
```

### 3. Check Types

```bash
# TypeScript type checking
npm run type-check

# Or with Next.js
npm run build
```

### 4. Lint Code

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

## Debugging

### Enable Debug Logging

```typescript
// In lib/protocols/error-recovery.ts
const logger = createLogger('ProtocolErrorRecovery');

// Logger will output to console in development
// Set LOG_LEVEL=debug in .env.local for verbose output
```

### Inspect Cache

```typescript
const recovery = getProtocolErrorRecovery();
const cacheStats = recovery.getCacheStats();

console.log('Cache entries:', cacheStats.entries);
```

### Check Circuit Breaker State

```typescript
const status = recovery.getCircuitBreakerStatus();

for (const [key, breaker] of Object.entries(status)) {
  console.log(`${key}:`, breaker.state, `(${breaker.failures} failures)`);
}
```

### Review Error Logs

```typescript
const logger = getProtocolErrorLogger();

// Recent logs
const recent = logger.getRecentLogs(10);
console.log('Recent errors:', recent);

// Failed operations
const failures = logger.getFailedOperations();
console.log('Failures:', failures);

// Export for analysis
const logsJson = logger.exportLogs();
fs.writeFileSync('error-logs.json', logsJson);
```

## Common Issues

### 1. TypeScript Errors

**Issue:** Cannot find module '@/lib/protocols/health-check'

**Solution:**
```bash
# Restart TypeScript server
# In VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart your editor
```

### 2. Tests Failing

**Issue:** Tests can't find modules

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vitest cache
npm test -- --clearCache
```

### 3. Health Check Returns 503

**Issue:** Database check failing

**Solution:**
```bash
# Check Supabase connection
echo $NEXT_PUBLIC_SUPABASE_URL

# Verify credentials
curl https://your-supabase-url.supabase.co/rest/v1/
```

### 4. Circuit Breaker Stuck Open

**Issue:** Circuit breaker won't close

**Solution:**
```typescript
// Reset manually
const recovery = getProtocolErrorRecovery();
recovery.resetAllCircuitBreakers();
```

### 5. Cache Not Working

**Issue:** Cache always reports size 0

**Solution:**
```typescript
// Check if operations are succeeding
const result = await recovery.retrieveProtocolWithFallback('1210');
console.log('Success?', result.success);
console.log('Strategy:', result.strategyUsed);

// If strategy is always 'database', cache is working but not needed yet
```

## Performance Tips

1. **Use cache for frequently accessed protocols**
   - Common codes: 1210, 1211, 1220
   - Cache hits are <10ms vs 50-100ms for database

2. **Monitor circuit breaker states**
   - Open breakers indicate systemic issues
   - Use fallbacks to maintain service

3. **Pre-warm cache**
   ```typescript
   // On app startup
   const commonProtocols = ['1210', '1211', '1220', '1229'];
   for (const code of commonProtocols) {
     await recovery.retrieveProtocolWithFallback(code);
   }
   ```

4. **Batch operations**
   - Use `Promise.all()` for multiple retrievals
   - Share circuit breaker states across operations

## Integration Testing

### Test Full Stack

```bash
# Start app
npm run dev

# In another terminal, run integration tests
curl http://localhost:3000/api/health/protocols

# Test protocol retrieval through API
# (if you've integrated recovery into RetrievalManager)
```

### Load Testing

```bash
# Install autocannon
npm install -g autocannon

# Test health endpoint
autocannon -c 10 -d 30 http://localhost:3000/api/health/quick

# Test protocol retrieval
# (add endpoint for protocol retrieval first)
```

## Next Steps

1. **Integrate with RetrievalManager** (optional)
   - Update `lib/managers/RetrievalManager.ts`
   - Use error recovery for all protocol operations

2. **Add Monitoring Dashboard** (optional)
   - Create UI to view health checks
   - Display circuit breaker states
   - Show cache statistics

3. **Set Up Alerts** (optional)
   - Slack notifications for circuit breaker events
   - Email alerts for degraded health

4. **Deploy to Staging** (when ready)
   - Test all fallback paths
   - Monitor error rates
   - Verify 99%+ uptime

## Resources

- **Documentation:** `/docs/ERROR_RECOVERY_SYSTEM.md`
- **Implementation Summary:** `/docs/PHASE_4_IMPLEMENTATION_COMPLETE.md`
- **Tests:** `/tests/unit/error-recovery.test.ts`
- **Source Code:** `/lib/protocols/`

## Getting Help

1. Check the comprehensive documentation in `/docs/ERROR_RECOVERY_SYSTEM.md`
2. Review test cases for usage examples
3. Enable debug logging for detailed error information
4. Check health endpoint for system status
5. Review error logs for failed operations

Happy developing! 🚀
