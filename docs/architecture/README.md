# Architecture Documentation

This directory contains architecture documentation for the Protocol Guide backend.

## Documents

| Document | Description | Audience |
|----------|-------------|----------|
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | Complete architecture overview with diagrams | All developers |
| [SERVICE_DEPENDENCY_MAP.md](./SERVICE_DEPENDENCY_MAP.md) | Service dependencies and failure modes | DevOps, Backend |
| [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) | Environment configuration reference | All developers |

## Quick Reference

### Server Entry Point
```
server/_core/index.ts
```

### Router Composition
```
server/routers.ts → server/routers/*.ts
```

### tRPC Setup
```
server/_core/trpc.ts (procedures)
server/_core/context.ts (request context)
```

### Resilience Infrastructure
```
server/_core/resilience/
├── circuit-breaker.ts
├── in-memory-cache.ts
├── resilient-ai.ts
├── resilient-db.ts
├── resilient-redis.ts
└── service-registry.ts
```

## Architecture Principles

1. **Resilience First** - Circuit breakers, fallbacks, graceful degradation
2. **Observability** - Structured logging, request tracing, health checks
3. **Security** - CSRF protection, rate limiting, token blacklisting
4. **Type Safety** - tRPC end-to-end typing, Zod validation
5. **Separation of Concerns** - Routers (controllers), DB (repositories), _core (services)

## Related Documentation

- [BACKEND_HARDENING.md](../server/_core/BACKEND_HARDENING.md) - Hardening implementation details
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - API reference
- [SECURITY.md](../SECURITY.md) - Security practices
