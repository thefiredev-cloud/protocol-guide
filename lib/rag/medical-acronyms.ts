/**
 * Medical Acronym Expansion Dictionary
 * LA County Fire Department EMS Reference
 *
 * Used by RAG retrieval to expand medical acronyms into
 * searchable terms and synonyms for better semantic matching.
 */

export interface AcronymEntry {
  expansion: string;
  synonyms: string[];
  relatedProtocols: string[];
  category?: 'cardiac' | 'stroke' | 'trauma' | 'respiratory' | 'pediatric' | 'general';
}

export const MEDICAL_ACRONYMS: Record<string, AcronymEntry> = {
  // Stroke Scales & Assessments
  'LAMS': {
    expansion: 'Los Angeles Motor Scale',
    synonyms: ['arm drift', 'grip strength', 'facial droop', 'LVO', 'stroke scale', 'motor scale', 'large vessel occlusion'],
    relatedProtocols: ['521', '522', '1232'],
    category: 'stroke'
  },
  'mLAPSS': {
    expansion: 'Modified Los Angeles Prehospital Stroke Screen',
    synonyms: ['stroke screen', 'prehospital stroke', 'LAPSS', 'MLAPPS', 'stroke screening', 'stroke assessment'],
    relatedProtocols: ['521', '1232'],
    category: 'stroke'
  },
  'LAPSS': {
    expansion: 'Los Angeles Prehospital Stroke Screen',
    synonyms: ['stroke screen', 'prehospital stroke', 'stroke screening'],
    relatedProtocols: ['521', '1232'],
    category: 'stroke'
  },
  'LKWT': {
    expansion: 'Last Known Well Time',
    synonyms: ['symptom onset', 'last seen normal', 'onset time', 'time last known well'],
    relatedProtocols: ['521', '522'],
    category: 'stroke'
  },
  'LVO': {
    expansion: 'Large Vessel Occlusion',
    synonyms: ['large vessel stroke', 'severe stroke', 'thrombectomy candidate'],
    relatedProtocols: ['521', '522', '1232'],
    category: 'stroke'
  },

  // Stroke Centers
  'CSC': {
    expansion: 'Comprehensive Stroke Center',
    synonyms: [
      'thrombectomy capable', 'neurointerventional', 'comprehensive stroke',
      'CSC criteria', 'stroke center criteria', 'LVO center', 'thrombectomy center',
      'stroke destination criteria', 'comprehensive stroke criteria'
    ],
    relatedProtocols: ['521', '522', '523', '506'],
    category: 'stroke'
  },
  'PSC': {
    expansion: 'Primary Stroke Center',
    synonyms: [
      'stroke center', 'tPA capable', 'primary stroke', 'PSC criteria',
      'stroke receiving center', 'stroke criteria', 'stroke destination',
      'primary stroke criteria', 'stroke center criteria'
    ],
    relatedProtocols: ['521', '522', '506'],
    category: 'stroke'
  },

  // Cardiac
  'ECMO': {
    expansion: 'Extracorporeal Membrane Oxygenation',
    synonyms: [
      'ECPR', 'mechanical circulatory support', 'heart lung bypass',
      'extracorporeal life support', 'ECMO criteria', 'ECMO eligibility',
      'ECMO candidate', 'ECMO destination', 'ECMO center'
    ],
    relatedProtocols: ['518', '1210', '1318'],
    category: 'cardiac'
  },
  'ECPR': {
    expansion: 'Extracorporeal Cardiopulmonary Resuscitation',
    synonyms: [
      'ECMO CPR', 'mechanical resuscitation', 'extracorporeal resuscitation',
      'refractory VF', 'refractory shockable', 'ECPR criteria', 'ECPR eligibility',
      'ECPR candidate', 'ECPR patient selection', 'ECPR destination',
      'refractory cardiac arrest', 'ECPR center'
    ],
    relatedProtocols: ['518', '1210', '1318'],
    category: 'cardiac'
  },
  'STEMI': {
    expansion: 'ST Elevation Myocardial Infarction',
    synonyms: ['heart attack', 'acute MI', 'ST elevation', 'STEMI alert', 'cardiac cath'],
    relatedProtocols: ['503', '504', '1203', '1204', '1211'],
    category: 'cardiac'
  },
  'BRADYCARDIA': {
    expansion: 'Bradycardia',
    synonyms: ['slow heart rate', 'heart block', 'symptomatic bradycardia', 'sinus bradycardia', 'rate less than 60'],
    relatedProtocols: ['505', '1212'],
    category: 'cardiac'
  },
  'TACHYCARDIA': {
    expansion: 'Tachycardia',
    synonyms: ['fast heart rate', 'rapid heart rate', 'SVT', 'supraventricular tachycardia', 'rate greater than 100'],
    relatedProtocols: ['505', '1213'],
    category: 'cardiac'
  },
  'DYSRHYTHMIA': {
    expansion: 'Cardiac Dysrhythmia',
    synonyms: ['arrhythmia', 'irregular heartbeat', 'abnormal rhythm', 'cardiac rhythm disturbance'],
    relatedProtocols: ['505', '1212', '1213'],
    category: 'cardiac'
  },
  'NSTEMI': {
    expansion: 'Non-ST Elevation Myocardial Infarction',
    synonyms: ['heart attack', 'acute coronary syndrome', 'unstable angina', 'ACS'],
    relatedProtocols: ['503', '504', '1203'],
    category: 'cardiac'
  },
  'ACS': {
    expansion: 'Acute Coronary Syndrome',
    synonyms: ['heart attack', 'MI', 'myocardial infarction', 'cardiac chest pain', 'unstable angina'],
    relatedProtocols: ['503', '504', '1203', '1204'],
    category: 'cardiac'
  },
  'ROSC': {
    expansion: 'Return of Spontaneous Circulation',
    synonyms: ['pulse return', 'resuscitation success', 'post arrest', 'post cardiac arrest'],
    relatedProtocols: ['518', '1210'],
    category: 'cardiac'
  },
  'PEA': {
    expansion: 'Pulseless Electrical Activity',
    synonyms: ['electrical activity without pulse', 'non-shockable rhythm'],
    relatedProtocols: ['518', '1210'],
    category: 'cardiac'
  },
  'VF': {
    expansion: 'Ventricular Fibrillation',
    synonyms: ['v fib', 'shockable rhythm', 'defibrillation', 'cardiac arrest'],
    relatedProtocols: ['518', '1210'],
    category: 'cardiac'
  },
  'VT': {
    expansion: 'Ventricular Tachycardia',
    synonyms: ['v tach', 'wide complex tachycardia', 'ventricular tachyarrhythmia'],
    relatedProtocols: ['505', '518', '1205'],
    category: 'cardiac'
  },
  'TCP': {
    expansion: 'Transcutaneous Pacing',
    synonyms: ['external pacing', 'pacemaker', 'bradycardia pacing'],
    relatedProtocols: ['505', '1365'],
    category: 'cardiac'
  },

  // Trauma Centers
  'PTC': {
    expansion: 'Pediatric Trauma Center',
    synonyms: [
      'pediatric trauma', 'childrens hospital', 'pediatric injury center',
      'pediatric level I', 'pediatric level II', 'PTC criteria',
      'pediatric trauma criteria', 'pediatric trauma center criteria',
      'PTC referral', 'pediatric trauma destination'
    ],
    relatedProtocols: ['510', '506', '830', '831', '504'],
    category: 'trauma'
  },
  'PMC': {
    expansion: 'Pediatric Medical Center',
    synonyms: [
      'pediatric hospital', 'childrens medical', 'pediatric emergency',
      'pediatric receiving center', 'PMC criteria', 'pediatric medical criteria',
      'PMC referral criteria', 'critically ill pediatric', 'PMC destination',
      'pediatric medical center criteria', 'PMC referral'
    ],
    relatedProtocols: ['510', '506', '507', '508', '830'],
    category: 'pediatric'
  },
  'SRC': {
    expansion: 'Stroke Receiving Center',
    synonyms: ['stroke center', 'stroke hospital', 'stroke receiving'],
    relatedProtocols: ['506', '521'],
    category: 'stroke'
  },

  // Trauma & Injury
  'TBI': {
    expansion: 'Traumatic Brain Injury',
    synonyms: ['head injury', 'head trauma', 'brain injury', 'closed head injury'],
    relatedProtocols: ['810', '811', '1253'],
    category: 'trauma'
  },
  'GSW': {
    expansion: 'Gunshot Wound',
    synonyms: ['gunshot', 'bullet wound', 'shooting', 'penetrating trauma'],
    relatedProtocols: ['805', '806', '1260'],
    category: 'trauma'
  },
  'MVC': {
    expansion: 'Motor Vehicle Collision',
    synonyms: ['car accident', 'vehicle accident', 'auto accident', 'traffic collision', 'MVA'],
    relatedProtocols: ['801', '802', '830'],
    category: 'trauma'
  },
  'MVA': {
    expansion: 'Motor Vehicle Accident',
    synonyms: ['car accident', 'vehicle accident', 'auto accident', 'traffic collision', 'MVC'],
    relatedProtocols: ['801', '802', '830'],
    category: 'trauma'
  },
  'PSI': {
    expansion: 'Passenger Space Intrusion',
    synonyms: ['compartment intrusion', 'vehicle intrusion', 'cabin intrusion', 'dash displacement', 'steering wheel deformity', 'intrusion 12 inches', 'intrusion 18 inches'],
    relatedProtocols: ['506', '1244'],
    category: 'trauma'
  },

  // Airway
  'RSI': {
    expansion: 'Rapid Sequence Intubation',
    synonyms: ['intubation', 'sedation intubation', 'paralytic intubation'],
    relatedProtocols: ['1100', '1101'],
    category: 'respiratory'
  },
  'BIAD': {
    expansion: 'Blind Insertion Airway Device',
    synonyms: ['supraglottic airway', 'King airway', 'iGel', 'LMA'],
    relatedProtocols: ['1100', '1103'],
    category: 'respiratory'
  },
  'BVM': {
    expansion: 'Bag Valve Mask',
    synonyms: ['ambu bag', 'manual ventilation', 'bagging'],
    relatedProtocols: ['1100', '1102'],
    category: 'respiratory'
  },
  'CPAP': {
    expansion: 'Continuous Positive Airway Pressure',
    synonyms: ['positive pressure', 'respiratory support', 'non-invasive ventilation'],
    relatedProtocols: ['511', '1211'],
    category: 'respiratory'
  },

  // Assessment
  'AMS': {
    expansion: 'Altered Mental Status',
    synonyms: ['altered consciousness', 'confusion', 'decreased LOC', 'mental status change'],
    relatedProtocols: ['520', '1231'],
    category: 'general'
  },
  'LOC': {
    expansion: 'Level of Consciousness',
    synonyms: ['consciousness level', 'mental status', 'alertness', 'responsiveness'],
    relatedProtocols: ['520', '1231'],
    category: 'general'
  },
  'GCS': {
    expansion: 'Glasgow Coma Scale',
    synonyms: ['coma scale', 'neurological assessment', 'consciousness score'],
    relatedProtocols: ['810', '1253'],
    category: 'trauma'
  },

  // End of Life
  'DNR': {
    expansion: 'Do Not Resuscitate',
    synonyms: ['no CPR', 'no resuscitation', 'allow natural death', 'AND'],
    relatedProtocols: ['100', '101'],
    category: 'general'
  },
  'POLST': {
    expansion: 'Physician Orders for Life-Sustaining Treatment',
    synonyms: ['advance directive', 'end of life orders', 'treatment orders'],
    relatedProtocols: ['100', '101'],
    category: 'general'
  },

  // Medications (common abbreviations)
  'EPI': {
    expansion: 'Epinephrine',
    synonyms: ['adrenaline', 'epi 1:1000', 'epi 1:10000'],
    relatedProtocols: ['1317.6', '518', '507'],
    category: 'general'
  },
  'NTG': {
    expansion: 'Nitroglycerin',
    synonyms: ['nitro', 'glyceryl trinitrate', 'nitrostat'],
    relatedProtocols: ['1317.12', '503'],
    category: 'cardiac'
  },
  'ASA': {
    expansion: 'Aspirin',
    synonyms: ['acetylsalicylic acid', 'baby aspirin'],
    relatedProtocols: ['1317.3', '503'],
    category: 'cardiac'
  },

  // Transport
  'ALS': {
    expansion: 'Advanced Life Support',
    synonyms: ['paramedic', 'advanced care', 'ALS unit'],
    relatedProtocols: ['200', '201'],
    category: 'general'
  },
  'BLS': {
    expansion: 'Basic Life Support',
    synonyms: ['EMT', 'basic care', 'BLS unit'],
    relatedProtocols: ['200', '201'],
    category: 'general'
  },

  // Pediatric
  'PALS': {
    expansion: 'Pediatric Advanced Life Support',
    synonyms: ['pediatric resuscitation', 'pediatric cardiac arrest', 'pediatric emergency'],
    relatedProtocols: ['830', '831', '1300'],
    category: 'pediatric'
  },

  // Base Contact
  'OLMC': {
    expansion: 'Online Medical Control',
    synonyms: ['base contact', 'medical control', 'base hospital', 'physician consult'],
    relatedProtocols: ['200', '506'],
    category: 'general'
  },

  // Routes of Administration (CRITICAL - frequently used)
  'IV': {
    expansion: 'Intravenous',
    synonyms: ['intravenous access', 'IV line', 'IV push', 'IV drip', 'venous access'],
    relatedProtocols: ['1102', '1104', '1317'],
    category: 'general'
  },
  'IO': {
    expansion: 'Intraosseous',
    synonyms: ['intraosseous access', 'IO line', 'bone marrow access', 'IO needle'],
    relatedProtocols: ['1105', '518', '1317'],
    category: 'general'
  },
  'IM': {
    expansion: 'Intramuscular',
    synonyms: ['intramuscular injection', 'IM injection', 'muscle injection'],
    relatedProtocols: ['1317'],
    category: 'general'
  },
  'PO': {
    expansion: 'Per Os (By Mouth)',
    synonyms: ['oral', 'by mouth', 'oral medication', 'swallow'],
    relatedProtocols: ['1317'],
    category: 'general'
  },
  'IN': {
    expansion: 'Intranasal',
    synonyms: ['nasal', 'intranasal administration', 'nasal spray', 'mucosal atomization'],
    relatedProtocols: ['1317', '1317.11'],
    category: 'general'
  },
  'SL': {
    expansion: 'Sublingual',
    synonyms: ['under tongue', 'sublingual administration', 'sublingual tablet'],
    relatedProtocols: ['1317.12', '503'],
    category: 'cardiac'
  },

  // Resuscitation (CRITICAL)
  'CPR': {
    expansion: 'Cardiopulmonary Resuscitation',
    synonyms: ['chest compressions', 'resuscitation', 'cardiac massage', 'basic life support'],
    relatedProtocols: ['518', '1210', '830'],
    category: 'cardiac'
  },
  'ACLS': {
    expansion: 'Advanced Cardiac Life Support',
    synonyms: ['advanced resuscitation', 'cardiac arrest protocol', 'code management'],
    relatedProtocols: ['518', '1210', '505'],
    category: 'cardiac'
  },
  'AED': {
    expansion: 'Automated External Defibrillator',
    synonyms: ['defibrillator', 'shock', 'automatic defibrillator', 'AED pads'],
    relatedProtocols: ['518', '1210'],
    category: 'cardiac'
  },

  // IV Fluids (CRITICAL for dosing)
  'NS': {
    expansion: 'Normal Saline',
    synonyms: ['0.9% saline', 'sodium chloride', 'saline solution', 'NaCl'],
    relatedProtocols: ['1317.15', '1102'],
    category: 'general'
  },
  'LR': {
    expansion: 'Lactated Ringers',
    synonyms: ['Ringers lactate', 'RL', 'crystalloid', 'Hartmanns solution'],
    relatedProtocols: ['1317.15', '805', '806'],
    category: 'general'
  }
};

export interface ExpandedQueryResult {
  expandedQuery: string;
  originalQuery: string;
  detectedAcronyms: Array<{
    acronym: string;
    expansion: string;
    synonyms: string[];
  }>;
  relatedProtocols: string[];
  categories: string[];
}

/**
 * Expands medical acronyms in a query to improve semantic search
 * @param query - The user's search query
 * @returns Expanded query with acronym information
 */
export function expandQuery(query: string): ExpandedQueryResult {
  const upperQuery = query.toUpperCase();
  const detectedAcronyms: ExpandedQueryResult['detectedAcronyms'] = [];
  const relatedProtocols = new Set<string>();
  const categories = new Set<string>();

  let expandedQuery = query;

  // Check for each acronym in the query
  for (const [acronym, entry] of Object.entries(MEDICAL_ACRONYMS)) {
    // Match whole word only (with word boundaries)
    const regex = new RegExp(`\\b${acronym}\\b`, 'gi');

    if (regex.test(upperQuery)) {
      detectedAcronyms.push({
        acronym,
        expansion: entry.expansion,
        synonyms: entry.synonyms
      });

      // Add related protocols
      entry.relatedProtocols.forEach(p => relatedProtocols.add(p));

      // Track category
      if (entry.category) {
        categories.add(entry.category);
      }

      // Expand the query with the full term and key synonyms
      // Only add if not already present in query
      const expansionLower = entry.expansion.toLowerCase();
      if (!query.toLowerCase().includes(expansionLower)) {
        expandedQuery += ` ${entry.expansion}`;
      }

      // Add top 2 most relevant synonyms
      const topSynonyms = entry.synonyms.slice(0, 2);
      topSynonyms.forEach(syn => {
        if (!expandedQuery.toLowerCase().includes(syn.toLowerCase())) {
          expandedQuery += ` ${syn}`;
        }
      });
    }
  }

  return {
    expandedQuery: expandedQuery.trim(),
    originalQuery: query,
    detectedAcronyms,
    relatedProtocols: Array.from(relatedProtocols),
    categories: Array.from(categories)
  };
}

/**
 * Get acronym entry by name
 */
export function getAcronymInfo(acronym: string): AcronymEntry | undefined {
  return MEDICAL_ACRONYMS[acronym.toUpperCase()];
}

/**
 * Check if a query contains any medical acronyms
 */
export function hasAcronyms(query: string): boolean {
  const upperQuery = query.toUpperCase();
  return Object.keys(MEDICAL_ACRONYMS).some(acronym => {
    const regex = new RegExp(`\\b${acronym}\\b`, 'i');
    return regex.test(upperQuery);
  });
}
