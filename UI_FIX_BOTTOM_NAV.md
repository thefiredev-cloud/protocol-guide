# 🐛 UI Bug: Send Button Overlapping Bottom Navigation

## Problem

The Send button and bottom navigation bar (Chat, Dosing, Protocols, Base, Scene) are both positioned at `bottom: 0`, causing overlap.

## Root Cause

**File:** `app/globals.css` line 665-674

```css
.inputRow {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;  /* ❌ CONFLICT - Same as bottom nav */
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid var(--border);
  padding: 16px clamp(20px, 4vw, 36px) calc(16px + env(safe-area-inset-bottom, 0));
  backdrop-filter: blur(12px);
}
```

Bottom navigation is ALSO at `bottom: 0` (need to find which selector).

## Solution

### Option 1: Hide Bottom Nav on Chat Page (Recommended)
The bottom nav (Chat, Dosing, Protocols, Base, Scene) should probably not show on the main chat page since you're already IN the chat.

**Fix:** Add CSS to hide bottom nav on main page:
```css
/* Hide bottom nav on chat page */
body:has(.chat-input-container) .bottom-navigation {
  display: none;
}
```

### Option 2: Position Input Above Bottom Nav
If you want to keep the bottom nav, position `.inputRow` above it:

```css
.inputRow {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 70px;  /* Height of bottom nav + spacing */
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid var(--border);
  padding: 16px clamp(20px, 4vw, 36px) calc(16px + env(safe-area-inset-bottom, 0));
  backdrop-filter: blur(12px);
}
```

### Option 3: Make Input Part of Bottom Nav
Integrate the Send/Voice/Narrative buttons INTO the bottom nav bar itself.

## Quick Test

To verify which bottom nav class is causing the issue, run in browser console:
```javascript
document.querySelectorAll('[style*="bottom"], [class*="bottom"], [class*="nav"]').forEach(el => {
  const styles = window.getComputedStyle(el);
  if (styles.position === 'fixed' && styles.bottom === '0px') {
    console.log('Element at bottom: 0', el, el.className);
  }
});
```

## Recommended Fix

**Most likely:** The bottom nav should not be visible on the chat page. Remove it or hide it with CSS.

**File to check:** Look for bottom navigation component (likely in `app/layout.tsx` or a navigation component).
