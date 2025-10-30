# Chat Input Button Layout - Visual Guide

## Desktop View (>= 768px)

### Default State (All Buttons Closed)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Ask about LA County protocols, medications, procedures...         │ ← Textarea
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                           ╭─────────┤
│                                    [Chat ▼] [Voice] [Narrative ▼] │
│                                                           ╰─────────┤
└────────────────────────────────────────────────────────────────────┘

Button Details:
- [Chat ▼]      : Red gradient bg, white text, dropdown indicator
- [Voice]       : Light gray bg, gray icon, square (48x48)
- [Narrative ▼] : Red gradient bg, white text, dropdown indicator
```

### Chat Dropdown Open

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Ask about LA County protocols, medications, procedures...         │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                        ╔════════════════════════╗ │
│  [Chat ▲]  [Voice]  [Narrative ▼]     ║ 💬 Send Message        ║ │
│                                        ║ 🎤 Stop Voice Input    ║ │
│                                        ╚════════════════════════╝ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Dropdown Styling:
- Width: Matches button width
- Position: Below button
- Shadow: 3-layer professional shadow
- Border: 1px solid light gray
- Animation: Smooth slide-down
```

### Narrative Dropdown Open

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Ask about LA County protocols, medications, procedures...         │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  [Chat ▼]  [Voice]  [Narrative ▲]     ╔══════════════════════════╗│
│                                        ║ 📄 Build Full Narrative  ║│
│                                        ║ 📄 SOAP Format           ║│
│                                        ║ 📄 Chronological Format  ║│
│                                        ╚══════════════════════════╝│
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Dropdown Items:
1. Build Full Narrative - SOAP + Chrono + NEMSIS + Care Plan
2. SOAP Format - Subjective, Objective, Assessment, Plan
3. Chronological Format - Timeline-based narrative

Each item has:
- Left icon (FileText)
- Label text
- Hover: Cyan tint background + blue text
```

---

## Mobile View (< 768px)

### Default Collapsed State

```
┌──────────────────────────────────────┐
│ Ask about LA County protocols...      │
│                                      │
├──────────────────────────────────────┤
│ [Chat ▼] [Voice] [Narrative ▼]      │
│                                      │
│        ╭─ Show more ─╮               │
│        │   🔼 ChevUp │               │
│        ╰─────────────╯               │
└──────────────────────────────────────┘

Mobile Layout:
- 3 equal columns
- Responsive grid
- Buttons wrap if needed
- Touch targets: 48x48px minimum
```

### Mobile Chat Dropdown

```
┌──────────────────────────────────────┐
│ Ask about LA County protocols...      │
│                                      │
├──────────────────────────────────────┤
│ [Chat ▲] [Voice] [Narrative ▼]      │
│                                      │
│ ╔──────────────────────────────────╗ │
│ ║ 💬 Send Message                  ║ │
│ ╠──────────────────────────────────╣ │
│ ║ 🎤 Stop Voice Input              ║ │
│ ╚──────────────────────────────────╝ │
│                                      │
└──────────────────────────────────────┘

Mobile Dropdown:
- Full width (-16px padding)
- Pop-up from bottom
- Fixed positioning
- Rounded top corners
- Dark overlay behind
```

---

## Button States

### Default Button

```
┌──────────────┐
│ 💬 Chat  ▼   │  ← Standard red gradient
│              │     White text
│ 20x16  20x20 │     Icons: 18px
└──────────────┘
```

### Button Hover

```
┌──────────────┐
│ 💬 Chat  ▼   │  ← Enhanced shadow
│              │     Slight translate up (-2px)
│ 20x16  20x20 │     More vivid shadow
└──────────────┘
```

### Button Active/Pressed

```
┌──────────────┐
│ 💬 Chat  ▼   │  ← Reduced shadow
│              │     Back to normal position
│ 20x16  20x20 │     Subtle press effect
└──────────────┘
```

### Voice Button Default

```
┌──────────┐
│    🎤    │  ← Light gray bg
│          │     Gray icon
└──────────┘   48x48px (square)
```

### Voice Button Listening

```
┌──────────┐
│    🎤●   │  ← Cyan gradient bg
│          │     Blue icon
└──────────┘   48x48px
   ● = pulsing indicator dot
       (top-right corner, 8x8px)
```

---

## Dropdown Item States

### Default Item

```
┌──────────────────────────────┐
│ 💬 Send Message              │  ← Dark gray text
│                              │     No background
│  16x16   12px gap   ~150px   │
└──────────────────────────────┘
```

### Item Hover

```
┌──────────────────────────────┐
│ 💬 Send Message              │  ← Blue text
│                              │     Light cyan bg
│  16x16   12px gap   ~150px   │     rgba(56,189,248,0.1)
└──────────────────────────────┘
```

### Item Active

```
┌──────────────────────────────┐
│ 💬 Send Message              │  ← Blue text
│                              │     Darker cyan bg
│  16x16   12px gap   ~150px   │     rgba(56,189,248,0.05)
└──────────────────────────────┘
```

---

## Spacing & Dimensions

### Button Dimensions

```
Regular Buttons (Chat, Narrative):
┌─────────────────────┐
│ 48px                │ ← Height
│ 0 16px padding      │ ← Padding
│ ~90px width         │ ← Approx width (flexible with label)
│ 12px border-radius  │
└─────────────────────┘

Voice Button:
┌──────────┐
│ 48x48px  │ ← Square
│ padding: 0│
│ grid     │
│ place-   │
│ items:   │
│ center   │
└──────────┘
```

### Dropdown Menu

```
Position: absolute
Top: 100% (below button)
Left: 0
Right: 0
Margin-top: 8px
Border-radius: 12px
Width: Same as button (100%)
Z-index: 100
```

### Gap Between Buttons

```
Desktop: 12px
Mobile: 8px (grid gap)
```

---

## Color Palette

### Action Buttons
```
Background: linear-gradient(180deg, #c41e3a 0%, #8b1a2e 100%)
   ↓ Hover
   Darker shadow, slight translate up

Text: #ffffff (white)
```

### Voice Button
```
Default Background: var(--surface-elevated) → Light gray/white
Default Border: 1px solid var(--border) → Light gray
Default Icon Color: var(--muted) → Gray

Listening Background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%)
Listening Icon Color: #04111f (dark)
Listening Border: var(--accent) → Cyan
```

### Dropdown Menu
```
Background: var(--surface-elevated) → Light gray/white
Border: 1px solid var(--border) → Light gray
Shadow: 0 4px 6px rgba(0,0,0,0.1),
        0 10px 20px rgba(0,0,0,0.08),
        0 15px 40px rgba(0,0,0,0.06)
```

### Dropdown Items
```
Text: var(--text-primary) → Dark gray/black

Hover Background: rgba(56, 189, 248, 0.1) → Very light cyan
Hover Text: var(--accent) → Cyan (#38bdf8)

Active Background: rgba(56, 189, 248, 0.05) → Even lighter cyan
Active Text: var(--accent) → Cyan

Disabled: 50% opacity
```

---

## Icons Used

```
💬 MessageCircle     - Chat button, Send dropdown
🎤 Mic               - Voice button, Voice dropdown
📄 FileText          - Narrative button, Narrative dropdowns
🔽 ChevronDown       - Dropdown indicators (rotates 180° when open)
```

All icons from: `lucide-react` package
Size: 18px on buttons, 16px in dropdowns

---

## Animations

### Dropdown Appearance
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
Duration: 200ms
Timing: ease-out
```

### Voice Recording Pulse
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
Duration: 2s
Iteration: infinite
Applied to: .voice-recording-indicator (8x8px dot)
```

### Button Transitions
```css
transition: transform 0.15s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
```

---

## Accessibility Features

### Aria Labels
```tsx
<button aria-label="Send message" aria-expanded={showChatDropdown}>
  Chat
</button>

<button aria-label="Voice input toggle" aria-pressed={listening}>
  Voice
</button>

<button aria-label="Build narrative" aria-expanded={showNarrativeDropdown}>
  Narrative
</button>
```

### Keyboard Navigation
- Tab: Move between buttons
- Enter/Space: Activate button or toggle dropdown
- Escape: Close dropdown
- Arrow Keys: Navigate within dropdown

### Focus Indicators
All buttons have `:focus-visible` states with proper outline

### Color Independence
Status is not communicated by color alone:
- Voice listening has animated pulse indicator DOT
- Not just color change

---

## Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 768px) {
  Display: Flex
  Gap: 12px
  Alignment: flex-end (right)
  Buttons: Full-width with labels
}

/* Mobile */
@media (max-width: 767px) {
  Display: Grid (3 columns)
  Gap: 8px
  Buttons: Equal width
  Icons only might show on very small screens
  Dropdowns: Bottom popup style
}
```

---

## Summary

The new layout achieves:
✅ **Decluttered** - Separated into 3 distinct button groups
✅ **Intuitive** - Clear visual grouping by function
✅ **Professional** - Consistent styling and spacing
✅ **Accessible** - Full ARIA support
✅ **Responsive** - Works on all screen sizes
✅ **Modern** - Smooth animations and hover states
✅ **Efficient** - Quick voice access without menu navigation
