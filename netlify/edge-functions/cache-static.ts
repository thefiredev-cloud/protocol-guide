/**
 * Netlify Edge Function: Cache Static Data
 * CDN-level caching for static protocol stats and coverage data
 */

import type { Context } from "@netlify/edge-functions";

// Cache durations
const CACHE_DURATIONS = {
  stats: 3600,      // 1 hour for global stats
  coverage: 3600,   // 1 hour for coverage data
  agencies: 1800,   // 30 minutes for agency lists
} as const;

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only handle specific API paths
  if (!path.startsWith("/api/static/")) {
    return context.next();
  }

  // Determine cache duration based on path
  let cacheDuration = 600; // Default 10 minutes
  if (path.includes("/stats")) {
    cacheDuration = CACHE_DURATIONS.stats;
  } else if (path.includes("/coverage")) {
    cacheDuration = CACHE_DURATIONS.coverage;
  } else if (path.includes("/agencies")) {
    cacheDuration = CACHE_DURATIONS.agencies;
  }

  // Check for cached response
  const cacheKey = `edge-cache:${path}`;

  // Forward to origin
  const response = await context.next();

  // If successful, add cache headers
  if (response.ok) {
    const newHeaders = new Headers(response.headers);

    // Set cache-control for CDN
    newHeaders.set(
      "Cache-Control",
      `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`
    );

    // Add cache status header
    newHeaders.set("X-Edge-Cache", "MISS");
    newHeaders.set("X-Edge-Cache-TTL", cacheDuration.toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  return response;
}

export const config = {
  path: "/api/static/*",
};
