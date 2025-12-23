/**
 * PATIENT SAFETY CRITICAL TESTS
 * Protocol Tool Manager - Unit Tests
 *
 * These tests validate critical function calling schemas:
 * - All tools present with correct schemas
 * - Required parameters validated
 * - OpenAI ↔ Claude format conversion
 * - Enum values validated for safety
 *
 * Target: 100% coverage
 */

import { describe, it, expect } from "vitest";
import { ProtocolToolManager } from "@/lib/services/chat/protocol-tool-manager";
import type { OpenAIFunction, ClaudeTool } from "@/lib/services/chat/protocol-tool-manager";

describe("ProtocolToolManager - PATIENT SAFETY CRITICAL", () => {
  describe("getTools() - OpenAI Format", () => {
    it("should return all protocol tools", () => {
      const tools = ProtocolToolManager.getTools();

      expect(tools).toHaveLength(10);
      expect(tools.every((tool) => tool.type === "function")).toBe(true);
    });

    it("CRITICAL: should include search_protocols_by_patient_description", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_patient_description",
      );

      expect(tool).toBeDefined();
      expect(tool?.function.description).toContain("patient description");
      expect(tool?.function.parameters.required).toContain("chiefComplaint");
    });

    it("CRITICAL: should include search_protocols_by_call_type", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "search_protocols_by_call_type");

      expect(tool).toBeDefined();
      expect(tool?.function.description).toContain("dispatch code");
    });

    it("CRITICAL: should include calculate_medication_dose", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "calculate_medication_dose");

      expect(tool).toBeDefined();
      expect(tool?.function.description).toContain("medication dosing");
      expect(tool?.function.parameters.required).toContain("medication");
    });

    it("should include get_transport_recommendation", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_transport_recommendation");

      expect(tool).toBeDefined();
      expect(tool?.function.parameters.required).toContain("condition");
    });

    it("should include get_diversion_status", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_diversion_status");

      expect(tool).toBeDefined();
    });

    it("should include all expected tools", () => {
      const tools = ProtocolToolManager.getTools();
      const toolNames = tools.map((t) => t.function.name);

      expect(toolNames).toContain("search_protocols_by_patient_description");
      expect(toolNames).toContain("search_protocols_by_call_type");
      expect(toolNames).toContain("search_protocols_by_chief_complaint");
      expect(toolNames).toContain("get_protocol_by_code");
      expect(toolNames).toContain("get_provider_impressions");
      expect(toolNames).toContain("calculate_medication_dose");
      expect(toolNames).toContain("get_transport_recommendation");
      expect(toolNames).toContain("get_base_hospital_info");
      expect(toolNames).toContain("get_diversion_status");
      expect(toolNames).toContain("get_facility_status");
    });
  });

  describe("Tool Schema Validation - Patient Description", () => {
    it("CRITICAL: should have correct required parameters for patient description", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_patient_description",
      );

      expect(tool?.function.parameters.required).toEqual(["chiefComplaint"]);
    });

    it("CRITICAL: should validate sex enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_patient_description",
      );

      const sexProperty = tool?.function.parameters.properties.sex as any;
      expect(sexProperty).toBeDefined();
      expect(sexProperty.enum).toEqual(["male", "female", "unknown"]);
    });

    it("should have all expected properties for patient description", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_patient_description",
      );

      const properties = tool?.function.parameters.properties;
      expect(properties).toHaveProperty("age");
      expect(properties).toHaveProperty("sex");
      expect(properties).toHaveProperty("chiefComplaint");
      expect(properties).toHaveProperty("symptoms");
      expect(properties).toHaveProperty("vitals");
      expect(properties).toHaveProperty("allergies");
      expect(properties).toHaveProperty("medications");
      expect(properties).toHaveProperty("weightKg");
    });

    it("should have vitals object with correct sub-properties", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_patient_description",
      );

      const vitalsProperty = tool?.function.parameters.properties.vitals as any;
      expect(vitalsProperty.type).toBe("object");
      expect(vitalsProperty.properties).toHaveProperty("systolic");
      expect(vitalsProperty.properties).toHaveProperty("diastolic");
      expect(vitalsProperty.properties).toHaveProperty("heartRate");
      expect(vitalsProperty.properties).toHaveProperty("respiratoryRate");
      expect(vitalsProperty.properties).toHaveProperty("oxygenSaturation");
      expect(vitalsProperty.properties).toHaveProperty("temperature");
      expect(vitalsProperty.properties).toHaveProperty("glucose");
    });
  });

  describe("Tool Schema Validation - Chief Complaint", () => {
    it("CRITICAL: should validate severity enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_chief_complaint",
      );

      const severityProperty = tool?.function.parameters.properties.severity as any;
      expect(severityProperty).toBeDefined();
      expect(severityProperty.enum).toEqual(["mild", "moderate", "severe", "critical"]);
    });

    it("should have required chiefComplaint parameter", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_chief_complaint",
      );

      expect(tool?.function.parameters.required).toContain("chiefComplaint");
    });
  });

  describe("Tool Schema Validation - Medication Dosing", () => {
    it("CRITICAL: should validate route enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "calculate_medication_dose");

      const routeProperty = tool?.function.parameters.properties.route as any;
      expect(routeProperty).toBeDefined();
      expect(routeProperty.enum).toContain("IM");
      expect(routeProperty.enum).toContain("IV");
      expect(routeProperty.enum).toContain("IO");
      expect(routeProperty.enum).toContain("IN");
      expect(routeProperty.enum).toContain("Neb");
      expect(routeProperty.enum).toContain("SL");
      expect(routeProperty.enum).toContain("PO");
      expect(routeProperty.enum).toContain("SubQ");
    });

    it("should have correct required parameters", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "calculate_medication_dose");

      expect(tool?.function.parameters.required).toEqual(["medication"]);
    });

    it("should have all expected properties", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "calculate_medication_dose");

      const properties = tool?.function.parameters.properties;
      expect(properties).toHaveProperty("medication");
      expect(properties).toHaveProperty("patientAgeYears");
      expect(properties).toHaveProperty("patientWeightKg");
      expect(properties).toHaveProperty("scenario");
      expect(properties).toHaveProperty("route");
    });
  });

  describe("Tool Schema Validation - Transport Recommendation", () => {
    it("CRITICAL: should validate condition enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_transport_recommendation");

      const conditionProperty = tool?.function.parameters.properties.condition as any;
      expect(conditionProperty).toBeDefined();
      expect(conditionProperty.enum).toContain("trauma-major");
      expect(conditionProperty.enum).toContain("stemi");
      expect(conditionProperty.enum).toContain("stroke");
      expect(conditionProperty.enum).toContain("cardiac-arrest");
      expect(conditionProperty.enum).toContain("pediatric-critical");
      expect(conditionProperty.enum).toContain("burns-major");
    });

    it("CRITICAL: should validate region enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_transport_recommendation");

      const regionProperty = tool?.function.parameters.properties.preferredRegion as any;
      expect(regionProperty).toBeDefined();
      expect(regionProperty.enum).toEqual(["Central", "North", "South", "East", "West"]);
    });

    it("should have correct required parameters", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_transport_recommendation");

      expect(tool?.function.parameters.required).toEqual(["condition"]);
    });
  });

  describe("Tool Schema Validation - Diversion Status", () => {
    it("CRITICAL: should validate diversion type enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_diversion_status");

      const diversionTypeProperty = tool?.function.parameters.properties.diversionType as any;
      expect(diversionTypeProperty).toBeDefined();
      expect(diversionTypeProperty.enum).toContain("internal_disaster");
      expect(diversionTypeProperty.enum).toContain("saturation");
      expect(diversionTypeProperty.enum).toContain("trauma_bypass");
      expect(diversionTypeProperty.enum).toContain("stemi_bypass");
      expect(diversionTypeProperty.enum).toContain("stroke_bypass");
      expect(diversionTypeProperty.enum).toContain("pediatric_bypass");
      expect(diversionTypeProperty.enum).toContain("burn_bypass");
      expect(diversionTypeProperty.enum).toContain("psych_bypass");
    });

    it("should validate region enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_diversion_status");

      const regionProperty = tool?.function.parameters.properties.region as any;
      expect(regionProperty).toBeDefined();
      expect(regionProperty.enum).toEqual(["Central", "North", "South", "East", "West"]);
    });

    it("should have no required parameters", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_diversion_status");

      expect(tool?.function.parameters.required).toEqual([]);
    });
  });

  describe("Tool Schema Validation - Facility Status", () => {
    it("should validate specialty enum values", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_facility_status");

      const specialtyProperty = tool?.function.parameters.properties.specialty as any;
      expect(specialtyProperty).toBeDefined();
      expect(specialtyProperty.enum).toEqual([
        "trauma",
        "stemi",
        "stroke",
        "pediatric",
        "burn",
        "psych",
      ]);
    });
  });

  describe("getClaudeTools() - Claude Format", () => {
    it("should return all tools in Claude format", () => {
      const claudeTools = ProtocolToolManager.getClaudeTools();

      expect(claudeTools).toHaveLength(10);
      expect(claudeTools.every((tool) => !("type" in tool))).toBe(true);
      expect(claudeTools.every((tool) => "name" in tool)).toBe(true);
      expect(claudeTools.every((tool) => "description" in tool)).toBe(true);
      expect(claudeTools.every((tool) => "input_schema" in tool)).toBe(true);
    });

    it("CRITICAL: should convert OpenAI format to Claude format correctly", () => {
      const openAITools = ProtocolToolManager.getTools();
      const claudeTools = ProtocolToolManager.getClaudeTools();

      expect(claudeTools.length).toBe(openAITools.length);

      // Check first tool conversion
      const openAITool = openAITools[0];
      const claudeTool = claudeTools[0];

      expect(claudeTool.name).toBe(openAITool.function.name);
      expect(claudeTool.description).toBe(openAITool.function.description);
      expect(claudeTool.input_schema).toEqual(openAITool.function.parameters);
    });

    it("should preserve all tool names in conversion", () => {
      const openAITools = ProtocolToolManager.getTools();
      const claudeTools = ProtocolToolManager.getClaudeTools();

      const openAINames = openAITools.map((t) => t.function.name).sort();
      const claudeNames = claudeTools.map((t) => t.name).sort();

      expect(claudeNames).toEqual(openAINames);
    });

    it("should preserve parameter schemas in conversion", () => {
      const claudeTools = ProtocolToolManager.getClaudeTools();
      const patientDescTool = claudeTools.find(
        (t) => t.name === "search_protocols_by_patient_description",
      );

      expect(patientDescTool?.input_schema.type).toBe("object");
      expect(patientDescTool?.input_schema.required).toContain("chiefComplaint");
      expect(patientDescTool?.input_schema.properties).toHaveProperty("age");
      expect(patientDescTool?.input_schema.properties).toHaveProperty("sex");
    });

    it("CRITICAL: should preserve enum values in conversion", () => {
      const claudeTools = ProtocolToolManager.getClaudeTools();
      const patientDescTool = claudeTools.find(
        (t) => t.name === "search_protocols_by_patient_description",
      );

      const sexProperty = patientDescTool?.input_schema.properties.sex as any;
      expect(sexProperty.enum).toEqual(["male", "female", "unknown"]);
    });
  });

  describe("Tool Descriptions - LLM Guidance", () => {
    it("should provide clear when-to-use guidance for patient description tool", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find(
        (t) => t.function.name === "search_protocols_by_patient_description",
      );

      expect(tool?.function.description).toContain("patient description");
      expect(tool?.function.description).toContain("demographics");
    });

    it("should provide clear when-to-use guidance for call type tool", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "search_protocols_by_call_type");

      expect(tool?.function.description).toContain("dispatch code");
      expect(tool?.function.description).toContain("call type");
    });

    it("should provide clear when-to-use guidance for medication dose tool", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "calculate_medication_dose");

      expect(tool?.function.description).toContain("medication dosing");
      expect(tool?.function.description).toContain("weight");
    });

    it("should provide clear when-to-use guidance for transport tool", () => {
      const tools = ProtocolToolManager.getTools();
      const tool = tools.find((t) => t.function.name === "get_transport_recommendation");

      expect(tool?.function.description).toContain("transport destination");
      expect(tool?.function.description).toContain("specialty center");
    });
  });

  describe("Type Safety", () => {
    it("should match OpenAIFunction type structure", () => {
      const tools = ProtocolToolManager.getTools();

      tools.forEach((tool) => {
        // Type check - should compile if types are correct
        const typedTool: OpenAIFunction = tool;
        expect(typedTool.type).toBe("function");
        expect(typeof typedTool.function.name).toBe("string");
        expect(typeof typedTool.function.description).toBe("string");
        expect(typedTool.function.parameters.type).toBe("object");
      });
    });

    it("should match ClaudeTool type structure", () => {
      const tools = ProtocolToolManager.getClaudeTools();

      tools.forEach((tool) => {
        // Type check - should compile if types are correct
        const typedTool: ClaudeTool = tool;
        expect(typeof typedTool.name).toBe("string");
        expect(typeof typedTool.description).toBe("string");
        expect(typedTool.input_schema.type).toBe("object");
      });
    });
  });

  describe("Parameter Descriptions", () => {
    it("should have descriptive parameter descriptions for safety", () => {
      const tools = ProtocolToolManager.getTools();
      const medTool = tools.find((t) => t.function.name === "calculate_medication_dose");

      const weightKgProperty = medTool?.function.parameters.properties.patientWeightKg as any;
      expect(weightKgProperty.description).toContain("kilograms");
      expect(weightKgProperty.description).toContain("pediatric");
    });

    it("should document age threshold for adult vs pediatric", () => {
      const tools = ProtocolToolManager.getTools();
      const medTool = tools.find((t) => t.function.name === "calculate_medication_dose");

      const ageProperty = medTool?.function.parameters.properties.patientAgeYears as any;
      expect(ageProperty.description).toContain(">=15");
      expect(ageProperty.description).toContain("adult");
    });
  });

  describe("Schema Completeness", () => {
    it("should have non-empty descriptions for all tools", () => {
      const tools = ProtocolToolManager.getTools();

      tools.forEach((tool) => {
        expect(tool.function.description.length).toBeGreaterThan(20);
      });
    });

    it("should have non-empty descriptions for all parameters", () => {
      const tools = ProtocolToolManager.getTools();

      tools.forEach((tool) => {
        Object.values(tool.function.parameters.properties).forEach((prop: any) => {
          if (prop.description) {
            expect(prop.description.length).toBeGreaterThan(5);
          }
        });
      });
    });

    it("should have type field for all parameters", () => {
      const tools = ProtocolToolManager.getTools();

      tools.forEach((tool) => {
        Object.entries(tool.function.parameters.properties).forEach(([key, prop]: [string, any]) => {
          // All properties should have a type, unless they're nested objects
          expect(prop.type || prop.enum).toBeDefined();
        });
      });
    });
  });
});
