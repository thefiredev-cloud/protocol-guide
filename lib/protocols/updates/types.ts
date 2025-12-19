/**
 * Treatment Protocol Update Types
 *
 * Type definitions for tracking protocol version changes
 * for the 1200 (Treatment Protocols) and 1300 (MCG) series.
 */

/**
 * Protocol category.
 */
export type ProtocolCategory =
  | "cardiac"
  | "respiratory"
  | "neurological"
  | "trauma"
  | "pediatric"
  | "obstetric"
  | "behavioral"
  | "environmental"
  | "toxicology"
  | "general_medical";

/**
 * Change type classification.
 */
export type ChangeType =
  | "addition" // New content added
  | "modification" // Existing content changed
  | "removal" // Content removed
  | "clarification" // Wording clarified, no clinical change
  | "dosing_change" // Medication dosing updated
  | "indication_change" // When medication is used
  | "contraindication_change" // New/removed contraindications
  | "procedure_change"; // Procedural steps changed

/**
 * Clinical impact level.
 */
export type ClinicalImpact = "high" | "medium" | "low" | "none";

/**
 * Protocol version metadata.
 */
export interface ProtocolVersion {
  tpCode: string;
  tpName: string;
  category: ProtocolCategory;
  version: number;
  effectiveDate: Date;
  revisionDate?: Date;
  supersedes?: string;
  supersededBy?: string;
  isCurrent: boolean;
}

/**
 * Individual change within a protocol update.
 */
export interface ProtocolChange {
  id?: string;
  tpCode: string;
  fromVersion: number;
  toVersion: number;
  changeType: ChangeType;
  section?: string;
  description: string;
  oldContent?: string;
  newContent?: string;
  clinicalImpact: ClinicalImpact;
  requiresTraining: boolean;
  citations?: string[];
  createdAt?: Date;
}

/**
 * MCG (Medication Cross-Reference) change.
 */
export interface MCGChange {
  id?: string;
  mcgNumber: string;
  medicationName: string;
  fromVersion: number;
  toVersion: number;
  changeType: ChangeType;
  field: "adult_dose" | "peds_dose" | "route" | "contraindication" | "indication" | "other";
  description: string;
  oldValue?: string;
  newValue?: string;
  clinicalImpact: ClinicalImpact;
  requiresTraining: boolean;
  effectiveDate: Date;
}

/**
 * Protocol update summary.
 */
export interface ProtocolUpdateSummary {
  tpCode: string;
  tpName: string;
  fromVersion: number;
  toVersion: number;
  effectiveDate: Date;
  totalChanges: number;
  highImpactChanges: number;
  changesRequiringTraining: number;
  changes: ProtocolChange[];
}

/**
 * Batch update (e.g., annual PCM revision).
 */
export interface ProtocolBatchUpdate {
  id: string;
  name: string;
  description?: string;
  effectiveDate: Date;
  announcedDate?: Date;
  protocolUpdates: ProtocolUpdateSummary[];
  mcgUpdates: MCGChange[];
  totalProtocolsAffected: number;
  totalMedicationsAffected: number;
}

/**
 * Query options for finding changes.
 */
export interface ChangeQueryOptions {
  tpCode?: string;
  category?: ProtocolCategory;
  changeType?: ChangeType;
  clinicalImpact?: ClinicalImpact;
  requiresTraining?: boolean;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}
