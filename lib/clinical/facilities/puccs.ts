/**
 * LA County Psychiatric Urgent Care Centers (PUCCs)
 *
 * PUCCs are designated to receive 9-1-1 patients from TAD-approved provider agencies.
 * Only TAD-approved units can transport directly to PUCCs.
 * Patient must meet Ref 526.1 medical clearance criteria.
 *
 * Reference: LA County EMS Agency Ref 501 - Hospital Directory (Page 9)
 * Reference: LA County EMS Agency Ref 526 - Behavioral Patient Destination
 * Reference: LA County EMS Agency Ref 526.1 - PUCC Medical Clearance Criteria
 *
 * Effective: 10-01-2025
 */

import type { PUCC, FacilityDataMetadata } from "./types";

/**
 * Metadata for the PUCC data source.
 */
export const PUCC_DATA_METADATA: FacilityDataMetadata = {
  refNumber: "501",
  effectiveDate: "1997-03-31",
  revisedDate: "2025-09-15",
  lastUpdated: "2025-01-01",
};

/**
 * All designated Psychiatric Urgent Care Centers in LA County.
 * Data from Ref 501 page 9.
 */
export const PUCC_FACILITIES: PUCC[] = [
  // Star Behavioral Health locations
  {
    id: "STAR-LB",
    name: "Star Behavioral Health Psychiatric Urgent Care Center - Long Beach",
    address: "3210 Long Beach Blvd., Long Beach, CA 90807",
    phone: "(562) 548-6565",
    patientCategory: "adolescents_and_adults",
  },
  {
    id: "STAR-COI",
    name: "Star Behavioral Health Psychiatric Urgent Care Center - City of Industry",
    address: "18501 Gail Avenue Suite 100, City of Industry, CA 91748",
    phone: "(626) 626-4997",
    patientCategory: "adolescents_and_adults",
  },
  {
    id: "STAR-LAN",
    name: "Star Behavioral Health Psychiatric Urgent Care Center - Lancaster",
    address: "415 East Ave. I, Lancaster, CA 93535",
    phone: "(661) 522-6770",
    patientCategory: "adolescents_and_adults",
  },

  // Exodus Recovery Center locations
  {
    id: "EXODUS-EAST",
    name: "Exodus Recovery Center - Psychiatric Urgent Care - East Side",
    address: "1920 Marengo St., Los Angeles, CA 90033",
    phone: "(323) 276-6400",
    patientCategory: "adults",
  },
  {
    id: "EXODUS-WEST",
    name: "Exodus Recovery Center - Psychiatric Urgent Care - West Side",
    address: "11444 W. Washington Blvd., Culver City, CA 90066",
    phone: "(310) 253-9494",
    patientCategory: "adults",
  },
  {
    id: "EXODUS-MLK",
    name: "Exodus Recovery Center - Psychiatric Urgent Care - MLK",
    address: "12021 Wilmington Ave. Building 18, Suite 100, Los Angeles, CA 90059",
    phone: "(562) 295-4617",
    patientCategory: "adolescents_and_adults",
  },
  {
    id: "EXODUS-HARBOR",
    name: "Exodus Recovery Center - Psychiatric Urgent Care - Harbor",
    address: "1000 W. Carson St. Building 2 South, Torrance, CA 90509",
    phone: "(424) 405-5888",
    patientCategory: "adults",
  },
];

/**
 * Get PUCCs that accept a specific patient age.
 *
 * @param age - Patient age in years
 * @returns PUCCs that accept patients of this age
 */
export function getPUCCsForAge(age: number): PUCC[] {
  if (age < 13) {
    // No PUCCs accept patients under 13
    return [];
  }

  if (age < 18) {
    // Adolescents (13-17) - only adolescents_and_adults PUCCs
    return PUCC_FACILITIES.filter((p) => p.patientCategory === "adolescents_and_adults");
  }

  // Adults (18+) - all PUCCs accept adults
  return PUCC_FACILITIES;
}

/**
 * Get total count of PUCCs.
 */
export function getPUCCCount(): number {
  return PUCC_FACILITIES.length;
}
