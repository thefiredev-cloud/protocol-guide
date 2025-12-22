/**
 * PHI Sanitization for HIPAA Compliance
 * Removes/masks potential Protected Health Information before storage
 */

/**
 * PHI patterns to detect and sanitize
 */
const PHI_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string;
  name: string;
}> = [
  // Social Security Numbers
  {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[SSN REMOVED]',
    name: 'SSN',
  },
  {
    pattern: /\b\d{9}\b/g,
    replacement: '[ID REMOVED]',
    name: 'SSN-unformatted',
  },

  // Phone numbers
  {
    pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    replacement: '[PHONE REMOVED]',
    name: 'Phone',
  },
  {
    pattern: /\(\d{3}\)\s?\d{3}[-.]?\d{4}/g,
    replacement: '[PHONE REMOVED]',
    name: 'Phone-parens',
  },

  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    replacement: '[EMAIL REMOVED]',
    name: 'Email',
  },

  // Dates that could be DOB (MM/DD/YYYY, MM-DD-YYYY)
  {
    pattern:
      /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g,
    replacement: '[DATE REMOVED]',
    name: 'Date',
  },

  // Medical Record Numbers (common patterns)
  {
    pattern: /\bMRN[:\s]*\d{6,10}\b/gi,
    replacement: '[MRN REMOVED]',
    name: 'MRN',
  },
];

/**
 * Sanitize message content by removing PHI patterns
 *
 * @param content - Message content to sanitize
 * @returns Sanitized content
 */
export function sanitizeMessage(content: string): string {
  let sanitized = content;

  for (const { pattern, replacement } of PHI_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

/**
 * Detect potential PHI in content
 *
 * @param content - Content to check
 * @returns Detection result with types found
 */
export function detectPHI(content: string): {
  hasPHI: boolean;
  types: string[];
} {
  const detectedTypes: string[] = [];

  for (const { pattern, name } of PHI_PATTERNS) {
    // Reset regex state for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      detectedTypes.push(name);
    }
  }

  return {
    hasPHI: detectedTypes.length > 0,
    types: detectedTypes,
  };
}
