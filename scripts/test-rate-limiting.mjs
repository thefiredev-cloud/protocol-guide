/**
 * Rate Limiting Test Script
 *
 * Tests the enhanced rate limiting implementation by making rapid requests
 * and verifying that limits are enforced correctly.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, index, userAgent = 'test-client') {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test message' }],
      }),
    });

    const headers = {
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      reset: response.headers.get('X-RateLimit-Reset'),
      retryAfter: response.headers.get('Retry-After'),
    };

    return {
      index,
      status: response.status,
      ok: response.ok,
      headers,
      body: await response.json(),
    };
  } catch (error) {
    return {
      index,
      error: error.message,
    };
  }
}

async function testRateLimiting() {
  log('\n=== Testing Enhanced Rate Limiting ===\n', 'cyan');

  // Test 1: Normal requests within limit
  log('Test 1: Making 5 requests within limit (20 req/min for CHAT)', 'blue');
  const normalRequests = [];
  for (let i = 1; i <= 5; i++) {
    const result = await makeRequest('/api/chat', i);
    normalRequests.push(result);

    if (result.error) {
      log(`  Request ${i}: ERROR - ${result.error}`, 'red');
    } else {
      const remaining = result.headers.remaining || 'N/A';
      const limit = result.headers.limit || 'N/A';
      log(
        `  Request ${i}: ${result.status} - Remaining: ${remaining}/${limit}`,
        result.ok ? 'green' : 'red'
      );
    }
  }

  // Test 2: Rapid requests to trigger rate limit
  log('\nTest 2: Making 25 rapid requests to exceed limit (20 req/min)', 'blue');
  const rapidRequests = [];
  for (let i = 1; i <= 25; i++) {
    rapidRequests.push(makeRequest('/api/chat', i));
  }

  const rapidResults = await Promise.all(rapidRequests);
  let successCount = 0;
  let rateLimitedCount = 0;

  rapidResults.forEach((result) => {
    if (result.error) {
      log(`  Request ${result.index}: ERROR - ${result.error}`, 'red');
    } else if (result.status === 429) {
      rateLimitedCount++;
      if (rateLimitedCount === 1) {
        log(
          `  Request ${result.index}: ${result.status} RATE LIMITED - ${result.body?.error?.message || 'Too many requests'}`,
          'yellow'
        );
        log(`    Retry-After: ${result.headers.retryAfter}s`, 'yellow');
      }
    } else if (result.ok) {
      successCount++;
    }
  });

  log(`\n  Results: ${successCount} successful, ${rateLimitedCount} rate limited`, 'cyan');

  // Test 3: Check rate limit headers
  log('\nTest 3: Verifying rate limit headers', 'blue');
  const headerTest = await makeRequest('/api/chat', 1);
  if (headerTest.headers.limit) {
    log(`  X-RateLimit-Limit: ${headerTest.headers.limit}`, 'green');
    log(`  X-RateLimit-Remaining: ${headerTest.headers.remaining}`, 'green');
    log(`  X-RateLimit-Reset: ${headerTest.headers.reset}`, 'green');
  } else {
    log('  WARNING: Rate limit headers not found', 'yellow');
  }

  // Test 4: Different user agents (different fingerprints)
  log('\nTest 4: Testing different fingerprints (user agents)', 'blue');
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (X11; Linux x86_64)',
  ];

  for (const ua of userAgents) {
    const result = await makeRequest('/api/chat', 1, ua);
    if (result.error) {
      log(`  ${ua.substring(0, 30)}...: ERROR - ${result.error}`, 'red');
    } else {
      log(
        `  ${ua.substring(0, 30)}...: ${result.status} - Remaining: ${result.headers.remaining}/${result.headers.limit}`,
        result.ok ? 'green' : 'yellow'
      );
    }
  }

  // Test 5: Check monitoring endpoint
  log('\nTest 5: Checking monitoring endpoint', 'blue');
  try {
    const monitorResponse = await fetch(`${BASE_URL}/api/admin/rate-limits`);
    if (monitorResponse.ok) {
      const stats = await monitorResponse.json();
      log(`  Status: ${stats.health?.status || 'unknown'}`, 'green');
      log(`  Active Fingerprints: ${stats.stats?.activeFingerprints || 0}`, 'green');
      log(`  Reputation Tracked: ${stats.stats?.reputationTracked || 0}`, 'green');
      log(`  Low Reputation Count: ${stats.stats?.lowReputationCount || 0}`, 'green');
      log(`  Banned Count: ${stats.stats?.bannedCount || 0}`, 'green');
    } else {
      log(`  Monitoring endpoint returned: ${monitorResponse.status}`, 'yellow');
    }
  } catch (error) {
    log(`  Could not access monitoring endpoint: ${error.message}`, 'yellow');
  }

  log('\n=== Rate Limiting Tests Complete ===\n', 'cyan');
}

// Run tests
testRateLimiting().catch((error) => {
  log(`\nTest failed with error: ${error.message}`, 'red');
  process.exit(1);
});
