'use client';

import React, { useEffect, useState } from 'react';

import { SettingsProvider, useSettings } from '../../contexts/settings-context';
import { KeyboardShortcuts } from '../keyboard-shortcuts';
import { PWAInstallPrompt } from '../pwa-install-prompt';
import { SettingsPanel } from '../settings-panel';
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
      <PWAInstallPrompt />
      <header className="header-enhanced">
        <div className="header-content-enhanced">
          <div className="logo-section-enhanced">
            {/* LA County Fire Badge/Logo placeholder */}
            <div className="fire-badge" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="var(--accent)" strokeWidth="2"/>
                <path d="M20 8L24 16H28L22 22L24 30L20 26L16 30L18 22L12 16H16L20 8Z" fill="var(--accent)"/>
              </svg>
            </div>

            <div className="title-group">
              <h1 className="app-title-enhanced">
                <span className="title-primary">Medic-Bot</span>
                <span className="title-version">v2.0</span>
              </h1>
              <div className="subtitle-enhanced">
                <span className="org-name">LA County Fire Department</span>
                <span className="divider" aria-hidden="true">•</span>
                <span className="system-type">EMS Decision Support</span>
              </div>
            </div>
          </div>

          {/* Status indicator for offline/online */}
          <div className="header-status">
            <div className="status-indicator" data-status={isOnline === undefined ? 'unknown' : (isOnline ? 'online' : 'offline')}>
              <span className="status-dot"></span>
              <span className="status-text">{isOnline === undefined ? 'Checking...' : (isOnline ? 'Online' : 'Offline')}</span>
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
