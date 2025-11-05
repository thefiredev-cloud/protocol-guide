/**
 * Field Testing Scenarios - Integration Tests
 * Tests real-world firefighter/paramedic inputs
 * Target: 99%+ success rate (from 91% baseline)
 */

import { describe, expect,test } from 'vitest';

import { augmentQueryWithSynonyms,searchKB } from '@/lib/retrieval';

describe('Field Testing Scenarios (91% → 99%+ Pass Rate)', () => {
  describe('Previously Failing Cases - Typos & Missing Punctuation', () => {
    test('should handle "cant breathe" (missing apostrophe)', async () => {
      const results = await searchKB('cant breathe', 5);

      expect(results.length).toBeGreaterThan(0);

      // Should return respiratory/dyspnea protocols
      const hasRespiratoryProtocol = results.some(doc =>
        doc.title.toLowerCase().includes('dyspnea') ||
        doc.title.toLowerCase().includes('respiratory') ||
        doc.title.toLowerCase().includes('breath') ||
        doc.content.toLowerCase().includes('1213')
      );

      expect(hasRespiratoryProtocol).toBe(true);
    });

    test('should handle "seisure" → "seizure"', async () => {
      const results = await searchKB('seisure', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasSeizureProtocol = results.some(doc =>
        doc.title.toLowerCase().includes('seizure') ||
        doc.content.toLowerCase().includes('1231')
      );

      expect(hasSeizureProtocol).toBe(true);
    });

    test('should handle "asma" → "asthma"', async () => {
      const results = await searchKB('asma', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasRespiratoryProtocol = results.some(doc =>
        doc.title.toLowerCase().includes('respiratory') ||
        doc.title.toLowerCase().includes('asthma') ||
        doc.content.toLowerCase().includes('albuterol')
      );

      expect(hasRespiratoryProtocol).toBe(true);
    });
  });

  describe('Previously Failing Cases - Vague Input', () => {
    test('should handle "gunshot wound" (vague trauma)', async () => {
      const results = await searchKB('gunshot wound', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasTraumaProtocol = results.some(doc =>
        doc.title.toLowerCase().includes('trauma') ||
        doc.content.toLowerCase().includes('1244') ||
        doc.content.toLowerCase().includes('penetrating')
      );

      expect(hasTraumaProtocol).toBe(true);
    });

    test('should handle "nitroglycerin" (medication only)', async () => {
      const results = await searchKB('nitroglycerin', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasCardiacProtocol = results.some(doc =>
        doc.title.toLowerCase().includes('cardiac') ||
        doc.title.toLowerCase().includes('chest pain') ||
        doc.content.toLowerCase().includes('1211')
      );

      expect(hasCardiacProtocol).toBe(true);
    });

    test('should handle "pain" (extremely vague)', async () => {
      const results = await searchKB('pain', 5);

      // Should return some relevant results, not reject
      expect(results.length).toBeGreaterThan(0);

      // Should include pain management or assessment guidance
      const hasPainGuidance = results.some(doc =>
        doc.content.toLowerCase().includes('pain') ||
        doc.content.toLowerCase().includes('assessment')
      );

      expect(hasPainGuidance).toBe(true);
    });
  });

  describe('Common Typos - Stressed Firefighter Input', () => {
    test('should handle "cheast pain"', async () => {
      const results = await searchKB('cheast pain', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "respitory distress"', async () => {
      const results = await searchKB('respitory distress', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "unconsious"', async () => {
      const results = await searchKB('unconsious', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "diabetec"', async () => {
      const results = await searchKB('diabetec', 5);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Synonym Expansion - Firefighter Language', () => {
    test('should expand "heart attack" to medical terms', () => {
      const expanded = augmentQueryWithSynonyms('heart attack');

      expect(expanded).toContain('heart attack');
      expect(expanded.toLowerCase()).toContain('myocardial infarction');
      expect(expanded.toLowerCase()).toContain('stemi');
    });

    test('should expand "cant breathe" to protocols', () => {
      const expanded = augmentQueryWithSynonyms('cant breathe');

      expect(expanded.toLowerCase()).toContain('shortness of breath');
      expect(expanded.toLowerCase()).toContain('dyspnea');
    });

    test('should expand "gsw" to gunshot wound', () => {
      const expanded = augmentQueryWithSynonyms('gsw');

      expect(expanded.toLowerCase()).toContain('gunshot');
      expect(expanded.toLowerCase()).toContain('trauma');
    });

    test('should expand medication brand names', () => {
      const versedExpanded = augmentQueryWithSynonyms('versed');
      expect(versedExpanded.toLowerCase()).toContain('midazolam');

      const narcanExpanded = augmentQueryWithSynonyms('narcan');
      expect(narcanExpanded.toLowerCase()).toContain('naloxone');
    });
  });

  describe('Multi-Symptom Queries', () => {
    test('should handle "chest pain and shortness of breath"', async () => {
      const results = await searchKB('chest pain and shortness of breath', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasCardiacOrResp = results.some(doc =>
        doc.title.toLowerCase().includes('cardiac') ||
        doc.title.toLowerCase().includes('dyspnea') ||
        doc.title.toLowerCase().includes('respiratory')
      );

      expect(hasCardiacOrResp).toBe(true);
    });

    test('should handle "unresponsive with seizure activity"', async () => {
      const results = await searchKB('unresponsive with seizure activity', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasSeizureOrAMS = results.some(doc =>
        doc.title.toLowerCase().includes('seizure') ||
        doc.title.toLowerCase().includes('altered')
      );

      expect(hasSeizureOrAMS).toBe(true);
    });
  });

  describe('Field Abbreviations', () => {
    test('should handle "LOC" (loss of consciousness)', async () => {
      const results = await searchKB('LOC', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "SOB" (shortness of breath)', async () => {
      const results = await searchKB('SOB', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "AMS" (altered mental status)', async () => {
      const results = await searchKB('AMS', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "MVC" (motor vehicle collision)', async () => {
      const results = await searchKB('MVC', 5);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Pediatric Scenarios', () => {
    test('should handle "pediatric seizure"', async () => {
      const results = await searchKB('pediatric seizure', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasPediatricGuidance = results.some(doc =>
        doc.title.toLowerCase().includes('pediatric') ||
        doc.title.toLowerCase().includes('mcg 1309') ||
        doc.content.toLowerCase().includes('color code')
      );

      expect(hasPediatricGuidance).toBe(true);
    });

    test('should handle "child not breathing"', async () => {
      const results = await searchKB('child not breathing', 5);

      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "infant unresponsive"', async () => {
      const results = await searchKB('infant unresponsive', 5);

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Equipment/Procedure Queries', () => {
    test('should handle "epinephrine dose"', async () => {
      const results = await searchKB('epinephrine dose', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasDosing = results.some(doc =>
        doc.content.toLowerCase().includes('epinephrine') ||
        doc.content.toLowerCase().includes('mcg 1309')
      );

      expect(hasDosing).toBe(true);
    });

    test('should handle "intubation procedure"', async () => {
      const results = await searchKB('intubation', 5);

      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle "12-lead ecg"', async () => {
      const results = await searchKB('12-lead ecg', 5);

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Time-Critical Queries', () => {
    test('should handle "cardiac arrest" quickly', async () => {
      const start = Date.now();
      const results = await searchKB('cardiac arrest', 5);
      const duration = Date.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should be fast
    });

    test('should handle "stroke" quickly', async () => {
      const start = Date.now();
      const results = await searchKB('stroke', 5);
      const duration = Date.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });

    test('should handle "anaphylaxis" quickly', async () => {
      const start = Date.now();
      const results = await searchKB('anaphylaxis', 5);
      const duration = Date.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Base Contact Scenarios', () => {
    test('should provide base contact guidance when needed', async () => {
      const results = await searchKB('base contact', 5);

      expect(results.length).toBeGreaterThan(0);

      const hasBaseContactInfo = results.some(doc =>
        doc.title.toLowerCase().includes('base') ||
        doc.content.toLowerCase().includes('base contact') ||
        doc.content.toLowerCase().includes('base hospital')
      );

      expect(hasBaseContactInfo).toBe(true);
    });
  });
});
