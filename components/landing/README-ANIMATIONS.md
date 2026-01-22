# Landing Page Animation Developer Guide

Quick reference for implementing and maintaining landing page micro-interactions.

## Quick Start

### Import Animation Utilities

```typescript
import {
  ANIMATION_TIMING,
  SPRING_CONFIGS,
  PRESS_SCALE,
  scrollToElement,
  injectSmoothScrollCSS
} from './animation-utils';
```

### Import Custom Hooks

```typescript
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
```

### Import Animated Components

```typescript
import { AnimatedPressable, AnimatedNavLink } from './animated-pressable';
```

## Common Patterns

### 1. Scroll-Triggered Fade-In

```typescript
function MySection() {
  const { animatedStyle, viewRef } = useScrollAnimation({
    duration: ANIMATION_TIMING.MEDIUM,
    threshold: 0.15,
  });

  return (
    <View ref={viewRef} nativeID="my-section">
      <Animated.View style={animatedStyle}>
        {/* Your content */}
      </Animated.View>
    </View>
  );
}
```

### 2. Button with Press Feedback

```typescript
<AnimatedPressable
  onPress={handlePress}
  pressScale={PRESS_SCALE.default}  // 0.96
  style={styles.button}
>
  <Text>Click Me</Text>
</AnimatedPressable>
```

### 3. Navigation Link with Opacity

```typescript
<AnimatedNavLink onPress={scrollToSection}>
  <Text>Features</Text>
</AnimatedNavLink>
```

### 4. Smooth Section Scrolling

```typescript
function handleNavigate() {
  scrollToElement('features-section', 80); // 80px offset for nav
}
```

### 5. Staggered List Animation

```typescript
const items = ['item1', 'item2', 'item3'];

return (
  <View>
    {items.map((item, index) => (
      <Animated.View
        key={item}
        style={{
          opacity: useRef(new Animated.Value(0)).current,
        }}
      >
        {/* Animate with delay: index * ANIMATION_TIMING.STAGGER */}
      </Animated.View>
    ))}
  </View>
);
```

## Animation Constants Reference

### Timing
```typescript
ANIMATION_TIMING.INSTANT  // 100ms - Button press
ANIMATION_TIMING.FAST     // 200ms - State changes
ANIMATION_TIMING.MEDIUM   // 400ms - Entrance animations
ANIMATION_TIMING.SLOW     // 600ms - Complex transitions
ANIMATION_TIMING.STAGGER  // 150ms - List delays
```

### Spring Physics
```typescript
SPRING_CONFIGS.gentle   // Subtle interactions
SPRING_CONFIGS.default  // Standard UI elements
SPRING_CONFIGS.snappy   // Button responses
SPRING_CONFIGS.bouncy   // Celebration effects
```

### Press Scales
```typescript
PRESS_SCALE.subtle      // 0.98 - Small buttons
PRESS_SCALE.default     // 0.96 - Medium buttons
PRESS_SCALE.prominent   // 0.94 - Large CTAs
```

## Best Practices

### ✅ DO

- Use `useNativeDriver: true` for transform/opacity
- Check `prefersReducedMotion()` for accessibility
- Clean up animations in useEffect returns
- Use shared constants from `animation-utils.ts`
- Test on both web and native platforms
- Provide ARIA labels for interactive elements
- Use 44px minimum touch targets
- Inject global styles once (in root component)

### ❌ DON'T

- Animate width/height with native driver (won't work)
- Create new Animated.Value on every render
- Forget to clean up Intersection Observers
- Hardcode animation values (use constants)
- Skip reduced-motion checks
- Nest too many animations (performance hit)
- Forget keyboard navigation support
- Use animations without purpose

## Performance Checklist

- [ ] All transform/opacity animations use native driver
- [ ] Animated.Value created in useRef (not state)
- [ ] IntersectionObserver cleaned up in useEffect
- [ ] No layout thrashing (read then write DOM)
- [ ] Animations stop when not visible
- [ ] No infinite loops without user action
- [ ] Reduced-motion preference respected
- [ ] Tested on low-end devices

## Accessibility Checklist

- [ ] All buttons have accessible labels
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader announcements correct
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets ≥ 44x44px
- [ ] Animations can be disabled
- [ ] Error states clearly communicated

## Debugging Tips

### Animation Not Running
1. Check if `useNativeDriver` is set correctly
2. Verify animated value is in useRef, not state
3. Check if animation is being started (.start())
4. Look for console warnings about animated values

### Scroll Animation Not Triggering
1. Verify element has `nativeID` attribute
2. Check intersection threshold (0.15 is good default)
3. Ensure viewRef is attached to View (web only)
4. Check if IntersectionObserver is supported

### Performance Issues
1. Open Chrome DevTools Performance tab
2. Record during animation
3. Look for "Long Tasks" (>50ms)
4. Check FPS (should be 60fps)
5. Profile on mobile device, not desktop

### Common Errors

**Error:** "Tried to synchronously call function..."
**Fix:** Use `useNativeDriver: false` for width/height

**Error:** "Animated.Value is undefined"
**Fix:** Initialize in useRef, not destructured from it

**Error:** "Cannot read property 'observe' of undefined"
**Fix:** Check Platform.OS === 'web' before using IntersectionObserver

## Component-Specific Notes

### Hero Section
- Runs entrance animation on mount (no scroll trigger)
- Smooth scroll initialized here (only once)
- Mobile menu uses slide-down animation
- CTA button has hover glow (web only)

### Simulation Section
- Scroll-triggered entrance at 15% threshold
- Two-phase animation: fast Protocol Guide, slow Manual
- Reset button clears all animation states
- Celebration effect auto-hides after 2s

### Time Calculator
- Numbers animate using Animated.Value listeners
- Slider uses native input on web for accessibility
- Results update on every slider change
- Green glow only on "reclaimed" numbers

### Features Section
- Cards stagger with 150ms delay
- Hover effects web-only (ignored on mobile)
- Icons have subtle shadow glow
- Uses Reanimated (not Animated API)

### Email Capture
- Validation shows/hides with FadeInDown
- Success state completely replaces form
- Focus ring web-only (native has default)
- Button loading state disables interactions

### Footer
- Last section, so threshold is 30% (later trigger)
- Links have CSS underline animation (web)
- Mobile stacks links vertically
- Tagline separated by border-top

## Adding New Animations

### Step 1: Plan the Interaction
- What triggers it? (scroll, press, hover, mount)
- How long should it take? (use ANIMATION_TIMING)
- What properties animate? (opacity, transform)
- Does it need spring physics? (use SPRING_CONFIGS)

### Step 2: Create Animated Values
```typescript
const opacity = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(20)).current;
```

### Step 3: Trigger Animation
```typescript
useEffect(() => {
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: ANIMATION_TIMING.MEDIUM,
      useNativeDriver: true,
    }),
    Animated.spring(translateY, {
      toValue: 0,
      ...SPRING_CONFIGS.default,
      useNativeDriver: true,
    }),
  ]).start();
}, []);
```

### Step 4: Apply Style
```typescript
<Animated.View style={{ opacity, transform: [{ translateY }] }}>
  {children}
</Animated.View>
```

### Step 5: Clean Up (if needed)
```typescript
useEffect(() => {
  // ... animation code
  return () => {
    opacity.setValue(0);
    translateY.setValue(20);
  };
}, []);
```

## Testing New Animations

1. **Visual Test:** Does it look smooth?
2. **Performance Test:** Is it 60fps?
3. **Accessibility Test:** Does it work with keyboard?
4. **Reduced Motion Test:** Does it respect preference?
5. **Mobile Test:** Does it work on touch devices?
6. **Cross-Browser Test:** Safari, Chrome, Firefox?

## Resources

- [React Native Animated API](https://reactnative.dev/docs/animated)
- [Reanimated 2](https://docs.swmansion.com/react-native-reanimated/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Prefers Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## Support

For questions or issues:
1. Check this guide first
2. Review MICRO-INTERACTIONS.md for details
3. Check existing component implementations
4. Test in isolation before integrating
5. Profile performance if issues arise

---

**Last Updated:** 2026-01-21
**Maintained By:** UI/UX Design Team
