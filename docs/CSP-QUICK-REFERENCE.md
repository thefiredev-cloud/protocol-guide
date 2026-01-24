# CSP Quick Reference Guide

## 🚨 Critical Security Fixes Applied

### What Was Fixed
- ❌ **BEFORE:** `'unsafe-inline'` allowed any injected script/style to execute → XSS vulnerability
- ✅ **AFTER:** Nonce-based CSP allows only whitelisted inline code → XSS protection

---

## 📋 Quick Checks

### Verify CSP Headers
```bash
# Backend API
curl -I https://protocol-guide-production.up.railway.app/api/health | grep -i content-security

# Frontend
curl -I https://protocol-guide.com | grep -i content-security
```

### Check Browser Console
1. Open DevTools → Console
2. Look for `[CSP]` messages
3. ✅ No violations = working correctly
4. ❌ Violations = check source URL and add to CSP if trusted

---

## 🔧 Common Tasks

### Adding Inline Script in Server Route

**❌ DON'T** (vulnerable):
```typescript
app.get('/page', (req, res) => {
  res.send('<script>alert("XSS")</script>');
});
```

**✅ DO** (secure):
```typescript
import { injectCspNonce } from './_core/csp-utils';

app.get('/page', (req, res) => {
  const html = '<script>console.log("Safe")</script>';
  const secure = injectCspNonce(html, res.locals.cspNonce);
  res.send(secure);
});
```

### Adding Inline Style to Frontend HTML

**❌ DON'T** (won't work with CSP):
```html
<style>body { margin: 0; }</style>
```

**✅ DO** (calculate hash):
```bash
# 1. Calculate SHA-256 hash
echo -n "body { margin: 0; }" | openssl dgst -sha256 -binary | openssl base64

# 2. Add to netlify.toml
style-src 'self' 'sha256-HASH_FROM_STEP_1';

# 3. Add style to HTML (unchanged)
<style>body { margin: 0; }</style>
```

### Loading External Image

**❌ DON'T** (blocked by CSP):
```html
<img src="https://random-site.com/image.jpg" />
```

**✅ DO** (add domain to CSP):
```typescript
// server/_core/index.ts
imgSrc: [
  "'self'",
  "data:",
  "blob:",
  "https://*.supabase.co",
  "https://trusted-cdn.com",  // Add trusted domain
]
```

### Loading External Font

**❌ DON'T** (blocked by CSP):
```css
@font-face {
  src: url('https://random-site.com/font.woff2');
}
```

**✅ DO** (add domain to CSP):
```typescript
// server/_core/index.ts
fontSrc: [
  "'self'",
  "data:",
  "https://fonts.gstatic.com",
  "https://fonts.googleapis.com",  // Add trusted domain
]
```

---

## 🔍 Troubleshooting

### CSP Violation Error
```
Refused to load the script 'https://example.com/script.js' because it violates the Content Security Policy
```

**Solution:**
1. Verify the URL is from a trusted source
2. Add domain to `scriptSrc` in CSP config:
   ```typescript
   scriptSrc: ["'self'", "https://example.com"]
   ```

### Inline Script Blocked
```
Refused to execute inline script because it violates CSP directive "script-src 'self' 'nonce-...'"
```

**Solution:**
- **Backend:** Use `injectCspNonce()` utility
- **Frontend:** Calculate hash and add to `netlify.toml`

### Image Not Loading
```
Refused to load the image 'https://cdn.example.com/img.jpg' because it violates CSP directive "img-src 'self' data: blob: https://*.supabase.co"
```

**Solution:**
Add domain to `imgSrc`:
```typescript
imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co", "https://cdn.example.com"]
```

---

## 📊 CSP Directives Reference

| Directive | Purpose | Current Value |
|-----------|---------|---------------|
| `default-src` | Fallback for all resources | `'self'` |
| `script-src` | JavaScript sources | `'self'` + nonce |
| `style-src` | CSS sources | `'self'` + nonce/hash |
| `img-src` | Image sources | `'self'` data: blob: Supabase |
| `font-src` | Font sources | `'self'` data: Google Fonts |
| `connect-src` | API/fetch sources | `'self'` Supabase Railway |
| `frame-src` | iframe sources | `'none'` (no iframes) |
| `object-src` | plugin sources | `'none'` (no plugins) |

---

## 🎯 Best Practices

### ✅ DO
- Use nonce-based CSP for server-rendered HTML
- Use hash-based CSP for static HTML
- Restrict domains to specific trusted sources
- Extract inline scripts to external files when possible
- Test CSP changes in development first
- Monitor CSP violations in production

### ❌ DON'T
- Use `'unsafe-inline'` (defeats XSS protection)
- Use `'unsafe-eval'` in production (only dev for HMR)
- Use wildcard sources like `https:` or `*`
- Add untrusted domains to CSP
- Skip CSP testing before deployment
- Ignore CSP violation warnings

---

## 🚀 Deployment Checklist

Before deploying CSP changes:

- [ ] Test locally with CSP enabled
- [ ] Check browser console for violations
- [ ] Verify all images load correctly
- [ ] Verify all fonts load correctly
- [ ] Verify all API calls work
- [ ] Test in production-like environment
- [ ] Review CSP headers with curl
- [ ] Have rollback plan ready

---

## 📚 Additional Resources

- **Full Documentation:** `/docs/SECURITY-CSP.md`
- **Implementation Summary:** `/docs/CSP-SECURITY-FIXES-SUMMARY.md`
- **Utilities:** `/server/_core/csp-utils.ts`

---

## 🆘 Emergency Hotfix

If CSP breaks production:

### Option 1: Rollback (Recommended)
```bash
git revert <commit-hash>
git push origin main
```

### Option 2: Temporarily Relax CSP (NOT RECOMMENDED)
```typescript
// server/_core/index.ts
scriptSrc: ["'self'", "'unsafe-inline'", /* keep nonce too */]
```

### Option 3: Add Specific Hash
```bash
# Calculate hash of problematic code
echo -n "<code-content>" | openssl dgst -sha256 -binary | openssl base64

# Add to CSP
scriptSrc: ["'self'", "'sha256-HASH'"]
```

---

**Last Updated:** 2026-01-23
**Maintained By:** Backend Performance Team
