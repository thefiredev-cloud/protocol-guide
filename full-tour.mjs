import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ 
  headless: false,
  defaultViewport: { width: 1400, height: 900 }
});

const page = await browser.newPage();

// 1. Login
console.log('Logging in...');
await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle0' });
await page.type('#email', 'tanner@thefiredev.com', { delay: 20 });
await page.type('#password', 'jackie99!', { delay: 20 });
await page.click('button[type="submit"]');
await page.waitForNavigation({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1000));

// 2. Browse page
console.log('On Browse page');
await page.screenshot({ path: '/tmp/tour-browse.png' });

// 3. Go to Chat via URL
console.log('Going to Chat...');
await page.goto('http://localhost:3000/#/chat', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: '/tmp/tour-chat.png' });

// 4. Go to Hospitals
console.log('Going to Hospitals...');
await page.goto('http://localhost:3000/#/hospitals', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: '/tmp/tour-hospitals.png' });

// 5. Go to Account
console.log('Going to Account...');
await page.goto('http://localhost:3000/#/account', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: '/tmp/tour-account.png' });

console.log('Tour complete! Browser staying open.');
