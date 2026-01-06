/**
 * Protocol Guide - RAG Retrieval Service
 *
 * Hybrid search combining keyword (full-text) and semantic (vector) search.
 * Returns relevant protocol chunks with confidence scoring.
 */

import { supabase } from '../supabase';
import { embedQuery } from './embeddings';

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
}

export interface QueryAnalysis {
  originalQuery: string;
  detectedProtocolRefs: string[];
  medicalTerms: string[];
  queryType: 'specific' | 'general' | 'procedural' | 'medication';
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
// Query Analysis
// ============================================

/**
 * Analyze query to extract protocol references and classify type
 */
function analyzeQuery(query: string): QueryAnalysis {
  const normalizedQuery = query.toLowerCase();

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
    detectedProtocolRefs: [...new Set(detectedRefs)],
    medicalTerms,
    queryType,
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
  // No results at all
  if (chunks.length === 0) {
    return {
      decline: true,
      reason: 'No relevant protocol information found.',
    };
  }

  // Very low confidence without explicit reference
  if (confidence < 0.25 && analysis.detectedProtocolRefs.length === 0) {
    return {
      decline: true,
      reason: 'Low confidence in retrieved information.',
    };
  }

  // Top result has very low relevance
  if (chunks[0].relevanceScore < 0.02) {
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
  }));
}

/**
 * Search by explicit protocol reference
 */
async function searchByRef(refNo: string): Promise<RetrievedChunk[]> {
  const { data, error } = await supabase.rpc('search_protocols_by_ref', {
    search_ref: refNo,
  });

  if (error) {
    console.error('Ref search error:', error);
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
    chunk_index: number;
  }) => ({
    chunkId: row.chunk_id,
    protocolId: row.protocol_id,
    protocolRef: row.protocol_ref,
    protocolTitle: row.protocol_title,
    category: row.category,
    sectionTitle: row.section_title,
    content: row.content,
    relevanceScore: 1.0, // Exact match
    matchType: 'keyword' as const,
  }));
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

  // Step 2: Generate query embedding
  let queryEmbedding: number[];
  try {
    // Enhance query with patient context if available
    let enhancedQuery = query;
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
        enhancedQuery = `${query} ${contextParts.join(' ')}`;
      }
    }

    queryEmbedding = await embedQuery(enhancedQuery);
  } catch (error) {
    console.error('Error generating query embedding:', error);
    // Fall back to keyword-only search
    queryEmbedding = [];
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
