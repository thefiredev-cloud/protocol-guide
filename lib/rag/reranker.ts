/**
 * Protocol Guide - RAG Reranker
 *
 * Cross-encoder style reranking for medical protocols.
 * Refines initial retrieval results using lexical and semantic signals.
 */

import type { RetrievedChunk } from './retrieval';

// ============================================
// Types
// ============================================

export interface RerankerConfig {
  maxChunksToRerank: number;
  minRelevanceAfterRerank: number;
  boostFactors: {
    exactProtocolMatch: number;
    sectionTitleMatch: number;
    medicationMention: number;
    dosageMention: number;
    criteriaMatch: number;
  };
}

interface RerankScore {
  chunkId: string;
  originalScore: number;
  lexicalScore: number;
  boostScore: number;
  penaltyScore: number;
  finalScore: number;
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: RerankerConfig = {
  maxChunksToRerank: 20,
  minRelevanceAfterRerank: 0.01,
  boostFactors: {
    exactProtocolMatch: 0.3,
    sectionTitleMatch: 0.2,
    medicationMention: 0.15,
    dosageMention: 0.15,
    criteriaMatch: 0.25,
  },
};

// ============================================
// Medical Domain Knowledge
// ============================================

/**
 * High-value section titles that indicate relevant clinical content
 */
const CLINICAL_SECTIONS = [
  'treatment',
  'treatment protocol',
  'dosing',
  'medication dosing',
  'indications',
  'contraindications',
  'clinical assessment',
  'pearls',
  'procedure',
  'steps',
  'algorithm',
  'criteria',
  'eligibility',
  'destination',
  'differential diagnosis',
  'complications',
  'precautions',
  'warnings',
  'adverse effects',
  // Clinical Pearl and Quick Reference sections
  'clinical pearl',
  'field impression tip',
  'high risk populations',
  'atypical presentation',
  'quick reference',
  'job aid checklist',
  'tailboard talk',
  // Equipment and Assessment sections
  'application',
  'application technique',
  'assessment criteria',
  'scoring',
  'scoring tool',
  'size selection',
  'insertion',
  'insertion technique',
  'key findings',
  'ham assessment',
  'equipment guide',
];

/**
 * Common medical medications that should boost relevance
 */
const COMMON_MEDICATIONS = [
  'epinephrine',
  'albuterol',
  'aspirin',
  'nitroglycerin',
  'morphine',
  'fentanyl',
  'ketamine',
  'midazolam',
  'atropine',
  'adenosine',
  'amiodarone',
  'lidocaine',
  'naloxone',
  'narcan',
  'dextrose',
  'glucose',
  'saline',
  'lactated ringers',
  'dopamine',
  'norepinephrine',
  'calcium',
  'magnesium',
  'sodium bicarbonate',
  'diphenhydramine',
  'benadryl',
  'ondansetron',
  'zofran',
  'furosemide',
  'lasix',
];

/**
 * Administrative/metadata terms that reduce relevance
 */
const ADMINISTRATIVE_TERMS = [
  'table of contents',
  'index',
  'appendix',
  'revision history',
  'document control',
  'approval signature',
  'effective date',
  'page number',
  'footer',
  'header',
  'copyright',
  'all rights reserved',
  'disclaimer',
];

// ============================================
// Lexical Scoring
// ============================================

/**
 * Tokenize text into normalized terms
 */
function tokenize(text: string): Set<string> {
  const normalized = text.toLowerCase();
  // Remove punctuation and split on whitespace
  const tokens = normalized
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2); // Filter out very short tokens
  return new Set(tokens);
}

/**
 * Calculate Jaccard similarity between query and chunk
 * Jaccard = |A ∩ B| / |A ∪ B|
 */
function jaccardSimilarity(queryTokens: Set<string>, chunkTokens: Set<string>): number {
  // Convert Sets to Arrays for iteration compatibility
  const queryArray = Array.from(queryTokens);
  const chunkArray = Array.from(chunkTokens);

  const intersection = new Set(queryArray.filter(t => chunkTokens.has(t)));
  const union = new Set([...queryArray, ...chunkArray]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Calculate lexical overlap score
 */
function calculateLexicalScore(query: string, chunk: RetrievedChunk): number {
  const queryTokens = tokenize(query);
  const contentTokens = tokenize(chunk.content);
  const titleTokens = tokenize(chunk.protocolTitle);
  const sectionTokens = chunk.sectionTitle ? tokenize(chunk.sectionTitle) : new Set<string>();

  // Weighted combination of different text fields
  const contentSim = jaccardSimilarity(queryTokens, contentTokens);
  const titleSim = jaccardSimilarity(queryTokens, titleTokens);
  const sectionSim = jaccardSimilarity(queryTokens, sectionTokens);

  return (
    contentSim * 0.6 +
    titleSim * 0.2 +
    sectionSim * 0.2
  );
}

// ============================================
// Boost Scoring
// ============================================

/**
 * Check if chunk contains exact query terms (multi-word phrases)
 */
function hasExactQueryMatch(query: string, chunk: RetrievedChunk): boolean {
  const normalizedQuery = query.toLowerCase();
  const normalizedContent = chunk.content.toLowerCase();
  const normalizedTitle = chunk.protocolTitle.toLowerCase();

  // Check for exact phrase match (ignoring case)
  return normalizedContent.includes(normalizedQuery) ||
         normalizedTitle.includes(normalizedQuery);
}

/**
 * Check if chunk section title matches clinical sections
 */
function hasClinicalSectionMatch(chunk: RetrievedChunk): boolean {
  if (!chunk.sectionTitle) return false;

  const normalizedSection = chunk.sectionTitle.toLowerCase();
  return CLINICAL_SECTIONS.some(section =>
    normalizedSection.includes(section)
  );
}

/**
 * Extract medication names from query
 */
function extractMedications(query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  return COMMON_MEDICATIONS.filter(med =>
    normalizedQuery.includes(med)
  );
}

/**
 * Check if chunk mentions specific medications
 */
function hasMedicationMatch(medications: string[], chunk: RetrievedChunk): boolean {
  if (medications.length === 0) return false;

  const normalizedContent = chunk.content.toLowerCase();
  return medications.some(med => normalizedContent.includes(med));
}

/**
 * Detect dosage patterns in text
 * Matches: "10 mg", "2.5 mcg", "100 mL", "0.5 mg/kg", etc.
 */
function hasDosagePattern(text: string): boolean {
  const dosageRegex = /\b\d+\.?\d*\s*(mg|mcg|g|ml|l|units?|iu|meq|mmol)(\/kg|\/m2|\/min)?\b/i;
  return dosageRegex.test(text);
}

/**
 * Check if query is asking about dosing
 */
function isDosingQuery(query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  const dosingTerms = ['dose', 'dosage', 'dosing', 'how much', 'amount', 'mg', 'mcg', 'ml'];
  return dosingTerms.some(term => normalizedQuery.includes(term));
}

/**
 * Check if chunk discusses criteria (destination, eligibility, etc.)
 */
function hasCriteriaContent(chunk: RetrievedChunk): boolean {
  const normalizedContent = chunk.content.toLowerCase();
  const normalizedSection = (chunk.sectionTitle || '').toLowerCase();

  const criteriaTerms = [
    'criteria',
    'eligibility',
    'requirements',
    'qualifications',
    'destination',
    'transport to',
    'specialty center',
    'level i',
    'level ii',
    'must meet',
    'all of the following',
    'any of the following',
  ];

  return criteriaTerms.some(term =>
    normalizedContent.includes(term) || normalizedSection.includes(term)
  );
}

/**
 * Check if query is asking about criteria
 */
function isCriteriaQuery(query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  const criteriaTerms = [
    'criteria',
    'eligibility',
    'requirements',
    'qualifications',
    'destination',
    'where to transport',
    'which hospital',
    'specialty center',
  ];
  return criteriaTerms.some(term => normalizedQuery.includes(term));
}

/**
 * Calculate boost score based on domain-specific signals
 */
function calculateBoostScore(
  query: string,
  chunk: RetrievedChunk,
  config: RerankerConfig
): number {
  let boost = 0;

  // 1. Exact protocol/query match
  if (hasExactQueryMatch(query, chunk)) {
    boost += config.boostFactors.exactProtocolMatch;
  }

  // 2. Clinical section title match
  if (hasClinicalSectionMatch(chunk)) {
    boost += config.boostFactors.sectionTitleMatch;
  }

  // 3. Medication mention (if query mentions medications)
  const medications = extractMedications(query);
  if (hasMedicationMatch(medications, chunk)) {
    boost += config.boostFactors.medicationMention;
  }

  // 4. Dosage mention (for dosing queries)
  if (isDosingQuery(query) && hasDosagePattern(chunk.content)) {
    boost += config.boostFactors.dosageMention;
  }

  // 5. Criteria content (for criteria queries)
  if (isCriteriaQuery(query) && hasCriteriaContent(chunk)) {
    boost += config.boostFactors.criteriaMatch;
  }

  return boost;
}

// ============================================
// Penalty Scoring
// ============================================

/**
 * Calculate penalty score for administrative/metadata content
 */
function calculatePenaltyScore(chunk: RetrievedChunk): number {
  const normalizedContent = chunk.content.toLowerCase();

  let penalty = 0;

  // Check for administrative terms
  const adminMatches = ADMINISTRATIVE_TERMS.filter(term =>
    normalizedContent.includes(term)
  );

  // Penalize based on number of administrative terms found
  penalty += adminMatches.length * 0.05;

  // Penalize very short chunks ONLY if not clinical content
  // Clinical summaries are often brief but highly relevant
  const normalizedSection = (chunk.sectionTitle || '').toLowerCase();
  const isClinicalSection = CLINICAL_SECTIONS.some(section =>
    normalizedSection.includes(section)
  );

  if (chunk.content.length < 50 && !isClinicalSection) {
    penalty += 0.05;  // Reduced penalty, only for very short non-clinical chunks
  }

  // Penalize chunks that are mostly numbers/tables without context
  const numberRatio = (chunk.content.match(/\d/g) || []).length / chunk.content.length;
  if (numberRatio > 0.3) {
    penalty += 0.05;
  }

  // Cap penalty at 0.3 to avoid completely eliminating chunks
  return Math.min(penalty, 0.3);
}

// ============================================
// Main Reranking Function
// ============================================

/**
 * Rerank chunks using cross-encoder style scoring
 *
 * @param query - User's search query
 * @param chunks - Initial retrieved chunks
 * @param config - Optional reranker configuration
 * @returns Reranked chunks sorted by combined score
 */
export async function rerankChunks(
  query: string,
  chunks: RetrievedChunk[],
  config?: Partial<RerankerConfig>
): Promise<RetrievedChunk[]> {
  // Merge config with defaults
  const finalConfig: RerankerConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    boostFactors: {
      ...DEFAULT_CONFIG.boostFactors,
      ...(config?.boostFactors || {}),
    },
  };

  // Take top N chunks to rerank (performance optimization)
  const chunksToRerank = chunks.slice(0, finalConfig.maxChunksToRerank);

  // Calculate scores for each chunk
  const scores: RerankScore[] = chunksToRerank.map(chunk => {
    const lexicalScore = calculateLexicalScore(query, chunk);
    const boostScore = calculateBoostScore(query, chunk, finalConfig);
    const penaltyScore = calculatePenaltyScore(chunk);

    // Combine scores: original retrieval score + lexical + boost - penalty
    const finalScore =
      chunk.relevanceScore +
      lexicalScore * 0.3 +  // Weight lexical overlap at 30%
      boostScore -           // Add boosts
      penaltyScore;          // Subtract penalties

    return {
      chunkId: chunk.chunkId,
      originalScore: chunk.relevanceScore,
      lexicalScore,
      boostScore,
      penaltyScore,
      finalScore,
    };
  });

  // Log reranking details for top 3 chunks
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Reranker] Top 3 chunk scores:');
    scores.slice(0, 3).forEach((score, idx) => {
      console.log(`  [${idx + 1}] ${score.chunkId}:`, {
        original: score.originalScore.toFixed(3),
        lexical: score.lexicalScore.toFixed(3),
        boost: score.boostScore.toFixed(3),
        penalty: score.penaltyScore.toFixed(3),
        final: score.finalScore.toFixed(3),
      });
    });
  }

  // Create a map of scores for fast lookup
  const scoreMap = new Map(scores.map(s => [s.chunkId, s]));

  // Update chunks with new scores and sort
  const rerankedChunks = chunksToRerank
    .map(chunk => {
      const score = scoreMap.get(chunk.chunkId);
      if (!score) return chunk;

      return {
        ...chunk,
        relevanceScore: score.finalScore,
      };
    })
    .filter(chunk => chunk.relevanceScore >= finalConfig.minRelevanceAfterRerank)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Add back any chunks that weren't reranked (maintain original order)
  const remainingChunks = chunks.slice(finalConfig.maxChunksToRerank);

  return [...rerankedChunks, ...remainingChunks];
}

/**
 * Export default configuration for external use
 */
export { DEFAULT_CONFIG as DEFAULT_RERANKER_CONFIG };
