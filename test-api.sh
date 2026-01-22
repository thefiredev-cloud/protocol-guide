#!/bin/bash

# Test script for Protocol Guide Manus API
# Run this to verify the backend is working correctly

echo "==================================="
echo "Protocol Guide Manus API Test"
echo "==================================="
echo ""

API_BASE="http://localhost:3000"

# Test 1: Health check
echo "Test 1: Health Check"
echo "GET $API_BASE/api/health"
curl -s "$API_BASE/api/health" | jq '.' || echo "FAILED"
echo ""
echo ""

# Test 2: tRPC stats endpoint
echo "Test 2: tRPC Protocol Stats"
echo "GET $API_BASE/api/trpc/search.stats"
curl -s "$API_BASE/api/trpc/search.stats" | jq '.' || echo "FAILED"
echo ""
echo ""

# Test 3: Semantic search
echo "Test 3: Semantic Search (cardiac arrest)"
echo "GET $API_BASE/api/trpc/search.semantic?input={\"json\":{\"query\":\"cardiac arrest\",\"limit\":3}}"
curl -s "$API_BASE/api/trpc/search.semantic?input=%7B%22json%22%3A%7B%22query%22%3A%22cardiac%20arrest%22%2C%22limit%22%3A3%7D%7D" | jq '.result.data.json.results | length' || echo "FAILED"
echo ""
echo ""

# Test 4: Summarize endpoint
echo "Test 4: Summarize Endpoint"
echo "POST $API_BASE/api/summarize"
curl -s -X POST "$API_BASE/api/summarize" \
  -H "Content-Type: application/json" \
  -d '{"query":"cardiac arrest","content":"CPR protocol: Start chest compressions at 100-120 per minute. Give epinephrine 1mg IV/IO every 3-5 minutes. Continue until ROSC.","protocolTitle":"Cardiac Arrest Protocol"}' \
  | jq '.summary' || echo "FAILED"
echo ""
echo ""

echo "==================================="
echo "Tests Complete"
echo "==================================="
echo ""
echo "If all tests passed, the API is working correctly!"
echo "If any tests failed, check that the server is running: pnpm dev"
