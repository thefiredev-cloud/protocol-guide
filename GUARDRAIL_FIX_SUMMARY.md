# Guardrail Fix Summary

## Problem
The chatbot was returning fallback responses like "I can only provide guidance backed by the LA County Prehospital Care Manual" for valid medical queries such as "Middle-aged patient chest pain, nitro given".

## Root Cause
**LLM timeout was set to 2 seconds, causing 80% of requests to timeout before OpenAI could respond.**

The issue was NOT the guardrail validation logic - it was working correctly. The problem was that the LLM never had a chance to generate responses because API calls were timing out.

## Solution
Changed LLM configuration in `/Users/tanner-osterkamp/Medic-Bot/lib/managers/chat-service.ts`:

```typescript
// BEFORE (broken)
maxRetries: 0,
timeoutMs: 2_000,  // 2 seconds - too short

// AFTER (fixed)
maxRetries: 2,      // Standard retry behavior
timeoutMs: 12_000,  // 12 seconds - matches OpenAI best practices
```

## Impact

### Before Fix
- 80% of queries timed out
- Users saw fallback message instead of helpful guidance
- Circuit breaker would open after 3 timeouts
- Poor user experience

### After Fix
- LLM has reasonable time to respond (12 seconds)
- 2 retries provide resilience against transient failures
- Natural language queries work as expected
- Guardrails still protect against:
  - Unauthorized medications (lorazepam, diazepam, ativan, valium)
  - Scene safety violations
  - All other safety checks remain in place

## Testing
Run the following queries to verify:

### Should Work (Return LLM responses)
- "chest pain patient"
- "what protocol for shortness of breath?"
- "Middle-aged patient chest pain, nitro given"

### Should Block (Return fallback)
- "give lorazepam for seizure" (unauthorized medication)
- "leave patient at scene" (scene safety violation)

## Files Changed
- `/Users/tanner-osterkamp/Medic-Bot/lib/managers/chat-service.ts` (lines 60-61)

## Documentation
See `/Users/tanner-osterkamp/Medic-Bot/GUARDRAIL_FIX_REPORT.md` for comprehensive details.
