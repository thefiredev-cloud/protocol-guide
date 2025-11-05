import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { KeyboardShortcuts } from '@/app/components/layout/keyboard-shortcuts';
import { SettingsPanel } from '@/app/components/settings/settings-panel';
import { SettingsProvider } from '@/app/contexts/settings-context';
import { triggerKeyboardEvent } from '@/tests/utils/test-helpers';

// Helper to render with provider (mimics how they're used together in RootLayoutContent)
function renderWithProvider() {
  return render(
    <SettingsProvider>
      <KeyboardShortcuts />
      <SettingsPanel />
    </SettingsProvider>
  );
}

describe('KeyboardShortcuts', () => {
  beforeEach(() => {
    // Reset any custom events
    document.removeEventListener('open-settings', () => {});
  });

  describe('Help Modal', () => {
    it('does not show modal by default', () => {
      renderWithProvider();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows modal when "?" key is pressed', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      });
    });

    it('shows modal when Shift + "/" is pressed', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('/', { shiftKey: true });
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows modal when "?" is pressed without shift modifier', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?', { shiftKey: false });
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes modal when Escape key is pressed', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await waitFor(() => {
        triggerKeyboardEvent('Escape');
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close shortcuts/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes modal when overlay is clicked', async () => {
      const user = userEvent.setup();

      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const overlay = document.querySelector('.shortcuts-overlay');
      await user.click(overlay!);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not close when modal content is clicked', async () => {
      const user = userEvent.setup();

      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const panel = document.querySelector('.shortcuts-panel');
      await user.click(panel!);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Shortcut Documentation', () => {
    it('displays all keyboard shortcuts', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        expect(screen.getByText(/Focus search\/input/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Clear input or close dialog/i)).toBeInTheDocument();
      expect(screen.getByText(/Send message/i)).toBeInTheDocument();
      expect(screen.getByText(/Show keyboard shortcuts/i)).toBeInTheDocument();
      expect(screen.getByText(/New conversation/i)).toBeInTheDocument();
      expect(screen.getByText(/Open dosing calculator/i)).toBeInTheDocument();
      expect(screen.getByText(/View protocols/i)).toBeInTheDocument();
      expect(screen.getByText(/Open settings/i)).toBeInTheDocument();
    });

    it('displays keyboard shortcut keys', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();

        // Check for individual keys in kbd elements
        const kbds = dialog.querySelectorAll('kbd');
        const keyTexts = Array.from(kbds).map(kbd => kbd.textContent);

        expect(keyTexts).toContain('/');
        expect(keyTexts).toContain('Esc');
        expect(keyTexts).toContain('?');
        expect(keyTexts).toContain('n');
        expect(keyTexts).toContain('d');
        expect(keyTexts).toContain('p');
        expect(keyTexts).toContain('s');
        expect(keyTexts).toContain('Ctrl');
        expect(keyTexts).toContain('K');
        expect(keyTexts).toContain('Enter');
      });
    });
  });

  describe('Shortcut Functionality', () => {
    it('focuses input when "/" is pressed', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      renderWithProvider();

      triggerKeyboardEvent('/');

      expect(document.activeElement).toBe(textarea);

      document.body.removeChild(textarea);
    });

    it('focuses input when Ctrl+K is pressed', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      renderWithProvider();

      triggerKeyboardEvent('k', { ctrlKey: true });

      expect(document.activeElement).toBe(input);

      document.body.removeChild(input);
    });

    it('navigates to home when "n" is pressed', () => {
      const originalHref = window.location.href;
      delete (window as any).location;
      window.location = { href: originalHref } as any;

      renderWithProvider();

      triggerKeyboardEvent('n');

      expect(window.location.href).toBe('/');

      // Restore
      window.location.href = originalHref;
    });

    it('navigates to dosing calculator when "d" is pressed', () => {
      const originalHref = window.location.href;
      delete (window as any).location;
      window.location = { href: originalHref } as any;

      renderWithProvider();

      triggerKeyboardEvent('d');

      expect(window.location.href).toBe('/dosing');

      window.location.href = originalHref;
    });

    it('navigates to protocols when "p" is pressed', () => {
      const originalHref = window.location.href;
      delete (window as any).location;
      window.location = { href: originalHref } as any;

      renderWithProvider();

      triggerKeyboardEvent('p');

      expect(window.location.href).toBe('/protocols');

      window.location.href = originalHref;
    });

    it('opens settings panel when "s" is pressed', async () => {
      renderWithProvider();

      // Settings panel should not be open initially
      expect(screen.queryByRole('dialog', { name: /settings/i })).not.toBeInTheDocument();

      triggerKeyboardEvent('s');

      // Wait for settings panel to open
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /settings/i })).toBeInTheDocument();
      });
    });
  });

  describe('Input Field Handling', () => {
    it('does not trigger shortcuts when typing in input fields', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);
      input.focus();

      const eventSpy = vi.fn();
      document.addEventListener('open-settings', eventSpy);

      renderWithProvider();

      const event = new KeyboardEvent('keydown', {
        key: 's',
        bubbles: true,
      });
      input.dispatchEvent(event);

      expect(eventSpy).not.toHaveBeenCalled();

      document.body.removeChild(input);
      document.removeEventListener('open-settings', eventSpy);
    });

    it('does not trigger shortcuts when typing in textarea', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      const eventSpy = vi.fn();
      document.addEventListener('open-settings', eventSpy);

      renderWithProvider();

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        bubbles: true,
      });
      textarea.dispatchEvent(event);

      expect(eventSpy).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
      document.removeEventListener('open-settings', eventSpy);
    });

    it('does not trigger shortcuts when typing in select', () => {
      const select = document.createElement('select');
      document.body.appendChild(select);
      select.focus();

      const originalHref = window.location.href;

      renderWithProvider();

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        bubbles: true,
      });
      select.dispatchEvent(event);

      expect(window.location.href).toBe(originalHref);

      document.body.removeChild(select);
    });

    it('blurs input when Escape is pressed in input field', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);
      input.focus();

      renderWithProvider();

      expect(document.activeElement).toBe(input);

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      input.dispatchEvent(event);

      expect(document.activeElement).not.toBe(input);

      document.body.removeChild(input);
    });
  });

  describe('Modifier Keys', () => {
    it('does not trigger navigation shortcuts with Ctrl modifier', () => {
      const originalHref = window.location.href;

      renderWithProvider();

      triggerKeyboardEvent('n', { ctrlKey: true });

      expect(window.location.href).toBe(originalHref);
    });

    it('does not trigger navigation shortcuts with Alt modifier', () => {
      const originalHref = window.location.href;

      renderWithProvider();

      triggerKeyboardEvent('d', { altKey: true });

      expect(window.location.href).toBe(originalHref);
    });

    it('does not trigger navigation shortcuts with Meta modifier', () => {
      const originalHref = window.location.href;

      renderWithProvider();

      triggerKeyboardEvent('p', { metaKey: true });

      expect(window.location.href).toBe(originalHref);
    });

    it('allows Ctrl+K for focus shortcut', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      renderWithProvider();

      triggerKeyboardEvent('k', { ctrlKey: true });

      expect(document.activeElement).toBe(input);

      document.body.removeChild(input);
    });
  });

  describe('Accessibility', () => {
    it('modal has proper ARIA attributes', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-title');
      });
    });

    it('close button has accessible label', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close shortcuts/i });
        expect(closeButton).toHaveAttribute('aria-label', 'Close shortcuts');
      });
    });

    it('all buttons have proper type attribute', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close shortcuts/i });
        expect(closeButton).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Event Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderWithProvider();

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Footer Message', () => {
    it('displays help message in footer', async () => {
      renderWithProvider();

      await waitFor(() => {
        triggerKeyboardEvent('?');
      });

      await waitFor(() => {
        expect(screen.getByText(/Press/i)).toBeInTheDocument();
        expect(screen.getByText(/anytime to view shortcuts/i)).toBeInTheDocument();
      });
    });
  });
});
