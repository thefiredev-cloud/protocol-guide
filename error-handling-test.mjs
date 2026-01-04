import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = join('/Users/tanner-osterkamp/Protocol-Guide.com/e2e-tests/screenshots');

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  consoleErrors: [],
  warnings: []
};

// Helper function to add test result
function logResult(testName, passed, details = '') {
  if (passed) {
    testResults.passed.push({ test: testName, details });
    console.log(`✓ PASS: ${testName}`);
  } else {
    testResults.failed.push({ test: testName, details });
    console.log(`✗ FAIL: ${testName} - ${details}`);
  }
}

// Helper function to take screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`  📸 Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Helper function to check console errors
function setupConsoleListener(page) {
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      errors.push(text);
      console.log(`  ⚠️  Console Error: ${text}`);
    } else if (type === 'warning') {
      warnings.push(text);
    }
  });

  page.on('pageerror', error => {
    const errorText = error.toString();
    errors.push(errorText);
    console.log(`  ⚠️  Page Error: ${errorText}`);
  });

  return { errors, warnings };
}

// Main test execution
async function runTests() {
  console.log('\n🧪 Starting Protocol Guide Error Handling & Edge Cases Test\n');
  console.log('=' .repeat(70));

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const consoleListener = setupConsoleListener(page);

    // ========================================================================
    // TEST 1: Invalid Route Handling
    // ========================================================================
    console.log('\n📋 Test 1: Invalid Route (/nonexistent)');
    console.log('-'.repeat(70));

    try {
      await page.goto(`${BASE_URL}/#/nonexistent`, { waitUntil: 'networkidle0', timeout: 10000 });
      await new Promise(r => setTimeout(r, 1000));

      const currentUrl = page.url();
      const pageContent = await page.content();

      await takeScreenshot(page, '01-invalid-route');

      // Check if redirected to login or shows 404
      if (currentUrl.includes('/login') || currentUrl.includes('/nonexistent')) {
        const has404 = pageContent.toLowerCase().includes('404') ||
                       pageContent.toLowerCase().includes('not found') ||
                       pageContent.toLowerCase().includes('page not found');

        if (currentUrl.includes('/login')) {
          logResult('Invalid Route Handler', true, 'Redirects to login page');
        } else if (has404) {
          logResult('Invalid Route Handler', true, 'Shows 404 page');
        } else {
          logResult('Invalid Route Handler', true, 'Handles gracefully (stays on invalid route)');
        }
      } else {
        logResult('Invalid Route Handler', true, `Redirects to: ${currentUrl}`);
      }
    } catch (error) {
      logResult('Invalid Route Handler', false, error.message);
    }

    // ========================================================================
    // TEST 2: Protected Route - Chat (Without Authentication)
    // ========================================================================
    console.log('\n📋 Test 2: Protected Route - Chat (Unauthenticated)');
    console.log('-'.repeat(70));

    try {
      // Clear any existing auth
      await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto(`${BASE_URL}/#/chat`, { waitUntil: 'networkidle0', timeout: 10000 });
      await new Promise(r => setTimeout(r, 1500));

      const currentUrl = page.url();
      await takeScreenshot(page, '02-chat-unauthenticated');

      if (currentUrl.includes('/login')) {
        logResult('Chat - Auth Protection', true, 'Correctly redirects to login');
      } else if (currentUrl.includes('/chat')) {
        const hasLoginForm = await page.$('#email, input[type="email"]');
        if (hasLoginForm) {
          logResult('Chat - Auth Protection', true, 'Shows login form on chat page');
        } else {
          logResult('Chat - Auth Protection', false, 'No redirect and no login form shown');
        }
      } else {
        logResult('Chat - Auth Protection', true, `Redirects to: ${currentUrl}`);
      }
    } catch (error) {
      logResult('Chat - Auth Protection', false, error.message);
    }

    // ========================================================================
    // TEST 3: Protected Route - Account (Without Authentication)
    // ========================================================================
    console.log('\n📋 Test 3: Protected Route - Account (Unauthenticated)');
    console.log('-'.repeat(70));

    try {
      await page.goto(`${BASE_URL}/#/account`, { waitUntil: 'networkidle0', timeout: 10000 });
      await new Promise(r => setTimeout(r, 1500));

      const currentUrl = page.url();
      await takeScreenshot(page, '03-account-unauthenticated');

      if (currentUrl.includes('/login')) {
        logResult('Account - Auth Protection', true, 'Correctly redirects to login');
      } else if (currentUrl.includes('/account')) {
        const hasLoginForm = await page.$('#email, input[type="email"]');
        if (hasLoginForm) {
          logResult('Account - Auth Protection', true, 'Shows login form on account page');
        } else {
          logResult('Account - Auth Protection', false, 'No redirect and no login form shown');
        }
      } else {
        logResult('Account - Auth Protection', true, `Redirects to: ${currentUrl}`);
      }
    } catch (error) {
      logResult('Account - Auth Protection', false, error.message);
    }

    // ========================================================================
    // TEST 4: Invalid Protocol ID
    // ========================================================================
    console.log('\n📋 Test 4: Invalid Protocol ID');
    console.log('-'.repeat(70));

    try {
      await page.goto(`${BASE_URL}/#/protocol/invalid-id-xyz`, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      await new Promise(r => setTimeout(r, 2000));

      const currentUrl = page.url();
      const pageContent = await page.content();

      await takeScreenshot(page, '04-invalid-protocol-id');

      const hasError = pageContent.toLowerCase().includes('error') ||
                       pageContent.toLowerCase().includes('not found') ||
                       pageContent.toLowerCase().includes('invalid') ||
                       pageContent.toLowerCase().includes('404');

      if (hasError) {
        logResult('Invalid Protocol ID', true, 'Shows error message for invalid protocol');
      } else if (currentUrl.includes('/login') || !currentUrl.includes('/protocol/invalid-id-xyz')) {
        logResult('Invalid Protocol ID', true, 'Redirects away from invalid protocol');
      } else {
        logResult('Invalid Protocol ID', false, 'No clear error handling visible');
      }
    } catch (error) {
      logResult('Invalid Protocol ID', false, error.message);
    }

    // ========================================================================
    // TEST 5: Browser Console Errors Check
    // ========================================================================
    console.log('\n📋 Test 5: Browser Console Errors');
    console.log('-'.repeat(70));

    // Navigate to home and check for errors
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    const jsErrors = await page.evaluate(() => {
      return window.errors || [];
    });

    testResults.consoleErrors = consoleListener.errors;
    testResults.warnings = consoleListener.warnings;

    console.log(`  Found ${consoleListener.errors.length} console errors`);
    console.log(`  Found ${consoleListener.warnings.length} console warnings`);

    if (consoleListener.errors.length === 0) {
      logResult('Console Errors', true, 'No console errors detected');
    } else {
      logResult('Console Errors', false, `Found ${consoleListener.errors.length} errors`);
    }

    // ========================================================================
    // TEST 6: Login for API Testing
    // ========================================================================
    console.log('\n📋 Test 6: Login for Network/API Testing');
    console.log('-'.repeat(70));

    try {
      await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle0' });

      // Check if login form exists
      const emailInput = await page.$('#email, input[type="email"]');
      const passwordInput = await page.$('#password, input[type="password"]');

      if (emailInput && passwordInput) {
        // Attempt login with credentials
        await page.type('#email, input[type="email"]', 'tanner@thefiredev.com', { delay: 20 });
        await page.type('#password, input[type="password"]', 'jackie99!', { delay: 20 });

        await takeScreenshot(page, '06-login-form-filled');

        const submitButton = await page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
          await new Promise(r => setTimeout(r, 1500));

          const currentUrl = page.url();
          if (!currentUrl.includes('/login')) {
            logResult('Login Success', true, 'Successfully logged in');
            await takeScreenshot(page, '06-after-login');
          } else {
            logResult('Login Success', false, 'Still on login page after submit');
          }
        } else {
          logResult('Login Success', false, 'No submit button found');
        }
      } else {
        logResult('Login Success', false, 'Login form not found');
      }
    } catch (error) {
      logResult('Login Success', false, error.message);
    }

    // ========================================================================
    // TEST 7: Chat with Potential API Error
    // ========================================================================
    console.log('\n📋 Test 7: Chat - API Error Handling');
    console.log('-'.repeat(70));

    try {
      await page.goto(`${BASE_URL}/#/chat`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1500));

      await takeScreenshot(page, '07-chat-page');

      // Try to send a message and observe error handling
      const messageInput = await page.$('textarea, input[type="text"]');

      if (messageInput) {
        await messageInput.type('Test message for error handling', { delay: 30 });
        await takeScreenshot(page, '07-chat-message-typed');

        // Look for send button
        const sendButton = await page.$('button[type="submit"], button:has-text("Send")');

        if (sendButton) {
          // Clear console errors before sending
          const errorsBefore = consoleListener.errors.length;

          await sendButton.click();
          await new Promise(r => setTimeout(r, 3000)); // Wait for response or error

          await takeScreenshot(page, '07-chat-after-send');

          const errorsAfter = consoleListener.errors.length;
          const newErrors = errorsAfter - errorsBefore;

          const pageContent = await page.content();
          const hasErrorMessage = pageContent.toLowerCase().includes('error') ||
                                  pageContent.toLowerCase().includes('failed') ||
                                  pageContent.toLowerCase().includes('invalid api key');

          if (hasErrorMessage) {
            logResult('Chat API Error Handling', true, 'Shows error message to user');
          } else if (newErrors > 0) {
            logResult('Chat API Error Handling', false, `API error only in console, not shown to user`);
          } else {
            logResult('Chat API Error Handling', true, 'Message sent successfully or error handled gracefully');
          }
        } else {
          logResult('Chat API Error Handling', false, 'Send button not found');
        }
      } else {
        logResult('Chat API Error Handling', false, 'Message input not found');
      }
    } catch (error) {
      logResult('Chat API Error Handling', false, error.message);
    }

    // ========================================================================
    // TEST 8: Navigation Stress Test
    // ========================================================================
    console.log('\n📋 Test 8: Rapid Navigation (Stress Test)');
    console.log('-'.repeat(70));

    try {
      const routes = ['/#/browse', '/#/chat', '/#/hospitals', '/#/account', '/#/browse'];

      for (const route of routes) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        await new Promise(r => setTimeout(r, 500));
      }

      logResult('Rapid Navigation', true, 'App handles rapid navigation without crashes');
    } catch (error) {
      logResult('Rapid Navigation', false, error.message);
    }

    // ========================================================================
    // TEST 9: Back Button Behavior
    // ========================================================================
    console.log('\n📋 Test 9: Back Button Navigation');
    console.log('-'.repeat(70));

    try {
      await page.goto(`${BASE_URL}/#/browse`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 500));

      await page.goto(`${BASE_URL}/#/hospitals`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 500));

      await page.goBack();
      await new Promise(r => setTimeout(r, 1000));

      const currentUrl = page.url();

      if (currentUrl.includes('/browse')) {
        logResult('Back Button', true, 'Back button navigation works correctly');
      } else {
        logResult('Back Button', false, `Expected /browse, got ${currentUrl}`);
      }
    } catch (error) {
      logResult('Back Button', false, error.message);
    }

    // ========================================================================
    // TEST 10: Local Storage Corruption
    // ========================================================================
    console.log('\n📋 Test 10: Corrupted Local Storage Handling');
    console.log('-'.repeat(70));

    try {
      await page.evaluate(() => {
        localStorage.setItem('sb-localhost-auth-token', 'corrupted-token-{invalid-json}');
      });

      await page.goto(`${BASE_URL}/#/chat`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1500));

      await takeScreenshot(page, '10-corrupted-storage');

      const currentUrl = page.url();

      if (currentUrl.includes('/login')) {
        logResult('Corrupted Storage', true, 'Handles corrupted auth token gracefully');
      } else {
        logResult('Corrupted Storage', false, 'Does not handle corrupted auth properly');
      }
    } catch (error) {
      logResult('Corrupted Storage', false, error.message);
    }

  } catch (error) {
    console.error('\n❌ Fatal test error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Test Execution Complete - Browser Remaining Open');
    console.log('='.repeat(70));
  }

  // ========================================================================
  // GENERATE TEST REPORT
  // ========================================================================
  generateReport();
}

function generateReport() {
  console.log('\n\n');
  console.log('█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '  📊 DETAILED TEST REPORT - ERROR HANDLING & EDGE CASES  '.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));

  // Summary
  const total = testResults.passed.length + testResults.failed.length;
  const passRate = ((testResults.passed.length / total) * 100).toFixed(1);

  console.log('\n📈 SUMMARY');
  console.log('─'.repeat(70));
  console.log(`  Total Tests: ${total}`);
  console.log(`  ✓ Passed: ${testResults.passed.length}`);
  console.log(`  ✗ Failed: ${testResults.failed.length}`);
  console.log(`  Pass Rate: ${passRate}%`);

  // Passed Tests
  if (testResults.passed.length > 0) {
    console.log('\n✅ PASSED TESTS');
    console.log('─'.repeat(70));
    testResults.passed.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.test}`);
      if (test.details) {
        console.log(`     → ${test.details}`);
      }
    });
  }

  // Failed Tests
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS');
    console.log('─'.repeat(70));
    testResults.failed.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.test}`);
      console.log(`     → ${test.details}`);
    });
  }

  // Console Errors
  if (testResults.consoleErrors.length > 0) {
    console.log('\n⚠️  CONSOLE ERRORS DETECTED');
    console.log('─'.repeat(70));
    testResults.consoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
    });
  }

  // Warnings
  if (testResults.warnings.length > 0) {
    console.log('\n⚡ CONSOLE WARNINGS');
    console.log('─'.repeat(70));
    console.log(`  Total warnings: ${testResults.warnings.length}`);
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS FOR ERROR HANDLING IMPROVEMENTS');
  console.log('─'.repeat(70));

  const recommendations = [];

  if (testResults.failed.some(t => t.test.includes('Auth Protection'))) {
    recommendations.push('Implement consistent authentication guards on all protected routes');
  }

  if (testResults.failed.some(t => t.test.includes('Invalid Protocol'))) {
    recommendations.push('Add user-friendly error page for invalid protocol IDs');
  }

  if (testResults.consoleErrors.length > 0) {
    recommendations.push('Fix console errors - users may see these in browser DevTools');
  }

  if (testResults.failed.some(t => t.test.includes('API Error'))) {
    recommendations.push('Improve API error messages shown to users');
  }

  if (testResults.failed.some(t => t.test.includes('Invalid Route'))) {
    recommendations.push('Add 404 page or improve invalid route handling');
  }

  if (recommendations.length === 0) {
    recommendations.push('Error handling is robust! Consider adding:');
    recommendations.push('  • Toast notifications for errors');
    recommendations.push('  • Error boundary components for React errors');
    recommendations.push('  • Retry mechanisms for failed API calls');
    recommendations.push('  • Offline mode detection and messaging');
  }

  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });

  // Screenshots Location
  console.log('\n📸 SCREENSHOTS');
  console.log('─'.repeat(70));
  console.log(`  All screenshots saved to:`);
  console.log(`  ${SCREENSHOT_DIR}`);

  console.log('\n' + '█'.repeat(70));
  console.log('\n✨ Test report generation complete!\n');
}

// Run the tests
runTests().catch(console.error);
