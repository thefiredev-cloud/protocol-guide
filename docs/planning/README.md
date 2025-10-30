# Planning Documents

This directory contains comprehensive planning documents for Medic Bot development, with a focus on **ImageTrend Elite integration** for Los Angeles County Fire Department.

---

## ImageTrend Integration Roadmap

### Primary Documents

**📋 [ImageTrend Integration Roadmap](./imagetrend-integration-roadmap.md)**
- **Complete 18-month roadmap** for integrating Medic Bot into ImageTrend Elite
- **6 phases**: Partnership → Foundation → Data Integration → UI/UX → Testing → Rollout
- **Detailed technical specifications** for embedding, authentication, and data sync
- **Resource requirements** and success metrics

**📄 [ImageTrend Integration Summary](./imagetrend-integration-summary.md)**
- **Quick reference** overview of integration phases
- **Key components** and files to create/modify
- **Success metrics** and risk mitigation
- **Timeline and dependencies**

---

## Protocol Retrieval System

**📋 [Protocol Retrieval System Plan](./protocol-retrieval-system-plan.md)**
- Comprehensive plan for LLM function calling integration
- Protocol retrieval via OpenAI function calling
- Performance optimization and monitoring strategy

**📄 [Protocol Retrieval System Summary](./protocol-retrieval-system-summary.md)**
- Quick reference for protocol retrieval implementation
- Key findings and recommendations

---

## Integration Overview

### Current Focus: ImageTrend Elite Integration

Medic Bot is being restructured to **live inside ImageTrend Elite** as an embedded widget, enabling:

1. **Single Sign-On**: No separate login - uses ImageTrend credentials
2. **Patient Data Sync**: Real-time patient data from ImageTrend PCR
3. **Narrative Export**: AI-generated narratives populate ePCR fields
4. **Medication Integration**: Dosing calculations sync to medication records
5. **Protocol Reference**: Protocol guidance within documentation workflow

### Integration Architecture

```
ImageTrend Elite ePCR
    ↓ (iframe widget)
Medic Bot Embedded Widget
    ↓ (OAuth SSO)
Authentication
    ↓ (PostMessage API)
Patient Data Sync
    ↓ (user queries)
Protocol Guidance / Calculations
    ↓ (export action)
PCR Field Population
```

---

## Roadmap Status

| Phase | Status | Timeline |
|-------|--------|----------|
| **Phase 0**: Partnership & Prerequisites | 🔄 In Progress | Months 1-2 |
| **Phase 1**: Foundation - Embedding | 📋 Planned | Months 3-4 |
| **Phase 2**: Data Integration | 📋 Planned | Months 5-7 |
| **Phase 3**: UI/UX Optimization | 📋 Planned | Months 8-9 |
| **Phase 4**: Testing & Validation | 📋 Planned | Months 10-11 |
| **Phase 5**: Pilot Deployment | 📋 Planned | Months 12-13 |
| **Phase 6**: Production Rollout | 📋 Planned | Months 14-18 |

---

## Key Integration Components

### Authentication & Embedding
- OAuth 2.0 / SAML single sign-on
- PostMessage API for parent window communication
- Iframe/widget embedding support
- Compact UI variant for embedded mode

### Data Integration
- Patient data synchronization (ImageTrend → Medic Bot)
- Narrative export (Medic Bot → ImageTrend PCR fields)
- Medication list synchronization
- Protocol reference tracking

### UI/UX
- Responsive widget design
- ImageTrend theme integration
- Embedded-specific workflows
- Contextual help and onboarding

---

## Next Steps

1. **Review** ImageTrend integration roadmap with stakeholders
2. **Initiate** Phase 0: ImageTrend Partner Program enrollment
3. **Schedule** kickoff meeting with ImageTrend technical team
4. **Gather** API documentation and security requirements

---

## Document Maintenance

**Review Schedule**:
- Monthly during active development
- Quarterly during pilot and rollout phases

**Version Control**:
- All planning documents versioned in git
- Major updates documented in changelog

---

For questions or updates to planning documents, contact the project lead.

