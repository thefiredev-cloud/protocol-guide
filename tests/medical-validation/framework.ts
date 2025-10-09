/**
 * Medical Validation Framework
 *
 * Core framework for validating Medic-Bot responses against LA County PCM protocols.
 * Ensures 100% accuracy for medical director approval.
 */

import type { ChatService } from "@/lib/managers/chat-service";
import { PediatricDoseCalculator } from "@/lib/clinical/pediatric-dose-calculator";

export interface MedicalScenario {
  id: string;
  category: "cardiac" | "trauma" | "pediatric" | "respiratory" | "ob" | "toxicology" | "environmental" | "neuro";
  scenario: string;
  expectedProtocol: string;
  expectedActions: string[];
  expectedDosing?: {
    medication: string;
    weightKg: number;
    expectedDoseMg: number;
    expectedRoute: string;
  };
  mustNotRecommend?: string[]; // Contraindicated actions/meds
  requiresBaseContact: boolean;
  notes?: string;
}

export interface ValidationResult {
  scenarioId: string;
  passed: boolean;
  errors: string[];
  warnings?: string[];
  responseText?: string;
  citations?: Array<{ title: string; category: string; subcategory?: string }>;
}

/**
 * Validates a single medical scenario against bot response
 */
export async function validateScenario(
  scenario: MedicalScenario,
  chatService: ChatService
): Promise<ValidationResult> {
  const result: ValidationResult = {
    scenarioId: scenario.id,
    passed: true,
    errors: [],
    warnings: []
  };

  try {
    // Generate bot response
    const response = await chatService.handle({
      messages: [{ role: "user", content: scenario.scenario }]
    });

    result.responseText = response.text;
    result.citations = response.citations;

    // Check for fallback response (critical failure)
    if (response.fallback) {
      result.passed = false;
      result.errors.push("Bot returned fallback response instead of clinical guidance");
      return result;
    }

    // Validate protocol citation
    if (!containsProtocol(response.text, scenario.expectedProtocol)) {
      result.passed = false;
      result.errors.push(`Missing expected protocol: ${scenario.expectedProtocol}`);
    }

    // Validate expected actions are mentioned
    for (const action of scenario.expectedActions) {
      if (!containsAction(response.text, action)) {
        result.passed = false;
        result.errors.push(`Missing expected action: ${action}`);
      }
    }

    // Validate pediatric dosing calculations if applicable
    if (scenario.expectedDosing) {
      const dosingError = validatePediatricDosing(
        scenario.expectedDosing,
        response.text
      );
      if (dosingError) {
        result.passed = false;
        result.errors.push(dosingError);
      }
    }

    // Check for contraindicated recommendations
    for (const prohibited of scenario.mustNotRecommend || []) {
      if (containsAction(response.text, prohibited)) {
        result.passed = false;
        result.errors.push(`Incorrectly recommended contraindicated action: ${prohibited}`);
      }
    }

    // Validate base contact requirement
    if (scenario.requiresBaseContact) {
      if (!containsBaseContact(response.text)) {
        result.warnings?.push("Should mention base hospital contact");
      }
    }

  } catch (error) {
    result.passed = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Check if response contains protocol reference (flexible matching)
 */
function containsProtocol(text: string, protocol: string): boolean {
  const normalized = text.toLowerCase();
  const protocolLower = protocol.toLowerCase();

  // Check for exact protocol code (e.g., "805", "1309", "MCG 1309")
  const patterns = [
    new RegExp(`\\b${protocolLower}\\b`, 'i'),
    new RegExp(`protocol\\s*${protocolLower}\\b`, 'i'),
    new RegExp(`mcg\\s*${protocolLower}\\b`, 'i')
  ];

  return patterns.some(pattern => pattern.test(normalized));
}

/**
 * Check if response contains expected action (flexible matching)
 */
function containsAction(text: string, action: string): boolean {
  const normalized = text.toLowerCase();
  const actionLower = action.toLowerCase();

  // Simple substring match, can be enhanced with fuzzy matching
  return normalized.includes(actionLower);
}

/**
 * Check if response mentions base hospital contact
 */
function containsBaseContact(text: string): boolean {
  const patterns = [
    /base\s*(hospital|contact)/i,
    /contact\s*base/i,
    /medical\s*control/i,
    /physician\s*order/i
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Validate pediatric dosing matches expected calculation
 */
function validatePediatricDosing(
  expected: NonNullable<MedicalScenario["expectedDosing"]>,
  responseText: string
): string | null {
  const calc = PediatricDoseCalculator.calculate({
    medicationKey: expected.medication,
    weightKg: expected.weightKg
  });

  if (!calc) {
    return `Failed to calculate dose for ${expected.medication}`;
  }

  // Validate dose matches expected
  if (Math.abs(calc.doseMg! - expected.expectedDoseMg) > 0.01) {
    return `Dosing mismatch: expected ${expected.expectedDoseMg}mg, calculator produced ${calc.doseMg}mg`;
  }

  // Check if dose appears in response (approximate matching)
  const dosePattern = new RegExp(`${calc.doseMg}\\s*mg`, 'i');
  if (!dosePattern.test(responseText)) {
    return `Response does not mention calculated dose: ${calc.doseMg} mg`;
  }

  return null;
}

/**
 * Generate validation summary report
 */
export function generateValidationReport(results: ValidationResult[]): {
  total: number;
  passed: number;
  failed: number;
  accuracy: number;
  failedScenarios: Array<{ id: string; errors: string[] }>;
  categoryBreakdown: Record<string, { total: number; passed: number }>;
} {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const accuracy = total > 0 ? (passed / total) * 100 : 0;

  const failedScenarios = results
    .filter(r => !r.passed)
    .map(r => ({ id: r.scenarioId, errors: r.errors }));

  return {
    total,
    passed,
    failed,
    accuracy,
    failedScenarios,
    categoryBreakdown: {} // Can be populated by caller
  };
}
