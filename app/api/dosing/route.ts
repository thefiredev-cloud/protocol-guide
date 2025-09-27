import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

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

export async function GET() {
  metrics.inc("dosing.get.requests");
  const manager = createDefaultMedicationManager();
  const list = manager.list().map((c) => ({ id: c.id, name: c.name, aliases: c.aliases ?? [], categories: c.categories ?? [] }));
  return NextResponse.json({ medications: list });
}

export async function POST(req: NextRequest) {
  const logger = createLogger("api.dosing.post");
  const start = Date.now();
  metrics.inc("dosing.post.requests");
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } }, { status: 400 });
  }

  const parsed = calcSchema.safeParse(json);
  if (!parsed.success) {
    metrics.inc("dosing.post.errors");
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues.map((i) => i.message).join("; ") } },
      { status: 400 },
    );
  }

  const { medicationId, request } = parsed.data as { medicationId: string; request: MedicationCalculationRequest };
  const manager = createDefaultMedicationManager();
  const result = manager.calculate(medicationId, request);
  if (!result) {
    logger.warn("Medication calculator not found", { medicationId });
    metrics.inc("dosing.post.errors");
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Medication not supported" } }, { status: 404 });
  }
  const latencyMs = Date.now() - start;
  metrics.observe("dosing.post.latencyMs", latencyMs);
  return NextResponse.json(result);
}


