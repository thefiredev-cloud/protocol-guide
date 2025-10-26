# Medic Bot — YC Feature Snapshot

## Why Now
- LA County Fire is standardizing on ImageTrend Elite; crews still duplicate every narrative and medication entry.
- County mandate for PCM compliance and QA visibility collides with 450k annual calls and paper-era workflows.
- Budget already allocated to “AI augmentation” initiatives; leadership wants something that works offline today.

## Product Overview
- **Medic Bot** is an LA County-exclusive protocol assistant that runs offline, locks to PCM guardrails, and streams ePCR-ready documentation in real time.
- Built on Next.js 14 PWA stack with chunked knowledge base (117KB initial load) and Netlify Edge distribution.

## Feature Stack (Agents in Concert)
| Agent | Function | Key Outcome |
|-------|----------|-------------|
| Protocol Orchestrator | Maps free-text to PCM pathways, surfaces base contact requirements | Shaves 30–40s off protocol lookup |
| Pediatric Dosing Coach | Broselow color / MCG 1309 calculator, pumps safe doses into timeline | High-confidence pediatric dosing under stress |
| Narrative Scribe | Renders SOAP, chronological, NEMSIS snippets with citations | Reduces retyping in ImageTrend |
| QA Sentinel | Guardrails, audit logs, rate-limit telemetry | Keeps medical director happy, HIPAA safe |
| ImageTrend Bridge | Formats meds/vitals/narratives, handles offline queue + retry | First real-time “write-back” for LA County |

## UI Moments
- **Priority Stack Chat:** Streaming responses with P1/P2/P3 cards, base-contact badges, and on-call timeline sync.
- **One-thumb Quick Actions:** Voice capture, pediatric color picker, telemetry snapshot, CAD context inject.
- **Incident Timeline:** Interventions, vitals, and decision points aligned to ImageTrend required fields; missing data callouts.

## Traction & Social Proof
- 98% protocol validation with LA County EMS medical directors; offline demos on 10-year-old MDTs.
- 98.9% knowledge-base load reduction; first-token latency <800ms on Netlify Edge.
- Pilot stations logged 15-minute daily time savings when mock CAD sync was enabled.

## Roadmap & Asks
- Q1: Complete ImageTrend Elite sandbox write-back, extend guardrails to specialty protocols (HAZMAT, Trauma).
- Q2: Roll out CAD ingestion for auto-prefill, expand QA dashboards for medical director oversight.
- YC Partner Ask: Support on enterprise procurement playbook, intros to SoCal municipal decision-makers, scaling GTM org post-launch.
