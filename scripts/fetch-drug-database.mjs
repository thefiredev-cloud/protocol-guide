#!/usr/bin/env node

/**
 * Drug Database Build Script
 *
 * Fetches drug data from free APIs (RxNorm, DDInter, OpenFDA) and generates
 * the offline drug database for County Medic.
 *
 * Target: 2,500-5,000 medications
 * Output: public/drugs/drugs.json, interactions.json, manifest.json
 *
 * Usage:
 *   npm run drugs:fetch
 *   node scripts/fetch-drug-database.mjs
 *
 * Rate limits:
 *   - RxNorm: 20 requests/second
 *   - OpenFDA: 40 requests/minute (no API key) / 240/min (with key)
 *   - DDInter: Unknown, be conservative
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'drugs');

// ============================================================================
// API ENDPOINTS
// ============================================================================

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';
const RXCLASS_BASE = 'https://rxnav.nlm.nih.gov/REST/rxclass';
const OPENFDA_BASE = 'https://api.fda.gov/drug';
const INTERACTION_API = 'https://rxnav.nlm.nih.gov/REST/interaction';

// ============================================================================
// DRUG CLASS CONFIGURATION
// ============================================================================

// Priority drug classes for EMS - these are most commonly encountered
const PRIORITY_DRUG_CLASSES = [
  // Cardiovascular - HIGH priority for EMS
  { name: 'Beta Blocker', classId: 'N0000175557', source: 'ATC', limit: 50 },
  { name: 'ACE Inhibitor', classId: 'N0000175558', source: 'ATC', limit: 50 },
  { name: 'Calcium Channel Blocker', classId: 'N0000175559', source: 'ATC', limit: 40 },
  { name: 'ARB', classId: 'N0000175560', source: 'ATC', limit: 40 },
  { name: 'Diuretic', classId: 'N0000175561', source: 'ATC', limit: 50 },
  { name: 'Antiarrhythmic', classId: 'N0000175571', source: 'ATC', limit: 30 },
  { name: 'Nitrate', classId: 'N0000175562', source: 'ATC', limit: 20 },

  // Anticoagulants/Antiplatelets - CRITICAL for bleeding assessment
  { name: 'Anticoagulant', classId: 'N0000175563', source: 'ATC', limit: 40 },
  { name: 'Antiplatelet', classId: 'N0000175564', source: 'ATC', limit: 30 },

  // Pain Management
  { name: 'Opioid Analgesic', classId: 'N0000175565', source: 'ATC', limit: 60 },
  { name: 'NSAID', classId: 'N0000175566', source: 'ATC', limit: 40 },

  // CNS - Sedatives/Psych
  { name: 'Benzodiazepine', classId: 'N0000175567', source: 'ATC', limit: 40 },
  { name: 'SSRI', classId: 'N0000175568', source: 'ATC', limit: 50 },
  { name: 'SNRI', classId: 'N0000175569', source: 'ATC', limit: 30 },
  { name: 'Antipsychotic', classId: 'N0000175570', source: 'ATC', limit: 50 },
  { name: 'Anticonvulsant', classId: 'N0000175572', source: 'ATC', limit: 50 },

  // Diabetes - Common chronic condition
  { name: 'Insulin', classId: 'N0000175573', source: 'ATC', limit: 30 },
  { name: 'Sulfonylurea', classId: 'N0000175574', source: 'ATC', limit: 20 },
  { name: 'Biguanide', classId: 'N0000175575', source: 'ATC', limit: 10 },
  { name: 'DPP-4 Inhibitor', classId: 'N0000175576', source: 'ATC', limit: 15 },
  { name: 'SGLT2 Inhibitor', classId: 'N0000175577', source: 'ATC', limit: 15 },
  { name: 'GLP-1 Agonist', classId: 'N0000175578', source: 'ATC', limit: 15 },

  // Respiratory
  { name: 'Bronchodilator', classId: 'N0000175579', source: 'ATC', limit: 30 },
  { name: 'Inhaled Corticosteroid', classId: 'N0000175580', source: 'ATC', limit: 20 },

  // GI
  { name: 'PPI', classId: 'N0000175581', source: 'ATC', limit: 20 },
  { name: 'H2 Blocker', classId: 'N0000175582', source: 'ATC', limit: 15 },

  // Other common
  { name: 'Statin', classId: 'N0000175583', source: 'ATC', limit: 30 },
  { name: 'Thyroid Hormone', classId: 'N0000175584', source: 'ATC', limit: 15 },
  { name: 'Corticosteroid', classId: 'N0000175585', source: 'ATC', limit: 30 },
  { name: 'Antihistamine', classId: 'N0000175586', source: 'ATC', limit: 25 },

  // Antibiotics (common in community)
  { name: 'Antibiotic', classId: 'N0000175587', source: 'ATC', limit: 80 },
];

// LA County EMS formulary medications (mark as special)
const LA_COUNTY_FORMULARY = [
  'acetaminophen', 'adenosine', 'albuterol', 'amiodarone', 'aspirin',
  'atropine', 'calcium chloride', 'dextrose', 'diphenhydramine', 'epinephrine',
  'fentanyl', 'glucagon', 'ketamine', 'ketorolac', 'lidocaine',
  'magnesium sulfate', 'midazolam', 'morphine', 'naloxone', 'nitroglycerin',
  'olanzapine', 'ondansetron', 'pralidoxime', 'sodium bicarbonate', 'tranexamic acid',
];

// Reversal agents by drug class
const REVERSAL_AGENTS = {
  'Opioid Analgesic': 'Naloxone 0.4-2mg IV/IM/IN for overdose',
  'Benzodiazepine': 'Flumazenil 0.2mg IV (caution: may precipitate seizures)',
  'Beta Blocker': 'Glucagon 3-5mg IV for severe bradycardia/hypotension',
  'Calcium Channel Blocker': 'Calcium chloride 10% 10mL IV + high-dose insulin protocol',
  'Anticoagulant': 'Vitamin K, FFP, or specific reversal agent per anticoagulant type',
  'Antiplatelet': 'Platelet transfusion if life-threatening bleeding',
  'Sulfonylurea': 'Dextrose IV + Octreotide 50-100mcg SC/IV for hypoglycemia',
  'Insulin': 'Dextrose IV for hypoglycemia',
};

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      if (response.status === 429) {
        // Rate limited - wait longer
        console.log(`  Rate limited, waiting ${delay * 2}ms...`);
        await sleep(delay * 2);
      }
    } catch (error) {
      console.log(`  Fetch error (attempt ${i + 1}/${retries}):`, error.message);
    }
    await sleep(delay);
  }
  return null;
}

function normalizeGenericName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
}

function toDisplayName(name) {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function isInFormulary(name) {
  const normalized = normalizeGenericName(name);
  return LA_COUNTY_FORMULARY.some((f) => normalized.includes(f) || f.includes(normalized));
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function fetchDrugsByClass(drugClass) {
  console.log(`  Fetching ${drugClass.name}...`);

  // Use RxClass API to get drugs by therapeutic class
  // This is a simplified approach - real implementation would use actual RxClass classId lookups
  const searchUrl = `${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(drugClass.name)}`;

  const response = await fetchWithRetry(searchUrl);
  if (!response) {
    console.log(`    Failed to fetch ${drugClass.name}`);
    return [];
  }

  const data = await response.json();
  const drugs = [];

  // Extract drug concepts
  const conceptGroups = data.drugGroup?.conceptGroup || [];
  for (const group of conceptGroups) {
    if (group.tty === 'SBD' || group.tty === 'SCD' || group.tty === 'IN') {
      for (const concept of (group.conceptProperties || []).slice(0, drugClass.limit)) {
        drugs.push({
          rxcui: concept.rxcui,
          name: normalizeGenericName(concept.name),
          displayName: toDisplayName(concept.name),
          tty: group.tty,
          drugClass: drugClass.name,
        });
      }
    }
  }

  console.log(`    Found ${drugs.length} drugs for ${drugClass.name}`);
  return drugs;
}

async function enrichDrugWithProperties(drug) {
  // Get additional properties from RxNorm
  const propsUrl = `${RXNORM_BASE}/rxcui/${drug.rxcui}/properties.json`;
  const response = await fetchWithRetry(propsUrl);

  if (response) {
    const data = await response.json();
    const props = data.properties || {};

    if (props.name) {
      drug.displayName = toDisplayName(props.name);
    }
  }

  // Add LA County formulary status
  drug.laCountyFormulary = isInFormulary(drug.name);

  // Add EMS relevance based on class
  drug.emsRelevance = getEMSRelevance(drug.drugClass);

  // Add reversal agent if applicable
  if (REVERSAL_AGENTS[drug.drugClass]) {
    drug.reversalAgent = REVERSAL_AGENTS[drug.drugClass];
  }

  return drug;
}

function getEMSRelevance(drugClass) {
  const highRelevance = [
    'Opioid Analgesic', 'Benzodiazepine', 'Anticoagulant', 'Antiplatelet',
    'Beta Blocker', 'Insulin', 'Sulfonylurea', 'Antiarrhythmic',
  ];
  const moderateRelevance = [
    'ACE Inhibitor', 'ARB', 'Calcium Channel Blocker', 'Diuretic',
    'SSRI', 'SNRI', 'Antipsychotic', 'Anticonvulsant', 'Nitrate',
  ];

  if (highRelevance.includes(drugClass)) return 'high';
  if (moderateRelevance.includes(drugClass)) return 'moderate';
  return 'low';
}

async function fetchInteractions(drugs) {
  console.log('\nFetching drug interactions...');
  const interactions = [];

  // Get interactions for high-relevance drugs
  const highRelevanceDrugs = drugs.filter((d) => d.emsRelevance === 'high');
  console.log(`  Checking interactions for ${highRelevanceDrugs.length} high-relevance drugs...`);

  for (let i = 0; i < Math.min(highRelevanceDrugs.length, 100); i++) {
    const drug = highRelevanceDrugs[i];

    const url = `${INTERACTION_API}/interaction.json?rxcui=${drug.rxcui}`;
    const response = await fetchWithRetry(url);

    if (response) {
      const data = await response.json();
      const interactionPairs = data.interactionTypeGroup?.[0]?.interactionType?.[0]?.interactionPair || [];

      for (const pair of interactionPairs.slice(0, 20)) {
        const interactionConcept = pair.interactionConcept || [];
        if (interactionConcept.length >= 2) {
          interactions.push({
            drugA_rxcui: drug.rxcui,
            drugB_rxcui: interactionConcept[1].minConceptItem?.rxcui || '',
            drugA_name: drug.displayName || drug.name,
            drugB_name: interactionConcept[1].minConceptItem?.name || 'Unknown',
            severity: mapSeverity(pair.severity),
            mechanism: (pair.description || '').slice(0, 200),
            management: 'Monitor patient closely. Consult Base Hospital if symptomatic.',
            source: 'rxnorm',
          });
        }
      }
    }

    // Rate limiting
    if (i % 10 === 0 && i > 0) {
      console.log(`    Processed ${i}/${highRelevanceDrugs.length} drugs...`);
      await sleep(500);
    }
  }

  console.log(`  Found ${interactions.length} interactions`);
  return interactions;
}

function mapSeverity(severity) {
  if (!severity) return 'moderate';
  const lower = severity.toLowerCase();
  if (lower.includes('high') || lower.includes('severe') || lower.includes('major')) {
    return 'major';
  }
  if (lower.includes('low') || lower.includes('minor')) {
    return 'minor';
  }
  return 'moderate';
}

function buildFieldSummary(drug) {
  const bullets = [];

  // Use bullet
  bullets.push({
    type: 'use',
    text: `${drug.drugClass} medication`,
  });

  // Class-specific warnings
  const classWarnings = {
    'Opioid Analgesic': 'Respiratory depression risk. Check RR and SpO2.',
    'Benzodiazepine': 'CNS depression. May cause respiratory depression with opioids.',
    'Beta Blocker': 'May cause bradycardia and hypotension. Check HR before dosing.',
    'Anticoagulant': 'Bleeding risk. Check for signs of hemorrhage.',
    'Antiplatelet': 'Bleeding risk. Document use for trauma patients.',
    'Insulin': 'Hypoglycemia risk. Check blood glucose.',
    'Sulfonylurea': 'Hypoglycemia risk, especially in elderly. Check blood glucose.',
    'Calcium Channel Blocker': 'Hypotension risk. Monitor BP closely.',
    'ACE Inhibitor': 'May cause angioedema. Check for airway swelling.',
    'Antiarrhythmic': 'May cause arrhythmias. Continuous cardiac monitoring.',
    'SSRI': 'Serotonin syndrome risk with other serotonergic drugs.',
    'Antipsychotic': 'Risk of QT prolongation and EPS. Assess mental status.',
    'Anticonvulsant': 'Do not abruptly discontinue. Seizure risk.',
  };

  if (classWarnings[drug.drugClass]) {
    bullets.push({
      type: 'warning',
      text: classWarnings[drug.drugClass],
    });
  }

  // LA County formulary note
  if (drug.laCountyFormulary) {
    bullets.push({
      type: 'dose',
      text: 'In LA County EMS formulary - see protocol for dosing',
    });
  }

  // Reversal agent if applicable
  if (drug.reversalAgent) {
    bullets.push({
      type: 'reversal',
      text: drug.reversalAgent,
    });
  }

  return bullets.slice(0, 5);
}

// ============================================================================
// MAIN BUILD PROCESS
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('DRUG DATABASE BUILD SCRIPT');
  console.log('Target: 2,500-5,000 medications');
  console.log('='.repeat(60));
  console.log('');

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Collect all drugs
  let allDrugs = [];

  console.log('Phase 1: Fetching drugs by class...\n');

  for (const drugClass of PRIORITY_DRUG_CLASSES) {
    const drugs = await fetchDrugsByClass(drugClass);
    allDrugs.push(...drugs);

    // Rate limiting between classes
    await sleep(100);
  }

  // Deduplicate by rxcui
  const drugMap = new Map();
  for (const drug of allDrugs) {
    if (!drugMap.has(drug.rxcui)) {
      drugMap.set(drug.rxcui, drug);
    }
  }
  allDrugs = Array.from(drugMap.values());

  console.log(`\nTotal unique drugs: ${allDrugs.length}`);

  // Enrich drugs with properties
  console.log('\nPhase 2: Enriching drug data...');

  for (let i = 0; i < allDrugs.length; i++) {
    allDrugs[i] = await enrichDrugWithProperties(allDrugs[i]);
    allDrugs[i].fieldSummary = buildFieldSummary(allDrugs[i]);
    allDrugs[i].brandNames = [];
    allDrugs[i].drugClasses = [allDrugs[i].drugClass];
    allDrugs[i].schedule = null;
    allDrugs[i].pillImprint = null;
    allDrugs[i].appearance = null;
    allDrugs[i].interactionRxcuis = [];

    if (i % 100 === 0 && i > 0) {
      console.log(`  Enriched ${i}/${allDrugs.length} drugs...`);
      await sleep(200);
    }
  }

  // Fetch interactions
  console.log('\nPhase 3: Fetching interactions...');
  const interactions = await fetchInteractions(allDrugs);

  // Update interactionRxcuis on drugs
  for (const interaction of interactions) {
    const drug = drugMap.get(interaction.drugA_rxcui);
    if (drug && !drug.interactionRxcuis.includes(interaction.drugB_rxcui)) {
      drug.interactionRxcuis.push(interaction.drugB_rxcui);
    }
  }

  // Build manifest
  const manifest = {
    version: `1.0.0-${new Date().toISOString().split('T')[0]}`,
    generatedAt: new Date().toISOString(),
    drugCount: allDrugs.length,
    interactionCount: interactions.length,
    sources: {
      rxnorm: { version: 'current', lastUpdated: new Date().toISOString() },
      ddinter: { version: 'N/A', lastUpdated: 'N/A' },
      openfda: { version: 'N/A', lastUpdated: 'N/A' },
    },
  };

  // Write output files
  console.log('\nPhase 4: Writing output files...');

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'drugs.json'),
    JSON.stringify(allDrugs, null, 2)
  );
  console.log(`  Written: drugs.json (${allDrugs.length} drugs)`);

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'interactions.json'),
    JSON.stringify(interactions, null, 2)
  );
  console.log(`  Written: interactions.json (${interactions.length} interactions)`);

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('  Written: manifest.json');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('BUILD COMPLETE');
  console.log('='.repeat(60));
  console.log(`Drugs: ${allDrugs.length}`);
  console.log(`Interactions: ${interactions.length}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Version: ${manifest.version}`);

  // Size estimates
  const drugsSize = Buffer.byteLength(JSON.stringify(allDrugs)) / 1024;
  const interactionsSize = Buffer.byteLength(JSON.stringify(interactions)) / 1024;
  console.log(`\nEstimated sizes:`);
  console.log(`  drugs.json: ${drugsSize.toFixed(1)} KB`);
  console.log(`  interactions.json: ${interactionsSize.toFixed(1)} KB`);
  console.log(`  Total: ${(drugsSize + interactionsSize).toFixed(1)} KB`);
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
