'use client';

import React, { useEffect } from 'react';

import { SettingsPanel } from '../settings/app-settings-panel';

import { SettingsProvider, useSettings } from '../../contexts/settings-context';
import { ChatbotLayout } from './chatbot-layout';
import { KeyboardShortcuts } from './keyboard-shortcuts';
import { OfflineIndicator } from './offline-indicator';
import { SessionExpiryWarning } from './session-expiry-warning';

interface RootLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Inner content that uses settings context
 */
function RootLayoutInner({ children }: RootLayoutContentProps) {
  const { isOpen, closeSettings } = useSettings();

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

  return (
    <>
      <KeyboardShortcuts />
      <SettingsPanel />
      <OfflineIndicator />
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
      <ChatbotLayout>
        {children}
      </ChatbotLayout>
    </>
  );
}

/**
 * Client-side layout content with Elite Field design system
 */
export function RootLayoutContent({ children }: RootLayoutContentProps) {
  return (
    <SettingsProvider>
      <RootLayoutInner>{children}</RootLayoutInner>
    </SettingsProvider>
  );
}
