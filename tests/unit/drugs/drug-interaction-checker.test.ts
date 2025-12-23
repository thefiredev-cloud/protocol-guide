/**
 * PATIENT SAFETY CRITICAL TESTS
 * Drug Interaction Checker Unit Tests
 *
 * These tests ensure the DrugInteractionChecker correctly identifies
 * dangerous drug-drug interactions, critical for patient safety.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DrugInteractionChecker,
  formatInteractionsForChat,
  formatInteractionsForFunction,
  getDrugInteractionChecker,
} from '@/lib/drugs/services/drug-interaction-checker';
import type { DrugInteraction, DrugRecord } from '@/lib/drugs/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWarfarin: DrugRecord = {
  rxcui: '11289',
  name: 'warfarin',
  displayName: 'Warfarin',
  brandNames: ['Coumadin', 'Jantoven'],
  drugClass: 'Anticoagulant',
  drugClasses: ['Anticoagulant'],
  schedule: 'Rx',
  fieldSummary: [],
  interactionRxcuis: ['1191', '5640'], // aspirin, ibuprofen
  emsRelevance: 'high',
  laCountyFormulary: false,
};

const mockAspirin: DrugRecord = {
  rxcui: '1191',
  name: 'aspirin',
  displayName: 'Aspirin',
  brandNames: ['Bayer', 'Ecotrin'],
  drugClass: 'Antiplatelet',
  drugClasses: ['Antiplatelet', 'NSAID'],
  schedule: 'OTC',
  fieldSummary: [],
  interactionRxcuis: ['11289'], // warfarin
  emsRelevance: 'high',
  laCountyFormulary: true,
};

const mockIbuprofen: DrugRecord = {
  rxcui: '5640',
  name: 'ibuprofen',
  displayName: 'Ibuprofen',
  brandNames: ['Advil', 'Motrin'],
  drugClass: 'NSAID',
  drugClasses: ['NSAID', 'Analgesic'],
  schedule: 'OTC',
  fieldSummary: [],
  interactionRxcuis: ['11289', '29046'], // warfarin, lisinopril
  emsRelevance: 'moderate',
  laCountyFormulary: false,
};

const mockLisinopril: DrugRecord = {
  rxcui: '29046',
  name: 'lisinopril',
  displayName: 'Lisinopril',
  brandNames: ['Zestril', 'Prinivil'],
  drugClass: 'ACE Inhibitor',
  drugClasses: ['ACE Inhibitor'],
  schedule: 'Rx',
  fieldSummary: [],
  interactionRxcuis: ['5640'], // ibuprofen
  emsRelevance: 'high',
  laCountyFormulary: false,
};

const mockMetoprolol: DrugRecord = {
  rxcui: '6918',
  name: 'metoprolol',
  displayName: 'Metoprolol',
  brandNames: ['Lopressor', 'Toprol-XL'],
  drugClass: 'Beta Blocker',
  drugClasses: ['Beta Blocker'],
  schedule: 'Rx',
  fieldSummary: [],
  interactionRxcuis: [],
  emsRelevance: 'high',
  laCountyFormulary: false,
};

// Interaction data
const warfarinAspirinInteraction: DrugInteraction = {
  drugA_rxcui: '11289',
  drugB_rxcui: '1191',
  drugA_name: 'warfarin',
  drugB_name: 'aspirin',
  severity: 'major',
  mechanism: 'Additive anticoagulant effects increase bleeding risk significantly',
  management: 'FIELD: Monitor for bleeding signs. Base Hospital contact if active bleeding. Check vital signs frequently.',
  source: 'ddinter',
};

const warfarinIbuprofenInteraction: DrugInteraction = {
  drugA_rxcui: '11289',
  drugB_rxcui: '5640',
  drugA_name: 'warfarin',
  drugB_name: 'ibuprofen',
  severity: 'major',
  mechanism: 'NSAIDs increase bleeding risk and may affect INR stability',
  management: 'FIELD: Monitor for bleeding. Avoid additional NSAIDs.',
  source: 'ddinter',
};

const lisinoprilIbuprofenInteraction: DrugInteraction = {
  drugA_rxcui: '29046',
  drugB_rxcui: '5640',
  drugA_name: 'lisinopril',
  drugB_name: 'ibuprofen',
  severity: 'moderate',
  mechanism: 'NSAIDs may reduce antihypertensive effect and increase renal dysfunction risk',
  management: 'Monitor blood pressure and renal function. Consider alternative analgesic.',
  source: 'ddinter',
};

const minorInteraction: DrugInteraction = {
  drugA_rxcui: '6918',
  drugB_rxcui: '1191',
  drugA_name: 'metoprolol',
  drugB_name: 'aspirin',
  severity: 'minor',
  mechanism: 'Minimal interaction - aspirin may slightly reduce beta blocker absorption',
  management: 'No specific action needed. Monitor therapeutic response.',
  source: 'ddinter',
};

// ============================================================================
// MOCK DATABASE
// ============================================================================

const mockDB = {
  getDrugByName: vi.fn(),
  searchDrugs: vi.fn(),
  checkInteractionPair: vi.fn(),
};

vi.mock('@/lib/drugs/storage/drug-database', () => ({
  getDrugDB: vi.fn(() => Promise.resolve(mockDB)),
}));

// ============================================================================
// TESTS
// ============================================================================

describe('DrugInteractionChecker - PATIENT SAFETY CRITICAL', () => {
  let checker: DrugInteractionChecker;

  beforeEach(() => {
    checker = new DrugInteractionChecker();
    vi.clearAllMocks();
  });

  // ==========================================================================
  // MAJOR INTERACTIONS
  // ==========================================================================

  describe('checkInteractions - Major Interactions', () => {
    it('should detect major interaction: warfarin + aspirin', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin);
      mockDB.checkInteractionPair.mockResolvedValue(warfarinAspirinInteraction);

      const result = await checker.checkInteractions(['warfarin', 'aspirin']);

      expect(result.hasInteractions).toBe(true);
      expect(result.majorInteractions).toHaveLength(1);
      expect(result.majorInteractions[0].severity).toBe('major');
      expect(result.majorInteractions[0].drugA).toBe('Warfarin');
      expect(result.majorInteractions[0].drugB).toBe('Aspirin');
      expect(result.majorInteractions[0].mechanism).toContain('bleeding risk');
      expect(result.majorInteractions[0].management).toContain('FIELD');
    });

    it('should detect major interaction: warfarin + ibuprofen', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockIbuprofen);
      mockDB.checkInteractionPair.mockResolvedValue(warfarinIbuprofenInteraction);

      const result = await checker.checkInteractions(['warfarin', 'ibuprofen']);

      expect(result.hasInteractions).toBe(true);
      expect(result.majorInteractions).toHaveLength(1);
      expect(result.majorInteractions[0].severity).toBe('major');
      expect(result.majorInteractions[0].mechanism).toContain('NSAIDs');
      expect(result.majorInteractions[0].management).toContain('bleeding');
    });

    it('should detect multiple major interactions in drug list', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin)
        .mockResolvedValueOnce(mockIbuprofen);

      mockDB.checkInteractionPair
        .mockResolvedValueOnce(warfarinAspirinInteraction)
        .mockResolvedValueOnce(warfarinIbuprofenInteraction)
        .mockResolvedValueOnce(null); // aspirin + ibuprofen - no major interaction

      const result = await checker.checkInteractions(['warfarin', 'aspirin', 'ibuprofen']);

      expect(result.hasInteractions).toBe(true);
      expect(result.majorInteractions).toHaveLength(2);
      expect(result.summary).toContain('MAJOR: 2 interaction(s)');
      expect(result.summary).toContain('REQUIRES ATTENTION');
    });
  });

  // ==========================================================================
  // MODERATE INTERACTIONS
  // ==========================================================================

  describe('checkInteractions - Moderate Interactions', () => {
    it('should detect moderate interaction: lisinopril + ibuprofen', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockLisinopril)
        .mockResolvedValueOnce(mockIbuprofen);
      mockDB.checkInteractionPair.mockResolvedValue(lisinoprilIbuprofenInteraction);

      const result = await checker.checkInteractions(['lisinopril', 'ibuprofen']);

      expect(result.hasInteractions).toBe(true);
      expect(result.moderateInteractions).toHaveLength(1);
      expect(result.moderateInteractions[0].severity).toBe('moderate');
      expect(result.moderateInteractions[0].drugA).toBe('Lisinopril');
      expect(result.moderateInteractions[0].drugB).toBe('Ibuprofen');
      expect(result.summary).toContain('MODERATE: 1 interaction(s)');
    });

    it('should separate major and moderate interactions', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin)
        .mockResolvedValueOnce(mockLisinopril)
        .mockResolvedValueOnce(mockIbuprofen);

      mockDB.checkInteractionPair
        .mockResolvedValueOnce(warfarinAspirinInteraction) // major
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(warfarinIbuprofenInteraction) // major
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(lisinoprilIbuprofenInteraction); // moderate

      const result = await checker.checkInteractions([
        'warfarin',
        'aspirin',
        'lisinopril',
        'ibuprofen',
      ]);

      expect(result.majorInteractions).toHaveLength(2);
      expect(result.moderateInteractions).toHaveLength(1);
      expect(result.summary).toContain('MAJOR: 2');
      expect(result.summary).toContain('MODERATE: 1');
    });
  });

  // ==========================================================================
  // MINOR INTERACTIONS - FILTERING
  // ==========================================================================

  describe('checkInteractions - Minor Interaction Filtering', () => {
    it('should exclude minor interactions when includeMinor=false (default)', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockMetoprolol)
        .mockResolvedValueOnce(mockAspirin);
      mockDB.checkInteractionPair.mockResolvedValue(minorInteraction);

      const result = await checker.checkInteractions(['metoprolol', 'aspirin']);

      expect(result.hasInteractions).toBe(true);
      expect(result.minorInteractions).toHaveLength(0);
      // Summary still mentions minor interactions exist (safety feature)
      expect(result.summary).toContain('MINOR: 1 interaction(s)');
    });

    it('should include minor interactions when includeMinor=true', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockMetoprolol)
        .mockResolvedValueOnce(mockAspirin);
      mockDB.checkInteractionPair.mockResolvedValue(minorInteraction);

      const result = await checker.checkInteractions(['metoprolol', 'aspirin'], true);

      expect(result.hasInteractions).toBe(true);
      expect(result.minorInteractions).toHaveLength(1);
      expect(result.minorInteractions[0].severity).toBe('minor');
      expect(result.summary).toContain('MINOR: 1 interaction(s)');
    });
  });

  // ==========================================================================
  // NO INTERACTIONS
  // ==========================================================================

  describe('checkInteractions - No Interactions', () => {
    it('should return no interactions for compatible medications', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockMetoprolol)
        .mockResolvedValueOnce(mockLisinopril);
      mockDB.checkInteractionPair.mockResolvedValue(null);

      const result = await checker.checkInteractions(['metoprolol', 'lisinopril']);

      expect(result.hasInteractions).toBe(false);
      expect(result.majorInteractions).toHaveLength(0);
      expect(result.moderateInteractions).toHaveLength(0);
      expect(result.minorInteractions).toHaveLength(0);
      expect(result.summary).toContain('No significant interactions detected');
    });

    it('should return no interactions for single medication', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockMetoprolol);

      const result = await checker.checkInteractions(['metoprolol']);

      expect(result.hasInteractions).toBe(false);
      expect(result.summary).toContain('Only one medication identified');
    });
  });

  // ==========================================================================
  // MULTIPLE MEDICATION PAIR CHECKING
  // ==========================================================================

  describe('checkInteractions - Multiple Medication Pairs', () => {
    it('should check all possible pairs in a medication list', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin)
        .mockResolvedValueOnce(mockIbuprofen);

      mockDB.checkInteractionPair.mockResolvedValue(null);

      await checker.checkInteractions(['warfarin', 'aspirin', 'ibuprofen']);

      // Should check 3 pairs: warfarin-aspirin, warfarin-ibuprofen, aspirin-ibuprofen
      expect(mockDB.checkInteractionPair).toHaveBeenCalledTimes(3);
      expect(mockDB.checkInteractionPair).toHaveBeenCalledWith('11289', '1191');
      expect(mockDB.checkInteractionPair).toHaveBeenCalledWith('11289', '5640');
      expect(mockDB.checkInteractionPair).toHaveBeenCalledWith('1191', '5640');
    });

    it('should check 6 pairs for 4 medications', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin)
        .mockResolvedValueOnce(mockIbuprofen)
        .mockResolvedValueOnce(mockMetoprolol);

      mockDB.checkInteractionPair.mockResolvedValue(null);

      await checker.checkInteractions(['warfarin', 'aspirin', 'ibuprofen', 'metoprolol']);

      // Should check 6 pairs: C(4,2) = 6
      expect(mockDB.checkInteractionPair).toHaveBeenCalledTimes(6);
    });
  });

  // ==========================================================================
  // UNRESOLVED MEDICATIONS
  // ==========================================================================

  describe('checkInteractions - Unresolved Medications', () => {
    it('should handle unresolved medication names', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(null); // Unknown drug

      mockDB.searchDrugs.mockResolvedValue([]); // Search also fails

      const result = await checker.checkInteractions(['warfarin', 'unknowndrug']);

      expect(result.hasInteractions).toBe(false);
      expect(result.summary).toContain('Only one medication identified');
      expect(result.summary).toContain('unknowndrug');
    });

    it('should work with resolved drugs even if some are unresolved', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin)
        .mockResolvedValueOnce(null); // Unknown drug

      mockDB.searchDrugs.mockResolvedValue([]);
      mockDB.checkInteractionPair.mockResolvedValue(warfarinAspirinInteraction);

      const result = await checker.checkInteractions(['warfarin', 'aspirin', 'unknown']);

      expect(result.hasInteractions).toBe(true);
      expect(result.majorInteractions).toHaveLength(1);
      expect(result.summary).toContain('Could not identify: unknown');
    });

    it('should handle all unresolved medications', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([]);

      const result = await checker.checkInteractions(['unknown1', 'unknown2']);

      expect(result.hasInteractions).toBe(false);
      expect(result.summary).toContain('No medications could be identified');
    });

    it('should use search as fallback for unresolved names', async () => {
      mockDB.getDrugByName.mockResolvedValue(null);
      mockDB.searchDrugs.mockResolvedValue([mockWarfarin]);

      const result = await checker.checkInteractions(['coumadin']); // Brand name

      expect(mockDB.searchDrugs).toHaveBeenCalledWith('coumadin', 1);
    });
  });

  // ==========================================================================
  // INTERACTION RXCUIS ARRAY
  // ==========================================================================

  describe('checkInteractions - InteractionRxcuis Array', () => {
    it('should detect interaction via interactionRxcuis when not in DB', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin);
      mockDB.checkInteractionPair.mockResolvedValue(null); // Not in DB

      const result = await checker.checkInteractions(['warfarin', 'aspirin']);

      expect(result.hasInteractions).toBe(true);
      expect(result.moderateInteractions).toHaveLength(1);
      expect(result.moderateInteractions[0].severity).toBe('moderate');
      expect(result.moderateInteractions[0].mechanism).toBe('Potential interaction identified');
    });

    it('should not duplicate interaction if found in both DB and array', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin);
      mockDB.checkInteractionPair.mockResolvedValue(warfarinAspirinInteraction);

      const result = await checker.checkInteractions(['warfarin', 'aspirin']);

      expect(result.hasInteractions).toBe(true);
      expect(result.majorInteractions).toHaveLength(1); // Not duplicated
    });
  });

  // ==========================================================================
  // HAS MAJOR INTERACTIONS
  // ==========================================================================

  describe('hasMajorInteractions', () => {
    it('should return true for major interactions', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin);
      mockDB.checkInteractionPair.mockResolvedValue(warfarinAspirinInteraction);

      const hasMajor = await checker.hasMajorInteractions(['warfarin', 'aspirin']);

      expect(hasMajor).toBe(true);
    });

    it('should return false for no major interactions', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockLisinopril)
        .mockResolvedValueOnce(mockIbuprofen);
      mockDB.checkInteractionPair.mockResolvedValue(lisinoprilIbuprofenInteraction);

      const hasMajor = await checker.hasMajorInteractions(['lisinopril', 'ibuprofen']);

      expect(hasMajor).toBe(false);
    });

    it('should return false when no interactions at all', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockMetoprolol)
        .mockResolvedValueOnce(mockLisinopril);
      mockDB.checkInteractionPair.mockResolvedValue(null);

      const hasMajor = await checker.hasMajorInteractions(['metoprolol', 'lisinopril']);

      expect(hasMajor).toBe(false);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('checkInteractions - Edge Cases', () => {
    it('should handle empty medication list', async () => {
      const result = await checker.checkInteractions([]);

      expect(result.hasInteractions).toBe(false);
      expect(result.summary).toContain('No medications could be identified');
    });

    it('should handle case-insensitive medication names', async () => {
      mockDB.getDrugByName
        .mockResolvedValueOnce(mockWarfarin)
        .mockResolvedValueOnce(mockAspirin);
      mockDB.checkInteractionPair.mockResolvedValue(warfarinAspirinInteraction);

      const result = await checker.checkInteractions(['WARFARIN', 'ASPIRIN']);

      expect(mockDB.getDrugByName).toHaveBeenCalledWith('warfarin');
      expect(mockDB.getDrugByName).toHaveBeenCalledWith('aspirin');
    });

    it('should trim whitespace from medication names', async () => {
      mockDB.getDrugByName.mockResolvedValue(mockWarfarin);

      await checker.checkInteractions(['  warfarin  ']);

      expect(mockDB.getDrugByName).toHaveBeenCalledWith('warfarin');
    });
  });
});

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

describe('formatInteractionsForChat', () => {
  it('should format major interaction alert', () => {
    const result = {
      hasInteractions: true,
      majorInteractions: [
        {
          drugA: 'Warfarin',
          drugB: 'Aspirin',
          severity: 'major' as const,
          mechanism: 'Additive anticoagulant effects',
          management: 'FIELD: Monitor for bleeding',
        },
      ],
      moderateInteractions: [],
      minorInteractions: [],
      summary: 'MAJOR: 1 interaction(s) - REQUIRES ATTENTION',
    };

    const output = formatInteractionsForChat(result);

    expect(output).toContain('**INTERACTION ALERT**');
    expect(output).toContain('**MAJOR: Warfarin + Aspirin**');
    expect(output).toContain('Mechanism: Additive anticoagulant effects');
    expect(output).toContain('FIELD ACTION: FIELD: Monitor for bleeding');
  });

  it('should format moderate interactions', () => {
    const result = {
      hasInteractions: true,
      majorInteractions: [],
      moderateInteractions: [
        {
          drugA: 'Lisinopril',
          drugB: 'Ibuprofen',
          severity: 'moderate' as const,
          mechanism: 'NSAIDs reduce ACE inhibitor effect',
          management: 'Monitor blood pressure',
        },
      ],
      minorInteractions: [],
      summary: 'MODERATE: 1 interaction(s) - monitor patient',
    };

    const output = formatInteractionsForChat(result);

    expect(output).toContain('**MODERATE: Lisinopril + Ibuprofen**');
    expect(output).toContain('NSAIDs reduce ACE inhibitor effect');
    expect(output).toContain('Monitor: Monitor blood pressure');
  });

  it('should format minor interactions when included', () => {
    const result = {
      hasInteractions: true,
      majorInteractions: [],
      moderateInteractions: [],
      minorInteractions: [
        {
          drugA: 'Metoprolol',
          drugB: 'Aspirin',
          severity: 'minor' as const,
          mechanism: 'Minimal interaction',
          management: 'No action needed',
        },
      ],
      summary: 'MINOR: 1 interaction(s) - awareness only',
    };

    const output = formatInteractionsForChat(result);

    expect(output).toContain('Minor interactions:');
    expect(output).toContain('- Metoprolol + Aspirin: Minimal interaction');
  });

  it('should format no interactions', () => {
    const result = {
      hasInteractions: false,
      majorInteractions: [],
      moderateInteractions: [],
      minorInteractions: [],
      summary: 'No significant interactions detected',
    };

    const output = formatInteractionsForChat(result);

    expect(output).toContain('No significant interactions detected');
    expect(output).not.toContain('INTERACTION ALERT');
  });
});

describe('formatInteractionsForFunction', () => {
  it('should format interactions for function response', () => {
    const result = {
      hasInteractions: true,
      majorInteractions: [
        {
          drugA: 'Warfarin',
          drugB: 'Aspirin',
          severity: 'major' as const,
          mechanism: 'Bleeding risk',
          management: 'Monitor closely',
        },
      ],
      moderateInteractions: [
        {
          drugA: 'Lisinopril',
          drugB: 'Ibuprofen',
          severity: 'moderate' as const,
          mechanism: 'Reduced efficacy',
          management: 'Monitor BP',
        },
      ],
      minorInteractions: [],
      summary: 'MAJOR: 1 interaction(s)',
    };

    const output = formatInteractionsForFunction(result);

    expect(output.hasInteractions).toBe(true);
    expect(output.majorInteractions).toHaveLength(1);
    expect(output.majorInteractions[0].drugs).toEqual(['Warfarin', 'Aspirin']);
    expect(output.moderateInteractions).toHaveLength(1);
    expect(output.minorCount).toBe(0);
  });
});

// ============================================================================
// SINGLETON
// ============================================================================

describe('getDrugInteractionChecker', () => {
  it('should return singleton instance', () => {
    const instance1 = getDrugInteractionChecker();
    const instance2 = getDrugInteractionChecker();

    expect(instance1).toBe(instance2);
  });
});
