/**
 * Protocol Guide - RAG Retrieval Service
 *
 * Hybrid search combining keyword (full-text) and semantic (vector) search.
 * Returns relevant protocol chunks with confidence scoring.
 */

import { supabase } from '../supabase';
import { embedQuery } from './embeddings';
import { expandQuery, hasAcronyms, type ExpandedQueryResult } from './medical-acronyms';
import {
  filterAuthorizedChunks,
  logSourceViolation,
  type SourceViolation,
} from './source-validation';

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

  // Detect explicit protocol references (TP-1201, Ref 1210, MCG 1302, etc.)
  const refPatterns = [
    /(?:tp[-\s]?)(\d{3,4})/gi,
    /(?:ref\.?\s*)(\d{3,4})/gi,
    /(?:mcg[-\s]?)(\d{3,4})/gi,
    /(?:protocol\s*)(\d{3,4})/gi,
    /\b(\d{4})\b/g, // Standalone 4-digit numbers
  ];

  const detectedRefs: string[] = [];
  for (const pattern of refPatterns) {
    const matches = query.matchAll(pattern);
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
    detectedProtocolRefs: [...new Set(detectedRefs)],
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
 * Calculate retrieval confidence based on results
 */
function calculateConfidence(
  chunks: RetrievedChunk[],
  analysis: QueryAnalysis
): number {
  if (chunks.length === 0) return 0;

  const factors = {
    topScoreWeight: 0.4,
    matchTypeWeight: 0.3,
    explicitRefWeight: 0.2,
    coverageWeight: 0.1,
  };

  // Factor 1: Top chunk relevance (normalize to 0-1)
  const topScore = Math.min(chunks[0].relevanceScore * 20, 1);

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
    topScore * factors.topScoreWeight +
    avgMatchType * factors.matchTypeWeight +
    explicitScore * factors.explicitRefWeight +
    coverageScore * factors.coverageWeight
  );
}

/**
 * Determine if we should decline to answer
 */
function shouldDeclineToAnswer(
  chunks: RetrievedChunk[],
  analysis: QueryAnalysis,
  confidence: number
): { decline: boolean; reason?: string } {
  // CRITICAL: Known medical acronym = NEVER decline, always try to answer
  // This ensures ECMO, LAMS, mLAPSS, PSI, etc. always get a response
  if (analysis.hasAcronyms && analysis.acronymExpansion) {
    console.log('[RAG] Known medical acronym detected - bypassing ALL decline checks');
    return { decline: false };
  }

  // No results at all
  if (chunks.length === 0) {
    return {
      decline: true,
      reason: 'No relevant protocol information found.',
    };
  }

  // Lower threshold for queries with recognized medical acronyms
  // Acronyms like LAMS, ECMO, PTC have mapped protocol references
  // Lowered thresholds to improve recall (was 0.15/0.25)
  const confidenceThreshold = analysis.hasAcronyms ? 0.08 : 0.12;

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

  // Very low confidence without explicit reference
  if (confidence < confidenceThreshold && analysis.detectedProtocolRefs.length === 0) {
    return {
      decline: true,
      reason: 'Low confidence in retrieved information.',
    };
  }

  // Top result has very low relevance (lowered for acronym queries)
  // Further lowered to prevent false declines
  const relevanceThreshold = analysis.hasAcronyms ? 0.005 : 0.01;
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
 * Perform hybrid search using Supabase RPC
 */
async function hybridSearch(
  queryText: string,
  queryEmbedding: number[],
  matchCount: number = 10
): Promise<RetrievedChunk[]> {
  const { data, error } = await supabase.rpc('hybrid_search_protocols', {
    query_text: queryText,
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });

  if (error) {
    console.error('Hybrid search error:', error);
    throw error;
  }

  return (data || []).map((row: {
    chunk_id: string;
    protocol_id: string;
    protocol_ref: string;
    protocol_title: string;
    category: string;
    section_title: string | null;
    content: string;
    relevance_score: number;
    match_type: string;
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
    relevanceScore: row.relevance_score,
    matchType: row.match_type as 'keyword' | 'semantic' | 'both',
    sourceUrl: row.source_url,
    sourceVerified: row.source_verified,
  }));
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
  }));
}

/**
 * Check if query is a numeric-only protocol reference
 */
function isNumericProtocolQuery(query: string): boolean {
  const trimmed = query.trim();
  // Match: "1201", "TP-1201", "Ref 1201", "MCG 1302", "protocol 521"
  return /^(?:tp[-\s]?|ref\.?\s*|mcg[-\s]?|protocol\s*)?(\d{3,4})$/i.test(trimmed);
}

/**
 * Extract protocol number from query
 */
function extractProtocolNumber(query: string): string | null {
  const match = query.match(/(\d{3,4})/);
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
        };
      }
    }
  }

  // Step 2: Generate query embedding using expanded query with RETRY LOGIC
  let queryEmbedding: number[] = [];

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
      console.error(`[RAG] Embedding attempt ${attempt}/${maxAttempts} FAILED:`, error);
      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  // Log final embedding status
  if (queryEmbedding.length === 0) {
    console.warn('[RAG] All embedding attempts failed - using keyword-only search');
  }

  // Step 3: Perform searches
  let allChunks: RetrievedChunk[] = [];

  // 3a: Hybrid search
  if (queryEmbedding.length > 0) {
    const hybridResults = await hybridSearch(query, queryEmbedding, maxChunks * 2);
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

  // Step 4: Deduplicate and rank
  const seen = new Set<string>();
  const uniqueChunks = allChunks.filter(chunk => {
    if (seen.has(chunk.chunkId)) return false;
    seen.add(chunk.chunkId);
    return true;
  });

  // Sort by relevance
  uniqueChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Take top results
  const topChunks = uniqueChunks.slice(0, maxChunks);

  // Step 5: Calculate confidence
  const confidence = calculateConfidence(topChunks, analysis);

  // Step 6: Check if we should decline
  const declineCheck = shouldDeclineToAnswer(topChunks, analysis, confidence);

  // Step 7: Build protocol map
  const protocols = new Map<string, { ref: string; title: string; category: string }>();
  for (const chunk of topChunks) {
    if (!protocols.has(chunk.protocolId)) {
      protocols.set(chunk.protocolId, {
        ref: chunk.protocolRef,
        title: chunk.protocolTitle,
        category: chunk.category,
      });
    }
  }

  return {
    chunks: topChunks,
    protocols,
    confidence,
    queryAnalysis: analysis,
    shouldDecline: declineCheck.decline,
    declineReason: declineCheck.reason,
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
