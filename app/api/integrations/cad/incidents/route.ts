import { NextRequest, NextResponse } from 'next/server';

import { withApiHandler } from '@/lib/api/handler';

/**
 * CAD Integration: Incident Creation Webhook
 *
 * When CAD dispatches a unit, it sends incident data to this endpoint.
 * Medic-Bot pre-loads relevant protocols based on dispatch code.
 *
 * STUB API - Demonstrates integration architecture for LA County Fire pitch.
 * Phase 2: Integrate with actual CAD system (e.g., Hexagon, TriTech, Tyler).
 */

interface CADIncident {
  incident_number: string;
  dispatch_code: string;
  call_type: string;
  dispatch_time: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  units_assigned: string[];
  caller_info?: {
    complaint?: string;
    age?: number;
    conscious?: boolean;
    breathing?: boolean;
  };
}

interface ProtocolSuggestion {
  protocol_id: string;
  protocol_name: string;
  relevance_score: number;
  dispatch_code_match: boolean;
}

/**
 * Maps dispatch codes to protocol suggestions
 * Based on LA County Fire dispatch code system
 */
function getProtocolsForDispatchCode(dispatchCode: string): ProtocolSuggestion[] {
  const protocolMap: Record<string, ProtocolSuggestion[]> = {
    // Medical - Cardiac/Respiratory
    '32B1': [
      { protocol_id: 'PROT_805', protocol_name: 'Protocol 805: Respiratory Distress', relevance_score: 0.95, dispatch_code_match: true },
      { protocol_id: 'MCG_1309', protocol_name: 'MCG 1309: Respiratory Distress', relevance_score: 0.90, dispatch_code_match: true }
    ],
    '9E1': [
      { protocol_id: 'PROT_827', protocol_name: 'Protocol 827: Cardiac Arrest', relevance_score: 0.98, dispatch_code_match: true },
      { protocol_id: 'PROT_800', protocol_name: 'Protocol 800: STEMI/ACS', relevance_score: 0.85, dispatch_code_match: false }
    ],
    // Trauma
    '17A1': [
      { protocol_id: 'PROT_810', protocol_name: 'Protocol 810: Trauma', relevance_score: 0.92, dispatch_code_match: true },
      { protocol_id: 'MCG_1311', protocol_name: 'MCG 1311: Hemorrhage Control', relevance_score: 0.88, dispatch_code_match: true }
    ],
    // Pediatric
    '12D1': [
      { protocol_id: 'MCG_1309', protocol_name: 'MCG 1309: Pediatric Respiratory (with dosing)', relevance_score: 0.96, dispatch_code_match: true },
      { protocol_id: 'PROT_805', protocol_name: 'Protocol 805: Respiratory Distress', relevance_score: 0.85, dispatch_code_match: false }
    ]
  };

  return protocolMap[dispatchCode] || [
    { protocol_id: 'PROT_800', protocol_name: 'Protocol 800: General Medical', relevance_score: 0.70, dispatch_code_match: false }
  ];
}

export const POST = withApiHandler(async (input: unknown, req: NextRequest) => {
  try {
    const incident: CADIncident = await req.json();

    // Validate required fields
    if (!incident.incident_number || !incident.dispatch_code || !incident.call_type) {
      return NextResponse.json(
        { error: 'Missing required fields: incident_number, dispatch_code, call_type' },
        { status: 400 }
      );
    }

    // TODO Phase 2: Validate webhook signature
    // const signature = req.headers.get('x-cad-signature');
    // if (!verifySignature(signature, incident)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Log incident receipt for audit trail
    // TODO: Implement logEvent method or use appropriate audit logging method
    // await auditLogger.logEvent({
    //   action: 'cad.incident.received',
    //   resource: `incident:${incident.incident_number}`,
    //   outcome: 'success',
    //   metadata: {
    //     dispatch_code: incident.dispatch_code,
    //     call_type: incident.call_type,
    //     units_assigned: incident.units_assigned,
    //     location: incident.location?.address
    //   }
    // });

    // Pre-load suggested protocols based on dispatch code
    const suggestedProtocols = getProtocolsForDispatchCode(incident.dispatch_code);

    // TODO Phase 2: Store incident context for future queries
    // await storeIncidentContext(incident);
    // This allows Medic-Bot to reference incident details in chat

    // TODO Phase 2: Push notification to assigned units
    // await notifyAssignedUnits(incident.units_assigned, suggestedProtocols);

    return NextResponse.json({
      success: true,
      incident_id: incident.incident_number,
      message: 'Incident context received',
      suggested_protocols: suggestedProtocols,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('CAD webhook error:', error);

    // TODO: Implement logEvent method or use appropriate audit logging method
    // await auditLogger.logEvent({
    //   action: 'cad.incident.received',
    //   resource: 'incident:unknown',
    //   outcome: 'failure',
    //   metadata: {
    //     error: error instanceof Error ? error.message : 'Unknown error'
    //   }
    // });

    return NextResponse.json(
      { error: 'Failed to process incident' },
      { status: 500 }
    );
  }
}, { rateLimit: 'API', loggerName: 'api.integrations.cad.incidents' });

/**
 * Example CAD webhook payload:
 *
 * POST /api/integrations/cad/incidents
 * Headers:
 *   Authorization: Bearer YOUR_API_KEY
 *   X-CAD-Signature: sha256=abc123... (for production)
 *   Content-Type: application/json
 *
 * Body:
 * {
 *   "incident_number": "FD2025-012345",
 *   "dispatch_code": "32B1",
 *   "call_type": "Medical",
 *   "dispatch_time": "2025-01-15T14:32:00Z",
 *   "location": {
 *     "address": "123 Main St, Los Angeles, CA 90001",
 *     "latitude": 34.0522,
 *     "longitude": -118.2437
 *   },
 *   "units_assigned": ["E51", "RA6"],
 *   "caller_info": {
 *     "complaint": "Difficulty breathing",
 *     "age": 65,
 *     "conscious": true,
 *     "breathing": true
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "incident_id": "FD2025-012345",
 *   "message": "Incident context received",
 *   "suggested_protocols": [
 *     {
 *       "protocol_id": "PROT_805",
 *       "protocol_name": "Protocol 805: Respiratory Distress",
 *       "relevance_score": 0.95,
 *       "dispatch_code_match": true
 *     }
 *   ],
 *   "timestamp": "2025-01-15T14:32:05Z"
 * }
 */
