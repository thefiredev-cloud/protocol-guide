# ImageTrend Integration - Quick Reference Summary

**Version**: 1.0  
**Date**: January 2025  
**For**: LA County Fire Medic Bot integration with ImageTrend Elite

---

## Overview

Medic Bot will be **embedded as a widget** within ImageTrend Elite's ePCR interface, enabling:
- Single sign-on (no separate login)
- Real-time patient data sync
- Direct narrative export to PCR fields
- Medication calculation → PCR integration
- Protocol reference within documentation workflow

**Timeline**: 12-18 months to full production deployment

---

## Roadmap Phases

### Phase 0: Partnership & Prerequisites (Months 1-2)
**Goal**: Establish ImageTrend partnership and obtain API access

**Key Tasks**:
- Join ImageTrend Industry Partner Program
- Obtain API documentation and sandbox access
- Review security requirements (FedRAMP alignment)

**Deliverables**: Partner membership, API docs, test environment

---

### Phase 1: Foundation - Embedding Architecture (Months 3-4)
**Goal**: Enable Medic Bot to run inside ImageTrend as embedded widget

**Key Components**:
- ✅ PostMessage API for parent window communication
- ✅ Iframe/widget embedding support
- ✅ Compact UI variant for embedded mode
- ✅ OAuth/SAML single sign-on integration
- ✅ Patient context service (receives data from ImageTrend)

**Key Files to Create**:
- `lib/embedding/postmessage-handler.ts`
- `lib/auth/imagetrend-auth.ts`
- `lib/services/imagetrend/patient-context-service.ts`
- `app/components/embedded/compact-chat.tsx`

---

### Phase 2: Data Integration (Months 5-7)
**Goal**: Bi-directional data exchange between Medic Bot and ImageTrend PCR

**Key Components**:
- ✅ Real-time patient data synchronization
- ✅ ImageTrend field mapping (patient data ↔ Medic Bot context)
- ✅ Enhanced narrative export (ImageTrend-specific format)
- ✅ PCR field population API (auto-fill ePCR fields)
- ✅ Medication list synchronization
- ✅ Protocol reference tracking and export

**Key Files to Create**:
- `lib/mappers/imagetrend-field-mapper.ts`
- `lib/narrative/imagetrend-formatter.ts`
- `lib/services/imagetrend/pcr-update-service.ts`
- `lib/services/imagetrend/medication-sync.ts`

---

### Phase 3: UI/UX Optimization (Months 8-9)
**Goal**: Optimize user experience for embedded widget context

**Key Components**:
- ✅ Compact, responsive widget design
- ✅ ImageTrend theme integration
- ✅ Embedded-specific keyboard shortcuts
- ✅ Contextual help and onboarding

**Key Files to Create**:
- `app/components/embedded/protocol-sidebar.tsx`
- `app/styles/themes/imagetrend-theme.css`
- `app/components/embedded/onboarding-flow.tsx`

---

### Phase 4: Testing & Validation (Months 10-11)
**Goal**: Comprehensive testing and validation before pilot

**Key Activities**:
- End-to-end integration testing
- Performance testing (widget load, data sync)
- Medical director validation (50+ scenarios)
- Security & compliance audit (HIPAA, ImageTrend requirements)

**Deliverables**: Test results, medical sign-off, security audit report

---

### Phase 5: Pilot Deployment (Months 12-13)
**Goal**: Limited rollout to validate integration in production

**Key Activities**:
- Select 3-5 pilot stations (20-30 paramedics)
- Training and documentation
- Monitoring and feedback collection
- Iteration based on pilot feedback

**Success Criteria**: >70% adoption, >85% satisfaction, <2% error rate

---

### Phase 6: Production Rollout (Months 14-18)
**Goal**: Full deployment to all LA County Fire stations

**Key Activities**:
- Staged rollout (10 → 20 → 40 → all stations)
- Ongoing support and optimization
- Feature enhancements based on feedback

---

## Integration Architecture

### Data Flow

```
ImageTrend Elite ePCR
    ↓ (loads widget)
Medic Bot Widget (iframe)
    ↓ (OAuth SSO)
Authentication Complete
    ↓ (PostMessage)
Patient Data Received
    ↓ (user queries)
Protocol Guidance / Medication Calculation
    ↓ (user clicks "Export")
Narrative → ImageTrend PCR Fields
Medications → ImageTrend Medication Records
```

### Key Integration Points

1. **Authentication**: OAuth 2.0 authorization code flow
2. **Data Sync**: PostMessage API for real-time patient data
3. **PCR Updates**: REST API calls to ImageTrend PCR endpoints
4. **Widget Embedding**: Iframe with secure cross-origin communication

---

## Critical Dependencies

### External (Must Have)
- ✅ ImageTrend Partner Program membership
- ✅ ImageTrend API access and documentation
- ✅ ImageTrend sandbox/test environment
- ✅ ImageTrend production environment provisioning
- ✅ ImageTrend OAuth credentials

### Internal (Must Have)
- ✅ LA County Fire Department approval
- ✅ Legal review of partner agreement
- ✅ IT Security approval
- ✅ Medical Director approval

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Widget load time | < 2 seconds (P95) |
| OAuth success rate | > 99% |
| Data sync latency | < 500ms |
| Narrative export success | > 98% |
| User adoption (30 days) | > 70% |
| Time saved per PCR | 30-60 seconds |
| User satisfaction | > 85% |

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **ImageTrend API changes** | Version API calls, maintain abstraction layer |
| **OAuth complexity** | Early sandbox testing, ImageTrend support |
| **Performance in iframe** | Optimize bundle, lazy loading, monitoring |
| **Data sync conflicts** | Clear conflict resolution, user confirmation |
| **Security vulnerabilities** | Regular audits, penetration testing |

---

## Resource Requirements

**Team**: 6-8 people (PM, 2-3 engineers, QA, integration specialist, medical director, support)

**Budget**: ~$200,000 over 18 months (excludes ImageTrend licensing)

---

## Quick Links

- **Full Roadmap**: [`imagetrend-integration-roadmap.md`](./imagetrend-integration-roadmap.md)
- **Current Protocol Plans**: [`protocol-retrieval-system-plan.md`](./protocol-retrieval-system-plan.md)
- **Technical Architecture**: [`../technical-architecture.md`](../technical-architecture.md)

---

## Next Steps

1. ✅ **Review roadmap** with stakeholders
2. **Initiate Phase 0**: ImageTrend Partner Program enrollment
3. **Schedule kickoff**: Meeting with ImageTrend technical team
4. **Gather documentation**: API docs, security requirements, field mapping

---

**Status**: Planning Complete - Ready for Approval

