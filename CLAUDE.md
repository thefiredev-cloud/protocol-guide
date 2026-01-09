# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProtocolGuide is an LA County Fire Department EMS protocol reference app with AI-powered chat. Built as a PWA for offline access.

## Commands

```bash
npm run dev           # Start dev server (port 3000)
npm run build         # Production build
npm run preview       # Preview production build

# Data & Embeddings
npm run sync:test               # Test DHS scraper
npm run sync:run                # Run protocol sync
npm run embeddings:generate     # Generate embeddings for RAG
npm run embeddings:medications  # Generate medication-specific chunks
npm run test:retrieval          # Validate RAG retrieval quality
```

## Architecture

### Frontend (React + Vite PWA)
- `App.tsx` - Root with HashRouter, contexts (Auth, Chat, Widget, VoiceInput)
- `pages/` - Browse, Chat, ProtocolDetail, Hospitals, Account, Admin, Login
- `components/` - UI components, admin dashboard, widget mode support
- `contexts/` - State management via React contexts
- `types.ts` - Protocol, Section, Message, and Auth type definitions

### RAG System (`lib/rag/`)
Core retrieval-augmented generation pipeline:
- `embeddings.ts` - Gemini text-embedding-004 integration
- `retrieval.ts` - Vector similarity search with confidence scoring
- `reranker.ts` - Cross-encoder style reranking for medical protocols
- `query-processor.ts` - EMS-specific query expansion with medical acronyms
- `citations.ts` - Protocol reference extraction and validation
- `source-validation.ts` - Ensures only LA County DHS content

### Netlify Functions (`netlify/functions/`)
Server-side AI processing (protects API keys):
- `chat.ts` / `chat-stream.ts` - Gemini chat with RAG context
- `embed-query.ts` - Query embedding generation
- `generate-embeddings.ts` - Batch embedding for protocols

### Data Layer
- `data/protocols.ts` - Protocol metadata and sections
- `data/hospitals.ts` - LA County facility data
- `data/library/` - Individual protocol content files
- `lib/supabase.ts` - Supabase client (vector storage, auth)

### Scripts (`scripts/`)
- `migrate-to-supabase.ts` - Protocol data migration
- `generate-embeddings.ts` - Creates vector embeddings
- `validate-retrieval.ts` - RAG quality testing

## Environment Variables

Client-side (in `.env.local`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key (publishable)

Server-side (Netlify dashboard only):
- `GEMINI_API_KEY` - Google AI API key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role

## Key Patterns

- All AI API calls go through Netlify functions (never expose keys client-side)
- RAG pipeline: query processing -> embedding -> vector search -> reranking -> citation extraction
- PWA with Workbox caching for offline protocol access
- HashRouter for Netlify SPA deployment compatibility
