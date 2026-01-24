/**
 * Centralized responsive breakpoints hook
 *
 * Provides consistent breakpoint calculations across all components.
 * Uses a single source of truth for mobile/tablet/desktop thresholds.
 */

import { useWindowDimensions } from "react-native";

/**
 * Breakpoint constants (in pixels)
 * - sm: Mobile threshold (below this = mobile)
 * - lg: Desktop threshold (at or above = desktop)
 * - xl: Large desktop threshold
 * - xxl: Extra large desktop threshold
 */
export const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
  xl: 1280,
  xxl: 1440,
} as const;

export type Breakpoint = "mobile" | "tablet" | "desktop" | "largeDesktop";

export interface ResponsiveState {
  /** Current window width in pixels */
  width: number;
  /** Current window height in pixels */
  height: number;
  /** True if width < 640px */
  isMobile: boolean;
  /** True if width >= 640px and < 1024px */
  isTablet: boolean;
  /** True if width >= 1024px */
  isDesktop: boolean;
  /** True if width >= 1440px */
  isLargeDesktop: boolean;
  /** Current breakpoint name */
  breakpoint: Breakpoint;
}

/**
 * Hook that provides responsive breakpoint state
 *
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
 *
 * return (
 *   <View style={isMobile ? styles.mobile : styles.desktop}>
 *     {isTablet && <TabletOnlyComponent />}
 *   </View>
 * );
 * ```
 */
export function useResponsive(): ResponsiveState {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.sm;
  const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;
  const isLargeDesktop = width >= BREAKPOINTS.xxl;

  const breakpoint: Breakpoint = isLargeDesktop
    ? "largeDesktop"
    : isDesktop
      ? "desktop"
      : isTablet
        ? "tablet"
        : "mobile";

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint,
  };
}

export default useResponsive;
