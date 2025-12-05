# County EMS Protocol Assistant & AI Chatbot
**Production-grade, field-tested medical AI solution for emergency medical services.**- Instant access: **No login required**
- **Mobile-first, PWA, fully offline-capable**

***

## 🚀 **Quick Start**

### For Paramedics
See our [Quick Start Guide](docs/QUICK_START.md) for:
- Keyboard shortcuts for speed
- Settings for accessibility (theme, font size, high contrast)
- PWA install instructions
- Troubleshooting FAQs

### For Developers
Clone, setup and run locally in just 5 minutes:
```bash
npm install                               # Install dependencies
supabase start                            # Start local DB (requires Docker)
cp .env.example .env.local                # Set env vars (Supabase + Claude/OpenAI keys)
supabase db push                          # Run migrations
PORT=3002 npm run dev                     # Start server
# Open http://localhost:3002
```
Full instructions: [QUICK_START.md](docs/QUICK_START.md)

**Documentation:**  
- [System Architecture](docs/ARCHITECTURE.md)  
- [Database Schema](docs/DATABASE.md)  
- [API Reference](docs/API.md)  
- [Testing Guide](docs/TESTING.md)  
- [Deployment Guide](docs/DEPLOYMENT.md)

***

## 📱 **Core Features**

- **Zero authentication**: Public + rate limited
- **Mobile-optimized UI**: Designed for field use  
- **100% offline support**: Cached knowledge, usable anywhere
- **Sunlight & contrast modes**: EMS field conditions
- **Voice input**: Hands-free queries
- **98% medical validation (LA County PCM)**
- **Real-time SSE streaming**
- **Installable PWA web app**

### UX Innovations
- **Error boundary**: No app crashes, field-safe recovery UI
- **Toast notifications**: Actionable feedback, ARIA-accessible
- **Settings panel**: Font size, contrast, motion, theme
- **Keyboard shortcuts**: All key EMS workflows
- **WebVitals monitoring**: Performance for legacy devices

***

## 🏗️ **Architecture**

- **Frontend**: Next.js App Router, React 18, Tailwind CSS
- **Backend**: Supabase PostgreSQL, pgvector, MiniSearch (BM25/Fuzzy)
- **LLM**: Claude 3.7 Sonnet via Anthropic API or OpenAI
- **Security**: Rate limiting, request fingerprinting, HIPAA-compliant logging
- **Deployment**: Netlify Edge/CDN, mobile/PWA

See [docs/technical-architecture.md](docs/technical-architecture.md) for diagrams.

***

## 📦 **Testing & Validation**

- **Unit + Integration Tests**: 247 tests (75% passing; see [Testing Guide](docs/TESTING.md))
- **Medical accuracy**: Pediatric dosing (Broselow), Adult PCM, contra validation

## 📊 **Performance Targets**
- <8s time-to-interactive (3G)
- <3s P95 latency
- <500KB bundle
- 99.9% uptime

***

## 🔐 **Security**

- **Rate limits**: 20 req/min (chat), 60 req/min (API)
- **PHI excluded**: Only metadata logged
- **Audit logs**: 6-year retention for compliance
- **Strict security headers**

***

## 📚 **Developer API Endpoints**

- `/api/chat`: POST user queries (JSON/SSE)
- `/api/dosing`: GET/POST medication dosages
- `/api/health`, `/api/metrics`: HM & performance
- `/api/admin/rate-limits`: (protected)

See [docs/API.md](docs/API.md) for full documentation.

***

## 🚑 **Details & Components**
- EMS PCM search: 1,200+ protocols, auto-citation
- Medication calculators w/ pediatric safety
- Streaming chat (SSE)
- Offline cache, PWA install prompt

***

## ⚖️ **Legal & Compliance**

- **Use for education/reference only—not official clinical authority.**
- **HIPAA compliant**
- **For authorized EMS agency use only**
***

## 🚀 **Roadmap**

- **Phase 1**: Complete—Chat, PCM search, PWA, validation, dosing, testing
- **Phase 2**: ImageTrend ePCR integration, SSO, EMS pilot
- **Phase 3**: Updates, hospital routing, mobile apps, predictive dosing

See [ImageTrend Roadmap](docs/planning/imagetrend-integration-roadmap.md)

***


***


**Version:** 0.8 | **Updated:** Jan 2025 | **Classification:** EMS Protocol Assistant
