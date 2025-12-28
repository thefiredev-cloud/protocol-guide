/**
 * ImageTrend PCR and Integration Types
 * Production-ready type definitions for ImageTrend Elite API integration
 */

// ============================================================================
// PCR Core Types
// ============================================================================

export interface PCR {
  id: string;
  incidentId: string;
  agencyId: string;
  patientId: string;
  status: PCRStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;

  // Core PCR Data
  incident: IncidentSummary;
  patient: PatientSummary;
  vitals: Vital[];
  medications: Medication[];
  procedures: Procedure[];
  assessments: Assessment[];
  narrative: Narrative;
  disposition: Disposition;

  // Protocol Integration
  linkedProtocols: PCRProtocolLink[];

  // Metadata
  locked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  signedAt?: string;
  signedBy?: string;
}

export type PCRStatus =
  | 'draft'
  | 'in_progress'
  | 'pending_review'
  | 'approved'
  | 'locked'
  | 'archived';

export interface IncidentSummary {
  incidentNumber: string;
  dispatchTime: string;
  enrouteTime?: string;
  arrivalTime?: string;
  departureTime?: string;
  hospitalArrivalTime?: string;
  availableTime?: string;
  location: Location;
  chiefComplaint: string;
  priority: 'routine' | 'priority' | 'emergency' | 'critical';
}

export interface PatientSummary {
  id: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  age?: number;
  ageUnits?: 'years' | 'months' | 'days';
  gender?: 'male' | 'female' | 'other' | 'unknown';
  weight?: number;
  weightUnits?: 'kg' | 'lbs';
}

export interface Location {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  locationType?: string;
}

export interface Vital {
  id: string;
  timestamp: string;
  recordedBy: string;

  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  temperature?: number;
  temperatureUnits?: 'F' | 'C';
  bloodGlucose?: number;
  pain?: number; // 0-10 scale

  gcsEye?: number;
  gcsVerbal?: number;
  gcsMotor?: number;
  gcsTotal?: number;

  notes?: string;
}

export interface Medication {
  id: string;
  timestamp: string;
  administeredBy: string;

  name: string;
  dose: number;
  doseUnits: string;
  route: string;
  indication?: string;

  protocolId?: string;
  protocolName?: string;

  response?: string;
  adverseReaction?: boolean;
  adverseReactionNotes?: string;
}

export interface Procedure {
  id: string;
  timestamp: string;
  performedBy: string;

  name: string;
  code?: string;
  successful: boolean;
  attempts?: number;

  protocolId?: string;
  protocolName?: string;

  details?: Record<string, unknown>;
  complications?: string;
}

export interface Assessment {
  id: string;
  timestamp: string;
  assessedBy: string;

  type: 'primary' | 'secondary' | 'reassessment';
  findings: AssessmentFinding[];
  impression?: string;

  protocolsConsidered?: string[];
  protocolsApplied?: string[];
}

export interface AssessmentFinding {
  category: string;
  finding: string;
  severity?: 'normal' | 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface Narrative {
  id: string;
  text: string;
  sections: NarrativeSection[];
  lastUpdated: string;
  updatedBy: string;
}

export interface NarrativeSection {
  title: string;
  content: string;
  order: number;
}

export interface Disposition {
  destination?: string;
  destinationType?: 'hospital' | 'clinic' | 'home' | 'other';
  transferredCare?: boolean;
  transferredTo?: string;
  patientRefused?: boolean;
  refusalSigned?: boolean;
}

// ============================================================================
// PCR Operations
// ============================================================================

export interface PCRFilters {
  incidentId?: string;
  patientId?: string;
  agencyId?: string;
  status?: PCRStatus[];
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  assignedTo?: string;
  hasProtocolLinks?: boolean;
  protocolIds?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'incidentNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePCRData {
  incidentId: string;
  agencyId: string;
  patientId?: string;

  incident: Partial<IncidentSummary>;
  patient?: Partial<PatientSummary>;

  chiefComplaint: string;
  initialAssessment?: Partial<Assessment>;

  createdBy: string;
}

export interface UpdatePCRData {
  status?: PCRStatus;

  incident?: Partial<IncidentSummary>;
  patient?: Partial<PatientSummary>;

  addVitals?: Omit<Vital, 'id'>[];
  addMedications?: Omit<Medication, 'id'>[];
  addProcedures?: Omit<Procedure, 'id'>[];
  addAssessments?: Omit<Assessment, 'id'>[];

  updateNarrative?: NarrativeUpdate;
  updateDisposition?: Partial<Disposition>;

  modifiedBy: string;
}

export interface NarrativeUpdate {
  text?: string;
  sections?: NarrativeSection[];
  appendText?: string;
  appendSection?: Omit<NarrativeSection, 'order'>;
}

// ============================================================================
// Protocol Integration
// ============================================================================

export interface PCRProtocolLink {
  id: string;
  pcrId: string;
  protocolId: string;
  protocolName: string;
  protocolVersion?: string;

  linkedAt: string;
  linkedBy: string;

  usage: ProtocolUsage;

  // Tracking
  opened?: boolean;
  openedAt?: string;
  timeSpent?: number; // seconds

  // Evidence of application
  medicationsAdministered?: string[]; // medication IDs
  proceduresPerformed?: string[]; // procedure IDs
  assessmentNotes?: string;

  // Outcome
  helpful?: boolean;
  helpfulRating?: number; // 1-5
  feedback?: string;
}

export interface ProtocolUsage {
  context: ProtocolContext;
  application: ProtocolApplication;
  outcome?: ProtocolOutcome;
}

export interface ProtocolContext {
  chiefComplaint: string;
  patientAge?: number;
  patientWeight?: number;
  vitalSigns?: Partial<Vital>;
  symptoms: string[];
  triggers: string[]; // What triggered protocol selection
}

export interface ProtocolApplication {
  appliedAt: string;
  appliedBy: string;

  fullCompliance: boolean;
  deviations?: ProtocolDeviation[];

  medicationsGiven: string[];
  proceduresPerformed: string[];

  consultedMedicalControl?: boolean;
  medicalControlNotes?: string;
}

export interface ProtocolDeviation {
  step: string;
  reason: string;
  justification: string;
  approvedBy?: string;
}

export interface ProtocolOutcome {
  patientResponse: 'improved' | 'stable' | 'declined' | 'unchanged';
  effectivenesRating?: number; // 1-5
  complications?: string;
  notes?: string;
}

// ============================================================================
// Incident & Patient
// ============================================================================

export interface Incident {
  id: string;
  incidentNumber: string;
  agencyId: string;

  dispatch: DispatchInfo;
  timeline: IncidentTimeline;
  location: Location;

  chiefComplaint: string;
  priority: 'routine' | 'priority' | 'emergency' | 'critical';

  crew: CrewMember[];
  units: Unit[];

  status: IncidentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface DispatchInfo {
  callReceived: string;
  dispatchedUnits: string[];
  dispatchNotes?: string;
  callerName?: string;
  callerPhone?: string;
}

export interface IncidentTimeline {
  dispatchTime: string;
  enrouteTime?: string;
  arrivedTime?: string;
  patientContactTime?: string;
  departedSceneTime?: string;
  arrivedDestinationTime?: string;
  availableTime?: string;
  clearedTime?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'paramedic' | 'emt' | 'driver' | 'student' | 'supervisor';
  certification: string;
  isPrimaryProvider?: boolean;
}

export interface Unit {
  id: string;
  unitNumber: string;
  type: 'ambulance' | 'rescue' | 'engine' | 'supervisor' | 'air';
  primary: boolean;
}

export type IncidentStatus =
  | 'dispatched'
  | 'enroute'
  | 'on_scene'
  | 'transporting'
  | 'at_destination'
  | 'available'
  | 'completed'
  | 'cancelled';

export interface Patient {
  id: string;

  // Demographics
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  age?: number;
  ageUnits?: 'years' | 'months' | 'days';

  gender?: 'male' | 'female' | 'other' | 'unknown';

  // Physical
  weight?: number;
  weightUnits?: 'kg' | 'lbs';
  height?: number;
  heightUnits?: 'cm' | 'in';

  // Contact
  address?: Location;
  phone?: string;
  email?: string;

  // Medical History
  allergies?: Allergy[];
  medications?: CurrentMedication[];
  medicalHistory?: MedicalCondition[];

  // Emergency Contact
  emergencyContact?: EmergencyContact;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Allergy {
  allergen: string;
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'life-threatening';
}

export interface CurrentMedication {
  name: string;
  dose?: string;
  frequency?: string;
  prescribedBy?: string;
}

export interface MedicalCondition {
  condition: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface PatientContext {
  patient: Patient;
  currentIncident: Incident;
  activePCR?: PCR;
  recentPCRs?: PCR[];
}

// ============================================================================
// API Response Types
// ============================================================================

export type ImageTrendResult<T> =
  | { type: 'success'; data: T }
  | { type: 'unauthorized'; message?: string }
  | { type: 'not_found'; message?: string }
  | { type: 'circuit_open'; message?: string }
  | { type: 'rate_limited'; retryAfter: number; message?: string }
  | { type: 'validation_error'; errors: ValidationError[] }
  | { type: 'conflict'; message?: string }
  | { type: 'error'; message: string; code?: string; statusCode?: number };

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ImageTrendError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
