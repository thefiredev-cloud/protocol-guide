import * as fs from "node:fs";
import * as path from "node:path";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import type { AuditEvent, AuditLogResponse, AuditQuery } from "@/lib/audit/types";
import { createLogger } from "@/lib/log";

export const runtime = "nodejs";

// Token-based protection for audit endpoints (admin only)
const AUDIT_TOKEN = process.env.AUDIT_ACCESS_TOKEN;

function isAuthorizedForAudit(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  return token === AUDIT_TOKEN;
}

const querySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  outcome: z.enum(["success", "failure", "partial"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  resource: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(50),
});

/**
 * GET /api/audit - Query audit logs with filters
 *
 * Query parameters:
 * - userId: Filter by user ID
 * - action: Filter by action type (e.g., "chat.query", "dosing.calculate")
 * - outcome: Filter by outcome (success, failure, partial)
 * - startDate: ISO 8601 start date (e.g., "2025-01-01")
 * - endDate: ISO 8601 end date (e.g., "2025-12-31")
 * - resource: Filter by resource (e.g., "protocol_query", "authentication")
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50, max: 1000)
 *
 * Returns paginated audit log events
 */
export const GET = withApiHandler(async (input: unknown, req: NextRequest) => {
  const logger = createLogger("api.audit.get");

  try {
    // Token-based protection (admin only)
    if (!isAuthorizedForAudit(req)) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Valid audit access token required" } },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues.map((i) => i.message).join("; ")
          }
        },
        { status: 400 }
      );
    }

    const query: AuditQuery = {
      ...parsed.data,
      action: parsed.data.action as AuditQuery["action"],
    };

    // Read and filter audit logs from file system
    const result = await queryAuditLogs(query);

    logger.info("Audit logs retrieved", {
      total: result.total,
      page: result.page,
      filters: query,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to retrieve audit logs", { message });
    return NextResponse.json(
      { error: { code: "AUDIT_QUERY_FAILED", message } },
      { status: 500 }
    );
  }
}, {
  rateLimit: "API",
  loggerName: "api.audit",
});

/**
 * Query audit logs from JSON Lines files
 */
async function queryAuditLogs(query: AuditQuery): Promise<AuditLogResponse> {
  const logDir = path.join(process.cwd(), "logs");

  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    return {
      events: [],
      total: 0,
      page: query.page ?? 1,
      limit: query.limit ?? 50,
      hasMore: false,
    };
  }

  // Get all audit log files
  const files = fs.readdirSync(logDir)
    .filter(f => f.startsWith("audit-") && f.endsWith(".jsonl"))
    .sort()
    .reverse(); // Newest first

  // Filter by date range if specified
  const filteredFiles = files.filter(file => {
    const dateMatch = file.match(/audit-(\d{4}-\d{2}-\d{2})\.jsonl/);
    if (!dateMatch) return false;

    const fileDate = dateMatch[1];
    if (query.startDate && fileDate < query.startDate) return false;
    if (query.endDate && fileDate > query.endDate) return false;

    return true;
  });

  // Read and parse events from files
  const allEvents: AuditEvent[] = [];

  for (const file of filteredFiles) {
    const filePath = path.join(logDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const event = JSON.parse(line) as AuditEvent;

        // Apply filters
        if (query.userId && event.userId !== query.userId) continue;
        if (query.action && event.action !== query.action) continue;
        if (query.outcome && event.outcome !== query.outcome) continue;
        if (query.resource && event.resource !== query.resource) continue;
        if (query.startDate && event.timestamp < query.startDate) continue;
        if (query.endDate && event.timestamp > query.endDate) continue;

        allEvents.push(event);
      } catch {
        // Skip malformed lines
        continue;
      }
    }
  }

  // Sort by timestamp (newest first)
  allEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Paginate
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEvents = allEvents.slice(startIndex, endIndex);

  return {
    events: paginatedEvents,
    total: allEvents.length,
    page,
    limit,
    hasMore: endIndex < allEvents.length,
  };
}

/**
 * POST /api/audit - Export audit logs (admin only)
 *
 * Body:
 * - format: Export format ("json" or "csv")
 * - filters: Same as GET query parameters
 *
 * Returns downloadable audit log export
 */
export const POST = withApiHandler(async (input: unknown, req: NextRequest) => {
  const logger = createLogger("api.audit.post");

  try {
    // Token-based protection (admin only)
    if (!isAuthorizedForAudit(req)) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Valid audit access token required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const format = body.format ?? "json";

    if (format !== "json" && format !== "csv") {
      return NextResponse.json(
        { error: { code: "INVALID_FORMAT", message: "Format must be 'json' or 'csv'" } },
        { status: 400 }
      );
    }

    // Parse filters
    const parsed = querySchema.safeParse(body.filters ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues.map((i) => i.message).join("; ")
          }
        },
        { status: 400 }
      );
    }

    // Get all events (no pagination for export)
    const query: AuditQuery = {
      ...parsed.data,
      action: parsed.data.action as AuditQuery["action"],
      limit: Number.MAX_SAFE_INTEGER,
    };
    const result = await queryAuditLogs(query);

    logger.info("Audit logs exported", {
      format,
      eventCount: result.events.length,
    });

    // Return as downloadable file
    if (format === "json") {
      return new NextResponse(JSON.stringify(result.events, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="audit-export-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    // CSV format
    const csv = convertToCSV(result.events);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to export audit logs", { message });
    return NextResponse.json(
      { error: { code: "AUDIT_EXPORT_FAILED", message } },
      { status: 500 }
    );
  }
}, {
  rateLimit: "API",
  loggerName: "api.audit",
});

/**
 * Convert audit events to CSV format
 */
function convertToCSV(events: AuditEvent[]): string {
  if (events.length === 0) return "";

  // CSV headers
  const headers = [
    "Event ID",
    "Timestamp",
    "User ID",
    "User Role",
    "Session ID",
    "Action",
    "Resource",
    "Outcome",
    "IP Address",
    "User Agent",
    "Duration (ms)",
    "Error Message",
    "Metadata",
  ];

  const rows = events.map(event => [
    event.eventId,
    event.timestamp,
    event.userId ?? "",
    event.userRole ?? "",
    event.sessionId ?? "",
    event.action,
    event.resource,
    event.outcome,
    event.ipAddress ?? "",
    event.userAgent ?? "",
    event.durationMs?.toString() ?? "",
    event.errorMessage ?? "",
    event.metadata ? JSON.stringify(event.metadata) : "",
  ]);

  // Escape CSV fields
  const escapeCsvField = (field: string): string => {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const csvLines = [
    headers.map(escapeCsvField).join(","),
    ...rows.map(row => row.map(escapeCsvField).join(",")),
  ];

  return csvLines.join("\n");
}
