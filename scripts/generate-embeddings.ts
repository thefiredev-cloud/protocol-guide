/**
 * One-time script to generate embeddings for all protocols
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import 'dotenv/config';
import { generateAllEmbeddings } from '../server/_core/embeddings';

async function main() {
  console.log('=== Protocol Guide Manus - Embedding Generation ===\n');
  console.log('Starting embedding generation...');
  console.log('This may take a while for 55,000+ protocols.\n');

  const startTime = Date.now();

  const result = await generateAllEmbeddings({
    batchSize: 128,
    onProgress: (current, total) => {
      const percent = Math.round((current / total) * 100);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const rate = current / elapsed || 0;
      const remaining = Math.round((total - current) / rate) || 0;
      console.log(
        `Progress: ${current.toLocaleString()}/${total.toLocaleString()} (${percent}%) | ` +
        `Elapsed: ${elapsed}s | ETA: ${remaining}s`
      );
    },
  });

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  console.log('\n=== Complete ===');
  console.log(`Processed: ${result.processed.toLocaleString()}`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Total time: ${totalTime}s (${Math.round(totalTime / 60)}min)`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
