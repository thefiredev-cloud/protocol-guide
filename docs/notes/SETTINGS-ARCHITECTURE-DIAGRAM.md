# Settings Panel Architecture Diagram

## Component Hierarchy

```
RootLayoutContent (Provider)
├─ SettingsProvider (Context)
│  ├─ Context State:
│  │  ├─ isOpen: boolean
│  │  ├─ settings: UserSettings
│  │  └─ Functions:
│  │     ├─ openSettings()
│  │     ├─ closeSettings()
│  │     └─ updateSettings()
│  │
│  └─ Side Effects:
│     ├─ localStorage ↔ Context State
│     ├─ Context State → DOM (body/html)
│     └─ Storage Events → Context State
│
└─ RootLayoutInner (Consumer)
   ├─ KeyboardShortcuts
   │  └─ Uses: openSettings()
   │     └─ Trigger: 's' key press
   │
   ├─ SettingsPanel
   │  └─ Uses: isOpen, closeSettings, settings, updateSettings
   │     ├─ Display: Controlled by isOpen
   │     ├─ Close: Escape key, overlay click, X button
   │     └─ Update: Button clicks, checkbox changes
   │
   └─ Other Components
      └─ Can access settings via useSettings() hook
```

## Data Flow Diagram

### Opening Settings Panel

```
User Action (Press 's' key)
        ↓
KeyboardShortcuts component
        ↓
    openSettings() from useSettings()
        ↓
SettingsContext sets isOpen = true
        ↓
SettingsPanel re-renders (visible)
```

### Changing a Setting

```
User Action (Click theme button)
        ↓
SettingsPanel onClick handler
        ↓
    updateSettings({ theme: 'light' }) from useSettings()
        ↓
SettingsContext merges new settings
        ↓
    ├─ Update internal state
    │       ↓
    ├─ Save to localStorage
    │       ↓
    ├─ Apply to DOM (data-theme="light")
    │       ↓
    └─ CSS rules apply new theme
            ↓
        UI updates immediately
```

### Cross-Tab Synchronization

```
Tab 1: User changes setting
        ↓
    localStorage.setItem('theme', 'light')
        ↓
    Browser fires 'storage' event
        ↓
Tab 2: SettingsContext receives event
        ↓
    Updates internal state
        ↓
    Applies to DOM
        ↓
    UI syncs automatically
```

## Context API Structure

```typescript
SettingsContext
├─ Provider Component
│  ├─ State Management
│  │  ├─ isOpen: boolean
│  │  ├─ settings: UserSettings
│  │  └─ isInitialized: boolean
│  │
│  ├─ Effects
│  │  ├─ Load from localStorage (on mount)
│  │  ├─ Apply to DOM (on settings change)
│  │  └─ Listen to storage events (cross-tab sync)
│  │
│  └─ Callbacks (memoized)
│     ├─ openSettings: () => void
│     ├─ closeSettings: () => void
│     └─ updateSettings: (partial) => void
│
└─ Consumer Hook
   └─ useSettings()
      └─ Returns: SettingsContextType
```

## Settings Lifecycle

```
┌─────────────────────────────────────────┐
│  Application Start                      │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  SettingsProvider Mounts                │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Load from localStorage                 │
│  ├─ fontSize                            │
│  ├─ theme                               │
│  ├─ highContrast                        │
│  └─ reducedMotion                       │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Check System Preferences               │
│  └─ prefers-reduced-motion              │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Initialize State with Defaults         │
│  or Loaded Values                       │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Apply Settings to DOM                  │
│  ├─ body[data-font-size]                │
│  ├─ body[data-theme]                    │
│  ├─ html[data-theme]                    │
│  ├─ body.high-contrast                  │
│  └─ body.reduced-motion                 │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Register Storage Event Listener        │
│  (for cross-tab sync)                   │
└──────────────────┬──────────────────────┘
                   ↓
         ┌─────────┴─────────┐
         │                   │
         ↓                   ↓
┌──────────────────┐  ┌──────────────────┐
│  User Changes    │  │  Storage Event   │
│  Settings        │  │  from Other Tab  │
└─────┬────────────┘  └────────┬─────────┘
      │                        │
      └────────┬───────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Update Context State                   │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Trigger Effects                        │
│  ├─ Save to localStorage                │
│  └─ Apply to DOM                        │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  CSS Re-applies                         │
│  └─ Visual updates instantly            │
└─────────────────────────────────────────┘
```

## localStorage Schema

```javascript
// Keys used in localStorage
{
  "fontSize": "normal" | "large" | "xlarge",
  "theme": "dark" | "light",
  "highContrast": "true" | "false",  // String, not boolean
  "reducedMotion": "true" | "false"  // String, not boolean
}

// Example stored values:
localStorage.getItem('fontSize')       // "large"
localStorage.getItem('theme')          // "dark"
localStorage.getItem('highContrast')   // "false"
localStorage.getItem('reducedMotion')  // "true"
```

## DOM Attribute Mapping

```html
<!-- Font Size -->
<body data-font-size="normal">   → Default (16px)
<body data-font-size="large">    → 17px
<body data-font-size="xlarge">   → 19px

<!-- Theme -->
<html data-theme="dark">         → Dark theme variables
<body data-theme="dark">
<html data-theme="light">        → Light theme variables
<body data-theme="light">

<!-- High Contrast -->
<body class="high-contrast">     → High contrast mode
<body data-high-contrast="true"> → Attribute for CSS selectors

<!-- Reduced Motion -->
<body class="reduced-motion">    → Disable animations
```

## CSS Variable Application

```css
/* Theme determines which variables are active */

/* Dark Theme (default) */
:root {
  --background: #04111f;
  --text-primary: #ffffff;
  --accent: #ff3b30;
}

/* Light Theme */
[data-theme='light'] {
  --background: #ffffff;
  --text-primary: #1d1d1f;
  --accent: #d70015;
}

/* High Contrast */
[data-high-contrast='true'] {
  --background: #000000;
  --text-primary: #ffffff;
  --border: #ffffff;
}

/* Font Size */
body[data-font-size="large"] {
  font-size: 17px;
}

/* Reduced Motion */
body.reduced-motion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

## Event Flow

### Keyboard Shortcut Flow

```
┌──────────────────────────────────────────────┐
│  User presses 's' key anywhere on page       │
└─────────────────────┬────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│  Window 'keydown' event captured             │
└─────────────────────┬────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│  KeyboardShortcuts component handler         │
│  └─ Checks: not in input, not modifier keys  │
└─────────────────────┬────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│  Calls: openSettings() from context          │
└─────────────────────┬────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│  SettingsContext: setIsOpen(true)            │
└─────────────────────┬────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│  React re-renders consuming components       │
└─────────────────────┬────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│  SettingsPanel: isOpen=true, renders modal   │
└──────────────────────────────────────────────┘
```

### Close Settings Flow

```
User Action:
├─ Press Escape
├─ Click overlay
└─ Click X button
        ↓
    All call: closeSettings()
        ↓
SettingsContext: setIsOpen(false)
        ↓
React re-renders
        ↓
SettingsPanel: isOpen=false, returns null
```

## Type Safety Flow

```typescript
// 1. User types in editor
updateSettings({ theme: 'blue' });

// 2. TypeScript checks against type
interface UserSettings {
  theme: 'dark' | 'light'; // 'blue' not in union
}

// 3. TypeScript error shown
// Type '"blue"' is not assignable to type '"dark" | "light"'

// 4. Developer fixes before runtime
updateSettings({ theme: 'light' }); // ✅
```

## Comparison: Before vs After

### Before (Custom Events)

```
User presses 's'
        ↓
KeyboardShortcuts creates CustomEvent
        ↓
document.dispatchEvent(new CustomEvent('open-settings'))
        ↓
Event bubbles to document
        ↓
RootLayoutContent listener catches event
        ↓
setIsSettingsOpen(true) local state
        ↓
Pass isOpen prop to SettingsPanel
        ↓
SettingsPanel renders

Issues:
❌ No type safety on event name
❌ Manual event cleanup required
❌ Props drilling for state
❌ Multiple sources of truth
❌ Hard to track data flow
```

### After (React Context)

```
User presses 's'
        ↓
KeyboardShortcuts calls openSettings()
        ↓
Context updates state
        ↓
SettingsPanel re-renders
        ↓
Panel visible

Benefits:
✅ Type-safe function calls
✅ Automatic cleanup
✅ No props drilling
✅ Single source of truth
✅ Clear data flow
```

## Performance Characteristics

### Render Optimization

```
Setting Change:
├─ Only SettingsContext re-renders
├─ Only consumers of changed values re-render
├─ Callbacks are memoized (useCallback)
├─ Settings object reference only changes when values change
└─ No unnecessary re-renders of unrelated components
```

### Memory Management

```
Component Mount:
├─ Context subscribes to storage events (1 listener)
├─ Keyboard shortcuts registers keydown (1 listener)
└─ Escape handler in RootLayoutInner (1 listener)

Component Unmount:
├─ All event listeners automatically cleaned up
├─ No memory leaks
└─ localStorage persists settings
```

## Error Handling

```
┌────────────────────────────────────┐
│  Attempt localStorage operation    │
└──────────────┬─────────────────────┘
               ↓
        ┌──────┴──────┐
        │  try/catch  │
        └──────┬──────┘
               ↓
    ┌──────────┴──────────┐
    ↓                     ↓
┌─────────┐         ┌─────────┐
│ Success │         │  Error  │
└────┬────┘         └────┬────┘
     ↓                   ↓
  Continue        Log error & continue
                  Settings work in-memory
```

## Extension Points

### Adding New Settings

```typescript
// 1. Update type definition
interface UserSettings {
  // ... existing settings
  newSetting: 'option1' | 'option2';
}

// 2. Update default settings
const DEFAULT_SETTINGS: UserSettings = {
  // ... existing defaults
  newSetting: 'option1',
};

// 3. Context automatically handles:
//    ✅ Persistence
//    ✅ Loading
//    ✅ Cross-tab sync
//    ✅ Type checking

// 4. Add UI in SettingsPanel
<button onClick={() => updateSettings({ newSetting: 'option2' })}>
  Option 2
</button>

// 5. Add CSS for new setting
body[data-new-setting="option2"] {
  /* styles */
}

// Done! ✨
```

This architecture provides a solid, maintainable foundation for the settings system.
