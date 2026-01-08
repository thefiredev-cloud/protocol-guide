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

// Source validation exports - ensures only LA County DHS content
export {
  validateSourceUrl,
  validateProtocolSources,
  logSourceViolation,
  filterAuthorizedChunks,
  assertValidSource,
  getDefaultSourceUrl,
  AUTHORIZED_SOURCES,
  DHS_SOURCE_URL_PATTERN,
  type SourceValidationResult,
  type SourceViolation,
} from './source-validation';

// Reranker exports - cross-encoder style reranking for medical protocols
export {
  rerankChunks,
  DEFAULT_RERANKER_CONFIG,
  type RerankerConfig,
} from './reranker';

// Query preprocessing exports - comprehensive EMS query analysis
export {
  processQuery,
  isSimpleProtocolLookup,
  extractPrimaryProtocol,
  enhanceQueryWithContext,
  type ProcessedQuery,
} from './query-processor';
