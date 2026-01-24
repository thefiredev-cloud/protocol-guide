# Webhook Security Fix - Deployment Checklist

## Pre-Deployment

### 1. Review Changes
- [x] Mandatory secret validation implemented
- [x] HMAC-SHA256 signature verification added
- [x] Constant-time comparison prevents timing attacks
- [x] Timestamp validation prevents replay attacks
- [x] TypeScript/ESLint configured to ignore Deno files

### 2. Generate Webhook Secret
```bash
# Generate a cryptographically secure random secret
openssl rand -hex 32

# Save this secret securely - you'll need it for:
# 1. Supabase environment variables
# 2. Webhook sender configuration
```

## Deployment Steps

### Step 1: Set Environment Variable
```bash
# Option A: Via Supabase Dashboard
# 1. Go to Settings > Edge Functions > Secrets
# 2. Add new secret:
#    Key: AUTH_WEBHOOK_SECRET
#    Value: <your-generated-secret>

# Option B: Via Supabase CLI
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus
supabase secrets set AUTH_WEBHOOK_SECRET=<your-generated-secret>
```

### Step 2: Deploy Edge Function
```bash
cd /Users/tanner-osterkamp/Protocol\ Guide\ Manus

# Deploy the updated function
supabase functions deploy auth-events

# Verify deployment
supabase functions list
```

### Step 3: Update Webhook Sender Configuration

If using Supabase Auth Webhooks:
```
# Supabase Dashboard > Auth > Webhooks
# The webhook sender needs to be updated to send:
# 1. x-webhook-signature header (HMAC-SHA256)
# 2. x-webhook-timestamp header (Unix timestamp in ms)
```

If using custom webhook sender, update code to:
1. Include timestamp in request
2. Generate HMAC-SHA256 signature of request body
3. Include both headers in request

See `/Users/tanner-osterkamp/Protocol Guide Manus/docs/SECURITY_WEBHOOK_FIX.md` for signature generation examples.

### Step 4: Test the Webhook

#### Test 1: Valid Webhook
```bash
PAYLOAD='{"type":"user.updated","user":{"id":"test-123"}}'
SECRET="your-secret-here"
TIMESTAMP=$(date +%s%3N)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

curl -X POST https://your-project.supabase.co/functions/v1/auth-events \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -H "x-webhook-timestamp: $TIMESTAMP" \
  -d "$PAYLOAD"

# Expected: {"success":true,"processed":"user.updated"}
```

#### Test 2: Missing Signature (should fail)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/auth-events \
  -H "Content-Type: application/json" \
  -d '{"type":"user.updated","user":{"id":"test"}}'

# Expected: {"error":"Invalid signature"} with 401 status
```

#### Test 3: Invalid Signature (should fail)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/auth-events \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: invalid" \
  -H "x-webhook-timestamp: $(date +%s%3N)" \
  -d '{"type":"user.updated","user":{"id":"test"}}'

# Expected: {"error":"Invalid signature"} with 401 status
```

#### Test 4: Old Timestamp (should fail)
```bash
# Timestamp from 10 minutes ago
OLD_TIMESTAMP=$(($(date +%s%3N) - 600000))

curl -X POST https://your-project.supabase.co/functions/v1/auth-events \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: whatever" \
  -H "x-webhook-timestamp: $OLD_TIMESTAMP" \
  -d '{"type":"user.updated","user":{"id":"test"}}'

# Expected: {"error":"Timestamp invalid"} with 401 status
```

## Post-Deployment

### 1. Monitor Logs
```bash
# Check for security-related log messages
supabase functions logs auth-events --tail

# Watch for:
# - "AUTH_WEBHOOK_SECRET not configured" (should NOT appear)
# - "Invalid webhook signature" (potential attack)
# - "Webhook timestamp too old/new" (potential replay attack)
```

### 2. Set Up Alerts

Configure monitoring for:
- Repeated signature validation failures (>5 in 1 minute)
- Missing timestamp attempts
- Replay attack attempts

### 3. Document Secret Location

Store the webhook secret securely:
- [ ] Saved in password manager
- [ ] Documented in runbook
- [ ] Backed up in secure vault
- [ ] Shared with authorized team members only

### 4. Update Documentation

Update any internal docs that reference:
- Webhook configuration
- Auth event handling
- Security protocols

## Rollback Plan

If issues occur:

### Option 1: Quick Fix
```bash
# Temporarily allow requests without signature
# (NOT RECOMMENDED - only for emergencies)
# Edit index.ts to make validation non-blocking
```

### Option 2: Full Rollback
```bash
# Revert to previous version
git revert <commit-hash>
supabase functions deploy auth-events
```

## Verification Checklist

After deployment, verify:
- [ ] Edge function deployed successfully
- [ ] Environment variable set correctly
- [ ] Valid webhooks accepted (200 response)
- [ ] Invalid signatures rejected (401 response)
- [ ] Missing timestamps rejected (400 response)
- [ ] Old timestamps rejected (401 response)
- [ ] Logs show successful signature verification
- [ ] No errors in edge function logs
- [ ] Webhook sender updated and working
- [ ] Auth events processing correctly

## Security Validation

Run security checks:
- [ ] Attempt webhook without signature (should fail)
- [ ] Attempt webhook with wrong signature (should fail)
- [ ] Attempt replay attack with old timestamp (should fail)
- [ ] Verify constant-time comparison (no timing differences)
- [ ] Check logs for security warnings

## Files Modified

- `/Users/tanner-osterkamp/Protocol Guide Manus/supabase/functions/auth-events/index.ts` - Main webhook handler
- `/Users/tanner-osterkamp/Protocol Guide Manus/tsconfig.json` - Excluded Deno files
- `/Users/tanner-osterkamp/Protocol Guide Manus/.eslintignore` - Excluded Deno files
- `/Users/tanner-osterkamp/Protocol Guide Manus/docs/SECURITY_WEBHOOK_FIX.md` - Security documentation
- `/Users/tanner-osterkamp/Protocol Guide Manus/docs/WEBHOOK_DEPLOYMENT_CHECKLIST.md` - This file

## Support

If issues arise:
1. Check Supabase Edge Function logs
2. Verify environment variable is set
3. Review webhook sender configuration
4. Check signature generation logic
5. Refer to `/Users/tanner-osterkamp/Protocol Guide Manus/docs/SECURITY_WEBHOOK_FIX.md`

## Date
Created: 2026-01-23
Last Updated: 2026-01-23
