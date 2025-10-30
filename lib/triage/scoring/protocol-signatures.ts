/**
 * Protocol-specific multi-symptom signatures
 * 
 * These patterns detect highly specific symptom combinations that strongly
 * indicate particular protocols, providing bonus scoring when matched.
 */

export interface ProtocolSignature {
  protocolCode: string;
  protocolName: string;
  patterns: SignaturePattern[];
  bonusPoints: number;
}

export interface SignaturePattern {
  name: string;
  requiredTerms: string[]; // ALL must be present
  optionalTerms?: string[]; // Adds confidence if present
  excludedTerms?: string[]; // Reduces confidence if present
}

/**
 * Clinical signatures for high-specificity protocol matching
 */
export const PROTOCOL_SIGNATURES: ProtocolSignature[] = [
  {
    protocolCode: "1211",
    protocolName: "Cardiac Chest Pain / ACS",
    bonusPoints: 15,
    patterns: [
      {
        name: "Classic ACS Presentation",
        requiredTerms: ["chest pain", "diaphoresis"],
        optionalTerms: ["nausea", "jaw pain", "arm pain", "crushing", "pressure"],
        excludedTerms: ["reproducible", "pleuritic", "impalement", "impaled", "penetrating", "trauma", "injury"],
      },
      {
        name: "STEMI Indicators",
        requiredTerms: ["chest pain", "st elevation"],
        optionalTerms: ["diaphoresis", "hypotension"],
        excludedTerms: ["impalement", "impaled", "penetrating", "trauma", "injury"],
      },
    ],
  },
  {
    protocolCode: "1232",
    protocolName: "Stroke / CVA / TIA",
    bonusPoints: 20,
    patterns: [
      {
        name: "Cincinnati Stroke Scale Positive",
        requiredTerms: ["facial droop", "arm weakness"],
        optionalTerms: ["speech difficulty", "slurred", "aphasia"],
      },
      {
        name: "FAST Positive",
        requiredTerms: ["facial droop", "speech"],
        optionalTerms: ["arm weakness", "sudden onset"],
      },
    ],
  },
  {
    protocolCode: "1219",
    protocolName: "Anaphylaxis",
    bonusPoints: 18,
    patterns: [
      {
        name: "Classic Anaphylaxis",
        requiredTerms: ["hives", "airway swelling"],
        optionalTerms: ["hypotension", "wheezing", "stridor", "throat swelling"],
      },
      {
        name: "Severe Allergic Reaction",
        requiredTerms: ["angioedema", "respiratory distress"],
        optionalTerms: ["hypotension", "urticaria"],
      },
    ],
  },
  {
    protocolCode: "1236",
    protocolName: "Inhalation Injury",
    bonusPoints: 18,
    patterns: [
      {
        name: "Airway Burn Pattern",
        requiredTerms: ["stridor", "hoarse"],
        optionalTerms: ["gas", "fumes", "fire", "enclosed space", "soot", "carbonaceous"],
      },
      {
        name: "Toxic Inhalation",
        requiredTerms: ["inhaled", "gas"],
        optionalTerms: ["stridor", "hoarse", "respiratory distress", "chemical"],
      },
    ],
  },
  {
    protocolCode: "1204",
    protocolName: "Sepsis",
    bonusPoints: 15,
    patterns: [
      {
        name: "Sepsis Criteria",
        requiredTerms: ["fever", "hypotension", "tachycardia"],
        optionalTerms: ["altered", "infection", "source"],
      },
      {
        name: "Septic Shock",
        requiredTerms: ["infection", "hypotension"],
        optionalTerms: ["tachycardia", "altered", "fever", "lactate"],
      },
    ],
  },
  {
    protocolCode: "1207",
    protocolName: "Shock",
    bonusPoints: 15,
    patterns: [
      {
        name: "Shock Presentation",
        requiredTerms: ["hypotension", "tachycardia"],
        optionalTerms: ["pale", "cool", "clammy", "altered", "weak pulse"],
      },
    ],
  },
  {
    protocolCode: "1242",
    protocolName: "Crush Injury/Syndrome",
    bonusPoints: 18,
    patterns: [
      {
        name: "Crush Syndrome Criteria",
        requiredTerms: ["entrapment", "crush"],
        optionalTerms: ["hour", "circumferential", "large muscle", "rhabdomyolysis"],
      },
    ],
  },
  {
    protocolCode: "1237",
    protocolName: "Respiratory Distress",
    bonusPoints: 12,
    patterns: [
      {
        name: "Severe Respiratory Distress",
        requiredTerms: ["respiratory distress", "hypoxia"],
        optionalTerms: ["tachypnea", "retractions", "tripod"],
      },
    ],
  },
  {
    protocolCode: "1244",
    protocolName: "Traumatic Injury",
    bonusPoints: 18,
    patterns: [
      {
        name: "Penetrating Trauma",
        requiredTerms: ["penetrating", "injury"],
        optionalTerms: ["chest", "abdomen", "extremity", "impalement", "impaled"],
        excludedTerms: ["chest pain"],
      },
      {
        name: "Impalement",
        requiredTerms: ["impalement"],
        optionalTerms: ["chest", "abdomen", "extremity", "penetrating"],
        excludedTerms: ["chest pain"],
      },
    ],
  },
];

/**
 * Detect protocol signatures in query text
 */
export function detectProtocolSignature(
  lowerText: string,
  protocolCode: string
): number {
  const signature = PROTOCOL_SIGNATURES.find((sig) => sig.protocolCode === protocolCode);
  if (!signature) return 0;

  for (const pattern of signature.patterns) {
    const matchScore = evaluatePattern(lowerText, pattern);
    if (matchScore > 0.7) {
      // Pattern matched with high confidence
      return signature.bonusPoints;
    }
  }

  return 0;
}

/**
 * Evaluate how well a pattern matches the text
 * Returns 0-1 score based on required/optional/excluded terms
 */
function evaluatePattern(lowerText: string, pattern: SignaturePattern): number {
  // Check all required terms present
  const requiredMatches = pattern.requiredTerms.every((term) =>
    new RegExp(`\\b${term.replace(/\s+/g, "\\s+")}\\b`, "i").test(lowerText)
  );

  if (!requiredMatches) return 0;

  let score = 0.7; // Base score for required match

  // Check optional terms (add confidence)
  if (pattern.optionalTerms) {
    const optionalMatchCount = pattern.optionalTerms.filter((term) =>
      new RegExp(`\\b${term.replace(/\s+/g, "\\s+")}\\b`, "i").test(lowerText)
    ).length;
    score += (optionalMatchCount / pattern.optionalTerms.length) * 0.3;
  }

  // Check excluded terms (reduce confidence)
  if (pattern.excludedTerms) {
    const excludedMatchCount = pattern.excludedTerms.filter((term) =>
      new RegExp(`\\b${term.replace(/\s+/g, "\\s+")}\\b`, "i").test(lowerText)
    ).length;
    score -= (excludedMatchCount / pattern.excludedTerms.length) * 0.5;
  }

  return Math.max(0, Math.min(1, score));
}

