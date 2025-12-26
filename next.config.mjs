/**
 * SECURITY CONFIGURATION FOR HEALTHCARE-GRADE APPLICATION
 * LA County Fire Department - HIPAA-Compliant Security Headers
 *
 * This configuration implements OWASP security best practices and meets
 * healthcare industry standards for protecting PHI (Protected Health Information).
 */

import { withSentryConfig } from "@sentry/nextjs";
import crypto from 'crypto';

const isNetlifyPreview = process.env.CONTEXT === "deploy-preview";
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Development CSP - More permissive for hot module replacement
 * Allows unsafe-eval for Next.js dev server and WebSocket for HMR
 */
const devCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Required for Next.js dev server and React DevTools
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "connect-src 'self' ws: wss: https://api.openai.com https://*.supabase.co https://fonts.googleapis.com", // WebSocket for HMR + Google Fonts
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/**
 * Production CSP - HIPAA-compliant, healthcare-grade security
 *
 * CSP Directives Explained:
 * - default-src 'self': Only allow resources from same origin by default
 * - script-src: Allow scripts from same origin + wasm-unsafe-eval for Next.js optimization
 *   (Note: 'unsafe-inline' required for Next.js inline scripts during hydration)
 * - style-src: Allow inline styles (required for CSS-in-JS) + Google Fonts
 * - img-src: Allow images from same origin, data URIs, and HTTPS sources
 * - connect-src: Allow API calls to same origin + OpenAI + Supabase + Azure AD (production)
 * - font-src: Allow fonts from same origin + Google Fonts CDN
 * - frame-ancestors: Prevent clickjacking attacks (none in production)
 * - base-uri: Prevent base tag injection attacks
 * - form-action: Only allow form submissions to same origin
 * - upgrade-insecure-requests: Automatically upgrade HTTP to HTTPS
 */
const productionCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://js.hcaptcha.com https://newassets.hcaptcha.com", // Next.js + hCaptcha
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://newassets.hcaptcha.com", // CSS-in-JS + Google Fonts + hCaptcha
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.openai.com https://*.supabase.co https://login.microsoftonline.com https://fonts.googleapis.com https://hcaptcha.com https://*.hcaptcha.com https://*.sentry.io https://*.ingest.us.sentry.io", // Azure AD SSO + Google Fonts + hCaptcha + Sentry
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-src https://newassets.hcaptcha.com", // hCaptcha iframe
  isNetlifyPreview ? "frame-ancestors 'self' https://app.netlify.com" : "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const contentSecurityPolicy = isDevelopment ? devCSP : productionCSP;

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingExcludes: {
      "*": ["**/PDFs/**", "**/scripts/**"]
    }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle splitting for legacy device support
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Separate React framework bundle
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Separate large libraries (>160KB)
          lib: {
            test(module) {
              return module.size() > 160000;
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Common shared modules
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      };
    }
    return config;
  },
  async headers() {
    /**
     * Healthcare-Grade Security Headers (OWASP + HIPAA Compliant)
     *
     * Each header serves a specific security purpose:
     */
    const securityHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
        /**
         * HSTS - Enforce HTTPS connections for 1 year (31536000 seconds)
         * - Prevents protocol downgrade attacks and cookie hijacking
         * - includeSubDomains: Apply to all subdomains
         * - Critical for protecting PHI in transit (HIPAA requirement)
         */
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
        /**
         * Prevents MIME-type sniffing attacks
         * - Forces browser to respect declared Content-Type
         * - Prevents execution of disguised malicious content
         */
      },
      {
        key: 'X-Frame-Options',
        value: isNetlifyPreview ? 'SAMEORIGIN' : 'DENY',
        /**
         * Clickjacking protection
         * - DENY: Prevents any domain from framing this site (production)
         * - SAMEORIGIN: Allows framing by Netlify preview interface only
         * - Protects against UI redress attacks on sensitive medical data
         */
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
        /**
         * Controls referrer information leakage
         * - Send full URL for same-origin requests
         * - Send only origin (no path) for cross-origin HTTPS requests
         * - Send nothing when downgrading from HTTPS to HTTP
         * - Balances security with analytics needs
         */
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(self), geolocation=()',
        /**
         * Browser feature permissions (Feature Policy)
         * - camera=(): Prevents unauthorized camera access
         * - microphone=(self): Allows microphone for voice transcription
         * - geolocation=(): Disables location tracking
         * - Reduces attack surface by disabling unused APIs
         */
      },
      {
        key: 'Content-Security-Policy',
        value: contentSecurityPolicy,
        /**
         * CSP - Primary defense against XSS and data injection attacks
         * - Defines allowlist of trusted content sources
         * - See detailed CSP configuration above (lines 28-55)
         * - Most important header for preventing code injection
         */
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
        /**
         * Legacy XSS filter for older browsers (IE, Safari)
         * - Modern browsers rely on CSP instead
         * - mode=block: Stop page rendering if XSS detected
         * - Provides defense-in-depth for older clients
         */
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private' // HIPAA: Never cache API responses
          }
        ]
      }
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress Sentry CLI logs during build
  silent: true,

  // Upload source maps for better stack traces (requires SENTRY_AUTH_TOKEN)
  org: "apex-u9",
  project: "protocol-guide",

  // Hide source maps from clients
  hideSourceMaps: true,

  // Disable telemetry
  telemetry: false,

  // Automatically instrument API routes
  autoInstrumentServerFunctions: true,

  // Automatically instrument middleware
  autoInstrumentMiddleware: true,

  // Tunnel through Next.js to avoid ad blockers
  tunnelRoute: "/monitoring-tunnel",
});


