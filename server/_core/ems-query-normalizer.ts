/**
 * EMS Query Normalizer
 *
 * Handles rushed/abbreviated field queries by:
 * 1. Expanding common EMS abbreviations
 * 2. Correcting common typos
 * 3. Normalizing medical terminology
 * 4. Extracting query intent for better routing
 *
 * Critical for 2-second latency target - this preprocessing
 * improves retrieval accuracy without additional LLM calls.
 */

// ============================================================================
// EMS ABBREVIATION DICTIONARY
// ============================================================================

/**
 * Comprehensive EMS abbreviation expansion dictionary
 * Ordered by frequency of use in field queries
 */
export const EMS_ABBREVIATIONS: Record<string, string> = {
  // Vital Signs & Assessment
  'bp': 'blood pressure',
  'hr': 'heart rate',
  'rr': 'respiratory rate',
  'spo2': 'oxygen saturation',
  'o2sat': 'oxygen saturation',
  'gcs': 'glasgow coma scale',
  'loc': 'level of consciousness',
  'avpu': 'alert verbal pain unresponsive',
  'perrla': 'pupils equal round reactive to light and accommodation',
  'rom': 'range of motion',
  'bgl': 'blood glucose level',
  'bs': 'blood sugar',

  // Cardiac
  'vf': 'ventricular fibrillation',
  'vfib': 'ventricular fibrillation',
  'vtach': 'ventricular tachycardia',
  'vt': 'ventricular tachycardia',
  'svt': 'supraventricular tachycardia',
  'afib': 'atrial fibrillation',
  'aflutter': 'atrial flutter',
  'pea': 'pulseless electrical activity',
  'asystole': 'asystole',
  'rosc': 'return of spontaneous circulation',
  'stemi': 'st elevation myocardial infarction',
  'nstemi': 'non st elevation myocardial infarction',
  'mi': 'myocardial infarction',
  'acs': 'acute coronary syndrome',
  'chf': 'congestive heart failure',
  'htn': 'hypertension',
  'ekg': 'electrocardiogram',
  'ecg': 'electrocardiogram',
  'cpr': 'cardiopulmonary resuscitation',
  'aed': 'automated external defibrillator',
  'defib': 'defibrillation',
  'cardiovert': 'cardioversion',
  'pacing': 'transcutaneous pacing',
  'tcp': 'transcutaneous pacing',

  // Respiratory
  'sob': 'shortness of breath',
  'dyspnea': 'difficulty breathing',
  'copd': 'chronic obstructive pulmonary disease',
  'pe': 'pulmonary embolism',
  'pneumo': 'pneumothorax',
  'ptx': 'pneumothorax',
  'hemoptysis': 'coughing up blood',
  'bvm': 'bag valve mask',
  'nrb': 'non rebreather mask',
  'nc': 'nasal cannula',
  'cpap': 'continuous positive airway pressure',
  'bipap': 'bilevel positive airway pressure',
  'ett': 'endotracheal tube',
  'eti': 'endotracheal intubation',
  'rsi': 'rapid sequence intubation',
  'bls': 'basic life support',
  'als': 'advanced life support',
  'opa': 'oropharyngeal airway',
  'npa': 'nasopharyngeal airway',
  'lma': 'laryngeal mask airway',
  'igel': 'i-gel supraglottic airway',
  'king': 'king airway',

  // Neurological
  'cva': 'cerebrovascular accident stroke',
  'tia': 'transient ischemic attack',
  'sz': 'seizure',
  'szr': 'seizure',
  'tbi': 'traumatic brain injury',
  'icp': 'intracranial pressure',
  'ams': 'altered mental status',
  'etoh': 'alcohol intoxication',
  'od': 'overdose',

  // Trauma
  'mva': 'motor vehicle accident',
  'mvc': 'motor vehicle collision',
  'gsw': 'gunshot wound',
  'sw': 'stab wound',
  'fx': 'fracture',
  'lac': 'laceration',
  'avulsion': 'avulsion',
  'amputation': 'amputation',
  'tq': 'tourniquet',
  'c-spine': 'cervical spine',
  'tle': 'trauma life support',

  // Medications & Routes
  'iv': 'intravenous',
  'io': 'intraosseous',
  'im': 'intramuscular',
  'sq': 'subcutaneous',
  'subq': 'subcutaneous',
  'sl': 'sublingual',
  'po': 'by mouth oral',
  'pr': 'per rectum',
  'in': 'intranasal',
  'et': 'endotracheal',
  'nebs': 'nebulizer',
  'neb': 'nebulizer',
  'epi': 'epinephrine',
  'epipen': 'epinephrine auto injector',
  'ntg': 'nitroglycerin',
  'nitro': 'nitroglycerin',
  'asa': 'aspirin',
  'narcan': 'naloxone',
  'benadryl': 'diphenhydramine',
  'versed': 'midazolam',
  'ativan': 'lorazepam',
  'valium': 'diazepam',
  'dextrose': 'dextrose glucose',
  'd50': 'dextrose 50 percent',
  'd10': 'dextrose 10 percent',
  'mag': 'magnesium sulfate',
  'bicarb': 'sodium bicarbonate',
  'lido': 'lidocaine',
  'amio': 'amiodarone',
  'adenosine': 'adenosine',
  'fentanyl': 'fentanyl',
  'morphine': 'morphine',
  'zofran': 'ondansetron',
  'phenergan': 'promethazine',
  'ketamine': 'ketamine',
  'etomidate': 'etomidate',
  'roc': 'rocuronium',
  'succ': 'succinylcholine',
  'vec': 'vecuronium',
  'txa': 'tranexamic acid',

  // Patient Types
  'peds': 'pediatric',
  'ped': 'pediatric',
  'pedi': 'pediatric',
  'neo': 'neonate neonatal',
  'geri': 'geriatric',
  'ob': 'obstetric pregnant',
  'obgyn': 'obstetric gynecologic',
  'preg': 'pregnant pregnancy',
  'pt': 'patient',
  'pts': 'patients',

  // Conditions
  'anaphylaxis': 'anaphylaxis allergic reaction',
  'anaph': 'anaphylaxis allergic reaction',
  'allergic rxn': 'allergic reaction',
  'dka': 'diabetic ketoacidosis',
  'hypoglycemia': 'low blood sugar hypoglycemia',
  'hypo': 'hypoglycemia low blood sugar',
  'hyper': 'hyperglycemia high blood sugar',
  'sepsis': 'sepsis infection',
  'hypothermia': 'hypothermia cold exposure',
  'hyperthermia': 'hyperthermia heat stroke',
  'heat stroke': 'heat stroke hyperthermia',
  'cold exposure': 'hypothermia cold exposure',
  'drowning': 'drowning submersion',
  'electrocution': 'electrical injury electrocution',
  'burns': 'burn injury thermal',
  'chemical': 'chemical exposure hazmat',
  'toxic': 'toxic exposure poisoning',

  // Procedures
  'sync cardioversion': 'synchronized cardioversion',
  'intubation': 'endotracheal intubation',
  'needle decompression': 'needle thoracostomy',
  'chest decompression': 'needle thoracostomy',
  'cricothyrotomy': 'surgical airway cricothyrotomy',
  'cric': 'surgical airway cricothyrotomy',
};

/**
 * Common typos and misspellings in rushed queries
 */
export const TYPO_CORRECTIONS: Record<string, string> = {
  // Common medical term typos
  'epinephrin': 'epinephrine',
  'epinepherine': 'epinephrine',
  'epenephrine': 'epinephrine',
  'nitroglycerine': 'nitroglycerin',
  'nitroglycerain': 'nitroglycerin',
  'defibralation': 'defibrillation',
  'defibrilation': 'defibrillation',
  'cariopulmonary': 'cardiopulmonary',
  'cardiopulmonery': 'cardiopulmonary',
  'ventrcular': 'ventricular',
  'ventricular': 'ventricular',
  'tachycarida': 'tachycardia',
  'tachycardia': 'tachycardia',
  'bradicardia': 'bradycardia',
  'bradycarida': 'bradycardia',
  'anaphylaxsis': 'anaphylaxis',
  'anaphylaxis': 'anaphylaxis',
  'siezure': 'seizure',
  'seizure': 'seizure',
  'seizures': 'seizure',
  'seziure': 'seizure',
  'intubaton': 'intubation',
  'intubatin': 'intubation',
  'pediatirc': 'pediatric',
  'pediatric': 'pediatric',
  'pediactric': 'pediatric',
  'hypoglycema': 'hypoglycemia',
  'hypoglycemia': 'hypoglycemia',
  'hyperglycema': 'hyperglycemia',
  'naloxon': 'naloxone',
  'noloxone': 'naloxone',
  'morphone': 'morphine',
  'morphin': 'morphine',
  'fentanil': 'fentanyl',
  'fentynl': 'fentanyl',
  'midazolom': 'midazolam',
  'lorazepan': 'lorazepam',
  'atropene': 'atropine',
  'adenosin': 'adenosine',
  'amiodarone': 'amiodarone',
  'amioderone': 'amiodarone',
  'lidocain': 'lidocaine',
};

// ============================================================================
// QUERY INTENT CLASSIFICATION
// ============================================================================

/**
 * Query intent types for routing and context
 */
export type QueryIntent =
  | 'medication_dosing'
  | 'procedure_steps'
  | 'assessment_criteria'
  | 'differential_diagnosis'
  | 'contraindication_check'
  | 'pediatric_specific'
  | 'protocol_lookup'
  | 'general_query';

/**
 * Intent classification patterns
 * IMPORTANT: Order matters - more specific intents come first
 * Pediatric and contraindication checks take priority over general medication queries
 */
const INTENT_PATTERNS: { intent: QueryIntent; patterns: RegExp[]; priority: number }[] = [
  // Highest priority - safety critical checks
  {
    intent: 'contraindication_check',
    priority: 100,
    patterns: [
      /\b(?:contraindication|contraindicated|can't give|don't give|cannot give)\b/i,
      /\b(?:can\s+(?:i|you|we)\s+give.*(?:with|if|when))\b/i, // "can I give X with Y"
      /\b(?:safe to give|okay to give|ok to give)\b/i,
      /\b(?:interaction|drug interaction|med interaction)\b/i,
      /\b(?:avoid|caution|warning|precaution)\s+(?:with|when|if|for)\b/i, // More specific
      /\bpatient\s+(?:has\s+)?(?:allergy|allergic)\s+to\b/i, // Allergy TO something
      /\b(?:with|taking|on)\s+(?:viagra|cialis|nitrate|pde5|levitra|sildenafil)\b/i, // Common interaction queries
    ],
  },
  // Pediatric-specific (higher priority than general medication dosing)
  {
    intent: 'pediatric_specific',
    priority: 90,
    patterns: [
      /\b(?:peds?|pediatric|child|children)\s+(?:dose|dosing|dosage|protocol|treatment)\b/i,
      /\b(?:infant|neonate|newborn|baby)\s+(?:dose|dosing|protocol|treatment)\b/i,
      /\b(?:broselow|weight.based|kg.based|kilogram)\b/i,
      /\b(?:pediatric|peds?|child)\s+(?:mg|mcg|ml)(?:\/kg)?\b/i,
      /\b(?:dose|dosing)\s+(?:for|in)\s+(?:peds?|pediatric|child|children|infant)\b/i,
    ],
  },
  // Differential diagnosis
  {
    intent: 'differential_diagnosis',
    priority: 80,
    patterns: [
      /\b(?:differential|ddx|versus|vs\.?|compare|difference)\b/i,
      /\b(?:rule out|r\/o|could be|might be)\b/i,
      /\b(?:\w+)\s+(?:vs\.?|versus|or)\s+(?:\w+)\b/i, // "X vs Y" patterns
    ],
  },
  // Protocol lookup
  {
    intent: 'protocol_lookup',
    priority: 75,
    patterns: [
      /\b(?:protocol|policy|ref|reference)\s*(?:#|number|no\.?)?\s*\d+\b/i,
      /^\d{3,4}$/,
    ],
  },
  // Procedure steps
  {
    intent: 'procedure_steps',
    priority: 70,
    patterns: [
      /\b(?:how to|steps|procedure|perform|technique)\b/i,
      /\b(?:intubate|intubation|defibrillate|cardiovert)\b/i,
      /\b(?:needle|cric|chest tube|io|iv)\s*(?:access|placement|insertion)\b/i,
    ],
  },
  // Assessment criteria
  {
    intent: 'assessment_criteria',
    priority: 60,
    patterns: [
      /\b(?:criteria|indications?|when to|signs?|symptoms?)\b/i,
      /\b(?:assess|assessment|evaluate|diagnosis)\b/i,
      /\b(?:gcs|nihss|cincinnati|fast|apgar|score|scale)\b/i,
    ],
  },
  // Medication dosing (most general - lower priority)
  {
    intent: 'medication_dosing',
    priority: 50,
    patterns: [
      /\b(?:dose|dosage|dosing|how much|mg|mcg|units?)\b/i,
      /\b(?:give|administer|push|drip|infusion)\b/i,
      /\bmax(?:imum)?\s*dose\b/i,
    ],
  },
];

// ============================================================================
// MAIN NORMALIZATION FUNCTIONS
// ============================================================================

export interface NormalizedQuery {
  original: string;
  normalized: string;
  expandedAbbreviations: string[];
  correctedTypos: string[];
  intent: QueryIntent;
  isComplex: boolean;
  extractedMedications: string[];
  extractedConditions: string[];
  isEmergent: boolean;
}

/**
 * Normalize an EMS query for optimal retrieval
 *
 * @param query - Raw query from field user
 * @returns Normalized query with metadata
 */
export function normalizeEmsQuery(query: string): NormalizedQuery {
  const original = query.trim();
  let normalized = original.toLowerCase();

  const expandedAbbreviations: string[] = [];
  const correctedTypos: string[] = [];

  // Step 1: Correct common typos
  for (const [typo, correction] of Object.entries(TYPO_CORRECTIONS)) {
    const regex = new RegExp(`\\b${escapeRegex(typo)}\\b`, 'gi');
    if (regex.test(normalized)) {
      normalized = normalized.replace(regex, correction);
      correctedTypos.push(`${typo} -> ${correction}`);
    }
  }

  // Step 2: Expand abbreviations (preserve original + add expanded)
  const words = normalized.split(/\s+/);
  const expandedWords: string[] = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/g, '');
    const expansion = EMS_ABBREVIATIONS[cleanWord];

    if (expansion) {
      expandedWords.push(word); // Keep original
      expandedWords.push(expansion); // Add expansion
      expandedAbbreviations.push(`${cleanWord} -> ${expansion}`);
    } else {
      expandedWords.push(word);
    }
  }

  normalized = expandedWords.join(' ');

  // Step 3: Classify intent
  const intent = classifyIntent(normalized);

  // Step 4: Extract medical entities
  const extractedMedications = extractMedications(normalized);
  const extractedConditions = extractConditions(normalized);

  // Step 5: Determine complexity (for model routing)
  const isComplex = determineComplexity(normalized, intent);

  // Step 6: Check for emergent indicators
  const isEmergent = checkEmergentIndicators(normalized);

  return {
    original,
    normalized,
    expandedAbbreviations,
    correctedTypos,
    intent,
    isComplex,
    extractedMedications,
    extractedConditions,
    isEmergent,
  };
}

/**
 * Classify query intent for routing
 * Uses priority-based matching - higher priority intents take precedence
 */
function classifyIntent(query: string): QueryIntent {
  // Sort by priority (highest first) and find all matches
  const sortedPatterns = [...INTENT_PATTERNS].sort((a, b) => b.priority - a.priority);
  
  for (const { intent, patterns } of sortedPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        return intent;
      }
    }
  }
  return 'general_query';
}

/**
 * Extract medication names from query
 */
function extractMedications(query: string): string[] {
  const medicationPatterns = [
    'epinephrine', 'atropine', 'amiodarone', 'lidocaine', 'adenosine',
    'nitroglycerin', 'aspirin', 'morphine', 'fentanyl', 'ketamine',
    'midazolam', 'lorazepam', 'diazepam', 'naloxone', 'dextrose',
    'magnesium', 'calcium', 'sodium bicarbonate', 'albuterol',
    'diphenhydramine', 'ondansetron', 'promethazine', 'etomidate',
    'rocuronium', 'succinylcholine', 'vecuronium', 'dopamine',
    'norepinephrine', 'vasopressin', 'tranexamic acid',
  ];

  const found: string[] = [];
  for (const med of medicationPatterns) {
    if (query.includes(med)) {
      found.push(med);
    }
  }
  return found;
}

/**
 * Extract medical conditions from query
 */
function extractConditions(query: string): string[] {
  const conditionPatterns = [
    'cardiac arrest', 'ventricular fibrillation', 'ventricular tachycardia',
    'asystole', 'pulseless electrical activity', 'myocardial infarction',
    'stroke', 'seizure', 'anaphylaxis', 'hypoglycemia', 'hyperglycemia',
    'diabetic ketoacidosis', 'sepsis', 'pneumothorax', 'pulmonary embolism',
    'overdose', 'trauma', 'burn', 'hypothermia', 'hyperthermia',
    'respiratory distress', 'asthma', 'copd', 'congestive heart failure',
    'allergic reaction', 'childbirth', 'delivery', 'hemorrhage',
  ];

  const found: string[] = [];
  for (const condition of conditionPatterns) {
    if (query.includes(condition)) {
      found.push(condition);
    }
  }
  return found;
}

/**
 * Determine if query is complex (needs Sonnet vs Haiku)
 */
function determineComplexity(query: string, intent: QueryIntent): boolean {
  // Complex intents always use Sonnet
  if (['differential_diagnosis', 'contraindication_check'].includes(intent)) {
    return true;
  }

  // Multiple conditions/medications = complex
  const medications = extractMedications(query);
  const conditions = extractConditions(query);

  if (medications.length > 1 || conditions.length > 1) {
    return true;
  }

  // Pediatric + medication = complex (weight-based dosing)
  if (intent === 'pediatric_specific' && medications.length > 0) {
    return true;
  }

  // Long queries with multiple concepts
  const wordCount = query.split(/\s+/).length;
  if (wordCount > 15) {
    return true;
  }

  return false;
}

/**
 * Check for emergent/critical situation indicators
 */
function checkEmergentIndicators(query: string): boolean {
  const emergentPatterns = [
    /\b(?:cardiac arrest|code|coding|pulseless|apneic)\b/i,
    /\b(?:anaphylaxis|anaphylactic)\b/i,
    /\b(?:status epilepticus|continuous seizure)\b/i,
    /\b(?:massive hemorrhage|exsanguinating)\b/i,
    /\b(?:tension pneumothorax|sucking chest)\b/i,
    /\b(?:choking|airway obstruction|can't breathe)\b/i,
    /\b(?:unresponsive|unconscious)\b/i,
  ];

  return emergentPatterns.some(pattern => pattern.test(query));
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// MEDICAL TERMINOLOGY SYNONYMS
// ============================================================================

/**
 * Comprehensive medical terminology synonyms for query expansion
 * Organized by category for better recall on semantic search
 */
export const MEDICAL_SYNONYMS: Record<string, string[]> = {
  // Cardiac Conditions
  'cardiac arrest': ['code', 'asystole', 'vfib', 'vtach', 'pea', 'pulseless', 'flatline', 'full arrest'],
  'heart attack': ['myocardial infarction', 'mi', 'stemi', 'nstemi', 'acs', 'acute coronary syndrome'],
  'chest pain': ['angina', 'cardiac chest pain', 'acs', 'acute coronary syndrome', 'substernal chest pain'],
  'atrial fibrillation': ['afib', 'a-fib', 'irregular heartbeat', 'irregularly irregular'],
  'bradycardia': ['slow heart rate', 'low heart rate', 'symptomatic bradycardia'],
  'tachycardia': ['fast heart rate', 'rapid heart rate', 'svt', 'supraventricular tachycardia'],
  'ventricular fibrillation': ['vfib', 'v-fib', 'vf', 'shockable rhythm'],
  'ventricular tachycardia': ['vtach', 'v-tach', 'vt', 'wide complex tachycardia'],
  'pulseless electrical activity': ['pea', 'electrical activity without pulse'],
  'congestive heart failure': ['chf', 'heart failure', 'pulmonary edema', 'flash pulmonary edema'],
  
  // Respiratory Conditions
  'shortness of breath': ['dyspnea', 'sob', 'difficulty breathing', 'respiratory distress', 'labored breathing'],
  'asthma': ['bronchospasm', 'reactive airway', 'wheezing', 'asthma exacerbation', 'asthma attack'],
  'copd': ['chronic obstructive pulmonary disease', 'emphysema', 'chronic bronchitis', 'copd exacerbation'],
  'pulmonary embolism': ['pe', 'blood clot in lung', 'pulmonary embolus'],
  'pneumothorax': ['collapsed lung', 'tension pneumo', 'pneumo', 'ptx'],
  'respiratory arrest': ['apnea', 'not breathing', 'respiratory failure', 'agonal breathing'],
  
  // Neurological Conditions
  'stroke': ['cva', 'cerebrovascular accident', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke'],
  'seizure': ['convulsion', 'sz', 'fits', 'epileptic seizure', 'grand mal', 'tonic clonic'],
  'status epilepticus': ['continuous seizure', 'prolonged seizure', 'refractory seizure'],
  'altered mental status': ['ams', 'confusion', 'disorientation', 'altered loc', 'decreased loc'],
  'syncope': ['fainting', 'passed out', 'loss of consciousness', 'fainted', 'syncopal episode'],
  'traumatic brain injury': ['tbi', 'head injury', 'head trauma', 'concussion', 'closed head injury'],
  
  // Metabolic & Endocrine
  'hypoglycemia': ['low blood sugar', 'low glucose', 'insulin shock', 'hypoglycemic episode'],
  'hyperglycemia': ['high blood sugar', 'high glucose', 'diabetic emergency'],
  'diabetic ketoacidosis': ['dka', 'diabetic coma', 'ketoacidosis'],
  'hyperthermia': ['heat stroke', 'heat exhaustion', 'overheating', 'heat emergency'],
  'hypothermia': ['cold exposure', 'freezing', 'cold emergency', 'accidental hypothermia'],
  
  // Allergic & Immunologic
  'anaphylaxis': ['anaphylactic shock', 'severe allergic reaction', 'anaphylactic reaction', 'allergic emergency'],
  'allergic reaction': ['allergy', 'hives', 'urticaria', 'angioedema', 'mild allergic'],
  
  // Trauma
  'hemorrhage': ['bleeding', 'blood loss', 'hemorrhaging', 'exsanguination', 'massive bleeding'],
  'shock': ['hypoperfusion', 'circulatory shock', 'hypovolemic shock', 'cardiogenic shock'],
  'fracture': ['broken bone', 'fx', 'bone break', 'orthopedic injury'],
  'burns': ['thermal injury', 'burn injury', 'chemical burn', 'electrical burn'],
  
  // Obstetric
  'labor': ['childbirth', 'delivery', 'contractions', 'active labor', 'imminent delivery'],
  'postpartum hemorrhage': ['pph', 'postpartum bleeding', 'uterine bleeding after delivery'],
  'eclampsia': ['pregnancy seizure', 'toxemia', 'preeclampsia with seizure'],
  
  // Toxicology
  'overdose': ['od', 'drug overdose', 'poisoning', 'toxic ingestion', 'intoxication'],
  'opioid overdose': ['narcotic overdose', 'heroin overdose', 'fentanyl overdose', 'opioid toxicity'],
  'alcohol intoxication': ['etoh', 'drunk', 'alcohol poisoning', 'intoxicated'],
  
  // Airway & Procedures
  'intubation': ['eti', 'endotracheal intubation', 'tube placement', 'definitive airway'],
  'rapid sequence intubation': ['rsi', 'rapid sequence induction', 'drug-assisted intubation'],
  'supraglottic airway': ['sga', 'king airway', 'igel', 'lma', 'laryngeal mask'],
  'cricothyrotomy': ['cric', 'surgical airway', 'emergency airway', 'cricothyroidotomy'],
  'needle decompression': ['needle thoracostomy', 'chest decompression', 'needle chest'],
  'cardioversion': ['synchronized cardioversion', 'electrical cardioversion', 'sync cardiovert'],
  'defibrillation': ['defib', 'shock', 'defibrillate', 'unsynchronized shock'],
  'transcutaneous pacing': ['tcp', 'external pacing', 'pacing', 'pacer'],
  
  // Medications (common queries)
  'epinephrine': ['epi', 'adrenaline', 'epipen'],
  'nitroglycerin': ['nitro', 'ntg', 'nitrostat'],
  'naloxone': ['narcan', 'opioid reversal', 'opioid antagonist'],
  'aspirin': ['asa', 'acetylsalicylic acid'],
  'albuterol': ['ventolin', 'proventil', 'bronchodilator'],
  'diphenhydramine': ['benadryl', 'antihistamine'],
  'midazolam': ['versed', 'benzodiazepine', 'benzo'],
  'fentanyl': ['sublimaze', 'opioid analgesic'],
  'ketamine': ['ketalar', 'dissociative'],
  'amiodarone': ['cordarone', 'antiarrhythmic'],
  'adenosine': ['adenocard', 'svt drug'],
  'atropine': ['anticholinergic', 'vagolytic'],
  'calcium chloride': ['calcium', 'cacl2'],
  'sodium bicarbonate': ['bicarb', 'nahco3'],
  'magnesium sulfate': ['mag', 'magnesium'],
  'dextrose': ['d50', 'd10', 'd25', 'glucose'],
  
  // Patient populations
  'pediatric': ['peds', 'child', 'children', 'infant', 'baby', 'kid'],
  'neonate': ['newborn', 'neonatal', 'newly born', 'just born'],
  'geriatric': ['elderly', 'older adult', 'senior', 'aged'],
  'pregnant': ['pregnancy', 'obstetric', 'gravid', 'prenatal'],
};

/**
 * Expand query with medical synonyms for better recall
 */
export function expandWithSynonyms(query: string): string[] {
  const queryLower = query.toLowerCase();
  const expansions: string[] = [];
  
  for (const [term, synonyms] of Object.entries(MEDICAL_SYNONYMS)) {
    // Check if query contains the base term
    if (queryLower.includes(term)) {
      // Add top 3 most relevant synonyms
      expansions.push(...synonyms.slice(0, 3));
    }
    // Check if query contains any synonym
    for (const synonym of synonyms) {
      if (queryLower.includes(synonym) && !expansions.includes(term)) {
        expansions.push(term);
        // Also add a couple related synonyms
        expansions.push(...synonyms.filter(s => s !== synonym).slice(0, 2));
        break;
      }
    }
  }
  
  return [...new Set(expansions)];
}

// ============================================================================
// QUERY ENHANCEMENT FOR RETRIEVAL
// ============================================================================

/**
 * Generate enhanced query variations for better retrieval
 * Creates semantic variations to improve recall
 * Enhanced with medical synonym expansion
 */
export function generateQueryVariations(query: string): string[] {
  const normalized = normalizeEmsQuery(query);
  const variations: string[] = [normalized.normalized];
  
  // Get synonym expansions
  const synonymExpansions = expandWithSynonyms(normalized.normalized);

  // Add condition-focused variation
  if (normalized.extractedConditions.length > 0) {
    variations.push(`${normalized.extractedConditions.join(' ')} protocol treatment`);
  }

  // Add medication-focused variation
  if (normalized.extractedMedications.length > 0) {
    variations.push(`${normalized.extractedMedications.join(' ')} dosage indication route`);
  }
  
  // Add synonym-expanded variation if we have expansions
  if (synonymExpansions.length > 0) {
    // Create a query that includes the original terms plus key synonyms
    const synonymQuery = `${normalized.normalized} ${synonymExpansions.slice(0, 4).join(' ')}`;
    variations.push(synonymQuery);
  }

  // Add intent-specific enhancement
  switch (normalized.intent) {
    case 'medication_dosing':
      variations.push(`${normalized.normalized} dose mg route administration adult pediatric`);
      // Add medication name with dosing context
      if (normalized.extractedMedications.length > 0) {
        variations.push(`${normalized.extractedMedications[0]} dose indication contraindication`);
      }
      break;
    case 'procedure_steps':
      variations.push(`${normalized.normalized} steps procedure technique how to perform`);
      // Add procedural variations
      variations.push(`${normalized.normalized} indications equipment setup`);
      break;
    case 'pediatric_specific':
      variations.push(`${normalized.normalized} pediatric child weight based kg dosing`);
      variations.push(`${normalized.normalized} peds infant neonate`);
      break;
    case 'contraindication_check':
      variations.push(`${normalized.normalized} contraindication caution warning avoid`);
      variations.push(`${normalized.normalized} precaution allergy interaction`);
      break;
    case 'assessment_criteria':
      variations.push(`${normalized.normalized} criteria assessment signs symptoms`);
      variations.push(`${normalized.normalized} indications when to`);
      break;
    case 'differential_diagnosis':
      variations.push(`${normalized.normalized} differential diagnosis causes etiology`);
      break;
  }
  
  // For emergent queries, add urgency-related terms
  if (normalized.isEmergent) {
    variations.push(`${normalized.normalized} immediate critical emergency stat`);
  }

  return Array.from(new Set(variations)); // Deduplicate
}

/**
 * Build optimized search query for vector retrieval
 * Balances recall and precision
 */
export function buildSearchQuery(query: string): {
  primaryQuery: string;
  fallbackQueries: string[];
  filters: Record<string, unknown>;
} {
  const normalized = normalizeEmsQuery(query);

  // Primary query uses full normalized + expanded form
  const primaryQuery = normalized.normalized;

  // Fallback queries for lower similarity matches
  const fallbackQueries = generateQueryVariations(query).slice(1);

  // Build filters based on extracted metadata
  const filters: Record<string, unknown> = {};

  if (normalized.intent === 'pediatric_specific') {
    filters.content_type = 'pediatric';
  }

  return {
    primaryQuery,
    fallbackQueries,
    filters,
  };
}
