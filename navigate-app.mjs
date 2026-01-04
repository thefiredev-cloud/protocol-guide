import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ 
  headless: false,
  defaultViewport: { width: 1400, height: 900 },
  args: ['--window-size=1400,900']
});

const page = await browser.newPage();

// Go to login
await page.goto('http://localhost:3000/#/login', { waitUntil: 'networkidle0' });
await page.waitForSelector('#email');

// Fill and submit
await page.type('#email', 'tanner@thefiredev.com', { delay: 30 });
await page.type('#password', 'jackie99!', { delay: 30 });
await page.click('button[type="submit"]');

// Wait for navigation to Browse page
await page.waitForNavigation({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

// Screenshot Browse page
await page.screenshot({ path: '/tmp/browse-page.png' });
console.log('Browse page screenshot saved');

// Click on Chat in bottom nav
await page.evaluate(() => {
  const links = document.querySelectorAll('a');
  for (const link of links) {
    if (link.href.includes('chat')) {
      link.click();
      break;
    }
  }
});

await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: '/tmp/chat-page.png' });
console.log('Chat page screenshot saved');

// Keep browser open for user to see
console.log('Browser open - you can interact with it now');
