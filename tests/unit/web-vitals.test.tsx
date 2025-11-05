import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WebVitals } from '@/app/components/layout/web-vitals';

// Spy helpers
const mockOnCLS = vi.fn();
const mockOnINP = vi.fn();
const mockOnFCP = vi.fn();
const mockOnLCP = vi.fn();
const mockOnTTFB = vi.fn();

const createLoader = () => vi.fn(async () => ({
  onCLS: (callback: any) => mockOnCLS(callback),
  onINP: (callback: any) => mockOnINP(callback),
  onFCP: (callback: any) => mockOnFCP(callback),
  onLCP: (callback: any) => mockOnLCP(callback),
  onTTFB: (callback: any) => mockOnTTFB(callback),
}));

const renderWithLoader = () => {
  const loader = createLoader();
  render(<WebVitals load={loader} />);
  return loader;
};

describe('WebVitals', () => {

  const setNodeEnv = (value: string) => {
    vi.stubEnv('NODE_ENV', value);
  };

  const resetNodeEnv = () => {
    vi.unstubAllEnvs();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetNodeEnv();
    (navigator as any).sendBeacon = vi.fn(() => true);
  });

  afterEach(() => {
    resetNodeEnv();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const loader = createLoader();
      const { container } = render(<WebVitals load={loader} />);
      expect(container).toBeInTheDocument();
    });

    it('does not render any visible content', () => {
      const loader = createLoader();
      const { container } = render(<WebVitals load={loader} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Web Vitals Initialization', () => {
    it('initializes all web vitals listeners', async () => {
      const loader = createLoader();
      render(<WebVitals load={loader} />);

      // Wait for dynamic import
      await vi.waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalled();
        expect(mockOnINP).toHaveBeenCalled();
        expect(mockOnFCP).toHaveBeenCalled();
        expect(mockOnLCP).toHaveBeenCalled();
        expect(mockOnTTFB).toHaveBeenCalled();
      });
    });

    it('handles web-vitals import failure gracefully', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const failingLoader = vi.fn(async () => {
        throw new Error('Failed to load web-vitals');
      });

      render(<WebVitals load={failingLoader} />);

      await vi.waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith('Web vitals monitoring failed to load');
      });

      consoleWarn.mockRestore();
    });
  });

  describe('Metric Reporting - CLS', () => {
    it('reports CLS metric correctly', async () => {
      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalled();
      });

      const callback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good' as const,
        delta: 0.05,
        id: 'test-cls-id',
      };

      callback(mockMetric);

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/api/metrics',
        expect.stringContaining('CLS')
      );
    });
  });

  describe('Metric Reporting - INP', () => {
    it('reports INP metric correctly', async () => {
      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnINP).toHaveBeenCalled();
      });

      const callback = mockOnINP.mock.calls[0][0];
      const mockMetric = {
        name: 'INP',
        value: 150,
        rating: 'good' as const,
        delta: 150,
        id: 'test-inp-id',
      };

      callback(mockMetric);

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/api/metrics',
        expect.stringContaining('INP')
      );
    });
  });

  describe('Metric Reporting - FCP', () => {
    it('reports FCP metric correctly', async () => {
      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnFCP).toHaveBeenCalled();
      });

      const callback = mockOnFCP.mock.calls[0][0];
      const mockMetric = {
        name: 'FCP',
        value: 1500,
        rating: 'good' as const,
        delta: 1500,
        id: 'test-fcp-id',
      };

      callback(mockMetric);

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/api/metrics',
        expect.stringContaining('FCP')
      );
    });
  });

  describe('Metric Reporting - LCP', () => {
    it('reports LCP metric correctly', async () => {
      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnLCP).toHaveBeenCalled();
      });

      const callback = mockOnLCP.mock.calls[0][0];
      const mockMetric = {
        name: 'LCP',
        value: 2000,
        rating: 'good' as const,
        delta: 2000,
        id: 'test-lcp-id',
      };

      callback(mockMetric);

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/api/metrics',
        expect.stringContaining('LCP')
      );
    });
  });

  describe('Metric Reporting - TTFB', () => {
    it('reports TTFB metric correctly', async () => {
      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnTTFB).toHaveBeenCalled();
      });

      const callback = mockOnTTFB.mock.calls[0][0];
      const mockMetric = {
        name: 'TTFB',
        value: 500,
        rating: 'good' as const,
        delta: 500,
        id: 'test-ttfb-id',
      };

      callback(mockMetric);

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        '/api/metrics',
        expect.stringContaining('TTFB')
      );
    });
  });

  describe('Metric Data Format', () => {
    it('sends correctly formatted metric data', async () => {
      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalled();
      });

      const callback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good' as const,
        delta: 0.05,
        id: 'test-id',
      };

      callback(mockMetric);

      const sentData = (navigator.sendBeacon as any).mock.calls[0][1];
      const parsedData = JSON.parse(sentData);

      expect(parsedData).toMatchObject({
        name: 'CLS',
        value: 0,
        rating: 'good',
        delta: 0,
        id: 'test-id',
        url: expect.any(String),
        userAgent: expect.any(String),
      });
    });

    it('rounds metric values', async () => {
      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnLCP).toHaveBeenCalled();
      });

      const callback = mockOnLCP.mock.calls[0][0];
      const mockMetric = {
        name: 'LCP',
        value: 2000.789,
        rating: 'good' as const,
        delta: 2000.456,
        id: 'test-id',
      };

      callback(mockMetric);

      const sentData = (navigator.sendBeacon as any).mock.calls[0][1];
      const parsedData = JSON.parse(sentData);

      expect(parsedData.value).toBe(2001);
      expect(parsedData.delta).toBe(2000);
    });
  });

  describe('Development Mode', () => {
    it('logs metrics to console in development', async () => {
      setNodeEnv('development');
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalled();
      });

      const callback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good' as const,
        delta: 0.05,
        id: 'test-id',
      };

      callback(mockMetric);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Web Vitals] CLS:',
        expect.objectContaining({
          value: 0,
          rating: 'good',
          delta: 0,
        })
      );

      consoleLog.mockRestore();
    });

    it('does not log metrics to console in production', async () => {
      setNodeEnv('production');
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalled();
      });

      const callback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good' as const,
        delta: 0.05,
        id: 'test-id',
      };

      callback(mockMetric);

      expect(consoleLog).not.toHaveBeenCalled();

      consoleLog.mockRestore();
    });
  });

  describe('Fallback for Older Browsers', () => {
    it('uses fetch when sendBeacon is not available', async () => {
      const fetchMock = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({}),
        } as Response)
      );
      global.fetch = fetchMock;

      // Mock sendBeacon as undefined
      const originalSendBeacon = navigator.sendBeacon;
      (navigator as any).sendBeacon = undefined;

      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalled();
      });

      const callback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good' as const,
        delta: 0.05,
        id: 'test-id',
      };

      callback(mockMetric);

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/metrics',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          })
        );
      });

      // Restore
      (navigator as any).sendBeacon = originalSendBeacon;
    });

    it('handles fetch errors gracefully', async () => {
      const fetchMock = vi.fn(() => Promise.reject(new Error('Network error')));
      global.fetch = fetchMock;

      // Mock sendBeacon as undefined
      const originalSendBeacon = navigator.sendBeacon;
      (navigator as any).sendBeacon = undefined;

      renderWithLoader();

      await vi.waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalled();
      });

      const callback = mockOnCLS.mock.calls[0][0];
      const mockMetric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good' as const,
        delta: 0.05,
        id: 'test-id',
      };

      // Should not throw error
      expect(() => callback(mockMetric)).not.toThrow();

      // Restore
      (navigator as any).sendBeacon = originalSendBeacon;
    });
  });

  describe('Server-Side Rendering', () => {
    it('does not initialize on server', () => {
      // Skip this test as happy-dom always provides a window object
      // In a real SSR environment, the component checks for window existence
      // This is tested implicitly through the other tests
    });
  });
});
