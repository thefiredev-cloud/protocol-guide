import { dirname, join } from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = dirname(currentFilename);

const viewports = [
  {
    name: 'desktop',
    width: 1280,
    height: 900,
    filename: 'elite-field-desktop.png'
  },
  {
    name: 'tablet',
    width: 1024,
    height: 768,
    filename: 'elite-field-tablet.png'
  },
  {
    name: 'mobile',
    width: 375,
    height: 812,
    filename: 'elite-field-mobile.png'
  }
];

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const url = 'http://localhost:3000/';
    const screenshotsDir = join(currentDirname, '..', 'screenshots');

    console.log(`\nNavigating to ${url}...\n`);

    for (const viewport of viewports) {
      console.log(`Taking ${viewport.name} screenshot (${viewport.width}x${viewport.height})...`);

      // Set viewport
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1
      });

      // Navigate to the page
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait a bit more for any animations or dynamic content
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot
      const screenshotPath = join(screenshotsDir, viewport.filename);
      await page.screenshot({
        path: screenshotPath,
        fullPage: false
      });

      console.log(`  Saved: ${screenshotPath}`);

      // Analyze the page layout
      const analysis = await page.evaluate(() => {
        const results = {
          hasLeftSidebar: false,
          hasRightQuickbar: false,
          hasTopToolbar: false,
          hasBottomStatusbar: false,
          leftSidebarColor: null,
          rightQuickbarColor: null,
          topToolbarColor: null,
          bottomStatusbarColor: null,
          accordionSections: [],
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };

        // Check for left sidebar
        const leftSidebar = document.querySelector('[class*="sidebar"]') ||
                           document.querySelector('aside') ||
                           document.querySelector('[data-testid*="sidebar"]');
        if (leftSidebar) {
          results.hasLeftSidebar = true;
          const styles = window.getComputedStyle(leftSidebar);
          results.leftSidebarColor = styles.backgroundColor;
        }

        // Check for right quickbar
        const rightQuickbar = document.querySelector('[class*="quickbar"]') ||
                             document.querySelector('[data-testid*="quickbar"]');
        if (rightQuickbar) {
          results.hasRightQuickbar = true;
          const styles = window.getComputedStyle(rightQuickbar);
          results.rightQuickbarColor = styles.backgroundColor;
        }

        // Check for top toolbar
        const topToolbar = document.querySelector('header') ||
                          document.querySelector('[class*="toolbar"]') ||
                          document.querySelector('[class*="navbar"]');
        if (topToolbar) {
          results.hasTopToolbar = true;
          const styles = window.getComputedStyle(topToolbar);
          results.topToolbarColor = styles.backgroundColor;
        }

        // Check for bottom statusbar
        const bottomStatusbar = document.querySelector('footer') ||
                               document.querySelector('[class*="statusbar"]') ||
                               document.querySelector('[class*="status-bar"]');
        if (bottomStatusbar) {
          results.hasBottomStatusbar = true;
          const styles = window.getComputedStyle(bottomStatusbar);
          results.bottomStatusbarColor = styles.backgroundColor;
        }

        // Check for accordion sections
        const accordions = document.querySelectorAll('[class*="accordion"]') ||
                          document.querySelectorAll('details');
        results.accordionSections = Array.from(accordions).map((acc, i) => ({
          index: i,
          expanded: acc.hasAttribute('open') || acc.classList.contains('expanded')
        }));

        return results;
      });

      console.log(`  Analysis for ${viewport.name}:`);
      console.log(`    - Left Sidebar: ${analysis.hasLeftSidebar ? 'Yes' : 'No'} ${analysis.leftSidebarColor ? `(${analysis.leftSidebarColor})` : ''}`);
      console.log(`    - Right Quickbar: ${analysis.hasRightQuickbar ? 'Yes' : 'No'} ${analysis.rightQuickbarColor ? `(${analysis.rightQuickbarColor})` : ''}`);
      console.log(`    - Top Toolbar: ${analysis.hasTopToolbar ? 'Yes' : 'No'} ${analysis.topToolbarColor ? `(${analysis.topToolbarColor})` : ''}`);
      console.log(`    - Bottom Statusbar: ${analysis.hasBottomStatusbar ? 'Yes' : 'No'} ${analysis.bottomStatusbarColor ? `(${analysis.bottomStatusbarColor})` : ''}`);
      console.log(`    - Accordion Sections: ${analysis.accordionSections.length}`);
      console.log('');
    }

    console.log('All screenshots captured successfully!');

  } catch (error) {
    console.error('Error taking screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);
