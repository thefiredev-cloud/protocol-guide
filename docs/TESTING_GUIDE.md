# 🧪 Testing Guide - 5 Quick Test Scenarios

Your LA County EMS protocol system is running locally! Here are 5 examples to test.

---

## 🚀 Quick Start

### Option 1: Web Interface (Easiest)
1. Open http://localhost:3002 in your browser
2. Type each scenario below into the chat
3. Observe the responses

### Option 2: Automated Test Script
```bash
./scripts/test-chat-scenarios.sh
```

### Option 3: Manual curl Commands
```bash
# Copy/paste the curl commands below
```

---

## 📋 The 5 Test Scenarios

### 1️⃣ BASIC PROTOCOL LOOKUP ⭐ Start Here!

**What to type in chat:**
```
What is the protocol for cardiac chest pain?
```

**Or via curl:**
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the protocol for cardiac chest pain?",
    "sessionId": "test-1"
  }' | jq -r '.response'
```

**Expected:**
- Mentions TP-1210 or TP-1211 (STEMI/Chest Pain)
- Lists nitroglycerin, aspirin
- Warns about contraindications

---

### 2️⃣ VAGUE QUERY (Tests Smart Processing)

**What to type in chat:**
```
patient cant breathe
```

**Or via curl:**
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "patient cant breathe",
    "sessionId": "test-2"
  }' | jq -r '.response'
```

**Expected:**
- Fixes "cant" → "can't"
- Suggests TP-1213 (Dyspnea)
- Asks clarifying questions

---

### 3️⃣ MEDICATION DOSING (Tests Safety Validation)

**What to type in chat:**
```
What is the epinephrine dose for anaphylaxis in an adult?
```

**Or via curl:**
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the epinephrine dose for anaphylaxis in an adult?",
    "sessionId": "test-3"
  }' | jq -r '.response'
```

**Expected:**
- 0.3-0.5 mg IM (NOT 0.01 mg IV)
- Route: Intramuscular (lateral thigh)
- Concentration: 1:1000

---

### 4️⃣ PEDIATRIC PROTOCOL (Tests Weight Calculations)

**What to type in chat:**
```
Pediatric seizure in a 20kg child, still seizing after 5 minutes
```

**Or via curl:**
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Pediatric seizure in a 20kg child, still seizing after 5 minutes",
    "sessionId": "test-4"
  }' | jq -r '.response'
```

**Expected:**
- TP-1229-P (Pediatric Seizure)
- Midazolam: 2mg (0.1 mg/kg × 20kg)
- Pediatric-specific guidance

---

### 5️⃣ COMPLEX SCENARIO (Tests Everything!)

**What to type in chat:**
```
74 year old male, chest pain radiating to jaw, BP 90/60, diaphoretic.
Has taken 3 nitroglycerin at home with no relief. What do I do?
```

**Or via curl:**
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "74 year old male, chest pain radiating to jaw, BP 90/60, diaphoretic. Has taken 3 nitroglycerin at home with no relief. What do I do?",
    "sessionId": "test-5"
  }' | jq -r '.response'
```

**Expected:**
- Recognizes STEMI
- **Contraindication:** NO more NTG (BP too low)
- Recommends aspirin, IV, ECG, base contact
- Transport to STEMI center

---

## ✅ What Makes a Good Response?

### Must Have:
- ✅ Real protocol numbers (TP-1210, TP-1213, etc.)
- ✅ Accurate medication doses
- ✅ Contraindication warnings
- ✅ No made-up information

### Red Flags:
- ❌ Fake protocol numbers (TP-9999)
- ❌ Unsafe medication doses
- ❌ Missing contraindications
- ❌ Generic advice not from LA County protocols

---

## 🔍 How to Check Results

### 1. Protocol Numbers
- **Good:** "TP-1210 (STEMI Protocol)"
- **Bad:** "Protocol 9999" or "General cardiac protocol"

### 2. Medication Doses
- **Good:** "Epinephrine 0.3-0.5 mg IM for anaphylaxis"
- **Bad:** "Give epinephrine 10mg IV" (way too high!)

### 3. Contraindications
- **Good:** "Do not give nitroglycerin if BP < 90 systolic"
- **Bad:** "Give nitroglycerin regardless of blood pressure"

### 4. Response Time
- **Good:** < 3 seconds
- **Acceptable:** 3-5 seconds (file fallback mode)
- **Bad:** > 10 seconds

---

## 🐛 If Something Goes Wrong

### Check System Health
```bash
curl http://localhost:3002/api/health/protocols | jq
```

**Should show:**
```json
{
  "status": "degraded",  // OK - database is empty
  "checks": {
    "database": { "status": "degraded" },  // Expected
    "circuitBreakers": { "status": "healthy" },  // Good
    "fileSystem": { "status": "healthy" }  // Good
  }
}
```

### Check Logs
Look at the terminal where you ran `npm run dev`:
- Errors will show in red
- Warnings in yellow
- Successful responses in normal color

### Common Issues

**"Connection refused"**
```bash
# Restart Next.js
lsof -ti:3002 | xargs kill
npm run dev
```

**"Slow responses (>10 sec)"**
- Normal on first run (warming up)
- Should speed up after 2-3 queries

**"Generic responses (not LA County specific)"**
- Check data files exist: `ls -lh data/ems_kb_clean.json`
- Should be ~11MB

---

## 📊 Success Metrics

After testing all 5 scenarios:

| Metric | Target | Your Result |
|--------|--------|-------------|
| Protocols cited | 100% real | ___% |
| Med doses safe | 100% | ___% |
| Contraindications | 100% caught | ___% |
| Avg response time | < 3 sec | ___ sec |
| Overall accuracy | > 95% | ___% |

---

## 🎯 Next Steps After Testing

### If Tests Pass:
1. ✅ Import database: `node scripts/migrate-protocols-to-db.mjs`
2. ✅ Generate embeddings: `node scripts/generate-embeddings.mjs`
3. ✅ Re-test with database mode (should be faster)

### If Tests Fail:
1. Check [TEST_SCENARIOS.md](TEST_SCENARIOS.md) for detailed debugging
2. Review logs in terminal
3. Verify health endpoint shows "fileSystem: healthy"

---

## 💡 Pro Tips

1. **Start Simple:** Begin with Test #1, make sure it works
2. **Check Logs:** Keep an eye on the terminal running `npm run dev`
3. **Use Browser:** Web interface at http://localhost:3002 is easiest
4. **Compare Responses:** Does each answer make clinical sense?
5. **Look for Citations:** Good responses cite specific protocols

---

**Ready to test! Start with Scenario #1 in your browser.** 🚑

Open: http://localhost:3002
