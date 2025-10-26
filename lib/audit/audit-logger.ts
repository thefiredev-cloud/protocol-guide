/**
 * HIPAA-Compliant Audit Logger
 * Implements file-based audit logging with JSON Lines format
 * Supports daily rotation and 6-year retention for compliance
 */

import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

import type {
  AuditAction,
  AuditEvent,
  AuditOutcome,
  FileSinkConfig,
  UserRole,
} from "./types";

/**
 * Configuration for audit logger
 */
interface AuditLoggerConfig {
  /** Enable console output (for development) */
  consoleEnabled?: boolean;

  /** Enable file output (for production) */
  fileEnabled?: boolean;

  /** File sink configuration */
  fileSink?: FileSinkConfig;
}

/**
 * Parameters for logging a protocol query
 */
interface ProtocolQueryParams {
  userId?: string;
  userRole?: UserRole;
  sessionId?: string;
  query: string;
  protocolsReferenced?: string[];
  outcome: AuditOutcome;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
  errorMessage?: string;
}

/**
 * Parameters for logging a dosing calculation
 */
interface DosingCalcParams {
  userId?: string;
  userRole?: UserRole;
  sessionId?: string;
  medicationId: string;
  medicationName?: string;
  patientAgeRange?: string; // e.g., "pediatric", "adult", "geriatric" (de-identified)
  outcome: AuditOutcome;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
  errorMessage?: string;
}

/**
 * Parameters for logging authentication events
 */
interface AuthParams {
  userId?: string;
  action: Extract<AuditAction, "user.login" | "user.logout" | "auth.failure" | "auth.unauthorized">;
  outcome: AuditOutcome;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
}

/**
 * Parameters for logging errors
 */
interface ErrorParams {
  userId?: string;
  sessionId?: string;
  action: AuditAction;
  resource: string;
  errorMessage: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Main audit logger class
 */
export class AuditLogger {
  private config: Required<AuditLoggerConfig>;
  private logDir: string;

  constructor(config?: AuditLoggerConfig) {
    this.config = {
      consoleEnabled: config?.consoleEnabled ?? process.env.NODE_ENV === "development",
      fileEnabled: config?.fileEnabled ?? true,
      fileSink: config?.fileSink ?? {
        logDir: path.join(process.cwd(), "logs"),
        filePattern: "audit-{date}.jsonl",
        rotation: "daily",
        maxFiles: 2190, // 6 years of daily logs
      },
    };

    this.logDir = this.config.fileSink.logDir;
    this.ensureLogDirectory();
  }

  /**
   * Log a protocol/chat query event
   */
  public async logProtocolQuery(params: ProtocolQueryParams): Promise<void> {
    const event: AuditEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      action: "chat.query",
      resource: "protocol_query",
      outcome: params.outcome,
      metadata: {
        queryLength: params.query.length, // Don't log actual query content (PHI)
        protocolsReferenced: params.protocolsReferenced,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      durationMs: params.durationMs,
      errorMessage: params.errorMessage,
    };

    await this.writeEvent(event);
  }

  /**
   * Log a chat stream event
   */
  public async logChatStream(params: ProtocolQueryParams): Promise<void> {
    const event: AuditEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      action: "chat.stream",
      resource: "protocol_stream",
      outcome: params.outcome,
      metadata: {
        queryLength: params.query.length,
        protocolsReferenced: params.protocolsReferenced,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      durationMs: params.durationMs,
      errorMessage: params.errorMessage,
    };

    await this.writeEvent(event);
  }

  /**
   * Log a medication dosing calculation
   */
  public async logDosingCalc(params: DosingCalcParams): Promise<void> {
    const event: AuditEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      userRole: params.userRole,
      sessionId: params.sessionId,
      action: "dosing.calculate",
      resource: params.medicationId,
      outcome: params.outcome,
      metadata: {
        medicationName: params.medicationName,
        patientAgeRange: params.patientAgeRange, // De-identified age range
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      durationMs: params.durationMs,
      errorMessage: params.errorMessage,
    };

    await this.writeEvent(event);
  }

  /**
   * Log a dosing list retrieval
   */
  public async logDosingList(params: {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    durationMs?: number;
  }): Promise<void> {
    const event: AuditEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      sessionId: params.sessionId,
      action: "dosing.list",
      resource: "medication_list",
      outcome: "success",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      durationMs: params.durationMs,
    };

    await this.writeEvent(event);
  }

  /**
   * Log authentication events (login, logout, failures)
   */
  public async logAuth(params: AuthParams): Promise<void> {
    const event: AuditEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      action: params.action,
      resource: "authentication",
      outcome: params.outcome,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      errorMessage: params.errorMessage,
    };

    await this.writeEvent(event);
  }

  /**
   * Log general errors
   */
  public async logError(params: ErrorParams): Promise<void> {
    const event: AuditEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      sessionId: params.sessionId,
      action: params.action,
      resource: params.resource,
      outcome: "failure",
      errorMessage: params.errorMessage,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    };

    await this.writeEvent(event);
  }

  /**
   * Write audit event to configured sinks
   */
  private async writeEvent(event: AuditEvent): Promise<void> {
    // Validate event (ensure no PHI in metadata)
    this.validateEvent(event);

    // Console sink (development)
    if (this.config.consoleEnabled) {
      // eslint-disable-next-line no-console
      console.log("[AUDIT]", JSON.stringify(event));
    }

    // File sink (production - always enabled as backup)
    if (this.config.fileEnabled) {
      await this.writeToFile(event);
    }

    // Database sink (if enabled via environment variable)
    if (process.env.ENABLE_DB_AUDIT === 'true') {
      await this.writeToDatabase(event).catch(error => {
        // Don't fail audit logging if database write fails
        // eslint-disable-next-line no-console
        console.error('[AUDIT] Database write failed (file backup preserved):', error);
      });
    }
  }

  /**
   * Write event to database (Supabase)
   * Uses dual-write strategy: file is primary, database is secondary
   */
  private async writeToDatabase(event: AuditEvent): Promise<void> {
    try {
      // Lazy-load database client to avoid import errors when DB not configured
      const { db } = await import('../db/client');

      // Check if database is available
      if (!db.isAvailable) {
        return; // Silently skip if database not configured
      }

      // Map event to database schema
      const dbEvent = {
        event_id: event.eventId,
        timestamp: event.timestamp,
        user_id: event.userId ?? null,
        user_role: event.userRole ?? null,
        session_id: event.sessionId ?? null,
        action: event.action,
        resource: event.resource,
        outcome: event.outcome,
        metadata: event.metadata ?? null,
        ip_address: event.ipAddress ?? null,
        user_agent: event.userAgent ?? null,
        error_message: event.errorMessage ?? null,
        duration_ms: event.durationMs ?? null,
      };

      // Insert to database (use admin client to bypass RLS)
      const { error } = await db.admin.from('audit_logs').insert(dbEvent);

      if (error) {
        throw new Error(`Supabase insert failed: ${error.message}`);
      }
    } catch (error) {
      // Re-throw to be caught by caller
      throw error;
    }
  }

  /**
   * Write event to file (JSON Lines format)
   */
  private async writeToFile(event: AuditEvent): Promise<void> {
    const fileName = this.getLogFileName();
    const filePath = path.join(this.logDir, fileName);
    const logLine = JSON.stringify(event) + "\n";

    try {
      // Append to file (creates if doesn't exist)
      await fs.promises.appendFile(filePath, logLine, { encoding: "utf-8" });

      // Cleanup old logs (if rotation enabled)
      await this.rotateLogsIfNeeded();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to write audit log:", error);
      // Don't throw - audit logging should not crash the app
    }
  }

  /**
   * Generate log file name based on rotation strategy
   */
  private getLogFileName(): string {
    const date = new Date();
    const pattern = this.config.fileSink.filePattern;

    // Daily rotation: audit-2025-01-15.jsonl
    if (this.config.fileSink.rotation === "daily") {
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      return pattern.replace("{date}", dateStr);
    }

    // Weekly rotation: audit-2025-W03.jsonl
    if (this.config.fileSink.rotation === "weekly") {
      const week = this.getWeekNumber(date);
      const dateStr = `${date.getFullYear()}-W${week.toString().padStart(2, "0")}`;
      return pattern.replace("{date}", dateStr);
    }

    // Monthly rotation: audit-2025-01.jsonl
    if (this.config.fileSink.rotation === "monthly") {
      const dateStr = date.toISOString().slice(0, 7); // YYYY-MM
      return pattern.replace("{date}", dateStr);
    }

    // Default to daily
    return pattern.replace("{date}", date.toISOString().split("T")[0]);
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Rotate logs if max files exceeded
   */
  private async rotateLogsIfNeeded(): Promise<void> {
    const maxFiles = this.config.fileSink.maxFiles ?? 2190;

    try {
      const files = await fs.promises.readdir(this.logDir);
      const auditFiles = files
        .filter(f => f.startsWith("audit-") && f.endsWith(".jsonl"))
        .sort()
        .reverse(); // Newest first

      // Remove oldest files if exceeding max
      if (auditFiles.length > maxFiles) {
        const filesToDelete = auditFiles.slice(maxFiles);
        for (const file of filesToDelete) {
          await fs.promises.unlink(path.join(this.logDir, file));
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to rotate audit logs:", error);
    }
  }

  /**
   * Validate event to ensure no PHI is logged
   */
  private validateEvent(event: AuditEvent): void {
    // Check metadata for common PHI fields
    if (event.metadata) {
      const phiFields = [
        "name",
        "firstName",
        "lastName",
        "dob",
        "dateOfBirth",
        "ssn",
        "address",
        "phone",
        "email",
        "mrn",
        "medicalRecordNumber",
      ];

      for (const field of phiFields) {
        if (field in event.metadata) {
          // eslint-disable-next-line no-console
          console.warn(`[AUDIT] WARNING: Potential PHI field detected: ${field}`);
          delete event.metadata[field];
        }
      }
    }
  }
}

/**
 * Singleton instance (default configuration)
 */
export const auditLogger = new AuditLogger();

/**
 * Create a custom audit logger instance
 */
export function createAuditLogger(config?: AuditLoggerConfig): AuditLogger {
  return new AuditLogger(config);
}
