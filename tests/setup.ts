/**
 * Vitest global test setup
 * Loads environment variables and configures test utilities
 */
import { beforeAll, afterAll, vi } from "vitest";

// Try to load environment variables, but don't fail if file doesn't exist
try {
  await import("../scripts/load-env.js");
} catch {
  // Ignore - we'll use test defaults
}

// Set ALL required environment variables for testing
// These override any real values to ensure test isolation
const testEnvDefaults: Record<string, string> = {
  NODE_ENV: "test",
  // Database
  DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
  // Auth
  JWT_SECRET: "test-jwt-secret-for-unit-tests-only-32chars",
  NEXT_AUTH_SECRET: "test-next-auth-secret-for-tests-32",
  // Stripe
  STRIPE_SECRET_KEY: "sk_test_placeholder_12345678901234567890",
  STRIPE_WEBHOOK_SECRET: "whsec_test_placeholder_12345678901234",
  STRIPE_PUBLISHABLE_KEY: "pk_test_placeholder_1234567890123456",
  STRIPE_PRO_MONTHLY_PRICE_ID: "price_test_monthly_123456789012",
  STRIPE_PRO_ANNUAL_PRICE_ID: "price_test_annual_1234567890123",
  // Supabase
  SUPABASE_URL: "https://test-project.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-role",
  // Anthropic
  ANTHROPIC_API_KEY: "sk-ant-api-test-placeholder-key-12345",
  // URLs
  APP_URL: "http://localhost:8081",
  SERVER_URL: "http://localhost:3000",
  // Optional but often needed
  RESEND_API_KEY: "",
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
};

for (const [key, value] of Object.entries(testEnvDefaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

// Global test setup
beforeAll(() => {
  // Silence console.log in tests unless DEBUG is set
  if (!process.env.DEBUG) {
    vi.spyOn(console, "log").mockImplementation(() => {});
  }
});

afterAll(() => {
  // Restore console.log
  vi.restoreAllMocks();
});

// Export test utilities

/**
 * Create a mock trace context for testing
 * Matches the TraceContext interface from server/_core/tracing.ts
 */
export function createMockTraceContext(overrides: Partial<{
  requestId: string;
  startTime: number;
  parentTraceId?: string;
  spanId?: string;
  source?: "web" | "mobile" | "api" | "internal";
  userId?: string;
  userTier?: string;
}> = {}) {
  return {
    requestId: overrides.requestId ?? "test-request-id",
    startTime: overrides.startTime ?? Date.now(),
    spanId: overrides.spanId ?? "test-span-id",
    source: overrides.source ?? "api" as const,
    userId: overrides.userId ?? "test-user",
    userTier: overrides.userTier ?? "free",
    parentTraceId: overrides.parentTraceId,
  };
}

/**
 * Create a mock Express-like request object for tRPC context
 * Includes all properties needed by middleware (CSRF, tracing, rate limiting)
 */
export function createMockRequest(overrides: Record<string, unknown> = {}) {
  const { headers: headersOverrides, cookies: cookiesOverrides, ...restOverrides } = overrides as {
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    [key: string]: unknown;
  };

  const csrfToken = "test-csrf-token-12345";

  return {
    protocol: "https",
    hostname: "localhost",
    method: "POST",
    url: "/api/trpc",
    path: "/api/trpc",
    ip: "127.0.0.1",
    headers: {
      authorization: "Bearer test_token",
      "user-agent": "vitest-test-agent",
      "x-csrf-token": csrfToken,
      "x-request-id": "test-request-id",
      ...(headersOverrides || {}),
    },
    cookies: {
      csrf_token: csrfToken,
      ...(cookiesOverrides || {}),
    },
    socket: {
      remoteAddress: "127.0.0.1",
    },
    ...restOverrides,
  };
}

/**
 * Create a mock Express-like response object for tRPC context
 * Includes all methods needed by middleware (tracing headers, rate limit headers, cookies)
 */
export function createMockResponse() {
  const cookies: { name: string; value?: string; options: Record<string, unknown> }[] = [];
  const headers: Record<string, string | number> = {};
  let headersSent = false;

  return {
    cookies,
    headers,
    get headersSent() { return headersSent; },
    cookie: vi.fn((name: string, value: string, options: Record<string, unknown>) => {
      cookies.push({ name, value, options });
    }),
    clearCookie: vi.fn((name: string, options: Record<string, unknown>) => {
      cookies.push({ name, options });
    }),
    setHeader: vi.fn((name: string, value: string | number) => {
      headers[name] = value;
    }),
    getHeader: vi.fn((name: string) => headers[name]),
    json: vi.fn(function(this: unknown) { headersSent = true; return this; }),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(function(this: unknown) { headersSent = true; return this; }),
    end: vi.fn(function(this: unknown) { headersSent = true; return this; }),
  };
}

export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    openId: "test-user",
    supabaseId: "test-supabase-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "google",
    role: "user",
    tier: "free",
    queryCountToday: 0,
    lastQueryDate: null,
    selectedCountyId: null,
    stripeCustomerId: null,
    subscriptionId: null,
    subscriptionStatus: null,
    subscriptionEndDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

/**
 * Rate limit info interface for mock context
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Create a complete tRPC context for testing
 * Includes properly configured request, response, trace context, and optional user
 *
 * Usage:
 *   const ctx = createMockContext({ user: createMockUser({ tier: 'pro' }) });
 *   const caller = appRouter.createCaller(ctx);
 */
export function createMockContext(options: {
  user?: ReturnType<typeof createMockUser> | null;
  requestOverrides?: Record<string, unknown>;
  traceOverrides?: Parameters<typeof createMockTraceContext>[0];
  rateLimitInfo?: RateLimitInfo;
} = {}) {
  const { user = null, requestOverrides = {}, traceOverrides = {}, rateLimitInfo } = options;

  return {
    req: createMockRequest(requestOverrides),
    res: createMockResponse(),
    user,
    trace: createMockTraceContext({
      userId: user?.id?.toString(),
      userTier: user?.tier as string,
      ...traceOverrides,
    }),
    rateLimitInfo,
  };
}
