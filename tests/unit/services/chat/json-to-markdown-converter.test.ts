import { describe, it, expect } from "vitest";
import { JsonToMarkdownConverter } from "@/lib/services/chat/json-to-markdown-converter";

describe("JsonToMarkdownConverter", () => {
  const converter = new JsonToMarkdownConverter();

  describe("convertProtocol()", () => {
    it("should convert protocol object to markdown", () => {
      const protocol = {
        tp_name: "Anaphylaxis",
        tp_code: "1230",
        content: "Protocol for anaphylaxis management",
        indications: ["Allergic reaction", "Anaphylaxis"],
        contraindications: ["None"],
        procedure: ["Assess airway", "Administer epinephrine"],
        medications: [
          {
            name: "Epinephrine",
            dose: "1 mg",
            route: "IM",
          },
        ],
      };

      const result = converter.convertProtocol(protocol);

      expect(result).toContain("# Anaphylaxis (1230)");
      expect(result).toContain("## Overview");
      expect(result).toContain("## Indications");
      expect(result).toContain("## Contraindications");
      expect(result).toContain("## Procedure");
      expect(result).toContain("## Medications");
    });

    it("should handle protocol without code", () => {
      const protocol = {
        name: "Test Protocol",
        content: "Test content",
      };

      const result = converter.convertProtocol(protocol);

      expect(result).toContain("# Test Protocol");
      expect(result).not.toContain("(");
    });
  });

  describe("formatList()", () => {
    it("should format array as markdown list", () => {
      const items = ["Item 1", "Item 2", "Item 3"];
      const result = converter.formatList(items);

      expect(result).toBe("- Item 1\n- Item 2\n- Item 3");
    });

    it("should handle empty array", () => {
      const result = converter.formatList([]);

      expect(result).toBe("No items specified.");
    });
  });

  describe("formatProcedure()", () => {
    it("should format steps as numbered list", () => {
      const steps = ["Step 1", "Step 2", "Step 3"];
      const result = converter.formatProcedure(steps);

      expect(result).toBe("1. Step 1\n2. Step 2\n3. Step 3");
    });

    it("should handle empty steps array", () => {
      const result = converter.formatProcedure([]);

      expect(result).toBe("No procedure steps specified.");
    });
  });

  describe("formatCitations()", () => {
    it("should format citations as markdown list", () => {
      const citations = ["PCM 1.2.1", "MCG 1309"];
      const result = converter.formatCitations(citations);

      expect(result).toContain("- PCM 1.2.1");
      expect(result).toContain("- MCG 1309");
    });

    it("should handle empty citations array", () => {
      const result = converter.formatCitations([]);

      expect(result).toBe("No citations available.");
    });
  });
});

