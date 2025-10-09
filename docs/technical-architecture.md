# LA County Fire Medic Bot - Technical Architecture

**Version**: 2.0.0
**Last Updated**: January 2025
**Classification**: Internal Use - LA County Fire Department

---

## Executive Overview

The LA County Fire Medic Bot is a production-grade medical AI assistant designed for 3,200+ paramedics across 174 fire stations. Built on Next.js 14 with a mobile-first, offline-capable architecture, it provides instant access to LA County Prehospital Care Manual (PCM) protocols and medication dosing calculations.

### Key Characteristics

- **Zero Authentication**: Public access with IP-based rate limiting
- **Mobile-First**: Optimized for 10-year-old devices with glove-friendly UI
- **Offline-Capable**: 100% functionality without network connectivity
- **Field-Optimized**: Sunlight mode, voice input, one-handed operation
- **Medical Accuracy**: 98%+ validation rate against LA County PCM

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  Client Layer (Paramedic Devices)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Mobile Browser│  │  Tablet MDT  │  │ Desktop PC   │            │
│  │ iOS/Android   │  │ Fire Apparatus│  │ Station Office│           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│         └──────────────────┴──────────────────┘                     │
│                            │                                        │
│                    PWA Service Worker                               │
│                    (Offline Cache: 11MB KB + Assets)               │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ HTTPS/TLS 1.3
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Application Layer (Next.js 14 App Router)                         │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Edge Middleware (Authentication, Rate Limiting, Headers)    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  API Routes  │  │  Page Routes │  │  Static      │           │
│  │              │  │              │  │  Assets      │           │
│  │ /api/chat    │  │ /            │  │ /public      │           │
│  │ /api/chat/   │  │ /dosing      │  │ /manifest    │           │
│  │   stream     │  │ /protocols   │  │ /sw.js       │           │
│  │ /api/dosing  │  │ /admin       │  │              │           │
│  │ /api/health  │  │              │  │              │           │
│  │ /api/metrics │  │              │  │              │           │
│  │ /api/auth/*  │  │              │  │              │           │
│  └──────┬───────┘  └──────────────┘  └──────────────┘           │
│         │                                                          │
└─────────┼──────────────────────────────────────────────────────────┘
          │
          ├─────────────────┬─────────────────┬─────────────────────┐
          │                 │                 │                     │
          ▼                 ▼                 ▼                     ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
│  Azure AD        │ │  Supabase    │ │  OpenAI API  │ │  File System│
│  (Auth/SSO)      │ │  PostgreSQL  │ │  (LLM)       │ │  (Audit Logs│
│                  │ │              │ │              │ │   Local)    │
│  - User DB       │ │  - Users     │ │  - GPT-4o    │ │             │
│  - MFA           │ │  - Audit logs│ │  - Embeddings│ │  - JSON Lines
│  - JWT tokens    │ │  - Metrics   │ │  - Streaming │ │  - 6-year   │
│  - RBAC          │ │  - KB vectors│ │              │ │    retention│
└──────────────────┘ └──────────────┘ └──────────────┘ └─────────────┘
```

### Data Flow: Protocol Query (Step-by-Step)

```
1. Paramedic enters query: "55 year old male chest pain"
   ↓
2. Client sends POST /api/chat/stream with query + auth token
   ↓
3. Edge middleware validates JWT (Azure AD session)
   ↓
4. Rate limiter checks: 30 requests/min per user (APPROVED)
   ↓
5. Chat service receives request
   ↓
6. Knowledge Base Manager searches local JSON KB (BM25 algorithm)
   ├─ Parse query → extract keywords: "chest pain", "55", "male"
   ├─ Full-text search → retrieve top 6 protocol chunks
   └─ Filter by relevance score (min 0.3 threshold)
   ↓
7. Retrieved protocols:
   - PCM 1.2.1: Chest Pain/Acute Coronary Syndrome
   - PCM 1.2.2: STEMI Recognition
   - PCM 1.2.3: Nitroglycerin Administration
   - PCM 1.2.4: Aspirin Administration
   - PCM 1.2.5: Base Contact Requirements
   - PCM 1.2.6: ALS Interventions
   ↓
8. LLM Service constructs prompt:
   - System prompt: "You are an LA County Fire paramedic assistant..."
   - Context: Retrieved protocol chunks (injected into prompt)
   - User query: "55 year old male chest pain"
   ↓
9. OpenAI API call (streaming):
   - POST https://api.openai.com/v1/chat/completions
   - Model: gpt-4o-mini
   - Stream: true (SSE)
   - Temperature: 0.1 (low variability for clinical accuracy)
   ↓
10. LLM streams response tokens:
    - Event: start → Send citation list to client
    - Event: delta → Stream answer fragments in real-time
    - Event: final → Complete answer with protocol citations
    - Event: done → Close SSE connection
   ↓
11. Guardrails validation:
    - Check for unauthorized medications (e.g., "morphine" not in PCM)
    - Check for contraindications (e.g., nitroglycerin + hypotension)
    - Flag response if violations detected
   ↓
12. Audit logger writes event:
    - User ID: abc123
    - Action: chat.stream
    - Query length: 28 characters (NOT query text - HIPAA compliant)
    - Protocols referenced: ["PCM 1.2.1", "PCM 1.2.2", ...]
    - Timestamp: 2025-01-15T10:23:45.123Z
    - Outcome: success
    - Duration: 1,234ms
   ↓
13. Response returned to client (SSE stream)
   ↓
14. Client renders response incrementally with protocol citations
   ↓
15. Total time: 800ms (first token) to 2,500ms (complete response)
```

---

## Technology Stack

### Frontend Layer

**Core Framework**: Next.js 14.2.5
- React 18.3.1 (Server Components + Client Components)
- TypeScript 5.4.5 (strict mode enabled)
- App Router architecture (file-based routing)
- Streaming Server-Side Rendering (SSR) for faster page loads

**Progressive Web App (PWA)**:
- Service Worker: `public/sw.js` (custom offline cache strategy)
- Web App Manifest: `public/manifest.json`
- Cache-first strategy for knowledge base JSON (11MB)
- Network-first strategy for API calls with offline fallback
- Install prompt for "Add to Home Screen"

**UI/Styling**:
- CSS Modules for component-scoped styles
- Mobile-first responsive design (breakpoints: 768px, 1024px)
- High contrast mode for sunlight readability
- Large touch targets (min 44x44px) for gloved hands

**Key Libraries**:
- `minisearch` v7.1.0: BM25 full-text search for local knowledge base
- `zod` v3.23.8: Runtime type validation for API payloads
- Native Web APIs: Web Speech API (voice input), Fetch API, Service Worker API

### Backend Layer

**Runtime**: Node.js 20 LTS (package.json engine constraint)
- Next.js API Routes (serverless functions on Netlify/Vercel)
- Edge middleware for authentication and rate limiting
- Server actions for form submissions

**API Endpoints**:
```typescript
// Public endpoints (authenticated users)
POST   /api/chat           // JSON response (non-streaming)
POST   /api/chat/stream    // Server-Sent Events (SSE) streaming
GET    /api/dosing         // List all medication calculators
POST   /api/dosing         // Calculate medication dose
GET    /api/health         // Health check + KB diagnostics
GET    /api/metrics        // Runtime metrics (P50/P95 latency, counters)

// Authentication endpoints
POST   /api/auth/login     // Azure AD SSO login
POST   /api/auth/logout    // Session termination

// Admin endpoints (medical director + admin roles only)
GET    /api/admin/audit    // Query audit logs
GET    /api/admin/users    // List users
POST   /api/admin/users    // Create/update users
```

**Core Services**:
```
lib/
├── managers/
│   ├── chat-service.ts              // LLM orchestration
│   ├── knowledge-base-initializer.ts // KB loading + caching
│   ├── metrics-manager.ts            // Performance tracking
│   └── medication-dosing-manager.ts  // Dosing calculators
├── retrieval.ts                      // BM25 search implementation
├── auth/
│   ├── session.ts                    // JWT session management
│   ├── rbac.ts                       // Role-based access control
│   └── types.ts                      // Auth type definitions
├── security/
│   └── rate-limit.ts                 // Rate limiting utilities
├── audit/
│   ├── audit-logger.ts               // HIPAA audit logging
│   └── types.ts                      // Audit event types
├── dosing/
│   ├── calculators/                  // 17 medication calculators
│   │   ├── epinephrine.ts
│   │   ├── atropine.ts
│   │   ├── midazolam.ts
│   │   └── ...
│   ├── medication-dosing-manager.ts
│   ├── types.ts
│   └── registry.ts                   // Calculator registry
└── narrative/
    └── ems-narrative-generator.ts    // ePCR narrative generation
```

### Database Layer

**Primary Database**: Supabase PostgreSQL 15
- Hosted on AWS (us-west-2 region)
- Multi-AZ deployment for high availability
- Automated daily backups (30-day retention)
- Point-in-time recovery (7-day window)

**Schema Overview**:
```sql
-- Users table (synchronized from Azure AD)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  azure_ad_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  badge_number TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('paramedic', 'emt', 'captain', 'medical_director', 'admin')),
  station_id TEXT,
  department TEXT NOT NULL DEFAULT 'lacfd',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Audit logs (6-year retention for HIPAA compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  action TEXT NOT NULL, -- 'chat.query', 'chat.stream', 'dosing.calculate', etc.
  resource TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'partial')),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  duration_ms INTEGER,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for query performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Health metrics (performance tracking)
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_metrics_endpoint ON health_metrics(endpoint, timestamp);

-- Knowledge base (optional - currently using JSON file)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  title TEXT,
  category TEXT,
  protocol_section TEXT,
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Alternative: File-Based Audit Logs** (Current Implementation)
- JSON Lines format: `logs/audit-{date}.jsonl`
- Daily rotation: New file per day
- Automatic cleanup: Delete files older than 2,190 days (6 years)
- Append-only writes for tamper resistance
- Example log entry:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-01-15T10:23:45.123Z",
  "userId": "abc123",
  "userRole": "paramedic",
  "sessionId": "sess_xyz789",
  "action": "chat.stream",
  "resource": "protocol_query",
  "outcome": "success",
  "metadata": {
    "queryLength": 28,
    "protocolsReferenced": ["PCM 1.2.1", "PCM 1.2.2"]
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
  "durationMs": 1234
}
```

### Authentication & Authorization

**Azure Active Directory (Azure AD) SSO**:
- OAuth 2.0 / OpenID Connect (OIDC) flow
- SAML 2.0 federation with LA County AD (future)
- Multi-factor authentication (MFA) enforced at Azure AD level
- Conditional access policies: Require MFA, block legacy auth

**Session Management** (`lib/auth/session.ts`):
- JWT tokens (signed with HS256)
- Payload: `{ userId, role, exp, iat }`
- Token expiration: 60 minutes (configurable via `SESSION_DURATION_MINUTES`)
- Stored in HTTP-only, Secure, SameSite=Strict cookies
- Refresh tokens rotated on each use (future enhancement)

**Role-Based Access Control (RBAC)** (`lib/auth/rbac.ts`):
```typescript
// Permission matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  paramedic: [
    "chat.access", "chat.als",
    "dosing.access", "dosing.advanced",
    "protocols.access"
  ],
  emt: [
    "chat.access", "chat.bls_only",
    "dosing.access", "dosing.basic",
    "protocols.access"
  ],
  captain: [
    "chat.access", "chat.als",
    "dosing.access", "dosing.advanced",
    "protocols.access",
    "audit.view"
  ],
  medical_director: [
    "chat.access", "chat.als",
    "dosing.access", "dosing.advanced",
    "protocols.access", "protocols.edit",
    "audit.view", "audit.export"
  ],
  admin: [
    "chat.access", "chat.als",
    "dosing.access", "dosing.advanced",
    "protocols.access", "protocols.edit",
    "audit.view", "audit.export",
    "system.config", "system.manage_users"
  ]
};
```

### LLM Integration

**OpenAI API** (Vendor-Agnostic):
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini` (cost-optimized, fast)
- Fallback: `gpt-4o` (higher accuracy for complex queries)
- Temperature: 0.1 (low variability for clinical consistency)
- Max tokens: 1,000 (configurable via `LLM_MAX_TOKENS`)
- Streaming: Server-Sent Events (SSE) for real-time responses

**System Prompt** (Guardrails):
```
You are an AI assistant for LA County Fire Department paramedics.
Your role is to provide accurate, protocol-based guidance using ONLY
the LA County Prehospital Care Manual (PCM).

CRITICAL RULES:
1. ONLY cite protocols from the provided context (LA County PCM)
2. NEVER recommend medications not explicitly authorized in PCM
3. ALWAYS cite protocol sections (e.g., "PCM 1.2.1 - Chest Pain")
4. If you don't know, say "I don't have that protocol information"
5. NEVER provide general medical advice outside of LA County protocols
6. Format responses as concise bullet points (max 5-7 bullets)
7. Include "Base contact required" when protocols mandate it

Remember: This is a reference tool. Paramedics must use clinical judgment.
```

**Cost Optimization**:
- Input tokens: ~500 tokens/query (context + prompt)
- Output tokens: ~300 tokens/response (bullet points + citations)
- Total: ~800 tokens/query
- Cost: $0.00015 per query (gpt-4o-mini: $0.15/1M input, $0.60/1M output)
- Annual cost (450K queries): $67.50/year (negligible)

**Fallback Strategy** (If OpenAI API Unavailable):
- Return cached protocol chunks directly (no LLM summarization)
- Fallback message: "AI summarization unavailable. Showing raw protocols:"
- Degraded experience but functional

---

## Security Architecture

### Network Security

**TLS 1.3 Encryption** (Enforced via `next.config.mjs`):
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Automatic HTTP → HTTPS redirect
- Certificate management: Netlify/Let's Encrypt (auto-renewal)

**Content Security Policy (CSP)**:
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https:;
connect-src 'self' https://api.openai.com https://*.supabase.co https://login.microsoftonline.com;
font-src 'self' data: https://fonts.gstatic.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests;
```

**Security Headers** (OWASP Best Practices):
- `X-Content-Type-Options: nosniff` → Prevent MIME sniffing
- `X-Frame-Options: DENY` → Prevent clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` → Limit referrer leakage
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` → Disable unnecessary APIs
- `X-XSS-Protection: 1; mode=block` → Legacy XSS protection

**Rate Limiting** (`lib/security/rate-limit.ts`):
```typescript
export const RATE_LIMITS = {
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 },      // 5 attempts per 15 min
  CHAT: { limit: 30, windowMs: 60 * 1000 },          // 30 requests per minute
  API: { limit: 100, windowMs: 60 * 1000 },          // 100 requests per minute
  PHI: { limit: 50, windowMs: 60 * 1000 },           // 50 PHI access per minute
  GLOBAL: { limit: 1000, windowMs: 15 * 60 * 1000 }  // 1000 requests per 15 min
};
```

### Application Security

**Input Validation** (Zod Schemas):
```typescript
// Example: Chat query validation
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1).max(2000) // Prevent abuse
  })).min(1).max(20), // Limit conversation history
  stream: z.boolean().optional()
});

// Example: Dosing calculation validation
const DosingRequestSchema = z.object({
  medicationId: z.string(),
  request: z.object({
    patientWeightKg: z.number().min(3).max(150), // Safety bounds
    scenario: z.enum(["arrest", "seizure", "pain", "sedation"])
  })
});
```

**SQL Injection Prevention**:
- Parameterized queries only (PostgreSQL prepared statements)
- No dynamic SQL construction
- ORM (Prisma) for type-safe database access (future enhancement)

**XSS Prevention**:
- React escapes all user input by default
- DOMPurify for sanitizing HTML (if needed)
- CSP prevents inline script execution

**CSRF Prevention**:
- SameSite=Strict cookies
- CSRF tokens for state-changing operations (future)

### Data Protection

**Encryption at Rest**:
- PostgreSQL: AES-256 encryption (Supabase managed)
- Audit logs: OS-level encryption (ext4 encryption on Linux)
- Secrets: Environment variables (Netlify/Vercel encrypted storage)

**Encryption in Transit**:
- TLS 1.3 for all HTTPS connections
- Certificate pinning for API communication (future)

**PHI Handling** (HIPAA Compliance):
- **ZERO patient data stored in system**
- Protocol queries do NOT contain patient names, DOB, MRN, etc.
- Audit logs capture query LENGTH, not query TEXT
- Example safe query: "chest pain protocol" (generic)
- Example unsafe query: "chest pain for John Doe, DOB 01/15/1970" (contains PHI - rejected)

**Data Retention**:
- Audit logs: 6 years (HIPAA requirement)
- Health metrics: 90 days (performance optimization)
- User sessions: 60 minutes (JWT expiration)
- Deleted user data: Soft delete with 30-day retention (account recovery)

---

## Scalability & Performance

### Current Capacity (Pilot)
- **Concurrent users**: 200 paramedics
- **Requests per second**: 100 sustained, 300 burst
- **P95 latency**: <3 seconds (API response time)
- **Uptime**: 99.9% target (43 minutes downtime/month allowed)

### Target Capacity (Full Deployment)
- **Concurrent users**: 3,200 paramedics (174 stations × ~18 paramedics)
- **Peak load**: 500 concurrent users (15% of department)
- **Requests per second**: 300 sustained, 1,000 burst
- **P95 latency**: <2 seconds
- **Uptime**: 99.95% SLA (22 minutes downtime/month)

### Auto-Scaling Strategy

**Netlify/Vercel (Current)**:
- Serverless functions auto-scale horizontally
- No manual scaling configuration required
- Cold start penalty: ~200ms (acceptable for non-critical queries)

**AWS/Azure (Production Migration)**:
```
Application Tier:
- ECS/AKS with Fargate/Virtual Nodes (serverless containers)
- Auto-scaling policy: Target 70% CPU utilization
- Min instances: 3 (1 per AZ)
- Max instances: 10 (burst capacity)
- Scale-out trigger: >70% CPU for 2 minutes
- Scale-in trigger: <30% CPU for 5 minutes

Database Tier:
- RDS PostgreSQL Multi-AZ (primary + standby replica)
- Read replicas: 2 (for audit log queries and analytics)
- Connection pooling: PgBouncer (max 100 connections per instance)
- Auto-scaling storage: Start 100GB, grow to 1TB

Load Balancer:
- Application Load Balancer (ALB) / Azure Load Balancer
- Health check: GET /api/health every 30 seconds
- Unhealthy threshold: 3 consecutive failures
- Drain connections on scale-in (30-second delay)
```

### Caching Strategy

**Client-Side Cache** (Service Worker):
- Knowledge base JSON: Cache indefinitely, update on version change
- Static assets: Cache for 24 hours
- API responses: No cache (always fetch latest)

**Server-Side Cache**:
- Protocol chunks: In-memory LRU cache (10MB max)
- Common queries: Cache for 5 minutes (reduce LLM API calls)
- User sessions: Redis cache (future) for distributed session store

**CDN Cache** (CloudFront/Azure CDN):
- Static assets: Cache for 1 year (versioned URLs)
- HTML pages: No cache (dynamic content)
- API endpoints: No cache (always fresh data)

### Performance Monitoring

**Health Check Endpoint** (`/api/health`):
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:23:45.123Z",
  "uptime": 3600,
  "kbStatus": {
    "loaded": true,
    "documentCount": 810,
    "lastLoad": "2025-01-15T10:00:00.000Z",
    "source": "local"
  },
  "llmStatus": {
    "available": true,
    "model": "gpt-4o-mini",
    "latencyMs": 234
  },
  "dbStatus": {
    "connected": true,
    "latencyMs": 12
  }
}
```

**Metrics Dashboard** (`/api/metrics`):
- Request counters by endpoint
- Latency histograms (P50, P95, P99)
- Error rates by status code
- LLM API call durations
- Database query times

---

## Integration Architecture

### CAD System Integration (Phase 2)

**Webhook Endpoint**: `POST /api/integrations/cad/incidents`

**Payload Example**:
```json
{
  "incidentId": "LA-2025-012345",
  "dispatchTime": "2025-01-15T10:23:45Z",
  "incidentType": "MEDICAL - CHEST PAIN",
  "location": {
    "address": "123 Main St, Los Angeles, CA 90001",
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "units": ["E71", "RA71", "BC5"],
  "chiefComplaint": "55YOM chest pain, difficulty breathing",
  "priority": "CODE 3"
}
```

**Response Flow**:
1. CAD system sends incident data on dispatch
2. Medic Bot receives webhook, validates payload
3. Extracts chief complaint: "chest pain, difficulty breathing"
4. Pre-loads relevant protocols (PCM 1.2.1 - Chest Pain)
5. When paramedic opens app, protocols are already cached
6. Estimated time savings: 5-10 seconds per call

### ePCR System Integration (Phase 2)

**Export Endpoint**: `POST /api/integrations/epcr/narrative`

**Payload Example**:
```json
{
  "incidentId": "LA-2025-012345",
  "sessionId": "sess_xyz789",
  "queriesUsed": [
    "chest pain protocol",
    "nitroglycerin dosing",
    "STEMI criteria"
  ],
  "protocolsReferenced": [
    "PCM 1.2.1 - Chest Pain/ACS",
    "PCM 1.2.2 - STEMI Recognition"
  ]
}
```

**Generated Narrative** (NEMSIS 3.5.0 Compliant):
```
CLINICAL IMPRESSION: Acute coronary syndrome (ACS)

TREATMENT: Per LA County PCM 1.2.1 (Chest Pain/ACS), administered:
- Aspirin 324mg PO (chewed)
- Nitroglycerin 0.4mg SL x3 doses (per PCM 1.2.3)
- 12-lead ECG obtained - STEMI criteria met (per PCM 1.2.2)

BASE CONTACT: Contacted base hospital at 10:35 for STEMI bypass to
UCLA Medical Center per PCM 1.2.4.

AI ASSISTANT REFERENCE: Used Medic Bot to confirm protocol compliance.
All treatments aligned with LA County PCM protocols.
```

### Hospital System Integration (Phase 3)

**Destination Protocol API**: `GET /api/integrations/hospitals/routing`

**Use Cases**:
- STEMI bypass: Closest PCI-capable facility
- Stroke bypass: Closest certified stroke center
- Trauma center selection: Trauma triage criteria
- Pediatric specialty routing: Children's hospitals

---

## Disaster Recovery & Business Continuity

### Backup Strategy

**Database Backups** (Automated):
- Daily full backups: 30-day retention
- Point-in-time recovery: 7-day window
- Cross-region replication: US-West-2 → US-East-1
- Backup validation: Monthly restore tests

**Audit Log Backups**:
- Real-time replication to AWS S3/Azure Blob
- Versioning enabled (prevent accidental deletion)
- Lifecycle policy: Archive to Glacier after 1 year, delete after 6 years

**Knowledge Base Backups**:
- Git repository: GitHub private repo (version control)
- Weekly snapshots to S3/Blob Storage
- Rollback capability for protocol updates

### Failover Plan

**Multi-Region Architecture** (Production):
```
Primary Region: US-West-2 (Oregon)
├─ Application: ECS/AKS cluster (3 instances)
├─ Database: RDS Multi-AZ (primary + standby)
└─ Load Balancer: ALB with health checks

Secondary Region: US-East-1 (Virginia)
├─ Application: ECS/AKS cluster (standby, scaled to zero)
├─ Database: RDS Read Replica (async replication)
└─ Load Balancer: ALB (standby)

DNS Failover: Route 53 / Azure Traffic Manager
└─ Health check: Primary /api/health endpoint every 30 seconds
└─ Failover trigger: 3 consecutive failures (90 seconds)
└─ TTL: 60 seconds (fast DNS propagation)
```

**Failover Procedure** (Automated):
1. Route 53/Traffic Manager detects primary region failure
2. DNS updated to point to secondary region (60-second TTL)
3. Secondary ECS/AKS cluster scales from 0 to 3 instances (2 minutes)
4. Database read replica promoted to primary (5 minutes)
5. Total failover time: **7 minutes**

**Recovery Time Objective (RTO)**: 4 hours (manual failover)
**Recovery Point Objective (RPO)**: 1 hour (max data loss)

### Incident Response Plan

**Severity Levels**:
- **P1 (Critical)**: App down, data breach, patient safety risk
- **P2 (High)**: Degraded performance, partial outage
- **P3 (Medium)**: Minor bugs, slow queries
- **P4 (Low)**: Cosmetic issues, feature requests

**P1 Incident Response** (Critical):
1. **Detection**: Monitoring alert (UptimeRobot, PagerDuty)
2. **Notification**: Page on-call engineer + medical director + fire chief
3. **Assessment**: Triage within 5 minutes
4. **Mitigation**: Rollback, failover, or hotfix within 15 minutes
5. **Communication**: Status page updated, email to all users
6. **Resolution**: Issue resolved + post-mortem report within 48 hours

---

## Deployment Strategy

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - name: Deploy to Netlify
        run: |
          npx netlify-cli deploy --prod --dir=.next
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Blue-Green Deployment

**Strategy**: Zero-downtime deployment with instant rollback

**Process**:
1. **Blue environment**: Current production (live traffic)
2. **Green environment**: New version deployed (no traffic)
3. **Smoke tests**: Run automated tests on green environment
4. **Traffic shift**: Route 10% of traffic to green (canary deployment)
5. **Monitoring**: Watch error rates for 10 minutes
6. **Full cutover**: Route 100% traffic to green
7. **Rollback**: If issues detected, instant switch back to blue

### Environment Management

**Environments**:
- **Local**: Developer laptops (`npm run dev`)
- **Staging**: Pre-production testing (Netlify preview deploys)
- **Production**: Live environment (Netlify production or AWS/Azure)

**Environment Variables** (per environment):
```bash
# Authentication
AZURE_AD_CLIENT_ID=xxx
AZURE_AD_CLIENT_SECRET=xxx
AZURE_AD_TENANT_ID=xxx

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_SIZE=20

# LLM
LLM_API_KEY=sk-xxx
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1

# Application
SESSION_SECRET=xxx (32-byte random string)
SESSION_DURATION_MINUTES=60

# Feature Flags
ENABLE_VOICE_INPUT=true
ENABLE_CAD_INTEGRATION=false (Phase 2)
```

---

## Compliance & Auditing

### HIPAA Compliance Checklist

**Administrative Safeguards**:
- [x] Risk assessment completed
- [x] Security policies documented
- [x] Workforce training on PHI handling
- [x] Incident response plan documented
- [x] Business Associate Agreements (BAAs) signed

**Physical Safeguards**:
- [x] Data center security (AWS/Azure SOC 2 certified)
- [x] Device encryption required (MDTs, tablets)
- [x] Access logs reviewed quarterly

**Technical Safeguards**:
- [x] Unique user IDs (Azure AD integration)
- [x] Automatic log-off (60-minute session timeout)
- [x] Encryption in transit (TLS 1.3)
- [x] Encryption at rest (AES-256)
- [x] Audit controls (6-year retention)
- [x] Integrity controls (append-only logs)
- [x] Authentication (MFA enforced)

### Audit Log Retention

**HIPAA Requirement**: 6 years from date of creation or last use

**Implementation**:
```typescript
// lib/audit/audit-logger.ts
const config = {
  fileSink: {
    logDir: '/var/log/medic-bot/audit',
    filePattern: 'audit-{date}.jsonl',
    rotation: 'daily',
    maxFiles: 2190, // 6 years × 365 days = 2,190 files
  }
};
```

**Automated Cleanup**:
- Daily cron job: Check for files older than 2,190 days
- Delete expired files: Secure deletion (shred on Linux)
- Archival (optional): Move to cold storage (AWS Glacier) before deletion

---

## Monitoring & Observability

### Application Performance Monitoring (APM)

**Metrics Collected**:
- Request rate (requests/second)
- Error rate (errors/second)
- P50/P95/P99 latency (milliseconds)
- LLM API call durations
- Database query times
- Memory usage
- CPU utilization

**Dashboards**:
- Real-time metrics: `/api/metrics/dashboard`
- Historical trends: CloudWatch/Azure Monitor
- User analytics: Custom event tracking (protocol usage, popular queries)

### Alerting

**Alert Rules** (PagerDuty):
```yaml
# Critical alerts (page immediately)
- rule: "App down"
  condition: "Health check fails for 3 consecutive checks (90 seconds)"
  severity: P1
  notify: [on-call-engineer, fire-chief, medical-director]

- rule: "High error rate"
  condition: "Error rate > 5% for 5 minutes"
  severity: P1
  notify: [on-call-engineer]

# Warning alerts (email only)
- rule: "Elevated latency"
  condition: "P95 latency > 5 seconds for 10 minutes"
  severity: P2
  notify: [engineering-team]

- rule: "LLM API slow"
  condition: "LLM API P95 latency > 3 seconds for 5 minutes"
  severity: P2
  notify: [engineering-team]
```

### Log Aggregation

**Production Logging** (CloudWatch/Splunk):
- Application logs: INFO level (warnings + errors)
- Audit logs: All events (HIPAA requirement)
- Access logs: All HTTP requests
- Retention: 90 days (application logs), 6 years (audit logs)

---

## Contact Information

**Technical Architecture Lead**: [Name]
**Email**: [email]@fire.lacounty.gov
**Phone**: [phone]

**DevOps/Infrastructure**: [Name]
**Email**: [email]@fire.lacounty.gov
**Phone**: [phone]

**Security Officer**: [Name]
**Email**: [email]@fire.lacounty.gov
**Phone**: [phone]

**On-Call Rotation**: [PagerDuty link]

---

*Document Version 1.0 - January 2025*
*Classification: Internal Use - LA County Fire IT Leadership*
