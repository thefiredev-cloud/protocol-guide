/**
 * useScrollAnimation - Hook for scroll-triggered fade-in animations
 * Uses native Animated API for 60fps performance
 */

import { useRef, useEffect, useCallback } from "react";
import { Animated, Platform } from "react-native";

interface ScrollAnimationOptions {
  /** Initial opacity (0-1) */
  initialOpacity?: number;
  /** Initial translateY offset in pixels */
  initialTranslateY?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Threshold for IntersectionObserver (0-1) */
  threshold?: number;
  /** Whether to animate only once or every time element enters view */
  once?: boolean;
}

const DEFAULT_OPTIONS: Required<ScrollAnimationOptions> = {
  initialOpacity: 0,
  initialTranslateY: 30,
  duration: 600,
  delay: 0,
  threshold: 0.1,
  once: true,
};

/**
 * Hook that provides scroll-triggered fade-in animations
 * Returns animated values and a ref to attach to the container
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const {
    initialOpacity,
    initialTranslateY,
    duration,
    delay,
    threshold,
    once,
  } = { ...DEFAULT_OPTIONS, ...options };

  const opacity = useRef(new Animated.Value(initialOpacity)).current;
  const translateY = useRef(new Animated.Value(initialTranslateY)).current;
  const hasAnimated = useRef(false);
  const viewRef = useRef<HTMLDivElement | null>(null);

  const animate = useCallback(() => {
    if (once && hasAnimated.current) return;
    hasAnimated.current = true;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, duration, delay, once]);

  const reset = useCallback(() => {
    opacity.setValue(initialOpacity);
    translateY.setValue(initialTranslateY);
    hasAnimated.current = false;
  }, [opacity, translateY, initialOpacity, initialTranslateY]);

  useEffect(() => {
    // Web: Use IntersectionObserver for scroll detection
    if (Platform.OS === "web" && typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate();
              if (once) {
                observer.disconnect();
              }
            } else if (!once) {
              reset();
            }
          });
        },
        { threshold }
      );

      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (viewRef.current) {
          observer.observe(viewRef.current);
        }
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    } else {
      // Native or no IntersectionObserver: animate immediately
      const timeoutId = setTimeout(animate, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [animate, reset, threshold, once, delay]);

  // Animated style object for convenience
  const animatedStyle = {
    opacity,
    transform: [{ translateY }],
  };

  return {
    /** Animated opacity value */
    opacity,
    /** Animated translateY value */
    translateY,
    /** Combined animated style */
    animatedStyle,
    /** Ref to attach to the view (for web IntersectionObserver) */
    viewRef,
    /** Manually trigger animation */
    animate,
    /** Reset animation state */
    reset,
  };
}

/**
 * Creates staggered animation values for lists/grids
 * Returns an array of animated values with staggered delays
 */
export function createStaggeredAnimations(
  itemCount: number,
  options: ScrollAnimationOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...baseOptions } = options;
  const {
    initialOpacity,
    initialTranslateY,
    duration,
    delay,
  } = { ...DEFAULT_OPTIONS, ...baseOptions };

  return Array.from({ length: itemCount }, (_, index) => {
    const itemDelay = delay + index * staggerDelay;
    const opacity = new Animated.Value(initialOpacity);
    const translateY = new Animated.Value(initialTranslateY);

    const animate = () => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay: itemDelay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay: itemDelay,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return {
      opacity,
      translateY,
      animate,
      animatedStyle: {
        opacity,
        transform: [{ translateY }],
      },
    };
  });
}

export default useScrollAnimation;
