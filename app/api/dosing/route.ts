import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { auditLogger } from "@/lib/audit/audit-logger";
import { createDefaultMedicationManager } from "@/lib/dosing/registry";
import type { MedicationCalculationRequest } from "@/lib/dosing/types";
import { createLogger } from "@/lib/log";
import { metrics } from "@/lib/managers/metrics-manager";

export const runtime = "nodejs";

const calcSchema = z.object({
  medicationId: z.string().min(1),
  request: z
    .object({
      patientAgeYears: z.number().optional(),
      patientWeightKg: z.number().optional(),
      systolicBP: z.number().optional(),
      heartRate: z.number().optional(),
      respiratoryRate: z.number().optional(),
      spo2: z.number().optional(),
      scenario: z.string().optional(),
      route: z.string().optional(),
      isPregnant: z.boolean().optional(),
      contraindications: z.array(z.string()).optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, { message: "request must include at least one field" }),
});

export async function GET(req: NextRequest) {
  metrics.inc("dosing.get.requests");
  const manager = createDefaultMedicationManager();
  const list = manager.list().map((c) => ({ id: c.id, name: c.name, aliases: c.aliases ?? [], categories: c.categories ?? [] }));

  // Log dosing list retrieval
  await auditLogger.logDosingList({
    ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ medications: list });
}

export const POST = withApiHandler(async (input: z.infer<typeof calcSchema>, req: NextRequest) => {
  const logger = createLogger("api.dosing.post");
  const start = Date.now();
  metrics.inc("dosing.post.requests");

  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const { medicationId, request } = input as { medicationId: string; request: MedicationCalculationRequest };
  const manager = createDefaultMedicationManager();
  const result = manager.calculate(medicationId, request);
  const latencyMs = Date.now() - start;

  if (!result) {
    logger.warn("Medication calculator not found", { medicationId });
    metrics.inc("dosing.post.errors");

    await auditLogger.logDosingCalc({
      medicationId,
      outcome: "failure",
      ipAddress,
      userAgent,
      durationMs: latencyMs,
      errorMessage: "Medication not supported",
    });

    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Medication not supported" } }, { status: 404 });
  }

  const patientAgeRange = (request as MedicationCalculationRequest).patientAgeYears
    ? (request as MedicationCalculationRequest).patientAgeYears! < 18
      ? "pediatric"
      : (request as MedicationCalculationRequest).patientAgeYears! >= 65
        ? "geriatric"
        : "adult"
    : undefined;

  await auditLogger.logDosingCalc({
    medicationId,
    medicationName: result.medicationName,
    patientAgeRange,
    outcome: "success",
    ipAddress,
    userAgent,
    durationMs: latencyMs,
  });

  metrics.observe("dosing.post.latencyMs", latencyMs);
  return NextResponse.json(result);
}, {
  schema: calcSchema,
  rateLimit: "API",
  onAudit: async ({ req, ok, status, durationMs }) => {
    const logger = createLogger("audit.api.dosing");
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
    logger.info("dosing.post", { ok, status, durationMs, ip });
  },
  loggerName: "api.dosing",
});


