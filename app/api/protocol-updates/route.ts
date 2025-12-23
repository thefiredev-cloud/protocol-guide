/**
 * Protocol Updates API Endpoint
 *
 * GET - Query protocol changes and updates
 *
 * Reference: LA County PCM 1200/1300 series
 */

import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../lib/api/handler";
import { protocolUpdateManager } from "../../../lib/protocols/updates";
import type { ChangeType, ClinicalImpact } from "../../../lib/protocols/updates";

export const runtime = "nodejs";

/**
 * GET /api/protocol-updates
 *
 * Query params:
 * - tpCode: Filter by protocol code
 * - mcgNumber: Filter by MCG number
 * - medication: Filter MCG by medication name
 * - changeType: Filter by change type
 * - impact: Filter by clinical impact (high, medium, low)
 * - trainingRequired: Filter by training requirement
 * - format: Response format (json, markdown)
 * - summary: Return summary statistics only
 */
export const GET = withApiHandler(async (_: unknown, request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const tpCode = searchParams.get("tpCode");
  const mcgNumber = searchParams.get("mcgNumber");
  const medication = searchParams.get("medication");
  const changeType = searchParams.get("changeType") as ChangeType | null;
  const impact = searchParams.get("impact") as ClinicalImpact | null;
  const trainingRequired = searchParams.get("trainingRequired");
  const format = searchParams.get("format");
  const summaryOnly = searchParams.get("summary") === "true";

  // Markdown export
  if (format === "markdown") {
    const markdown = protocolUpdateManager.exportToMarkdown();
    return new NextResponse(markdown, {
      headers: { "Content-Type": "text/markdown" },
    });
  }

  // Summary statistics only
  if (summaryOnly) {
    const summary = protocolUpdateManager.getChangeSummary();
    const batch = protocolUpdateManager.getLatestBatchUpdate();

    return NextResponse.json({
      summary,
      latestUpdate: batch
        ? {
            id: batch.id,
            name: batch.name,
            effectiveDate: batch.effectiveDate,
            protocolsAffected: batch.totalProtocolsAffected,
            medicationsAffected: batch.totalMedicationsAffected,
          }
        : null,
    });
  }

  // Specific protocol changes
  if (tpCode) {
    const changes = protocolUpdateManager.getProtocolChanges(tpCode);
    const currentVersion = protocolUpdateManager.getCurrentVersion(tpCode);

    return NextResponse.json({
      tpCode,
      currentVersion,
      changeCount: changes.length,
      changes,
    });
  }

  // Specific MCG changes
  if (mcgNumber) {
    const changes = protocolUpdateManager.getMCGChanges(mcgNumber);

    return NextResponse.json({
      mcgNumber,
      changeCount: changes.length,
      changes,
    });
  }

  // MCG by medication name
  if (medication) {
    const changes = protocolUpdateManager.getMCGChangesByMedication(medication);

    return NextResponse.json({
      medication,
      changeCount: changes.length,
      changes,
    });
  }

  // Query with filters
  const queryOptions: {
    changeType?: ChangeType;
    clinicalImpact?: ClinicalImpact;
    requiresTraining?: boolean;
  } = {};

  if (changeType) queryOptions.changeType = changeType;
  if (impact) queryOptions.clinicalImpact = impact;
  if (trainingRequired !== null) {
    queryOptions.requiresTraining = trainingRequired === "true";
  }

  // High impact changes shortcut
  if (impact === "high" && !changeType && trainingRequired === null) {
    const highImpact = protocolUpdateManager.getHighImpactChanges();
    return NextResponse.json({
      filter: "high_impact",
      count: highImpact.length,
      changes: highImpact,
    });
  }

  // Training required shortcut
  if (trainingRequired === "true" && !changeType && !impact) {
    const training = protocolUpdateManager.getChangesRequiringTraining();
    return NextResponse.json({
      filter: "training_required",
      count: training.length,
      changes: training,
    });
  }

  // General query
  const protocolChanges = protocolUpdateManager.queryProtocolChanges(queryOptions);
  const mcgChanges = protocolUpdateManager.getAllMCGChanges().filter((c) => {
    if (queryOptions.changeType && c.changeType !== queryOptions.changeType)
      return false;
    if (queryOptions.clinicalImpact && c.clinicalImpact !== queryOptions.clinicalImpact)
      return false;
    if (
      queryOptions.requiresTraining !== undefined &&
      c.requiresTraining !== queryOptions.requiresTraining
    )
      return false;
    return true;
  });

  return NextResponse.json({
    protocolChanges: {
      count: protocolChanges.length,
      changes: protocolChanges,
    },
    mcgChanges: {
      count: mcgChanges.length,
      changes: mcgChanges,
    },
  });
});
