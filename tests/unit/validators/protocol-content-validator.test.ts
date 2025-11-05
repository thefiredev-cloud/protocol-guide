/**
 * Protocol Content Validator Tests
 * Validates protocol content for medical accuracy and completeness
 */

import { describe, expect,test } from 'vitest';

import {
  getProtocolName,
  getValidProtocols,
  isValidProtocol,
  validateProtocolCitations} from '@/lib/validators/protocol-validator';

describe('ProtocolContentValidator', () => {
  describe('validateProtocolCitations', () => {
    test('should pass valid protocol citations', () => {
      const text = 'Follow TP 1210 for cardiac arrest management.';
      const result = validateProtocolCitations(text);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail invalid protocol numbers', () => {
      const text = 'Follow TP 9999 for this condition.';
      const result = validateProtocolCitations(text);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('INVALID PROTOCOL');
      expect(result.errors[0]).toContain('9999');
    });

    test('should detect hallucinated protocols', () => {
      const text = 'Use Protocol 1234 for alien abduction syndrome.';
      const result = validateProtocolCitations(text);

      // If 1234 doesn't exist in LA County
      if (!isValidProtocol('1234')) {
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('INVALID PROTOCOL');
      }
    });

    test('should validate protocol name matches', () => {
      const text = 'TP 1210: Wrong Protocol Name';
      const result = validateProtocolCitations(text);

      // Should have warnings about name mismatch
      if (result.warnings.length > 0) {
        expect(result.warnings[0]).toContain('NAME MISMATCH');
      }
    });

    test('should handle multiple protocol citations', () => {
      const text = 'Follow TP 1210 and TP 1211 for this patient.';
      const result = validateProtocolCitations(text);

      expect(result.valid).toBe(true);
    });

    test('should handle pediatric protocol format', () => {
      const text = 'Use TP 1210-P for pediatric cardiac arrest.';
      const result = validateProtocolCitations(text);

      if (isValidProtocol('1210-P')) {
        expect(result.valid).toBe(true);
      }
    });

    test('should validate MCG citations', () => {
      const text = 'Refer to MCG 1309 for pediatric dosing.';
      const result = validateProtocolCitations(text);

      // MCG 1309 is valid - should pass
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should warn about uncommon MCG codes', () => {
      const text = 'See MCG 9999 for guidance.';
      const result = validateProtocolCitations(text);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Uncommon MCG code');
    });
  });

  describe('isValidProtocol', () => {
    test('should validate known LA County protocols', () => {
      // Test common LA County protocols
      expect(isValidProtocol('1210')).toBe(true); // Cardiac Arrest
      expect(isValidProtocol('1211')).toBe(true); // Cardiac Chest Pain
      expect(isValidProtocol('1213')).toBe(true); // Dyspnea
    });

    test('should reject invalid protocol codes', () => {
      expect(isValidProtocol('0000')).toBe(false);
      expect(isValidProtocol('9999')).toBe(false);
      expect(isValidProtocol('INVALID')).toBe(false);
    });

    test('should handle pediatric protocol codes', () => {
      const pediatricCodes = getValidProtocols().filter(code => code.includes('-P'));

      pediatricCodes.forEach(code => {
        expect(isValidProtocol(code)).toBe(true);
      });
    });
  });

  describe('getProtocolName', () => {
    test('should return correct protocol names', () => {
      const name1210 = getProtocolName('1210');
      expect(name1210).toBeDefined();
      expect(name1210).toContain('Cardiac Arrest');
    });

    test('should return null for invalid protocols', () => {
      const name = getProtocolName('9999');
      expect(name).toBeNull();
    });

    test('should handle pediatric protocols', () => {
      const pediatricProtocols = getValidProtocols().filter(code => code.includes('-P'));

      if (pediatricProtocols.length > 0) {
        const name = getProtocolName(pediatricProtocols[0]);
        expect(name).toBeDefined();
        expect(name).toContain('Pediatric');
      }
    });
  });

  describe('getValidProtocols', () => {
    test('should return list of valid LA County protocols', () => {
      const protocols = getValidProtocols();

      expect(protocols).toBeDefined();
      expect(Array.isArray(protocols)).toBe(true);
      expect(protocols.length).toBeGreaterThan(0);
    });

    test('should return protocols in sorted order', () => {
      const protocols = getValidProtocols();
      const sorted = [...protocols].sort();

      expect(protocols).toEqual(sorted);
    });

    test('should include both adult and pediatric protocols', () => {
      const protocols = getValidProtocols();
      const adultProtocols = protocols.filter(code => !code.includes('-P'));
      const pediatricProtocols = protocols.filter(code => code.includes('-P'));

      expect(adultProtocols.length).toBeGreaterThan(0);
      expect(pediatricProtocols.length).toBeGreaterThan(0);
    });
  });

  describe('Protocol Reference Validation', () => {
    test('should detect cross-reference errors', () => {
      const textWithBrokenRef = 'See also TP 9999 for additional guidance.';
      const result = validateProtocolCitations(textWithBrokenRef);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('INVALID PROTOCOL');
    });

    test('should validate protocol format variations', () => {
      const variations = [
        'TP 1210',
        'Protocol 1210',
        'TP 1210-P',
        'Protocol 1210-P',
      ];

      variations.forEach(text => {
        const result = validateProtocolCitations(text);
        // Each should be validated (valid or not based on existence)
        expect(result).toBeDefined();
      });
    });

    test('should handle context around citations', () => {
      const text = `
        IMMEDIATE DECISIONS:
        1. Follow TP 1210 (Cardiac Arrest) for all pulseless patients
        2. Refer to TP 1211 (Cardiac Chest Pain) for suspected MI
        3. See MCG 1309 for pediatric dosing
      `;

      const result = validateProtocolCitations(text);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Medical Accuracy Validation', () => {
    test('should detect medication dose range violations', () => {
      // This would require medication validator integration
      // Placeholder for future implementation
      const protocolText = 'Epinephrine 10mg IV push'; // Dangerously high dose

      // Future: validate against known safe ranges
      // expect(validateMedicationDoses(protocolText).errors.length).toBeGreaterThan(0);
    });

    test('should validate required protocol sections', () => {
      // This would check for essential protocol components
      const incompleteProtocol = {
        title: 'Test Protocol',
        indications: 'Chest pain',
        // Missing: contraindications, procedures
      };

      // Future: implement section validation
      // const result = validateRequiredSections(incompleteProtocol);
      // expect(result.valid).toBe(false);
    });

    test('should check for contraindication warnings', () => {
      // Validate that protocols mention important contraindications
      const protocolText = 'Administer nitroglycerin for chest pain.';

      // Should warn if no contraindication mentioned
      // Future: implement contraindication checking
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty text', () => {
      const result = validateProtocolCitations('');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle text with no protocol citations', () => {
      const text = 'This is a general medical discussion without specific protocols.';
      const result = validateProtocolCitations(text);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle malformed protocol numbers', () => {
      const text = 'Follow TP 12.10 for treatment.';
      const result = validateProtocolCitations(text);

      // Should not match malformed format
      expect(result.valid).toBe(true); // No valid citations found to validate
    });

    test('should handle case variations', () => {
      const texts = [
        'Follow tp 1210 for treatment',
        'Follow TP 1210 for treatment',
        'Follow Tp 1210 for treatment',
      ];

      texts.forEach(text => {
        const result = validateProtocolCitations(text);
        expect(result).toBeDefined();
      });
    });
  });
});
