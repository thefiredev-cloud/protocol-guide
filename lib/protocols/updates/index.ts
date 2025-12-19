/**
 * Protocol Updates Module Exports
 *
 * Protocol version tracking and change management for LA County PCM.
 */

export { ProtocolUpdateManager, protocolUpdateManager } from "./ProtocolUpdateManager";

export {
  PROTOCOL_CHANGES_2024_2025,
  MCG_CHANGES_2024_2025,
  getHighImpactChanges,
  getChangesRequiringTraining,
  getChangesByProtocol,
  getChangesByMCG,
  get2024_2025BatchUpdate,
} from "./update-registry";

export type {
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
