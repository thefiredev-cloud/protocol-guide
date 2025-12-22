/**
 * Drug Intelligence Types
 *
 * Type definitions for offline-first drug database supporting
 * 2,500-5,000 medications for field use by LA County paramedics.
 *
 * Data sources: RxNorm API, DDInter, OpenFDA
 */

/**
 * Field summary bullet types for compact drug information
 */
export type FieldBulletType = 'use' | 'warning' | 'dose' | 'interaction' | 'reversal';

/**
 * Individual bullet point for field summary (max 80 chars)
 */
export interface FieldSummaryBullet {
  type: FieldBulletType;
  text: string; // Max 80 characters for scanability
}

/**
 * Drug severity classification for EMS relevance
 */
export type EMSRelevance = 'high' | 'moderate' | 'low';

/**
 * Drug schedule classification
 */
export type DrugSchedule = 'I' | 'II' | 'III' | 'IV' | 'V' | 'OTC' | 'Rx' | null;

/**
 * Compact drug record optimized for offline storage and field use
 * Target: ~2KB per drug, 5000 drugs = ~10MB total
 */
export interface DrugRecord {
  // Identity (from RxNorm)
  rxcui: string;                    // RxNorm Concept Unique Identifier
  name: string;                     // Generic name (normalized, lowercase)
  displayName: string;              // Display name (proper case)
  brandNames: string[];             // Common brand names for identification

  // Classification
  drugClass: string;                // e.g., "Beta Blocker", "Opioid Analgesic"
  drugClasses: string[];            // All applicable classes
  schedule: DrugSchedule;

  // Field Summary (4-5 bullets max)
  fieldSummary: FieldSummaryBullet[];

  // Identification aids
  pillImprint?: string;             // Common imprints for pill ID
  appearance?: string;              // "White round tablet", "Blue capsule"

  // Interaction data
  interactionRxcuis: string[];      // List of RxCUIs this drug interacts with

  // Prehospital relevance
  emsRelevance: EMSRelevance;
  laCountyFormulary: boolean;       // Is it in LA County EMS formulary

  // Metadata
  lastUpdated?: string;             // ISO date string
}

/**
 * Drug interaction severity levels
 */
export type InteractionSeverity = 'major' | 'moderate' | 'minor';

/**
 * Drug-drug interaction record from DDInter/RxNorm
 */
export interface DrugInteraction {
  drugA_rxcui: string;
  drugB_rxcui: string;
  drugA_name: string;
  drugB_name: string;
  severity: InteractionSeverity;
  mechanism: string;                // Brief mechanism (1-2 sentences, max 200 chars)
  management: string;               // Field management advice (max 200 chars)
  source: 'ddinter' | 'rxnorm' | 'openfda';
}

/**
 * Manifest for drug database versioning
 */
export interface DrugDatabaseManifest {
  version: string;
  generatedAt: string;
  drugCount: number;
  interactionCount: number;
  sources: {
    rxnorm: { version: string; lastUpdated: string };
    ddinter: { version: string; lastUpdated: string };
    openfda: { version: string; lastUpdated: string };
  };
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

/**
 * Result from drug lookup service
 */
export interface DrugLookupResult {
  found: boolean;
  drug?: DrugRecord;
  fieldBullets?: string[];          // Formatted bullet points
  suggestions?: string[];           // If not found, suggest similar drugs
  normalizedFrom?: string;          // If brand name was converted to generic
}

/**
 * Individual interaction alert for field display
 */
export interface InteractionAlert {
  drugA: string;
  drugB: string;
  severity: InteractionSeverity;
  mechanism: string;
  management: string;
}

/**
 * Result from drug interaction checker
 */
export interface InteractionCheckResult {
  hasInteractions: boolean;
  majorInteractions: InteractionAlert[];
  moderateInteractions: InteractionAlert[];
  minorInteractions: InteractionAlert[];
  summary: string;                  // Field-friendly summary
}

/**
 * Query for drug identification
 */
export interface IdentificationQuery {
  imprint?: string;                 // Letters/numbers on pill
  color?: string;                   // Pill color
  shape?: string;                   // round, oval, capsule, etc.
  patientDescription?: string;      // "Blood pressure pill" etc.
}

/**
 * Individual match from drug identification
 */
export interface DrugIdentificationMatch {
  drug: DrugRecord;
  matchScore: number;               // 0-100
  matchedOn: string[];              // What fields matched
}

/**
 * Result from drug identification service
 */
export interface IdentificationResult {
  matches: DrugIdentificationMatch[];
  confidence: 'high' | 'medium' | 'low' | 'none';
  suggestion: string;               // Field-friendly suggestion
}

// ============================================================================
// INDEXEDDB SCHEMA
// ============================================================================

/**
 * IndexedDB database metadata
 */
export interface DrugDatabaseMetadata {
  key: string;                      // 'version', 'loadedAt', 'lastChecked'
  value: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * RxNorm API response for drug properties
 */
export interface RxNormDrugResponse {
  rxcui: string;
  name: string;
  tty: string;                      // Term type (IN, BN, etc.)
  synonym?: string;
}

/**
 * OpenFDA label response (simplified)
 */
export interface OpenFDALabelResponse {
  indications_and_usage?: string[];
  boxed_warning?: string[];
  contraindications?: string[];
  warnings?: string[];
  drug_interactions?: string[];
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    rxcui?: string[];
    pharm_class_epc?: string[];     // Pharmacologic class
  };
}

// ============================================================================
// LA COUNTY FORMULARY
// ============================================================================

/**
 * LA County EMS formulary medications
 * From Policy 803.1 and MCG references
 */
export const LA_COUNTY_FORMULARY: string[] = [
  'acetaminophen',
  'adenosine',
  'albuterol',
  'amiodarone',
  'aspirin',
  'atropine',
  'calcium chloride',
  'dextrose',
  'diphenhydramine',
  'epinephrine',
  'fentanyl',
  'glucagon',
  'ketamine',
  'ketorolac',
  'lidocaine',
  'magnesium sulfate',
  'midazolam',
  'morphine',
  'naloxone',
  'nitroglycerin',
  'olanzapine',
  'ondansetron',
  'pralidoxime',
  'sodium bicarbonate',
  'tranexamic acid'
];

/**
 * Check if a drug is in LA County formulary
 */
export function isInLACountyFormulary(drugName: string): boolean {
  const normalized = drugName.toLowerCase().trim();
  return LA_COUNTY_FORMULARY.some(
    formularyDrug =>
      normalized.includes(formularyDrug) ||
      formularyDrug.includes(normalized)
  );
}

// ============================================================================
// DRUG CLASS MAPPINGS
// ============================================================================

/**
 * Common drug class keywords for patient descriptions
 */
export const DRUG_CLASS_KEYWORDS: Record<string, string[]> = {
  'blood pressure': ['ACE Inhibitor', 'ARB', 'Beta Blocker', 'Calcium Channel Blocker', 'Diuretic'],
  'blood thinner': ['Anticoagulant', 'Antiplatelet'],
  'heart pill': ['Beta Blocker', 'ACE Inhibitor', 'Antiarrhythmic', 'Nitrate'],
  'heart medicine': ['Beta Blocker', 'ACE Inhibitor', 'Antiarrhythmic', 'Nitrate'],
  'diabetes': ['Insulin', 'Sulfonylurea', 'Biguanide', 'DPP-4 Inhibitor', 'SGLT2 Inhibitor'],
  'sugar': ['Insulin', 'Sulfonylurea', 'Biguanide'],
  'cholesterol': ['Statin', 'Fibrate', 'PCSK9 Inhibitor'],
  'pain': ['Opioid Analgesic', 'NSAID', 'Acetaminophen'],
  'pain killer': ['Opioid Analgesic', 'NSAID', 'Acetaminophen'],
  'anxiety': ['Benzodiazepine', 'SSRI', 'SNRI', 'Buspirone'],
  'depression': ['SSRI', 'SNRI', 'TCA', 'MAOI'],
  'seizure': ['Anticonvulsant'],
  'epilepsy': ['Anticonvulsant'],
  'thyroid': ['Levothyroxine', 'Thyroid Hormone'],
  'breathing': ['Bronchodilator', 'Inhaled Corticosteroid'],
  'asthma': ['Bronchodilator', 'Inhaled Corticosteroid', 'Leukotriene Inhibitor'],
  'stomach': ['PPI', 'H2 Blocker', 'Antacid'],
  'acid reflux': ['PPI', 'H2 Blocker'],
  'infection': ['Antibiotic', 'Antifungal', 'Antiviral'],
  'antibiotic': ['Antibiotic'],
  'sleep': ['Benzodiazepine', 'Z-Drug', 'Antihistamine'],
  'allergy': ['Antihistamine'],
  'steroid': ['Corticosteroid'],
  'inflammation': ['Corticosteroid', 'NSAID']
};

/**
 * Reversal agents by drug class
 */
export const REVERSAL_AGENTS: Record<string, string> = {
  'Opioid Analgesic': 'Naloxone 0.4-2mg IV/IM/IN for overdose',
  'Benzodiazepine': 'Flumazenil 0.2mg IV (caution: may precipitate seizures)',
  'Beta Blocker': 'Glucagon 3-5mg IV for severe bradycardia/hypotension',
  'Calcium Channel Blocker': 'Calcium chloride 10% 10mL IV + high-dose insulin protocol',
  'Anticoagulant': 'Vitamin K, FFP, or specific reversal agent per anticoagulant type',
  'Antiplatelet': 'Platelet transfusion if life-threatening bleeding',
  'Sulfonylurea': 'Dextrose IV + Octreotide 50-100mcg SC/IV for hypoglycemia',
  'Insulin': 'Dextrose IV for hypoglycemia'
};
