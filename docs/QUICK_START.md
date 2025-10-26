# Medic-Bot Quick Start Guide
## For LA County Fire Department Paramedics

---

## Getting Started in 5 Minutes

### 1. Access the App
**Web Browser**: Navigate to your deployment URL
- Desktop: Chrome, Edge, Firefox, Safari
- Mobile: Any modern mobile browser
- Tablet: iPad Safari, Android Chrome

**Install as PWA** (Recommended for Offline Use):
- See [PWA Installation Guide](#pwa-installation) below

---

## Core Features

### Chat with the AI Assistant
1. Type your question in the chat input box
2. Ask about:
   - Protocols ("Chest pain protocol")
   - Medications ("Epinephrine dose for cardiac arrest")
   - Treatments ("How to manage anaphylaxis")
   - Procedures ("Needle decompression landmarks")
3. Press **Enter** or click **Send**
4. Get instant responses with protocol citations

**Pro Tip**: Use **Ctrl+Enter** or **Cmd+Enter** to send quickly

---

## Keyboard Shortcuts (Power Users)

### Essential Shortcuts

| Key | Action | Use Case |
|-----|--------|----------|
| **`?`** | Show shortcuts help | Learn all keyboard commands |
| **`s`** | Open settings | Adjust font size, theme, accessibility |
| **`Esc`** | Close panels/modals | Quick dismiss of overlays |
| **`/`** or **`Cmd+K`** | Focus chat input | Jump to search without mouse |

### Navigation Shortcuts

| Key | Action | Where It Goes |
|-----|--------|---------------|
| **`n`** | New conversation | Clear chat history, start fresh |
| **`d`** | Dosing calculator | Weight-based medication dosing |
| **`p`** | Protocols page | View protocol decision trees |

### Message Shortcuts

| Key | Action | When to Use |
|-----|--------|-------------|
| **`Ctrl+Enter`** | Send message | Hands-free message submission |
| **`Esc`** | Clear input | Cancel current message |

---

## Settings Panel

### How to Access
- **Keyboard**: Press **`s`**
- **Mouse**: Click the settings icon (gear) in header

### Available Settings

#### Font Size
Adjust text size for readability in the field:
- **Normal** (default) - Standard desktop/mobile
- **Large** - Better for moving ambulances
- **Extra Large** - Maximum readability for aging eyes

**Recommended**: Large or Extra Large for field use

#### Theme
Change appearance based on lighting conditions:
- **Light Mode** - Bright outdoor daylight
- **Dark Mode** - Ambulance interiors at night
- **High Contrast** - Maximum readability for visual impairments

**Pro Tip**: Dark mode saves battery on OLED screens

#### Reduced Motion
Disable animations for accessibility:
- **OFF** (default) - Smooth animations
- **ON** - Minimal motion for vestibular disorders

**Who Needs This**: Users sensitive to motion or dizziness

#### Settings Persistence
All settings automatically save to your browser. They persist:
- Across sessions (reopening browser)
- After updates
- On the same device

**Note**: Settings are device-specific, not account-based

---

## PWA Installation

### Why Install as PWA?
- **Offline Access**: 100% functionality without internet
- **Faster Loading**: Cached app loads instantly
- **Home Screen Icon**: Launch like a native app
- **No App Store**: Install directly from browser
- **Always Updated**: Auto-updates when online

### Desktop Installation (Chrome/Edge)

#### Method 1: PWA Prompt
1. Open Medic-Bot in Chrome/Edge
2. Look for install banner at top of page
3. Click **Install** button
4. Confirm installation in popup
5. App opens in standalone window
6. Find app icon on desktop or taskbar

#### Method 2: Browser Menu
1. Open Medic-Bot URL
2. Click **three-dot menu** (⋮) in top-right
3. Select **"Install Medic-Bot"**
4. Confirm installation
5. Launch from desktop icon

### Mobile Installation (iOS Safari)

#### iPhone/iPad Steps
1. Open Medic-Bot in Safari
2. Tap **Share** button (box with arrow up)
3. Scroll down, tap **"Add to Home Screen"**
4. Edit name (optional): "Medic-Bot"
5. Tap **Add** in top-right
6. Icon appears on home screen
7. Launch like any app

**Note**: iOS Safari is the ONLY browser that supports PWA installation on iPhone

### Mobile Installation (Android Chrome)

#### Android Steps
1. Open Medic-Bot in Chrome
2. Look for **"Add to Home Screen"** banner
3. Tap **Install**
4. OR: Tap **three-dot menu** → **"Add to Home Screen"**
5. Confirm installation
6. Icon appears on home screen
7. Launch like any app

### Verify Offline Mode
1. Install PWA using steps above
2. Open installed app
3. Turn off WiFi/Cellular data
4. App should still work
5. Chat, dosing calculator, protocols all functional
6. Knowledge base cached locally

**Troubleshooting**: If offline doesn't work, go online once to cache KB

---

## Common Tasks

### Calculate Medication Dose
1. Press **`d`** or navigate to **Dosing** page
2. Select medication (e.g., Epinephrine)
3. Enter patient weight in kg
4. Select scenario (e.g., Cardiac Arrest)
5. View calculated dose with route

**Available Calculators**: 17 medications
- Epinephrine (IM, IV, Push-Dose)
- Atropine
- Midazolam (IV, IM, IN)
- Calcium Chloride
- Sodium Bicarbonate
- Normal Saline Bolus
- And more...

### View Protocol Decision Trees
1. Press **`p`** or navigate to **Protocols** page
2. Browse available protocols:
   - Cardiac Arrest (Protocol 1210)
   - Trauma Triage
   - More coming soon
3. Click protocol card to view decision tree
4. Follow step-by-step clinical guidance

### Get Help
1. Press **`?`** to see all keyboard shortcuts
2. Check FAQ at bottom of any page
3. Report issues via support contact

---

## Tips for Field Use

### In the Ambulance
- **Install PWA**: Ensures offline access
- **Use Dark Mode**: Better for night shifts
- **Increase Font Size**: Easier to read while moving
- **Enable Reduced Motion**: Prevents motion sickness
- **Pin to Taskbar/Home Screen**: One-tap access

### On Scene
- **Voice Input**: Use browser's voice-to-text for hands-free queries
- **Quick Shortcuts**: Memorize `d` (dosing), `p` (protocols)
- **Offline Mode**: Works without cell signal if pre-cached

### During Transport
- **Streaming Responses**: See answers appear in real-time
- **Citation Links**: Tap protocol references for source details
- **Copy/Paste**: Long-press to copy dosing info for ePCR

---

## Troubleshooting

### App Won't Load
1. Check internet connection
2. Clear browser cache: Settings → Privacy → Clear Data
3. Try incognito/private mode
4. Verify URL is correct
5. Check `/api/health` endpoint status

### Settings Not Saving
1. Enable browser cookies/storage
2. Check browser isn't in private mode
3. Verify sufficient storage space
4. Try different browser

### Offline Mode Not Working
1. Go online and open app once
2. Wait for knowledge base to download (11MB)
3. Check browser storage permissions
4. Reinstall PWA if necessary

### Keyboard Shortcuts Not Working
1. Make sure focus is on app window
2. Try clicking page first
3. Check for browser extension conflicts
4. Press `?` to verify shortcuts are active

### Slow Performance
1. Check `/api/metrics` for latency
2. Clear browser cache
3. Reduce font size setting
4. Disable animations (Reduced Motion ON)
5. Close other browser tabs

---

## Important Reminders

### Medical Disclaimer
This tool is **for educational reference only**. It does not replace:
- Official prehospital training
- Command authority (Base Hospital)
- Licensed paramedic judgment
- LA County EMS protocols (official version)

All clinical decisions must be made by licensed paramedics in accordance with current LA County protocols and base hospital orders.

### Privacy & HIPAA
- **No PHI**: Never enter patient names, MRNs, or identifying info
- **Anonymous Queries**: Only medical scenarios tracked
- **No Logging**: Query text not saved (only metadata)
- **Secure**: All traffic encrypted (HTTPS)

### Reporting Issues
If you find incorrect medical information:
1. **DO NOT** rely on it for patient care
2. Contact medical director immediately
3. Include exact query and response
4. Note date/time of incident
5. Use official protocols as backup

---

## Next Steps

### Learn More
- **Full Documentation**: See [README.md](../README.md)
- **Technical Architecture**: See [docs/technical-architecture.md](./technical-architecture.md)
- **Deployment Guide**: See [docs/deployment-checklist.md](./deployment-checklist.md)

### Get Involved
- **Provide Feedback**: Contact project lead
- **Report Bugs**: Create issue on GitHub
- **Request Features**: Submit enhancement request

---

## Quick Reference Card

**Print and laminate this section for field reference**

```text
MEDIC-BOT KEYBOARD SHORTCUTS
═══════════════════════════════════════

HELP & SETTINGS
  ?         Show this help
  s         Open settings
  Esc       Close panels

NAVIGATION
  n         New conversation
  d         Dosing calculator
  p         Protocols page
  /         Focus search
  Cmd+K     Focus search (Mac)

MESSAGING
  Ctrl+Enter   Send message
  Esc          Clear input

SETTINGS PANEL
  Font Size:     Normal | Large | Extra Large
  Theme:         Light | Dark | High Contrast
  Reduced Motion: OFF | ON

PWA INSTALL
  Desktop:  Menu → Install Medic-Bot
  iPhone:   Share → Add to Home Screen
  Android:  Menu → Add to Home Screen

OFFLINE MODE: Install PWA for 100% offline access
```

---

**Version**: 2.0.0
**Last Updated**: October 26, 2025
**Classification**: LA County Fire Department Internal Use

For questions or support, contact your medical director or project lead.
