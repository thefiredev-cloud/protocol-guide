# CLAUDE.md - Protocol Guide Project Configuration

This file provides project context for AI assistants working with Protocol Guide.

## Project Overview

Protocol Guide is a Progressive Web App (PWA) for EMS professionals to quickly search and retrieve medical protocols. It uses natural language search powered by Claude AI and semantic embeddings via Voyage AI + pgvector.

**Key Value Proposition:** Find the right protocol in 2 seconds, not 2 minutes.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Expo/React Native Web)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Search Tab  │  │  Profile Tab │  │  Admin Panel │  │  Landing    │ │
│  │  (app/(tabs))│  │              │  │  (app/admin) │  │  Page       │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────────────┘ │
│         │                 │                 │                           │
│         └─────────────────┴─────────────────┘                           │
│                           │                                             │
│                     ┌─────▼─────┐                                       │
│                     │  tRPC     │  (lib/trpc.ts)                        │
│                     │  Client   │                                       │
│                     └─────┬─────┘                                       │
└───────────────────────────┼─────────────────────────────────────────────┘
                            │ HTTP/WebSocket
┌───────────────────────────┼─────────────────────────────────────────────┐
│                     BACKEND (Express + tRPC)                            │
│                     ┌─────▼─────┐                                       │
│                     │  tRPC     │  (server/routers/index.ts)            │
│                     │  Router   │                                       │
│                     └─────┬─────┘                                       │
│    ┌──────────────────────┼──────────────────────────────┐              │
│    │                      │                              │              │
│ ┌──▼───┐  ┌───────┐  ┌────▼────┐  ┌──────────┐  ┌───────▼───┐          │
│ │Search│  │ Query │  │  Auth   │  │   User   │  │Subscription│          │
│ │Router│  │Router │  │ Router  │  │  Router  │  │   Router   │          │
│ └──┬───┘  └───┬───┘  └─────────┘  └──────────┘  └────────────┘          │
│    │          │                                                         │
│    │    ┌─────▼─────┐                                                   │
│    │    │  Claude   │  (server/_core/claude.ts)                         │
│    │    │   RAG     │  → Haiku 4.5 (free) / Sonnet 4.5 (pro)           │
│    │    └─────┬─────┘                                                   │
│    │          │                                                         │
│    └──────────┼──────────┐                                              │
│               │          │                                              │
│         ┌─────▼─────┐    │                                              │
│         │ Embeddings│    │  (server/_core/embeddings.ts)                │
│         │ Voyage AI │    │  → voyage-large-2 (1536 dim)                 │
│         └─────┬─────┘    │                                              │
│               │          │                                              │
└───────────────┼──────────┼──────────────────────────────────────────────┘
                │          │
┌───────────────▼──────────▼──────────────────────────────────────────────┐
│                        DATA LAYER                                       │
│   ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────┐   │
│   │    Supabase       │  │    PostgreSQL     │  │     Redis        │   │
│   │  (Auth + pgvector)│  │   (via Drizzle)   │  │  (Search Cache)  │   │
│   │                   │  │                   │  │                  │   │
│   │  • 55k+ protocol  │  │  • Users          │  │  • Query cache   │   │
│   │    chunks         │  │  • Queries        │  │  • Rate limits   │   │
│   │  • Vector search  │  │  • Subscriptions  │  │  • Sessions      │   │
│   │  • 2,738 agencies │  │  • Counties       │  │                  │   │
│   └───────────────────┘  └───────────────────┘  └──────────────────┘   │
│                                                                         │
│   ┌───────────────────┐  ┌───────────────────┐                         │
│   │     Stripe        │  │     Netlify       │                         │
│   │   (Payments)      │  │  (Hosting/CDN)    │                         │
│   └───────────────────┘  └───────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Files and Their Purposes

### Frontend (`app/`)
| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout with providers (TanStack Query, tRPC, Auth) |
| `app/(tabs)/index.tsx` | Main search interface - protocol search tab |
| `app/(tabs)/profile.tsx` | User profile, subscription management |
| `app/admin/*.tsx` | Admin dashboard for agency management |
| `app/oauth/*.tsx` | OAuth callback handlers (Google, Apple) |

### Backend (`server/`)
| File | Purpose |
|------|---------|
| `server/_core/index.ts` | Express server entry point |
| `server/_core/trpc.ts` | tRPC configuration, procedures, middleware |
| `server/_core/claude.ts` | Claude SDK integration (Haiku 4.5 & Sonnet 4.5) |
| `server/_core/embeddings.ts` | Voyage AI embeddings + pgvector search |
| `server/_core/rag/index.ts` | RAG pipeline with multi-query fusion |
| `server/routers/search.ts` | Semantic search API endpoints |
| `server/routers/query.ts` | Protocol query submission with AI response |
| `server/routers/auth.ts` | Authentication, logout, password change |
| `server/routers/user.ts` | User profile, counties, disclaimer |
| `server/routers/subscription.ts` | Stripe subscription management |
| `server/routers/voice.ts` | Voice transcription for hands-free search |

### Hooks (`hooks/`)
| File | Purpose |
|------|---------|
| `use-auth.ts` | Supabase auth with token refresh |
| `use-protocol-search.ts` | Search state management with offline support |
| `use-voice-input.ts` | Voice recording and transcription |
| `use-offline-cache.ts` | Network status and offline data access |
| `use-favorites.ts` | Bookmarked protocols |

### Libraries (`lib/`)
| File | Purpose |
|------|---------|
| `trpc.ts` | tRPC client configuration |
| `supabase.ts` | Supabase client setup |
| `offline-cache.ts` | Protocol caching for offline use |
| `tier-helpers.ts` | Client-side tier validation (UI only) |
| `performance.ts` | Performance monitoring utilities |
| `register-sw.ts` | Service worker registration for PWA |

### Shared (`shared/`)
| File | Purpose |
|------|---------|
| `const.ts` | Shared constants (cookie names, tiers) |
| `_core/types.ts` | Shared TypeScript types |

### Database (`drizzle/`)
| File | Purpose |
|------|---------|
| `schema.ts` | Drizzle ORM table definitions |
| `migrations/*.sql` | Auto-generated SQL migrations |

## Common Development Tasks

### Starting Development
```bash
# Install dependencies
pnpm install

# Start both server and web client
pnpm dev

# Or start individually
pnpm dev:server    # Backend on :3001
pnpm dev:metro     # Frontend on :8081
```

### Database Operations
```bash
# Generate and apply migrations
pnpm db:push

# View database in Studio
npx drizzle-kit studio
```

### Testing
```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run integration tests (requires DB)
pnpm test:integration

# Run E2E tests (Playwright)
pnpm test:e2e

# Run visual regression tests
pnpm test:e2e:visual
```

### Code Quality
```bash
pnpm check        # TypeScript type checking
pnpm lint         # ESLint
pnpm format       # Prettier formatting
```

### Building
```bash
pnpm build        # Build server bundle
pnpm build:web    # Build PWA for deployment
```

## Environment Variables

Required variables (see `.env.example`):

```bash
# Core
DATABASE_URL=postgresql://...
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI/ML
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=voyage-...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Caching (optional)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## Code Standards

### File Size Limit
- **500 lines maximum** per file (optimized for LLM comprehension)
- Split large files into focused modules

### TypeScript
- Explicit types everywhere (no `any`)
- Use Zod for runtime validation
- Prefer interfaces over type aliases for objects

### Naming Conventions
- **Files:** kebab-case (`use-auth.ts`)
- **Components:** PascalCase (`SearchBar.tsx`)
- **Functions:** camelCase (`handleSearch`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RESULTS`)
- **Types/Interfaces:** PascalCase (`UserTier`)

### React Patterns
- Functional components with hooks
- Use `use-` prefix for custom hooks
- Co-locate components with their styles

### tRPC Patterns
- Use appropriate procedures:
  - `publicProcedure` - No auth required
  - `publicRateLimitedProcedure` - Public with rate limiting
  - `protectedProcedure` - Requires authentication
  - `csrfProtectedProcedure` - Requires CSRF token
  - `rateLimitedProcedure` - Auth + rate limiting

### Error Handling
- Use `TRPCError` for API errors
- Always include error codes
- Log errors with context

## LLM Architecture

### Model Routing
```
Free tier  → Claude Haiku 4.5 only (~$0.0003/query)
Pro simple → Claude Haiku 4.5 (~$0.0003/query)
Pro complex → Claude Sonnet 4.5 (~$0.003/query)
```

### Semantic Search Pipeline
1. **Query Normalization** - Expand EMS abbreviations, fix typos
2. **Embedding Generation** - Voyage AI `voyage-large-2` (1536 dim)
3. **Vector Search** - pgvector with cosine similarity
4. **Re-ranking** - Advanced cross-encoder scoring
5. **Response Generation** - Claude RAG with protocol context

### Safety-Critical Queries
- Medication queries get multi-query fusion for better recall
- Emergency/critical queries always use enhanced accuracy mode
- Contraindication checks trigger additional safety validation

## Deployment

### Production (Netlify)
- Auto-deploys from `main` branch
- Netlify Functions for serverless backend
- Edge functions for auth middleware

### PWA Features
- Service worker caching for offline access
- Install prompt for home screen
- Standalone mode (no browser chrome)
- Background sync for queued searches

## Testing Strategy

### Unit Tests (Vitest)
- Server utilities and helpers
- React hooks (with testing-library)
- Business logic in `lib/`

### Integration Tests
- Database operations
- tRPC router endpoints
- Authentication flows

### E2E Tests (Playwright)
- Critical user journeys
- Search functionality
- Subscription flows
- Visual regression tests

### Performance Benchmarks
```bash
pnpm bench        # Run benchmarks
pnpm bench:report # Generate report
```

## Troubleshooting

### Common Issues

**"Database connection failed"**
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Run `pnpm db:push` to apply migrations

**"Claude API error"**
- Verify `ANTHROPIC_API_KEY` is set
- Check API rate limits

**"Embedding search returning no results"**
- Verify `VOYAGE_API_KEY` is set
- Check Supabase pgvector extension is enabled

**"Auth not working"**
- Clear browser cookies
- Check Supabase URL/keys
- Verify OAuth redirect URLs in Supabase dashboard

## Related Documentation

- **[AI-CHEATSHEET.md](./AI-CHEATSHEET.md)** - Quick reference for common tasks
- **[agents/AGENTS.md](./agents/AGENTS.md)** - AI agent configurations
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/](./docs/)** - Detailed documentation
