# ImageTrend API Contract

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://protocol-guide.app/api/imagetrend` |
| Staging | `https://staging.protocol-guide.app/api/imagetrend` |
| Development | `http://localhost:3000/api/imagetrend` |

## Authentication

### Current (v1.0)
No authentication required. Agency validation via `agency_id` parameter.

### Planned (v2.0)
API key authentication for verified partners:
```http
Authorization: Bearer {api_key}
X-ImageTrend-Partner-ID: {partner_id}
X-ImageTrend-Signature: {hmac_signature}
```

---

## Endpoints

### 1. Launch Protocol Search

**Launch Protocol Guide with patient context from ImageTrend.**

```http
GET /api/imagetrend/launch
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agency_id` | string | ✅ Yes | ImageTrend agency identifier (e.g., "la-county-fd") |
| `search_term` | string | No | Protocol search query (e.g., "chest pain", "cardiac arrest") |
| `user_age` | integer | No | Patient age in years. Used for pediatric/adult routing. **NOT LOGGED** |
| `impression` | string | No | ICD-10 or NEMSIS clinical impression code. **NOT LOGGED** |
| `return_url` | string | No | URL to return to after protocol lookup (e.g., "elite://incident/12345") |
| `incident_id` | string | No | ImageTrend incident ID for correlation |

#### Example Request

```http
GET /api/imagetrend/launch?agency_id=la-county-fd&search_term=chest+pain&user_age=62&impression=I21.4&return_url=elite://back
```

#### Response

**Success (302 Redirect)**
```http
HTTP/1.1 302 Found
Location: https://protocol-guide.app/app/protocol-search?query=chest+pain&age=62&impression=I21.4&agency=la-county-fd&source=imagetrend&return_url=elite://back
```

**Error Responses**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `MISSING_AGENCY_ID` | Required `agency_id` parameter missing |
| 403 | `AGENCY_NOT_AUTHORIZED` | Agency not configured for ImageTrend integration |
| 503 | `INTEGRATION_DISABLED` | ImageTrend integration feature flag is disabled |

```json
{
  "error": "Missing required parameter: agency_id",
  "code": "MISSING_AGENCY_ID"
}
```

---

### 2. Health Check

**Check ImageTrend integration status.**

```http
GET /api/imagetrend/health
```

#### Response

```json
{
  "status": "enabled",
  "partner": "imagetrend",
  "version": "1.0.0",
  "timestamp": "2026-01-25T20:18:00.000Z"
}
```

---

### 3. Protocol Suggest (Planned v2.0)

**Get protocol suggestions based on patient context without UI redirect.**

```http
POST /api/imagetrend/suggest
Content-Type: application/json
```

#### Request Body

```json
{
  "agency_id": "la-county-fd",
  "chief_complaint": "chest pain",
  "patient_age": 62,
  "patient_sex": "M",
  "vital_signs": {
    "bp_systolic": 145,
    "bp_diastolic": 90,
    "pulse": 88,
    "spo2": 96
  },
  "history": ["hypertension", "diabetes"],
  "limit": 3
}
```

#### Response

```json
{
  "suggestions": [
    {
      "protocol_number": "1210",
      "protocol_title": "Chest Pain - Cardiac",
      "relevance_score": 0.95,
      "age_category": "adult",
      "key_treatments": [
        "Aspirin 324mg PO",
        "Nitroglycerin 0.4mg SL",
        "12-Lead ECG"
      ],
      "contraindication_alerts": [],
      "url": "https://protocol-guide.app/protocol/la-county/1210"
    },
    {
      "protocol_number": "1211",
      "protocol_title": "STEMI Alert",
      "relevance_score": 0.82,
      "age_category": "adult",
      "key_treatments": [
        "Notify receiving facility",
        "IV access",
        "Continuous cardiac monitoring"
      ],
      "contraindication_alerts": [],
      "url": "https://protocol-guide.app/protocol/la-county/1211"
    }
  ],
  "metadata": {
    "search_time_ms": 145,
    "agency": "la-county-fd",
    "protocol_version": "2024"
  }
}
```

---

### 4. Export Protocol Reference (Planned v2.0)

**Export selected protocol back to ImageTrend ePCR.**

```http
POST /api/imagetrend/export
Content-Type: application/json
```

#### Request Body

```json
{
  "incident_id": "IT-12345",
  "callback_url": "https://imagetrend.example.com/api/incidents/IT-12345/protocols",
  "protocol_selection": {
    "protocol_number": "1210",
    "protocol_title": "Chest Pain - Cardiac",
    "sections_reviewed": ["Assessment", "Treatment Adult"],
    "medications_calculated": [
      {
        "drug": "Aspirin",
        "dose": "324mg",
        "route": "PO"
      },
      {
        "drug": "Nitroglycerin",
        "dose": "0.4mg",
        "route": "SL"
      }
    ],
    "timestamp": "2026-01-25T20:30:00.000Z"
  }
}
```

#### Response

```json
{
  "success": true,
  "export_id": "exp-1706213400000-abc123",
  "callback_status": "delivered"
}
```

---

## NEMSIS Data Mapping

Protocol Guide parameters map to NEMSIS 3.5 elements:

| Protocol Guide | NEMSIS Element | NEMSIS Code |
|---------------|----------------|-------------|
| `agency_id` | Agency Number | dAgency.02 |
| `search_term` | Chief Complaint Anatomic Location | eSituation.04 |
| `user_age` | Age | ePatient.15 |
| `impression` | Primary Impression | eSituation.11 |
| `incident_id` | EMS Incident Number | eResponse.03 |

### Chief Complaint Mapping

ImageTrend chief complaints map to Protocol Guide search queries:

| ImageTrend Chief Complaint | Protocol Guide Query |
|---------------------------|---------------------|
| Chest Pain/Discomfort | "chest pain" |
| Cardiac Arrest | "cardiac arrest" |
| Respiratory Distress | "respiratory distress" |
| Altered Level of Consciousness | "altered mental status" |
| Trauma - Blunt | "blunt trauma" |
| Overdose/Poisoning | "overdose" |
| Diabetic Emergency | "diabetic emergency" |
| Seizure | "seizure" |
| Stroke/CVA | "stroke" |
| Allergic Reaction | "allergic reaction" |

### ICD-10 to Protocol Mapping

Common clinical impression codes and relevant protocols:

| ICD-10 | Description | LA County Protocol |
|--------|-------------|-------------------|
| I21.* | Acute MI | 1210, 1211 |
| I46.* | Cardiac Arrest | 1230 |
| J96.* | Respiratory Failure | 1220 |
| R41.82 | Altered Mental Status | 1208 |
| T36-T50 | Drug Poisoning | 1280 |
| E10-E14 | Diabetes | 1203 |
| G40.* | Seizure | 1227 |
| I63.* | Stroke | 1260 |
| T78.* | Allergic Reaction | 1270 |

---

## Rate Limits

| Client Type | Requests | Window | Burst |
|-------------|----------|--------|-------|
| Anonymous | 5 | 15 min | 10 |
| Validated Agency | 100 | 15 min | 200 |
| Verified Partner | 1,000 | 15 min | 2,000 |

Rate limit headers returned:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706214000
```

---

## Error Codes

| HTTP Status | Code | Description | Resolution |
|-------------|------|-------------|------------|
| 400 | `MISSING_AGENCY_ID` | agency_id parameter required | Include agency_id in request |
| 400 | `INVALID_PARAMETER` | Parameter validation failed | Check parameter format |
| 403 | `AGENCY_NOT_AUTHORIZED` | Agency not configured | Contact Protocol Guide support |
| 429 | `RATE_LIMITED` | Too many requests | Reduce request frequency |
| 500 | `INTERNAL_ERROR` | Server error | Retry with exponential backoff |
| 503 | `INTEGRATION_DISABLED` | Feature disabled | Contact Protocol Guide support |

---

## Webhooks (Planned v2.0)

Protocol Guide can send events to ImageTrend:

### Protocol Accessed

```json
{
  "event": "protocol.accessed",
  "timestamp": "2026-01-25T20:30:00.000Z",
  "data": {
    "incident_id": "IT-12345",
    "agency_id": "la-county-fd",
    "protocol_number": "1210",
    "protocol_title": "Chest Pain - Cardiac",
    "access_duration_seconds": 45
  }
}
```

### Protocol Exported

```json
{
  "event": "protocol.exported",
  "timestamp": "2026-01-25T20:31:00.000Z",
  "data": {
    "incident_id": "IT-12345",
    "export_id": "exp-1706213400000-abc123",
    "protocol_number": "1210",
    "medications_calculated": 2
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ProtocolGuideClient } from '@protocol-guide/imagetrend-sdk';

const client = new ProtocolGuideClient({
  apiKey: process.env.PROTOCOL_GUIDE_API_KEY,
  environment: 'production'
});

// Get protocol suggestions
const suggestions = await client.suggest({
  agencyId: 'la-county-fd',
  chiefComplaint: 'chest pain',
  patientAge: 62
});

// Export protocol to ePCR
await client.export({
  incidentId: 'IT-12345',
  callbackUrl: 'https://imagetrend.example.com/api/...',
  protocolNumber: '1210',
  sectionsReviewed: ['Assessment', 'Treatment Adult']
});
```

### URL Builder (No SDK)

```javascript
function buildProtocolGuideUrl(params) {
  const base = 'https://protocol-guide.app/api/imagetrend/launch';
  const url = new URL(base);
  
  url.searchParams.set('agency_id', params.agencyId);
  if (params.searchTerm) url.searchParams.set('search_term', params.searchTerm);
  if (params.userAge) url.searchParams.set('user_age', params.userAge);
  if (params.impression) url.searchParams.set('impression', params.impression);
  if (params.returnUrl) url.searchParams.set('return_url', params.returnUrl);
  
  return url.toString();
}

// Usage in ImageTrend external link
const protocolUrl = buildProtocolGuideUrl({
  agencyId: 'la-county-fd',
  searchTerm: currentIncident.chiefComplaint,
  userAge: currentIncident.patientAge,
  impression: currentIncident.primaryImpression,
  returnUrl: `elite://incident/${currentIncident.id}`
});

window.open(protocolUrl, '_blank');
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial release: launch, health endpoints |
| 1.1.0 | Planned | Add incident_id correlation |
| 2.0.0 | Planned | Add suggest, export endpoints; API key auth |
