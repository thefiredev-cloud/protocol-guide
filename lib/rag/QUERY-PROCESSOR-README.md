# Query Processor - EMS Query Preprocessing

## Overview

The query processor provides comprehensive preprocessing for EMS protocol queries. It extracts entities, classifies query types, expands medical acronyms, and recommends optimal search strategies.

## Features

### 1. Text Normalization
- Converts to lowercase
- Removes extra whitespace
- Standardizes formatting

### 2. Entity Extraction

#### Protocol References
Detects and extracts protocol references in multiple formats:
- `TP-1201`, `TP 1201`, `TP1201`
- `Ref-1201`, `Ref 1201`, `Ref.1201`
- `MCG-1302`, `MCG 1302`
- `Protocol 1201`
- Standalone numbers: `1201`, `521`

#### Patient Information
- **Age**: `5 years old`, `5yo`, `5 y/o`, `5 months`, `infant`, `neonate`
- **Weight**: `70 kg`, `150 lbs`
- **Patient Type**: Automatically classifies as `adult`, `pediatric`, or `neonatal`

#### Medications
Extracts 50+ common EMS medications:
- Cardiac: epinephrine, atropine, amiodarone, adenosine, nitroglycerin, aspirin
- Respiratory: albuterol, ipratropium
- Analgesia: fentanyl, morphine, ketamine
- Sedation: midazolam, diazepam
- Antidotes: naloxone, flumazenil
- And many more...

#### Symptoms
Detects 40+ common EMS symptoms:
- Cardiac: chest pain, cardiac arrest, bradycardia, tachycardia
- Respiratory: shortness of breath, dyspnea, respiratory distress
- Neurological: altered mental status, seizure, stroke, syncope
- Trauma: bleeding, fracture, head injury
- And more...

### 3. Medical Acronym Expansion

Integrates with the medical acronyms dictionary to:
- Expand acronyms to full terms
- Add synonyms for better semantic matching
- Link to related protocols
- Examples: LAMS, ECMO, PTC, PMC, CSC, STEMI

### 4. Query Type Classification

Automatically classifies queries into 7 types:

1. **protocol_ref**: Direct protocol reference (e.g., "What is TP-1201?")
2. **dosing**: Medication dosing questions (e.g., "How much epinephrine?")
3. **medication**: General medication questions (e.g., "When to give naloxone?")
4. **criteria**: Destination/eligibility criteria (e.g., "PTC criteria?")
5. **procedure**: How-to procedural questions (e.g., "How to intubate?")
6. **symptom**: Symptom-based questions (e.g., "Treat chest pain?")
7. **general**: General questions (fallback)

### 5. Search Strategy Recommendations

Based on query characteristics, recommends optimal search strategies:

- **exact**: Exact protocol reference matching
- **keyword**: Full-text keyword search
- **semantic**: Vector embedding similarity search
- **hybrid**: Combined keyword + semantic search

Strategy selection is intelligent:
- Protocol references → exact + keyword
- Dosing/medication → hybrid + keyword
- Criteria → semantic + hybrid
- Procedures → hybrid + semantic
- Symptoms → semantic + hybrid

## Usage

### Basic Usage

```typescript
import { processQuery } from './lib/rag/query-processor';

const result = processQuery("What's the epinephrine dose for a 5 year old?");

console.log(result.queryType); // "dosing"
console.log(result.extractedEntities.medications); // ["epinephrine"]
console.log(result.extractedEntities.ageYears); // 5
console.log(result.extractedEntities.patientType); // "pediatric"
console.log(result.searchStrategies); // ["hybrid", "keyword"]
```

### Simple Protocol Lookup

```typescript
import { isSimpleProtocolLookup, extractPrimaryProtocol } from './lib/rag/query-processor';

const query = "1201";

if (isSimpleProtocolLookup(query)) {
  const protocolNum = extractPrimaryProtocol(query);
  console.log(protocolNum); // "1201"
  // Use exact matching for fast lookup
}
```

### Enhanced with Patient Context

```typescript
import { processQuery, enhanceQueryWithContext } from './lib/rag/query-processor';

const processed = processQuery("What medication should I give?");

const enhanced = enhanceQueryWithContext(processed, {
  age: 3,
  ageUnit: 'years',
  weight: 15,
  chiefComplaint: 'seizure'
});

console.log(enhanced);
// "what medication should i give? patient age: 3 years pediatric weight: 15 kg complaint: seizure"
```

## Integration with RAG Pipeline

The query processor integrates seamlessly with the existing RAG retrieval system:

```typescript
import { processQuery, enhanceQueryWithContext } from './lib/rag/query-processor';
import { retrieveContext } from './lib/rag/retrieval';

// Step 1: Preprocess query
const processed = processQuery(userQuery);

// Step 2: Enhance with patient context (optional)
const enhanced = enhanceQueryWithContext(processed, patientContext);

// Step 3: Retrieve with preprocessed info
const result = await retrieveContext(enhanced, patientContext, {
  maxChunks: 10,
  boostExplicitRefs: processed.extractedEntities.protocolRefs.length > 0
});

// Step 4: Use query analysis for better response generation
if (processed.queryType === 'dosing' && processed.extractedEntities.patientType === 'pediatric') {
  // Apply pediatric-specific dosing logic
}
```

## ProcessedQuery Type

```typescript
interface ProcessedQuery {
  original: string;                    // Original user query
  normalized: string;                  // Normalized text
  expanded: string;                    // Expanded with acronyms/synonyms
  queryType: 'protocol_ref' | 'symptom' | 'medication' | 'dosing' | 'criteria' | 'procedure' | 'general';
  extractedEntities: {
    protocolRefs: string[];           // Extracted protocol numbers
    medications: string[];            // Detected medications
    symptoms: string[];               // Detected symptoms
    patientType: 'adult' | 'pediatric' | 'neonatal' | null;
    ageYears: number | null;          // Patient age in years
    weightKg: number | null;          // Patient weight in kg
  };
  searchStrategies: ('hybrid' | 'keyword' | 'semantic' | 'exact')[];
  acronymExpansion?: ExpandedQueryResult; // Medical acronym details
}
```

## Examples

See `query-processor.example.ts` for comprehensive examples including:

1. Protocol reference queries
2. Criteria queries with acronyms (LAMS, PTC, PMC)
3. Dosing queries with patient info
4. Symptom-based queries
5. Procedure queries
6. Medication queries
7. Simple protocol lookups
8. Enhanced queries with context
9. Complex multi-entity queries
10. Pediatric trauma queries

Run examples:
```bash
npx tsx lib/rag/query-processor.example.ts
```

## Benefits

1. **Improved Search Accuracy**: Better entity extraction leads to more relevant results
2. **Intelligent Strategy Selection**: Right search method for each query type
3. **Enhanced Semantic Understanding**: Acronym expansion improves matching
4. **Patient-Aware Processing**: Automatic pediatric/adult/neonatal detection
5. **Fast Protocol Lookups**: Optimized path for direct protocol queries
6. **Medication Safety**: Accurate medication and dosing query detection
7. **Criteria Recognition**: Special handling for destination criteria queries

## File Location

- Main module: `/lib/rag/query-processor.ts`
- Examples: `/lib/rag/query-processor.example.ts`
- Export: Available via `/lib/rag/index.ts`

## Dependencies

- `./medical-acronyms`: For acronym expansion and related protocols
- TypeScript 5.x

## Future Enhancements

Potential improvements:
- Vital sign extraction (BP, HR, SpO2, etc.)
- Route of administration detection (IV, IM, IN, etc.)
- Contraindication detection
- Dosing calculation validation
- Multi-language support
- Machine learning-based entity recognition
