# Visual Regression Testing Guide

This document describes the visual regression testing setup for Protocol Guide using Playwright's built-in screenshot comparison.

## Overview

Visual regression testing ensures that UI changes are intentional and caught before deployment. We use Playwright's screenshot comparison feature to:

- Capture baseline screenshots of key screens
- Compare new screenshots against baselines
- Detect visual regressions automatically
- Support multiple viewports and browsers

## Architecture

### Technology Stack
- **Playwright 1.40.0**: Built-in screenshot comparison with pixel-perfect diffing
- **Test Runner**: Playwright Test
- **CI/CD**: GitHub Actions with artifact storage
- **Baseline Storage**: Git repository (`e2e/__screenshots__/`)

### Test Organization

```
e2e/
├── visual/                          # Visual regression tests
│   ├── search.visual.spec.ts        # Search screen tests
│   ├── coverage.visual.spec.ts      # Coverage/state filter tests
│   ├── profile.visual.spec.ts       # Profile screen tests
│   ├── history.visual.spec.ts       # History screen tests
│   ├── calculator.visual.spec.ts    # Calculator tests
│   └── auth.visual.spec.ts          # Authentication flow tests
├── helpers/
│   └── visual-test.helper.ts        # Shared utilities
└── __screenshots__/                 # Baseline screenshots (committed to git)
    └── visual/
        ├── search.visual.spec.ts/
        ├── coverage.visual.spec.ts/
        └── ...
```

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.002,      // 0.2% max pixel difference
    maxDiffPixels: 100,             // Max 100 pixels can differ
    threshold: 0.2,                 // Pixel color difference threshold
    animations: "disabled",         // Disable animations
    scale: "css",                   // Use CSS scaling
  },
}
```

### Snapshot Configuration
- **Path Template**: `{testDir}/__screenshots__/{testFilePath}/{arg}{-projectName}{-snapshotSuffix}{ext}`
- **Update Mode**: `missing` by default, `all` with `UPDATE_SNAPSHOTS=true`

## Running Tests

### Local Development

```bash
# Run all visual tests
pnpm test:e2e:visual

# Run visual tests on specific browser
pnpm test:e2e:visual:chromium

# Update baseline screenshots (use after intentional UI changes)
pnpm test:e2e:visual:update

# View test report
pnpm test:e2e:visual:report

# Run in UI mode for debugging
pnpm test:e2e:ui e2e/visual/
```

### CI/CD Pipeline

Visual regression tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

The CI pipeline:
1. Runs visual tests on Chromium (Ubuntu)
2. Compares screenshots against committed baselines
3. Uploads reports and diffs as artifacts (30-day retention)
4. Fails if visual differences exceed thresholds
5. Uploads baseline screenshots on success (90-day retention)

## Writing Visual Tests

### Basic Test Structure

```typescript
import { test } from "@playwright/test";
import { takeVisualSnapshot, setupVisualTest } from "../helpers/visual-test.helper";

test.describe("My Screen Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/my-screen");
    await setupVisualTest(page);
  });

  test("renders initial state", async ({ page }) => {
    await takeVisualSnapshot(page, "my-screen-initial", {
      fullPage: true,
      maskDynamicContent: true,
    });
  });
});
```

### Helper Functions

#### `setupVisualTest(page)`
Performs common setup:
- Hides scrollbars for cross-OS consistency
- Waits for fonts to load
- Waits for React Native Web hydration

#### `takeVisualSnapshot(page, name, options)`
Takes a full page screenshot with comparison:

**Options:**
- `fullPage: boolean` - Capture entire page (default: false)
- `maskDynamicContent: boolean` - Mask timestamps, user IDs, etc. (default: false)
- `maskSelectors: string[]` - Additional selectors to mask
- `threshold: number` - Override pixel color threshold
- `maxDiffPixelRatio: number` - Override max diff ratio
- `waitBeforeScreenshot: number` - Wait time in ms (default: 1000)

#### `takeElementSnapshot(page, selector, name, options)`
Takes a screenshot of a specific element.

### Best Practices

1. **Wait for Stability**
   ```typescript
   await setupVisualTest(page);  // Always call this first
   await page.waitForLoadState("networkidle");
   await page.waitForTimeout(1000);  // Allow animations to complete
   ```

2. **Mask Dynamic Content**
   ```typescript
   await takeVisualSnapshot(page, "screen-name", {
     maskDynamicContent: true,  // Masks timestamps, user IDs, etc.
     maskSelectors: [
       '[data-testid="custom-dynamic-element"]',
     ],
   });
   ```

3. **Test Multiple Viewports**
   ```typescript
   test("renders on mobile", async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 });
     await page.goto("/my-screen");
     await setupVisualTest(page);

     await takeVisualSnapshot(page, "my-screen-mobile-375");
   });
   ```

4. **Descriptive Snapshot Names**
   - Use kebab-case
   - Include screen name and state
   - Examples: `search-results-cardiac`, `profile-authenticated`, `calculator-with-inputs`

5. **Skip Tests Requiring Auth**
   ```typescript
   test.skip("renders authenticated state", async ({ page }) => {
     // Would need authentication mock
   });
   ```

## Updating Baselines

### When to Update

Update baselines when:
- You intentionally change UI styling
- You update component layouts
- You add new features that change appearance
- Font rendering changes (after font updates)

### How to Update

**Local:**
```bash
# Update all baselines
pnpm test:e2e:visual:update

# Update specific test file
UPDATE_SNAPSHOTS=true playwright test e2e/visual/search.visual.spec.ts --update-snapshots

# Review changes in git
git diff e2e/__screenshots__/
```

**Review Process:**
1. Run visual tests locally: `pnpm test:e2e:visual`
2. Review failures in HTML report: `pnpm test:e2e:visual:report`
3. If changes are intentional, update baselines: `pnpm test:e2e:visual:update`
4. Review screenshot diffs in git
5. Commit updated baselines with descriptive message

### Baseline Commit Messages

```bash
git add e2e/__screenshots__/
git commit -m "test: Update visual baselines for new button styling"
```

## CI/CD Integration

### GitHub Actions Workflow

The `visual-regression-tests` job:
- Runs on `ubuntu-latest` with Chromium
- Depends on successful `build` job
- Runs in parallel with `e2e-tests`
- Blocks deployment on visual regression failures

### Artifacts

**On Success:**
- `visual-regression-baselines`: All baseline screenshots (90-day retention)
- `visual-regression-report`: HTML test report (30-day retention)

**On Failure:**
- `visual-regression-diffs`: Diff images showing changes (30-day retention)
- `visual-regression-report`: HTML test report with diffs

### Viewing CI Results

1. Go to GitHub Actions run
2. Scroll to "Artifacts" section
3. Download `visual-regression-report`
4. Open `index.html` to see detailed diff viewer

## Troubleshooting

### Test Flakiness

**Symptom:** Tests fail randomly with minor pixel differences

**Solutions:**
1. Increase `waitBeforeScreenshot` time
   ```typescript
   await takeVisualSnapshot(page, "name", {
     waitBeforeScreenshot: 2000,  // Increase from 1000ms
   });
   ```

2. Mask animated elements
   ```typescript
   await takeVisualSnapshot(page, "name", {
     maskSelectors: ['.animated-element'],
   });
   ```

3. Disable animations globally in test
   ```typescript
   await page.addStyleTag({
     content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }',
   });
   ```

### Font Rendering Differences

**Symptom:** Screenshots differ between local and CI

**Solutions:**
1. Use `setupVisualTest()` which waits for fonts
2. Increase threshold for text-heavy screens
   ```typescript
   await takeVisualSnapshot(page, "name", {
     threshold: 0.3,  // Increase from 0.2
   });
   ```

### Cross-Browser Differences

**Symptom:** Tests pass on Chromium but fail on Firefox/WebKit

**Solution:** Run separate baseline sets per browser (already configured):
```bash
# Baselines stored per browser automatically
e2e/__screenshots__/visual/search.visual.spec.ts/
  search-initial-state-chromium.png
  search-initial-state-firefox.png
  search-initial-state-webkit.png
```

### Large Diffs After Changes

**Symptom:** Intentional UI changes cause many test failures

**Solution:**
```bash
# Update all baselines at once
pnpm test:e2e:visual:update

# Review changes
git diff e2e/__screenshots__/

# If correct, commit
git add e2e/__screenshots__/
git commit -m "test: Update baselines for UI redesign"
```

## Mobile Testing (React Native)

### Current Limitations

Visual regression testing currently covers:
- **Web platform** (React Native Web in browsers)
- **Responsive viewports** (mobile, tablet, desktop sizes)

### Not Covered

- **Native iOS screenshots**: Would require Detox + iOS simulator
- **Native Android screenshots**: Would require Detox + Android emulator

### Future Enhancements

To add native mobile visual testing:

1. **Detox Setup**
   ```bash
   npm install detox --save-dev
   detox init
   ```

2. **iOS Simulator Screenshots**
   ```typescript
   await device.takeScreenshot('login-screen');
   ```

3. **Integration Options**
   - Detox built-in screenshot comparison
   - Export to Percy or Chromatic
   - Custom diffing with pixelmatch

## Performance

### Test Execution Time

- **Local**: ~2-3 minutes for full visual suite
- **CI**: ~3-5 minutes (includes browser installation caching)

### Optimization Strategies

1. **Run only Chromium by default**
   ```bash
   pnpm test:e2e:visual:chromium  # Faster than all browsers
   ```

2. **Parallelize on CI** (already configured)
   - Visual tests run in parallel with functional E2E tests

3. **Browser caching** (already configured)
   - Playwright browsers cached in CI (key: playwright-browsers-${{ version }})

## Coverage

### Screens Tested

- ✅ Search (initial state, focused, with results, empty results)
- ✅ Coverage/State Selection (list, California, Texas, New York, Florida)
- ✅ Profile (unauthenticated, sign-in prompt)
- ✅ History (unauthenticated, sign-in prompt)
- ✅ Calculator (initial state, with inputs, results)
- ✅ Authentication (landing, login, OAuth buttons, error states)

### Responsive Viewports

Each screen tested at:
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1920x1080 (Full HD)

### Browser Coverage

- **CI**: Chromium only (consistency)
- **Local**: Can test on Chromium, Firefox, WebKit

## Related Documentation

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- [E2E Test Suite](../e2e/README.md) (if exists)

## Maintenance

### Regular Tasks

1. **Update baselines after design changes**
2. **Review failed visual tests in CI**
3. **Add new tests for new screens/features**
4. **Adjust thresholds if too strict/lenient**

### Baseline Cleanup

Periodically remove unused baselines:
```bash
# Find orphaned screenshots (no matching test)
# Manual review required
```

---

**Questions or Issues?**
- Check test reports: `pnpm test:e2e:visual:report`
- Review CI artifacts in GitHub Actions
- See Playwright docs: https://playwright.dev/docs/test-snapshots
