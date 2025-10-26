# Settings Panel - Manual Testing Guide

## Quick Start

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   Navigate to `http://localhost:3000`

## Test Scenarios

### 1. Basic Panel Operations

#### Test 1.1: Open Settings with Keyboard
- **Action:** Press `s` key (anywhere on the page, not in an input)
- **Expected:** Settings panel slides in from center
- **Verify:**
  - Modal overlay appears (dark transparent background)
  - Panel shows with gear icon and "Settings" title
  - Panel has close button (X) in top right

#### Test 1.2: Close Settings with Escape
- **Action:** Press `Escape` key while settings panel is open
- **Expected:** Settings panel closes immediately
- **Verify:**
  - Panel disappears with animation
  - Overlay disappears
  - You can press `s` again to reopen

#### Test 1.3: Close Settings with Overlay Click
- **Action:** Open settings, then click on the dark overlay (not the panel)
- **Expected:** Settings panel closes
- **Verify:**
  - Panel closes when clicking outside
  - Panel stays open when clicking inside

#### Test 1.4: Close Settings with X Button
- **Action:** Open settings, click the X button
- **Expected:** Settings panel closes
- **Verify:**
  - Button has hover effect
  - Panel closes on click

### 2. Font Size Changes

#### Test 2.1: Normal Font Size
- **Action:** Open settings, click "Normal" button under Font Size
- **Expected:**
  - Button shows as active (blue background)
  - Text throughout app is normal size (16px)
  - Setting persists after page reload

#### Test 2.2: Large Font Size
- **Action:** Click "Large" button under Font Size
- **Expected:**
  - Button shows as active
  - All text increases to 17px
  - Changes apply immediately (no page reload needed)
  - Reload page - setting persists

#### Test 2.3: Extra Large Font Size
- **Action:** Click "Extra Large" button under Font Size
- **Expected:**
  - Button shows as active
  - All text increases to 19px
  - Changes apply immediately
  - Reload page - setting persists

#### Test 2.4: Font Size Persistence
- **Action:**
  1. Set font size to "Large"
  2. Close settings panel
  3. Refresh page
  4. Reopen settings panel
- **Expected:**
  - "Large" button is still active
  - Font size is still large

### 3. Theme Changes

#### Test 3.1: Switch to Light Theme
- **Action:** Open settings, click "Light" button under Theme
- **Expected:**
  - Light theme button shows as active
  - Background changes to white
  - Text changes to dark colors
  - Accent colors adjust for light background
  - Icon changes from moon to sun
  - Changes apply instantly

#### Test 3.2: Switch to Dark Theme
- **Action:** Click "Dark" button under Theme
- **Expected:**
  - Dark theme button shows as active
  - Background changes to dark blue
  - Text changes to white/light colors
  - Icon changes from sun to moon
  - Changes apply instantly

#### Test 3.3: Theme Persistence
- **Action:**
  1. Switch to light theme
  2. Close settings
  3. Refresh page
  4. Reopen settings
- **Expected:**
  - Light theme is still active
  - Icon shows sun

### 4. High Contrast Mode

#### Test 4.1: Enable High Contrast
- **Action:** Check "High Contrast Mode" checkbox
- **Expected:**
  - Background becomes pure black (#000000)
  - Text becomes pure white
  - Borders become white
  - Higher contrast throughout app

#### Test 4.2: Disable High Contrast
- **Action:** Uncheck "High Contrast Mode" checkbox
- **Expected:**
  - Returns to normal theme colors
  - Changes apply immediately

#### Test 4.3: High Contrast with Themes
- **Action:**
  1. Enable high contrast
  2. Switch between dark and light themes
- **Expected:**
  - High contrast overrides both themes
  - Colors remain high contrast

#### Test 4.4: High Contrast Persistence
- **Action:**
  1. Enable high contrast
  2. Refresh page
- **Expected:**
  - High contrast still enabled
  - Checkbox is checked

### 5. Reduced Motion

#### Test 5.1: Enable Reduced Motion
- **Action:** Check "Reduce Animations" checkbox
- **Expected:**
  - All animations become instant
  - No smooth transitions
  - No fade effects
  - Panel open/close is instant

#### Test 5.2: Disable Reduced Motion
- **Action:** Uncheck "Reduce Animations" checkbox
- **Expected:**
  - Animations return
  - Smooth transitions work
  - Fade effects work

#### Test 5.3: System Preference Detection
- **Action:**
  1. Set OS to prefer reduced motion:
     - **macOS:** System Preferences → Accessibility → Display → Reduce motion
     - **Windows:** Settings → Ease of Access → Display → Show animations
  2. Clear localStorage (DevTools → Application → Local Storage → Clear)
  3. Refresh page
  4. Open settings
- **Expected:**
  - "Reduce Animations" is automatically checked
  - Can be manually unchecked if desired

#### Test 5.4: Reduced Motion Persistence
- **Action:**
  1. Enable reduced motion
  2. Refresh page
- **Expected:**
  - Checkbox still checked
  - Animations still disabled

### 6. Cross-Tab Synchronization

#### Test 6.1: Settings Sync Across Tabs
- **Action:**
  1. Open app in Tab 1
  2. Open app in Tab 2 (same browser)
  3. In Tab 1: Change font size to "Large"
- **Expected:**
  - Tab 2 font size updates automatically
  - No refresh needed in Tab 2

#### Test 6.2: Theme Sync Across Tabs
- **Action:**
  1. With two tabs open
  2. In Tab 1: Switch to light theme
- **Expected:**
  - Tab 2 switches to light theme instantly

#### Test 6.3: All Settings Sync
- **Action:**
  1. With two tabs open
  2. In Tab 1:
     - Change font to "Extra Large"
     - Switch to light theme
     - Enable high contrast
     - Enable reduced motion
- **Expected:**
  - All changes appear in Tab 2 instantly
  - No refresh needed

### 7. Keyboard Shortcuts Integration

#### Test 7.1: Shortcuts Panel
- **Action:**
  1. Press `Shift + ?` (question mark)
  2. Look for 's' shortcut in list
- **Expected:**
  - Shortcuts panel opens
  - Shows: "s - Open settings"

#### Test 7.2: Settings from Shortcuts
- **Action:**
  1. Open shortcuts panel (`Shift + ?`)
  2. Press `s` key
- **Expected:**
  - Shortcuts panel closes
  - Settings panel opens

#### Test 7.3: No Conflict with Input
- **Action:**
  1. Click in a text input or textarea
  2. Type the letter 's'
- **Expected:**
  - Letter 's' appears in input
  - Settings panel does NOT open

### 8. localStorage Verification

#### Test 8.1: Inspect localStorage
- **Action:**
  1. Open DevTools (F12)
  2. Go to Application → Local Storage → localhost:3000
  3. Look for settings keys
- **Expected:**
  - See keys: `fontSize`, `theme`, `highContrast`, `reducedMotion`
  - Values match current settings

#### Test 8.2: Manual localStorage Edit
- **Action:**
  1. In DevTools localStorage, change `theme` to `"light"`
  2. Switch to another tab or window of the same app
- **Expected:**
  - Other tab updates to light theme

#### Test 8.3: Clear localStorage
- **Action:**
  1. Clear all localStorage
  2. Refresh page
  3. Open settings
- **Expected:**
  - All settings reset to defaults:
    - Font Size: Normal
    - Theme: Dark
    - High Contrast: Off
    - Reduced Motion: Off (unless system preference is on)

### 9. Error Handling

#### Test 9.1: Private Browsing
- **Action:**
  1. Open app in private/incognito window
  2. Change settings
  3. Close settings panel
- **Expected:**
  - Settings work in memory
  - May show console warning about localStorage
  - Settings don't persist after refresh (expected)

#### Test 9.2: localStorage Disabled
- **Action:**
  1. Disable localStorage in browser settings
  2. Try changing settings
- **Expected:**
  - Settings still work during session
  - Console may show errors (graceful degradation)
  - Settings don't persist after refresh

### 10. Accessibility

#### Test 10.1: Screen Reader
- **Action:**
  1. Open settings with screen reader active
  2. Tab through controls
- **Expected:**
  - Panel announced as dialog
  - "Settings" title is announced
  - All buttons have labels
  - Checkboxes have labels

#### Test 10.2: Keyboard Navigation
- **Action:**
  1. Open settings
  2. Use Tab to navigate through controls
  3. Use Space to toggle checkboxes
  4. Use Enter to click buttons
- **Expected:**
  - All controls keyboard accessible
  - Focus visible on current control
  - Escape closes panel from any focused element

#### Test 10.3: ARIA Attributes
- **Action:** Inspect settings panel HTML in DevTools
- **Expected:**
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby="settings-title"`
  - Close button has `aria-label="Close settings"`

### 11. Performance

#### Test 11.1: No Memory Leaks
- **Action:**
  1. Open and close settings 10 times
  2. Check DevTools Performance/Memory
- **Expected:**
  - No increasing memory usage
  - Event listeners cleaned up properly

#### Test 11.2: Smooth Animations
- **Action:**
  1. Ensure "Reduce Animations" is OFF
  2. Open/close settings quickly
- **Expected:**
  - Smooth animation every time
  - No lag or jank
  - Consistent 60fps

#### Test 11.3: Immediate Updates
- **Action:**
  1. Click between font sizes rapidly
  2. Click between themes rapidly
- **Expected:**
  - Updates apply instantly
  - No delays
  - UI stays responsive

## Automated Testing Commands

```bash
# Run TypeScript check
npx tsc --noEmit

# Run linter (will show warnings, not errors)
npm run lint

# Build production version
npm run build

# Check specific files
npx tsc --noEmit app/contexts/settings-context.tsx
npx tsc --noEmit app/components/settings-panel.tsx
```

## Browser Testing Matrix

Test in these browsers to ensure compatibility:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Known Issues

### Intentional Behaviors:
1. **Private browsing:** Settings don't persist after refresh (expected - no localStorage)
2. **localStorage full:** Settings work in memory but may not save (rare edge case)
3. **Very old browsers:** May not support CSS custom properties (IE11, etc.)

### Not Issues:
1. **ESLint warnings:** Pre-existing in codebase, not related to settings changes
2. **Font size not perfect:** Browser minimum font sizes may override very small text
3. **Theme flash:** Brief flash of wrong theme on initial load (page hasn't loaded yet)

## Success Indicators

All tests should pass with these outcomes:

✅ Settings panel opens with 's' key
✅ All close methods work (Escape, overlay, X button)
✅ Font sizes change immediately and persist
✅ Themes change immediately and persist
✅ High contrast works and persists
✅ Reduced motion works and persists
✅ Settings sync across browser tabs
✅ Keyboard shortcuts work correctly
✅ localStorage stores settings correctly
✅ Accessibility features work properly
✅ No console errors (except expected localStorage warnings)
✅ No memory leaks
✅ Smooth performance

## Troubleshooting

### Settings Not Persisting
1. Check localStorage is enabled
2. Check browser is not in private mode
3. Check localStorage quota not exceeded
4. Check console for errors

### Settings Not Applying
1. Check console for errors
2. Verify CSS is loaded (`globals.css`)
3. Check DOM in DevTools for correct attributes
4. Clear cache and hard refresh

### Keyboard Shortcut Not Working
1. Make sure focus is not in an input field
2. Check no browser extensions intercepting keys
3. Try in incognito mode
4. Check console for errors

### Cross-Tab Sync Not Working
1. Verify both tabs are on same origin
2. Check localStorage is enabled
3. Try in incognito mode
4. Check console for errors

## Reporting Issues

If you find a bug, report it with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Console errors (if any)
6. Screenshots (if applicable)

## Additional Manual Tests

### Edge Cases:

1. **Rapid clicking:** Click settings buttons very quickly
2. **Tab switching:** Switch browser tabs while panel is open
3. **Browser zoom:** Change browser zoom level with settings open
4. **Window resize:** Resize browser window with settings open
5. **Network offline:** Disconnect network and verify settings still work
6. **Multiple monitors:** Move window between monitors with different DPI

All of these should work without issues!
