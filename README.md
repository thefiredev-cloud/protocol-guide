***

🚑 County‑Medic  
===============  

> **The EMS protocol assistant and AI copilot for prehospital care**

[Next.js](https://nextjs.org/) · [React](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Supabase](https://supabase.com/) · [Netlify](https://www.netlify.com/) · PWA

**[Visit County‑Medic →](https://county-medic.netlify.app/)** -  **Documentation (coming soon)** -  **Report Issue (GitHub Issues)**

🎯 Overview  
-----------  

County‑Medic is a field‑tested EMS protocol assistant that gives paramedics and EMTs fast, structured access to local protocols, dosing tools, and AI chat in one mobile‑first interface.

Built on a modern web stack, County‑Medic focuses on real‑world prehospital constraints: low bandwidth, intermittent connectivity, bright sunlight, and high cognitive load during calls.  It is designed as a clinical decision support tool that complements, but never replaces, agency protocols, online medical control, or physician judgment.

### Key highlights  

- Instant access to county protocols, meds, and procedures with search and AI chat  
- Mobile‑optimized PWA with offline support for rigs and stations  
- Guardrailed dosing calculators with pediatric and high‑risk checks  
- Accessibility features for low‑light, high‑glare, and fatigue‑prone environments

⭐ Features  
----------  

### 📚 Protocol Search & Guidance  

- Full‑text search across EMS protocols, policies, and reference content  
- AI chat for "what do I do next?" style questions with inline protocol citations  
- Structured flows for cardiac arrest, trauma, sepsis, respiratory distress, and more  
- Support for local variants (e.g., LA County PCM, destination guidelines, specialty centers)

### 💉 Dosing & Calculators  

- Weight‑based medication calculators with built‑in guardrails  
- Pediatric dosing aligned with Broselow‑style color zones where configured  
- Inline contraindication checks and reminders to confirm allergies and comorbidities  
- Quick‑access views for common meds (epi, amio, mag, ketamine, benzos, etc.)

### 📱 Field‑Ready UX  

- Mobile‑first layout tailored for tablets and phones used on calls  
- High‑contrast and dark modes for daylight and night operations  
- Large tap targets and keyboard shortcuts for gloved, rushed use  
- PWA install support for offline caching on rigs and station devices

### 🔄 Offline & Reliability  

- Local caching of protocols, calculators, and critical reference flows  
- Graceful offline behavior with clear indicators when AI is unavailable  
- Low‑bandwidth optimizations so the app remains usable on weak LTE/3G  
- Robust error handling and recovery for unstable network conditions

🏗️ Architecture  
----------------  

### Technology stack  

#### Frontend  

- Framework: Next.js App Router (React 18, TypeScript)  
- Styling: Tailwind CSS with EMS‑friendly design tokens  
- State management: React hooks and lightweight client state store  
- PWA: Service worker, offline caching, install prompts

#### Backend & Data  

- Database: Supabase (PostgreSQL) with vector search for protocol content  
- Search: Combined keyword and semantic search across protocols and reference data  
- API: REST/Next.js route handlers for chat, dosing, and health checks  
- Logging & Metrics: Structured logging and health endpoints for monitoring

#### AI & Safety  

- LLM: Configurable provider (e.g., Anthropic, OpenAI) with EMS‑specific system prompts  
- Guardrails: Prompting and post‑processing to enforce "protocol‑first" guidance  
- Red‑team style prompts and test cases for high‑risk scenarios (peds, OB, airway, RSI)

🚀 Getting Started  
------------------  

### Prerequisites  

- Node.js 20+  
- npm (or pnpm/yarn)  
- Supabase project (local with Docker or hosted)  
- LLM API key (Anthropic / OpenAI / other)

### Installation  

1. **Clone the repository**  

   ```bash
   git clone https://github.com/thefiredev-cloud/County-Medic.git
   cd County-Medic
   ```

2. **Install dependencies**  

   ```bash
   npm install
   ```

3. **Configure environment variables**  

   ```bash
   cp .env.example .env.local
   ```

   Then set Supabase and LLM API keys plus any deployment‑specific settings.

4. **Start local services and dev server**  

   ```bash
   # Start local Supabase (if using Docker)
   supabase start

   # Run database migrations
   supabase db push

   # Start the app
   npm run dev
   ```

   Open `http://localhost:3000` (or your configured port) in your browser.

📖 Documentation  
----------------  

Planned documentation (following the JudgeFinder docs layout):

| Document | Purpose |
| --- | --- |
| `docs/README.md` | Documentation hub and overview |
| `docs/getting-started/SETUP.md` | Detailed setup for local + staging |
| `docs/architecture/ARCHITECTURE.md` | System design and component overview |
| `docs/api/API.md` | Chat, dosing, and protocol API documentation |
| `docs/database/SCHEMA.md` | Supabase schema and relationships |
| `docs/testing/QUICK_START_TESTING.md` | How to run and extend tests |
| `docs/deployment/DEPLOYMENT.md` | Netlify (or other) deployment guide |   

🧪 Testing  
----------  

County‑Medic is intended for high‑reliability clinical environments and ships with automated tests.

Typical workflows (adjust to match your scripts):  

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Lint, type-check, and format
npm run lint
npm run type-check
npm run format
```

🔨 Development  
--------------  

Suggested scripts (align with your `package.json`):

- `npm run dev` – Start local development server  
- `npm run build` – Production build  
- `npm run lint` – ESLint checks  
- `npm run type-check` – TypeScript type checking  
- `npm run test` / `npm run test:e2e` – Tests  
- `npm run db:migrate` / `npm run db:seed` – Database migrations and seed data

🚀 Deployment  
-------------  

County‑Medic is optimized for static/edge deployment with serverless functions.

Typical Netlify‑style flow:  

1. Push to `main`  
2. Build runs `npm run build` with env vars configured in the hosting UI  
3. App is deployed to CDN with health checks and monitoring enabled

🤝 Contributing  
---------------  

Contributions, issues, and feature ideas are welcome, especially from EMS providers and agencies using the tool in the field.

Basic flow:  

1. Fork the repo  
2. Create a feature branch: `git checkout -b feature/your-feature`  
3. Add tests and docs for changes  
4. Run lint, type‑check, and tests  
5. Open a pull request with a clear description and operational context

🔒 Clinical & Security Notice  
-----------------------------  

County‑Medic is a **clinical decision support and reference tool only**, not a source of medical authority.

- Always follow local protocols, online medical control, and physician orders  
- Do not enter or store PHI unless your deployment and configuration are explicitly designed for HIPAA‑compliant use  
- Self‑hosted or agency‑hosted deployments are responsible for their own security, logging, and compliance posture

📄 License & Acknowledgments  
----------------------------  

- License: MIT (or your chosen license)  
- Thanks to the EMS community and open‑source tooling (Next.js, Supabase, Netlify, and LLM providers) that make this project possible.

***
