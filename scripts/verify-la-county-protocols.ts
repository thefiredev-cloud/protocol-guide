/**
 * LA County Protocol Verification Script
 *
 * Runs test queries to verify protocol corrections are working properly.
 * Use this after running fix-la-county-protocols.ts and regenerating embeddings.
 *
 * Run with: npx tsx scripts/verify-la-county-protocols.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// These should be in your .env file
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LA_COUNTY_ID = 240009;

// ============================================================================
// TEST QUERIES - Based on field testing feedback
// ============================================================================

const TEST_QUERIES = [
  {
    query: "ref 814 determination of death",
    expectedProtocol: "814",
    expectedContent: ["determination of death", "rigor mortis", "20 minutes", "asystole"],
    description: "Determination of Death policy"
  },
  {
    query: "obvious death criteria",
    expectedProtocol: "814",
    expectedContent: ["decapitation", "lividity", "base hospital"],
    description: "Death determination criteria"
  },
  {
    query: "HERT hospital emergency response team",
    expectedProtocol: "817",
    expectedContent: ["Hospital Emergency Response Team", "LA General", "Harbor-UCLA", "crush"],
    description: "HERT activation"
  },
  {
    query: "crush injury hyperkalemia treatment",
    expectedProtocol: "1242",
    expectedContent: ["HERT", "hyperkalemia", "calcium chloride", "sodium bicarbonate"],
    description: "Crush injury with HERT reference"
  },
  {
    query: "pediatric sodium bicarb dose",
    expectedProtocol: "1210-PEDS-BICARB",
    expectedContent: ["1 mEq/kg", "50 mEq", "8.4%"],
    description: "Pediatric sodium bicarbonate dosing"
  },
  {
    query: "needle thoracostomy tension pneumothorax",
    expectedProtocol: "1335",
    expectedContent: ["2nd intercostal", "midclavicular", "tension pneumothorax", "14-gauge"],
    description: "Needle thoracostomy procedure"
  },
  {
    query: "needle decompression anatomical site",
    expectedProtocol: "1335",
    expectedContent: ["2nd ICS", "MCL", "3rd rib"],
    description: "Needle decompression anatomical landmarks"
  },
  {
    query: "provider impression dialysis fistula DIAL",
    expectedProtocol: "1200.3",
    expectedContent: ["DIAL", "fistula", "direct pressure", "remote"],
    description: "Provider impression for dialysis/fistula"
  },
  {
    query: "crush injury field amputation HERT",
    expectedProtocol: "817",
    expectedContent: ["HERT", "field amputation", "crush", "Harbor-UCLA"],
    description: "HERT for crush injury field amputation"
  },
  {
    query: "provider impression codes list",
    expectedProtocol: "1200.3",
    expectedContent: ["DIAL", "DEAD", "CANT", "ALOC"],
    description: "Provider impression code reference"
  }
];

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-large-2',
      input: text.substring(0, 8000), // Truncate to model limit
      input_type: 'query'
    })
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// ============================================================================
// SEARCH FUNCTION
// ============================================================================

async function searchProtocols(query: string, limit: number = 5) {
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc('search_manus_protocols', {
    query_embedding: embedding,
    agency_name_filter: 'Los Angeles County EMS Agency',
    state_code_filter: 'CA',
    match_count: limit,
    match_threshold: 0.25  // Lower threshold for better recall
  });

  if (error) {
    throw new Error(`Search error: ${error.message}`);
  }

  return data || [];
}

// ============================================================================
// VERIFICATION LOGIC
// ============================================================================

interface TestResult {
  query: string;
  description: string;
  passed: boolean;
  expectedProtocol: string;
  foundProtocol: string | null;
  similarity: number | null;
  contentMatches: string[];
  contentMisses: string[];
  error?: string;
}

async function runTest(test: typeof TEST_QUERIES[0]): Promise<TestResult> {
  const result: TestResult = {
    query: test.query,
    description: test.description,
    passed: false,
    expectedProtocol: test.expectedProtocol,
    foundProtocol: null,
    similarity: null,
    contentMatches: [],
    contentMisses: []
  };

  try {
    const results = await searchProtocols(test.query, 10);  // Get top 10 for better coverage

    if (results.length === 0) {
      result.error = "No results returned";
      return result;
    }

    // Check top result
    const topResult = results[0];
    result.foundProtocol = topResult.protocol_number;
    result.similarity = topResult.similarity;

    // Check if expected protocol is in top 5 results
    const top5 = results.slice(0, 5);
    const matchingResult = top5.find((r: any) =>
      r.protocol_number?.toLowerCase().includes(test.expectedProtocol.toLowerCase()) ||
      test.expectedProtocol.toLowerCase().includes(r.protocol_number?.toLowerCase() || '')
    );

    // Check content in the matching result (or top result if not found)
    const contentToCheck = (matchingResult?.content || topResult.content || '').toLowerCase();
    for (const keyword of test.expectedContent) {
      if (contentToCheck.includes(keyword.toLowerCase())) {
        result.contentMatches.push(keyword);
      } else {
        result.contentMisses.push(keyword);
      }
    }

    // Update found protocol to the matching one if it's in top 5
    if (matchingResult) {
      result.foundProtocol = matchingResult.protocol_number;
      result.similarity = matchingResult.similarity;
    }

    // Determine pass/fail
    // Pass if: correct protocol found in top 5 AND at least 50% of expected content present
    const contentMatchRatio = result.contentMatches.length / test.expectedContent.length;
    result.passed = !!matchingResult && contentMatchRatio >= 0.5;

  } catch (error: any) {
    result.error = error.message;
  }

  return result;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("LA COUNTY PROTOCOL VERIFICATION");
  console.log("=".repeat(70));
  console.log(`\nRunning ${TEST_QUERIES.length} test queries against LA County protocols`);
  console.log(`Agency filter: Los Angeles County (ID: ${LA_COUNTY_ID})`);
  console.log("\n");

  const results: TestResult[] = [];

  for (const test of TEST_QUERIES) {
    process.stdout.write(`Testing: "${test.query}" ... `);
    const result = await runTest(test);
    results.push(result);

    if (result.passed) {
      console.log("✅ PASS");
    } else {
      console.log("❌ FAIL");
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("DETAILED RESULTS");
  console.log("=".repeat(70));

  for (const result of results) {
    console.log(`\n📋 Query: "${result.query}"`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Expected Protocol: ${result.expectedProtocol}`);
    console.log(`   Found Protocol: ${result.foundProtocol || 'None'}`);
    console.log(`   Similarity: ${result.similarity?.toFixed(3) || 'N/A'}`);

    if (result.contentMatches.length > 0) {
      console.log(`   Content Found: ${result.contentMatches.join(', ')}`);
    }
    if (result.contentMisses.length > 0) {
      console.log(`   Content Missing: ${result.contentMisses.join(', ')}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  // Final summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));
  console.log(`\n  Total tests: ${results.length}`);
  console.log(`  Passed: ${passed} (${(passed / results.length * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n⚠️  FAILED TESTS:");
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  • "${r.query}" - Expected: ${r.expectedProtocol}, Got: ${r.foundProtocol || 'none'}`);
    });
    console.log("\nNext steps:");
    console.log("1. Check if protocols were added to MySQL database");
    console.log("2. Verify embeddings were generated and synced to Supabase");
    console.log("3. Check protocol content for expected keywords");
  } else {
    console.log("\n✅ All tests passed! LA County protocols are correctly configured.");
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
