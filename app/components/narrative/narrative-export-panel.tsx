"use client";

import { Check, Copy, FileText } from "lucide-react";
import { useCallback,useState } from "react";

import type { CarePlan, NarrativeDraft, NemsisNarrative } from "@/app/types/chat";
import {
  copyToClipboard,
  formatAssessment,
  formatFullExport,
  formatMedications,
  formatNarrative,
  formatPatientInfo,
  formatProcedures,
} from "@/lib/utils/clipboard-export";

export interface NarrativeExportPanelProps {
  soap?: NarrativeDraft;
  nemsis?: NemsisNarrative;
  carePlan?: CarePlan;
  onBuildNarrative?: () => void;
}

type CopiedSection = "patientInfo" | "narrative" | "assessment" | "medications" | "procedures" | "all" | null;

/**
 * Narrative export panel for copying data to ImageTrend
 */
export function NarrativeExportPanel({
  soap,
  nemsis,
  carePlan,
  onBuildNarrative,
}: NarrativeExportPanelProps) {
  const [copiedSection, setCopiedSection] = useState<CopiedSection>(null);

  const handleCopy = useCallback(async (section: CopiedSection, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  }, []);

  const hasData = soap || nemsis || carePlan;

  if (!hasData) {
    return (
      <div className="narrative-export-panel">
        <div className="empty-state">
          <FileText className="empty-state-icon" />
          <h3 className="empty-state-title">No Narrative Yet</h3>
          <p className="empty-state-text">
            Describe your patient scenario and tap &quot;Build Narrative&quot; to generate
            exportable documentation for ImageTrend.
          </p>
          {onBuildNarrative && (
            <button
              type="button"
              className="copy-all-button"
              onClick={onBuildNarrative}
              style={{ marginTop: "16px" }}
            >
              Build Narrative
            </button>
          )}
        </div>
      </div>
    );
  }

  const exportData = formatFullExport(soap, nemsis, carePlan);

  return (
    <div className="narrative-export-panel">
      <div className="narrative-export-header">
        Narrative Export for ImageTrend
      </div>

      {/* Patient Info Section */}
      <div className="narrative-export-section">
        <div className="narrative-section-header">
          <span className="narrative-section-title">Patient Info</span>
          <button
            type="button"
            className={`copy-button ${copiedSection === "patientInfo" ? "copied" : ""}`}
            onClick={() => handleCopy("patientInfo", exportData.patientInfo)}
          >
            {copiedSection === "patientInfo" ? <Check size={14} /> : <Copy size={14} />}
            {copiedSection === "patientInfo" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="narrative-section-content">
          {formatPatientInfo(soap, nemsis)}
        </div>
      </div>

      {/* SOAP Narrative Section */}
      <div className="narrative-export-section">
        <div className="narrative-section-header">
          <span className="narrative-section-title">SOAP Narrative</span>
          <button
            type="button"
            className={`copy-button ${copiedSection === "narrative" ? "copied" : ""}`}
            onClick={() => handleCopy("narrative", exportData.narrative)}
          >
            {copiedSection === "narrative" ? <Check size={14} /> : <Copy size={14} />}
            {copiedSection === "narrative" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="narrative-section-content">
          {formatNarrative(soap)}
        </div>
      </div>

      {/* Assessment Section */}
      <div className="narrative-export-section">
        <div className="narrative-section-header">
          <span className="narrative-section-title">Assessment</span>
          <button
            type="button"
            className={`copy-button ${copiedSection === "assessment" ? "copied" : ""}`}
            onClick={() => handleCopy("assessment", exportData.assessment)}
          >
            {copiedSection === "assessment" ? <Check size={14} /> : <Copy size={14} />}
            {copiedSection === "assessment" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="narrative-section-content">
          {formatAssessment(soap, nemsis)}
        </div>
      </div>

      {/* Medications Section */}
      <div className="narrative-export-section">
        <div className="narrative-section-header">
          <span className="narrative-section-title">Medications</span>
          <button
            type="button"
            className={`copy-button ${copiedSection === "medications" ? "copied" : ""}`}
            onClick={() => handleCopy("medications", exportData.medications)}
          >
            {copiedSection === "medications" ? <Check size={14} /> : <Copy size={14} />}
            {copiedSection === "medications" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="narrative-section-content">
          {formatMedications(nemsis, carePlan)}
        </div>
      </div>

      {/* Procedures Section */}
      <div className="narrative-export-section">
        <div className="narrative-section-header">
          <span className="narrative-section-title">Procedures</span>
          <button
            type="button"
            className={`copy-button ${copiedSection === "procedures" ? "copied" : ""}`}
            onClick={() => handleCopy("procedures", exportData.procedures)}
          >
            {copiedSection === "procedures" ? <Check size={14} /> : <Copy size={14} />}
            {copiedSection === "procedures" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="narrative-section-content">
          {formatProcedures(nemsis)}
        </div>
      </div>

      {/* Copy All Footer */}
      <div className="narrative-export-footer">
        <button
          type="button"
          className={`copy-all-button ${copiedSection === "all" ? "copied" : ""}`}
          onClick={() => handleCopy("all", exportData.full)}
          style={copiedSection === "all" ? { background: "#28a745" } : undefined}
        >
          {copiedSection === "all" ? (
            <>
              <Check size={16} /> Copied All
            </>
          ) : (
            <>
              <Copy size={16} /> Copy All Sections
            </>
          )}
        </button>
      </div>
    </div>
  );
}
