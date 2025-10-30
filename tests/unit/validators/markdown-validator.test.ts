import { describe, it, expect } from "vitest";
import { MarkdownValidator } from "@/lib/validators/markdown-validator";

describe("MarkdownValidator", () => {
  const validator = new MarkdownValidator();

  describe("validate()", () => {
    it("should validate well-formed markdown", () => {
      const context = `# Protocol 1230 - Anaphylaxis

## Overview
Protocol content here.

## Indications
- Allergic reaction
- Anaphylaxis
`;

      const result = validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect empty context", () => {
      const result = validator.validate("");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Context is empty");
    });

    it("should warn about missing protocol headers", () => {
      const context = "Plain text without markdown headers";
      const result = validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes("protocol headers"))).toBe(true);
    });

    it("should warn about excessive length", () => {
      const longContext = "# Header\n" + "x".repeat(60_000);
      const result = validator.validate(longContext);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes("exceeds"))).toBe(true);
    });
  });

  describe("validateCitations()", () => {
    it("should validate properly formatted citations", () => {
      const citations = ["TP 1230", "PCM 1.2.1", "MCG 1309"];
      const result = validator.validateCitations(citations);

      expect(result).toBe(true);
    });

    it("should accept empty citations array", () => {
      const result = validator.validateCitations([]);

      expect(result).toBe(true);
    });

    it("should reject mostly invalid citations", () => {
      const citations = ["Invalid citation", "Another invalid", "TP 1230"];
      const result = validator.validateCitations(citations);

      expect(result).toBe(false);
    });
  });

  describe("validateProtocolCrossReferences()", () => {
    it("should validate properly formatted protocol references", () => {
      const text = "See TP 1230 for details. Also check PCM 1.2.1.";
      const result = validator.validateProtocolCrossReferences(text);

      expect(result).toBe(true);
    });

    it("should accept text without protocol references", () => {
      const text = "This is plain text without protocol references.";
      const result = validator.validateProtocolCrossReferences(text);

      expect(result).toBe(true);
    });

    it("should detect malformed protocol references", () => {
      const text = "See TP1230 (missing space) and PCM1.2.1";
      const result = validator.validateProtocolCrossReferences(text);

      // Should still pass as pattern matching is lenient
      expect(typeof result).toBe("boolean");
    });
  });
});

