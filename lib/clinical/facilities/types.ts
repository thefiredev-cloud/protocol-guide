/**
 * LA County EMS Facility Type Definitions
 *
 * Comprehensive type definitions for all facility types in LA County EMS system.
 * Based on LA County EMS Agency Reference No. 501 (Hospital Directory)
 * and related destination policies (Ref 512, 513, 521, 526, 528).
 *
 * Last Updated: 2025-01-XX (Ref 501 dated 09-15-25)
 */

/**
 * Geographic regions used for MCI assignments and destination routing.
 * Aligned with Ref 519.6 regional MCI maps.
 */
export type Region = "North" | "South" | "East" | "West" | "Central" | "OutOfCounty";

/**
 * Trauma center designation levels per Ref 506.
 */
export type TraumaLevel = "I" | "II";

/**
 * Comprehensive Stroke Center levels per Ref 521.
 */
export type CSCLevel = "I" | "II";

/**
 * Hospital/Facility entity representing a 9-1-1 receiving facility.
 * All boolean capability flags correspond to columns in Ref 501 Hospital Directory.
 */
export interface Facility {
  /** 3-letter hospital code (e.g., "CSM", "HGH", "UCL") */
  id: string;

  /** Full official hospital name */
  name: string;

  /** Abbreviated name for display */
  shortName: string;

  /** Street address */
  address: string;

  /** Main phone number */
  phone: string;

  /** Geographic region for MCI and destination routing */
  region: Region;

  // === Capability Flags (from Ref 501 columns) ===

  /** Is designated as a Base Hospital for online medical direction */
  isBaseHospital: boolean;

  /** Adult trauma center level (null if not a trauma center) */
  traumaLevel: TraumaLevel | null;

  /** Pediatric trauma center level (null if not a pediatric trauma center) */
  pediatricTraumaLevel: TraumaLevel | null;

  /** Has Pediatric Trauma Center (PTC) designation */
  hasPTC: boolean;

  /** Has Pediatric Medical Center (PMC) designation */
  hasPMC: boolean;

  /** Emergency Department Approved for Pediatrics */
  hasEDAP: boolean;

  /** Has perinatal services */
  hasPerinatal: boolean;

  /** Has Neonatal Intensive Care Unit */
  hasNICU: boolean;

  /** Is a STEMI Receiving Center (SRC) per Ref 513 */
  isSRC: boolean;

  /** Is an ECPR Receiving Center per Ref 321 (must also be SRC + Base Hospital) */
  isECPR: boolean;

  /** Is a Primary Stroke Center (PSC) per Ref 521 */
  isPSC: boolean;

  /** Is a Comprehensive Stroke Center (CSC) per Ref 521 */
  isCSC: boolean;

  /** CSC level if isCSC is true */
  cscLevel: CSCLevel | null;

  /** Is a designated Burn Center per Ref 512 */
  isBurnCenter: boolean;

  /** Has helipad for air transport */
  hasHelipad: boolean;

  /** Additional special services (e.g., "SART Center", "Hyperbaric Chamber") */
  specialServices: string[];
}

/**
 * Psychiatric Urgent Care Center (PUCC) for TAD program.
 * Per Ref 526 and Ref 501 page 9.
 * Only TAD-approved provider units can transport directly to PUCCs.
 */
export interface PUCC {
  /** Unique identifier */
  id: string;

  /** Full facility name */
  name: string;

  /** Street address */
  address: string;

  /** Phone number */
  phone: string;

  /**
   * Patient category accepted:
   * - "adults": Adults only (18+)
   * - "adolescents_and_adults": Adolescents 13+ and adults
   */
  patientCategory: "adults" | "adolescents_and_adults";
}

/**
 * Sobering Center for TAD program.
 * Per Ref 528 and Ref 501 page 9.
 * Only TAD-approved provider units can transport directly to Sobering Centers.
 * Patient must meet 528.1 medical clearance criteria.
 */
export interface SoberingCenter {
  /** Unique identifier */
  id: string;

  /** Full facility name */
  name: string;

  /** Street address */
  address: string;

  /** Phone number */
  phone: string;
}

/**
 * Query options for filtering facilities.
 */
export interface FacilityQueryOptions {
  /** Filter by region */
  region?: Region;

  /** Filter by base hospital status */
  isBaseHospital?: boolean;

  /** Filter by trauma level */
  traumaLevel?: TraumaLevel;

  /** Filter by pediatric trauma level */
  pediatricTraumaLevel?: TraumaLevel;

  /** Filter by STEMI capability */
  isSRC?: boolean;

  /** Filter by ECPR capability */
  isECPR?: boolean;

  /** Filter by stroke center type */
  strokeCenterType?: "PSC" | "CSC" | "any";

  /** Filter by burn center status */
  isBurnCenter?: boolean;

  /** Filter by pediatric capability (EDAP, PTC, or PMC) */
  hasPediatricCapability?: boolean;
}

/**
 * Reference metadata for tracking data source versions.
 */
export interface FacilityDataMetadata {
  /** Reference number (e.g., "501") */
  refNumber: string;

  /** Effective date of the reference */
  effectiveDate: string;

  /** Revision date of the reference */
  revisedDate: string;

  /** Date this data was last updated in the system */
  lastUpdated: string;
}
