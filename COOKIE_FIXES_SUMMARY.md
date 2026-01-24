# Cookie Fixes - Quick Reference

**Date:** 2026-01-23
**Status:** ✅ Fixed

---

## What Was Fixed

### Critical Issues
1. ✅ **Missing cookie parsing** - Cookies from requests weren't being parsed
2. ✅ **CSRF tokens not generated** - Double-submit cookie pattern was broken
3. ✅ **Subdomain sharing inflexible** - No production configuration option

### Files Changed
```
NEW:      server/_core/cookie-middleware.ts       (Cookie parsing + CSRF generation)
MODIFIED: server/_core/cookies.ts                 (Subdomain configuration)
MODIFIED: server/_core/index.ts                   (Middleware integration)
MODIFIED: .env.example                            (Documentation)
```

---

## How It Works Now

### Development (Auto-enabled)
```
Port 3000: https://3000-xxx.manuspre.computer
Port 8081: https://8081-xxx.manuspre.computer

Cookie: app_session_id=abc123; domain=.manuspre.computer
✅ Cookie shared across both ports automatically
```

### Production (Secure by default)
```
Subdomain 1: https://api.example.com
Subdomain 2: https://app.example.com

Cookie: app_session_id=abc123; domain=undefined
❌ Cookie NOT shared between subdomains (secure by default)

To enable sharing: Set ENABLE_SUBDOMAIN_COOKIES=true
```

---

## Cookie Attributes

All cookies now use these secure settings:

```typescript
{
  domain: ".manuspre.computer" (dev) or undefined (prod),
  httpOnly: true,           // Prevents XSS
  secure: true,             // HTTPS only
  sameSite: "strict",       // Prevents CSRF
  path: "/",                // Site-wide
  maxAge: 86400000          // 24 hours (CSRF only)
}
```

---

## Environment Variable

Add to `.env` if you need cross-subdomain auth in production:

```bash
# WARNING: Only enable if you control ALL subdomains
ENABLE_SUBDOMAIN_COOKIES=true
```

**When to enable:**
- ✅ You have api.example.com + app.example.com
- ✅ You control both subdomains
- ✅ You need shared authentication

**When NOT to enable:**
- ❌ You have user-generated subdomains
- ❌ Third-party subdomains exist
- ❌ Shared hosting environment

---

## Testing

### Test cookie parsing
```bash
curl -H "Cookie: test=123" http://localhost:3000/api/health
# Logs should show: req.cookies = { test: "123" }
```

### Test CSRF token generation
```bash
curl -c cookies.txt http://localhost:3000/api/health
cat cookies.txt
# Should see: csrf_token=<64-char-hex>
```

### Test subdomain sharing (dev)
```bash
# Set cookie on port 3000
curl -c cookies.txt https://3000-xxx.manuspre.computer/api/health

# Use cookie on port 8081
curl -b cookies.txt https://8081-xxx.manuspre.computer/api/trpc/auth.me
# Should work! Cookie sent automatically
```

---

## For More Details

See `SUBDOMAIN_COOKIE_FIXES.md` for:
- Detailed problem analysis
- Security considerations
- Complete implementation guide
- Migration instructions
- Monitoring recommendations

---

## No Action Required

✅ **This is a drop-in fix** - no client-side changes needed
✅ **Backward compatible** - existing functionality preserved
✅ **Production ready** - secure by default

Just deploy and test!
