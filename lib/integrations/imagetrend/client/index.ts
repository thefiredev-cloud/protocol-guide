/**
 * ImageTrend Integration Client
 *
 * Exports:
 * - imageTrendClient: Singleton API client instance
 * - ImageTrendClientClass: Client class for testing/advanced usage
 * - imageTrendOAuthManager: OAuth manager instance
 * - All PCR and integration types
 */

// Client exports
export { imageTrendClient, ImageTrendClientClass } from './imagetrend-client';

// OAuth manager exports
export { imageTrendOAuthManager, ImageTrendOAuthManager } from './oauth-manager';

// Type exports - PCR and related types
export type {
  // Core PCR types
  PCR,
  PCRStatus,
  PCRFilters,
  CreatePCRData,
  UpdatePCRData,

  // Incident & Timeline
  Incident,
  IncidentStatus,
  IncidentSummary,
  IncidentTimeline,
  DispatchInfo,

  // Patient types
  Patient,
  PatientSummary,
  PatientContext,
  Allergy,
  CurrentMedication,
  MedicalCondition,
  EmergencyContact,

  // Clinical data
  Vital,
  Medication,
  Procedure,
  Assessment,
  AssessmentFinding,
  Narrative,
  NarrativeSection,
  NarrativeUpdate,
  Disposition,

  // Protocol integration
  PCRProtocolLink,
  ProtocolUsage,
  ProtocolContext,
  ProtocolApplication,
  ProtocolDeviation,
  ProtocolOutcome,

  // Crew & Units
  CrewMember,
  Unit,

  // Location
  Location,

  // API responses
  ImageTrendResult,
  PaginatedResponse,
  ValidationError,
  ImageTrendError,
} from './pcr-types';

// OAuth types
export type {
  ImageTrendTokens,
  ConnectionInfo,
  PKCEChallenge,
  TokenRefreshResult,
  AuthorizationUrlParams,
  TokenExchangeParams,
  TokenRefreshParams,
  TokenRevocationParams,
  OAuthError,
  StoredTokenMetadata,
} from './types';
