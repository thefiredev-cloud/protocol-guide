'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-banner" role="alert" aria-live="polite">
      <AlertTriangle size={20} strokeWidth={2} className="offline-icon" />
      <span className="offline-text">Offline Mode</span>
      {lastSync && (
        <span className="offline-sync">
          Last synced: {lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
