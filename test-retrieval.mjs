import puppeteer from 'puppeteer';

// Connect to existing browser
const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://127.0.0.1:59474/devtools/browser/3df38691-4bb4-452f-a836-e931d729bb56'
});

const pages = await browser.pages();
const page = pages[0];

// Go to Chat
await page.goto('http://localhost:3000/#/chat', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Test queries
const queries = [
  'What is the dosing for Adenosine?',
  'Sepsis protocol fluid resuscitation',
  'Intubation procedure steps'
];

let testNum = 1;
for (const query of queries) {
  console.log('\n=== Testing: "' + query + '" ===');

  // Type query
  await page.type('input[type="text"]', query);
  await page.click('button:last-of-type'); // Send button

  // Wait for response
  await new Promise(r => setTimeout(r, 10000));

  // Screenshot
  const filename = '/tmp/test-query-' + testNum + '.png';
  await page.screenshot({ path: filename, fullPage: true });
  console.log('Screenshot saved: ' + filename);

  testNum++;

  // Clear for next query - reload chat
  await page.goto('http://localhost:3000/#/chat', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
}

console.log('\n=== Retrieval tests complete ===');
