/**
 * Network Simulation for Performance Testing
 *
 * Simulates various network conditions for testing:
 * - 3G (slow): 400kbps, 400ms latency
 * - Fast 3G: 1.5mbps, 150ms latency
 * - 4G (LTE): 12mbps, 50ms latency
 * - Slow 2G: 50kbps, 2000ms latency
 *
 * Usage:
 *   // In development only
 *   if (__DEV__) {
 *     enableNetworkSimulation('slow3G');
 *   }
 */

import { Platform } from "react-native";

export type NetworkProfile = "slow3G" | "fast3G" | "4G" | "slow2G" | "offline" | "none";

const NETWORK_PROFILES: Record<NetworkProfile, { throughput: number; latency: number } | null> = {
  slow3G: { throughput: 50000, latency: 400 }, // 400kbps, 400ms
  fast3G: { throughput: 187500, latency: 150 }, // 1.5mbps, 150ms
  "4G": { throughput: 1500000, latency: 50 }, // 12mbps, 50ms
  slow2G: { throughput: 6250, latency: 2000 }, // 50kbps, 2000ms
  offline: null,
  none: null,
};

let currentProfile: NetworkProfile = "none";
let originalFetch: typeof fetch | null = null;

/**
 * Enable network simulation (development only)
 */
export function enableNetworkSimulation(profile: NetworkProfile): void {
  if (!__DEV__) {
    console.warn("[NetworkSim] Only available in development mode");
    return;
  }

  if (Platform.OS !== "web") {
    console.warn("[NetworkSim] Only available on web platform");
    return;
  }

  currentProfile = profile;
  const config = NETWORK_PROFILES[profile];

  if (!originalFetch) {
    originalFetch = global.fetch;
  }

  if (profile === "none") {
    // Restore original fetch
    if (originalFetch) {
      global.fetch = originalFetch;
    }
    console.log("[NetworkSim] Disabled");
    return;
  }

  if (profile === "offline") {
    // Simulate offline
    global.fetch = async () => {
      throw new Error("NetworkError: Simulated offline");
    };
    console.log("[NetworkSim] Simulating offline mode");
    return;
  }

  if (!config) return;

  // Create throttled fetch
  global.fetch = async (input, init) => {
    if (!originalFetch) throw new Error("Original fetch not available");

    // Add latency
    await delay(config.latency);

    const startTime = performance.now();
    const response = await originalFetch(input, init);

    // Clone response to read body size
    const clonedResponse = response.clone();
    const blob = await clonedResponse.blob();
    const bodySize = blob.size;

    // Calculate how long download should take at simulated throughput
    const downloadTime = (bodySize / config.throughput) * 1000;
    const elapsedTime = performance.now() - startTime;
    const remainingDelay = Math.max(0, downloadTime - elapsedTime);

    // Add remaining delay to simulate slow download
    if (remainingDelay > 0) {
      await delay(remainingDelay);
    }

    return response;
  };

  console.log(
    `[NetworkSim] Enabled: ${profile} (${config.throughput / 1000}kbps, ${config.latency}ms latency)`
  );
}

/**
 * Disable network simulation
 */
export function disableNetworkSimulation(): void {
  enableNetworkSimulation("none");
}

/**
 * Get current network simulation profile
 */
export function getCurrentNetworkProfile(): NetworkProfile {
  return currentProfile;
}

/**
 * Utility delay function
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test all network profiles
 * Useful for manual testing during development
 */
export async function runNetworkTests(
  testUrl: string = "/api/health"
): Promise<void> {
  if (!__DEV__) {
    console.warn("[NetworkSim] Tests only available in development");
    return;
  }

  console.log("\n=== Network Simulation Tests ===\n");

  const profiles: NetworkProfile[] = ["4G", "fast3G", "slow3G", "slow2G"];

  for (const profile of profiles) {
    enableNetworkSimulation(profile);

    const startTime = performance.now();
    try {
      await fetch(testUrl);
      const duration = performance.now() - startTime;
      console.log(`${profile}: ${duration.toFixed(0)}ms`);
    } catch (error) {
      console.log(`${profile}: Failed -`, error);
    }
  }

  // Restore normal network
  disableNetworkSimulation();
  console.log("\n=== Tests Complete ===\n");
}

/**
 * Network quality detection based on actual measurements
 */
export async function detectNetworkQuality(): Promise<{
  profile: NetworkProfile;
  latency: number;
  throughput: number;
}> {
  const testUrl = "/api/health";
  const testSize = 1024; // 1KB test payload

  try {
    // Measure latency
    const latencyStart = performance.now();
    await fetch(testUrl, { method: "HEAD" });
    const latency = performance.now() - latencyStart;

    // Measure throughput (rough estimate)
    const throughputStart = performance.now();
    const response = await fetch(testUrl);
    const blob = await response.blob();
    const throughputTime = performance.now() - throughputStart;
    const throughput = (blob.size / throughputTime) * 1000; // bytes per second

    // Classify network quality
    let profile: NetworkProfile;
    if (latency < 100 && throughput > 1000000) {
      profile = "4G";
    } else if (latency < 200 && throughput > 100000) {
      profile = "fast3G";
    } else if (latency < 500 && throughput > 20000) {
      profile = "slow3G";
    } else {
      profile = "slow2G";
    }

    return { profile, latency, throughput };
  } catch {
    return { profile: "offline", latency: 0, throughput: 0 };
  }
}
