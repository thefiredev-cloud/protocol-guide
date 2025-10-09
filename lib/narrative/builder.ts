/**
 * Narrative Builder for ePCR Integration
 *
 * Generates NEMSIS-compliant narratives for export to ePCR systems
 * (ImageTrend, ESO, ZOLL, etc.)
 */

export interface MedicationRecord {
  name: string;
  dose: string;
  route: string;
  time: string;
  concentration?: string;
  volume?: string;
  indication?: string;
  response?: string;
}

export interface NarrativeRequest {
  protocols: string[];
  medications: MedicationRecord[];
  format: 'nemsis' | 'soap' | 'chronological';
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

export interface NarrativeResponse {
  nemsis: string;
  soap: {
    subjective: string[];
    objective: string[];
    assessment: string[];
    plan: string[];
  };
  citations: string[];
}

/**
 * Generate NEMSIS-compliant narrative
 */
export async function generateNarrative(request: NarrativeRequest): Promise<NarrativeResponse> {
  const { protocols, medications, patient_info: patientInfo, vitals } = request;

  // Build SOAP components
  const soap = buildSOAPNarrative(protocols, medications, patientInfo, vitals);

  // Build NEMSIS free-text narrative
  const nemsis = buildNEMSISNarrative(soap);

  // Extract citations from protocols
  const citations = extractCitations(protocols);

  return {
    nemsis,
    soap,
    citations
  };
}

function buildSOAPNarrative(
  protocols: string[],
  medications: MedicationRecord[],
  patientInfo?: NarrativeRequest['patient_info'],
  vitals?: NarrativeRequest['vitals']
) {
  const subjective: string[] = [];
  const objective: string[] = [];
  const assessment: string[] = [];
  const plan: string[] = [];

  // Subjective
  if (patientInfo?.chief_complaint) {
    subjective.push(`Chief complaint: ${patientInfo.chief_complaint}`);
  }
  if (patientInfo?.age) {
    subjective.push(`Patient is ${patientInfo.age}-year-old ${patientInfo.gender || 'patient'}`);
  }

  // Objective
  if (vitals && vitals.length > 0) {
    const initialVitals = vitals[0];
    const vitalString = [
      initialVitals.bp ? `BP ${initialVitals.bp}` : null,
      initialVitals.hr ? `HR ${initialVitals.hr}` : null,
      initialVitals.rr ? `RR ${initialVitals.rr}` : null,
      initialVitals.spo2 ? `SpO2 ${initialVitals.spo2}%` : null,
      initialVitals.temp ? `Temp ${initialVitals.temp}°F` : null
    ].filter(Boolean).join(', ');

    if (vitalString) {
      objective.push(`Initial vitals: ${vitalString}`);
    }
  }

  // Assessment
  protocols.forEach(protocol => {
    assessment.push(`Treated per ${protocol}`);
  });

  // Plan
  medications.forEach(med => {
    const medString = `${med.name} ${med.dose} ${med.route} administered at ${new Date(med.time).toLocaleTimeString()}`;
    plan.push(medString);

    if (med.indication) {
      plan.push(`Indication: ${med.indication}`);
    }
    if (med.response) {
      plan.push(`Patient response: ${med.response}`);
    }
  });

  return {
    subjective,
    objective,
    assessment,
    plan
  };
}

function buildNEMSISNarrative(soap: NarrativeResponse['soap']): string {
  const sections: string[] = [];

  if (soap.subjective.length > 0) {
    sections.push(`SUBJECTIVE: ${soap.subjective.join('. ')}.`);
  }

  if (soap.objective.length > 0) {
    sections.push(`OBJECTIVE: ${soap.objective.join('. ')}.`);
  }

  if (soap.assessment.length > 0) {
    sections.push(`ASSESSMENT: ${soap.assessment.join('. ')}.`);
  }

  if (soap.plan.length > 0) {
    sections.push(`PLAN: ${soap.plan.join('. ')}.`);
  }

  return sections.join('\n\n');
}

function extractCitations(protocols: string[]): string[] {
  const citations: string[] = [];

  protocols.forEach(protocol => {
    if (protocol.includes('Protocol')) {
      citations.push(`LA County EMS Agency ${protocol}`);
    } else if (protocol.includes('MCG')) {
      citations.push(`LA County EMS Agency ${protocol}`);
    }
  });

  return citations;
}

/**
 * Format medication for NEMSIS export
 */
export function formatMedicationForNEMSIS(med: MedicationRecord): string {
  return [
    med.name,
    med.dose,
    med.route,
    med.concentration || '',
    new Date(med.time).toISOString()
  ].filter(Boolean).join(' | ');
}
