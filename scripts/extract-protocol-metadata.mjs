#!/usr/bin/env node
/**
 * Extract Critical Metadata from ALL LA County Protocols
 *
 * Parses all 693 protocols from public/kb/ems_kb_clean.json and extracts:
 * - Base Hospital Contact requirements
 * - Patient positioning instructions
 * - Transport destination criteria
 * - Time-sensitive warnings
 * - Medication contraindications
 *
 * Output: data/protocol-metadata.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, '../public/kb/ems_kb_clean.json');
const OUTPUT_PATH = path.join(__dirname, '../data/protocol-metadata.json');

console.log('🔍 Loading knowledge base...');
const kb = JSON.parse(fs.readFileSync(KB_PATH, 'utf-8'));
console.log(`✅ Loaded ${kb.length} protocol chunks\n`);

const metadata = [];
let stats = {
  totalChunks: kb.length,
  baseContactFound: 0,
  positioningFound: 0,
  transportFound: 0,
  warningsFound: 0,
  contraindicationsFound: 0,
};

/**
 * Extract Base Hospital Contact requirements
 */
function extractBaseContact(content) {
  const baseContactPatterns = [
    /Base Hospital Contact:?\s*(Required|Mandatory)/i,
    /Base contact required/i,
    /Contact base hospital/i,
    /REQUIRED.*base/i,
  ];

  for (const pattern of baseContactPatterns) {
    if (pattern.test(content)) {
      // Extract specific criteria if mentioned
      const criteriaMatch = content.match(
        /Base Hospital Contact:?\s*Required\s*(?:for\s+)?([^.\n]+)/i
      );

      // Also check for specific scenarios
      const scenarioPatterns = [
        /pregnant.*seizure/i,
        /eclampsia/i,
        /cardiac arrest/i,
        /status epilepticus/i,
        /prolonged entrapment/i,
        /crush.*syndrome/i,
        />20.*weeks.*bleeding/i,
        /newborn.*delivery/i,
      ];

      const scenarios = [];
      for (const sp of scenarioPatterns) {
        const match = content.match(sp);
        if (match) scenarios.push(match[0]);
      }

      return {
        required: true,
        criteria: criteriaMatch ? criteriaMatch[1].trim() : null,
        scenarios: scenarios.length > 0 ? scenarios : null,
      };
    }
  }

  return { required: false, criteria: null, scenarios: null };
}

/**
 * Extract patient positioning instructions
 */
function extractPositioning(content) {
  const positions = [
    'left lateral decubitus',
    'lateral decubitus',
    'Semi-Fowler',
    'Fowler\'s',
    'Fowler',
    'high Fowler',
    'supine',
    'Trendelenburg',
    'reverse Trendelenburg',
    'lateral Sims',
    'recovery position',
    'sitting upright',
    'sniffing position',
  ];

  for (const pos of positions) {
    const regex = new RegExp(pos, 'i');
    const match = content.match(regex);
    if (match) {
      // Extract context around positioning
      const contextMatch = content.match(
        new RegExp(`([^.]{0,50}${pos}[^.]{0,50})`, 'i')
      );
      return {
        position: match[0],
        context: contextMatch ? contextMatch[1].trim() : null,
      };
    }
  }

  return null;
}

/**
 * Extract transport destination criteria
 */
function extractTransportDestination(content) {
  const destinations = [
    { name: 'Trauma Center', pattern: /Trauma Center/i },
    { name: 'Perinatal Center', pattern: /Perinatal Center/i },
    { name: 'Stroke Center', pattern: /Stroke Center/i },
    { name: 'Burn Center', pattern: /Burn Center/i },
    { name: 'STEMI Receiving Center', pattern: /STEMI.*Center/i },
    { name: 'EDAP', pattern: /EDAP/i },
    { name: 'NICU', pattern: /NICU/i },
    { name: 'Hyperbaric', pattern: /hyperbaric/i },
  ];

  const found = [];
  for (const dest of destinations) {
    if (dest.pattern.test(content)) {
      // Extract criteria if mentioned
      const criteriaPatterns = [
        new RegExp(`(BP\\s*[≥>]\\s*\\d+\\/\\d+[^.]*${dest.name})`, 'i'),
        new RegExp(`(${dest.name}[^.]*≤\\s*\\d+\\s*weeks)`, 'i'),
        new RegExp(`(${dest.name}[^.]*criteria)`, 'i'),
      ];

      let criteria = null;
      for (const cp of criteriaPatterns) {
        const match = content.match(cp);
        if (match) {
          criteria = match[1].trim();
          break;
        }
      }

      found.push({
        destination: dest.name,
        criteria,
      });
    }
  }

  return found.length > 0 ? found : null;
}

/**
 * Extract time-sensitive warnings
 */
function extractTimeWarnings(content) {
  const warningPatterns = [
    /do not delay\s+(?:transport)?[^.]+/i,
    /immediate\s+(?:transport|intervention)[^.]+/i,
    /emergent[^.]+/i,
    /rapid transport[^.]+/i,
    /within\s+\d+\s+min(?:ute)?s?[^.]+/i,
    /time-sensitive[^.]+/i,
    /time is.*(?:muscle|brain)[^.]+/i,
  ];

  const warnings = [];
  for (const pattern of warningPatterns) {
    const match = content.match(pattern);
    if (match) {
      warnings.push(match[0].trim());
    }
  }

  return warnings.length > 0 ? warnings : null;
}

/**
 * Extract medication contraindications
 */
function extractContraindications(content) {
  const contraindicationPatterns = [
    /Contraindications?:([^.\n]+(?:\.[^.\n]+)?)/gi,
    /CONTRAINDICATED\s+(?:if|in)[^.]+/gi,
    /Do not (?:give|administer)[^.]+/gi,
  ];

  const contraindications = [];
  for (const pattern of contraindicationPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      const text = match[1] ? match[1].trim() : match[0].trim();
      // Clean up
      const cleaned = text
        .replace(/^Contraindications?:\s*/i, '')
        .replace(/^CONTRAINDICATED\s+/i, '')
        .trim();
      if (cleaned && cleaned.length > 5) {
        contraindications.push(cleaned);
      }
    }
  }

  return contraindications.length > 0 ? [...new Set(contraindications)] : null;
}

/**
 * Extract protocol codes from chunk
 */
function extractProtocolCodes(chunk) {
  const codes = new Set();

  // TP codes
  const tpMatches = chunk.content.matchAll(/\b(?:TP|Protocol)\s*(\d{4}(?:-?P)?)/gi);
  for (const match of tpMatches) {
    codes.add(match[1]);
  }

  // Also check title
  if (chunk.title) {
    const titleMatch = chunk.title.match(/(\d{4}(?:-?P)?)/);
    if (titleMatch) codes.add(titleMatch[1]);
  }

  return codes.size > 0 ? Array.from(codes) : null;
}

// Process all chunks
console.log('🔍 Extracting metadata from all protocol chunks...\n');

for (const chunk of kb) {
  const baseContact = extractBaseContact(chunk.content);
  const positioning = extractPositioning(chunk.content);
  const transport = extractTransportDestination(chunk.content);
  const warnings = extractTimeWarnings(chunk.content);
  const contraindications = extractContraindications(chunk.content);
  const protocolCodes = extractProtocolCodes(chunk);

  // Update stats
  if (baseContact.required) stats.baseContactFound++;
  if (positioning) stats.positioningFound++;
  if (transport) stats.transportFound++;
  if (warnings) stats.warningsFound++;
  if (contraindications) stats.contraindicationsFound++;

  // Only add metadata if at least one critical element found
  if (
    baseContact.required ||
    positioning ||
    transport ||
    warnings ||
    contraindications
  ) {
    metadata.push({
      id: chunk.id,
      title: chunk.title || null,
      category: chunk.category || null,
      protocolCodes,
      baseContact,
      positioning,
      transport,
      warnings,
      contraindications,
    });
  }
}

// Sort by protocol codes for easier lookup
metadata.sort((a, b) => {
  const aCode = a.protocolCodes?.[0] || '';
  const bCode = b.protocolCodes?.[0] || '';
  return aCode.localeCompare(bCode);
});

// Write output
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(metadata, null, 2));

// Print statistics
console.log('✅ Metadata extraction complete!\n');
console.log('📊 Statistics:');
console.log(`   Total chunks processed: ${stats.totalChunks}`);
console.log(`   Chunks with critical elements: ${metadata.length}`);
console.log(`   Base Hospital Contact found: ${stats.baseContactFound}`);
console.log(`   Positioning instructions found: ${stats.positioningFound}`);
console.log(`   Transport criteria found: ${stats.transportFound}`);
console.log(`   Time-sensitive warnings found: ${stats.warningsFound}`);
console.log(`   Contraindications found: ${stats.contraindicationsFound}`);
console.log(`\n📁 Output: ${OUTPUT_PATH}`);
console.log(`   File size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)} KB`);

// Show sample entries
console.log('\n📋 Sample entries:');
console.log(JSON.stringify(metadata.slice(0, 3), null, 2));

// Coverage analysis
const coverage = ((metadata.length / stats.totalChunks) * 100).toFixed(1);
console.log(`\n✅ Coverage: ${coverage}% of protocol chunks have critical metadata`);
