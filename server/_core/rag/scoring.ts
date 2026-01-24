/**
 * Scoring and Re-ranking Functions for RAG Pipeline
 * 
 * Provides multiple re-ranking strategies to improve result relevance:
 * - Basic re-ranking with keyword and section boosting
 * - Advanced re-ranking with semantic signals
 * - Context-aware boosting based on agency/state
 * - Reciprocal Rank Fusion for multi-query result merging
 */

import type { NormalizedQuery } from '../ems-query-normalizer';
import type { RetrievalResult } from './index';
import { RAG_CONFIG } from './index';

// ============================================================================
// RE-RANKING
// ============================================================================

/**
 * Re-rank results for improved relevance
 * Uses lightweight heuristics to avoid additional LLM calls
 */
export function rerankResults(
  results: RetrievalResult[],
  normalized: NormalizedQuery
): RetrievalResult[] {
  if (!RAG_CONFIG.rerank.enabled || results.length === 0) {
    return results;
  }

  const queryTerms = normalized.normalized.toLowerCase().split(/\s+/);
  const medications = normalized.extractedMedications;
  const conditions = normalized.extractedConditions;

  const scored = results.map(result => {
    let score = result.similarity * 100; // Base score from vector similarity

    const contentLower = result.content.toLowerCase();
    const titleLower = result.protocolTitle.toLowerCase();
    const sectionLower = (result.section || '').toLowerCase();

    // Boost for title matches
    for (const term of queryTerms) {
      if (term.length > 2 && titleLower.includes(term)) {
        score += 5;
      }
    }

    // Boost for medication matches in content
    for (const med of medications) {
      if (contentLower.includes(med)) {
        score += 8;
      }
    }

    // Boost for condition matches
    for (const condition of conditions) {
      if (contentLower.includes(condition)) {
        score += 6;
      }
    }

    // Boost for section relevance
    for (const [sectionKeyword, priority] of Object.entries(RAG_CONFIG.rerank.sectionPriority)) {
      if (sectionLower.includes(sectionKeyword)) {
        score += priority;
      }
    }

    // Boost for boost keywords
    for (const keyword of RAG_CONFIG.rerank.boostKeywords) {
      if (contentLower.includes(keyword)) {
        score += 2;
      }
    }

    // Penalty for very short content (likely incomplete)
    if (result.content.length < 200) {
      score -= 5;
    }

    // Bonus for content with specific dosing information
    if (/\d+\s*(?:mg|mcg|ml|units?|g)\b/i.test(result.content)) {
      if (normalized.intent === 'medication_dosing') {
        score += 10;
      }
    }

    return {
      ...result,
      rerankedScore: score,
    };
  });

  // Sort by reranked score
  return scored.sort((a, b) => (b.rerankedScore || 0) - (a.rerankedScore || 0));
}

// ============================================================================
// ADVANCED RE-RANKING WITH SEMANTIC SIGNALS
// ============================================================================

/**
 * Enhanced re-ranking with additional semantic signals
 * Considers term frequency, position, and section relevance
 */
export function advancedRerank(
  results: RetrievalResult[],
  normalized: NormalizedQuery
): RetrievalResult[] {
  if (results.length === 0) {
    return results;
  }

  const queryTerms = normalized.normalized.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const medications = normalized.extractedMedications;
  const conditions = normalized.extractedConditions;

  const scored = results.map(result => {
    let score = (result.rerankedScore || result.similarity * 100);

    const contentLower = result.content.toLowerCase();
    const titleLower = result.protocolTitle.toLowerCase();
    const sectionLower = (result.section || '').toLowerCase();

    // Term frequency scoring - more matches = higher score
    let termMatches = 0;
    for (const term of queryTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) {
        termMatches += matches.length;
      }
    }
    score += Math.min(termMatches * 2, 20); // Cap at 20 points

    // Position scoring - earlier mentions are more relevant
    for (const term of queryTerms) {
      const position = contentLower.indexOf(term);
      if (position !== -1 && position < 200) {
        score += 5; // Boost for early mention
      }
    }

    // Exact phrase matching
    const queryPhrase = normalized.original.toLowerCase();
    if (contentLower.includes(queryPhrase)) {
      score += 15; // Strong boost for exact phrase match
    }

    // Title relevance (already in basic rerank, but with higher weight)
    for (const term of queryTerms) {
      if (titleLower.includes(term)) {
        score += 8;
      }
    }

    // Medication name in title
    for (const med of medications) {
      if (titleLower.includes(med)) {
        score += 12;
      }
    }

    // Condition name in title
    for (const condition of conditions) {
      if (titleLower.includes(condition)) {
        score += 10;
      }
    }

    // Protocol number match (for direct lookups)
    const protocolNumMatch = normalized.original.match(/\b(\d{3,4})\b/);
    if (protocolNumMatch && result.protocolNumber.includes(protocolNumMatch[1])) {
      score += 50; // Very strong boost for protocol number match
    }

    // Dosage information presence for medication queries
    if (normalized.intent === 'medication_dosing') {
      if (/\d+\s*(?:mg|mcg|ml|g|units?)\b/i.test(result.content)) {
        score += 15;
      }
      if (/(?:adult|pediatric|peds?)\s*(?:dose|dosing)?/i.test(result.content)) {
        score += 8;
      }
    }

    // Procedure step presence for procedure queries
    if (normalized.intent === 'procedure_steps') {
      const stepCount = (result.content.match(/\b(?:step|\d+\.)\s/gi) || []).length;
      if (stepCount > 2) {
        score += 10;
      }
    }

    // Contraindication presence for safety queries
    if (normalized.intent === 'contraindication_check') {
      if (/contraindicated?|caution|warning|avoid|do not/i.test(result.content)) {
        score += 12;
      }
    }

    // Emergent content boost
    if (normalized.isEmergent) {
      if (/immediate|stat|emergency|critical/i.test(result.content)) {
        score += 8;
      }
    }

    return {
      ...result,
      rerankedScore: score,
    };
  });

  return scored.sort((a, b) => (b.rerankedScore || 0) - (a.rerankedScore || 0));
}

// ============================================================================
// CONTEXT-AWARE BOOSTING
// ============================================================================

/**
 * Apply context-aware boosting based on user's agency/state
 */
export function applyContextBoost(
  results: RetrievalResult[],
  userAgencyId?: number | null,
  userStateCode?: string | null
): RetrievalResult[] {
  if (!userAgencyId && !userStateCode) {
    return results;
  }

  return results.map(result => {
    let boost = 0;

    // Check if result matches user's agency (from metadata if available)
    const metadata = result.metadata as { agencyId?: number; stateCode?: string } | undefined;

    if (metadata?.agencyId && metadata.agencyId === userAgencyId) {
      boost += 15; // Strong boost for same agency
    }

    if (metadata?.stateCode && metadata.stateCode === userStateCode) {
      boost += 5; // Moderate boost for same state
    }

    return {
      ...result,
      rerankedScore: (result.rerankedScore || result.similarity * 100) + boost,
    };
  });
}

// ============================================================================
// RECIPROCAL RANK FUSION (RRF)
// ============================================================================

/**
 * Reciprocal Rank Fusion constant (k)
 * Higher k = more smoothing, lower k = top results dominate
 * 60 is a common choice that balances contribution from multiple rankings
 */
const RRF_K = 60;

/**
 * Merge multiple result lists using Reciprocal Rank Fusion
 * Better than simple interleaving for combining semantic + keyword results
 */
export function reciprocalRankFusion(
  resultLists: RetrievalResult[][],
  limit: number = 10
): RetrievalResult[] {
  const scoreMap = new Map<number, { result: RetrievalResult; score: number }>();

  for (const results of resultLists) {
    for (let rank = 0; rank < results.length; rank++) {
      const result = results[rank];
      const rrfScore = 1 / (RRF_K + rank + 1);

      const existing = scoreMap.get(result.id);
      if (existing) {
        existing.score += rrfScore;
        // Keep the result with higher original similarity
        if (result.similarity > existing.result.similarity) {
          existing.result = result;
        }
      } else {
        scoreMap.set(result.id, { result, score: rrfScore });
      }
    }
  }

  // Sort by RRF score and return top results
  const merged = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ result, score }) => ({
      ...result,
      rerankedScore: score * 100, // Scale for display
    }));

  return merged;
}
