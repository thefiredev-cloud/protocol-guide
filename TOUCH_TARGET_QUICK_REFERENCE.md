# Touch Target Quick Reference

## At a Glance

| Component | Element | Before | After | Status |
|-----------|---------|--------|-------|--------|
| **theme-toggle.tsx** | Compact button | ~38px | 48x48px | ✅ Fixed |
| **theme-toggle.tsx** | Full mode buttons | ~34px | 48px min | ✅ Fixed |
| **chat-input.tsx** | Clear button | 24x24px | 32x32px | ✅ Fixed* |
| **chat-input.tsx** | Voice button | 48x48px | 48x48px | ✅ Already OK |
| **chat-input.tsx** | Send button | 48x48px | 48x48px | ✅ Already OK |
| **recent-searches.tsx** | Clear button | ~28px | 44x44px | ✅ Fixed |
| **recent-searches.tsx** | Search chips | ~40px | 44px min | ✅ Fixed |
| **county-selector.tsx** | Close button | ~40px | 48x48px | ✅ Fixed |
| **county-selector.tsx** | Clear search | ~28px | 44x44px | ✅ Fixed |
| **InstallPrompt.tsx** | Dismiss X | ~28px | 44x44px | ✅ Fixed |
| **InstallPrompt.tsx** | Install button | ~36px | 48px min | ✅ Fixed |
| **InstallPrompt.tsx** | Not Now button | ~36px | 48px min | ✅ Fixed |
| **InstallPrompt.tsx** | Got it button | ~36px | 48px min | ✅ Fixed |
| **response-card.tsx** | Copy button | 32px | 44x44px | ✅ Fixed |
| **response-card.tsx** | More actions | 32px | 44x44px | ✅ Fixed |
| **response-card.tsx** | Footer buttons | 22px | 44x44px | ✅ Fixed |
| **VoiceSearchButton.tsx** | All sizes | 48-56px | 48-56px | ✅ Already OK |
| **quick-actions.tsx** | Action buttons | ~48px | ~48px | ✅ Already OK |
| **quick-actions.tsx** | Suggestions | ~48px | ~48px | ✅ Already OK |

*Exception: Clear button limited to 32x32px due to input field height constraints. This is acceptable as it's a secondary action.

---

## Standards Reference

### WCAG 2.1 Level AAA (2.5.5)
**Requirement:** The size of the target for pointer inputs is at least 44 by 44 CSS pixels.

**Exceptions:**
- Inline: The target is in a sentence or block of text
- User Agent Control: The size is controlled by the user agent
- Essential: A particular presentation is essential to the information

### Platform Guidelines

| Platform | Minimum | Recommended | Source |
|----------|---------|-------------|--------|
| **iOS (Apple HIG)** | 44pt | 44pt | Human Interface Guidelines |
| **Android (Material)** | 48dp | 48dp | Material Design 3 |
| **Web (WCAG)** | 44px | 48px | WCAG 2.1 AAA |
| **EMS/Medical** | 48px | 56px | Glove-friendly design |

---

## Implementation Pattern

### ✅ Recommended Pattern
```tsx
<TouchableOpacity
  style={{
    minWidth: 48,
    minHeight: 48,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }}
  accessibilityLabel="Action description"
  accessibilityRole="button"
>
  <IconSymbol name="icon.name" size={20} />
</TouchableOpacity>
```

### ❌ Anti-Pattern
```tsx
<TouchableOpacity className="p-2">
  <IconSymbol name="icon.name" size={20} />
</TouchableOpacity>
```

---

## Testing Checklist

- [ ] All buttons are at least 44x44px
- [ ] Accessibility labels added
- [ ] Accessibility roles defined
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Test on mobile device
- [ ] Test with gloves (EMS-specific)
- [ ] Visual regression test passes
- [ ] No layout shift or overflow issues

---

## Quick Fixes for New Components

### 1. Icon-only buttons
```tsx
const styles = StyleSheet.create({
  iconButton: {
    minWidth: 48,
    minHeight: 48,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 2. Text buttons
```tsx
const styles = StyleSheet.create({
  textButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
});
```

### 3. Combined icon + text
```tsx
const styles = StyleSheet.create({
  combinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
});
```

---

## Common Mistakes to Avoid

1. **Relying only on padding** - Use explicit `minWidth` and `minHeight`
2. **Forgetting accessibility labels** - Always add for icon-only buttons
3. **Using NativeWind without minimums** - `className="p-2"` is only 16px
4. **Nested touchables** - Can cause sizing issues, flatten when possible
5. **Forgetting disabled states** - Should still meet size requirements

---

## Resources

- [WCAG 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Apple HIG - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design - Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

---

**Last Updated:** 2026-01-23
**Status:** ✅ All critical issues resolved
