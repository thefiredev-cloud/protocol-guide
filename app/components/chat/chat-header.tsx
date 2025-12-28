"use client";

import { useEffect,useState } from "react";

import { MaterialIcon } from "../ui/material-icon";

/**
 * Chat header component with Protocol Assistant branding
 * Shows online/offline status and provides options menu
 */
export function ChatHeader() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-12 left-0 right-0 z-40 px-5 pt-4 pb-2 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
      <header className="flex justify-between items-center max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {/* Avatar with status indicator */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-primary border border-red-200 dark:border-red-900/50">
              <MaterialIcon name="local_hospital" filled size={20} />
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          {/* Title and status */}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-none">
              Protocol Assistant
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isOnline ? "Online" : "Offline"} • AI Support Active
            </p>
          </div>
        </div>

        {/* Options button */}
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-600 dark:text-gray-300"
          aria-label="More options"
        >
          <MaterialIcon name="more_vert" size={24} />
        </button>
      </header>
    </div>
  );
}
