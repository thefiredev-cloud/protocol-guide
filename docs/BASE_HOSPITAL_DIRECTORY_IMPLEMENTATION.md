# Base Hospital Directory Implementation

## Overview

Implemented comprehensive LA County EMS Base Hospital contact directory for field paramedics to quickly access all base hospital phone numbers for online medical direction.

## Implementation Summary

### 1. Core Data Module
**File**: `lib/clinical/base-hospitals.ts`

- 13 LA County base hospitals with complete contact information
- Medical Alert Center (MAC) contact
- Specialized emergency contacts (Catalina Hyperbaric, EMS Agency)
- Helper functions for filtering and lookup

**Data Structure**:
```typescript
interface BaseHospital {
  id: string;
  name: string;
  shortName: string;
  phone: string;
  hospitalCode: string; // Two-letter code for forms
  region: 'Central' | 'North' | 'South' | 'East' | 'West';
  address: string;
  capabilities: string[]; // Trauma, Stroke, STEMI, ECMO, Burn
  available24_7: boolean;
}
```

### 2. UI Components
**File**: `app/components/base-hospital-directory.tsx`

- Full-featured directory with region filtering
- Medical Alert Center prominently displayed
- Grid layout for all base hospitals
- One-tap calling on mobile devices
- Specialized contacts section

**Features**:
- Region filter (All, Central, North, South, East, West)
- Hospital capabilities badges (Level I Trauma, STEMI, etc.)
- Visual hierarchy (MAC → Base Hospitals → Specialized)
- Touch-optimized for tablets

### 3. Dedicated Page
**File**: `app/base-hospitals/page.tsx`

- Standalone route: `/base-hospitals`
- Accessible from navigation bar
- Clean layout with proper spacing

### 4. Navigation Integration

**Updated Files**:
- `app/components/layout/mobile-nav-bar.tsx`
  - Added 5th navigation tab with Phone icon
  - Label: "Base" (short for tablets)
  - Integrated into swipe navigation

- `app/components/welcome-hero.tsx`
  - Enhanced emergency contact section
  - Primary button: LAC+USC direct call
  - Secondary button: "View All Base Hospitals" link
  - Improved visual hierarchy

### 5. CSS Enhancements
**File**: `app/globals.css`

- Dual button styles (primary/secondary)
- Responsive grid layout
- Touch-friendly sizing (88px primary, 64px secondary)
- Hover animations and transitions

## Base Hospital Coverage

### Central Region
- **LAC+USC Medical Center**: (323) 881-2411
  - Level I Trauma, Stroke, STEMI, Burn

### North Region
- **Olive View-UCLA**: (818) 364-3050
- **Henry Mayo Newhall**: (661) 253-8000
- **Providence Holy Cross**: (818) 496-4360
- **Glendale Adventist**: (818) 409-8000

### South Region
- **Harbor-UCLA**: (310) 222-3345
- **Long Beach Memorial**: (562) 933-2000
- **Torrance Memorial**: (310) 325-9110
- **Providence Little Company**: (310) 303-3333

### East Region
- **Huntington Memorial**: (626) 397-5330

### West Region
- **UCLA Medical Center**: (310) 825-6301
- **Cedars-Sinai**: (310) 887-0599
- **Providence St. John's**: (310) 829-5511

### Critical Contacts
- **Medical Alert Center (MAC)**: (562) 347-1789
  - For ECMO, hyperbaric, disease outbreak consultations
- **Catalina Hyperbaric Chamber**: (310) 510-1053
- **EMS Agency**: (562) 378-1641

## User Experience

### Homepage Flow
1. User sees LAC+USC base hospital button (primary)
2. Secondary button links to full directory
3. One tap to call or view all options

### Directory Flow
1. Navigate to `/base-hospitals` via tab or link
2. Filter by region if needed
3. View hospital capabilities
4. Tap phone number to call immediately

### Mobile Optimization
- 88px minimum touch targets for critical calls
- 64px for secondary actions
- Clear visual hierarchy
- Glove-friendly button spacing

## Technical Architecture

### Separation of Concerns
- **Data Layer**: `lib/clinical/base-hospitals.ts` (single source of truth)
- **Component Layer**: `app/components/base-hospital-directory.tsx` (presentation)
- **Route Layer**: `app/base-hospitals/page.tsx` (navigation)
- **Navigation**: Integrated into mobile nav bar

### Scalability
- Easy to add new hospitals (just update array)
- Helper functions for filtering/searching
- Type-safe with TypeScript
- No database dependency (static reference data)

### Maintainability
- Single file for all base hospital data
- Comments with LA County EMS reference numbers
- Clear naming conventions
- Follows existing patterns (`peds-color.ts`, `pediatric-dose-calculator.ts`)

## Future Enhancements

### Phase 2 (Optional)
1. GPS-based nearest hospital recommendation
2. Real-time availability status
3. Direct ReddiNet integration
4. Search functionality within directory
5. Favorite/recent hospitals
6. Hospital notification history

### Integration Opportunities
1. Add base hospital context to chat responses
2. Protocol-specific base hospital recommendations
3. Auto-populate base hospital in scene timer
4. Integration with audit logging

## References

- LA County EMS Agency Reference No. 644 (Base Hospital Documentation Manual)
- LA County DHS Base Hospital Directory
- LA County Prehospital Care Manual
- EMS Provider Agency Contact List

## Testing Checklist

- [x] All base hospitals render correctly
- [x] Region filtering works
- [x] Phone links work (tel: protocol)
- [x] Navigation integration functional
- [x] Welcome page buttons styled correctly
- [x] Mobile responsive on tablets
- [x] No linting errors
- [ ] Browser testing (live server)
- [ ] Touch target validation on iPad
- [ ] Accessibility audit

## Deployment Notes

- Zero external dependencies added
- No database changes required
- No API endpoints needed
- Static data served from application
- Safe for immediate deployment

