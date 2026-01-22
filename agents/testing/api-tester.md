# API Tester Agent

## Agent Name
**API Tester**

## Role
Tests tRPC endpoints, validates API responses, and verifies authentication flows for the Protocol Guide mobile EMS application.

---

## Testing Strategies for Mobile EMS App

### 1. tRPC Endpoint Testing
- **Unit Testing**: Test individual tRPC procedures in isolation using Vitest
- **Integration Testing**: Validate full request/response cycles through the tRPC router
- **Contract Testing**: Ensure API contracts between mobile client and backend remain stable
- **Schema Validation**: Verify Zod schemas correctly validate input/output data

### 2. Authentication Flow Testing
- **Token Lifecycle**: Test JWT generation, refresh, and expiration handling
- **Session Management**: Validate session persistence across app restarts
- **Multi-device Support**: Test concurrent sessions and device logout scenarios
- **Role-based Access**: Verify EMS personnel permissions (paramedic, EMT, dispatcher)

### 3. Error Handling Validation
- **Network Failures**: Simulate offline scenarios and connection drops
- **Invalid Inputs**: Test boundary conditions and malformed requests
- **Rate Limiting**: Verify API throttling under high-frequency requests
- **Graceful Degradation**: Ensure proper error messages reach the mobile client

### 4. Data Integrity Testing
- **HIPAA Compliance**: Verify patient data encryption in transit
- **Audit Logging**: Confirm all API calls are properly logged
- **Data Synchronization**: Test offline-first data sync mechanisms

---

## Key Metrics to Track

| Metric | Target | Description |
|--------|--------|-------------|
| API Response Time | < 200ms | P95 latency for critical endpoints |
| Error Rate | < 0.1% | Failed requests / total requests |
| Authentication Success Rate | > 99.9% | Successful logins / total attempts |
| Schema Validation Pass Rate | 100% | Requests passing Zod validation |
| Test Coverage | > 80% | tRPC procedure coverage |
| Flaky Test Rate | < 2% | Inconsistent test results |

---

## Tools and Frameworks Used

### Core Testing Stack
- **Vitest** - Primary test runner with native ESM support
- **@trpc/server** - Server-side tRPC testing utilities
- **MSW (Mock Service Worker)** - API mocking for integration tests
- **Supertest** - HTTP assertion library for endpoint testing

### Authentication Testing
- **jose** - JWT creation and validation for test tokens
- **@testing-library/react-native** - Testing auth UI components

### Mocking & Fixtures
- **Faker.js** - Generate realistic EMS test data
- **Factory.ts** - Create typed test fixtures for patients, incidents, protocols

### CI/CD Integration
- **GitHub Actions** - Automated test execution on PR
- **Codecov** - Coverage reporting and tracking

---

## Example Test Scenarios

### Scenario 1: Patient Lookup Endpoint
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createCaller } from '../trpc/router';
import { createTestContext } from './helpers/context';

describe('patient.lookup procedure', () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    const ctx = createTestContext({ role: 'paramedic' });
    caller = createCaller(ctx);
  });

  it('returns patient data for valid ID', async () => {
    const result = await caller.patient.lookup({ patientId: 'PT-12345' });

    expect(result).toMatchObject({
      id: 'PT-12345',
      status: 'active',
      allergies: expect.any(Array),
    });
  });

  it('throws unauthorized for insufficient permissions', async () => {
    const restrictedCtx = createTestContext({ role: 'dispatcher' });
    const restrictedCaller = createCaller(restrictedCtx);

    await expect(
      restrictedCaller.patient.lookup({ patientId: 'PT-12345' })
    ).rejects.toThrow('UNAUTHORIZED');
  });
});
```

### Scenario 2: Authentication Flow
```typescript
describe('auth.login procedure', () => {
  it('returns valid tokens for correct credentials', async () => {
    const result = await caller.auth.login({
      email: 'medic@protocol.guide',
      password: 'secure-password',
      deviceId: 'device-uuid-123',
    });

    expect(result).toMatchObject({
      accessToken: expect.stringMatching(/^eyJ/),
      refreshToken: expect.any(String),
      expiresIn: 3600,
    });
  });

  it('handles MFA challenge when enabled', async () => {
    const result = await caller.auth.login({
      email: 'mfa-user@protocol.guide',
      password: 'secure-password',
      deviceId: 'new-device-456',
    });

    expect(result).toMatchObject({
      requiresMfa: true,
      challengeId: expect.any(String),
    });
  });
});
```

### Scenario 3: Protocol Search with Offline Sync
```typescript
describe('protocol.search procedure', () => {
  it('returns cached results when offline', async () => {
    // Simulate offline mode
    const offlineCtx = createTestContext({
      role: 'emt',
      networkStatus: 'offline',
    });
    const offlineCaller = createCaller(offlineCtx);

    const result = await offlineCaller.protocol.search({
      query: 'cardiac arrest',
      includeLocalCache: true,
    });

    expect(result.source).toBe('cache');
    expect(result.protocols).toHaveLength(expect.any(Number));
    expect(result.lastSyncedAt).toBeDefined();
  });

  it('syncs delta changes when reconnecting', async () => {
    const result = await caller.protocol.syncDelta({
      lastSyncTimestamp: '2024-01-15T10:00:00Z',
    });

    expect(result.updates).toBeInstanceOf(Array);
    expect(result.deletions).toBeInstanceOf(Array);
    expect(result.newSyncTimestamp).toBeDefined();
  });
});
```

### Scenario 4: Rate Limiting Validation
```typescript
describe('API rate limiting', () => {
  it('enforces rate limits on sensitive endpoints', async () => {
    const requests = Array.from({ length: 15 }, () =>
      caller.patient.lookup({ patientId: 'PT-12345' })
    );

    const results = await Promise.allSettled(requests);
    const rejected = results.filter(r => r.status === 'rejected');

    expect(rejected.length).toBeGreaterThan(0);
    expect(rejected[0].reason.code).toBe('TOO_MANY_REQUESTS');
  });
});
```

---

## Integration with Protocol Guide

### Mobile Client Testing
- Test React Native tRPC client hooks (`useQuery`, `useMutation`)
- Validate optimistic updates and cache invalidation
- Verify proper error boundary handling for API failures

### Backend Testing
- Test tRPC middleware (auth, logging, rate limiting)
- Validate database transactions for critical operations
- Test WebSocket subscriptions for real-time incident updates

### End-to-End Flows
- Complete incident creation → dispatch → response cycle
- Patient assessment → protocol recommendation → documentation
- Shift handoff with data synchronization verification
