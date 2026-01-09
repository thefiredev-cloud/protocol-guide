#!/usr/bin/env node
/**
 * Quick Smoke Test - Uses fetch to test RAG API directly
 * No Puppeteer required - tests the backend retrieval
 */

const BASE_URL = 'http://localhost:3000';

const TEST_QUERIES = [
  { id: 'policy-830', query: 'policy 830', expected: 'protocol match' },
  { id: 'lams', query: 'LAMS', expected: 'stroke' },
  { id: 'epi-dose', query: 'epi dose', expected: 'epinephrine' },
  { id: 'chest-pain', query: 'chest pain', expected: 'cardiac' },
  { id: 'tp-1201', query: '1201', expected: 'assessment' },
];

async function testQuery(test) {
  const startTime = Date.now();

  try {
    // Call the chat-stream endpoint directly
    const response = await fetch(`${BASE_URL}/.netlify/functions/chat-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: test.query,
        history: [],
        useRAG: true,
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      return {
        ...test,
        status: 'FAIL',
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime: elapsed,
      };
    }

    // Read streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }

    // Parse SSE events
    const lines = fullText.split('\n');
    let content = '';
    let confidence = null;
    let searchMode = null;

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'chunk' && data.content) {
            content += data.content;
          }
          if (data.type === 'metadata') {
            confidence = data.confidence;
            searchMode = data.searchMode;
          }
        } catch (e) {
          // Not JSON, skip
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const hasExpected = content.toLowerCase().includes(test.expected.toLowerCase());

    return {
      ...test,
      status: hasExpected ? 'PASS' : 'WARN',
      responseTime: totalTime,
      confidence,
      searchMode,
      preview: content.slice(0, 200),
      hasExpected,
    };
  } catch (error) {
    return {
      ...test,
      status: 'FAIL',
      error: error.message,
      responseTime: Date.now() - startTime,
    };
  }
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('Quick Smoke Test - RAG API Direct');
  console.log('='.repeat(70));
  console.log(`Target: ${BASE_URL}`);
  console.log(`Tests: ${TEST_QUERIES.length}`);
  console.log('='.repeat(70));
  console.log('');

  const results = [];

  for (const test of TEST_QUERIES) {
    console.log(`Testing: "${test.query}"`);
    const result = await testQuery(test);
    results.push(result);

    const icon = result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
    console.log(`  ${icon} ${result.status} (${result.responseTime}ms)`);

    if (result.confidence) {
      console.log(`    Confidence: ${result.confidence}`);
    }
    if (result.searchMode) {
      console.log(`    Search Mode: ${result.searchMode}`);
    }
    if (result.preview) {
      console.log(`    Preview: ${result.preview.slice(0, 100)}...`);
    }
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`PASS: ${passed}  WARN: ${warned}  FAIL: ${failed}`);
  console.log('');

  results.forEach((r, i) => {
    const icon = r.status === 'PASS' ? '✓' : r.status === 'WARN' ? '⚠' : '✗';
    console.log(`${i + 1}. ${icon} "${r.query}" - ${r.status} (${r.responseTime}ms)`);
  });

  return results;
}

runTests().catch(console.error);
