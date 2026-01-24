/**
 * Animation utilities and constants for the simulation section
 */

// Color Palette - Dark Theme
export const COLORS = {
  primaryRed: "#EF4444",
  textWhite: "#F1F5F9",
  textMuted: "#94A3B8",
  textMutedLight: "#CBD5E1",
  bgDark: "#0F172A",
  bgSurface: "#1E293B",
  border: "#334155",
  chartYellow: "#F59E0B",
  celebrationGreen: "#10B981",
};

// Timing Constants
export const MANUAL_SEARCH_TIME = 90;
export const PROTOCOL_GUIDE_TIME = 2.3;
export const MAX_TIME = 95;

export type SimulationState = "idle" | "running" | "complete";
