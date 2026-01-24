/**
 * CSP (Content Security Policy) Utilities
 *
 * Provides helpers for implementing nonce-based CSP to prevent XSS attacks.
 * The nonce is generated per-request and stored in res.locals.cspNonce.
 *
 * @example
 * // In your route handler
 * const html = injectCspNonce('<script>alert(1)</script>', res.locals.cspNonce);
 * // Returns: '<script nonce="abc123">alert(1)</script>'
 */

/**
 * Injects CSP nonce into inline script and style tags
 * @param html - HTML string to process
 * @param nonce - CSP nonce from res.locals.cspNonce
 * @returns HTML with nonce attributes added to inline scripts/styles
 */
export function injectCspNonce(html: string, nonce: string): string {
  if (!nonce) {
    throw new Error('CSP nonce not provided. Ensure CSP middleware is running.');
  }

  // Add nonce to inline <script> tags (but not external scripts with src attribute)
  let result = html.replace(
    /<script(?![^>]*\ssrc=)([^>]*)>/gi,
    `<script nonce="${nonce}"$1>`
  );

  // Add nonce to inline <style> tags (but not external stylesheets with href attribute)
  result = result.replace(
    /<style(?![^>]*\shref=)([^>]*)>/gi,
    `<style nonce="${nonce}"$1>`
  );

  return result;
}

/**
 * Generates a CSP-compliant nonce value
 * Used by the middleware in server/_core/index.ts
 * @returns Base64-encoded random nonce
 */
export function generateCspNonce(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Type augmentation for Express res.locals
 * Ensures TypeScript knows about res.locals.cspNonce
 */
declare global {
  namespace Express {
    interface Locals {
      cspNonce: string;
    }
  }
}

/**
 * Example usage in a route handler:
 *
 * ```typescript
 * import { injectCspNonce } from './csp-utils';
 *
 * app.get('/some-page', (req, res) => {
 *   const html = `
 *     <!DOCTYPE html>
 *     <html>
 *       <head>
 *         <style>body { margin: 0; }</style>
 *       </head>
 *       <body>
 *         <script>console.log('Hello');</script>
 *       </body>
 *     </html>
 *   `;
 *
 *   const secureHtml = injectCspNonce(html, res.locals.cspNonce);
 *   res.send(secureHtml);
 * });
 * ```
 *
 * The middleware in server/_core/index.ts automatically:
 * 1. Generates a unique nonce per request (res.locals.cspNonce)
 * 2. Configures Helmet to include the nonce in CSP headers
 *
 * For static HTML served by Netlify:
 * - Use hash-based CSP instead (see netlify.toml)
 * - Calculate SHA-256 hash: echo -n "<style-content>" | openssl dgst -sha256 -binary | openssl base64
 * - Add to CSP: style-src 'sha256-HASH_HERE'
 */
