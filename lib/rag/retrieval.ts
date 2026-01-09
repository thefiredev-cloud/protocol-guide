/**
 * Protocol Guide - RAG Retrieval Service
 *
 * Hybrid search combining keyword (full-text) and semantic (vector) search.
 * Returns relevant protocol chunks with confidence scoring.
 */

import { supabase } from '../supabase';
import { embedQuery, EmbeddingTimeoutError, EmbeddingError } from './embeddings';
import { expandQuery, hasAcronyms, type ExpandedQueryResult } from './medical-acronyms';
import {
  filterAuthorizedChunks,
  logSourceViolation,
  type SourceViolation,
} from './source-validation';
import { rerankChunks } from './reranker';
import { processQuery, type ProcessedQuery } from './query-processor';

// ============================================
// Types
// ============================================

export interface RetrievedChunk {
  chunkId: string;
  protocolId: string;
  protocolRef: string;
  protocolTitle: string;
  category: string;
  sectionTitle: string | null;
  content: string;
  relevanceScore: number;
  matchType: 'keyword' | 'semantic' | 'both';
  sourceUrl?: string | null;
  sourceVerified?: boolean;
}

export interface QueryAnalysis {
  originalQuery: string;
  expandedQuery: string;
  detectedProtocolRefs: string[];
  medicalTerms: string[];
  queryType: 'specific' | 'general' | 'procedural' | 'medication';
  acronymExpansion: ExpandedQueryResult | null;
  hasAcronyms: boolean;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  protocols: Map<string, { ref: string; title: string; category: string }>;
  confidence: number;
  queryAnalysis: QueryAnalysis;
  shouldDecline: boolean;
  declineReason?: string;
  /** Search mode used - 'hybrid' is best, 'keyword-only' or 'exact-match' are fallbacks */
  searchMode: 'hybrid' | 'keyword-only' | 'exact-match';
  /** Reason for degraded search mode, if applicable */
  degradedReason?: string;
}

export interface PatientContext {
  age?: number;
  ageUnit?: 'years' | 'months' | 'days';
  weight?: number;
  sex?: 'male' | 'female' | 'unknown';
  chiefComplaint?: string;
  incidentType?: string;
}

// ============================================
// Criteria Query Detection
// ============================================

/**
 * Detect if query is asking about destination/specialty criteria
 * These queries need special handling to boost criteria-related content
 */
function detectCriteriaQuery(query: string): {
  isCriteriaQuery: boolean;
  criteriaType: string | null;
} {
  const normalizedQuery = query.toLowerCase();

  // Criteria-related terms
  const criteriaTerms = [
    'criteria', 'eligibility', 'requirements', 'qualifications',
    'indications', 'destination', 'referral', 'transport to'
  ];

  const hasCriteriaTerm = criteriaTerms.some(term => normalizedQuery.includes(term));

  // Specific criteria type detection
  const criteriaTypes: Record<string, string[]> = {
    'PMC': ['pmc', 'pediatric medical center', 'pediatric medical'],
    'PTC': ['ptc', 'pediatric trauma center', 'pediatric trauma'],
    'Stroke': ['stroke', 'csc', 'psc', 'lams', 'mlapss', 'stroke center'],
    'ECMO': ['ecmo', 'ecpr', 'extracorporeal'],
    'Trauma': ['trauma center', 'trauma triage', 'level i', 'level ii'],
    'Burn': ['burn center', 'burn criteria'],
    'STEMI': ['stemi', 'src', 'stemi receiving', 'cardiac cath'],
    'Perinatal': ['pregnancy', 'perinatal', 'ob', 'obstetric'],
    'Neonate': ['neonate', 'newborn', 'nicu', 'infant']
  };

  let detectedType: string | null = null;
  for (const [type, keywords] of Object.entries(criteriaTypes)) {
    if (keywords.some(kw => normalizedQuery.includes(kw))) {
      detectedType = type;
      break;
    }
  }

  return {
    isCriteriaQuery: hasCriteriaTerm || detectedType !== null,
    criteriaType: detectedType
  };
}

// ============================================
// Query Analysis
// ============================================

/**
 * Analyze query to extract protocol references, expand acronyms, and classify type
 */
function analyzeQuery(query: string): QueryAnalysis {
  const normalizedQuery = query.toLowerCase();

  // Step 1: Expand medical acronyms (LAMS, ECMO, PTC, etc.)
  const acronymExpansion = expandQuery(query);
  const queryHasAcronyms = hasAcronyms(query);

  // Detect explicit protocol references (TP-1201, Ref 1210, MCG 1302, policy 830, etc.)
  const refPatterns = [
    /(?:tp[-\s]?)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:ref\.?\s*)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:mcg[-\s]?)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:protocol\s*)(\d{3,4}(?:\.\d+)?)/gi,
    /(?:policy\s*)(\d{3,4}(?:\.\d+)?)/gi,
    /\b(\d{4}(?:\.\d+)?)\b/g, // Standalone 4-digit numbers (with optional decimal)
  ];

  const detectedRefs: string[] = [];
  for (const pattern of refPatterns) {
    const matches = Array.from(query.matchAll(pattern));
    for (const match of matches) {
      if (match[1]) {
        detectedRefs.push(match[1]);
      }
    }
  }

  // Add related protocols from acronym expansion
  if (acronymExpansion.relatedProtocols.length > 0) {
    detectedRefs.push(...acronymExpansion.relatedProtocols);
  }

  // Detect medical terms
  const medicalTermPatterns = [
    'cardiac arrest', 'chest pain', 'acs', 'stemi', 'nstemi',
    'seizure', 'stroke', 'cva', 'tia',
    'trauma', 'hemorrhage', 'bleeding',
    'respiratory', 'asthma', 'copd', 'dyspnea',
    'anaphylaxis', 'allergic', 'allergy',
    'hypoglycemia', 'diabetic', 'glucose',
    'overdose', 'toxicity', 'poisoning',
    'sepsis', 'infection',
    'pediatric', 'child', 'infant', 'neonate',
    'burn', 'hypothermia', 'hyperthermia',
    'intubation', 'airway', 'ventilation',
  ];

  const medicalTerms = medicalTermPatterns.filter(term =>
    normalizedQuery.includes(term)
  );

  // Classify query type
  let queryType: QueryAnalysis['queryType'] = 'general';

  if (detectedRefs.length > 0) {
    queryType = 'specific';
  } else if (normalizedQuery.match(/\b(dose|dosage|dosing|mg|mcg|ml|how much)\b/)) {
    queryType = 'medication';
  } else if (normalizedQuery.match(/\b(how to|procedure|steps|perform|technique)\b/)) {
    queryType = 'procedural';
  }

  return {
    originalQuery: query,
    expandedQuery: acronymExpansion.expandedQuery,
    detectedProtocolRefs: Array.from(new Set(detectedRefs)),
    medicalTerms,
    queryType,
    acronymExpansion: queryHasAcronyms ? acronymExpansion : null,
    hasAcronyms: queryHasAcronyms,
  };
}

// ============================================
// Confidence Scoring
// ============================================

/**
 * Normalize RRF score to [0,1] range
 *
 * RRF scores with k=30 and adaptive weights (1.0-2.0) typically range:
 * - Single source (keyword or semantic): ~0.03 (1/31)
 * - Both sources at rank 1: ~0.065 (2/31)
 * - Boosted scores (criteria/protocol match): up to ~1.5
 *
 * We use sigmoid-style normalization for more gradual scaling:
 * - score < 0.03: low confidence (< 0.3)
 * - score 0.03-0.06: medium confidence (0.3-0.7)
 * - score 0.06-0.10: high confidence (0.7-0.9)
 * - score > 0.10 or boosted: very high (> 0.9)
 */
function normalizeRelevanceScore(score: number): number {
  // Handle boosted scores (criteria/protocol matches that exceed normal RRF range)
  if (score > 0.5) {
    return Math.min(0.95 + (score - 0.5) * 0.1, 1);
  }

  // Sigmoid-style normalization for standard RRF scores
  // Maps ~0.05 to ~0.7 (center of sigmoid)
  const center = 0.05;
  const steepness = 30;
  return 1 / (1 + Math.exp(-steepness * (score - center)));
}

/**
 * Calculate retrieval confidence based on results
 * Optimized for medical RAG queries
 *
 * Returns a score in [0,1] where:
 * - 0.0-0.4: LOW confidence (may decline)
 * - 0.4-0.7: MEDIUM confidence (answer with caveats)
 * - 0.7-1.0: HIGH confidence (confident answer)
 */
function calculateConfidence(
  chunks: RetrievedChunk[],
  analysis: QueryAnalysis
): number {
  if (chunks.length === 0) return 0;

  // Weights for combining confidence factors
  const CONFIDENCE_WEIGHTS = {
    topScore: 0.35,        // Top chunk relevance
    matchTypeQuality: 0.25, // Both > semantic > keyword
    explicitRefMatch: 0.25, // Explicit protocol reference found
    protocolCoverage: 0.15  // Multiple relevant protocols
  };

  // Factor 1: Top chunk relevance (properly normalized)
  const topScore = normalizeRelevanceScore(chunks[0].relevanceScore);

  // Factor 2: Match type quality (both > semantic > keyword)
  const matchTypeScores = chunks.slice(0, 5).map(c =>
    c.matchType === 'both' ? 1 : c.matchType === 'semantic' ? 0.7 : 0.5
  );
  const avgMatchType = matchTypeScores.length > 0
    ? matchTypeScores.reduce((a, b) => a + b, 0) / matchTypeScores.length
    : 0;

  // Factor 3: Explicit reference match
  const hasExplicitMatch = analysis.detectedProtocolRefs.length > 0 &&
    analysis.detectedProtocolRefs.some(ref =>
      chunks.some(c =>
        c.protocolRef.includes(ref) ||
        c.protocolId.includes(ref)
      )
    );
  const explicitScore = hasExplicitMatch ? 1 : 0.5;

  // Factor 4: Coverage (multiple relevant protocols)
  const uniqueProtocols = new Set(chunks.map(c => c.protocolId)).size;
  const coverageScore = Math.min(uniqueProtocols / 3, 1);

  return (
    topScore * CONFIDENCE_WEIGHTS.topScore +
    avgMatchType * CONFIDENCE_WEIGHTS.matchTypeQuality +
    explicitScore * CONFIDENCE_WEIGHTS.explicitRefMatch +
    coverageScore * CONFIDENCE_WEIGHTS.protocolCoverage
  );
}

/**
 * Determine if we should decline to answer
 * Enhanced with query complexity adjustments and safety checks
 */
function shouldDeclineToAnswer(
  chunks: RetrievedChunk[],
  analysis: QueryAnalysis,
  confidence: number,
  criteriaInfo?: { isCriteriaQuery: boolean; criteriaType: string | null }
): { decline: boolean; reason?: string } {
  // CRITICAL: Known medical acronym = NEVER decline, always try to answer
  // This ensures ECMO, LAMS, mLAPSS, PSI, etc. always get a response
  if (analysis.hasAcronyms && analysis.acronymExpansion) {
    console.log('[RAG] Known medical acronym detected - bypassing ALL decline checks');
    return { decline: false };
  }

  // CRITICAL: Criteria queries (PMC, PTC, Stroke, etc.) = NEVER decline if chunks found
  if (criteriaInfo?.isCriteriaQuery && chunks.length > 0) {
    console.log('[RAG] Criteria query with results - bypassing decline checks');
    return { decline: false };
  }

  // CRITICAL: Never decline if explicit protocol reference detected
  if (analysis.detectedProtocolRefs.length > 0 && chunks.length > 0) {
    console.log('[RAG] Explicit protocol reference detected - bypassing decline checks');
    return { decline: false };
  }

  // CRITICAL: Never decline if we have multiple high-quality chunks
  // At least 3 chunks with relevance > 0.1 indicates strong match
  const highQualityChunks = chunks.filter(c => c.relevanceScore > 0.1);
  if (highQualityChunks.length >= 3) {
    console.log('[RAG] Multiple high-quality chunks found - bypassing decline checks');
    return { decline: false };
  }

  // No results at all
  if (chunks.length === 0) {
    return {
      decline: true,
      reason: 'No relevant protocol information found.',
    };
  }

  // Query complexity adjustment - longer queries should have lower thresholds
  // Medical queries often have 10+ words with context
  const queryWords = analysis.originalQuery.split(/\s+/).length;
  const complexityAdjustment = queryWords > 10 ? 0.02 : 0; // Lower thresholds for complex queries

  // New decline thresholds - lowered to improve recall for medical queries
  const DECLINE_THRESHOLDS = {
    minConfidenceWithAcronyms: 0.05 - complexityAdjustment,  // Was 0.08
    minConfidenceGeneral: 0.08 - complexityAdjustment,       // Was 0.12
    minTopRelevanceAcronyms: 0.003,   // Was 0.005
    minTopRelevanceGeneral: 0.005     // Was 0.01
  };

  // If acronym matched a related protocol, don't decline
  if (analysis.hasAcronyms && analysis.acronymExpansion) {
    const hasAcronymProtocolMatch = analysis.acronymExpansion.relatedProtocols.some(ref =>
      chunks.some(c =>
        c.protocolRef.includes(ref) ||
        c.protocolId.includes(ref)
      )
    );
    if (hasAcronymProtocolMatch) {
      return { decline: false };
    }
  }

  // Check confidence threshold
  const confidenceThreshold = analysis.hasAcronyms
    ? DECLINE_THRESHOLDS.minConfidenceWithAcronyms
    : DECLINE_THRESHOLDS.minConfidenceGeneral;

  // Very low confidence without explicit reference
  if (confidence < confidenceThreshold && analysis.detectedProtocolRefs.length === 0) {
    return {
      decline: true,
      reason: 'Low confidence in retrieved information.',
    };
  }

  // Check top relevance threshold
  const relevanceThreshold = analysis.hasAcronyms
    ? DECLINE_THRESHOLDS.minTopRelevanceAcronyms
    : DECLINE_THRESHOLDS.minTopRelevanceGeneral;

  // Top result has very low relevance
  if (chunks[0].relevanceScore < relevanceThreshold) {
    return {
      decline: true,
      reason: 'Retrieved protocols may not be relevant to your query.',
    };
  }

  return { decline: false };
}

// ============================================
// Search Functions
// ============================================

/**
 * Perform keyword (full-text) search using Supabase RPC
 */
async function keywordSearch(
  queryText: string,
  matchCount: number = 20
): Promise<Array<RetrievedChunk & { rank: number }>> {
  const { data, error } = await supabase.rpc('fulltext_search_protocols', {
    query_text: queryText,
    match_count: matchCount,
  });

  if (error) {
    console.error('[RAG] Keyword search error:', error);
    return [];
  }

  return (data || []).map((row: {
    chunk_id: string;
    protocol_id: string;
    protocol_ref: string;
    protocol_title: string;
    category: string;
    section_title: string | null;
    content: string;
    rank: number;
    source_url?: string | null;
    source_verified?: boolean;
  }) => ({
    chunkId: row.chunk_id,
    protocolId: row.protocol_id,
    protocolRef: row.protocol_ref,
    protocolTitle: row.protocol_title,
    category: row.category,
    sectionTitle: row.section_title,
    content: row.content,
    relevanceScore: 1 / (row.rank || 1), // Initial score (will be replaced by RRF)
    matchType: 'keyword' as const,
    sourceUrl: row.source_url,
    sourceVerified: row.source_verified,
    rank: row.rank,
  }));
}

/**
 * Perform semantic (vector) search using Supabase RPC
 */
async function semanticSearch(
  queryEmbedding: number[],
  matchCount: number = 20
): Promise<Array<RetrievedChunk & { similarity: number }>> {
  const { data, error } = await supabase.rpc('semantic_search_protocols', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    similarity_threshold: 0.5, // Minimum cosine similarity
  });

  if (error) {
    console.error('[RAG] Semantic search error:', error);
    return [];
  }

  return (data || []).map((row: {
    chunk_id: string;
    protocol_id: string;
    protocol_ref: string;
    protocol_title: string;
    category: string;
    section_title: string | null;
    content: string;
    similarity: number;
    source_url?: string | null;
    source_verified?: boolean;
  }) => ({
    chunkId: row.chunk_id,
    protocolId: row.protocol_id,
    protocolRef: row.protocol_ref,
    protocolTitle: row.protocol_title,
    category: row.category,
    sectionTitle: row.section_title,
    content: row.content,
    relevanceScore: row.similarity, // Initial score (will be replaced by RRF)
    matchType: 'semantic' as const,
    sourceUrl: row.source_url,
    sourceVerified: row.source_verified,
    similarity: row.similarity,
  }));
}

/**
 * Determine adaptive weights based on query type
 * Medical domain: exact protocol refs favor keyword, symptom queries favor semantic
 */
function getAdaptiveWeights(analysis: QueryAnalysis): { keyword: number; semantic: number } {
  // Exact protocol references should heavily favor keyword search
  // E.g., "TP-1201", "protocol 1210", "MCG 502"
  if (analysis.detectedProtocolRefs.length > 0) {
    console.log('[RRF] Using protocol-ref weights (keyword-heavy)');
    return { keyword: 2.0, semantic: 0.8 };
  }

  // Medication/dosage queries favor keyword (exact doses, drug names matter)
  // E.g., "epinephrine dose", "how much adenosine", "fentanyl dosing"
  if (analysis.queryType === 'medication') {
    console.log('[RRF] Using medication weights (keyword-heavy)');
    return { keyword: 1.8, semantic: 1.0 };
  }

  // Procedural queries balance both (steps + conceptual understanding)
  // E.g., "how to intubate", "RSI procedure", "defibrillation steps"
  if (analysis.queryType === 'procedural') {
    console.log('[RRF] Using procedural weights (balanced)');
    return { keyword: 1.2, semantic: 1.3 };
  }

  // General/symptom queries favor semantic (conceptual matching)
  // E.g., "chest pain", "difficulty breathing", "altered mental status"
  console.log('[RRF] Using general/symptom weights (semantic-heavy)');
  return { keyword: 1.0, semantic: 1.6 };
}

/**
 * Reciprocal Rank Fusion (RRF) with adaptive weighting
 * Optimized k=30 for medical domain (lower k = more emphasis on top ranks)
 *
 * Formula: RRF_score = Σ (weight_i / (k + rank_i))
 * where:
 * - k = 30 (tuned for medical/EMS domain, down from typical 60)
 * - weight_i = adaptive weight based on query type
 * - rank_i = position in result list (1-indexed)
 */
function reciprocalRankFusion(
  keywordResults: Array<RetrievedChunk & { rank: number }>,
  semanticResults: Array<RetrievedChunk & { similarity: number }>,
  analysis: QueryAnalysis,
  k: number = 30 // Lowered from 60 for medical domain
): RetrievedChunk[] {
  const weights = getAdaptiveWeights(analysis);

  console.log('[RRF] Configuration:', {
    k,
    keywordWeight: weights.keyword,
    semanticWeight: weights.semantic,
    queryType: analysis.queryType
  });

  // Minimum relevance thresholds before fusion
  const KEYWORD_MIN_RANK = 100; // Drop results ranked > 100
  const SEMANTIC_MIN_SIMILARITY = 0.5; // Drop results with similarity < 0.5

  // Filter results by minimum thresholds
  const filteredKeyword = keywordResults.filter(
    chunk => chunk.rank <= KEYWORD_MIN_RANK
  );
  const filteredSemantic = semanticResults.filter(
    chunk => chunk.similarity >= SEMANTIC_MIN_SIMILARITY
  );

  console.log('[RRF] Threshold filtering:', {
    keyword: `${filteredKeyword.length}/${keywordResults.length} passed (rank ≤ ${KEYWORD_MIN_RANK})`,
    semantic: `${filteredSemantic.length}/${semanticResults.length} passed (similarity ≥ ${SEMANTIC_MIN_SIMILARITY})`
  });

  // Build rank maps for RRF scoring
  const keywordRanks = new Map<string, number>();
  filteredKeyword.forEach((chunk, idx) => {
    keywordRanks.set(chunk.chunkId, idx + 1); // 1-indexed rank
  });

  const semanticRanks = new Map<string, number>();
  filteredSemantic.forEach((chunk, idx) => {
    semanticRanks.set(chunk.chunkId, idx + 1); // 1-indexed rank
  });

  // Build chunk map for deduplication
  // Strategy: Preserve the variant with the best original score
  const chunkMap = new Map<string, RetrievedChunk>();

  // Add all keyword results
  for (const chunk of filteredKeyword) {
    chunkMap.set(chunk.chunkId, chunk);
  }

  // Add semantic results, preserving best-scoring variant
  for (const chunk of filteredSemantic) {
    const existing = chunkMap.get(chunk.chunkId);
    if (!existing) {
      // New chunk, add it
      chunkMap.set(chunk.chunkId, chunk);
    } else {
      // Chunk exists from keyword search
      // Keep the one with better semantic similarity if available
      if (chunk.similarity > (existing as any).similarity || 0) {
        // Preserve keyword rank info but update with better semantic data
        chunkMap.set(chunk.chunkId, {
          ...existing,
          matchType: 'both', // Mark as appearing in both
        });
      }
    }
  }

  // Calculate RRF scores for all unique chunks
  const scoredChunks: Array<RetrievedChunk & { rrfScore: number; debugInfo?: any }> = [];

  // Convert Map.entries() to array for iteration (TypeScript compatibility)
  const chunkEntries = Array.from(chunkMap.entries());

  for (const [chunkId, chunk] of chunkEntries) {
    const keywordRank = keywordRanks.get(chunkId);
    const semanticRank = semanticRanks.get(chunkId);

    // RRF formula: score = Σ weight_i / (k + rank_i)
    let rrfScore = 0;
    let matchType: 'keyword' | 'semantic' | 'both' = chunk.matchType;
    const debugInfo: any = {};

    if (keywordRank !== undefined) {
      const keywordContribution = weights.keyword / (k + keywordRank);
      rrfScore += keywordContribution;
      debugInfo.keywordRank = keywordRank;
      debugInfo.keywordContribution = keywordContribution.toFixed(4);
    }

    if (semanticRank !== undefined) {
      const semanticContribution = weights.semantic / (k + semanticRank);
      rrfScore += semanticContribution;
      debugInfo.semanticRank = semanticRank;
      debugInfo.semanticContribution = semanticContribution.toFixed(4);
    }

    // Update match type if appears in both
    if (keywordRank !== undefined && semanticRank !== undefined) {
      matchType = 'both';
    }

    scoredChunks.push({
      ...chunk,
      matchType,
      relevanceScore: rrfScore, // Replace with RRF score
      rrfScore,
      debugInfo,
    });
  }

  // Sort by RRF score (descending)
  scoredChunks.sort((a, b) => b.rrfScore - a.rrfScore);

  // Log top results for debugging
  console.log('[RRF] Top 5 fused results:', scoredChunks.slice(0, 5).map(c => ({
    ref: c.protocolRef,
    score: c.rrfScore.toFixed(4),
    type: c.matchType,
    debug: c.debugInfo
  })));

  return scoredChunks;
}

/**
 * Perform hybrid search with RRF fusion (with 4s timeout)
 * Combines keyword and semantic search using Reciprocal Rank Fusion
 */
async function hybridSearch(
  queryText: string,
  queryEmbedding: number[],
  analysis: QueryAnalysis,
  matchCount: number = 10
): Promise<RetrievedChunk[]> {
  const SEARCH_TIMEOUT = 4000; // 4 seconds

  // Run keyword and semantic searches in parallel
  const keywordPromise = keywordSearch(queryText, matchCount * 2);
  const semanticPromise = semanticSearch(queryEmbedding, matchCount * 2);

  // Timeout with cleanup
  // Note: Supabase RPC calls don't support AbortController, so background
  // promises continue after timeout. This is acceptable for client-side usage
  // but should be monitored if converted to server-side with high concurrency.
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Search timeout')), SEARCH_TIMEOUT);
  });

  try {
    const [keywordResults, semanticResults] = await Promise.race([
      Promise.all([keywordPromise, semanticPromise]),
      timeoutPromise
    ]);

    // Clear timeout on success
    clearTimeout(timeoutId!);

    console.log('[Hybrid Search] Raw results:', {
      keyword: keywordResults.length,
      semantic: semanticResults.length
    });

    // Perform RRF fusion with adaptive weighting
    const fusedResults = reciprocalRankFusion(
      keywordResults,
      semanticResults,
      analysis
    );

    console.log('[Hybrid Search] Fused results:', fusedResults.length);

    return fusedResults.slice(0, matchCount);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[RAG] Hybrid search failed: ${errorMessage}, falling back to keyword-only search`);

    // Fallback to keyword-only
    try {
      const fallbackResults = await keywordSearch(queryText, matchCount);
      console.log('[RAG] Fallback keyword search returned:', fallbackResults.length);
      return fallbackResults.slice(0, matchCount);
    } catch (fallbackError) {
      console.error('[RAG] Fallback search also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Search by explicit protocol reference (exact matching)
 */
async function searchByRef(refNo: string): Promise<RetrievedChunk[]> {
  // Use exact search function for better precision
  const { data, error } = await supabase.rpc('search_protocols_by_ref_exact', {
    search_ref: refNo,
  });

  if (error) {
    // Fall back to original function if exact search not available
    console.warn('Exact search failed, falling back:', error);
    const { data: fallbackData, error: fallbackError } = await supabase.rpc('search_protocols_by_ref', {
      search_ref: refNo,
    });
    if (fallbackError) {
      console.error('Ref search error:', fallbackError);
      return [];
    }
    return (fallbackData || []).map((row: {
      chunk_id: string;
      protocol_id: string;
      protocol_ref: string;
      protocol_title: string;
      category: string;
      section_title: string | null;
      content: string;
      chunk_index: number;
    }) => ({
      chunkId: row.chunk_id,
      protocolId: row.protocol_id,
      protocolRef: row.protocol_ref,
      protocolTitle: row.protocol_title,
      category: row.category,
      sectionTitle: row.section_title,
      content: row.content,
      relevanceScore: 1.0,
      matchType: 'keyword' as const,
    }));
  }

  return (data || []).map((row: {
    chunk_id: string;
    protocol_id: string;
    protocol_ref: string;
    protocol_title: string;
    category: string;
    section_title: string | null;
    content: string;
    chunk_index: number;
    match_quality: string;
    source_url?: string | null;
    source_verified?: boolean;
  }) => ({
    chunkId: row.chunk_id,
    protocolId: row.protocol_id,
    protocolRef: row.protocol_ref,
    protocolTitle: row.protocol_title,
    category: row.category,
    sectionTitle: row.section_title,
    content: row.content,
    // Score based on match quality
    relevanceScore: row.match_quality === 'exact_id' || row.match_quality === 'exact_ref' ? 1.5 :
                   row.match_quality === 'tp_prefix' || row.match_quality === 'ref_prefix' ? 1.3 :
                   row.match_quality === 'mcg_prefix' ? 1.2 : 1.0,
    matchType: 'keyword' as const,
    sourceUrl: row.source_url,
    sourceVerified: row.source_verified,
  }));
}

/**
 * Check if query is a numeric-only protocol reference
 */
function isNumericProtocolQuery(query: string): boolean {
  const trimmed = query.trim();
  // Match: "1201", "TP-1201", "Ref 1201", "MCG 1302", "protocol 521", "policy 830"
  return /^(?:tp[-\s]?|ref\.?\s*|mcg[-\s]?|protocol\s*|policy\s*)?(\d{3,4}(?:\.\d+)?)$/i.test(trimmed);
}

/**
 * Extract protocol number from query (supports decimals like 1317.6)
 */
function extractProtocolNumber(query: string): string | null {
  const match = query.match(/(\d{3,4}(?:\.\d+)?)/);
  return match ? match[1] : null;
}

// ============================================
// Main Retrieval Function
// ============================================

/**
 * Retrieve relevant context for a query
 */
export async function retrieveContext(
  query: string,
  patientContext?: PatientContext | null,
  options: {
    maxChunks?: number;
    boostExplicitRefs?: boolean;
  } = {}
): Promise<RetrievalResult> {
  const { maxChunks = 10, boostExplicitRefs = true } = options;

  // Step 1: Analyze query
  const analysis = analyzeQuery(query);

  // Step 1b: Detect criteria queries (PMC, PTC, Stroke, etc.)
  const criteriaInfo = detectCriteriaQuery(query);
  if (criteriaInfo.isCriteriaQuery) {
    console.log('[RAG] Criteria query detected:', criteriaInfo.criteriaType);
  }

  // FAST PATH: For numeric protocol queries, skip hybrid search entirely
  // This ensures "1201" returns TP-1201 with 100% confidence
  if (isNumericProtocolQuery(query)) {
    const protocolNum = extractProtocolNumber(query);
    if (protocolNum) {
      console.log('[RAG] Fast-path: numeric protocol query', protocolNum);
      const exactResults = await searchByRef(protocolNum);

      if (exactResults.length > 0) {
        // Build protocol map
        const protocols = new Map<string, { ref: string; title: string; category: string }>();
        for (const chunk of exactResults) {
          if (!protocols.has(chunk.protocolId)) {
            protocols.set(chunk.protocolId, {
              ref: chunk.protocolRef,
              title: chunk.protocolTitle,
              category: chunk.category,
            });
          }
        }

        return {
          chunks: exactResults.slice(0, maxChunks),
          protocols,
          confidence: 1.0, // Maximum confidence for exact protocol match
          queryAnalysis: analysis,
          shouldDecline: false,
          searchMode: 'exact-match',
        };
      }
    }
  }

  // Step 2: Generate query embedding using expanded query with RETRY LOGIC
  let queryEmbedding: number[] = [];
  let searchMode: 'hybrid' | 'keyword-only' = 'hybrid';
  let degradedReason: string | undefined;

  // Build enhanced query first
  let enhancedQuery = analysis.expandedQuery;

  // Further enhance with patient context if available
  if (patientContext) {
    const contextParts: string[] = [];
    if (patientContext.age) {
      const ageStr = `${patientContext.age} ${patientContext.ageUnit || 'years'}`;
      contextParts.push(`patient age: ${ageStr}`);
      // Detect pediatric
      if (patientContext.age < 18 || patientContext.ageUnit === 'months' || patientContext.ageUnit === 'days') {
        contextParts.push('pediatric');
      }
    }
    if (patientContext.chiefComplaint) {
      contextParts.push(`chief complaint: ${patientContext.chiefComplaint}`);
    }
    if (contextParts.length > 0) {
      enhancedQuery = `${enhancedQuery} ${contextParts.join(' ')}`;
    }
  }

  // Log acronym expansion for debugging
  if (analysis.hasAcronyms && analysis.acronymExpansion) {
    console.log('[RAG] Acronym expansion:', {
      original: query,
      expanded: analysis.expandedQuery,
      acronyms: analysis.acronymExpansion.detectedAcronyms.map(a => a.acronym),
      relatedProtocols: analysis.acronymExpansion.relatedProtocols,
    });
  }

  // RETRY LOGIC: Try up to 3 times with exponential backoff
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      queryEmbedding = await embedQuery(enhancedQuery);
      console.log(`[RAG] Embedding SUCCESS on attempt ${attempt}`);
      break;
    } catch (error) {
      // Log typed errors appropriately
      if (error instanceof EmbeddingTimeoutError) {
        console.warn(`[RAG] Embedding attempt ${attempt}/${maxAttempts} TIMEOUT`);
      } else if (error instanceof EmbeddingError) {
        console.error(`[RAG] Embedding attempt ${attempt}/${maxAttempts} FAILED:`, error.message);
      } else {
        console.error(`[RAG] Embedding attempt ${attempt}/${maxAttempts} UNEXPECTED ERROR:`, error);
      }

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  // Log final embedding status and set degraded mode
  if (queryEmbedding.length === 0) {
    console.warn('[RAG] All embedding attempts failed - using keyword-only search');
    searchMode = 'keyword-only';
    degradedReason = 'Embedding service unavailable - using keyword search only';
  }

  // Step 3: Perform searches
  let allChunks: RetrievedChunk[] = [];

  // 3a: Hybrid search
  if (queryEmbedding.length > 0) {
    const hybridResults = await hybridSearch(query, queryEmbedding, analysis, maxChunks * 2);
    allChunks.push(...hybridResults);
  }

  // 3b: Explicit reference search (if detected)
  if (boostExplicitRefs && analysis.detectedProtocolRefs.length > 0) {
    for (const ref of analysis.detectedProtocolRefs) {
      const refResults = await searchByRef(ref);
      // Boost these results
      const boostedResults = refResults.map(r => ({
        ...r,
        relevanceScore: Math.min(r.relevanceScore + 0.5, 1.5),
      }));
      allChunks.push(...boostedResults);
    }
  }

  // 3c: Criteria-specific protocol search (PMC, PTC, Stroke, etc.)
  if (criteriaInfo.isCriteriaQuery && criteriaInfo.criteriaType) {
    const criteriaProtocolMap: Record<string, string[]> = {
      'PMC': ['510', '507', '508'],  // Pediatric Medical Center criteria (NOT 506 - that's Trauma)
      'PTC': ['506', '510'],                 // Pediatric trauma refs
      'Stroke': ['1210', '503'],             // Stroke protocol refs
      'ECMO': ['1318', '1210'],              // MCG 1318 ECPR + Cardiac Arrest
      'Trauma': ['506', '502'],              // Trauma triage refs
      'Burn': ['506', '1228'],               // Burn criteria refs
      'STEMI': ['1211', '503'],              // STEMI/cardiac refs
      'Perinatal': ['510', '507'],           // Perinatal/newborn refs
      'Neonate': ['510', '507'],             // Neonate refs
    };

    const relatedRefs = criteriaProtocolMap[criteriaInfo.criteriaType] || [];
    console.log(`[RAG] Searching criteria-related protocols:`, relatedRefs);

    for (const ref of relatedRefs) {
      const refResults = await searchByRef(ref);
      // Boost criteria-related results
      const boostedResults = refResults.map(r => ({
        ...r,
        relevanceScore: Math.min(r.relevanceScore + 0.8, 1.6),
      }));
      allChunks.push(...boostedResults);
    }
  }

  // Step 4: Deduplicate and rank
  const seen = new Set<string>();
  const uniqueChunks = allChunks.filter(chunk => {
    if (seen.has(chunk.chunkId)) return false;
    seen.add(chunk.chunkId);
    return true;
  });

  // Sort by relevance
  uniqueChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Take top results for reranking (2x maxChunks for reranker input)
  const candidateChunks = uniqueChunks.slice(0, maxChunks * 2);

  // Step 4a: Apply reranking for better precision
  const rerankedChunks = await rerankChunks(query, candidateChunks, {
    maxChunksToRerank: maxChunks * 2,
    minRelevanceAfterRerank: 0.01,
    boostFactors: {
      exactProtocolMatch: criteriaInfo.isCriteriaQuery ? 0.2 : 0.3,
      sectionTitleMatch: 0.2,
      medicationMention: 0.15,
      dosageMention: analysis.queryType === 'medication' ? 0.25 : 0.15,
      criteriaMatch: criteriaInfo.isCriteriaQuery ? 0.35 : 0.25,
    },
  });

  // Take top results after reranking
  const topChunks = rerankedChunks.slice(0, maxChunks);

  // Step 4b: Filter by authorized source (LA County DHS only)
  const { validChunks, violations } = filterAuthorizedChunks(topChunks);

  // Log any source violations detected during retrieval
  if (violations.length > 0) {
    console.error(`[RAG] Filtered ${violations.length} chunks from unauthorized sources`);
    // Log each violation asynchronously (don't block retrieval)
    violations.forEach(v => logSourceViolation(v));
  }

  // Use validChunks for the rest of the function
  const filteredChunks = validChunks;

  // Step 5: Calculate confidence (using filtered chunks)
  const confidence = calculateConfidence(filteredChunks, analysis);

  // Step 6: Check if we should decline
  const declineCheck = shouldDeclineToAnswer(filteredChunks, analysis, confidence, criteriaInfo);

  // Step 7: Build protocol map (using filtered chunks)
  const protocols = new Map<string, { ref: string; title: string; category: string }>();
  for (const chunk of filteredChunks) {
    if (!protocols.has(chunk.protocolId)) {
      protocols.set(chunk.protocolId, {
        ref: chunk.protocolRef,
        title: chunk.protocolTitle,
        category: chunk.category,
      });
    }
  }

  return {
    chunks: filteredChunks,
    protocols,
    confidence,
    queryAnalysis: analysis,
    shouldDecline: declineCheck.decline,
    declineReason: declineCheck.reason,
    searchMode,
    degradedReason,
  };
}

// ============================================
// Context Formatting
// ============================================

/**
 * Format retrieved chunks as context for the AI
 */
export function formatContextForAI(result: RetrievalResult): string {
  if (result.chunks.length === 0) {
    return '';
  }

  const contextBlocks = result.chunks.map((chunk, idx) => {
    return `[SOURCE ${idx + 1}] Protocol: ${chunk.protocolRef} - ${chunk.protocolTitle}
Section: ${chunk.sectionTitle || 'General'}
Content: ${chunk.content}
---`;
  });

  return contextBlocks.join('\n\n');
}

/**
 * Format patient context for the AI
 */
export function formatPatientContext(ctx: PatientContext | null): string {
  if (!ctx) return '';

  const parts: string[] = [];

  if (ctx.age !== undefined) {
    parts.push(`Age: ${ctx.age} ${ctx.ageUnit || 'years'}`);
  }
  if (ctx.weight) {
    parts.push(`Weight: ${ctx.weight} kg`);
  }
  if (ctx.sex && ctx.sex !== 'unknown') {
    parts.push(`Sex: ${ctx.sex}`);
  }
  if (ctx.chiefComplaint) {
    parts.push(`Chief Complaint: ${ctx.chiefComplaint}`);
  }
  if (ctx.incidentType) {
    parts.push(`Incident: ${ctx.incidentType}`);
  }

  return parts.length > 0 ? `PATIENT INFO: ${parts.join(' | ')}` : '';
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (confidence >= 0.7) return 'HIGH';
  if (confidence >= 0.4) return 'MEDIUM';
  return 'LOW';
}
