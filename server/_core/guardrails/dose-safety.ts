/**
 * Medication Dose Safety Validator
 * 
 * CRITICAL: This module validates medication doses to prevent dangerous errors.
 * All AI-suggested doses should be validated against known safe ranges.
 * 
 * This is a SAFETY NET, not a replacement for clinical judgment.
 * When in doubt, contact medical control.
 */

import { getMedicationRange, extractMedicationsFromText, type MedicationSafeRange } from './dose-ranges';

export interface DoseValidation {
  medication: string;
  dose: number;
  unit: string;
  route?: string;
  patientType: 'adult' | 'pediatric';
  weightKg?: number;
}

export interface DoseSafetyResult {
  isValid: boolean;
  severity: 'safe' | 'warning' | 'danger' | 'blocked';
  message: string;
  suggestion?: string;
  medicationRange?: MedicationSafeRange;
  calculatedDose?: number;
  flags: DoseSafetyFlag[];
}

export interface DoseSafetyFlag {
  type: 'dose_too_high' | 'dose_too_low' | 'weight_required' | 'adult_dose_for_pediatric' | 
        'pediatric_dose_for_adult' | 'route_mismatch' | 'contraindication' | 'unknown_medication';
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

/**
 * Validate a single dose against safe ranges
 */
export function validateDose(validation: DoseValidation): DoseSafetyResult {
  const flags: DoseSafetyFlag[] = [];
  
  // Get medication range
  const range = getMedicationRange(validation.medication);
  
  if (!range) {
    return {
      isValid: true, // Can't validate unknown medications - let it through with warning
      severity: 'warning',
      message: `Unknown medication "${validation.medication}" - cannot validate dose`,
      flags: [{
        type: 'unknown_medication',
        message: `Medication "${validation.medication}" not in safety database. Verify dose manually.`,
        severity: 'warning',
      }],
    };
  }
  
  const { dose, patientType, weightKg, route } = validation;
  
  // Get appropriate range based on patient type
  if (patientType === 'pediatric') {
    if (!range.pediatric) {
      return {
        isValid: true,
        severity: 'warning',
        message: `No pediatric dosing guidelines for ${range.name}`,
        medicationRange: range,
        flags: [{
          type: 'unknown_medication',
          message: 'Pediatric dosing not defined - verify with protocol or medical control',
          severity: 'warning',
        }],
      };
    }
    
    // Pediatric doses require weight
    if (!weightKg) {
      return {
        isValid: false,
        severity: 'warning',
        message: `Weight required for pediatric dosing of ${range.name}`,
        medicationRange: range,
        suggestion: 'Please confirm patient weight for accurate dose calculation',
        flags: [{
          type: 'weight_required',
          message: 'Weight-based dosing requires patient weight',
          severity: 'warning',
        }],
      };
    }
    
    // Calculate expected dose range
    const minExpected = range.pediatric.minDosePerKg * weightKg;
    const maxExpected = Math.min(
      range.pediatric.maxDosePerKg * weightKg,
      range.pediatric.maxTotalDose
    );
    
    // Check if dose seems like an adult dose (common error)
    if (range.adult && dose >= range.adult.minDose * 0.8) {
      flags.push({
        type: 'adult_dose_for_pediatric',
        message: `⚠️ ALERT: ${dose}${validation.unit} appears to be an adult dose given to pediatric patient`,
        severity: 'danger',
      });
    }
    
    // Validate against range
    if (dose > maxExpected * 1.5) {
      return {
        isValid: false,
        severity: 'blocked',
        message: `🚫 BLOCKED: ${dose}${validation.unit} of ${range.name} exceeds safe pediatric max (${maxExpected.toFixed(2)}${range.pediatric.unit} for ${weightKg}kg)`,
        medicationRange: range,
        calculatedDose: maxExpected,
        suggestion: `Max dose for ${weightKg}kg patient: ${maxExpected.toFixed(2)}${range.pediatric.unit}`,
        flags: [
          ...flags,
          {
            type: 'dose_too_high',
            message: `Dose ${(dose / maxExpected * 100).toFixed(0)}% above maximum safe dose`,
            severity: 'danger',
          },
        ],
      };
    }
    
    if (dose > maxExpected) {
      return {
        isValid: true,
        severity: 'warning',
        message: `⚠️ WARNING: ${dose}${validation.unit} of ${range.name} may be high for ${weightKg}kg pediatric patient`,
        medicationRange: range,
        calculatedDose: maxExpected,
        suggestion: `Recommended max: ${maxExpected.toFixed(2)}${range.pediatric.unit}. Verify with protocol.`,
        flags: [
          ...flags,
          {
            type: 'dose_too_high',
            message: 'Dose exceeds calculated maximum',
            severity: 'warning',
          },
        ],
      };
    }
    
    if (dose < minExpected * 0.5) {
      flags.push({
        type: 'dose_too_low',
        message: `Dose may be subtherapeutic (expected min: ${minExpected.toFixed(2)}${range.pediatric.unit})`,
        severity: 'info',
      });
    }
    
    return {
      isValid: true,
      severity: flags.length > 0 ? 'warning' : 'safe',
      message: `✓ ${dose}${validation.unit} of ${range.name} is within safe pediatric range for ${weightKg}kg patient`,
      medicationRange: range,
      calculatedDose: dose,
      flags,
    };
  }
  
  // Adult dosing
  const adultRange = range.adult;
  
  // Check if dose seems like a pediatric dose for an adult
  if (range.pediatric && dose < adultRange.minDose * 0.5) {
    flags.push({
      type: 'pediatric_dose_for_adult',
      message: `⚠️ ALERT: ${dose}${validation.unit} may be a pediatric dose given to adult patient`,
      severity: 'warning',
    });
  }
  
  // Check route if provided
  if (route && adultRange.routes.length > 0) {
    const normalizedRoute = route.toUpperCase();
    if (!adultRange.routes.includes(normalizedRoute)) {
      flags.push({
        type: 'route_mismatch',
        message: `Route "${route}" not standard for ${range.name}. Expected: ${adultRange.routes.join(', ')}`,
        severity: 'warning',
      });
    }
  }
  
  // Validate against adult range
  const maxAllowed = adultRange.maxSingleDose || adultRange.maxDose;
  
  if (dose > maxAllowed * 2) {
    return {
      isValid: false,
      severity: 'blocked',
      message: `🚫 BLOCKED: ${dose}${validation.unit} of ${range.name} is dangerously high (max: ${maxAllowed}${adultRange.unit})`,
      medicationRange: range,
      suggestion: `Maximum safe dose: ${maxAllowed}${adultRange.unit}`,
      flags: [
        ...flags,
        {
          type: 'dose_too_high',
          message: `Dose ${(dose / maxAllowed * 100).toFixed(0)}% above maximum`,
          severity: 'danger',
        },
      ],
    };
  }
  
  if (dose > maxAllowed) {
    return {
      isValid: true,
      severity: 'warning',
      message: `⚠️ WARNING: ${dose}${validation.unit} of ${range.name} exceeds typical max dose (${maxAllowed}${adultRange.unit})`,
      medicationRange: range,
      suggestion: `Verify dose with protocol. Typical max: ${maxAllowed}${adultRange.unit}`,
      flags: [
        ...flags,
        {
          type: 'dose_too_high',
          message: 'Dose exceeds typical maximum',
          severity: 'warning',
        },
      ],
    };
  }
  
  if (dose < adultRange.minDose * 0.5) {
    flags.push({
      type: 'dose_too_low',
      message: `Dose may be subtherapeutic (typical min: ${adultRange.minDose}${adultRange.unit})`,
      severity: 'info',
    });
  }
  
  return {
    isValid: true,
    severity: flags.length > 0 ? 'warning' : 'safe',
    message: `✓ ${dose}${validation.unit} of ${range.name} is within safe adult range`,
    medicationRange: range,
    calculatedDose: dose,
    flags,
  };
}

/**
 * Check dose safety from AI response text
 * Extracts medications and doses, validates each one
 */
export function checkDoseSafety(
  responseText: string,
  patientType: 'adult' | 'pediatric' = 'adult',
  weightKg?: number
): DoseSafetyResult[] {
  const results: DoseSafetyResult[] = [];
  
  // Extract medications mentioned
  const medications = extractMedicationsFromText(responseText);
  
  // Regex patterns for dose extraction
  const dosePatterns = [
    // "0.3 mg" or "0.3mg"
    /(\d+\.?\d*)\s*(mg|mcg|g|mEq|units?|mL)\b/gi,
    // "1-2 mg" (range)
    /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*(mg|mcg|g|mEq|units?|mL)\b/gi,
    // "1mg/kg"
    /(\d+\.?\d*)\s*(mg|mcg|g)\/kg\b/gi,
  ];
  
  // For each medication found, try to find associated doses
  for (const medication of medications) {
    const range = getMedicationRange(medication);
    if (!range) continue;
    
    // Find the medication in text and look for nearby doses
    const medRegex = new RegExp(
      `(${range.name}|${range.aliases.join('|')})\\s*:?\\s*(\\d+\\.?\\d*)\\s*(mg|mcg|g|mEq|units?|mL)`,
      'gi'
    );
    
    let match;
    while ((match = medRegex.exec(responseText)) !== null) {
      const dose = parseFloat(match[2]);
      const unit = match[3].toLowerCase();
      
      // Validate this dose
      const result = validateDose({
        medication,
        dose,
        unit,
        patientType,
        weightKg,
      });
      
      results.push(result);
    }
    
    // If no direct match, still check if medication is mentioned with concerning doses
    if (!results.find(r => r.medicationRange?.name === range.name)) {
      // Generic dose extraction near medication mention
      const contextRegex = new RegExp(
        `${range.name}[^.]*?(\\d+\\.?\\d*)\\s*(mg|mcg|g|mEq|units?|mL)`,
        'gi'
      );
      
      while ((match = contextRegex.exec(responseText)) !== null) {
        const dose = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        results.push(validateDose({
          medication,
          dose,
          unit,
          patientType,
          weightKg,
        }));
      }
    }
  }
  
  return results;
}

/**
 * Get the overall safety status from multiple dose checks
 */
export function getOverallDoseSafety(results: DoseSafetyResult[]): {
  status: 'safe' | 'warning' | 'danger' | 'blocked';
  blockedMedications: string[];
  warnings: string[];
} {
  const blockedMedications: string[] = [];
  const warnings: string[] = [];
  
  let worstSeverity: 'safe' | 'warning' | 'danger' | 'blocked' = 'safe';
  
  for (const result of results) {
    if (result.severity === 'blocked') {
      worstSeverity = 'blocked';
      if (result.medicationRange) {
        blockedMedications.push(result.medicationRange.name);
      }
    } else if (result.severity === 'danger' && worstSeverity !== 'blocked') {
      worstSeverity = 'danger';
    } else if (result.severity === 'warning' && worstSeverity === 'safe') {
      worstSeverity = 'warning';
    }
    
    if (result.severity !== 'safe') {
      warnings.push(result.message);
    }
  }
  
  return {
    status: worstSeverity,
    blockedMedications,
    warnings,
  };
}
