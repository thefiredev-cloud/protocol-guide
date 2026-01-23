/**
 * Database configuration constants
 * Tier limits, pricing, and feature flags
 */

// Tier configuration - centralized for easy updates
export const TIER_CONFIG = {
  free: {
    dailyQueryLimit: 5,
    maxCounties: 1,
    maxBookmarks: 5,
    offlineAccess: false,
    prioritySupport: false,
  },
  pro: {
    dailyQueryLimit: Infinity,
    maxCounties: Infinity,
    maxBookmarks: Infinity,
    offlineAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    dailyQueryLimit: Infinity,
    maxCounties: Infinity,
    maxBookmarks: Infinity,
    offlineAccess: true,
    prioritySupport: true,
  },
} as const;

// Pricing configuration
export const PRICING = {
  pro: {
    monthly: {
      amount: 999, // in cents
      display: "$9.99",
      interval: "month" as const,
    },
    annual: {
      amount: 8900, // in cents
      display: "$89",
      interval: "year" as const,
      savings: "25%",
    },
  },
} as const;
