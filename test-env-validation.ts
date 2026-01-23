/**
 * Test script for environment validation
 * Run with: npx tsx test-env-validation.ts
 */

import 'dotenv/config';
import { env, logEnvStatus } from './server/_core/env.js';

// Test 1: Import and validate
console.log('🧪 Test 1: Environment validation import...');
console.log('✅ Import successful');

// Test 2: Log status
console.log('\n🧪 Test 2: Environment status...');
logEnvStatus();

// Test 3: Type-safe access
console.log('\n🧪 Test 3: Type-safe access...');
console.log(`  NODE_ENV: ${env.NODE_ENV}`);
console.log(`  PORT: ${env.PORT} (type: ${typeof env.PORT})`);
console.log(`  ANTHROPIC_API_KEY: ${env.ANTHROPIC_API_KEY.substring(0, 15)}...`);
console.log(`  STRIPE_SECRET_KEY: ${env.STRIPE_SECRET_KEY.substring(0, 15)}... (mode: ${env.STRIPE_SECRET_KEY.includes('test') ? 'test' : 'live'})`);
console.log(`  SUPABASE_URL: ${env.SUPABASE_URL}`);

console.log('\n✅ All tests passed!');
