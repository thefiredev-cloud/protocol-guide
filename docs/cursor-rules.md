# Cursor Engineering Rules

This document details the coding standards and rules enforced in the Medic-Bot codebase. These rules are automatically enforced via ESLint configuration in `.eslintrc.cjs`.

## Table of Contents

1. [File & Function Size Rules](#file--function-size-rules)
2. [Code Complexity Limits](#code-complexity-limits)
3. [Naming Conventions](#naming-conventions)
4. [Module Organization](#module-organization)
5. [Manager/Coordinator Patterns](#managercoordinator-patterns)
6. [Error Handling Patterns](#error-handling-patterns)
7. [Performance Requirements](#performance-requirements)
8. [ESLint Configuration Details](#eslint-configuration-details)

---

## File & Function Size Rules

### File Size Limits

**Rule**: Maximum 500 lines per file (strictly enforced)

**Enforcement**: ESLint `max-lines` rule with error level

**Practice**: Break up files at ~400 lines to prevent violations

**Why**: Large files are harder to maintain, test, and understand. The 500-line limit forces modular design.

**Exceptions**: None. Files exceeding 500 lines must be split.

**How to Split**:
1. Extract related functionality into separate classes/modules
2. Move utility functions to helper files
3. Split large classes into smaller, focused classes
4. Use composition to break up managers

**Example**:
```typescript
// ❌ BAD: 600+ lines in chat-service.ts
export class ChatService {
  // 600 lines of mixed concerns
}

// ✅ GOOD: Split into focused managers
// chat-service.ts (200 lines) - Orchestration
export class ChatService {
  private readonly retrieval: RetrievalManager;
  private readonly guardrail: GuardrailManager;
  // Delegates to focused managers
}

// retrieval-manager.ts (150 lines) - Search logic
export class RetrievalManager {
  // Focused on retrieval only
}

// guardrail-manager.ts (150 lines) - Validation logic
export class GuardrailManager {
  // Focused on guardrails only
}
```

### Function Size Limits

**Standard Rule**: Maximum 40 lines per function (warning level)

**Preferred**: Keep functions under 30 lines

**Enforcement**: ESLint `max-lines-per-function` rule

**Why**: Short functions are easier to test, understand, and debug. They encourage single responsibility.

**Exceptions** (with documented justification):

| File Pattern | Max Lines | Reason |
|-------------|-----------|--------|
| `app/api/**/route.ts` | 80 | Error handling, validation overhead |
| `lib/managers/chat-service.ts` | 70 | Main orchestration needs more complexity |
| `lib/managers/NarrativeManager.ts` | 120 | Medical template generation requires verbosity |
| `lib/audit/**/*.ts` | 60 | Security validation needs more logic |
| `lib/security/**/*.ts` | 60 | Security checks require more validation |
| `app/**/*.tsx` | 60 | React components may need more setup |

**When Function Gets Too Long**:
1. Extract helper functions for repeated logic
2. Split into multiple private methods
3. Use early returns to reduce nesting
4. Extract validation/transformation logic

**Example**:
```typescript
// ❌ BAD: 80-line function doing everything
async function handleChatRequest(request: ChatRequest) {
  // 80 lines of mixed concerns
  const triage = buildTriage(request);
  const retrieval = await searchKB(triage);
  const payload = buildPayload(retrieval);
  const llmResponse = await callLLM(payload);
  const citations = extractCitations(llmResponse);
  const guardrails = validateGuardrails(llmResponse);
  // ... more logic
}

// ✅ GOOD: Split into focused functions
async function handleChatRequest(request: ChatRequest) {
  const triage = buildTriage(request);
  const retrieval = await performRetrieval(triage);
  const response = await generateResponse(retrieval, request);
  return validateAndFormat(response);
}

async function performRetrieval(triage: TriageResult) {
  // Focused on retrieval only (20 lines)
}

async function generateResponse(retrieval: RetrievalResult, request: ChatRequest) {
  // Focused on response generation (25 lines)
}

function validateAndFormat(response: LLMResponse) {
  // Focused on validation (15 lines)
}
```

---

## Code Complexity Limits

### Cyclomatic Complexity

**Rule**: Maximum complexity of 10 (warning level)

**Enforcement**: ESLint `complexity` rule

**Why**: High complexity indicates too many branches, making code hard to test and maintain.

**How to Reduce Complexity**:
1. Extract complex conditionals into well-named functions
2. Use early returns to reduce nesting
3. Replace switch statements with strategy pattern when appropriate
4. Extract complex expressions into variables

**Example**:
```typescript
// ❌ BAD: Complexity = 15 (too many branches)
function calculateDose(weight: number, age: number, scenario: string) {
  if (weight < 3) return error("too light");
  if (weight > 200) return error("too heavy");
  if (age < 1) {
    if (scenario === "arrest") {
      if (weight < 10) {
        // ... more nested conditions
      }
    }
  }
  // ... more branches
}

// ✅ GOOD: Complexity = 5 (extracted functions)
function calculateDose(weight: number, age: number, scenario: string) {
  if (!isValidWeight(weight)) return error("invalid weight");
  if (isPediatric(age)) {
    return calculatePediatricDose(weight, scenario);
  }
  return calculateAdultDose(weight, scenario);
}

function isValidWeight(weight: number): boolean {
  return weight >= 3 && weight <= 200;
}

function isPediatric(age: number): boolean {
  return age < 18;
}
```

### Maximum Depth

**Rule**: Maximum nesting depth of 2 (warning level)

**Enforcement**: ESLint `max-depth` rule

**Exception**: API routes may use depth 3 for error handling

**Why**: Deep nesting makes code hard to read and understand.

**How to Reduce Depth**:
1. Use early returns
2. Extract nested logic into functions
3. Use guard clauses

**Example**:
```typescript
// ❌ BAD: Depth = 4
function processRequest(data: RequestData) {
  if (data) {
    if (data.user) {
      if (data.user.role === "paramedic") {
        if (data.query) {
          // Process query
        }
      }
    }
  }
}

// ✅ GOOD: Depth = 2 (early returns)
function processRequest(data: RequestData) {
  if (!data?.user) return error("no user");
  if (data.user.role !== "paramedic") return error("unauthorized");
  if (!data.query) return error("no query");
  
  // Process query (depth = 1)
}
```

### Maximum Parameters

**Rule**: Maximum 4 parameters per function (warning level)

**Enforcement**: ESLint `max-params` rule

**Why**: Functions with many parameters are hard to call and maintain.

**Solution**: Use objects/destructuring for related parameters

**Example**:
```typescript
// ❌ BAD: 6 parameters
function calculateDose(
  weight: number,
  age: number,
  scenario: string,
  route: string,
  concentration: number,
  allergies: string[]
) {
  // ...
}

// ✅ GOOD: Use object parameter
function calculateDose(request: MedicationCalculationRequest) {
  const { weight, age, scenario, route, concentration, allergies } = request;
  // ...
}

interface MedicationCalculationRequest {
  weight: number;
  age: number;
  scenario: string;
  route: string;
  concentration: number;
  allergies: string[];
}
```

---

## Naming Conventions

### File Names

**Rule**: `kebab-case.ts` (e.g., `chat-service.ts`, `epinephrine.ts`)

**Enforcement**: ESLint `unicorn/filename-case` rule

**Exceptions**:
- `next-env.d.ts` (Next.js generated)
- `*.d.ts` (TypeScript declaration files)
- `*.cjs` (CommonJS config files)

**Examples**:
```
✅ chat-service.ts
✅ medication-dosing-manager.ts
✅ epinephrine-calculator.ts
❌ ChatService.ts (PascalCase)
❌ chat_service.ts (snake_case)
```

### Class Names

**Rule**: `PascalCase` (e.g., `ChatService`, `EpinephrineCalculator`)

**Enforcement**: TypeScript naming convention

**Examples**:
```typescript
✅ export class ChatService { }
✅ export class EpinephrineCalculator { }
✅ export class RetrievalManager { }
❌ export class chatService { }
❌ export class retrieval_manager { }
```

### Function & Variable Names

**Rule**: `camelCase` (e.g., `handleRequest`, `userId`)

**Enforcement**: TypeScript naming convention

**Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_CHUNKS`, `DEFAULT_TIMEOUT`)

**Examples**:
```typescript
✅ function handleChatRequest() { }
✅ const userId = "abc123";
✅ const MAX_CHUNKS = 6;
✅ const DEFAULT_TIMEOUT_MS = 5000;
❌ function HandleRequest() { }
❌ const user_id = "abc123";
```

### Type & Interface Names

**Rule**: `PascalCase` (e.g., `ChatRequest`, `MedicationDose`)

**Examples**:
```typescript
✅ export interface ChatRequest { }
✅ export type MedicationDose = { }
✅ export type TriageResult = { }
❌ export interface chat_request { }
```

### Enum Member Names

**Rule**: `PascalCase` or `UPPER_SNAKE_CASE`

**Examples**:
```typescript
✅ enum ChatMode { Chat, Narrative }
✅ enum Status { Active, Inactive }
✅ enum ErrorCode { INVALID_WEIGHT, MISSING_PROTOCOL }
```

---

## Module Organization

### One Class Per File

**Rule**: Maximum 1 class per file (strictly enforced)

**Enforcement**: ESLint `max-classes-per-file` rule (error level)

**Why**: Single responsibility per file makes code easier to navigate and test.

**Exception**: None. If you need multiple classes, split into separate files.

**Example**:
```typescript
// ❌ BAD: Multiple classes in one file
// chat-service.ts
export class ChatService { }
export class ChatResponseBuilder { }
export class ChatRequestValidator { }

// ✅ GOOD: One class per file
// chat-service.ts
export class ChatService { }

// chat-response-builder.ts
export class ChatResponseBuilder { }

// chat-request-validator.ts
export class ChatRequestValidator { }
```

### Import Organization

**Rule**: Group imports: external → internal → types

**Enforcement**: ESLint `simple-import-sort` plugin

**Pattern**:
```typescript
// 1. Node.js built-ins
import { randomUUID } from "node:crypto";

// 2. External packages
import type { NextRequest } from "next/server";
import { z } from "zod";

// 3. Internal modules (@/ alias)
import { withApiHandler } from "@/lib/api/handler";
import { ChatService } from "@/lib/managers/chat-service";

// 4. Types (separate section)
import type { ChatRequest } from "@/app/types/chat";
import type { ChatResponse } from "@/lib/managers/chat-service";
```

---

## Manager/Coordinator Patterns

### Manager Pattern Structure

**Required Elements**:
1. Private readonly dependencies
2. Constructor with dependency injection
3. Public methods for external API
4. Private methods for internal logic
5. Logger instance for debugging

**Example**:
```typescript
export class ChatService {
  // 1. Private readonly dependencies
  private readonly env = EnvironmentManager.load();
  private readonly retrieval = new RetrievalManager();
  private readonly logger = createLogger("ChatService");
  
  // 2. Constructor with DI
  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient ?? new LLMClient({ /* defaults */ });
  }
  
  // 3. Public API
  public async handle(request: ChatRequest): Promise<ChatResponse> {
    // Delegates to private methods
    await this.warm();
    const triage = this.buildTriage(request);
    return this.processRequest(triage, request);
  }
  
  // 4. Private methods
  private buildTriage(request: ChatRequest): TriageResult {
    // Internal logic
  }
}
```

### Single Responsibility

**Rule**: Each manager handles one domain concern

**Examples**:
- `ChatService`: Chat orchestration only
- `RetrievalManager`: Knowledge base search only
- `NarrativeManager`: Narrative generation only
- `GuardrailManager`: Medical validation only

**Anti-Pattern**:
```typescript
// ❌ BAD: God class doing everything
export class EverythingManager {
  async handleChat() { }
  async searchKB() { }
  async generateNarrative() { }
  async validateGuardrails() { }
  async calculateDose() { }
}

// ✅ GOOD: Focused managers
export class ChatService {
  constructor(
    private retrieval: RetrievalManager,
    private narrative: NarrativeManager,
    private guardrail: GuardrailManager
  ) { }
  
  async handle() {
    // Orchestrates focused managers
  }
}
```

---

## Error Handling Patterns

### Never Throw to User

**Rule**: Always catch errors internally, return safe fallbacks

**Pattern**:
```typescript
// ✅ GOOD: Catch and return safe fallback
public async search(query: string): Promise<SearchResult> {
  try {
    const results = await this.performSearch(query);
    return { chunks: results, error: null };
  } catch (error) {
    this.logger.error("Search failed", { error, query });
    return { chunks: [], error: "Search unavailable" };
  }
}

// ❌ BAD: Throws to caller
public async search(query: string): Promise<SearchResult> {
  const results = await this.performSearch(query);
  return results; // May throw!
}
```

### Validation Error Format

**Rule**: Return structured error objects, not exceptions

**Pattern**:
```typescript
interface ValidationError {
  error: string;
  code: string;
  field?: string;
}

function validateWeight(weight: number): ValidationError | null {
  if (weight < 3) {
    return {
      error: "Weight must be at least 3kg",
      code: "WEIGHT_TOO_LOW",
      field: "weight",
    };
  }
  if (weight > 200) {
    return {
      error: "Weight must be at most 200kg",
      code: "WEIGHT_TOO_HIGH",
      field: "weight",
    };
  }
  return null; // Valid
}
```

### Logging Errors

**Rule**: Always log errors with context

**Pattern**:
```typescript
try {
  await riskyOperation();
} catch (error) {
  this.logger.error("Operation failed", {
    error,
    userId: request.userId,
    operation: "riskyOperation",
    metadata: { /* relevant context */ },
  });
  return safeFallback();
}
```

---

## Performance Requirements

### Function Execution Time

| Operation | Target | Max |
|----------|--------|-----|
| Dosing Calculation | < 50ms | 100ms |
| Knowledge Base Search | < 150ms | 200ms |
| Chat Response (P95) | < 2000ms | 3000ms |
| API Route Total | < 500ms | 1000ms |

### Optimization Patterns

1. **Lazy Loading**: Load knowledge base chunks on-demand
2. **Caching**: Cache protocol retrieval results
3. **Streaming**: Use SSE for chat responses (perceived latency)
4. **Database**: Use connection pooling, index queries

---

## ESLint Configuration Details

### Configuration File

Location: `.eslintrc.cjs`

### Rule Summary

| Rule | Level | Value | Applies To |
|------|-------|-------|------------|
| `max-lines` | error | 500 | All files |
| `max-lines-per-function` | warn | 40 | All files |
| `max-depth` | warn | 2 | All files |
| `complexity` | warn | 10 | All files |
| `max-params` | warn | 4 | All files |
| `max-classes-per-file` | error | 1 | All files |
| `unicorn/filename-case` | error | kebabCase | All files |

### File-Specific Overrides

See `.eslintrc.cjs` for complete override configuration:

- **API Routes** (`app/api/**/route.ts`): Functions up to 80 lines, complexity 20
- **Managers** (`lib/managers/**/*.ts`): Functions up to 70 lines, complexity 15
- **Medical Templates** (`lib/managers/NarrativeManager.ts`): Functions up to 120 lines, complexity 30
- **React Components** (`app/**/*.tsx`): Functions up to 60 lines, complexity 15

### Running ESLint

```bash
npm run lint           # Check with warnings
npm run lint:strict    # Zero warnings enforced (for CI)
```

---

## Quick Reference Checklist

When writing code, ensure:
- [ ] File size < 500 lines
- [ ] Functions < 40 lines (or exception documented)
- [ ] Complexity < 10
- [ ] Nesting depth < 2
- [ ] Parameters < 4
- [ ] One class per file
- [ ] File names in `kebab-case`
- [ ] Class names in `PascalCase`
- [ ] Functions/vars in `camelCase`
- [ ] Imports properly grouped
- [ ] Errors handled gracefully
- [ ] Logging added for errors

---

**Enforcement**: All rules enforced via ESLint in `.eslintrc.cjs`
**For Questions**: See `AGENTS.md` or `skills.md` for additional guidance
