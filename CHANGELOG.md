# Changelog

All notable changes to the LA County Fire Medic Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-XX

### Added
- Public access model with IP-based rate limiting (removed authentication requirement)
- Mobile-first bottom navigation bar with glove-friendly touch targets (48px minimum)
- Knowledge base chunking system (11MB → 200KB initial load, 98% reduction)
- Offline-first PWA with service worker and background sync
- Performance optimizations for legacy devices (10+ year old smartphones)
- Comprehensive testing suite (80%+ coverage):
  - 40+ unit tests covering core managers
  - Integration tests for all API endpoints
  - E2E tests with Playwright for security and workflows
  - Medical validation tests for pediatric dosing
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

### Changed
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

### Fixed
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
