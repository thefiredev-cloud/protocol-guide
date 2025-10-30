import { createLogger } from "@/lib/log";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * MarkdownValidator validates markdown structure before sending to OpenAI
 * to ensure proper formatting and citation mapping.
 */
export class MarkdownValidator {
  private readonly logger = createLogger("MarkdownValidator");

  /**
   * Validate markdown context structure
   */
  public validate(context: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for basic markdown structure
    if (!context || context.trim().length === 0) {
      errors.push("Context is empty");
      return { valid: false, errors, warnings };
    }

    // Check for protocol headers
    const hasProtocolHeader = /^#\s+.+/.test(context) || /##\s+Document/.test(context);
    if (!hasProtocolHeader) {
      warnings.push("No protocol headers found in markdown - may be plain text");
    }

    // Check for excessive length (could indicate truncation issues)
    const maxLength = 50_000; // Configurable limit
    if (context.length > maxLength) {
      warnings.push(`Context exceeds ${maxLength} characters - may be truncated by LLM`);
    }

    // Check for basic markdown syntax errors
    const malformedTables = this.detectMalformedTables(context);
    if (malformedTables.length > 0) {
      warnings.push(`Found ${malformedTables.length} potentially malformed markdown tables`);
    }

    // Check for citation patterns
    const citationPatterns = this.extractCitations(context);
    if (citationPatterns.length === 0) {
      warnings.push("No citation patterns found - protocols may not be properly referenced");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate citations map to source protocols
   */
  public validateCitations(citations: string[]): boolean {
    if (citations.length === 0) {
      return true; // No citations is valid (may be plain text)
    }

    // Check citation format: Should contain protocol codes (TP, PCM, MCG)
    const validPatterns = [/TP\s+\d{4}/i, /PCM\s+\d+\.\d+\.\d+/i, /MCG\s+\d{4}/i];
    const validCitations = citations.filter((citation) => {
      return validPatterns.some((pattern) => pattern.test(citation));
    });

    if (validCitations.length < citations.length * 0.5) {
      // If less than 50% of citations match expected format, consider invalid
      this.logger.warn("Many citations do not match expected protocol format", {
        total: citations.length,
        valid: validCitations.length,
      });
      return false;
    }

    return true;
  }

  /**
   * Check protocol cross-references in text
   */
  public validateProtocolCrossReferences(text: string): boolean {
    // Look for protocol references that might be broken
    const protocolRefs = text.match(/TP\s+\d{4}|PCM\s+\d+\.\d+\.\d+|MCG\s+\d{4}/gi);
    if (!protocolRefs || protocolRefs.length === 0) {
      return true; // No references is valid
    }

    // Check if references appear to be properly formatted
    const validRefs = protocolRefs.filter((ref) => {
      // Basic validation: should have proper spacing and numbers
      return /^\s*(TP|PCM|MCG)\s+\d/.test(ref.trim());
    });

    return validRefs.length === protocolRefs.length;
  }

  /**
   * Extract citation patterns from markdown text
   */
  private extractCitations(text: string): string[] {
    const citations: string[] = [];

    // Pattern 1: Bullet citations
    const bulletMatches = text.match(/^[-*•]\s+(TP\s+\d{4}|PCM\s+\d+\.\d+\.\d+|MCG\s+\d{4})/gim);
    if (bulletMatches) {
      citations.push(...bulletMatches.map((m) => m.replace(/^[-*•]\s+/, "")));
    }

    // Pattern 2: Inline citations
    const inlineMatches = text.match(/(TP\s+\d{4}|PCM\s+\d+\.\d+\.\d+|MCG\s+\d{4})/gi);
    if (inlineMatches) {
      citations.push(...inlineMatches);
    }

    // Pattern 3: Citations section
    const citationsSection = text.match(/##\s+Citations?\s*\n([\s\S]*?)(?=\n##|$)/i);
    if (citationsSection) {
      const sectionCitations = citationsSection[1].match(/(TP\s+\d{4}|PCM\s+\d+\.\d+\.\d+|MCG\s+\d{4})/gi);
      if (sectionCitations) {
        citations.push(...sectionCitations);
      }
    }

    // Deduplicate
    return Array.from(new Set(citations));
  }

  /**
   * Detect malformed markdown tables
   */
  private detectMalformedTables(text: string): string[] {
    const issues: string[] = [];

    // Find all table blocks
    const tableMatches = text.match(/^\|.*\|$/gm);
    if (!tableMatches || tableMatches.length < 2) {
      return issues; // No tables or just header
    }

    // Check if header separator exists
    const hasSeparator = tableMatches.some((line) => /^\|[\s-:|]+\|$/.test(line));
    if (!hasSeparator) {
      issues.push("Table missing separator row");
    }

    // Check row consistency (all rows should have same number of columns)
    const rows = tableMatches.filter((line) => !/^\|[\s-:|]+\|$/.test(line));
    if (rows.length > 0) {
      const firstRowColumns = (rows[0].match(/\|/g) || []).length;
      const inconsistentRows = rows.filter((row) => {
        const columns = (row.match(/\|/g) || []).length;
        return columns !== firstRowColumns;
      });

      if (inconsistentRows.length > 0) {
        issues.push(`Found ${inconsistentRows.length} rows with inconsistent column counts`);
      }
    }

    return issues;
  }
}

