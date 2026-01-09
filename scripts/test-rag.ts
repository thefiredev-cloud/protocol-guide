import { retrieveContext } from '../lib/rag/retrieval';

const testQueries = [
  'STEMI protocol',
  'cardiac arrest algorithm',
  'epinephrine dosing cardiac arrest',
];

async function main() {
  for (const q of testQueries) {
    console.log('\n' + '='.repeat(50));
    console.log('Query:', q);
    console.log('='.repeat(50));
    try {
      const result = await retrieveContext(q, null);
      console.log('Declined:', result.declined);
      console.log('Confidence:', result.confidence);
      console.log('Chunks:', result.chunks.length);
      if (result.chunks.length > 0) {
        console.log('\nTop 3 results:');
        result.chunks.slice(0, 3).forEach((chunk, i) => {
          console.log(`  ${i + 1}. ${chunk.protocolRef} - ${chunk.protocolTitle}`);
          console.log(`     Score: ${chunk.relevanceScore.toFixed(4)}`);
          console.log(`     Match: ${chunk.matchType}`);
        });
      }
    } catch (e: any) {
      console.log('Error:', e.message);
    }
  }
}

main().catch(console.error);
