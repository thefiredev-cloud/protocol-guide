/**
 * HIPAA-Compliant Audit Event Types
 * Supports 6-year retention requirement for PHI access logging
 */

/**
 * Audit action types covering all security-relevant events
 */
export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.session.start"
  | "user.session.end"
  | "chat.query"
  | "chat.stream"
  | "dosing.calculate"
  | "dosing.list"
  | "protocol.view"
  | "protocol.search"
  | "auth.failure"
  | "auth.unauthorized"
  | "api.error"
  | "api.validation_error"
  | "system.startup"
  | "system.shutdown";

/**
 * Outcome status for audit events
 */
export type AuditOutcome = "success" | "failure" | "partial";

/**
 * User roles (if/when authentication is implemented)
 */
export type UserRole = "paramedic" | "emt" | "medical_director" | "admin" | "guest";

/**
 * Core audit event structure (HIPAA-compliant)
 */
export interface AuditEvent {
  /** Unique event identifier (UUID v4) */
  eventId: string;

  /** ISO 8601 timestamp of the event */
  timestamp: string;

  /** User identifier (anonymized/hashed if needed) */
  userId?: string;

  /** User role at time of event */
  userRole?: UserRole;

  /** Session identifier for correlation */
  sessionId?: string;

  /** Action performed */
  action: AuditAction;

  /** Resource accessed (protocol name, medication ID, etc.) */
  resource: string;

  /** Outcome of the action */
  outcome: AuditOutcome;

  /** Additional structured metadata (protocol names, calc results, etc.) */
  metadata?: Record<string, unknown>;

  /** Client IP address (IPv4 or IPv6) */
  ipAddress?: string;

  /** User-Agent header (browser/client info) */
  userAgent?: string;

  /** Error message (only if outcome is failure) */
  errorMessage?: string;

  /** Duration in milliseconds (for performance tracking) */
  durationMs?: number;
}

/**
 * Query parameters for retrieving audit logs
 */
export interface AuditQuery {
  /** Filter by user ID */
  userId?: string;

  /** Filter by action type */
  action?: AuditAction;

  /** Filter by outcome */
  outcome?: AuditOutcome;

  /** Start date (ISO 8601) */
  startDate?: string;

  /** End date (ISO 8601) */
  endDate?: string;

  /** Resource filter (e.g., specific medication or protocol) */
  resource?: string;

  /** Page number (1-indexed) */
  page?: number;

  /** Results per page (default: 50, max: 1000) */
  limit?: number;
}

/**
 * Paginated audit log response
 */
export interface AuditLogResponse {
  events: AuditEvent[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Audit log sink configuration
 */
export interface AuditSinkConfig {
  /** Sink type */
  type: "console" | "file" | "database";

  /** Enabled status */
  enabled: boolean;

  /** Sink-specific configuration */
  config?: Record<string, unknown>;
}

/**
 * File sink configuration
 */
export interface FileSinkConfig {
  /** Log directory path */
  logDir: string;

  /** File name pattern (supports date interpolation) */
  filePattern: string;

  /** Rotation strategy */
  rotation: "daily" | "weekly" | "monthly" | "size";

  /** Max file size in bytes (for size-based rotation) */
  maxSizeBytes?: number;

  /** Max number of files to keep */
  maxFiles?: number;
}
