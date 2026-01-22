# Protocol Guide - Mobile App Interface Design

## Overview

Protocol Guide is a clinical decision support tool for US EMS professionals. The app provides retrieval-only access to EMS protocols with semantic search, ensuring every response cites source protocols. The design follows Apple Human Interface Guidelines for a native iOS feel.

---

## Screen List

### 1. Welcome/Auth Screen
- Entry point for unauthenticated users
- Sign up / Login options via Manus OAuth
- App branding and value proposition

### 2. Home Screen (Main Chat Interface)
- Primary interaction screen after authentication
- County selector in header
- Chat area with protocol responses
- Text input with voice button and send button

### 3. County Selector Modal
- Searchable dropdown grouped by state
- Shows current selection
- Quick access to recently used counties

### 4. Profile/Settings Screen
- User account information
- Current tier display (Free/Pro/Enterprise)
- Query usage stats for the day
- Logout option
- Dark mode toggle

---

## Primary Content and Functionality

### Home Screen (Chat Interface)
**Header:**
- App logo (left)
- County selector button with current county name (center)
- Profile avatar/icon (right)

**Chat Area (scrollable):**
- Response cards displaying:
  - Protocol number and title
  - Concise answer (2-4 sentences)
  - Actions list (bullet points)
  - Reference citation
- Empty state: "Ask about any EMS protocol"
- Loading state: Animated typing indicator

**Input Area (fixed bottom):**
- Voice input button (microphone icon)
- Text input field with placeholder "Ask about a protocol..."
- Send button (disabled when empty)
- Keyboard-aware positioning

### County Selector Modal
- Search input at top
- Grouped list by state (alphabetical)
- Each county shows:
  - County name
  - Protocol version
  - Checkmark if currently selected

### Profile Screen
- User avatar and name
- Email address
- Tier badge (Free/Pro/Enterprise)
- Usage card: "X of 10 queries used today" (for Free tier)
- Settings options:
  - Dark mode toggle
  - Logout button

---

## Key User Flows

### Flow 1: First-Time User Onboarding
1. User opens app → Welcome screen
2. User taps "Sign In" → OAuth flow
3. After auth → Home screen with county selector prompt
4. User selects county → Ready to query

### Flow 2: Protocol Query
1. User on Home screen
2. User types question OR taps voice button
3. Voice: Records audio → Transcribes → Shows in input
4. User taps Send
5. Loading indicator appears
6. Response card animates in with:
   - Protocol citation
   - Answer content
   - Action items
7. User can scroll to see previous queries

### Flow 3: Change County
1. User taps county selector in header
2. Modal slides up with search
3. User searches or scrolls to find county
4. User taps county → Modal closes
5. Chat clears with confirmation message
6. Ready for new queries

### Flow 4: Check Usage (Free Tier)
1. User taps profile icon
2. Profile screen shows usage: "7 of 10 queries used today"
3. If limit reached, upgrade prompt shown

---

## Color Choices

### Light Mode
| Element | Color | Hex |
|---------|-------|-----|
| Background | Off-white | #F8FAFC |
| Surface/Cards | White | #FFFFFF |
| Primary (EMS Red) | Red | #DC2626 |
| Headlines | Dark slate | #1E293B |
| Body text | Gray | #64748B |
| Border | Light gray | #E2E8F0 |
| Success | Green | #22C55E |
| Warning | Amber | #F59E0B |
| Error | Red | #EF4444 |

### Dark Mode
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark navy | #1A1F2E |
| Surface/Cards | Dark gray | #242938 |
| Primary (EMS Red) | Red | #DC2626 |
| Headlines | Off-white | #F1F5F9 |
| Body text | Gray | #94A3B8 |
| Border | Dark slate | #334155 |
| Success | Light green | #4ADE80 |
| Warning | Light amber | #FBBF24 |
| Error | Light red | #F87171 |

---

## Typography

- **Headlines**: Inter 600 (semibold)
- **Body**: Inter 400 (regular)
- **Protocol titles**: 18px semibold
- **Response text**: 16px regular
- **Captions/Labels**: 14px regular

---

## Component Specifications

### Response Card
- Background: surface color
- Border radius: 16px
- Border: 1px solid border color
- Padding: 20px
- Shadow: subtle (light mode only)

### Buttons
- Primary: EMS Red (#DC2626), white text
- Border radius: fully rounded (9999px)
- Min height: 48px (touch target)
- Padding: 12px 24px

### Input Field
- Background: surface color
- Border radius: 24px
- Border: 1px solid border color
- Height: 48px
- Padding: 12px 16px

### Voice Button
- Circular, 48px diameter
- Background: surface color
- Icon: microphone
- Active state: EMS Red background

---

## Spacing System

- Section padding: 48px (top/bottom)
- Card padding: 20px
- Component gap: 16px
- Screen horizontal padding: 16px

---

## Accessibility

- All interactive elements: minimum 48px touch target
- Color contrast: WCAG AA compliant
- Voice input for hands-free operation
- Clear visual hierarchy
- Loading states for all async operations
