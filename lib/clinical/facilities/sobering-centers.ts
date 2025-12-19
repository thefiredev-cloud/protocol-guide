/**
 * LA County Sobering Centers
 *
 * Sobering Centers are designated to receive 9-1-1 patients with uncomplicated
 * alcohol intoxication from TAD-approved provider agencies.
 *
 * Only TAD-approved units can transport directly to Sobering Centers.
 * Patient must meet Ref 528.1 medical clearance criteria:
 * - Primary issue is uncomplicated alcohol intoxication
 * - Vitals within defined ranges
 * - GCS threshold met
 * - No head trauma
 * - No significant medical complaints
 * - No pregnancy, seizures, or co-ingestants
 *
 * Reference: LA County EMS Agency Ref 501 - Hospital Directory (Page 9)
 * Reference: LA County EMS Agency Ref 528 - Intoxicated (Alcohol) Patient Destination
 * Reference: LA County EMS Agency Ref 528.1 - Sobering Center Medical Clearance Criteria
 *
 * Effective: 10-01-2025
 */

import type { SoberingCenter, FacilityDataMetadata } from "./types";

/**
 * Metadata for the Sobering Center data source.
 */
export const SOBERING_CENTER_DATA_METADATA: FacilityDataMetadata = {
  refNumber: "528",
  effectiveDate: "2025-10-01",
  revisedDate: "2025-10-01",
  lastUpdated: "2025-01-01",
};

/**
 * All designated Sobering Centers in LA County.
 * Data from Ref 501 page 9 and Ref 528.
 */
export const SOBERING_CENTERS: SoberingCenter[] = [
  {
    id: "SC-MLK",
    name: "Respite & Sobering Center - MLK Campus",
    address: "12021 Wilmington Ave., Building 18, Suite 102, Los Angeles, CA 90059",
    phone: "(310) 365-7414",
  },
];

/**
 * Get all Sobering Centers.
 */
export function getAllSoberingCenters(): SoberingCenter[] {
  return SOBERING_CENTERS;
}

/**
 * Get total count of Sobering Centers.
 */
export function getSoberingCenterCount(): number {
  return SOBERING_CENTERS.length;
}
