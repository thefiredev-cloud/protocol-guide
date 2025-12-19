import { isAuthorizedForProvider } from "@/lib/dosing/scope-registry";
import type {
  MedicationCalculationRequest,
  MedicationCalculationResult,
  MedicationCalculator,
  ProviderLevel,
} from "@/lib/dosing/types";

export class MedicationDosingManager {
  private readonly calculators = new Map<string, MedicationCalculator>();

  public register(calculator: MedicationCalculator) {
    this.calculators.set(calculator.id, calculator);
    for (const alias of calculator.aliases ?? []) {
      this.calculators.set(alias.toLowerCase(), calculator);
    }
  }

  public calculate(
    medicationId: string,
    request: MedicationCalculationRequest,
  ): MedicationCalculationResult | null {
    const key = medicationId.toLowerCase();
    const calculator = this.calculators.get(key);
    if (!calculator) return null;

    const result = calculator.calculate(request);

    // Apply scope of practice enforcement (default to Paramedic)
    const providerLevel = request.providerLevel ?? "Paramedic";
    return this.applyScope(result, calculator.id, providerLevel);
  }

  /**
   * Apply scope of practice enforcement to calculation result.
   * Never blocks - adds warnings if out of scope per LA County Policy 802/803.
   */
  private applyScope(
    result: MedicationCalculationResult,
    medicationId: string,
    providerLevel: ProviderLevel,
  ): MedicationCalculationResult {
    const scopeCheck = isAuthorizedForProvider(medicationId, providerLevel);

    if (!scopeCheck.authorized) {
      // Out of scope - add warning but still return result
      return {
        ...result,
        scopeAuthorized: false,
        scopeWarning: scopeCheck.warning,
        policyReference: scopeCheck.policyRef,
        warnings: [
          `SCOPE WARNING: ${scopeCheck.warning}`,
          ...result.warnings,
        ],
      };
    }

    if (scopeCheck.warning) {
      // Authorized with restrictions (e.g., EMT epinephrine auto-injector only)
      return {
        ...result,
        scopeAuthorized: true,
        scopeWarning: scopeCheck.warning,
        policyReference: scopeCheck.policyRef,
        warnings: [scopeCheck.warning, ...result.warnings],
      };
    }

    // Fully authorized, no warnings
    return {
      ...result,
      scopeAuthorized: true,
    };
  }

  public list(): MedicationCalculator[] {
    return Array.from(new Set(this.calculators.values()));
  }
}
