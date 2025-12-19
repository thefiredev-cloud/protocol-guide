# Research → Implementation Map

**Source**: CountyMedic × ImageTrend × LA County Fire Research Report  
**Date**: December 2025  
**Purpose**: Map 240+ research citations to specific codebase implementation points

---

## Current State Assessment

### Already Implemented ✅
| Research Finding | Current Implementation |
|-----------------|----------------------|
| Zero-hallucination protocol retrieval | `lib/managers/RetrievalManager.ts` - BM25 chunked search |
| 22 pediatric dosing calculators | `lib/dosing/calculators/*` - Full registry |
| NEMSIS-compliant narratives | `lib/managers/NarrativeManager.ts` - SOAP/Chronological/NEMSIS |
| Offline-first PWA | Service worker, chunked KB in `lib/storage/` |
| HIPAA audit logging (6-year) | `lib/audit/audit-logger.ts` |
| ePCR narrative export API | `app/api/integrations/epcr/narrative/route.ts` |
| Protocol citation service | `lib/services/chat/citation-service.ts` |

### Needs Implementation 🔧
| Research Finding | Target Location |
|-----------------|----------------|
| ImageTrend Elite API integration | `lib/services/imagetrend/` (planned) |
| Documentation time tracking | New: `lib/metrics/documentation-timer.ts` |
| Billing-optimized narratives | Enhance: `lib/narrative/builder.ts` |
| ESO-competitive AI features | Enhance: `lib/managers/chat-service.ts` |

---

## 1. ESO Competitive Response

**Research**: ESO achieved 1,670 agencies in first month with AI narratives. 35,700 hours returned.

### Implementation Priority: HIGH

**Current Gap**: County Medic has narrative generation but lacks auto-generation from structured data.

**Files to Modify**:

```
lib/narrative/builder.ts
├── Add: generateFromStructuredInput() - Auto-narrative from vitals/interventions
├── Add: templateBasedGeneration() - Protocol-specific templates
└── Add: billingOptimizedFormat() - Structured for claim acceptance

lib/managers/ProtocolDocBuilder.ts
├── Expand: Protocol-specific documentation templates (only 1242 exists)
├── Add: Common protocols (Chest Pain, Stroke, Trauma, Respiratory)
└── Add: Required fields validation per protocol
```

**New Files**:
```
lib/narrative/auto-generator.ts
├── AutoNarrativeGenerator class
├── generateFromPatientContext(context: PatientContext): NarrativeDraft
├── generateFromTimeline(events: TimelineEvent[]): NarrativeDraft
└── validateCompleteness(draft: NarrativeDraft): ValidationResult

lib/narrative/templates/
├── chest-pain.ts
├── respiratory.ts  
├── trauma.ts
├── stroke.ts
├── pediatric.ts
└── cardiac-arrest.ts
```

---

## 2. Documentation Crisis (60% of EMS Leaders)

**Research**: National EMS Documentation Survey - 60% cite documentation as top challenge. 45% of medical directors say narratives lack detail.

### Implementation Priority: HIGH

**Files to Enhance**:

```
lib/managers/NarrativeManager.ts (line 46-168)
├── Enhance: buildSOAP() - Add more granular sections
├── Add: validateNarrativeCompleteness() - Flag missing elements
├── Add: suggestMissingElements() - Prompt for missing data
└── Add: getRequiredFieldsForProtocol(code: string): string[]

lib/narrative/builder.ts (line 1-180)
├── Add: NarrativeCompletionScore - Calculate documentation completeness
├── Add: BillingReadinessScore - Predict claim acceptance likelihood
└── Add: generateSuggestions() - AI suggestions for incomplete sections
```

**New Files**:
```
lib/narrative/completeness-validator.ts
├── CompletenessValidator class
├── validateForBilling(narrative: NarrativeDraft): BillingValidation
├── calculateCompletenessScore(narrative: NarrativeDraft): number
├── getMissingRequiredFields(): string[]
└── getRecommendations(): Recommendation[]

lib/narrative/billing-optimizer.ts
├── BillingOptimizer class
├── structureForClaims(narrative: NarrativeDraft): StructuredNarrative
├── addMedicalNecessity(narrative: NarrativeDraft): NarrativeDraft
└── flagPotentialDenialRisks(): DenialRisk[]
```

---

## 3. Pediatric Dosing Errors (35% Error Rate)

**Research**: Michigan study - 35% pediatric dosing errors AFTER written guidelines. Dextrose 75%, Glucagon 75%, Fentanyl 68% error rates.

### Implementation Priority: CRITICAL

**Current State**: 22 calculators exist in `lib/dosing/calculators/`

**Files to Enhance**:

```
lib/dosing/calculators/dextrose.ts (HIGH PRIORITY - 75% error rate)
├── Add: Stricter weight validation bounds
├── Add: Age-appropriate concentration selection (D50/D25/D10)
├── Add: Volume calculation with max single dose
└── Add: Visual warning for pediatric doses

lib/dosing/calculators/glucagon.ts (HIGH PRIORITY - 75% error rate)
├── Add: Weight-based pediatric dosing
├── Add: Age cutoffs for adult vs pediatric
├── Add: Route-specific dosing (IM vs IN)
└── Add: Max dose validation

lib/dosing/calculators/fentanyl.ts (HIGH PRIORITY - 68% error rate)
├── Add: Stricter weight bounds for pediatrics
├── Add: IN vs IV route differentiation
├── Add: Incremental dosing guidance
└── Add: Max total dose tracking
```

**New Files**:
```
lib/dosing/safety/
├── pediatric-bounds-validator.ts
│   ├── validateWeightBounds(weight: number, ageYears: number): ValidationResult
│   ├── validateDoseRange(dose: number, medication: string, weight: number): ValidationResult
│   └── getMaxSingleDose(medication: string, weight: number): number
├── dosing-audit-trail.ts
│   ├── logCalculation(request, result): void
│   └── flagHighRiskDose(result): void
└── error-prevention.ts
    ├── requireConfirmation(dose: MedicationDose): boolean
    └── getWarnings(dose: MedicationDose): Warning[]
```

---

## 4. LA County Context (463,866 Incidents)

**Research**: Official 2024 stats - 463,866 dispatched incidents, 3.18% YoY growth.

### Implementation Priority: MEDIUM

**Files to Add**:

```
lib/metrics/documentation-timer.ts
├── DocumentationTimer class
├── startTimer(incidentId: string): void
├── stopTimer(incidentId: string): Duration
├── getAverageTimePerIncident(): Duration
└── calculateTimeSavings(baseline: Duration, current: Duration): Duration

lib/metrics/usage-analytics.ts
├── UsageAnalytics class
├── trackProtocolLookup(protocolCode: string, durationMs: number): void
├── trackNarrativeGeneration(type: string, durationMs: number): void
├── trackDosingCalculation(medication: string, durationMs: number): void
└── generateROIReport(): ROIReport

app/api/metrics/roi/route.ts
├── GET endpoint for ROI dashboard data
├── Calculate time saved per incident
├── Calculate equivalent cost savings
└── Compare to baseline (before County Medic)
```

---

## 5. ImageTrend Integration (30% Growth, 90% US Coverage)

**Research**: ImageTrend 30% growth in 2024, covers 90% of US population. ESO has 1,670 agencies on AI narratives.

### Implementation Priority: HIGH (Competitive Urgency)

**Existing Plans**: `docs/planning/imagetrend-integration-roadmap.md`

**Accelerate Phase 1**:

```
lib/services/imagetrend/patient-context-service.ts (NEW)
├── PatientContextService class
├── setPatientData(data: ImageTrendPatientData): void
├── getPatientContext(): PatientContext
└── syncMedications(medications: MedicationRecord[]): void

lib/embedding/postmessage-handler.ts (NEW)
├── PostMessageHandler class
├── handleIncomingMessage(event: MessageEvent): void
├── sendToParent(type: string, data: unknown): void
└── validateOrigin(origin: string): boolean

lib/mappers/imagetrend-field-mapper.ts (NEW)
├── ImageTrendFieldMapper class
├── mapPatientData(data: ImageTrendPatientData): PatientContext
├── mapNarrativeToPCR(narrative: Narrative): ImageTrendPCRFields
└── mapMedications(medications: MedicationRecord[]): ImageTrendMedication[]
```

---

## 6. Cost Savings Quantification ($223/incident)

**Research**: Tele-EMS study - $223 net direct cost savings per incident. $1.77M annual savings.

### Implementation Priority: MEDIUM

**Files to Add**:

```
lib/analytics/cost-calculator.ts
├── CostCalculator class
├── calculateTimeSavings(minutesSaved: number, hourlyRate: number): number
├── calculateBillingImpact(denialRateReduction: number, avgClaimValue: number): number
├── calculateAnnualROI(incidents: number, minutesSaved: number): ROIResult
└── generateCostReport(): CostReport

app/api/analytics/roi/route.ts
├── GET endpoint for ROI dashboard
├── Calculate per-incident savings
├── Project annual savings based on volume
└── Compare pre/post County Medic metrics
```

**Integrate with Audit Logger**:
```
lib/audit/audit-logger.ts (line 117-138)
├── Add: logTimeSaved(incidentId: string, minutesSaved: number): void
├── Add: logNarrativeGenerated(incidentId: string, format: string): void
└── Add: calculateAggregateSavings(dateRange: DateRange): SavingsReport
```

---

## 7. NEMSIS Compliance (Already Implemented)

**Research**: NEMSIS 3.5 compliance required. Data files rejected if non-compliant.

### Current Implementation: ✅ Complete

**Location**: `lib/managers/NarrativeManager.ts` (lines 132-157)

**Enhancement Opportunity**:
```
lib/managers/NarrativeManager.ts
├── Add: validateNemsisCompliance(narrative: NemsisNarrative): ValidationResult
├── Add: mapToNemsis35(narrative: NemsisNarrative): Nemsis35Narrative
└── Add: flagMissingFields(narrative: NemsisNarrative): string[]
```

---

## 8. Offline-First PWA (Already Implemented)

**Research**: 2025 study - 65% faster page load, zero data loss in 50+ offline tests.

### Current Implementation: ✅ Complete

**Locations**:
- `public/sw.js` - Service worker
- `lib/storage/knowledge-base-chunked.ts` - Chunked KB for offline
- `app/components/layout/pwa-install-prompt.tsx` - PWA installation

**No changes needed** - validates existing architecture.

---

## Implementation Priority Order

### Sprint 1 (Week 1-2): Pediatric Safety
1. `lib/dosing/calculators/dextrose.ts` - Enhanced bounds
2. `lib/dosing/calculators/glucagon.ts` - Enhanced bounds  
3. `lib/dosing/calculators/fentanyl.ts` - Enhanced bounds
4. `lib/dosing/safety/pediatric-bounds-validator.ts` - NEW

### Sprint 2 (Week 3-4): Narrative Completeness
1. `lib/narrative/completeness-validator.ts` - NEW
2. `lib/narrative/billing-optimizer.ts` - NEW
3. `lib/managers/NarrativeManager.ts` - Enhancements
4. `lib/managers/ProtocolDocBuilder.ts` - More templates

### Sprint 3 (Week 5-6): Auto-Narrative (ESO Competitive)
1. `lib/narrative/auto-generator.ts` - NEW
2. `lib/narrative/templates/*.ts` - Protocol templates
3. Enhanced `lib/narrative/builder.ts`

### Sprint 4 (Week 7-8): Metrics & ROI
1. `lib/metrics/documentation-timer.ts` - NEW
2. `lib/analytics/cost-calculator.ts` - NEW
3. `app/api/analytics/roi/route.ts` - NEW

### Sprint 5-8 (Month 3-4): ImageTrend Integration
Follow existing roadmap in `docs/planning/imagetrend-integration-roadmap.md`

---

## Success Metrics (From Research)

| Metric | Target | Implementation |
|--------|--------|----------------|
| Documentation time reduction | 80% (ESO baseline) | `lib/metrics/documentation-timer.ts` |
| Pediatric dosing error rate | <5% (from 35%) | `lib/dosing/safety/` |
| Narrative completeness | >95% | `lib/narrative/completeness-validator.ts` |
| Billing denial reduction | 20% | `lib/narrative/billing-optimizer.ts` |
| Time saved per incident | 3+ minutes | `lib/analytics/cost-calculator.ts` |

---

## Pitch Meeting Deliverables

For Monday meeting, highlight:

1. **22 Pediatric Calculators** - Already built, addresses 35% error rate
2. **NEMSIS-Compliant Narratives** - Already built, SOAP/Chronological/Timeline
3. **Zero-Hallucination Retrieval** - Already built, BM25 with citations
4. **Offline-First PWA** - Already built, validated architecture
5. **ePCR Integration API** - Already stubbed at `/api/integrations/epcr/narrative`
6. **ImageTrend Roadmap** - Already documented, ready for Phase 0

**What's NEW to build**:
1. Enhanced pediatric safety bounds (Sprint 1)
2. Narrative completeness scoring (Sprint 2)
3. Auto-narrative generation (Sprint 3)
4. ROI/metrics tracking (Sprint 4)
