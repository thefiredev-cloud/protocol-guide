const isNetlifyPreview = process.env.CONTEXT === "deploy-preview";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  "connect-src 'self' https://api.openai.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  isNetlifyPreview ? "frame-ancestors 'self' https://app.netlify.com" : "frame-ancestors 'none'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingExcludes: {
      "*": ["**/PDFs/**", "**/scripts/**"]
    }
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
    ];

    if (!isNetlifyPreview) {
      securityHeaders.splice(1, 0, { key: 'X-Frame-Options', value: 'DENY' });
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;


