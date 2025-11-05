/**
 * Protocol Number Validator
 *
 * Validates that all protocol citations in LLM responses:
 * 1. Reference valid LA County protocol numbers
 * 2. Match the correct protocol names
 * 3. Are not hallucinated or fabricated
 */

import providerImpressions from "../../data/provider_impressions.json";

// Build valid protocol set from provider impressions
const VALID_PROTOCOLS = new Set(
  providerImpressions.flatMap(pi => {
    const codes = [pi.tp_code];
    if (pi.tp_code_pediatric) {
      codes.push(pi.tp_code_pediatric);
    }
    return codes;
  })
);

// Build protocol number to name mapping
const PROTOCOL_NAMES: Record<string, string> = Object.fromEntries(
  providerImpressions.map(pi => [pi.tp_code, pi.tp_name])
);

// Add pediatric protocol mappings
for (const pi of providerImpressions) {
  if (pi.tp_code_pediatric) {
    PROTOCOL_NAMES[pi.tp_code_pediatric] = `${pi.tp_name} (Pediatric)`;
  }
}

export interface ProtocolValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all protocol citations in text
 */
export function validateProtocolCitations(text: string): ProtocolValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract all protocol citations with various formats
  const citations = new Set<string>();

  // Match: TP 1210, TP 1210-P, Protocol 1210, Protocol 1210-P
  const tpPattern = /\b(?:TP|Protocol)\s+(\d{4}(?:-P)?)\b/gi;
  let match;
  while ((match = tpPattern.exec(text)) !== null) {
    citations.add(match[1]);
  }

  // Match: MCG 1309, MCG 1335, etc.
  const mcgPattern = /\bMCG\s+(\d{4})/gi;
  while ((match = mcgPattern.exec(text)) !== null) {
    const code = match[1];
    // MCG codes are valid if they appear in content, not validated against PI list
    // Just flag as warning if unusual
    if (!["1309", "1335", "1375", "1302"].includes(code)) {
      warnings.push(`Uncommon MCG code: MCG ${code} - verify this is correct`);
    }
  }

  // Validate each protocol citation
  for (const code of Array.from(citations)) {
    // Check if protocol exists in LA County formulary
    if (!VALID_PROTOCOLS.has(code)) {
      errors.push(`INVALID PROTOCOL: TP ${code} does not exist in LA County PCM. This may be hallucinated.`);
      continue;
    }

    // Get expected protocol name
    const expectedName = PROTOCOL_NAMES[code];
    if (!expectedName) continue;

    // Extract context around citation (100 chars before/after)
    const regex = new RegExp(`\\b(?:TP|Protocol)\\s+${code}\\b`, 'i');
    const citationMatch = text.match(regex);
    if (!citationMatch) continue;

    const index = citationMatch.index || 0;
    const contextStart = Math.max(0, index - 100);
    const contextEnd = Math.min(text.length, index + 200);
    const context = text.substring(contextStart, contextEnd);

    // Check if protocol name is mentioned near citation
    // Extract potential protocol name (text after protocol number until newline or period)
    const namePattern = new RegExp(`(?:TP|Protocol)\\s+${code}[\\s:-]*([^.\\n]+)`, 'i');
    const nameMatch = context.match(namePattern);

    if (nameMatch && nameMatch[1]) {
      const mentionedName = nameMatch[1].trim();

      // Normalize for comparison
      const normalizedExpected = expectedName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedMentioned = mentionedName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if mentioned name is significantly different
      if (mentionedName.length > 5 &&
          !normalizedExpected.includes(normalizedMentioned.substring(0, 10)) &&
          !normalizedMentioned.includes(normalizedExpected.substring(0, 10))) {
        warnings.push(
          `PROTOCOL NAME MISMATCH: TP ${code} cited as "${mentionedName}" but actual name is "${expectedName}"`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get list of all valid LA County protocol codes
 */
export function getValidProtocols(): string[] {
  const protocols: string[] = [];
  for (const code of VALID_PROTOCOLS) {
    protocols.push(code);
  }
  return protocols.sort();
}

/**
 * Check if a protocol code is valid
 */
export function isValidProtocol(code: string): boolean {
  return VALID_PROTOCOLS.has(code);
}

/**
 * Get protocol name by code
 */
export function getProtocolName(code: string): string | null {
  return PROTOCOL_NAMES[code] || null;
}
