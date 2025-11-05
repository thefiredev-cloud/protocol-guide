import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast } from '@/app/components/layout/toast-notification';

// Test component to trigger toasts
function ToastTrigger() {
  const { addToast } = useToast();

  return (
    <div>
      <button onClick={() => addToast({ type: 'success', message: 'Success message' })} type="button">
        Show Success
      </button>
      <button onClick={() => addToast({ type: 'error', message: 'Error message' })} type="button">
        Show Error
      </button>
      <button onClick={() => addToast({ type: 'warning', message: 'Warning message' })} type="button">
        Show Warning
      </button>
      <button onClick={() => addToast({ type: 'info', message: 'Info message' })} type="button">
        Show Info
      </button>
      <button
        onClick={() => addToast({ type: 'success', message: 'Custom duration', duration: 1000 })}
        type="button"
      >
        Show Custom Duration
      </button>
    </div>
  );
}

describe('ToastNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('provides toast context to children', () => {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      expect(screen.getByRole('button', { name: /show success/i })).toBeInTheDocument();
    });

    it('throws error when useToast is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ToastTrigger />);
      }).toThrow('useToast must be used within ToastProvider');

      consoleError.mockRestore();
    });
  });

  describe('Toast Display', () => {
    it('shows toast when triggered', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      const button = screen.getByRole('button', { name: /show success/i });
      await user.click(button);

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays success toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const toast = screen.getByText('Success message').closest('.toast');
      expect(toast).toHaveClass('toast-success');
    });

    it('displays error toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show error/i }));

      const toast = screen.getByText('Error message').closest('.toast');
      expect(toast).toHaveClass('toast-error');
    });

    it('displays warning toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show warning/i }));

      const toast = screen.getByText('Warning message').closest('.toast');
      expect(toast).toHaveClass('toast-warning');
    });

    it('displays info toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show info/i }));

      const toast = screen.getByText('Info message').closest('.toast');
      expect(toast).toHaveClass('toast-info');
    });

    it('renders correct icon for each toast type', async () => {
      const user = userEvent.setup({ delay: null });

      const { container } = render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      expect(container.querySelector('.toast-icon')).toBeInTheDocument();
    });
  });

  describe('Toast Auto-Dismiss', () => {
    it('auto-dismisses toast after default duration (5000ms)', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });
    });

    it('auto-dismisses toast after custom duration', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show custom duration/i }));
      expect(screen.getByText('Custom duration')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Custom duration')).not.toBeInTheDocument();
      });
    });
  });

  describe('Manual Dismiss', () => {
    it('dismisses toast when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      // Wait for exit animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Toasts', () => {
    it('stacks multiple toasts correctly', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));
      await user.click(screen.getByRole('button', { name: /show warning/i }));

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('removes toasts independently', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);

      // Close first toast
      const closeButtons = screen.getAllByRole('button', { name: /close notification/i });
      await user.click(closeButtons[0]);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('uses appropriate ARIA live region', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('uses assertive for error toasts', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show error/i }));

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('has accessible close button', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });

    it('toast container has proper ARIA region', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const region = screen.getByRole('region', { name: /notifications/i });
      expect(region).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('applies exit animation class on close', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      const toast = screen.getByText('Success message').closest('.toast');

      await waitFor(() => {
        expect(toast).toHaveClass('toast-exit');
      });
    });
  });

  describe('Memory Management', () => {
    it('cleans up toasts on unmount', async () => {
      const user = userEvent.setup({ delay: null });

      const { unmount } = render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      unmount();

      // No memory leaks - component cleanly unmounts
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('generates unique IDs for each toast', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show success/i }));

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);

      // Each toast should have a unique key (React doesn't allow duplicate keys)
      const toasts = alerts.map((alert) => alert.closest('.toast'));
      expect(toasts[0]).not.toBe(toasts[1]);
    });
  });
});
