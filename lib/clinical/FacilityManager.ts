/**
 * FacilityManager - LA County EMS Facility Query Service
 *
 * Provides query and filter methods for accessing facility data.
 * Used by transport destination logic, triage, and clinical decision support.
 *
 * Reference: LA County EMS Agency Ref 500 series (Destination Policies)
 */

import {
  ALL_HOSPITALS,
  PUCC_FACILITIES,
  SOBERING_CENTERS,
  getPUCCsForAge,
} from "./facilities";

import type {
  Facility,
  PUCC,
  SoberingCenter,
  Region,
  TraumaLevel,
  FacilityQueryOptions,
} from "./facilities";

/**
 * FacilityManager provides query methods for LA County EMS facilities.
 *
 * Usage:
 * ```typescript
 * const manager = new FacilityManager();
 * const traumaCenters = manager.getTraumaCenters("I");
 * const stemiCenters = manager.getSTEMICenters();
 * ```
 */
export class FacilityManager {
  private readonly hospitals: Facility[];
  private readonly puccs: PUCC[];
  private readonly soberingCenters: SoberingCenter[];

  constructor() {
    this.hospitals = ALL_HOSPITALS;
    this.puccs = PUCC_FACILITIES;
    this.soberingCenters = SOBERING_CENTERS;
  }

  // === Hospital Queries ===

  /**
   * Get all hospitals.
   */
  public getAllHospitals(): Facility[] {
    return [...this.hospitals];
  }

  /**
   * Get hospitals by ID.
   */
  public getById(id: string): Facility | undefined {
    return this.hospitals.find((h) => h.id === id);
  }

  /**
   * Get hospital by phone number.
   */
  public getByPhone(phone: string): Facility | undefined {
    const normalizedPhone = this.normalizePhone(phone);
    return this.hospitals.find(
      (h) => this.normalizePhone(h.phone) === normalizedPhone
    );
  }

  /**
   * Get hospitals by region.
   */
  public getByRegion(region: Region): Facility[] {
    return this.hospitals.filter((h) => h.region === region);
  }

  /**
   * Query hospitals with multiple filter criteria.
   */
  public query(options: FacilityQueryOptions): Facility[] {
    return this.hospitals.filter((h) => {
      if (options.region && h.region !== options.region) return false;
      if (options.isBaseHospital !== undefined && h.isBaseHospital !== options.isBaseHospital)
        return false;
      if (options.traumaLevel && h.traumaLevel !== options.traumaLevel) return false;
      if (
        options.pediatricTraumaLevel &&
        h.pediatricTraumaLevel !== options.pediatricTraumaLevel
      )
        return false;
      if (options.isSRC !== undefined && h.isSRC !== options.isSRC) return false;
      if (options.isECPR !== undefined && h.isECPR !== options.isECPR) return false;
      if (options.isBurnCenter !== undefined && h.isBurnCenter !== options.isBurnCenter)
        return false;

      if (options.strokeCenterType) {
        if (options.strokeCenterType === "PSC" && !h.isPSC) return false;
        if (options.strokeCenterType === "CSC" && !h.isCSC) return false;
        if (options.strokeCenterType === "any" && !h.isPSC && !h.isCSC) return false;
      }

      if (options.hasPediatricCapability) {
        if (!h.hasEDAP && !h.hasPTC && !h.hasPMC) return false;
      }

      return true;
    });
  }

  // === Capability-Based Queries ===

  /**
   * Get all base hospitals (provide online medical direction).
   */
  public getBaseHospitals(): Facility[] {
    return this.hospitals.filter((h) => h.isBaseHospital);
  }

  /**
   * Get trauma centers, optionally filtered by level.
   *
   * @param level - Filter by trauma level ("I" or "II")
   * @param pediatric - If true, return pediatric trauma centers
   */
  public getTraumaCenters(level?: TraumaLevel, pediatric?: boolean): Facility[] {
    return this.hospitals.filter((h) => {
      if (pediatric) {
        if (!h.pediatricTraumaLevel) return false;
        if (level && h.pediatricTraumaLevel !== level) return false;
        return true;
      }

      if (!h.traumaLevel) return false;
      if (level && h.traumaLevel !== level) return false;
      return true;
    });
  }

  /**
   * Get STEMI Receiving Centers (SRCs).
   * Per Ref 513 - STEMI Patient Destination.
   */
  public getSTEMICenters(): Facility[] {
    return this.hospitals.filter((h) => h.isSRC);
  }

  /**
   * Get ECPR Receiving Centers.
   * Per Ref 321 - ECPR Receiving Center Standards.
   * Must be SRC + Base Hospital.
   */
  public getECPRCenters(): Facility[] {
    return this.hospitals.filter((h) => h.isECPR);
  }

  /**
   * Get Stroke Centers, optionally filtered by type.
   *
   * @param type - "PSC" (Primary), "CSC" (Comprehensive), or undefined for all
   */
  public getStrokeCenters(type?: "PSC" | "CSC"): Facility[] {
    if (type === "PSC") {
      return this.hospitals.filter((h) => h.isPSC && !h.isCSC);
    }
    if (type === "CSC") {
      return this.hospitals.filter((h) => h.isCSC);
    }
    return this.hospitals.filter((h) => h.isPSC || h.isCSC);
  }

  /**
   * Get Comprehensive Stroke Centers (CSCs).
   * For large vessel occlusion (LVO) or thrombectomy candidates.
   */
  public getComprehensiveStrokeCenters(): Facility[] {
    return this.hospitals.filter((h) => h.isCSC);
  }

  /**
   * Get Burn Centers.
   * Per Ref 512 - Burn Patient Destination.
   */
  public getBurnCenters(): Facility[] {
    return this.hospitals.filter((h) => h.isBurnCenter);
  }

  /**
   * Get hospitals with pediatric capabilities.
   * Includes EDAP, PTC, and/or PMC designations.
   */
  public getPediatricCenters(): Facility[] {
    return this.hospitals.filter((h) => h.hasEDAP || h.hasPTC || h.hasPMC);
  }

  /**
   * Get Pediatric Trauma Centers (PTC).
   */
  public getPediatricTraumaCenters(): Facility[] {
    return this.hospitals.filter((h) => h.hasPTC);
  }

  /**
   * Get hospitals with EDAP designation.
   */
  public getEDAPHospitals(): Facility[] {
    return this.hospitals.filter((h) => h.hasEDAP);
  }

  /**
   * Get hospitals with helipad access.
   */
  public getHospitalsWithHelipad(): Facility[] {
    return this.hospitals.filter((h) => h.hasHelipad);
  }

  /**
   * Get hospitals with specific special service.
   */
  public getBySpecialService(service: string): Facility[] {
    const lowerService = service.toLowerCase();
    return this.hospitals.filter((h) =>
      h.specialServices.some((s) => s.toLowerCase().includes(lowerService))
    );
  }

  // === TAD Destinations ===

  /**
   * Get PUCCs appropriate for patient age.
   * Per Ref 526 - Behavioral Patient Destination.
   *
   * @param patientAge - Patient age in years
   * @returns PUCCs that accept patients of this age
   */
  public getPUCCs(patientAge: number): PUCC[] {
    return getPUCCsForAge(patientAge);
  }

  /**
   * Get all PUCCs regardless of age restrictions.
   */
  public getAllPUCCs(): PUCC[] {
    return [...this.puccs];
  }

  /**
   * Get all Sobering Centers.
   * Per Ref 528 - Intoxicated (Alcohol) Patient Destination.
   */
  public getSoberingCenters(): SoberingCenter[] {
    return [...this.soberingCenters];
  }

  // === Utility Methods ===

  /**
   * Normalize phone number for comparison.
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  /**
   * Get facility names as array (for display/dropdown).
   */
  public getHospitalNames(): string[] {
    return this.hospitals.map((h) => h.name);
  }

  /**
   * Get facility short names as array.
   */
  public getHospitalShortNames(): string[] {
    return this.hospitals.map((h) => h.shortName);
  }

  /**
   * Format phone for tel: link.
   */
  public formatPhoneForDialing(phone: string): string {
    return `tel:${this.normalizePhone(phone)}`;
  }
}

// Export singleton instance for convenience
export const facilityManager = new FacilityManager();
