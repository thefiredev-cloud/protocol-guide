'use client';

import React, { useEffect, useState } from 'react';

import { SettingsPanel } from '@/app/components/settings/settings-panel';

import { SettingsProvider, useSettings } from '../../contexts/settings-context';
import { KeyboardShortcuts } from './keyboard-shortcuts';
import { MobileNavBar } from './mobile-nav-bar';
import { OfflineIndicator } from './offline-indicator';

interface RootLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Inner content that uses settings context
 */
function RootLayoutInner({ children }: RootLayoutContentProps) {
  const { isOpen, closeSettings } = useSettings();
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);

  // Handle Escape key to close settings panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeSettings();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeSettings]);

  // Initialize connectivity state and subscribe to online/offline events
  useEffect(() => {
    // Initialize from navigator.onLine
    setIsOnline(Boolean(navigator.onLine));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <KeyboardShortcuts />
      <SettingsPanel />
      <OfflineIndicator />
      <header className="header-enhanced">
        <div className="header-content-enhanced">
          {/* Home Button - CRITICAL FIX */}
          <a href="/" className="home-button-tablet" aria-label="Return to home" title="Home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </a>

          <div className="logo-section-enhanced logo-clickable">
            <div className="title-group">
              <h1 className="app-title-enhanced">
                <span className="title-primary">LaCoFD</span>
              </h1>
            </div>
          </div>

          {/* Status indicator for offline/online - compressed */}
          <div className="header-status-compact">
            <div className="status-indicator-compact" data-status={isOnline === undefined ? 'unknown' : (isOnline ? 'online' : 'offline')}>
              <span className="status-dot"></span>
              <span className="status-text-compact">{isOnline === undefined ? '...' : (isOnline ? 'Online' : 'Offline')}</span>
            </div>
          </div>
        </div>
      </header>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function(){
                  navigator.serviceWorker.register('/sw.js').catch(function(){ /* noop */ });
                });
              }
            })();
          `,
        }}
      />
      {children}
      <MobileNavBar />
    </>
  );
}

/**
 * Client-side layout content with settings panel integration
 */
export function RootLayoutContent({ children }: RootLayoutContentProps) {
  return (
    <SettingsProvider>
      <RootLayoutInner>{children}</RootLayoutInner>
    </SettingsProvider>
  );
}
