#!/usr/bin/env node
/**
 * Hospital Directory Parser - Fixed Version
 * Parses LA County Hospital Directory (Ref 501) markdown
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOSPITAL_DIRECTORY_PATH = path.join(__dirname, '../PDFs/1189952_501HospitalDirectory.md');

// Region mapping based on ZIP codes
const REGION_MAP = {
  // Central - Downtown LA
  '90033': 'Central', '90015': 'Central', '90027': 'Central',
  '90023': 'Central', '90017': 'Central', '90059': 'Central',

  // North - San Fernando Valley & North County
  '91206': 'North', '91204': 'North', '91328': 'North', '93534': 'North',
  '91342': 'North', '91352': 'North', '93551': 'North', '91436': 'North',
  '91345': 'North', '91505': 'North', '91356': 'North', '91355': 'North',
  '91402': 'North', '91367': 'North', '91405': 'North', '91307': 'North',
  '91403': 'North', '91208': 'North',

  // South - South Bay, Long Beach
  '90502': 'South', '90503': 'South', '90813': 'South', '90806': 'South',
  '90301': 'South', '90650': 'South', '90247': 'South', '90732': 'South',
  '90262': 'South', '90710': 'South', '90712': 'South', '90704': 'South',

  // East - Pasadena, San Gabriel Valley
  '91105': 'East', '91801': 'East', '91749': 'East', '91723': 'East',
  '91790': 'East', '91754': 'East', '91733': 'East', '91706': 'East',
  '91776': 'East', '91767': 'East', '90602': 'East', '90605': 'East',
  '90242': 'East', '90241': 'East', '90640': 'East', '91773': 'East',
  '91007': 'East',

  // West - West LA, Santa Monica
  '90048': 'West', '90095': 'West', '90034': 'West', '90404': 'West',
  '90291': 'West', '90231': 'West',

  // OC Border
  '90623': 'Central', '91360': 'Central', '92635': 'Central',
  '90720': 'Central', '92868': 'Central', '90807': 'Central', '91748': 'Central',
  '93535': 'Central', '90066': 'Central', '90509': 'Central',
};

function getRegion(cityStateLine) {
  const zipMatch = cityStateLine.match(/\d{5}/);
  if (zipMatch) {
    const zip = zipMatch[0];
    return REGION_MAP[zip] || 'Central';
  }
  return 'Central';
}

function parseHospitals() {
  const content = fs.readFileSync(HOSPITAL_DIRECTORY_PATH, 'utf-8');
  const lines = content.split('\n').map(l => l.trim());

  const hospitals = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip headers, page numbers, empty lines
    if (!line ||
        line.includes('PAGE') ||
        line.includes('DEPARTMENT OF HEALTH') ||
        line.includes('HOSPITAL NAME') ||
        line.includes('HOSP. CODE') ||
        line.includes('EFFECTIVE:') ||
        line === '_________________________________________________________________________________________________________') {
      i++;
      continue;
    }

    // Hospital name: starts with capital letter, no numbers, not a header keyword
    if (line.match(/^[A-Z]/) &&
        !line.match(/^\d/) &&
        !line.includes('County of Los Angeles') &&
        !line.includes('SUBJECT:') &&
        !line.match(/^(BASE|TRAUMA|LEVEL|PTC|PMC|EDAP|PERINATAL|NICU|SRC|ECPR|PSC|CSC|BURN|HELIPAD|SPECIAL|SERVICES|X\s)/i)) {

      const name = line;

      // Look ahead for address, city, phone
      let street = '';
      let cityState = '';
      let phone = '';
      let hospitalCode = '';
      let capabilities = [];

      // Next line should be street address (starts with number)
      if (i + 1 < lines.length && lines[i + 1].match(/^\d/)) {
        street = lines[i + 1];
        i++;
      }

      // Next line should be city, state, zip
      if (i + 1 < lines.length && lines[i + 1].match(/[A-Za-z\s]+,\s*CA\s+\d{5}/)) {
        cityState = lines[i + 1];
        i++;
      }

      // Next line should be phone
      if (i + 1 < lines.length && lines[i + 1].match(/^\(\d{3}\)/)) {
        phone = lines[i + 1];
        i++;
      }

      // Next lines: hospital code and capabilities (3-letter code)
      if (i + 1 < lines.length) {
        const codeLine = lines[i + 1];
        const codeMatch = codeLine.match(/^([A-Z]{3})/);
        if (codeMatch) {
          hospitalCode = codeMatch[1];
          i++;

          // Parse capabilities from code line and following lines
          let capabilityText = codeLine;

          // Collect next few lines for capability parsing
          for (let j = 1; j <= 10; j++) {
            if (i + j < lines.length) {
              const nextLine = lines[i + j];
              // Stop if we hit next hospital or page break
              if (nextLine.match(/^[A-Z][a-z]/) &&
                  nextLine.match(/Hospital|Medical Center|Health/i) &&
                  !nextLine.match(/^(Level|Pediatric|PTC|PMC|SART|X\s)/)) {
                break;
              }
              capabilityText += ' ' + nextLine;
            }
          }

          // Parse capabilities
          if (capabilityText.includes('X') && capabilityText.split('X')[0].length < 10) {
            capabilities.push('Base Hospital');
          }

          if (capabilityText.match(/Level I(?!\s*ONLY)/)) {
            capabilities.push('Level I Trauma Center');
          } else if (capabilityText.includes('Level II')) {
            capabilities.push('Level II Trauma Center');
          }

          if (capabilityText.match(/Pediatric\s+Level/)) {
            capabilities.push('Pediatric Trauma Center');
          }

          if (capabilityText.includes('PTC')) {
            capabilities.push('Pediatric Trauma Center (PTC)');
          }
          if (capabilityText.includes('PMC')) {
            capabilities.push('Pediatric Medical Center (PMC)');
          }
          if (capabilityText.includes('EDAP')) {
            capabilities.push('Emergency Department Approved for Pediatrics (EDAP)');
          }
          if (capabilityText.includes('PSC')) {
            capabilities.push('Primary Stroke Center (PSC)');
          }
          if (capabilityText.includes('CSC')) {
            capabilities.push('Comprehensive Stroke Center (CSC)');
          }
          if (capabilityText.includes('BURN')) {
            capabilities.push('Burn Center');
          }
          if (capabilityText.includes('ECPR')) {
            capabilities.push('ECPR Center');
          }
          if (capabilityText.includes('SART')) {
            capabilities.push('SART Center');
          }
          if (capabilityText.match(/NICU/)) {
            capabilities.push('NICU');
          }
          if (capabilityText.match(/PERINATAL/i)) {
            capabilities.push('Perinatal Services');
          }
          if (capabilityText.match(/HELIPAD/i)) {
            capabilities.push('Helipad');
          }
        }
      }

      // Only add if we have minimum required fields
      if (name && phone && hospitalCode) {
        const fullAddress = street && cityState ? `${street}, ${cityState}` : 'Address not available';
        const region = cityState ? getRegion(cityState) : 'Central';

        hospitals.push({
          id: hospitalCode,
          name: name,
          shortName: name.replace(/\s*(Hospital|Medical Center|Health Center|Healthcare|Medical|Health)\s*/gi, ' ').trim(),
          phone: phone,
          hospitalCode: hospitalCode,
          region: region,
          address: fullAddress,
          capabilities: [...new Set(capabilities)], // Remove duplicates
          available24_7: true
        });
      }
    }

    i++;
  }

  return hospitals;
}

// Parse and output
const hospitals = parseHospitals();

console.log(`\n✅ Parsed ${hospitals.length} hospitals from directory\n`);
console.log('Sample hospitals:');
hospitals.slice(0, 5).forEach(h => {
  console.log(`\n${h.name}`);
  console.log(`  Code: ${h.hospitalCode}`);
  console.log(`  Phone: ${h.phone}`);
  console.log(`  Region: ${h.region}`);
  console.log(`  Capabilities: ${h.capabilities.join(', ') || 'None'}`);
});

console.log(`\n📊 Statistics:`);
console.log(`  Total hospitals: ${hospitals.length}`);
console.log(`  Base hospitals: ${hospitals.filter(h => h.capabilities.includes('Base Hospital')).length}`);
console.log(`  Level I Trauma: ${hospitals.filter(h => h.capabilities.some(c => c.includes('Level I Trauma'))).length}`);
console.log(`  Level II Trauma: ${hospitals.filter(h => h.capabilities.some(c => c.includes('Level II Trauma'))).length}`);

// By region
const byRegion = {
  Central: hospitals.filter(h => h.region === 'Central').length,
  North: hospitals.filter(h => h.region === 'North').length,
  South: hospitals.filter(h => h.region === 'South').length,
  East: hospitals.filter(h => h.region === 'East').length,
  West: hospitals.filter(h => h.region === 'West').length,
};
console.log(`\n📍 By Region:`);
Object.entries(byRegion).forEach(([region, count]) => {
  console.log(`  ${region}: ${count}`);
});

// Write to file
const outputPath = path.join(__dirname, '../lib/clinical/base-hospitals-full.ts');
const output = `/* eslint-disable max-lines */
/**
 * LA County EMS Complete Hospital Directory
 * Auto-generated from LA County EMS Agency Reference No. 501
 *
 * This is the COMPLETE directory of all 9-1-1 receiving hospitals in LA County.
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  phone: string;
  hospitalCode: string;
  region: 'Central' | 'North' | 'South' | 'East' | 'West';
  address: string;
  capabilities: string[];
  available24_7: boolean;
}

export const ALL_HOSPITALS: Hospital[] = ${JSON.stringify(hospitals, null, 2)};

// Base hospitals (those with Base Hospital capability)
export const BASE_HOSPITALS = ALL_HOSPITALS.filter(h =>
  h.capabilities.includes('Base Hospital')
);

// Helper functions
export function getHospitalByCode(code: string): Hospital | undefined {
  return ALL_HOSPITALS.find(h => h.hospitalCode === code);
}

export function getHospitalsByRegion(region: string): Hospital[] {
  return ALL_HOSPITALS.filter(h => h.region === region);
}

export function getHospitalsByCapability(capability: string): Hospital[] {
  return ALL_HOSPITALS.filter(h =>
    h.capabilities.some(cap =>
      cap.toLowerCase().includes(capability.toLowerCase())
    )
  );
}

export const MEDICAL_ALERT_CENTER = {
  name: 'Medical Alert Center (MAC)',
  phone: '(562) 347-1789',
  alternatePhone: '(866) 940-4401',
  usage: 'For specialized consultations (ECMO, hyperbaric emergencies, disease outbreaks)',
  available24_7: true
};
`;

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`\n✅ Generated hospital data at: ${outputPath}`);
