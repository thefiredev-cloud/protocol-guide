/**
 * Protocol Guide - RAG Module
 *
 * Exports all RAG (Retrieval-Augmented Generation) functionality.
 */

export {
  generateEmbedding,
  generateEmbeddingsBatch,
  embedAllChunks,
  embedQuery,
  cosineSimilarity,
  estimateTokenCount,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
} from './embeddings';

export {
  retrieveContext,
  formatContextForAI,
  formatPatientContext,
  getConfidenceLevel,
  type RetrievedChunk,
  type QueryAnalysis,
  type RetrievalResult,
  type PatientContext,
} from './retrieval';

export {
  extractMentionedRefs,
  extractSourceReferences,
  mapRefsToCitations,
  validateGrounding,
  formatCitationsForDisplay,
  createCitationLinks,
  enhanceResponseWithCitations,
  isDeclineResponse,
  type Citation,
  type CitationValidation,
} from './citations';
