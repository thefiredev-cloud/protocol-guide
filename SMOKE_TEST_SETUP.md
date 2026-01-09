# Phase 1 Smoke Test Setup Complete

## Summary

Created a comprehensive E2E smoke test for the ProtocolGuide chat interface using Puppeteer. The test validates 5 critical query scenarios with authentication support.

## Files Created

1. **`/Users/tanner-osterkamp/Google AI Studio Protocol Guide/tests/smoke-test-phase1.mjs`**
   - Main test script with Puppeteer automation
   - Handles authentication via Supabase
   - Tests 5 critical queries
   - Takes screenshots and generates reports

2. **`/Users/tanner-osterkamp/Google AI Studio Protocol Guide/tests/test-credentials.json.example`**
   - Template for test credentials
   - Gitignored for security

3. **`/Users/tanner-osterkamp/Google AI Studio Protocol Guide/tests/README.md`**
   - Comprehensive test documentation
   - Setup instructions
   - Troubleshooting guide

## Files Modified

1. **`.gitignore`** - Added `tests/test-credentials.json` to prevent credential leaks

## Test Queries

The smoke test validates these 5 critical scenarios:

| # | Query | Expected Result |
|---|-------|----------------|
| 1 | `policy 830` | Exact protocol match |
| 2 | `LAMS` | Stroke scale protocols (521/522) |
| 3 | `epi dose` | Epinephrine dosing info |
| 4 | `chest pain` | Cardiac protocols |
| 5 | `1201` | TP-1201 General Assessment |

## What's Validated

For each query, the test checks:
- ✅ Response received (yes/no)
- ✅ Response time (ms)
- ✅ Confidence badge (HIGH/MEDIUM/LOW)
- ✅ Citations present (yes/no)
- ✅ Response preview (first 200 chars)
- ✅ Screenshots (before/after)

## Next Steps to Run

### 1. Create Test Credentials

```bash
cd "/Users/tanner-osterkamp/Google AI Studio Protocol Guide"
cp tests/test-credentials.json.example tests/test-credentials.json
```

### 2. Edit Credentials File

Edit `tests/test-credentials.json`:
```json
{
  "email": "tanner@thefiredev.com",
  "password": "YOUR_PASSWORD_HERE"
}
```

**Or** use environment variables:
```bash
export TEST_EMAIL="tanner@thefiredev.com"
export TEST_PASSWORD="your_password"
```

### 3. Ensure Dev Server Running

```bash
npm run dev
```

Verify it's accessible at: http://localhost:3000

### 4. Run the Smoke Test

```bash
node tests/smoke-test-phase1.mjs
```

## Test Output

The test will:
1. Launch a visible browser window
2. Authenticate with provided credentials
3. Navigate to chat for each query
4. Type the query and submit
5. Wait up to 15 seconds for response
6. Take screenshots before/after
7. Extract response data
8. Generate a report

### Screenshots Location
```
/Users/tanner-osterkamp/Google AI Studio Protocol Guide/screenshots/smoke-test/
  - policy-830-before.png
  - policy-830-after.png
  - policy-830-debug.png (if errors occur)
  - lams-before.png
  - lams-after.png
  - ... (5 queries total)
```

### JSON Report
```
/Users/tanner-osterkamp/Google AI Studio Protocol Guide/screenshots/smoke-test/test-report.json
```

Contains detailed results for all queries including:
- Query text
- Response status
- Response time
- Confidence level
- Citations found
- Response preview
- Screenshot paths

## Authentication Flow

The test uses Supabase authentication:

1. Loads credentials from file or environment
2. Navigates to `/login`
3. Fills email and password fields
4. Submits login form
5. Waits for redirect (3 seconds)
6. Verifies not on login page
7. Proceeds with tests using authenticated session

## Known Considerations

### Authentication Required
All routes except `/login` are protected with `ProtectedRoute`. The test handles this automatically by logging in before running queries.

### Supabase Dependency
The app requires Supabase to be configured with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### API Keys
Netlify functions need:
- `GEMINI_API_KEY` for AI responses
- `SUPABASE_SERVICE_ROLE_KEY` for embeddings

If these aren't configured, queries may not return responses.

## Troubleshooting

### Login Fails
- Verify credentials are correct
- Check Supabase auth is configured
- Ensure user exists in Supabase
- Check `.env.local` has valid Supabase keys

### No Response from Chat
- Verify dev server is running on port 3000
- Check Netlify functions are working locally
- Ensure GEMINI_API_KEY is configured
- Check browser console in screenshots for errors

### Input Not Found
- Verify you're on correct URL (http://localhost:3000)
- Check authentication completed successfully
- Review debug screenshots for page state

## Test Reliability Features

- ✅ Waits for network idle before interactions
- ✅ Uses multiple selector strategies for robustness
- ✅ Detects loading indicators
- ✅ Takes debug screenshots on failures
- ✅ Logs browser console errors
- ✅ Validates response structure
- ✅ Handles authentication state
- ✅ Configurable timeouts (15s default)

## Future Enhancements

- [ ] Parallel query execution for speed
- [ ] Visual regression testing
- [ ] Performance metrics (LCP, FID, CLS)
- [ ] Accessibility audits (axe-core)
- [ ] Network mocking for offline tests
- [ ] CI/CD integration (GitHub Actions)
- [ ] Headless mode for CI
- [ ] Video recording of test runs
- [ ] Retry logic for flaky tests
- [ ] Custom assertions for medical content

## Ready to Execute

The test infrastructure is fully configured and ready to run. Just add credentials and execute!

```bash
# Quick start
cd "/Users/tanner-osterkamp/Google AI Studio Protocol Guide"
cp tests/test-credentials.json.example tests/test-credentials.json
# Edit the file with your password
node tests/smoke-test-phase1.mjs
```
