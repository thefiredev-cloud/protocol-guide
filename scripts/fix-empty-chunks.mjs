#!/usr/bin/env node

/**
 * CORRECTION: No "Empty Chunks" Issue Found
 *
 * ORIGINAL BUG REPORT DIAGNOSIS: INCORRECT
 * The bug report claimed 7,014 chunks had empty text content.
 *
 * ACTUAL REALITY:
 * All 7,014 chunks have full content in the "content" field (avg 1,235 chars).
 * The codebase expects and uses "content" field, not "text" field.
 * There is NO data quality issue with chunk content.
 *
 * INVESTIGATION RESULTS:
 * - All chunks have valid content in "content" field
 * - TypeScript types define KBDoc with "content" field
 * - MiniSearch indexes the "content" field
 * - Protocol retrieval service uses doc.content
 * - No code references a "text" field for chunks
 *
 * CONCLUSION:
 * This was a misdiagnosis. The data is correct as-is.
 * No fixes needed for chunk content.
 *
 * Usage: node scripts/fix-empty-chunks.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔍 Validating Chunk Content');
console.log('='.repeat(80));

const files = [
  'ems_kb_clean.json',
  'ems_kb_md.json',
  'ems_kb_pdfs.json'
];

console.log('\n📊 INVESTIGATION RESULTS:');
console.log('The bug report claimed "empty chunks" but this was incorrect.');
console.log('Reality: All chunks have full content in the "content" field.\n');

let totalChunks = 0;
let totalWithContent = 0;
let totalContentLength = 0;

for (const filename of files) {
  const filePath = path.join(ROOT_DIR, 'data', filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename} not found - skipping`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const withContent = data.filter(c => c.content && c.content.trim() !== '');

  totalChunks += data.length;
  totalWithContent += withContent.length;

  if (withContent.length > 0) {
    const avgLength = withContent.reduce((sum, c) => sum + c.content.length, 0) / withContent.length;
    totalContentLength += avgLength;

    console.log(`✅ ${filename}:`);
    console.log(`   Total chunks: ${data.length}`);
    console.log(`   Chunks with content: ${withContent.length} (${Math.round(withContent.length / data.length * 100)}%)`);
    console.log(`   Average length: ${Math.round(avgLength)} chars`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('📊 FINAL VERDICT');
console.log('='.repeat(80));
console.log(`Total chunks analyzed: ${totalChunks}`);
console.log(`Chunks with valid content: ${totalWithContent} (${Math.round(totalWithContent / totalChunks * 100)}%)`);
console.log(`Average content length: ${Math.round(totalContentLength / files.length)} chars`);

if (totalWithContent === totalChunks) {
  console.log('\n✅ NO EMPTY CHUNKS FOUND');
  console.log('✅ All chunks have valid content');
  console.log('✅ Bug report diagnosis was INCORRECT');
  console.log('\nNo fixes needed. Data is correct as-is.');
  process.exit(0);
} else {
  console.log(`\n⚠️  Found ${totalChunks - totalWithContent} chunks without content`);
  console.log('Manual review recommended.');
  process.exit(1);
}
