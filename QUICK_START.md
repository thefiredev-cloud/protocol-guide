# Quick Start Guide - Medic-Bot Development

Get Medic-Bot running locally in 5 minutes.

## Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop)) - Required for Supabase
- **Supabase CLI** ([Install](https://supabase.com/docs/guides/cli))
- **Git** (for cloning the repository)

### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
tar -xzf supabase.tar.gz
sudo mv supabase /usr/local/bin/

# Verify installation
supabase --version
```

## Quick Setup (5 Minutes)

### Step 1: Clone and Install Dependencies

```bash
# Clone repository
cd /path/to/your/projects
git clone <repository-url> Medic-Bot
cd Medic-Bot

# Install Node dependencies
npm install
```

### Step 2: Start Local Database

```bash
# Ensure Docker Desktop is running

# Start local Supabase stack
supabase start

# ⏳ First run takes 2-3 minutes (downloads Docker images)
```

**Save the output!** You'll see:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Configure Environment

Create `.env.local` file:

```bash
# Copy example config
cp .env.example .env.local
```

Edit `.env.local` with your editor:

```bash
# Supabase Local (from 'supabase start' output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-anon-key-from-step-2>
SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key-from-step-2>

# LLM API Key (get from https://console.anthropic.com/)
LLM_API_KEY=sk-ant-your-key-here
LLM_BASE_URL=https://api.anthropic.com/v1
LLM_MODEL=claude-3-7-sonnet-20250219

# Feature Flags
USE_DATABASE_PROTOCOLS=true
NODE_ENV=development
```

### Step 4: Run Database Migrations

```bash
# Apply database schema
supabase db push

# Expected: "✔ All done."
```

### Step 5: Start Development Server

```bash
# Start Next.js
PORT=3002 npm run dev

# Open http://localhost:3002
```

## Verify Installation

### Test Health Checks

```bash
# Full health check
curl http://localhost:3002/api/health | jq .

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-11-05T...",
#   "version": "2.0.0"
# }
```

### Test Chat Endpoint

```bash
# Send a test query
curl -s http://localhost:3002/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What is Protocol 1211?"}]}' | jq .
```

### Test Dosing Calculator

```bash
# Calculate epinephrine dose
curl -s http://localhost:3002/api/dosing \
  -H 'Content-Type: application/json' \
  -d '{
    "medicationId": "epinephrine",
    "request": {
      "patientWeightKg": 70,
      "scenario": "arrest"
    }
  }' | jq .
```

## Next Steps

### Populate Database with Protocols (Optional)

```bash
# Import 7,014 protocols from JSON to database
node scripts/migrate-protocols-to-db.mjs

# Takes ~5-10 minutes
# Expected: ✅ Migrated 693 protocols, 7014 chunks, 102 provider impressions
```

**Note:** App works without this step using in-memory fallback.

### Generate Embeddings (Optional, Requires OpenAI)

```bash
# Add OpenAI key to .env.local
OPENAI_API_KEY=sk-...

# Generate embeddings for semantic search
node scripts/generate-embeddings.mjs

# Takes ~30-40 minutes, costs ~$2-5
# Can skip for testing - full-text search still works
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # E2E tests (Playwright)

# With coverage report
npm run test:coverage
open coverage/index.html
```

## Daily Development Workflow

```bash
# 1. Start Supabase (if not running)
supabase start

# 2. Start Next.js dev server
PORT=3002 npm run dev

# 3. Open browser to http://localhost:3002

# 4. Make changes, tests auto-run in watch mode
npm test -- --watch

# 5. When done, stop Supabase (optional)
supabase stop
```

## Common Issues

### Issue: "Supabase CLI not found"

```bash
# Reinstall Supabase CLI
brew install supabase/tap/supabase

# Or download from https://supabase.com/docs/guides/cli
```

### Issue: "Docker not running"

```bash
# Start Docker Desktop application
open -a Docker  # macOS

# Or launch Docker Desktop from Applications
```

### Issue: "Port 3002 already in use"

```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill

# Or use different port
PORT=3003 npm run dev
```

### Issue: "Database migration failed"

```bash
# Reset database (destructive!)
supabase db reset

# Reapply migrations
supabase db push
```

### Issue: "Can't connect to database"

```bash
# Verify Supabase is running
supabase status

# Check connection string
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "SELECT 1"
```

### Issue: "LLM API errors"

```bash
# Verify API key is set
cat .env.local | grep LLM_API_KEY

# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $LLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-7-sonnet-20250219","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

## Useful Commands

### Supabase Management

```bash
# View database in browser GUI
open http://localhost:54323

# View database logs
supabase logs

# Stop Supabase
supabase stop

# Stop and delete data
supabase stop --no-backup

# Create new migration
supabase migration new my_migration_name

# Check migration status
supabase migration list
```

### Development

```bash
# Build production bundle
npm run build

# Type check
npx tsc --noEmit

# Lint code
npm run lint

# Format code
npx prettier --write .
```

### Testing

```bash
# Run specific test file
npm test tests/unit/triage.parsers.test.ts

# Run tests matching pattern
npm test -- --grep "epinephrine"

# Update test snapshots
npm test -- -u

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Database Queries

```bash
# Connect to local database
psql "postgresql://postgres:postgres@localhost:54322/postgres"

# List tables
\dt

# View protocols
SELECT tp_code, tp_name FROM protocols LIMIT 5;

# Search protocols
SELECT * FROM search_protocols_fulltext('chest pain', 5);

# Exit psql
\q
```

## Environment Variables Reference

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key
- `LLM_API_KEY` - Claude API key

**Optional:**
- `USE_DATABASE_PROTOCOLS=true` - Enable database retrieval
- `OPENAI_API_KEY` - For embedding generation
- `ENABLE_AUDIT_LOGGING=true` - Enable audit logs
- `DEBUG=true` - Verbose logging

See [.env.example](./.env.example) for complete list.

## Documentation

- [README.md](./README.md) - Project overview and features
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture
- [docs/DATABASE.md](./docs/DATABASE.md) - Database schema and queries
- [docs/TESTING.md](./docs/TESTING.md) - Testing guide
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Production deployment

## Getting Help

**Check these resources first:**
1. Health check endpoint: `curl http://localhost:3002/api/health`
2. Supabase status: `supabase status`
3. Logs: `npm run dev` output and `supabase logs`
4. Documentation: `docs/` directory

**Still stuck?** Check GitHub issues or create a new issue with:
- Steps to reproduce
- Error messages (full output)
- Environment info (`node --version`, `supabase --version`)
- `.env.local` contents (redact keys!)

---

**Estimated Setup Time:** 5 minutes
**Next Steps:** [Run tests](./docs/TESTING.md) → [Understand architecture](./docs/ARCHITECTURE.md) → [Start coding](./CONTRIBUTING.md)
