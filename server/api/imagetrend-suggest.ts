/**
 * ImageTrend Suggest API (v2.0 - Mock/Demo Implementation)
 *
 * This endpoint provides AI-powered protocol suggestions based on
 * patient context from ImageTrend. Designed for partnership demo purposes.
 *
 * PRODUCTION NOTE: This is a mock implementation. Full implementation
 * requires partnership agreement with ImageTrend for API key exchange.
 *
 * Endpoint: POST /api/imagetrend/suggest
 *
 * HIPAA COMPLIANCE:
 * - Patient data (age, vitals, history) is processed in memory only
 * - NO PHI is logged or persisted
 * - Results contain only protocol references, not patient data
 */

import { Request, Response } from "express";
import { z } from "zod";
import { getDb } from "../db";
import { protocolChunks } from "../../drizzle/schema";
import { eq, sql, and, ilike, or } from "drizzle-orm";

// Request validation schema
const SuggestRequestSchema = z.object({
  agency_id: z.string().min(1).max(100),
  chief_complaint: z.string().max(500).optional(),
  patient_age: z.number().int().min(0).max(150).optional(),
  patient_sex: z.enum(["M", "F", "U"]).optional(),
  vital_signs: z.object({
    bp_systolic: z.number().optional(),
    bp_diastolic: z.number().optional(),
    pulse: z.number().optional(),
    spo2: z.number().optional(),
    respiratory_rate: z.number().optional(),
    gcs: z.number().optional(),
    glucose: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
  history: z.array(z.string()).optional(),
  impression: z.string().max(50).optional(),
  limit: z.number().int().min(1).max(10).default(3),
});

type SuggestRequest = z.infer<typeof SuggestRequestSchema>;

// Agency to county ID mapping (would be in database in production)
const AGENCY_COUNTY_MAP: Record<string, number> = {
  "la-county-fd": 1,
  "demo-agency": 1, // Demo uses LA County protocols
  "orange-county-ems": 2,
  "san-diego-ems": 3,
  "riverside-fd": 4,
  "ventura-county-ems": 5,
  "kern-county-fd": 6,
};

// ICD-10 to search term mapping
const ICD10_SEARCH_MAP: Record<string, string> = {
  "I21": "chest pain cardiac",
  "I46": "cardiac arrest",
  "J96": "respiratory failure",
  "R41": "altered mental status",
  "G40": "seizure",
  "I63": "stroke",
  "T78": "allergic reaction anaphylaxis",
  "T40": "overdose",
  "E10": "diabetic hypoglycemia",
  "E11": "diabetic",
  "S00": "trauma",
};

/**
 * Determine age category for protocol filtering
 */
function getAgeCategory(age: number | undefined): "pediatric" | "adult" | "any" {
  if (age === undefined) return "any";
  return age < 18 ? "pediatric" : "adult";
}

/**
 * Generate vital-based alerts
 */
function generateVitalAlerts(vitals?: SuggestRequest["vital_signs"]): string[] {
  const alerts: string[] = [];
  if (!vitals) return alerts;

  if (vitals.bp_systolic && vitals.bp_systolic < 90) {
    alerts.push("HYPOTENSION: Consider fluid resuscitation. Avoid nitroglycerin.");
  }
  if (vitals.bp_systolic && vitals.bp_systolic > 180) {
    alerts.push("HYPERTENSIVE EMERGENCY: Avoid aggressive blood pressure reduction in stroke.");
  }
  if (vitals.pulse && vitals.pulse > 150) {
    alerts.push("TACHYCARDIA: Consider dysrhythmia protocol if unstable.");
  }
  if (vitals.pulse && vitals.pulse < 50) {
    alerts.push("BRADYCARDIA: Consider pacing if symptomatic.");
  }
  if (vitals.spo2 && vitals.spo2 < 90) {
    alerts.push("HYPOXIA: Prioritize airway management and supplemental oxygen.");
  }
  if (vitals.gcs && vitals.gcs <= 8) {
    alerts.push("GCS ≤8: Consider advanced airway management.");
  }
  if (vitals.glucose && vitals.glucose < 60) {
    alerts.push("HYPOGLYCEMIA: Dextrose or glucagon indicated.");
  }
  if (vitals.glucose && vitals.glucose > 400) {
    alerts.push("SEVERE HYPERGLYCEMIA: Consider DKA/HHS protocols.");
  }

  return alerts;
}

/**
 * Build search query from patient context
 */
function buildSearchQuery(input: SuggestRequest): string {
  const terms: string[] = [];

  // Add chief complaint
  if (input.chief_complaint) {
    terms.push(input.chief_complaint);
  }

  // Add ICD-10 mapped terms
  if (input.impression) {
    const prefix = input.impression.substring(0, 3);
    if (ICD10_SEARCH_MAP[prefix]) {
      terms.push(ICD10_SEARCH_MAP[prefix]);
    }
  }

  // Add age category
  const ageCategory = getAgeCategory(input.patient_age);
  if (ageCategory === "pediatric") {
    terms.push("pediatric");
  }

  return terms.join(" ");
}

/**
 * Protocol Suggest Handler
 * POST /api/imagetrend/suggest
 *
 * Returns protocol suggestions based on patient context.
 */
export async function imageTrendSuggestHandler(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();

  try {
    // Validate request body
    const parseResult = SuggestRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid request body",
        code: "VALIDATION_ERROR",
        details: parseResult.error.issues,
      });
      return;
    }

    const input = parseResult.data;

    // Validate agency
    const countyId = AGENCY_COUNTY_MAP[input.agency_id.toLowerCase()];
    if (!countyId) {
      res.status(403).json({
        error: "Agency not authorized for ImageTrend integration",
        code: "AGENCY_NOT_AUTHORIZED",
      });
      return;
    }

    // Build search query
    const searchQuery = buildSearchQuery(input);
    
    // Get database connection
    const db = await getDb();
    if (!db) {
      res.status(500).json({
        error: "Database unavailable",
        code: "DATABASE_ERROR",
      });
      return;
    }

    // Search for relevant protocols
    const ageCategory = getAgeCategory(input.patient_age);
    
    // Build search conditions
    const searchTerms = searchQuery.split(" ").filter(t => t.length > 2);
    const searchConditions = searchTerms.map(term => 
      or(
        ilike(protocolChunks.protocolTitle, `%${term}%`),
        ilike(protocolChunks.content, `%${term}%`)
      )
    );

    // Query protocols
    const protocols = await db
      .select({
        protocolNumber: protocolChunks.protocolNumber,
        protocolTitle: protocolChunks.protocolTitle,
        section: protocolChunks.section,
        content: protocolChunks.content,
        sourcePdfUrl: protocolChunks.sourcePdfUrl,
      })
      .from(protocolChunks)
      .where(
        and(
          eq(protocolChunks.countyId, countyId),
          ...searchConditions
        )
      )
      .limit(input.limit * 3); // Get more to filter

    // Deduplicate and rank protocols
    const protocolMap = new Map<string, typeof protocols[0]>();
    for (const p of protocols) {
      // Filter by age category if pediatric
      if (ageCategory === "pediatric") {
        if (!p.protocolTitle.toLowerCase().includes("pediatric") && 
            !p.protocolNumber.includes("-P")) {
          continue; // Skip non-pediatric protocols for children
        }
      } else if (ageCategory === "adult") {
        // Prefer non-pediatric protocols for adults
        if (p.protocolTitle.toLowerCase().includes("pediatric") ||
            p.protocolNumber.includes("-P")) {
          continue;
        }
      }
      
      if (!protocolMap.has(p.protocolNumber)) {
        protocolMap.set(p.protocolNumber, p);
      }
    }

    // Format response
    const suggestions = Array.from(protocolMap.values())
      .slice(0, input.limit)
      .map((p, idx) => ({
        protocol_number: p.protocolNumber,
        protocol_title: p.protocolTitle,
        relevance_score: 0.95 - (idx * 0.1), // Mock relevance scoring
        age_category: ageCategory,
        url: `https://protocol-guide.app/protocol/${input.agency_id}/${p.protocolNumber}`,
        key_treatments: extractKeyTreatments(p.content),
        contraindication_alerts: generateVitalAlerts(input.vital_signs),
      }));

    // Calculate response time
    const responseTime = Date.now() - startTime;

    res.json({
      suggestions,
      metadata: {
        search_time_ms: responseTime,
        agency: input.agency_id,
        search_query: searchQuery,
        age_category: ageCategory,
      },
    });

  } catch (error) {
    console.error("[ImageTrend Suggest] Error:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
}

/**
 * Extract key treatments from protocol content (mock implementation)
 */
function extractKeyTreatments(content: string): string[] {
  const treatments: string[] = [];
  
  // Simple extraction - would use NLP in production
  const medicationPatterns = [
    /aspirin\s+\d+\s*mg/gi,
    /nitroglycerin\s+\d+\.?\d*\s*mg/gi,
    /epinephrine\s+\d+\.?\d*\s*m?g/gi,
    /naloxone\s+\d+\.?\d*\s*mg/gi,
    /dextrose\s+\d+\.?\d*%/gi,
    /midazolam\s+\d+\.?\d*\s*mg/gi,
    /fentanyl\s+\d+\.?\d*\s*mcg/gi,
  ];

  for (const pattern of medicationPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      treatments.push(...matches.map(m => m.trim()));
    }
  }

  // Add common procedures
  if (/12[\s-]?lead/i.test(content)) {
    treatments.push("12-Lead ECG");
  }
  if (/iv\s+access/i.test(content)) {
    treatments.push("IV Access");
  }
  if (/airway/i.test(content)) {
    treatments.push("Airway Management");
  }

  return [...new Set(treatments)].slice(0, 5);
}

/**
 * Protocol Export Handler (Mock)
 * POST /api/imagetrend/export
 *
 * Exports protocol reference back to ImageTrend ePCR.
 * This is a mock implementation for demo purposes.
 */
export async function imageTrendExportHandler(
  req: Request,
  res: Response
): Promise<void> {
  const ExportRequestSchema = z.object({
    incident_id: z.string().min(1).max(100),
    callback_url: z.string().url(),
    protocol_selection: z.object({
      protocol_number: z.string(),
      protocol_title: z.string(),
      sections_reviewed: z.array(z.string()).optional(),
      medications_calculated: z.array(z.object({
        drug: z.string(),
        dose: z.string(),
        route: z.string(),
      })).optional(),
      timestamp: z.string().optional(),
    }),
  });

  try {
    const parseResult = ExportRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid request body",
        code: "VALIDATION_ERROR",
        details: parseResult.error.issues,
      });
      return;
    }

    const input = parseResult.data;

    // Generate export ID
    const exportId = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // In production, this would POST to the callback_url
    // For demo, we just acknowledge receipt
    console.log(`[ImageTrend Export] Mock export to ${input.callback_url} for incident ${input.incident_id}`);

    res.json({
      success: true,
      export_id: exportId,
      callback_status: "mock_acknowledged",
      message: "Export acknowledged (demo mode - no actual callback made)",
    });

  } catch (error) {
    console.error("[ImageTrend Export] Error:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
}
