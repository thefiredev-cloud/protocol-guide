# Accessibility Quick Reference

Quick guide for developers adding new features to Protocol Guide.

---

## Import Utilities

```typescript
import {
  createButtonA11y,
  createSearchA11y,
  createTextInputA11y,
  createStatusA11y,
  announceForAccessibility,
  MEDICAL_A11Y_LABELS,
} from '@/lib/accessibility';
```

---

## Common Patterns

### Button

```typescript
<TouchableOpacity
  {...createButtonA11y(
    "Button label",
    "What happens when pressed",
    isDisabled
  )}
  onPress={handlePress}
>
  <Text>Button Text</Text>
</TouchableOpacity>
```

### Text Input

```typescript
<TextInput
  {...createTextInputA11y(
    "Field label",
    "Help text or hint",
    isRequired
  )}
  value={value}
  onChangeText={setValue}
/>
```

### Search Input

```typescript
<TextInput
  {...createSearchA11y(
    "Search protocols",
    "Enter medical condition or protocol name"
  )}
  value={query}
  onChangeText={setQuery}
  accessibilityValue={{ text: query }}
/>
```

### Status Messages

```typescript
{error && (
  <View {...createStatusA11y(error, "error")}>
    <Text>{error}</Text>
  </View>
)}

{success && (
  <View {...createStatusA11y(success, "success")}>
    <Text>{success}</Text>
  </View>
)}
```

### Announce Dynamic Changes

```typescript
// After search completes
announceForAccessibility(`Found ${count} results`);

// On error
announceForAccessibility("Search failed. Please try again.");

// State change
announceForAccessibility("Recording started");
```

---

## Checklist for New Components

### Interactive Elements
- [ ] Add `accessible={true}`
- [ ] Set `accessibilityRole` (button, link, search, etc.)
- [ ] Provide `accessibilityLabel` (what it is)
- [ ] Add `accessibilityHint` (what it does)
- [ ] Include `accessibilityState` if applicable (disabled, selected, busy)

### Text Inputs
- [ ] Label describes the field
- [ ] Hint explains expected input
- [ ] Use `accessibilityValue` for current value
- [ ] Error messages announced with live region

### Lists
- [ ] Each item has unique label
- [ ] Item position indicated ("Item 1 of 5")
- [ ] Tappable area ≥ 44x44 points

### Dynamic Content
- [ ] Use `announceForAccessibility()` for changes
- [ ] Set `accessibilityLiveRegion` (polite/assertive)
- [ ] Announce results count, errors, success

### Colors
- [ ] Text contrast ≥ 4.5:1 (AA) or ≥ 7:1 (AAA)
- [ ] UI contrast ≥ 3:1
- [ ] Don't rely on color alone (use icons/text)

---

## Medical App Labels

Use predefined labels from `MEDICAL_A11Y_LABELS`:

```typescript
// Search
MEDICAL_A11Y_LABELS.search.input
MEDICAL_A11Y_LABELS.search.button
MEDICAL_A11Y_LABELS.search.clear
MEDICAL_A11Y_LABELS.search.voiceSearch
MEDICAL_A11Y_LABELS.search.stopVoice

// Voice
MEDICAL_A11Y_LABELS.voice.recording
MEDICAL_A11Y_LABELS.voice.processing
MEDICAL_A11Y_LABELS.voice.transcribing
MEDICAL_A11Y_LABELS.voice.error
MEDICAL_A11Y_LABELS.voice.permission

// Navigation
MEDICAL_A11Y_LABELS.navigation.home
MEDICAL_A11Y_LABELS.navigation.search
MEDICAL_A11Y_LABELS.navigation.profile
MEDICAL_A11Y_LABELS.navigation.back
MEDICAL_A11Y_LABELS.navigation.close

// Protocol
MEDICAL_A11Y_LABELS.protocol.view
MEDICAL_A11Y_LABELS.protocol.currency
MEDICAL_A11Y_LABELS.protocol.source

// Filter
MEDICAL_A11Y_LABELS.filter.state
MEDICAL_A11Y_LABELS.filter.clear
MEDICAL_A11Y_LABELS.filter.apply
```

---

## Common Mistakes to Avoid

### ❌ Don't
```typescript
// No label
<TouchableOpacity onPress={handlePress}>
  <Icon name="close" />
</TouchableOpacity>

// Color only for error
<Text style={{ color: 'red' }}>Error!</Text>

// No announcement for async result
setSearchResults(results);
```

### ✅ Do
```typescript
// With label
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Close modal"
  accessibilityRole="button"
>
  <Icon name="close" />
</TouchableOpacity>

// Icon + text for error
<View {...createStatusA11y("Error occurred", "error")}>
  <Icon name="error" />
  <Text>Error occurred</Text>
</View>

// Announce result
setSearchResults(results);
announceForAccessibility(`Found ${results.length} results`);
```

---

## Testing Your Component

### VoiceOver (iOS)
1. Enable: Settings → Accessibility → VoiceOver
2. Navigate with one-finger swipe
3. Activate with double-tap
4. Listen to announcements

### Keyboard (Web)
1. Tab through all interactive elements
2. Enter/Space to activate buttons
3. Arrow keys for lists (if implemented)
4. Escape to close modals

### Contrast (All)
```typescript
import { getContrastRatio } from '@/lib/accessibility';

const ratio = getContrastRatio('#FF5555', '#0F172A');
console.log(ratio); // Should be ≥ 4.5:1
```

---

## Platform Differences

### React Native
- Uses `accessibilityLabel`, `accessibilityHint`
- `AccessibilityInfo.announceForAccessibility()`
- Platform-specific roles

### Web
- Maps to ARIA (`aria-label`, `aria-describedby`)
- Uses live regions for announcements
- Standard HTML semantics

**Our utilities handle both!** Just use the helper functions.

---

## Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **React Native Accessibility**: https://reactnative.dev/docs/accessibility
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Full Audit**: See `ACCESSIBILITY_AUDIT.md`
- **Color Guide**: See `COLOR_CONTRAST_IMPROVEMENTS.md`

---

## Questions?

Check `/lib/accessibility.ts` for all available utilities and their documentation.
