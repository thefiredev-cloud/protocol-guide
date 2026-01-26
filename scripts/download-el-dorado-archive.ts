/**
 * Download El Dorado County PDFs from Wayback Machine
 * 
 * The original site uses Akamai CDN which blocks automated requests.
 * This script downloads from archive.org's Wayback Machine instead.
 * 
 * Run with: npx tsx scripts/download-el-dorado-archive.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const PDF_DIR = path.join(__dirname, '../data/el-dorado-protocols');
const BASE_URL = 'https://www.eldoradocounty.ca.gov';
const ARCHIVE_PREFIX = 'https://web.archive.org/web/2024/';

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

async function downloadPDF(originalUrl: string, destPath: string): Promise<boolean> {
  // Try archive.org first
  const archiveUrl = ARCHIVE_PREFIX + BASE_URL + originalUrl;
  
  return new Promise((resolve) => {
    const download = (url: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        resolve(false);
        return;
      }

      const protocol = url.startsWith('https') ? https : https;
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      };

      const req = https.request(options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
          const location = response.headers.location;
          if (location) {
            const newUrl = location.startsWith('http') ? location : `https://${urlObj.hostname}${location}`;
            download(newUrl, redirectCount + 1);
            return;
          }
        }
        
        if (response.statusCode !== 200) {
          resolve(false);
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          // Check if it's a valid PDF
          if (buffer.length > 1000 && buffer.slice(0, 4).toString() === '%PDF') {
            fs.writeFileSync(destPath, buffer);
            resolve(true);
          } else {
            resolve(false);
          }
        });
        response.on('error', () => resolve(false));
      });

      req.on('error', () => resolve(false));
      req.setTimeout(30000, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    };

    download(archiveUrl);
  });
}

async function main() {
  console.log('El Dorado County PDF Downloader (Wayback Machine)');
  console.log('==================================================\n');

  // Ensure directory exists
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Downloading ${PDF_URLS.length} PDFs...\n`);

  for (let i = 0; i < PDF_URLS.length; i++) {
    const urlPath = PDF_URLS[i];
    const filename = path.basename(urlPath);
    const destPath = path.join(PDF_DIR, filename);

    // Skip if already downloaded with content
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      skipped++;
      process.stdout.write(`\r[${i + 1}/${PDF_URLS.length}] ${filename.substring(0, 45).padEnd(45)} [SKIP]`);
      continue;
    }

    process.stdout.write(`\r[${i + 1}/${PDF_URLS.length}] ${filename.substring(0, 45).padEnd(45)} ...  `);

    const success = await downloadPDF(urlPath, destPath);
    if (success) {
      downloaded++;
      process.stdout.write(`\r[${i + 1}/${PDF_URLS.length}] ${filename.substring(0, 45).padEnd(45)} [OK] `);
    } else {
      failed++;
      process.stdout.write(`\r[${i + 1}/${PDF_URLS.length}] ${filename.substring(0, 45).padEnd(45)} [FAIL]`);
    }

    // Rate limit to be nice to archive.org
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n\n============================================`);
  console.log(`Complete!`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`============================================`);
}

main().catch(console.error);
