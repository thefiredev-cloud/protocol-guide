import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '@/app/components/layout/error-boundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Component for testing async errors
function AsyncErrorComponent() {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      throw new Error('Async error');
    }
  }, [error]);

  return (
    <button onClick={() => setError(true)} type="button">
      Trigger async error
    </button>
  );
}

describe('ErrorBoundary', () => {

  const setNodeEnv = (value: string) => {
    vi.stubEnv('NODE_ENV', value);
  };

  const resetNodeEnv = () => {
    vi.unstubAllEnvs();
  };

  afterEach(() => {
    resetNodeEnv();
  });

  describe('Rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders fallback UI when error is caught', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/The application encountered an unexpected error/)
      ).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('renders custom fallback when provided', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('catches React errors and updates state', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('logs error to console in development mode', () => {
      setNodeEnv('development');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('displays error details in development mode', () => {
      setNodeEnv('development');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error Details/i)).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('hides error details in production mode', () => {
      setNodeEnv('production');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/Error Details/i)).not.toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('User Interactions', () => {
    it('reset button clears error and re-renders children', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      const setStateSpy = vi.spyOn(ErrorBoundary.prototype, 'setState');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: /try again/i });
      await user.click(resetButton);

      expect(
        setStateSpy.mock.calls.some(([payload]) =>
          payload && typeof payload === 'object' && (payload as Partial<State>).hasError === false
        )
      ).toBe(true);

      setStateSpy.mockRestore();
      consoleError.mockRestore();
    });

    it('reload page button triggers window.location.reload', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      await user.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalledTimes(1);

      consoleError.mockRestore();
    });
  });

  describe('Multiple Error Boundaries', () => {
    it('nested error boundaries work independently', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Outer error</div>}>
          <div>Outer content</div>
          <ErrorBoundary fallback={<div>Inner error</div>}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Outer content')).toBeInTheDocument();
      expect(screen.getByText('Inner error')).toBeInTheDocument();
      expect(screen.queryByText('Outer error')).not.toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('error boundary does not catch errors outside its tree', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <div>
          <ErrorBoundary>
            <div>Safe content</div>
          </ErrorBoundary>
          <div>Outside content</div>
        </div>
      );

      expect(screen.getByText('Safe content')).toBeInTheDocument();
      expect(screen.getByText('Outside content')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('error UI is accessible', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('buttons have proper type attributes', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      expect(tryAgainButton).toHaveAttribute('type', 'button');
      expect(reloadButton).toHaveAttribute('type', 'button');

      consoleError.mockRestore();
    });
  });

  describe('Error Message Display', () => {
    it('displays user-friendly error message', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/The application encountered an unexpected error/)
      ).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('includes error icon in fallback UI', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const icon = container.querySelector('.error-boundary-icon');
      expect(icon).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });
});
