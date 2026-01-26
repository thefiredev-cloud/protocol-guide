# ImageTrend Elite Integration

## Overview

ImageTrend Elite is the leading ePCR (electronic Patient Care Report) platform used by fire departments and EMS agencies nationwide, including LACoFD (Los Angeles County Fire Department) and hundreds of other agencies.

Protocol Guide's integration with ImageTrend Elite enables EMS providers to access relevant protocols **directly from their ePCR workflow**, reducing cognitive load during emergency patient care.

## Quick Links

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical integration architecture |
| [API_CONTRACT.md](./API_CONTRACT.md) | API specifications and endpoints |
| [DATA_FORMATS.md](./DATA_FORMATS.md) | NEMSIS data formats and mappings |
| [PARTNERSHIP.md](./PARTNERSHIP.md) | Value proposition for ImageTrend |
| [MOCK_SCENARIOS.md](./MOCK_SCENARIOS.md) | Demo scenarios and test data |

## Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Deep Link Launch | ✅ Complete | `/api/imagetrend/launch` |
| Protocol Lookup | ✅ Complete | Context-aware search |
| Age-Based Filtering | ✅ Complete | Pediatric protocol routing |
| Return to ePCR | ✅ Complete | `return_url` support |
| Bidirectional Sync | 🟡 Designed | Awaiting partnership |
| Protocol Export | 🟡 Designed | Awaiting partnership |
| Widget Embed | 🔵 Planned | Future enhancement |

## How It Works

### 1. Launch from ImageTrend
When a paramedic is documenting a patient in ImageTrend Elite, they can launch Protocol Guide with one click:

```
GET https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=chest+pain
  &user_age=62
  &impression=I21.4
  &return_url=elite://incident/12345
```

### 2. Contextual Protocol Search
Protocol Guide:
- Identifies the agency's protocol set (LA County protocols)
- Searches for relevant protocols ("Chest Pain")
- Filters by patient type (Adult vs Pediatric based on age)
- Highlights relevant medication dosing

### 3. Return to Documentation
After reviewing the protocol, the provider can return to ImageTrend with protocol references auto-populated.

## Benefits for Agencies Using ImageTrend

| Benefit | Impact |
|---------|--------|
| **Faster Protocol Access** | 30-60 seconds saved per protocol lookup |
| **Reduced Errors** | AI-assisted dosing calculations |
| **Better Compliance** | Easy access = better protocol adherence |
| **Training Support** | New hires learn protocols faster |
| **Offline Capable** | Protocols available without connectivity |

## Implementation for Agencies

### Requirements
1. ImageTrend Elite v5.0+ with External Links feature
2. Protocol Guide agency account (Starter tier or higher)
3. Agency protocols loaded in Protocol Guide

### Setup Steps
1. Contact Protocol Guide for agency provisioning
2. Configure External Link in ImageTrend Admin:
   - URL Template: `https://protocol-guide.app/api/imagetrend/launch`
   - Parameters: See [API_CONTRACT.md](./API_CONTRACT.md)
3. Test integration with demo scenarios
4. Roll out to field personnel

## HIPAA Compliance

This integration is designed with HIPAA compliance as a core requirement:

- ✅ No patient identifiers transmitted
- ✅ Age used for routing only, not logged
- ✅ Clinical impressions used for search only, not logged
- ✅ All data in transit encrypted (HTTPS required)
- ✅ No PHI stored in Protocol Guide systems

See [ARCHITECTURE.md](./ARCHITECTURE.md#hipaa-compliance) for detailed compliance documentation.

## Support

- **Technical Support**: support@protocolguide.app
- **Partnership Inquiries**: partnerships@protocolguide.app
- **Documentation Issues**: Open an issue on GitHub

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-01-25 | 1.0.0 | Initial integration release |
| 2026-01-23 | 0.9.0 | HIPAA compliance audit complete |
| 2026-01-15 | 0.8.0 | Deep link prototype |
