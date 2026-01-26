# ImageTrend Integration - Developer Guide

## Overview

Protocol Guide integrates with ImageTrend Elite ePCR to provide contextual protocol guidance during patient care documentation.

## Quick Start

### Launch Endpoint (Production Ready)

```typescript
// Build launch URL
const launchUrl = new URL('https://protocol-guide.app/api/imagetrend/launch');
launchUrl.searchParams.set('agency_id', 'la-county-fd');
launchUrl.searchParams.set('search_term', 'chest pain');
launchUrl.searchParams.set('user_age', '62');
launchUrl.searchParams.set('impression', 'I21.4');
launchUrl.searchParams.set('return_url', 'elite://incident/12345');

// Open in new window/tab
window.open(launchUrl.toString(), '_blank');
```

### Health Check

```bash
curl https://protocol-guide.app/api/imagetrend/health
```

Response:
```json
{
  "status": "enabled",
  "partner": "imagetrend",
  "version": "1.0.0",
  "timestamp": "2026-01-25T20:00:00.000Z"
}
```

## Endpoints

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/imagetrend/launch` | GET | ✅ Production | Launch with patient context |
| `/api/imagetrend/health` | GET | ✅ Production | Integration health check |
| `/api/imagetrend/suggest` | POST | 🟡 Demo | AI protocol suggestions |
| `/api/imagetrend/export` | POST | 🟡 Demo | Export protocol to ePCR |

## File Structure

```
server/api/
├── imagetrend.ts           # Launch and health endpoints
└── imagetrend-suggest.ts   # Suggest and export endpoints (demo)

data/integrations/
├── README.md               # Integration overview
└── imagetrend/
    ├── README.md           # ImageTrend integration guide
    ├── ARCHITECTURE.md     # Technical architecture
    ├── API_CONTRACT.md     # API specifications
    ├── DATA_FORMATS.md     # NEMSIS data mapping
    ├── PARTNERSHIP.md      # Business value proposition
    ├── MOCK_SCENARIOS.md   # Demo scenarios
    ├── mock-scenarios.json # Test data
    └── mock-agencies.json  # Agency configurations
```

## HIPAA Compliance

### What We Log (Non-PHI)
- Agency ID
- Search terms (chief complaint)
- Response time
- Request count

### What We DON'T Log (PHI)
- Patient age
- Clinical impressions (ICD-10 codes)
- Vital signs
- Patient identifiers

## Feature Flags

```typescript
// In lib/feature-flags.ts
export const FLAGS = {
  enable_imagetrend_deep_linking: true,  // Launch endpoint
  enable_imagetrend_suggest_api: false,  // Suggest endpoint (awaiting partnership)
  enable_imagetrend_export_api: false,   // Export endpoint (awaiting partnership)
};
```

## Database Schema

Integration logs are stored in `integration_logs` table:

```sql
CREATE TABLE integration_logs (
  id SERIAL PRIMARY KEY,
  partner integration_partner NOT NULL,  -- 'imagetrend'
  agency_id VARCHAR(100),
  agency_name VARCHAR(255),
  search_term VARCHAR(500),
  -- PHI fields intentionally omitted for HIPAA compliance
  response_time_ms INTEGER,
  result_count INTEGER,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### Manual Testing

Use the demo scenarios in `data/integrations/imagetrend/MOCK_SCENARIOS.md`:

```bash
# Test adult chest pain scenario
curl "https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=chest+pain&user_age=62"

# Test pediatric respiratory scenario
curl "https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=respiratory+distress&user_age=4"
```

### Automated Testing

```typescript
// tests/integration/imagetrend.test.ts
describe('ImageTrend Integration', () => {
  it('should redirect to search with valid agency', async () => {
    const response = await request(app)
      .get('/api/imagetrend/launch')
      .query({ agency_id: 'la-county-fd', search_term: 'chest pain' })
      .expect(302);
    
    expect(response.headers.location).toContain('/app/protocol-search');
  });

  it('should reject invalid agency', async () => {
    const response = await request(app)
      .get('/api/imagetrend/launch')
      .query({ agency_id: 'invalid-agency' })
      .expect(403);
    
    expect(response.body.code).toBe('AGENCY_NOT_AUTHORIZED');
  });
});
```

## Monitoring

### Key Metrics

| Metric | Alert Threshold | Dashboard |
|--------|-----------------|-----------|
| Launch success rate | <95% | Integration Analytics |
| Response time p95 | >500ms | Performance Dashboard |
| Error rate | >5% | Error Tracking |

### Admin Dashboard

Integration stats available at: `/admin/analytics/integrations`

## Roadmap

| Phase | Features | Target |
|-------|----------|--------|
| 1.0 (Current) | Deep link launch, agency validation | ✅ Done |
| 1.1 | Incident ID correlation | Q1 2026 |
| 2.0 | Suggest API, API key auth | Q2 2026 |
| 2.1 | Export to ePCR, bidirectional sync | Q3 2026 |
| 3.0 | Embedded widget | Q4 2026 |

## Support

- **Integration Issues**: support@protocolguide.app
- **Partnership**: partnerships@protocolguide.app
- **Documentation**: This file + `data/integrations/imagetrend/`
