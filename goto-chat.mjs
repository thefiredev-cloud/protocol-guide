import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ 
  headless: false,
  defaultViewport: { width: 1400, height: 900 }
});

const page = await browser.newPage();
await page.goto('http://localhost:3000/#/chat', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: '/tmp/chat-direct.png' });
console.log('Chat page captured');
