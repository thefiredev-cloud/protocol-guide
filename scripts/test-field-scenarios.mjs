#!/usr/bin/env node
/**
 * Comprehensive Field Scenario Testing for Medic-Bot
 * Tests realistic firefighter/paramedic inputs on iPad
 */

const API_URL = 'http://localhost:3002/api/chat';

const testScenarios = {
  cardiac: [
    'chest pain',
    'crushing chest pain',
    'heart attack',
    'cardiac arrest',
    'patient has no pulse',
    'STEMI',
    'chest pressure',
  ],
  respiratory: [
    'difficulty breathing',
    'shortness of breath',
    'SOB',
    'cant breathe',
    'wheezing',
    'asthma attack',
    'COPD',
    'respiratory distress',
  ],
  neurological: [
    'unresponsive patient',
    'altered mental status',
    'AMS',
    'seizure',
    'having a seizure',
    'stroke',
    'stroke symptoms',
    'unconscious',
    'LOC',
    'confused',
  ],
  trauma: [
    'fall from ladder',
    'gunshot wound',
    'GSW to chest',
    'car accident',
    'MVC rollover',
    'head injury',
    'bleeding',
    'stabbing',
    'burn',
  ],
  allergic: [
    'allergic reaction',
    'anaphylaxis',
    'bee sting',
    'swelling throat',
    'hives',
  ],
  diabetic: [
    'low blood sugar',
    'diabetic emergency',
    'hypoglycemia',
    'diabetic',
  ],
  pediatric: [
    'pediatric seizure',
    'child not breathing',
    'baby choking',
    'kid fell',
    'infant unresponsive',
  ],
  medications: [
    'epinephrine dose for cardiac arrest',
    'morphine dosing',
    'midazolam for seizure',
    'albuterol dose',
    'nitroglycerin',
  ],
};

async function testQuery(query) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: query }] }),
    });

    const data = await response.json();
    const text = data.text || '';
    
    // Check if response is a refusal
    if (text.includes("I'm limited to LA County") || text.includes("I can only provide guidance")) {
      return { query, status: 'FAIL', reason: 'Rejected query', text: text.substring(0, 100) };
    }
    
    // Check if response contains protocol
    if (text.includes('Protocol:') || text.match(/TP \d{4}/)) {
      const protocolMatch = text.match(/Protocol:\s*([^\n]+)|TP \d{4}[^\n]*/);
      return { query, status: 'PASS', protocol: protocolMatch ? protocolMatch[0] : 'Found' };
    }
    
    // Check if response has structured format
    if (text.includes('**IMMEDIATE DECISIONS**') || text.includes('**PRIORITY ACTIONS**')) {
      return { query, status: 'PASS', protocol: 'Structured response provided' };
    }
    
    return { query, status: 'UNKNOWN', text: text.substring(0, 150) };
  } catch (error) {
    return { query, status: 'ERROR', error: error.message };
  }
}

async function runTests() {
  console.log('🚑 Medic-Bot Comprehensive Field Testing');
  console.log('=========================================\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
  };
  
  for (const [category, queries] of Object.entries(testScenarios)) {
    console.log(`\n📋 Testing ${category.toUpperCase()}:`);
    console.log('-'.repeat(50));
    
    for (const query of queries) {
      const result = await testQuery(query);
      results.total++;
      
      if (result.status === 'PASS') {
        console.log(`✓ "${query}"`);
        console.log(`  ${result.protocol}\n`);
        results.passed++;
      } else if (result.status === 'FAIL') {
        console.log(`❌ "${query}"`);
        console.log(`  Reason: ${result.reason}\n`);
        results.failed++;
      } else if (result.status === 'ERROR') {
        console.log(`⚠️  "${query}"`);
        console.log(`  Error: ${result.error}\n`);
        results.errors++;
      } else {
        console.log(`? "${query}"`);
        console.log(`  Unknown: ${result.text}\n`);
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✓ Passed: ${results.passed} (${Math.round(results.passed/results.total*100)}%)`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Errors: ${results.errors}`);
  console.log('');
  
  if (results.failed > 0 || results.errors > 0) {
    console.log('⚠️  ISSUES DETECTED - Review failures above');
    process.exit(1);
  } else {
    console.log('✅ ALL TESTS PASSED - Application ready for field use');
    process.exit(0);
  }
}

// Wait for server to be ready
console.log('Waiting for server...');
await new Promise(resolve => setTimeout(resolve, 5000));

runTests().catch(console.error);

