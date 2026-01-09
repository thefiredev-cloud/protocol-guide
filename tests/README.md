# ProtocolGuide E2E Tests

## Phase 1 Smoke Test

Tests 5 critical chat queries against the ProtocolGuide app.

### Setup

1. Ensure the dev server is running:
   ```bash
   npm run dev
   ```

2. Create test credentials file:
   ```bash
   cp tests/test-credentials.json.example tests/test-credentials.json
   ```

3. Edit `tests/test-credentials.json` with valid Supabase credentials:
   ```json
   {
     "email": "your@email.com",
     "password": "your-password"
   }
   ```

   **Note**: `test-credentials.json` is gitignored for security.

### Alternative: Environment Variables

Instead of creating a credentials file, you can use environment variables:

```bash
TEST_EMAIL="your@email.com" TEST_PASSWORD="your-password" node tests/smoke-test-phase1.mjs
```

### Running Tests

```bash
node tests/smoke-test-phase1.mjs
```

### Test Queries

The smoke test executes these 5 critical queries:

1. `policy 830` - Should return exact protocol match
2. `LAMS` - Should return stroke scale protocols (521/522)
3. `epi dose` - Should return epinephrine dosing info
4. `chest pain` - Should return cardiac protocols
5. `1201` - Should return TP-1201 General Assessment

### Results

- Screenshots are saved to `screenshots/smoke-test/`
- JSON report is saved to `screenshots/smoke-test/test-report.json`
- Test results are printed to console

### What's Tested

For each query, the test validates:
- Response received (yes/no)
- Response time (ms)
- Confidence badge (HIGH/MEDIUM/LOW)
- Citations present (yes/no)
- Response content preview

### Troubleshooting

**Login fails:**
- Verify credentials in `test-credentials.json` are correct
- Check Supabase is configured in `.env.local`
- Ensure user exists in Supabase `users` table

**Chat input not found:**
- Ensure app is running on `http://localhost:3000`
- Check browser console for errors in screenshots
- Verify authentication completed successfully

**No response:**
- Check `GEMINI_API_KEY` is set in Netlify
- Verify Netlify functions are running
- Check browser network tab in screenshots
