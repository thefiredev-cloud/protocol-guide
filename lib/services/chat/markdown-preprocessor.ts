import type { KBDoc } from "@/lib/retrieval";
import { createLogger } from "@/lib/log";

/**
 * MarkdownPreprocessor converts JSON knowledge base chunks into structured markdown
 * format optimized for OpenAI GPT-4o comprehension.
 */
export class MarkdownPreprocessor {
  private readonly logger = createLogger("MarkdownPreprocessor");

  /**
   * Convert a single KBDoc to markdown format
   */
  public convertDocToMarkdown(doc: KBDoc): string {
    const lines: string[] = [];

    // Header with protocol/category info
    const header = this.buildHeader(doc);
    lines.push(header);

    // Add category/subcategory context
    if (doc.category || doc.subcategory) {
      lines.push(`**Category:** ${doc.category}${doc.subcategory ? ` / ${doc.subcategory}` : ""}`);
      lines.push("");
    }

    // Convert content to markdown sections
    const formattedContent = this.formatContent(doc);
    lines.push(formattedContent);

    // Add keywords if available
    if (doc.keywords && doc.keywords.length > 0) {
      lines.push("");
      lines.push(`**Keywords:** ${doc.keywords.join(", ")}`);
    }

    return lines.join("\n");
  }

  /**
   * Build markdown context from multiple KBDoc hits
   */
  public buildContextMarkdown(hits: KBDoc[]): string {
    if (hits.length === 0) {
      return "No relevant knowledge base content found.";
    }

    const sections: string[] = [];

    hits.forEach((doc, index) => {
      const markdown = this.convertDocToMarkdown(doc);
      sections.push(`## Document ${index + 1}\n\n${markdown}`);
    });

    return sections.join("\n\n---\n\n");
  }

  /**
   * Format protocol-specific sections (indications, contraindications, medications)
   */
  public formatProtocolSection(doc: KBDoc): string {
    const lines: string[] = [];
    const content = doc.content;

    // Extract protocol code from title or content
    const protocolCode = this.extractProtocolCode(doc.title, content);
    if (protocolCode) {
      lines.push(`# Protocol ${protocolCode} - ${doc.title}`);
    } else {
      lines.push(`# ${doc.title}`);
    }

    lines.push("");

    // Try to parse structured sections from content
    const parsed = this.parseProtocolContent(content);
    if (parsed) {
      if (parsed.overview) {
        lines.push("## Overview");
        lines.push(parsed.overview);
        lines.push("");
      }

      if (parsed.indications && parsed.indications.length > 0) {
        lines.push("## Indications");
        parsed.indications.forEach((indication) => {
          lines.push(`- ${indication}`);
        });
        lines.push("");
      }

      if (parsed.contraindications && parsed.contraindications.length > 0) {
        lines.push("## Contraindications");
        parsed.contraindications.forEach((contraindication) => {
          lines.push(`- ${contraindication}`);
        });
        lines.push("");
      }

      if (parsed.procedure && parsed.procedure.length > 0) {
        lines.push("## Procedure");
        parsed.procedure.forEach((step, index) => {
          lines.push(`${index + 1}. ${step}`);
        });
        lines.push("");
      }

      if (parsed.medications && parsed.medications.length > 0) {
        const medicationTable = this.formatMedicationTable(parsed.medications);
        lines.push("## Medications");
        lines.push(medicationTable);
        lines.push("");
      }

      if (parsed.additionalContent) {
        lines.push("## Additional Information");
        lines.push(parsed.additionalContent);
      }
    } else {
      // Fallback: format content as-is with better structure
      lines.push("## Content");
      lines.push(content);
    }

    return lines.join("\n");
  }

  /**
   * Format medication table from medication data
   */
  public formatMedicationTable(medications: Array<Record<string, unknown>>): string {
    if (medications.length === 0) {
      return "No medication information available.";
    }

    const lines: string[] = [];
    lines.push("| Medication | Dose | Route | Timing | Notes |");
    lines.push("|-----------|------|-------|--------|-------|");

    medications.forEach((med) => {
      const name = String(med.name || med.medication || med.drug || "Unknown");
      const dose = String(med.dose || med.dosage || med.amount || "-");
      const route = String(med.route || med.adminRoute || "-");
      const timing = String(med.timing || med.frequency || "-");
      const notes = String(med.notes || med.contraindications || med.warnings || "-");

      lines.push(`| ${name} | ${dose} | ${route} | ${timing} | ${notes} |`);
    });

    return lines.join("\n");
  }

  /**
   * Build header from document metadata
   */
  private buildHeader(doc: KBDoc): string {
    const parts: string[] = [];

    // Extract protocol code if present
    const protocolCode = this.extractProtocolCode(doc.title, doc.content);
    if (protocolCode) {
      parts.push(`# ${doc.title} (${protocolCode})`);
    } else {
      parts.push(`# ${doc.title}`);
    }

    return parts.join("\n");
  }

  /**
   * Format document content with basic markdown structure
   */
  private formatContent(doc: KBDoc): string {
    // If content appears to be structured JSON, try to parse it
    try {
      const parsed = JSON.parse(doc.content);
      if (typeof parsed === "object" && parsed !== null) {
        return this.formatStructuredContent(parsed);
      }
    } catch {
      // Content is plain text, use as-is
    }

    // Convert plain text content to markdown paragraphs
    return this.formatPlainTextContent(doc.content);
  }

  /**
   * Format structured JSON content to markdown
   */
  private formatStructuredContent(data: Record<string, unknown>): string {
    const lines: string[] = [];

    if (data.content || data.description) {
      lines.push(String(data.content || data.description));
      lines.push("");
    }

    // Add other structured fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === "content" || key === "description") {
        return; // Already handled
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        lines.push(`### ${this.capitalize(key)}`);
        lines.push(JSON.stringify(value, null, 2));
        lines.push("");
      } else if (Array.isArray(value)) {
        lines.push(`### ${this.capitalize(key)}`);
        value.forEach((item) => {
          lines.push(`- ${String(item)}`);
        });
        lines.push("");
      } else if (value) {
        lines.push(`**${this.capitalize(key)}:** ${String(value)}`);
        lines.push("");
      }
    });

    return lines.join("\n");
  }

  /**
   * Format plain text content into readable markdown
   */
  private formatPlainTextContent(content: string): string {
    // Split by double newlines to preserve paragraph structure
    const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    return paragraphs
      .map((para) => {
        const trimmed = para.trim();
        // If it looks like a list, format as list
        if (trimmed.match(/^[-*•]\s+/)) {
          return trimmed;
        }
        // If it looks like a numbered list, format as numbered list
        if (trimmed.match(/^\d+[.)]\s+/)) {
          return trimmed;
        }
        // Otherwise, return as paragraph
        return trimmed;
      })
      .join("\n\n");
  }

  /**
   * Extract protocol code from title or content
   */
  private extractProtocolCode(title: string, content: string): string | null {
    // Try to find protocol code patterns: "TP 1234", "Protocol 1234", "PCM 1.2.1"
    const patterns = [
      /\bTP\s+(\d{4})\b/i,
      /\bProtocol\s+(\d{4})\b/i,
      /\bPCM\s+(\d+\.\d+\.\d+)\b/i,
      /\b(\d{4})\b/, // Simple 4-digit code
    ];

    const searchText = `${title} ${content}`;
    for (const pattern of patterns) {
      const match = searchText.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Parse protocol content to extract structured sections
   */
  private parseProtocolContent(content: string): {
    overview?: string;
    indications?: string[];
    contraindications?: string[];
    procedure?: string[];
    medications?: Array<Record<string, unknown>>;
    additionalContent?: string;
  } | null {
    const result: {
      overview?: string;
      indications?: string[];
      contraindications?: string[];
      procedure?: string[];
      medications?: Array<Record<string, unknown>>;
      additionalContent?: string;
    } = {};

    // Try to extract sections using common patterns
    const indicationMatch = content.match(/indications?[:\s]+([\s\S]*?)(?=contraindications?|procedure|medications?|$)/i);
    if (indicationMatch) {
      result.indications = indicationMatch[1]
        .split(/\n|;|,/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    const contraindicationMatch = content.match(/contraindications?[:\s]+([\s\S]*?)(?=procedure|medications?|indications?|$)/i);
    if (contraindicationMatch) {
      result.contraindications = contraindicationMatch[1]
        .split(/\n|;|,/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    const procedureMatch = content.match(/procedure[:\s]+([\s\S]*?)(?=medications?|indications?|contraindications?|$)/i);
    if (procedureMatch) {
      result.procedure = procedureMatch[1]
        .split(/\n/)
        .map((item) => item.replace(/^\d+[.)]\s*/, "").trim())
        .filter((item) => item.length > 0);
    }

    // Extract overview (first paragraph or section)
    const overviewMatch = content.match(/^([\s\S]+?)(?=indications?|contraindications?|procedure|medications?)/i);
    if (overviewMatch) {
      result.overview = overviewMatch[1].trim();
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

