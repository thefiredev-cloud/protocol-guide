# Protocol Guide - AI Chat E2E Test

## Quick Start

### 1. Update Credentials
Edit `e2e-chat-test.js` line 19-22:
```javascript
testUser: {
  email: 'YOUR_VALID_EMAIL@domain.com',
  password: 'YOUR_VALID_PASSWORD'
}
```

### 2. Ensure App is Running
```bash
# App should be running on http://localhost:3000
curl http://localhost:3000  # Should return 200
```

### 3. Run Test
```bash
node e2e-chat-test.js
```

## What the Test Does

✅ **Step 1**: Login with test credentials
✅ **Step 2**: Navigate to /#/chat page
✅ **Step 3**: Verify chat interface loaded
✅ **Step 4-8**: Send "sepsis" query → Verify TP-1204 mention
✅ **Step 9-11**: Send "1203" query → Verify Diabetic Emergencies content
✅ **Step 12-13**: Send "base contact criteria" → Verify Ref. 624 citation

## Expected Output

```
🚀 Starting E2E Test: AI Chat Functionality

Target: http://localhost:3000/#/chat
User: test@example.com


🔐 Step 1: Login
  → Not authenticated, logging in...
  ✓ Login successful
✓ Login

📱 Step 2: Navigate to Chat
  📸 Screenshot saved: screenshots/chat-test/xxx-chat-page-initial.png
  ✓ Chat page loaded
✓ Navigate to Chat

🔍 Step 3: Verify Initial Message
  ✓ Initial message verified
✓ Verify Initial Message

🧪 Step 4-8: Test Sepsis Query
  💬 Sending message: "sepsis"
  🔍 Input elements found: [...]
  ✓ Found input field with selector: input[type="text"]
  ✓ Message sent
  ⏳ Waiting for AI response...
  ✓ AI response received
  📝 Response preview: Protocol TP-1204: Sepsis Management...
  📸 Screenshot saved: screenshots/chat-test/xxx-sepsis-response.png
✓ Sepsis Query

🧪 Step 9-11: Test Protocol 1203 Query
  💬 Sending message: "1203"
  ✓ Found input field with selector: input[type="text"]
  ✓ Message sent
  ⏳ Waiting for AI response...
  ✓ AI response received
  📝 Response preview: Protocol 1203: Diabetic Emergencies...
  📸 Screenshot saved: screenshots/chat-test/xxx-protocol-1203-response.png
✓ Protocol 1203 Query

🧪 Step 12-13: Test Base Contact Criteria Query
  💬 Sending message: "base contact criteria"
  ✓ Found input field with selector: input[type="text"]
  ✓ Message sent
  ⏳ Waiting for AI response...
  ✓ AI response received
  📝 Response preview: Base contact criteria (Ref. 624)...
  📸 Screenshot saved: screenshots/chat-test/xxx-base-contact-response.png
✓ Base Contact Criteria Query

================================================================================
📊 TEST REPORT: AI Chat Functionality
================================================================================
Test: E2E Test Agent 6: AI Chat Functionality
Timestamp: 2026-01-03T07:00:00.000Z
Total Steps: 6
Passed: 6
Failed: 0
Success Rate: 100.0%
================================================================================

Detailed Results:

1. ✓ Login - PASS
   Successfully logged in

2. ✓ Navigate to Chat - PASS
   Chat page loaded successfully
   Screenshot: screenshots/chat-test/xxx-chat-page-initial.png

3. ✓ Verify Initial Message - PASS
   Found "Protocol-Guide Active" message

4. ✓ Sepsis Query - PASS
   Response contains sepsis-related content
   Response: Protocol TP-1204: Sepsis Management involves...

5. ✓ Protocol 1203 Query - PASS
   Response contains Diabetic Emergencies content
   Response: Protocol 1203 addresses diabetic emergencies including...

6. ✓ Base Contact Criteria Query - PASS
   Response contains expected citation or base contact information
   Response: Base hospital contact criteria (Ref. 624) include...


📄 Full report saved to: screenshots/chat-test/test-report.json
```

## Troubleshooting

### "Invalid email or password"
- Verify user exists in Supabase database
- Check credentials in CONFIG object
- Ensure user has chat access permissions

### "Chat input field not found"
- Check screenshot in `screenshots/chat-test/`
- Verify you're on the chat page (not redirected to login)
- Check console for debug output showing available inputs

### "Typing indicator timeout"
- AI response may be slow (increase timeout in CONFIG)
- Check network connectivity
- Verify Gemini API key is configured

### Test hangs
- Default timeout is 30s per AI query
- Total test time: ~2 minutes
- Check browser window (headless: false) for UI issues

## Configuration Options

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:3000',        // App URL
  testUser: { email: '...', password: '...' },  // Credentials
  screenshotDir: path.join(__dirname, 'screenshots', 'chat-test'),
  timeout: 30000,      // AI response timeout (ms)
  shortTimeout: 5000   // UI interaction timeout (ms)
};
```

## Browser Options

**Visible Browser** (current):
```javascript
headless: false
```

**Headless for CI/CD**:
```javascript
headless: true
```

## CI/CD Integration

```yaml
# .github/workflows/e2e-chat-test.yml
name: E2E Chat Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install puppeteer
      - run: npm start & # Start app in background
      - run: sleep 10 # Wait for app to start
      - run: node e2e-chat-test.js
        env:
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

## Output Files

- **Screenshots**: `screenshots/chat-test/*.png`
- **JSON Report**: `screenshots/chat-test/test-report.json`
- **Console Output**: Real-time in terminal

## Success Criteria

- ✅ All 6 steps pass
- ✅ Login completes successfully
- ✅ Chat interface accessible
- ✅ All 3 AI queries return valid responses
- ✅ Responses contain expected protocol references
- ✅ No JavaScript errors in console

---

**Ready to Test?** Update credentials and run: `node e2e-chat-test.js`
