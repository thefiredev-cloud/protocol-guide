/**
 * Simulation Section - Shared constants and colors
 */

import { Platform } from "react-native";

export const COLORS = {
  primaryRed: "#9B2335",
  chartYellow: "#D97706", // WCAG AA contrast (4.5:1)
  bgLightGray: "#F8FAFC",
  textBlack: "#0F172A",
  textGray: "#475569", // WCAG AA contrast (5.9:1)
  textMuted: "#64748B", // WCAG AA contrast (4.5:1)
  borderGray: "#E2E8F0",
  bgLightPink: "#FEF2F2",
  celebrationGold: "#FFD700",
  celebrationGreen: "#10B981",
};

export const MANUAL_SEARCH_TIME = 90;
export const PROTOCOL_GUIDE_TIME = 2.3;
export const MAX_TIME = 95;
export const CONFETTI_COUNT = 12;

// Check for reduced motion preference
export const prefersReducedMotion = (): boolean => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }
  return false;
};
