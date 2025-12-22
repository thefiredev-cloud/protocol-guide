/**
 * Drug Tool Manager
 *
 * Defines LLM function call tools for drug intelligence features.
 * Mirrors the pattern from ProtocolToolManager.
 */

// Tool definition type (matches OpenAI function calling format)
interface ToolFunction {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

export class DrugToolManager {
  /**
   * Get all drug intelligence tools
   */
  public static getTools(): ToolFunction[] {
    return [
      this.getLookupDrugTool(),
      this.getCheckInteractionsTool(),
      this.getIdentifyDrugTool(),
    ];
  }

  /**
   * Look up drug information by name
   */
  private static getLookupDrugTool(): ToolFunction {
    return {
      type: "function",
      function: {
        name: "lookup_drug_info",
        description:
          "Look up detailed drug information including uses, warnings, and EMS-relevant details. " +
          "Use when asked about a specific medication by name (brand or generic). " +
          "Returns 4-5 field-friendly bullet points about the medication.",
        parameters: {
          type: "object",
          properties: {
            drugName: {
              type: "string",
              description:
                "Drug name to look up (brand or generic, e.g., 'metoprolol', 'Lopressor', 'lisinopril')",
            },
            includeInteractions: {
              type: "boolean",
              description: "Include common drug interactions in response (default: false)",
            },
          },
          required: ["drugName"],
        },
      },
    };
  }

  /**
   * Check drug-drug interactions for patient medication list
   */
  private static getCheckInteractionsTool(): ToolFunction {
    return {
      type: "function",
      function: {
        name: "check_drug_interactions",
        description:
          "Check for drug-drug interactions in a patient's medication list. " +
          "Use when patient has multiple medications and you need to assess interaction risks. " +
          "Returns major and moderate interactions with field management advice.",
        parameters: {
          type: "object",
          properties: {
            medications: {
              type: "array",
              items: { type: "string" },
              description:
                "List of patient medications (brand or generic names). Minimum 2 medications required.",
            },
            includeMinor: {
              type: "boolean",
              description: "Include minor interactions in results (default: false, only major/moderate)",
            },
          },
          required: ["medications"],
        },
      },
    };
  }

  /**
   * Identify unknown medication by description
   */
  private static getIdentifyDrugTool(): ToolFunction {
    return {
      type: "function",
      function: {
        name: "identify_medication",
        description:
          "Help identify an unknown medication based on pill appearance, imprint, or patient description. " +
          "Use when paramedic finds unidentified pills or patient cannot name their medication. " +
          "Returns confidence level and possible matches.",
        parameters: {
          type: "object",
          properties: {
            imprint: {
              type: "string",
              description:
                "Letters, numbers, or symbols on the pill (e.g., 'M32', 'WATSON 540', 'A 333')",
            },
            color: {
              type: "string",
              description: "Pill color (e.g., 'white', 'blue', 'pink', 'orange')",
            },
            shape: {
              type: "string",
              enum: ["round", "oval", "capsule", "diamond", "triangle", "square", "rectangle", "other"],
              description: "Pill shape",
            },
            patientDescription: {
              type: "string",
              description:
                "Patient's description of what the medication is for " +
                "(e.g., 'blood pressure pill', 'heart medicine', 'diabetes medication')",
            },
          },
          required: [],
        },
      },
    };
  }
}
