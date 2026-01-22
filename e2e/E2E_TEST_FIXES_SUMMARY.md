# E2E Test Fixes Summary

## Root Causes Identified

### 1. React Native Web Selector Issues  
**Problem**: `getByPlaceholder()` doesn't work with React Native Web's TextInput component.

**Solution**: Added `testID="search-input"` to the ChatInput component and updated tests to use:
- `page.locator('[data-testid="search-input"]')` - HTML5 data attribute
- Fallback: `page.locator('input[placeholder*="protocol"]')` - Placeholder matching

**Files Modified**:
- `/components/chat-input.tsx` - Added testID and accessibilityLabel
- `/e2e/search.spec.ts` - Updated all selectors

### 2. Authentication Guard Blocking Tests
**Problem**: The `(tabs)/_layout.tsx` requires authentication and redirects to "/" for unauthenticated users.

**Current Behavior**:
```typescript
// app/(tabs)/_layout.tsx lines 20-26
useEffect(() => {
  if (!loading && !isAuthenticated && !hasRedirected.current) {
    hasRedirected.current = true;
    router.replace("/");  // Redirects to landing page
  }
}, [loading, isAuthenticated, router]);
```

**Impact**: 
- Tests cannot access `/(tabs)/` routes without authentication
- All search tests fail because they try to access protected routes
- Profile and history tests also fail for the same reason

## Required Solutions

### Option 1: Test with Landing Page (Quickest)
Update tests to work with the public landing page instead of tabs:
- Use "/" route (landing page)
- Tests interact with landing page UI
- No auth required

### Option 2: Mock Authentication (Recommended for E2E)
Add test authentication setup:
- Create test user session in Playwright
- Set Supabase auth cookies/localStorage
- Tests can access protected routes

### Option 3: Environment-Based Auth Guard
Disable auth guard in E2E environment:
```typescript
const isE2E = process.env.PLAYWRIGHT_TEST === 'true';
if (!isE2E && !loading && !isAuthenticated) {
  router.replace("/");
}
```

## Current Test Status

### Passing (18 tests)
- Checkout/subscription tests
- State filter tests (use public coverage page)
- Most auth UI tests
- OAuth error handling tests

### Failing (9 tests)
#### Search Tests (7 failures)
- All timeout waiting for search input
- Root cause: Protected by auth guard

#### Auth Tests (2 failures) 
- Profile page test - expects sign-in prompt, gets loading spinner
- History page test - expects sign-in prompt, gets loading spinner
- Root cause: Protected routes show loading, then redirect

## Files Modified

1. **components/chat-input.tsx**
   - Added `testID="search-input"`
   - Added `accessibilityLabel="Protocol search input"`

2. **e2e/search.spec.ts**
   - Updated all routes from `/` to `/(tabs)/`
   - Changed selectors to use data-testid
   - Added 2s timeout for React Native Web rendering

3. **e2e/auth.spec.ts**
   - Updated routes to `/(tabs)/profile` and `/(tabs)/history`
   - Added 2s wait for content to load
   - Updated assertions for inline auth prompts

## Recommended Next Steps

1. **Choose authentication strategy** (Option 2 recommended)
2. **Create test auth helper**:
   ```typescript
   // e2e/helpers/auth.ts
   export async function authenticateForTests(page: Page) {
     // Set up mock auth session
     await page.context().addCookies([...]);
     await page.evaluate(() => {
       localStorage.setItem('supabase.auth.token', {...});
     });
   }
   ```

3. **Update test setup**:
   ```typescript
   test.beforeEach(async ({ page }) => {
     await authenticateForTests(page);
     await page.goto("/(tabs)/");
   });
   ```

4. **Alternative**: Create public test routes that bypass auth for E2E only

## Technical Notes

- React Native Web uses `testID` prop which renders as `data-testid` in HTML
- Playwright requires explicit waits for React Native Web (2-3s typical)
- Auth redirects happen in useEffect, causing loading states during tests
- Landing page (/) is public, tabs routes require authentication

