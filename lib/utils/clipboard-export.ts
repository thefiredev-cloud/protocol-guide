/**
 * Clipboard export utilities for ImageTrend integration
 * Formats narrative data for pasting into ImageTrend tabs
 */

import type { CarePlan, NarrativeDraft, NemsisNarrative } from "@/app/types/chat";

export interface ExportData {
  patientInfo: string;
  narrative: string;
  assessment: string;
  medications: string;
  procedures: string;
  full: string;
}

/**
 * Format patient info for ImageTrend Patient Info tab
 */
export function formatPatientInfo(
  soap?: NarrativeDraft,
  nemsis?: NemsisNarrative
): string {
  const lines: string[] = [];

  if (nemsis?.eSituation) {
    if (nemsis.eSituation.primaryComplaint) {
      lines.push(`Chief Complaint: ${nemsis.eSituation.primaryComplaint}`);
    }
    if (nemsis.eSituation.providerPrimaryImpression) {
      lines.push(`Provider Impression: ${nemsis.eSituation.providerPrimaryImpression}`);
    }
  }

  // Extract from SOAP sections if available
  const subjSection = soap?.sections?.find(s =>
    s.title.toLowerCase().includes('subjective') || s.title.toLowerCase().includes('history')
  );
  const subjContent = subjSection?.lines?.join(' ') ?? '';

  const demoMatch = subjContent.match(/(\d+)\s*(?:yo|y\/o|year[- ]old)/i);
  if (demoMatch) {
    lines.push(`Age: ${demoMatch[1]} years old`);
  }

  const sexMatch = subjContent.match(/\b(male|female|man|woman)\b/i);
  if (sexMatch) {
    lines.push(`Sex: ${sexMatch[1]}`);
  }

  return lines.join("\n") || "No patient info available";
}

/**
 * Format SOAP narrative for ImageTrend Narrative tab
 */
export function formatNarrative(soap?: NarrativeDraft): string {
  if (!soap || !soap.sections || soap.sections.length === 0) {
    return "No narrative available";
  }

  const parts: string[] = [];

  for (const section of soap.sections) {
    if (section.lines.length > 0) {
      parts.push(`${section.title.toUpperCase()}:`);
      parts.push(section.lines.join('\n'));
      parts.push('');
    }
  }

  return parts.join('\n').trim() || "No narrative available";
}

/**
 * Format assessment data for ImageTrend Assessment tab
 */
export function formatAssessment(
  soap?: NarrativeDraft,
  nemsis?: NemsisNarrative
): string {
  const lines: string[] = [];

  // Vitals from NEMSIS
  if (nemsis?.eVitals && nemsis.eVitals.length > 0) {
    lines.push("VITAL SIGNS:");
    nemsis.eVitals.forEach((v, i) => {
      const vitalsLine = [
        v.bp && `BP: ${v.bp}`,
        v.hr && `HR: ${v.hr}`,
        v.rr && `RR: ${v.rr}`,
        v.spo2 && `SpO2: ${v.spo2}%`,
        v.temp && `Temp: ${v.temp}`,
        v.gcs && `GCS: ${v.gcs}`,
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(`  Set ${i + 1}: ${vitalsLine}`);
    });
  }

  // Assessment from SOAP sections
  if (soap?.sections) {
    const assessSection = soap.sections.find(s =>
      s.title.toLowerCase().includes('assessment') || s.title.toLowerCase().includes('impression')
    );
    if (assessSection && assessSection.lines.length > 0) {
      lines.push("");
      lines.push("ASSESSMENT:");
      lines.push(assessSection.lines.join('\n'));
    }
  }

  return lines.join("\n") || "No assessment data available";
}

/**
 * Format medications for ImageTrend Medications tab
 */
export function formatMedications(
  nemsis?: NemsisNarrative,
  carePlan?: CarePlan
): string {
  const lines: string[] = [];

  if (nemsis?.eMedications && nemsis.eMedications.length > 0) {
    nemsis.eMedications.forEach((med) => {
      const medLine = [
        med.name,
        med.dose,
        med.route,
        med.time && `@ ${med.time}`,
      ]
        .filter(Boolean)
        .join(" ");
      lines.push(medLine);
    });
  }

  if (carePlan?.basicMedications && carePlan.basicMedications.length > 0) {
    if (lines.length > 0) lines.push("");
    lines.push("From Care Plan:");
    carePlan.basicMedications.forEach((med) => {
      lines.push(`  ${med}`);
    });
  }

  return lines.join("\n") || "No medications administered";
}

/**
 * Format procedures for ImageTrend Procedures tab
 */
export function formatProcedures(nemsis?: NemsisNarrative): string {
  if (!nemsis?.eProcedures || nemsis.eProcedures.length === 0) {
    return "No procedures performed";
  }

  return nemsis.eProcedures.map(p => {
    if (typeof p === 'string') return p;
    return [p.name, p.time && `@ ${p.time}`, p.response].filter(Boolean).join(' - ');
  }).join("\n");
}

/**
 * Format all data for full export
 */
export function formatFullExport(
  soap?: NarrativeDraft,
  nemsis?: NemsisNarrative,
  carePlan?: CarePlan
): ExportData {
  const patientInfo = formatPatientInfo(soap, nemsis);
  const narrative = formatNarrative(soap);
  const assessment = formatAssessment(soap, nemsis);
  const medications = formatMedications(nemsis, carePlan);
  const procedures = formatProcedures(nemsis);

  const fullSections = [
    "=== PATIENT INFO ===",
    patientInfo,
    "",
    "=== NARRATIVE ===",
    narrative,
    "",
    "=== ASSESSMENT ===",
    assessment,
    "",
    "=== MEDICATIONS ===",
    medications,
    "",
    "=== PROCEDURES ===",
    procedures,
  ];

  return {
    patientInfo,
    narrative,
    assessment,
    medications,
    procedures,
    full: fullSections.join("\n"),
  };
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers or non-secure contexts
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "-999999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
