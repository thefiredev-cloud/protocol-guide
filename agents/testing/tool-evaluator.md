# Tool Evaluator Agent

## Agent Name
**Tool Evaluator**

## Role
Evaluates new tools, libraries, and frameworks for the Protocol Guide technology stack, including testing frameworks, CI/CD tools, monitoring solutions, and development utilities.

---

## Testing Strategies for Mobile EMS App

### 1. Compatibility Assessment
- **React Native Compatibility**: Verify tool works with Expo managed workflow
- **tRPC Integration**: Test compatibility with existing tRPC setup
- **Vitest Compatibility**: Ensure new testing tools integrate with Vitest
- **TypeScript Support**: Verify full TypeScript compatibility and type definitions

### 2. Performance Impact Evaluation
- **Bundle Size Impact**: Measure JavaScript bundle size increase
- **Build Time Impact**: Compare CI/CD pipeline duration before/after
- **Runtime Performance**: Profile memory and CPU impact
- **Cold Start Impact**: Measure effect on app launch time

### 3. Security & Compliance Review
- **Dependency Audit**: Check for known vulnerabilities (npm audit, Snyk)
- **HIPAA Considerations**: Verify data handling meets healthcare standards
- **License Compatibility**: Ensure license is compatible with commercial use
- **Data Privacy**: Review data collection and telemetry practices

### 4. Developer Experience Evaluation
- **Documentation Quality**: Assess completeness and clarity of docs
- **Learning Curve**: Estimate onboarding time for team
- **Community Support**: Evaluate GitHub issues, Discord, Stack Overflow presence
- **Maintenance Activity**: Check release frequency and issue response time

---

## Key Metrics to Track

| Metric | Weight | Excellent | Good | Poor |
|--------|--------|-----------|------|------|
| Bundle Size Impact | 15% | < 10KB | < 50KB | > 100KB |
| Build Time Impact | 10% | < 5% | < 15% | > 30% |
| TypeScript Support | 20% | Native | @types | None |
| Documentation | 15% | Comprehensive | Adequate | Sparse |
| Community Activity | 10% | Very Active | Active | Stale |
| Security Score | 15% | No Issues | Minor | Critical |
| Maintenance | 15% | Weekly | Monthly | > 6 months |

---

## Tools and Frameworks Used

### Evaluation Tools
- **Bundlephobia** - Bundle size analysis
- **npm trends** - Download and popularity comparison
- **Snyk** - Security vulnerability scanning
- **Socket.dev** - Supply chain security analysis

### Benchmarking
- **Vitest Bench** - Performance benchmarking
- **Hyperfine** - CLI tool benchmarking
- **Autocannon** - HTTP benchmarking for API tools

### Analysis
- **webpack-bundle-analyzer** - Bundle composition analysis
- **source-map-explorer** - Source map analysis
- **madge** - Dependency graph visualization

### Documentation
- **TypeDoc** - API documentation generation
- **Notion** - Evaluation reports and decisions
- **ADR (Architecture Decision Records)** - Decision documentation

---

## Example Test Scenarios

### Scenario 1: Testing Framework Evaluation
```typescript
import { describe, it, expect } from 'vitest';

interface FrameworkEvaluation {
  name: string;
  category: 'testing-framework';
  scores: Record<string, number>;
  recommendation: 'adopt' | 'trial' | 'assess' | 'hold';
}

describe('Testing Framework Evaluation: Vitest vs Jest', () => {
  const evaluateFramework = async (name: string): Promise<FrameworkEvaluation> => {
    const metrics = await gatherMetrics(name);

    return {
      name,
      category: 'testing-framework',
      scores: {
        performance: metrics.executionTime < 5000 ? 10 : 5,
        esm_support: metrics.nativeEsm ? 10 : 3,
        typescript: metrics.typeScriptNative ? 10 : 7,
        ecosystem: metrics.plugins > 50 ? 10 : 6,
        migration_effort: metrics.jestCompatible ? 9 : 4,
      },
      recommendation: calculateRecommendation(metrics),
    };
  };

  it('evaluates Vitest for Protocol Guide', async () => {
    const evaluation = await evaluateFramework('vitest');

    console.log(`
      Framework: ${evaluation.name}

      Scores:
      - Performance: ${evaluation.scores.performance}/10
      - ESM Support: ${evaluation.scores.esm_support}/10
      - TypeScript: ${evaluation.scores.typescript}/10
      - Ecosystem: ${evaluation.scores.ecosystem}/10
      - Migration Effort: ${evaluation.scores.migration_effort}/10

      Overall: ${Object.values(evaluation.scores).reduce((a, b) => a + b, 0) / 5}/10
      Recommendation: ${evaluation.recommendation.toUpperCase()}
    `);

    expect(evaluation.recommendation).toBe('adopt');
  });
});
```

### Scenario 2: CI/CD Tool Comparison
```typescript
describe('CI/CD Tool Evaluation', () => {
  const ciTools = [
    { name: 'GitHub Actions', vendor: 'github' },
    { name: 'CircleCI', vendor: 'circleci' },
    { name: 'Buildkite', vendor: 'buildkite' },
  ];

  it('compares CI/CD tools for React Native builds', async () => {
    const evaluations = await Promise.all(
      ciTools.map(async (tool) => {
        const metrics = await evaluateCITool(tool.name, {
          useCase: 'react-native-expo',
          requirements: [
            'ios-simulator-testing',
            'android-emulator-testing',
            'eas-build-integration',
            'caching-support',
            'parallel-execution',
          ],
        });

        return {
          tool: tool.name,
          buildTime: metrics.avgBuildTime,
          cost: metrics.estimatedMonthlyCost,
          features: metrics.supportedFeatures,
          limitations: metrics.limitations,
          score: metrics.overallScore,
        };
      })
    );

    console.table(evaluations.map(e => ({
      Tool: e.tool,
      'Build Time': `${e.buildTime}min`,
      'Monthly Cost': `$${e.cost}`,
      'Feature Score': `${e.features.length}/${ciTools[0].requirements?.length}`,
      'Overall': e.score,
    })));

    const recommended = evaluations.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    console.log(`\nRecommendation: ${recommended.tool}`);
  });
});
```

### Scenario 3: Monitoring Solution Evaluation
```typescript
describe('APM/Monitoring Tool Evaluation', () => {
  const monitoringTools = ['Sentry', 'Datadog', 'New Relic', 'Bugsnag'];

  it('evaluates monitoring tools for mobile EMS app', async () => {
    const criteria = {
      'React Native SDK': { weight: 20, required: true },
      'Crash Reporting': { weight: 15, required: true },
      'Performance Monitoring': { weight: 15, required: true },
      'User Sessions': { weight: 10, required: false },
      'Custom Events': { weight: 10, required: true },
      'Alerting': { weight: 10, required: true },
      'HIPAA Compliance': { weight: 15, required: true },
      'Pricing (startup-friendly)': { weight: 5, required: false },
    };

    const results = await Promise.all(
      monitoringTools.map(async (tool) => {
        const evaluation = await evaluateMonitoringTool(tool, criteria);
        return {
          tool,
          ...evaluation,
        };
      })
    );

    // Filter out tools missing required features
    const viable = results.filter(r =>
      Object.entries(criteria)
        .filter(([_, c]) => c.required)
        .every(([feature]) => r.features[feature])
    );

    console.log('Monitoring Tool Evaluation Results:');
    console.log('===================================\n');

    viable.forEach(result => {
      console.log(`${result.tool}:`);
      console.log(`  Weighted Score: ${result.weightedScore}/100`);
      console.log(`  Strengths: ${result.strengths.join(', ')}`);
      console.log(`  Weaknesses: ${result.weaknesses.join(', ')}`);
      console.log(`  Est. Monthly Cost: $${result.estimatedCost}`);
      console.log();
    });

    expect(viable.length).toBeGreaterThan(0);
  });
});
```

### Scenario 4: Library Security Audit
```typescript
describe('Library Security Evaluation', () => {
  it('audits new dependency for security concerns', async () => {
    const libraryToEvaluate = 'some-new-library';

    const securityAudit = await auditLibrary(libraryToEvaluate, {
      checkVulnerabilities: true,
      checkMaintenance: true,
      checkSupplyChain: true,
      checkLicense: true,
    });

    const report = {
      library: libraryToEvaluate,
      version: securityAudit.version,
      vulnerabilities: {
        critical: securityAudit.vulns.critical,
        high: securityAudit.vulns.high,
        medium: securityAudit.vulns.medium,
        low: securityAudit.vulns.low,
      },
      maintenance: {
        lastRelease: securityAudit.lastRelease,
        openIssues: securityAudit.openIssues,
        maintainers: securityAudit.maintainerCount,
      },
      supplyChain: {
        directDeps: securityAudit.directDependencies,
        transitiveDeps: securityAudit.transitiveDependencies,
        typosquatRisk: securityAudit.typosquatRisk,
      },
      license: {
        type: securityAudit.license,
        compatible: securityAudit.licenseCompatible,
      },
      recommendation: securityAudit.overallRisk,
    };

    console.log('Security Audit Report:');
    console.log(JSON.stringify(report, null, 2));

    // Fail if critical vulnerabilities exist
    expect(report.vulnerabilities.critical).toBe(0);
    expect(report.license.compatible).toBe(true);
  });

  it('validates HIPAA compliance requirements', async () => {
    const hipaaChecklist = [
      'no-telemetry-without-consent',
      'no-pii-in-logs',
      'encryption-at-rest-support',
      'encryption-in-transit',
      'audit-logging-capability',
      'access-control-integration',
    ];

    const libraryToEvaluate = 'patient-data-handler';
    const compliance = await checkHIPAACompliance(libraryToEvaluate, hipaaChecklist);

    console.log('HIPAA Compliance Check:');
    hipaaChecklist.forEach(requirement => {
      const status = compliance[requirement] ? 'PASS' : 'FAIL';
      console.log(`  [${status}] ${requirement}`);
    });

    expect(compliance.overallCompliant).toBe(true);
  });
});
```

### Scenario 5: Migration Effort Assessment
```typescript
describe('Migration Effort Assessment', () => {
  it('estimates effort to adopt new state management library', async () => {
    const currentLib = 'zustand';
    const targetLib = 'jotai';

    const assessment = await assessMigrationEffort({
      from: currentLib,
      to: targetLib,
      codebase: {
        storeFiles: await glob('src/stores/**/*.ts'),
        componentFiles: await glob('src/components/**/*.tsx'),
        testFiles: await glob('src/**/*.test.ts'),
      },
    });

    const report = {
      summary: {
        totalFilesToChange: assessment.affectedFiles.length,
        linesOfCodeToChange: assessment.estimatedLOC,
        estimatedHours: assessment.estimatedHours,
        complexity: assessment.complexity, // low, medium, high
      },
      breakdown: {
        storeRefactoring: assessment.storeChanges,
        componentUpdates: assessment.componentChanges,
        testUpdates: assessment.testChanges,
        typeDefinitions: assessment.typeChanges,
      },
      risks: assessment.risks,
      benefits: assessment.benefits,
      recommendation: assessment.recommendation,
    };

    console.log('Migration Effort Assessment:');
    console.log('============================\n');
    console.log(`From: ${currentLib} → To: ${targetLib}\n`);
    console.log('Summary:');
    console.log(`  Files to change: ${report.summary.totalFilesToChange}`);
    console.log(`  Estimated LOC: ${report.summary.linesOfCodeToChange}`);
    console.log(`  Estimated Hours: ${report.summary.estimatedHours}`);
    console.log(`  Complexity: ${report.summary.complexity}\n`);
    console.log('Risks:');
    report.risks.forEach(r => console.log(`  - ${r}`));
    console.log('\nBenefits:');
    report.benefits.forEach(b => console.log(`  + ${b}`));
    console.log(`\nRecommendation: ${report.recommendation}`);

    return report;
  });
});
```

---

## Evaluation Report Template

### Tool Evaluation: [Tool Name]

**Category:** [Testing/CI/Monitoring/State Management/etc.]
**Evaluated By:** Tool Evaluator Agent
**Date:** [Date]
**Version Evaluated:** [Version]

#### Executive Summary
[Brief 2-3 sentence summary of findings and recommendation]

#### Scores

| Criteria | Score | Notes |
|----------|-------|-------|
| Compatibility | /10 | |
| Performance | /10 | |
| Security | /10 | |
| Documentation | /10 | |
| Community | /10 | |
| **Overall** | **/10** | |

#### Pros
- [Pro 1]
- [Pro 2]
- [Pro 3]

#### Cons
- [Con 1]
- [Con 2]
- [Con 3]

#### Migration Path
[Description of how to adopt this tool]

#### Recommendation
- [ ] **Adopt** - Ready for production use
- [ ] **Trial** - Worth exploring in a limited scope
- [ ] **Assess** - Needs more evaluation
- [ ] **Hold** - Not recommended at this time

#### Decision Record
[Link to ADR if decision was made]
