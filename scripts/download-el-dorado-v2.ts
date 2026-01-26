/**
 * Download El Dorado County PDFs using Playwright - Navigate method
 * 
 * This version navigates to each PDF directly in the browser and captures the content
 * 
 * Run with: npx tsx scripts/download-el-dorado-v2.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';

const PDF_DIR = path.join(__dirname, '../data/el-dorado-protocols');
const BASE_URL = 'https://www.eldoradocounty.ca.gov';

// All PDF URLs to download
const PDF_URLS = [
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/01_preface-2013.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/bradycardia.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/302-chest-discomfort.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/chf-pulmonary-edema-2019.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/17narrow-complex-tachycardia.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/pulseless-arrest.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/306-return-of-spontaneous-circulation-rosc.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/305-wide-complex-tachycardia.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/32-pain-management.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/110-shock.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/101-airway-obstruction.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/102-allergic-reaction.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/altered-level-of-conciousness-aloc.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/503-bites-stings-envenomation.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/16bronchospasm-copd.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/cold-exposures.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/drowning-event.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/13dystonic-reaction.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/14glycemic-emergencies.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/heat-illness.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/112-nausea-vomiting.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/poisoning-overdose-2019.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/29seizures.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/109-sepsis.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/severely-agitated-patient.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stroke.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/burns.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/12crush-syndrome-suspension-injuries.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/30general-trauma.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/15head-trauma.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/31hemorrhage-control.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/brief-resolved-unexplained-event.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/childbirth.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/neonatal-resuscitation.pdf',
  // Field Policies
  '/files/assets/county/v/5/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/901-als-unit-minimum-inventory.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/402-assessment-of-subjects-in-law-enforcement-custody.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/bls-medication-administration-2019.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/401-comprehensive-5150-guidelines.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/controlled-substance-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/determination-of-death.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/dnr.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/ems-aircraft-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/exposure-determination-treatment-and-reporting.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/fireline-medic.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/909-hospice-patients.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/inter-county-emt-paramedic-response-and-transport-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/malfunctioning-aicd.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/management-of-preexisting-medical-intervention.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/403-management-of-taser-stun-device-patients.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/nerve-agent-exposure-2018.pdf',
];

async function main() {
  console.log('El Dorado County PDF Downloader v2 (Download capture)');
  console.log('======================================================\n');

  // Ensure directory exists
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }

  // Launch browser in non-headless mode to avoid detection
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false, // Try with visible browser
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    acceptDownloads: true,
  });
  
  const page = await context.newPage();

  // Visit the main page first to get cookies
  console.log('Visiting main page to establish session...');
  await page.goto('https://www.eldoradocounty.ca.gov/Public-Safety-Justice/Emergency-Medical-Services', {
    waitUntil: 'networkidle',
  });

  // Wait a bit for any JS to execute
  await page.waitForTimeout(3000);

  let downloaded = 0;
  let failed = 0;

  // Just try a few PDFs to test
  const testUrls = PDF_URLS.slice(0, 5);
  console.log(`\nTesting download of ${testUrls.length} PDFs...\n`);

  for (let i = 0; i < testUrls.length; i++) {
    const urlPath = testUrls[i];
    const filename = path.basename(urlPath);
    const destPath = path.join(PDF_DIR, filename);
    const url = BASE_URL + urlPath;

    console.log(`[${i + 1}/${testUrls.length}] Trying: ${filename}`);

    try {
      // Navigate to PDF URL and intercept response
      const response = await page.goto(url, { 
        waitUntil: 'load',
        timeout: 30000 
      });

      if (response) {
        const status = response.status();
        const contentType = response.headers()['content-type'] || '';
        
        console.log(`  Status: ${status}, Content-Type: ${contentType}`);

        if (status === 200 && contentType.includes('pdf')) {
          const buffer = await response.body();
          if (buffer && buffer.length > 1000) {
            fs.writeFileSync(destPath, buffer);
            console.log(`  ✓ Saved: ${buffer.length} bytes`);
            downloaded++;
          } else {
            console.log(`  ✗ Response too small: ${buffer?.length || 0} bytes`);
            failed++;
          }
        } else {
          console.log(`  ✗ Not a PDF or blocked`);
          failed++;
        }
      } else {
        console.log(`  ✗ No response`);
        failed++;
      }
    } catch (error: any) {
      console.log(`  ✗ Error: ${error.message.substring(0, 100)}`);
      failed++;
    }

    // Wait between requests
    await page.waitForTimeout(1000);
  }

  await browser.close();

  console.log(`\n============================================`);
  console.log(`Complete!`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}`);
  console.log(`============================================`);
}

main().catch(console.error);
