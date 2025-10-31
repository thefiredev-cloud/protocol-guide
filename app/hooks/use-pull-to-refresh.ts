'use client';

import { useCallback, useRef, useState } from 'react';

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

/**
 * Hook for implementing pull-to-refresh functionality on mobile
 * Common pattern on iOS/Android apps
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isAtTop = useRef(true);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    // Check if scrolled to top
    const scrollElement = e.currentTarget;
    isAtTop.current = scrollElement.scrollTop === 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isAtTop.current || isRefreshing) {
      return;
    }

    const touchCurrentY = e.touches[0].clientY;
    const distance = Math.max(0, touchCurrentY - touchStartY.current);

    // Only register pull if dragging down
    if (distance > 0) {
      // Dampen the effect (pull less far than the actual distance)
      const dampedDistance = distance * 0.5;
      setPullDistance(dampedDistance);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  return {
    isRefreshing,
    pullDistance,
    refreshProgress: Math.min(pullDistance / threshold, 1),
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
