'use client';

import { useCallback } from 'react';

import { usePullToRefresh } from '@/app/hooks/use-pull-to-refresh';

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
}

/**
 * Wrapper component for pull-to-refresh functionality
 * Provides visual feedback and triggers refresh callback
 */
export function PullToRefreshWrapper({
  children,
  onRefresh,
}: PullToRefreshWrapperProps) {
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
    }
  }, [onRefresh]);

  const {
    isRefreshing,
    pullDistance,
    refreshProgress,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  return (
    <div
      className="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        // @ts-ignore - CSS variables
        '--pull-distance': `${pullDistance}px`,
        '--refresh-progress': refreshProgress,
      }}
    >
      {/* Pull-to-refresh visual indicator */}
      {pullDistance > 0 && (
        <div className="pull-to-refresh-indicator">
          <div
            className="pull-to-refresh-spinner"
            style={{
              transform: `rotate(${refreshProgress * 360}deg)`,
            }}
          />
        </div>
      )}

      {/* Main content */}
      <div className={isRefreshing ? 'opacity-50' : ''}>
        {children}
      </div>

      {/* Refreshing overlay (optional) */}
      {isRefreshing && (
        <div className="pull-to-refresh-loading">
          <div className="loading-spinner" />
          <p>Refreshing...</p>
        </div>
      )}
    </div>
  );
}
