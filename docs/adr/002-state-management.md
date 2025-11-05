# ADR-002: State Management Architecture

**Status:** Proposed
**Date:** 2025-10-31
**Decision Makers:** Architecture Team

## Context

The application currently lacks centralized state management, making it difficult to:
- Synchronize data between components
- Manage complex ImageTrend integration state
- Implement offline capabilities effectively
- Debug state-related issues in production

## Decision

Adopt **Zustand** as the primary state management solution with a domain-driven store architecture.

### Store Architecture:

```typescript
// Domain-driven stores
- chatStore (messages, loading, errors)
- protocolStore (current, history, cache)
- integrationStore (ImageTrend context, sync status)
- settingsStore (user preferences, UI state)
- offlineStore (queue, sync status)
```

## Rationale

### Options Considered:

1. **Redux Toolkit** (Rejected)
   - Pros: Mature, extensive ecosystem, time-travel debugging
   - Cons: Boilerplate, learning curve, overkill for our needs

2. **Zustand** (Selected)
   - Pros: Simple API, TypeScript-first, small bundle (8KB)
   - Cons: Less ecosystem, fewer dev tools

3. **Valtio** (Rejected)
   - Pros: Proxy-based, very simple
   - Cons: Less mature, potential proxy issues on old iPads

4. **Context + useReducer** (Rejected)
   - Pros: No dependencies, React native
   - Cons: Performance issues, complex for our scale

### Decision Factors:

- **Simplicity:** Zustand has minimal boilerplate
- **Performance:** Efficient re-renders with atomic selectors
- **Bundle Size:** Critical for field devices (8KB vs Redux 60KB)
- **TypeScript:** First-class TypeScript support
- **Persistence:** Built-in persistence middleware

## Consequences

### Positive:
- Reduced component coupling
- Easier testing with mock stores
- Simplified ImageTrend data synchronization
- Better offline queue management
- Improved debugging with devtools

### Negative:
- Team learning curve (minimal)
- Migration effort from current prop drilling
- Less ecosystem compared to Redux

### Mitigations:
- Provide team training and examples
- Gradual migration starting with new features
- Create store templates and best practices

## Implementation

```typescript
// Example: Chat store implementation
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ChatStore {
  // State
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  streamBuffer: string;

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (update: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  sendMessage: (content: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        messages: [],
        loading: false,
        error: null,
        streamBuffer: '',

        // Synchronous actions
        addMessage: (message) =>
          set((state) => {
            state.messages.push(message);
          }),

        updateLastMessage: (update) =>
          set((state) => {
            const lastMsg = state.messages[state.messages.length - 1];
            if (lastMsg) {
              Object.assign(lastMsg, update);
            }
          }),

        clearMessages: () =>
          set((state) => {
            state.messages = [];
            state.error = null;
          }),

        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
            state.loading = false;
          }),

        // Async actions
        sendMessage: async (content) => {
          const { addMessage, setLoading, setError } = get();

          setLoading(true);
          setError(null);

          try {
            // Add user message
            addMessage({
              id: crypto.randomUUID(),
              role: 'user',
              content,
              timestamp: new Date().toISOString(),
            });

            // Send to API
            const response = await chatAPI.send(content);

            // Add assistant response
            addMessage({
              id: crypto.randomUUID(),
              role: 'assistant',
              content: response.text,
              citations: response.citations,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        },

        regenerateLastResponse: async () => {
          // Implementation
        },
      })),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          messages: state.messages.slice(-50), // Keep last 50
        }),
      }
    ),
    {
      name: 'chat-store',
    }
  )
);

// Selectors for performance
export const selectMessages = (state: ChatStore) => state.messages;
export const selectLoading = (state: ChatStore) => state.loading;
export const selectLastMessage = (state: ChatStore) =>
  state.messages[state.messages.length - 1];
```

## Migration Plan

### Phase 1 (Week 1):
- Set up Zustand and create store structure
- Migrate chat state
- Create store testing utilities

### Phase 2 (Week 2):
- Migrate protocol state
- Migrate settings state
- Add persistence layer

### Phase 3 (Week 3):
- Add ImageTrend integration store
- Implement offline queue store
- Add cross-store synchronization

### Phase 4 (Week 4):
- Complete migration of remaining state
- Remove prop drilling
- Add monitoring and debugging tools

## Metrics

- **Bundle Size Impact:** <10KB increase
- **Re-render Reduction:** 50% fewer unnecessary re-renders
- **Developer Velocity:** 30% faster feature development
- **Bug Reduction:** 40% fewer state-related bugs

## Review Schedule

- Post-migration review: Week 5
- Performance review: After 1 month in production
- Quarterly architecture reviews