# Handoff: Facility & Clinical Systems Implementation

## Completed This Session

### 1. Database Schema (Supabase Migrations)
- `supabase/migrations/007_facility_diversion.sql` — Diversion status, APOT tracking, alternate routing
- `supabase/migrations/008_mci_resources.sql` — MCI events, patients, bed availability, resources
- `supabase/migrations/009_versioned_refs.sql` — Reference document versioning, treatment protocols, MCG

### 2. Diversion/Bypass System (`lib/clinical/diversion/`)
- `types.ts` — DiversionType, DiversionStatus, APOTRecord, FacilityOperationalStatus
- `DiversionManager.ts` — Start/end diversions, APOT recording, alternate routing
- `index.ts` — Module exports

### 3. MCI System (`lib/clinical/mci/`)
- `types.ts` — MCILevel, TriageCategory, MCIEvent, MCIPatient, STARTAssessment
- `triage-algorithm.ts` — START (adults) and JumpSTART (pediatrics) algorithms
- `MCIManager.ts` — MCI event management, patient tracking, bed availability
- `index.ts` — Module exports

### 4. Protocol Updates System (`lib/protocols/updates/`)
- `types.ts` — ProtocolChange, MCGChange, ChangeType, ClinicalImpact
- `update-registry.ts` — 2024-2025 protocol/MCG changes (TP 1209-1250, MCG 1303-1321)
- `ProtocolUpdateManager.ts` — Version tracking, change queries, markdown export
- `index.ts` — Module exports

### 5. API Endpoints
- `app/api/diversion/route.ts` — GET/POST for diversion status
- `app/api/mci/route.ts` — GET/POST for MCI operations (declare, triage, transport, beds)
- `app/api/protocol-updates/route.ts` — GET for protocol change queries

### 6. Integration Layer
- `lib/db/facility-sync.ts` — Supabase client for facility data persistence
- `lib/services/chat/facility-integration.ts` — Diversion-aware transport recommendations

### 7. Unit Tests (91 passing)
- `tests/unit/clinical/diversion/DiversionManager.test.ts`
- `tests/unit/clinical/mci/triage-algorithm.test.ts`
- `tests/unit/clinical/mci/MCIManager.test.ts`
- `tests/unit/protocols/updates/ProtocolUpdateManager.test.ts`

---

## Completed in Follow-up Session

### 1. Chat Integration (✅ DONE)
FacilityIntegrationService wired into ChatService:
- `lib/managers/chat-service.ts` — Updated `handleTransportRecommendation()` with diversion-aware logic
- Added new tool handlers: `handleDiversionStatus()`, `handleFacilityStatus()`
- `lib/services/chat/protocol-tool-manager.ts` — Added `get_diversion_status`, `get_facility_status` tools

### 2. UI Components (✅ DONE)

#### MCI Dashboard (`app/components/mci/`)
- `mci-dashboard.tsx` — Full MCI event display with triage counts, transport progress, patient tracking
- `triage-input-panel.tsx` — START/JumpSTART triage flow with step-by-step guidance
- `index.ts` — Module exports

#### Diversion Status Panel (`app/components/diversion/`)
- `diversion-status-panel.tsx` — Real-time hospital diversion status display (full/compact modes)
- `index.ts` — Module exports

### 3. Integration Tests (✅ DONE - 39 passing)
- `tests/integration/api/diversion.test.ts` — 10 tests for diversion API
- `tests/integration/api/mci.test.ts` — 16 tests for MCI API
- `tests/integration/api/protocol-updates.test.ts` — 13 tests for protocol updates API

### 4. Real-time Subscriptions (✅ DONE)
- `lib/db/realtime-diversion.ts` — Supabase realtime subscriptions service
- `app/hooks/use-realtime-diversion.ts` — React hooks for live diversion updates:
  - `useRealtimeDiversion()` — Main subscription hook
  - `useFacilityAcceptingStatus()` — Check specific facility status
  - `useRegionalDiversionSummary()` — Regional diversion summary

---

## Not Yet Done

### 1. Run Supabase Migrations
Migrations are written but not applied:
```bash
supabase db push
# or
supabase migration up
```

### 2. Protocol Changes View (UI)
No UI built yet for:
- Protocol Changes View (high-impact changes, training requirements)

### 3. Connect DiversionManager to Supabase
For production persistence:
- Call `facilitySync` methods from `DiversionManager` operations
- Add sync on startup to load existing diversions

### 4. Redis for Horizontal Scaling
If scaling horizontally, consider Redis for cross-instance diversion state.

---

## Key Files to Review

```
lib/clinical/
├── diversion/
│   ├── DiversionManager.ts    # Main diversion service
│   ├── types.ts               # Type definitions
│   └── index.ts
├── mci/
│   ├── MCIManager.ts          # MCI event management
│   ├── triage-algorithm.ts    # START/JumpSTART
│   ├── types.ts
│   └── index.ts
├── facilities/                # Hospital data (already existed)
├── FacilityManager.ts         # Facility queries (already existed)
└── transport-destinations.ts  # Transport recommendations (already existed)

lib/protocols/updates/
├── ProtocolUpdateManager.ts   # Version tracking
├── update-registry.ts         # 2024-2025 changes data
├── types.ts
└── index.ts

lib/db/
├── facility-sync.ts           # Supabase client for facility data
└── realtime-diversion.ts      # Supabase realtime subscriptions

lib/services/chat/
├── facility-integration.ts    # Diversion-aware transport recommendations
└── protocol-tool-manager.ts   # LLM function calling tools (updated)

lib/managers/
└── chat-service.ts            # Main chat service (updated with diversion handlers)

app/components/
├── mci/
│   ├── mci-dashboard.tsx      # MCI event dashboard
│   ├── triage-input-panel.tsx # START triage UI
│   └── index.ts
└── diversion/
    ├── diversion-status-panel.tsx  # Real-time diversion display
    └── index.ts

app/hooks/
└── use-realtime-diversion.ts  # React hooks for live updates

app/api/
├── diversion/route.ts         # Diversion API (fixed handler pattern)
├── mci/route.ts               # MCI API (fixed handler pattern)
└── protocol-updates/route.ts  # Protocol updates API (fixed handler pattern)

tests/integration/api/
├── diversion.test.ts          # 10 tests
├── mci.test.ts                # 16 tests
└── protocol-updates.test.ts   # 13 tests

supabase/migrations/
├── 007_facility_diversion.sql
├── 008_mci_resources.sql
└── 009_versioned_refs.sql
```

---

## Quick Test Commands

```bash
# Run all new tests
npm run test -- tests/unit/clinical tests/unit/protocols tests/integration/api

# Test specific module
npm run test -- tests/unit/clinical/mci

# Run integration tests only
npm run test -- tests/integration/api

# Check TypeScript
npx tsc --noEmit
```

---

## API Quick Reference

```bash
# Diversion
GET  /api/diversion?facilityId=CSM
GET  /api/diversion?region=West
POST /api/diversion {"action":"start","facilityId":"CSM","diversionType":"stemi_bypass"}
POST /api/diversion {"action":"end","facilityId":"CSM"}

# MCI
GET  /api/mci
GET  /api/mci?eventId=xxx&includePatients=true
POST /api/mci {"action":"declare","incidentType":"MVC","location":"...","region":"West","mciLevel":"level_2"}
POST /api/mci {"action":"triage","assessment":{...}}
POST /api/mci {"action":"addPatient","eventId":"xxx","triageCategory":"immediate"}
POST /api/mci {"action":"transport","eventId":"xxx","patientId":"xxx","unitId":"RA101","facilityId":"CSM"}

# Protocol Updates
GET  /api/protocol-updates?summary=true
GET  /api/protocol-updates?tpCode=1210
GET  /api/protocol-updates?impact=high
GET  /api/protocol-updates?format=markdown
```

---

## Component Usage Examples

### MCI Dashboard

```tsx
import { MCIDashboard } from '@/app/components/mci';

<MCIDashboard 
  eventId="MCI-20250106-001" 
  onClose={() => setShowMCI(false)}
  refreshIntervalMs={15000}
/>
```

### Triage Input Panel

```tsx
import { TriageInputPanel } from '@/app/components/mci';

<TriageInputPanel
  eventId="MCI-20250106-001"
  onTriageComplete={(result) => console.log('Triage:', result)}
  onAddPatient={(patientId) => console.log('Added:', patientId)}
/>
```

### Diversion Status Panel

```tsx
import { DiversionStatusPanel } from '@/app/components/diversion';

// Full panel
<DiversionStatusPanel region="Central" refreshIntervalMs={30000} />

// Compact view
<DiversionStatusPanel compact />
```

### Realtime Hook

```tsx
import { useRealtimeDiversion } from '@/app/hooks/use-realtime-diversion';

const { diversions, isLoading, lastUpdated, refresh } = useRealtimeDiversion({
  region: 'Central',
  pollIntervalMs: 30000,
});
```
