/**
 * Content Sanitizer for LLM Responses
 *
 * Provides defense-in-depth sanitization for AI-generated content
 * to prevent XSS and other injection attacks.
 *
 * HIPAA Note: This module does NOT log content to avoid PHI exposure.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Allowed HTML tags for sanitized output
 * Keep minimal for security - protocol content should be plain text
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'ul',
  'ol',
  'li',
  'span',
];

/**
 * Allowed HTML attributes
 * Minimal set - no href, src, onclick, etc.
 */
const ALLOWED_ATTR = ['class'];

/**
 * Suspicious patterns that may indicate prompt injection or XSS attempts
 */
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i, // onclick, onerror, etc.
  /data:/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /<form/i,
  /document\./i,
  /window\./i,
  /eval\s*\(/i,
  /Function\s*\(/i,
];

/**
 * Check if content contains suspicious patterns
 * @param content - Content to check
 * @returns true if suspicious patterns found
 */
export function containsSuspiciousPatterns(content: string): boolean {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(content));
}

/**
 * Sanitize protocol content for safe rendering
 * Removes all potentially dangerous HTML/JS while preserving safe formatting
 *
 * @param content - Raw content from LLM or other sources
 * @returns Sanitized content safe for rendering
 */
export function sanitizeProtocolContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // First check for suspicious patterns
  if (containsSuspiciousPatterns(content)) {
    // Log security event (without content to avoid PHI)
    console.warn('[Security] Suspicious content pattern detected and sanitized');
  }

  // Use DOMPurify with strict configuration
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true, // Keep text content when removing tags
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });

  return sanitized;
}

/**
 * Sanitize plain text - strips ALL HTML
 * Use for content that should be pure text
 *
 * @param content - Content to sanitize
 * @returns Plain text with no HTML
 */
export function sanitizeToPlainText(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove all HTML tags
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // Also decode HTML entities
  return sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Validate and sanitize medication name
 * Extra strict - only alphanumeric, spaces, and hyphens
 *
 * @param name - Medication name to validate
 * @returns Sanitized medication name
 */
export function sanitizeMedicationName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Only allow letters, numbers, spaces, and hyphens
  return name.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
}

/**
 * Sanitize protocol number
 * Only allows digits and optional P/p suffix
 *
 * @param protocol - Protocol number to validate
 * @returns Sanitized protocol number or empty string
 */
export function sanitizeProtocolNumber(protocol: string): string {
  if (!protocol || typeof protocol !== 'string') {
    return '';
  }

  // Match pattern like "1210" or "1210-P"
  const match = protocol.match(/^(\d{4})(-[Pp])?$/);
  return match ? match[0].toUpperCase() : '';
}
