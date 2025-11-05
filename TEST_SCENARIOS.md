# 5 Test Scenarios for LA County EMS Protocol System

Test these scenarios in your chat interface at http://localhost:3002

---

## 1️⃣ BASIC PROTOCOL LOOKUP (Easy)

**Test Input:**
```
What is the protocol for cardiac chest pain?
```

**Expected Behavior:**
- ✅ Should retrieve TP-1210 or TP-1211 (STEMI/Chest Pain protocols)
- ✅ Should mention nitroglycerin, aspirin
- ✅ Should include base hospital contact requirements
- ✅ Should warn about contraindications

**What to Check:**
- Response time < 2 seconds
- Cites actual protocol numbers
- No hallucinated medications
- Dosing information is accurate

---

## 2️⃣ VAGUE QUERY HANDLING (Tests Validation Pipeline)

**Test Input:**
```
patient cant breathe
```

**Expected Behavior:**
- ✅ Query normalization should fix "cant" → "can't"
- ✅ Should expand to "shortness of breath" / "dyspnea"
- ✅ Should suggest TP-1213 (Dyspnea protocol)
- ✅ Should ask clarifying questions (age? onset? history?)

**What to Check:**
- Validation catches vague query (warning in logs if verbose mode)
- Doesn't just give generic advice
- Asks for more context
- Provides differential protocols (SOB vs. Asthma vs. CHF)

---

## 3️⃣ MEDICATION DOSING (Tests Medication Validator)

**Test Input:**
```
What is the epinephrine dose for anaphylaxis in an adult?
```

**Expected Behavior:**
- ✅ Should return: 0.3-0.5 mg IM (1:1000 concentration)
- ✅ Should specify route: Intramuscular (lateral thigh)
- ✅ Should mention repeat dosing: q5-15min if needed
- ✅ Should cite TP-1234 or Anaphylaxis protocol

**What to Check:**
- Dose is within LA County range (0.3-0.5 mg, NOT 0.01 mg IV)
- Route is correct (IM, not IV for anaphylaxis)
- Concentration mentioned (1:1000, not 1:10000)
- No out-of-range doses (medication validator should catch)

---

## 4️⃣ PEDIATRIC PROTOCOL (Tests Weight-Based Dosing)

**Test Input:**
```
Pediatric seizure in a 20kg child, still seizing after 5 minutes
```

**Expected Behavior:**
- ✅ Should suggest TP-1229-P (Pediatric Seizure)
- ✅ Midazolam dosing: 0.1 mg/kg = 2mg (IN or IM)
- ✅ Should mention airway management
- ✅ Should note transport to pediatric-capable facility

**What to Check:**
- Weight-based calculation is correct (0.1 mg/kg × 20kg = 2mg)
- Uses pediatric protocol (TP-XXXX-P format)
- Mentions age-appropriate equipment
- Doesn't give adult doses

---

## 5️⃣ COMPLEX MULTI-PROTOCOL SCENARIO (Tests Error Recovery & Context)

**Test Input:**
```
74 year old male, chest pain radiating to jaw, BP 90/60, diaphoretic.
Has taken 3 nitroglycerin at home with no relief. What do I do?
```

**Expected Behavior:**
- ✅ Recognizes STEMI presentation
- ✅ Identifies hypotension (BP 90/60) as contraindication for more NTG
- ✅ Should recommend:
  - TP-1210 (STEMI)
  - Aspirin 324mg
  - NO additional nitroglycerin (hypotensive)
  - IV access, 12-lead ECG
  - Base hospital contact for STEMI alert
  - Transport to STEMI center
- ✅ Should warn about hypotension

**What to Check:**
- Correctly identifies contraindication (hypotension + NTG)
- Prioritizes critical actions (aspirin, IV, ECG, transport)
- Mentions base hospital contact requirement
- Suggests appropriate destination (STEMI center, not community ER)
- Doesn't recommend dangerous interventions

---

## 🧪 How to Test

### Via Chat Interface (http://localhost:3002)
1. Open the app in your browser
2. Type each scenario into the chat
3. Observe the response

### Via curl (Command Line)
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the protocol for cardiac chest pain?",
    "sessionId": "test-session-123"
  }'
```

### Via Health Check
```bash
# Check system is ready
curl http://localhost:3002/api/health/protocols | jq
```

---

## 📊 Success Criteria

**Pass if:**
- ✅ All 5 scenarios return relevant protocols
- ✅ No hallucinated protocol numbers
- ✅ Medication doses are within LA County ranges
- ✅ Contraindications are identified
- ✅ Response time < 3 seconds per query

**Acceptable Degraded Mode:**
- ⚠️ "Database degraded, using file fallback" - OK (works without DB import)
- ⚠️ Slower responses (3-5 sec) - OK (file-based retrieval)

**Fail if:**
- ❌ Made-up protocol numbers (TP-9999, etc.)
- ❌ Medication doses outside safe ranges
- ❌ Misses critical contraindications
- ❌ System crashes or returns errors
- ❌ Response time > 10 seconds

---

## 🔍 Debugging Tips

If tests fail, check:

1. **Check Health Status:**
```bash
curl http://localhost:3002/api/health/protocols
```

2. **View Next.js Logs:**
```bash
# Check background process output
# (I started it in background - check terminal)
```

3. **Test Database Connection:**
```bash
curl http://localhost:54321/rest/v1/protocols \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
```

4. **Verify File Fallback:**
```bash
ls -lh data/ems_kb_clean.json
# Should be ~11MB with 7,014 chunks
```

---

## 🎯 Expected Performance

| Scenario | Response Time | Validation Checks |
|----------|---------------|-------------------|
| #1 Basic Lookup | < 2 sec | Protocol number valid |
| #2 Vague Query | < 3 sec | Query normalized |
| #3 Med Dosing | < 2 sec | Dose validated |
| #4 Pediatric | < 3 sec | Weight calc correct |
| #5 Complex | < 5 sec | Contraindication caught |

---

## 💡 What You're Testing

1. **Validation Pipeline:** Query normalization, vague query detection
2. **Error Recovery:** File fallback when database is empty
3. **Medication Safety:** Dose range validation (40+ medications)
4. **Protocol Accuracy:** Correct LA County protocols cited
5. **Clinical Safety:** Contraindications identified

---

**Ready to test! Start with Scenario #1 and work your way up.** 🚑
