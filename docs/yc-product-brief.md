# Medic Bot — YC Product Brief

## One-Liner
- Mobile-first LA County EMS assistant that delivers protocol-cited treatment plans, pediatric dosing, and ImageTrend-ready narratives in under three seconds—online or offline.

## Problem
- LA County Fire’s 3,200 paramedics lose 20+ hours a year flipping through PDFs for PCM guidance during 450k annual calls.
- Pediatric dosing math still happens under stress, driving 10× error risk and medical director scrutiny.
- ePCR documentation (ImageTrend Elite) remains manual; narratives, meds, and vitals are retyped after every incident.

## Solution
- Conversational protocol copilots tuned to the Los Angeles County Prehospital Care Manual (PCM) with zero hallucination tolerance.
- Embedded pediatric calculators (MCG 1309) and protocol branching that surface base-contact triggers in real time.
- Narrative and medication exports formatted for NEMSIS 3.5/ImageTrend ingestion, eliminating double entry.

## Product & UI
- **Field UI:** Next.js 14 PWA with glove-friendly controls, high-contrast “Apparatus Sunlight” theme, and sub-3s load on 3G.
- **Contextual Chat:** Streams PCM-cited actions, displays priority stack (P1/P2/P3), and pins base-contact rules inline.
- **Quick Actions Bar:** Voice capture, Broselow color selector, telemetry snapshot, and CAD handoff—all within thumb reach.
- **Dosing Workspace:** Color-coded medication tiles, trend charts, and one-tap export to the ePCR payload queue.
- **Incident Timeline:** Fuses vitals, interventions, and CAD timestamps into ImageTrend-ready narratives and QA checklists.

## Feature Suite (Agent-Orchestrated)
- **Protocol Orchestrator Agent:** Maps free-text queries to LA County PCM pathways, auto-surfaces base contact triggers, and escalates to specialty protocols (STEMI, stroke, trauma) when telemetry or CAD context demands it.
- **Pediatric Dosing Coach:** Locks to MCG 1309 Broselow colors, preloads contraindication checks, and pushes dose/volume to both the narrative composer and the ImageTrend payload.
- **Narrative Scribe:** Converts the live timeline into SOAP, chronological, and NEMSIS snippets with citation tracking; flags missing mandatory ImageTrend fields before export.
- **QA Sentinel:** Applies LA County guardrails, HIPAA-safe audit logging, and rate-limit monitoring, alerting medics if guidance deviates or documentation is incomplete.
- **ImageTrend Bridge:** Shapes meds, vitals, and narrative data into the vendor’s REST schema, queues retries offline, and confirms acceptance once the ePCR record syncs.

## Traction & Proof
- 98% protocol validation rate with LA County medical directors during pilot walkthroughs.
- Knowledge base load dropped 98.9% (10.6MB → 117KB) enabling reliable offline ops on decade-old devices.
- Streaming responses deliver first tokens in <800ms; average full answer in 2.5s across Netlify Edge.

## Why Los Angeles County
- Largest municipal EMS system in the US with a unified PCM; leadership mandate to modernize ImageTrend workflows.
- Existing chunked knowledge base is scoped exclusively to LA County policies, minimizing regulatory lift.
- County EMS already standardizes on ImageTrend Elite, making ePCR integration the obvious wedge.

## ImageTrend Integration Path
- **Phase 1 (Complete):** Generate NEMSIS-aligned narratives, medication lists, and vitals from field interactions.
- **Phase 2 (In flight):** Authenticate against ImageTrend Elite sandbox, push narrative and med payloads via vendor API.
- **Phase 3:** Bidirectional sync—pre-populate Medic Bot with CAD/ePCR context and confirm reconciliation checkpoints.

## Business Model
- Annual SaaS license to LA County Fire (seat-based or station bundle) with ImageTrend integration as premium module.
- Expansion to neighboring agencies (e.g., Torrance, Pasadena) using the same PCM stack once LA County launches.
- Add-on analytics for medical directors: audit-ready protocol adherence and dosing variance dashboards.

## Next Milestones
- Close ImageTrend Elite sandbox testing (Q1), demo write-back in pilot stations, and lock department-wide rollout plan.
- Playwright coverage for offline hydration and pediatric flows; add automated regression around guardrail violations.
- Finalize HIPAA-compliant audit pipeline and publish security whitepaper for County procurement board.

## The Ask
- Introductions to Y Combinator partners with ImageTrend or California municipal procurement experience.
- Warm leads into LA County Fire command staff to accelerate production deployment approvals.
