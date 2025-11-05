#!/bin/bash
# Quick test script for 5 chat scenarios
# Usage: ./scripts/test-chat-scenarios.sh

API_URL="http://localhost:3002/api/chat"
SESSION_ID="test-session-$(date +%s)"

echo "🧪 Testing LA County EMS Protocol System"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_scenario() {
    local num=$1
    local title=$2
    local message=$3

    echo -e "${YELLOW}Test #$num: $title${NC}"
    echo "Query: $message"
    echo ""

    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$message\", \"sessionId\": \"$SESSION_ID\"}" \
        2>&1)

    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        echo -e "${GREEN}✓ Response received${NC}"
        echo "$response" | jq -r '.response' 2>/dev/null || echo "$response" | head -c 500
        echo ""
    else
        echo -e "${RED}✗ Request failed${NC}"
        echo "$response"
        echo ""
    fi

    echo "---"
    echo ""
}

# Test 1: Basic Protocol Lookup
test_scenario 1 \
    "Basic Protocol Lookup" \
    "What is the protocol for cardiac chest pain?"

# Test 2: Vague Query Handling
test_scenario 2 \
    "Vague Query (Query Normalization)" \
    "patient cant breathe"

# Test 3: Medication Dosing
test_scenario 3 \
    "Medication Dosing Validation" \
    "What is the epinephrine dose for anaphylaxis in an adult?"

# Test 4: Pediatric Protocol
test_scenario 4 \
    "Pediatric Weight-Based Dosing" \
    "Pediatric seizure in a 20kg child, still seizing after 5 minutes"

# Test 5: Complex Multi-Protocol
test_scenario 5 \
    "Complex Multi-Protocol Scenario" \
    "74 year old male, chest pain radiating to jaw, BP 90/60, diaphoretic. Has taken 3 nitroglycerin at home with no relief. What do I do?"

echo ""
echo "=========================================="
echo "🏁 Test Suite Complete"
echo ""
echo "Review the responses above for:"
echo "  ✓ Correct protocol numbers"
echo "  ✓ Safe medication doses"
echo "  ✓ Contraindication warnings"
echo "  ✓ No hallucinated information"
echo ""
