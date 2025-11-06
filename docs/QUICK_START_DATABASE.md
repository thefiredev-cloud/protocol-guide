# Quick Start: Database Protocol Retrieval

This guide will help you quickly get started with the new database-backed protocol retrieval system.

## Prerequisites

1. Supabase project set up
2. Database migrations applied (006, 007, 008)
3. Environment variables configured

## Step 1: Configure Environment

Add to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-...

# Enable database retrieval
USE_DATABASE_PROTOCOLS=true
```

## Step 2: Migrate Data

```bash
# Test migration (dry run - no data written)
node scripts/migrate-protocols-to-db.mjs --dry-run

# Run actual migration
node scripts/migrate-protocols-to-db.mjs

# Should output:
# ✅ Protocol migration complete: 7012 migrated
# ✅ Chunk migration complete: 11000 migrated
# ✅ Provider impression migration complete: 102 migrated
```

## Step 3: Generate Embeddings (Optional but Recommended)

```bash
# Generate embeddings for semantic search
node scripts/generate-embeddings.mjs

# This takes ~30-60 minutes for 11,000 chunks
# Can run in background or limit: --limit=1000
```

## Step 4: Use in Code

### Basic Protocol Retrieval

```typescript
import { getProtocolRepository } from '@/lib/db/protocol-repository';

const repo = getProtocolRepository();

// Get protocol by TP code
const protocol = await repo.getProtocolByCode('1210');
console.log(protocol.tp_name); // "Cardiac Arrest"
```

### Search Protocols

```typescript
// Full-text search
const results = await repo.searchProtocols('chest pain', { limit: 10 });

// Search protocol chunks
const chunks = await repo.searchProtocolChunks('nitroglycerin dosing', { limit: 6 });

// Hybrid search (if embeddings generated)
const embedding = await generateEmbedding(query);
const hybridResults = await repo.searchProtocolsHybrid(query, embedding, {
  fulltextWeight: 0.4,
  vectorWeight: 0.6
});
```

### Integration with Existing Code

```typescript
// In RetrievalManager or chat service
import { getDatabaseRetrievalAdapter } from '@/lib/managers/database-retrieval-adapter';

const dbAdapter = getDatabaseRetrievalAdapter();

if (dbAdapter.isEnabled()) {
  // Use database
  const docs = await dbAdapter.searchProtocolChunks(query, 6);
  // Returns KBDoc[] format for backward compatibility
} else {
  // Fall back to file-based retrieval
  const docs = await this.searchFromFiles(query);
}
```

## Verification

Test the database connection:

```typescript
// In a Next.js API route or server component
import { getProtocolRepository } from '@/lib/db/protocol-repository';

const repo = getProtocolRepository();

// Test retrieval
const stats = await repo.getProtocolStats();
console.log('Database Stats:', stats);
// {
//   total_protocols: 7012,
//   total_chunks: 11000,
//   total_embeddings: 11000,
//   embedding_coverage_percent: 100
// }

// Test search
const results = await repo.searchProtocols('cardiac arrest');
console.log('Search results:', results.length);
```

## Troubleshooting

### "Missing environment variables" error

Ensure `.env.local` has all required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Migration fails with permission errors

Use `SUPABASE_SERVICE_ROLE_KEY` (not `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for migrations.

### Searches return empty results

1. Check `USE_DATABASE_PROTOCOLS=true` is set
2. Verify migration completed successfully
3. Check Supabase RLS policies allow read access

### TypeScript errors

Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

## Performance Tips

1. **Enable Embeddings**: For best search quality, generate embeddings
2. **Use Hybrid Search**: Combines full-text + semantic search
3. **Cache Results**: Consider caching frequently accessed protocols
4. **Monitor Analytics**: Use built-in usage tracking to optimize

## Next Steps

1. ✅ Migrate data
2. ✅ Generate embeddings
3. ✅ Test retrieval
4. Integrate with chat service
5. Monitor performance
6. Enable for production

## Support

See `/lib/protocols/README.md` for comprehensive documentation.
