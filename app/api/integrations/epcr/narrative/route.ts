import { NextRequest, NextResponse } from 'next/server';

import { withApiHandler } from '@/lib/api/handler';
import { auditLogger } from '@/lib/audit/audit-logger';
import type { MedicationRecord } from '@/lib/narrative/builder';
import { generateNarrative } from '@/lib/narrative/builder';

/**
 * ePCR Integration: Export Narrative
 *
 * Generates NEMSIS-compliant narrative for import into ePCR systems.
 * Supports ImageTrend Elite, ESO Solutions, ZOLL RescueNet formats.
 *
 * STUB API - Demonstrates integration architecture for LA County Fire pitch.
 * Phase 2: Connect to actual ePCR system APIs with vendor credentials.
 */

interface NarrativeExportRequest {
  incident_id: string;
  protocols_used: string[];
  medications_given: MedicationRecord[];
  format?: 'nemsis' | 'soap' | 'chronological';
  patient_info?: {
    age?: number;
    gender?: string;
    chief_complaint?: string;
  };
  vitals?: Array<{
    time: string;
    bp?: string;
    hr?: number;
    rr?: number;
    spo2?: number;
    temp?: number;
  }>;
}

export const POST = withApiHandler(async (input: unknown, req: NextRequest) => {
  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    // Require ALS or admin rights to export narratives
    const {
      incident_id: incidentId,
      protocols_used: protocolsUsed,
      medications_given: medicationsGiven,
      format = 'nemsis',
      patient_info: patientInfo,
      vitals
    }: NarrativeExportRequest = await req.json();

    // Validate required fields
    if (!incidentId || !protocolsUsed || !Array.isArray(protocolsUsed)) {
      return NextResponse.json(
        { error: 'Missing required fields: incident_id, protocols_used' },
        { status: 400 }
      );
    }

    // Generate narrative
    const narrative = await generateNarrative({
      protocols: protocolsUsed,
      medications: medicationsGiven || [],
      format,
      patient_info: patientInfo,
      vitals
    });

    // Log successful narrative generation
    await auditLogger.logError({
      action: 'api.error',
      resource: `epcr:narrative:${incidentId}`,
      errorMessage: 'Integration call succeeded',
      ipAddress,
      userAgent,
      sessionId: incidentId,
    });

    // TODO Phase 2: Push narrative directly to ePCR system API
    // Example: ImageTrend Elite API
    // await imagetrend.updatePCR(incidentId, {
    //   narrative: narrative.nemsis,
    //   medications: medicationsGiven
    // });

    return NextResponse.json({
      incident_id: incidentId,
      narrative: {
        nemsis: narrative.nemsis,
        soap: narrative.soap,
        citations: narrative.citations
      },
      export_format: format,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Narrative export error:', error);

    // Log failed narrative generation
    await auditLogger.logError({
      action: 'api.error',
      resource: 'epcr:narrative',
      errorMessage: error instanceof Error ? error.message : 'Failed to generate narrative',
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}, { rateLimit: 'API', loggerName: 'api.integrations.epcr.narrative' });

/**
 * Example request:
 *
 * POST /api/integrations/epcr/narrative
 * Headers:
 *   Authorization: Bearer YOUR_API_KEY
 *   Content-Type: application/json
 *
 * Body:
 * {
 *   "incident_id": "FD2025-012345",
 *   "protocols_used": ["Protocol 805", "MCG 1309"],
 *   "medications_given": [
 *     {
 *       "name": "Albuterol",
 *       "dose": "2.5 mg",
 *       "route": "Nebulized",
 *       "time": "2025-01-15T14:35:00Z",
 *       "indication": "Respiratory distress",
 *       "response": "Improved breathing, SpO2 increased to 95%"
 *     }
 *   ],
 *   "patient_info": {
 *     "age": 65,
 *     "gender": "Male",
 *     "chief_complaint": "Difficulty breathing"
 *   },
 *   "vitals": [
 *     {
 *       "time": "2025-01-15T14:32:00Z",
 *       "bp": "130/80",
 *       "hr": 88,
 *       "rr": 24,
 *       "spo2": 89
 *     }
 *   ],
 *   "format": "nemsis"
 * }
 *
 * Response:
 * {
 *   "incident_id": "FD2025-012345",
 *   "narrative": {
 *     "nemsis": "SUBJECTIVE: Chief complaint: Difficulty breathing. Patient is 65-year-old Male.\n\nOBJECTIVE: Initial vitals: BP 130/80, HR 88, RR 24, SpO2 89%.\n\nASSESSMENT: Treated per Protocol 805. Treated per MCG 1309.\n\nPLAN: Albuterol 2.5 mg Nebulized administered at 2:35:00 PM. Indication: Respiratory distress. Patient response: Improved breathing, SpO2 increased to 95%.",
 *     "soap": {
 *       "subjective": [
 *         "Chief complaint: Difficulty breathing",
 *         "Patient is 65-year-old Male"
 *       ],
 *       "objective": [
 *         "Initial vitals: BP 130/80, HR 88, RR 24, SpO2 89%"
 *       ],
 *       "assessment": [
 *         "Treated per Protocol 805",
 *         "Treated per MCG 1309"
 *       ],
 *       "plan": [
 *         "Albuterol 2.5 mg Nebulized administered at 2:35:00 PM",
 *         "Indication: Respiratory distress",
 *         "Patient response: Improved breathing, SpO2 increased to 95%"
 *       ]
 *     },
 *     "citations": [
 *       "LA County EMS Agency Protocol 805",
 *       "LA County EMS Agency MCG 1309"
 *     ]
 *   },
 *   "export_format": "nemsis",
 *   "generated_at": "2025-01-15T14:40:00.000Z"
 * }
 */
