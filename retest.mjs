import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: { width: 1400, height: 900 },
  protocolTimeout: 60000
});

const page = await browser.newPage();

// Login
await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle0' });
await page.type('#email', 'tanner@thefiredev.com', { delay: 20 });
await page.type('#password', 'jackie99!', { delay: 20 });
await page.click('button[type="submit"]');
await page.waitForNavigation({ waitUntil: 'networkidle0' });

// Go to Chat
await page.goto('http://localhost:3000/#/chat', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Test Adenosine again
console.log('Testing: Adenosine dosing');
await page.type('input[type="text"]', 'What is the dosing for Adenosine?');
await page.keyboard.press('Enter');
await new Promise(r => setTimeout(r, 12000));
await page.screenshot({ path: '/tmp/retest-adenosine.png' });
console.log('Screenshot: /tmp/retest-adenosine.png');

console.log('Done! Browser staying open.');
await new Promise(() => {});
