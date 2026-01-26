/**
 * Download Santa Clara County EMS PDFs using Playwright
 * This bypasses the 403 blocks from direct HTTP requests
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = 'data/santa-clara-protocols';

// Protocol sources from the website
const PDF_SOURCES = [
  { url: 'https://files.santaclaracounty.gov/exjcpb1541/migrated/Policy%20106_0.pdf?VersionId=2DhOQ4p04OcSWv6bh4YvHF1DVq4sLT.5', title: '106 - PERSONNEL INVESTIGATION AND DISCIPLINE' },
  { url: 'https://files.santaclaracounty.gov/exjcpb1541/migrated/Policy108.pdf?VersionId=44F9WNyucz1VvSVw77LLVdOjYOgQQiNv', title: '108 - SYSTEM VARIANCE REPORTING' },
  { url: 'https://files.santaclaracounty.gov/exjcpb1541/migrated/Policy%20109_0.pdf?VersionId=ECc3IPjAaH7vljFeNoEE3tJBxGZPBLl6', title: '109 - POLICY DEVELOPMENT AND IMPLEMENTATION' },
  { url: 'https://files.santaclaracounty.gov/exjcpb1541/migrated/Policy%20110.pdf?VersionId=RSp8fpXpALK4u579GDSnH3RVj3WgK6J9', title: '110 - 911 SYSTEM PROVIDER ROLES' },
  { url: 'https://files.santaclaracounty.gov/exjcpb1541/migrated/Policy111.pdf?VersionId=GNlhCqEuJ1MEarKElQ7nyX0OW18nAG45', title: '111 - EMS QUALITY ASSURANCE AND IMPROVEMENT PROGRAM' },
  { url: 'https://files.santaclaracounty.gov/exjcpb1541/migrated/Policy%20112.pdf?VersionId=DI8QLntoPKr1QU6jRay5K2ra.Xhx2z3U', title: '112 - PREHOSPITAL AUDIT COMMITTEE' },
];

async function main() {
  console.log('Starting Playwright-based PDF download...\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  // First visit the main page to establish session
  const page = await context.newPage();
  console.log('Establishing session...');
  await page.goto('https://ems.santaclaracounty.gov/services/find-ems-policies-protocols-and-plans');
  await page.waitForTimeout(2000);

  let downloaded = 0;

  for (const source of PDF_SOURCES) {
    const filename = source.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 80) + '.pdf';
    const filepath = path.join(DATA_DIR, filename);

    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
      console.log(`  Skip (exists): ${source.title.substring(0, 50)}`);
      downloaded++;
      continue;
    }

    try {
      // Use fetch within the browser context
      const pdfBuffer = await page.evaluate(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
      }, source.url);

      if (pdfBuffer && pdfBuffer.length > 1000) {
        fs.writeFileSync(filepath, Buffer.from(pdfBuffer));
        console.log(`  ✓ Downloaded: ${source.title.substring(0, 50)} (${Math.round(pdfBuffer.length / 1024)}KB)`);
        downloaded++;
      } else {
        console.log(`  ✗ Empty response: ${source.title.substring(0, 50)}`);
      }
    } catch (err: any) {
      console.log(`  ✗ Failed: ${source.title.substring(0, 50)} - ${err.message}`);
    }

    await page.waitForTimeout(500);
  }

  await browser.close();
  console.log(`\nDownloaded ${downloaded}/${PDF_SOURCES.length} PDFs`);
}

main().catch(console.error);
