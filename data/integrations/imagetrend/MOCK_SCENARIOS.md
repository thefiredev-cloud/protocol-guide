# ImageTrend Integration Demo Scenarios

## Overview

These demo scenarios simulate real-world ImageTrend Elite integration use cases. Use these for:
- Partnership demonstrations
- Developer testing
- Sales presentations
- Training materials

## Demo Environment

| Environment | URL | Notes |
|-------------|-----|-------|
| Production Demo | `https://protocol-guide.app/api/imagetrend/launch` | Live with demo agency |
| Staging | `https://staging.protocol-guide.app/api/imagetrend/launch` | Testing only |

**Demo Agency ID**: `demo-agency` (always available for testing)

---

## Scenario 1: Adult Cardiac Chest Pain

### Clinical Context
A 62-year-old male presents with sudden onset chest pain radiating to left arm, diaphoresis, and shortness of breath. Vitals: BP 145/90, HR 88, SpO2 96%.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=chest+pain+radiating+to+left+arm
  &user_age=62
  &impression=I21.4
  &return_url=demo://incident/DEMO-001
```

### Expected Behavior
1. Redirect to Protocol Guide search page
2. Auto-search for "chest pain radiating to left arm"
3. Top result: LA County Protocol 1210 (Chest Pain)
4. Adult dosing displayed (Aspirin 324mg, Nitro 0.4mg)
5. "Return to ePCR" button visible

### Test This Scenario
[Launch Demo - Adult Chest Pain](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=chest+pain+radiating+to+left+arm&user_age=62&impression=I21.4&return_url=demo://back)

---

## Scenario 2: Pediatric Respiratory Distress

### Clinical Context
A 4-year-old female with acute respiratory distress, wheezing, and use of accessory muscles. History of asthma. Vitals: RR 32, HR 120, SpO2 88%.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=respiratory+distress+wheezing
  &user_age=4
  &impression=J45.901
  &return_url=demo://incident/DEMO-002
```

### Expected Behavior
1. Redirect to Protocol Guide search
2. Auto-search for "respiratory distress wheezing"
3. Top result: LA County Protocol 1220-P (Pediatric Respiratory)
4. **Pediatric dosing displayed** (weight-based albuterol)
5. Age indicator shows "Pediatric (4 years)"

### Test This Scenario
[Launch Demo - Peds Respiratory](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=respiratory+distress+wheezing&user_age=4&impression=J45.901&return_url=demo://back)

---

## Scenario 3: Opioid Overdose

### Clinical Context
A 28-year-old male found unresponsive with pinpoint pupils and respiratory depression. Suspected heroin overdose. Vitals: RR 4, HR 50, SpO2 75%.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=overdose+unresponsive+pinpoint+pupils
  &user_age=28
  &impression=T40.1X1A
  &return_url=demo://incident/DEMO-003
```

### Expected Behavior
1. Redirect with overdose search
2. Top result: Protocol 1280 (Overdose/Toxic Ingestion)
3. Naloxone dosing highlighted
4. Airway management reminders

### Test This Scenario
[Launch Demo - Overdose](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=overdose+unresponsive+pinpoint+pupils&user_age=28&impression=T40.1X1A&return_url=demo://back)

---

## Scenario 4: Cardiac Arrest

### Clinical Context
A 70-year-old male found in cardiac arrest by family. Bystander CPR in progress. Initial rhythm: ventricular fibrillation.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=cardiac+arrest+vfib
  &user_age=70
  &impression=I46.2
  &return_url=demo://incident/DEMO-004
```

### Expected Behavior
1. High-priority search for cardiac arrest
2. Top result: Protocol 1230 (Cardiac Arrest)
3. ACLS algorithm displayed
4. Epinephrine/amiodarone dosing
5. Post-ROSC care if applicable

### Test This Scenario
[Launch Demo - Cardiac Arrest](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=cardiac+arrest+vfib&user_age=70&impression=I46.2&return_url=demo://back)

---

## Scenario 5: Stroke Alert

### Clinical Context
A 55-year-old female with sudden onset right-sided weakness, facial droop, and slurred speech. Symptom onset 45 minutes ago.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=stroke+facial+droop+weakness
  &user_age=55
  &impression=I63.9
  &return_url=demo://incident/DEMO-005
```

### Expected Behavior
1. Stroke-focused search results
2. Top result: Protocol 1260 (Stroke)
3. Time-critical alerts displayed
4. Stroke center notification reminder
5. Blood glucose check reminder

### Test This Scenario
[Launch Demo - Stroke](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=stroke+facial+droop+weakness&user_age=55&impression=I63.9&return_url=demo://back)

---

## Scenario 6: Anaphylaxis

### Clinical Context
A 35-year-old male with known bee allergy stung 10 minutes ago. Hives, lip swelling, throat tightness, hypotension. Vitals: BP 85/50, HR 110.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=anaphylaxis+bee+sting+hypotension
  &user_age=35
  &impression=T63.441A
  &return_url=demo://incident/DEMO-006
```

### Expected Behavior
1. Anaphylaxis search results
2. Top result: Protocol 1270 (Allergic Reaction/Anaphylaxis)
3. Epinephrine IM dosing highlighted
4. Fluid bolus reminder
5. Second dose timing guidance

### Test This Scenario
[Launch Demo - Anaphylaxis](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=anaphylaxis+bee+sting+hypotension&user_age=35&impression=T63.441A&return_url=demo://back)

---

## Scenario 7: Hypoglycemia

### Clinical Context
A 45-year-old insulin-dependent diabetic found confused and diaphoretic. Blood glucose 38 mg/dL.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=hypoglycemia+low+blood+sugar+confused
  &user_age=45
  &impression=E11.641
  &return_url=demo://incident/DEMO-007
```

### Expected Behavior
1. Diabetic emergency search
2. Top result: Protocol 1203 (Diabetic Emergencies)
3. Dextrose/glucagon dosing
4. Oral glucose option for conscious patients
5. Recheck glucose reminder

### Test This Scenario
[Launch Demo - Hypoglycemia](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=hypoglycemia+low+blood+sugar+confused&user_age=45&impression=E11.641&return_url=demo://back)

---

## Scenario 8: Seizure - Pediatric

### Clinical Context
An 8-year-old male with active tonic-clonic seizure lasting 5+ minutes. No seizure history. Parents report fever earlier today.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=seizure+pediatric+febrile
  &user_age=8
  &impression=R56.00
  &return_url=demo://incident/DEMO-008
```

### Expected Behavior
1. Pediatric seizure search
2. Top result: Protocol 1227-P (Pediatric Seizure)
3. **Weight-based midazolam dosing**
4. Febrile seizure considerations
5. Airway management if prolonged

### Test This Scenario
[Launch Demo - Peds Seizure](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=seizure+pediatric+febrile&user_age=8&impression=R56.00&return_url=demo://back)

---

## Scenario 9: Trauma - Blunt

### Clinical Context
A 30-year-old restrained driver in moderate-speed MVC. Complains of chest and abdominal pain. GCS 14.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=trauma+MVC+chest+abdominal+pain
  &user_age=30
  &impression=S00-T14
  &return_url=demo://incident/DEMO-009
```

### Expected Behavior
1. Trauma protocol search
2. Top result: Protocol 1240 (Trauma)
3. Trauma center criteria displayed
4. C-spine considerations
5. Pain management guidance

### Test This Scenario
[Launch Demo - Trauma](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=trauma+MVC+chest+abdominal+pain&user_age=30&impression=S00-T14&return_url=demo://back)

---

## Scenario 10: Behavioral Emergency

### Clinical Context
A 22-year-old male with acute agitation, paranoia, and threatening behavior. History of schizophrenia, non-compliant with medications.

### ImageTrend Launch URL
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=behavioral+agitation+psychiatric
  &user_age=22
  &impression=F20.9
  &return_url=demo://incident/DEMO-010
```

### Expected Behavior
1. Behavioral/psychiatric search
2. Top result: Protocol 1209 (Behavioral/Psychiatric Crisis)
3. Chemical sedation options
4. De-escalation reminders
5. Medical clearance considerations

### Test This Scenario
[Launch Demo - Behavioral](https://protocol-guide.app/api/imagetrend/launch?agency_id=demo-agency&search_term=behavioral+agitation+psychiatric&user_age=22&impression=F20.9&return_url=demo://back)

---

## Test Matrix

### By Age Group

| Age Group | Scenario # | Protocol Type |
|-----------|------------|---------------|
| Pediatric (0-12) | 2, 8 | Peds Respiratory, Peds Seizure |
| Adult (18-64) | 1, 3, 6, 7, 9, 10 | Various adult protocols |
| Geriatric (65+) | 4, 5 | Cardiac Arrest, Stroke |

### By System

| System | Scenario # | Protocols |
|--------|------------|-----------|
| Cardiac | 1, 4 | 1210, 1230 |
| Respiratory | 2 | 1220-P |
| Neurological | 5, 8 | 1260, 1227 |
| Toxicology | 3 | 1280 |
| Allergic | 6 | 1270 |
| Metabolic | 7 | 1203 |
| Trauma | 9 | 1240 |
| Psychiatric | 10 | 1209 |

---

## API Response Examples

### Successful Launch Response

```http
HTTP/1.1 302 Found
Location: https://protocol-guide.app/app/protocol-search?query=chest+pain&age=62&impression=I21.4&agency=la-county-fd&source=imagetrend&return_url=demo://back
X-Request-Id: it-1706213400000-abc123
```

### Error Response - Missing Agency

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Missing required parameter: agency_id",
  "code": "MISSING_AGENCY_ID"
}
```

### Error Response - Unauthorized Agency

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "Agency not configured for ImageTrend",
  "code": "AGENCY_NOT_AUTHORIZED"
}
```

---

## Demo Script (Sales/Partnership)

### 5-Minute Demo Flow

1. **Introduction** (30 sec)
   - "Let me show you how Protocol Guide integrates with ImageTrend Elite"

2. **Scenario Setup** (30 sec)
   - "Imagine a paramedic documenting a chest pain patient in Elite"
   - Open ImageTrend Elite (or mock screen)

3. **Launch Integration** (60 sec)
   - Click "View Protocols" external link
   - Show URL parameters being passed
   - Protocol Guide opens with pre-filled search

4. **Protocol Access** (90 sec)
   - Show relevant protocols appearing
   - Highlight adult vs pediatric routing
   - Show medication dosing section
   - Navigate protocol sections

5. **Return Flow** (30 sec)
   - Click "Return to ePCR"
   - Show seamless return to ImageTrend

6. **Value Summary** (60 sec)
   - "That took 10 seconds instead of 60+"
   - "Protocol was already filtered for adult patients"
   - "Correct LA County protocol, not generic guidelines"

---

## Troubleshooting Test Cases

### Invalid Agency ID
```
GET /api/imagetrend/launch?agency_id=invalid-agency&search_term=test
Expected: 403 AGENCY_NOT_AUTHORIZED
```

### Missing Parameters
```
GET /api/imagetrend/launch?search_term=chest+pain
Expected: 400 MISSING_AGENCY_ID
```

### Empty Search
```
GET /api/imagetrend/launch?agency_id=la-county-fd
Expected: 302 redirect to blank search page
```

### Special Characters
```
GET /api/imagetrend/launch?agency_id=la-county-fd&search_term=chest%20pain%20%26%20sob
Expected: 302 redirect with properly encoded search
```

### Large Age Value
```
GET /api/imagetrend/launch?agency_id=la-county-fd&user_age=150
Expected: 302 redirect (age treated as adult)
```

---

## Mock Data Files

For automated testing, use the JSON files in this directory:

- `mock-scenarios.json` - All scenarios in machine-readable format
- `mock-agencies.json` - Test agency configurations
- `mock-responses.json` - Expected API responses
