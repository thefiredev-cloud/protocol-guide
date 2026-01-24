# Content Security Policy (CSP) Security Implementation

## Overview

This document explains the CSP security improvements implemented to prevent XSS (Cross-Site Scripting) attacks across the Protocol Guide application.

## Security Fixes Applied

### 1. Backend API Server (`server/_core/index.ts`)

#### Before (Vulnerable)
```typescript
scriptSrc: ["'self'", "'unsafe-inline'"],  // VULNERABLE to XSS
styleSrc: ["'self'", "'unsafe-inline'"],   // VULNERABLE to CSS injection
imgSrc: ["'self'", "data:", "https:", "blob:"],  // Too permissive
fontSrc: ["'self'", "data:", "https:"],     // Too permissive
```

#### After (Secure)
```typescript
scriptSrc: [
  "'self'",
  (req, res) => `'nonce-${res.locals.cspNonce}'`,  // ✅ Nonce-based CSP
  ENV.isProduction ? "" : "'unsafe-eval'",         // Only in dev for HMR
],
styleSrc: [
  "'self'",
  (req, res) => `'nonce-${res.locals.cspNonce}'`,  // ✅ Nonce-based CSP
],
imgSrc: [
  "'self'",
  "data:",
  "blob:",
  "https://*.supabase.co",  // ✅ Restricted to Supabase only
],
fontSrc: [
  "'self'",
  "data:",
  "https://fonts.gstatic.com",  // ✅ Restricted to Google Fonts only
],
connectSrc: [
  // ... existing origins
  "https://protocol-guide-production.up.railway.app",  // ✅ Added Railway backend
],
```

### 2. Frontend Netlify CSP (`netlify.toml`)

#### Before (Vulnerable)
```toml
style-src 'self' 'unsafe-inline';  # VULNERABLE
img-src 'self' data: https:;       # Too permissive
font-src 'self' data:;             # Missing trusted sources
```

#### After (Secure)
```toml
style-src 'self' 'sha256-oFgClRU4Ehoik1pRJieVXsCrbQAwssqUDdL4hnGQ6to=';  # ✅ Hash-based CSP
img-src 'self' data: blob: https://*.supabase.co;  # ✅ Restricted
font-src 'self' data: https://fonts.gstatic.com;   # ✅ Restricted
connect-src ... https://protocol-guide-production.up.railway.app;  # ✅ Added Railway
```

## How It Works

### Nonce-Based CSP (Backend Server)

1. **Middleware generates unique nonce per request**
   ```typescript
   app.use((req, res, next) => {
     res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
     next();
   });
   ```

2. **Helmet includes nonce in CSP header**
   ```typescript
   scriptSrc: [
     "'self'",
     (req, res) => `'nonce-${res.locals.cspNonce}'`,
   ]
   ```

3. **Add nonce to inline scripts/styles**
   ```html
   <script nonce="<%= cspNonce %>">
     console.log('Secure inline script');
   </script>
   ```

### Hash-Based CSP (Static Frontend)

For static HTML served by Netlify, we use SHA-256 hashes:

1. **Calculate hash of inline style**
   ```bash
   echo -n "/* CSS content */" | openssl dgst -sha256 -binary | openssl base64
   ```

2. **Add hash to CSP**
   ```toml
   style-src 'self' 'sha256-HASH_HERE';
   ```

3. **HTML remains unchanged**
   ```html
   <style id="expo-reset">
     /* Inline styles work with hash-based CSP */
   </style>
   ```

## Using CSP Nonces in Server Routes

If you need to serve HTML from the backend server:

```typescript
import { injectCspNonce } from '../_core/csp-utils';

app.get('/some-page', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>body { margin: 0; }</style>
      </head>
      <body>
        <script>console.log('Hello');</script>
      </body>
    </html>
  `;

  // Automatically adds nonce attributes to inline scripts/styles
  const secureHtml = injectCspNonce(html, res.locals.cspNonce);
  res.send(secureHtml);
});
```

## Adding New Inline Styles to Frontend

If you need to add new inline styles to `web/index.html`:

1. **Add the style to HTML**
   ```html
   <style id="my-new-style">
     /* Your CSS */
   </style>
   ```

2. **Calculate SHA-256 hash**
   ```bash
   echo -n "/* Your CSS */" | openssl dgst -sha256 -binary | openssl base64
   ```

3. **Add hash to `netlify.toml`**
   ```toml
   style-src 'self' 'sha256-EXISTING_HASH' 'sha256-NEW_HASH';
   ```

## Security Benefits

### Before Fixes
- ❌ **'unsafe-inline'** allows ANY inline script/style → XSS vulnerability
- ❌ **'https:'** allows images from ANY HTTPS domain → Data exfiltration risk
- ❌ Missing Railway backend → CORS errors, broken functionality

### After Fixes
- ✅ **Nonce-based CSP** → Only whitelisted inline code executes
- ✅ **Restricted domains** → Images/fonts only from trusted sources
- ✅ **Complete backend support** → Railway backend properly whitelisted
- ✅ **Hash-based CSP** → Static HTML secured without server-side processing

## React Native Web Compatibility

**Note:** React Native Web currently requires `'unsafe-inline'` and `'unsafe-eval'` for script execution due to runtime code generation.

**Current status:**
- Backend (API): ✅ Fully secured with nonce-based CSP
- Frontend (Netlify): ⚠️ Scripts still use `'unsafe-inline'` (RN Web requirement)
- Frontend (Netlify): ✅ Styles use hash-based CSP (more secure)

**Future improvement:**
Consider migrating frontend to hash-based CSP for scripts by:
1. Pre-compiling all React Native Web code
2. Extracting inline scripts to external files
3. Calculating hashes for remaining inline scripts

## Testing CSP

### Manual Testing
1. **Open browser DevTools → Console**
2. **Look for CSP violations**
   - Should see: `[CSP] Blocked inline script execution`
   - Should NOT see: `[CSP] Refused to load the script`

### Automated Testing
```bash
# Check CSP headers
curl -I https://protocol-guide.com | grep -i content-security-policy

# Verify nonce in backend responses
curl -v http://localhost:3000/api/health 2>&1 | grep -i content-security-policy
```

### Security Audit
```bash
# Run security scanner
npx @jackfranklin/security-audit

# Check for CSP violations in production
# Use browser extension: CSP Evaluator or Security Headers
```

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## Maintenance

When adding new inline scripts/styles:

1. **Backend routes:** Use `injectCspNonce()` utility
2. **Frontend HTML:** Calculate hash and update `netlify.toml`
3. **External scripts:** Add domain to `scriptSrc` in CSP config
4. **External images:** Add domain to `imgSrc` in CSP config

## Deployment Checklist

- [ ] Backend CSP headers configured with nonces
- [ ] Frontend CSP headers configured with hashes
- [ ] Railway backend URL added to `connectSrc`
- [ ] No CSP violations in browser console
- [ ] All images/fonts loading correctly
- [ ] API calls to Railway backend working
- [ ] Service worker loading correctly
- [ ] PWA installation working

## Support

For CSP-related issues:
1. Check browser console for CSP violation reports
2. Verify the violating resource URL
3. Add to appropriate CSP directive if trusted
4. Use hash or nonce for inline code

## Version History

- **2026-01-23:** Initial implementation of nonce-based and hash-based CSP
  - Removed 'unsafe-inline' from backend
  - Restricted img/font sources
  - Added Railway backend support
  - Created CSP utilities and documentation
