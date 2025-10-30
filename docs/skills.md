# Medic-Bot Agent Skills

This document outlines the skills, patterns, and knowledge required for AI agents working on the Medic-Bot codebase.

## Prerequisites

### Domain Knowledge
- **Medical Domain**: LA County Fire Department EMS protocols, prehospital care, medication dosing
- **Protocol Familiarity**: Understanding of LA County Prehospital Care Manual (PCM) structure
- **Clinical Context**: Pediatric dosing (Broselow/color-code system), adult medication calculations, triage protocols
- **Medical Accuracy**: Critical - all medical code must be validated against official protocols

### Technical Stack
- **TypeScript 5.4.5**: Strict mode, modern ES2022 features
- **Next.js 14.2.5**: App Router architecture, Server-Side Rendering, API routes
- **React 18.3.1**: Functional components, hooks, context API
- **MiniSearch 7.1.0**: BM25 search algorithm for knowledge base retrieval
- **Supabase**: PostgreSQL database, edge functions, authentication
- **Netlify**: Edge functions, CDN deployment

## Core Architectural Patterns

### Manager Pattern
All business logic is encapsulated in Manager classes following strict OOP principles:

```typescript
// Pattern: Manager class with single responsibility
export class ChatService {
  private readonly env = EnvironmentManager.load();
  private readonly retrieval = new RetrievalManager();
  private readonly logger = createLogger("ChatService");
  
  constructor(dependencies?: Dependencies) {
    // Dependency injection for testability
  }
  
  public async handle(request: ChatRequest): Promise<ChatResponse> {
    // Single entry point, delegates to services
  }
}
```

**Key Locations**:
- `lib/managers/chat-service.ts` - Main chat orchestration
- `lib/managers/RetrievalManager.ts` - Knowledge base search
- `lib/managers/NarrativeManager.ts` - PCR narrative generation
- `lib/dosing/medication-dosing-manager.ts` - Medication calculations

### Coordinator Pattern
For complex workflows requiring multiple managers:

```typescript
// Pattern: Coordinator orchestrates multiple managers
export class ProtocolCoordinator {
  private readonly retrieval: RetrievalManager;
  private readonly guardrail: GuardrailManager;
  private readonly triage: TriageService;
  
  async processProtocolQuery(query: string): Promise<ProtocolResult> {
    // Coordinates between multiple services
  }
}
```

### Service Pattern
Focused, single-purpose services used by managers:

```typescript
// Pattern: Service handles specific domain concern
export class CitationService {
  extractCitations(content: string): Citation[] {
    // Focused on citation extraction only
  }
}
```

**Key Locations**:
- Alternatively, check if this exists in `lib/services/chat/*`

## Code Organization Principles

### File Structure Rules
- **Max 500 lines per file** (strictly enforced via ESLint)
- **Break up at ~400 lines** to prevent violations
- **One class per file** (enforced)
- **Co-locate related utilities** in same directory

### Module Organization
```
lib/
├── managers/          # Business logic managers (OOP classes)
├── services/          # Domain-specific services
├── dosing/           # Medication calculation domain
│   ├── calculators/  # Individual medication calculators
│   └── types.ts      # Domain types
├── triage/           # Clinical decision support
└── api/              # API utilities and handlers
```

### Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `chat-service.ts`, `epinephrine.ts`)
- **Classes**: `PascalCase` (e.g., `ChatService`, `EpinephrineCalculator`)
- **Functions/Variables**: `camelCase` (e.g., `handleRequest`, `userId`)
- **Types/Interfaces**: `PascalCase` (e.g., `ChatRequest`, `MedicationDose`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_CHUNKS`, `DEFAULT_TIMEOUT`)

## Function Size Requirements

### Standard Limits
- **Functions**: Max 40 lines (warn), 30 lines preferred
- **Complexity**: Max 10 cyclomatic complexity
- **Parameters**: Max 4 parameters

### Exceptions (with Justification)
- **API Routes**: Up to 80 lines for error handling (`app/api/**/route.ts`)
- **Manager Orchestration**: Up to 70 lines for `ChatService.handle()` 
- **Medical Templates**: Up to 120 lines for narrative builders (NarrativeManager)
- **Dosing Calculators**: Up to 50 lines for complex calculations

See `.eslintrc.cjs` for complete rule set.

## Testing Patterns

### Test Organization
Tests mirror source structure:
```
tests/
├── unit/              # Unit tests for managers/services
│   ├── managers/      # Manager tests
│   ├── dosing/        # Dosing calculator tests
│   └── triage/        # Triage tests
├── integration/       # API integration tests
└── e2e/              # Playwright end-to-end tests
```

### Test Naming
- **Files**: `*.test.ts` or `*.spec.ts`
- **Describe blocks**: "ClassName" or "FeatureName"
- **Test cases**: "should [expected behavior]"

### Test Coverage Requirements
- **Business Logic**: 80%+ coverage required
- **Medical Calculations**: 100% coverage (critical for safety)
- **API Routes**: Integration tests for all endpoints
- **Edge Cases**: Test weight bounds, null inputs, error conditions

### Example Test Pattern
```typescript
import { describe, it, expect } from "vitest";
import { EpinephrineCalculator } from "@/lib/dosing/calculators/epinephrine";

describe("EpinephrineCalculator", () => {
  const calculator = new EpinephrineCalculator();
  
  it("should calculate correct IM dose for 70kg adult", () => {
    const result = calculator.calculate({
      patientWeightKg: 70,
      scenario: "arrest",
    });
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].dose.quantity).toBe(1);
  });
});
```

## Medical Code Requirements

### Safety-Critical Patterns
1. **Always validate input ranges** (weight, age, vital signs)
2. **Never allow dangerous calculations** (e.g., pediatric doses for adults)
3. **Always cite protocol sources** (PCM references required)
4. **Guardrail validation** before returning medical recommendations
5. **Contraindication checking** before medication suggestions

### Dosing Calculator Pattern
```typescript
export class MedicationCalculator implements MedicationCalculator {
  public readonly id = "medication-name";
  public readonly name = "Medication Name";
  public readonly aliases = ["alias1", "alias2"];
  public readonly categories = ["Medication", "MCG 1309"];
  
  public calculate(request: MedicationCalculationRequest): MedicationCalculationResult {
    // Validate input bounds
    if (request.patientWeightKg < MIN_WEIGHT || request.patientWeightKg > MAX_WEIGHT) {
      return { error: "Weight out of range" };
    }
    
    // Calculate with protocol citations
    return {
      recommendations: [/* dose recommendations */],
      citations: ["PCM X.X.X"],
    };
  }
}
```

### Protocol Citation Requirements
- All protocol references must include: Protocol number (e.g., "PCM 1.2.1")
- Section references when applicable
- MCG references for pediatric dosing (e.g., "MCG 1309")

## API Route Patterns

### Next.js App Router Pattern
```typescript
import { withApiHandler } from "@/lib/api/handler";
import { ChatService } from "@/lib/managers/chat-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const payload = await prepareChatRequest(request);
    const service = new ChatService();
    const result = await service.handle(payload);
    return Response.json(result);
  });
}
```

### Streaming Response Pattern (SSE)
```typescript
export async function POST(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(sseEncode("start", {})));
      
      // Stream chunks
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(sseEncode("delta", chunk)));
        await new Promise(r => setTimeout(r, 10));
      }
      
      controller.enqueue(encoder.encode(sseEncode("final", result)));
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

## Error Handling Patterns

### Service-Level Errors
```typescript
try {
  const result = await this.retrieval.search(query);
  return result;
} catch (error) {
  this.logger.error("Retrieval failed", { error, query });
  // Return safe fallback, never throw to user
  return { chunks: [], error: "Search unavailable" };
}
```

### Validation Errors
```typescript
if (!isValidWeight(weight)) {
  return {
    error: "Weight must be between 3kg and 200kg",
    code: "INVALID_WEIGHT",
  };
}
```

## Performance Requirements

### Latency Targets
- **Chat Response**: P95 < 3 seconds
- **Dosing Calculation**: < 100ms
- **Knowledge Base Search**: < 200ms
- There are no explicit latency targets for other endpoints.

### Optimization Patterns
- **Lazy Loading**: Knowledge base chunks loaded on-demand
- **Caching**: Protocol retrieval results cached
- **Streaming**: Use SSE for chat responses (perceived latency)
- **Database**: Use connection pooling, index queries

## MCP Tool Integration

### When to Use MCP Tools
- **GitHub**: Search code, create PRs, manage issues
- **Supabase**: Database migrations, query execution, function deployment
- **Netlify**: Deployment management, environment variables
- **Memory**: Store knowledge graph for complex problems
- **Sequential Thinking**: Break down complex multi-step problems
- **Filesystem**: Read workspace files, understand structure

### Common MCP Workflows
See `docs/cursor-workflows.md` for detailed MCP tool usage patterns.

## Common Pitfalls to Avoid

### Anti-Patterns
1. **God Classes**: Avoid putting all logic in one manager
2. **Tight Coupling**: Use dependency injection, not direct imports
3. **Long Functions**: Break down >40 line functions immediately
4. **Missing Tests**: Never skip tests for medical calculations
5. **Hardcoded Values**: Use environment variables, not magic numbers
6. **Missing Validation**: Always validate medical inputs
7. **Silent Failures**: Log errors, return safe fallbacks

### Medical Code Anti-Patterns
1. **No Protocol Citations**: All medical recommendations must cite sources
2. **Missing Guardrails**: Never return unauthorized medications
3. **Unvalidated Calculations**: Always check weight/age bounds
4. **Missing Error Handling**: Handle calculation errors gracefully
5. **Hardcoded Doses**: Use calculators, not hardcoded values

## Code Review Checklist

When reviewing agent-generated code:
- [ ] File size < 500 lines
- [ ] Functions < 40 lines (or exception documented)
- [ ] One class per file
- [ ] Tests included for new features
- [ ] Medical code has protocol citations
- [ ] Error handling for edge cases
- [ ] ESLint passes with zero warnings
- [ ] TypeScript strict mode passes
- [ ] No hardcoded secrets or credentials
- [ ] Documentation comments for complex logic

## References

- **Project Structure**: See `README.md` for project overview
- **Architecture**: See `docs/technical-architecture.md` for system design
- **Coding Rules**: See `docs/cursor-rules.md` for detailed standards
- **Workflows**: See `docs/cursor-workflows.md` for development workflows
- **MCP Tools**: See `docs/mcp-tools-reference.md` for tool documentation

