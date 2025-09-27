# LA County Fire Medic Bot

An EMS protocol assistant for LA County field providers. Local JSON knowledge base + BM25 retrieval (MiniSearch) + any OpenAI‑compatible chat endpoint.

## Quickstart

1) **Create env**
   ```bash
   cp .env.example .env
   # set LLM_API_KEY and keep KB_SCOPE=pcm, KB_SOURCE=clean
   ```

2) **Install + run**
   ```bash
   npm i
   npm run dev
   # visit http://localhost:3000
   ```

3) **Optional warm-up**
   ```bash
   node -e "import('./dist/lib/managers/chat-service.js').then(m => new m.ChatService().warm())"
   ```

4) **Test it**
   Ask: "What's the protocol for cardiac arrest?" or "When do I need to contact base for chest pain?"

## What this is
- Next.js App Router
- API routes:
  - `/api/chat` – JSON response
  - `/api/chat/stream` – SSE streaming response (delta events)
  - `/api/dosing` – medication calculators (GET list, POST calculate)
  - `/api/metrics` – runtime metrics snapshot (counters + latency histograms)

## Features
- **LA County PCM focused** – KB scope restricted to clean PCM ingestion
- **Rapid bullet-point answers** with base contact and med dosing
- **Voice input** for hands-free use
- **Streaming responses (SSE)** for faster perceived latency
- **Medication dosing UI** at `/dosing` backed by 17 calculators
- **Protocol decision trees** at `/protocols` (Trauma Triage, Cardiac Arrest)
- **PWA + offline** support (caches KB and core assets)
- **Health endpoint** (`/api/health`) with KB diagnostics + metrics snapshot
- **Anonymous runtime metrics** at `/api/metrics`
- **Fallback guardrails** if LLM unreachable

## Upgrade paths
- **Supabase + pgvector**: swap `lib/retrieval.ts` with your DB search and pass results to the model.
- **Add more protocols**: add chunks to `data/ems_kb.json` (fields are obvious).

## Scripts
- `npm run dev` – start dev server
- `npm run lint` – lint sources
- `npm run test` – Vitest unit/integration
- `npm run test:e2e` – Playwright suite (requires server)
- `npm run smoke` – hits `/api/health` and `/api/chat`, prints KB source history

## Deployment (Netlify)
- Ensure Node 20 runtime (see `package.json` engines)
- Set env vars: `LLM_API_KEY`, `KB_SCOPE=pcm`, `KB_SOURCE=clean`, optional KB path
- Pre-deploy: `npm run lint && npm run test && npm run test:e2e`
- Optional: `SMOKE_BASE_URL=https://<site>.netlify.app npm run smoke`
  - Confirms KB source resolution history (local vs remote) and prints last successful source

## Deployment Ops Quick Reference
- `/api/health` returns KB doc count, PCM scope, last source, resolution attempts, and LLM diagnostics
- `docs/deployment-ops.md` lists the full checklist for warming and smoke testing
- To clear caches between deploys: `node -e "import('./dist/lib/managers/knowledge-base-initializer.js').then(m => m.knowledgeBaseInitializer.reset())"`
- Care plans in the UI include dosing tables generated from the medication registry; keep pediatric KB bundles updated.
- Streaming endpoint available at `/api/chat/stream` (SSE events: `start`, `citations`, `delta`, `final`, `done`).

## Important
This bot is **for educational reference** only and does not replace official prehospital training or command authority.

---

## Endpoints

- Chat (JSON)
  ```bash
  curl -s localhost:3000/api/chat -H 'content-type: application/json' \
    -d '{"messages":[{"role":"user","content":"Chest pain"}]}' | jq .
  ```

- Chat (SSE)
  ```bash
  curl -N localhost:3000/api/chat/stream -H 'content-type: application/json' \
    -d '{"messages":[{"role":"user","content":"Chest pain"}]}'
  ```

- Dosing
  ```bash
  curl -s localhost:3000/api/dosing | jq .
  curl -s localhost:3000/api/dosing -H 'content-type: application/json' \
    -d '{"medicationId":"epinephrine","request":{"patientWeightKg":70,"scenario":"arrest"}}' | jq .
  ```

- Health + Metrics
  ```bash
  curl -s localhost:3000/api/health | jq .
  curl -s localhost:3000/api/metrics | jq .
  ```

## PWA / Offline

- `public/manifest.json` and `public/sw.js` enable install + offline caching (KB and static assets)
- Service worker auto-registers in `app/layout.tsx`

## New in this version

- Real-time SSE streaming with client-side incremental rendering
- Medication dosing UI (`/dosing`) powered by 17 calculators
- Protocol decision trees (`/protocols`) for Trauma Triage and Cardiac Arrest
- Offline/PWA support with service worker
- Health metrics with `/api/metrics` and surfaced p50 latency in the UI
