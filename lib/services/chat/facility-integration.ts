/**
 * Facility Integration Service for Chat
 *
 * Integrates facility data and transport recommendations
 * into the chat service for clinical decision support.
 */

import { facilityManager } from "../../../lib/clinical/FacilityManager";
import {
  getTransportRecommendation,
  type PatientCondition,
  type TransportRecommendation,
} from "../../../lib/clinical/transport-destinations";
import type { Facility, Region } from "../../../lib/clinical/facilities";

/**
 * Enhanced transport recommendation.
 */
export interface EnhancedTransportRecommendation extends TransportRecommendation {
  /** Facilities currently on diversion (not implemented - always empty) */
  facilitiesOnDiversion: string[];
  /** Alternate facilities if primary on diversion */
  alternateDestinations?: string[];
  /** Warning if all recommended facilities on diversion */
  diversionWarning?: string;
}

/**
 * FacilityIntegrationService provides facility recommendations.
 */
export class FacilityIntegrationService {
  /**
   * Get transport recommendation.
   */
  public getEnhancedTransportRecommendation(
    condition: PatientCondition,
    isPediatric: boolean = false,
    patientAge?: number,
    preferredRegion?: Region
  ): EnhancedTransportRecommendation {
    // Get base recommendation
    const baseRec = getTransportRecommendation(condition, isPediatric, patientAge);

    // Build enhanced recommendation (no diversion checking - feature removed)
    const enhanced: EnhancedTransportRecommendation = {
      ...baseRec,
      facilitiesOnDiversion: [],
    };

    // Filter by region if specified
    if (preferredRegion && enhanced.recommendedDestinations.length > 1) {
      const regionalFacilities = this.filterByRegion(
        enhanced.recommendedDestinations,
        preferredRegion
      );
      if (regionalFacilities.length > 0) {
        enhanced.recommendedDestinations = regionalFacilities;
      }
    }

    return enhanced;
  }

  /**
   * Get STEMI destinations.
   */
  public getSTEMIDestinations(): {
    available: Facility[];
    onDiversion: Facility[];
  } {
    const stemiCenters = facilityManager.getSTEMICenters();
    return { available: stemiCenters, onDiversion: [] };
  }

  /**
   * Get stroke destinations.
   */
  public getStrokeDestinations(
    lvoSuspected: boolean = false
  ): {
    available: Facility[];
    onDiversion: Facility[];
  } {
    const strokeCenters = lvoSuspected
      ? facilityManager.getComprehensiveStrokeCenters()
      : facilityManager.getStrokeCenters();
    return { available: strokeCenters, onDiversion: [] };
  }

  /**
   * Get trauma destinations.
   */
  public getTraumaDestinations(
    level?: "I" | "II",
    pediatric?: boolean
  ): {
    available: Facility[];
    onDiversion: Facility[];
  } {
    const traumaCenters = facilityManager.getTraumaCenters(level, pediatric);
    return { available: traumaCenters, onDiversion: [] };
  }

  /**
   * Format facility recommendation for chat response.
   */
  public formatForChat(recommendation: EnhancedTransportRecommendation): string {
    const lines: string[] = [];

    lines.push(`**Transport Recommendation: ${recommendation.condition}**\n`);

    if (recommendation.diversionWarning) {
      lines.push(`Warning: ${recommendation.diversionWarning}\n`);
    }

    lines.push("**Recommended Destinations:**");
    recommendation.recommendedDestinations.forEach((dest, i) => {
      lines.push(`${i + 1}. ${dest}`);
    });

    if (recommendation.timeConstraint) {
      lines.push(`\n**Time Constraint:** ${recommendation.timeConstraint}`);
    }

    if (recommendation.baseContactRequired) {
      lines.push("\n**Base Hospital Contact Required**");
    }

    if (recommendation.specialConsiderations?.length) {
      lines.push("\n**Special Considerations:**");
      recommendation.specialConsiderations.forEach((note) => {
        lines.push(`- ${note}`);
      });
    }

    if (recommendation.citations?.length) {
      lines.push("\n**References:**");
      recommendation.citations.forEach((cite) => {
        lines.push(`- ${cite}`);
      });
    }

    return lines.join("\n");
  }

  /**
   * Get current diversion summary for chat context.
   * (Diversion feature not implemented - returns stub)
   */
  public getDiversionSummary(): string {
    return "Diversion status checking not available.";
  }

  // === Private Helpers ===

  private findFacilityByName(name: string): Facility | undefined {
    return facilityManager
      .getAllHospitals()
      .find((f) => f.name === name || f.shortName === name);
  }

  private filterByRegion(facilityNames: string[], region: Region): string[] {
    return facilityNames.filter((name) => {
      const facility = this.findFacilityByName(name);
      return facility?.region === region;
    });
  }
}

// Export singleton
export const facilityIntegration = new FacilityIntegrationService();
