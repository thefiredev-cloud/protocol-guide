# Visual Regression Testing - Initial Setup

This guide walks through setting up visual regression testing for the first time.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Playwright installed (`@playwright/test` in `package.json`)

## Initial Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Install Playwright Browsers

```bash
pnpm exec playwright install chromium
```

Or install all browsers for cross-browser testing:
```bash
pnpm exec playwright install
```

### 3. Start Development Server

Visual tests require the app to be running:

```bash
# Terminal 1: Start dev server
pnpm dev
```

The app should be available at `http://localhost:8081`.

### 4. Generate Baseline Screenshots

Run visual tests for the first time to create baseline screenshots:

```bash
# Terminal 2: Generate baselines
pnpm test:e2e:visual:update
```

This will:
- Run all visual tests
- Create baseline screenshots in `e2e/__screenshots__/`
- Store screenshots per browser/viewport

**Expected Output:**
```
Running 50 tests using 1 worker
✓ 50 passed (5m)
```

### 5. Review Generated Baselines

```bash
# View generated screenshots
ls -R e2e/__screenshots__/

# Example output:
# e2e/__screenshots__/visual/search.visual.spec.ts/
#   search-initial-state-chromium.png
#   search-results-cardiac-chromium.png
#   search-mobile-375-chromium.png
#   ...
```

### 6. Commit Baselines to Git

```bash
git add e2e/__screenshots__/
git commit -m "test: Add initial visual regression baselines"
```

**Important:** Baseline screenshots must be committed to git for CI/CD to work.

### 7. Verify Tests Pass

Now that baselines exist, verify tests pass without changes:

```bash
pnpm test:e2e:visual:chromium
```

**Expected Output:**
```
Running 50 tests using 1 worker
✓ 50 passed (3m)
```

## Verification Checklist

- [ ] Dev server running at `http://localhost:8081`
- [ ] Playwright browsers installed
- [ ] Baseline screenshots generated
- [ ] Screenshots committed to git
- [ ] Visual tests passing

## CI/CD Setup

The CI pipeline is already configured in `.github/workflows/ci.yml`.

On the first CI run:
1. Tests will use committed baselines
2. Any visual differences will fail the build
3. Artifacts will be uploaded for review

## Troubleshooting

### "Baseline not found" errors

**Cause:** Running tests before generating baselines

**Solution:**
```bash
pnpm test:e2e:visual:update  # Generate baselines first
```

### Dev server not starting

**Cause:** Port 8081 in use

**Solution:**
```bash
# Find and kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
EXPO_PORT=8082 pnpm dev
E2E_BASE_URL=http://localhost:8082 pnpm test:e2e:visual:update
```

### Screenshots differ between local and CI

**Cause:** Different OS font rendering (macOS vs Linux)

**Solutions:**
1. Generate baselines on Linux (matches CI):
   ```bash
   docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0-jammy \
     bash -c "npm install && npx playwright test e2e/visual/ --update-snapshots"
   ```

2. Or accept minor differences by adjusting thresholds in `playwright.config.ts`

### Tests are flaky

**Cause:** Animations, dynamic content, or timing issues

**Solutions:**
See [VISUAL_TESTING.md - Troubleshooting](./VISUAL_TESTING.md#troubleshooting)

## Next Steps

1. **Add more visual tests** as features are developed
2. **Update baselines** when UI changes are intentional
3. **Review visual diffs** in CI when tests fail
4. **Maintain baselines** by removing orphaned screenshots

## Resources

- [Visual Testing Guide](./VISUAL_TESTING.md) - Complete documentation
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [E2E Test Suite README](./README.md)
