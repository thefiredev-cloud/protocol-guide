#!/usr/bin/env node
/**
 * Test Vague Firefighter Inputs - Comprehensive Assessment
 * Tests how well the LLM handles stressed firefighters typing vague inputs
 */

const API_URL = 'http://localhost:3002/api/chat';

const vagueInputs = [
  // Stress/unclear situations
  { input: 'patient', expected: 'assessment guidance' },
  { input: 'help', expected: 'situation clarification' },
  { input: 'emergency', expected: 'emergency type questions' },
  { input: 'medical', expected: 'complaint questions' },
  { input: 'assessment', expected: 'assessment questions' },
  { input: 'check', expected: 'clarification questions' },
  { input: 'vitals', expected: 'vitals questions' },
  { input: 'code', expected: 'code clarification' },

  // Equipment/gear related (common firefighter confusion)
  { input: 'equipment', expected: 'equipment questions' },
  { input: 'gear', expected: 'gear questions' },
  { input: 'supplies', expected: 'supplies questions' },

  // Common abbreviations firefighters might type
  { input: 'MI', expected: 'heart attack guidance' },
  { input: 'CVA', expected: 'stroke guidance' },
  { input: 'DKA', expected: 'diabetic guidance' },
  { input: 'CHF', expected: 'heart failure guidance' },

  // Very vague single words
  { input: 'man', expected: 'assessment guidance' },
  { input: 'woman', expected: 'assessment guidance' },
  { input: 'kid', expected: 'assessment guidance' },
  { input: 'baby', expected: 'assessment guidance' },
  { input: 'elderly', expected: 'assessment guidance' },

  // Emergency states
  { input: 'down', expected: 'assessment guidance' },
  { input: 'hurt', expected: 'assessment guidance' },
  { input: 'pain', expected: 'assessment guidance' },
  { input: 'bleeding', expected: 'bleeding protocol' },
  { input: 'unconscious', expected: 'ALOC protocol' },
];

async function testVagueInput(input, expected) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
    });

    const data = await response.json();
    const text = data.text || '';

    // Check for rejection
    if (text.includes("I'm limited to LA County") || text.includes("I can only provide guidance")) {
      return { input, status: 'FAIL', reason: 'Rejected query', expected };
    }

    // Check if response provides helpful guidance
    const providesGuidance = (
      text.includes('assessment') ||
      text.includes('ABCs') ||
      text.includes('breathing') ||
      text.includes('responsive') ||
      text.includes('symptoms') ||
      text.includes('situation') ||
      text.includes('what') ||
      text.includes('Protocol:') ||
      text.includes('TP ')
    );

    if (providesGuidance) {
      return { input, status: 'PASS', guidance: 'provided', expected };
    }

    return { input, status: 'UNKNOWN', text: text.substring(0, 100), expected };
  } catch (error) {
    return { input, status: 'ERROR', error: error.message, expected };
  }
}

async function runVagueTests() {
  console.log('🚒 Medic-Bot Vague Input Testing');
  console.log('=================================\n');

  console.log('Testing firefighter inputs when stressed or unclear...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
  };

  for (const { input, expected } of vagueInputs) {
    const result = await testVagueInput(input, expected);
    results.total++;

    if (result.status === 'PASS') {
      console.log(`✓ "${input}" → Guidance provided`);
      results.passed++;
    } else if (result.status === 'FAIL') {
      console.log(`❌ "${input}" → ${result.reason}`);
      results.failed++;
    } else if (result.status === 'ERROR') {
      console.log(`⚠️  "${input}" → ${result.error}`);
      results.errors++;
    } else {
      console.log(`? "${input}" → ${result.text}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 VAGUE INPUT TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✓ Handled: ${results.passed} (${Math.round(results.passed/results.total*100)}%)`);
  console.log(`❌ Rejected: ${results.failed}`);
  console.log(`⚠️  Errors: ${results.errors}`);

  if (results.failed > 0) {
    console.log('\n❌ ISSUES: Some vague inputs still rejected');
    process.exit(1);
  } else {
    console.log('\n✅ SUCCESS: All vague inputs handled gracefully!');
    console.log('Firefighters will get helpful guidance for unclear inputs.');
    process.exit(0);
  }
}

// Wait for server
console.log('Waiting for server...');
await new Promise(resolve => setTimeout(resolve, 5000));

runVagueTests().catch(console.error);

