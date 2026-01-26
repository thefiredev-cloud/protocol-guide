# ImageTrend Data Formats

## NEMSIS Overview

NEMSIS (National Emergency Medical Services Information System) is the national standard for EMS data collection in the United States. ImageTrend Elite is fully NEMSIS v3.5 compliant.

Protocol Guide integration leverages NEMSIS data elements for intelligent protocol matching.

## NEMSIS Version Support

| Version | Status | Notes |
|---------|--------|-------|
| NEMSIS 3.5.0 | ✅ Supported | Current production version |
| NEMSIS 3.5.1 | ✅ Supported | Latest standard |
| NEMSIS 3.4.0 | ⚠️ Legacy | Limited support |

## Key Data Elements

### Patient Demographics

#### ePatient.15 - Age

Used for pediatric vs adult protocol routing.

| NEMSIS Field | Type | Range | Protocol Guide Usage |
|--------------|------|-------|---------------------|
| ePatient.15 | Integer | 0-130 | Route to age-appropriate protocols |
| ePatient.16 | Enum | Years/Months/Days | Age unit interpretation |

**Pediatric Thresholds** (LA County):
- Neonate: 0-28 days
- Infant: 29 days - 12 months
- Child: 1-12 years
- Adolescent: 13-17 years
- Adult: 18+ years

```typescript
function getAgeCategory(age: number, unit: 'years' | 'months' | 'days'): string {
  const ageInYears = unit === 'years' ? age : 
                     unit === 'months' ? age / 12 : 
                     age / 365;
  
  if (ageInYears < 0.08) return 'neonate';      // ~28 days
  if (ageInYears < 1) return 'infant';
  if (ageInYears < 13) return 'child';
  if (ageInYears < 18) return 'adolescent';
  return 'adult';
}
```

#### ePatient.14 - Gender

| Code | Value | Usage |
|------|-------|-------|
| 9906001 | Female | Pregnancy-related protocol filtering |
| 9906003 | Male | Standard protocols |
| 9906005 | Unknown | Use gender-neutral protocols |

---

### Clinical Assessment

#### eSituation.04 - Chief Complaint Anatomic Location

Primary search driver for protocol lookup.

**NEMSIS Values:**
| Code | Description | Protocol Search Term |
|------|-------------|---------------------|
| 9901001 | Abdomen | "abdominal pain" |
| 9901005 | Chest | "chest pain" |
| 9901007 | Head | "head injury" |
| 9901009 | Back | "back pain" |
| 9901015 | General/Systemic | (use chief complaint text) |

#### eSituation.09 - Primary Symptom

Free-text field describing chief complaint. Passed directly to Protocol Guide search.

```xml
<eSituation.09>Chest pain, sudden onset, radiating to left arm</eSituation.09>
```

→ Protocol Guide search: `"chest pain radiating arm"`

#### eSituation.11 - Primary Impression

Clinical impression code (ICD-10 or custom NEMSIS codes).

**Common ICD-10 Mappings:**

| ICD-10 | Description | Priority Protocols |
|--------|-------------|-------------------|
| I21.0 | STEMI - Anterior | 1210, 1211 (Chest Pain, STEMI) |
| I21.1 | STEMI - Inferior | 1210, 1211 |
| I21.4 | NSTEMI | 1210 (Chest Pain) |
| I46.2 | Cardiac Arrest - VF | 1230 (Cardiac Arrest) |
| I46.9 | Cardiac Arrest - Unspec | 1230 |
| J96.0 | Acute Respiratory Failure | 1220 (Respiratory) |
| J96.9 | Respiratory Failure NOS | 1220 |
| R41.82 | Altered Mental Status | 1208 (AMS) |
| G40.9 | Epilepsy/Seizure | 1227 (Seizure) |
| I63.9 | Stroke | 1260 (Stroke) |
| T78.2 | Anaphylactic Shock | 1270 (Allergic) |
| T40.1 | Heroin OD | 1280 (Overdose) |
| E11.65 | DKA | 1203 (Diabetic) |

---

### Vital Signs

#### eVitals Group

Protocol Guide can use vitals for severity assessment and contraindication checking.

| Element | Description | Protocol Relevance |
|---------|-------------|-------------------|
| eVitals.06 | SBP | Hypotension alerts, nitro contraindication |
| eVitals.07 | DBP | Hypertensive emergency routing |
| eVitals.10 | Heart Rate | Tachycardia/bradycardia protocols |
| eVitals.12 | SpO2 | Hypoxia alerts |
| eVitals.14 | Respiratory Rate | Respiratory distress assessment |
| eVitals.16 | GCS Total | Altered mental status severity |
| eVitals.23 | Blood Glucose | Hypoglycemia protocol routing |

**Example Vital-Based Routing:**

```typescript
interface VitalSigns {
  sbp?: number;
  heartRate?: number;
  spo2?: number;
  gcs?: number;
  glucose?: number;
}

function getVitalAlerts(vitals: VitalSigns): string[] {
  const alerts: string[] = [];
  
  if (vitals.sbp && vitals.sbp < 90) {
    alerts.push('HYPOTENSION: Consider shock protocol');
  }
  if (vitals.sbp && vitals.sbp > 180) {
    alerts.push('HYPERTENSIVE EMERGENCY: Avoid aggressive BP lowering');
  }
  if (vitals.heartRate && vitals.heartRate > 150) {
    alerts.push('TACHYCARDIA: Consider dysrhythmia protocol');
  }
  if (vitals.heartRate && vitals.heartRate < 50) {
    alerts.push('BRADYCARDIA: Consider pacing protocol');
  }
  if (vitals.spo2 && vitals.spo2 < 90) {
    alerts.push('HYPOXIA: Prioritize airway management');
  }
  if (vitals.gcs && vitals.gcs <= 8) {
    alerts.push('GCS ≤8: Consider airway protocol');
  }
  if (vitals.glucose && vitals.glucose < 60) {
    alerts.push('HYPOGLYCEMIA: Dextrose indicated');
  }
  
  return alerts;
}
```

---

### Medications & Procedures

#### eMedications.03 - Medication Given

For protocol compliance tracking and contraindication checking.

**Common EMS Medications (RxNorm):**
| RxNorm | Medication | Protocol Reference |
|--------|------------|-------------------|
| 1191 | Aspirin | 1210 (Chest Pain) |
| 7052 | Nitroglycerin | 1210 (Chest Pain) |
| 3992 | Epinephrine | 1230 (Cardiac Arrest), 1270 (Allergic) |
| 203220 | Naloxone | 1280 (Overdose) |
| 4337 | Fentanyl | 1290 (Pain Management) |
| 6470 | Midazolam | 1227 (Seizure) |
| 4850 | Glucagon | 1203 (Diabetic) |
| 4850 | Dextrose | 1203 (Diabetic) |

#### eProcedures.03 - Procedure

| NEMSIS Code | Procedure | Protocol Reference |
|-------------|-----------|-------------------|
| 9923001 | Advanced Airway | 1220 (Respiratory) |
| 9923003 | BVM | 1220 (Respiratory) |
| 9923005 | Chest Decompression | 1240 (Trauma) |
| 9923007 | CPR | 1230 (Cardiac Arrest) |
| 9923009 | Defibrillation | 1230 (Cardiac Arrest) |
| 9923011 | IO Access | Multiple |
| 9923013 | IV Access | Multiple |
| 9923015 | 12-Lead ECG | 1210 (Chest Pain) |

---

## ImageTrend-Specific Data

### Agency Configuration

ImageTrend agencies are identified by unique IDs that map to Protocol Guide agencies:

```json
{
  "imagetrend_agency_id": "CA-LA-FD-001",
  "protocol_guide_agency": "la-county-fd",
  "protocol_set": "la-county",
  "protocol_version": "2024",
  "features": {
    "pediatric_protocols": true,
    "als_protocols": true,
    "bls_protocols": true,
    "critical_care": false
  }
}
```

### External Link Template

ImageTrend Elite external link configuration:

```
URL: https://protocol-guide.app/api/imagetrend/launch
Parameters:
  - agency_id: {AgencyID}
  - search_term: {ChiefComplaint}
  - user_age: {PatientAge}
  - impression: {PrimaryImpression}
  - return_url: elite://incident/{IncidentID}
```

---

## Data Exchange Examples

### Launch Request (ImageTrend → Protocol Guide)

**Scenario: 62-year-old male with chest pain**

URL constructed by ImageTrend:
```
https://protocol-guide.app/api/imagetrend/launch
  ?agency_id=la-county-fd
  &search_term=chest+pain+sudden+onset+radiating+to+left+arm
  &user_age=62
  &impression=I21.4
  &return_url=elite://incident/2024-01-25-12345
```

Protocol Guide parses and uses:
- `agency_id` → Look up LA County protocols
- `search_term` → RAG search for "chest pain sudden onset radiating to left arm"
- `user_age` → 62 = Adult protocols
- `impression` → I21.4 (NSTEMI) = Boost cardiac protocols in ranking
- `return_url` → Store for "Return to ePCR" button

### Suggest Response (Protocol Guide → ImageTrend)

**Future API v2.0 response:**

```json
{
  "suggestions": [
    {
      "protocol_number": "1210",
      "protocol_title": "Chest Pain - Cardiac Ischemia",
      "relevance_score": 0.97,
      "nemsis_impression_codes": ["I21.0", "I21.1", "I21.4", "I25.1"],
      "age_category": "adult",
      "key_treatments": [
        {
          "medication": "Aspirin",
          "dose": "324mg",
          "route": "PO",
          "nemsis_rxnorm": "1191"
        },
        {
          "medication": "Nitroglycerin",
          "dose": "0.4mg",
          "route": "SL",
          "nemsis_rxnorm": "7052",
          "contraindications": ["SBP < 100", "Recent PDE5 inhibitor"]
        }
      ],
      "key_procedures": [
        {
          "procedure": "12-Lead ECG",
          "nemsis_code": "9923015",
          "timing": "Within 10 minutes of patient contact"
        }
      ],
      "alerts": [
        {
          "type": "contraindication",
          "message": "Patient SBP 145 - Nitroglycerin is appropriate"
        }
      ]
    }
  ]
}
```

### Export Data (Protocol Guide → ImageTrend)

**Protocol reference exported back to ePCR:**

```json
{
  "export_timestamp": "2026-01-25T20:30:00.000Z",
  "incident_id": "2024-01-25-12345",
  "protocol_accessed": {
    "protocol_number": "1210",
    "protocol_title": "Chest Pain - Cardiac Ischemia",
    "protocol_version": "2024",
    "sections_reviewed": [
      "History and Physical",
      "Treatment - Adult",
      "Medication Reference"
    ],
    "time_spent_seconds": 45
  },
  "medications_referenced": [
    {
      "medication": "Aspirin",
      "dose_calculated": "324mg",
      "nemsis_rxnorm": "1191"
    },
    {
      "medication": "Nitroglycerin",
      "dose_calculated": "0.4mg",
      "nemsis_rxnorm": "7052"
    }
  ],
  "clinical_notes": "Protocol 1210 reviewed for cardiac chest pain. Standard ACS treatment pathway followed."
}
```

---

## Validation Rules

### Age Validation

```typescript
function validateAge(age: number | undefined, unit: string): boolean {
  if (age === undefined) return true; // Optional field
  if (age < 0) return false;
  if (unit === 'years' && age > 130) return false;
  if (unit === 'months' && age > 1560) return false; // 130 years
  if (unit === 'days' && age > 47450) return false;  // 130 years
  return true;
}
```

### ICD-10 Validation

```typescript
const ICD10_PATTERN = /^[A-TV-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$/i;

function validateICD10(code: string | undefined): boolean {
  if (!code) return true; // Optional field
  return ICD10_PATTERN.test(code.trim());
}
```

### Agency ID Validation

```typescript
const VALID_AGENCIES = [
  'la-county-fd',
  'orange-county-ems',
  'san-diego-ems',
  // ... etc
];

function validateAgencyId(agencyId: string): boolean {
  return VALID_AGENCIES.includes(agencyId.toLowerCase());
}
```

---

## References

- [NEMSIS v3.5 Data Dictionary](https://nemsis.org/technical-resources/version-3/version-3-data-dictionaries/)
- [NEMSIS EMS API](https://nemsis.org/media/nemsis_v3/release-3.5.0/DataDictionary/APIs/EMSDataSetAPI/EMSDataSet_v3.html)
- [ICD-10-CM 2024](https://www.cms.gov/medicare/coding-billing/icd-10-codes/2024-icd-10-cm)
- [RxNorm API](https://rxnav.nlm.nih.gov/RxNormAPIs.html)
- [ImageTrend Elite Documentation](https://www.imagetrend.com/ems/) (Partner access required)
