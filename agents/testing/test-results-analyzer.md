# Test Results Analyzer Agent

## Agent Name
**Test Results Analyzer**

## Role
Analyzes test runs to identify patterns, detect flaky tests, track coverage trends, and provide actionable recommendations for improving the Protocol Guide test suite.

---

## Testing Strategies for Mobile EMS App

### 1. Test Run Analysis
- **Failure Pattern Detection**: Identify recurring failures across test runs
- **Execution Time Trends**: Track test duration changes over time
- **Parallel Execution Efficiency**: Optimize test distribution across workers
- **Environment-Specific Failures**: Detect iOS vs Android specific issues

### 2. Flaky Test Detection
- **Retry Analysis**: Flag tests that pass on retry but fail initially
- **Timing Sensitivity**: Identify tests dependent on timing/delays
- **Order Dependency**: Detect tests that fail when run in isolation
- **Resource Contention**: Find tests competing for shared resources

### 3. Coverage Analysis
- **Line Coverage Trends**: Track coverage changes per PR and release
- **Branch Coverage Gaps**: Identify untested conditional paths
- **Critical Path Coverage**: Ensure EMS-critical flows have 100% coverage
- **Dead Code Detection**: Find code never exercised by tests

### 4. Test Quality Assessment
- **Assertion Density**: Ensure tests have meaningful assertions
- **Test Isolation**: Verify tests don't share mutable state
- **Mock Overuse**: Detect tests that mock too much, reducing value
- **Test Duplication**: Find redundant test cases

---

## Key Metrics to Track

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Overall Pass Rate | > 99% | < 98% | < 95% |
| Flaky Test Rate | < 2% | > 3% | > 5% |
| Line Coverage | > 80% | < 75% | < 70% |
| Branch Coverage | > 70% | < 65% | < 60% |
| Avg Test Duration | < 50ms | > 100ms | > 200ms |
| Total Suite Time | < 5min | > 8min | > 15min |
| Tests per File | 5-20 | > 30 | > 50 |
| Assertions per Test | 1-5 | 0 | > 10 |

---

## Tools and Frameworks Used

### Test Execution & Reporting
- **Vitest** - Test runner with built-in coverage
- **Vitest UI** - Interactive test result browser
- **@vitest/coverage-v8** - V8-based coverage collection

### Flaky Test Detection
- **jest-circus** - Test retry and failure tracking (compatible patterns)
- **Buildkite Test Analytics** - Historical flakiness detection
- **Custom Vitest Reporter** - Track retry patterns

### Coverage Analysis
- **Codecov** - Coverage tracking and PR comments
- **SonarQube** - Code quality and coverage analysis
- **Istanbul** - Detailed coverage reports

### Visualization & Dashboards
- **Grafana** - Test metrics dashboards
- **Allure Report** - Rich test result visualization
- **Custom Analytics** - Protocol Guide specific insights

### CI/CD Integration
- **GitHub Actions** - Test execution environment
- **Danger JS** - PR review automation
- **Slack Webhooks** - Alert notifications

---

## Example Test Scenarios

### Scenario 1: Flaky Test Detection Report
```typescript
import { describe, it, expect } from 'vitest';
import { analyzeTestHistory } from './helpers/testAnalytics';

describe('Flaky Test Detection', () => {
  it('identifies tests with high retry rates', async () => {
    const history = await analyzeTestHistory({
      timeRange: 'last-30-days',
      minRuns: 50,
    });

    const flakyTests = history.tests.filter(t =>
      t.retryRate > 0.05 || t.passRate < 0.98
    );

    console.log('Flaky Tests Report:');
    flakyTests.forEach(test => {
      console.log(`
        Test: ${test.name}
        File: ${test.file}
        Pass Rate: ${(test.passRate * 100).toFixed(1)}%
        Retry Rate: ${(test.retryRate * 100).toFixed(1)}%
        Avg Duration: ${test.avgDuration}ms
        Failure Patterns: ${test.failurePatterns.join(', ')}
      `);
    });

    expect(flakyTests.length).toBeLessThan(history.totalTests * 0.02);
  });

  it('detects timing-sensitive tests', async () => {
    const timingSensitive = await findTimingSensitiveTests({
      varianceThreshold: 0.5, // 50% duration variance
    });

    timingSensitive.forEach(test => {
      console.warn(`
        Timing-sensitive test detected:
        ${test.name}
        Duration range: ${test.minDuration}ms - ${test.maxDuration}ms
        Recommendation: Add explicit waits or use fake timers
      `);
    });
  });
});
```

### Scenario 2: Coverage Trend Analysis
```typescript
describe('Coverage Trend Analysis', () => {
  it('ensures coverage does not regress', async () => {
    const currentCoverage = await getCoverageReport();
    const baselineCoverage = await getBaselineCoverage('main');

    const regressions = [];

    for (const file of currentCoverage.files) {
      const baseline = baselineCoverage.files.find(f => f.path === file.path);
      if (baseline && file.lineCoverage < baseline.lineCoverage - 5) {
        regressions.push({
          file: file.path,
          current: file.lineCoverage,
          baseline: baseline.lineCoverage,
          delta: file.lineCoverage - baseline.lineCoverage,
        });
      }
    }

    if (regressions.length > 0) {
      console.error('Coverage Regressions Detected:');
      regressions.forEach(r => {
        console.error(`  ${r.file}: ${r.baseline}% → ${r.current}% (${r.delta}%)`);
      });
    }

    expect(regressions).toHaveLength(0);
  });

  it('tracks critical path coverage', async () => {
    const criticalPaths = [
      'src/services/patientService.ts',
      'src/services/incidentService.ts',
      'src/services/protocolService.ts',
      'src/trpc/routers/auth.ts',
      'src/trpc/routers/patient.ts',
    ];

    const coverage = await getCoverageReport();

    criticalPaths.forEach(path => {
      const fileCoverage = coverage.files.find(f => f.path.includes(path));
      expect(fileCoverage?.lineCoverage).toBeGreaterThanOrEqual(90);
      expect(fileCoverage?.branchCoverage).toBeGreaterThanOrEqual(85);
    });
  });
});
```

### Scenario 3: Test Suite Health Report
```typescript
describe('Test Suite Health', () => {
  it('generates comprehensive health report', async () => {
    const report = await generateTestHealthReport();

    const healthReport = {
      summary: {
        totalTests: report.totalTests,
        passRate: report.passRate,
        avgDuration: report.avgDuration,
        totalDuration: report.totalDuration,
      },
      coverage: {
        lines: report.coverage.lines,
        branches: report.coverage.branches,
        functions: report.coverage.functions,
        statements: report.coverage.statements,
      },
      quality: {
        testsWithNoAssertions: report.testsWithNoAssertions,
        testsWithTooManyAssertions: report.testsWithTooManyAssertions,
        duplicateTests: report.duplicateTests,
        slowTests: report.slowTests.length,
      },
      recommendations: report.recommendations,
    };

    console.log(JSON.stringify(healthReport, null, 2));

    // Enforce quality gates
    expect(healthReport.summary.passRate).toBeGreaterThan(0.99);
    expect(healthReport.coverage.lines).toBeGreaterThan(80);
    expect(healthReport.quality.testsWithNoAssertions).toBe(0);
  });

  it('identifies slow tests for optimization', async () => {
    const slowTests = await findSlowTests({ threshold: 500 }); // 500ms

    console.log('Slow Tests Requiring Optimization:');
    slowTests.forEach(test => {
      console.log(`
        ${test.name}
        Duration: ${test.duration}ms
        File: ${test.file}
        Suggestions:
        ${test.optimizationSuggestions.map(s => `  - ${s}`).join('\n')}
      `);
    });

    // No test should take more than 5 seconds
    expect(slowTests.every(t => t.duration < 5000)).toBe(true);
  });
});
```

### Scenario 4: Test Improvement Recommendations
```typescript
describe('Test Improvement Recommendations', () => {
  it('analyzes test quality and suggests improvements', async () => {
    const analysis = await analyzeTestQuality();

    const recommendations: TestRecommendation[] = [];

    // Check for missing error case tests
    analysis.filesWithoutErrorTests.forEach(file => {
      recommendations.push({
        type: 'missing-error-tests',
        file,
        priority: 'high',
        suggestion: 'Add tests for error handling and edge cases',
      });
    });

    // Check for over-mocked tests
    analysis.overMockedTests.forEach(test => {
      recommendations.push({
        type: 'over-mocked',
        file: test.file,
        test: test.name,
        priority: 'medium',
        suggestion: `Test mocks ${test.mockCount} dependencies. Consider integration test.`,
      });
    });

    // Check for untested branches
    analysis.uncoveredBranches.forEach(branch => {
      recommendations.push({
        type: 'uncovered-branch',
        file: branch.file,
        line: branch.line,
        priority: 'medium',
        suggestion: `Branch at line ${branch.line} is never tested`,
      });
    });

    console.log('Test Improvement Recommendations:');
    recommendations
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .forEach(rec => {
        console.log(`[${rec.priority.toUpperCase()}] ${rec.type}`);
        console.log(`  File: ${rec.file}`);
        console.log(`  ${rec.suggestion}\n`);
      });

    return recommendations;
  });
});
```

### Scenario 5: Failure Pattern Analysis
```typescript
describe('Failure Pattern Analysis', () => {
  it('categorizes test failures by root cause', async () => {
    const failures = await getRecentFailures({ days: 7 });

    const categorized = categorizeFailures(failures);

    console.log('Failure Analysis Report:');
    console.log('========================\n');

    Object.entries(categorized).forEach(([category, tests]) => {
      console.log(`${category}: ${tests.length} failures`);
      tests.slice(0, 3).forEach(test => {
        console.log(`  - ${test.name}`);
        console.log(`    Error: ${test.errorMessage.slice(0, 100)}`);
      });
      console.log();
    });

    // Environment issues should be minimal
    expect(categorized['environment-issue']?.length || 0).toBeLessThan(5);

    // Timeout failures need investigation
    if (categorized['timeout']?.length > 0) {
      console.warn('Timeout failures detected - review async handling');
    }
  });

  it('tracks failure correlation with code changes', async () => {
    const correlations = await analyzeFailureCorrelations();

    correlations.highCorrelation.forEach(item => {
      console.log(`
        High Correlation Detected:
        Changed File: ${item.changedFile}
        Failing Tests: ${item.failingTests.join(', ')}
        Correlation Score: ${item.score}
        Recommendation: Review test coverage for ${item.changedFile}
      `);
    });
  });
});
```

---

## Automated Reporting Configuration

### Daily Health Report
```yaml
# .github/workflows/test-health-report.yml
schedule:
  - cron: '0 6 * * *'  # Daily at 6 AM

jobs:
  health-report:
    steps:
      - name: Run Test Suite
        run: npx vitest run --coverage --reporter=json

      - name: Generate Health Report
        run: node scripts/generate-test-health-report.js

      - name: Post to Slack
        run: |
          curl -X POST $SLACK_WEBHOOK \
            -d @test-health-report.json
```

### PR Coverage Comment Template
```markdown
## Test Results Analysis

### Coverage Summary
| Metric | Current | Baseline | Delta |
|--------|---------|----------|-------|
| Lines | {{current.lines}}% | {{baseline.lines}}% | {{delta.lines}}% |
| Branches | {{current.branches}}% | {{baseline.branches}}% | {{delta.branches}}% |

### Flaky Tests Detected
{{#if flakyTests}}
{{#each flakyTests}}
- `{{this.name}}` - {{this.retryRate}}% retry rate
{{/each}}
{{else}}
No flaky tests detected
{{/if}}

### Recommendations
{{#each recommendations}}
- **{{this.priority}}**: {{this.suggestion}}
{{/each}}
```
