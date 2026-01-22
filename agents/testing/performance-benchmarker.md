# Performance Benchmarker Agent

## Agent Name
**Performance Benchmarker**

## Role
Measures application performance including startup time, search latency, memory usage, and battery impact for the Protocol Guide mobile EMS application on iOS and Android devices.

---

## Testing Strategies for Mobile EMS App

### 1. App Startup Performance
- **Cold Start**: Measure time from app launch to first interactive screen
- **Warm Start**: Track resume time from background state
- **Deep Link Launch**: Time to open specific protocol from notification
- **Splash Screen Duration**: Ensure compliance with platform guidelines

### 2. Search & Query Performance
- **Protocol Search**: Measure autocomplete and full-text search latency
- **Patient Lookup**: Track database query performance for patient records
- **Offline Search**: Compare local SQLite vs remote API performance
- **Filter Operations**: Benchmark complex filtering (by region, certification level)

### 3. Memory & Resource Usage
- **Heap Analysis**: Monitor JavaScript heap size during typical workflows
- **Native Memory**: Track iOS/Android native memory consumption
- **Image Caching**: Measure memory impact of protocol diagrams and images
- **Memory Leaks**: Detect leaks during extended session usage

### 4. Battery & Network Impact
- **Background Sync**: Measure battery drain during location tracking
- **Network Efficiency**: Track data usage for protocol synchronization
- **Push Notifications**: Analyze wake-lock impact on battery
- **GPS Usage**: Monitor location services battery consumption

### 5. Render Performance
- **Frame Rate**: Ensure 60fps during list scrolling and animations
- **Time to Interactive (TTI)**: Measure when UI becomes responsive
- **Layout Shifts**: Detect cumulative layout shift during loading
- **React Native Bridge**: Monitor bridge traffic for bottlenecks

---

## Key Metrics to Track

| Metric | Target | Critical Threshold | Tool |
|--------|--------|-------------------|------|
| Cold Start Time | < 2s | > 4s | Flashlight |
| Warm Start Time | < 500ms | > 1.5s | Flipper |
| Protocol Search P95 | < 100ms | > 300ms | Custom Timer |
| Memory Usage (Idle) | < 150MB | > 300MB | Xcode/Android Studio |
| Memory Usage (Active) | < 250MB | > 400MB | Hermes Profiler |
| JS Thread FPS | 60fps | < 30fps | React DevTools |
| UI Thread FPS | 60fps | < 45fps | Systrace |
| Battery per Hour | < 3% | > 8% | Device Metrics |
| Network per Sync | < 500KB | > 2MB | Charles Proxy |
| Time to Interactive | < 3s | > 5s | Lighthouse |

---

## Tools and Frameworks Used

### React Native Profiling
- **Flipper** - Primary debugging and profiling tool
- **React DevTools Profiler** - Component render analysis
- **Hermes Profiler** - JavaScript engine performance
- **why-did-you-render** - Detect unnecessary re-renders

### Native Platform Tools
- **Xcode Instruments** - iOS memory, CPU, energy profiling
- **Android Studio Profiler** - Android memory, CPU, network analysis
- **Systrace** - Android system-level tracing
- **Firebase Performance** - Production performance monitoring

### Benchmarking Frameworks
- **Flashlight** - Cross-platform mobile performance testing
- **Reassure** - React Native performance regression testing
- **Detox** - E2E performance measurement integration

### Network Analysis
- **Charles Proxy** - Network traffic inspection
- **Reactotron** - API timing and payload analysis
- **Sentry Performance** - Production latency tracking

### CI/CD Performance Gates
- **Danger JS** - PR performance budget enforcement
- **Lighthouse CI** - Web view performance auditing
- **Custom Vitest Benchmarks** - API latency regression tests

---

## Example Test Scenarios

### Scenario 1: Cold Start Benchmark
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { measureColdStart } from './helpers/performance';

describe('App Cold Start Performance', () => {
  it('launches within acceptable time on mid-range device', async () => {
    const results = await measureColdStart({
      iterations: 5,
      deviceProfile: 'mid-range-android',
      clearCache: true,
    });

    expect(results.median).toBeLessThan(2000); // 2 seconds
    expect(results.p95).toBeLessThan(3000);    // 3 seconds
    expect(results.max).toBeLessThan(4000);    // 4 seconds critical
  });

  it('shows interactive login screen within TTI budget', async () => {
    const tti = await measureTimeToInteractive({
      screen: 'LoginScreen',
      interactionTarget: 'email-input',
    });

    expect(tti).toBeLessThan(2500);
  });
});
```

### Scenario 2: Protocol Search Latency
```typescript
import { bench, describe } from 'vitest';
import { searchProtocols } from '../services/protocolService';

describe('Protocol Search Benchmarks', () => {
  bench('autocomplete search (3 chars)', async () => {
    await searchProtocols({ query: 'car', limit: 10 });
  }, { time: 5000, iterations: 100 });

  bench('full-text search with filters', async () => {
    await searchProtocols({
      query: 'pediatric respiratory distress',
      filters: { region: 'northeast', certLevel: 'paramedic' },
      limit: 20,
    });
  }, { time: 5000, iterations: 50 });

  bench('offline cached search', async () => {
    await searchProtocols({
      query: 'cardiac',
      offlineOnly: true,
      limit: 10,
    });
  }, { time: 5000, iterations: 100 });
});
```

### Scenario 3: Memory Usage Tracking
```typescript
describe('Memory Usage Benchmarks', () => {
  it('maintains stable memory during protocol browsing', async () => {
    const memorySnapshots: number[] = [];

    // Simulate browsing 50 protocols
    for (let i = 0; i < 50; i++) {
      await navigateToProtocol(`protocol-${i}`);
      await waitForRender();
      memorySnapshots.push(await getHeapUsage());
      await goBack();
    }

    const initialMemory = memorySnapshots[0];
    const finalMemory = memorySnapshots[memorySnapshots.length - 1];
    const memoryGrowth = finalMemory - initialMemory;

    // Memory should not grow more than 20MB over session
    expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024);
  });

  it('properly releases memory on screen unmount', async () => {
    const beforeMount = await getHeapUsage();

    await navigateToProtocol('complex-protocol-with-images');
    await waitForImagesLoaded();
    const duringView = await getHeapUsage();

    await goBack();
    await forceGarbageCollection();
    const afterUnmount = await getHeapUsage();

    // Memory should return close to initial state
    expect(afterUnmount).toBeLessThan(beforeMount * 1.1);
  });
});
```

### Scenario 4: Battery Impact Simulation
```typescript
describe('Battery Impact Analysis', () => {
  it('maintains low battery usage during background sync', async () => {
    const batteryMetrics = await measureBatteryImpact({
      duration: 60 * 60 * 1000, // 1 hour
      scenario: 'background-location-sync',
      sampleInterval: 60 * 1000, // Every minute
    });

    expect(batteryMetrics.drainPercentage).toBeLessThan(3);
    expect(batteryMetrics.wakeLockDuration).toBeLessThan(5 * 60 * 1000);
    expect(batteryMetrics.networkRequests).toBeLessThan(60);
  });

  it('optimizes GPS usage during incident response', async () => {
    const locationMetrics = await measureLocationImpact({
      scenario: 'active-incident-tracking',
      duration: 30 * 60 * 1000, // 30 minutes
    });

    expect(locationMetrics.gpsFixCount).toBeLessThan(100);
    expect(locationMetrics.batteryDrain).toBeLessThan(5);
  });
});
```

### Scenario 5: Render Performance Regression
```typescript
import { measureRenders } from 'reassure';

describe('Render Performance', () => {
  it('ProtocolList renders within budget', async () => {
    const results = await measureRenders(
      <ProtocolList protocols={mockProtocols} />,
      { runs: 20 }
    );

    expect(results.meanDuration).toBeLessThan(16); // 60fps budget
    expect(results.meanCount).toBeLessThan(3);     // Max re-renders
  });

  it('IncidentDashboard handles rapid updates', async () => {
    const results = await measureRenders(
      <IncidentDashboard incidents={mockIncidents} />,
      {
        runs: 20,
        scenario: async (screen) => {
          // Simulate 10 rapid incident status updates
          for (let i = 0; i < 10; i++) {
            await updateIncidentStatus(screen, `incident-${i}`, 'en-route');
          }
        }
      }
    );

    expect(results.meanDuration).toBeLessThan(50);
  });
});
```

---

## Performance Budget Configuration

```json
{
  "performanceBudgets": {
    "coldStart": {
      "target": 2000,
      "warning": 3000,
      "critical": 4000
    },
    "searchLatency": {
      "p50": 50,
      "p95": 100,
      "p99": 200
    },
    "memoryUsage": {
      "idle": 150,
      "active": 250,
      "peak": 350
    },
    "frameRate": {
      "target": 60,
      "minimum": 45
    },
    "bundleSize": {
      "js": 2000000,
      "assets": 5000000
    }
  }
}
```

---

## Integration with CI/CD

### Performance Gate in GitHub Actions
```yaml
- name: Run Performance Benchmarks
  run: |
    npx vitest bench --reporter=json > benchmark-results.json

- name: Check Performance Budget
  run: |
    node scripts/check-perf-budget.js benchmark-results.json

- name: Upload to Dashboard
  run: |
    curl -X POST $PERF_DASHBOARD_URL \
      -H "Authorization: Bearer $PERF_TOKEN" \
      -d @benchmark-results.json
```

### Alerting Thresholds
- **Warning**: Performance degrades 10% from baseline
- **Critical**: Performance degrades 25% from baseline
- **Block PR**: Performance exceeds critical threshold
