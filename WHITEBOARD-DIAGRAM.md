# Protocol Guide Development Architecture
## Whiteboard Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TANNER (CEO)                                       │
│                         Voice Input: Wispr Flow                                 │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLAUDE CODE (Terminal)                                │
│                              Opus 4.5 Model                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  • Direct file operations (Read, Write, Edit)                            │  │
│  │  • Bash commands                                                          │  │
│  │  • Git operations                                                         │  │
│  │  • Task spawning to Co-Work                                               │  │
│  │  • MCP tool orchestration                                                 │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────┬───────────────────────────┘
             │                                        │
             │ Task Tool                              │ MCP Gateway
             ▼                                        ▼
┌────────────────────────────┐          ┌─────────────────────────────────────────┐
│     CLAUDE CO-WORK         │          │           DOCKER MCP                    │
│   (Parallel Sub-Agents)    │          │      (9 Servers Connected)              │
│                            │          │                                         │
│  ┌──────────────────────┐  │          │  ┌─────────────────────────────────┐   │
│  │ Agent 1: Copy files  │  │          │  │ • supabase (39 tools)           │   │
│  ├──────────────────────┤  │          │  │ • github-official (31 tools)    │   │
│  │ Agent 2: Create code │  │          │  │ • netlify (8 tools)             │   │
│  ├──────────────────────┤  │          │  │ • stripe                        │   │
│  │ Agent 3: Run tests   │  │          │  │ • filesystem                    │   │
│  ├──────────────────────┤  │          │  │ • memory                        │   │
│  │ Agent 4: Explore     │  │          │  │ • puppeteer                     │   │
│  └──────────────────────┘  │          │  │ • desktop-commander             │   │
│                            │          │  │ • context7                      │   │
│  Run in PARALLEL           │          │  └─────────────────────────────────┘   │
└────────────┬───────────────┘          └──────────────────┬──────────────────────┘
             │                                             │
             │                                             │
             └──────────────────┬──────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PROTOCOL GUIDE MANUS                                    │
│                    ~/Protocol Guide Manus/                                      │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   server/       │  │   app/          │  │   scripts/      │                 │
│  │  _core/         │  │  (tabs)/        │  │                 │                 │
│  │   • claude.ts   │  │   • index.tsx   │  │  generate-      │                 │
│  │   • embeddings  │  │   • profile.tsx │  │  embeddings.ts  │                 │
│  │   • supabase.ts │  │                 │  │                 │                 │
│  │  routers.ts     │  │                 │  │                 │                 │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘                 │
│           │                                                                     │
└───────────┼─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                    │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   ANTHROPIC     │  │   VOYAGE AI     │  │   SUPABASE      │                 │
│  │                 │  │                 │  │                 │                 │
│  │  Claude API     │  │  Embeddings     │  │  PostgreSQL     │                 │
│  │  • Haiku 4.5    │  │  • voyage-      │  │  • pgvector     │                 │
│  │  • Sonnet 4.5   │  │    large-2      │  │  • 55K chunks   │                 │
│  │                 │  │  • 1536 dim     │  │  • Auth         │                 │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                 │
│           │                    │                    │                           │
│           └────────────────────┴────────────────────┘                           │
│                                │                                                │
│                                ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         STRIPE                                          │   │
│  │                   Payments ($39/yr Pro)                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         NETLIFY                                         │   │
│  │                      Deploy & Hosting                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Query Flow (User → Response)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   USER   │───▶│  tRPC    │───▶│ VOYAGE   │───▶│ SUPABASE │───▶│  CLAUDE  │
│  Query   │    │ Router   │    │ Embed    │    │ pgvector │    │  RAG     │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                      │
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│ RESPONSE │◀───│  Format  │◀───│ Protocols│◀───│ Top 10   │◀────────┘
│ 3-5 sec  │    │  + Cite  │    │ Context  │    │ Matches  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## Agent Architecture

```
~/.claude/agents/
├── error-handlers/           ◀── NEW: Auto-fix errors
│   ├── typescript-fixer.md
│   ├── hook-fixer.md
│   ├── sql-fixer.md
│   ├── embedding-fixer.md
│   ├── test-fixer.md
│   ├── database-fixer.md
│   └── markdown-fixer.md
│
├── protocol-guide/           ◀── V3 Agents (37)
│   ├── design/       (5)
│   ├── engineering/  (7)
│   ├── marketing/    (7)
│   ├── product/      (3)
│   ├── project-mgmt/ (3)
│   ├── studio-ops/   (5)
│   ├── testing/      (5)
│   └── bonus/        (2)
│
├── cto-protocolguide.md      ◀── CTO Agent
└── [30 generic agents]
```

---

## Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT CYCLE                            │
│                                                                 │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│   │  PLAN   │────▶│  CODE   │────▶│  TEST   │────▶│ DEPLOY  │  │
│   │         │     │         │     │         │     │         │  │
│   │ Claude  │     │ Claude  │     │ Co-Work │     │ Netlify │  │
│   │ Code    │     │ Code +  │     │ Parallel│     │ MCP     │  │
│   │ + Plan  │     │ Co-Work │     │ Agents  │     │         │  │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘  │
│        │               │               │               │        │
│        ▼               ▼               ▼               ▼        │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│   │ CLAUDE  │     │ AGENTS  │     │ ERROR   │     │ GITHUB  │  │
│   │ .md     │     │ Execute │     │ HANDLERS│     │ + PR    │  │
│   │ Plan    │     │ Tasks   │     │ Auto-Fix│     │         │  │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Your Current Setup (Screenshot)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           SCREEN LAYOUT                                   │
│                                                                           │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐│
│  │        TERMINAL             │  │         CLAUDE CO-WORK              ││
│  │     (Claude Code)           │  │                                     ││
│  │                             │  │  Progress:                          ││
│  │  • SQL migration shown      │  │  ✓ Copy CLAUDE.md                   ││
│  │  • Awaiting input           │  │  ✓ Copy agents folder               ││
│  │  • 66% context used         │  │  ● Create claude.ts with Sonnet     ││
│  │                             │  │                                     ││
│  │                             │  │  Working folder:                    ││
│  │                             │  │  /Protocol Guide Manus              ││
│  ├─────────────────────────────┤  │                                     ││
│  │        FINDER               │  │  Connectors:                        ││
│  │  (Protocol Guide Manus)     │  │  • Desktop Commander                ││
│  │                             │  │                                     ││
│  │  Downloads/                 │  │                                     ││
│  │  Protocol_Guide_*.pdf       │  │                                     ││
│  └─────────────────────────────┘  └─────────────────────────────────────┘│
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐│
│  │                        WISPR FLOW                                     ││
│  │                    (Voice → Text Input)                               ││
│  └───────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference Box

```
┌─────────────────────────────────────────┐
│           QUICK COMMANDS                │
├─────────────────────────────────────────┤
│  /today     → 5 CTO agents parallel     │
│  /focus pg  → Protocol Guide context    │
│  /commit    → Git commit flow           │
│                                         │
│  Co-Work    → Parallel background tasks │
│  Task tool  → Spawn sub-agents          │
│  MCP        → External service calls    │
├─────────────────────────────────────────┤
│           KEY FILES                     │
├─────────────────────────────────────────┤
│  ~/.claude/CLAUDE.md     → Global cfg   │
│  ~/.claude/projects.json → All projects │
│  ~/.claude/agents/       → 70+ agents   │
│  MIGRATION-PLAN.md       → Current work │
└─────────────────────────────────────────┘
```

---

## LLM Routing (Protocol Guide)

```
┌─────────────────────────────────────────────────────────────────┐
│                      QUERY ROUTING                              │
│                                                                 │
│  User Query                                                     │
│      │                                                          │
│      ▼                                                          │
│  ┌───────────────┐                                              │
│  │ Check Tier    │                                              │
│  └───────┬───────┘                                              │
│          │                                                      │
│    ┌─────┴─────┐                                                │
│    │           │                                                │
│    ▼           ▼                                                │
│  FREE        PRO                                                │
│    │           │                                                │
│    │     ┌─────┴─────┐                                          │
│    │     │           │                                          │
│    ▼     ▼           ▼                                          │
│  HAIKU  HAIKU     SONNET                                        │
│  4.5    4.5       4.5                                           │
│  $0.0003 $0.0003  $0.003                                        │
│  (all)  (simple) (complex)                                      │
│                                                                 │
│  Complex = "compare", "pediatric", "why", "mechanism"           │
└─────────────────────────────────────────────────────────────────┘
```
