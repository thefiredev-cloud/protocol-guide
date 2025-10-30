/**
 * ProtocolToolManager defines OpenAI function calling schemas for protocol retrieval.
 * These tools enable the LLM to actively query protocols based on patient descriptions,
 * call types, and chief complaints.
 */

export type OpenAIFunction = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
};

export type { OpenAIFunction as ProtocolTool };

export class ProtocolToolManager {
  /**
   * Get all available protocol retrieval tools as OpenAI function definitions
   */
  public static getTools(): OpenAIFunction[] {
    return [
      this.getSearchProtocolsByPatientDescriptionTool(),
      this.getSearchProtocolsByCallTypeTool(),
      this.getSearchProtocolsByChiefComplaintTool(),
      this.getProtocolByCodeTool(),
      this.getProviderImpressionsTool(),
    ];
  }

  /**
   * Search protocols using patient demographics, symptoms, and vitals
   */
  private static getSearchProtocolsByPatientDescriptionTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "search_protocols_by_patient_description",
        description: "Search for LA County EMS protocols based on patient description including age, sex, symptoms, vitals, and medical history. Use this when the user provides patient demographics or clinical presentation.",
        parameters: {
          type: "object",
          properties: {
            age: {
              type: "number",
              description: "Patient age in years (optional)",
            },
            sex: {
              type: "string",
              enum: ["male", "female", "unknown"],
              description: "Patient sex (optional)",
            },
            chiefComplaint: {
              type: "string",
              description: "Primary complaint or symptom description (e.g., 'chest pain', 'shortness of breath', 'abdominal pain')",
            },
            symptoms: {
              type: "array",
              items: { type: "string" },
              description: "Additional symptoms or clinical findings",
            },
            vitals: {
              type: "object",
              properties: {
                systolic: { type: "number", description: "Systolic blood pressure" },
                diastolic: { type: "number", description: "Diastolic blood pressure" },
                heartRate: { type: "number", description: "Heart rate (bpm)" },
                respiratoryRate: { type: "number", description: "Respiratory rate" },
                oxygenSaturation: { type: "number", description: "SpO2 percentage" },
                temperature: { type: "number", description: "Temperature in Fahrenheit" },
                glucose: { type: "number", description: "Blood glucose (mg/dL)" },
              },
              description: "Vital signs if available",
            },
            allergies: {
              type: "array",
              items: { type: "string" },
              description: "Known allergies",
            },
            medications: {
              type: "array",
              items: { type: "string" },
              description: "Current medications",
            },
            weightKg: {
              type: "number",
              description: "Patient weight in kilograms (important for pediatric dosing)",
            },
          },
          required: ["chiefComplaint"],
        },
      },
    };
  }

  /**
   * Map dispatch codes or call types to protocols
   */
  private static getSearchProtocolsByCallTypeTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "search_protocols_by_call_type",
        description: "Find protocols based on dispatch code or call type description. Use this when the user mentions a dispatch code (e.g., '32B1', '9E1') or describes a call type (e.g., 'cardiac arrest', 'respiratory distress').",
        parameters: {
          type: "object",
          properties: {
            dispatchCode: {
              type: "string",
              description: "LA County Fire dispatch code (e.g., '32B1', '9E1', '17A1')",
            },
            callType: {
              type: "string",
              description: "Natural language description of call type (e.g., 'cardiac arrest', 'respiratory distress', 'trauma', 'stroke')",
            },
          },
          required: [],
        },
      },
    };
  }

  /**
   * Match chief complaints to provider impressions and protocols
   */
  private static getSearchProtocolsByChiefComplaintTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "search_protocols_by_chief_complaint",
        description: "Match chief complaints to LA County Provider Impressions and Treatment Protocols. Use this when the user provides a specific chief complaint or symptom description.",
        parameters: {
          type: "object",
          properties: {
            chiefComplaint: {
              type: "string",
              description: "Chief complaint or primary symptom (e.g., 'chest pain', 'difficulty breathing', 'abdominal pain', 'altered mental status')",
            },
            painLocation: {
              type: "string",
              description: "Pain location if applicable (e.g., 'LUQ', 'RUQ', 'epigastric', 'flank')",
            },
            severity: {
              type: "string",
              enum: ["mild", "moderate", "severe", "critical"],
              description: "Severity level of the complaint",
            },
          },
          required: ["chiefComplaint"],
        },
      },
    };
  }

  /**
   * Retrieve specific protocol by TP code
   */
  private static getProtocolByCodeTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "get_protocol_by_code",
        description: "Retrieve a specific LA County Treatment Protocol by its TP code. Use this when the user asks about a specific protocol number (e.g., 'protocol 1211', 'TP 1205').",
        parameters: {
          type: "object",
          properties: {
            tpCode: {
              type: "string",
              description: "Treatment Protocol code (e.g., '1211', '1205', '1234')",
            },
            includePediatric: {
              type: "boolean",
              description: "Also include pediatric version if available",
              default: true,
            },
          },
          required: ["tpCode"],
        },
      },
    };
  }

  /**
   * Find provider impressions matching symptoms/complaints
   */
  private static getProviderImpressionsTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "get_provider_impressions",
        description: "Find LA County Provider Impressions (PI) that match given symptoms or complaints. Provider Impressions map to Treatment Protocols. Use this to find the correct PI code and corresponding TP code.",
        parameters: {
          type: "object",
          properties: {
            symptoms: {
              type: "array",
              items: { type: "string" },
              description: "List of symptoms, clinical findings, or complaint descriptions",
            },
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Additional keywords to match against PI keywords",
            },
          },
          required: ["symptoms"],
        },
      },
    };
  }
}

