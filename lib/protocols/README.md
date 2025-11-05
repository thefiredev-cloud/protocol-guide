# Protocol Repository Layer

Comprehensive TypeScript/Node.js infrastructure for interacting with the protocol database and managing protocol data.

## Overview

This module provides a type-safe, production-ready data access layer for LA County EMS protocols stored in Supabase. It replaces file-based retrieval with database-backed operations while maintaining backward compatibility.

## Architecture

```
lib/protocols/
├── protocol-schema.ts          # TypeScript interfaces and Zod schemas
└── README.md                   # This file

lib/db/
└── protocol-repository.ts      # Data access layer for Supabase

lib/managers/
└── database-retrieval-adapter.ts  # Backward-compatible adapter

scripts/
├── migrate-protocols-to-db.mjs    # Data migration from JSON to database
└── generate-embeddings.mjs        # OpenAI embedding generation
```

## Components

### 1. Protocol Schema (`protocol-schema.ts`)

Defines TypeScript interfaces and Zod validation schemas for all database entities.

**Key Interfaces:**
- `Protocol` - Complete treatment protocol with metadata
- `ProtocolChunk` - Searchable content segments
- `ProtocolEmbedding` - Vector embeddings for semantic search
- `ProviderImpression` - Clinical impression mappings
- `Medication` - Medication catalog
- `ProtocolWithContext` - Protocol with dependencies and medications

**Utilities:**
- `normalizeTPCode()` - Standardize TP code format
- `extractTPCodesFromContent()` - Parse TP codes from text
- `sanitizeProtocolData()` - Validate and clean protocol data
- `generateContentHash()` - Create SHA-256 hash for deduplication

### 2. Protocol Repository (`protocol-repository.ts`)

Main data access layer providing CRUD operations and search functionality.

#### Core Methods

```typescript
// Retrieval
getProtocolByCode(tpCode: string): Promise<Protocol | null>
getProtocolsByCodes(tpCodes: string[]): Promise<Protocol[]>
searchProtocols(query: string, options?: SearchOptions): Promise<Protocol[]>
searchProtocolChunks(query: string, options?: SearchOptions): Promise<ProtocolChunk[]>
searchProtocolsHybrid(query, embedding?, options?): Promise<ProtocolSearchResult[]>
getProtocolWithContext(tpCode: string): Promise<ProtocolWithContext | null>

// Provider Impressions
getProviderImpressionByCode(piCode: string): Promise<ProviderImpression | null>
getProtocolByProviderImpression(piCode: string): Promise<Protocol | null>

// Embeddings
getChunkEmbedding(chunkId: string): Promise<number[] | null>
upsertEmbedding(chunkId, protocolId, embedding, contentHash): Promise<string | null>
getChunksNeedingEmbeddings(limit?: number): Promise<ProtocolChunk[]>
getChunksWithOutdatedEmbeddings(limit?: number): Promise<ProtocolChunk[]>

// Analytics
recordUsage(protocolId, tpCode, actionType, options?): Promise<void>
logSearch(query, searchType, results, options?): Promise<void>

// Validation
validateProtocolExists(tpCode: string): Promise<boolean>
getAllActiveProtocols(options?): Promise<Protocol[]>
getProtocolStats(): Promise<stats>
```

#### Usage Examples

```typescript
import { getProtocolRepository } from '@/lib/db/protocol-repository';

const repo = getProtocolRepository();

// Get a protocol by TP code
const protocol = await repo.getProtocolByCode('1210');

// Search protocols
const results = await repo.searchProtocols('cardiac arrest', { limit: 10 });

// Get protocol with full context (medications, dependencies)
const fullProtocol = await repo.getProtocolWithContext('1210');

// Hybrid search (full-text + vector similarity)
const hybridResults = await repo.searchProtocolsHybrid(
  'chest pain',
  embedding, // OpenAI embedding vector
  { fulltextWeight: 0.4, vectorWeight: 0.6 }
);

// Record usage for analytics
await repo.recordUsage(protocol.id, '1210', 'view', {
  retrievalTime: 45,
  userId: 'user-123',
  source: 'chat'
});
```

### 3. Database Retrieval Adapter (`database-retrieval-adapter.ts`)

Provides backward-compatible interface for integrating with existing `RetrievalManager`.

```typescript
import { getDatabaseRetrievalAdapter } from '@/lib/managers/database-retrieval-adapter';

const adapter = getDatabaseRetrievalAdapter();

// Check if database is enabled
if (adapter.isEnabled()) {
  // Use database
  const docs = await adapter.searchProtocols(query, limit);
} else {
  // Fall back to file-based retrieval
}

// Record protocol usage
await adapter.recordUsage('1210', 'view', {
  userId: 'user-123',
  sessionId: 'session-456',
  retrievalTime: 45
});
```

## Data Migration

### migrate-protocols-to-db.mjs

Migrates protocol data from JSON files to Supabase database.

**Features:**
- Batch processing for efficiency
- Dry-run mode for testing
- Progress tracking
- Error handling and reporting
- Data validation

**Usage:**

```bash
# Dry run (no data written)
node scripts/migrate-protocols-to-db.mjs --dry-run

# Actual migration
node scripts/migrate-protocols-to-db.mjs

# Verbose output
node scripts/migrate-protocols-to-db.mjs --verbose

# Custom batch size
BATCH_SIZE=50 node scripts/migrate-protocols-to-db.mjs
```

**Data Sources:**
- `data/protocol-metadata.json` - Protocol metadata (7,012+ entries)
- `data/ems_kb_clean.json` - Protocol chunks with content
- `data/provider_impressions.json` - Provider impressions (102 entries)

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)

### generate-embeddings.mjs

Generates OpenAI embeddings for protocol chunks and stores them in the database.

**Features:**
- Batch processing for rate limit compliance
- Retry logic with exponential backoff
- Progress tracking and resumability
- Automatic detection of chunks needing embeddings
- Update outdated embeddings when content changes

**Usage:**

```bash
# Generate embeddings for all chunks without embeddings
node scripts/generate-embeddings.mjs

# Limit number of chunks processed
node scripts/generate-embeddings.mjs --limit=1000

# Update outdated embeddings (content changed)
node scripts/generate-embeddings.mjs --update-outdated

# Custom batch size
EMBEDDING_BATCH_SIZE=50 node scripts/generate-embeddings.mjs
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)
- `OPENAI_API_KEY` - OpenAI API key

**Performance:**
- Processes 100 chunks per batch by default
- 100ms delay between batches for rate limiting
- Automatically retries failed requests (up to 3 times)
- Uses `text-embedding-3-small` model (1536 dimensions)

## Integration with Existing Code

### Environment Variable

Enable database-backed retrieval by setting:

```env
USE_DATABASE_PROTOCOLS=true
```

### RetrievalManager Integration

The `DatabaseRetrievalAdapter` provides a drop-in replacement for file-based retrieval:

```typescript
// In your RetrievalManager
import { getDatabaseRetrievalAdapter } from '@/lib/managers/database-retrieval-adapter';

const dbAdapter = getDatabaseRetrievalAdapter();

async function retrieveProtocols(query: string) {
  if (dbAdapter.isEnabled()) {
    // Use database
    return await dbAdapter.searchProtocolChunks(query, 6);
  } else {
    // Fall back to file-based (existing code)
    return this.retrieveFromFiles(query);
  }
}
```

## Database Schema

The repository interacts with these Supabase tables:

- `protocols` - Treatment protocols
- `protocol_chunks` - Searchable content segments
- `protocol_embeddings` - Vector embeddings for semantic search
- `provider_impressions` - Clinical impression to protocol mappings
- `medications` - Medication catalog
- `protocol_medications` - Protocol-medication relationships
- `protocol_dependencies` - Protocol cross-references
- `protocol_usage_stats` - Usage analytics
- `protocol_search_log` - Search query logging

See migrations `006_protocol_foundation.sql`, `007_vector_embeddings.sql`, and `008_protocol_relationships.sql` for complete schema.

## Performance

**Search Performance Targets:**
- Full-text search: <50ms (using PostgreSQL GIN indexes)
- Vector search: <10ms (using HNSW index)
- Hybrid search: <50ms (combined full-text + vector)
- Protocol retrieval by code: <10ms (using B-tree index)

**Indexing:**
- B-tree indexes on TP codes, categories, dates
- GIN indexes for full-text search
- GIN indexes for array fields (keywords, symptoms)
- HNSW index for vector similarity search

## Analytics & Monitoring

The repository automatically tracks:

- **Protocol Usage**: Views, searches, copies, exports
- **Search Queries**: Query text, result counts, execution time
- **Performance Metrics**: Retrieval times (p50, p95, p99)
- **Embedding Coverage**: Percentage of chunks with embeddings

Access analytics via database functions:
- `get_popular_search_terms(days, limit)` - Most common searches
- `get_protocol_performance_metrics(tp_code?, days)` - Performance stats
- `refresh_protocol_analytics()` - Refresh materialized views

## Error Handling

The repository implements robust error handling:

1. **Graceful Degradation**: Returns empty arrays instead of throwing on search failures
2. **Not Found Handling**: Returns `null` for missing protocols (not errors)
3. **Analytics Failures**: Logs warnings but doesn't interrupt main flow
4. **Retry Logic**: Embedding generation retries with exponential backoff
5. **Detailed Logging**: All errors logged with context for debugging

## Type Safety

All data structures are fully typed with TypeScript interfaces and validated with Zod schemas:

```typescript
// Compile-time type checking
const protocol: Protocol = await repo.getProtocolByCode('1210');

// Runtime validation
const validated = ProtocolSchema.parse(protocolData);
```

## Testing

To test the migration without writing to the database:

```bash
# Dry run migration
node scripts/migrate-protocols-to-db.mjs --dry-run --verbose

# Verify database connection
node -e "import {getProtocolRepository} from './lib/db/protocol-repository.ts'; const repo = getProtocolRepository(); console.log('Connected');"
```

## Troubleshooting

### Migration fails with "Missing environment variables"

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Embedding generation fails with rate limit errors

Reduce batch size:
```bash
EMBEDDING_BATCH_SIZE=50 node scripts/generate-embeddings.mjs
```

### Searches return empty results

1. Check if database is enabled: `USE_DATABASE_PROTOCOLS=true`
2. Verify migration completed: Check database table counts
3. Check Supabase RLS policies: Ensure read access is enabled

### TypeScript errors about missing modules

The path aliases (`@/...`) require proper `tsconfig.json` configuration:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

## Future Enhancements

- [ ] Real-time protocol updates via Supabase subscriptions
- [ ] Advanced filtering (by category, warnings, medications)
- [ ] Protocol versioning and change tracking
- [ ] Bulk embedding updates via background jobs
- [ ] Caching layer for frequently accessed protocols
- [ ] GraphQL API for flexible queries

## Support

For issues or questions:
1. Check migration logs for detailed error messages
2. Review Supabase dashboard for RLS policy issues
3. Verify database schema matches migration files
4. Check environment variables are set correctly

## License

Part of the Medic-Bot project - LA County Fire Department EMS Assistant
