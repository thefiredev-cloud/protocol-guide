#!/usr/bin/env node

/**
 * Screenshot Script for Medic-Bot Application
 *
 * This script uses Puppeteer to take screenshots of all pages
 * in both desktop and mobile viewports.
 */

import { mkdir } from 'fs/promises';
import { join } from 'path';
import { dirname } from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

/* eslint-disable @typescript-eslint/naming-convention */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/* eslint-enable @typescript-eslint/naming-convention */

const BASE_URL = 'http://localhost:3002';
const SCREENSHOT_DIR = join(__dirname, '..', 'screenshots');

// Pages to screenshot
const PAGES = [
  { name: 'homepage', path: '/', description: 'Homepage / Chat page' },
  { name: 'dosing', path: '/dosing', description: 'Dosing page' },
  { name: 'protocols', path: '/protocols', description: 'Protocols page' },
  { name: 'base-hospitals', path: '/base-hospitals', description: 'Base Hospitals page' },
  { name: 'scene', path: '/scene', description: 'Scene page' }
];

// Viewport configurations
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, isMobile: false },
  mobile: { width: 375, height: 812, isMobile: true }
};

async function takeScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');

  // Create screenshots directory
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  try {
    for (const page of PAGES) {
      console.log(`📸 Capturing: ${page.description}`);
      const url = `${BASE_URL}${page.path}`;

      const pageResults = {
        name: page.name,
        description: page.description,
        url: url,
        screenshots: {},
        observations: []
      };

      // Take desktop screenshot
      console.log(`  - Desktop viewport (${VIEWPORTS.desktop.width}x${VIEWPORTS.desktop.height})`);
      const desktopPage = await browser.newPage();
      await desktopPage.setViewport(VIEWPORTS.desktop);

      try {
        await desktopPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait a bit for any animations or dynamic content
        await new Promise(resolve => setTimeout(resolve, 1000));

        const desktopPath = join(SCREENSHOT_DIR, `${page.name}-desktop.png`);
        await desktopPage.screenshot({
          path: desktopPath,
          fullPage: true
        });
        pageResults.screenshots.desktop = desktopPath;

        // Collect page info
        const pageInfo = await desktopPage.evaluate(() => {
          return {
            title: document.title,
            hasHeader: !!document.querySelector('header'),
            hasNav: !!document.querySelector('nav'),
            hasMobileNav: !!document.querySelector('[class*="mobile"]'),
            mainContent: !!document.querySelector('main'),
            visibleText: document.body.innerText.substring(0, 200)
          };
        });
        pageResults.pageInfo = pageInfo;

      } catch (error) {
        pageResults.observations.push(`Desktop screenshot failed: ${error.message}`);
        console.log(`    ⚠️  Error: ${error.message}`);
      } finally {
        await desktopPage.close();
      }

      // Take mobile screenshot
      console.log(`  - Mobile viewport (${VIEWPORTS.mobile.width}x${VIEWPORTS.mobile.height})`);
      const mobilePage = await browser.newPage();
      await mobilePage.setViewport(VIEWPORTS.mobile);

      try {
        await mobilePage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for any animations
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mobilePath = join(SCREENSHOT_DIR, `${page.name}-mobile.png`);
        await mobilePage.screenshot({
          path: mobilePath,
          fullPage: true
        });
        pageResults.screenshots.mobile = mobilePath;

        // Collect mobile-specific info
        const mobileInfo = await mobilePage.evaluate(() => {
          const mobileNav = document.querySelector('[class*="mobile"]');
          const navBar = document.querySelector('nav');

          return {
            hasMobileNav: !!mobileNav,
            mobileNavVisible: mobileNav ? getComputedStyle(mobileNav).display !== 'none' : false,
            mobileNavClass: mobileNav ? mobileNav.className : null,
            navBarClass: navBar ? navBar.className : null,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
          };
        });
        pageResults.mobileInfo = mobileInfo;

      } catch (error) {
        pageResults.observations.push(`Mobile screenshot failed: ${error.message}`);
        console.log(`    ⚠️  Error: ${error.message}`);
      } finally {
        await mobilePage.close();
      }

      results.push(pageResults);
      console.log(`  ✅ Completed\n`);
    }

  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCREENSHOT REPORT');
  console.log('='.repeat(80) + '\n');

  results.forEach(result => {
    console.log(`\n${result.description.toUpperCase()}`);
    console.log('-'.repeat(80));
    console.log(`URL: ${result.url}`);
    console.log(`\nScreenshots:`);
    if (result.screenshots.desktop) {
      console.log(`  Desktop: ${result.screenshots.desktop}`);
    }
    if (result.screenshots.mobile) {
      console.log(`  Mobile:  ${result.screenshots.mobile}`);
    }

    if (result.pageInfo) {
      console.log(`\nPage Structure (Desktop):`);
      console.log(`  Title: ${result.pageInfo.title}`);
      console.log(`  Has Header: ${result.pageInfo.hasHeader}`);
      console.log(`  Has Nav: ${result.pageInfo.hasNav}`);
      console.log(`  Has Main Content: ${result.pageInfo.mainContent}`);
    }

    if (result.mobileInfo) {
      console.log(`\nMobile Navigation:`);
      console.log(`  Has Mobile Nav: ${result.mobileInfo.hasMobileNav}`);
      console.log(`  Mobile Nav Visible: ${result.mobileInfo.mobileNavVisible}`);
      console.log(`  Mobile Nav Class: ${result.mobileInfo.mobileNavClass}`);
      console.log(`  Nav Bar Class: ${result.mobileInfo.navBarClass}`);
    }

    if (result.observations.length > 0) {
      console.log(`\n⚠️  Observations:`);
      result.observations.forEach(obs => console.log(`  - ${obs}`));
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('✨ Screenshot capture complete!');
  console.log('='.repeat(80) + '\n');

  return results;
}

// Run the script
takeScreenshots().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
