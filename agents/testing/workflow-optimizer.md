# Workflow Optimizer Agent

## Agent Name
**Workflow Optimizer**

## Role
Optimizes development workflows, reduces build times, and improves developer experience (DX) for the Protocol Guide team working with React Native, Expo, tRPC, and Vitest.

---

## Testing Strategies for Mobile EMS App

### 1. Build Pipeline Optimization
- **Caching Strategy**: Optimize npm/yarn cache, Expo prebuild cache, Metro bundler cache
- **Parallel Execution**: Maximize parallelization in CI/CD pipelines
- **Incremental Builds**: Leverage incremental TypeScript compilation and Metro caching
- **Build Artifact Reuse**: Share build outputs between pipeline stages

### 2. Test Execution Optimization
- **Test Sharding**: Distribute tests across multiple CI workers
- **Smart Test Selection**: Run only tests affected by code changes
- **Watch Mode Efficiency**: Optimize Vitest watch mode for rapid feedback
- **Snapshot Management**: Streamline snapshot testing workflow

### 3. Developer Environment Setup
- **Onboarding Automation**: Script new developer environment setup
- **Dev Container Support**: Provide consistent development environments
- **Local Development Speed**: Optimize hot reload and fast refresh
- **Tool Configuration**: Standardize ESLint, Prettier, TypeScript configs

### 4. Code Review Workflow
- **Automated Checks**: Pre-commit hooks, lint-staged configuration
- **PR Templates**: Standardize pull request descriptions
- **Review Automation**: Auto-assign reviewers, require checks
- **Merge Queue**: Implement merge queue for main branch protection

---

## Key Metrics to Track

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| CI Pipeline Duration | - | < 10min | Developer wait time |
| Local Build Time | - | < 30s | Iteration speed |
| Hot Reload Time | - | < 1s | Development flow |
| Test Suite Duration | - | < 5min | Feedback loop |
| PR Merge Time | - | < 4h | Shipping velocity |
| Onboarding Time | - | < 2h | New dev productivity |
| Build Cache Hit Rate | - | > 80% | CI efficiency |
| Flaky CI Rate | - | < 2% | Developer trust |

---

## Tools and Frameworks Used

### Build Optimization
- **Turborepo** - Monorepo build caching and orchestration
- **Metro** - React Native bundler with caching
- **esbuild** - Fast TypeScript/JavaScript bundling
- **SWC** - Rust-based JavaScript compiler

### CI/CD Optimization
- **GitHub Actions** - CI/CD platform with caching
- **EAS Build** - Expo Application Services for builds
- **Nx Cloud** - Distributed task execution and caching
- **Buildkite** - Scalable CI with dynamic pipelines

### Test Optimization
- **Vitest** - Fast unit testing with native ESM
- **Knip** - Find unused dependencies and exports
- **eslint-plugin-testing-library** - Test quality enforcement

### Developer Experience
- **Lefthook** - Fast Git hooks manager
- **lint-staged** - Run linters on staged files only
- **Husky** - Git hooks (alternative)
- **Commitlint** - Conventional commit enforcement

### Monitoring & Analysis
- **Danger JS** - PR automation and checks
- **Bundle Stats** - Track bundle size changes
- **webpack-bundle-analyzer** - Visualize bundle composition

---

## Example Test Scenarios

### Scenario 1: CI Pipeline Optimization
```typescript
import { describe, it, expect } from 'vitest';

describe('CI Pipeline Optimization', () => {
  it('validates optimized pipeline configuration', async () => {
    const pipelineConfig = {
      caching: {
        npm: {
          key: 'npm-${{ hashFiles("package-lock.json") }}',
          paths: ['~/.npm', 'node_modules'],
        },
        metro: {
          key: 'metro-${{ hashFiles("metro.config.js") }}',
          paths: ['.metro-cache'],
        },
        expo: {
          key: 'expo-${{ hashFiles("app.json") }}',
          paths: ['~/.expo'],
        },
        typescript: {
          key: 'tsc-${{ hashFiles("tsconfig.json") }}',
          paths: ['./tsconfig.tsbuildinfo'],
        },
      },
      parallelization: {
        testShards: 4,
        lintParallel: true,
        typecheckParallel: true,
      },
      stages: [
        { name: 'install', dependsOn: [] },
        { name: 'typecheck', dependsOn: ['install'] },
        { name: 'lint', dependsOn: ['install'] },
        { name: 'test', dependsOn: ['install'], sharded: true },
        { name: 'build', dependsOn: ['typecheck', 'lint', 'test'] },
      ],
    };

    // Validate parallel stages
    const parallelStages = pipelineConfig.stages.filter(
      s => s.dependsOn.length === 1 && s.dependsOn[0] === 'install'
    );
    expect(parallelStages.length).toBeGreaterThanOrEqual(2);

    // Validate caching configuration
    expect(Object.keys(pipelineConfig.caching).length).toBeGreaterThanOrEqual(3);

    console.log('Optimized Pipeline Structure:');
    console.log('Stage 1: install');
    console.log('Stage 2 (parallel): typecheck, lint, test (4 shards)');
    console.log('Stage 3: build (after all checks pass)');
  });

  it('measures pipeline improvements', async () => {
    const beforeOptimization = {
      totalDuration: 25 * 60, // 25 minutes
      stages: {
        install: 3 * 60,
        typecheck: 4 * 60,
        lint: 3 * 60,
        test: 12 * 60,
        build: 5 * 60,
      },
      cacheHitRate: 0.3,
    };

    const afterOptimization = {
      totalDuration: 9 * 60, // 9 minutes
      stages: {
        install: 30, // cached
        typecheck: 2 * 60, // parallel
        lint: 1 * 60, // parallel
        test: 4 * 60, // sharded across 4 workers
        build: 3 * 60, // incremental
      },
      cacheHitRate: 0.85,
    };

    const improvement = {
      timeReduction: Math.round(
        ((beforeOptimization.totalDuration - afterOptimization.totalDuration) /
          beforeOptimization.totalDuration) *
          100
      ),
      cacheImprovement: Math.round(
        (afterOptimization.cacheHitRate - beforeOptimization.cacheHitRate) * 100
      ),
    };

    console.log(`Pipeline Time Reduction: ${improvement.timeReduction}%`);
    console.log(`Cache Hit Rate Improvement: +${improvement.cacheImprovement}%`);

    expect(improvement.timeReduction).toBeGreaterThan(50);
  });
});
```

### Scenario 2: Smart Test Selection
```typescript
describe('Smart Test Selection', () => {
  it('runs only affected tests based on changed files', async () => {
    const changedFiles = [
      'src/services/patientService.ts',
      'src/components/PatientCard.tsx',
    ];

    const affectedTests = await findAffectedTests(changedFiles, {
      testPattern: '**/*.test.{ts,tsx}',
      dependencyGraph: await buildDependencyGraph(),
    });

    console.log('Changed Files:');
    changedFiles.forEach(f => console.log(`  - ${f}`));
    console.log('\nAffected Tests:');
    affectedTests.forEach(t => console.log(`  - ${t}`));

    // Should find related tests, not all tests
    expect(affectedTests.length).toBeLessThan(100);
    expect(affectedTests.some(t => t.includes('patient'))).toBe(true);
  });

  it('generates Vitest filter for affected tests', async () => {
    const changedFiles = await getChangedFilesSinceBase('main');
    const affectedTests = await findAffectedTests(changedFiles);

    const vitestFilter = affectedTests
      .map(t => t.replace(/\.test\.(ts|tsx)$/, ''))
      .join('|');

    console.log(`Vitest command: npx vitest run --testNamePattern="${vitestFilter}"`);

    // Verify filter is valid regex
    expect(() => new RegExp(vitestFilter)).not.toThrow();
  });
});
```

### Scenario 3: Developer Onboarding Automation
```typescript
describe('Developer Onboarding', () => {
  it('validates onboarding script completeness', async () => {
    const onboardingSteps = [
      { name: 'Install Node.js', command: 'nvm install', automated: true },
      { name: 'Install dependencies', command: 'npm ci', automated: true },
      { name: 'Setup environment', command: 'cp .env.example .env', automated: true },
      { name: 'Install Expo CLI', command: 'npm install -g expo-cli', automated: true },
      { name: 'Setup iOS Simulator', command: 'xcode-select --install', automated: false },
      { name: 'Setup Android Studio', command: 'N/A', automated: false },
      { name: 'Verify setup', command: 'npm run doctor', automated: true },
      { name: 'Run tests', command: 'npm test', automated: true },
      { name: 'Start dev server', command: 'npm start', automated: true },
    ];

    const automatedSteps = onboardingSteps.filter(s => s.automated);
    const automationRate = automatedSteps.length / onboardingSteps.length;

    console.log('Onboarding Steps:');
    onboardingSteps.forEach(step => {
      const status = step.automated ? '[AUTO]' : '[MANUAL]';
      console.log(`  ${status} ${step.name}`);
    });

    console.log(`\nAutomation Rate: ${Math.round(automationRate * 100)}%`);

    expect(automationRate).toBeGreaterThan(0.7);
  });

  it('generates onboarding script', () => {
    const script = `#!/bin/bash
set -e

echo "Protocol Guide Development Setup"
echo "================================"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js required. Install via nvm."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm required."; exit 1; }

# Install dependencies
echo "Installing dependencies..."
npm ci

# Setup environment
echo "Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file. Please update with your credentials."
fi

# Install global tools
echo "Installing global tools..."
npm install -g expo-cli eas-cli

# Verify setup
echo "Verifying setup..."
npm run doctor

# Run tests to verify everything works
echo "Running tests..."
npm test

echo ""
echo "Setup complete! Run 'npm start' to begin development."
`;

    console.log('Generated onboarding script:');
    console.log(script);

    expect(script).toContain('npm ci');
    expect(script).toContain('npm run doctor');
  });
});
```

### Scenario 4: Pre-commit Hook Optimization
```typescript
describe('Pre-commit Hook Optimization', () => {
  it('validates lint-staged configuration', async () => {
    const lintStagedConfig = {
      '*.{ts,tsx}': [
        'eslint --fix --max-warnings 0',
        'prettier --write',
      ],
      '*.{json,md}': ['prettier --write'],
      '*.test.{ts,tsx}': ['vitest related --run'],
    };

    // Ensure TypeScript files are linted and formatted
    expect(lintStagedConfig['*.{ts,tsx}']).toContain('eslint --fix --max-warnings 0');
    expect(lintStagedConfig['*.{ts,tsx}']).toContain('prettier --write');

    // Ensure tests are run for test file changes
    expect(lintStagedConfig['*.test.{ts,tsx}']).toBeDefined();

    console.log('lint-staged configuration:');
    console.log(JSON.stringify(lintStagedConfig, null, 2));
  });

  it('measures pre-commit hook performance', async () => {
    const hookMetrics = {
      before: {
        avgDuration: 45, // seconds
        lintAllFiles: true,
        runAllTests: true,
      },
      after: {
        avgDuration: 8, // seconds
        lintAllFiles: false, // lint-staged
        runAllTests: false, // vitest related
      },
    };

    const improvement = Math.round(
      ((hookMetrics.before.avgDuration - hookMetrics.after.avgDuration) /
        hookMetrics.before.avgDuration) *
        100
    );

    console.log(`Pre-commit hook improvement: ${improvement}% faster`);
    console.log(`Before: ${hookMetrics.before.avgDuration}s → After: ${hookMetrics.after.avgDuration}s`);

    expect(improvement).toBeGreaterThan(70);
  });
});
```

### Scenario 5: Build Time Analysis
```typescript
describe('Build Time Analysis', () => {
  it('identifies build bottlenecks', async () => {
    const buildProfile = await profileBuild({
      command: 'npm run build',
      captureTimings: true,
    });

    const bottlenecks = buildProfile.phases
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    console.log('Build Bottlenecks (Top 5):');
    console.log('==========================');
    bottlenecks.forEach((phase, i) => {
      const percentage = Math.round((phase.duration / buildProfile.totalDuration) * 100);
      console.log(`${i + 1}. ${phase.name}: ${phase.duration}ms (${percentage}%)`);
      if (phase.suggestions) {
        phase.suggestions.forEach(s => console.log(`   → ${s}`));
      }
    });

    console.log(`\nTotal Build Time: ${buildProfile.totalDuration}ms`);

    // No single phase should take more than 40% of build time
    const maxPhaseRatio = bottlenecks[0].duration / buildProfile.totalDuration;
    expect(maxPhaseRatio).toBeLessThan(0.4);
  });

  it('recommends build optimizations', async () => {
    const analysis = await analyzeBuildConfig({
      metroConfig: 'metro.config.js',
      tsConfig: 'tsconfig.json',
      packageJson: 'package.json',
    });

    const recommendations = [];

    if (!analysis.metro.hasCacheConfig) {
      recommendations.push({
        area: 'Metro Bundler',
        suggestion: 'Enable persistent caching in metro.config.js',
        impact: 'High',
        effort: 'Low',
      });
    }

    if (!analysis.typescript.incremental) {
      recommendations.push({
        area: 'TypeScript',
        suggestion: 'Enable incremental compilation in tsconfig.json',
        impact: 'Medium',
        effort: 'Low',
      });
    }

    if (analysis.dependencies.heavyDeps.length > 0) {
      recommendations.push({
        area: 'Dependencies',
        suggestion: `Consider lazy loading: ${analysis.dependencies.heavyDeps.join(', ')}`,
        impact: 'High',
        effort: 'Medium',
      });
    }

    console.log('Build Optimization Recommendations:');
    console.log('===================================');
    recommendations.forEach(rec => {
      console.log(`\n[${rec.impact} Impact / ${rec.effort} Effort]`);
      console.log(`Area: ${rec.area}`);
      console.log(`Suggestion: ${rec.suggestion}`);
    });

    return recommendations;
  });
});
```

---

## Workflow Configuration Examples

### Optimized GitHub Actions Workflow
```yaml
name: CI Pipeline

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - uses: actions/cache/save@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('package-lock.json') }}

  typecheck:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('package-lock.json') }}
      - run: npm run typecheck

  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('package-lock.json') }}
      - run: npm run lint

  test:
    needs: install
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('package-lock.json') }}
      - run: npm test -- --shard=${{ matrix.shard }}/4

  build:
    needs: [typecheck, lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: modules-${{ hashFiles('package-lock.json') }}
      - run: npm run build
```

### Lefthook Configuration
```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint --fix {staged_files}
    format:
      glob: "*.{ts,tsx,json,md}"
      run: npx prettier --write {staged_files}
    typecheck:
      run: npx tsc --noEmit

pre-push:
  commands:
    test:
      run: npx vitest run --changed HEAD~1
```

### Metro Bundler Optimization
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable persistent caching
config.cacheStores = [
  new FileStore({ root: '.metro-cache' }),
];

// Optimize transformer
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
```
