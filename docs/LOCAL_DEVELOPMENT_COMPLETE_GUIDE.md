# Complete Local Development Guide - LA County Protocol System

## Yes, Everything Runs Locally! 🏠

This guide shows you how to run the entire LA County protocol reliability system on your local machine - **no cloud deployments required** for development and testing.

---

## 🎯 Quick Answer: What Runs Locally?

✅ **Supabase Database** - Local PostgreSQL + pgvector (via Docker)
✅ **Next.js App** - Your Medic-Bot application
✅ **OpenAI Embeddings** - Requires API key but runs from local scripts
✅ **All Migrations** - Run directly against local database
✅ **All Tests** - 200+ tests run locally
✅ **Validation Pipeline** - Runs in Next.js app
✅ **Error Recovery** - Runs in Next.js app

**The only external service is OpenAI for embeddings** (and that's optional - you can skip it for testing).

---

## 📋 Prerequisites

### 1. Install Core Tools
```bash
# Node.js 18+ (check version)
node --version  # Should be 18.x or higher

# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# Or download from https://supabase.com/docs/guides/cli

# Verify installation
supabase --version
```

### 2. Install Docker Desktop
- Download: https://www.docker.com/products/docker-desktop
- Required for local Supabase (PostgreSQL)
- Start Docker Desktop before proceeding

---

## 🚀 Step-by-Step Local Setup

### Step 1: Start Local Supabase

```bash
# Navigate to your project
cd /Users/tanner-osterkamp/Medic-Bot

# Initialize Supabase (if not already done)
supabase init

# Start local Supabase stack (PostgreSQL + APIs)
supabase start

# ⏳ This takes 2-3 minutes first time (downloads Docker images)
```

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important:** Save these credentials - you'll need them!

### Step 2: Configure Environment Variables

Create or update `.env.local`:

```bash
# Create .env.local file
cat > .env.local << 'EOF'
# Supabase Local (from 'supabase start' output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-start

# OpenAI (optional for embeddings)
OPENAI_API_KEY=sk-your-key-here

# Feature Flags
USE_DATABASE_PROTOCOLS=true  # Enable database retrieval
NODE_ENV=development
EOF
```

**Replace** `your-anon-key-from-supabase-start` and `your-service-role-key-from-supabase-start` with actual keys from Step 1 output.

### Step 3: Run Database Migrations

```bash
# Apply all migrations to local database
supabase db push

# Or apply individually:
supabase db reset  # Reset database (destructive!)
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/migrations/006_protocol_foundation.sql
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/migrations/007_vector_embeddings.sql
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/migrations/008_protocol_relationships.sql
```

**Verify migrations worked:**
```bash
# Open Supabase Studio (GUI)
open http://localhost:54323

# Or check via SQL
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "\dt"
```

You should see: `protocols`, `protocol_chunks`, `protocol_embeddings`, etc.

### Step 4: Import Protocol Data

```bash
# Import 7,014+ protocols from JSON to database
node scripts/migrate-protocols-to-db.mjs

# Expected output:
# 🚀 Starting protocol migration to database...
# 📁 Loading data files...
#   ✅ Loaded 693 protocols
#   ✅ Loaded 7014 chunks
#   ✅ Loaded 102 provider impressions
# 📝 Migrating protocols...
#   ✅ Migrated 693 protocols
# 📝 Migrating protocol chunks...
#   ✅ Migrated 7014 chunks
# 📝 Migrating provider impressions...
#   ✅ Migrated 102 provider impressions
# 🎉 Migration successful!
```

**This will take 5-10 minutes** depending on your machine.

### Step 5: Generate Embeddings (Optional)

**⚠️ Requires OpenAI API key and costs ~$2-5**

```bash
# Generate embeddings for semantic search
node scripts/generate-embeddings.mjs

# Expected output:
# 📝 Generating embeddings for 7014 chunks...
#   ✅ Generated 100/7014 embeddings
#   ✅ Generated 200/7014 embeddings
#   ... (continues)
#   ✅ Generated 7014/7014 embeddings
# 🎉 Embedding generation complete!
```

**This takes 20-40 minutes** due to OpenAI rate limits. You can skip this for testing - full-text search still works!

### Step 6: Start Next.js App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# App runs at: http://localhost:3000
```

### Step 7: Verify Everything Works

**Test Health Checks:**
```bash
# Quick health check
curl http://localhost:3000/api/health/quick
# Expected: {"status":"healthy",...}

# Full health check
curl http://localhost:3000/api/health/protocols
# Expected: {"status":"healthy","database":{"status":"healthy"},...}
```

**Test Protocol Retrieval:**
```bash
# Open your browser console on http://localhost:3000
# Then run:
import { getProtocolRepository } from '@/lib/db/protocol-repository';
const repo = getProtocolRepository();
const protocol = await repo.getProtocolByCode('1210');
console.log(protocol);  // Should return STEMI protocol
```

---

## 🧪 Running Tests Locally

### Run All Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# All tests
npm test

# With coverage
npm run test:coverage
open coverage/index.html
```

### Test Specific Components
```bash
# Validation pipeline
npm test tests/unit/validation-pipeline.test.ts

# Error recovery
npm test tests/unit/error-recovery.test.ts

# Database migrations
npm test tests/integration/migrations/protocol-migration.test.ts
```

---

## 🔍 Local Development Workflow

### Daily Workflow
```bash
# 1. Start Supabase (if not already running)
supabase start

# 2. Start Next.js
npm run dev

# 3. Make changes to code
# ... edit files ...

# 4. Run tests
npm test

# 5. Check health
curl http://localhost:3000/api/health/protocols
```

### Database Management
```bash
# View database in GUI
open http://localhost:54323

# Reset database (destructive!)
supabase db reset

# Create new migration
supabase migration new my_new_migration

# View database logs
supabase db logs
```

### Debugging

**Enable verbose logging:**
```bash
# Add to .env.local
DEBUG=true
LOG_LEVEL=debug
```

**View logs:**
```bash
# Next.js logs
npm run dev  # Shows in terminal

# Supabase logs
supabase logs
```

---

## 🐛 Troubleshooting

### Issue: Supabase won't start
```bash
# Solution 1: Ensure Docker is running
open -a Docker

# Solution 2: Stop and restart
supabase stop
supabase start

# Solution 3: Reset completely
supabase stop --no-backup
rm -rf .supabase
supabase start
```

### Issue: Migration fails
```bash
# Check what migrations ran
supabase migration list

# Repair migration state
supabase db reset

# Reapply migrations
supabase db push
```

### Issue: Can't connect to database
```bash
# Verify connection
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "SELECT 1"

# Check .env.local has correct URL
cat .env.local | grep SUPABASE_URL
# Should be: http://localhost:54321
```

### Issue: Embeddings generation slow
```bash
# Normal! OpenAI has rate limits
# Reduce batch size in scripts/generate-embeddings.mjs:
const BATCH_SIZE = 50;  // Default is 100
```

### Issue: Tests failing
```bash
# Clear test cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Update snapshots if needed
npm test -- -u
```

---

## 📊 Monitoring Local Development

### Supabase Studio (Database GUI)
- URL: http://localhost:54323
- View tables, run queries, check data

### Health Check Dashboard
- URL: http://localhost:3000/api/health/protocols
- Shows database, cache, circuit breaker status

### Performance Monitoring
```bash
# Run benchmarks
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f scripts/benchmark-protocol-queries.sql

# View results
# Expect: <50ms for most queries
```

---

## 🚀 Advanced Local Features

### Test with Production-Like Data

```bash
# Export from production (if you have prod)
supabase db dump --data-only > prod-data.sql

# Import to local
psql "postgresql://postgres:postgres@localhost:54322/postgres" < prod-data.sql
```

### Simulate Failures

```bash
# Stop database (test error recovery)
docker stop supabase_db_medic-bot

# App should fallback to cache/files!
curl http://localhost:3000/api/health/protocols
# Expected: {"status":"degraded","database":{"status":"unhealthy"},...}

# Restart
docker start supabase_db_medic-bot
```

### Load Testing
```bash
# Install k6 (load testing tool)
brew install k6

# Run load test
k6 run scripts/load-test.js

# Or use Apache Bench
ab -n 1000 -c 50 http://localhost:3000/api/health/quick
```

---

## 💰 Cost Breakdown (Local Dev)

| Service | Cost | Notes |
|---------|------|-------|
| **Supabase Local** | $0 | Runs in Docker |
| **Next.js** | $0 | Runs locally |
| **PostgreSQL** | $0 | Part of Supabase |
| **OpenAI Embeddings** | ~$2-5 | One-time, optional |
| **Testing** | $0 | All local |

**Total:** $0-5 (one-time for embeddings)

---

## ✅ Local Development Checklist

- [ ] Docker Desktop installed and running
- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Local Supabase started (`supabase start`)
- [ ] `.env.local` configured with local credentials
- [ ] Migrations applied (`supabase db push`)
- [ ] Data migrated (`node scripts/migrate-protocols-to-db.mjs`)
- [ ] Embeddings generated (optional, `node scripts/generate-embeddings.mjs`)
- [ ] Next.js running (`npm run dev`)
- [ ] Health checks passing (`curl http://localhost:3000/api/health/protocols`)
- [ ] Tests passing (`npm test`)

---

## 🎓 Learning Resources

### Supabase Local Development
- Docs: https://supabase.com/docs/guides/cli/local-development
- Video: https://www.youtube.com/watch?v=vyHyYpvjaks

### pgvector (Vector Search)
- Docs: https://github.com/pgvector/pgvector
- Tutorial: https://supabase.com/docs/guides/ai/vector-columns

### Next.js + Supabase
- Tutorial: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

## 🆘 Getting Help

**Issue: Something not working?**

1. Check logs: `supabase logs` and `npm run dev` output
2. Verify environment: `cat .env.local`
3. Test connection: `curl http://localhost:3000/api/health/protocols`
4. Review documentation: `docs/ERROR_RECOVERY_SYSTEM.md`

**Still stuck?** Check the project's GitHub issues or documentation.

---

## 🎉 You're All Set!

Your local development environment is now fully configured with:

✅ Local PostgreSQL database with pgvector
✅ 7,014+ LA County protocols
✅ Vector embeddings for semantic search
✅ Multi-layer validation pipeline
✅ Error recovery system
✅ 200+ tests
✅ Health monitoring

**Everything runs on your machine. No cloud deployments needed for development!**

Start building with confidence! 🚑
