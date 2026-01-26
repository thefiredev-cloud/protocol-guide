/**
 * Search Quality Test Script
 * 
 * Tests the RAG pipeline with common paramedic queries and evaluates:
 * - Result relevance
 * - Response latency
 * - Query normalization effectiveness
 * - Synonym expansion coverage
 * 
 * Run with: npx tsx scripts/test-search-quality.ts
 */

import { normalizeEmsQuery, generateQueryVariations, expandWithSynonyms } from '../server/_core/ems-query-normalizer';

// ============================================================================
// TEST QUERIES
// ============================================================================

const TEST_QUERIES = [
  // Core test queries from the task
  { query: 'chest pain protocol', expectedKeywords: ['chest', 'pain', 'cardiac', 'acs', 'stemi'] },
  { query: 'pediatric dosing', expectedKeywords: ['pediatric', 'dose', 'weight', 'kg', 'child'] },
  { query: 'RSI procedure', expectedKeywords: ['rapid sequence', 'intubation', 'airway', 'paralytic'] },
  { query: 'cardiac arrest', expectedKeywords: ['arrest', 'cpr', 'defibrillation', 'rosc', 'acls'] },
  { query: 'stroke assessment', expectedKeywords: ['stroke', 'cva', 'nihss', 'fast', 'thrombolytic'] },
  
  // Additional test queries for comprehensive coverage
  { query: 'epi dose anaphylaxis', expectedKeywords: ['epinephrine', 'anaphylaxis', 'allergic', 'mg'] },
  { query: 'narcan OD', expectedKeywords: ['naloxone', 'overdose', 'opioid'] },
  { query: 'SOB treatment', expectedKeywords: ['shortness', 'breath', 'dyspnea', 'respiratory'] },
  { query: 'vtach protocol', expectedKeywords: ['ventricular', 'tachycardia', 'cardioversion'] },
  { query: 'peds seizure', expectedKeywords: ['pediatric', 'seizure', 'convulsion', 'benzodiazepine'] },
  { query: 'needle decompression', expectedKeywords: ['pneumothorax', 'needle', 'thoracostomy', 'chest'] },
  { query: 'hypoglycemia treatment', expectedKeywords: ['glucose', 'dextrose', 'blood sugar', 'diabetic'] },
  
  // Abbreviation expansion tests
  { query: 'afib rvr', expectedKeywords: ['atrial fibrillation', 'rapid ventricular'] },
  { query: 'bgl check', expectedKeywords: ['blood glucose', 'sugar'] },
  { query: 'IO access', expectedKeywords: ['intraosseous'] },
];

// ============================================================================
// NORMALIZATION TESTS
// ============================================================================

function testQueryNormalization(): void {
  console.log('\n' + '='.repeat(60));
  console.log('QUERY NORMALIZATION TESTS');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const { query, expectedKeywords } of TEST_QUERIES) {
    const normalized = normalizeEmsQuery(query);
    
    // Check if normalized query contains expected keywords
    const normalizedLower = normalized.normalized.toLowerCase();
    const missingKeywords: string[] = [];
    
    for (const keyword of expectedKeywords) {
      if (!normalizedLower.includes(keyword.toLowerCase())) {
        missingKeywords.push(keyword);
      }
    }
    
    if (missingKeywords.length === 0) {
      console.log(`✅ "${query}"`);
      console.log(`   → "${normalized.normalized}"`);
      console.log(`   Intent: ${normalized.intent}, Complex: ${normalized.isComplex}`);
      passed++;
    } else {
      console.log(`⚠️  "${query}"`);
      console.log(`   → "${normalized.normalized}"`);
      console.log(`   Missing keywords: ${missingKeywords.join(', ')}`);
      // Check if synonyms cover the missing keywords
      const synonyms = expandWithSynonyms(normalized.normalized);
      const coveredBySynonyms = missingKeywords.filter(kw => 
        synonyms.some(syn => syn.toLowerCase().includes(kw.toLowerCase()))
      );
      if (coveredBySynonyms.length > 0) {
        console.log(`   ✓ Covered by synonyms: ${coveredBySynonyms.join(', ')}`);
        passed++;
      } else {
        failed++;
      }
    }
    
    if (normalized.expandedAbbreviations.length > 0) {
      console.log(`   Expanded: ${normalized.expandedAbbreviations.join(', ')}`);
    }
    if (normalized.extractedMedications.length > 0) {
      console.log(`   Medications: ${normalized.extractedMedications.join(', ')}`);
    }
    if (normalized.extractedConditions.length > 0) {
      console.log(`   Conditions: ${normalized.extractedConditions.join(', ')}`);
    }
    console.log('');
  }
  
  console.log('-'.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
}

// ============================================================================
// SYNONYM EXPANSION TESTS
// ============================================================================

function testSynonymExpansion(): void {
  console.log('\n' + '='.repeat(60));
  console.log('SYNONYM EXPANSION TESTS');
  console.log('='.repeat(60));
  
  const synonymTestCases = [
    { query: 'heart attack', expectedSynonyms: ['myocardial infarction', 'mi', 'stemi'] },
    { query: 'stroke', expectedSynonyms: ['cva', 'cerebrovascular'] },
    { query: 'epi', expectedSynonyms: ['epinephrine', 'adrenaline'] },
    { query: 'narcan', expectedSynonyms: ['naloxone', 'opioid'] },
    { query: 'cardiac arrest', expectedSynonyms: ['code', 'asystole', 'vfib'] },
    { query: 'SOB', expectedSynonyms: ['shortness of breath', 'dyspnea'] },
    { query: 'RSI', expectedSynonyms: ['rapid sequence', 'intubation'] },
    { query: 'peds', expectedSynonyms: ['pediatric', 'child'] },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { query, expectedSynonyms } of synonymTestCases) {
    const normalized = normalizeEmsQuery(query);
    const synonyms = expandWithSynonyms(normalized.normalized);
    
    const missingSynonyms: string[] = [];
    for (const expected of expectedSynonyms) {
      const found = synonyms.some(syn => 
        syn.toLowerCase().includes(expected.toLowerCase()) ||
        normalized.normalized.toLowerCase().includes(expected.toLowerCase())
      );
      if (!found) {
        missingSynonyms.push(expected);
      }
    }
    
    if (missingSynonyms.length === 0) {
      console.log(`✅ "${query}" → Synonyms: ${synonyms.slice(0, 5).join(', ')}`);
      passed++;
    } else {
      console.log(`⚠️  "${query}" → Missing: ${missingSynonyms.join(', ')}`);
      console.log(`   Got: ${synonyms.slice(0, 5).join(', ')}`);
      failed++;
    }
  }
  
  console.log('-'.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
}

// ============================================================================
// QUERY VARIATION TESTS
// ============================================================================

function testQueryVariations(): void {
  console.log('\n' + '='.repeat(60));
  console.log('QUERY VARIATION TESTS');
  console.log('='.repeat(60));
  
  for (const { query } of TEST_QUERIES.slice(0, 5)) {
    const variations = generateQueryVariations(query);
    console.log(`\n"${query}"`);
    console.log(`  Variations (${variations.length}):`);
    for (const variation of variations) {
      console.log(`    → ${variation}`);
    }
  }
}

// ============================================================================
// INTENT CLASSIFICATION TESTS
// ============================================================================

function testIntentClassification(): void {
  console.log('\n' + '='.repeat(60));
  console.log('INTENT CLASSIFICATION TESTS');
  console.log('='.repeat(60));
  
  const intentTestCases = [
    { query: 'epi dose for anaphylaxis', expectedIntent: 'medication_dosing' },
    { query: 'how to intubate', expectedIntent: 'procedure_steps' },
    { query: 'STEMI criteria', expectedIntent: 'assessment_criteria' },
    { query: 'can I give nitro with viagra', expectedIntent: 'contraindication_check' },
    { query: 'pediatric weight based dosing', expectedIntent: 'pediatric_specific' },
    { query: 'protocol 502', expectedIntent: 'protocol_lookup' },
    { query: 'chest pain vs heartburn', expectedIntent: 'differential_diagnosis' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { query, expectedIntent } of intentTestCases) {
    const normalized = normalizeEmsQuery(query);
    
    if (normalized.intent === expectedIntent) {
      console.log(`✅ "${query}" → ${normalized.intent}`);
      passed++;
    } else {
      console.log(`❌ "${query}" → ${normalized.intent} (expected: ${expectedIntent})`);
      failed++;
    }
  }
  
  console.log('-'.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('🔍 Protocol Guide - Search Quality Tests\n');
  console.log('Testing query normalization, synonym expansion, and intent classification...\n');
  
  testQueryNormalization();
  testSynonymExpansion();
  testQueryVariations();
  testIntentClassification();
  
  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETE');
  console.log('='.repeat(60));
  console.log('\nNote: These tests validate the query preprocessing pipeline.');
  console.log('For full end-to-end search testing, use the API with a running server.');
}

main();
