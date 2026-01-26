# ImageTrend Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FIELD OPERATIONS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐          ┌──────────────────────┐                 │
│  │  ImageTrend Elite    │          │   Protocol Guide     │                 │
│  │  (ePCR Application)  │          │   (Mobile/Web App)   │                 │
│  │                      │          │                      │                 │
│  │  ┌────────────────┐  │          │  ┌────────────────┐  │                 │
│  │  │ Patient Record │  │   HTTP   │  │ Protocol       │  │                 │
│  │  │ - Chief Comp.  │──┼─────────▶│  │ Search         │  │                 │
│  │  │ - Age          │  │          │  │ - Context-aware│  │                 │
│  │  │ - Impression   │  │          │  │ - AI-assisted  │  │                 │
│  │  └────────────────┘  │          │  └────────────────┘  │                 │
│  │           │          │          │           │          │                 │
│  │           ▼          │          │           ▼          │                 │
│  │  ┌────────────────┐  │          │  ┌────────────────┐  │                 │
│  │  │ External Link  │  │◀─────────│  │ Protocol Ref   │  │                 │
│  │  │ Integration    │  │  Return  │  │ Export         │  │                 │
│  │  └────────────────┘  │          │  └────────────────┘  │                 │
│  └──────────────────────┘          └──────────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ Secure API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROTOCOL GUIDE BACKEND                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐        │
│  │  Integration     │   │   RAG Search     │   │   Agency         │        │
│  │  Gateway         │──▶│   Engine         │──▶│   Protocol DB    │        │
│  │                  │   │                  │   │                  │        │
│  │  - Auth/Validate │   │  - Vector search │   │  - LA County     │        │
│  │  - Rate limit    │   │  - AI ranking    │   │  - Orange County │        │
│  │  - HIPAA filter  │   │  - Age filter    │   │  - 20+ agencies  │        │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐                                                       │
│  │  Analytics       │  (Non-PHI metrics only)                               │
│  │  - Usage counts  │                                                       │
│  │  - Response time │                                                       │
│  │  - Agency stats  │                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Integration Patterns

### Pattern 1: Deep Link Launch (Current)

The simplest integration pattern. ImageTrend launches Protocol Guide as an external link:

```
ImageTrend Elite                     Protocol Guide
      │                                    │
      │  1. User clicks "View Protocols"   │
      │─────────────────────────────────▶ │
      │     GET /api/imagetrend/launch     │
      │     ?agency_id=la-county-fd        │
      │     &search_term=chest+pain        │
      │     &user_age=62                   │
      │     &return_url=elite://back       │
      │                                    │
      │  2. Redirect to Protocol Search    │
      │◀─────────────────────────────────  │
      │     302 → /app/protocol-search     │
      │                                    │
      │  3. User reviews protocol          │
      │                                    │
      │  4. User clicks "Return to ePCR"   │
      │◀─────────────────────────────────  │
      │     Navigate to return_url         │
      │                                    │
```

**Pros**: Simple, minimal ImageTrend development, works today
**Cons**: Context switch between apps, manual note-taking

### Pattern 2: Bidirectional API (Designed)

Protocol Guide can send protocol references back to ImageTrend:

```
ImageTrend Elite                     Protocol Guide
      │                                    │
      │  1. Launch with incident ID        │
      │─────────────────────────────────▶ │
      │     GET /api/imagetrend/launch     │
      │     ?incident_id=IT-12345          │
      │     &callback_url=https://...      │
      │                                    │
      │  2. User selects protocol          │
      │                                    │
      │  3. Export protocol reference      │
      │◀─────────────────────────────────  │
      │     POST callback_url              │
      │     { protocol_number: "1210",     │
      │       protocol_title: "Chest...",  │
      │       selected_sections: [...] }   │
      │                                    │
      │  4. ImageTrend auto-fills notes    │
      │                                    │
```

**Pros**: Seamless workflow, auto-documentation
**Cons**: Requires ImageTrend API support

### Pattern 3: Embedded Widget (Future)

Protocol Guide embedded directly in ImageTrend's UI:

```
┌──────────────────────────────────────────────────┐
│  ImageTrend Elite - Incident #12345              │
├──────────────────────────────────────────────────┤
│  Patient: [REDACTED]  Age: 62  Chief: Chest Pain │
├─────────────────────────────┬────────────────────┤
│  ePCR Documentation         │  Protocol Guide    │
│  ┌───────────────────────┐  │  ┌──────────────┐  │
│  │ Chief Complaint:      │  │  │ 📋 1210      │  │
│  │ [Chest pain, sudden   │  │  │ Chest Pain   │  │
│  │  onset 30 min ago]    │  │  │              │  │
│  │                       │  │  │ • Aspirin    │  │
│  │ Assessment:           │  │  │   324mg PO   │  │
│  │ [________________________] │ • Nitro 0.4mg│  │
│  │                       │  │  │   SL q5min   │  │
│  │ Treatment:            │  │  │ • 12-Lead    │  │
│  │ [________________________] │              │  │
│  └───────────────────────┘  │  └──────────────┘  │
└─────────────────────────────┴────────────────────┘
```

**Pros**: Best UX, real-time guidance
**Cons**: Requires ImageTrend partnership for iframe/widget support

## Data Flow Architecture

### Inbound Data (ImageTrend → Protocol Guide)

| Field | NEMSIS Element | Purpose | PHI? | Logged? |
|-------|---------------|---------|------|---------|
| `agency_id` | dAgency.02 | Agency identification | No | Yes |
| `search_term` | eSituation.04 | Chief complaint | No* | Yes |
| `user_age` | ePatient.15 | Pediatric vs Adult routing | Yes | **NO** |
| `impression` | eSituation.11 | Clinical impression code | Yes | **NO** |
| `return_url` | N/A | Return navigation | No | No |
| `incident_id` | eResponse.03 | Incident correlation | No | Yes |

*Chief complaint text is logged but should not contain patient identifiers.

### Outbound Data (Protocol Guide → ImageTrend)

| Field | Purpose | Contains PHI? |
|-------|---------|--------------|
| `protocol_number` | Protocol identifier (e.g., "1210") | No |
| `protocol_title` | Protocol name (e.g., "Chest Pain") | No |
| `protocol_url` | Link to full protocol | No |
| `selected_sections` | Sections user reviewed | No |
| `medication_dosing` | Calculated doses | No |
| `timestamp` | When protocol was accessed | No |

## HIPAA Compliance

### Architectural Safeguards

1. **No PHI Storage**
   - Age and clinical impression are processed in memory only
   - Never written to database, logs, or analytics

2. **Request ID Correlation**
   - Unique anonymous ID per request: `it-{timestamp}-{random}`
   - Used for debugging without PHI exposure

3. **Secure Transport**
   - All endpoints require HTTPS
   - TLS 1.2+ enforced

4. **Access Control**
   - Agency validation before protocol access
   - Rate limiting per IP address

### Compliance Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| No PHI in logs | ✅ | Code review + static analysis |
| Encryption in transit | ✅ | HTTPS enforced |
| Encryption at rest | ✅ | Supabase encryption |
| Access controls | ✅ | Agency validation |
| Audit trail | ✅ | Non-PHI metrics only |
| BAA with vendors | ⬜ | Requires partnership |

### Code Patterns

```typescript
// ✅ CORRECT: PHI used for functionality, not logged
const parsedAge = user_age ? parseInt(user_age as string, 10) : undefined;
const isPediatric = parsedAge && parsedAge < 18;

// Filter protocols based on age category
const protocols = await searchProtocols({
  query: searchTerm,
  ageCategory: isPediatric ? 'pediatric' : 'adult',
  // Note: actual age value is NOT passed to search
});

// Log only non-PHI operational data
await logIntegrationAccess({
  requestId,
  agencyId: agency_id,
  searchTerm: searchQuery, // Chief complaint, not identifier
  // HIPAA: userAge and impression intentionally omitted
});
```

```typescript
// ❌ WRONG: Never do this
await logIntegrationAccess({
  requestId,
  agencyId: agency_id,
  userAge: parsedAge,        // PHI - NEVER LOG
  impression: clinicalCode,   // PHI - NEVER LOG
});
```

## Scalability Design

### Current Capacity

- **Requests/second**: 100+ (Redis rate limiting)
- **Concurrent agencies**: Unlimited
- **Protocol search latency**: <200ms (p95)
- **Availability**: 99.9% (Railway deployment)

### Scaling Strategy

```
                    ┌─────────────────┐
                    │  Cloudflare     │
                    │  CDN + WAF      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Load Balancer  │
                    │  (Railway)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│  API Server   │   │  API Server   │   │  API Server   │
│  Instance 1   │   │  Instance 2   │   │  Instance N   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase       │
                    │  (Postgres +    │
                    │   pgvector)     │
                    └─────────────────┘
```

## Security Considerations

### API Authentication (Future Enhancement)

Current: Agency ID validation
Planned: API key authentication for verified partners

```typescript
// Future: Signed request validation
const signature = req.headers['x-imagetrend-signature'];
const isValid = verifyHMAC(signature, requestBody, partnerSecret);
```

### Rate Limiting

| Tier | Requests/15min | Use Case |
|------|----------------|----------|
| Anonymous | 5 | Prevent abuse |
| Agency | 100 | Normal usage |
| Partner | 1000 | High-volume integration |

### IP Allowlisting (Optional)

For agencies requiring strict security:
```typescript
const IMAGETREND_IPS = [
  '12.34.56.0/24',  // ImageTrend data center
  '98.76.54.0/24',  // ImageTrend backup DC
];
```

## Monitoring & Observability

### Metrics Collected

| Metric | Type | Purpose |
|--------|------|---------|
| `integration_launches_total` | Counter | Total launches by partner |
| `integration_latency_ms` | Histogram | Response time distribution |
| `integration_errors_total` | Counter | Error rate monitoring |
| `protocol_searches_total` | Counter | Search volume |

### Alerting Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| High Error Rate | >5% errors in 5min | Page on-call |
| Latency Spike | p95 >1s for 10min | Investigate |
| Launch Spike | >10x normal volume | Capacity check |

## Disaster Recovery

### Failover Strategy

1. **Primary**: Railway US-West
2. **Failover**: Railway US-East (planned)
3. **Database**: Supabase multi-region

### Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| API server failure | <1 min | 0 |
| Database failure | <5 min | <1 min |
| Regional outage | <15 min | <5 min |
