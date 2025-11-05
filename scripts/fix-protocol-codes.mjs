#!/usr/bin/env node

/**
 * Fix Invalid Protocol Codes Script
 *
 * Problem: 1,658/1,663 entries have invalid protocol codes (1000s range instead of valid 1200s)
 * Solution: Remove invalid codes and extract valid LA County codes from content
 *
 * Valid LA County protocol codes: 1201-1244 (with -P pediatric variants)
 * Invalid codes to remove: 1011, 1016, 1018, 1020, 1021, 1027, 1028, etc.
 *
 * Usage: node scripts/fix-protocol-codes.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fix Invalid Protocol Codes');
console.log('='.repeat(80));

// Load data files
console.log('\n📂 Loading data files...');
const metadataPath = path.join(ROOT_DIR, 'data', 'protocol-metadata.json');
const piPath = path.join(ROOT_DIR, 'data', 'provider_impressions.json');
const kbPath = path.join(ROOT_DIR, 'data', 'ems_kb_clean.json');

if (!fs.existsSync(metadataPath) || !fs.existsSync(piPath)) {
  console.error('❌ Required data files not found');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const providerImpressions = JSON.parse(fs.readFileSync(piPath, 'utf-8'));

console.log(`   ✓ Loaded ${metadata.length} metadata entries`);
console.log(`   ✓ Loaded ${providerImpressions.length} protocol definitions`);

// Build valid protocol codes set from LA County provider impressions
const validCodes = new Set();
providerImpressions.forEach(pi => {
  validCodes.add(pi.tp_code);
  if (pi.tp_code_pediatric) {
    validCodes.add(pi.tp_code_pediatric);
  }
});

console.log(`\n✅ Valid LA County protocol codes: ${validCodes.size}`);
console.log(`   Range: ${Array.from(validCodes).sort()[0]} - ${Array.from(validCodes).sort().pop()}`);
console.log(`   Examples: ${Array.from(validCodes).sort().slice(0, 10).join(', ')}`);

// Create ID-to-content mapping from knowledge base (if exists)
const idToContent = new Map();
if (fs.existsSync(kbPath)) {
  const knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
  console.log(`   ✓ Loaded ${knowledgeBase.length} knowledge base chunks`);

  knowledgeBase.forEach(chunk => {
    // Use 'text' field (after fix) or 'content' field (before fix)
    const text = chunk.text || chunk.content;
    if (text) {
      idToContent.set(chunk.id, text);
    }
  });
}

/**
 * Extract valid protocol codes from text content
 */
function extractProtocolCodesFromText(text) {
  if (!text) return [];

  const codes = new Set();

  // Match patterns:
  // - "TP 1234" or "TP-1234"
  // - "Protocol 1234" or "Protocol-1234"
  // - "Treatment Protocol 1234"
  // - "1234" or "1234-P" (standalone 4-digit codes)
  const patterns = [
    /\bTP[- ]?(\d{4}(?:-P)?)\b/gi,
    /\bProtocol[- ]?(\d{4}(?:-P)?)\b/gi,
    /\bTreatment Protocol[- ]?(\d{4}(?:-P)?)\b/gi,
    /\b(12\d{2}(?:-P)?)\b/g  // LA County codes are 12XX
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const code = match[1];
      if (validCodes.has(code)) {
        codes.add(code);
      }
    }
  }

  return Array.from(codes);
}

/**
 * Extract protocol code from ID
 */
function extractCodeFromId(id) {
  // Match 4-digit codes in the 1200 range
  const match = id.match(/\b(12\d{2}(?:-P)?)\b/);
  if (match && validCodes.has(match[1])) {
    return match[1];
  }
  return null;
}

// Statistics
const stats = {
  total: metadata.length,
  invalidRemoved: 0,
  extractedFromContent: 0,
  extractedFromId: 0,
  alreadyValid: 0,
  stillInvalid: 0,
  noCodesAfterFix: 0
};

// Create backup
const backupPath = metadataPath + '.backup';
if (!fs.existsSync(backupPath)) {
  console.log('\n💾 Creating backup...');
  fs.copyFileSync(metadataPath, backupPath);
  console.log(`   ✓ Backed up to: ${path.basename(backupPath)}`);
}

// Fix protocol codes
console.log('\n🔧 Fixing protocol codes...');
let progress = 0;

for (const entry of metadata) {
  progress++;
  if (progress % 500 === 0) {
    console.log(`   Processing: ${progress}/${metadata.length}...`);
  }

  const originalCodes = entry.protocolCodes || [];
  const validCodesInEntry = originalCodes.filter(code => validCodes.has(code));
  const invalidCodesInEntry = originalCodes.filter(code => !validCodes.has(code));

  // Track invalid codes removed
  if (invalidCodesInEntry.length > 0) {
    stats.invalidRemoved += invalidCodesInEntry.length;
  }

  // If already all valid, skip
  if (invalidCodesInEntry.length === 0 && validCodesInEntry.length > 0) {
    stats.alreadyValid++;
    continue;
  }

  // Start with valid codes
  const newCodes = new Set(validCodesInEntry);

  // Try to extract from content
  const content = idToContent.get(entry.id);
  if (content) {
    const extracted = extractProtocolCodesFromText(content);
    if (extracted.length > 0) {
      extracted.forEach(code => newCodes.add(code));
      stats.extractedFromContent++;
    }
  }

  // Try to extract from ID as fallback
  if (newCodes.size === 0) {
    const codeFromId = extractCodeFromId(entry.id);
    if (codeFromId) {
      newCodes.add(codeFromId);
      stats.extractedFromId++;
    }
  }

  // Update entry
  if (newCodes.size > 0) {
    entry.protocolCodes = Array.from(newCodes).sort();
  } else {
    entry.protocolCodes = [];
    stats.noCodesAfterFix++;
  }
}

// Save fixed data
console.log('\n💾 Saving fixed data...');
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
console.log(`   ✓ Saved to: ${path.basename(metadataPath)}`);

// Validation
console.log('\n✅ Validating fixes...');
let validEntries = 0;
let invalidEntries = 0;
let emptyEntries = 0;

for (const entry of metadata) {
  if (!entry.protocolCodes || entry.protocolCodes.length === 0) {
    emptyEntries++;
    continue;
  }

  const hasInvalid = entry.protocolCodes.some(code => !validCodes.has(code));
  if (hasInvalid) {
    invalidEntries++;
  } else {
    validEntries++;
  }
}

stats.stillInvalid = invalidEntries;

// Final summary
console.log('\n' + '='.repeat(80));
console.log('📊 SUMMARY');
console.log('='.repeat(80));
console.log(`Total entries:                ${stats.total}`);
console.log(`Already had valid codes:      ${stats.alreadyValid}`);
console.log(`Invalid codes removed:        ${stats.invalidRemoved}`);
console.log(`Extracted from content:       ${stats.extractedFromContent}`);
console.log(`Extracted from ID:            ${stats.extractedFromId}`);
console.log(`No codes after fix:           ${stats.noCodesAfterFix}`);
console.log(``);
console.log(`✅ Entries with valid codes:  ${validEntries}`);
console.log(`⚠️  Entries with no codes:     ${emptyEntries}`);
console.log(`❌ Entries still invalid:     ${invalidEntries}`);

if (invalidEntries === 0) {
  console.log('\n🎉 SUCCESS: All protocol codes are now valid!');
  console.log('✅ Invalid protocol codes issue RESOLVED');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${invalidEntries} entries still have invalid codes`);
  console.log('   These may require manual review');

  // Show sample of remaining invalid entries
  let count = 0;
  console.log('\n   Sample invalid entries:');
  for (const entry of metadata) {
    if (entry.protocolCodes && entry.protocolCodes.some(code => !validCodes.has(code))) {
      const invalid = entry.protocolCodes.filter(code => !validCodes.has(code));
      console.log(`      ${entry.id}: ${invalid.join(', ')}`);
      count++;
      if (count >= 5) break;
    }
  }

  process.exit(1);
}
