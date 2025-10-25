'use client';

import { Moon, Settings, Sun, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * User settings panel for accessibility and preferences
 */
export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') as 'normal' | 'large' | 'xlarge';
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedTheme) setTheme(savedTheme);
    setHighContrast(savedHighContrast);
    setReducedMotion(savedReducedMotion);

    // Check system preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !savedReducedMotion) {
      setReducedMotion(true);
    }
  }, []);

  // Apply settings
  useEffect(() => {
    document.body.setAttribute('data-font-size', fontSize);
    document.body.setAttribute('data-theme', theme);
    document.body.classList.toggle('high-contrast', highContrast);
    document.body.classList.toggle('reduced-motion', reducedMotion);

    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('theme', theme);
    localStorage.setItem('highContrast', String(highContrast));
    localStorage.setItem('reducedMotion', String(reducedMotion));
  }, [fontSize, theme, highContrast, reducedMotion]);

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title-row">
            <Settings size={24} />
            <h2 id="settings-title">Settings</h2>
          </div>
          <button onClick={onClose} className="settings-close" aria-label="Close settings" type="button">
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          {/* Font Size */}
          <div className="setting-group">
            <label className="setting-label">
              <Type size={18} />
              Font Size
            </label>
            <div className="setting-options">
              <button
                onClick={() => setFontSize('normal')}
                className={`setting-option ${fontSize === 'normal' ? 'active' : ''}`}
                type="button"
              >
                Normal
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`setting-option ${fontSize === 'large' ? 'active' : ''}`}
                type="button"
              >
                Large
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`setting-option ${fontSize === 'xlarge' ? 'active' : ''}`}
                type="button"
              >
                Extra Large
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="setting-group">
            <label className="setting-label">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              Theme
            </label>
            <div className="setting-options">
              <button
                onClick={() => setTheme('dark')}
                className={`setting-option ${theme === 'dark' ? 'active' : ''}`}
                type="button"
              >
                <Moon size={16} />
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`setting-option ${theme === 'light' ? 'active' : ''}`}
                type="button"
              >
                <Sun size={16} />
                Light
              </button>
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="setting-group">
            <label className="setting-label">Accessibility</label>
            <label className="setting-checkbox">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              <span>High Contrast Mode</span>
            </label>
            <label className="setting-checkbox">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
              />
              <span>Reduce Animations</span>
            </label>
          </div>

          {/* Info */}
          <div className="settings-info">
            <p className="settings-info-text">
              These settings are saved locally to your device and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
