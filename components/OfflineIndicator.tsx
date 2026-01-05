import React, { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-14 left-0 right-0 z-[100] px-4 py-3 text-center text-sm font-bold transition-all duration-300 ${
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-amber-500 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2 max-w-xl mx-auto">
        <span className="material-symbols-outlined text-[18px]">
          {isOnline ? 'wifi' : 'wifi_off'}
        </span>
        <span>
          {isOnline
            ? 'Back online - syncing data'
            : 'Offline mode - protocols still available'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
