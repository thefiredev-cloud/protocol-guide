'use client';

/**
 * Session Expiry Warning Component
 * Displays a warning banner when session is about to expire
 * Allows user to refresh session or dismiss warning
 */

import { useCallback, useMemo } from 'react';

import { useAuth } from '@/app/contexts/authentication-context';

import { MaterialIcon } from '../ui/material-icon';

export function SessionExpiryWarning() {
  const {
    sessionWarning,
    sessionExpiresAt,
    refreshSession,
    dismissSessionWarning,
  } = useAuth();

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!sessionExpiresAt) return null;
    const remaining = Math.max(0, sessionExpiresAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return { minutes, seconds, total: remaining };
  }, [sessionExpiresAt]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshSession();
    } catch {
      // Refresh failed - will be handled by auth context
    }
  }, [refreshSession]);

  // Don't render if no warning
  if (sessionWarning === 'none' || !timeRemaining) {
    return null;
  }

  const isCritical = sessionWarning === 'critical';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 ${
        isCritical
          ? 'bg-red-600 text-white'
          : 'bg-amber-500 text-black'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isCritical ? (
            <MaterialIcon name="warning" size={20} className="flex-shrink-0" />
          ) : (
            <MaterialIcon name="schedule" size={20} className="flex-shrink-0" />
          )}
          <span className="font-medium">
            {isCritical
              ? `Session expires in ${timeRemaining.minutes}:${timeRemaining.seconds.toString().padStart(2, '0')}`
              : `Session expires in ${timeRemaining.minutes} min`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium text-sm transition-colors ${
              isCritical
                ? 'bg-white text-red-600 hover:bg-red-50'
                : 'bg-black text-amber-500 hover:bg-gray-900'
            }`}
          >
            <MaterialIcon name="refresh" size={16} />
            Stay Logged In
          </button>

          {!isCritical && (
            <button
              onClick={dismissSessionWarning}
              className="p-1.5 rounded hover:bg-black/10 transition-colors"
              aria-label="Dismiss warning"
            >
              <MaterialIcon name="close" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
