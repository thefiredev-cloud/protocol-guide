import { createLogger } from "@/lib/log";

/**
 * JsonToMarkdownConverter provides deep conversion of protocol JSON structures
 * to structured markdown format for better LLM comprehension.
 */
export class JsonToMarkdownConverter {
  private readonly logger = createLogger("JsonToMarkdownConverter");

  /**
   * Convert a protocol object to structured markdown
   */
  public convertProtocol(protocol: Record<string, unknown>): string {
    const lines: string[] = [];

    // Protocol header
    const name = String(protocol.tp_name || protocol.name || protocol.title || "Unknown Protocol");
    const code = String(protocol.tp_code || protocol.code || protocol.tpCode || "");
    const header = code ? `# ${name} (${code})` : `# ${name}`;
    lines.push(header);
    lines.push("");

    // Overview section
    if (protocol.content || protocol.description || protocol.overview) {
      lines.push("## Overview");
      lines.push(String(protocol.content || protocol.description || protocol.overview));
      lines.push("");
    }

    // Indications
    const indications = this.extractList(protocol.indications || protocol.indic || protocol.indication);
    if (indications.length > 0) {
      lines.push("## Indications");
      lines.push(this.formatList(indications));
      lines.push("");
    }

    // Contraindications
    const contraindications = this.extractList(
      protocol.contraindications || protocol.contraind || protocol.contraindication,
    );
    if (contraindications.length > 0) {
      lines.push("## Contraindications");
      lines.push(this.formatList(contraindications));
      lines.push("");
    }

    // Procedure
    const procedure = this.extractSteps(protocol.procedure || protocol.steps || protocol.procedures);
    if (procedure.length > 0) {
      lines.push("## Procedure");
      lines.push(this.formatProcedure(procedure));
      lines.push("");
    }

    // Medications
    const medications = this.extractMedications(protocol.medications || protocol.meds || protocol.medication);
    if (medications.length > 0) {
      lines.push("## Medications");
      lines.push(this.formatMedications(medications));
      lines.push("");
    }

    // Monitoring/Vitals
    if (protocol.monitoring || protocol.vitals || protocol.monitoringTargets) {
      lines.push("## Monitoring");
      const monitoring = this.formatMonitoring(protocol.monitoring || protocol.vitals || protocol.monitoringTargets);
      lines.push(monitoring);
      lines.push("");
    }

    // Additional sections
    if (protocol.additionalInformation || protocol.notes || protocol.comments) {
      lines.push("## Additional Information");
      lines.push(String(protocol.additionalInformation || protocol.notes || protocol.comments));
      lines.push("");
    }

    // Citations
    const citations = this.extractCitations(protocol.citations || protocol.references || protocol.sources);
    if (citations.length > 0) {
      lines.push("## Citations");
      lines.push(this.formatCitations(citations));
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Format a list of items as markdown bullets
   */
  public formatList(items: string[]): string {
    if (items.length === 0) {
      return "No items specified.";
    }

    return items.map((item) => `- ${item.trim()}`).join("\n");
  }

  /**
   * Format procedure steps as numbered list
   */
  public formatProcedure(steps: string[]): string {
    if (steps.length === 0) {
      return "No procedure steps specified.";
    }

    return steps.map((step, index) => `${index + 1}. ${step.trim()}`).join("\n");
  }

  /**
   * Format citations as markdown list
   */
  public formatCitations(citations: string[]): string {
    if (citations.length === 0) {
      return "No citations available.";
    }

    return citations.map((citation) => `- ${citation.trim()}`).join("\n");
  }

  /**
   * Extract list from various input formats
   */
  private extractList(input: unknown): string[] {
    if (!input) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.map((item) => String(item));
    }

    if (typeof input === "string") {
      // Try to parse comma/semicolon/newline separated values
      return input
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    if (typeof input === "object") {
      // Convert object to array of key-value pairs
      return Object.entries(input as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`);
    }

    return [String(input)];
  }

  /**
   * Extract procedure steps from various formats
   */
  private extractSteps(input: unknown): string[] {
    if (!input) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.map((step) => String(step));
    }

    if (typeof input === "string") {
      // Split by newlines or numbers
      return input
        .split(/\n|(?=\d+[.)])/)
        .map((step) => step.replace(/^\d+[.)]\s*/, "").trim())
        .filter((step) => step.length > 0);
    }

    return [];
  }

  /**
   * Extract medications from various formats
   */
  private extractMedications(input: unknown): Array<Record<string, unknown>> {
    if (!input) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.map((med) => {
        if (typeof med === "string") {
          return { name: med };
        }
        if (typeof med === "object" && med !== null) {
          return med as Record<string, unknown>;
        }
        return { name: String(med) };
      });
    }

    if (typeof input === "object" && input !== null) {
      // If it's a single medication object, wrap in array
      return [input as Record<string, unknown>];
    }

    return [];
  }

  /**
   * Format medications as markdown table
   */
  private formatMedications(medications: Array<Record<string, unknown>>): string {
    if (medications.length === 0) {
      return "No medications specified.";
    }

    const lines: string[] = [];
    lines.push("| Medication | Dose | Route | Timing | Notes |");
    lines.push("|-----------|------|-------|--------|-------|");

    medications.forEach((med) => {
      const name = String(med.name || med.medication || med.drug || med.medicationName || "Unknown");
      const dose = String(med.dose || med.dosage || med.amount || med.doseAmount || "-");
      const route = String(med.route || med.adminRoute || med.administrationRoute || "-");
      const timing = String(med.timing || med.frequency || med.interval || "-");
      const notes = String(
        med.notes || med.contraindications || med.warnings || med.specialInstructions || "-",
      );

      lines.push(`| ${name} | ${dose} | ${route} | ${timing} | ${notes} |`);
    });

    return lines.join("\n");
  }

  /**
   * Format monitoring/vitals section
   */
  private formatMonitoring(input: unknown): string {
    if (!input) {
      return "No monitoring requirements specified.";
    }

    if (typeof input === "string") {
      return input;
    }

    if (typeof input === "object" && input !== null) {
      const monitoring = input as Record<string, unknown>;
      const lines: string[] = [];

      Object.entries(monitoring).forEach(([key, value]) => {
        if (value) {
          lines.push(`- **${this.capitalize(key)}:** ${String(value)}`);
        }
      });

      return lines.length > 0 ? lines.join("\n") : "No monitoring requirements specified.";
    }

    return String(input);
  }

  /**
   * Extract citations from various formats
   */
  private extractCitations(input: unknown): string[] {
    if (!input) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.map((citation) => String(citation));
    }

    if (typeof input === "string") {
      // Split by common separators
      return input
        .split(/[,;\n]/)
        .map((citation) => citation.trim())
        .filter((citation) => citation.length > 0);
    }

    return [String(input)];
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, " $1").trim();
  }
}

