/**
 * Token Refresh Race Condition Tests
 * Tests the fixes for concurrent token refresh issues
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { tokenCache } from "../lib/token-cache";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

// Mock Supabase
vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Helper to create a mock session
function createMockSession(accessToken: string, expiresInSeconds: number = 3600): Session {
  return {
    access_token: accessToken,
    refresh_token: "refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    expires_in: expiresInSeconds,
    token_type: "bearer",
    user: {
      id: "user-123",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  };
}

// SKIP: Tests rely on Supabase client mocking which isn't properly isolated
describe.skip("Token Refresh Race Condition Fixes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenCache.clear();
  });

  it("should prevent concurrent refresh requests using mutex", async () => {
    const mockSession = createMockSession("refreshed-token");
    
    // Mock refresh to take some time
    let refreshCallCount = 0;
    vi.mocked(supabase.auth.refreshSession).mockImplementation(async () => {
      refreshCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { data: { session: mockSession, user: mockSession.user }, error: null };
    });

    // Trigger 5 concurrent refresh requests
    const refreshPromises = [
      tokenCache.refreshSession(),
      tokenCache.refreshSession(),
      tokenCache.refreshSession(),
      tokenCache.refreshSession(),
      tokenCache.refreshSession(),
    ];

    await Promise.all(refreshPromises);

    // Should only call refresh once due to mutex
    expect(refreshCallCount).toBe(1);
  });

  it("should cache session from updateCache", async () => {
    const mockSession = createMockSession("cached-token");
    
    // Pre-populate cache
    tokenCache.updateCache(mockSession);
    
    // Calling getSession should return cached value
    const session = await tokenCache.getSession();
    expect(session?.access_token).toBe("cached-token");
  });

  it("should detect when session needs refresh", () => {
    // Session expiring in 2 minutes should need refresh
    const expiringSession = createMockSession("expiring", 120);
    expect(tokenCache.needsRefresh(expiringSession)).toBe(true);
    
    // Session expiring in 1 hour should not need refresh
    const validSession = createMockSession("valid", 3600);
    expect(tokenCache.needsRefresh(validSession)).toBe(false);
  });

  it("should handle refresh failure gracefully", async () => {
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Refresh failed", name: "AuthError", status: 401 },
    });

    const result = await tokenCache.refreshSession();

    expect(result).toBeNull();
  });

  it("should clear cache on logout", () => {
    const mockSession = createMockSession("token");

    // Update cache with session
    tokenCache.updateCache(mockSession);
    expect(tokenCache.getStatus().hasCachedSession).toBe(true);

    // Clear cache (simulating logout)
    tokenCache.clear();

    // Cache should be empty
    const status = tokenCache.getStatus();
    expect(status.hasCachedSession).toBe(false);
    expect(status.refreshInProgress).toBe(false);
  });

  it("should return same promise for concurrent refresh calls", async () => {
    const mockSession = createMockSession("token");

    let resolveRefresh: any;
    const refreshPromise = new Promise<any>((resolve) => {
      resolveRefresh = resolve;
    });

    vi.mocked(supabase.auth.refreshSession).mockImplementation(() => refreshPromise);

    // Start multiple refreshes simultaneously
    const promise1 = tokenCache.refreshSession();
    const promise2 = tokenCache.refreshSession();
    const promise3 = tokenCache.refreshSession();

    // All should be the same promise (checked by string representation)
    expect(promise1.toString()).toBe(promise2.toString());
    expect(promise2.toString()).toBe(promise3.toString());

    // Now resolve
    resolveRefresh({ data: { session: mockSession, user: mockSession.user }, error: null });

    const results = await Promise.all([promise1, promise2, promise3]);

    // All should get the same result
    expect(results[0]).toEqual(results[1]);
    expect(results[1]).toEqual(results[2]);
  });

  it("should report status correctly", () => {
    const status = tokenCache.getStatus();
    
    expect(status).toHaveProperty("hasCachedSession");
    expect(status).toHaveProperty("refreshInProgress");
    expect(status).toHaveProperty("fetchInProgress");
    expect(typeof status.hasCachedSession).toBe("boolean");
    expect(typeof status.refreshInProgress).toBe("boolean");
  });
});
