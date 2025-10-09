import { NextRequest, NextResponse } from 'next/server';

import { auditLogger } from '@/lib/audit/audit-logger';

/**
 * ePCR Integration: Medication Administration Records
 *
 * Returns structured medication data for ePCR import.
 * Supports NEMSIS 3.5.0 medication schema.
 *
 * STUB API - Demonstrates integration architecture for LA County Fire pitch.
 * Phase 2: Connect to actual medication tracking database.
 */

interface MedicationAdministrationRecord {
  medication_name: string;
  dose: string;
  route: string;
  concentration?: string;
  volume_administered?: string;
  time_administered: string;
  administered_by: string;
  protocol_reference: string;
  indication?: string;
  patient_response?: string;
  lot_number?: string;
  expiration_date?: string;
}

/**
 * GET /api/integrations/epcr/medications?incident_id=FD2025-012345
 *
 * Retrieves all medication administration records for an incident
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const incidentId = searchParams.get('incident_id');
  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  if (!incidentId) {
    return NextResponse.json(
      { error: 'incident_id query parameter required' },
      { status: 400 }
    );
  }

  // TODO Phase 2: Retrieve medications from database
  // const medications = await db.medications.findMany({
  //   where: { incident_id: incidentId },
  //   orderBy: { time_administered: 'asc' }
  // });

  // Mock data for demonstration (Phase 1)
  const medications: MedicationAdministrationRecord[] = getMockMedications();

  // Log medication retrieval
  await auditLogger.logError({
    action: 'api.error',
    resource: `epcr:medications:${incidentId}`,
    errorMessage: 'Medication records retrieved',
    ipAddress,
    userAgent,
    sessionId: incidentId,
  });

  return NextResponse.json({
    incident_id: incidentId,
    medications,
    total: medications.length,
    retrieved_at: new Date().toISOString()
  });
}

/**
 * POST /api/integrations/epcr/medications
 *
 * Records a medication administration (for future use)
 */
export async function POST(req: NextRequest) {
  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    const medication: MedicationAdministrationRecord & { incident_id: string } = await req.json();

    // Validate required fields
    if (!medication.incident_id || !medication.medication_name || !medication.dose) {
      return NextResponse.json(
        { error: 'Missing required fields: incident_id, medication_name, dose' },
        { status: 400 }
      );
    }

    // TODO Phase 2: Store medication in database
    // await db.medications.create({ data: medication });

    // Log medication record creation
    await auditLogger.logError({
      action: 'api.error',
      resource: `epcr:medication:${medication.incident_id}`,
      errorMessage: `Medication recorded: ${medication.medication_name} ${medication.dose}`,
      ipAddress,
      userAgent,
      sessionId: medication.incident_id,
    });

    return NextResponse.json({
      success: true,
      medication_id: `MED-${Date.now()}`,
      message: 'Medication record created',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Medication recording error:', error);

    // Log error
    await auditLogger.logError({
      action: 'api.error',
      resource: 'epcr:medication',
      errorMessage: error instanceof Error ? error.message : 'Failed to record medication',
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { error: 'Failed to record medication' },
      { status: 500 }
    );
  }
}

/**
 * Mock medication data for demonstration
 */
function getMockMedications(): MedicationAdministrationRecord[] {
  // Return sample medications based on incident type
  const medications: MedicationAdministrationRecord[] = [
    {
      medication_name: 'Aspirin',
      dose: '324 mg',
      route: 'PO',
      concentration: '81 mg tablets',
      volume_administered: '4 tablets',
      time_administered: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      administered_by: 'P-1001',
      protocol_reference: 'Protocol 800: STEMI/ACS',
      indication: 'Suspected acute coronary syndrome',
      patient_response: 'Tolerated well, chest pain unchanged',
      lot_number: 'ASP202501',
      expiration_date: '2026-12-31'
    },
    {
      medication_name: 'Nitroglycerin',
      dose: '0.4 mg',
      route: 'SL',
      concentration: '0.4 mg/tablet',
      volume_administered: '1 tablet',
      time_administered: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      administered_by: 'P-1001',
      protocol_reference: 'Protocol 800: STEMI/ACS',
      indication: 'Chest pain, BP 140/90',
      patient_response: 'Chest pain reduced from 8/10 to 5/10',
      lot_number: 'NTG202502',
      expiration_date: '2025-06-30'
    }
  ];

  return medications;
}

/**
 * Example GET request:
 *
 * GET /api/integrations/epcr/medications?incident_id=FD2025-012345
 * Headers:
 *   Authorization: Bearer YOUR_API_KEY
 *
 * Response:
 * {
 *   "incident_id": "FD2025-012345",
 *   "medications": [
 *     {
 *       "medication_name": "Epinephrine",
 *       "dose": "1 mg",
 *       "route": "IV",
 *       "concentration": "1:10,000 (0.1 mg/mL)",
 *       "volume_administered": "10 mL",
 *       "time_administered": "2025-01-15T14:35:22Z",
 *       "administered_by": "P-1001",
 *       "protocol_reference": "Protocol 827: Cardiac Arrest",
 *       "indication": "Cardiac arrest",
 *       "patient_response": "ROSC achieved",
 *       "lot_number": "EPI202501",
 *       "expiration_date": "2025-08-15"
 *     }
 *   ],
 *   "total": 1,
 *   "retrieved_at": "2025-01-15T14:45:00.000Z"
 * }
 *
 * Example POST request:
 *
 * POST /api/integrations/epcr/medications
 * Headers:
 *   Authorization: Bearer YOUR_API_KEY
 *   Content-Type: application/json
 *
 * Body:
 * {
 *   "incident_id": "FD2025-012345",
 *   "medication_name": "Morphine",
 *   "dose": "4 mg",
 *   "route": "IV",
 *   "concentration": "10 mg/mL",
 *   "volume_administered": "0.4 mL",
 *   "time_administered": "2025-01-15T14:40:00Z",
 *   "administered_by": "P-1002",
 *   "protocol_reference": "Protocol 815: Pain Management",
 *   "indication": "Severe pain (8/10) from femur fracture",
 *   "patient_response": "Pain reduced to 4/10"
 * }
 */
