# ImageTrend Integration Roadmap - LA County Fire Medic Bot

**Version**: 1.0  
**Date**: January 2025  
**Focus**: Complete integration of Medic Bot as embedded application within ImageTrend Elite for Los Angeles County  
**Timeline**: 12-18 months to full production deployment

---

## Executive Summary

This roadmap restructures the Medic Bot development plan to prioritize **ImageTrend Elite integration** as the primary deployment model. The chatbot will be embedded directly within ImageTrend's ePCR interface, enabling seamless data exchange, single sign-on, and protocol-guided documentation workflows for LA County Fire paramedics.

### Integration Goals

1. **Embedded Experience**: Medic Bot accessible as integrated widget within ImageTrend Elite interface
2. **Data Integration**: Bi-directional data exchange between Medic Bot and ePCR records
3. **Workflow Integration**: Protocol guidance and narrative generation directly populate ePCR fields
4. **Single Sign-On**: Seamless authentication using ImageTrend credentials
5. **Compliance**: HIPAA-compliant integration meeting LA County and ImageTrend security standards

### Benefits

- **Reduced Context Switching**: No need to switch between ePCR and protocol reference tools
- **Automated Documentation**: AI-generated narratives directly populate ePCR fields
- **Protocol Compliance**: Real-time protocol validation during documentation
- **Time Savings**: Estimated 30-60 seconds per PCR completion
- **Accuracy**: Reduced transcription errors from AI-assisted documentation

---

## Current State Assessment

### Existing Infrastructure

**✅ Completed Components**:
- Core chat functionality with LLM integration
- Protocol knowledge base (LA County PCM)
- Medication dosing calculators
- Narrative generation (NEMSIS-compliant)
- Streaming responses (SSE)
- PWA/offline capability
- Audit logging infrastructure
- Basic ePCR integration stubs (`/api/integrations/epcr/narrative`)

**🔄 Needs Modification for ImageTrend**:
- Authentication system (currently zero-auth → SSO required)
- Embedding architecture (iframe/widget support)
- Context passing (patient data from ImageTrend)
- ePCR field mapping (ImageTrend-specific field structure)
- Single sign-on integration

**📋 New Requirements**:
- ImageTrend Partner Program participation
- ImageTrend API access and documentation
- ImageTrend-specific authentication (OAuth/SAML)
- Widget embedding configuration
- ImageTrend field mapping documentation
- Data synchronization workflows

---

## Phase 0: Partnership & Prerequisites (Months 1-2)

### Month 1: ImageTrend Partnership & Documentation

#### Week 1-2: Partner Program Enrollment

**Tasks**:
- [ ] Research ImageTrend Industry Partner Program requirements
- [ ] Complete partner program application
- [ ] Submit LA County Fire Department credentials
- [ ] Establish primary ImageTrend contact (Partner Relations Manager)
- [ ] Schedule kickoff meeting with ImageTrend technical team

**Deliverables**:
- Partner program membership confirmation
- ImageTrend contact directory
- Integration project timeline from ImageTrend perspective

**Dependencies**:
- LA County Fire Department approval for partnership
- Legal review of partner agreement terms

#### Week 3-4: API Access & Documentation

**Tasks**:
- [ ] Obtain ImageTrend Elite API documentation
- [ ] Review ImageTrend integration solutions guide
- [ ] Identify relevant API endpoints:
  - Patient data retrieval (read-only during active PCR)
  - Narrative field updates (write)
  - Authentication/OAuth endpoints
  - Widget embedding documentation
- [ ] Request sandbox/test environment access
- [ ] Review ImageTrend security requirements (FedRAMP alignment)

**Deliverables**:
- API documentation archive
- Endpoint mapping document
- Test environment credentials
- Security requirements checklist

**Key Endpoints Expected**:
```
GET /api/patients/{patientId}          # Patient data
GET /api/pcrs/{pcrId}                 # PCR record data
POST /api/pcrs/{pcrId}/narrative     # Update narrative field
GET /api/auth/oauth/authorize         # OAuth flow
POST /api/auth/oauth/token            # Token exchange
```

---

## Phase 1: Foundation - Embedding Architecture (Months 3-4)

### Month 3: Widget/Embedding Infrastructure

#### Week 1-2: Iframe/Widget Support

**Architecture Changes**:

**1. Embedding Configuration**
```typescript
// lib/config/embedding-config.ts
export interface EmbeddingConfig {
  provider: 'imagetrend' | 'standalone';
  iframeMode: boolean;
  parentOrigin?: string; // ImageTrend origin for postMessage
  allowedOrigins: string[];
  theme: 'imagetrend' | 'lacfd';
  compactMode: boolean; // Compact UI for widget
}
```

**2. PostMessage API**
```typescript
// lib/embedding/postmessage-handler.ts
export interface PostMessageEvents {
  // From ImageTrend → Medic Bot
  'imagetrend:patient-data': PatientData;
  'imagetrend:auth-token': { token: string };
  'imagetrend:ready': {};
  
  // From Medic Bot → ImageTrend
  'medicbot:narrative-ready': { narrative: string; format: 'nemsis' | 'soap' };
  'medicbot:protocol-selected': { protocolCode: string };
  'medicbot:medication-calculated': MedicationDose;
}
```

**Tasks**:
- [ ] Create `EmbeddingConfig` service
- [ ] Implement PostMessage handler for parent window communication
- [ ] Add iframe detection utility
- [ ] Create compact UI variant (smaller chat interface)
- [ ] Implement message validation (origin checking)
- [ ] Add embedding-aware routing (detect iframe mode)
- [ ] Test cross-origin communication

**Files to Create**:
- `lib/embedding/postmessage-handler.ts`
- `lib/embedding/embedding-config.ts`
- `app/components/embedded/compact-chat.tsx`
- `app/components/embedded/iframe-wrapper.tsx`

**Files to Modify**:
- `app/layout.tsx` - Add embedding context provider
- `app/components/root-layout-content.tsx` - Conditional rendering for embedded mode

#### Week 3-4: Context Passing & State Management

**Patient Data Integration**:

**1. Patient Context Service**
```typescript
// lib/services/imagetrend/patient-context-service.ts
export class PatientContextService {
  // Receives patient data from ImageTrend
  setPatientData(data: ImageTrendPatientData): void;
  
  // Returns formatted patient context for LLM
  getPatientContext(): PatientContext;
  
  // Syncs medication list with ImageTrend PCR
  syncMedications(medications: MedicationRecord[]): void;
}
```

**2. ImageTrend Data Types**
```typescript
// lib/types/imagetrend.ts
export interface ImageTrendPatientData {
  pcrId: string;
  patientId: string;
  demographics: {
    age?: number;
    ageUnit?: 'years' | 'months' | 'days';
    gender?: 'M' | 'F' | 'U';
    weight?: number;
    weightUnit?: 'kg' | 'lbs';
  };
  chiefComplaint?: string;
  dispatchCode?: string;
  vitals?: VitalSigns[];
  medicationsGiven?: ImageTrendMedication[];
  timestamp: string;
}
```

**Tasks**:
- [ ] Create `PatientContextService` for ImageTrend data
- [ ] Implement patient data parsing and normalization
- [ ] Add React Context for patient data (`PatientContextProvider`)
- [ ] Integrate patient context into chat prompts
- [ ] Create patient data display component (read-only)
- [ ] Add data sync indicators (when data updates from ImageTrend)

**Files to Create**:
- `lib/services/imagetrend/patient-context-service.ts`
- `lib/types/imagetrend.ts`
- `app/contexts/patient-context.tsx`
- `app/components/embedded/patient-info-panel.tsx`

---

### Month 4: Authentication Integration

#### Week 1-2: OAuth/SAML SSO Implementation

**Authentication Flow**:

```
1. User opens ImageTrend Elite → navigates to Medic Bot widget
2. ImageTrend sends OAuth authorization request to Medic Bot
3. Medic Bot redirects to ImageTrend OAuth endpoint
4. User authenticates in ImageTrend (existing session)
5. ImageTrend redirects back with authorization code
6. Medic Bot exchanges code for access token
7. Medic Bot validates token and creates session
8. User accesses Medic Bot without additional login
```

**Tasks**:
- [ ] Review ImageTrend OAuth/SAML documentation
- [ ] Implement OAuth 2.0 authorization code flow
- [ ] Create token exchange endpoint (`/api/auth/imagetrend/callback`)
- [ ] Implement token validation middleware
- [ ] Add session management for ImageTrend users
- [ ] Create logout/revocation handling
- [ ] Test OAuth flow in sandbox environment

**Implementation**:
```typescript
// lib/auth/imagetrend-auth.ts
export class ImageTrendAuth {
  async initiateAuth(redirectUri: string): Promise<string>;
  async exchangeCode(code: string): Promise<AccessToken>;
  async validateToken(token: string): Promise<ImageTrendUser>;
  async revokeToken(token: string): Promise<void>;
}

// app/api/auth/imagetrend/authorize/route.ts
export async function GET(req: NextRequest) {
  // Redirect to ImageTrend OAuth endpoint
}

// app/api/auth/imagetrend/callback/route.ts
export async function GET(req: NextRequest) {
  // Exchange code for token, create session
}
```

**Files to Create**:
- `lib/auth/imagetrend-auth.ts`
- `app/api/auth/imagetrend/authorize/route.ts`
- `app/api/auth/imagetrend/callback/route.ts`
- `app/api/auth/imagetrend/logout/route.ts`
- `lib/middleware/imagetrend-auth-middleware.ts`

**Files to Modify**:
- `app/layout.tsx` - Add ImageTrend auth provider
- `lib/security/rate-limiting.ts` - Adjust for authenticated users

#### Week 3-4: User Context & Authorization

**User Context**:
```typescript
// lib/types/imagetrend-user.ts
export interface ImageTrendUser {
  userId: string;
  email: string;
  name: string;
  role: 'paramedic' | 'emt' | 'supervisor' | 'medical_director';
  certificationLevel: 'BLS' | 'ALS' | 'CCP';
  stationId?: string;
  unitId?: string;
}
```

**Tasks**:
- [ ] Parse user data from ImageTrend token/user endpoint
- [ ] Create user context provider
- [ ] Implement role-based access control (RBAC)
- [ ] Add user profile display in embedded UI
- [ ] Link ImageTrend user ID to audit logs
- [ ] Test authorization flows (different roles)

**Files to Create**:
- `lib/types/imagetrend-user.ts`
- `lib/auth/rbac.ts`
- `app/contexts/user-context.tsx`

**Files to Modify**:
- `lib/audit/audit-logger.ts` - Include ImageTrend user ID
- `app/components/embedded/compact-chat.tsx` - Display user info

---

## Phase 2: Data Integration (Months 5-7)

### Month 5: Patient Data Synchronization

#### Week 1-2: Real-Time Data Sync

**Data Sync Architecture**:

```
ImageTrend PCR Updated
    ↓
PostMessage: 'imagetrend:patient-data'
    ↓
PatientContextService.update()
    ↓
React Context Updated
    ↓
Chat UI Reflects New Data
```

**Tasks**:
- [ ] Implement real-time patient data listener (PostMessage)
- [ ] Create data synchronization service
- [ ] Add debouncing for rapid updates
- [ ] Implement conflict resolution (if Medic Bot has unsaved changes)
- [ ] Add sync status indicator in UI
- [ ] Test data sync in various scenarios

**Files to Create**:
- `lib/services/imagetrend/data-sync-service.ts`
- `app/hooks/use-imagetrend-sync.ts`

**Files to Modify**:
- `lib/services/imagetrend/patient-context-service.ts` - Add sync methods
- `app/components/embedded/compact-chat.tsx` - Add sync indicators

#### Week 3-4: Field Mapping & Data Transformation

**ImageTrend Field Mapping**:

```typescript
// lib/mappers/imagetrend-field-mapper.ts
export class ImageTrendFieldMapper {
  // Map ImageTrend patient data → Medic Bot PatientContext
  mapPatientData(data: ImageTrendPatientData): PatientContext;
  
  // Map Medic Bot narrative → ImageTrend PCR fields
  mapNarrativeToPCR(narrative: Narrative): ImageTrendPCRFields;
  
  // Map Medic Bot medications → ImageTrend medication records
  mapMedications(medications: MedicationRecord[]): ImageTrendMedication[];
}
```

**Tasks**:
- [ ] Review ImageTrend PCR field structure (obtain field list)
- [ ] Create field mapping documentation
- [ ] Implement mapping service
- [ ] Test field transformations (bidirectional)
- [ ] Handle missing/null fields gracefully
- [ ] Create mapping validation tests

**Files to Create**:
- `lib/mappers/imagetrend-field-mapper.ts`
- `docs/imagetrend-field-mapping.md`

---

### Month 6: Narrative Export & PCR Population

#### Week 1-2: Enhanced Narrative Export

**Current State**: Basic narrative export endpoint exists (`/api/integrations/epcr/narrative`)

**Enhancements Needed**:

**1. ImageTrend-Specific Narrative Format**
```typescript
// lib/narrative/imagetrend-formatter.ts
export class ImageTrendNarrativeFormatter {
  // Format narrative for ImageTrend narrative field
  formatNarrative(narrative: Narrative): string;
  
  // Split narrative into multiple fields if needed
  splitIntoFields(narrative: Narrative): ImageTrendPCRFields;
  
  // Include protocol citations in ImageTrend format
  formatCitations(protocols: Protocol[]): string;
}
```

**Tasks**:
- [ ] Review ImageTrend narrative field requirements
- [ ] Create ImageTrend-specific formatter
- [ ] Implement field splitting (if narrative exceeds field limits)
- [ ] Add protocol citation formatting
- [ ] Test narrative generation for various scenarios
- [ ] Validate character limits and formatting

**Files to Create**:
- `lib/narrative/imagetrend-formatter.ts`

**Files to Modify**:
- `lib/narrative/builder.ts` - Add ImageTrend formatting option
- `app/api/integrations/epcr/narrative/route.ts` - Support ImageTrend format

#### Week 3-4: PCR Field Population API

**PCR Update Endpoint**:

```typescript
// app/api/integrations/imagetrend/pcr/update/route.ts
export async function POST(req: NextRequest) {
  // Update ImageTrend PCR fields via API
  // POST /api/imagetrend/pcrs/{pcrId}/fields
}

// lib/services/imagetrend/pcr-update-service.ts
export class PCRUpdateService {
  async updateNarrative(pcrId: string, narrative: string): Promise<void>;
  async updateMedications(pcrId: string, medications: MedicationRecord[]): Promise<void>;
  async updateProtocols(pcrId: string, protocols: string[]): Promise<void>;
}
```

**Tasks**:
- [ ] Implement PCR field update API calls
- [ ] Create PCR update service
- [ ] Add error handling (field validation errors, conflicts)
- [ ] Implement retry logic for transient failures
- [ ] Add user confirmation before auto-populating fields
- [ ] Test PCR updates in sandbox environment

**Files to Create**:
- `lib/services/imagetrend/pcr-update-service.ts`
- `app/api/integrations/imagetrend/pcr/update/route.ts`

**Files to Modify**:
- `app/components/embedded/compact-chat.tsx` - Add "Export to PCR" button
- `lib/narrative/builder.ts` - Trigger PCR update on export

---

### Month 7: Medication & Protocol Integration

#### Week 1-2: Medication List Sync

**Medication Integration**:

```typescript
// lib/services/imagetrend/medication-sync.ts
export class MedicationSyncService {
  // Sync medications from ImageTrend → Medic Bot
  syncFromImageTrend(medications: ImageTrendMedication[]): void;
  
  // Sync medications from Medic Bot → ImageTrend
  syncToImageTrend(medications: MedicationRecord[]): Promise<void>;
  
  // Calculate medication doses using Medic Bot calculators
  calculateAndSync(medicationId: string, patientWeight: number): Promise<void>;
}
```

**Tasks**:
- [ ] Implement medication list synchronization
- [ ] Map Medic Bot medication IDs to ImageTrend medication codes
- [ ] Add medication calculation workflow:
  1. User calculates dose in Medic Bot
  2. User confirms dose
  3. Dose auto-populates ImageTrend medication record
- [ ] Handle medication conflicts (duplicate entries)
- [ ] Test medication sync workflows

**Files to Create**:
- `lib/services/imagetrend/medication-sync.ts`
- `lib/mappers/medication-mapper.ts`

**Files to Modify**:
- `app/dosing/page.tsx` - Add "Add to PCR" button for embedded mode
- `lib/dosing/calculators/*` - Trigger sync on calculation

#### Week 3-4: Protocol Reference Integration

**Protocol Integration**:

```typescript
// lib/services/imagetrend/protocol-integration.ts
export class ProtocolIntegrationService {
  // Track which protocols were referenced during chat
  trackProtocolUsage(protocolCode: string, pcrId: string): void;
  
  // Export protocol references to ImageTrend PCR
  exportProtocolReferences(pcrId: string, protocols: string[]): Promise<void>;
  
  // Pre-load protocols based on ImageTrend dispatch code
  preloadProtocols(dispatchCode: string): Promise<Protocol[]>;
}
```

**Tasks**:
- [ ] Implement protocol usage tracking
- [ ] Create protocol reference export (to PCR custom fields or notes)
- [ ] Add protocol pre-loading based on dispatch code
- [ ] Display active protocols in embedded UI
- [ ] Test protocol integration workflows

**Files to Create**:
- `lib/services/imagetrend/protocol-integration.ts`

**Files to Modify**:
- `lib/services/chat/protocol-retrieval-service.ts` - Track protocol usage per PCR
- `app/components/embedded/compact-chat.tsx` - Display protocol references

---

## Phase 3: UI/UX Optimization for Embedded Mode (Months 8-9)

### Month 8: Compact UI Design

#### Week 1-2: Responsive Widget Design

**Compact Mode Requirements**:
- Reduced header height (hide branding in embedded mode)
- Collapsible chat history
- Minimal medication calculator UI
- Protocol quick-access sidebar
- Reduced padding/margins
- ImageTrend theme colors (if applicable)

**Tasks**:
- [ ] Design compact UI mockups
- [ ] Implement compact chat component
- [ ] Create collapsible chat history
- [ ] Design medication calculator widget
- [ ] Add protocol quick-access panel
- [ ] Implement responsive breakpoints for widget sizes
- [ ] Test UI at various widget dimensions (300px, 500px, 800px width)

**Files to Create**:
- `app/components/embedded/compact-chat.tsx`
- `app/components/embedded/protocol-sidebar.tsx`
- `app/components/embedded/medication-widget.tsx`
- `app/styles/embedded.css`

**Files to Modify**:
- `app/components/chat/chat-interface.tsx` - Add compact mode variant
- `app/globals.css` - Add embedded mode styles

#### Week 3-4: ImageTrend Theme Integration

**Tasks**:
- [ ] Obtain ImageTrend UI design guidelines (if available)
- [ ] Create ImageTrend theme variant
- [ ] Match ImageTrend color scheme
- [ ] Match ImageTrend typography
- [ ] Test theme in ImageTrend sandbox

**Files to Create**:
- `app/styles/themes/imagetrend-theme.css`

---

### Month 9: Workflow Optimization

#### Week 1-2: Keyboard Shortcuts for Embedded Mode

**Embedded-Specific Shortcuts**:
- `Ctrl+E` - Export narrative to PCR
- `Ctrl+M` - Open medication calculator
- `Ctrl+P` - Open protocol selector
- `Ctrl+R` - Refresh patient data from ImageTrend
- `Esc` - Close embedded widget (if closable)

**Tasks**:
- [ ] Add embedded-specific keyboard shortcuts
- [ ] Document shortcuts in help modal
- [ ] Test shortcuts in iframe context
- [ ] Add shortcut hints in UI

**Files to Modify**:
- `app/components/keyboard-shortcuts.tsx` - Add embedded shortcuts

#### Week 3-4: Contextual Help & Onboarding

**Tasks**:
- [ ] Create embedded mode onboarding flow
- [ ] Add contextual help tooltips
- [ ] Create quick-start guide for ImageTrend users
- [ ] Add help button in embedded UI
- [ ] Test onboarding with pilot users

**Files to Create**:
- `app/components/embedded/onboarding-flow.tsx`
- `docs/imagetrend-user-guide.md`

---

## Phase 4: Testing & Validation (Months 10-11)

### Month 10: Integration Testing

#### Week 1-2: End-to-End Testing

**Test Scenarios**:

1. **Authentication Flow**:
   - [ ] User logs into ImageTrend → Medic Bot widget loads → No additional login required
   - [ ] User session expires → Re-authentication flow works
   - [ ] User logs out of ImageTrend → Medic Bot session invalidated

2. **Patient Data Sync**:
   - [ ] User updates patient age in ImageTrend → Medic Bot reflects change
   - [ ] User adds medication in ImageTrend → Medic Bot medication list updates
   - [ ] User changes chief complaint → Medic Bot context updates

3. **Narrative Export**:
   - [ ] User queries Medic Bot → Gets protocol guidance
   - [ ] User clicks "Export to PCR" → Narrative populates ImageTrend narrative field
   - [ ] User queries multiple times → Narrative concatenates correctly

4. **Medication Calculation**:
   - [ ] User calculates medication dose → Dose appears in ImageTrend medication record
   - [ ] User edits dose in ImageTrend → Medic Bot reflects change

**Tasks**:
- [ ] Create comprehensive E2E test suite
- [ ] Set up ImageTrend sandbox test environment
- [ ] Execute test scenarios
- [ ] Document test results
- [ ] Fix identified issues

**Files to Create**:
- `tests/e2e/imagetrend-handshake.test.ts`
- `tests/e2e/imagetrend-auth.test.ts`
- `tests/e2e/imagetrend-data-sync.test.ts`
- `tests/e2e/imagetrend-narrative-export.test.ts`

#### Week 3-4: Performance Testing

**Performance Targets**:
- Widget load time: < 2 seconds
- Patient data sync: < 500ms
- Narrative export: < 1 second
- Medication sync: < 500ms

**Tasks**:
- [ ] Profile widget load performance
- [ ] Optimize bundle size for embedded mode
- [ ] Test data sync latency
- [ ] Load test with multiple concurrent users
- [ ] Optimize API calls (batch requests if possible)

---

### Month 11: Medical & Security Validation

#### Week 1-2: Medical Director Review

**Validation Requirements**:
- [ ] Medical director reviews 50+ integration scenarios
- [ ] Validates narrative accuracy in ImageTrend context
- [ ] Verifies protocol references are correct
- [ ] Confirms medication doses match ImageTrend records
- [ ] Approves integration for pilot use

**Deliverables**:
- Medical director sign-off document
- Validation test results

#### Week 3-4: Security & Compliance Audit

**Security Requirements**:
- [ ] HIPAA compliance review (data in transit, at rest)
- [ ] ImageTrend security requirements review
- [ ] Penetration testing of integration endpoints
- [ ] OAuth/SAML security audit
- [ ] PostMessage security review (origin validation)
- [ ] Audit logging validation (ImageTrend user tracking)

**Compliance Tasks**:
- [ ] Review ImageTrend BAA requirements
- [ ] Update Medic Bot BAA to include ImageTrend integration
- [ ] Document data flow for compliance
- [ ] Create security incident response plan

**Deliverables**:
- Security audit report
- Compliance documentation
- Updated BAA documentation

---

## Phase 5: Pilot Deployment (Months 12-13)

### Month 12: Pilot Station Selection & Training

#### Week 1-2: Pilot Station Setup

**Pilot Selection Criteria**:
- Mix of high/low call volume stations
- Mix of urban/suburban areas
- Stations with tech-savvy paramedics
- Stations using ImageTrend Elite actively

**Tasks**:
- [ ] Select 3-5 pilot stations
- [ ] Recruit 20-30 pilot paramedics
- [ ] Schedule ImageTrend Elite training (if needed)
- [ ] Schedule Medic Bot training sessions
- [ ] Set up support channels (Slack, email, phone)

#### Week 3-4: Training & Documentation

**Training Materials**:
- [ ] Create ImageTrend integration user guide
- [ ] Record video walkthrough
- [ ] Create quick-reference card
- [ ] Conduct training sessions (in-person or virtual)
- [ ] Create FAQ document

**Training Topics**:
- How to access Medic Bot in ImageTrend
- How to sync patient data
- How to export narratives
- How to calculate medications
- How to reference protocols
- Troubleshooting common issues

**Files to Create**:
- `docs/imagetrend-user-guide.md`
- `docs/imagetrend-training-slides.md`
- `docs/imagetrend-faq.md`

---

### Month 13: Pilot Monitoring & Feedback

#### Week 1-2: Pilot Launch

**Launch Checklist**:
- [ ] ImageTrend widget deployed to pilot stations
- [ ] Support team on standby
- [ ] Monitoring dashboards active
- [ ] Feedback collection mechanism ready
- [ ] Daily check-ins scheduled

**Launch Activities**:
- [ ] Soft launch (1-2 stations, limited users)
- [ ] Monitor error rates and performance
- [ ] Collect initial feedback
- [ ] Address critical issues immediately
- [ ] Expand to remaining pilot stations

#### Week 3-4: Feedback Collection & Iteration

**Feedback Mechanisms**:
- [ ] In-app feedback form
- [ ] Weekly survey emails
- [ ] Focus group sessions
- [ ] Usage analytics review
- [ ] Support ticket analysis

**Metrics to Track**:
- Widget usage frequency
- Narrative export frequency
- Medication calculation usage
- User satisfaction scores
- Error rates
- Performance metrics (load time, sync time)

**Tasks**:
- [ ] Collect feedback from pilot users
- [ ] Prioritize improvement requests
- [ ] Implement high-priority fixes
- [ ] Plan iteration cycles

---

## Phase 6: Production Rollout (Months 14-18)

### Month 14: Security & Compliance Finalization

**Tasks**:
- [ ] Final security audit
- [ ] Compliance sign-off from LA County IT Security
- [ ] ImageTrend production environment provisioning
- [ ] Production OAuth credentials configured
- [ ] Monitoring and alerting setup

---

### Month 15: Staged Rollout

**Rollout Strategy**:
- Week 1: 10 stations (100 paramedics)
- Week 2: 20 stations (200 paramedics)
- Week 3: 40 stations (400 paramedics)
- Week 4: Full deployment (all stations)

**Tasks**:
- [ ] Execute staged rollout
- [ ] Monitor adoption rates
- [ ] Collect feedback at each stage
- [ ] Address issues promptly
- [ ] Adjust rollout pace based on feedback

---

### Months 16-18: Optimization & Support

**Ongoing Tasks**:
- [ ] Performance optimization based on production data
- [ ] Feature enhancements based on user feedback
- [ ] Bug fixes and stability improvements
- [ ] Documentation updates
- [ ] Training new users
- [ ] Support ticket resolution

---

## Technical Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ImageTrend Elite                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ePCR Interface                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Medic Bot Widget (iframe)                    │   │   │
│  │  │  ┌──────────────────────────────────────┐   │   │   │
│  │  │  │  Chat Interface                      │   │   │   │
│  │  │  │  Medication Calculator                │   │   │   │
│  │  │  │  Protocol Reference                   │   │   │   │
│  │  │  └──────────────────────────────────────┘   │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ PostMessage API
                          │ OAuth Token
                          │ Patient Data
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Medic Bot Application                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Embedding Layer                                      │   │
│  │  - PostMessage Handler                               │   │
│  │  - Patient Context Service                          │   │
│  │  - PCR Update Service                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Core Services                                        │   │
│  │  - Chat Service                                       │   │
│  │  - Protocol Retrieval                                 │   │
│  │  - Medication Calculators                            │   │
│  │  - Narrative Generation                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ImageTrend Integration API                           │   │
│  │  - Authentication (OAuth)                            │   │
│  │  - Patient Data API                                  │   │
│  │  - PCR Update API                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User opens ImageTrend Elite PCR
   ↓
2. ImageTrend loads Medic Bot widget (iframe)
   ↓
3. Medic Bot requests OAuth authorization
   ↓
4. ImageTrend sends patient data via PostMessage
   ↓
5. Medic Bot receives patient data, updates context
   ↓
6. User queries Medic Bot (protocol, medication, etc.)
   ↓
7. Medic Bot processes query, returns response
   ↓
8. User clicks "Export to PCR"
   ↓
9. Medic Bot formats narrative, sends to ImageTrend API
   ↓
10. ImageTrend PCR fields updated
```

---

## Dependencies & Risks

### External Dependencies

**Critical**:
- ImageTrend Partner Program approval
- ImageTrend API access and documentation
- ImageTrend sandbox/test environment
- ImageTrend production environment provisioning
- ImageTrend OAuth credentials

**Important**:
- LA County Fire Department approval for integration
- Legal review of ImageTrend partner agreement
- IT Security approval for integration architecture
- Medical Director approval for embedded workflow

### Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **ImageTrend API changes** | High | Version API calls, maintain abstraction layer, regular communication with ImageTrend |
| **OAuth/SAML complexity** | High | Early testing in sandbox, ImageTrend support, detailed documentation |
| **Performance in iframe** | Medium | Optimize bundle size, lazy loading, performance monitoring |
| **Data sync conflicts** | Medium | Clear conflict resolution strategy, user confirmation for overwrites |
| **User adoption** | Medium | Comprehensive training, easy-to-use UI, responsive support |
| **Security vulnerabilities** | High | Regular security audits, penetration testing, ImageTrend security review |

---

## Success Metrics

### Integration Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Widget load time** | < 2 seconds | P95 latency |
| **OAuth success rate** | > 99% | Percentage of successful auth flows |
| **Data sync latency** | < 500ms | Time from ImageTrend update to Medic Bot reflect |
| **Narrative export success** | > 98% | Percentage of successful exports |
| **User adoption** | > 70% of paramedics | Percentage using widget within 30 days |

### Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time saved per PCR** | 30-60 seconds | User surveys, time tracking |
| **Protocol compliance** | Maintain 98%+ | Medical director review |
| **User satisfaction** | > 85% | Post-pilot survey |
| **Error reduction** | 20% reduction | Compare pre/post integration error rates |

---

## Resource Requirements

### Team Structure

**Required Roles**:
- **Project Manager** (1) - Overall coordination
- **Backend Engineer** (1-2) - API integration, authentication
- **Frontend Engineer** (1-2) - Widget development, UI/UX
- **Integration Specialist** (1) - ImageTrend API expertise
- **QA Engineer** (1) - Testing, validation
- **Medical Director** (0.5 FTE) - Validation, approval
- **Support Staff** (1) - Pilot support, documentation

### Budget Estimate

| Phase | Duration | Estimated Cost |
|-------|----------|----------------|
| Phase 0: Partnership | 2 months | $10,000 (legal, partner fees) |
| Phase 1: Foundation | 2 months | $40,000 (development) |
| Phase 2: Data Integration | 3 months | $60,000 (development) |
| Phase 3: UI/UX | 2 months | $30,000 (design, development) |
| Phase 4: Testing | 2 months | $25,000 (testing, validation) |
| Phase 5: Pilot | 2 months | $15,000 (support, training) |
| Phase 6: Rollout | 5 months | $20,000 (monitoring, support) |
| **Total** | **18 months** | **$200,000** |

*Note: Costs exclude ImageTrend licensing (if required) and infrastructure hosting*

---

## Appendix

### A. ImageTrend API Endpoints (Expected)

Based on ImageTrend integration documentation review:

```
Authentication:
  GET  /oauth/authorize
  POST /oauth/token
  POST /oauth/revoke

Patient Data:
  GET  /api/v1/patients/{patientId}
  GET  /api/v1/pcrs/{pcrId}

PCR Updates:
  POST /api/v1/pcrs/{pcrId}/narrative
  POST /api/v1/pcrs/{pcrId}/medications
  PUT  /api/v1/pcrs/{pcrId}/fields

Widget Embedding:
  GET  /widgets/medicbot/config
```

*Note: Actual endpoints will be confirmed during Phase 0*

### B. Integration Checklist Template

For each integration component:

- [ ] API endpoint identified
- [ ] Documentation reviewed
- [ ] Test credentials obtained
- [ ] Implementation completed
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Sandbox testing completed
- [ ] Medical validation (if applicable)
- [ ] Security review completed
- [ ] Documentation updated

### C. ImageTrend Contact Information

*To be populated during Phase 0*

- Partner Relations Manager: [TBD]
- Technical Integration Lead: [TBD]
- Support Contact: [TBD]
- API Documentation Portal: [TBD]

---

## Document Control

**Version History**:
- v1.0 (January 2025) - Initial roadmap creation

**Review Schedule**:
- Monthly review during active development
- Quarterly review during pilot and rollout phases

**Approval**:
- [ ] LA County Fire Department - Project Sponsor
- [ ] Medical Director
- [ ] IT Security Officer
- [ ] ImageTrend Partner Relations Manager

---

**Next Steps**:
1. Review and approve roadmap with stakeholders
2. Initiate Phase 0: ImageTrend Partner Program enrollment
3. Schedule kickoff meeting with ImageTrend technical team
4. Begin Phase 0 documentation gathering

