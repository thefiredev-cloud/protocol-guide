/**
 * LA County EMS Provider Levels
 * Per Policy 802 (EMT Scope) and Policy 803 (Paramedic Scope)
 */
export type ProviderLevel = "EMT" | "Paramedic";

export type BaseDoseUnit = "mg" | "mcg" | "g" | "mEq" | "units" | "mL" | "L" | "drops" | "puffs";

export type DoseUnit =
  | BaseDoseUnit
  | `${BaseDoseUnit}/kg`
  | `${BaseDoseUnit}/kg/min`
  | `${BaseDoseUnit}/kg/hr`
  | `${BaseDoseUnit}/m2`
  | `${BaseDoseUnit}/min`
  | `${BaseDoseUnit}/hr`;

export type Route =
  | "IM"
  | "IV"
  | "IO"
  | "PO"
  | "SL"
  | "IN"
  | "Neb"
  | "Topical"
  | "Rectal"
  | "SubQ"
  | "Buccal"
  | string;

export type SolutionConcentration = {
  amount: number;
  amountUnit: BaseDoseUnit;
  volume: number;
  volumeUnit: "mL" | "L";
  label?: string;
};

export type DoseAmount = {
  quantity: number;
  unit: DoseUnit;
  /**
   * When true the quantity represents a per-kilogram value and must be
   * multiplied by patient weight before administration.
   */
  perKg?: boolean;
  /** Optional hard maximum for a single administration. */
  maxQuantity?: number;
};

export type DoseRepeat = {
  intervalMinutes: number;
  maxRepeats?: number;
  criteria?: string;
};

export type MedicationDoseRecommendation = {
  label: string; // e.g., "Anaphylaxis", "Cardiac Arrest"
  route: Route;
  dose: DoseAmount;
  concentration?: SolutionConcentration;
  maxSingleDose?: DoseAmount;
  maxTotalDose?: DoseAmount;
  repeat?: DoseRepeat;
  administrationNotes?: string[];
  contraindications?: string[];
};

export type MedicationCalculationRequest = {
  patientAgeYears?: number;
  patientWeightKg?: number;
  systolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  scenario?: string; // e.g., "anaphylaxis", "bronchospasm"
  route?: Route;
  isPregnant?: boolean;
  contraindications?: string[];
  /** Provider level for scope of practice enforcement (default: Paramedic) */
  providerLevel?: ProviderLevel;
};

export type MedicationCalculationResult = {
  medicationId: string;
  medicationName: string;
  recommendations: MedicationDoseRecommendation[];
  warnings: string[];
  citations: string[];
  metadata?: Record<string, unknown>;
  /** Scope of practice enforcement (LA County Policy 802/803) */
  scopeWarning?: string;
  scopeAuthorized?: boolean;
  policyReference?: string;
};

export interface MedicationCalculator {
  id: string;
  name: string;
  aliases?: string[];
  categories?: string[];
  /** LA County authorized provider levels per Policy 802/803 */
  authorizedProviders?: ProviderLevel[];
  /** True if EMTs can administer (subset of Paramedic scope) */
  emtAuthorized?: boolean;
  calculate(request: MedicationCalculationRequest): MedicationCalculationResult;
}

// Legacy type aliases for backward compatibility with newer calculators
export type PatientContext = MedicationCalculationRequest;

export type DosingResult = {
  medication: string;
  indication: string;
  dose: string;
  route: string;
  concentration?: string;
  maxDose?: string;
  calculatedDose?: string;
  volume?: string;
  notes?: string;
  warnings?: string[];
  protocolReference?: string;
};


