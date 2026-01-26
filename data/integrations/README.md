# Protocol Guide Integrations

This folder contains specifications, documentation, and mock data for ePCR system integrations.

## Current Integrations

| Partner | Status | Documentation |
|---------|--------|---------------|
| **ImageTrend Elite** | 🟡 Ready for Partnership | [imagetrend/](./imagetrend/) |
| ESO Solutions | 🔵 Planned | Coming Soon |
| Zoll emsCharts | 🔵 Planned | Coming Soon |
| EMS Cloud | 🔵 Planned | Coming Soon |

## Integration Architecture Overview

Protocol Guide integrates with ePCR systems to provide real-time protocol guidance during patient care documentation:

```
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│   ePCR System      │     │   Protocol Guide   │     │   Protocol DB      │
│  (ImageTrend)      │────▶│   Integration API  │────▶│   + AI Search      │
│                    │◀────│                    │◀────│                    │
└────────────────────┘     └────────────────────┘     └────────────────────┘
     Launch with              Process context,         Return relevant
     patient context          suggest protocols        protocols + dosing
```

## HIPAA Compliance

All integrations follow strict HIPAA guidelines:
- **No PHI Logging**: Patient age, clinical impressions, and identifiers are NEVER logged
- **Request ID Correlation**: Anonymous request IDs used for debugging
- **Secure Transport**: All API calls require HTTPS
- **Audit Trail**: Non-PHI operational metrics tracked for compliance

## Adding a New Integration

1. Create folder: `data/integrations/{partner-name}/`
2. Add required files:
   - `README.md` - Overview and quick start
   - `ARCHITECTURE.md` - Technical architecture
   - `API_CONTRACT.md` - API specifications
   - `DATA_FORMATS.md` - Data exchange formats
   - `PARTNERSHIP.md` - Business value proposition
3. Implement endpoints in `server/api/{partner-name}.ts`
4. Add router in `server/routers/integration.ts`

## Contact

For integration partnership inquiries:
- **Technical**: support@protocolguide.app
- **Partnership**: partnerships@protocolguide.app
