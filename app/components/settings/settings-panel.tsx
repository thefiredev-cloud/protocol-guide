'use client';

import { Moon, Settings, Sun, Type, X } from 'lucide-react';

import { useSettings } from '../../contexts/settings-context';

/**
 * User settings panel for accessibility and preferences
 */
export function SettingsPanel() {
  const { isOpen, closeSettings, settings, updateSettings } = useSettings();

  if (!isOpen) return null;

  const handleFontSizeChange = (fontSize: 'normal' | 'large' | 'xlarge') => {
    updateSettings({ fontSize });
  };

  const handleThemeChange = (theme: 'dark' | 'light' | 'sunlight') => {
    updateSettings({ theme });
  };

  const handleHighContrastChange = (highContrast: boolean) => {
    updateSettings({ highContrast });
  };

  const handleReducedMotionChange = (reducedMotion: boolean) => {
    updateSettings({ reducedMotion });
  };

  return (
    <div className="settings-overlay" onClick={closeSettings} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title-row">
            <Settings size={24} />
            <h2 id="settings-title">Settings</h2>
          </div>
          <button onClick={closeSettings} className="settings-close" aria-label="Close settings" type="button">
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
                onClick={() => handleFontSizeChange('normal')}
                className={`setting-option ${settings.fontSize === 'normal' ? 'active' : ''}`}
                type="button"
              >
                Normal
              </button>
              <button
                onClick={() => handleFontSizeChange('large')}
                className={`setting-option ${settings.fontSize === 'large' ? 'active' : ''}`}
                type="button"
              >
                Large
              </button>
              <button
                onClick={() => handleFontSizeChange('xlarge')}
                className={`setting-option ${settings.fontSize === 'xlarge' ? 'active' : ''}`}
                type="button"
              >
                Extra Large
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="setting-group">
            <label className="setting-label">
              {settings.theme === 'dark' ? <Moon size={18} /> : settings.theme === 'sunlight' ? <Sun size={18} /> : <Sun size={18} />}
              Theme
            </label>
            <div className="setting-options">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`setting-option ${settings.theme === 'dark' ? 'active' : ''}`}
                type="button"
              >
                <Moon size={16} />
                Dark
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`setting-option ${settings.theme === 'light' ? 'active' : ''}`}
                type="button"
              >
                <Sun size={16} />
                Light
              </button>
              <button
                onClick={() => handleThemeChange('sunlight')}
                className={`setting-option ${settings.theme === 'sunlight' ? 'active' : ''}`}
                type="button"
                title="Ultra-high contrast for bright outdoor conditions and reduced blue light for night operations"
              >
                <Sun size={16} />
                Sunlight
              </button>
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="setting-group">
            <label className="setting-label">Accessibility</label>
            <label className="setting-checkbox">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => handleHighContrastChange(e.target.checked)}
              />
              <span>High Contrast Mode</span>
            </label>
            <label className="setting-checkbox">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => handleReducedMotionChange(e.target.checked)}
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
