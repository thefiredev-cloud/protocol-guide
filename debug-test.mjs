import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: { width: 1400, height: 900 },
  protocolTimeout: 60000
});

const page = await browser.newPage();

// Capture console logs
page.on('console', msg => {
  if (msg.text().includes('Query:') || msg.text().includes('Top matches:')) {
    console.log('BROWSER:', msg.text());
  }
});

// Login
await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle0' });
await page.type('#email', 'tanner@thefiredev.com', { delay: 20 });
await page.type('#password', 'jackie99!', { delay: 20 });
await page.click('button[type="submit"]');
await page.waitForNavigation({ waitUntil: 'networkidle0' });

// Go to Chat
await page.goto('http://localhost:3000/#/chat', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Test Adenosine
console.log('Sending query...');
await page.type('input[type="text"]', 'Adenosine dosing');
await page.keyboard.press('Enter');
await new Promise(r => setTimeout(r, 15000));
await page.screenshot({ path: '/tmp/debug-adenosine.png' });

console.log('Done!');
await new Promise(() => {});
