import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_FILE = path.join(__dirname, '..', 'data', 'ems_kb_clean.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'kb', 'chunks');

async function chunkKnowledgeBase() {
  console.log('Starting KB chunking...\n');

  // Read full KB
  const kbData = JSON.parse(await fs.readFile(KB_FILE, 'utf-8'));
  console.log(`Loaded ${kbData.length} documents from KB`);

  // Group by category
  const chunks = {};
  for (const doc of kbData) {
    const category = doc.category || 'general';
    if (!chunks[category]) chunks[category] = [];
    chunks[category].push(doc);
  }

  // Write chunks
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let totalSize = 0;
  const chunkStats = [];

  for (const [category, docs] of Object.entries(chunks)) {
    const filename = `${category.toLowerCase().replace(/\s+/g, '-')}.json`;
    const content = JSON.stringify(docs, null, 2);
    const filePath = path.join(OUTPUT_DIR, filename);

    await fs.writeFile(filePath, content);

    const sizeBytes = Buffer.byteLength(content, 'utf-8');
    const sizeKB = (sizeBytes / 1024).toFixed(2);
    totalSize += sizeBytes;

    chunkStats.push({
      category,
      filename,
      count: docs.length,
      sizeKB: parseFloat(sizeKB),
      sizeBytes
    });

    console.log(`✓ Created ${filename} (${docs.length} docs, ${sizeKB} KB)`);
  }

  // Create manifest
  const manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    chunks: Object.keys(chunks).map(cat => ({
      category: cat,
      filename: `${cat.toLowerCase().replace(/\s+/g, '-')}.json`,
      count: chunks[cat].length,
      sizeKB: chunkStats.find(s => s.category === cat)?.sizeKB || 0
    }))
  };

  const manifestPath = path.join(__dirname, '..', 'public', 'kb', 'manifest.json');
  await fs.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2)
  );

  // Get original file size
  const originalStats = await fs.stat(KB_FILE);
  const originalSizeMB = (originalStats.size / (1024 * 1024)).toFixed(2);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('CHUNKING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Created manifest.json`);
  console.log(`✓ Total chunks: ${Object.keys(chunks).length}`);
  console.log(`✓ Total documents: ${kbData.length}`);
  console.log(`✓ Original size: ${originalSizeMB} MB`);
  console.log(`✓ Total chunks size: ${totalSizeMB} MB`);
  console.log(`✓ Compression: ${((totalSize / originalStats.size) * 100).toFixed(1)}%`);
  console.log('\nChunk breakdown:');
  chunkStats
    .sort((a, b) => b.sizeKB - a.sizeKB)
    .forEach(stat => {
      console.log(`  ${stat.category.padEnd(25)} ${stat.count.toString().padStart(5)} docs  ${stat.sizeKB.toString().padStart(8)} KB`);
    });
  console.log('='.repeat(60));
}

chunkKnowledgeBase().catch(console.error);
