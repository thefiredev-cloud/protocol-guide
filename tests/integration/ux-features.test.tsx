import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '@/app/components/layout/error-boundary';
import { KeyboardShortcuts } from '@/app/components/layout/keyboard-shortcuts';
import { SettingsPanel } from '@/app/components/settings/settings-panel';
import { ToastProvider, useToast } from '@/app/components/layout/toast-notification';
import { triggerKeyboardEvent } from '@/tests/utils/test-helpers';

describe('UX Features Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Settings Panel + Toast Notifications', () => {
    function SettingsWithToast() {
      const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
      const { addToast } = useToast();

      const handleSaveSettings = () => {
        setIsSettingsOpen(false);
        addToast({
          type: 'success',
          message: 'Settings saved successfully',
        });
      };

      return (
        <>
          <button onClick={() => setIsSettingsOpen(true)} type="button">
            Open Settings
          </button>
          {/* @ts-expect-error: Test double for SettingsPanel - props exposed in tests */}
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => {
              setIsSettingsOpen(false);
              addToast({ type: 'info', message: 'Settings closed' });
            }}
          />
          />
          <button onClick={handleSaveSettings} type="button">
            Save Settings
          </button>
        </>
      );
    }

    it('shows toast when settings are saved', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <SettingsWithToast />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /open settings/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /save settings/i }));

      expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows toast when settings panel is closed', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <SettingsWithToast />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /open settings/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close settings/i });
      await user.click(closeButton);

      expect(screen.getByText('Settings closed')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts + Settings Panel', () => {
    function IntegratedApp() {
      const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

      React.useEffect(() => {
        const handleOpenSettings = () => {
          setIsSettingsOpen(true);
        };

        document.addEventListener('open-settings', handleOpenSettings);
        return () => document.removeEventListener('open-settings', handleOpenSettings);
      }, []);

      return (
        <>
          <KeyboardShortcuts />
          <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          <div>App Content</div>
        </>
      );
    }

    it('opens settings panel with "s" keyboard shortcut', async () => {
      render(<IntegratedApp />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      triggerKeyboardEvent('s');

      await waitFor(() => {
        const dialogs = screen.queryAllByRole('dialog');
        const settingsDialog = dialogs.find((dialog) =>
          dialog.textContent?.includes('Settings')
        );
        expect(settingsDialog).toBeInTheDocument();
      });
    });

    it('shortcuts help modal and settings panel can coexist', async () => {
      render(<IntegratedApp />);

      // Open shortcuts help
      triggerKeyboardEvent('?');

      await waitFor(() => {
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      });

      // Close shortcuts help
      triggerKeyboardEvent('Escape');

      await waitFor(() => {
        expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
      });

      // Open settings
      triggerKeyboardEvent('s');

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary + Toast Notifications', () => {
    function ComponentThatErrors({ shouldError }: { shouldError: boolean }) {
      const { addToast } = useToast();

      React.useEffect(() => {
        if (shouldError) {
          addToast({ type: 'error', message: 'About to crash!' });
        }
      }, [shouldError, addToast]);

      if (shouldError) {
        throw new Error('Component crashed');
      }

      return <div>Working component</div>;
    }

    it('shows toast before component crashes and error boundary catches it', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup({ delay: null });

      function App() {
        const [shouldError, setShouldError] = React.useState(false);

        return (
          <ToastProvider>
            <button onClick={() => setShouldError(true)} type="button">
              Trigger Error
            </button>
            <ErrorBoundary>
              <ComponentThatErrors shouldError={shouldError} />
            </ErrorBoundary>
          </ToastProvider>
        );
      }

      render(<App />);

      expect(screen.getByText('Working component')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /trigger error/i }));

      // Toast should appear before crash
      await waitFor(() => {
        expect(screen.getByText('About to crash!')).toBeInTheDocument();
      });

      // Error boundary should catch the error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Settings Panel + Keyboard Shortcuts + Toast', () => {
    function FullIntegrationApp() {
      const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
      const { addToast } = useToast();

      React.useEffect(() => {
        const handleOpenSettings = () => {
          setIsSettingsOpen(true);
          addToast({ type: 'info', message: 'Settings opened via keyboard' });
        };

        document.addEventListener('open-settings', handleOpenSettings);
        return () => document.removeEventListener('open-settings', handleOpenSettings);
      }, [addToast]);

      return (
        <>
          <KeyboardShortcuts />
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => {
              setIsSettingsOpen(false);
              addToast({ type: 'success', message: 'Settings closed' });
            }}
          />
        </>
      );
    }

    it('integrates keyboard shortcuts, settings panel, and toasts', async () => {
      render(
        <ToastProvider>
          <FullIntegrationApp />
        </ToastProvider>
      );

      // Open settings with keyboard
      triggerKeyboardEvent('s');

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Settings opened via keyboard')).toBeInTheDocument();
      });

      // Close settings
      const closeButton = screen.getByRole('button', { name: /close settings/i });
      const user = userEvent.setup({ delay: null });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        expect(screen.getByText('Settings closed')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Components Interaction', () => {
    function ComplexApp() {
      const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
      const [shouldError, setShouldError] = React.useState(false);
      const { addToast } = useToast();

      React.useEffect(() => {
        const handleOpenSettings = () => {
          setIsSettingsOpen(true);
        };

        document.addEventListener('open-settings', handleOpenSettings);
        return () => document.removeEventListener('open-settings', handleOpenSettings);
      }, []);

      if (shouldError) {
        throw new Error('Test error');
      }

      return (
        <>
          <KeyboardShortcuts />
          <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          <button
            onClick={() => {
              addToast({ type: 'warning', message: 'Warning: This will crash!' });
              setTimeout(() => setShouldError(true), 100);
            }}
            type="button"
          >
            Trigger Crash
          </button>
          <div>App running</div>
        </>
      );
    }

    it('handles complex interactions across all UX components', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ErrorBoundary>
            <ComplexApp />
          </ErrorBoundary>
        </ToastProvider>
      );

      // 1. Open shortcuts help
      triggerKeyboardEvent('?');
      await waitFor(() => {
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      });

      // 2. Close it
      triggerKeyboardEvent('Escape');
      await waitFor(() => {
        expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
      });

      // 3. Open settings
      triggerKeyboardEvent('s');
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });

      // 4. Close settings
      const closeButton = screen.getByRole('button', { name: /close settings/i });
      await user.click(closeButton);

      // 5. Trigger a crash
      const crashButton = screen.getByRole('button', { name: /trigger crash/i });
      await user.click(crashButton);

      // Should show warning toast
      await waitFor(() => {
        expect(screen.getByText('Warning: This will crash!')).toBeInTheDocument();
      });

      // Wait for crash
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Settings Persistence Across Sessions', () => {
    it('persists settings and shows confirmation toast', async () => {
      const user = userEvent.setup({ delay: null });

      function AppWithSettings() {
        const [isSettingsOpen, setIsSettingsOpen] = React.useState(true);
        const { addToast } = useToast();

        return (
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => {
              setIsSettingsOpen(false);
              addToast({ type: 'success', message: 'Settings saved' });
            }}
          />
        );
      }

      const { unmount } = render(
        <ToastProvider>
          <AppWithSettings />
        </ToastProvider>
      );

      // Change theme
      const lightButton = screen.getByRole('button', { name: /light/i });
      await user.click(lightButton);

      // Close settings
      const closeButton = screen.getByRole('button', { name: /close settings/i });
      await user.click(closeButton);

      // Verify toast
      expect(screen.getByText('Settings saved')).toBeInTheDocument();

      // Verify persistence
      expect(localStorage.getItem('theme')).toBe('light');

      unmount();

      // Re-render to verify persistence
      render(
        <ToastProvider>
          <AppWithSettings />
        </ToastProvider>
      );

      // Theme should still be light
      await waitFor(() => {
        const lightButton = screen.getByRole('button', { name: /light/i });
        expect(lightButton).toHaveClass('active');
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains focus management across components', async () => {
      const user = userEvent.setup();

      function AccessibleApp() {
        const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

        return (
          <>
            <button onClick={() => setIsSettingsOpen(true)} type="button">
              Open Settings
            </button>
            <KeyboardShortcuts />
            <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          </>
        );
      }

      render(
        <ToastProvider>
          <AccessibleApp />
        </ToastProvider>
      );

      // Open settings
      await user.click(screen.getByRole('button', { name: /open settings/i }));

      // Tab to close button
      await user.tab();

      const closeButton = screen.getByRole('button', { name: /close settings/i });
      expect(closeButton).toHaveFocus();
    });
  });
});
