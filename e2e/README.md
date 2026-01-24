# E2E Testing Suite

End-to-end testing for Protocol Guide using Playwright.

## Test Types

### Functional E2E Tests
Located in `e2e/*.spec.ts`:
- `auth.spec.ts` - Authentication flows
- `search.spec.ts` - Search functionality
- `checkout.spec.ts` - Checkout/payment flows

**Run:**
```bash
pnpm test:e2e                # Run all E2E tests
pnpm test:e2e:headed         # Run with visible browser
pnpm test:e2e:ui            # Interactive UI mode
```

### Visual Regression Tests
Located in `e2e/visual/*.visual.spec.ts`:
- `search.visual.spec.ts` - Search screen UI
- `coverage.visual.spec.ts` - Coverage/state selection UI
- `profile.visual.spec.ts` - Profile screen UI
- `history.visual.spec.ts` - History screen UI
- `calculator.visual.spec.ts` - Calculator UI
- `auth.visual.spec.ts` - Authentication UI

**Run:**
```bash
pnpm test:e2e:visual                # Run visual regression tests
pnpm test:e2e:visual:update         # Update baseline screenshots
pnpm test:e2e:visual:chromium       # Run on Chromium only (faster)
pnpm test:e2e:visual:report         # View HTML report
```

## Documentation

- **Visual Testing Guide**: [VISUAL_TESTING.md](./VISUAL_TESTING.md)
- **Playwright Docs**: https://playwright.dev

## Directory Structure

```
e2e/
├── README.md                        # This file
├── VISUAL_TESTING.md               # Visual regression testing guide
├── auth.spec.ts                    # Auth functional tests
├── search.spec.ts                  # Search functional tests
├── checkout.spec.ts                # Checkout functional tests
├── helpers/
│   └── visual-test.helper.ts       # Visual test utilities
├── visual/                         # Visual regression tests
│   ├── search.visual.spec.ts
│   ├── coverage.visual.spec.ts
│   ├── profile.visual.spec.ts
│   ├── history.visual.spec.ts
│   ├── calculator.visual.spec.ts
│   └── auth.visual.spec.ts
└── __screenshots__/                # Baseline screenshots (committed)
    └── visual/
        ├── search.visual.spec.ts/
        ├── coverage.visual.spec.ts/
        └── ...
```

## Quick Start

### Run All Tests
```bash
pnpm test:all           # Unit + E2E + Visual
```

### Run Specific Test Type
```bash
pnpm test               # Unit tests only
pnpm test:e2e           # E2E tests only
pnpm test:e2e:visual    # Visual tests only
```

### Debug Tests
```bash
pnpm test:e2e:headed    # Run with visible browser
pnpm test:e2e:ui        # Interactive UI mode
```

### CI/CD
Tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

Visual regression failures block deployment.

## Adding New Tests

### Functional Test
```typescript
// e2e/my-feature.spec.ts
import { test, expect } from "@playwright/test";

test("my feature works", async ({ page }) => {
  await page.goto("/my-feature");
  // ... assertions
});
```

### Visual Test
```typescript
// e2e/visual/my-feature.visual.spec.ts
import { test } from "@playwright/test";
import { takeVisualSnapshot, setupVisualTest } from "../helpers/visual-test.helper";

test("renders my feature", async ({ page }) => {
  await page.goto("/my-feature");
  await setupVisualTest(page);

  await takeVisualSnapshot(page, "my-feature-initial", {
    fullPage: true,
    maskDynamicContent: true,
  });
});
```

## Troubleshooting

### Tests Failing Locally
1. Ensure dev server is running: `pnpm dev`
2. Clear Playwright cache: `pnpm exec playwright install`
3. Check browser compatibility

### Visual Tests Flaky
1. Increase wait time in test
2. Mask animated elements
3. See [VISUAL_TESTING.md](./VISUAL_TESTING.md#troubleshooting)

### Update Baselines After UI Changes
```bash
pnpm test:e2e:visual:update
git diff e2e/__screenshots__/
git add e2e/__screenshots__/
git commit -m "test: Update visual baselines"
```
