/**
 * ProtocolUpdateManager - Protocol Version Tracking Service
 *
 * Manages protocol version history, change tracking, and update notifications.
 * Reference: LA County EMS PCM 1200/1300 series updates.
 */

import {
  PROTOCOL_CHANGES_2024_2025,
  MCG_CHANGES_2024_2025,
  getHighImpactChanges,
  getChangesRequiringTraining,
  getChangesByProtocol,
  getChangesByMCG,
  get2024_2025BatchUpdate,
} from "./update-registry";
import type {
  ProtocolCategory,
  ChangeType,
  ClinicalImpact,
  ProtocolVersion,
  ProtocolChange,
  MCGChange,
  ProtocolUpdateSummary,
  ProtocolBatchUpdate,
  ChangeQueryOptions,
} from "./types";

/**
 * ProtocolUpdateManager provides protocol version tracking and change queries.
 */
export class ProtocolUpdateManager {
  private protocolChanges: ProtocolChange[];
  private mcgChanges: MCGChange[];
  private batchUpdates: Map<string, ProtocolBatchUpdate>;

  constructor() {
    this.protocolChanges = [...PROTOCOL_CHANGES_2024_2025];
    this.mcgChanges = [...MCG_CHANGES_2024_2025];
    this.batchUpdates = new Map();

    // Initialize with 2024-2025 batch update
    const batch = get2024_2025BatchUpdate();
    this.batchUpdates.set(batch.id, batch);
  }

  // === Protocol Changes ===

  /**
   * Get all protocol changes.
   */
  public getAllProtocolChanges(): ProtocolChange[] {
    return [...this.protocolChanges];
  }

  /**
   * Get changes for a specific protocol.
   */
  public getProtocolChanges(tpCode: string): ProtocolChange[] {
    return getChangesByProtocol(tpCode);
  }

  /**
   * Query protocol changes with filters.
   */
  public queryProtocolChanges(options: ChangeQueryOptions): ProtocolChange[] {
    let results = [...this.protocolChanges];

    if (options.tpCode) {
      results = results.filter((c) => c.tpCode === options.tpCode);
    }
    if (options.changeType) {
      results = results.filter((c) => c.changeType === options.changeType);
    }
    if (options.clinicalImpact) {
      results = results.filter((c) => c.clinicalImpact === options.clinicalImpact);
    }
    if (options.requiresTraining !== undefined) {
      results = results.filter((c) => c.requiresTraining === options.requiresTraining);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  // === MCG Changes ===

  /**
   * Get all MCG changes.
   */
  public getAllMCGChanges(): MCGChange[] {
    return [...this.mcgChanges];
  }

  /**
   * Get changes for a specific MCG.
   */
  public getMCGChanges(mcgNumber: string): MCGChange[] {
    return getChangesByMCG(mcgNumber);
  }

  /**
   * Get MCG changes by medication name.
   */
  public getMCGChangesByMedication(medicationName: string): MCGChange[] {
    const lowerName = medicationName.toLowerCase();
    return this.mcgChanges.filter((c) =>
      c.medicationName.toLowerCase().includes(lowerName)
    );
  }

  // === Impact Analysis ===

  /**
   * Get all high-impact changes.
   */
  public getHighImpactChanges(): (ProtocolChange | MCGChange)[] {
    return getHighImpactChanges();
  }

  /**
   * Get changes requiring training.
   */
  public getChangesRequiringTraining(): (ProtocolChange | MCGChange)[] {
    return getChangesRequiringTraining();
  }

  /**
   * Get change summary statistics.
   */
  public getChangeSummary(): {
    totalProtocolChanges: number;
    totalMCGChanges: number;
    highImpactCount: number;
    trainingRequiredCount: number;
    byChangeType: Record<ChangeType, number>;
    byImpact: Record<ClinicalImpact, number>;
  } {
    const byChangeType: Record<string, number> = {};
    const byImpact: Record<string, number> = {};

    [...this.protocolChanges, ...this.mcgChanges].forEach((c) => {
      byChangeType[c.changeType] = (byChangeType[c.changeType] ?? 0) + 1;
      byImpact[c.clinicalImpact] = (byImpact[c.clinicalImpact] ?? 0) + 1;
    });

    return {
      totalProtocolChanges: this.protocolChanges.length,
      totalMCGChanges: this.mcgChanges.length,
      highImpactCount: this.getHighImpactChanges().length,
      trainingRequiredCount: this.getChangesRequiringTraining().length,
      byChangeType: byChangeType as Record<ChangeType, number>,
      byImpact: byImpact as Record<ClinicalImpact, number>,
    };
  }

  // === Batch Updates ===

  /**
   * Get batch update by ID.
   */
  public getBatchUpdate(id: string): ProtocolBatchUpdate | undefined {
    return this.batchUpdates.get(id);
  }

  /**
   * Get all batch updates.
   */
  public getAllBatchUpdates(): ProtocolBatchUpdate[] {
    return Array.from(this.batchUpdates.values());
  }

  /**
   * Get the most recent batch update.
   */
  public getLatestBatchUpdate(): ProtocolBatchUpdate | undefined {
    const updates = this.getAllBatchUpdates();
    if (updates.length === 0) return undefined;

    return updates.reduce((latest, current) =>
      current.effectiveDate > latest.effectiveDate ? current : latest
    );
  }

  // === Version Tracking ===

  /**
   * Get current version for a protocol.
   */
  public getCurrentVersion(tpCode: string): number {
    const changes = this.getProtocolChanges(tpCode);
    if (changes.length === 0) return 1;

    return Math.max(...changes.map((c) => c.toVersion));
  }

  /**
   * Check if protocol has been updated since a given version.
   */
  public hasUpdates(tpCode: string, sinceVersion: number): boolean {
    return this.getCurrentVersion(tpCode) > sinceVersion;
  }

  /**
   * Get changes between two versions.
   */
  public getChangesBetweenVersions(
    tpCode: string,
    fromVersion: number,
    toVersion: number
  ): ProtocolChange[] {
    return this.protocolChanges.filter(
      (c) =>
        c.tpCode === tpCode &&
        c.fromVersion >= fromVersion &&
        c.toVersion <= toVersion
    );
  }

  // === Display Helpers ===

  /**
   * Format change for display.
   */
  public formatChangeForDisplay(
    change: ProtocolChange | MCGChange
  ): string {
    const lines: string[] = [];

    if ("tpCode" in change) {
      lines.push(`Protocol: ${change.tpCode}`);
      if (change.section) lines.push(`Section: ${change.section}`);
    } else {
      lines.push(`Medication: ${change.medicationName} (MCG ${change.mcgNumber})`);
      lines.push(`Field: ${change.field}`);
    }

    lines.push(`Change Type: ${change.changeType}`);
    lines.push(`Description: ${change.description}`);
    lines.push(`Clinical Impact: ${change.clinicalImpact.toUpperCase()}`);
    lines.push(`Training Required: ${change.requiresTraining ? "Yes" : "No"}`);

    return lines.join("\n");
  }

  /**
   * Get impact badge color for display.
   */
  public getImpactColor(impact: ClinicalImpact): string {
    const colors: Record<ClinicalImpact, string> = {
      high: "#dc2626", // red
      medium: "#f59e0b", // amber
      low: "#3b82f6", // blue
      none: "#6b7280", // gray
    };
    return colors[impact];
  }

  /**
   * Get change type icon for display.
   */
  public getChangeTypeIcon(changeType: ChangeType): string {
    const icons: Record<ChangeType, string> = {
      addition: "+",
      modification: "~",
      removal: "-",
      clarification: "?",
      dosing_change: "💊",
      indication_change: "📋",
      contraindication_change: "⚠️",
      procedure_change: "🔧",
    };
    return icons[changeType];
  }

  // === Export Methods ===

  /**
   * Export changes to markdown format.
   */
  public exportToMarkdown(): string {
    const batch = this.getLatestBatchUpdate();
    if (!batch) return "No updates available.";

    const lines: string[] = [];
    lines.push(`# ${batch.name}`);
    lines.push(`**Effective Date:** ${batch.effectiveDate.toLocaleDateString()}`);
    lines.push("");
    lines.push("## Summary");
    lines.push(`- Protocols Updated: ${batch.totalProtocolsAffected}`);
    lines.push(`- Medications Updated: ${batch.totalMedicationsAffected}`);
    lines.push(`- High Impact Changes: ${this.getHighImpactChanges().length}`);
    lines.push(`- Training Required: ${this.getChangesRequiringTraining().length}`);
    lines.push("");

    lines.push("## Protocol Changes");
    batch.protocolUpdates.forEach((update) => {
      lines.push(`### ${update.tpCode} - ${update.tpName}`);
      update.changes.forEach((change) => {
        const icon = this.getChangeTypeIcon(change.changeType);
        lines.push(
          `- ${icon} [${change.clinicalImpact.toUpperCase()}] ${change.description}`
        );
      });
      lines.push("");
    });

    lines.push("## Medication Changes");
    batch.mcgUpdates.forEach((change) => {
      const icon = this.getChangeTypeIcon(change.changeType);
      lines.push(
        `- ${icon} **${change.medicationName}** (MCG ${change.mcgNumber}): ${change.description}`
      );
    });

    return lines.join("\n");
  }
}

// Export singleton instance
export const protocolUpdateManager = new ProtocolUpdateManager();
