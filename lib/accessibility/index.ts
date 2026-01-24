/**
 * Accessibility Utilities - Main Export
 *
 * Provides utilities for WCAG 2.1 AA/AAA compliance including:
 * - Color contrast calculations (from ./contrast)
 * - Accessibility prop builders (from ./props)
 * - Focus management and screen reader utilities
 */

import { useRef, useEffect, useCallback } from "react";
import { AccessibilityRole, Platform, AccessibilityInfo, findNodeHandle } from "react-native";

// Re-export everything from contrast module
export * from "./contrast";

// Re-export everything from props module
export * from "./props";

/**
 * Common accessibility labels for EMS/medical app
 */
export const MEDICAL_A11Y_LABELS = {
  search: {
    input: "Search protocols",
    button: "Search for medical protocols",
    clear: "Clear search query",
    voiceSearch: "Start voice search",
    stopVoice: "Stop voice recording",
  },
  voice: {
    recording: "Recording your voice",
    processing: "Processing voice input",
    transcribing: "Transcribing speech to text",
    error: "Voice search failed",
    permission: "Microphone permission required",
  },
  navigation: {
    home: "Navigate to home screen",
    search: "Navigate to search screen",
    profile: "Navigate to profile screen",
    back: "Go back to previous screen",
    close: "Close current screen",
  },
  protocol: {
    view: "View protocol details",
    currency: "Protocol currency information",
    source: "View protocol source",
    relevance: "Protocol relevance score",
  },
  filter: {
    state: "Filter protocols by state",
    clear: "Clear state filter",
    apply: "Apply filter",
  },
} as const;

/**
 * Announce message to screen readers
 * For dynamic content updates
 */
export function announceForAccessibility(message: string) {
  if (Platform.OS === "web") {
    // Web: Use ARIA live region
    const liveRegion = document.getElementById("a11y-announcer");
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = "";
      }, 1000);
    }
  } else {
    // React Native: Use native announcer
    const { AccessibilityInfo } = require("react-native");
    AccessibilityInfo.announceForAccessibility(message);
  }
}

/**
 * Focus management for keyboard navigation
 */
export class FocusManager {
  private focusableRefs: any[] = [];
  private currentIndex = 0;

  registerFocusable(ref: any) {
    this.focusableRefs.push(ref);
  }

  clearFocusables() {
    this.focusableRefs = [];
    this.currentIndex = 0;
  }

  focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.focusableRefs.length;
    this.focusCurrent();
  }

  focusPrevious() {
    this.currentIndex =
      (this.currentIndex - 1 + this.focusableRefs.length) % this.focusableRefs.length;
    this.focusCurrent();
  }

  focusFirst() {
    this.currentIndex = 0;
    this.focusCurrent();
  }

  focusLast() {
    this.currentIndex = this.focusableRefs.length - 1;
    this.focusCurrent();
  }

  private focusCurrent() {
    const ref = this.focusableRefs[this.currentIndex];
    if (ref?.current?.focus) {
      ref.current.focus();
    }
  }
}

/**
 * Comprehensive focusable element selector (WCAG 2.1)
 * Includes all interactive elements that can receive keyboard focus
 */
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details',
  'summary',
  '[role="button"]:not([disabled])',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="tab"]',
].join(', ');

/**
 * Focus trap hook for modals (WCAG 2.4.3)
 *
 * Traps keyboard focus within a modal when visible.
 * Supports ESC key to close on web.
 * Returns focus to trigger element on close.
 */
export interface UseFocusTrapOptions {
  visible: boolean;
  onClose: () => void;
  /** Allow ESC key to close modal (default: true) */
  allowEscapeClose?: boolean;
  /** Selector for first focusable element (web only) */
  initialFocusSelector?: string;
}

export interface UseFocusTrapReturn {
  /** Ref to attach to modal container */
  containerRef: React.RefObject<any>;
  /** Props to spread on modal container for a11y */
  containerProps: {
    accessible: boolean;
    accessibilityViewIsModal: boolean;
    accessibilityRole: AccessibilityRole;
  };
}

/**
 * Hook for managing focus trap within modals
 *
 * Usage:
 * ```tsx
 * const { containerRef, containerProps } = useFocusTrap({
 *   visible,
 *   onClose,
 * });
 *
 * return (
 *   <Modal visible={visible}>
 *     <View ref={containerRef} {...containerProps}>
 *       {content}
 *     </View>
 *   </Modal>
 * );
 * ```
 */
export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapReturn {
  const { visible, onClose, allowEscapeClose = true, initialFocusSelector } = options;

  const containerRef = useRef<any>(null);
  const previousActiveElementRef = useRef<Element | null>(null);

  // Handle ESC key press (web only)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!visible) return;

      // ESC key closes modal
      if (event.key === "Escape" && allowEscapeClose) {
        event.preventDefault();
        onClose();
        return;
      }

      // Tab key traps focus within modal
      if (event.key === "Tab" && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Shift + Tab from first element -> focus last element
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab from last element -> focus first element
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [visible, onClose, allowEscapeClose]
  );

  // Focus management effect
  useEffect(() => {
    if (Platform.OS !== "web") return;

    if (visible) {
      // Store the previously focused element to restore later
      previousActiveElementRef.current = document.activeElement;

      // Add keydown listener for focus trapping
      document.addEventListener("keydown", handleKeyDown);

      // Focus first focusable element in modal
      setTimeout(() => {
        if (containerRef.current) {
          let elementToFocus: HTMLElement | null = null;

          // Try initial focus selector first
          if (initialFocusSelector) {
            elementToFocus = containerRef.current.querySelector(initialFocusSelector);
          }

          // Fall back to first focusable element
          if (!elementToFocus) {
            const focusableElements = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
            elementToFocus = focusableElements[0] as HTMLElement;
          }

          if (elementToFocus) {
            elementToFocus.focus();
          }
        }
      }, 100); // Small delay to ensure modal is rendered
    }

    return () => {
      // Restore focus before removing listeners (prevents race condition)
      if (previousActiveElementRef.current instanceof HTMLElement) {
        try {
          previousActiveElementRef.current.focus();
        } catch (e) {
          // Element may no longer be focusable
        }
      }

      if (Platform.OS === "web" && typeof document !== 'undefined') {
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [visible, handleKeyDown, initialFocusSelector]);

  // Native focus management (iOS/Android)
  useEffect(() => {
    if (Platform.OS === "web") return;

    if (visible && containerRef.current) {
      // Use React Native's AccessibilityInfo to set focus
      const node = findNodeHandle(containerRef.current);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }
  }, [visible]);

  return {
    containerRef,
    containerProps: {
      accessible: true,
      accessibilityViewIsModal: true,
      accessibilityRole: "none" as AccessibilityRole,
    },
  };
}
