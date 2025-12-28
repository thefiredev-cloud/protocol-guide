'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MaterialIcon } from '../ui/material-icon';

type ConnectionStatus = 'online' | 'offline' | 'reconnected';

export function OfflineIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const wasOffline = useRef(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOnline = useCallback(() => {
    setStatus('online');
    // Show "Back Online" toast if was previously offline
    if (wasOffline.current) {
      setShowReconnectedToast(true);
      wasOffline.current = false;
      // Hide toast after 3 seconds
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setShowReconnectedToast(false);
      }, 3000);
    }
  }, []);

  const handleOffline = useCallback(() => {
    setStatus('offline');
    wasOffline.current = true;
    setShowReconnectedToast(false);
  }, []);

  useEffect(() => {
    // Set initial state
    if (!navigator.onLine) {
      setStatus('offline');
      wasOffline.current = true;
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [handleOnline, handleOffline]);

  // Offline banner
  if (status === 'offline') {
    return (
      <div className="connection-banner offline" role="alert" aria-live="assertive">
        <MaterialIcon name="wifi_off" size={18} />
        <span className="connection-text">Offline - Using cached data</span>
        <MaterialIcon name="warning" size={16} className="connection-warning" />
      </div>
    );
  }

  // Reconnected toast
  if (showReconnectedToast) {
    return (
      <div className="connection-banner reconnected" role="status" aria-live="polite">
        <MaterialIcon name="check_circle" size={18} />
        <span className="connection-text">Back Online</span>
        <MaterialIcon name="wifi" size={16} className="connection-icon" />
      </div>
    );
  }

  return null;
}
