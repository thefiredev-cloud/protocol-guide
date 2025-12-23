/**
 * PATIENT SAFETY CRITICAL TESTS
 * Drug Lookup Service Unit Tests
 *
 * These tests ensure the DrugLookupService correctly identifies medications
 * by both generic and brand names, critical for paramedic decision-making.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DrugLookupService,
  formatDrugLookupForChat,
  formatDrugLookupForFunction,
  getDrugLookupService,
} from '@/lib/drugs/services/drug-lookup-service';
import type { DrugRecord } from '@/lib/drugs/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMetoprolol: DrugRecord = {
  rxcui: '6918',
  name: 'metoprolol',
  displayName: 'Metoprolol',
  brandNames: ['Lopressor', 'Toprol-XL'],
  drugClass: 'Beta Blocker',
  drugClasses: ['Beta Blocker', 'Antihypertensive', 'Antianginal'],
  schedule: 'Rx',
  fieldSummary: [
    { type: 'use', text: 'Hypertension, angina, heart failure, post-MI' },
    { type: 'warning', text: 'Can mask hypoglycemia symptoms in diabetics' },
    { type: 'dose', text: 'Typical: 25-100mg PO BID (extended release: once daily)' },
    { type: 'interaction', text: 'Avoid with verapamil/diltiazem (severe bradycardia risk)' },
  ],
  interactionRxcuis: ['3443', '3616'], // verapamil, diltiazem
  emsRelevance: 'high',
  laCountyFormulary: false,
  lastUpdated: '2025-01-01T00:00:00Z',
};

const mockLisinopril: DrugRecord = {
  rxcui: '29046',
  name: 'lisinopril',
  displayName: 'Lisinopril',
  brandNames: ['Zestril', 'Prinivil'],
  drugClass: 'ACE Inhibitor',
  drugClasses: ['ACE Inhibitor', 'Antihypertensive'],
  schedule: 'Rx',
  fieldSummary: [
    { type: 'use', text: 'Hypertension, heart failure, post-MI' },
    { type: 'warning', text: 'Risk of angioedema, hyperkalemia, renal dysfunction' },
    { type: 'dose', text: 'Typical: 10-40mg PO once daily' },
    { type: 'interaction', text: 'Avoid NSAIDs (reduce efficacy, increase renal risk)' },
  ],
  interactionRxcuis: ['5640'], // ibuprofen
  emsRelevance: 'high',
  laCountyFormulary: false,
  lastUpdated: '2025-01-01T00:00:00Z',
};

const mockWarfarin: DrugRecord = {
  rxcui: '11289',
  name: 'warfarin',
  displayName: 'Warfarin',
  brandNames: ['Coumadin', 'Jantoven'],
  drugClass: 'Anticoagulant',
  drugClasses: ['Anticoagulant', 'Vitamin K Antagonist'],
  schedule: 'Rx',
  fieldSummary: [
    { type: 'use', text: 'DVT/PE treatment and prevention, AFib stroke prevention' },
    { type: 'warning', text: 'MAJOR BLEEDING RISK - INR monitoring required' },
    { type: 'dose', text: 'Individualized based on INR (target usually 2-3)' },
    { type: 'interaction', text: 'CRITICAL: Many drug interactions affecting INR' },
    { type: 'reversal', text: 'Vitamin K IV/PO, FFP, or PCC for life-threatening bleeding' },
  ],
  interactionRxcuis: ['1191'], // aspirin
  emsRelevance: 'high',
  laCountyFormulary: false,
  lastUpdated: '2025-01-01T00:00:00Z',
};

const mockNaloxone: DrugRecord = {
  rxcui: '7242',
  name: 'naloxone',
  displayName: 'Naloxone',
  brandNames: ['Narcan', 'Evzio'],
  drugClass: 'Opioid Antagonist',
  drugClasses: ['Opioid Antagonist', 'Antidote'],
  schedule: 'Rx',
  fieldSummary: [
    { type: 'use', text: 'Opioid overdose reversal - respiratory depression' },
    { type: 'warning', text: 'May precipitate acute withdrawal in opioid-dependent patients' },
    { type: 'dose', text: 'EMS: 0.4-2mg IV/IM/IN, repeat q2-3min PRN (max 10mg)' },
  ],
  interactionRxcuis: [],
  emsRelevance: 'high',
  laCountyFormulary: true,
  lastUpdated: '2025-01-01T00:00:00Z',
};

// ============================================================================
// MOCK DATABASE
// ============================================================================

const mockDB = {
  getDrugByName: vi.fn(),
  searchDrugs: vi.fn(),
  getDrug: vi.fn(),
};

// Mock the getDrugDB function
vi.mock('@/lib/drugs/storage/drug-database', () => ({
  getDrugDB: vi.fn(() => Promise.resolve(mockDB)),
}));

// ============================================================================
// TESTS
// ============================================================================

describe('DrugLookupService - PATIENT SAFETY CRITICAL', () => {
  let service: DrugLookupService;

  beforeEach(() => {
    service = new DrugLookupService();
    vi.clearAllMocks();
  });

  // ==========================================================================
  // DRUG LOOKUP BY GENERIC NAME
  // ==========================================================================

  describe('lookupDrug - Generic Name Lookup', () => {
    it('should find drug by exact generic name (metoprolol)', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockMetoprolol);

      const result = await service.lookupDrug('metoprolol');

      expect(result.found).toBe(true);
      expect(result.drug).toBeDefined();
      expect(result.drug?.name).toBe('metoprolol');
      expect(result.drug?.displayName).toBe('Metoprolol');
      expect(result.drug?.drugClass).toBe('Beta Blocker');
      expect(result.normalizedFrom).toBeUndefined();
      expect(mockDB.getDrugByName).toHaveBeenCalledWith('metoprolol');
    });

    it('should find drug by exact generic name (lisinopril)', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockLisinopril);

      const result = await service.lookupDrug('lisinopril');

      expect(result.found).toBe(true);
      expect(result.drug?.name).toBe('lisinopril');
      expect(result.drug?.displayName).toBe('Lisinopril');
      expect(result.drug?.drugClass).toBe('ACE Inhibitor');
      expect(result.normalizedFrom).toBeUndefined();
    });

    it('should normalize query to lowercase and trim whitespace', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockMetoprolol);

      await service.lookupDrug('  METOPROLOL  ');

      expect(mockDB.getDrugByName).toHaveBeenCalledWith('metoprolol');
    });

    it('should include field bullets in result', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockMetoprolol);

      const result = await service.lookupDrug('metoprolol');

      expect(result.fieldBullets).toBeDefined();
      expect(result.fieldBullets).toHaveLength(4);
      expect(result.fieldBullets?.[0]).toContain('USE:');
      expect(result.fieldBullets?.[1]).toContain('WARNING:');
      expect(result.fieldBullets?.[2]).toContain('DOSE:');
      expect(result.fieldBullets?.[3]).toContain('INTERACTION:');
    });
  });

  // ==========================================================================
  // DRUG LOOKUP BY BRAND NAME
  // ==========================================================================

  describe('lookupDrug - Brand Name Lookup', () => {
    it('should find drug by brand name (Lopressor -> metoprolol)', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([mockMetoprolol]);

      const result = await service.lookupDrug('Lopressor');

      expect(result.found).toBe(true);
      expect(result.drug?.name).toBe('metoprolol');
      expect(result.normalizedFrom).toBe('Lopressor');
      expect(mockDB.searchDrugs).toHaveBeenCalledWith('Lopressor', 5);
    });

    it('should find drug by brand name (Zestril -> lisinopril)', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([mockLisinopril]);

      const result = await service.lookupDrug('Zestril');

      expect(result.found).toBe(true);
      expect(result.drug?.name).toBe('lisinopril');
      expect(result.normalizedFrom).toBe('Zestril');
    });

    it('should find drug by brand name case-insensitive (lopressor)', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([mockMetoprolol]);

      const result = await service.lookupDrug('lopressor');

      expect(result.found).toBe(true);
      expect(result.drug?.name).toBe('metoprolol');
      expect(result.normalizedFrom).toBe('lopressor');
    });

    it('should find drug by alternate brand name (Toprol-XL)', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([mockMetoprolol]);

      const result = await service.lookupDrug('Toprol-XL');

      expect(result.found).toBe(true);
      expect(result.drug?.name).toBe('metoprolol');
      expect(result.normalizedFrom).toBe('Toprol-XL');
    });
  });

  // ==========================================================================
  // UNKNOWN DRUG HANDLING
  // ==========================================================================

  describe('lookupDrug - Unknown Drug Handling', () => {
    it('should return not found with suggestions for unknown drug', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs
        .mockResolvedValueOnce([]) // First search returns no results
        .mockResolvedValueOnce([mockMetoprolol, mockLisinopril]); // Suggestions search

      const result = await service.lookupDrug('unknowndrugname');

      expect(result.found).toBe(false);
      expect(result.drug).toBeUndefined();
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions).toEqual(['Metoprolol', 'Lisinopril']);
    });

    it('should return not found without suggestions if no similar drugs', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([]);

      const result = await service.lookupDrug('completelyunknown');

      expect(result.found).toBe(false);
      expect(result.drug).toBeUndefined();
      expect(result.suggestions).toEqual([]);
    });

    it('should handle empty string query gracefully', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([]);

      const result = await service.lookupDrug('');

      expect(result.found).toBe(false);
      expect(mockDB.getDrugByName).toHaveBeenCalledWith('');
    });
  });

  // ==========================================================================
  // LA COUNTY FORMULARY DRUGS
  // ==========================================================================

  describe('lookupDrug - LA County Formulary', () => {
    it('should identify LA County formulary drugs (naloxone)', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockNaloxone);

      const result = await service.lookupDrug('naloxone');

      expect(result.found).toBe(true);
      expect(result.drug?.laCountyFormulary).toBe(true);
      expect(result.drug?.emsRelevance).toBe('high');
    });

    it('should identify non-formulary drugs', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockMetoprolol);

      const result = await service.lookupDrug('metoprolol');

      expect(result.found).toBe(true);
      expect(result.drug?.laCountyFormulary).toBe(false);
    });
  });

  // ==========================================================================
  // CRITICAL SAFETY INFORMATION
  // ==========================================================================

  describe('lookupDrug - Safety Information', () => {
    it('should include reversal information for critical drugs (warfarin)', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockWarfarin);

      const result = await service.lookupDrug('warfarin');

      expect(result.found).toBe(true);
      expect(result.fieldBullets).toBeDefined();

      const reversalBullet = result.fieldBullets?.find(b => b.includes('REVERSAL:'));
      expect(reversalBullet).toBeDefined();
      expect(reversalBullet).toContain('Vitamin K');
    });

    it('should include major warnings for anticoagulants', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockWarfarin);

      const result = await service.lookupDrug('warfarin');

      const warningBullet = result.fieldBullets?.find(b => b.includes('WARNING:'));
      expect(warningBullet).toBeDefined();
      expect(warningBullet).toContain('BLEEDING RISK');
    });

    it('should include interaction warnings', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockMetoprolol);

      const result = await service.lookupDrug('metoprolol');

      const interactionBullet = result.fieldBullets?.find(b => b.includes('INTERACTION:'));
      expect(interactionBullet).toBeDefined();
    });
  });

  // ==========================================================================
  // MULTIPLE DRUG LOOKUP
  // ==========================================================================

  describe('lookupDrugs - Batch Lookup', () => {
    it('should lookup multiple drugs at once', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockMetoprolol)
        .mockResolvedValueOnce(mockLisinopril)
        .mockResolvedValueOnce(mockWarfarin);

      const results = await service.lookupDrugs(['metoprolol', 'lisinopril', 'warfarin']);

      expect(results).toHaveLength(3);
      expect(results[0].drug?.name).toBe('metoprolol');
      expect(results[1].drug?.name).toBe('lisinopril');
      expect(results[2].drug?.name).toBe('warfarin');
    });

    it('should handle mix of found and not found drugs', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockMetoprolol)
        .mockResolvedValueOnce(null);

      mockDB.searchDrugs.mockResolvedValue([]);

      const results = await service.lookupDrugs(['metoprolol', 'unknowndrug']);

      expect(results).toHaveLength(2);
      expect(results[0].found).toBe(true);
      expect(results[1].found).toBe(false);
    });
  });

  // ==========================================================================
  // GET DRUG BY RXCUI
  // ==========================================================================

  describe('getDrugByRxCUI', () => {
    it('should get drug by RxCUI', async () => {
      mockDB.getDrug.mockResolvedValue(mockMetoprolol);

      const result = await service.getDrugByRxCUI('6918');

      expect(result).toBeDefined();
      expect(result?.rxcui).toBe('6918');
      expect(result?.name).toBe('metoprolol');
      expect(mockDB.getDrug).toHaveBeenCalledWith('6918');
    });

    it('should return undefined for unknown RxCUI', async () => {
      mockDB.getDrug.mockResolvedValue(undefined);

      const result = await service.getDrugByRxCUI('99999');

      expect(result).toBeUndefined();
    });
  });

  // ==========================================================================
  // SEARCH DRUGS
  // ==========================================================================

  describe('searchDrugs', () => {
    it('should search drugs with default limit', async () => {
      mockDB.searchDrugs.mockResolvedValue([mockMetoprolol, mockLisinopril]);

      const results = await service.searchDrugs('blood pressure');

      expect(results).toHaveLength(2);
      expect(mockDB.searchDrugs).toHaveBeenCalledWith('blood pressure', 10);
    });

    it('should search drugs with custom limit', async () => {
      mockDB.searchDrugs.mockResolvedValue([mockMetoprolol]);

      await service.searchDrugs('beta blocker', 5);

      expect(mockDB.searchDrugs).toHaveBeenCalledWith('beta blocker', 5);
    });
  });
});

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

describe('formatDrugLookupForChat', () => {
  it('should format found drug with field bullets', () => {
    const result = {
      found: true,
      drug: mockMetoprolol,
      fieldBullets: [
        'USE: Hypertension, angina, heart failure, post-MI',
        'WARNING: Can mask hypoglycemia symptoms in diabetics',
        'DOSE: Typical: 25-100mg PO BID (extended release: once daily)',
        'INTERACTION: Avoid with verapamil/diltiazem (severe bradycardia risk)',
      ],
    };

    const output = formatDrugLookupForChat(result);

    expect(output).toContain('**METOPROLOL** - Beta Blocker');
    expect(output).toContain('USE: Hypertension');
    expect(output).toContain('WARNING: Can mask hypoglycemia');
    expect(output).toContain('LA County Formulary: No');
  });

  it('should format found drug with brand name normalization', () => {
    const result = {
      found: true,
      drug: mockMetoprolol,
      fieldBullets: ['USE: Hypertension'],
      normalizedFrom: 'Lopressor',
    };

    const output = formatDrugLookupForChat(result);

    expect(output).toContain('**LOPRESSOR** (Metoprolol) - Beta Blocker');
  });

  it('should format LA County formulary drug', () => {
    const result = {
      found: true,
      drug: mockNaloxone,
      fieldBullets: ['USE: Opioid overdose reversal'],
    };

    const output = formatDrugLookupForChat(result);

    expect(output).toContain('LA County Formulary: Yes');
    expect(output).toContain('EMS Relevance: HIGH');
  });

  it('should format not found with suggestions', () => {
    const result = {
      found: false,
      suggestions: ['Metoprolol', 'Lisinopril'],
    };

    const output = formatDrugLookupForChat(result);

    expect(output).toContain('Drug not found');
    expect(output).toContain('Did you mean: Metoprolol, Lisinopril?');
  });

  it('should format not found without suggestions', () => {
    const result = {
      found: false,
    };

    const output = formatDrugLookupForChat(result);

    expect(output).toContain('Drug not found in database');
    expect(output).toContain('Base Hospital consult');
  });
});

describe('formatDrugLookupForFunction', () => {
  it('should format found drug for function response', () => {
    const result = {
      found: true,
      drug: mockMetoprolol,
      fieldBullets: ['USE: Hypertension'],
    };

    const output = formatDrugLookupForFunction(result);

    expect(output.found).toBe(true);
    expect(output.drugName).toBe('Metoprolol');
    expect(output.genericName).toBe('metoprolol');
    expect(output.drugClass).toBe('Beta Blocker');
    expect(output.laCountyFormulary).toBe(false);
    expect(output.emsRelevance).toBe('high');
  });

  it('should format not found for function response', () => {
    const result = {
      found: false,
      suggestions: ['Metoprolol'],
    };

    const output = formatDrugLookupForFunction(result);

    expect(output.found).toBe(false);
    expect(output.error).toBe('Drug not found');
    expect(output.suggestions).toEqual(['Metoprolol']);
  });
});

// ============================================================================
// SINGLETON
// ============================================================================

describe('getDrugLookupService', () => {
  it('should return singleton instance', () => {
    const instance1 = getDrugLookupService();
    const instance2 = getDrugLookupService();

    expect(instance1).toBe(instance2);
  });
});
