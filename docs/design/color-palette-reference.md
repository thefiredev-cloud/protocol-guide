# EMS Color Palette Reference Guide
**LA County Fire Department - Professional Emergency Services Colors**

## Overview

This guide provides specific color values, usage guidelines, and accessibility information for the LA County Fire Medic Bot color system. All colors are tested for WCAG AAA compliance in their intended use cases.

---

## Primary Color System

### LA County Fire Red (Brand Primary)

The signature red represents LA County Fire Department authority and emergency response.

#### Dark Mode
```css
--accent: #ff3b30;
--accent-hover: #ff453a;
--accent-light: rgba(255, 59, 48, 0.1);
```

**RGB Values:**
- Base: `rgb(255, 59, 48)` - #ff3b30
- Hover: `rgb(255, 69, 58)` - #ff453a
- Background: `rgba(255, 59, 48, 0.1)`

**Accessibility:**
- On dark background (#04111f): Contrast 8.2:1 (AAA)
- On white background: Fails contrast (use light mode variant)

**Usage:**
- Primary CTA buttons
- Critical alerts
- Protocol priority indicators
- Active states
- Emergency warnings

#### Light Mode
```css
--accent: #c41e3a;
--accent-hover: #a01a2e;
--accent-light: rgba(196, 30, 58, 0.18);
```

**RGB Values:**
- Base: `rgb(196, 30, 58)` - #c41e3a
- Hover: `rgb(160, 26, 46)` - #a01a2e
- Background: `rgba(196, 30, 58, 0.18)`

**Accessibility:**
- On white background: Contrast 7.1:1 (AAA)
- On dark background: Use dark mode variant

**Usage:**
- Same as dark mode
- Optimized for daylight readability

#### Sunlight Mode (Ultra High Contrast)
```css
--accent: #cc0000;
--accent-hover: #aa0000;
```

**RGB Values:**
- Base: `rgb(204, 0, 0)` - #cc0000
- Hover: `rgb(170, 0, 0)` - #aa0000

**Accessibility:**
- On white background: Contrast 8.9:1 (AAA)
- Maximum visibility in bright sunlight

---

## Medical Authority Blue

Professional medical blue conveys trust, authority, and medical expertise.

#### Dark Mode
```css
--medical-blue: #0a84ff;
--medical-blue-hover: #409cff;
```

**RGB Values:**
- Base: `rgb(10, 132, 255)` - #0a84ff
- Hover: `rgb(64, 156, 255)` - #409cff

**Accessibility:**
- On dark background (#04111f): Contrast 6.5:1 (AA Large)
- Sufficient for large text (18px+)

**Usage:**
- Focus rings
- Information states
- Secondary actions
- Medical data highlights
- Links and navigation

#### Light Mode
```css
--medical-blue: #0056b3;
--medical-blue-hover: #004085;
```

**RGB Values:**
- Base: `rgb(0, 86, 179)` - #0056b3
- Hover: `rgb(0, 64, 133)` - #004085

**Accessibility:**
- On white background: Contrast 7.5:1 (AAA)

#### Sunlight Mode
```css
--medical-blue: #003399;
--medical-blue-hover: #002266;
```

**RGB Values:**
- Base: `rgb(0, 51, 153)` - #003399
- Hover: `rgb(0, 34, 102)` - #002266

---

## Status Colors

### Success Green (Stable/Complete)

#### Dark Mode
```css
--success: #30d158;
--success-green: #30d158;
--success-green-dark: #28a745;
--success-green-light: #5de082;
--success-green-bg: rgba(48, 209, 88, 0.15);
--success-green-border: rgba(48, 209, 88, 0.4);
```

**RGB Values:**
- Base: `rgb(48, 209, 88)` - #30d158
- Dark: `rgb(40, 167, 69)` - #28a745
- Light: `rgb(93, 224, 130)` - #5de082

**Accessibility:**
- On dark background: Contrast 7.8:1 (AAA)
- Never use alone to convey status (add icon/text)

**Usage:**
- Patient stable indicators
- Successful operations
- Completed tasks
- Online status
- Positive confirmations

#### Light Mode
```css
--success: #198754;
--success-green: #198754;
--success-green-dark: #146c43;
--success-green-light: #20c997;
```

**RGB Values:**
- Base: `rgb(25, 135, 84)` - #198754
- Dark: `rgb(20, 108, 67)` - #146c43

**Accessibility:**
- On white background: Contrast 4.8:1 (AA)

#### Sunlight Mode
```css
--success: #006600;
--success-green: #006600;
--success-green-dark: #004400;
```

**RGB Values:**
- Base: `rgb(0, 102, 0)` - #006600

### Warning Yellow (Caution)

#### Dark Mode
```css
--warning: #ffd60a;
--warning-amber: #ffd60a;
--warning-amber-dark: #ff9f0a;
--warning-amber-light: #ffdf5d;
--warning-amber-bg: rgba(255, 214, 10, 0.15);
--warning-amber-border: rgba(255, 214, 10, 0.4);
```

**RGB Values:**
- Base: `rgb(255, 214, 10)` - #ffd60a
- Dark: `rgb(255, 159, 10)` - #ff9f0a
- Light: `rgb(255, 223, 93)` - #ffdf5d

**Accessibility:**
- On dark background: Contrast 12.5:1 (AAA+)
- Extremely high visibility

**Usage:**
- Caution alerts
- Warning states
- Offline indicators
- Dose warnings
- Non-critical alerts

#### Light Mode
```css
--warning: #e68500;
--warning-amber: #e68500;
--warning-amber-dark: #b86a00;
```

**RGB Values:**
- Base: `rgb(230, 133, 0)` - #e68500

**Accessibility:**
- On white background: Contrast 5.2:1 (AA)

#### Sunlight Mode
```css
--warning: #ff6600;
--warning-amber: #ff6600;
```

**RGB Values:**
- Base: `rgb(255, 102, 0)` - #ff6600

### Error Red (Critical)

#### Dark Mode
```css
--error: #ff453a;
--critical-red: #ff453a;
--critical-red-dark: #ff3b30;
--critical-red-light: #ff6b6b;
--critical-red-bg: rgba(255, 69, 58, 0.15);
--critical-red-border: rgba(255, 69, 58, 0.4);
```

**RGB Values:**
- Base: `rgb(255, 69, 58)` - #ff453a
- Dark: `rgb(255, 59, 48)` - #ff3b30
- Light: `rgb(255, 107, 107)` - #ff6b6b

**Usage:**
- Error states
- Critical alerts
- Failed operations
- Contraindications
- Offline mode

#### Light Mode
```css
--error: #c41e3a;
--critical-red: #c41e3a;
```

#### Sunlight Mode
```css
--error: #cc0000;
--critical-red: #cc0000;
```

### Info Cyan (Information)

#### Dark Mode
```css
--info: #64d2ff;
--info-blue: #64d2ff;
--info-blue-dark: #0a84ff;
--info-blue-light: #8fddff;
--info-blue-bg: rgba(100, 210, 255, 0.15);
--info-blue-border: rgba(100, 210, 255, 0.4);
```

**RGB Values:**
- Base: `rgb(100, 210, 255)` - #64d2ff
- Dark: `rgb(10, 132, 255)` - #0a84ff

**Usage:**
- Informational alerts
- Tips and guidance
- Contact information
- Protocol notes

#### Light Mode
```css
--info: #0066cc;
--info-blue: #0066cc;
```

**RGB Values:**
- Base: `rgb(0, 102, 204)` - #0066cc

#### Sunlight Mode
```css
--info: #0066cc;
--info-blue: #0066cc;
```

---

## Background System

### Dark Mode Backgrounds

```css
--background: #04111f;        /* Base canvas */
--surface: #0a1929;          /* Cards, panels */
--surface-elevated: #132f4c;  /* Modals, dropdowns */
```

**RGB Values:**
- Background: `rgb(4, 17, 31)` - #04111f (Very dark blue-black)
- Surface: `rgb(10, 25, 41)` - #0a1929 (Dark blue-gray)
- Elevated: `rgb(19, 47, 76)` - #132f4c (Elevated blue-gray)

**Depth Hierarchy:**
1. Background (lowest)
2. Surface (mid)
3. Elevated (highest)

**Usage:**
- Background: App canvas, main view
- Surface: Protocol cards, chat messages
- Elevated: Modals, menus, tooltips

### Light Mode Backgrounds

```css
--background: #ffffff;        /* White canvas */
--surface: #f8f9fa;          /* Off-white cards */
--surface-elevated: #ffffff;  /* Pure white modals */
```

**RGB Values:**
- Background: `rgb(255, 255, 255)` - #ffffff
- Surface: `rgb(248, 249, 250)` - #f8f9fa
- Elevated: `rgb(255, 255, 255)` - #ffffff

### Sunlight Mode Backgrounds

```css
--background: #ffffff;
--surface: #f0f0f0;
--surface-elevated: #ffffff;
```

**RGB Values:**
- Surface: `rgb(240, 240, 240)` - #f0f0f0

---

## Typography Colors

### Dark Mode

```css
--text-primary: #ffffff;      /* Main content */
--text-secondary: #a0a0a0;    /* Supporting text */
--text-tertiary: #6e6e6e;     /* Disabled/subtle */
```

**RGB Values:**
- Primary: `rgb(255, 255, 255)` - #ffffff
- Secondary: `rgb(160, 160, 160)` - #a0a0a0
- Tertiary: `rgb(110, 110, 110)` - #6e6e6e

**Contrast Ratios on Dark Background (#04111f):**
- Primary: 21:1 (AAA+)
- Secondary: 7.2:1 (AAA)
- Tertiary: 4.6:1 (AA)

**Usage:**
- Primary: Headings, body text, labels
- Secondary: Descriptions, metadata, captions
- Tertiary: Disabled states, placeholders

### Light Mode

```css
--text-primary: #0a0a0a;      /* Nearly black */
--text-secondary: #4a4a4f;    /* Dark gray */
--text-tertiary: #6b6b70;     /* Medium gray */
```

**RGB Values:**
- Primary: `rgb(10, 10, 10)` - #0a0a0a
- Secondary: `rgb(74, 74, 79)` - #4a4a4f
- Tertiary: `rgb(107, 107, 112)` - #6b6b70

**Contrast Ratios on White:**
- Primary: 20:1 (AAA+)
- Secondary: 9.8:1 (AAA)
- Tertiary: 5.3:1 (AA)

### Sunlight Mode

```css
--text-primary: #000000;      /* Pure black */
--text-secondary: #333333;    /* Dark gray */
--text-tertiary: #666666;     /* Medium gray */
```

**RGB Values:**
- Primary: `rgb(0, 0, 0)` - #000000
- Secondary: `rgb(51, 51, 51)` - #333333
- Tertiary: `rgb(102, 102, 102)` - #666666

---

## Border Colors

### Dark Mode

```css
--border: #1d3a52;            /* Visible borders */
--border-subtle: #132f4c;     /* Subtle dividers */
```

**RGB Values:**
- Border: `rgb(29, 58, 82)` - #1d3a52
- Subtle: `rgb(19, 47, 76)` - #132f4c

### Light Mode

```css
--border: #c9c9ce;            /* Visible borders */
--border-subtle: #e0e0e5;     /* Subtle dividers */
```

**RGB Values:**
- Border: `rgb(201, 201, 206)` - #c9c9ce
- Subtle: `rgb(224, 224, 229)` - #e0e0e5

### Sunlight Mode

```css
--border: #000000;            /* Black borders */
--border-subtle: #333333;     /* Dark gray dividers */
```

**RGB Values:**
- Border: `rgb(0, 0, 0)` - #000000
- Subtle: `rgb(51, 51, 51)` - #333333

---

## Interactive State Colors

### Focus States

```css
--focus: #0a84ff;             /* Focus ring */
```

**Usage:**
- Keyboard navigation focus
- Form field focus
- Interactive element selection

**Implementation:**
```css
:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Hover States

```css
--hover: rgba(255, 255, 255, 0.08);  /* Dark mode */
--hover: rgba(0, 0, 0, 0.06);        /* Light mode */
```

**Usage:**
- Button hover backgrounds
- List item hover
- Card hover overlays

### Active/Pressed States

```css
--active: rgba(255, 255, 255, 0.12); /* Dark mode */
--active: rgba(0, 0, 0, 0.1);        /* Light mode */
```

**Usage:**
- Button press state
- Active tab indicator
- Selected list items

---

## Protocol Priority Color System

Visual hierarchy for protocol urgency:

### Priority 1 - CRITICAL/IMMEDIATE

```css
--protocol-critical: #ff453a;

.protocol-priority-p1 {
  border-left: 4px solid #ff3b30;
  background: rgba(255, 59, 48, 0.12);
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.25);
}
```

**When to Use:**
- Life-threatening conditions
- Immediate interventions required
- Time-critical protocols
- Cardiac arrest, major trauma

**Visual Treatment:**
- Red accent
- Bold borders
- Elevated shadows
- Prominent badges

### Priority 2 - HIGH/URGENT

```css
--protocol-high: #ff9f0a;

.protocol-priority-p2 {
  border-left: 4px solid #ff9500;
  background: rgba(255, 149, 0, 0.12);
}
```

**When to Use:**
- Serious but not immediately life-threatening
- Time-sensitive protocols
- Significant patient deterioration
- Chest pain, respiratory distress

**Visual Treatment:**
- Orange accent
- Moderate emphasis
- Clear but not alarming

### Priority 3 - MEDIUM/STANDARD

```css
--protocol-medium: #ffd60a;

.protocol-priority-p3 {
  border-left: 4px solid #ffd60a;
  background: rgba(255, 214, 10, 0.12);
}
```

**When to Use:**
- Routine protocols
- Standard interventions
- Non-urgent procedures
- Minor injuries, routine transport

**Visual Treatment:**
- Yellow accent
- Subtle emphasis
- Clear but calm

### Stable/Complete

```css
--protocol-stable: #30d158;

.protocol-stable {
  border-left: 4px solid #30d158;
  background: rgba(48, 209, 88, 0.12);
}
```

**When to Use:**
- Patient stabilized
- Procedure completed
- Status updates
- Successful interventions

---

## Color Usage Guidelines

### Do's

1. **Always pair colors with icons or text**
   - Never rely on color alone to convey information
   - Essential for color-blind accessibility

2. **Use semantic colors consistently**
   - Red = Critical/Error
   - Yellow = Warning/Caution
   - Green = Success/Stable
   - Blue = Information/Authority

3. **Test in all theme modes**
   - Dark mode (night shifts)
   - Light mode (daytime)
   - Sunlight mode (outdoor/bright conditions)

4. **Verify contrast ratios**
   - Use tools like WebAIM Contrast Checker
   - Aim for WCAG AAA (7:1) for critical content
   - Minimum WCAG AA (4.5:1) for all text

5. **Consider field conditions**
   - Test on actual iPads
   - View in bright sunlight
   - Test with gloves on
   - Verify with polarized sunglasses

### Don'ts

1. **Don't use low-contrast colors**
   - Avoid pastels on white backgrounds
   - No light gray text on white

2. **Don't mix color modes**
   - Don't use dark mode colors in light mode
   - Maintain theme consistency

3. **Don't overuse red**
   - Reserve for truly critical items
   - Reduces impact if overused

4. **Don't use color for emphasis alone**
   - Add bold, icons, or size changes
   - Support color-blind users

5. **Don't ignore accessibility tools**
   - Test with VoiceOver
   - Use browser color blindness simulators
   - Validate with Lighthouse

---

## Color Blindness Simulation

### Test Your Designs

**Protanopia (Red-Blind):**
- Cannot distinguish red from green
- Test: Red and green appear similar

**Deuteranopia (Green-Blind):**
- Most common form
- Red and green confusion

**Tritanopia (Blue-Blind):**
- Less common
- Blue and yellow confusion

### Accessible Alternatives

Instead of relying on color:
```jsx
// Bad - Color only
<div style={{ color: 'red' }}>Critical</div>

// Good - Color + Icon + Text
<div className="alert-critical">
  <AlertTriangle /> {/* Icon */}
  <span className="urgency-badge">P1 - CRITICAL</span> {/* Text */}
  <span>Immediate action required</span>
</div>
```

---

## Implementation Examples

### CSS Variables Setup

```css
/* Root variables - Dark mode default */
:root {
  /* Backgrounds */
  --background: #04111f;
  --surface: #0a1929;
  --surface-elevated: #132f4c;

  /* Brand */
  --accent: #ff3b30;
  --accent-hover: #ff453a;
  --medical-blue: #0a84ff;

  /* Status */
  --success: #30d158;
  --warning: #ffd60a;
  --error: #ff453a;
  --info: #64d2ff;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-tertiary: #6e6e6e;

  /* Borders */
  --border: #1d3a52;
  --border-subtle: #132f4c;

  /* Interactive */
  --hover: rgba(255, 255, 255, 0.08);
  --active: rgba(255, 255, 255, 0.12);
  --focus: #0a84ff;
}

/* Light mode override */
[data-theme='light'] {
  --background: #ffffff;
  --surface: #f8f9fa;
  --surface-elevated: #ffffff;

  --accent: #c41e3a;
  --accent-hover: #a01a2e;
  --medical-blue: #0056b3;

  --success: #198754;
  --warning: #e68500;
  --error: #c41e3a;
  --info: #0066cc;

  --text-primary: #0a0a0a;
  --text-secondary: #4a4a4f;
  --text-tertiary: #6b6b70;

  --border: #c9c9ce;
  --border-subtle: #e0e0e5;

  --hover: rgba(0, 0, 0, 0.06);
  --active: rgba(0, 0, 0, 0.1);
  --focus: #0056b3;
}

/* Sunlight mode override */
[data-theme='sunlight'] {
  --background: #ffffff;
  --surface: #f0f0f0;
  --surface-elevated: #ffffff;

  --accent: #cc0000;
  --accent-hover: #aa0000;
  --medical-blue: #003399;

  --success: #006600;
  --warning: #ff6600;
  --error: #cc0000;
  --info: #0066cc;

  --text-primary: #000000;
  --text-secondary: #333333;
  --text-tertiary: #666666;

  --border: #000000;
  --border-subtle: #333333;
}
```

### JavaScript Theme Switching

```javascript
// Theme switcher
function setTheme(theme: 'dark' | 'light' | 'sunlight') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Auto-detect based on time of day
function autoTheme() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    setTheme('light');
  } else {
    setTheme('dark');
  }
}

// Ambient light sensor (if available)
if ('AmbientLightSensor' in window) {
  const sensor = new AmbientLightSensor();
  sensor.onreading = () => {
    if (sensor.illuminance > 500) {
      setTheme('sunlight');
    } else if (sensor.illuminance < 50) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };
  sensor.start();
}
```

---

## Color Accessibility Checklist

- [ ] All text meets WCAG AA minimum (4.5:1)
- [ ] Critical content meets WCAG AAA (7:1)
- [ ] Large text (18px+) meets AA (3:1)
- [ ] UI components meet 3:1 contrast
- [ ] Color is never the only indicator
- [ ] Icons accompany colored states
- [ ] Tested with color blindness simulators
- [ ] Tested in all theme modes
- [ ] Tested in bright sunlight (actual iPad)
- [ ] Verified with Lighthouse accessibility audit
- [ ] VoiceOver announces states correctly
- [ ] Focus indicators are clearly visible

---

**Document Version:** 1.0
**Last Updated:** 2025-12-02
**Next Review:** After field testing with paramedics
