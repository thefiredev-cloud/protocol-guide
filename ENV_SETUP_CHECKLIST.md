# Environment Variables Checklist

Use this checklist to ensure all required secrets are properly configured before deployment.

## Quick Start

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env and fill in all values (never commit this file!)
# 3. Follow the checklist below
```

---

## Required Secrets (Must Configure)

### AI Services

- [ ] **ANTHROPIC_API_KEY**
  - Get from: https://console.anthropic.com/
  - Must start with: `sk-ant-`
  - Generate: Create account → API Keys → Create Key

- [ ] **VOYAGE_API_KEY**
  - Get from: https://www.voyageai.com/
  - Must start with: `pa-`
  - Generate: Sign up → Dashboard → API Keys

### Database (Supabase)

- [ ] **SUPABASE_URL**
  - Get from: Supabase Dashboard → Settings → API
  - Format: `https://xxxxx.supabase.co`

- [ ] **SUPABASE_ANON_KEY**
  - Get from: Supabase Dashboard → Settings → API
  - Must start with: `eyJ`
  - Safe for client-side use

- [ ] **SUPABASE_SERVICE_ROLE_KEY**
  - Get from: Supabase Dashboard → Settings → API → service_role
  - Must start with: `eyJ`
  - ⚠️ KEEP SECRET - Server-side only

- [ ] **DATABASE_URL**
  - Get from: Supabase Dashboard → Settings → Database
  - Format: `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres`
  - Use connection pooler URL for production

### Stripe Payments

- [ ] **STRIPE_SECRET_KEY**
  - Get from: https://dashboard.stripe.com/apikeys
  - Development: `sk_test_...`
  - Production: `sk_live_...`

- [ ] **STRIPE_PUBLISHABLE_KEY**
  - Get from: https://dashboard.stripe.com/apikeys
  - Development: `pk_test_...`
  - Production: `pk_live_...`

- [ ] **STRIPE_WEBHOOK_SECRET**
  - Get from: Stripe Dashboard → Webhooks → Add endpoint
  - Must start with: `whsec_`
  - Create webhook for: `https://yourdomain.com/api/webhooks/stripe`

- [ ] **STRIPE_PRO_MONTHLY_PRICE_ID**
  - Get from: Stripe Dashboard → Products → Your Product → Pricing
  - Must start with: `price_`

- [ ] **STRIPE_PRO_ANNUAL_PRICE_ID**
  - Get from: Stripe Dashboard → Products → Your Product → Pricing
  - Must start with: `price_`

### Authentication

- [ ] **JWT_SECRET**
  - Generate with: `openssl rand -base64 32`
  - Minimum 32 characters
  - Different for dev/staging/prod

- [ ] **NEXT_AUTH_SECRET**
  - Generate with: `openssl rand -base64 32`
  - Minimum 32 characters
  - Different for dev/staging/prod

- [ ] **NEXT_AUTH_URL**
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

### Beta Access

- [ ] **EXPO_PUBLIC_BETA_ACCESS_CODE**
  - Generate with: `openssl rand -hex 8 | tr '[:lower:]' '[:upper:]'`
  - Example: `A3F7B2C9D1E4F6A8`
  - ⚠️ NEVER use "PROTOCOL2026" or predictable codes
  - Remove this gate before public launch

---

## Optional Secrets (Recommended for Production)

### Redis (Rate Limiting)

- [ ] **REDIS_URL**
  - Get from: https://console.upstash.com/
  - Format: `https://xxxxx.upstash.io`
  - Falls back to in-memory if not set

- [ ] **REDIS_TOKEN**
  - Get from: Upstash → Database → REST API → Token
  - Required if REDIS_URL is set

---

## Optional Secrets (Legacy/Advanced)

### Server Configuration

- [ ] **NODE_ENV**
  - Values: `development`, `production`, `test`
  - Default: `development`

- [ ] **PORT**
  - Default: `3000`
  - Range: 1-65535

- [ ] **LOG_LEVEL**
  - Values: `debug`, `info`, `warn`, `error`
  - Default: `info`

### Department Pricing (if using tiered pricing)

- [ ] **STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID** (optional)
- [ ] **STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID** (optional)
- [ ] **STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID** (optional)
- [ ] **STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID** (optional)

### Legacy Manus OAuth (migration only)

- [ ] **OAUTH_SERVER_URL** (optional)
- [ ] **OWNER_OPEN_ID** (optional)
- [ ] **BUILT_IN_FORGE_API_URL** (deprecated)
- [ ] **BUILT_IN_FORGE_API_KEY** (deprecated)

---

## Deployment Checklist

### Before First Deploy

- [ ] All required secrets configured in `.env`
- [ ] `.env` file is NOT committed to git
- [ ] Secrets added to deployment platform (Netlify)
- [ ] Different secrets for staging vs production
- [ ] Test keys used in development/staging
- [ ] Live keys used in production only

### Security Verification

- [ ] Run: `git status --ignored | grep .env`
  - Should show `.env` in ignored files
- [ ] Run: `git log -p -- .env`
  - Should show "No commits yet" or only .env.example
- [ ] Verify: No secrets in source code
  - Search for: `sk_live`, `sk_test`, hardcoded tokens
- [ ] Review: `docs/SECURITY.md` for best practices

### Netlify Environment Variables

1. Log into Netlify Dashboard
2. Select your site
3. Go to: Site settings → Environment variables
4. Add each required variable:
   - For production: Select "Production" scope
   - For preview: Select "Deploy previews" scope
5. Use different values for production vs preview

### Test After Deploy

- [ ] App loads without errors
- [ ] Can create account / sign in
- [ ] Can search protocols (tests AI services)
- [ ] Can upgrade to Pro (tests Stripe)
- [ ] Webhook endpoint receiving events (check Stripe dashboard)
- [ ] No secrets visible in browser console
- [ ] No secrets in HTML source

---

## Common Errors

### "Environment validation failed"
- **Cause:** Missing or invalid environment variable
- **Fix:** Check terminal output for specific variable name
- **See:** `docs/ENVIRONMENT.md` for requirements

### "Stripe is not configured"
- **Cause:** `STRIPE_SECRET_KEY` not set or invalid
- **Fix:** Add valid key starting with `sk_test_` or `sk_live_`

### "Invalid access code" (always fails)
- **Cause:** `EXPO_PUBLIC_BETA_ACCESS_CODE` not set
- **Fix:** Generate and set beta access code

### "Database connection failed"
- **Cause:** Invalid `DATABASE_URL` or wrong credentials
- **Fix:** Copy exact URL from Supabase dashboard

---

## Emergency: If Secrets Are Committed to Git

**DO NOT PANIC, BUT ACT QUICKLY:**

1. **Immediately rotate ALL secrets** in the committed file
2. Generate new secrets following `docs/SECURITY.md`
3. Update in deployment platform (Netlify)
4. Deploy with new secrets
5. Verify old secrets are invalidated
6. Remove from git history:
   ```bash
   # Install git-filter-repo
   brew install git-filter-repo  # macOS

   # Remove .env from history
   git-filter-repo --path .env --invert-paths

   # Force push (coordinate with team!)
   git push origin --force --all
   ```
7. Document incident in security log
8. Review access controls

**See:** `docs/SECURITY.md` for detailed emergency procedures

---

## Resources

- **Full Security Guide:** `docs/SECURITY.md`
- **Environment Docs:** `docs/ENVIRONMENT.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Security Fix Report:** `SECURITY_FIX_REPORT.md`

---

**Last Updated:** 2026-01-23
