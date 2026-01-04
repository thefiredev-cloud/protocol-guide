import puppeteer from 'puppeteer';

// Connect to existing browser or launch new one
const browser = await puppeteer.launch({ 
  headless: false,
  defaultViewport: null,
  args: ['--start-maximized']
});

const page = await browser.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

// Take screenshot
await page.screenshot({ path: '/tmp/app-browse.png', fullPage: false });
console.log('Screenshot saved to /tmp/app-browse.png');

// Navigate to Chat
await page.click('a[href="#/chat"], button:has-text("Chat"), [href*="chat"]');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/app-chat.png', fullPage: false });
console.log('Chat screenshot saved');
