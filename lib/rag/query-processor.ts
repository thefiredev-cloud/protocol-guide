/**
 * Protocol Guide - Query Preprocessing for EMS
 *
 * Comprehensive query analysis and preprocessing for EMS protocol queries.
 * Extracts entities, classifies query types, and recommends search strategies.
 */

import { expandQuery, hasAcronyms, type ExpandedQueryResult } from './medical-acronyms';

// ============================================
// Types
// ============================================

export interface ProcessedQuery {
  original: string;
  normalized: string;
  expanded: string;
  queryType: 'protocol_ref' | 'symptom' | 'medication' | 'dosing' | 'criteria' | 'procedure' | 'general';
  extractedEntities: {
    protocolRefs: string[];
    medications: string[];
    symptoms: string[];
    patientType: 'adult' | 'pediatric' | 'neonatal' | null;
    ageYears: number | null;
    weightKg: number | null;
  };
  searchStrategies: ('hybrid' | 'keyword' | 'semantic' | 'exact')[];
  acronymExpansion?: ExpandedQueryResult;
}

// ============================================
// Constants
// ============================================

/**
 * Common EMS medications for extraction
 */
const COMMON_MEDICATIONS = [
  // Cardiac
  'epinephrine', 'epi', 'adrenaline',
  'atropine',
  'amiodarone', 'cordarone',
  'lidocaine', 'xylocaine',
  'adenosine', 'adenocard',
  'nitroglycerin', 'ntg', 'nitro',
  'aspirin', 'asa',
  'metoprolol',
  'diltiazem',
  'dopamine',
  'norepinephrine', 'levophed',

  // Respiratory
  'albuterol', 'proventil', 'ventolin',
  'ipratropium', 'atrovent',
  'epinephrine racemic',

  // Analgesia/Sedation
  'fentanyl', 'sublimaze',
  'morphine',
  'ketamine', 'ketalar',
  'midazolam', 'versed',
  'diazepam', 'valium',
  'lorazepam', 'ativan',

  // Anaphylaxis
  'diphenhydramine', 'benadryl',
  'methylprednisolone', 'solu-medrol',
  'dexamethasone', 'decadron',

  // Antidotes
  'naloxone', 'narcan',
  'flumazenil', 'romazicon',
  'glucagon',

  // Glucose
  'dextrose', 'd50', 'd25', 'd10',
  'glucose', 'oral glucose',

  // Airway/Intubation
  'succinylcholine',
  'rocuronium',
  'etomidate',
  'propofol',

  // Antiemetic
  'ondansetron', 'zofran',

  // Seizure
  'lorazepam',
  'midazolam',
  'diazepam',

  // Other
  'calcium chloride',
  'magnesium sulfate',
  'sodium bicarbonate',
  'hydralazine',
];

/**
 * Common EMS symptoms and complaints
 */
const COMMON_SYMPTOMS = [
  // Cardiac
  'chest pain', 'cp', 'cardiac arrest', 'heart attack',
  'bradycardia', 'tachycardia', 'dysrhythmia', 'arrhythmia',
  'palpitations', 'irregular heartbeat',

  // Respiratory
  'shortness of breath', 'sob', 'dyspnea', 'difficulty breathing',
  'respiratory distress', 'respiratory arrest',
  'wheezing', 'stridor', 'rales', 'crackles',
  'cough', 'coughing', 'apnea',

  // Neurological
  'altered mental status', 'ams', 'confusion', 'unresponsive',
  'seizure', 'seizing', 'convulsions',
  'stroke', 'cva', 'tia', 'stroke symptoms',
  'facial droop', 'arm drift', 'slurred speech',
  'headache', 'severe headache',
  'syncope', 'fainting', 'loss of consciousness',

  // Trauma
  'trauma', 'injury', 'bleeding', 'hemorrhage',
  'fracture', 'broken bone',
  'head injury', 'head trauma',
  'abdominal pain', 'belly pain',
  'back pain', 'neck pain',

  // Other
  'anaphylaxis', 'allergic reaction', 'hives',
  'overdose', 'poisoning', 'toxic ingestion',
  'hypoglycemia', 'low blood sugar',
  'hyperglycemia', 'high blood sugar',
  'diabetic emergency',
  'nausea', 'vomiting', 'emesis',
  'fever', 'hypothermia', 'hyperthermia',
  'burn', 'burns',
  'shock', 'hypotension', 'low blood pressure',
];

/**
 * Protocol reference patterns
 */
const PROTOCOL_REF_PATTERNS = [
  // TP-1201, TP 1201, TP1201
  /\btp[-\s]?(\d{3,4}(?:\.\d+)?)\b/gi,
  // Ref-1201, Ref 1201, Ref.1201
  /\bref\.?[-\s]?(\d{3,4}(?:\.\d+)?)\b/gi,
  // MCG-1302, MCG 1302
  /\bmcg[-\s]?(\d{3,4}(?:\.\d+)?)\b/gi,
  // Protocol 1201
  /\bprotocol[-\s]?(\d{3,4}(?:\.\d+)?)\b/gi,
  // Policy 830, policy 1317.6
  /\bpolicy[-\s]?(\d{3,4}(?:\.\d+)?)\b/gi,
  // Standalone 3-4 digit numbers (e.g., "1201", "521")
  /\b(\d{3,4})\b/g,
];

/**
 * Age extraction patterns
 */
const AGE_PATTERNS = [
  // "5 years old", "5 year old", "5yo", "5 y/o"
  /(\d+)\s*(?:years?|yo|y\/o)(?:\s*old)?/i,
  // "5 months old", "5mo"
  /(\d+)\s*(?:months?|mo)(?:\s*old)?/i,
  // "5 days old", "5 day old"
  /(\d+)\s*(?:days?|d)(?:\s*old)?/i,
  // "infant", "neonate", "newborn"
  /\b(infant|neonate|newborn)\b/i,
  // "child", "toddler", "adolescent"
  /\b(child|toddler|adolescent|teen(?:ager)?)\b/i,
  // "adult", "elderly"
  /\b(adult|elderly|geriatric)\b/i,
];

/**
 * Weight extraction patterns
 */
const WEIGHT_PATTERNS = [
  // "70 kg", "70kg", "70 kilograms"
  /(\d+(?:\.\d+)?)\s*(?:kg|kilogram)s?\b/i,
  // "150 lbs", "150lb", "150 pounds"
  /(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b/i,
];

/**
 * Criteria query indicators
 */
const CRITERIA_INDICATORS = [
  'criteria', 'eligibility', 'requirements', 'qualifications',
  'indications', 'destination', 'referral', 'transport to',
  'when to', 'should i', 'can i transport',
];

/**
 * Procedure query indicators
 */
const PROCEDURE_INDICATORS = [
  'how to', 'procedure', 'steps', 'perform', 'technique',
  'method', 'do i', 'perform', 'administration',
];

// ============================================
// Helper Functions
// ============================================

/**
 * Normalize query text
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Extract protocol references from query
 */
function extractProtocolRefs(query: string): string[] {
  const refs = new Set<string>();

  for (const pattern of PROTOCOL_REF_PATTERNS) {
    const matches = Array.from(query.matchAll(pattern));
    for (const match of matches) {
      if (match[1]) {
        refs.add(match[1]);
      }
    }
  }

  return Array.from(refs);
}

/**
 * Extract medications mentioned in query
 */
function extractMedications(query: string): string[] {
  const normalized = normalizeText(query);
  const medications = new Set<string>();

  for (const med of COMMON_MEDICATIONS) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${med.replace(/[()]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalized)) {
      medications.add(med);
    }
  }

  return Array.from(medications);
}

/**
 * Extract symptoms mentioned in query
 */
function extractSymptoms(query: string): string[] {
  const normalized = normalizeText(query);
  const symptoms = new Set<string>();

  for (const symptom of COMMON_SYMPTOMS) {
    if (normalized.includes(symptom.toLowerCase())) {
      symptoms.add(symptom);
    }
  }

  return Array.from(symptoms);
}

/**
 * Extract patient age from query
 */
function extractAge(query: string): { ageYears: number | null; patientType: 'adult' | 'pediatric' | 'neonatal' | null } {
  let ageYears: number | null = null;
  let patientType: 'adult' | 'pediatric' | 'neonatal' | null = null;

  // Check for specific age mentions
  for (const pattern of AGE_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      const value = match[1];

      // Handle numeric ages
      if (!isNaN(Number(value))) {
        const age = Number(value);

        // Determine if it's years, months, or days from the pattern
        if (pattern.source.includes('months?|mo')) {
          ageYears = age / 12;
        } else if (pattern.source.includes('days?|d')) {
          ageYears = age / 365;
        } else {
          ageYears = age;
        }

        break;
      }

      // Handle text-based age descriptors
      const descriptor = value.toLowerCase();
      if (descriptor === 'neonate' || descriptor === 'newborn') {
        ageYears = 0;
        patientType = 'neonatal';
        break;
      } else if (descriptor === 'infant') {
        ageYears = 0.5; // Approximate
        patientType = 'pediatric';
        break;
      } else if (descriptor === 'child' || descriptor === 'toddler') {
        ageYears = 5; // Approximate
        patientType = 'pediatric';
        break;
      } else if (descriptor === 'adolescent' || descriptor === 'teen' || descriptor === 'teenager') {
        ageYears = 15; // Approximate
        patientType = 'pediatric';
        break;
      } else if (descriptor === 'adult' || descriptor === 'elderly' || descriptor === 'geriatric') {
        ageYears = 40; // Approximate
        patientType = 'adult';
        break;
      }
    }
  }

  // Determine patient type from age if not already set
  if (ageYears !== null && patientType === null) {
    if (ageYears < 0.1) { // ~28 days
      patientType = 'neonatal';
    } else if (ageYears < 18) {
      patientType = 'pediatric';
    } else {
      patientType = 'adult';
    }
  }

  // Also check for pediatric keywords
  if (patientType === null) {
    const pediatricKeywords = ['pediatric', 'peds', 'child', 'kid', 'baby', 'infant', 'neonate'];
    const normalized = normalizeText(query);
    for (const keyword of pediatricKeywords) {
      if (normalized.includes(keyword)) {
        patientType = 'pediatric';
        break;
      }
    }
  }

  return { ageYears, patientType };
}

/**
 * Extract patient weight from query
 */
function extractWeight(query: string): number | null {
  for (const pattern of WEIGHT_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      const value = Number(match[1]);

      // Convert pounds to kg if needed
      if (pattern.source.includes('lbs?|pounds?')) {
        return value * 0.453592;
      }

      return value;
    }
  }

  return null;
}

/**
 * Classify query type
 */
function classifyQueryType(
  query: string,
  entities: ProcessedQuery['extractedEntities']
): ProcessedQuery['queryType'] {
  const normalized = normalizeText(query);

  // 1. Protocol reference query (highest priority)
  if (entities.protocolRefs.length > 0) {
    return 'protocol_ref';
  }

  // 2. Dosing query
  const dosingKeywords = ['dose', 'dosage', 'dosing', 'how much', 'mg', 'mcg', 'ml', 'mg/kg', 'mcg/kg'];
  if (dosingKeywords.some(kw => normalized.includes(kw))) {
    return 'dosing';
  }

  // 3. Medication query
  if (entities.medications.length > 0) {
    return 'medication';
  }

  // 4. Criteria query
  if (CRITERIA_INDICATORS.some(indicator => normalized.includes(indicator))) {
    return 'criteria';
  }

  // 5. Procedure query
  if (PROCEDURE_INDICATORS.some(indicator => normalized.includes(indicator))) {
    return 'procedure';
  }

  // 6. Symptom query
  if (entities.symptoms.length > 0) {
    return 'symptom';
  }

  // 7. General query (fallback)
  return 'general';
}

/**
 * Recommend search strategies based on query characteristics
 */
function recommendSearchStrategies(
  queryType: ProcessedQuery['queryType'],
  entities: ProcessedQuery['extractedEntities'],
  hasAcronyms: boolean
): ProcessedQuery['searchStrategies'] {
  const strategies: ProcessedQuery['searchStrategies'] = [];

  switch (queryType) {
    case 'protocol_ref':
      // Exact protocol reference - use exact matching first
      strategies.push('exact', 'keyword');
      break;

    case 'dosing':
    case 'medication':
      // Medication/dosing - prefer hybrid for context + keywords
      strategies.push('hybrid', 'keyword');
      break;

    case 'criteria':
      // Criteria queries - semantic understanding important
      strategies.push('semantic', 'hybrid');
      break;

    case 'procedure':
      // Procedures - hybrid for step-by-step content
      strategies.push('hybrid', 'semantic');
      break;

    case 'symptom':
      // Symptoms - semantic similarity important
      strategies.push('semantic', 'hybrid');
      break;

    case 'general':
      // General queries - use all strategies
      strategies.push('hybrid');
      break;
  }

  // If query has known medical acronyms, boost semantic search
  if (hasAcronyms && !strategies.includes('semantic')) {
    strategies.push('semantic');
  }

  // If specific entities detected, add keyword search
  if (entities.medications.length > 0 || entities.symptoms.length > 0) {
    if (!strategies.includes('keyword')) {
      strategies.push('keyword');
    }
  }

  return strategies;
}

// ============================================
// Main Processing Function
// ============================================

/**
 * Process and analyze an EMS query
 *
 * @param query - The user's search query
 * @returns Comprehensive processed query object
 *
 * @example
 * ```typescript
 * const result = processQuery("What's the LAMS criteria for a 65yo with facial droop?");
 * // Returns:
 * // {
 * //   original: "What's the LAMS criteria for a 65yo with facial droop?",
 * //   normalized: "what's the lams criteria for a 65yo with facial droop?",
 * //   expanded: "what's the lams Los Angeles Motor Scale arm drift...",
 * //   queryType: 'criteria',
 * //   extractedEntities: {
 * //     protocolRefs: ['521', '522', '1232'],
 * //     medications: [],
 * //     symptoms: ['facial droop'],
 * //     patientType: 'adult',
 * //     ageYears: 65,
 * //     weightKg: null
 * //   },
 * //   searchStrategies: ['semantic', 'hybrid'],
 * //   acronymExpansion: { ... }
 * // }
 * ```
 */
export function processQuery(query: string): ProcessedQuery {
  // Step 1: Normalize text
  const normalized = normalizeText(query);

  // Step 2: Expand medical acronyms
  const acronymExpansion = hasAcronyms(query) ? expandQuery(query) : undefined;
  const expanded = acronymExpansion?.expandedQuery || normalized;

  // Step 3: Extract entities
  const protocolRefs = extractProtocolRefs(query);

  // Add protocol refs from acronym expansion
  if (acronymExpansion?.relatedProtocols) {
    protocolRefs.push(...acronymExpansion.relatedProtocols);
  }

  const medications = extractMedications(query);
  const symptoms = extractSymptoms(query);
  const { ageYears, patientType } = extractAge(query);
  const weightKg = extractWeight(query);

  const extractedEntities: ProcessedQuery['extractedEntities'] = {
    protocolRefs: Array.from(new Set(protocolRefs)), // Deduplicate
    medications,
    symptoms,
    patientType,
    ageYears,
    weightKg,
  };

  // Step 4: Classify query type
  const queryType = classifyQueryType(query, extractedEntities);

  // Step 5: Recommend search strategies
  const searchStrategies = recommendSearchStrategies(
    queryType,
    extractedEntities,
    !!acronymExpansion
  );

  return {
    original: query,
    normalized,
    expanded,
    queryType,
    extractedEntities,
    searchStrategies,
    acronymExpansion,
  };
}

/**
 * Check if query is a simple protocol lookup (e.g., "1201", "TP-1201", "policy 830")
 */
export function isSimpleProtocolLookup(query: string): boolean {
  const trimmed = query.trim();
  return /^(?:tp[-\s]?|ref\.?\s*|mcg[-\s]?|protocol\s*|policy\s*)?(\d{3,4}(?:\.\d+)?)$/i.test(trimmed);
}

/**
 * Extract primary protocol number from simple lookup query
 */
export function extractPrimaryProtocol(query: string): string | null {
  if (!isSimpleProtocolLookup(query)) return null;
  const match = query.match(/(\d{3,4})/);
  return match ? match[1] : null;
}

/**
 * Enhance query with patient context
 */
export function enhanceQueryWithContext(
  processedQuery: ProcessedQuery,
  patientContext?: {
    age?: number;
    ageUnit?: 'years' | 'months' | 'days';
    weight?: number;
    chiefComplaint?: string;
  }
): string {
  if (!patientContext) return processedQuery.expanded;

  const contextParts: string[] = [processedQuery.expanded];

  if (patientContext.age !== undefined) {
    const ageStr = `${patientContext.age} ${patientContext.ageUnit || 'years'}`;
    contextParts.push(`patient age: ${ageStr}`);

    // Add pediatric context if applicable
    if (patientContext.age < 18 ||
        patientContext.ageUnit === 'months' ||
        patientContext.ageUnit === 'days') {
      contextParts.push('pediatric');
    }
  }

  if (patientContext.weight !== undefined) {
    contextParts.push(`weight: ${patientContext.weight} kg`);
  }

  if (patientContext.chiefComplaint) {
    contextParts.push(`complaint: ${patientContext.chiefComplaint}`);
  }

  return contextParts.join(' ');
}
