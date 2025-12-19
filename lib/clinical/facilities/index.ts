/**
 * LA County EMS Facilities Module
 *
 * Central export point for all facility-related types and data.
 */

// Types
export type {
  Facility,
  PUCC,
  SoberingCenter,
  Region,
  TraumaLevel,
  CSCLevel,
  FacilityQueryOptions,
  FacilityDataMetadata,
} from "./types";

// Hospital data (from split regional files)
export {
  ALL_HOSPITALS,
  BASE_HOSPITALS,
  HOSPITAL_DATA_METADATA,
  getHospitalCount,
  NORTH_HOSPITALS,
  SOUTH_HOSPITALS,
  EAST_HOSPITALS,
  WEST_HOSPITALS,
  CENTRAL_HOSPITALS,
  OUT_OF_COUNTY_HOSPITALS,
} from "./hospitals";

// PUCC data
export {
  PUCC_FACILITIES,
  PUCC_DATA_METADATA,
  getPUCCsForAge,
  getPUCCCount,
} from "./puccs";

// Sobering Center data
export {
  SOBERING_CENTERS,
  SOBERING_CENTER_DATA_METADATA,
  getAllSoberingCenters,
  getSoberingCenterCount,
} from "./sobering-centers";
