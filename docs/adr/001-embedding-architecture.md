# ADR-001: Embedding Architecture for ImageTrend Integration

**Status:** Proposed
**Date:** 2025-10-31
**Decision Makers:** Architecture Team

## Context

Medic-Bot needs to be embedded within ImageTrend Elite's ePCR interface to provide seamless protocol guidance without context switching. The embedding must support bi-directional data exchange, maintain security boundaries, and work reliably on iPads in field conditions.

## Decision

We will implement a **hybrid iframe/widget architecture** with PostMessage API for cross-origin communication.

### Architecture Components:

1. **Iframe Container** - Primary embedding method
2. **PostMessage Bridge** - Secure cross-origin communication
3. **State Synchronization Layer** - Manages context between frames
4. **Fallback Widget Mode** - Compact UI for constrained viewports

## Rationale

### Options Considered:

1. **Direct API Integration** (Rejected)
   - Pros: Native integration, best performance
   - Cons: Requires ImageTrend codebase access, maintenance burden

2. **Web Components** (Rejected)
   - Pros: Framework agnostic, encapsulated
   - Cons: Browser compatibility issues, complex polyfills

3. **Iframe with PostMessage** (Selected)
   - Pros: Security isolation, independent deployment, proven pattern
   - Cons: Cross-origin complexity, potential latency

4. **Micro-frontend** (Rejected)
   - Pros: Modern architecture, shared dependencies
   - Cons: Complex setup, ImageTrend adoption barrier

### Key Factors:

- **Security:** Iframe provides natural sandboxing
- **Independence:** Can deploy updates without ImageTrend coordination
- **Compatibility:** Works across all browsers and devices
- **Proven:** PostMessage is battle-tested for healthcare integrations

## Consequences

### Positive:
- Clear security boundaries between applications
- Independent deployment and versioning
- No shared dependencies or conflicts
- Can maintain separate compliance certifications

### Negative:
- Additional complexity in state management
- Potential latency in cross-frame communication
- Requires careful origin validation
- Limited access to parent frame resources

### Mitigations:
- Implement message queuing for reliability
- Use structured message protocol with versioning
- Cache frequently accessed data
- Implement timeout and retry logic

## Implementation

```typescript
// Core embedding interface
interface EmbeddingService {
  // Initialize embedded session
  init(config: EmbeddingConfig): Promise<void>;

  // Handle incoming messages
  on(event: string, handler: MessageHandler): void;

  // Send messages to parent
  emit(event: string, payload: any): void;

  // Sync patient context
  syncContext(data: PatientData): void;
}

// Message protocol definition
interface MessageProtocol {
  version: '1.0';
  type: MessageType;
  payload: any;
  timestamp: number;
  nonce: string;
  signature?: string;
}
```

## Metrics

- **Integration Time:** <2 seconds to fully initialize
- **Message Latency:** <50ms for cross-frame communication
- **Error Rate:** <0.1% message delivery failure
- **Security Incidents:** Zero cross-origin violations

## Review Schedule

- Initial review: After prototype completion (Week 4)
- Production review: After 1000 hours of field use
- Quarterly reviews thereafter