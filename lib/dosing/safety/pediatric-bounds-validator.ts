/**
 * Pediatric Bounds Validator
 * 
 * Addresses Michigan study findings: 35% pediatric dosing error rate.
 * High-error medications: Dextrose (75%), Glucagon (75%), Fentanyl (68%).
 * 
 * This validator enforces strict weight/age bounds to prevent calculation errors.
 */

import type { MedicationCalculationRequest, MedicationCalculationResult } from "@/lib/dosing/types";

export type WeightBounds = {
  minKg: number;
  maxKg: number;
  pediatricMaxKg?: number;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  warnings: string[];
};

export type PatientContext = {
  isPediatric?: boolean;
  isNeonate?: boolean;
};

export const DEFAULT_WEIGHT_BOUNDS: WeightBounds = {
  minKg: 1,
  maxKg: 300,
  pediatricMaxKg: 50,
};

export const PEDIATRIC_WEIGHT_BOUNDS: WeightBounds = {
  minKg: 0.5,
  maxKg: 50,
};

export const NEONATE_WEIGHT_BOUNDS: WeightBounds = {
  minKg: 0.5,
  maxKg: 10,
};

export class PediatricBoundsValidator {
  private readonly bounds: WeightBounds;

  constructor(bounds: WeightBounds = DEFAULT_WEIGHT_BOUNDS) {
    this.bounds = bounds;
  }

  public validateWeight(weightKg: number | undefined, context?: PatientContext): string | null {
    const basicError = this.validateBasicWeight(weightKg);
    if (basicError) return basicError;

    if (context?.isNeonate) return this.validateNeonateWeight(weightKg!);
    if (context?.isPediatric) return this.validatePediatricWeight(weightKg!);
    return this.validateGeneralWeight(weightKg!);
  }

  private validateBasicWeight(weightKg: number | undefined): string | null {
    if (weightKg === undefined) return "Patient weight is required for accurate dosing";
    if (weightKg <= 0) return "Weight must be greater than 0kg";
    return null;
  }

  private validateNeonateWeight(weightKg: number): string | null {
    const { minKg, maxKg } = NEONATE_WEIGHT_BOUNDS;
    if (weightKg < minKg || weightKg > maxKg) {
      return `Neonate weight must be between ${minKg}kg and ${maxKg}kg`;
    }
    return null;
  }

  private validatePediatricWeight(weightKg: number): string | null {
    const { minKg, maxKg } = PEDIATRIC_WEIGHT_BOUNDS;
    if (weightKg < minKg || weightKg > maxKg) {
      return `Pediatric weight must be between ${minKg}kg and ${maxKg}kg`;
    }
    return null;
  }

  private validateGeneralWeight(weightKg: number): string | null {
    if (weightKg < this.bounds.minKg || weightKg > this.bounds.maxKg) {
      return `Weight must be between ${this.bounds.minKg}kg and ${this.bounds.maxKg}kg`;
    }
    return null;
  }

  public validateRequest(request: MedicationCalculationRequest): ValidationResult {
    const isPediatric = this.isPediatric(request);
    const isNeonate = this.isNeonate(request);

    const weightError = this.validateWeight(request.patientWeightKg, { isPediatric, isNeonate });
    if (weightError) {
      return { isValid: false, error: weightError, warnings: [] };
    }

    const warnings = this.getEdgeCaseWarnings(request.patientWeightKg!, isPediatric, isNeonate);
    return { isValid: true, warnings };
  }

  private getEdgeCaseWarnings(weightKg: number, isPediatric: boolean, isNeonate: boolean): string[] {
    const warnings: string[] = [];

    if (weightKg < 3 && !isNeonate) {
      warnings.push("Very low weight (<3kg). Verify weight and consider neonatal protocols.");
    }
    if (isPediatric && weightKg > 40) {
      warnings.push("Weight >40kg with pediatric age. Consider adult dosing protocols.");
    }
    if (isNeonate && weightKg > 5) {
      warnings.push("Weight >5kg in neonate. Verify age and weight are correct.");
    }

    return warnings;
  }

  public isPediatric(request: MedicationCalculationRequest): boolean {
    const { patientAgeYears, patientWeightKg } = request;
    if (patientAgeYears !== undefined) return patientAgeYears < 12;
    if (patientWeightKg !== undefined) return patientWeightKg < 45;
    return false;
  }

  public isNeonate(request: MedicationCalculationRequest): boolean {
    const { patientAgeYears } = request;
    return patientAgeYears !== undefined && patientAgeYears < 0.083;
  }

  public isAdult(request: MedicationCalculationRequest): boolean {
    const { patientAgeYears, patientWeightKg } = request;
    return (patientAgeYears !== undefined && patientAgeYears >= 15) || 
           (patientWeightKg !== undefined && patientWeightKg >= 45);
  }

  public createErrorResult(
    medicationId: string,
    medicationName: string,
    error: string,
    citations: string[] = []
  ): MedicationCalculationResult {
    return {
      medicationId,
      medicationName,
      recommendations: [],
      warnings: [error],
      citations,
      metadata: { error: true, validationFailed: true },
    };
  }
}

/** Singleton instance for convenience */
export const boundsValidator = new PediatricBoundsValidator();
