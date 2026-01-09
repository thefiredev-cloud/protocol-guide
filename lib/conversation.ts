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
  { pattern: /\b(chest\s*pain|cardiac|heart|stemi|nstemi|acs|mi|angina|pmc|dysrhythmia)/i, category: 'cardiac' },
  { pattern: /\b(stroke|cva|tia|lams|lapss|weakness|facial\s*droop|slurred)/i, category: 'stroke' },
  { pattern: /\b(dyspnea|sob|asthma|copd|respiratory|breathing)/i, category: 'respiratory' },
  { pattern: /\b(sepsis|septic|infection|fever)/i, category: 'medical' },
];

const LAMS_SCORE_PATTERN = /\blams\s*(?:of|score|=|:)?\s*(\d)/i;
const GCS_PATTERN = /\bgcs\s*(?:of|score|=|:)?\s*(\d{1,2})/i;
const LKWT_PATTERN = /\b(?:lkwt|last\s*known\s*well|onset|last\s*seen\s*normal)\s*(?:of|was|at|:)?\s*([\d:]+\s*(?:hours?|hrs?|minutes?|min)?(?:\s*ago)?)/i;
const AGE_PATTERN = /\b(\d{1,3})\s*(?:y(?:ear)?s?|yo|y\/o|yr)(?:\s*old)?/i;

// ============================================
// Topic Change Detection
// ============================================

/**
 * Check if the complaint category has changed, requiring a fact reset
 */
function hasTopicChanged(
  newCategory: ConversationFacts['complaintCategory'] | undefined,
  existingFacts: ConversationFacts
): boolean {
  // No change if no new category detected
  if (!newCategory) return false;
  // No change if no previous category
  if (!existingFacts.complaintCategory) return false;
  // Topic changed if categories differ
  return newCategory !== existingFacts.complaintCategory;
}

/**
 * Reset category-specific facts when topic changes
 * Keeps patient demographics, clears clinical context
 */
function resetCategorySpecificFacts(facts: ConversationFacts): ConversationFacts {
  return {
    // Keep patient demographics
    patientAge: facts.patientAge,
    patientAgeUnit: facts.patientAgeUnit,
    isPediatric: facts.isPediatric,
    // Keep the NEW complaint category (already set)
    complaintCategory: facts.complaintCategory,
    // Clear everything else - will be re-extracted for new topic
    injuryType: undefined,
    injuryCause: undefined,
    injuryLocation: undefined,
    bodyPart: undefined,
    isProximal: undefined,
    woundType: undefined,
    timeOfInjury: undefined,
    symptomOnset: undefined,
    lkwt: undefined,
    lamsScore: undefined,
    gcsScore: undefined,
    requiresBaseContact: undefined,
    baseContactReason: undefined,
  };
}

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

// ============================================
// Context-Dependent Message Detection
// ============================================

/**
 * Patterns for detecting short/ambiguous responses that need prior context.
 * These are responses that cannot stand alone and need the previous question.
 */
const CONTEXT_DEPENDENT_PATTERNS = [
  // Affirmative responses
  /^(?:yes|yeah|yep|yup|sure|ok|okay|correct|right|that'?s?\s*(?:it|right|correct)|affirmative|exactly|confirmed?|please|go\s*ahead)\.?$/i,

  // Negative responses
  /^(?:no|nope|nah|not?\s*(?:that|really)|negative|neither|none|wrong)\.?$/i,

  // Selection responses
  /^(?:the\s*)?(?:first|second|third|last|other|both|either)\s*(?:one)?\.?$/i,
  /^(?:option\s*)?[abc123]\.?$/i,
  /^that\s*one\.?$/i,

  // Simple confirmations/questions
  /^(?:what|which|where|when|why|how)\??$/i,
  /^(?:and|but|also|or)\??$/i,
];

/**
 * Check if a message is context-dependent (needs prior conversation context).
 * Returns true for short responses like "yes", "no", "that one" that need
 * the previous assistant question to be understood.
 *
 * @param message - The user's message
 * @returns true if the message likely needs prior context to be understood
 *
 * @example
 * isContextDependentMessage("yes") // true
 * isContextDependentMessage("needle thoracostomy dosing") // false
 * isContextDependentMessage("that one") // true
 * isContextDependentMessage("the first option") // true
 */
export function isContextDependentMessage(message: string): boolean {
  const trimmed = message.trim();

  // Empty or very short messages need context
  if (trimmed.length === 0) return true;
  if (trimmed.length <= 3) return true;

  // Check against context-dependent patterns
  for (const pattern of CONTEXT_DEPENDENT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  // Also check: message has no medical terms and is under 25 chars
  const hasMedicalTerms =
    INJURY_TYPE_PATTERNS.some(p => p.pattern.test(message)) ||
    COMPLAINT_CATEGORY_PATTERNS.some(p => p.pattern.test(message)) ||
    LAMS_SCORE_PATTERN.test(message) ||
    GCS_PATTERN.test(message) ||
    LOCATION_PATTERNS.some(p => p.pattern.test(message));

  if (!hasMedicalTerms && trimmed.length < 25) {
    return true;
  }

  return false;
}

// ============================================
// Pending Clarification Tracking
// ============================================

/**
 * Represents the last question asked by the assistant that awaits user response.
 */
export interface PendingClarification {
  /** The assistant's message asking for clarification */
  question: string;
  /** What the clarification is about */
  clarificationType: 'protocol_confirmation' | 'location' | 'clinical_detail' | 'dosage' | 'general';
  /** The topic being discussed (extracted from the question) */
  topic?: string;
  /** Protocol reference if mentioned in the question */
  protocolRef?: string;
  /** Protocols that were retrieved and being discussed (for context-dependent follow-ups) */
  retrievedProtocols?: Array<{ ref: string; title: string }>;
  /** Timestamp of when the question was asked */
  timestamp: number;
}

/**
 * Detect if an assistant message is asking a clarifying question.
 * Extracts the question and categorizes it.
 *
 * @param assistantMessage - The assistant's response
 * @returns PendingClarification object if a question was asked, null otherwise
 */
export function detectClarifyingQuestion(assistantMessage: string): PendingClarification | null {
  const content = assistantMessage.trim();

  // Must contain a question mark
  if (!content.includes('?')) return null;

  // Extract all questions from the message
  const questionMatches = content.match(/[^.!]*\?/g);
  if (!questionMatches || questionMatches.length === 0) return null;

  // Get the main question (usually the last one, or the first substantive one)
  let question = questionMatches[questionMatches.length - 1].trim();

  // If that's too short, try an earlier question
  if (question.length < 15 && questionMatches.length > 1) {
    for (let i = questionMatches.length - 2; i >= 0; i--) {
      if (questionMatches[i].trim().length > 15) {
        question = questionMatches[i].trim();
        break;
      }
    }
  }

  // Determine clarification type
  let clarificationType: PendingClarification['clarificationType'] = 'general';
  let topic: string | undefined;
  let protocolRef: string | undefined;

  // Protocol confirmation pattern: "Are you asking about [X]?"
  const protocolConfirmMatch = question.match(/(?:asking|inquiring|looking)\s+(?:about|for)\s+(.+?)\??$/i);
  if (protocolConfirmMatch) {
    clarificationType = 'protocol_confirmation';
    topic = protocolConfirmMatch[1].replace(/\?$/, '').trim();
  }

  // Another pattern: "Do you mean [X]?" or "Did you mean [X]?"
  const meanMatch = question.match(/(?:do|did)\s+you\s+mean\s+(.+?)\??$/i);
  if (meanMatch) {
    clarificationType = 'protocol_confirmation';
    topic = meanMatch[1].replace(/\?$/, '').trim();
  }

  // Location question pattern: "Where is the [injury/wound]?"
  if (/\bwhere\b.*\b(?:injury|wound|pain|location|it|bite|burn)/i.test(question)) {
    clarificationType = 'location';
    topic = 'injury location';
  }

  // Clinical detail pattern: "What is the [LAMS/GCS/etc.]?"
  if (/\bwhat\s+is\s+(?:the\s+)?(?:lams|gcs|blood\s*pressure|heart\s*rate|spo2|bp)/i.test(question)) {
    clarificationType = 'clinical_detail';
  }

  // Dosage pattern
  if (/\b(?:dose|dosage|dosing|mg|mcg|how\s+much)\b/i.test(question)) {
    clarificationType = 'dosage';
  }

  // Extract protocol reference if present anywhere in the message
  const refMatch = content.match(/\b(TP[-\s]?\d{3,4}[-A-Z]*|Ref\.?\s*\d{3,4}|MCG[-\s]?\d{3,4}|\d{4}\.\d+)/i);
  if (refMatch) {
    protocolRef = refMatch[1];
  }

  // Also try to extract topic from "Are you asking about X?" anywhere
  if (!topic) {
    const topicMatch = content.match(/asking\s+about\s+([^?]+)\?/i);
    if (topicMatch) {
      topic = topicMatch[1].trim();
    }
  }

  return {
    question,
    clarificationType,
    topic,
    protocolRef,
    timestamp: Date.now(),
  };
}

/**
 * Format the prior context for injection into the current prompt.
 * This gives the AI context about what was previously discussed.
 *
 * @param lastAssistantMessage - The previous assistant message
 * @param clarification - Optional parsed clarification data
 * @returns Formatted context string to prepend to the user's message
 */
export function formatPriorContext(
  lastAssistantMessage: string,
  clarification?: PendingClarification | null
): string {
  const lines: string[] = ['PRIOR CONTEXT (user is responding to this):'];

  // Include protocol options that were being discussed (most important for follow-ups)
  if (clarification?.retrievedProtocols && clarification.retrievedProtocols.length > 0) {
    lines.push('Protocols being discussed:');
    clarification.retrievedProtocols.slice(0, 5).forEach(p => {
      lines.push(`  • ${p.ref}: ${p.title}`);
    });
  }

  if (clarification?.topic) {
    lines.push(`Topic under discussion: ${clarification.topic}`);
  }

  if (clarification?.protocolRef) {
    lines.push(`Protocol reference: ${clarification.protocolRef}`);
  }

  // Include the actual question asked (truncate if too long)
  const questionText = clarification?.question || lastAssistantMessage.slice(-300);
  lines.push(`Assistant's question: "${questionText}"`);

  lines.push('');
  lines.push('The user\'s response below is answering the above question.');

  return lines.join('\n');
}
