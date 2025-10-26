'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * User settings for accessibility and preferences
 */
export interface UserSettings {
  fontSize: 'normal' | 'large' | 'xlarge';
  theme: 'dark' | 'light';
  highContrast: boolean;
  reducedMotion: boolean;
}

/**
 * Settings context type
 */
interface SettingsContextType {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: UserSettings = {
  fontSize: 'normal',
  theme: 'dark',
  highContrast: false,
  reducedMotion: false,
};

/**
 * Settings context
 */
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Hook to use settings context
 */
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

/**
 * Settings provider component
 */
interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem('fontSize') as UserSettings['fontSize'] | null;
      const savedTheme = localStorage.getItem('theme') as UserSettings['theme'] | null;
      const savedHighContrast = localStorage.getItem('highContrast') === 'true';
      const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';

      // Check system preference for reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const systemReducedMotion = mediaQuery.matches;

      setSettings({
        fontSize: savedFontSize || DEFAULT_SETTINGS.fontSize,
        theme: savedTheme || DEFAULT_SETTINGS.theme,
        highContrast: savedHighContrast,
        reducedMotion: localStorage.getItem('reducedMotion') !== null 
          ? savedReducedMotion 
          : systemReducedMotion,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);

  // Apply settings to document element
  useEffect(() => {
    if (!isInitialized) return;

    try {
      // Apply font size to body
      document.body.setAttribute('data-font-size', settings.fontSize);

      // Apply theme to body and html
      document.body.setAttribute('data-theme', settings.theme);
      document.documentElement.setAttribute('data-theme', settings.theme);

      // Apply high contrast
      if (settings.highContrast) {
        document.body.classList.add('high-contrast');
        document.body.setAttribute('data-high-contrast', 'true');
      } else {
        document.body.classList.remove('high-contrast');
        document.body.removeAttribute('data-high-contrast');
      }

      // Apply reduced motion
      if (settings.reducedMotion) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }

      // Save to localStorage
      localStorage.setItem('fontSize', settings.fontSize);
      localStorage.setItem('theme', settings.theme);
      localStorage.setItem('highContrast', String(settings.highContrast));
      localStorage.setItem('reducedMotion', String(settings.reducedMotion));
    } catch (error) {
      console.error('Error applying settings:', error);
    }
  }, [settings, isInitialized]);

  // Listen for storage events to sync settings across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fontSize' && e.newValue) {
        setSettings((prev) => ({ ...prev, fontSize: e.newValue as UserSettings['fontSize'] }));
      } else if (e.key === 'theme' && e.newValue) {
        setSettings((prev) => ({ ...prev, theme: e.newValue as UserSettings['theme'] }));
      } else if (e.key === 'highContrast' && e.newValue !== null) {
        setSettings((prev) => ({ ...prev, highContrast: e.newValue === 'true' }));
      } else if (e.key === 'reducedMotion' && e.newValue !== null) {
        setSettings((prev) => ({ ...prev, reducedMotion: e.newValue === 'true' }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const openSettings = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  const value: SettingsContextType = {
    isOpen,
    openSettings,
    closeSettings,
    settings,
    updateSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
