# Agent Coding Guide - Medic-Bot

This document provides comprehensive guidance for AI agents (including Cursor Claude) working on the Medic-Bot codebase. Follow these patterns, standards, and workflows to ensure consistent, maintainable, and medically accurate code.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Code Structure & Organization](#code-structure--organization)
4. [Testing Requirements](#testing-requirements)
5. [Medical Validation Requirements](#medical-validation-requirements)
6. [Git Workflow](#git-workflow)
7. [Security & Compliance](#security--compliance)
8. [Common Agent Workflows](#common-agent-workflows)
9. [Quick Reference](#quick-reference)

---

## Project Overview

### Purpose
Medic-Bot is a production-grade medical AI assistant for 3,200+ LA County Fire Department paramedics. It provides instant access to:
- LA County Prehospital Care Manual (PCM) protocols
- Medication dosing calculations (pediatric & adult)
- Clinical decision support and triage guidance
- Patient care report (PCR) narrative generation

### Key Characteristics
- **Zero Authentication**: Public access with IP-based rate limiting
- **Mobile-First**: Optimized for 10-year-old devices, glove-friendly UI
- **Offline-Capable**: 100% functionality without network (chunked KB)
- **Medical Accuracy**: 98%+ validation rate against LA County PCM
- **Production-Grade**: Serves 174 fire stations, critical infrastructure

### Technology Stack
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.4.5 (strict mode)
- **Search**: MiniSearch 7.1.0 (BM25 algorithm)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify Edge Functions
- **Testing**: Vitest (unit/integration), Playwright (E2E)

---

## Architecture Patterns

### Manager Pattern (Primary Pattern)

All business logic lives in Manager classes. Managers are:
- **Single Responsibility**: One manager = one domain concern
- **Dependency Injected**: Accept dependencies via constructor
- **Testable**: Easy to mock dependencies in tests
- **Composable**: Managers can use other managers

**Example Pattern**:
```typescript
// lib/managers/chat-service.ts
export class ChatService {
  private readonly env = EnvironmentManager.load();
  private readonly retrieval = new RetrievalManager();
  private readonly logger = createLogger("ChatService");
  
  constructor(llmClient?: LLMClient) {
    // Dependency injection for testability
    this.llmClient = llmClient ?? new LLMClient({ /* config */ });
  }
  
  public async handle(request: ChatRequest): Promise<ChatResponse> {
    // Single entry point, delegates to services
    await this.warm();
    const triage = this.triageService.build(request.messages[0]);
    const retrieval = await this.retrieval.search(/* query */);
    // ... orchestrate response
  }
}
```

**Key Manager Locations**:
- `lib/managers/chat-service.ts` - Main chat orchestration
- `lib/managers/RetrievalManager.ts` - Knowledge base search
- `lib/managers/NarrativeManager.ts` - PCR narrative generation
- `lib/managers/CarePlanManager.ts` - Treatment plan generation
- `lib/managers/GuardrailManager.ts` - Medical safety validation
- `lib/dosing/medication-dosing-manager.ts` - Medication calculations

### Service Pattern

Services are focused, single-purpose utilities used by managers:

```typescript
// lib/services/chat/citation-service.ts
export class CitationService {
  extractCitations(content: string): Citation[] {
    // Focused on citation extraction only
  }
}
```

**Key Service Locations**:
- `lib/services/chat/` - Chat-related services (citations, guardrails, triage)
- `lib/services/` - Shared services

### Coordinator Pattern (For Complex Workflows)

When multiple managers need orchestration:

```typescript
export class ProtocolCoordinator {
  private readonly retrieval: RetrievalManager;
  private readonly guardrail: GuardrailManager;
  private readonly triage: TriageService;
  
  async processProtocolQuery(query: string): Promise<ProtocolResult> {
    // Coordinates between multiple services
  }
}
```

### OOP-First Principles

1. **Everything in Classes**: Even simple utilities should be classes
2. **Composition over Inheritance**: Prefer injecting dependencies
3. **Single Responsibility**: One class = one concern
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Injection**: Always inject dependencies for testability

---

## Code Structure & Organization

### Directory Structure

```
Medic-Bot/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (withApiHandler pattern)
│   ├── components/        # React components (functional)
│   ├── hooks/             # Custom React hooks
│   └── managers/          # Frontend managers (lightweight)
├── lib/                    # Core business logic
│   ├── managers/          # Business logic managers (heavy)
│   ├── services/          # Domain services
│   ├── dosing/            # Medication calculation domain
│   │   ├── calculators/  # Individual medication calculators
│   │   └── types.ts       # Domain types
│   ├── triage/            # Clinical decision support
│   └── api/               # API utilities
├── tests/                  # Test suites
│   ├── unit/              # Unit tests (mirror lib/ structure)
│   ├── integration/       # API integration tests
│   └── e2e/               # Playwright E2E tests
└── docs/                   # Documentation
```

### File Organization Rules

1. **Max 500 Lines**: Strictly enforced via ESLint (`.eslintrc.cjs`)
2. **Break Up at ~400 Lines**: Proactively split before hitting limit
3. **One Class Per File**: Enforced rule, exceptions only with justification
4. **Co-locate Related Code**: Keep domain logic together

### Module Imports Pattern

```typescript
// Group imports: external → internal → types
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

import { withApiHandler } from "@/lib/api/handler";
import { ChatService } from "@/lib/managers/chat-service";
import type { ChatRequest } from "@/app/types/chat";
```

**Import Rules**:
- Use `@/` alias for internal imports
- Group: Node built-ins → external → internal → types
- Use `simple-import-sort` plugin (enforced)

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | `kebab-case.ts` | `chat-service.ts`, `epinephrine.ts` |
| Classes | `PascalCase` | `ChatService`, `EpinephrineCalculator` |
| Functions/Vars | `camelCase` | `handleRequest`, `userId` |
| Types/Interfaces | `PascalCase` | `ChatRequest`, `MedicationDose` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_CHUNKS`, `DEFAULT_TIMEOUT` |
| Test Files | `*.test.ts` or `*.spec.ts` | `chat-service.test.ts` |

---

## Testing Requirements

### Test Organization

Tests mirror source structure exactly:
```
lib/managers/chat-service.ts
  → tests/unit/managers/chat-service.test.ts

lib/dosing/calculators/epinephrine.ts
  → tests/unit/dosing/calculators/epinephrine.test.ts
```

### Test Categories

1. **Unit Tests** (`tests/unit/`):
   - Test individual managers/services in isolation
   - Mock all dependencies
   - Fast execution (< 100ms per test)

2. **Integration Tests** (`tests/integration/`):
   - Test API endpoints end-to-end
   - May use real dependencies (database, KB)
   - Slower execution (acceptable)

3. **E2E Tests** (`tests/e2e/`):
   - Playwright browser automation
   - Test user workflows
   - Full stack testing

### Test Naming Patterns

```typescript
describe("ChatService", () => {
  describe("handle()", () => {
    it("should return citations when protocols found", async () => {
      // Arrange
      const service = new ChatService();
      const request = { messages: [/* ... */] };
      
      // Act
      const result = await service.handle(request);
      
      // Assert
      expect(result.citations).toHaveLength(6);
    });
    
    it("should handle retrieval errors gracefully", async () => {
      // Test error handling
    });
  });
});
```

### Coverage Requirements

- **Business Logic**: 80%+ coverage required
- **Medical Calculations**: 100% coverage (critical for safety)
- **API Routes**: Integration tests for all endpoints
- **Edge Cases**: Always test bounds, null inputs, errors

### Running Tests

```bash
npm run test              # All tests (watch mode)
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e         # Playwright E2E
npm run test:coverage    # Generate coverage report
```

---

## Medical Validation Requirements

### Critical Rules

1. **Protocol Citations Required**: All medical recommendations must cite LA County PCM protocols
2. **Guardrail Validation**: Check for unauthorized medications before returning
3. **Input Validation**: Always validate weight, age, vital signs ranges
4. **Contraindication Checking**: Check for contraindications before medication suggestions
5. **Safe Fallbacks**: Never crash on medical errors; return safe defaults

### Dosing Calculator Pattern

```typescript
export class MedicationCalculator implements MedicationCalculator {
  public readonly id = "medication-name";
  public readonly name = "Medication Name";
  public readonly aliases = ["alias1", "alias2"];
  public readonly categories = ["Medication", "MCG 1309"];
  
  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    // 1. Validate input bounds
    if (request.patientWeightKg < MIN_WEIGHT || request.patientWeightKg > MAX_WEIGHT) {
      return { error: "Weight must be between 3kg and 200kg" };
    }
    
    // 2. Calculate with protocol citations
    return {
      recommendations: [/* dose recommendations */],
      citations: ["PCM X.X.X", "MCG 1309"],
      warnings: [/* contraindications */],
    };
  }
}
```

### Protocol Citation Format

- **Protocols**: "PCM 1.2.1 - Chest Pain/Acute Coronary Syndrome"
- **MCG References**: "MCG 1309 - Pediatric Dosing"
- **Always Include**: Protocol number, section name when applicable

### Medical Code Testing

**Always test**:
- Weight bounds (3kg minimum, 200kg maximum)
- Age-based restrictions
- Scenario-specific dosing (arrest vs. non-arrest)
- Contraindications
- Edge cases (neonates, obese patients)

---

## Git Workflow

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add morphine dosing calculator
fix: handle null weight in epinephrine calculator
docs: update API documentation
test: add integration tests for chat endpoint
refactor: split chat-service into smaller managers
chore: update dependencies
```

### Branch Strategy

- **Main Branch**: `main` (production-ready)
- **Feature Branches**: `feature/description` or `claude/description`
- **Fix Branches**: `fix/description`

### Pull Request Checklist

Before creating PR:
- [ ] All tests pass (`npm run test`)
- [ ] ESLint passes (`npm run lint:strict`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] No console.log statements (except `console.error`/`console.warn`)
- [ ] Medical code has protocol citations
- [ ] Tests added for new features
- [ ] Documentation updated if needed

### Commit Message Format

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`

---

## Security & Compliance

### HIPAA Compliance

- **No PHI Storage**: Never store patient names, MRNs, or identifying info
- **Anonymous Queries**: Only medical scenarios tracked (no patient data)
- **Audit Logging**: All actions logged (6-year retention)
- **Query Text**: Not logged (only metadata)

### Security Practices

1. **No Secrets in Code**: Use environment variables always
2. **Rate Limiting**: Enforced on all endpoints (IP-based)
3. **Input Validation**: Sanitize all user inputs
4. **Error Messages**: Never expose internal errors to users
5. **Dependencies**: Regularly update, scan for vulnerabilities

### Environment Variables

Required variables (see `.env.example`):
```
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
KB_SCOPE=pcm
KB_SOURCE=clean
RATE_LIMIT_CHAT_RPM=20
ENABLE_AUDIT_LOGGING=true
```

---

## Common Agent Workflows

### 1. Adding a New Medication Calculator

**Steps**:
1. Create calculator class in `lib/dosing/calculators/medication-name.ts`
2. Implement `MedicationCalculator` interface
3. Register in `lib/dosing/registry.ts`
4. Add unit tests in `tests/unit/dosing/calculators/medication-name.test.ts`
5. Test with medical validation suite

**Pattern**:
```typescript
export class MedicationCalculator implements MedicationCalculator {
  public readonly id = "medication-name";
  public readonly name = "Medication Name";
  public readonly aliases = ["alias"];
  public readonly categories = ["Medication"];
  
  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    // Implementation
  }
}
```

### 2. Adding a New API Endpoint

**Steps**:
1. Create route file: `app/api/endpoint-name/route.ts`
2. Use `withApiHandler` wrapper for error handling
3. Create manager/service if needed
4. Add integration test
5. Document in README.md

**Pattern**:
```typescript
import { withApiHandler } from "@/lib/api/handler";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const data = await request.json();
    const service = new YourService();
    const result = await service.handle(data);
    return Response.json(result);
  });
}
```

### 3. Adding a New Manager

**Steps**:
1. Create file: `lib/managers/feature-manager.ts`
2. Follow Manager pattern (dependency injection, single responsibility)
3. Add unit tests
4. Integrate with existing managers as needed

### 4. Debugging Workflow

1. **Check Logs**: Use `createLogger("ComponentName")` for logging
2. **Run Tests**: `npm run test:unit -- ComponentName`
3. **Check ESLint**: `npm run lint`
4. **Type Check**: `npm run build` (or `npx tsc --noEmit`)
5. **Use MCP Tools**: See `docs/mcp-tools-reference.md`

### 5. Medical Validation Workflow

1. **Test Calculation**: Use dosing calculator directly
2. **Verify Citations**: Check protocol references are correct
3. **Test Edge Cases**: Weight bounds, age restrictions
4. **Run Medical Tests**: `npm run test:unit -- dosing`
5. **Review Guardrails**: Ensure unauthorized meds are blocked

---

## Quick Reference

### File Size Limits
- **Max**: 500 lines (strict)
- **Preferred**: < 400 lines
- **Break Up**: Immediately if approaching 400

### Function Size Limits
- **Standard**: 40 lines max
- **API Routes**: 80 lines max
- **Medical Templates**: 120 lines max

### Code Quality Checks
```bash
npm run lint:strict    # Zero warnings enforced
npm run test           # All tests must pass
npm run build          # TypeScript must compile
```

### Key Directories
- `lib/managers/` - Business logic
- `lib/services/` - Domain services
- `lib/dosing/` - Medication calculations
- `app/api/` - API endpoints
- `tests/unit/` - Unit tests

### Documentation Files
- `skills.md` - Agent skills and patterns
- `docs/cursor-rules.md` - Detailed coding standards
- `docs/cursor-workflows.md` - Development workflows
- `docs/mcp-tools-reference.md` - MCP tool documentation
- `README.md` - Project overview

---

## Additional Resources

- **Architecture**: See `docs/technical-architecture.md`
- **API Documentation**: See `README.md` API section
- **Testing Guide**: See `docs/TESTING-OFFLINE-PWA.md`
- **Deployment**: See `docs/deployment-checklist.md`

---

**Last Updated**: January 2025
**For Questions**: Refer to project maintainers or technical documentation
