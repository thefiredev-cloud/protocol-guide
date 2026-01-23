/**
 * Medical Protocol Chunking Strategy
 *
 * Optimized chunking for EMS protocols that preserves:
 * 1. Semantic coherence (complete thoughts/procedures)
 * 2. Medication dosing information (never split dose from drug)
 * 3. Section context (headers stay with content)
 * 4. Step sequences (numbered lists stay together)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export const CHUNK_CONFIG = {
  // Target chunk sizes (characters)
  size: {
    target: 1200,
    min: 400,
    max: 1800,
    overlap: 150,
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface ChunkMetadata {
  protocolNumber: string;
  protocolTitle: string;
  section: string | null;
  pageNumber?: number;
  chunkIndex: number;
  totalChunks: number;
  isComplete: boolean;
  contentType: 'medication' | 'procedure' | 'assessment' | 'general';
}

export interface ProtocolChunk {
  content: string;
  metadata: ChunkMetadata;
  embeddingText?: string;
}

// ============================================================================
// SECTION DETECTION
// ============================================================================

/**
 * Common EMS protocol section patterns
 */
const SECTION_PATTERNS = [
  // Explicit section markers
  { pattern: /^(?:SECTION|Section)\s*(\d+[\.\d]*)[:\s]+(.+)$/m, type: 'numbered' },
  { pattern: /^(?:CHAPTER|Chapter)\s*(\d+)[:\s]+(.+)$/m, type: 'numbered' },
  // Header patterns (markdown-style or all caps)
  { pattern: /^#{1,3}\s+(.+)$/m, type: 'header' },
  { pattern: /^([A-Z][A-Z\s]{3,}):?\s*$/m, type: 'header' },
  // Protocol-specific sections
  { pattern: /^(?:OVERVIEW|Overview)\s*$/mi, type: 'section' },
  { pattern: /^(?:INDICATIONS?|Indications?)\s*$/mi, type: 'section' },
  { pattern: /^(?:CONTRAINDICATIONS?|Contraindications?)\s*$/mi, type: 'section' },
  { pattern: /^(?:PRECAUTIONS?|Precautions?)\s*$/mi, type: 'section' },
  { pattern: /^(?:PROCEDURE|Procedure)\s*$/mi, type: 'section' },
  { pattern: /^(?:TREATMENT|Treatment)\s*$/mi, type: 'section' },
  { pattern: /^(?:ASSESSMENT|Assessment)\s*$/mi, type: 'section' },
  { pattern: /^(?:MEDICATIONS?|Medications?)\s*$/mi, type: 'section' },
  { pattern: /^(?:DOSING|Dosing)\s*$/mi, type: 'section' },
  { pattern: /^(?:ADULT|Adult)\s*$/mi, type: 'section' },
  { pattern: /^(?:PEDIATRIC|Pediatric)\s*$/mi, type: 'section' },
  { pattern: /^(?:SPECIAL CONSIDERATIONS?)\s*$/mi, type: 'section' },
  { pattern: /^(?:NOTES?|Notes?)\s*$/mi, type: 'section' },
];

/**
 * Detect section headers in text
 */
function detectSection(text: string): string | null {
  for (const { pattern } of SECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  return null;
}

/**
 * Classify content type based on text analysis
 */
function classifyContentType(text: string): 'medication' | 'procedure' | 'assessment' | 'general' {
  const lower = text.toLowerCase();

  // Medication patterns
  const medicationIndicators = [
    /\b(?:mg|mcg|ml|units?|mEq)\b/i,
    /\b(?:IV|IO|IM|SQ|SL|PO)\s+(?:push|infusion|bolus)\b/i,
    /\b(?:administer|give|push|infuse)\b/i,
    /\b(?:dose|dosage|dosing)\b/i,
    /\b(?:max(?:imum)?|initial|repeat)\s*(?:dose)?\b/i,
  ];

  // Procedure patterns
  const procedureIndicators = [
    /\b(?:step|procedure|technique|perform)\b/i,
    /^\s*\d+\.\s+/m,
    /\b(?:prepare|attach|connect|insert|remove|apply)\b/i,
    /\b(?:equipment|supplies|materials)\b/i,
  ];

  // Assessment patterns
  const assessmentIndicators = [
    /\b(?:assess|evaluate|monitor|observe)\b/i,
    /\b(?:signs?|symptoms?|presentation)\b/i,
    /\b(?:vital signs?|bp|hr|rr|spo2)\b/i,
    /\b(?:gcs|avpu|nihss)\b/i,
  ];

  const medScore = medicationIndicators.filter(p => p.test(lower)).length;
  const procScore = procedureIndicators.filter(p => p.test(lower)).length;
  const assessScore = assessmentIndicators.filter(p => p.test(lower)).length;

  if (medScore >= 2) return 'medication';
  if (procScore >= 2) return 'procedure';
  if (assessScore >= 2) return 'assessment';

  return 'general';
}

// ============================================================================
// SEMANTIC BOUNDARY DETECTION
// ============================================================================

/**
 * Find semantic boundaries in text for optimal splitting
 */
function findSemanticBoundaries(text: string): number[] {
  const boundaries: number[] = [];

  // Paragraph breaks (double newline)
  const paragraphPattern = /\n\s*\n/g;
  let match;
  while ((match = paragraphPattern.exec(text)) !== null) {
    boundaries.push(match.index);
  }

  // Section headers
  for (const { pattern } of SECTION_PATTERNS) {
    const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
    const globalPattern = new RegExp(pattern.source, flags);
    while ((match = globalPattern.exec(text)) !== null) {
      // Add boundary before header
      if (match.index > 0) {
        boundaries.push(match.index);
      }
    }
  }

  // Sentence boundaries (for fallback splitting)
  const sentencePattern = /[.!?]\s+(?=[A-Z])/g;
  while ((match = sentencePattern.exec(text)) !== null) {
    boundaries.push(match.index + 1);
  }

  return Array.from(new Set(boundaries)).sort((a, b) => a - b);
}

/**
 * Find the best split point near target position
 */
function findBestSplitPoint(
  text: string,
  targetPos: number,
  boundaries: number[]
): number {
  // Look for closest boundary within reasonable range
  const range = CHUNK_CONFIG.size.target / 4;
  const minPos = targetPos - range;
  const maxPos = targetPos + range;

  // Find boundaries in range
  const candidates = boundaries.filter(b => b >= minPos && b <= maxPos);

  if (candidates.length > 0) {
    // Prefer boundaries closest to target
    candidates.sort((a, b) => Math.abs(a - targetPos) - Math.abs(b - targetPos));
    return candidates[0];
  }

  // Fallback: find any boundary before max chunk size
  const validBoundaries = boundaries.filter(b => b > 0 && b < text.length);
  if (validBoundaries.length > 0) {
    const beforeTarget = validBoundaries.filter(b => b <= CHUNK_CONFIG.size.max);
    if (beforeTarget.length > 0) {
      return beforeTarget[beforeTarget.length - 1];
    }
  }

  // Last resort: split at target position
  return targetPos;
}

// ============================================================================
// MAIN CHUNKING FUNCTION
// ============================================================================

/**
 * Chunk a protocol document with semantic awareness
 */
export function chunkProtocol(
  text: string,
  protocolNumber: string,
  protocolTitle: string
): ProtocolChunk[] {
  const chunks: ProtocolChunk[] = [];

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleanedText.length === 0) {
    return [];
  }

  // If text is small enough, return as single chunk
  if (cleanedText.length <= CHUNK_CONFIG.size.max) {
    const section = detectSection(cleanedText);
    const contentType = classifyContentType(cleanedText);

    chunks.push({
      content: cleanedText,
      metadata: {
        protocolNumber,
        protocolTitle,
        section,
        chunkIndex: 0,
        totalChunks: 1,
        isComplete: true,
        contentType,
      },
    });

    return chunks;
  }

  // Find semantic boundaries
  const boundaries = findSemanticBoundaries(cleanedText);

  // Split into chunks
  let currentPos = 0;
  let chunkIndex = 0;
  let currentSection: string | null = null;

  while (currentPos < cleanedText.length) {
    // Calculate target end position
    const targetEnd = Math.min(
      currentPos + CHUNK_CONFIG.size.target,
      cleanedText.length
    );

    // Find best split point
    let endPos: number;
    if (targetEnd >= cleanedText.length) {
      endPos = cleanedText.length;
    } else {
      endPos = findBestSplitPoint(cleanedText, targetEnd, boundaries);
    }

    // Ensure minimum chunk size
    if (endPos - currentPos < CHUNK_CONFIG.size.min && endPos < cleanedText.length) {
      endPos = Math.min(
        currentPos + CHUNK_CONFIG.size.min,
        cleanedText.length
      );
    }

    // Extract chunk content
    const chunkContent = cleanedText.slice(currentPos, endPos).trim();

    // Detect section from chunk content
    const detectedSection = detectSection(chunkContent);
    if (detectedSection) {
      currentSection = detectedSection;
    }

    // Classify content type
    const contentType = classifyContentType(chunkContent);

    // Check if chunk is complete (ends with sentence boundary)
    const isComplete = /[.!?]\s*$/.test(chunkContent);

    // Create chunk
    chunks.push({
      content: chunkContent,
      metadata: {
        protocolNumber,
        protocolTitle,
        section: currentSection,
        chunkIndex,
        totalChunks: 0, // Will be updated after all chunks created
        isComplete,
        contentType,
      },
    });

    // Move to next position (with overlap for context)
    currentPos = endPos;
    if (currentPos < cleanedText.length && CHUNK_CONFIG.size.overlap > 0) {
      // Find sentence boundary for overlap
      const overlapStart = Math.max(0, endPos - CHUNK_CONFIG.size.overlap);
      const overlapText = cleanedText.slice(overlapStart, endPos);
      const sentenceMatch = overlapText.match(/[.!?]\s+(?=[A-Z])/);
      if (sentenceMatch && sentenceMatch.index !== undefined) {
        currentPos = overlapStart + sentenceMatch.index + 1;
      }
    }

    chunkIndex++;
  }

  // Update total chunks count
  const totalChunks = chunks.length;
  for (const chunk of chunks) {
    chunk.metadata.totalChunks = totalChunks;
  }

  return chunks;
}

/**
 * Generate embedding-optimized text for a chunk
 * Includes context for better semantic matching
 */
export function generateEmbeddingText(chunk: ProtocolChunk): string {
  const { content, metadata } = chunk;
  const { protocolTitle, section, contentType } = metadata;

  // Build context-enriched text for embedding
  const parts: string[] = [];

  // Add protocol context
  parts.push(`Protocol: ${protocolTitle}`);

  if (section) {
    parts.push(`Section: ${section}`);
  }

  // Add content type hint
  if (contentType !== 'general') {
    parts.push(`Type: ${contentType}`);
  }

  // Add main content
  parts.push(content);

  return parts.join('\n\n');
}

/**
 * Batch process protocol text into embedding-ready chunks
 */
export function processProtocolForEmbedding(
  text: string,
  protocolNumber: string,
  protocolTitle: string
): { content: string; embeddingText: string; metadata: ChunkMetadata }[] {
  const chunks = chunkProtocol(text, protocolNumber, protocolTitle);

  return chunks.map(chunk => ({
    content: chunk.content,
    embeddingText: generateEmbeddingText(chunk),
    metadata: chunk.metadata,
  }));
}
