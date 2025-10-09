import { expect, test } from '@playwright/test';

test.describe('Security Headers - HIPAA Compliance', () => {
  test('homepage has strict HSTS header', async ({ page }) => {
    const response = await page.goto('/');
    const hsts = response?.headers()['strict-transport-security'];

    expect(hsts).toBeTruthy();
    expect(hsts).toContain('max-age=63072000'); // 2 years
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  test('API routes have no-store cache control', async ({ page }) => {
    const response = await page.goto('/api/health');
    const cache = response?.headers()['cache-control'];

    expect(cache).toBeTruthy();
    expect(cache).toContain('no-store');
    expect(cache).toContain('no-cache');
    expect(cache).toContain('must-revalidate');
    expect(cache).toContain('private');
  });

  test('CSP blocks unsafe-inline for scripts in production', async ({ page }) => {
    // Skip in dev mode where unsafe-eval is needed for HMR
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      test.skip();
    }

    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];

    expect(csp).toBeTruthy();
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-eval'");

    // Should use wasm-unsafe-eval instead (Next.js requirement)
    expect(csp).toContain("script-src 'self' 'wasm-unsafe-eval'");
  });

  test('CSP allows Google Fonts stylesheets', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];

    expect(csp).toBeTruthy();
    expect(csp).toContain('https://fonts.googleapis.com');
    expect(csp).toContain('https://fonts.gstatic.com');
  });

  test('X-Frame-Options prevents clickjacking', async ({ page }) => {
    const response = await page.goto('/');
    const frameOptions = response?.headers()['x-frame-options'];

    expect(frameOptions).toBeTruthy();
    // Should be DENY in production, SAMEORIGIN in preview
    expect(['DENY', 'SAMEORIGIN']).toContain(frameOptions);
  });

  test('X-Content-Type-Options prevents MIME sniffing', async ({ page }) => {
    const response = await page.goto('/');
    const contentType = response?.headers()['x-content-type-options'];

    expect(contentType).toBe('nosniff');
  });

  test('Permissions-Policy disables unused features', async ({ page }) => {
    const response = await page.goto('/');
    const permissions = response?.headers()['permissions-policy'];

    expect(permissions).toBeTruthy();
    expect(permissions).toContain('geolocation=()');
    expect(permissions).toContain('microphone=()');
    expect(permissions).toContain('camera=()');
    expect(permissions).toContain('payment=()');
  });

  test('Referrer-Policy is set correctly', async ({ page }) => {
    const response = await page.goto('/');
    const referrer = response?.headers()['referrer-policy'];

    expect(referrer).toBe('strict-origin-when-cross-origin');
  });

  test('X-XSS-Protection is enabled', async ({ page }) => {
    const response = await page.goto('/');
    const xss = response?.headers()['x-xss-protection'];

    expect(xss).toBe('1; mode=block');
  });

  test('CSP includes base-uri directive', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];

    expect(csp).toBeTruthy();
    expect(csp).toContain("base-uri 'self'");
  });

  test('CSP includes form-action directive', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];

    expect(csp).toBeTruthy();
    expect(csp).toContain("form-action 'self'");
  });

  test('CSP upgrades insecure requests in production', async ({ page }) => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      test.skip();
    }

    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];

    expect(csp).toBeTruthy();
    expect(csp).toContain('upgrade-insecure-requests');
  });

  test('API endpoint /api/chat has security headers', async ({ request }) => {
    // Send a simple request (won't test auth, just headers)
    const response = await request.post('/api/chat', {
      data: { messages: [], streamMode: false },
      failOnStatusCode: false, // Might fail on auth, we only care about headers
    });

    const cache = response.headers()['cache-control'];
    const csp = response.headers()['content-security-policy'];

    expect(cache).toContain('no-store');
    expect(csp).toBeTruthy();
  });

  test('static assets do not have overly restrictive cache headers', async ({ page, request }) => {
    // Navigate to a page to load assets
    await page.goto('/');

    // Check a static asset (favicon or similar)
    const response = await request.get('/favicon.ico');
    const cache = response.headers()['cache-control'];

    // Static assets should be cacheable (not no-store like API)
    if (cache) {
      // Should not have the strict API cache policy
      const hasStrictPolicy = cache.includes('no-store') &&
                              cache.includes('no-cache') &&
                              cache.includes('must-revalidate');
      expect(hasStrictPolicy).toBe(false);
    }
  });

  test('CSP allows WebSocket connections in development', async ({ page }) => {
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) {
      test.skip();
    }

    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];

    expect(csp).toBeTruthy();
    expect(csp).toContain('ws:');
    expect(csp).toContain('wss:');
  });
});
