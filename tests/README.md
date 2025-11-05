# Medic-Bot Test Suite - Phase 1-2

Comprehensive test suite ensuring 100% reliability of the protocol foundation (database, migration, validation, and retrieval).

## Test Structure

```
tests/
├── unit/                          # Unit tests (isolated components)
│   ├── db/
│   │   └── schema-validation.test.ts      # Database schema & constraints
│   └── validators/
│       └── protocol-content-validator.test.ts  # Protocol validation
├── integration/                   # Integration tests (component interaction)
│   ├── migrations/
│   │   └── protocol-migration.test.ts     # Data migration integrity
│   ├── field-scenarios.test.ts            # Real-world firefighter inputs
│   └── data-quality.test.ts               # Data quality assurance
├── performance/                   # Performance & load tests
│   └── protocol-retrieval.test.ts         # Query performance validation
└── security/                      # Security tests
    └── sql-injection.test.ts              # SQL injection protection
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

### Specific Test File
```bash
npm test -- tests/unit/db/schema-validation.test.ts
```

## Test Categories

### 1. Database Schema Tests (`tests/unit/db/schema-validation.test.ts`)

Validates database structure and constraints:
- ✅ Protocol table structure with all required fields
- ✅ Unique tp_code constraint enforcement
- ✅ Version validation (positive integers)
- ✅ Date range validation (effective_date <= expiration_date)
- ✅ Protocol deletion protection
- ✅ Foreign key relationships (chunks → protocols)
- ✅ Content hash uniqueness in chunks
- ✅ Chunk index validation (>= 0)
- ✅ Cascade deletion of dependent records
- ✅ Embedding vector dimensions (1536)
- ✅ Unique (chunk_id, model, version) constraints
- ✅ Index existence and effectiveness

**Coverage Target:** 100% of schema constraints
**Run Time:** ~30 seconds

### 2. Migration Tests (`tests/integration/migrations/protocol-migration.test.ts`)

Validates data integrity during migration:
- ✅ Zero data loss (all 7,014+ chunks migrated)
- ✅ Protocol relationship preservation
- ✅ Null value fixes in metadata
- ✅ Protocol ID normalization (file-based → UUID)
- ✅ Chunk order and context maintenance
- ✅ tp_code format validation
- ✅ Category normalization
- ✅ Provider impression extraction
- ✅ No orphaned chunks or embeddings
- ✅ No duplicate protocols
- ✅ Idempotency verification

**Coverage Target:** 100% of migrated data
**Run Time:** ~45 seconds

### 3. Protocol Validation Tests (`tests/unit/validators/protocol-content-validator.test.ts`)

Validates protocol content accuracy:
- ✅ Valid protocol citation validation
- ✅ Invalid/hallucinated protocol detection
- ✅ Protocol name matching
- ✅ Multiple citation handling
- ✅ Pediatric protocol format (TP 1210-P)
- ✅ MCG code validation
- ✅ LA County protocol enumeration
- ✅ Cross-reference validation
- ✅ Protocol format variations
- ✅ Edge case handling

**Coverage Target:** 95% of validator logic
**Run Time:** ~10 seconds

### 4. Field Scenario Tests (`tests/integration/field-scenarios.test.ts`)

Tests real-world firefighter/paramedic inputs:

**Previously Failing Cases (91% → 99%+ target):**
- ✅ "cant breathe" (missing apostrophe)
- ✅ "seisure" → "seizure"
- ✅ "asma" → "asthma"
- ✅ "gunshot wound" (vague trauma)
- ✅ "nitroglycerin" (medication only)
- ✅ "pain" (extremely vague)

**Common Typos:**
- ✅ Stressed firefighter input handling
- ✅ Missing punctuation
- ✅ Misspellings under pressure

**Synonym Expansion:**
- ✅ "heart attack" → "myocardial infarction, STEMI"
- ✅ "cant breathe" → "dyspnea, SOB"
- ✅ "gsw" → "gunshot wound, trauma"
- ✅ Brand names → generic names

**Multi-Symptom Queries:**
- ✅ Combined symptoms (chest pain + SOB)
- ✅ Complex presentations

**Field Abbreviations:**
- ✅ LOC, SOB, AMS, MVC, GSW

**Pediatric Scenarios:**
- ✅ Pediatric-specific queries
- ✅ MCG 1309 color code references

**Time-Critical Queries:**
- ✅ Sub-100ms response for emergencies

**Coverage Target:** 99%+ pass rate (from 91% baseline)
**Run Time:** ~60 seconds

### 5. Performance Tests (`tests/performance/protocol-retrieval.test.ts`)

Validates query performance:
- ✅ Single query <100ms
- ✅ Context building <150ms
- ✅ 10 concurrent requests
- ✅ 50 concurrent requests without degradation
- ✅ Burst traffic handling (60 requests)
- ✅ Memory efficiency (no leaks)
- ✅ Large result set handling
- ✅ Complex query performance
- ✅ Index effectiveness
- ✅ Sustained load testing

**Performance Targets:**
- Single query: <100ms
- Context build: <150ms
- 50 concurrent: <200ms avg
- Memory increase: <50MB per 100 queries

**Coverage Target:** All query types
**Run Time:** ~120 seconds

### 6. Data Quality Tests (`tests/integration/data-quality.test.ts`)

Validates data integrity:
- ✅ Zero null values in required fields
- ✅ No orphaned chunks or embeddings
- ✅ Valid foreign key relationships
- ✅ No duplicate tp_codes
- ✅ Consistent chunk ordering
- ✅ Valid date ranges
- ✅ Valid version numbers
- ✅ Reasonable content lengths
- ✅ Unique content hashes
- ✅ Valid metadata structure
- ✅ Complete category coverage
- ✅ Minimum protocol count
- ✅ All protocols have chunks

**Coverage Target:** 100% of data quality rules
**Run Time:** ~45 seconds

### 7. Security Tests (`tests/security/sql-injection.test.ts`)

Validates input sanitization:
- ✅ SQL injection prevention
- ✅ UNION-based injection protection
- ✅ Time-based blind injection
- ✅ Boolean-based injection
- ✅ Stacked query injection
- ✅ Comment-based injection
- ✅ Special character handling
- ✅ Null byte handling
- ✅ Unicode/hex encoding
- ✅ Query parameterization
- ✅ Error disclosure prevention
- ✅ Bypass attempt prevention
- ✅ Real-world attack patterns
- ✅ Legitimate queries with SQL-like syntax

**Coverage Target:** All injection vectors
**Run Time:** ~30 seconds

## Test Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| **Unit Tests** | >95% | TBD |
| **Integration Tests** | 100% critical paths | TBD |
| **E2E Tests** | All user flows | TBD |
| **Performance Tests** | All query types | TBD |
| **Security Tests** | All vectors | TBD |

## CI/CD Integration

Tests run automatically on:
- ✅ Every commit (unit tests)
- ✅ Every PR (full suite)
- ✅ Pre-deployment (full suite + E2E)

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:coverage
```

## Test Data Setup

### Prerequisites

1. **Supabase Database** - Running locally or remote
2. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

3. **Test Data:**
   - Protocol data migrated
   - Provider impressions loaded
   - Knowledge base initialized

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Initialize test data (if needed)
npm run ingest:md
```

## Writing New Tests

### Test File Template

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('Sub-feature', () => {
    test('should do something specific', async () => {
      // Arrange
      const input = 'test data';

      // Act
      const result = await functionUnderTest(input);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('expectedProperty');
    });
  });
});
```

### Best Practices

1. **Test Independence** - Each test should run independently
2. **Descriptive Names** - Use "should..." format for test names
3. **AAA Pattern** - Arrange, Act, Assert
4. **Cleanup** - Always clean up test data
5. **Async Handling** - Use async/await properly
6. **Error Cases** - Test both success and failure paths
7. **Performance** - Keep tests fast (<5s per test)
8. **Assertions** - Use specific assertions (not just truthy)

## Debugging Failed Tests

### Run Single Test
```bash
npm test -- tests/unit/db/schema-validation.test.ts
```

### Run With Verbose Output
```bash
npm test -- --reporter=verbose
```

### Run With Debug Logging
```bash
DEBUG=* npm test
```

### Common Issues

**Issue:** Database connection timeout
**Solution:** Check Supabase credentials and network

**Issue:** Test data conflicts
**Solution:** Ensure cleanup in afterEach hooks

**Issue:** Flaky tests
**Solution:** Add proper async/await, increase timeouts

## Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| Protocol search | <100ms | TBD |
| Context build | <150ms | TBD |
| Database query | <50ms | TBD |
| Full-text search | <80ms | TBD |
| Vector search | <120ms | TBD |

## Test Metrics

Generated after running `npm run test:coverage`:

- **Statements:** >95%
- **Branches:** >90%
- **Functions:** >95%
- **Lines:** >95%

View detailed coverage report: `coverage/index.html`

## Continuous Improvement

### Regular Tasks

- [ ] Review failed tests weekly
- [ ] Update test data quarterly
- [ ] Add tests for new features
- [ ] Refactor slow tests
- [ ] Update performance baselines
- [ ] Review security test coverage

### Adding New Tests

When adding a new feature:
1. Write unit tests first (TDD)
2. Add integration tests for interactions
3. Add E2E tests for user flows
4. Update performance baselines
5. Document in this README

## Support

**Questions?** Create an issue with label `test-suite`

**Contributing?** See `CONTRIBUTING.md` for test guidelines

## License

Same as main project
