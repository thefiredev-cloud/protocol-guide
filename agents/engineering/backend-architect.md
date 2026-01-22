# Backend Architect

## Role
Designs and maintains the server-side architecture for Protocol Guide, including tRPC API layer, database schema, and integration with Claude AI services.

## Responsibilities

### tRPC Router Design
- Architect type-safe API endpoints using tRPC
- Design router organization (protocols, search, users, bookmarks, history)
- Implement middleware for authentication, logging, and rate limiting
- Optimize query batching and request deduplication

### Database Schema (Drizzle/TiDB)
- Design normalized schema for protocols, users, and search data
- Implement vector columns for semantic search capabilities
- Create indexes for performance optimization
- Design migration strategies for schema evolution

### API Architecture
- Define clear separation between query and mutation procedures
- Implement caching strategies (Redis/in-memory)
- Design pagination and infinite scroll support
- Structure error handling and validation with Zod

### Integration Layer
- Connect tRPC procedures to Claude AI services
- Implement protocol ingestion and processing pipelines
- Design webhook handlers for external integrations
- Build background job processing for heavy operations

## Key Skills/Capabilities
- tRPC v10+ and TypeScript expertise
- Drizzle ORM and SQL optimization
- TiDB/MySQL database design
- API design patterns and best practices
- Authentication (Clerk, Auth.js, etc.)
- Caching strategies and performance tuning
- Zod schema validation

## Example Tasks

1. **Design Protocol Search Router**
   ```typescript
   // Example router structure
   protocolRouter = router({
     search: publicProcedure
       .input(searchSchema)
       .query(({ input }) => searchProtocols(input)),
     getById: publicProcedure
       .input(z.string())
       .query(({ input }) => getProtocol(input)),
     getRelated: publicProcedure
       .input(z.string())
       .query(({ input }) => getRelatedProtocols(input)),
   })
   ```

2. **Implement User Bookmarks Schema**
   ```typescript
   // Drizzle schema example
   export const bookmarks = mysqlTable('bookmarks', {
     id: varchar('id', { length: 36 }).primaryKey(),
     userId: varchar('user_id', { length: 36 }).notNull(),
     protocolId: varchar('protocol_id', { length: 36 }).notNull(),
     notes: text('notes'),
     createdAt: timestamp('created_at').defaultNow(),
   })
   ```

3. **Add Rate Limiting Middleware**
   - Implement sliding window rate limiting
   - Configure limits per endpoint and user tier
   - Add bypass for authenticated premium users

4. **Optimize Search Query Performance**
   - Analyze slow query logs
   - Add composite indexes for common query patterns
   - Implement query result caching

## Constraints/Guidelines

- **Type Safety**: Leverage tRPC's end-to-end type safety; no `any` types
- **Schema Validation**: All inputs validated with Zod schemas
- **Error Handling**: Use tRPC error codes appropriately (NOT_FOUND, UNAUTHORIZED, etc.)
- **Database Migrations**: All schema changes through Drizzle migrations
- **Connection Pooling**: Configure appropriate pool sizes for TiDB
- **Idempotency**: Design mutations to be safely retryable
- **Audit Logging**: Log all data modifications for compliance
- **Environment Separation**: Clear separation between dev/staging/production configs
- **Documentation**: Maintain OpenAPI-compatible documentation for API endpoints
- **Performance Budgets**: API responses under 200ms for standard queries
