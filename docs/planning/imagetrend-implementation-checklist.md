# ImageTrend Integration - Implementation Checklist

**Quick reference checklist** for developers implementing ImageTrend integration.

---

## Phase 0: Partnership & Prerequisites

### Partnership & Documentation
- [ ] Research ImageTrend Industry Partner Program
- [ ] Complete partner program application
- [ ] Submit LA County Fire Department credentials
- [ ] Schedule kickoff meeting with ImageTrend
- [ ] Obtain ImageTrend Elite API documentation
- [ ] Request sandbox/test environment access
- [ ] Review ImageTrend security requirements (FedRAMP)
- [ ] Document API endpoints and authentication methods

---

## Phase 1: Foundation - Embedding Architecture

### PostMessage & Embedding Infrastructure
- [ ] Create `lib/embedding/postmessage-handler.ts`
  - [ ] Implement message validation (origin checking)
  - [ ] Handle `imagetrend:patient-data` events
  - [ ] Handle `imagetrend:auth-token` events
  - [ ] Send `medicbot:narrative-ready` events
  - [ ] Send `medicbot:protocol-selected` events
- [ ] Create `lib/embedding/embedding-config.ts`
  - [ ] Define `EmbeddingConfig` interface
  - [ ] Add provider detection (`imagetrend` vs `standalone`)
  - [ ] Add iframe mode detection
- [ ] Create `app/components/embedded/iframe-wrapper.tsx`
  - [ ] Wrap application in iframe-aware component
  - [ ] Initialize PostMessage listener
  - [ ] Handle parent window communication

### Patient Context Service
- [ ] Create `lib/services/imagetrend/patient-context-service.ts`
  - [ ] Implement `setPatientData()` method
  - [ ] Implement `getPatientContext()` method
  - [ ] Implement `syncMedications()` method
- [ ] Create `lib/types/imagetrend.ts`
  - [ ] Define `ImageTrendPatientData` interface
  - [ ] Define `ImageTrendMedication` interface
  - [ ] Define `ImageTrendPCRFields` interface
- [ ] Create `app/contexts/patient-context.tsx`
  - [ ] React Context for patient data
  - [ ] Provider component
  - [ ] Hook: `usePatientContext()`
- [ ] Create `app/components/embedded/patient-info-panel.tsx`
  - [ ] Display patient demographics (read-only)
  - [ ] Display chief complaint
  - [ ] Display vitals
  - [ ] Show sync status indicator

### Authentication (OAuth/SAML)
- [ ] Create `lib/auth/imagetrend-auth.ts`
  - [ ] Implement `initiateAuth()` method
  - [ ] Implement `exchangeCode()` method
  - [ ] Implement `validateToken()` method
  - [ ] Implement `revokeToken()` method
- [ ] Create `app/api/auth/imagetrend/authorize/route.ts`
  - [ ] Redirect to ImageTrend OAuth endpoint
  - [ ] Handle authorization parameters
- [ ] Create `app/api/auth/imagetrend/callback/route.ts`
  - [ ] Exchange authorization code for token
  - [ ] Create user session
  - [ ] Redirect to embedded widget
- [ ] Create `app/api/auth/imagetrend/logout/route.ts`
  - [ ] Revoke ImageTrend token
  - [ ] Clear session
- [ ] Create `lib/middleware/imagetrend-auth-middleware.ts`
  - [ ] Validate ImageTrend tokens
  - [ ] Extract user context from token
  - [ ] Handle token refresh

### User Context & RBAC
- [ ] Create `lib/types/imagetrend-user.ts`
  - [ ] Define `ImageTrendUser` interface
  - [ ] Define role types (`paramedic`, `emt`, `supervisor`, `medical_director`)
- [ ] Create `lib/auth/rbac.ts`
  - [ ] Implement role-based access control
  - [ ] Define permission checks
- [ ] Create `app/contexts/user-context.tsx`
  - [ ] React Context for user data
  - [ ] Provider component
  - [ ] Hook: `useUserContext()`

### Compact UI Components
- [ ] Create `app/components/embedded/compact-chat.tsx`
  - [ ] Reduced header height
  - [ ] Collapsible chat history
  - [ ] Compact message display
- [ ] Modify `app/components/chat/chat-interface.tsx`
  - [ ] Add compact mode variant
  - [ ] Conditional rendering based on embedding config
- [ ] Modify `app/layout.tsx`
  - [ ] Add embedding context provider
  - [ ] Conditional layout for embedded mode
- [ ] Modify `app/components/root-layout-content.tsx`
  - [ ] Conditional rendering for embedded mode
  - [ ] Hide non-essential UI elements in embedded mode

---

## Phase 2: Data Integration

### Field Mapping
- [ ] Create `lib/mappers/imagetrend-field-mapper.ts`
  - [ ] Implement `mapPatientData()` method
  - [ ] Implement `mapNarrativeToPCR()` method
  - [ ] Implement `mapMedications()` method
  - [ ] Handle missing/null fields gracefully
- [ ] Create `docs/imagetrend-field-mapping.md`
  - [ ] Document ImageTrend PCR field structure
  - [ ] Document mapping rules
  - [ ] Document field validation requirements

### Data Synchronization
- [ ] Create `lib/services/imagetrend/data-sync-service.ts`
  - [ ] Implement real-time patient data listener
  - [ ] Add debouncing for rapid updates
  - [ ] Implement conflict resolution
- [ ] Create `app/hooks/use-imagetrend-sync.ts`
  - [ ] Hook for patient data sync
  - [ ] Handle sync status updates
  - [ ] Display sync indicators

### Narrative Export & PCR Population
- [ ] Create `lib/narrative/imagetrend-formatter.ts`
  - [ ] Implement `formatNarrative()` method
  - [ ] Implement `splitIntoFields()` method (if needed)
  - [ ] Implement `formatCitations()` method
- [ ] Modify `lib/narrative/builder.ts`
  - [ ] Add ImageTrend formatting option
  - [ ] Support ImageTrend-specific field limits
- [ ] Create `lib/services/imagetrend/pcr-update-service.ts`
  - [ ] Implement `updateNarrative()` method
  - [ ] Implement `updateMedications()` method
  - [ ] Implement `updateProtocols()` method
  - [ ] Add error handling and retry logic
- [ ] Create `app/api/integrations/imagetrend/pcr/update/route.ts`
  - [ ] Endpoint for PCR field updates
  - [ ] Validate request payload
  - [ ] Call ImageTrend API
  - [ ] Return success/error response
- [ ] Modify `app/components/embedded/compact-chat.tsx`
  - [ ] Add "Export to PCR" button
  - [ ] Show export status (loading, success, error)
  - [ ] Handle user confirmation before export

### Medication Synchronization
- [ ] Create `lib/services/imagetrend/medication-sync.ts`
  - [ ] Implement `syncFromImageTrend()` method
  - [ ] Implement `syncToImageTrend()` method
  - [ ] Implement `calculateAndSync()` method
- [ ] Create `lib/mappers/medication-mapper.ts`
  - [ ] Map Medic Bot medication IDs to ImageTrend codes
  - [ ] Handle medication conflicts
- [ ] Modify `app/dosing/page.tsx`
  - [ ] Add "Add to PCR" button (embedded mode only)
  - [ ] Trigger medication sync on calculation
- [ ] Modify `lib/dosing/calculators/*`
  - [ ] Trigger sync after successful calculation

### Protocol Integration
- [ ] Create `lib/services/imagetrend/protocol-integration.ts`
  - [ ] Implement `trackProtocolUsage()` method
  - [ ] Implement `exportProtocolReferences()` method
  - [ ] Implement `preloadProtocols()` method
- [ ] Modify `lib/services/chat/protocol-retrieval-service.ts`
  - [ ] Track protocol usage per PCR ID
  - [ ] Link protocols to active PCR session
- [ ] Modify `app/components/embedded/compact-chat.tsx`
  - [ ] Display active protocol references
  - [ ] Show protocol pre-loading status

---

## Phase 3: UI/UX Optimization

### Responsive Widget Design
- [ ] Create `app/components/embedded/protocol-sidebar.tsx`
  - [ ] Quick-access protocol list
  - [ ] Collapsible sidebar
- [ ] Create `app/components/embedded/medication-widget.tsx`
  - [ ] Compact medication calculator
  - [ ] Quick dose calculation
- [ ] Create `app/styles/embedded.css`
  - [ ] Compact spacing rules
  - [ ] Responsive breakpoints
  - [ ] Mobile-first styles

### Theme Integration
- [ ] Create `app/styles/themes/imagetrend-theme.css`
  - [ ] ImageTrend color scheme
  - [ ] ImageTrend typography
  - [ ] ImageTrend component styles
- [ ] Test theme in ImageTrend sandbox environment

### Keyboard Shortcuts
- [ ] Modify `app/components/keyboard-shortcuts.tsx`
  - [ ] Add embedded-specific shortcuts:
    - [ ] `Ctrl+E` - Export narrative to PCR
    - [ ] `Ctrl+M` - Open medication calculator
    - [ ] `Ctrl+P` - Open protocol selector
    - [ ] `Ctrl+R` - Refresh patient data
  - [ ] Document shortcuts in help modal

### Onboarding & Help
- [ ] Create `app/components/embedded/onboarding-flow.tsx`
  - [ ] First-time user walkthrough
  - [ ] Key features explanation
- [ ] Create `docs/imagetrend-user-guide.md`
  - [ ] User documentation
  - [ ] Step-by-step instructions
- [ ] Create `docs/imagetrend-faq.md`
  - [ ] Common questions
  - [ ] Troubleshooting guide

---

## Phase 4: Testing & Validation

### Integration Testing
- [ ] Create `tests/e2e/imagetrend-handshake.test.ts`
  - [ ] Widget load and initialization
  - [ ] PostMessage communication
- [ ] Create `tests/e2e/imagetrend-auth.test.ts`
  - [ ] OAuth flow end-to-end
  - [ ] Token validation
  - [ ] Session management
- [ ] Create `tests/e2e/imagetrend-data-sync.test.ts`
  - [ ] Patient data sync
  - [ ] Conflict resolution
- [ ] Create `tests/e2e/imagetrend-narrative-export.test.ts`
  - [ ] Narrative formatting
  - [ ] PCR field population
  - [ ] Error handling

### Performance Testing
- [ ] Profile widget load time
- [ ] Optimize bundle size for embedded mode
- [ ] Test data sync latency
- [ ] Load test with concurrent users
- [ ] Optimize API calls (batching)

### Medical Validation
- [ ] Medical director reviews 50+ scenarios
- [ ] Validates narrative accuracy
- [ ] Verifies protocol references
- [ ] Confirms medication dose accuracy
- [ ] Obtains medical director sign-off

### Security Audit
- [ ] HIPAA compliance review
- [ ] ImageTrend security requirements review
- [ ] Penetration testing
- [ ] OAuth/SAML security audit
- [ ] PostMessage security review
- [ ] Audit logging validation

---

## Phase 5: Pilot Deployment

### Pilot Setup
- [ ] Select 3-5 pilot stations
- [ ] Recruit 20-30 pilot paramedics
- [ ] Schedule ImageTrend Elite training
- [ ] Schedule Medic Bot training sessions
- [ ] Set up support channels

### Training Materials
- [ ] Create user guide (`docs/imagetrend-user-guide.md`)
- [ ] Record video walkthrough
- [ ] Create quick-reference card
- [ ] Conduct training sessions
- [ ] Create FAQ document

### Monitoring
- [ ] Set up monitoring dashboards
- [ ] Track widget usage frequency
- [ ] Track narrative export frequency
- [ ] Track medication calculation usage
- [ ] Monitor error rates
- [ ] Collect user feedback

---

## Phase 6: Production Rollout

### Production Setup
- [ ] Final security audit
- [ ] Compliance sign-off
- [ ] ImageTrend production environment provisioning
- [ ] Production OAuth credentials configured
- [ ] Monitoring and alerting setup

### Staged Rollout
- [ ] Week 1: 10 stations (100 paramedics)
- [ ] Week 2: 20 stations (200 paramedics)
- [ ] Week 3: 40 stations (400 paramedics)
- [ ] Week 4: Full deployment (all stations)

### Ongoing Support
- [ ] Performance optimization
- [ ] Feature enhancements
- [ ] Bug fixes
- [ ] Documentation updates
- [ ] Training new users
- [ ] Support ticket resolution

---

## Testing Checklist (Per Component)

For each component created, verify:

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Error handling implemented
- [ ] Logging/audit trail in place
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Sandbox testing completed (if applicable)

---

## Documentation Checklist

- [ ] API documentation updated
- [ ] User guide created/updated
- [ ] Developer documentation updated
- [ ] Integration guide created
- [ ] Troubleshooting guide created
- [ ] FAQ document created

---

**Status Tracking**: Update checkboxes as work progresses. Use this checklist in conjunction with the full roadmap document.

