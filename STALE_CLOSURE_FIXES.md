# Stale Closure Issues - Fixed

## Summary

Fixed multiple stale closure bugs across custom hooks and components where callbacks were capturing outdated state values, leading to race conditions and incorrect behavior.

## Files Fixed

### 1. `/hooks/use-favorites.ts`

**Issues:**
- `loadFavorites` not wrapped in `useCallback`, missing from `useEffect` dependencies
- `isFavorite` callback recreated on every `favorites` state change, causing unnecessary re-renders
- `toggleFavorite` captured stale `favorites` state

**Fixes:**
- Added `useRef` to track current favorites without causing re-renders
- Wrapped `loadFavorites` in `useCallback` and added to `useEffect` dependencies
- Modified `isFavorite` to use ref instead of state dependency
- Modified `toggleFavorite` to check ref instead of calling `isFavorite`

**Impact:** Prevents race conditions when toggling favorites rapidly, reduces unnecessary re-renders

---

### 2. `/hooks/useSimulationTimer.ts`

**Issues:**
- `pause` callback captured stale `isRunning` and `isPaused` state values
- `resume` callback captured stale `isRunning` and `isPaused` state values
- `togglePause` captured stale `isPaused` state

**Fixes:**
- Added refs for `isRunningRef`, `isPausedRef`, and `elapsedMsRef`
- Updated `pause`, `resume`, and `togglePause` to use refs instead of captured state
- Reduced dependencies in `useCallback` arrays

**Impact:** Timer controls now work correctly even when called from stale closures (e.g., setTimeout callbacks)

---

### 3. `/hooks/use-offline-cache.ts`

**Issues:**
- `loadCache` missing from `useEffect` dependency array
- `useOfflineCacheWithAccess` had entire objects as dependencies instead of specific functions

**Fixes:**
- Added `loadCache` to `useEffect` dependencies
- Extracted specific functions (`cacheableFunc`, `checkAccess`) from objects to avoid re-creating `saveToCache`

**Impact:** Cache loads properly on mount, reduces unnecessary re-renders

---

### 4. `/hooks/use-county-restriction.ts`

**Issues:**
- `checkCanAddCounty` captured stale `currentCounties` state

**Fixes:**
- Added `currentCountiesRef` to track current state
- Modified `checkCanAddCounty` to use ref instead of captured state
- Removed `currentCounties` from dependencies

**Impact:** County restriction checks use current state, preventing incorrect upgrade modal triggers

---

### 5. `/components/VoiceSearchButton.tsx`

**Issues:**
- `startRecording` not wrapped in `useCallback`
- `stopRecording` not wrapped in `useCallback`
- `setTimeout` callbacks captured stale `recordingState`
- `handlePress` captured stale `recordingState`

**Fixes:**
- Added `recordingStateRef` to track current state
- Wrapped `startRecording` and `stopRecording` in `useCallback`
- Modified `setTimeout` callbacks to use `recordingStateRef.current`
- Modified `handlePress` to use `recordingStateRef.current`

**Impact:** Voice recording state machine works correctly, prevents race conditions during rapid button presses

---

## Pattern for Fixing Stale Closures

When you have a callback that needs current state but shouldn't recreate on every state change:

```typescript
// ❌ Bad - captures stale state
const callback = useCallback(() => {
  if (someState === "value") {
    doSomething();
  }
}, []); // Missing dependency

// ❌ Bad - recreates on every state change
const callback = useCallback(() => {
  if (someState === "value") {
    doSomething();
  }
}, [someState]); // Recreates too often

// ✅ Good - uses ref for current state
const someStateRef = useRef(someState);

useEffect(() => {
  someStateRef.current = someState;
}, [someState]);

const callback = useCallback(() => {
  if (someStateRef.current === "value") {
    doSomething();
  }
}, []); // Stable, no recreations
```

## Common Stale Closure Scenarios

1. **setTimeout/setInterval callbacks** - Always use refs for state access
2. **Event handlers in useCallback** - Use refs if state shouldn't be in dependencies
3. **Async callbacks** - State may change during async operations
4. **Animation callbacks** - State may change during animations
5. **WebSocket/SSE handlers** - Long-lived callbacks need current state

## Testing Checklist

- [ ] Rapid button clicks don't cause race conditions
- [ ] Timer controls work correctly when paused/resumed
- [ ] Async operations use current state, not stale state
- [ ] Callbacks in setTimeout/setInterval access current values
- [ ] No unnecessary re-renders from useCallback dependencies

## Related Issues

- Token refresh race conditions (already fixed in `use-auth.ts`)
- Voice input state machine race conditions (already fixed in `use-voice-input.ts`)

## Date

2026-01-23
