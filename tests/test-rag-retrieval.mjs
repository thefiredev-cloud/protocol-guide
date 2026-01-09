#!/usr/bin/env node
/**
 * Direct RAG Retrieval Test
 * Tests the retrieval pipeline without UI or chat
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dflmjilieokjkkqxrmda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbG1qaWxpZW9ramtrcXhybWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNzcxODMsImV4cCI6MjA4MTk1MzE4M30.XrmZjCRmnwxyJlzLMMwOv_MrlMrwIaCcXtirlDN_DYQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_QUERIES = [
  { query: 'policy 830', expected: '830', desc: 'Policy prefix lookup' },
  { query: '1201', expected: '1201', desc: 'Bare number lookup' },
  { query: 'TP-1210', expected: '1210', desc: 'TP prefix lookup' },
  { query: 'LAMS', expected: 'stroke', desc: 'Acronym query' },
  { query: 'epi dose', expected: 'epinephrine', desc: 'Medication query' },
  { query: 'chest pain', expected: 'cardiac', desc: 'Natural language' },
  { query: '1317.6', expected: '1317', desc: 'Decimal protocol number' },
];

// Test protocol number detection regex
function isSimpleProtocolLookup(query) {
  const trimmed = query.trim();
  return /^(?:tp[-\s]?|ref\.?\s*|mcg[-\s]?|protocol\s*|policy\s*)?(\d{3,4}(?:\.\d+)?)$/i.test(trimmed);
}

// Test protocol number extraction
function extractProtocolNumber(query) {
  const patterns = [
    /(?:tp[-\s]?)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:ref\.?\s*)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:mcg[-\s]?)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:protocol\s*)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:policy\s*)(\d{3,4}(?:\.\d+)?)/gi,
    /\b(\d{4}(?:\.\d+)?)\b/g,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      // Extract just the number
      const numMatch = match[0].match(/(\d{3,4}(?:\.\d+)?)/);
      if (numMatch) return numMatch[1];
    }
  }
  return null;
}

async function testKeywordSearch(query) {
  const { data, error } = await supabase.rpc('fulltext_search_protocols', {
    search_query: query,
    max_results: 5,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    count: data?.length || 0,
    results: data?.slice(0, 3).map(r => ({
      protocol: r.protocol_id,
      title: r.protocol_title,
      score: r.rank,
    })),
  };
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('RAG Retrieval Direct Test');
  console.log('='.repeat(70));
  console.log('');

  // Test 1: Protocol number detection
  console.log('TEST 1: Protocol Number Detection (isSimpleProtocolLookup)');
  console.log('-'.repeat(70));

  const detectionTests = [
    { query: 'policy 830', expected: true },
    { query: 'Policy 1317.6', expected: true },
    { query: '1201', expected: true },
    { query: 'TP-1210', expected: true },
    { query: 'chest pain', expected: false },
    { query: 'epi dose', expected: false },
    { query: 'LAMS', expected: false },
  ];

  let passCount = 0;
  for (const t of detectionTests) {
    const result = isSimpleProtocolLookup(t.query);
    const pass = result === t.expected;
    passCount += pass ? 1 : 0;
    console.log(`  ${pass ? '✓' : '✗'} "${t.query}" => ${result} (expected: ${t.expected})`);
  }
  console.log(`  Result: ${passCount}/${detectionTests.length} passed`);
  console.log('');

  // Test 2: Protocol number extraction
  console.log('TEST 2: Protocol Number Extraction');
  console.log('-'.repeat(70));

  const extractionTests = [
    { query: 'policy 830', expected: '830' },
    { query: 'Policy 1317.6', expected: '1317.6' },
    { query: '1201', expected: '1201' },
    { query: 'TP-1210', expected: '1210' },
    { query: 'ref 521', expected: '521' },
  ];

  passCount = 0;
  for (const t of extractionTests) {
    const result = extractProtocolNumber(t.query);
    const pass = result === t.expected;
    passCount += pass ? 1 : 0;
    console.log(`  ${pass ? '✓' : '✗'} "${t.query}" => "${result}" (expected: "${t.expected}")`);
  }
  console.log(`  Result: ${passCount}/${extractionTests.length} passed`);
  console.log('');

  // Test 3: Keyword search (Supabase)
  console.log('TEST 3: Supabase Keyword Search');
  console.log('-'.repeat(70));

  for (const t of TEST_QUERIES) {
    console.log(`  Query: "${t.query}"`);
    const result = await testKeywordSearch(t.query);

    if (result.error) {
      console.log(`    ✗ Error: ${result.error}`);
    } else if (result.count === 0) {
      console.log(`    ⚠ No results`);
    } else {
      const hasExpected = result.results.some(r =>
        r.protocol?.includes(t.expected) ||
        r.title?.toLowerCase().includes(t.expected.toLowerCase())
      );
      console.log(`    ${hasExpected ? '✓' : '⚠'} Found ${result.count} results`);
      result.results.forEach(r => {
        console.log(`      - ${r.protocol}: ${r.title} (score: ${r.score?.toFixed(2)})`);
      });
    }
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('Tests Complete');
  console.log('='.repeat(70));
}

runTests().catch(console.error);
