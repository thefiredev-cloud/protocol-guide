/**
 * Conversation Fact Extraction & Follow-up Logic
 * Protocol Guide - LA County Fire Department EMS
 *
 * Extracts clinical facts from conversation to enable contextual follow-ups.
 * Example flow:
 *   User: "dog bite" → AI asks "Where is it located?"
 *   User: "above the knee" → AI: "Proximal puncture wound - trauma contact base"
 */

// ============================================
// Types
// ============================================

export interface ConversationFacts {
  // Injury/Complaint
  injuryType?: 'bite' | 'burn' | 'laceration' | 'puncture' | 'crush' | 'fracture' | 'blunt' | 'penetrating' | 'other';
  injuryCause?: string;  // "dog", "knife", "fall", "vehicle"
  injuryLocation?: string;  // "arm", "leg", "face", "chest", "abdomen"
  bodyPart?: string;  // More specific: "left forearm", "right thigh"
  isProximal?: boolean;  // Above knee/elbow = higher risk
  woundType?: 'puncture' | 'laceration' | 'abrasion' | 'avulsion' | 'amputation';

  // Timing
  timeOfInjury?: string;
  symptomOnset?: string;
  lkwt?: string;  // Last Known Well Time (for stroke)

  // Patient Info
  patientAge?: number;
  patientAgeUnit?: 'years' | 'months' | 'days';
  isPediatric?: boolean;

  // Clinical Scores
  lamsScore?: number;  // 0-5
  gcsScore?: number;   // 3-15

  // Flags
  requiresBaseContact?: boolean;
  baseContactReason?: string;

  // Chief complaint category
  complaintCategory?: 'trauma' | 'medical' | 'cardiac' | 'stroke' | 'respiratory' | 'other';
}

export interface FollowUpSuggestion {
  question: string;
  reason: string;
  factToExtract: keyof ConversationFacts;
  priority: 'high' | 'medium' | 'low';
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ============================================
// Extraction Patterns
// ============================================

const INJURY_TYPE_PATTERNS: Array<{ pattern: RegExp; type: ConversationFacts['injuryType']; cause?: string }> = [
  { pattern: /\b(dog|animal|cat|snake|spider|insect|human)\s*bite/i, type: 'bite' },
  { pattern: /\bbit(?:ten)?\s+by\s+(dog|animal|cat|snake)/i, type: 'bite' },
  { pattern: /\bburn/i, type: 'burn' },
  { pattern: /\b(stab|stabbing|stabbed|knife|puncture)/i, type: 'puncture' },
  { pattern: /\b(laceration|cut|slash|sliced)/i, type: 'laceration' },
  { pattern: /\b(crush|crushed|crushing)/i, type: 'crush' },
  { pattern: /\b(fracture|broken|break)/i, type: 'fracture' },
  { pattern: /\b(gsw|gunshot|shot|bullet)/i, type: 'penetrating' },
  { pattern: /\b(blunt|struck|hit|assault)/i, type: 'blunt' },
];

const LOCATION_PATTERNS: Array<{ pattern: RegExp; location: string; isProximal: boolean }> = [
  // Proximal (above knee/elbow) - higher risk
  { pattern: /\b(thigh|upper\s*leg|groin|hip|above\s*(the\s*)?knee)/i, location: 'thigh', isProximal: true },
  { pattern: /\b(upper\s*arm|shoulder|axilla|above\s*(the\s*)?elbow)/i, location: 'upper arm', isProximal: true },
  { pattern: /\b(face|head|neck|scalp)/i, location: 'head/face', isProximal: true },
  { pattern: /\b(chest|thorax|torso)/i, location: 'chest', isProximal: true },
  { pattern: /\b(abdomen|belly|flank|stomach)/i, location: 'abdomen', isProximal: true },
  { pattern: /\b(back|spine)/i, location: 'back', isProximal: true },
  { pattern: /\b(genital|perineum)/i, location: 'genital', isProximal: true },

  // Distal (below knee/elbow) - generally lower risk
  { pattern: /\b(lower\s*leg|calf|shin|below\s*(the\s*)?knee)/i, location: 'lower leg', isProximal: false },
  { pattern: /\b(forearm|lower\s*arm|below\s*(the\s*)?elbow)/i, location: 'forearm', isProximal: false },
  { pattern: /\b(hand|finger|palm|wrist)/i, location: 'hand', isProximal: false },
  { pattern: /\b(foot|toe|ankle)/i, location: 'foot', isProximal: false },

  // General extremity
  { pattern: /\b(arm)/i, location: 'arm', isProximal: false },
  { pattern: /\b(leg)/i, location: 'leg', isProximal: false },
];

const COMPLAINT_CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: ConversationFacts['complaintCategory'] }> = [
  { pattern: /\b(mva|mvc|crash|collision|fall|trauma|injury|wound|bite|burn|assault|gsw)/i, category: 'trauma' },
  { pattern: /\b(chest\s*pain|cardiac|heart|stemi|nstemi|acs|mi|angina)/i, category: 'cardiac' },
  { pattern: /\b(stroke|cva|tia|lams|lapss|weakness|facial\s*droop|slurred)/i, category: 'stroke' },
  { pattern: /\b(dyspnea|sob|asthma|copd|respiratory|breathing)/i, category: 'respiratory' },
];

const LAMS_SCORE_PATTERN = /\blams\s*(?:of|score|=|:)?\s*(\d)/i;
const GCS_PATTERN = /\bgcs\s*(?:of|score|=|:)?\s*(\d{1,2})/i;
const LKWT_PATTERN = /\b(?:lkwt|last\s*known\s*well|onset|last\s*seen\s*normal)\s*(?:of|was|at|:)?\s*([\d:]+\s*(?:hours?|hrs?|minutes?|min)?(?:\s*ago)?)/i;
const AGE_PATTERN = /\b(\d{1,3})\s*(?:y(?:ear)?s?|yo|y\/o|yr)(?:\s*old)?/i;

// ============================================
// Extraction Functions
// ============================================

/**
 * Extract clinical facts from a single message
 */
export function extractFactsFromMessage(
  message: string,
  existingFacts: ConversationFacts = {}
): ConversationFacts {
  const facts: ConversationFacts = { ...existingFacts };
  const normalizedMessage = message.toLowerCase();

  // Extract injury type and cause
  for (const { pattern, type, cause } of INJURY_TYPE_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      facts.injuryType = type;
      if (cause) {
        facts.injuryCause = cause;
      } else if (match[1]) {
        facts.injuryCause = match[1].toLowerCase();
      }
      // Determine wound type from injury type
      if (type === 'bite') facts.woundType = 'puncture';
      if (type === 'puncture') facts.woundType = 'puncture';
      if (type === 'laceration') facts.woundType = 'laceration';
      break;
    }
  }

  // Extract body location
  for (const { pattern, location, isProximal } of LOCATION_PATTERNS) {
    if (pattern.test(message)) {
      facts.injuryLocation = location;
      facts.isProximal = isProximal;
      break;
    }
  }

  // Extract complaint category
  for (const { pattern, category } of COMPLAINT_CATEGORY_PATTERNS) {
    if (pattern.test(message)) {
      facts.complaintCategory = category;
      break;
    }
  }

  // Extract LAMS score
  const lamsMatch = message.match(LAMS_SCORE_PATTERN);
  if (lamsMatch) {
    facts.lamsScore = parseInt(lamsMatch[1], 10);
  }

  // Extract GCS
  const gcsMatch = message.match(GCS_PATTERN);
  if (gcsMatch) {
    facts.gcsScore = parseInt(gcsMatch[1], 10);
  }

  // Extract LKWT
  const lkwtMatch = message.match(LKWT_PATTERN);
  if (lkwtMatch) {
    facts.lkwt = lkwtMatch[1];
  }

  // Extract age
  const ageMatch = message.match(AGE_PATTERN);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    facts.patientAge = age;
    facts.patientAgeUnit = 'years';
    facts.isPediatric = age < 18;
  }

  // Determine if base contact is required
  const baseContactResult = shouldRequireBaseContact(facts);
  facts.requiresBaseContact = baseContactResult.required;
  facts.baseContactReason = baseContactResult.reason;

  return facts;
}

/**
 * Extract facts from entire conversation history
 */
export function extractFactsFromConversation(
  messages: ConversationMessage[]
): ConversationFacts {
  let facts: ConversationFacts = {};

  for (const msg of messages) {
    if (msg.role === 'user') {
      facts = extractFactsFromMessage(msg.content, facts);
    }
  }

  return facts;
}

// ============================================
// Base Contact Logic
// ============================================

interface BaseContactResult {
  required: boolean;
  reason?: string;
  protocolRef?: string;
}

/**
 * Determine if base contact is required based on extracted facts
 * Per LA County Protocol Ref 506
 */
export function shouldRequireBaseContact(facts: ConversationFacts): BaseContactResult {
  const reasons: string[] = [];

  // Proximal puncture wounds (above knee/elbow)
  if (facts.isProximal && (facts.woundType === 'puncture' || facts.injuryType === 'bite')) {
    reasons.push('Proximal puncture/bite wound');
  }

  // Animal bites to high-risk areas
  if (facts.injuryType === 'bite' && facts.injuryCause) {
    const highRiskAreas = ['face', 'head', 'neck', 'hand', 'genital'];
    if (highRiskAreas.some(area => facts.injuryLocation?.toLowerCase().includes(area))) {
      reasons.push(`${facts.injuryCause} bite to ${facts.injuryLocation}`);
    }
  }

  // LAMS score criteria
  if (facts.lamsScore !== undefined) {
    // LAMS ≥4 suggests LVO - consider CSC transport
    // LKWT >24 hours with high LAMS - consult needed
    if (facts.lamsScore >= 4 && facts.lkwt) {
      const lkwtHours = parseLkwtToHours(facts.lkwt);
      // Use !== null to handle 0 hours correctly (0 is falsy but valid)
      if (lkwtHours !== null && lkwtHours > 24) {
        reasons.push('LAMS ≥4 with LKWT >24 hours - transport destination consult');
      }
    }
  }

  // Pediatric trauma
  if (facts.isPediatric && facts.complaintCategory === 'trauma') {
    if (facts.isProximal) {
      reasons.push('Pediatric proximal trauma');
    }
  }

  return {
    required: reasons.length > 0,
    reason: reasons.length > 0 ? reasons.join('; ') : undefined,
    protocolRef: reasons.length > 0 ? '506' : undefined,
  };
}

/**
 * Parse LKWT string to hours
 */
function parseLkwtToHours(lkwt: string): number | null {
  const hoursMatch = lkwt.match(/(\d+)\s*(?:hours?|hrs?)/i);
  if (hoursMatch) {
    return parseInt(hoursMatch[1], 10);
  }

  const minutesMatch = lkwt.match(/(\d+)\s*(?:minutes?|min)/i);
  if (minutesMatch) {
    return parseInt(minutesMatch[1], 10) / 60;
  }

  // Try bare number (assume hours)
  const bareNumber = lkwt.match(/^(\d+)$/);
  if (bareNumber) {
    return parseInt(bareNumber[1], 10);
  }

  return null;
}

// ============================================
// Follow-up Suggestions
// ============================================

/**
 * Suggest follow-up questions based on missing critical information
 */
export function suggestFollowUp(facts: ConversationFacts): FollowUpSuggestion | null {
  // For bites/punctures without location
  if ((facts.injuryType === 'bite' || facts.woundType === 'puncture') && !facts.injuryLocation) {
    return {
      question: 'Where is the wound located?',
      reason: 'Proximal wounds (above knee/elbow) may require base contact',
      factToExtract: 'injuryLocation',
      priority: 'high',
    };
  }

  // For stroke symptoms without LAMS
  if (facts.complaintCategory === 'stroke' && facts.lamsScore === undefined) {
    return {
      question: 'What is the patient\'s LAMS score? (Check facial droop, arm drift, grip strength)',
      reason: 'LAMS ≥4 indicates LVO requiring Comprehensive Stroke Center',
      factToExtract: 'lamsScore',
      priority: 'high',
    };
  }

  // For stroke with LAMS but no LKWT
  if (facts.complaintCategory === 'stroke' && facts.lamsScore !== undefined && !facts.lkwt) {
    return {
      question: 'When was the patient last known to be well (LKWT)?',
      reason: 'Time window affects treatment eligibility and transport destination',
      factToExtract: 'lkwt',
      priority: 'high',
    };
  }

  // For trauma without specific location
  if (facts.complaintCategory === 'trauma' && facts.injuryType && !facts.injuryLocation) {
    return {
      question: 'Where on the body is the injury?',
      reason: 'Location determines risk level and protocol',
      factToExtract: 'injuryLocation',
      priority: 'medium',
    };
  }

  return null;
}

// ============================================
// Format Facts for AI Context
// ============================================

/**
 * Format extracted facts as context string for AI system prompt
 */
export function formatFactsForPrompt(facts: ConversationFacts): string {
  if (Object.keys(facts).length === 0) {
    return '';
  }

  const lines: string[] = ['ESTABLISHED PATIENT FACTS:'];

  if (facts.injuryType) {
    lines.push(`• Injury type: ${facts.injuryType}${facts.injuryCause ? ` (${facts.injuryCause})` : ''}`);
  }
  if (facts.injuryLocation) {
    lines.push(`• Location: ${facts.injuryLocation}${facts.isProximal ? ' (PROXIMAL - higher risk)' : ' (distal)'}`);
  }
  if (facts.woundType) {
    lines.push(`• Wound type: ${facts.woundType}`);
  }
  if (facts.complaintCategory) {
    lines.push(`• Category: ${facts.complaintCategory}`);
  }
  if (facts.patientAge !== undefined) {
    lines.push(`• Age: ${facts.patientAge} ${facts.patientAgeUnit || 'years'}${facts.isPediatric ? ' (PEDIATRIC)' : ''}`);
  }
  if (facts.lamsScore !== undefined) {
    lines.push(`• LAMS score: ${facts.lamsScore}/5${facts.lamsScore >= 4 ? ' (LVO LIKELY)' : ''}`);
  }
  if (facts.gcsScore !== undefined) {
    lines.push(`• GCS: ${facts.gcsScore}/15`);
  }
  if (facts.lkwt) {
    lines.push(`• LKWT: ${facts.lkwt}`);
  }
  if (facts.requiresBaseContact) {
    lines.push(`⚠️ BASE CONTACT INDICATED: ${facts.baseContactReason}`);
  }

  return lines.join('\n');
}
