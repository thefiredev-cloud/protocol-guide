/**
 * Multi-Layer Protocol Validation Pipeline
 *
 * Comprehensive 4-stage validation system:
 * 1. Pre-Retrieval: Query analysis and normalization
 * 2. During-Retrieval: Protocol verification
 * 3. Pre-Response: LLM context validation
 * 4. Post-Response: Hallucination detection
 *
 * Target: 99%+ accuracy, zero hallucinations
 */

import { getProtocolRepository } from '../db/protocol-repository';
import {
  isAuthorizedMedication,
  normalizeToGeneric,
  validateMedications,
} from '../validators/medication-validator';
import { validateProtocolCitations } from '../validators/protocol-validator';
import type { Protocol } from './protocol-schema';

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, unknown>;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
  context?: Record<string, unknown>;
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning';
  context?: Record<string, unknown>;
}

export interface MedicationDose {
  name: string;
  dose?: string;
  unit?: string;
  route?: string;
  min?: number;
  max?: number;
}

export interface DecisionPath {
  condition: string;
  action: string;
  protocolCode?: string;
}

// =============================================================================
// LA COUNTY MEDICATION DOSING RANGES
// =============================================================================

interface DoseRange {
  medication: string;
  route: string;
  minDose: number;
  maxDose: number;
  unit: string;
  weightBased: boolean;
  pediatricOnly?: boolean;
  notes?: string;
}

const MEDICATION_DOSE_RANGES: DoseRange[] = [
  // Cardiac
  { medication: 'epinephrine', route: 'IV', minDose: 0.01, maxDose: 1, unit: 'mg', weightBased: false },
  { medication: 'epinephrine', route: 'IV', minDose: 0.01, maxDose: 0.3, unit: 'mg/kg', weightBased: true, pediatricOnly: true },
  { medication: 'atropine', route: 'IV', minDose: 0.5, maxDose: 3, unit: 'mg', weightBased: false },
  { medication: 'atropine', route: 'IV', minDose: 0.02, maxDose: 1, unit: 'mg/kg', weightBased: true, pediatricOnly: true },
  { medication: 'amiodarone', route: 'IV', minDose: 150, maxDose: 300, unit: 'mg', weightBased: false },
  { medication: 'amiodarone', route: 'IV', minDose: 5, maxDose: 5, unit: 'mg/kg', weightBased: true, pediatricOnly: true },
  { medication: 'adenosine', route: 'IV', minDose: 6, maxDose: 12, unit: 'mg', weightBased: false },
  { medication: 'adenosine', route: 'IV', minDose: 0.1, maxDose: 0.3, unit: 'mg/kg', weightBased: true, pediatricOnly: true },
  { medication: 'nitroglycerin', route: 'SL', minDose: 0.3, maxDose: 0.4, unit: 'mg', weightBased: false },
  { medication: 'aspirin', route: 'PO', minDose: 162, maxDose: 325, unit: 'mg', weightBased: false },

  // Respiratory
  { medication: 'albuterol', route: 'NEB', minDose: 2.5, maxDose: 5, unit: 'mg', weightBased: false },

  // Pain Management
  { medication: 'fentanyl', route: 'IV', minDose: 25, maxDose: 100, unit: 'mcg', weightBased: false },
  { medication: 'fentanyl', route: 'IV', minDose: 1, maxDose: 2, unit: 'mcg/kg', weightBased: true, pediatricOnly: true },
  { medication: 'morphine', route: 'IV', minDose: 2, maxDose: 10, unit: 'mg', weightBased: false },
  { medication: 'morphine', route: 'IV', minDose: 0.05, maxDose: 0.1, unit: 'mg/kg', weightBased: true, pediatricOnly: true },
  { medication: 'ketorolac', route: 'IV', minDose: 15, maxDose: 30, unit: 'mg', weightBased: false },
  { medication: 'ketorolac', route: 'IM', minDose: 30, maxDose: 60, unit: 'mg', weightBased: false },

  // Neurological
  { medication: 'midazolam', route: 'IV', minDose: 2, maxDose: 5, unit: 'mg', weightBased: false },
  { medication: 'midazolam', route: 'IM', minDose: 5, maxDose: 10, unit: 'mg', weightBased: false },
  { medication: 'midazolam', route: 'IN', minDose: 5, maxDose: 10, unit: 'mg', weightBased: false },
  { medication: 'midazolam', route: 'IV', minDose: 0.05, maxDose: 0.2, unit: 'mg/kg', weightBased: true, pediatricOnly: true },

  // Antiemetics
  { medication: 'ondansetron', route: 'IV', minDose: 4, maxDose: 8, unit: 'mg', weightBased: false },
  { medication: 'ondansetron', route: 'IV', minDose: 0.1, maxDose: 0.15, unit: 'mg/kg', weightBased: true, pediatricOnly: true },

  // Antidotes
  { medication: 'naloxone', route: 'IV', minDose: 0.4, maxDose: 2, unit: 'mg', weightBased: false },
  { medication: 'naloxone', route: 'IN', minDose: 2, maxDose: 4, unit: 'mg', weightBased: false },
  { medication: 'naloxone', route: 'IV', minDose: 0.1, maxDose: 2, unit: 'mg/kg', weightBased: true, pediatricOnly: true },
  { medication: 'glucagon', route: 'IM', minDose: 0.5, maxDose: 1, unit: 'mg', weightBased: false },
  { medication: 'calcium chloride', route: 'IV', minDose: 500, maxDose: 1000, unit: 'mg', weightBased: false },

  // Metabolic
  { medication: 'dextrose', route: 'IV', minDose: 12.5, maxDose: 25, unit: 'g', weightBased: false, notes: 'D50 (50%)' },
  { medication: 'dextrose', route: 'IV', minDose: 0.5, maxDose: 1, unit: 'g/kg', weightBased: true, pediatricOnly: true, notes: 'D10 or D25' },
  { medication: 'magnesium sulfate', route: 'IV', minDose: 2, maxDose: 4, unit: 'g', weightBased: false },
  { medication: 'sodium bicarbonate', route: 'IV', minDose: 50, maxDose: 100, unit: 'mEq', weightBased: false },

  // Allergy
  { medication: 'diphenhydramine', route: 'IV', minDose: 25, maxDose: 50, unit: 'mg', weightBased: false },
  { medication: 'diphenhydramine', route: 'IM', minDose: 25, maxDose: 50, unit: 'mg', weightBased: false },
];

// =============================================================================
// VALIDATION PIPELINE CLASS
// =============================================================================

export class ProtocolValidationPipeline {
  private repo = getProtocolRepository();

  /**
   * STAGE 1: Pre-Retrieval Validation
   * Validates user query before database lookup
   */
  async validateQuery(query: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const protocolCodes = this.extractProtocolCodes(query);
    const medications = this.extractMedications(query);

    // Validate protocol codes
    await this.validateProtocolCodesInQuery(protocolCodes, errors);

    // Check medication context
    this.checkMedicationContext(medications, protocolCodes, warnings);

    // Detect vague queries
    if (this.isVagueQuery(query)) {
      warnings.push({
        code: 'VAGUE_QUERY',
        message: 'Query may be too vague - consider asking for specific protocols or symptoms',
        severity: 'warning',
        context: { query },
      });
    }

    // Detect unauthorized medications
    this.checkUnauthorizedMedications(medications, warnings);

    const normalized = this.normalizeQuery(query);

    return {
      valid: errors.filter(e => e.severity === 'critical' || e.severity === 'error').length === 0,
      errors,
      warnings,
      metadata: {
        normalizedQuery: normalized,
        detectedCodes: protocolCodes,
        detectedMedications: medications,
      },
    };
  }

  private async validateProtocolCodesInQuery(
    protocolCodes: string[],
    errors: ValidationError[]
  ): Promise<void> {
    for (const code of protocolCodes) {
      const exists = await this.repo.validateProtocolExists(code);
      if (!exists) {
        errors.push({
          code: 'INVALID_PROTOCOL_CODE',
          message: `Protocol ${code} not found in LA County formulary`,
          severity: 'error',
          context: { protocolCode: code },
        });
      }
    }
  }

  private checkMedicationContext(
    medications: string[],
    protocolCodes: string[],
    warnings: ValidationWarning[]
  ): void {
    if (medications.length > 0 && protocolCodes.length === 0) {
      warnings.push({
        code: 'MEDICATION_WITHOUT_PROTOCOL',
        message: 'Medication query should include clinical context for accurate guidance',
        severity: 'warning',
        context: { medications },
      });
    }
  }

  private checkUnauthorizedMedications(
    medications: string[],
    warnings: ValidationWarning[]
  ): void {
    for (const med of medications) {
      if (!isAuthorizedMedication(med)) {
        warnings.push({
          code: 'UNAUTHORIZED_MEDICATION_QUERY',
          message: `"${med}" is not in LA County formulary - response may suggest alternatives`,
          severity: 'warning',
          context: { medication: med },
        });
      }
    }
  }

  /**
   * STAGE 2: During-Retrieval Validation
   * Validates protocols retrieved from database
   */
  async validateRetrievedProtocols(protocols: Protocol[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (protocols.length === 0) {
      warnings.push({
        code: 'NO_PROTOCOLS_RETRIEVED',
        message: 'No protocols found - query may be too specific or contain errors',
        severity: 'warning',
      });
      return { valid: true, errors, warnings };
    }

    for (const protocol of protocols) {
      // 1. Check protocol version
      if (!protocol.is_current) {
        errors.push({
          code: 'DEPRECATED_PROTOCOL',
          message: `Protocol ${protocol.tp_code} is not current version`,
          severity: 'critical',
          context: { protocol: protocol.tp_code },
        });
      }

      // 2. Verify effective dates
      const now = new Date();
      const effectiveDate = new Date(protocol.effective_date);

      if (effectiveDate > now) {
        errors.push({
          code: 'PROTOCOL_NOT_EFFECTIVE',
          message: `Protocol ${protocol.tp_code} is not yet effective`,
          severity: 'error',
          context: {
            protocol: protocol.tp_code,
            effectiveDate: protocol.effective_date,
          },
        });
      }

      if (protocol.expiration_date) {
        const expirationDate = new Date(protocol.expiration_date);
        if (expirationDate < now) {
          errors.push({
            code: 'PROTOCOL_EXPIRED',
            message: `Protocol ${protocol.tp_code} has expired`,
            severity: 'critical',
            context: {
              protocol: protocol.tp_code,
              expirationDate: protocol.expiration_date,
            },
          });
        }
      }

      // 3. Check completeness
      if (!protocol.full_text || protocol.full_text.length < 50) {
        errors.push({
          code: 'INCOMPLETE_PROTOCOL',
          message: `Protocol ${protocol.tp_code} has insufficient content`,
          severity: 'critical',
          context: { protocol: protocol.tp_code },
        });
      }

      // 4. Validate required fields
      if (!protocol.tp_name || protocol.tp_name.trim() === '') {
        errors.push({
          code: 'MISSING_PROTOCOL_NAME',
          message: `Protocol ${protocol.tp_code} has no name`,
          severity: 'error',
          context: { protocol: protocol.tp_code },
        });
      }

      // 5. Check for critical warnings
      if (protocol.warnings && protocol.warnings.length > 0) {
        warnings.push({
          code: 'CRITICAL_WARNINGS_PRESENT',
          message: `Protocol ${protocol.tp_code} has ${protocol.warnings.length} critical warnings`,
          severity: 'warning',
          context: {
            protocol: protocol.tp_code,
            warnings: protocol.warnings,
          },
        });
      }
    }

    // 6. Detect conflicts between protocols
    const conflicts = this.detectProtocolConflicts(protocols);
    if (conflicts.length > 0) {
      warnings.push({
        code: 'PROTOCOL_CONFLICTS',
        message: 'Multiple protocols with potentially conflicting guidance',
        severity: 'warning',
        context: { conflicts },
      });
    }

    return {
      valid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings,
    };
  }

  /**
   * STAGE 3: Pre-Response Validation
   * Validates LLM context before response generation
   */
  async validateLLMContext(context: string, protocols: Protocol[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Verify all citations exist in retrieved protocols
    const citations = this.extractProtocolCodes(context);
    const protocolCodes = new Set(protocols.map(p => p.tp_code));

    for (const citation of citations) {
      if (!protocolCodes.has(citation)) {
        errors.push({
          code: 'UNRETRIEVED_CITATION',
          message: `Context references protocol ${citation} not in retrieved protocols`,
          severity: 'error',
          context: { citation, retrievedProtocols: Array.from(protocolCodes) },
        });
      }
    }

    // 2. Validate medication mentions
    const medValidation = validateMedications(context);
    medValidation.errors.forEach(error => {
      errors.push({
        code: 'CONTEXT_MEDICATION_ERROR',
        message: error,
        severity: 'critical',
        context: { contextSource: 'llm_context' },
      });
    });

    medValidation.warnings.forEach(warning => {
      warnings.push({
        code: 'CONTEXT_MEDICATION_WARNING',
        message: warning,
        severity: 'warning',
        context: { contextSource: 'llm_context' },
      });
    });

    // 3. Extract and validate medication doses
    const medicationDoses = this.extractMedicationDoses(context);
    for (const dose of medicationDoses) {
      const doseValidation = this.validateMedicationDose(dose);
      if (!doseValidation.valid) {
        errors.push(...doseValidation.errors);
        warnings.push(...doseValidation.warnings);
      }
    }

    // 4. Check for time-sensitive protocols
    const timeSensitive = protocols.filter(p =>
      p.warnings?.some(w =>
        w.toLowerCase().includes('time') ||
        w.toLowerCase().includes('urgent') ||
        w.toLowerCase().includes('immediate')
      )
    );

    if (timeSensitive.length > 0) {
      warnings.push({
        code: 'TIME_SENSITIVE_PROTOCOL',
        message: 'Context includes time-sensitive protocols - emphasize urgency in response',
        severity: 'warning',
        context: {
          protocols: timeSensitive.map(p => p.tp_code),
        },
      });
    }

    // 5. Verify base contact requirements are included
    const baseContactRequired = protocols.filter(p => p.base_contact_required);
    if (baseContactRequired.length > 0) {
      const hasBaseContactMention = /base\s+hospital/i.test(context);
      if (!hasBaseContactMention) {
        errors.push({
          code: 'MISSING_BASE_CONTACT',
          message: 'Base Hospital contact required but not mentioned in context',
          severity: 'error',
          context: {
            protocols: baseContactRequired.map(p => p.tp_code),
          },
        });
      }
    }

    return {
      valid: errors.filter(e => e.severity === 'critical' || e.severity === 'error').length === 0,
      errors,
      warnings,
    };
  }

  /**
   * STAGE 4: Post-Response Validation
   * Validates final response for accuracy and safety
   */
  async validateResponse(response: string, sourceProtocols: Protocol[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Cross-reference citations
    const responseCitations = this.extractProtocolCodes(response);
    const sourceProtocolCodes = new Set(sourceProtocols.map(p => p.tp_code));

    for (const citation of responseCitations) {
      if (!sourceProtocolCodes.has(citation)) {
        errors.push({
          code: 'HALLUCINATED_CITATION',
          message: `Response cites protocol ${citation} not in source protocols`,
          severity: 'critical',
          context: { citation, sourceProtocols: Array.from(sourceProtocolCodes) },
        });
      }
    }

    // 2. Validate medication formulary compliance
    const medValidation = validateMedications(response);
    medValidation.errors.forEach(error => {
      errors.push({
        code: 'RESPONSE_MEDICATION_ERROR',
        message: error,
        severity: 'critical',
        context: { responseSource: 'llm_output' },
      });
    });

    medValidation.warnings.forEach(warning => {
      warnings.push({
        code: 'RESPONSE_MEDICATION_WARNING',
        message: warning,
        severity: 'warning',
        context: { responseSource: 'llm_output' },
      });
    });

    // 3. Validate medication doses in response
    const responseMeds = this.extractMedicationDoses(response);
    for (const med of responseMeds) {
      const doseValidation = this.validateMedicationDose(med);
      if (!doseValidation.valid) {
        errors.push(...doseValidation.errors);
        warnings.push(...doseValidation.warnings);
      }
    }

    // 4. Check for contradictions
    const contradictions = this.detectContradictions(response);
    if (contradictions.length > 0) {
      errors.push({
        code: 'RESPONSE_CONTRADICTIONS',
        message: 'Response contains contradictory information',
        severity: 'error',
        context: { contradictions },
      });
    }

    // 5. Validate protocol citations match protocol names
    const citationValidation = validateProtocolCitations(response);
    citationValidation.errors.forEach(error => {
      errors.push({
        code: 'INVALID_PROTOCOL_CITATION',
        message: error,
        severity: 'error',
        context: { responseSource: 'llm_output' },
      });
    });

    // 6. Check for missing critical elements
    for (const protocol of sourceProtocols) {
      if (protocol.base_contact_required) {
        const baseContactMentioned = /base\s+hospital/i.test(response);
        if (!baseContactMentioned) {
          errors.push({
            code: 'MISSING_BASE_CONTACT_REQUIREMENT',
            message: `Response missing Base Hospital contact requirement for ${protocol.tp_code}`,
            severity: 'critical',
            context: { protocol: protocol.tp_code },
          });
        }
      }

      // Check for contraindications
      if (protocol.contraindications && protocol.contraindications.length > 0) {
        const contraindMentioned = /contraindication/i.test(response);
        if (!contraindMentioned) {
          warnings.push({
            code: 'CONTRAINDICATIONS_NOT_MENTIONED',
            message: `Protocol ${protocol.tp_code} has contraindications that may not be mentioned`,
            severity: 'warning',
            context: {
              protocol: protocol.tp_code,
              contraindications: protocol.contraindications,
            },
          });
        }
      }
    }

    return {
      valid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings,
    };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Extract protocol codes from text (TP-1210, 1210, 1210-P, etc.)
   */
  private extractProtocolCodes(text: string): string[] {
    const regex = /\b(?:TP-?)?(\d{4}(?:-P)?)\b/gi;
    const matches = Array.from(text.matchAll(regex));
    const codes = new Set(matches.map(m => m[1].toUpperCase()));
    return Array.from(codes);
  }

  /**
   * Extract medication names from text
   */
  private extractMedications(text: string): string[] {
    const medications = [
      'aspirin', 'nitroglycerin', 'epinephrine', 'albuterol',
      'atropine', 'amiodarone', 'adenosine', 'lidocaine',
      'morphine', 'fentanyl', 'ketorolac', 'acetaminophen',
      'midazolam', 'ondansetron', 'diphenhydramine',
      'naloxone', 'glucagon', 'calcium chloride', 'calcium gluconate',
      'dextrose', 'sodium bicarbonate', 'magnesium sulfate',
      'oxytocin', 'activated charcoal', 'tranexamic acid',
      'norepinephrine', 'dopamine',
    ];
    const found = medications.filter(med => text.toLowerCase().includes(med));
    return Array.from(new Set(found));
  }

  /**
   * Detect if query is too vague
   */
  private isVagueQuery(query: string): boolean {
    const vagueTerms = ['pain', 'sick', 'hurt', 'bad', 'help', 'what', 'how'];
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const vagueCount = words.filter(w => vagueTerms.includes(w)).length;
    return words.length <= 3 || vagueCount >= words.length / 2;
  }

  /**
   * Normalize query (fix typos, expand abbreviations)
   */
  private normalizeQuery(query: string): string {
    const normalizations: Record<string, string> = {
      'cant breathe': "can't breathe",
      'cant breath': "can't breathe",
      'sob': 'shortness of breath',
      'loc': 'loss of consciousness',
      'ams': 'altered mental status',
      'mvc': 'motor vehicle collision',
      'gcs': 'glasgow coma scale',
      'cpr': 'cardiac arrest',
      'vfib': 'ventricular fibrillation',
      'vtach': 'ventricular tachycardia',
      'stemi': 'st-elevation myocardial infarction',
      'nstemi': 'non-st-elevation myocardial infarction',
      'copd': 'chronic obstructive pulmonary disease',
      'chf': 'congestive heart failure',
      'mi': 'myocardial infarction',
      'cva': 'cerebrovascular accident',
      'tia': 'transient ischemic attack',
    };

    let normalized = query.toLowerCase();
    for (const [from, to] of Object.entries(normalizations)) {
      const regex = new RegExp(`\\b${from}\\b`, 'gi');
      normalized = normalized.replace(regex, to);
    }
    return normalized;
  }

  /**
   * Detect conflicts between protocols
   */
  private detectProtocolConflicts(protocols: Protocol[]): string[] {
    const conflicts: string[] = [];

    // Check for multiple protocols with different base contact requirements
    const baseContactRequired = protocols.filter(p => p.base_contact_required);
    const baseContactNotRequired = protocols.filter(p => !p.base_contact_required);

    if (baseContactRequired.length > 0 && baseContactNotRequired.length > 0) {
      conflicts.push(
        `Mixed base contact requirements: ${baseContactRequired.map(p => p.tp_code).join(', ')} require base contact, ` +
        `but ${baseContactNotRequired.map(p => p.tp_code).join(', ')} do not`
      );
    }

    return conflicts;
  }

  /**
   * Extract medication doses from text
   */
  private extractMedicationDoses(text: string): MedicationDose[] {
    const doses: MedicationDose[] = [];

    // Pattern: "medication dose unit route"
    // Example: "epinephrine 1 mg IV" or "fentanyl 50 mcg IV"
    const pattern = /\b([\w\s]+?)\s+(\d+(?:\.\d+)?)\s*(mg|mcg|g|mEq|units?)(?:\/kg)?\s+(IV|IM|PO|SL|IN|NEB)/gi;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, medName, doseValue, unit, route] = match;
      const medication = medName.trim().toLowerCase();

      // Check if it's a known medication
      if (this.extractMedications(medication).length > 0) {
        doses.push({
          name: normalizeToGeneric(medication),
          dose: `${doseValue} ${unit}`,
          unit,
          route,
          min: Number.parseFloat(doseValue),
          max: Number.parseFloat(doseValue),
        });
      }
    }

    return doses;
  }

  /**
   * Validate medication dose against LA County ranges
   */
  private validateMedicationDose(dose: MedicationDose): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!dose.dose || !dose.route) {
      return { valid: true, errors, warnings };
    }

    // Find matching dose range
    const matchingRanges = MEDICATION_DOSE_RANGES.filter(
      range =>
        range.medication === dose.name.toLowerCase() &&
        range.route.toUpperCase() === dose.route?.toUpperCase()
    );

    if (matchingRanges.length === 0) {
      // No range found - may be valid but we can't verify
      warnings.push({
        code: 'DOSE_RANGE_UNKNOWN',
        message: `No dose range defined for ${dose.name} ${dose.route}`,
        severity: 'warning',
        context: { medication: dose.name, route: dose.route },
      });
      return { valid: true, errors, warnings };
    }

    // Check each range (adult vs pediatric)
    let withinRange = false;

    for (const range of matchingRanges) {
      if (dose.min && dose.max) {
        if (dose.min >= range.minDose && dose.max <= range.maxDose) {
          withinRange = true;
          break;
        }
      }
    }

    if (!withinRange && dose.min && dose.max) {
      const range = matchingRanges[0];
      errors.push({
        code: 'DOSE_OUT_OF_RANGE',
        message: `Dose ${dose.dose} for ${dose.name} ${dose.route} outside LA County range (${range.minDose}-${range.maxDose} ${range.unit})`,
        severity: 'critical',
        context: {
          medication: dose.name,
          route: dose.route,
          dose: dose.dose,
          validRange: `${range.minDose}-${range.maxDose} ${range.unit}`,
        },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Detect contradictions in text
   */
  private detectContradictions(text: string): string[] {
    const contradictions: string[] = [];

    // Check for conflicting medication instructions
    if (/\b(give|administer)/gi.test(text) && /\b(do\s+not|avoid|contraindicated)/gi.test(text)) {
      // More specific check for same medication
      const medications = this.extractMedications(text);
      for (const med of medications) {
        const givePattern = new RegExp(`\\b(give|administer)\\s+${med}`, 'i');
        const avoidPattern = new RegExp(`\\b(do\\s+not|avoid|contraindicated).*${med}`, 'i');
        if (givePattern.test(text) && avoidPattern.test(text)) {
          contradictions.push(`Contradictory medication instructions for ${med}`);
        }
      }
    }

    // Check for conflicting base contact instructions
    const hasContactBase = /\b(contact|call)\s+base\s+hospital/gi.test(text);
    const hasNoContactBase = /\b(do\s+not|no\s+need\s+to)\s+(contact|call)\s+base/gi.test(text);
    if (hasContactBase && hasNoContactBase) {
      contradictions.push('Contradictory base hospital contact instructions');
    }

    return contradictions;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let pipelineInstance: ProtocolValidationPipeline | null = null;

/**
 * Get singleton validation pipeline instance
 */
export function getValidationPipeline(): ProtocolValidationPipeline {
  if (!pipelineInstance) {
    pipelineInstance = new ProtocolValidationPipeline();
  }
  return pipelineInstance;
}

/**
 * Reset validation pipeline instance (for testing)
 */
export function resetValidationPipeline(): void {
  pipelineInstance = null;
}
