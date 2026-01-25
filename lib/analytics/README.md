# Analytics Module

This module provides client-side event tracking for Protocol Guide, with support for offline queuing, batched submissions, and comprehensive user behavior analytics.

## Structure

The analytics module has been split into focused, maintainable files:

### Files

1. **index.ts** (340 lines)
   - Main Analytics class
   - Event tracking methods (search, protocol views, conversions, errors)
   - Type definitions
   - Singleton export
   - Re-exports hooks and types

2. **event-queue.ts** (168 lines)
   - Event batching and queue management
   - Offline persistence via AsyncStorage
   - Automatic flush on batch size threshold
   - Server communication with retry logic

3. **session.ts** (155 lines)
   - Session lifecycle management
   - User identification and traits
   - Session persistence (30-minute timeout)
   - Event callback integration

4. **hooks.ts** (64 lines)
   - React hooks for analytics
   - `useScreenTracking` - Auto-track screen views
   - `useTimeTracking` - Track time spent on screens/protocols
   - `useScrollTracking` - Track scroll depth

## Usage

```typescript
import { analytics, useScreenTracking, useTimeTracking } from '@/lib/analytics';

// Initialize (usually in App.tsx)
await analytics.init();

// Track events
analytics.trackSearch({
  query: "chest pain",
  resultsCount: 10,
  latencyMs: 45,
  method: "text"
});

// Identify users
analytics.identify(userId, {
  email: "user@example.com",
  tier: "premium",
  state: "CA"
});

// Use hooks in components
function ProtocolScreen({ protocolId }) {
  useScreenTracking("ProtocolView");
  useTimeTracking(protocolId, (timeSeconds) => {
    analytics.trackProtocolEngagement(protocolId, timeSeconds, scrollDepth);
  });
  
  // ...
}
```

## Features

- Offline event queuing with AsyncStorage persistence
- Automatic batching (20 events or 30 seconds)
- Session management with 30-minute timeout
- User identification and traits tracking
- Specialized methods for search, protocol views, conversions
- React hooks for common tracking patterns
- Retry logic on network failures

## Exports

### Main
- `analytics` - Singleton Analytics instance

### Types
- `AnalyticsEvent`
- `EventType`
- `SearchEventProperties`
- `ProtocolViewProperties`
- `ConversionEventProperties`
- `UserTraits`

### Hooks
- `useScreenTracking(screenName: string)`
- `useTimeTracking(protocolId: number | null, onComplete?: (timeSeconds: number) => void)`
- `useScrollTracking(protocolId: number | null)`

## Migration

Previous imports from `lib/analytics.ts` now import from `lib/analytics/index.ts`:

```typescript
// Old
import { analytics } from '@/lib/analytics';

// New (same import path, but now uses modular structure)
import { analytics } from '@/lib/analytics';
```

All exports remain the same, ensuring backward compatibility.
