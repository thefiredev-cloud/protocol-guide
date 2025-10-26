/**
 * Database Connection Test Script
 * Tests Supabase connection and verifies schema setup
 */

import { dbHelpers } from '../lib/db/helpers';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Medic-Bot Database Connection Test                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const success = await dbHelpers.testConnection();

  if (success) {
    console.log('✅ All database tests passed!\n');
    console.log('Next steps:');
    console.log('  1. Run migrations: npm run db:migrate');
    console.log('  2. Enable dual-write: ENABLE_DB_AUDIT=true in .env.local');
    console.log('  3. Restart dev server: npm run dev\n');
    process.exit(0);
  } else {
    console.error('\n❌ Database connection failed!\n');
    console.error('Troubleshooting:');
    console.error('  1. Check environment variables in .env.local');
    console.error('  2. Verify Supabase project is active');
    console.error('  3. Review docs/DATABASE_SETUP.md for setup guide\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
