/**
 * PATIENT SAFETY CRITICAL TESTS
 * Drug Tool Manager - Unit Tests
 *
 * These tests validate critical drug intelligence tool schemas:
 * - All tools present with correct schemas
 * - Required parameters validated
 * - Enum values validated for safety
 * - Tool descriptions guide LLM correctly
 *
 * Target: 100% coverage
 */

import { describe, it, expect } from "vitest";
import { DrugToolManager } from "@/lib/services/chat/drug-tool-manager";

describe("DrugToolManager - PATIENT SAFETY CRITICAL", () => {
  describe("getTools()", () => {
    it("should return all drug intelligence tools", () => {
      const tools = DrugToolManager.getTools();

      expect(tools).toHaveLength(3);
      expect(tools.every((tool) => tool.type === "function")).toBe(true);
    });

    it("CRITICAL: should include lookup_drug_info tool", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      expect(tool).toBeDefined();
      expect(tool?.function.description).toContain("drug information");
      expect(tool?.function.parameters.required).toContain("drugName");
    });

    it("CRITICAL: should include check_drug_interactions tool", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      expect(tool).toBeDefined();
      expect(tool?.function.description).toContain("drug-drug interactions");
      expect(tool?.function.parameters.required).toContain("medications");
    });

    it("CRITICAL: should include identify_medication tool", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      expect(tool).toBeDefined();
      expect(tool?.function.description).toContain("identify");
      expect(tool?.function.description).toContain("pill");
    });

    it("should include all expected tools", () => {
      const tools = DrugToolManager.getTools();
      const toolNames = tools.map((t) => t.function.name);

      expect(toolNames).toContain("lookup_drug_info");
      expect(toolNames).toContain("check_drug_interactions");
      expect(toolNames).toContain("identify_medication");
    });
  });

  describe("Tool Schema Validation - lookup_drug_info", () => {
    it("CRITICAL: should require drugName parameter", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      expect(tool?.function.parameters.required).toEqual(["drugName"]);
    });

    it("should have drugName as string type", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      const drugNameProperty = tool?.function.parameters.properties.drugName as any;
      expect(drugNameProperty).toBeDefined();
      expect(drugNameProperty.type).toBe("string");
    });

    it("should have includeInteractions boolean parameter", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      const includeInteractionsProperty = tool?.function.parameters.properties
        .includeInteractions as any;
      expect(includeInteractionsProperty).toBeDefined();
      expect(includeInteractionsProperty.type).toBe("boolean");
    });

    it("should have descriptive parameter descriptions", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      const drugNameProperty = tool?.function.parameters.properties.drugName as any;
      expect(drugNameProperty.description).toContain("brand");
      expect(drugNameProperty.description).toContain("generic");
    });

    it("should provide usage guidance in description", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      expect(tool?.function.description).toContain("when asked about a specific medication");
      expect(tool?.function.description).toContain("EMS-relevant");
    });
  });

  describe("Tool Schema Validation - check_drug_interactions", () => {
    it("CRITICAL: should require medications parameter", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      expect(tool?.function.parameters.required).toEqual(["medications"]);
    });

    it("should define medications as array of strings", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      const medicationsProperty = tool?.function.parameters.properties.medications as any;
      expect(medicationsProperty).toBeDefined();
      expect(medicationsProperty.type).toBe("array");
      expect(medicationsProperty.items).toEqual({ type: "string" });
    });

    it("should specify minimum 2 medications in description", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      const medicationsProperty = tool?.function.parameters.properties.medications as any;
      expect(medicationsProperty.description).toContain("Minimum 2 medications");
    });

    it("should have includeMinor boolean parameter", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      const includeMinorProperty = tool?.function.parameters.properties.includeMinor as any;
      expect(includeMinorProperty).toBeDefined();
      expect(includeMinorProperty.type).toBe("boolean");
    });

    it("should provide usage guidance in description", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      expect(tool?.function.description).toContain("multiple medications");
      expect(tool?.function.description).toContain("interaction risks");
      expect(tool?.function.description).toContain("field management");
    });

    it("should document default behavior for includeMinor", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      const includeMinorProperty = tool?.function.parameters.properties.includeMinor as any;
      expect(includeMinorProperty.description).toContain("default: false");
      expect(includeMinorProperty.description).toContain("only major/moderate");
    });
  });

  describe("Tool Schema Validation - identify_medication", () => {
    it("should have no required parameters (all optional)", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      expect(tool?.function.parameters.required).toEqual([]);
    });

    it("should have imprint string parameter", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      const imprintProperty = tool?.function.parameters.properties.imprint as any;
      expect(imprintProperty).toBeDefined();
      expect(imprintProperty.type).toBe("string");
    });

    it("should have color string parameter", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      const colorProperty = tool?.function.parameters.properties.color as any;
      expect(colorProperty).toBeDefined();
      expect(colorProperty.type).toBe("string");
    });

    it("CRITICAL: should validate shape enum values", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      const shapeProperty = tool?.function.parameters.properties.shape as any;
      expect(shapeProperty).toBeDefined();
      expect(shapeProperty.enum).toContain("round");
      expect(shapeProperty.enum).toContain("oval");
      expect(shapeProperty.enum).toContain("capsule");
      expect(shapeProperty.enum).toContain("diamond");
      expect(shapeProperty.enum).toContain("triangle");
      expect(shapeProperty.enum).toContain("square");
      expect(shapeProperty.enum).toContain("rectangle");
      expect(shapeProperty.enum).toContain("other");
    });

    it("should have patientDescription string parameter", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      const patientDescProperty = tool?.function.parameters.properties
        .patientDescription as any;
      expect(patientDescProperty).toBeDefined();
      expect(patientDescProperty.type).toBe("string");
    });

    it("should provide usage guidance in description", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      expect(tool?.function.description).toContain("identify");
      expect(tool?.function.description).toContain("unknown medication");
      expect(tool?.function.description).toContain("pill appearance");
      expect(tool?.function.description).toContain("confidence level");
    });

    it("should provide examples in parameter descriptions", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      const imprintProperty = tool?.function.parameters.properties.imprint as any;
      expect(imprintProperty.description).toContain("M32");
      expect(imprintProperty.description).toContain("WATSON 540");

      const colorProperty = tool?.function.parameters.properties.color as any;
      expect(colorProperty.description).toContain("white");
      expect(colorProperty.description).toContain("blue");
    });
  });

  describe("Tool Descriptions - LLM Guidance", () => {
    it("should guide LLM when to use lookup_drug_info", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      expect(tool?.function.description).toContain("when asked about a specific medication");
      expect(tool?.function.description).toContain("brand or generic");
    });

    it("should guide LLM when to use check_drug_interactions", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      expect(tool?.function.description).toContain("when patient has multiple medications");
      expect(tool?.function.description).toContain("assess interaction risks");
    });

    it("should guide LLM when to use identify_medication", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      expect(tool?.function.description).toContain("paramedic finds unidentified pills");
      expect(tool?.function.description).toContain("patient cannot name their medication");
    });
  });

  describe("Schema Completeness", () => {
    it("should have non-empty descriptions for all tools", () => {
      const tools = DrugToolManager.getTools();

      tools.forEach((tool) => {
        expect(tool.function.description.length).toBeGreaterThan(50);
      });
    });

    it("should have non-empty descriptions for all parameters", () => {
      const tools = DrugToolManager.getTools();

      tools.forEach((tool) => {
        Object.values(tool.function.parameters.properties).forEach((prop: any) => {
          if (prop.description) {
            expect(prop.description.length).toBeGreaterThanOrEqual(10);
          }
        });
      });
    });

    it("should have type field for all parameters", () => {
      const tools = DrugToolManager.getTools();

      tools.forEach((tool) => {
        Object.entries(tool.function.parameters.properties).forEach(
          ([key, prop]: [string, any]) => {
            // All properties should have a type
            expect(prop.type || prop.enum).toBeDefined();
          },
        );
      });
    });

    it("should have proper object structure for all tools", () => {
      const tools = DrugToolManager.getTools();

      tools.forEach((tool) => {
        expect(tool.type).toBe("function");
        expect(tool.function).toBeDefined();
        expect(tool.function.name).toBeDefined();
        expect(tool.function.description).toBeDefined();
        expect(tool.function.parameters).toBeDefined();
        expect(tool.function.parameters.type).toBe("object");
        expect(tool.function.parameters.properties).toBeDefined();
        expect(tool.function.parameters.required).toBeDefined();
        expect(Array.isArray(tool.function.parameters.required)).toBe(true);
      });
    });
  });

  describe("Type Safety", () => {
    it("should have consistent type structure across all tools", () => {
      const tools = DrugToolManager.getTools();

      tools.forEach((tool) => {
        expect(tool.type).toBe("function");
        expect(typeof tool.function.name).toBe("string");
        expect(typeof tool.function.description).toBe("string");
        expect(tool.function.parameters.type).toBe("object");
        expect(typeof tool.function.parameters.properties).toBe("object");
        expect(Array.isArray(tool.function.parameters.required)).toBe(true);
      });
    });

    it("should match ToolFunction interface structure", () => {
      const tools = DrugToolManager.getTools();

      // If this compiles, the type structure is correct
      tools.forEach((tool) => {
        expect(tool).toHaveProperty("type");
        expect(tool).toHaveProperty("function");
        expect(tool.function).toHaveProperty("name");
        expect(tool.function).toHaveProperty("description");
        expect(tool.function).toHaveProperty("parameters");
      });
    });
  });

  describe("Parameter Types", () => {
    it("should use correct types for lookup_drug_info parameters", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      const drugNameProperty = tool?.function.parameters.properties.drugName as any;
      expect(drugNameProperty.type).toBe("string");

      const includeInteractionsProperty = tool?.function.parameters.properties
        .includeInteractions as any;
      expect(includeInteractionsProperty.type).toBe("boolean");
    });

    it("should use correct types for check_drug_interactions parameters", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      const medicationsProperty = tool?.function.parameters.properties.medications as any;
      expect(medicationsProperty.type).toBe("array");
      expect(medicationsProperty.items.type).toBe("string");

      const includeMinorProperty = tool?.function.parameters.properties.includeMinor as any;
      expect(includeMinorProperty.type).toBe("boolean");
    });

    it("should use correct types for identify_medication parameters", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      const imprintProperty = tool?.function.parameters.properties.imprint as any;
      expect(imprintProperty.type).toBe("string");

      const colorProperty = tool?.function.parameters.properties.color as any;
      expect(colorProperty.type).toBe("string");

      const shapeProperty = tool?.function.parameters.properties.shape as any;
      expect(shapeProperty.type).toBe("string");
      expect(Array.isArray(shapeProperty.enum)).toBe(true);

      const patientDescProperty = tool?.function.parameters.properties
        .patientDescription as any;
      expect(patientDescProperty.type).toBe("string");
    });
  });

  describe("Field Safety Features", () => {
    it("should emphasize field-friendly output in lookup_drug_info", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      expect(tool?.function.description).toContain("field-friendly");
      expect(tool?.function.description).toContain("bullet points");
    });

    it("should emphasize field management in check_drug_interactions", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      expect(tool?.function.description).toContain("field management");
    });

    it("should provide confidence level in identify_medication", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      expect(tool?.function.description).toContain("confidence level");
      expect(tool?.function.description).toContain("possible matches");
    });
  });

  describe("Required vs Optional Parameters", () => {
    it("should require only essential parameters for lookup_drug_info", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "lookup_drug_info");

      // Only drugName is required, includeInteractions is optional
      expect(tool?.function.parameters.required).toHaveLength(1);
      expect(tool?.function.parameters.required).toContain("drugName");
    });

    it("should require only essential parameters for check_drug_interactions", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "check_drug_interactions");

      // Only medications array is required
      expect(tool?.function.parameters.required).toHaveLength(1);
      expect(tool?.function.parameters.required).toContain("medications");
    });

    it("should make all parameters optional for identify_medication", () => {
      const tools = DrugToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "identify_medication");

      // All parameters are optional - any combination can be used for identification
      expect(tool?.function.parameters.required).toHaveLength(0);
    });
  });
});
