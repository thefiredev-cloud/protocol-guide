# Contributing to Protocol Guide

Thank you for your interest in contributing to Protocol Guide! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Exercise empathy and kindness
- Give and accept constructive feedback gracefully
- Focus on what is best for the community

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL (for local development)
- Git

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Protocol-Guide.git
   cd Protocol-Guide
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features (`feature/voice-search-improvements`)
- `fix/` - Bug fixes (`fix/search-cache-invalidation`)
- `docs/` - Documentation updates (`docs/api-endpoints`)
- `refactor/` - Code refactoring (`refactor/auth-flow`)
- `test/` - Test additions/fixes (`test/search-router-coverage`)
- `chore/` - Maintenance tasks (`chore/upgrade-dependencies`)

### Development Process

1. Create a branch from `main`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Submit a pull request

## Code Style Guide

### General Principles

- **File Size:** Maximum 500 lines per file
- **Single Responsibility:** Each file/function should do one thing well
- **Explicit Types:** No `any` types in TypeScript
- **Documentation:** Add JSDoc comments to public APIs

### TypeScript

```typescript
// ✅ Good: Explicit types, clear naming
interface SearchParams {
  query: string;
  limit: number;
  agencyId?: number;
}

async function searchProtocols(params: SearchParams): Promise<SearchResult[]> {
  // Implementation
}

// ❌ Bad: Implicit types, unclear naming
async function search(p: any) {
  // Implementation
}
```

### React Components

```tsx
// ✅ Good: Functional component with typed props
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchBar({ onSearch, placeholder, disabled }: SearchBarProps) {
  // Implementation
}

// ❌ Bad: Missing types, class component
export default class SearchBar extends Component {
  // Implementation
}
```

### Custom Hooks

```typescript
// ✅ Good: Prefixed with use-, typed return
export function useProtocolSearch(): UseProtocolSearchResult {
  const [isLoading, setIsLoading] = useState(false);
  // Implementation
  return { isLoading, search, results };
}
```

### tRPC Procedures

```typescript
// ✅ Good: Proper input validation, error handling
export const searchRouter = router({
  semantic: publicRateLimitedProcedure
    .input(z.object({
      query: z.string().min(1).max(500),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Implementation
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Search failed',
          cause: error,
        });
      }
    }),
});
```

### File Organization

```
// ✅ Good: Co-located, focused files
components/
  search/
    SearchBar.tsx        # Component
    SearchBar.test.tsx   # Tests
    use-search.ts        # Hook
    types.ts             # Types

// ❌ Bad: Scattered files
components/SearchBar.tsx
hooks/useSearch.ts
types/searchTypes.ts
__tests__/SearchBar.test.tsx
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `use-auth.ts` |
| Components | PascalCase | `SearchBar` |
| Functions | camelCase | `handleSearch` |
| Constants | UPPER_SNAKE | `MAX_RESULTS` |
| Types/Interfaces | PascalCase | `SearchResult` |
| Hooks | use- prefix | `useAuth` |

### CSS/Styling

Use NativeWind (Tailwind CSS for React Native):

```tsx
// ✅ Good: Tailwind classes via className
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-900">
    Protocol Guide
  </Text>
</View>

// ❌ Bad: Inline styles
<View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
```

## Testing Requirements

### Test Coverage Expectations

- **Server utilities:** 80%+ coverage
- **React hooks:** 70%+ coverage
- **tRPC routers:** 70%+ coverage
- **Critical paths:** 90%+ coverage

### Unit Tests (Vitest)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { normalizeEmsQuery } from '../ems-query-normalizer';

describe('normalizeEmsQuery', () => {
  it('expands common EMS abbreviations', () => {
    const result = normalizeEmsQuery('epi dose for anaphylaxis');
    expect(result.normalized).toContain('epinephrine');
  });

  it('handles typos', () => {
    const result = normalizeEmsQuery('cardiack arrest');
    expect(result.correctedTypos).toContain('cardiac');
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestContext } from './helpers';

describe('Search Router', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it('returns relevant protocols for valid query', async () => {
    const result = await ctx.caller.search.semantic({
      query: 'cardiac arrest',
      limit: 5,
    });
    expect(result.results.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('user can search for protocols', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="search-input"]', 'chest pain');
  await page.click('[data-testid="search-button"]');
  
  await expect(page.locator('[data-testid="search-results"]'))
    .toBeVisible();
  await expect(page.locator('[data-testid="result-item"]'))
    .toHaveCount({ min: 1 });
});
```

### Running Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# All tests
pnpm test:all
```

## Pull Request Process

### Before Submitting

1. **Update documentation** if your changes affect public APIs
2. **Add tests** for new functionality
3. **Run the full test suite:** `pnpm test:all`
4. **Run type checking:** `pnpm check`
5. **Run linting:** `pnpm lint`
6. **Update CHANGELOG.md** if applicable

### PR Template

Your PR description should include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. PRs require at least one approval
2. All CI checks must pass
3. Resolve all review comments
4. Squash and merge is preferred

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
feat(search): add voice input support

# Bug fix
fix(auth): resolve token refresh race condition

# Documentation
docs(api): update search endpoint documentation

# Breaking change
feat(api)!: change search response format

BREAKING CHANGE: search results now include `fullContent` field
```

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Open a new issue with the `question` label
3. Reach out to maintainers

Thank you for contributing to Protocol Guide! 🚑
