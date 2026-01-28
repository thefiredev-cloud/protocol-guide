/**
 * Safe Dose Ranges for Common EMS Medications
 * 
 * CRITICAL: These ranges are based on standard EMS protocols.
 * Individual protocols may have different ranges - these are SAFETY LIMITS
 * to catch obviously dangerous doses (e.g., 10x errors).
 * 
 * Sources:
 * - NAEMSP guidelines
 * - Common state/county EMS protocols
 * - FDA labeling
 * 
 * Last reviewed: 2025
 */

export interface MedicationSafeRange {
  name: string;
  aliases: string[];
  // Adult doses
  adult: {
    minDose: number;
    maxDose: number;
    maxSingleDose?: number;
    unit: string;
    routes: string[];
    notes?: string;
  };
  // Pediatric doses (weight-based)
  pediatric?: {
    minDosePerKg: number;
    maxDosePerKg: number;
    maxTotalDose: number;
    unit: string;
    routes: string[];
    notes?: string;
  };
  // Critical contraindications
  contraindications?: string[];
}

/**
 * Safe dose ranges for common EMS medications
 * 
 * NOTE: These are SAFETY LIMITS, not protocol recommendations.
 * A dose within range isn't necessarily correct - just not obviously dangerous.
 * A dose OUTSIDE range should ALWAYS be flagged.
 */
export const SAFE_DOSE_RANGES: Record<string, MedicationSafeRange> = {
  epinephrine: {
    name: 'Epinephrine',
    aliases: ['epi', 'adrenaline', 'epipen'],
    adult: {
      minDose: 0.1,
      maxDose: 1.0,
      maxSingleDose: 1.0,
      unit: 'mg',
      routes: ['IM', 'IV', 'IO', 'SQ', 'ETT'],
      notes: 'Anaphylaxis: 0.3-0.5mg IM. Cardiac arrest: 1mg IV/IO',
    },
    pediatric: {
      minDosePerKg: 0.01,
      maxDosePerKg: 0.01,
      maxTotalDose: 0.5,
      unit: 'mg/kg',
      routes: ['IM', 'IV', 'IO'],
      notes: 'Max 0.3mg for anaphylaxis, max 1mg for cardiac arrest',
    },
    contraindications: [],
  },
  
  adenosine: {
    name: 'Adenosine',
    aliases: ['adenocard'],
    adult: {
      minDose: 6,
      maxDose: 12,
      maxSingleDose: 12,
      unit: 'mg',
      routes: ['IV', 'IO'],
      notes: 'First dose 6mg, second dose 12mg. Rapid IV push with flush.',
    },
    pediatric: {
      minDosePerKg: 0.1,
      maxDosePerKg: 0.2,
      maxTotalDose: 12,
      unit: 'mg/kg',
      routes: ['IV', 'IO'],
      notes: 'First dose 0.1mg/kg, max 6mg. Second dose 0.2mg/kg, max 12mg.',
    },
  },
  
  amiodarone: {
    name: 'Amiodarone',
    aliases: ['cordarone', 'pacerone'],
    adult: {
      minDose: 150,
      maxDose: 300,
      maxSingleDose: 300,
      unit: 'mg',
      routes: ['IV', 'IO'],
      notes: 'Cardiac arrest: 300mg IV/IO first dose, 150mg second dose',
    },
    pediatric: {
      minDosePerKg: 5,
      maxDosePerKg: 5,
      maxTotalDose: 300,
      unit: 'mg/kg',
      routes: ['IV', 'IO'],
      notes: '5mg/kg IV/IO, max 300mg',
    },
  },
  
  aspirin: {
    name: 'Aspirin',
    aliases: ['asa', 'acetylsalicylic acid'],
    adult: {
      minDose: 162,
      maxDose: 325,
      maxSingleDose: 325,
      unit: 'mg',
      routes: ['PO', 'chewed'],
      notes: 'STEMI: 162-325mg PO chewed',
    },
    contraindications: ['aspirin allergy', 'active GI bleeding', 'recent GI bleed'],
  },
  
  atropine: {
    name: 'Atropine',
    aliases: ['atropine sulfate'],
    adult: {
      minDose: 0.5,
      maxDose: 1.0,
      maxSingleDose: 1.0,
      unit: 'mg',
      routes: ['IV', 'IO', 'ETT'],
      notes: 'Symptomatic bradycardia: 0.5-1mg IV. May repeat q3-5min, max 3mg',
    },
    pediatric: {
      minDosePerKg: 0.02,
      maxDosePerKg: 0.02,
      maxTotalDose: 0.5,
      unit: 'mg/kg',
      routes: ['IV', 'IO', 'ETT'],
      notes: 'Min dose 0.1mg, max single dose 0.5mg',
    },
  },
  
  dextrose: {
    name: 'Dextrose',
    aliases: ['d50', 'd50w', 'd10', 'd10w', 'glucose'],
    adult: {
      minDose: 12.5,
      maxDose: 25,
      maxSingleDose: 25,
      unit: 'g',
      routes: ['IV', 'IO'],
      notes: 'D50W: 25g (50mL). D10W: 12.5-25g (125-250mL)',
    },
    pediatric: {
      minDosePerKg: 0.5,
      maxDosePerKg: 1.0,
      maxTotalDose: 25,
      unit: 'g/kg',
      routes: ['IV', 'IO'],
      notes: 'D10W preferred. 0.5-1g/kg = 5-10mL/kg of D10W',
    },
  },
  
  diphenhydramine: {
    name: 'Diphenhydramine',
    aliases: ['benadryl'],
    adult: {
      minDose: 25,
      maxDose: 50,
      maxSingleDose: 50,
      unit: 'mg',
      routes: ['IV', 'IM', 'PO'],
      notes: 'Allergic reaction: 25-50mg IV/IM',
    },
    pediatric: {
      minDosePerKg: 1,
      maxDosePerKg: 1.25,
      maxTotalDose: 50,
      unit: 'mg/kg',
      routes: ['IV', 'IM', 'PO'],
      notes: '1-1.25mg/kg, max 50mg',
    },
  },
  
  fentanyl: {
    name: 'Fentanyl',
    aliases: ['sublimaze'],
    adult: {
      minDose: 25,
      maxDose: 100,
      maxSingleDose: 100,
      unit: 'mcg',
      routes: ['IV', 'IM', 'IN'],
      notes: 'Pain management: 25-100mcg IV/IN. May repeat.',
    },
    pediatric: {
      minDosePerKg: 1,
      maxDosePerKg: 2,
      maxTotalDose: 100,
      unit: 'mcg/kg',
      routes: ['IV', 'IM', 'IN'],
      notes: '1-2mcg/kg, max 100mcg per dose',
    },
  },
  
  glucagon: {
    name: 'Glucagon',
    aliases: ['glucagen'],
    adult: {
      minDose: 0.5,
      maxDose: 2,
      maxSingleDose: 2,
      unit: 'mg',
      routes: ['IM', 'IV', 'SQ', 'IN'],
      notes: 'Hypoglycemia: 1mg IM. Beta-blocker OD: 2-5mg',
    },
    pediatric: {
      minDosePerKg: 0.03,
      maxDosePerKg: 0.1,
      maxTotalDose: 1,
      unit: 'mg/kg',
      routes: ['IM', 'IV', 'SQ'],
      notes: '<25kg: 0.5mg. >25kg: 1mg',
    },
  },
  
  lidocaine: {
    name: 'Lidocaine',
    aliases: ['xylocaine'],
    adult: {
      minDose: 1,
      maxDose: 1.5,
      maxSingleDose: 100,
      unit: 'mg/kg',
      routes: ['IV', 'IO', 'ETT'],
      notes: 'VF/pVT: 1-1.5mg/kg IV. Max 3mg/kg total.',
    },
    pediatric: {
      minDosePerKg: 1,
      maxDosePerKg: 1,
      maxTotalDose: 100,
      unit: 'mg/kg',
      routes: ['IV', 'IO', 'ETT'],
      notes: '1mg/kg IV/IO. Max 100mg.',
    },
  },
  
  morphine: {
    name: 'Morphine',
    aliases: ['ms contin', 'morphine sulfate'],
    adult: {
      minDose: 2,
      maxDose: 10,
      maxSingleDose: 10,
      unit: 'mg',
      routes: ['IV', 'IM'],
      notes: 'Pain: 2-4mg IV, may repeat. ACS: 2-4mg IV q5min PRN.',
    },
    pediatric: {
      minDosePerKg: 0.05,
      maxDosePerKg: 0.1,
      maxTotalDose: 5,
      unit: 'mg/kg',
      routes: ['IV', 'IM'],
      notes: '0.05-0.1mg/kg IV. Max 5mg per dose.',
    },
  },
  
  naloxone: {
    name: 'Naloxone',
    aliases: ['narcan'],
    adult: {
      minDose: 0.4,
      maxDose: 2.0,
      maxSingleDose: 2.0,
      unit: 'mg',
      routes: ['IV', 'IM', 'IN', 'SQ'],
      notes: 'Opioid overdose: 0.4-2mg. Titrate to respiratory effort.',
    },
    pediatric: {
      minDosePerKg: 0.1,
      maxDosePerKg: 0.1,
      maxTotalDose: 2,
      unit: 'mg/kg',
      routes: ['IV', 'IM', 'IN'],
      notes: '0.1mg/kg, max 2mg',
    },
  },
  
  nitroglycerin: {
    name: 'Nitroglycerin',
    aliases: ['nitro', 'ntg', 'nitrostat'],
    adult: {
      minDose: 0.3,
      maxDose: 0.4,
      maxSingleDose: 0.4,
      unit: 'mg',
      routes: ['SL'],
      notes: 'Chest pain: 0.4mg SL q5min x3. Check SBP > 90.',
    },
    contraindications: ['SBP < 90', 'recent PDE5 inhibitor', 'inferior STEMI with RV involvement'],
  },
  
  ondansetron: {
    name: 'Ondansetron',
    aliases: ['zofran'],
    adult: {
      minDose: 4,
      maxDose: 8,
      maxSingleDose: 8,
      unit: 'mg',
      routes: ['IV', 'IM', 'ODT', 'PO'],
      notes: 'Nausea/vomiting: 4-8mg IV/IM',
    },
    pediatric: {
      minDosePerKg: 0.1,
      maxDosePerKg: 0.15,
      maxTotalDose: 4,
      unit: 'mg/kg',
      routes: ['IV', 'IM', 'ODT'],
      notes: '0.1-0.15mg/kg, max 4mg',
    },
  },
  
  midazolam: {
    name: 'Midazolam',
    aliases: ['versed'],
    adult: {
      minDose: 1,
      maxDose: 5,
      maxSingleDose: 5,
      unit: 'mg',
      routes: ['IV', 'IM', 'IN'],
      notes: 'Seizure: 2-5mg IV/IM/IN. Sedation: 1-2mg IV.',
    },
    pediatric: {
      minDosePerKg: 0.1,
      maxDosePerKg: 0.2,
      maxTotalDose: 5,
      unit: 'mg/kg',
      routes: ['IV', 'IM', 'IN'],
      notes: '0.1-0.2mg/kg, max 5mg. Seizure: 0.2mg/kg IN.',
    },
  },
  
  ketamine: {
    name: 'Ketamine',
    aliases: ['ketalar'],
    adult: {
      minDose: 0.5,
      maxDose: 4,
      maxSingleDose: 4,
      unit: 'mg/kg',
      routes: ['IV', 'IM', 'IN'],
      notes: 'Analgesia: 0.1-0.3mg/kg IV. Sedation: 1-2mg/kg IV, 4mg/kg IM.',
    },
    pediatric: {
      minDosePerKg: 0.5,
      maxDosePerKg: 2,
      maxTotalDose: 100,
      unit: 'mg/kg',
      routes: ['IV', 'IM', 'IN'],
      notes: 'IV: 1-2mg/kg. IM: 3-4mg/kg. Max 100mg.',
    },
  },
  
  albuterol: {
    name: 'Albuterol',
    aliases: ['proventil', 'ventolin', 'salbutamol'],
    adult: {
      minDose: 2.5,
      maxDose: 5,
      maxSingleDose: 5,
      unit: 'mg',
      routes: ['NEB', 'MDI'],
      notes: 'Nebulizer: 2.5-5mg. May repeat or give continuous.',
    },
    pediatric: {
      minDosePerKg: 0.15,
      maxDosePerKg: 0.15,
      maxTotalDose: 5,
      unit: 'mg/kg',
      routes: ['NEB', 'MDI'],
      notes: '2.5mg for <20kg, 5mg for >20kg',
    },
  },
  
  magnesium_sulfate: {
    name: 'Magnesium Sulfate',
    aliases: ['mag', 'magnesium'],
    adult: {
      minDose: 1,
      maxDose: 4,
      maxSingleDose: 4,
      unit: 'g',
      routes: ['IV', 'IO'],
      notes: 'Torsades/asthma: 1-2g IV. Eclampsia: 4-6g IV.',
    },
    pediatric: {
      minDosePerKg: 25,
      maxDosePerKg: 50,
      maxTotalDose: 2000,
      unit: 'mg/kg',
      routes: ['IV', 'IO'],
      notes: '25-50mg/kg IV over 15-30min, max 2g',
    },
  },
  
  calcium_chloride: {
    name: 'Calcium Chloride',
    aliases: ['cacl', 'calcium'],
    adult: {
      minDose: 500,
      maxDose: 1000,
      maxSingleDose: 1000,
      unit: 'mg',
      routes: ['IV', 'IO'],
      notes: 'Hyperkalemia/Ca-blocker OD: 500-1000mg slow IV',
    },
    pediatric: {
      minDosePerKg: 20,
      maxDosePerKg: 20,
      maxTotalDose: 1000,
      unit: 'mg/kg',
      routes: ['IV', 'IO'],
      notes: '20mg/kg, max 1g. Slow IV push.',
    },
  },
  
  sodium_bicarbonate: {
    name: 'Sodium Bicarbonate',
    aliases: ['bicarb', 'nahco3'],
    adult: {
      minDose: 50,
      maxDose: 100,
      maxSingleDose: 100,
      unit: 'mEq',
      routes: ['IV', 'IO'],
      notes: 'TCA OD/hyperkalemia: 1-2mEq/kg IV',
    },
    pediatric: {
      minDosePerKg: 1,
      maxDosePerKg: 1,
      maxTotalDose: 50,
      unit: 'mEq/kg',
      routes: ['IV', 'IO'],
      notes: '1mEq/kg IV/IO slow push',
    },
  },
};

/**
 * Get medication range by name (case-insensitive, checks aliases)
 */
export function getMedicationRange(name: string): MedicationSafeRange | null {
  const normalizedName = name.toLowerCase().trim();
  
  // Direct match
  if (SAFE_DOSE_RANGES[normalizedName]) {
    return SAFE_DOSE_RANGES[normalizedName];
  }
  
  // Check aliases
  for (const [key, range] of Object.entries(SAFE_DOSE_RANGES)) {
    if (range.aliases.some(alias => alias.toLowerCase() === normalizedName)) {
      return SAFE_DOSE_RANGES[key];
    }
    // Also check the display name
    if (range.name.toLowerCase() === normalizedName) {
      return SAFE_DOSE_RANGES[key];
    }
  }
  
  return null;
}

/**
 * Extract medication names from text
 */
export function extractMedicationsFromText(text: string): string[] {
  const medications: string[] = [];
  const normalizedText = text.toLowerCase();
  
  for (const [key, range] of Object.entries(SAFE_DOSE_RANGES)) {
    // Check main name
    if (normalizedText.includes(range.name.toLowerCase())) {
      medications.push(range.name);
      continue;
    }
    
    // Check aliases
    for (const alias of range.aliases) {
      if (normalizedText.includes(alias.toLowerCase())) {
        medications.push(range.name);
        break;
      }
    }
  }
  
  return [...new Set(medications)]; // Remove duplicates
}
