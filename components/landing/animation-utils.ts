/**
 * Landing Page Animation Utilities
 * Shared animation constants and helpers for consistent micro-interactions
 *
 * Performance: All animations use native driver for 60fps
 * Accessibility: Respects prefers-reduced-motion
 */

import { Platform } from "react-native";

/**
 * Animation timing constants optimized for perceived performance
 */
export const ANIMATION_TIMING = {
  /** Quick interactions (button press, hover) */
  INSTANT: 100,
  /** UI state changes (expand/collapse, fade) */
  FAST: 200,
  /** Entrance animations (scroll-triggered, page load) */
  MEDIUM: 400,
  /** Complex transitions (page changes, multi-step) */
  SLOW: 600,
  /** Stagger delay between list items */
  STAGGER: 150,
} as const;

/**
 * Spring animation presets for natural motion
 */
export const SPRING_CONFIGS = {
  /** Gentle bounce for subtle interactions */
  gentle: {
    friction: 10,
    tension: 80,
  },
  /** Default spring for most UI elements */
  default: {
    friction: 8,
    tension: 100,
  },
  /** Snappy response for buttons */
  snappy: {
    friction: 6,
    tension: 150,
  },
  /** Bouncy for celebration effects */
  bouncy: {
    friction: 4,
    tension: 120,
  },
} as const;

/**
 * Scale values for button press feedback
 */
export const PRESS_SCALE = {
  /** Subtle press (nav links, small buttons) */
  subtle: 0.98,
  /** Default press (medium buttons) */
  default: 0.96,
  /** Prominent press (large CTAs) */
  prominent: 0.94,
} as const;

/**
 * Scroll animation entrance values
 */
export const SCROLL_ENTRANCE = {
  /** Initial Y offset for slide-up animations */
  translateY: 30,
  /** Intersection threshold for triggering */
  threshold: 0.15,
} as const;

/**
 * Check if user prefers reduced motion (web only)
 */
export function prefersReducedMotion(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return false;
  }
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/**
 * Get animation duration respecting reduced motion preference
 * Returns 0 if reduced motion is preferred
 */
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

/**
 * Inject global smooth scroll CSS (web only)
 * Call once on app mount for smooth anchor scrolling
 */
export function injectSmoothScrollCSS() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const styleId = "smooth-scroll-global";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    html {
      scroll-behavior: smooth;
    }

    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Scroll to element with smooth behavior
 */
export function scrollToElement(elementId: string, offset: number = 0) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const element = document.getElementById(elementId);
  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;

  window.scrollTo({
    top: targetPosition,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/**
 * Generate CSS keyframes for complex animations (web only)
 * Returns a unique ID that can be used in animation-name
 */
export function injectKeyframes(name: string, keyframes: string): string {
  if (Platform.OS !== "web" || typeof document === "undefined") return name;

  const styleId = `keyframes-${name}`;
  if (document.getElementById(styleId)) return name;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes ${name} {
      ${keyframes}
    }
  `;
  document.head.appendChild(style);

  return name;
}
