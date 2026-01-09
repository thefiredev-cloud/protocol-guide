/**
 * Phase 1 Smoke Test for ProtocolGuide Chat
 * Tests 5 critical queries against http://localhost:3000/#/chat
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, '../screenshots/smoke-test');
const BASE_URL = 'http://localhost:3000/#/chat';
const RESPONSE_TIMEOUT = 15000; // 15 seconds

// Ensure screenshots directory exists
try {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
} catch (err) {
  // Directory already exists
}

const TEST_QUERIES = [
  {
    id: 'policy-830',
    query: 'policy 830',
    expected: 'exact protocol match',
    description: 'Should return exact protocol match'
  },
  {
    id: 'lams',
    query: 'LAMS',
    expected: 'stroke scale protocols (521/522)',
    description: 'Should return stroke scale protocols'
  },
  {
    id: 'epi-dose',
    query: 'epi dose',
    expected: 'epinephrine dosing info',
    description: 'Should return epinephrine dosing info'
  },
  {
    id: 'chest-pain',
    query: 'chest pain',
    expected: 'cardiac protocols',
    description: 'Should return cardiac protocols'
  },
  {
    id: 'tp-1201',
    query: '1201',
    expected: 'TP-1201 General Assessment',
    description: 'Should return TP-1201 General Assessment'
  }
];

// Helper function to wait (replaces deprecated waitForTimeout)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to wait for response
async function waitForResponse(page, timeout = RESPONSE_TIMEOUT) {
  const startTime = Date.now();

  // Wait for loading indicator to disappear
  try {
    await page.waitForSelector('div.animate-bounce', { timeout: 2000 });
    await page.waitForSelector('div.animate-bounce', { hidden: true, timeout });
  } catch (err) {
    // Loading indicator might not appear for fast responses
    console.log('  Note: No loading indicator detected');
  }

  // Wait a bit for content to settle
  await delay(1000);

  const elapsed = Date.now() - startTime;
  return elapsed;
}

// Extract response data from page
async function extractResponseData(page) {
  return await page.evaluate(() => {
    // Find all message divs
    const messages = Array.from(document.querySelectorAll('div.whitespace-pre-wrap'));

    if (messages.length === 0) {
      return { text: '', confidence: null, hasCitations: false };
    }

    // Get the last assistant message (skip user messages)
    const lastMessage = messages[messages.length - 1];
    const text = lastMessage.textContent || '';

    // Look for confidence badge (HIGH/MEDIUM/LOW)
    const confidenceBadges = document.querySelectorAll('span');
    let confidence = null;
    for (const badge of confidenceBadges) {
      const badgeText = badge.textContent?.trim().toUpperCase();
      if (['HIGH', 'MEDIUM', 'LOW'].includes(badgeText)) {
        confidence = badgeText;
        break;
      }
    }

    // Check for citations (protocol references like "Reference 830" or "Protocol 521")
    const hasCitations = /(?:Reference|Protocol|Policy|TP-)\s*\d+/i.test(text);

    return {
      text: text.slice(0, 500), // First 500 chars
      confidence,
      hasCitations,
      messageCount: messages.length
    };
  });
}

async function runSmokeTest() {
  console.log('='.repeat(80));
  console.log('Phase 1 Smoke Test - ProtocolGuide Chat');
  console.log('='.repeat(80));
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Test Queries: ${TEST_QUERIES.length}`);
  console.log(`Response Timeout: ${RESPONSE_TIMEOUT}ms`);
  console.log('='.repeat(80));
  console.log('');

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 720
    }
  });

  const results = [];

  try {
    const page = await browser.newPage();

    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`  [Browser Error] ${msg.text()}`);
      }
    });

    for (let i = 0; i < TEST_QUERIES.length; i++) {
      const test = TEST_QUERIES[i];
      console.log(`Test ${i + 1}/${TEST_QUERIES.length}: ${test.query}`);
      console.log('-'.repeat(80));

      try {
        // Navigate to chat page
        console.log(`  Navigating to ${BASE_URL}...`);
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 });
        await delay(1500); // Let page settle

        // Find chat input
        console.log('  Locating chat input...');
        let inputSelector = null;
        const possibleSelectors = [
          'input[placeholder*="Query"]',
          'input[placeholder*="query"]',
          'input[type="text"]',
          'textarea[placeholder*="Query"]',
          'textarea[placeholder*="query"]'
        ];

        for (const selector of possibleSelectors) {
          const element = await page.$(selector);
          if (element) {
            const isVisible = await element.isVisible();
            if (isVisible) {
              inputSelector = selector;
              console.log(`  Found input: ${selector}`);
              break;
            }
          }
        }

        if (!inputSelector) {
          throw new Error('Could not find chat input field');
        }

        // Clear and type query
        console.log(`  Typing query: "${test.query}"`);
        await page.click(inputSelector);
        await page.evaluate(selector => {
          const input = document.querySelector(selector);
          if (input) input.value = '';
        }, inputSelector);
        await page.type(inputSelector, test.query);

        // Take screenshot before sending
        const screenshotBefore = join(SCREENSHOTS_DIR, `${test.id}-before.png`);
        await page.screenshot({ path: screenshotBefore, fullPage: true });
        console.log(`  Screenshot (before): ${screenshotBefore}`);

        // Submit query
        console.log('  Submitting query...');
        await page.keyboard.press('Enter');

        // Wait for response
        console.log('  Waiting for response...');
        const responseTime = await waitForResponse(page);
        console.log(`  Response received in ${responseTime}ms`);

        // Extract response data
        const responseData = await extractResponseData(page);

        // Take screenshot after response
        const screenshotAfter = join(SCREENSHOTS_DIR, `${test.id}-after.png`);
        await page.screenshot({ path: screenshotAfter, fullPage: true });
        console.log(`  Screenshot (after): ${screenshotAfter}`);

        // Build result
        const result = {
          testId: test.id,
          query: test.query,
          description: test.description,
          expected: test.expected,
          status: 'PASS',
          responseReceived: responseData.text.length > 0,
          responseTime,
          responsePreview: responseData.text.slice(0, 200),
          confidence: responseData.confidence,
          hasCitations: responseData.hasCitations,
          screenshotBefore,
          screenshotAfter,
          messageCount: responseData.messageCount
        };

        results.push(result);

        console.log('  Result:');
        console.log(`    Response: ${result.responseReceived ? 'YES' : 'NO'}`);
        console.log(`    Confidence: ${result.confidence || 'N/A'}`);
        console.log(`    Citations: ${result.hasCitations ? 'YES' : 'NO'}`);
        console.log(`    Preview: ${result.responsePreview.substring(0, 100)}...`);
        console.log('');

      } catch (error) {
        console.error(`  ERROR: ${error.message}`);

        const result = {
          testId: test.id,
          query: test.query,
          description: test.description,
          expected: test.expected,
          status: 'FAIL',
          error: error.message,
          responseReceived: false,
          responseTime: 0,
          responsePreview: '',
          confidence: null,
          hasCitations: false
        };

        results.push(result);
        console.log('');
      }
    }

  } finally {
    await browser.close();
  }

  // Generate report
  console.log('='.repeat(80));
  console.log('Test Summary');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('');

  // Detailed results
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.testId} - ${result.status}`);
    console.log(`   Query: "${result.query}"`);
    console.log(`   Expected: ${result.expected}`);

    if (result.status === 'PASS') {
      console.log(`   Response: ${result.responseReceived ? 'YES' : 'NO'} (${result.responseTime}ms)`);
      console.log(`   Confidence: ${result.confidence || 'N/A'}`);
      console.log(`   Citations: ${result.hasCitations ? 'YES' : 'NO'}`);
      console.log(`   Preview: ${result.responsePreview.substring(0, 150)}...`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  });

  // Save JSON report
  const reportPath = join(SCREENSHOTS_DIR, 'test-report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Full report saved to: ${reportPath}`);
  console.log('='.repeat(80));

  return results;
}

// Run the test
runSmokeTest()
  .then(results => {
    const failed = results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
