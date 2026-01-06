/**
 * Protocol Guide - Citation Tracking
 *
 * Extracts and validates citations from AI responses.
 * Ensures responses are grounded in retrieved protocol content.
 */

import { RetrievedChunk, RetrievalResult } from './retrieval';

// ============================================
// Types
// ============================================

export interface Citation {
  protocolRef: string;
  protocolTitle: string;
  sectionTitle: string | null;
  chunkId: string;
  snippetUsed: string;
  confidence: number;
}

export interface CitationValidation {
  isGrounded: boolean;
  citations: Citation[];
  ungroundedClaims: string[];
  groundingScore: number;
}

// ============================================
// Citation Extraction
// ============================================

/**
 * Extract protocol references mentioned in AI response
 */
export function extractMentionedRefs(response: string): string[] {
  const patterns = [
    /(?:per|according to|ref(?:erence)?[:\s]*|tp[-\s]?|mcg[-\s]?)(\d{3,4})/gi,
    /\[SOURCE\s*(\d+)\]/gi,
    /protocol\s*(\d{3,4})/gi,
  ];

  const refs: string[] = [];

  for (const pattern of patterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        refs.push(match[1]);
      }
    }
  }

  return [...new Set(refs)];
}

/**
 * Extract SOURCE references from response (e.g., [SOURCE 1], [SOURCE 2])
 */
export function extractSourceReferences(response: string): number[] {
  const pattern = /\[SOURCE\s*(\d+)\]/gi;
  const sources: number[] = [];

  const matches = response.matchAll(pattern);
  for (const match of matches) {
    if (match[1]) {
      sources.push(parseInt(match[1], 10));
    }
  }

  return [...new Set(sources)];
}

/**
 * Map extracted references to retrieved chunks
 */
export function mapRefsToCitations(
  mentionedRefs: string[],
  sourceIndices: number[],
  chunks: RetrievedChunk[]
): Citation[] {
  const citations: Citation[] = [];
  const addedChunks = new Set<string>();

  // Map SOURCE indices to chunks (1-indexed)
  for (const idx of sourceIndices) {
    const chunk = chunks[idx - 1];
    if (chunk && !addedChunks.has(chunk.chunkId)) {
      citations.push({
        protocolRef: chunk.protocolRef,
        protocolTitle: chunk.protocolTitle,
        sectionTitle: chunk.sectionTitle,
        chunkId: chunk.chunkId,
        snippetUsed: chunk.content.substring(0, 200) + '...',
        confidence: chunk.relevanceScore,
      });
      addedChunks.add(chunk.chunkId);
    }
  }

  // Map protocol refs to chunks
  for (const ref of mentionedRefs) {
    const matchingChunks = chunks.filter(c =>
      c.protocolRef.includes(ref) ||
      c.protocolId.includes(ref)
    );

    for (const chunk of matchingChunks) {
      if (!addedChunks.has(chunk.chunkId)) {
        citations.push({
          protocolRef: chunk.protocolRef,
          protocolTitle: chunk.protocolTitle,
          sectionTitle: chunk.sectionTitle,
          chunkId: chunk.chunkId,
          snippetUsed: chunk.content.substring(0, 200) + '...',
          confidence: chunk.relevanceScore,
        });
        addedChunks.add(chunk.chunkId);
      }
    }
  }

  return citations;
}

// ============================================
// Grounding Validation
// ============================================

/**
 * Validate that response is grounded in retrieved context
 */
export function validateGrounding(
  response: string,
  retrieval: RetrievalResult
): CitationValidation {
  const mentionedRefs = extractMentionedRefs(response);
  const sourceIndices = extractSourceReferences(response);
  const citations = mapRefsToCitations(mentionedRefs, sourceIndices, retrieval.chunks);

  // Check for ungrounded claims (basic heuristic)
  const ungroundedClaims: string[] = [];

  // Look for dosage mentions not in context
  const dosagePattern = /(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g|units?)\b/gi;
  const responseDosages = [...response.matchAll(dosagePattern)];
  const contextText = retrieval.chunks.map(c => c.content).join(' ');

  for (const match of responseDosages) {
    const dosage = match[0];
    if (!contextText.toLowerCase().includes(dosage.toLowerCase())) {
      // Check if it's close enough (fuzzy match)
      const numericValue = match[1];
      if (!contextText.includes(numericValue)) {
        ungroundedClaims.push(`Dosage "${dosage}" not found in context`);
      }
    }
  }

  // Calculate grounding score
  let groundingScore = 1.0;

  // Penalize if no citations and response is substantive
  if (citations.length === 0 && response.length > 100) {
    groundingScore -= 0.3;
  }

  // Penalize for ungrounded claims
  groundingScore -= ungroundedClaims.length * 0.1;

  // Bonus for explicit source references
  if (sourceIndices.length > 0) {
    groundingScore += 0.1;
  }

  groundingScore = Math.max(0, Math.min(1, groundingScore));

  return {
    isGrounded: groundingScore >= 0.5 && ungroundedClaims.length < 3,
    citations,
    ungroundedClaims,
    groundingScore,
  };
}

// ============================================
// Citation Formatting
// ============================================

/**
 * Format citations for display in UI
 */
export function formatCitationsForDisplay(citations: Citation[]): string {
  if (citations.length === 0) return '';

  const uniqueProtocols = new Map<string, Citation>();
  for (const citation of citations) {
    if (!uniqueProtocols.has(citation.protocolRef)) {
      uniqueProtocols.set(citation.protocolRef, citation);
    }
  }

  const lines = Array.from(uniqueProtocols.values()).map(c =>
    `• ${c.protocolRef}: ${c.protocolTitle}`
  );

  return `Sources:\n${lines.join('\n')}`;
}

/**
 * Create clickable citation links
 */
export function createCitationLinks(citations: Citation[]): Array<{
  ref: string;
  title: string;
  protocolId: string;
}> {
  const uniqueProtocols = new Map<string, { ref: string; title: string; protocolId: string }>();

  for (const citation of citations) {
    if (!uniqueProtocols.has(citation.protocolRef)) {
      // Extract protocol ID from ref (e.g., "TP-1201" -> "1201")
      const idMatch = citation.protocolRef.match(/\d+/);
      const protocolId = idMatch ? idMatch[0] : citation.protocolRef;

      uniqueProtocols.set(citation.protocolRef, {
        ref: citation.protocolRef,
        title: citation.protocolTitle,
        protocolId,
      });
    }
  }

  return Array.from(uniqueProtocols.values());
}

// ============================================
// Response Enhancement
// ============================================

/**
 * Add citation markers to response if missing
 */
export function enhanceResponseWithCitations(
  response: string,
  retrieval: RetrievalResult
): string {
  // If response already has citations, return as-is
  if (response.includes('[SOURCE') || response.match(/ref\.?\s*\d{3,4}/i)) {
    return response;
  }

  // If we have high-confidence chunks, append citation
  if (retrieval.chunks.length > 0 && retrieval.confidence > 0.5) {
    const topRefs = retrieval.chunks
      .slice(0, 3)
      .map(c => c.protocolRef)
      .filter((v, i, a) => a.indexOf(v) === i); // Unique

    if (topRefs.length > 0) {
      return `${response}\n\n(Ref: ${topRefs.join(', ')})`;
    }
  }

  return response;
}

/**
 * Check if response contains "I don't know" type phrases
 */
export function isDeclineResponse(response: string): boolean {
  const declinePhrases = [
    "i don't have",
    "i don't know",
    "i cannot find",
    "no specific protocol",
    "not found in",
    "unable to find",
    "no information",
    "cannot answer",
    "beyond my knowledge",
    "consult medical control",
    "verify with protocol manual",
  ];

  const normalizedResponse = response.toLowerCase();
  return declinePhrases.some(phrase => normalizedResponse.includes(phrase));
}
