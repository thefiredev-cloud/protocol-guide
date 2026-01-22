# Protocol Guide - Agent Library

Quick reference for invoking specialized agents. Just paste the agent prompt into Claude Code or reference the file.

## Usage

```bash
# Read an agent's full instructions
cat agents/engineering/ai-engineer.md

# Or just tell Claude Code:
"Use the ai-engineer agent to optimize our RAG pipeline"
```

---

## 🎨 Design Agents

| Agent | File | Use For |
|-------|------|---------|
| **Brand Guardian** | `design/brand-guardian.md` | Ensure EMS red theme consistency, logo usage |
| **UI Designer** | `design/ui-designer.md` | Glove-friendly UI, one-handed operation |
| **UX Researcher** | `design/ux-researcher.md` | User interviews, paramedic workflow analysis |
| **Visual Storyteller** | `design/visual-storyteller.md` | App Store screenshots, marketing visuals |
| **Whimsy Injector** | `design/whimsy-injector.md` | Easter eggs, personality while staying professional |

---

## 🔧 Engineering Agents

| Agent | File | Use For |
|-------|------|---------|
| **AI Engineer** | `engineering/ai-engineer.md` | Claude RAG, Voyage embeddings, prompt optimization |
| **Backend Architect** | `engineering/backend-architect.md` | tRPC routes, Drizzle schema, TiDB optimization |
| **DevOps Automator** | `engineering/devops-automator.md` | CI/CD, EAS builds, Sentry monitoring |
| **Frontend Developer** | `engineering/frontend-developer.md` | React Native, NativeWind, Expo Router |
| **Mobile App Builder** | `engineering/mobile-app-builder.md` | iOS/Android builds, App Store submission |
| **Rapid Prototyper** | `engineering/rapid-prototyper.md` | Quick POCs, experimental features |
| **Test Writer/Fixer** | `engineering/test-writer-fixer.md` | Vitest tests, fix failing tests, coverage |

---

## 📣 Marketing Agents

| Agent | File | Use For |
|-------|------|---------|
| **App Store Optimizer** | `marketing/app-store-optimizer.md` | ASO, keywords, screenshots, descriptions |
| **Content Creator** | `marketing/content-creator.md` | Blog posts, EMS educational content |
| **Growth Hacker** | `marketing/growth-hacker.md` | User acquisition, fire dept partnerships |
| **Instagram Curator** | `marketing/instagram-curator.md` | EMS community visuals, Stories |
| **Reddit Builder** | `marketing/reddit-community-builder.md` | r/ems, r/Paramedics engagement |
| **TikTok Strategist** | `marketing/tiktok-strategist.md` | Short-form video for young EMTs |
| **Twitter Engager** | `marketing/twitter-engager.md` | EMS Twitter, industry news |

---

## 📦 Product Agents

| Agent | File | Use For |
|-------|------|---------|
| **Feedback Synthesizer** | `product/feedback-synthesizer.md` | Analyze user feedback, identify patterns |
| **Sprint Prioritizer** | `product/sprint-prioritizer.md` | Backlog grooming, feature prioritization |
| **Trend Researcher** | `product/trend-researcher.md` | EMS industry trends, competitor analysis |

---

## 📋 Project Management Agents

| Agent | File | Use For |
|-------|------|---------|
| **Experiment Tracker** | `project-management/experiment-tracker.md` | A/B tests, feature flags, results |
| **Project Shipper** | `project-management/project-shipper.md` | Release management, App Store launches |
| **Studio Producer** | `project-management/studio-producer.md` | Overall coordination, status updates |

---

## 🏢 Studio Operations Agents

| Agent | File | Use For |
|-------|------|---------|
| **Analytics Reporter** | `studio-operations/analytics-reporter.md` | Usage metrics, retention, revenue |
| **Finance Tracker** | `studio-operations/finance-tracker.md` | Stripe revenue, API costs, burn rate |
| **Infrastructure Maintainer** | `studio-operations/infrastructure-maintainer.md` | TiDB health, uptime, error rates |
| **Legal Compliance** | `studio-operations/legal-compliance-checker.md` | HIPAA, App Store rules, disclaimers |
| **Support Responder** | `studio-operations/support-responder.md` | User support, bug reports, escalation |

---

## 🧪 Testing Agents

| Agent | File | Use For |
|-------|------|---------|
| **API Tester** | `testing/api-tester.md` | tRPC endpoint testing, edge cases |
| **Performance Benchmarker** | `testing/performance-benchmarker.md` | Startup time, memory, battery |
| **Test Results Analyzer** | `testing/test-results-analyzer.md` | Flaky tests, coverage trends |
| **Tool Evaluator** | `testing/tool-evaluator.md` | Evaluate new libraries/tools |
| **Workflow Optimizer** | `testing/workflow-optimizer.md` | Build times, DX improvements |

---

## 🎁 Bonus Agents

| Agent | File | Use For |
|-------|------|---------|
| **Joker** | `bonus/joker.md` | EMS humor, morale, Easter eggs |
| **Studio Coach** | `bonus/studio-coach.md` | Strategic advice, mentorship |

---

## Quick Commands

```bash
# List all agents
ls -la agents/*/

# Search agents for a topic
grep -r "RAG" agents/

# Count agents (37 total)
ls agents/*/*.md | wc -l
```

---

## Context for Claude Code

When working on Protocol Guide, Claude Code can reference these agents:

- **Protocol Guide** is an EMS protocol search app for paramedics/EMTs
- **Tech stack**: React Native, Expo, tRPC, Drizzle, TiDB, Claude AI
- **Pricing**: Free (5 queries/day, 1 county) → Pro $4.99/mo (unlimited)
- **Database**: 55,000+ protocols, 2,700+ agencies, all 50 states + DC
- **Target users**: Paramedics, EMTs, firefighters, EMS students
