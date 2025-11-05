import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PWAInstallPrompt } from '@/app/components/layout/pwa-install-prompt';
import { createMockBeforeInstallPromptEvent } from '@/tests/utils/test-helpers';

describe('PWAInstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('does not show prompt by default', () => {
      render(<PWAInstallPrompt />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not show prompt when already installed', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
        })),
      });

      render(<PWAInstallPrompt />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('BeforeInstallPrompt Event', () => {
    it('shows prompt when beforeinstallprompt event fires', async () => {
      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Install Medic Bot')).toBeInTheDocument();
      });
    });

    it('prevents default on beforeinstallprompt event', async () => {
      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Dismiss Functionality', () => {
    it('hides prompt when dismiss button is clicked', async () => {
      const user = userEvent.setup();

      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('stores dismiss timestamp in localStorage', async () => {
      const user = userEvent.setup();

      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      const dismissedDate = localStorage.getItem('pwa-install-dismissed');
      expect(dismissedDate).toBeTruthy();
      expect(new Date(dismissedDate!).getTime()).toBeGreaterThan(0);
    });

    it('does not show prompt if dismissed within 7 days', () => {
      const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      localStorage.setItem('pwa-install-dismissed', sevenDaysAgo.toISOString());

      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows prompt if dismissed more than 7 days ago', async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      localStorage.setItem('pwa-install-dismissed', eightDaysAgo.toISOString());

      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Install Functionality', () => {
    it('calls prompt method when install button is clicked', async () => {
      const user = userEvent.setup();

      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();
      const promptSpy = vi.spyOn(mockEvent, 'prompt');

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const installButton = screen.getByRole('button', { name: /install/i });
      await user.click(installButton);

      expect(promptSpy).toHaveBeenCalled();
    });

    it('hides prompt after user accepts installation', async () => {
      const user = userEvent.setup();

      render(<PWAInstallPrompt />);

      const mockEvent = {
        preventDefault: () => {},
        prompt: async () => {},
        userChoice: Promise.resolve({ outcome: 'accepted' as const }),
      };

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const installButton = screen.getByRole('button', { name: /install/i });
      await user.click(installButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('keeps prompt visible if user dismisses installation', async () => {
      const user = userEvent.setup();

      render(<PWAInstallPrompt />);

      const mockEvent = {
        preventDefault: () => {},
        prompt: async () => {},
        userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
      };

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const installButton = screen.getByRole('button', { name: /install/i });
      await user.click(installButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('handles null deferredPrompt gracefully', async () => {
      const user = userEvent.setup();

      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Simulate clicking install then dismiss, then trying to install again
      let installButton = screen.getByRole('button', { name: /install/i });
      await user.click(installButton);

      // After install with accepted outcome, the prompt should be hidden
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Try clicking install button again (should not crash even if deferredPrompt is null)
      // This tests the early return guard in handleInstall
      try {
        const installButtonRetry = screen.queryByRole('button', { name: /install/i });
        if (installButtonRetry) {
          await user.click(installButtonRetry);
        }
      } catch (error) {
        throw new Error(`Should not crash when deferredPrompt is null: ${error}`);
      }

      // No error should be thrown
    });
  });

  describe('Content Display', () => {
    it('displays install prompt title and description', async () => {
      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByText('Install Medic Bot')).toBeInTheDocument();
        expect(
          screen.getByText(/Install for offline access and faster load times/i)
        ).toBeInTheDocument();
      });
    });

    it('displays install button and dismiss button', async () => {
      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
      });
    });

    it('displays download icon', async () => {
      const { container } = render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        const icon = container.querySelector('.pwa-install-icon');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label', async () => {
      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-label', 'Install app prompt');
      });
    });

    it('dismiss button has accessible label', async () => {
      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        const dismissButton = screen.getByRole('button', { name: /dismiss/i });
        expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss');
      });
    });

    it('all buttons have proper type attribute', async () => {
      render(<PWAInstallPrompt />);

      const mockEvent = createMockBeforeInstallPromptEvent();

      act(() => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toHaveAttribute('type', 'button');
        });
      });
    });
  });

  describe('Event Cleanup', () => {
    it('removes event listener on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<PWAInstallPrompt />);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
