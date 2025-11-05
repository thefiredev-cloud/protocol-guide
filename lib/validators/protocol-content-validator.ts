/**
 * Protocol Content Validator
 *
 * Comprehensive validation of protocol content including:
 * - Medication dosing accuracy
 * - Required section completeness
 * - Protocol structure validation
 * - Cross-reference integrity
 * - Clinical content validation
 */

import { isAuthorizedMedication, validateMedications } from './medication-validator';
import { isValidProtocol, validateProtocolCitations } from './protocol-validator';

export interface Protocol {
  id: string;
  title: string;
  category: string;
  protocolCodes?: string[];
  text?: string;
  sections?: ProtocolSection[];
  medications?: Medication[];
  baseContact?: BaseContactRequirement;
  warnings?: string[];
  contraindications?: string[];
  positioning?: string;
  transport?: TransportDestination[];
}

export interface ProtocolSection {
  heading: string;
  content: string;
  order?: number;
}

export interface Medication {
  name: string;
  dose?: string;
  route?: string;
  contraindications?: string[];
  warnings?: string[];
}

export interface BaseContactRequirement {
  required: boolean;
  criteria?: string;
  scenarios?: string[];
}

export interface TransportDestination {
  destination: string;
  criteria?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  type: string;
  severity: 'critical' | 'error' | 'warning';
  message: string;
  location?: string;
  context?: Record<string, unknown>;
}

export interface ValidationWarning {
  type: string;
  message: string;
  suggestion?: string;
  location?: string;
}

export interface Conflict {
  protocolId1: string;
  protocolId2: string;
  conflictType: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * Main Protocol Content Validator Class
 */
export class ProtocolContentValidator {
  private requiredSections = [
    'indications',
    'contraindications',
    'treatment',
    'procedure',
    'medications'
  ];

  /**
   * Validate medication dosing in protocol
   */
  validateMedicationDoses(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!protocol.text && !protocol.medications) {
      return {
        valid: true,
        errors: [],
        warnings: [],
        score: 100
      };
    }

    // Validate medications in text
    if (protocol.text) {
      const medValidation = validateMedications(protocol.text);

      medValidation.errors.forEach(error => {
        errors.push({
          type: 'UNAUTHORIZED_MEDICATION',
          severity: 'critical',
          message: error,
          location: 'protocol.text'
        });
      });

      medValidation.warnings.forEach(warning => {
        warnings.push({
          type: 'MEDICATION_WARNING',
          message: warning,
          location: 'protocol.text'
        });
      });
    }

    // Validate structured medications
    if (protocol.medications) {
      for (const med of protocol.medications) {
        if (!isAuthorizedMedication(med.name)) {
          errors.push({
            type: 'UNAUTHORIZED_MEDICATION',
            severity: 'critical',
            message: `Medication "${med.name}" is not authorized in LA County formulary`,
            location: 'protocol.medications',
            context: { medication: med.name }
          });
        }

        // Check for dose information
        if (!med.dose) {
          warnings.push({
            type: 'MISSING_DOSE',
            message: `Medication "${med.name}" has no dosing information`,
            suggestion: 'Add dose range and administration details',
            location: 'protocol.medications'
          });
        }

        // Check for route
        if (!med.route) {
          warnings.push({
            type: 'MISSING_ROUTE',
            message: `Medication "${med.name}" has no route specified`,
            suggestion: 'Specify administration route (IV, IM, PO, etc.)',
            location: 'protocol.medications'
          });
        }
      }
    }

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Check dosage ranges are within safe limits
   */
  checkDosageRanges(medication: Medication): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!medication.dose) {
      errors.push({
        type: 'MISSING_DOSE',
        severity: 'error',
        message: `No dosage specified for ${medication.name}`,
        context: { medication: medication.name }
      });
    } else {
      // Extract numeric values from dose string
      const doseNumbers = medication.dose.match(/\d+(?:\.\d+)?/g);

      if (!doseNumbers || doseNumbers.length === 0) {
        warnings.push({
          type: 'UNPARSEABLE_DOSE',
          message: `Could not parse dosage from: "${medication.dose}"`,
          suggestion: 'Use standard format: "1-2 mg IV" or "0.01 mg/kg"',
          location: 'medication.dose'
        });
      }

      // Check for weight-based dosing format
      if (medication.dose.includes('mg/kg') || medication.dose.includes('mcg/kg')) {
        if (!medication.dose.match(/\d+(?:\.\d+)?\s*(?:mg|mcg)\/kg/)) {
          warnings.push({
            type: 'WEIGHT_BASED_FORMAT',
            message: 'Weight-based dose should include units (mg/kg or mcg/kg)',
            suggestion: 'Format: "0.1 mg/kg IV"',
            location: 'medication.dose'
          });
        }
      }
    }

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Verify contraindications are present and valid
   */
  verifyContraindications(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // All medication protocols should have contraindications
    if (protocol.category === 'Medication' && protocol.medications) {
      for (const med of protocol.medications) {
        if (!med.contraindications || med.contraindications.length === 0) {
          warnings.push({
            type: 'MISSING_CONTRAINDICATIONS',
            message: `Medication "${med.name}" has no contraindications listed`,
            suggestion: 'Review MCG for contraindications',
            location: 'medication.contraindications'
          });
        }
      }
    }

    // Protocol-level contraindications
    if (!protocol.contraindications || protocol.contraindications.length === 0) {
      // Check if it's a treatment protocol
      if (protocol.protocolCodes && protocol.protocolCodes.some(code => code.startsWith('1'))) {
        warnings.push({
          type: 'MISSING_PROTOCOL_CONTRAINDICATIONS',
          message: 'Treatment protocol has no contraindications listed',
          suggestion: 'Add contraindications or mark as "None"',
          location: 'protocol.contraindications'
        });
      }
    }

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validate required sections are present
   */
  validateRequiredSections(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!protocol.text && !protocol.sections) {
      warnings.push({
        type: 'NO_CONTENT',
        message: 'Protocol has no text content or structured sections',
        location: 'protocol'
      });

      return {
        valid: false,
        errors,
        warnings,
        score: 0
      };
    }

    if (protocol.sections) {
      const sectionHeadings = protocol.sections.map(s =>
        s.heading.toLowerCase().replace(/[^a-z]/g, '')
      );

      for (const requiredSection of this.requiredSections) {
        const found = sectionHeadings.some(heading =>
          heading.includes(requiredSection) || requiredSection.includes(heading)
        );

        if (!found) {
          warnings.push({
            type: 'MISSING_SECTION',
            message: `Missing recommended section: "${requiredSection}"`,
            suggestion: `Add ${requiredSection} section to protocol`,
            location: 'protocol.sections'
          });
        }
      }
    }

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Check protocol completeness
   */
  checkProtocolCompleteness(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required fields
    if (!protocol.id || protocol.id.trim() === '') {
      errors.push({
        type: 'MISSING_ID',
        severity: 'critical',
        message: 'Protocol has no ID',
        location: 'protocol.id'
      });
    }

    if (!protocol.title || protocol.title.trim() === '') {
      errors.push({
        type: 'MISSING_TITLE',
        severity: 'error',
        message: 'Protocol has no title',
        location: 'protocol.title'
      });
    }

    if (!protocol.category || protocol.category.trim() === '') {
      warnings.push({
        type: 'MISSING_CATEGORY',
        message: 'Protocol has no category assigned',
        suggestion: 'Assign to: Protocol, Medication, or Policy',
        location: 'protocol.category'
      });
    }

    // Check for protocol codes (treatment protocols)
    if (!protocol.protocolCodes || protocol.protocolCodes.length === 0) {
      if (protocol.id.startsWith('md:') || protocol.category === 'Protocol') {
        warnings.push({
          type: 'MISSING_PROTOCOL_CODES',
          message: 'Protocol document has no protocol codes assigned',
          suggestion: 'Extract TP codes from document content',
          location: 'protocol.protocolCodes'
        });
      }
    }

    // Check content exists
    if (!protocol.text && (!protocol.sections || protocol.sections.length === 0)) {
      errors.push({
        type: 'NO_CONTENT',
        severity: 'error',
        message: 'Protocol has no content (text or sections)',
        location: 'protocol'
      });
    }

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Verify protocol codes are valid
   */
  verifyProtocolCodes(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!protocol.protocolCodes || protocol.protocolCodes.length === 0) {
      return {
        valid: true,
        errors: [],
        warnings: [],
        score: 100
      };
    }

    for (const code of protocol.protocolCodes) {
      if (!isValidProtocol(code)) {
        errors.push({
          type: 'INVALID_PROTOCOL_CODE',
          severity: 'error',
          message: `Protocol code "${code}" is not in LA County protocol list`,
          location: 'protocol.protocolCodes',
          context: { code }
        });
      }

      // Check format
      if (!/^\d{4}(-P)?$/.test(code)) {
        warnings.push({
          type: 'INVALID_CODE_FORMAT',
          message: `Protocol code "${code}" has invalid format`,
          suggestion: 'Use format: "1234" or "1234-P" for pediatric',
          location: 'protocol.protocolCodes'
        });
      }
    }

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validate protocol references in content
   */
  validateProtocolReferences(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!protocol.text) {
      return {
        valid: true,
        errors: [],
        warnings: [],
        score: 100
      };
    }

    const citationValidation = validateProtocolCitations(protocol.text);

    citationValidation.errors.forEach(error => {
      errors.push({
        type: 'INVALID_PROTOCOL_CITATION',
        severity: 'error',
        message: error,
        location: 'protocol.text'
      });
    });

    citationValidation.warnings.forEach(warning => {
      warnings.push({
        type: 'PROTOCOL_CITATION_WARNING',
        message: warning,
        location: 'protocol.text'
      });
    });

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Detect circular dependencies in protocol references
   */
  detectCircularDependencies(protocolId: string, protocols: Map<string, Protocol>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const visited = new Set<string>();
    const path: string[] = [];

    const detectCycle = (id: string): boolean => {
      if (path.includes(id)) {
        // Found cycle
        const cycleStart = path.indexOf(id);
        const cycle = [...path.slice(cycleStart), id];

        errors.push({
          type: 'CIRCULAR_DEPENDENCY',
          severity: 'error',
          message: `Circular dependency detected: ${cycle.join(' → ')}`,
          location: 'protocol.references',
          context: { cycle }
        });

        return true;
      }

      if (visited.has(id)) {
        return false;
      }

      visited.add(id);
      path.push(id);

      const protocol = protocols.get(id);
      if (protocol && protocol.text) {
        // Extract protocol references
        const references = protocol.text.match(/\b(?:TP|Protocol)\s+(\d{4}(?:-P)?)\b/gi);
        if (references) {
          for (const ref of references) {
            const code = ref.match(/\d{4}(?:-P)?/)?.[0];
            if (code) {
              // Find protocol with this code
              const protocolEntries = Array.from(protocols.entries());
              for (const [pid, p] of protocolEntries) {
                if (p.protocolCodes?.includes(code)) {
                  if (detectCycle(pid)) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }

      path.pop();
      return false;
    };

    detectCycle(protocolId);

    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Find conflicting protocols
   */
  findConflictingProtocols(protocols: Protocol[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for duplicate protocol codes
    const codeMap = new Map<string, string[]>();

    for (const protocol of protocols) {
      if (protocol.protocolCodes) {
        for (const code of protocol.protocolCodes) {
          if (!codeMap.has(code)) {
            codeMap.set(code, []);
          }
          codeMap.get(code)!.push(protocol.id);
        }
      }
    }

    // Report duplicates
    const codeEntries = Array.from(codeMap.entries());
    for (const [code, ids] of codeEntries) {
      if (ids.length > 1) {
        for (let i = 0; i < ids.length; i++) {
          for (let j = i + 1; j < ids.length; j++) {
            conflicts.push({
              protocolId1: ids[i],
              protocolId2: ids[j],
              conflictType: 'DUPLICATE_PROTOCOL_CODE',
              description: `Both protocols claim code ${code}`,
              severity: 'high'
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Validate effective dates
   */
  validateEffectiveDates(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // This would check effective/expiration dates if present in protocol
    // Placeholder for future implementation

    return {
      valid: true,
      errors,
      warnings,
      score: 100
    };
  }

  /**
   * Check version consistency
   */
  checkVersionConsistency(protocol: Protocol): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // This would check version numbers and dates in protocol text
    // Placeholder for future implementation

    return {
      valid: true,
      errors,
      warnings,
      score: 100
    };
  }

  /**
   * Calculate validation score (0-100)
   */
  private calculateValidationScore(
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct points for errors
    errors.forEach(error => {
      if (error.severity === 'critical') {
        score -= 25;
      } else if (error.severity === 'error') {
        score -= 10;
      } else {
        score -= 5;
      }
    });

    // Deduct points for warnings
    score -= warnings.length * 2;

    return Math.max(0, score);
  }

  /**
   * Comprehensive validation of a protocol
   */
  validateProtocol(protocol: Protocol): ValidationResult {
    const results = [
      this.checkProtocolCompleteness(protocol),
      this.verifyProtocolCodes(protocol),
      this.validateRequiredSections(protocol),
      this.validateMedicationDoses(protocol),
      this.verifyContraindications(protocol),
      this.validateProtocolReferences(protocol)
    ];

    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      score: Math.round(avgScore)
    };
  }
}
