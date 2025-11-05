import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsPanel } from '@/app/components/settings/settings-panel';
import { SettingsProvider, useSettings } from '@/app/contexts/settings-context';

// Test component to trigger settings panel
function SettingsTrigger() {
  const { openSettings, closeSettings, settings, updateSettings } = useSettings();

  return (
    <div>
      <button onClick={openSettings} type="button">
        Open Settings
      </button>
      <button onClick={closeSettings} type="button">
        Close Settings
      </button>
      <button
        onClick={() => updateSettings({ fontSize: 'large' })}
        type="button"
      >
        Set Large Font
      </button>
      <div data-testid="settings-values">
        {JSON.stringify(settings)}
      </div>
      <SettingsPanel />
    </div>
  );
}

// Helper to render with provider
function renderWithProvider() {
  return render(
    <SettingsProvider>
      <SettingsTrigger />
    </SettingsProvider>
  );
}

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset document body attributes
    document.body.removeAttribute('data-font-size');
    document.body.removeAttribute('data-theme');
    document.body.classList.remove('high-contrast', 'reduced-motion');
  });

  describe('Visibility', () => {
    it('does not render when panel is not open', () => {
      renderWithProvider();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when settings are opened', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const openButton = screen.getByRole('button', { name: /open settings/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Close Functionality', () => {
    it('closes when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // Open settings
      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close settings
      const closeButton = screen.getByRole('button', { name: /close settings/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes when overlay is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // Open settings
      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const overlay = document.querySelector('.settings-overlay');
      await user.click(overlay!);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close when panel content is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // Open settings
      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const panel = document.querySelector('.settings-panel');
      await user.click(panel!);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Font Size Settings', () => {
    it('loads default font size on mount', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const normalButton = screen.getByRole('button', { name: 'Normal' });
        expect(normalButton).toHaveClass('active');
      });
    });

    it('loads saved font size from localStorage', async () => {
      localStorage.setItem('fontSize', 'large');
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const largeButton = screen.getByRole('button', { name: 'Large' });
        expect(largeButton).toHaveClass('active');
      });
    });

    it('changes font size when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const largeButton = screen.getByRole('button', { name: 'Large' });
      await user.click(largeButton);

      await waitFor(() => {
        expect(largeButton).toHaveClass('active');
        expect(document.body).toHaveAttribute('data-font-size', 'large');
      });
    });

    it('persists font size to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      const xlargeButton = screen.getByRole('button', { name: 'Extra Large' });
      await user.click(xlargeButton);

      await waitFor(() => {
        expect(localStorage.getItem('fontSize')).toBe('xlarge');
      });
    });

    it('applies all font size options correctly', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      // Test Normal
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      await user.click(normalButton);
      await waitFor(() => {
        expect(document.body).toHaveAttribute('data-font-size', 'normal');
      });

      // Test Large
      const largeButton = screen.getByRole('button', { name: 'Large' });
      await user.click(largeButton);
      await waitFor(() => {
        expect(document.body).toHaveAttribute('data-font-size', 'large');
      });

      // Test Extra Large
      const xlargeButton = screen.getByRole('button', { name: 'Extra Large' });
      await user.click(xlargeButton);
      await waitFor(() => {
        expect(document.body).toHaveAttribute('data-font-size', 'xlarge');
      });
    });
  });

  describe('Theme Settings', () => {
    it('loads default theme (dark) on mount', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const darkButton = screen.getByRole('button', { name: /dark/i });
        expect(darkButton).toHaveClass('active');
      });
    });

    it('loads saved theme from localStorage', async () => {
      localStorage.setItem('theme', 'light');
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const lightButton = screen.getByRole('button', { name: /light/i });
        expect(lightButton).toHaveClass('active');
      });
    });

    it('toggles theme when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      const lightButton = screen.getByRole('button', { name: /light/i });
      await user.click(lightButton);

      await waitFor(() => {
        expect(lightButton).toHaveClass('active');
        expect(document.body).toHaveAttribute('data-theme', 'light');
      });
    });

    it('persists theme to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      const lightButton = screen.getByRole('button', { name: /light/i });
      await user.click(lightButton);

      await waitFor(() => {
        expect(localStorage.getItem('theme')).toBe('light');
      });
    });
  });

  describe('Accessibility Settings', () => {
    it('toggles high contrast mode', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      const checkbox = screen.getByRole('checkbox', { name: /high contrast mode/i });
      await user.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
        expect(document.body).toHaveClass('high-contrast');
      });
    });

    it('toggles reduced motion', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      const checkbox = screen.getByRole('checkbox', { name: /reduce animations/i });
      await user.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
        expect(document.body).toHaveClass('reduced-motion');
      });
    });

    it('loads high contrast setting from localStorage', async () => {
      localStorage.setItem('highContrast', 'true');
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /high contrast mode/i });
        expect(checkbox).toBeChecked();
      });
    });

    it('loads reduced motion setting from localStorage', async () => {
      localStorage.setItem('reducedMotion', 'true');
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /reduce animations/i });
        expect(checkbox).toBeChecked();
      });
    });

    it('respects system preference for reduced motion', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /reduce animations/i });
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('Settings Persistence', () => {
    it('saves all settings to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      // Change font size
      await user.click(screen.getByRole('button', { name: 'Large' }));

      // Change theme
      await user.click(screen.getByRole('button', { name: /light/i }));

      // Toggle high contrast
      await user.click(screen.getByRole('checkbox', { name: /high contrast mode/i }));

      // Toggle reduced motion
      await user.click(screen.getByRole('checkbox', { name: /reduce animations/i }));

      await waitFor(() => {
        expect(localStorage.getItem('fontSize')).toBe('large');
        expect(localStorage.getItem('theme')).toBe('light');
        expect(localStorage.getItem('highContrast')).toBe('true');
        expect(localStorage.getItem('reducedMotion')).toBe('true');
      });
    });

    it('handles invalid localStorage values gracefully', async () => {
      localStorage.setItem('fontSize', 'invalid');
      localStorage.setItem('theme', 'invalid');

      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        // Should fall back to defaults without crashing
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'settings-title');
      });
    });

    it('close button has accessible label', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close settings/i });
        expect(closeButton).toHaveAttribute('aria-label', 'Close settings');
      });
    });

    it('all buttons have proper type attribute', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        // Filter out the trigger buttons
        const settingsButtons = buttons.filter(
          (btn) =>
            !btn.textContent?.includes('Open Settings') &&
            !btn.textContent?.includes('Close Settings') &&
            !btn.textContent?.includes('Set Large Font')
        );
        settingsButtons.forEach((button) => {
          expect(button).toHaveAttribute('type', 'button');
        });
      });
    });

    it('settings panel can be navigated with keyboard', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Tab through focusable elements
      await user.tab();

      // Check that a settings button has focus (could be close button or any other)
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName).toBe('BUTTON');
    });
  });

  describe('Information Display', () => {
    it('displays informational text about settings persistence', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /open settings/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/These settings are saved locally to your device/)
        ).toBeInTheDocument();
      });
    });
  });
});
