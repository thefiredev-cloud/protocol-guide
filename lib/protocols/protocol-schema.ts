import { z } from 'zod';

// =============================================================================
// DATABASE TABLE INTERFACES
// =============================================================================

/**
 * Protocol table interface - matches database schema from migration 006
 */
export interface Protocol {
  id: string;
  tp_code: string;
  tp_name: string;
  tp_category: string;
  full_text: string;
  summary?: string;
  keywords: string[];
  tags?: string[];
  chief_complaints: string[];
  conditions?: string[];
  base_contact_required: boolean;
  base_contact_criteria?: string;
  transport_destinations?: Record<string, unknown>;
  warnings: string[];
  contraindications: string[];
  version: number;
  effective_date: Date | string;
  expiration_date?: Date | string;
  is_current: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string;
}

/**
 * Protocol chunk table interface - searchable content segments
 */
export interface ProtocolChunk {
  id: string;
  protocol_id?: string;
  tp_code?: string;
  source_type: 'markdown' | 'pdf' | 'manual' | 'api';
  source_file: string;
  chunk_index: number;
  title: string;
  content: string;
  content_hash: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  protocol_codes: string[];
  content_length?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * Protocol embedding table interface - vector embeddings for semantic search
 */
export interface ProtocolEmbedding {
  id: string;
  chunk_id: string;
  protocol_id?: string;
  embedding: number[]; // 1536 dimensions for OpenAI text-embedding-3-small
  embedding_model: string;
  embedding_version: number;
  content_preview?: string;
  content_hash: string;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * Provider impression table interface - clinical impression mappings
 */
export interface ProviderImpression {
  id: string;
  pi_code: string;
  pi_name: string;
  tp_code: string;
  tp_code_pediatric?: string;
  guidelines?: string;
  symptoms: string[];
  keywords: string[];
  category?: string;
  version: number;
  is_current: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * Medication table interface - medication catalog
 */
export interface Medication {
  id: string;
  medication_name: string;
  generic_name?: string;
  brand_names?: string[];
  medication_class?: string;
  controlled_substance_schedule?: string;
  adult_dosing?: Record<string, unknown>;
  pediatric_dosing?: Record<string, unknown>;
  dosing_notes?: string;
  routes?: string[];
  concentration?: string;
  contraindications?: string[];
  warnings?: string[];
  adverse_effects?: string[];
  interactions?: string[];
  reference_number?: string;
  external_references?: Record<string, unknown>;
  is_available: boolean;
  formulary_status?: string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string;
}

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

/**
 * TP code validation - supports formats like "1210", "1211-P", "MCG-1309"
 */
export const TpCodeSchema = z.string().regex(
  /^(TP-?)?(\d{4})(-[A-Z])?$|^MCG-?\d{4}$/i,
  'Invalid TP code format. Expected: 1210, 1211-P, TP-1210, or MCG-1309'
);

/**
 * Protocol validation schema
 */
export const ProtocolSchema = z.object({
  tp_code: TpCodeSchema,
  tp_name: z.string().min(1, 'Protocol name is required'),
  tp_category: z.string().min(1, 'Category is required'),
  full_text: z.string().min(50, 'Protocol content must be at least 50 characters'),
  keywords: z.array(z.string()).default([]),
  chief_complaints: z.array(z.string()).default([]),
  base_contact_required: z.boolean().default(false),
  base_contact_criteria: z.string().optional(),
  transport_destinations: z.record(z.unknown()).optional(),
  warnings: z.array(z.string()).default([]),
  contraindications: z.array(z.string()).default([]),
  version: z.number().int().positive().default(1),
  effective_date: z.union([z.date(), z.string()]),
  is_current: z.boolean().default(true),
});

/**
 * Protocol chunk validation schema
 */
export const ProtocolChunkSchema = z.object({
  id: z.string().min(1),
  protocol_id: z.string().uuid().optional(),
  tp_code: z.string().optional(),
  source_type: z.enum(['markdown', 'pdf', 'manual', 'api']),
  source_file: z.string(),
  chunk_index: z.number().int().min(0),
  title: z.string(),
  content: z.string().min(1),
  content_hash: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  protocol_codes: z.array(z.string()).default([]),
});

/**
 * Provider impression validation schema
 */
export const ProviderImpressionSchema = z.object({
  pi_code: z.string().min(1),
  pi_name: z.string().min(1),
  tp_code: TpCodeSchema,
  tp_code_pediatric: TpCodeSchema.optional(),
  guidelines: z.string().optional(),
  symptoms: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  category: z.string().optional(),
  version: z.number().int().positive().default(1),
  is_current: z.boolean().default(true),
});

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Search options for protocol queries
 */
export interface SearchOptions {
  limit?: number;
  category?: string;
  includeDeprecated?: boolean;
  offset?: number;
}

/**
 * Hybrid search options (full-text + vector)
 */
export interface HybridSearchOptions extends SearchOptions {
  fulltextWeight?: number; // 0.0 to 1.0, default 0.4
  vectorWeight?: number;    // 0.0 to 1.0, default 0.6
  similarityThreshold?: number; // Minimum similarity score, default 0.7
}

/**
 * Protocol with full context (dependencies, medications, etc.)
 */
export interface ProtocolWithContext extends Protocol {
  dependencies?: Array<{
    tp_code: string;
    tp_name: string;
    dependency_type: string;
    description?: string;
  }>;
  medications?: Array<{
    medication_name: string;
    medication_class?: string;
    indication?: string;
    adult_dosing?: Record<string, unknown>;
    pediatric_dosing?: Record<string, unknown>;
    routes?: string[];
    contraindications?: string[];
    warnings?: string[];
    requires_base_contact?: boolean;
  }>;
  base_contact_info?: {
    required: boolean;
    criteria?: string;
    destinations?: Record<string, unknown>;
  };
}

/**
 * Search result with relevance scoring
 */
export interface ProtocolSearchResult {
  protocol_id: string;
  tp_code: string;
  tp_name: string;
  chunk_id?: string;
  chunk_title?: string;
  chunk_content?: string;
  relevance_score: number;
  match_type: 'fulltext' | 'vector' | 'hybrid';
}

/**
 * Migration data structure (from JSON files)
 */
export interface ProtocolMetadataJSON {
  id: string;
  title: string;
  category?: string;
  tpCode?: string;
  tpName?: string;
  protocolCodes?: string[];
  baseContact?: {
    required: boolean;
    criteria?: string;
    scenarios?: string[];
  };
  positioning?: {
    position: string;
    context?: string;
  };
  transport?: Array<{
    destination: string;
    criteria?: string;
  }>;
  warnings?: string[];
  contraindications?: string[];
  keywords?: string[];
  chiefComplaints?: string[];
  fullText?: string;
}

/**
 * Chunk data from JSON files
 */
export interface ChunkDataJSON {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  keywords?: string[];
  protocolCodes?: string[];
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid Protocol
 */
export function isProtocol(value: unknown): value is Protocol {
  try {
    ProtocolSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to check if a value is a valid ProtocolChunk
 */
export function isProtocolChunk(value: unknown): value is ProtocolChunk {
  try {
    ProtocolChunkSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to check if a value is a valid ProviderImpression
 */
export function isProviderImpression(value: unknown): value is ProviderImpression {
  try {
    ProviderImpressionSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Normalize TP code to standard format (e.g., "1210", "1211-P")
 */
export function normalizeTPCode(tpCode: string): string {
  // Remove "TP-" or "TP" prefix if present
  const normalized = tpCode.replace(/^TP-?/i, '');

  // Handle MCG codes
  if (normalized.startsWith('MCG-')) {
    return normalized.toUpperCase();
  }

  // Extract numeric part and suffix
  const match = normalized.match(/^(\d{4})(-[A-Z])?$/i);
  if (!match) {
    throw new Error(`Invalid TP code format: ${tpCode}`);
  }

  const [, code, suffix = ''] = match;
  return code + suffix.toUpperCase();
}

/**
 * Extract TP codes from content text
 */
export function extractTPCodesFromContent(content: string): string[] {
  const tpCodePattern = /\b(TP-?)?(\d{4})(-[A-Z])?\b|MCG-?\d{4}/gi;
  const matches = content.match(tpCodePattern);

  if (!matches) return [];

  // Normalize and deduplicate
  const codes = new Set(matches.map(code => {
    try {
      return normalizeTPCode(code);
    } catch {
      return null;
    }
  }).filter(Boolean) as string[]);

  return Array.from(codes);
}

/**
 * Helper function to deduplicate array
 */
function deduplicateArray<T>(arr: T[]): T[] {
  const seen = new Map<T, boolean>();
  return arr.filter(item => {
    if (seen.has(item)) return false;
    seen.set(item, true);
    return true;
  });
}

/**
 * Validate and sanitize protocol data before insertion
 */
export function sanitizeProtocolData(data: Partial<Protocol>): Partial<Protocol> {
  return {
    ...data,
    tp_code: data.tp_code ? normalizeTPCode(data.tp_code) : undefined,
    keywords: Array.isArray(data.keywords) ? deduplicateArray(data.keywords) : [],
    chief_complaints: Array.isArray(data.chief_complaints) ? deduplicateArray(data.chief_complaints) : [],
    warnings: Array.isArray(data.warnings) ? deduplicateArray(data.warnings) : [],
    contraindications: Array.isArray(data.contraindications) ? deduplicateArray(data.contraindications) : [],
  };
}

/**
 * Generate content hash for deduplication
 */
export async function generateContentHash(content: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
