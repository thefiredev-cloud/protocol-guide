# Integration Tests Setup Guide

## Quick Start

### 1. Set Database URL

Add to your `.env` file:

```bash
# Use your Supabase database
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# OR use local Docker Supabase
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 2. Run Migrations

```bash
pnpm db:push
```

### 3. Run Tests

```bash
# All integration tests
pnpm test:integration

# Specific test
pnpm vitest run tests/integration/db-users.integration.test.ts

# Watch mode
pnpm test:integration:watch
```

## Using Local Supabase (Recommended for Development)

### Start Local Supabase

```bash
docker compose up -d
```

### Configure .env

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### Run Tests

```bash
pnpm test:integration
```

Tests will use the local database and automatically rollback all changes.

## Using Production/Staging Database

**SAFE:** Integration tests use transaction rollback - they never commit changes to the database.

```bash
# Set production DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:password@db.production.supabase.co:5432/postgres

# Run tests (all changes rollback automatically)
pnpm test:integration
```

Even though tests connect to production, they:
- Run in transactions that rollback
- Never commit any changes
- Leave database completely unchanged

## Troubleshooting

### "DATABASE_URL must be set"

Solution: Add `DATABASE_URL` to `.env` file

### "Connection failed" or "SSL connection error"

Solutions:
- Check DATABASE_URL is correct
- Verify database is accessible
- Add `?sslmode=require` to connection string if needed
- Use local Supabase: `docker compose up -d`

### "relation does not exist"

Solution: Run migrations
```bash
pnpm db:push
```

### Tests are slow

This is normal - integration tests are slower than unit tests:
- Single test: ~100ms
- Full suite: ~10 seconds

For fast tests, use unit tests:
```bash
pnpm test:unit  # Runs in < 1 second
```

## CI/CD Setup

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: supabase/postgres
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
        run: pnpm test:integration
```

## Best Practices

1. **Use local Supabase** for development
2. **Run integration tests** before committing
3. **Unit tests** for quick feedback loop
4. **Integration tests** for database validation
5. **E2E tests** for critical user flows

## Example Workflow

```bash
# Development workflow
pnpm test:unit              # Fast feedback (< 1s)
# ... make changes ...
pnpm test:integration:watch # Real-time DB testing
# ... commit when tests pass ...
pnpm test:all               # Run everything before PR
```

## Questions?

See `/tests/integration/README.md` for detailed documentation.
