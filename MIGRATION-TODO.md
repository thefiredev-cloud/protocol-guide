# Protocol Guide Migration: Manus → Claude SDK

## Summary
Replace all Manus/Forge API calls with the new Claude SDK and Voyage AI modules that have already been created.

---

## ✅ ALREADY DONE

### New modules created (ready to use):
- `server/_core/claude.ts` - Anthropic Claude SDK with tiered routing (Haiku 4.5 / Sonnet 4.5)
- `server/_core/embeddings.ts` - Voyage AI embeddings (partially done, needs table name updates)

### Environment variables added to `server/_core/env.ts`:
- `ANTHROPIC_API_KEY`
- `VOYAGE_API_KEY`
- Supabase vars already configured

---

## 🔴 FILES TO MODIFY

### 1. `server/_core/llm.ts` - MAIN LLM FILE
**Current:** Uses Forge API with `gemini-2.5-flash`
```typescript
const LLM_API_URL = ENV.forgeApiUrl
  ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
  : "https://forge.manus.im/v1/chat/completions";
model: "gemini-2.5-flash",
authorization: `Bearer ${ENV.forgeApiKey}`,
```
**Action:** Replace with imports from `./claude.ts` - use `invokeClaudeRAG()` or `invokeClaude()`

### 2. `server/_core/embeddings.ts` - TABLE NAMES
**Current:** References `manus_protocol_chunks` and `search_manus_protocols` RPC
```typescript
await supabase.rpc('search_manus_protocols', {...})
.from('manus_protocol_chunks')
```
**Action:** Either:
- Rename Supabase tables from `manus_*` to `protocol_*`, OR
- Keep the table names as-is (they work fine, just named "manus")

### 3. `server/_core/dataApi.ts` - DATA FETCHING
**Current:** Uses Forge API for data operations
```typescript
if (!ENV.forgeApiUrl) { throw error }
if (!ENV.forgeApiKey) { throw error }
authorization: `Bearer ${ENV.forgeApiKey}`,
```
**Action:** Determine if this is still needed. May be for non-LLM API calls.

### 4. `server/_core/notification.ts` - PUSH NOTIFICATIONS
**Current:** Uses Forge API
**Action:** Likely needs a different service (not LLM-related). Consider Firebase or Expo Push.

### 5. `server/_core/imageGeneration.ts` - IMAGE GEN
**Current:** Uses Forge API
**Action:** If needed, integrate a different image service or remove if not used.

### 6. `server/_core/voiceTranscription.ts` - VOICE/WHISPER
**Current:** Uses Forge API
**Action:** Use OpenAI Whisper API directly or another transcription service.

### 7. `server/storage.ts` - FILE STORAGE
**Current:** Uses Forge API for storage
**Action:** Use Supabase Storage or another provider.

### 8. `app/_layout.tsx` - MANUS RUNTIME
**Current:**
```typescript
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
```
**Action:** Remove manus-runtime imports. This was for iframe communication with Manus container. Not needed for standalone PWA.

### 9. `lib/_core/manus-runtime.ts` - DELETE THIS FILE
**Action:** Delete entirely. Only used for Manus iframe communication.

### 10. `server/_core/sdk.ts` - MANUS TYPES
**Current:**
```typescript
} from "./types/manusTypes";
```
**Action:** Check what types are imported and migrate or remove.

### 11. `server/_core/cookies.ts` - DOMAIN HANDLING
**Current:** Has comments referencing `manuspre.computer` domain
**Action:** Update domain logic for your actual domain (protocol.guide or similar)

---

## 🗑️ CAN BE DELETED

1. `lib/_core/manus-runtime.ts` - Manus iframe communication
2. `server/_core/types/manusTypes.ts` - If it exists and only has Manus-specific types
3. Any Forge API key references once migration complete

---

## 📝 ENV VARS TO REMOVE (after migration)

From `.env` and Netlify:
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`

---

## 🎯 PRIORITY ORDER

1. **`server/_core/llm.ts`** - This is the main one. Swap Forge/Gemini for Claude
2. **`app/_layout.tsx`** - Remove manus-runtime import
3. **`lib/_core/manus-runtime.ts`** - Delete file
4. **Everything else** - Lower priority, can be done incrementally

---

## 💡 QUICK WIN

The fastest path: Just modify `llm.ts` to import and use the `invokeClaude()` function from `claude.ts`. The new module already handles:
- Tiered routing (Haiku for free, Sonnet for Pro complex queries)
- Proper system prompts
- Protocol context injection
- Token counting

```typescript
// In llm.ts, replace the fetch call with:
import { invokeClaude, invokeClaudeRAG } from './claude';

// Then use invokeClaudeRAG() for protocol searches
```
