# Landing Page Fix Plan for Claude Code

## CRITICAL: READ THIS ENTIRE DOCUMENT BEFORE MAKING ANY CHANGES

---

## CURRENT STATUS (Updated Jan 21, 2026)

### ✅ COMPLETED:
- [x] Light theme forced in `lib/theme-provider.tsx` (line 16: `useState<ColorScheme>("light")`)
- [x] Branding uses "Protocol Guide"

### ❌ NOT DONE - MUST BE IMPLEMENTED:
- [ ] **Hero section** - Current version is WRONG. Must have "Seconds Save Lives." headline
- [ ] **Simulation section** - DOES NOT EXIST. Must create `components/landing/simulation-section.tsx`
- [ ] **Time calculator section** - DOES NOT EXIST. Must create `components/landing/time-calculator-section.tsx`
- [ ] **Features section** - Wrong content. Must match the 3 specific features below
- [ ] **Email capture CTA** - Current sign-in section is WRONG. Replace with email capture
- [ ] **Footer** - DOES NOT EXIST. Must create `components/landing/footer-section.tsx`
- [ ] **Remove pricing section** - Delete or replace `pricing-section.tsx`

---

## Development Environment

Docker Desktop is working. Use Docker for development:

```bash
# Start dev server (runs on port 8081)
docker-compose --profile dev up dev

# Or run both API + Web separately:
docker-compose up api web

# Landing page URL:
# http://localhost:8081/landing
```

**After making changes, verify at:** `http://localhost:8081/landing`

---

## Target Design - MUST MATCH EXACTLY

### SECTION 1: HERO
**File:** `components/landing/hero-section.tsx` (REWRITE COMPLETELY)

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Protocol Guide          Speed Test   Impact   [Request Access] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Seconds Save Lives.                            │
│              (black text, "Lives." in RED #DC2626)          │
│                                                             │
│         Why waste 90 of them searching?                     │
│                                                             │
│    The modern protocol retrieval tool for EMS.              │
│    2 seconds to find what you need. Not 2 minutes.          │
│                                                             │
│              [ See the Difference → ]                       │
│              (RED button #DC2626, white text)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
Background: White with very light pink gradient (#FEF2F2)
```

### SECTION 2: SIMULATION (The Cognitive Load Gap)
**File:** `components/landing/simulation-section.tsx` (CREATE NEW)

```
┌─────────────────────────────────────────────────────────────┐
│                    LIVE SIMULATION                          │
│                 (red uppercase label)                       │
│                                                             │
│              The Cognitive Load Gap                         │
│                                                             │
│   Click "Simulate Call" to visualize the time difference    │
│            in a cardiac arrest scenario.                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Protocol Retrieval Time         [▶ Simulate Call]    │  │
│  │ Status: Waiting to start...                          │  │
│  │                                                       │  │
│  │ Manual Search  ████████████████████████░░░░░░░░░░░░  │  │
│  │                (YELLOW #F59E0B bar, animates to 47%) │  │
│  │                                                       │  │
│  │ Protocol Guide ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │                (RED #DC2626 bar, animates to 2.5%)   │  │
│  │                                                       │  │
│  │ 0    10    20    30    40    50    60    70    80  95│  │
│  │                   Seconds Elapsed                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ CURRENT STANDARD    │  │ PROTOCOL GUIDE      │          │
│  │ ~90s                │  │ 2.3s                │          │
│  │ PDF Scrolling /     │  │ Natural Language AI │          │
│  │ App Fumbling        │  │ (red tinted bg)     │          │
│  └─────────────────────┘  └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
Background: Light gray #F8FAFC
```

**Animation Logic:**
```typescript
// When "Simulate Call" clicked:
// 1. Status: "Simulating..."
// 2. Manual Search bar: animate width from 0% to 47% over 4 seconds
// 3. Protocol Guide bar: animate width from 0% to 2.5% over 0.1 seconds
// 4. Status: "Complete"
// 5. Button changes to "Reset"
```

### SECTION 3: TIME CALCULATOR
**File:** `components/landing/time-calculator-section.tsx` (CREATE NEW)

```
┌─────────────────────────────────────────────────────────────┐
│                    DARK NAVY BACKGROUND (#0F172A)           │
│                                                             │
│   What is your time worth?                                  │
│   (WHITE text)                                              │
│                                                             │
│   Every second spent looking at a screen is a second        │
│   not looking at your patient. Calculate the impact of      │
│   switching to Protocol Guide for your department.          │
│                                                             │
│   Calls per Shift (Avg)                                     │
│   ○──────────────●────────────○                             │
│   1             10            20                            │
│                "10 Calls"                                   │
│                                                             │
│   ┌─────────────────────────────────────────────┐          │
│   │ TIME WASTED (CURRENT)                       │          │
│   │ 15.0 min                                    │          │
│   │ per shift staring at PDFs                   │          │
│   │                                             │          │
│   │ TIME RECLAIMED (PROTOCOL GUIDE)             │          │
│   │ 14.6 min (GREEN text)                       │          │
│   │ per shift returned to patient care          │          │
│   └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

**Calculation Logic:**
```typescript
const timeWasted = (calls * 90) / 60;  // minutes
const timeReclaimed = (calls * (90 - 2.3)) / 60;  // minutes
// Display with 1 decimal place
```

### SECTION 4: FEATURES
**File:** `components/landing/features-section.tsx` (REWRITE)

```
┌─────────────────────────────────────────────────────────────┐
│                  Engineered for the Field                   │
│                                                             │
│   We removed the bloat. You get exactly what you need       │
│                    when the tones drop.                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ ⚡          │  │ 📡          │  │ 🔄          │         │
│  │ (pink bg)   │  │ (blue bg)   │  │ (blue bg)   │         │
│  │             │  │             │  │             │         │
│  │ Instant     │  │ 100%        │  │ Always      │         │
│  │ Retrieval   │  │ Offline     │  │ Current     │         │
│  │             │  │             │  │             │         │
│  │ Don't       │  │ Cell towers │  │ No more     │         │
│  │ memorize    │  │ go down.    │  │ outdated    │         │
│  │ page        │  │ Your        │  │ binders.    │         │
│  │ numbers...  │  │ protocols   │  │ When your   │         │
│  │             │  │ shouldn't.  │  │ Medical     │         │
│  │             │  │ ...         │  │ Director... │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
Background: White #FFFFFF
Cards: Light gray #F8FAFC with subtle border
```

**EXACT Feature Copy:**
1. **Instant Retrieval**: "Don't memorize page numbers. Type 'Pediatric seizure' or 'Chest pain' and get the exact protocol card instantly."
2. **100% Offline**: "Cell towers go down. Your protocols shouldn't. The entire database lives locally on your device. Zero latency."
3. **Always Current**: "No more outdated binders. When your Medical Director updates a protocol, it pushes to every device instantly."

### SECTION 5: EMAIL CAPTURE CTA
**File:** `components/landing/sign-in-section.tsx` (REWRITE or replace)

```
┌─────────────────────────────────────────────────────────────┐
│              Ready to upgrade your response?                │
│                                                             │
│   Join the medics and departments already switching         │
│              to the new standard of care.                   │
│                                                             │
│   ┌──────────────────────────┐  ┌─────────────────┐        │
│   │ Enter your work email    │  │ Get Early Access│        │
│   └──────────────────────────┘  └─────────────────┘        │
│                                  (RED button)               │
└─────────────────────────────────────────────────────────────┘
Background: Light #F8FAFC
```

### SECTION 6: FOOTER
**File:** `components/landing/footer-section.tsx` (CREATE NEW)

```
┌─────────────────────────────────────────────────────────────┐
│  © 2024 Protocol Guide. All rights reserved.    Privacy  Terms  Contact │
└─────────────────────────────────────────────────────────────┘
Background: White with top border
```

---

## Color Palette (USE THESE EXACT VALUES)

```typescript
const colors = {
  // Primary
  primaryRed: '#DC2626',      // CTA buttons, "Lives." text, Protocol Guide bar
  darkNavy: '#0F172A',        // Time calculator background, dark buttons

  // Backgrounds
  bgWhite: '#FFFFFF',
  bgLightGray: '#F8FAFC',
  bgLightPink: '#FEF2F2',     // Hero gradient

  // Text
  textBlack: '#0F172A',
  textGray: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  textGreen: '#10B981',       // Time reclaimed value

  // Chart
  chartYellow: '#F59E0B',     // Manual search bar
  chartRed: '#DC2626',        // Protocol Guide bar

  // Borders
  borderGray: '#E2E8F0',
};
```

---

## Files to Create/Modify

### CREATE (new files):
1. `components/landing/simulation-section.tsx`
2. `components/landing/time-calculator-section.tsx`
3. `components/landing/footer-section.tsx`

### REWRITE (completely replace content):
4. `components/landing/hero-section.tsx`
5. `components/landing/features-section.tsx`
6. `components/landing/sign-in-section.tsx` → rename to `email-capture-section.tsx`

### DELETE:
7. `components/landing/pricing-section.tsx` (remove from index.ts exports too)

### UPDATE:
8. `components/landing/index.ts` - update exports
9. `app/index.tsx` - update section order:
   - Hero
   - Simulation
   - TimeCalculator
   - Features
   - EmailCapture
   - Footer

---

## Implementation Order

1. **Create simulation-section.tsx** with animated bar chart
2. **Create time-calculator-section.tsx** with slider
3. **Rewrite hero-section.tsx** with "Seconds Save Lives."
4. **Rewrite features-section.tsx** with 3 specific features
5. **Rewrite sign-in-section.tsx** → email capture
6. **Create footer-section.tsx**
7. **Delete pricing-section.tsx**
8. **Update app/index.tsx** with new section order
9. **Test at http://localhost:8081/landing**

---

## DO NOT:
- Add dark mode toggle
- Use "Code 3 Protocols" branding
- Keep the pricing section
- Use OAuth sign-in buttons (use email capture instead)
- Skip creating the simulation or time calculator sections

## MUST DO:
- Use "Protocol Guide" everywhere
- Create ALL 6 sections as specified above
- Match the exact copy text provided
- Use the exact color values
- Make the simulation animation work
- Make the slider interactive with live calculations
