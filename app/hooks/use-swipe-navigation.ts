'use client';

import { useCallback, useRef } from 'react';

export type SwipeDirection = 'left' | 'right' | 'none';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SWIPE_THRESHOLD = 50; // Minimum distance to consider a swipe
const SWIPE_TIME_THRESHOLD = 500; // Maximum time for a swipe gesture

/**
 * Hook for detecting swipe gestures on touch devices
 * Useful for mobile navigation (swipe between tabs)
 */
export function useSwipeNavigation(handlers: SwipeHandlers) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      // Calculate distance and angle
      const distanceX = touchStartX.current - touchEndX;
      const distanceY = touchStartY.current - touchEndY;
      const timeDelta = touchEndTime - touchStartTime.current;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Check if swipe was fast enough and in the right direction
      if (
        timeDelta < SWIPE_TIME_THRESHOLD &&
        distance > SWIPE_THRESHOLD &&
        Math.abs(distanceX) > Math.abs(distanceY)
      ) {
        if (distanceX > 0) {
          // Swiped left - next tab
          handlers.onSwipeLeft?.();
        } else {
          // Swiped right - previous tab
          handlers.onSwipeRight?.();
        }
      }
    },
    [handlers]
  );

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}
