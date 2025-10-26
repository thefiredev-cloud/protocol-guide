/**
 * Database Migration Runner
 * Discovers migration files and provides guidance for manual execution
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { db } from '../lib/db/client';

async function runMigrations() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║            Database Migration Runner                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check if database is available
  if (!db.isAvailable) {
    console.error('❌ Database not configured!');
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n');
    process.exit(1);
  }

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

  // Get all migration files
  // Check if migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    console.log('⚠️  Migrations directory not found:', migrationsDir);
    return;
  }

  // Get all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No migration files found in', migrationsDir);
    return;
  }

  console.log(`Found ${files.length} migration files:\n`);

  for (const file of files) {
    console.log(`  - ${file}`);
  }

  console.log('\n⚠️  WARNING: This script requires PostgreSQL direct access.');
  console.log('Use one of these methods instead:\n');
  console.log('1. Supabase Dashboard:');
  console.log('   - Go to SQL Editor');
  console.log('   - Copy/paste each migration file');
  console.log('   - Run manually\n');
  console.log('2. Supabase CLI:');
  console.log('   - Install: npm install -g supabase');
  console.log('   - Link: supabase link --project-ref <your-project-id>');
  console.log('   - Push: supabase db push\n');
  console.log('3. PostgreSQL psql:');
  console.log('   - Get connection string from Supabase dashboard');
  console.log('   - Run: psql "connection-string" -f supabase/migrations/001_audit_logs.sql\n');

  console.log('See docs/DATABASE_SETUP.md for detailed instructions.\n');
}

runMigrations().catch(error => {
  console.error('\n💥 Error:', error);
  process.exit(1);
});
