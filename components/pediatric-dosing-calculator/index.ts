/**
 * Medication Dosing Calculator Module
 * 
 * LA County EMS-specific medication dosing with safety guardrails.
 * Supports both pediatric and adult patients.
 * 
 * Features:
 * - Weight-based and fixed-dose calculations
 * - Contraindication alerts
 * - Drug interaction warnings
 * - Weight sanity checks by age
 * - Hard dose ceilings
 * - LA County protocol notes
 */

export { PediatricDosingCalculator } from './calculator';
export type { 
  PediatricMedication, 
  PediatricDosingResult,
  PatientType,
  WeightUnit,
  AlertLevel,
  GuardrailCheckResult,
  GuardrailAlert,
} from './types';
export { 
  PEDIATRIC_MEDICATIONS,
  getMedicationById,
  getMedicationsByPatientType,
  getMedicationsByIndication,
} from './medications';
export {
  runGuardrailChecks,
  checkWeightSanity,
  checkDrugInteractions,
  checkContraindications,
  getAvailableConditions,
  getAvailableMedicationClasses,
} from './guardrails';
