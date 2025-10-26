import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Custom render function that includes common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Wait for async state updates
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
}

/**
 * Mock window.matchMedia for specific queries
 */
export function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

/**
 * Create a mock BeforeInstallPromptEvent
 */
export function createMockBeforeInstallPromptEvent() {
  return {
    preventDefault: () => {},
    prompt: async () => {},
    userChoice: Promise.resolve({ outcome: 'accepted' as const }),
  };
}

/**
 * Trigger keyboard event
 */
export function triggerKeyboardEvent(key: string, options: KeyboardEventInit = {}) {
  // For '?' key, we need to set shiftKey to true
  const opts = key === '?' ? { shiftKey: true, ...options } : options;

  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...opts,
  });
  document.dispatchEvent(event);
  return event;
}

/**
 * Mock console methods for testing
 */
export function suppressConsole(methods: Array<keyof Console> = ['error', 'warn']) {
  const mocks: Record<string, any> = {};

  methods.forEach((method) => {
    mocks[method] = console[method];
    console[method] = () => {};
  });

  return () => {
    methods.forEach((method) => {
      console[method] = mocks[method];
    });
  };
}

/**
 * Wait for element to be removed from DOM
 */
export async function waitForElementToBeRemoved(
  callback: () => HTMLElement | null,
  timeout = 1000
): Promise<void> {
  const startTime = Date.now();

  while (callback() !== null) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for element to be removed');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
