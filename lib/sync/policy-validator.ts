/**
 * LA County EMS Policy Validator
 *
 * Validates scraped policies against LA County EMS rules:
 * - No RSI drugs (Ketamine, Etomidate, Rocuronium, Succinylcholine)
 * - No cricothyrotomy procedures
 * - Only approved formulary medications
 */

import {
  ScrapedPolicy,
  ValidationResult,
  ValidationError,
  MedicationCheck,
  ProcedureCheck,
  RSI_DRUGS,
  UNAUTHORIZED_PROCEDURES,
  APPROVED_FORMULARY
} from './types';

/**
 * Validate a scraped policy for LA County EMS compliance
 */
export function validatePolicy(policy: ScrapedPolicy): ValidationResult {
  const errors: ValidationError[] = [];
  const medications: MedicationCheck[] = [];
  const procedures: ProcedureCheck[] = [];

  // Validate medications
  for (const med of policy.medications) {
    const check = validateMedication(med, policy.content);
    medications.push(check);
    if (check.severity === 'critical' || check.severity === 'error') {
      errors.push({
        type: check.status === 'prohibited' ? 'rsi_drug_detected' : 'unauthorized_medication',
        severity: check.severity,
        message: check.message || `${med} validation failed`,
        location: `Policy ${policy.refNo}`,
        context: { medication: med, refNo: policy.refNo }
      });
    }
  }

  // Validate procedures
  for (const proc of policy.procedures) {
    const check = validateProcedure(proc);
    procedures.push(check);
    if (!check.authorized) {
      errors.push({
        type: 'unauthorized_procedure',
        severity: check.severity || 'critical',
        message: check.message || `${proc} is not authorized`,
        location: `Policy ${policy.refNo}`,
        context: { procedure: proc, refNo: policy.refNo }
      });
    }
  }

  // Additional content scans for hidden RSI drugs
  const rsiScan = scanForRSIDrugs(policy.content);
  for (const found of rsiScan) {
    if (!policy.medications.includes(found)) {
      errors.push({
        type: 'rsi_drug_detected',
        severity: 'critical',
        message: `CRITICAL: RSI drug "${found}" detected in content - NOT authorized in LA County EMS`,
        location: `Policy ${policy.refNo}`,
        context: { medication: found, refNo: policy.refNo }
      });
    }
  }

  // Scan for cricothyrotomy references
  const cricScan = scanForCricothyrotomy(policy.content);
  for (const found of cricScan) {
    if (!policy.procedures.includes(found)) {
      errors.push({
        type: 'unauthorized_procedure',
        severity: 'critical',
        message: `CRITICAL: Unauthorized procedure "${found}" detected - NOT performed in LA County EMS`,
        location: `Policy ${policy.refNo}`,
        context: { procedure: found, refNo: policy.refNo }
      });
    }
  }

  return {
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    medications,
    procedures
  };
}

/**
 * Validate a single medication
 */
function validateMedication(medication: string, content: string): MedicationCheck {
  const normalizedMed = medication.toLowerCase().trim();

  // Check if it's an RSI drug (CRITICAL)
  if (RSI_DRUGS.has(normalizedMed)) {
    return {
      medication,
      status: 'prohibited',
      severity: 'critical',
      message: `CRITICAL: ${medication} is an RSI drug - NEVER authorized in LA County EMS`
    };
  }

  // Check if it's in the approved formulary
  if (APPROVED_FORMULARY.has(normalizedMed)) {
    // Extract dose if present
    const dose = extractDose(medication, content);
    return {
      medication,
      status: 'approved',
      dose: dose || undefined,
      message: `${medication} is on the approved formulary`
    };
  }

  // Unknown medication - needs review
  return {
    medication,
    status: 'unknown',
    severity: 'warning',
    message: `${medication} not found in approved formulary - verify authorization`
  };
}

/**
 * Validate a single procedure
 */
function validateProcedure(procedure: string): ProcedureCheck {
  const normalizedProc = procedure.toLowerCase().trim();

  // Check if it's an unauthorized procedure
  for (const unauthorized of UNAUTHORIZED_PROCEDURES) {
    if (normalizedProc.includes(unauthorized) || unauthorized.includes(normalizedProc)) {
      return {
        procedure,
        authorized: false,
        severity: 'critical',
        message: `CRITICAL: ${procedure} is NOT authorized in LA County EMS`
      };
    }
  }

  // Procedure is authorized (or at least not on the blocked list)
  return {
    procedure,
    authorized: true,
    message: `${procedure} is an authorized procedure`
  };
}

/**
 * Scan content for RSI drugs that might have been missed
 */
function scanForRSIDrugs(content: string): string[] {
  const found: string[] = [];
  const lowerContent = content.toLowerCase();

  // RSI drug patterns with common variations
  const rsiPatterns: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\bsuccinylcholine\b/gi, name: 'succinylcholine' },
    { pattern: /\bsux\b/gi, name: 'succinylcholine' },
    { pattern: /\banectine\b/gi, name: 'succinylcholine' },
    { pattern: /\brocuronium\b/gi, name: 'rocuronium' },
    { pattern: /\bzemuron\b/gi, name: 'rocuronium' },
    { pattern: /\bvecuronium\b/gi, name: 'vecuronium' },
    { pattern: /\bnorcuron\b/gi, name: 'vecuronium' },
    { pattern: /\bcisatracurium\b/gi, name: 'cisatracurium' },
    { pattern: /\bnimbex\b/gi, name: 'cisatracurium' },
    { pattern: /\betomidate\b/gi, name: 'etomidate' },
    { pattern: /\bamidate\b/gi, name: 'etomidate' },
    { pattern: /\bketamine\b/gi, name: 'ketamine' },
    { pattern: /\bketalar\b/gi, name: 'ketamine' },
    { pattern: /\bpropofol\b/gi, name: 'propofol' },
    { pattern: /\bdiprivan\b/gi, name: 'propofol' },
    { pattern: /\bparalytic\b/gi, name: 'paralytic agent' },
    { pattern: /\bneuromuscular block/gi, name: 'neuromuscular blocker' }
  ];

  for (const { pattern, name } of rsiPatterns) {
    if (pattern.test(content)) {
      if (!found.includes(name)) {
        found.push(name);
      }
    }
  }

  return found;
}

/**
 * Scan content for cricothyrotomy references
 */
function scanForCricothyrotomy(content: string): string[] {
  const found: string[] = [];

  const cricPatterns: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\bcricothyrotomy\b/gi, name: 'cricothyrotomy' },
    { pattern: /\bcricothyroidotomy\b/gi, name: 'cricothyroidotomy' },
    { pattern: /\bneedle cric\b/gi, name: 'needle cricothyrotomy' },
    { pattern: /\bsurgical cric\b/gi, name: 'surgical cricothyrotomy' },
    { pattern: /\bsurgical airway\b/gi, name: 'surgical airway' },
    { pattern: /\bcric kit\b/gi, name: 'cricothyrotomy kit' },
    { pattern: /\bpercutaneous airway\b/gi, name: 'percutaneous airway' }
  ];

  for (const { pattern, name } of cricPatterns) {
    if (pattern.test(content)) {
      if (!found.includes(name)) {
        found.push(name);
      }
    }
  }

  return found;
}

/**
 * Extract dose information from content
 */
function extractDose(medication: string, content: string): string | null {
  const lowerMed = medication.toLowerCase();
  const lowerContent = content.toLowerCase();

  // Find the medication in content and look for dose nearby
  const medIndex = lowerContent.indexOf(lowerMed);
  if (medIndex === -1) return null;

  // Look at text around the medication (200 chars after)
  const context = lowerContent.substring(medIndex, medIndex + 200);

  // Common dose patterns
  const dosePatterns = [
    /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?)\s*(?:\/\s*kg)?/i,
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml)/i
  ];

  for (const pattern of dosePatterns) {
    const match = context.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Validate all policies from a scrape result
 */
export function validateAllPolicies(policies: ScrapedPolicy[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  for (const policy of policies) {
    results.set(policy.refNo, validatePolicy(policy));
  }

  return results;
}

/**
 * Get summary of validation results
 */
export function getValidationSummary(results: Map<string, ValidationResult>): {
  totalPolicies: number;
  validPolicies: number;
  invalidPolicies: number;
  criticalErrors: number;
  warnings: number;
  rsiDrugsFound: string[];
  unauthorizedProcedures: string[];
} {
  let validPolicies = 0;
  let invalidPolicies = 0;
  let criticalErrors = 0;
  let warnings = 0;
  const rsiDrugsFound: string[] = [];
  const unauthorizedProcedures: string[] = [];

  for (const [refNo, result] of results) {
    if (result.valid) {
      validPolicies++;
    } else {
      invalidPolicies++;
    }

    for (const error of result.errors) {
      if (error.severity === 'critical') {
        criticalErrors++;
        if (error.type === 'rsi_drug_detected' && error.context?.medication) {
          const med = error.context.medication as string;
          if (!rsiDrugsFound.includes(med)) {
            rsiDrugsFound.push(med);
          }
        }
        if (error.type === 'unauthorized_procedure' && error.context?.procedure) {
          const proc = error.context.procedure as string;
          if (!unauthorizedProcedures.includes(proc)) {
            unauthorizedProcedures.push(proc);
          }
        }
      } else if (error.severity === 'warning') {
        warnings++;
      }
    }
  }

  return {
    totalPolicies: results.size,
    validPolicies,
    invalidPolicies,
    criticalErrors,
    warnings,
    rsiDrugsFound,
    unauthorizedProcedures
  };
}
