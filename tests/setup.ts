import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Apply mocks globally
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock window.location
delete (window as any).location;
window.location = {
  href: 'http://localhost:3000/',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: vi.fn(),
  replace: vi.fn(),
  assign: vi.fn(),
  toString: () => 'http://localhost:3000/',
} as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock navigator.sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  writable: true,
  value: vi.fn(() => true),
});

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Test Environment)',
});

// Mock window.addEventListener and removeEventListener
const eventListeners: Record<string, Set<EventListener>> = {};

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = vi.fn((event: string, handler: EventListener) => {
  if (!eventListeners[event]) {
    eventListeners[event] = new Set();
  }
  eventListeners[event].add(handler);
  originalAddEventListener.call(window, event, handler);
}) as any;

window.removeEventListener = vi.fn((event: string, handler: EventListener) => {
  if (eventListeners[event]) {
    eventListeners[event].delete(handler);
  }
  originalRemoveEventListener.call(window, event, handler);
}) as any;

// Suppress console errors in tests (optional)
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  // Fully reset window.location to prevent test pollution
  const defaultUrl = new URL('http://localhost:3000/');
  
  // Create a mock location object with all properties properly reset
  const locationMock = {
    href: defaultUrl.href,
    origin: defaultUrl.origin,
    protocol: defaultUrl.protocol,
    host: defaultUrl.host,
    hostname: defaultUrl.hostname,
    port: defaultUrl.port,
    pathname: defaultUrl.pathname,
    search: '',
    hash: '',
    reload: vi.fn(),
    replace: vi.fn(),
    assign: vi.fn(),
    toString: () => defaultUrl.href,
  };
  
  Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true,
    configurable: true,
  });

  // Suppress React warnings that are expected in tests
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Warning: ReactDOM.render') ||
      message.includes('Not implemented: HTMLFormElement.prototype.submit') ||
      message.includes('Warning: An update to') ||
      message.includes('inside a test was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Web vitals monitoring') ||
      message.includes('useLayoutEffect')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  console.error = originalError;
  console.warn = originalWarn;

  // Clear event listeners
  Object.keys(eventListeners).forEach(event => {
    eventListeners[event].clear();
  });

  // Reset mocks
  vi.clearAllMocks();
});
