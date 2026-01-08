/**
 * Query Processor Usage Examples
 *
 * Demonstrates how to use the query preprocessing module
 */

import { processQuery, isSimpleProtocolLookup, extractPrimaryProtocol, enhanceQueryWithContext } from './query-processor';

// ============================================
// Example 1: Protocol Reference Query
// ============================================
console.log('Example 1: Protocol Reference Query');
console.log('====================================');
const protocolQuery = processQuery("What is TP-1201?");
console.log(JSON.stringify(protocolQuery, null, 2));
console.log('\n');

// ============================================
// Example 2: Criteria Query with Acronym
// ============================================
console.log('Example 2: Criteria Query with Acronym');
console.log('=======================================');
const criteriaQuery = processQuery("What are the LAMS criteria for stroke patients?");
console.log(JSON.stringify(criteriaQuery, null, 2));
console.log('\n');

// ============================================
// Example 3: Dosing Query with Patient Info
// ============================================
console.log('Example 3: Dosing Query with Patient Info');
console.log('==========================================');
const dosingQuery = processQuery("What's the epinephrine dose for a 5 year old with anaphylaxis?");
console.log(JSON.stringify(dosingQuery, null, 2));
console.log('\n');

// ============================================
// Example 4: Symptom-Based Query
// ============================================
console.log('Example 4: Symptom-Based Query');
console.log('===============================');
const symptomQuery = processQuery("How do I treat chest pain and shortness of breath?");
console.log(JSON.stringify(symptomQuery, null, 2));
console.log('\n');

// ============================================
// Example 5: Procedure Query
// ============================================
console.log('Example 5: Procedure Query');
console.log('==========================');
const procedureQuery = processQuery("How to perform rapid sequence intubation?");
console.log(JSON.stringify(procedureQuery, null, 2));
console.log('\n');

// ============================================
// Example 6: Medication Query
// ============================================
console.log('Example 6: Medication Query');
console.log('===========================');
const medicationQuery = processQuery("When should I give naloxone to an overdose patient?");
console.log(JSON.stringify(medicationQuery, null, 2));
console.log('\n');

// ============================================
// Example 7: Simple Protocol Lookup
// ============================================
console.log('Example 7: Simple Protocol Lookup');
console.log('==================================');
const simpleQuery = "1201";
console.log(`Query: "${simpleQuery}"`);
console.log(`Is simple lookup: ${isSimpleProtocolLookup(simpleQuery)}`);
console.log(`Primary protocol: ${extractPrimaryProtocol(simpleQuery)}`);
console.log('\n');

// ============================================
// Example 8: Enhanced Query with Context
// ============================================
console.log('Example 8: Enhanced Query with Context');
console.log('=======================================');
const baseQuery = processQuery("What medication should I give?");
const enhanced = enhanceQueryWithContext(baseQuery, {
  age: 3,
  ageUnit: 'years',
  weight: 15,
  chiefComplaint: 'seizure'
});
console.log('Original:', baseQuery.original);
console.log('Enhanced:', enhanced);
console.log('\n');

// ============================================
// Example 9: Complex Multi-Entity Query
// ============================================
console.log('Example 9: Complex Multi-Entity Query');
console.log('======================================');
const complexQuery = processQuery("65yo male with chest pain, give ASA and NTG per protocol 503");
console.log(JSON.stringify(complexQuery, null, 2));
console.log('\n');

// ============================================
// Example 10: Pediatric Trauma Query
// ============================================
console.log('Example 10: Pediatric Trauma Query');
console.log('===================================');
const pedTraumaQuery = processQuery("What are PTC criteria for a 10yo child with head injury?");
console.log(JSON.stringify(pedTraumaQuery, null, 2));
