/**
 * LA County EMS Hospital Directory - Aggregated Exports
 *
 * Combines all regional hospital files into unified exports.
 * This file provides backwards-compatible exports for FacilityManager.
 *
 * Reference: LA County EMS Agency Ref 501 - Hospital Directory
 * Effective: 03-31-97, Revised: 09-15-25
 */

import type { Facility } from "../types";
import type { FacilityDataMetadata } from "../types";

import { NORTH_HOSPITALS } from "./hospitals-north";
import { SOUTH_HOSPITALS } from "./hospitals-south";
import { EAST_HOSPITALS } from "./hospitals-east";
import { WEST_HOSPITALS } from "./hospitals-west";
import { CENTRAL_HOSPITALS } from "./hospitals-central";
import { OUT_OF_COUNTY_HOSPITALS } from "./hospitals-out-of-county";

/**
 * Metadata for the hospital data source.
 */
export const HOSPITAL_DATA_METADATA: FacilityDataMetadata = {
  refNumber: "501",
  effectiveDate: "1997-03-31",
  revisedDate: "2025-09-15",
  lastUpdated: "2025-01-01",
};

/**
 * Complete list of LA County 9-1-1 receiving hospitals.
 * Aggregated from regional files, parsed from Ref 501 (09-15-25 revision).
 */
export const ALL_HOSPITALS: Facility[] = [
  ...NORTH_HOSPITALS,
  ...SOUTH_HOSPITALS,
  ...EAST_HOSPITALS,
  ...WEST_HOSPITALS,
  ...CENTRAL_HOSPITALS,
  ...OUT_OF_COUNTY_HOSPITALS,
];

/**
 * Base hospitals only (subset with isBaseHospital: true).
 * These provide online medical direction for paramedics.
 */
export const BASE_HOSPITALS = ALL_HOSPITALS.filter((h) => h.isBaseHospital);

/**
 * Get total count of hospitals in directory.
 */
export function getHospitalCount(): number {
  return ALL_HOSPITALS.length;
}

// Re-export regional arrays for direct access if needed
export {
  NORTH_HOSPITALS,
  SOUTH_HOSPITALS,
  EAST_HOSPITALS,
  WEST_HOSPITALS,
  CENTRAL_HOSPITALS,
  OUT_OF_COUNTY_HOSPITALS,
};
