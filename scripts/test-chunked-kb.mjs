/**
 * Test script for chunked KB loading
 * This simulates how the chunked KB would work in the browser
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_PATH = path.join(__dirname, '..', 'public', 'kb', 'manifest.json');
const CHUNKS_DIR = path.join(__dirname, '..', 'public', 'kb', 'chunks');

async function testChunkedKB() {
  console.log('Testing Chunked Knowledge Base...\n');

  // 1. Load manifest
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'));
  console.log('✓ Loaded manifest');
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Generated: ${manifest.generatedAt}`);
  console.log(`  Total chunks: ${manifest.chunks.length}\n`);

  // 2. Calculate initial load size (just manifest + essential chunks)
  const manifestSize = (await fs.stat(MANIFEST_PATH)).size;
  const essentialCategories = ['Medication', 'Protocol', 'Clinical Decision Support'];

  let essentialSize = manifestSize;
  console.log('Initial load (manifest + essential chunks):');
  console.log(`  manifest.json: ${(manifestSize / 1024).toFixed(2)} KB`);

  for (const chunk of manifest.chunks) {
    if (essentialCategories.includes(chunk.category)) {
      const chunkPath = path.join(CHUNKS_DIR, chunk.filename);
      const chunkSize = (await fs.stat(chunkPath)).size;
      essentialSize += chunkSize;
      console.log(`  ${chunk.filename}: ${(chunkSize / 1024).toFixed(2)} KB`);
    }
  }

  console.log(`\n  Total initial load: ${(essentialSize / 1024).toFixed(2)} KB`);
  console.log(`  Reduction: ${((1 - essentialSize / (10.62 * 1024 * 1024)) * 100).toFixed(1)}%\n`);

  // 3. Test loading a specific chunk
  const testCategory = 'Medication';
  const testChunk = manifest.chunks.find(c => c.category === testCategory);

  if (testChunk) {
    console.log(`Testing chunk load: ${testChunk.filename}`);
    const chunkPath = path.join(CHUNKS_DIR, testChunk.filename);
    const chunkData = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));

    console.log(`✓ Loaded ${chunkData.length} documents`);
    console.log(`  Sample document:`, {
      id: chunkData[0].id,
      title: chunkData[0].title,
      category: chunkData[0].category,
    });
  }

  // 4. Show chunking strategy benefits
  console.log('\n' + '='.repeat(60));
  console.log('CHUNKING STRATEGY BENEFITS');
  console.log('='.repeat(60));
  console.log('Before: 10.62 MB loaded on every page');
  console.log(`After:  ~${(essentialSize / 1024).toFixed(0)} KB loaded initially (${((essentialSize / (10.62 * 1024 * 1024)) * 100).toFixed(1)}%)`);
  console.log('\nLazy loading strategy:');
  console.log('  - Essential chunks loaded upfront (medication, protocols)');
  console.log('  - Large chunks (markdown) loaded on-demand');
  console.log('  - Pediatric dosing loaded when needed');
  console.log('  - IndexedDB caches loaded chunks');
  console.log('  - Service Worker provides offline access');
  console.log('='.repeat(60));
}

testChunkedKB().catch(console.error);
