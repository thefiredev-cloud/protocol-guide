# Changelog

All notable changes to the LA County Fire Medic Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-26

### Added - Week 1: UX Enhancements & Production Hardening

#### 6 New User Experience Components
1. **ErrorBoundary Component** (`app/components/error-boundary.tsx`)
   - Graceful error handling with fallback UI
   - Automatic retry mechanism for transient failures
   - Prevents full app crashes from isolated component errors
   - Critical for field use in unreliable network conditions
   - User-friendly error messages with recovery options

2. **Toast Notification System** (`app/components/toast-notification.tsx`)
   - 4 notification types: success (green), error (red), warning (orange), info (blue)
   - Auto-dismissal after 5 seconds with manual close option
   - ARIA live regions for screen reader accessibility
   - Bottom-right positioning to avoid blocking critical content
   - Memory leak fix: Resolved stale closure in useCallback dependency

3. **Settings Panel** (`app/components/settings-panel.tsx`)
   - Font size adjustment: Normal, Large, Extra Large (improved readability in moving ambulances)
   - Theme selection: Light mode (outdoor daylight), Dark mode (ambulance interiors), High contrast (visual impairments)
   - Reduced motion toggle for vestibular disorder accessibility
   - Settings persist in localStorage across sessions
   - React Context integration for global state management
   - Keyboard shortcut: Press `s` to open

4. **Keyboard Shortcuts System** (`app/components/keyboard-shortcuts.tsx`)
   - `?` - Display keyboard shortcuts help modal
   - `/` or `Cmd+K` - Focus chat input for quick query entry
   - `n` - Start new conversation (clears chat history)
   - `d` - Navigate to dosing calculator page
   - `p` - Navigate to protocols page
   - `s` - Open settings panel
   - `Esc` - Close modals, dialogs, and overlays
   - `Ctrl+Enter` - Send message (hands-free submission)
   - Reduces mouse reliance, speeds up workflow for power users

5. **PWA Install Prompt** (`app/components/pwa-install-prompt.tsx`)
   - Smart one-time installation reminder for first-time users
   - 7-day dismissal period to prevent notification fatigue
   - Encourages offline-first PWA installation
   - Increases adoption for offline field deployment
   - Respectful UX: Won't nag users who decline

6. **Web Vitals Monitoring** (`app/components/web-vitals.tsx`)
   - Real-time performance tracking: CLS, INP, FCP, LCP, TTFB
   - Anonymous metrics sent to `/api/metrics` (no PHI)
   - Helps identify performance regressions
   - Optimizes for legacy devices (10+ year old smartphones)
   - Continuous performance improvement feedback loop

#### Settings Panel Integration & Architecture
- Created `RootLayoutContent` wrapper component (`app/components/layout/root-layout-content.tsx`)
- React Context provider for settings state management (replaced custom events)
- Event-driven architecture for 'open-settings' custom event
- Escape key handler for modal dismissal
- localStorage persistence for cross-session settings
- Comprehensive integration test suite

#### Public Access & Security
- Public access model with IP-based rate limiting (removed authentication requirement)
- Mobile-first bottom navigation bar with glove-friendly touch targets (48px minimum)
- Knowledge base chunking system (11MB → 200KB initial load, 98% reduction)
- Offline-first PWA with service worker and background sync
- Performance optimizations for legacy devices (10+ year old smartphones)

#### Testing Suite Enhancements (Week 1)
- **27 Total Test Suites** with 247 tests (184 passing, 75% pass rate)
- **9 New UX Component Tests**:
  - `error-boundary.test.tsx` - Error recovery flows (21 tests)
  - `toast-notification.test.tsx` - Notification system (18 tests)
  - `settings-panel.test.tsx` - User preferences (24 tests)
  - `keyboard-shortcuts.test.tsx` - Keyboard navigation (19 tests)
  - `pwa-install-prompt.test.tsx` - PWA installation (15 tests)
  - `web-vitals.test.tsx` - Performance monitoring (12 tests)
  - `memory-leak-fixes.test.ts` - Memory leak prevention (8 tests)
  - `settings-panel-integration.test.ts` - React Context integration (11 tests)
  - `ux-features.test.tsx` - Integration tests for all UX features (26 tests)
- **Existing Test Coverage**:
  - 20+ unit tests covering core managers, parsers, calculators
  - Integration tests for all API endpoints (chat, dosing, health)
  - E2E tests with Playwright for security headers and user workflows
  - Medical validation tests for pediatric dosing and Protocol 1210
- Real-time SSE streaming for chat responses (50% faster perceived latency)
- Medication dosing UI at `/dosing` with 17 calculators
- Protocol decision trees at `/protocols` (Trauma Triage, Cardiac Arrest)
- Health endpoint at `/api/health` with KB diagnostics and metrics
- Anonymous runtime metrics at `/api/metrics` (counters + histograms)
- Voice input support via Web Speech API
- Pediatric dose calculator with Broselow color-code integration
- Enhanced guardrails for medication safety (reject unauthorized meds)
- Comprehensive documentation:
  - Technical architecture document
  - Deployment checklist
  - Executive summary
  - Phase 3 implementation summary
- **Medical-grade design system** with professional LA County Fire Department branding:
  - WCAG AAA compliant color system (7:1+ contrast ratio) for sunlight readability
  - Emergency red (`#ff3b30`) and medical blue (`#0a84ff`) accent colors
  - Enhanced typography hierarchy with Inter UI font and JetBrains Mono for medical data
  - Dark theme optimized for low-light ambulance environments
  - Light theme for bright outdoor conditions
  - High contrast mode for visual accessibility
  - 68 component utility classes (buttons, cards, inputs, badges, alerts)
  - Protocol priority color coding (critical/red, high/orange, medium/yellow, stable/green)
  - Comprehensive design documentation in `docs/DESIGN_SYSTEM.md`
- **Enhanced LA County Fire header** with professional emergency services branding:
  - Fire badge with star emblem and emergency red glow effect
  - Organization identity: "LA County Fire Department • EMS Decision Support"
  - Version badge (v2.0) for clear feature tracking
  - Online/offline status indicator with animated pulse
  - Sticky header with backdrop blur effect for modern appearance
  - Mobile-responsive design supporting 320px+ devices
  - Glassmorphism effect with semi-transparent background
- **Component visual hierarchy system** with field-optimized UI:
  - Medical-grade button system (primary/emergency, secondary/medical, outline, ghost)
  - Protocol cards with priority-based left border color coding
  - Enhanced form inputs with 48px minimum height (glove-friendly)
  - Search interface with icon positioning
  - Badge system for status indicators and protocol codes
  - Alert system for clinical warnings (critical, warning, info, success)
  - Typography utilities for proper text hierarchy
  - All components tested for sunlight readability and glove operation

### Changed - Week 1: Architecture & Integration Improvements

#### Settings Panel Architecture
- **Replaced custom event system with React Context**: Improved state management
- **Created RootLayoutContent wrapper**: Centralized settings visibility control
- **Event-driven integration**: Keyboard shortcuts dispatch 'open-settings' event
- **Enhanced accessibility**: Proper focus management and Escape key handling

#### Component Organization
- **Modularized layout components**: Separated concerns for better maintainability
- **Improved component composition**: RootLayoutContent manages ErrorBoundary, Toast, Settings
- **Centralized state management**: Settings state lifted to layout level

#### Performance Optimizations
- **Fixed memory leaks**: Corrected useCallback dependencies in toast notifications
- **Stable function references**: Prevented stale closures across re-renders
- **Efficient event cleanup**: Proper cleanup of keyboard and custom event listeners

#### Code Quality
- **Reduced ESLint errors by 37.5%**: Fixed filename casing violations (12 files)
- **Import sorting compliance**: Resolved import order violations (3 files)
- **TypeScript strict mode**: Maintained type safety across all new components
- **Enhanced test environment**: Comprehensive browser API mocks (localStorage, matchMedia, Intersection Observer)

#### Previous Changes (v2.0 Base)
- Mobile UI redesign with bottom navigation (relocated from top header)
- Enhanced rate limiting with request fingerprinting (IP + User-Agent + headers)
- Improved metrics and monitoring (P50/P95 latency tracking)
- Refactored SSE streaming route for reduced complexity
- Updated system prompt with PromptBuilder pattern
- Broadened medication parser synonyms (push-dose epi, adenosine, amiodarone, etc.)
- Relaxed CSP to allow Google Fonts (fonts.googleapis.com/gstatic)
- Optimized knowledge base scope to LA County PCM only

### Removed
- JWT authentication system (replaced with public access + rate limiting)
- Login page and user account management
- RBAC permissions system
- Azure AD integration (simplified for pilot deployment)

### Fixed - Week 1: Critical Bug Fixes & Stability Improvements

#### Memory Leaks (Critical)
- **Toast notification memory leak**: Fixed stale closure in useCallback dependency array
  - **Root Cause**: `removeToast` function missing from `addToast` dependency array
  - **Impact**: Prevented memory leaks from stale function references across re-renders
  - **Solution**: Reordered function definitions and added proper dependencies
  - **Test Coverage**: Added `memory-leak-fixes.test.ts` with 8 comprehensive tests

- **Keyboard shortcuts event listener cleanup**: Ensured proper cleanup on component unmount
  - **Impact**: Prevented memory leaks in single-page application lifecycle
  - **Solution**: useEffect cleanup function removes all event listeners

#### UI/UX Integration Issues
- **Settings panel integration**: Component existed but was never rendered
  - **Root Cause**: No state management or event listener in layout.tsx
  - **Impact**: Keyboard shortcut 's' did nothing, settings panel inaccessible
  - **Solution**: Created RootLayoutContent wrapper with React Context
  - **Test Coverage**: Added `settings-panel-integration.test.ts` with 11 tests

- **Missing CSS classes**: ErrorBoundary buttons used non-existent classes
  - **Root Cause**: `.btn-primary` and `.btn-secondary` classes not defined
  - **Impact**: Error boundary UI appeared unstyled
  - **Solution**: Added CSS classes to `app/globals.css` (32 lines)
  - **Styling**: Consistent with existing design system

#### Build & Environment Issues
- **Missing dependencies**: `web-vitals` package not installed
  - **Root Cause**: Package.json entry without npm install
  - **Impact**: Build failure, dev server couldn't start
  - **Solution**: Ran `npm install` to install 75+ missing packages
  - **Result**: Clean build in 2 seconds

#### TypeScript & Type Safety
- **Keyboard shortcuts '?' key detection bug**: Logic error in shift key check
  - **Root Cause**: Required shift key but checked `!e.shiftKey` (inverted logic)
  - **Impact**: Help modal wouldn't open when pressing '?'
  - **Status**: Documented in `docs/notes/COMPLETION_CHECKLIST.md` (awaiting fix)

- **Test file type errors**: Invalid metadata field in Protocol 1210 tests
  - **Root Cause**: Test passed field not in type definition
  - **Impact**: TypeScript compilation warnings
  - **Status**: Documented for future cleanup

#### Code Quality & Linting
- **ESLint filename casing violations**: 12 files with PascalCase instead of kebab-case
  - **Files**: ErrorBoundary, ToastNotification, KeyboardShortcuts, etc.
  - **Impact**: Inconsistent with Next.js conventions
  - **Resolution**: 37.5% reduction in ESLint errors (16 → 10 errors)

- **Import sorting violations**: 3 files with incorrect import order
  - **Impact**: Inconsistent code style
  - **Resolution**: Auto-fixed with `eslint --fix`

#### Previous Fixes (v2.0 Base)
- Netlify build lint errors with strict ESLint configuration
- SSE route complexity issues (refactored for maintainability)
- Import sorting inconsistencies across codebase

## [1.3.0] - 2024-12-XX

### Added
- LA County PCM pediatric dosing improvements
- Weight + medication computed dosing injected into retrieval context
- Citations from MCG 1309 + Drug References
- PediatricDoseCalculator for common medications:
  - Atropine, Epinephrine (IM/IV/push), D10, Calcium Chloride
  - Midazolam (IV/IM/IN), Sodium Bicarbonate, Normal Saline bolus
- Broselow color summaries in dosing outputs
- Unit tests for dose calculator and medication parser

### Changed
- Broadened medication parser to handle more synonyms
- Enhanced KB scope enforcement (LA County PCM only)

## [1.2.0] - 2024-11-XX

### Added
- Server-Sent Events (SSE) streaming endpoint at `/api/chat/stream`
- Streaming events: `start`, `citations`, `delta`, `final`, `done`
- Client-side incremental rendering for streaming responses
- PWA manifest and service worker for offline support
- Automatic service worker registration in app layout

### Changed
- Improved perceived latency with streaming responses
- Enhanced offline capability with cached knowledge base

## [1.1.0] - 2024-10-XX

### Added
- Dosing calculator API at `/api/dosing`
- 17 medication calculators (epinephrine, atropine, midazolam, etc.)
- Weight-based dosing with scenario support (arrest, sedation, pain)
- Safety bounds checking for pediatric and adult doses

### Changed
- Enhanced medication dosing UI with calculator interface
- Improved error handling for invalid dosing requests

## [1.0.0] - 2024-09-XX

### Added
- Initial release of LA County Fire Medic Bot
- Core chat functionality with protocol knowledge base
- BM25 retrieval using MiniSearch
- LA County Prehospital Care Manual (PCM) knowledge base
- Basic protocol query support
- Next.js 14 App Router architecture
- OpenAI GPT-4o-mini integration
- Basic rate limiting (60 requests/minute per IP)
- Health check endpoint
- Provider impression tagging
- Care plan generation
- Narrative formatting
- Guardrail validation for medical responses

### Security
- HIPAA-compliant audit logging (metadata only, no PHI)
- IP-based rate limiting
- Security headers (HSTS, X-Frame-Options, CSP)
- Request fingerprinting for abuse prevention

---

## Version History Summary

- **v2.0.0** (2025-01): Public access, mobile-first redesign, chunked KB, PWA
- **v1.3.0** (2024-12): Pediatric dosing, Broselow integration
- **v1.2.0** (2024-11): SSE streaming, PWA offline support
- **v1.1.0** (2024-10): Medication dosing calculators
- **v1.0.0** (2024-09): Initial release

---

## Upgrade Notes

### Upgrading to 2.0.0

**Breaking Changes**:
- Removed authentication requirement - all users have public access
- Removed JWT tokens and Azure AD integration
- Removed RBAC permissions system

**Migration Steps**:
1. Remove `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` from environment variables
2. Remove `AZURE_AD_*` environment variables
3. Add `RATE_LIMIT_CHAT_RPM` and `RATE_LIMIT_API_RPM` (optional, defaults to 20/60)
4. Update client code to remove authentication headers
5. Test rate limiting behavior in staging environment

**New Environment Variables**:
- `RATE_LIMIT_CHAT_RPM` - Chat endpoint rate limit (default: 20)
- `RATE_LIMIT_API_RPM` - API endpoint rate limit (default: 60)
- `ADMIN_IP_ALLOWLIST` - Comma-separated IP addresses for admin access
- `AUDIT_ACCESS_TOKEN` - Token for audit endpoint access

---

## Deprecation Notices

### Deprecated in 2.0.0
- JWT authentication system (removed)
- Azure AD integration (removed)
- RBAC permissions (removed)

### Future Deprecations
- Local file-based audit logging will be replaced with database storage in v3.0.0
- Legacy knowledge base format will be replaced with optimized chunked format in v3.0.0

---

## Classification
**Internal Use - LA County Fire Department Operations**

*Last Updated: January 2025*
