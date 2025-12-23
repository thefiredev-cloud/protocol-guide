#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/kb/chunks/markdown.json');
const OUTPUT_DIR = path.join(__dirname, '../public/kb/chunks');
const MANIFEST_FILE = path.join(__dirname, '../public/kb/manifest.json');

/**
 * Categorize a document based on its content and reference number
 * Priority order: medications > cardiac > airway > trauma > pediatrics >
 *                 respiratory > environmental > obstetric > toxicology >
 *                 general-protocols > administrative > reference > general
 */
function categorizeDocument(doc) {
  const title = doc.title || '';
  const content = doc.content || '';
  const combined = (title + ' ' + content).toLowerCase();

  // Check for medication protocols (highest priority - most specific)
  if (
    content.match(/REFERENCE NO\. 1317/) ||
    title.match(/1317\./) ||
    content.includes('DRUG REFERENCE')
  ) {
    return 'medications';
  }

  // Check for cardiac protocols (1200-1230 range)
  if (
    content.match(/REFERENCE NO\. 12[0-2][0-9]/) ||
    title.match(/\b12[0-2][0-9]/) ||
    (combined.includes('cardiac arrest') && combined.includes('protocol')) ||
    (combined.includes('chest pain') && combined.includes('protocol')) ||
    (combined.includes('stroke') && combined.includes('protocol'))
  ) {
    return 'cardiac';
  }

  // Check for airway/ventilation protocols (1100-1139 range only)
  // Must have reference number OR be specifically titled airway protocol
  if (
    content.match(/REFERENCE NO\. 11[0-3][0-9]/) ||
    (title.match(/\b11[0-3][0-9]/) && combined.includes('protocol'))
  ) {
    return 'airway';
  }

  // Check for trauma protocols (1300-1369 range, excluding 1317)
  if (
    content.match(/REFERENCE NO\. 13[0-6][0-9]/) ||
    title.match(/\b13[0-6][0-9]/) ||
    (combined.includes('trauma') && combined.includes('protocol')) ||
    (combined.includes('burn') && combined.includes('protocol')) ||
    (combined.includes('hemorrhage') && combined.includes('protocol'))
  ) {
    return 'trauma';
  }

  // Check for pediatric protocols (1400+ range)
  if (
    content.match(/REFERENCE NO\. 14[0-9]{2}/) ||
    title.match(/\b14[0-9]{2}/) ||
    (combined.includes('pediatric') && combined.includes('protocol')) ||
    (combined.includes('neonatal') && combined.includes('protocol')) ||
    (combined.includes('infant') && combined.includes('protocol'))
  ) {
    return 'pediatrics';
  }

  // Respiratory conditions (non-airway management)
  if (
    combined.includes('asthma') ||
    combined.includes('copd') ||
    combined.includes('dyspnea') ||
    combined.includes('respiratory distress')
  ) {
    return 'respiratory';
  }

  // Environmental emergencies
  if (
    combined.includes('hypothermia') ||
    combined.includes('hyperthermia') ||
    combined.includes('heat stroke') ||
    combined.includes('drowning') ||
    combined.includes('environmental')
  ) {
    return 'environmental';
  }

  // Obstetric/Gynecologic
  if (
    combined.includes('obstetric') ||
    combined.includes('pregnancy') ||
    combined.includes('delivery') ||
    combined.includes('gynecolog')
  ) {
    return 'obstetric';
  }

  // Toxicology/Poisoning
  if (
    combined.includes('poison') ||
    combined.includes('toxicolog') ||
    combined.includes('overdose') ||
    combined.includes('ingestion')
  ) {
    return 'toxicology';
  }

  // Equipment and procedures (1000-1099 range)
  if (
    content.match(/REFERENCE NO\. 10[0-9]{2}/)
  ) {
    return 'equipment';
  }

  // Clinical protocols (general medical protocols)
  if (
    content.match(/REFERENCE NO\. \d{4}/) ||
    (title.match(/\b\d{4}\b/) && combined.includes('protocol') && !combined.includes('training'))
  ) {
    return 'general-protocols';
  }

  // Administrative documents - split by reference number ranges for better chunking
  // Facilities & Systems (300-399)
  if (content.match(/REFERENCE NO\. 3[0-9]{2}(?![0-9])/)) {
    return 'admin-facilities';
  }

  // Provider Certification & Operations (400-499)
  if (content.match(/REFERENCE NO\. 4[0-9]{2}(?![0-9])/)) {
    return 'admin-provider';
  }

  // Training & Education (500-599)
  if (content.match(/REFERENCE NO\. 5[0-9]{2}(?![0-9])/)) {
    return 'admin-training';
  }

  // Quality & Performance (600-699)
  if (content.match(/REFERENCE NO\. 6[0-9]{2}(?![0-9])/)) {
    return 'admin-quality';
  }

  // Field Operations & Communications (700-799)
  if (content.match(/REFERENCE NO\. 7[0-9]{2}(?![0-9])/)) {
    return 'admin-operations';
  }

  // Special Events & Services (800-899)
  if (content.match(/REFERENCE NO\. 8[0-9]{2}(?![0-9])/)) {
    return 'admin-events';
  }

  // General Policies (900-999)
  if (content.match(/REFERENCE NO\. 9[0-9]{2}(?![0-9])/)) {
    return 'admin-policy';
  }

  // Other administrative content (no ref number but admin keywords)
  if (
    combined.includes('policy') ||
    combined.includes('procedure') ||
    combined.includes('training') ||
    combined.includes('certification') ||
    combined.includes('license') ||
    combined.includes('approval')
  ) {
    return 'admin-general';
  }

  // Reference materials (standards, guidelines, forms, data dictionaries)
  if (
    combined.includes('data dictionary') ||
    combined.includes('instruction manual') ||
    combined.includes('standard') ||
    combined.includes('guideline') ||
    combined.includes('form') ||
    combined.includes('log') ||
    combined.includes('checklist')
  ) {
    return 'reference';
  }

  // Everything else goes to general
  return 'general';
}

/**
 * Calculate file size in KB
 */
function getFileSizeKB(filepath) {
  const stats = fs.statSync(filepath);
  return Number((stats.size / 1024).toFixed(2));
}

/**
 * Main function to split markdown.json into category chunks
 */
async function main() {
  console.log('Reading markdown.json...');
  const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
  const documents = JSON.parse(rawData);

  console.log(`Total documents: ${documents.length}`);
  console.log(`Original file size: ${(rawData.length / 1024 / 1024).toFixed(2)} MB\n`);

  // Categorize all documents
  const categories = {
    airway: [],
    cardiac: [],
    trauma: [],
    medications: [],
    pediatrics: [],
    respiratory: [],
    environmental: [],
    obstetric: [],
    toxicology: [],
    equipment: [],
    'general-protocols': [],
    'admin-facilities': [],
    'admin-provider': [],
    'admin-training': [],
    'admin-quality': [],
    'admin-operations': [],
    'admin-events': [],
    'admin-policy': [],
    'admin-general': [],
    reference: [],
    general: []
  };

  documents.forEach(doc => {
    const category = categorizeDocument(doc);
    categories[category].push(doc);
  });

  // Write category chunks
  console.log('Writing category chunks...\n');
  const chunkMetadata = [];

  for (const [category, docs] of Object.entries(categories)) {
    if (docs.length === 0) continue;

    const filename = `${category}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(docs, null, 2));

    const sizeKB = getFileSizeKB(filepath);
    const sizeMB = (sizeKB / 1024).toFixed(2);

    chunkMetadata.push({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      filename,
      count: docs.length,
      sizeKB
    });

    console.log(`${category.padEnd(15)} ${docs.length.toString().padStart(5)} docs  ${sizeMB.padStart(6)} MB  ${filename}`);

    // Warn if chunk is still too large
    if (sizeKB > 2048) {
      console.log(`  ⚠️  WARNING: ${filename} is ${sizeMB} MB (> 2MB target)`);
    }
  }

  // Update manifest.json
  console.log('\nUpdating manifest.json...');

  // Read existing manifest to preserve other chunks
  let manifest = {
    version: '2.1',
    generatedAt: new Date().toISOString(),
    chunks: []
  };

  if (fs.existsSync(MANIFEST_FILE)) {
    const existingManifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
    // Keep non-Markdown chunks and non-category chunks that we're creating
    const categoriesToReplace = new Set([
      'Markdown', 'Airway', 'Cardiac', 'Trauma', 'Medications', 'Pediatrics',
      'Respiratory', 'Environmental', 'Obstetric', 'Toxicology', 'Equipment',
      'General-protocols', 'Admin-facilities', 'Admin-provider', 'Admin-training',
      'Admin-quality', 'Admin-operations', 'Admin-events', 'Admin-policy',
      'Admin-general', 'Administrative', 'Reference', 'General'
    ]);
    manifest.chunks = existingManifest.chunks.filter(c => !categoriesToReplace.has(c.category));
  }

  // Add new category chunks
  manifest.chunks.push(...chunkMetadata);

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated successfully!');

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total chunks: ${manifest.chunks.length}`);
  console.log(`Total documents: ${documents.length}`);

  const totalSize = manifest.chunks.reduce((sum, chunk) => sum + chunk.sizeKB, 0);
  console.log(`Total size: ${(totalSize / 1024).toFixed(2)} MB`);

  const largeChunks = chunkMetadata.filter(c => c.sizeKB > 2048);
  if (largeChunks.length > 0) {
    console.log(`\n⚠️  ${largeChunks.length} chunk(s) exceed 2MB target`);
  } else {
    console.log('\n✓ All chunks are under 2MB');
  }

  console.log('\nDone! You can now delete markdown.json if desired.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
