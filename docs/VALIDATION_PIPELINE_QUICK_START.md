# Validation Pipeline Quick Start Guide

## Overview

The Multi-Layer Validation Pipeline ensures 99%+ accuracy by validating at 4 critical stages:

1. **Pre-Retrieval** - Before database lookup
2. **During-Retrieval** - Protocol verification
3. **Pre-Response** - LLM context validation
4. **Post-Response** - Hallucination detection

---

## Quick Integration

### Basic Usage

```typescript
import { getValidationPipeline } from '@/lib/protocols/validation-pipeline';
import { getValidationMonitor } from '@/lib/protocols/validation-monitor';

const pipeline = getValidationPipeline();
const monitor = getValidationMonitor();

// Stage 1: Validate query
const queryValidation = await pipeline.validateQuery(userQuery);
if (!queryValidation.valid) {
  console.error('Query validation failed:', queryValidation.errors);
}

// Stage 2: Validate retrieved protocols
const protocolValidation = await pipeline.validateRetrievedProtocols(protocols);
if (!protocolValidation.valid) {
  // Filter out invalid protocols
  protocols = protocols.filter(p => p.is_current && !p.deleted_at);
}

// Stage 3: Validate LLM context
const contextValidation = await pipeline.validateLLMContext(context, protocols);
if (!contextValidation.valid) {
  // Add missing critical elements to context
}

// Stage 4: Validate response
const startTime = Date.now();
const responseValidation = await pipeline.validateResponse(llmResponse, protocols);
const duration = Date.now() - startTime;

// Record metrics
monitor.recordValidation('post-response', responseValidation, duration, {
  query: userQuery
});

// Block response if critical errors found
if (responseValidation.errors.some(e => e.severity === 'critical')) {
  throw new Error('Response validation failed - critical errors detected');
}
```

---

## Integration with RetrievalManager

```typescript
// lib/managers/RetrievalManager.ts

import { getValidationPipeline } from '@/lib/protocols/validation-pipeline';
import { getValidationMonitor } from '@/lib/protocols/validation-monitor';

export class RetrievalManager {
  private pipeline = getValidationPipeline();
  private monitor = getValidationMonitor();

  async search(query: RetrievalQuery): Promise<RetrievalResult> {
    const startTime = Date.now();

    // STAGE 1: Pre-Retrieval Validation
    const queryValidation = await this.pipeline.validateQuery(query.rawText);
    if (queryValidation.metadata?.normalizedQuery) {
      // Use normalized query for better results
      query.rawText = queryValidation.metadata.normalizedQuery;
    }

    // Existing retrieval logic
    let context = await buildContext(query.rawText, limit);
    const hits = await searchKB(query.rawText, limit);

    // STAGE 2: During-Retrieval Validation
    const protocols = await this.getProtocolsFromHits(hits);
    const protocolValidation = await this.pipeline.validateRetrievedProtocols(protocols);

    if (!protocolValidation.valid) {
      // Filter out invalid protocols
      const validProtocols = protocols.filter(p => p.is_current);
      // Rebuild context with valid protocols only
      context = this.buildContextFromProtocols(validProtocols);
    }

    // STAGE 3: Pre-Response Validation
    const contextValidation = await this.pipeline.validateLLMContext(context, protocols);
    if (contextValidation.errors.length > 0) {
      // Add missing critical elements
      context = this.enrichContext(context, contextValidation.errors);
    }

    // Record validation
    const duration = Date.now() - startTime;
    this.monitor.recordValidation('during-retrieval', protocolValidation, duration, {
      query: query.rawText
    });

    return { context, hits };
  }
}
```

---

## Integration with Chat API

```typescript
// app/api/chat/route.ts

import { getValidationPipeline } from '@/lib/protocols/validation-pipeline';
import { getValidationMonitor } from '@/lib/protocols/validation-monitor';

export async function POST(request: Request) {
  const pipeline = getValidationPipeline();
  const monitor = getValidationMonitor();

  const { message } = await request.json();

  // Retrieve protocols and context
  const { context, protocols } = await retrievalManager.search({ rawText: message });

  // Generate LLM response
  const response = await generateLLMResponse(context, message);

  // STAGE 4: Post-Response Validation
  const startTime = Date.now();
  const validation = await pipeline.validateResponse(response, protocols);
  const duration = Date.now() - startTime;

  // Record metrics
  monitor.recordValidation('post-response', validation, duration, {
    query: message
  });

  // Block response if critical errors
  if (validation.errors.some(e => e.severity === 'critical')) {
    return Response.json({
      error: 'Response validation failed',
      details: validation.errors.map(e => e.message)
    }, { status: 500 });
  }

  // Include warnings in response metadata
  return Response.json({
    response,
    metadata: {
      warnings: validation.warnings,
      validationPassed: validation.valid
    }
  });
}
```

---

## Monitoring and Alerts

### Check Success Rate

```typescript
import { getValidationMonitor } from '@/lib/protocols/validation-monitor';

const monitor = getValidationMonitor();

// Check if meeting 99% target
if (!monitor.meetsSuccessTarget(99)) {
  console.error('⚠️ SUCCESS RATE BELOW 99%');

  // Get detailed metrics
  const metrics = monitor.getMetrics();
  console.log(`Current rate: ${metrics.successRate.toFixed(2)}%`);

  // Identify patterns
  const patterns = monitor.getPatterns(5);
  console.log('Top error patterns:', patterns);

  // Send alert
  await sendSlackAlert(`Validation success rate dropped to ${metrics.successRate}%`);
}
```

### Generate Reports

```typescript
import { getValidationMonitor } from '@/lib/protocols/validation-monitor';

const monitor = getValidationMonitor();

// Generate report for last 24 hours
const report = monitor.generateReport(24 * 60 * 60 * 1000);
console.log(report);

// Export for external monitoring (Datadog, Grafana, etc.)
const exported = monitor.exportMetrics();
await sendToMonitoringService(exported);
```

---

## Error Handling Strategies

### Critical Errors (Block Response)

```typescript
const criticalErrors = validation.errors.filter(e => e.severity === 'critical');

if (criticalErrors.length > 0) {
  // Log for investigation
  logger.error('Critical validation errors', { errors: criticalErrors, query, response });

  // Return safe fallback response
  return {
    response: 'I apologize, but I cannot provide a safe response. Please contact your Base Hospital directly for guidance.',
    metadata: { validationFailed: true }
  };
}
```

### Errors (Flag for Review)

```typescript
const errors = validation.errors.filter(e => e.severity === 'error');

if (errors.length > 0) {
  // Add warning banner to response
  response = `⚠️ **CAUTION:** Response requires verification\n\n${response}\n\n**Issues detected:**\n${errors.map(e => `- ${e.message}`).join('\n')}`;

  // Flag for clinical review
  await flagForReview({ query, response, errors });
}
```

### Warnings (Informational)

```typescript
const warnings = validation.warnings;

if (warnings.length > 0) {
  // Include in response metadata
  metadata.warnings = warnings.map(w => w.message);

  // Log for analytics
  logger.info('Validation warnings', { warnings, query });
}
```

---

## Common Error Codes Reference

### Pre-Retrieval
- `INVALID_PROTOCOL_CODE` - Protocol code not found in LA County formulary
- `MEDICATION_WITHOUT_PROTOCOL` - Medication query needs clinical context
- `VAGUE_QUERY` - Query too vague for accurate matching
- `UNAUTHORIZED_MEDICATION_QUERY` - Query mentions unauthorized medication

### During-Retrieval
- `DEPRECATED_PROTOCOL` - Protocol is not current version
- `PROTOCOL_EXPIRED` - Protocol has expired
- `PROTOCOL_NOT_EFFECTIVE` - Protocol not yet effective
- `INCOMPLETE_PROTOCOL` - Protocol content insufficient

### Pre-Response
- `UNRETRIEVED_CITATION` - Context references unretrieved protocol
- `CONTEXT_MEDICATION_ERROR` - Unauthorized medication in context
- `MISSING_BASE_CONTACT` - Base contact requirement missing
- `DOSE_OUT_OF_RANGE` - Medication dose outside LA County range

### Post-Response
- `HALLUCINATED_CITATION` - Response cites protocol not in source
- `RESPONSE_MEDICATION_ERROR` - Unauthorized medication in response
- `MISSING_BASE_CONTACT_REQUIREMENT` - Base contact not mentioned
- `RESPONSE_CONTRADICTIONS` - Contradictory information detected

---

## Best Practices

### 1. Always Validate at All Stages

```typescript
// ❌ BAD - Skipping validation
const response = await llm.generate(context);
return response;

// ✅ GOOD - Full pipeline validation
const queryVal = await pipeline.validateQuery(query);
const protocolVal = await pipeline.validateRetrievedProtocols(protocols);
const contextVal = await pipeline.validateLLMContext(context, protocols);
const response = await llm.generate(context);
const responseVal = await pipeline.validateResponse(response, protocols);
```

### 2. Record All Validations

```typescript
// Always record for monitoring
monitor.recordValidation(stage, validation, duration, context);
```

### 3. Handle Errors Gracefully

```typescript
// Don't just throw - provide safe fallbacks
if (validation.errors.some(e => e.severity === 'critical')) {
  return safetyMessage; // Always provide safe guidance
}
```

### 4. Monitor Success Rate

```typescript
// Regular health checks
setInterval(() => {
  if (!monitor.meetsSuccessTarget(99)) {
    alert('Success rate dropped below 99%');
  }
}, 60000); // Check every minute
```

### 5. Use Normalized Queries

```typescript
// Use normalized queries for better matching
const queryVal = await pipeline.validateQuery(rawQuery);
const normalizedQuery = queryVal.metadata?.normalizedQuery || rawQuery;
const results = await search(normalizedQuery);
```

---

## Testing

### Unit Tests

```bash
# Run validation pipeline tests
npm test tests/unit/validation-pipeline.test.ts

# Run validation monitor tests
npm test tests/unit/validation-monitor.test.ts
```

### Integration Tests

```typescript
// Test complete flow
const query = 'Patient in cardiac arrest';
const queryVal = await pipeline.validateQuery(query);
const protocols = await repo.searchProtocols(query);
const protocolVal = await pipeline.validateRetrievedProtocols(protocols);
// ... continue through all stages
```

### Field Testing

```bash
# Run field test scenarios
npm run test:field

# Test specific protocol
npm run test:protocol 1210  # Cardiac Arrest
```

---

## Troubleshooting

### Success Rate Below 99%

1. Check error patterns: `monitor.getPatterns()`
2. Review recent failures: `monitor.getRecentFailures()`
3. Investigate by stage: `monitor.getFailuresByStage()`
4. Fix common issues (see patterns)
5. Re-test affected scenarios

### False Positives

If validation is too strict:

```typescript
// Adjust severity levels
if (error.code === 'MINOR_ISSUE') {
  error.severity = 'warning'; // Downgrade from error
}
```

### Performance Issues

If validation adds too much latency:

```typescript
// Run non-critical validations asynchronously
Promise.all([
  pipeline.validateQuery(query),
  // ... other async operations
]);
```

---

## Support

For questions or issues:
- Review implementation report: `VALIDATION_PIPELINE_IMPLEMENTATION.md`
- Check test examples: `tests/unit/validation-*.test.ts`
- Review error detector: `lib/protocols/error-detector.ts`

**Target:** 99%+ success rate, 0% hallucinations
**Current:** Infrastructure complete, ready for integration
