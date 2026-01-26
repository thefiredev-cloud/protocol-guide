/**
 * Optimized React Query Client Configuration
 *
 * Performance targets:
 * - Cache protocol data aggressively (1 hour staleTime)
 * - Instant UI feedback with background refetching
 * - Offline-first with stale data fallback
 * - Smart retry logic for field conditions
 */

import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { Platform } from "react-native";

/**
 * Cache time configuration (in milliseconds)
 *
 * For EMS field use:
 * - Protocol data changes infrequently
 * - Network may be unreliable
 * - Prioritize availability over freshness
 */
export const CACHE_CONFIG = {
  // How long before data is considered stale
  staleTime: {
    protocols: 1000 * 60 * 60, // 1 hour - protocols rarely change
    stats: 1000 * 60 * 30, // 30 minutes - stats updated less frequently
    coverage: 1000 * 60 * 60, // 1 hour - coverage data is static
    user: 1000 * 60 * 5, // 5 minutes - user data can change
    default: 1000 * 60 * 5, // 5 minutes default
  },
  // How long to keep unused data in cache
  gcTime: {
    protocols: 1000 * 60 * 60 * 24, // 24 hours - keep protocol cache for offline
    stats: 1000 * 60 * 60 * 2, // 2 hours
    coverage: 1000 * 60 * 60 * 24, // 24 hours
    user: 1000 * 60 * 30, // 30 minutes
    default: 1000 * 60 * 30, // 30 minutes default
  },
} as const;

/**
 * Retry configuration for unreliable networks
 */
const RETRY_CONFIG = {
  // Exponential backoff with jitter
  retryDelay: (attemptIndex: number) => {
    const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
    const jitter = Math.random() * 1000;
    return baseDelay + jitter;
  },
  // Retry count based on error type
  retry: (failureCount: number, error: unknown) => {
    // Don't retry client errors (4xx)
    if (error instanceof Error && error.message.includes("4")) {
      return false;
    }
    // Don't retry auth errors
    if (error instanceof Error && error.message.includes("401")) {
      return false;
    }
    // Retry up to 2 times for network errors
    return failureCount < 2;
  },
};

/**
 * Create optimized query client for EMS field use
 */
export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Log errors for monitoring (non-blocking)
        console.warn(`[QueryCache] Error for ${query.queryKey}:`, error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        console.warn(`[MutationCache] Error:`, error);
      },
    }),
    defaultOptions: {
      queries: {
        // Stale time - how long before refetching
        staleTime: CACHE_CONFIG.staleTime.default,
        // GC time - how long to keep in cache after unused
        gcTime: CACHE_CONFIG.gcTime.default,
        // Don't refetch on window focus (mobile app behavior)
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect immediately (preserve battery)
        refetchOnReconnect: "always",
        // Refetch on mount only if stale
        refetchOnMount: true,
        // Use placeholder data while fetching
        placeholderData: (previousData: unknown) => previousData,
        // Network mode - always fetch when online
        networkMode: "online",
        // Retry configuration
        ...RETRY_CONFIG,
        // Enable structural sharing for performance
        structuralSharing: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Network mode for mutations
        networkMode: "online",
      },
    },
  });
}

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  search: {
    all: ["search"] as const,
    semantic: (query: string, stateFilter?: string, agencyId?: number) =>
      ["search", "semantic", { query, stateFilter, agencyId }] as const,
    byAgency: (query: string, agencyId: number) =>
      ["search", "byAgency", { query, agencyId }] as const,
    stats: () => ["search", "stats"] as const,
    coverage: () => ["search", "coverage"] as const,
    agencies: (state?: string) => ["search", "agencies", { state }] as const,
  },
  user: {
    all: ["user"] as const,
    profile: (userId?: number) => ["user", "profile", userId] as const,
    usage: (userId?: number) => ["user", "usage", userId] as const,
    history: (userId?: number, limit?: number) =>
      ["user", "history", { userId, limit }] as const,
  },
  protocols: {
    all: ["protocols"] as const,
    detail: (id: number) => ["protocols", "detail", id] as const,
    byCounty: (countyId: number) => ["protocols", "county", countyId] as const,
  },
} as const;

/**
 * Get appropriate stale time for query key
 */
export function getStaleTimeForKey(queryKey: readonly unknown[]): number {
  const [domain, type] = queryKey;

  if (domain === "search") {
    if (type === "stats") return CACHE_CONFIG.staleTime.stats;
    if (type === "coverage") return CACHE_CONFIG.staleTime.coverage;
    return CACHE_CONFIG.staleTime.protocols;
  }

  if (domain === "user") {
    return CACHE_CONFIG.staleTime.user;
  }

  if (domain === "protocols") {
    return CACHE_CONFIG.staleTime.protocols;
  }

  return CACHE_CONFIG.staleTime.default;
}

/**
 * Prefetch critical data on app startup
 */
export async function prefetchCriticalData(queryClient: QueryClient) {
  // Prefetch protocol stats (small payload, frequently needed)
  queryClient.prefetchQuery({
    queryKey: queryKeys.search.stats(),
    staleTime: CACHE_CONFIG.staleTime.stats,
  });

  // Prefetch coverage data (needed for state filter)
  queryClient.prefetchQuery({
    queryKey: queryKeys.search.coverage(),
    staleTime: CACHE_CONFIG.staleTime.coverage,
  });
}
