/**
 * Protocol Guide - Source Validation Module
 *
 * Ensures all protocol content originates from authorized LA County DHS sources.
 * Critical for compliance, data integrity, and patient safety.
 *
 * AUTHORIZED SOURCE:
 * https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/
 */

import { supabase } from '../supabase';

// ============================================
// Configuration
// ============================================

export const AUTHORIZED_SOURCES = {
  primary: 'https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/',
  // Additional allowed patterns (subpaths of the primary)
  patterns: [
    /^https:\/\/dhs\.lacounty\.gov\/emergency-medical-services-agency\/.*/,
    /^https:\/\/file\.lacounty\.gov\/SDSInter\/dhs\/.*\.pdf$/, // LA County PDF resources
  ],
} as const;

// Pattern for validation
export const DHS_SOURCE_URL_PATTERN = /^https:\/\/dhs\.lacounty\.gov\/emergency-medical-services-agency\//;

// ============================================
// Types
// ============================================

export interface SourceValidationResult {
  isValid: boolean;
  sourceUrl: string | null;
  authorizedSource: string | null;
  reason?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SourceViolation {
  protocolId: string;
  protocolRef: string;
  sourceUrl: string | null;
  detectedAt: Date;
  context: string;
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validate that a source URL is from an authorized LA County DHS source
 */
export function validateSourceUrl(sourceUrl: string | null | undefined): SourceValidationResult {
  // Missing source URL is a warning (for legacy data without source tracking)
  if (!sourceUrl || sourceUrl.trim() === '') {
    return {
      isValid: true, // Allow but flag as warning
      sourceUrl: null,
      authorizedSource: AUTHORIZED_SOURCES.primary,
      reason: 'No source URL provided - content origin cannot be verified',
      severity: 'warning',
    };
  }

  const normalizedUrl = sourceUrl.trim();

  // Check against primary source
  if (normalizedUrl.toLowerCase().startsWith(AUTHORIZED_SOURCES.primary.toLowerCase())) {
    return {
      isValid: true,
      sourceUrl: normalizedUrl,
      authorizedSource: AUTHORIZED_SOURCES.primary,
      severity: 'info',
    };
  }

  // Check against allowed patterns
  for (const pattern of AUTHORIZED_SOURCES.patterns) {
    if (pattern.test(normalizedUrl)) {
      return {
        isValid: true,
        sourceUrl: normalizedUrl,
        authorizedSource: normalizedUrl,
        severity: 'info',
      };
    }
  }

  // Unauthorized source
  return {
    isValid: false,
    sourceUrl: normalizedUrl,
    authorizedSource: AUTHORIZED_SOURCES.primary,
    reason: `Unauthorized source: ${normalizedUrl}. Only LA County DHS EMS sources are permitted.`,
    severity: 'error',
  };
}

/**
 * Validate a batch of protocols for source compliance
 */
export function validateProtocolSources(
  protocols: Array<{ id: string; refNo: string; sourceUrl?: string | null }>
): {
  valid: string[];
  invalid: SourceViolation[];
  missing: string[];
} {
  const valid: string[] = [];
  const invalid: SourceViolation[] = [];
  const missing: string[] = [];

  for (const protocol of protocols) {
    const result = validateSourceUrl(protocol.sourceUrl);

    if (result.isValid) {
      if (!protocol.sourceUrl) {
        missing.push(protocol.id);
      }
      valid.push(protocol.id);
    } else {
      invalid.push({
        protocolId: protocol.id,
        protocolRef: protocol.refNo,
        sourceUrl: protocol.sourceUrl || null,
        detectedAt: new Date(),
        context: result.reason || 'Unauthorized source',
      });
    }
  }

  return { valid, invalid, missing };
}

/**
 * Log source violation to database and console
 */
export async function logSourceViolation(violation: SourceViolation): Promise<void> {
  // Console logging with severity
  console.error('[SOURCE VIOLATION]', {
    timestamp: violation.detectedAt.toISOString(),
    protocolId: violation.protocolId,
    protocolRef: violation.protocolRef,
    sourceUrl: violation.sourceUrl,
    context: violation.context,
    severity: 'CRITICAL',
  });

  // Persist to database (async, don't block)
  try {
    const { error } = await supabase.from('source_violations').insert({
      protocol_id: violation.protocolId,
      protocol_ref: violation.protocolRef,
      detected_source_url: violation.sourceUrl,
      violation_context: violation.context,
      detected_at: violation.detectedAt.toISOString(),
    });

    if (error) {
      console.error('Failed to log source violation to database:', error);
    }
  } catch (err) {
    console.error('Failed to log source violation to database:', err);
  }
}

/**
 * Check if a chunk should be filtered based on source validation
 */
export function shouldFilterChunk(chunk: {
  protocolId: string;
  sourceUrl?: string | null;
  sourceVerified?: boolean;
}): boolean {
  // If source_url is present, validate it
  if (chunk.sourceUrl) {
    const validation = validateSourceUrl(chunk.sourceUrl);
    return !validation.isValid;
  }

  // If source_verified is explicitly false and no URL, flag for review
  if (chunk.sourceVerified === false) {
    console.warn(`[SOURCE] Unverified chunk from protocol ${chunk.protocolId}`);
    // Don't filter, but log warning
    return false;
  }

  // For chunks without source metadata, allow (legacy data)
  return false;
}

/**
 * Filter chunks to only include those from authorized sources
 */
export function filterAuthorizedChunks<T extends {
  protocolId: string;
  protocolRef: string;
  sourceUrl?: string | null;
  sourceVerified?: boolean;
}>(chunks: T[]): {
  validChunks: T[];
  violations: SourceViolation[];
} {
  const validChunks: T[] = [];
  const violations: SourceViolation[] = [];

  for (const chunk of chunks) {
    if (chunk.sourceUrl) {
      const validation = validateSourceUrl(chunk.sourceUrl);

      if (validation.isValid) {
        validChunks.push(chunk);
      } else {
        violations.push({
          protocolId: chunk.protocolId,
          protocolRef: chunk.protocolRef,
          sourceUrl: chunk.sourceUrl,
          detectedAt: new Date(),
          context: `Retrieved during query - ${validation.reason}`,
        });
      }
    } else {
      // Chunk without source_url - include but may log warning
      if (chunk.sourceVerified === false) {
        console.warn(`[SOURCE] Including unverified chunk: ${chunk.protocolId}`);
      }
      validChunks.push(chunk);
    }
  }

  return { validChunks, violations };
}

/**
 * Validate source URL synchronously (for use in transforms)
 * Throws error if source is invalid
 */
export function assertValidSource(sourceUrl: string | null | undefined, context: string): void {
  const result = validateSourceUrl(sourceUrl);

  if (!result.isValid) {
    throw new Error(
      `[SOURCE VALIDATION FAILED] ${context}\n` +
      `Source: ${sourceUrl}\n` +
      `Reason: ${result.reason}\n` +
      `Only content from LA County DHS is authorized.`
    );
  }
}

/**
 * Get the default DHS source URL for protocols without explicit source
 */
export function getDefaultSourceUrl(): string {
  return AUTHORIZED_SOURCES.primary;
}
