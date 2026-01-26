/**
 * Download El Dorado County PDFs using Playwright
 * 
 * Playwright can bypass Akamai CDN protections that block curl/wget
 * 
 * Run with: npx tsx scripts/download-el-dorado-pdfs.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';

const PDF_DIR = path.join(__dirname, '../data/el-dorado-protocols');
const BASE_URL = 'https://www.eldoradocounty.ca.gov';

// All PDF URLs to download
const PDF_URLS = [
  // Prehospital Protocols
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
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/on-scene-photography-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/pandemic-epidemic-influenza-and-influenza-like-illness-ili.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/918-patient-destination.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/physical-restraint-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/physician-at-scene.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/prehospital-transfer-of-care-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/913-refusal-of-care-or-transportation.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/914-reporting-of-suspected-abuse.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/routine-medical-care-2019.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/safely-surrendered-baby.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/spinal-immobilization-2019.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/917-stemi-destination.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/verification-of-advanced-airway-placement.pdf',
  // Field Procedures
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/12-lead-ecg.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/automatic-external-defibrillator-aed-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/cpap.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/etco2-monitoring.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/epinephrine-dilution.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/gastric-tube-insertion.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/intranasal-medication-administration.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/intraosseous-infusion-io.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/needle-chest-decompression.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/needle-cricothyroidotomy.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/810-orotracheal-intubation.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/821-sct-blood-transfusions.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/820-sct-infusions.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stomal-intubation-2018.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/supraglottic-airways.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/therapeutic-hypothermia-2019.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/tourniquet-for-hemorrhage-control.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/transcutaneous-pacing.pdf',
  // Administrative Policies
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/el-dorado-county-ems-agency-documentation-policy-2025-final-10-1-2025.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/medical-transportation-ordinance.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/edcemsa-cqi-plan-2022.pdf',
  '/files/assets/county/v/2/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/1101-documentation-policy-2025-10-1-2025.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/downgrade-or-closure-of-hospital-emergency-services-2017.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/ems-communications-2017.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/field-internship.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/epcr-mobile-device-platform-policy.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/ground-critical-care-transport-2017.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/litter-wheelchair-van-requirements-2017.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/part-time-als-service-2017.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/public-safety-aed-program-2017.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/1106-sct-provider-agency-requirements.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/1107-sct-transferring-hospital-requirements.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stemi-plan-2021.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/stemi-recieving-center-2017.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/use-of-another-lemsa-ppps-by-contractors-and-permittees-2017.pdf',
  // Drug Formulary
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/acetaminophen.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/activated-charcoal.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/adenosine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/albuterol.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/amiodarone_2.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/aspirin.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/atropine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/atrovent-duoneb.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/calcium-chloride.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dextrose10.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dextrose50.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/diphenhydramine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/dopamine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/1013-epinephrine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/fentanyl.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/glucagon.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/glucose.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ibuprofen.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ketamine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/lactated-ringers.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/levalbuterol-tartrate.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/lidocaine_.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/lidocaine-jelly.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/magnesium-sulfate.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/midazolam-hydrochloride.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/morphine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/naloxone.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/neosynephrine.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/nitroglycerin.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/nitrous-oxide.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/ondansetron.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/oxygen.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/sodium-bicarbonate.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/sodium-chloride.pdf',
  '/files/assets/county/v/1/documents/public-safety-amp-justice/wildfire-amp-disaster/emergency-medical-services/drug-formulary-medication/tranexamic-acid.pdf',
];

async function main() {
  console.log('El Dorado County PDF Downloader (Playwright)');
  console.log('=============================================\n');

  // Ensure directory exists and clean up 0-byte files
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }

  // Remove 0-byte files from previous attempts
  const existingFiles = fs.readdirSync(PDF_DIR);
  for (const file of existingFiles) {
    const filePath = path.join(PDF_DIR, file);
    if (fs.statSync(filePath).size === 0) {
      fs.unlinkSync(filePath);
    }
  }

  // Launch browser
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();

  // Visit the main page first to get cookies
  console.log('Visiting main page to establish session...');
  await page.goto('https://www.eldoradocounty.ca.gov/Public-Safety-Justice/Emergency-Medical-Services', {
    waitUntil: 'networkidle',
  });

  // Wait a bit for any JS to execute
  await page.waitForTimeout(2000);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`\nDownloading ${PDF_URLS.length} PDFs...\n`);

  for (let i = 0; i < PDF_URLS.length; i++) {
    const urlPath = PDF_URLS[i];
    const filename = path.basename(urlPath);
    const destPath = path.join(PDF_DIR, filename);

    // Skip if already downloaded with content
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      skipped++;
      continue;
    }

    const url = BASE_URL + urlPath;
    process.stdout.write(`\r[${i + 1}/${PDF_URLS.length}] ${filename.substring(0, 50).padEnd(50)}`);

    try {
      // Use page.request to download the PDF
      const response = await context.request.get(url);

      if (response.ok()) {
        const buffer = await response.body();
        
        // Check if it's a valid PDF (starts with %PDF)
        if (buffer.slice(0, 4).toString() === '%PDF') {
          fs.writeFileSync(destPath, buffer);
          downloaded++;
        } else {
          // Might be HTML error page
          failed++;
        }
      } else {
        failed++;
      }
    } catch (error: any) {
      failed++;
    }

    // Small delay between requests
    await page.waitForTimeout(300);
  }

  await browser.close();

  console.log(`\n\n============================================`);
  console.log(`Complete!`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`============================================`);
}

main().catch(console.error);
