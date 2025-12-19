const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to desktop (1280x900)
    await page.setViewport({ width: 1280, height: 900 });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: ['networkidle2', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait a bit more for any dynamic content to render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get page dimensions and content info
    const pageInfo = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        bodyWidth: body.offsetWidth,
        bodyHeight: body.offsetHeight,
        htmlWidth: html.offsetWidth,
        htmlHeight: html.offsetHeight,
        bodyClasses: body.className,
        htmlClasses: html.className
      };
    });

    console.log('Page info:', pageInfo);

    // Take screenshot
    const screenshotPath = '/Users/tanner-osterkamp/Medic-Bot/screenshots/elite-field-grid-test.png';
    console.log(`Taking screenshot and saving to ${screenshotPath}...`);

    await page.screenshot({
      path: screenshotPath,
      fullPage: false
    });

    console.log('Screenshot saved successfully!');

    // Check for key elements
    const elementInfo = await page.evaluate(() => {
      const elements = {
        toolbar: !!document.querySelector('[data-testid="toolbar"]') || !!document.querySelector('header') || !!document.querySelector('.toolbar'),
        sidebar: !!document.querySelector('[data-testid="sidebar"]') || !!document.querySelector('.sidebar'),
        quickbar: !!document.querySelector('[data-testid="quickbar"]') || !!document.querySelector('.quickbar'),
        statusbar: !!document.querySelector('[data-testid="statusbar"]') || !!document.querySelector('footer') || !!document.querySelector('.statusbar'),
        gridLayout: !!document.querySelector('[data-testid="grid-layout"]') || !!document.querySelector('.grid-layout'),
        navyElements: Array.from(document.querySelectorAll('*')).filter(el => {
          const color = window.getComputedStyle(el).backgroundColor;
          return color.includes('26') || color.includes('1a') || color.includes('color(srgb 0.104 0.137 0.196)');
        }).length
      };

      // Look for containers
      const containers = {
        mainContent: !!document.querySelector('main') || !!document.querySelector('[role="main"]'),
        leftPanel: !!document.querySelector('[data-testid="left-panel"]'),
        centerPanel: !!document.querySelector('[data-testid="center-panel"]'),
        rightPanel: !!document.querySelector('[data-testid="right-panel"]')
      };

      return { elements, containers };
    });

    console.log('\n=== PAGE ANALYSIS ===');
    console.log('Elements found:', elementInfo.elements);
    console.log('Containers found:', elementInfo.containers);

    await browser.close();

  } catch (error) {
    console.error('Error taking screenshot:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();
