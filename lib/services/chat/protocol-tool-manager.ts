/**
 * ProtocolToolManager defines function calling schemas for protocol retrieval.
 * These tools enable the LLM to actively query protocols based on patient descriptions,
 * call types, and chief complaints.
 *
 * Supports both OpenAI and Claude tool formats.
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

export type ClaudeTool = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
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
      this.getCalculateMedicationDoseTool(),
      this.getTransportRecommendationTool(),
      this.getBaseHospitalInfoTool(),
      this.getDiversionStatusTool(),
      this.getFacilityStatusTool(),
    ];
  }

  /**
   * Get all available protocol retrieval tools as Claude tool definitions
   */
  public static getClaudeTools(): ClaudeTool[] {
    return this.getTools().map(this.convertOpenAIToClaude);
  }

  /**
   * Convert OpenAI function format to Claude tool format
   */
  private static convertOpenAIToClaude(openAITool: OpenAIFunction): ClaudeTool {
    return {
      name: openAITool.function.name,
      description: openAITool.function.description,
      input_schema: openAITool.function.parameters,
    };
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

  /**
   * Calculate medication dosing for adult and pediatric patients
   */
  private static getCalculateMedicationDoseTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "calculate_medication_dose",
        description: "Calculate LA County protocol-compliant medication dosing for adults and pediatrics. Provides exact doses based on patient weight and age. Use this when asked about medication dosing, drug calculations, or specific medication administration.",
        parameters: {
          type: "object",
          properties: {
            medication: {
              type: "string",
              description: "Medication name (e.g., 'epinephrine', 'atropine', 'fentanyl', 'midazolam', 'adenosine', 'amiodarone', 'naloxone', 'dextrose', 'diphenhydramine', 'glucagon')",
            },
            patientAgeYears: {
              type: "number",
              description: "Patient age in years. Used to determine adult vs pediatric dosing (>=15 years = adult)",
            },
            patientWeightKg: {
              type: "number",
              description: "Patient weight in kilograms. Critical for pediatric weight-based dosing",
            },
            scenario: {
              type: "string",
              description: "Clinical scenario (e.g., 'anaphylaxis', 'cardiac_arrest', 'bronchospasm', 'bradycardia', 'svt', 'hypoglycemia', 'opioid_overdose')",
            },
            route: {
              type: "string",
              enum: ["IM", "IV", "IO", "IN", "Neb", "SL", "PO", "SubQ"],
              description: "Preferred administration route if applicable",
            },
          },
          required: ["medication"],
        },
      },
    };
  }

  /**
   * Get transport destination recommendation based on patient condition
   * Includes diversion awareness for real-time hospital availability
   */
  private static getTransportRecommendationTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "get_transport_recommendation",
        description: "Get recommended transport destination based on patient condition and specialty center needs. Includes real-time diversion status awareness. Use this for trauma, STEMI, stroke, burns, pediatric critical, or other specialty transport decisions.",
        parameters: {
          type: "object",
          properties: {
            condition: {
              type: "string",
              enum: [
                "trauma-major",
                "trauma-minor",
                "stemi",
                "stroke",
                "cardiac-arrest",
                "burns-major",
                "burns-minor",
                "pediatric-critical",
                "pediatric-trauma",
                "obstetric-emergency",
                "psychiatric",
                "medical-general",
                "overdose",
                "drowning",
                "hyperbaric",
              ],
              description: "Patient condition category for transport destination",
            },
            isPediatric: {
              type: "boolean",
              description: "Whether the patient is pediatric (age <15)",
              default: false,
            },
            patientAge: {
              type: "number",
              description: "Patient age in years for age-specific destination rules",
            },
            preferredRegion: {
              type: "string",
              enum: ["Central", "North", "South", "East", "West"],
              description: "Preferred LA County region for transport destination",
            },
          },
          required: ["condition"],
        },
      },
    };
  }

  /**
   * Get base hospital information and contact numbers
   */
  private static getBaseHospitalInfoTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "get_base_hospital_info",
        description: "Get LA County base hospital contact information, phone numbers, and capabilities. Use this when the user asks about base hospitals, needs contact numbers, or wants to know about hospital capabilities.",
        parameters: {
          type: "object",
          properties: {
            hospitalName: {
              type: "string",
              description: "Hospital name to look up (partial match supported)",
            },
            region: {
              type: "string",
              enum: ["Central", "North", "South", "East", "West"],
              description: "LA County region to find hospitals in",
            },
            capability: {
              type: "string",
              description: "Required capability (e.g., 'Trauma Center', 'Stroke Center', 'STEMI Center', 'Burn Center')",
            },
            listAll: {
              type: "boolean",
              description: "List all base hospitals with contact information",
              default: false,
            },
          },
          required: [],
        },
      },
    };
  }

  /**
   * Get current hospital diversion status
   */
  private static getDiversionStatusTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "get_diversion_status",
        description: "Get current hospital diversion status including ED saturation, trauma bypass, STEMI bypass, and stroke bypass. Use this to check which hospitals are accepting patients.",
        parameters: {
          type: "object",
          properties: {
            facilityId: {
              type: "string",
              description: "Specific facility ID to check (e.g., 'CSM', 'UCL', 'HAR')",
            },
            region: {
              type: "string",
              enum: ["Central", "North", "South", "East", "West"],
              description: "LA County region to get diversion status for",
            },
            diversionType: {
              type: "string",
              enum: [
                "internal_disaster",
                "saturation",
                "trauma_bypass",
                "stemi_bypass",
                "stroke_bypass",
                "pediatric_bypass",
                "burn_bypass",
                "psych_bypass",
              ],
              description: "Filter by specific diversion type",
            },
            summaryOnly: {
              type: "boolean",
              description: "Return only a summary of active diversions",
              default: false,
            },
          },
          required: [],
        },
      },
    };
  }

  /**
   * Get facility operational status for MCI or specialty routing
   */
  private static getFacilityStatusTool(): OpenAIFunction {
    return {
      type: "function",
      function: {
        name: "get_facility_status",
        description: "Get facility operational status including bed availability, APOT times, and current capacity. Use this for MCI patient distribution or checking hospital availability.",
        parameters: {
          type: "object",
          properties: {
            facilityId: {
              type: "string",
              description: "Specific facility ID to check",
            },
            region: {
              type: "string",
              enum: ["Central", "North", "South", "East", "West"],
              description: "LA County region to get facility status for",
            },
            specialty: {
              type: "string",
              enum: ["trauma", "stemi", "stroke", "pediatric", "burn", "psych"],
              description: "Filter by specialty center type",
            },
            includeAPOT: {
              type: "boolean",
              description: "Include recent APOT (ambulance patient offload time) data",
              default: false,
            },
          },
          required: [],
        },
      },
    };
  }
}

