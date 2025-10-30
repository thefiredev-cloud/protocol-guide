import { describe, it, expect } from "vitest";
import { MarkdownPreprocessor } from "@/lib/services/chat/markdown-preprocessor";
import type { KBDoc } from "@/lib/retrieval";

describe("MarkdownPreprocessor", () => {
  const preprocessor = new MarkdownPreprocessor();

  describe("convertDocToMarkdown()", () => {
    it("should convert basic KBDoc to markdown", () => {
      const doc: KBDoc = {
        id: "test-1",
        title: "Test Protocol",
        category: "Protocol",
        subcategory: "Emergency",
        content: "This is test content",
        keywords: ["test", "protocol"],
      };

      const result = preprocessor.convertDocToMarkdown(doc);

      expect(result).toContain("# Test Protocol");
      expect(result).toContain("**Category:** Protocol / Emergency");
      expect(result).toContain("This is test content");
      expect(result).toContain("**Keywords:** test, protocol");
    });

    it("should handle documents without subcategory", () => {
      const doc: KBDoc = {
        id: "test-2",
        title: "Test Document",
        category: "Document",
        content: "Content here",
      };

      const result = preprocessor.convertDocToMarkdown(doc);

      expect(result).toContain("# Test Document");
      expect(result).toContain("**Category:** Document");
    });

    it("should extract protocol code from title", () => {
      const doc: KBDoc = {
        id: "test-3",
        title: "Protocol 1230 - Anaphylaxis",
        category: "Protocol",
        content: "Protocol content",
      };

      const result = preprocessor.convertDocToMarkdown(doc);

      expect(result).toContain("# Protocol 1230 - Anaphylaxis");
    });
  });

  describe("buildContextMarkdown()", () => {
    it("should build markdown from multiple hits", () => {
      const hits: KBDoc[] = [
        {
          id: "doc-1",
          title: "Protocol 1",
          category: "Protocol",
          content: "Content 1",
        },
        {
          id: "doc-2",
          title: "Protocol 2",
          category: "Protocol",
          content: "Content 2",
        },
      ];

      const result = preprocessor.buildContextMarkdown(hits);

      expect(result).toContain("## Document 1");
      expect(result).toContain("## Document 2");
      expect(result).toContain("---");
      expect(result).toContain("Protocol 1");
      expect(result).toContain("Protocol 2");
    });

    it("should handle empty hits array", () => {
      const result = preprocessor.buildContextMarkdown([]);

      expect(result).toBe("No relevant knowledge base content found.");
    });
  });

  describe("formatProtocolSection()", () => {
    it("should format protocol with structured sections", () => {
      const doc: KBDoc = {
        id: "test-4",
        title: "Protocol 1230",
        category: "Protocol",
        content: "Indications: Test indication\nContraindications: Test contraindication",
      };

      const result = preprocessor.formatProtocolSection(doc);

      expect(result).toContain("# Protocol 1230");
      expect(result).toContain("## Indications");
      expect(result).toContain("## Contraindications");
    });
  });

  describe("formatMedicationTable()", () => {
    it("should format medications as markdown table", () => {
      const medications = [
        {
          name: "Epinephrine",
          dose: "1 mg",
          route: "IM",
          timing: "Immediate",
          notes: "For anaphylaxis",
        },
        {
          name: "Albuterol",
          dose: "2.5 mg",
          route: "Nebulized",
          timing: "As needed",
        },
      ];

      const result = preprocessor.formatMedicationTable(medications);

      expect(result).toContain("| Medication | Dose | Route | Timing | Notes |");
      expect(result).toContain("| Epinephrine | 1 mg | IM | Immediate | For anaphylaxis |");
      expect(result).toContain("| Albuterol | 2.5 mg | Nebulized | As needed | - |");
    });

    it("should handle empty medications array", () => {
      const result = preprocessor.formatMedicationTable([]);

      expect(result).toBe("No medication information available.");
    });
  });
});

