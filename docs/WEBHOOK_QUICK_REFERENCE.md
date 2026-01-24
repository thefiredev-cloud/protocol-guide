# Auth Webhook - Developer Quick Reference

## Endpoint
```
POST https://your-project.supabase.co/functions/v1/auth-events
```

## Required Headers

| Header | Description | Format | Example |
|--------|-------------|--------|---------|
| `Content-Type` | Request content type | `application/json` | `application/json` |
| `x-webhook-signature` | HMAC-SHA256 signature | Hex string (64 chars) | `a1b2c3d4...` |
| `x-webhook-timestamp` | Request timestamp | Unix timestamp (ms) | `1706024400000` |

## Security Requirements

1. **Secret**: Must set `AUTH_WEBHOOK_SECRET` environment variable
2. **Signature**: HMAC-SHA256 of request body
3. **Timestamp**: Must be within 5 minutes of current time

## Quick Start: Send a Webhook

### Node.js
```javascript
const crypto = require('crypto');

async function sendAuthWebhook(event) {
  const payload = JSON.stringify(event);
  const timestamp = Date.now().toString();

  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', process.env.AUTH_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const response = await fetch(
    'https://your-project.supabase.co/functions/v1/auth-events',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp,
      },
      body: payload,
    }
  );

  return response.json();
}

// Usage
await sendAuthWebhook({
  type: 'user.updated',
  user: { id: 'user-123' }
});
```

### Python
```python
import hmac
import hashlib
import json
import time
import requests

def send_auth_webhook(event):
    payload = json.dumps(event)
    timestamp = str(int(time.time() * 1000))

    # Generate HMAC-SHA256 signature
    signature = hmac.new(
        os.environ['AUTH_WEBHOOK_SECRET'].encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    response = requests.post(
        'https://your-project.supabase.co/functions/v1/auth-events',
        headers={
            'Content-Type': 'application/json',
            'x-webhook-signature': signature,
            'x-webhook-timestamp': timestamp,
        },
        data=payload
    )

    return response.json()

# Usage
send_auth_webhook({
    'type': 'user.updated',
    'user': {'id': 'user-123'}
})
```

### cURL (Testing)
```bash
# Set variables
PAYLOAD='{"type":"user.updated","user":{"id":"test-123"}}'
SECRET="your-secret-here"
TIMESTAMP=$(date +%s%3N)

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

# Send request
curl -X POST https://your-project.supabase.co/functions/v1/auth-events \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -H "x-webhook-timestamp: $TIMESTAMP" \
  -d "$PAYLOAD"
```

## Event Types

### user.updated
Triggered when user profile changes (email, password)

```json
{
  "type": "user.updated",
  "user": {
    "id": "user-uuid",
    "email": "new@example.com",
    "email_changed_at": "2024-01-23T10:00:00Z"
  },
  "old_record": {
    "email": "old@example.com"
  }
}
```

**Actions Taken**:
- Revokes all tokens in Redis
- Signs out all sessions
- Logs change event

### user.deleted
Triggered when user account is deleted

```json
{
  "type": "user.deleted",
  "user": {
    "id": "user-uuid"
  }
}
```

**Actions Taken**:
- Permanently revokes tokens
- Signs out all sessions
- Records deletion event

## Response Codes

| Code | Meaning | Response |
|------|---------|----------|
| 200 | Success | `{"success":true,"processed":"user.updated"}` |
| 400 | Bad Request | `{"error":"Missing timestamp"}` |
| 401 | Unauthorized | `{"error":"Invalid signature"}` or `{"error":"Timestamp invalid"}` |
| 500 | Server Error | `{"error":"Webhook not configured"}` or internal error |

## Common Errors

### Error: "Webhook not configured"
**Cause**: `AUTH_WEBHOOK_SECRET` environment variable not set

**Fix**:
```bash
supabase secrets set AUTH_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

### Error: "Invalid signature"
**Causes**:
1. Wrong secret used
2. Payload modified after signing
3. Different encoding (charset) used

**Debug**:
```javascript
// Verify your signature locally
const testSignature = crypto
  .createHmac('sha256', 'your-secret')
  .update('{"type":"user.updated"}')
  .digest('hex');
console.log('Expected signature:', testSignature);
```

### Error: "Timestamp invalid"
**Causes**:
1. System clock skew
2. Timestamp older than 5 minutes
3. Timestamp in wrong format (must be milliseconds)

**Fix**:
```javascript
// Use milliseconds, not seconds
const timestamp = Date.now(); // ✅ Correct
// NOT: Math.floor(Date.now() / 1000) ❌
```

### Error: "Missing timestamp"
**Cause**: `x-webhook-timestamp` header not included

**Fix**: Always include timestamp header in every request

## Testing Checklist

Before deploying webhook integration:

- [ ] Secret is configured in environment
- [ ] Signature generation works correctly
- [ ] Timestamp is in milliseconds
- [ ] All required headers included
- [ ] Payload is valid JSON
- [ ] Test successful webhook (200 response)
- [ ] Test invalid signature (401 response)
- [ ] Test missing timestamp (400 response)
- [ ] Test old timestamp (401 response)

## Debugging

### Enable Detailed Logging
```bash
# View edge function logs
supabase functions logs auth-events --tail

# Look for:
# [AuthEvents] Received event: user.updated for user: xxx
# [AuthEvents] Invalid webhook signature
# [AuthEvents] Webhook timestamp too old/new
```

### Verify Signature Locally
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  console.log('Received:', signature);
  console.log('Expected:', expected);
  console.log('Match:', signature === expected);
}
```

### Check Timestamp
```javascript
const timestamp = Date.now();
const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
const inFuture = Date.now() + (5 * 60 * 1000);

console.log('Current:', timestamp);
console.log('Too old:', fiveMinutesAgo - 1);
console.log('Too new:', inFuture + 1);
```

## Security Best Practices

1. **Never log the webhook secret**
2. **Rotate secret periodically** (every 90 days)
3. **Use HTTPS only** (enforced by Supabase)
4. **Monitor for failed authentications** (potential attacks)
5. **Set up alerts** for repeated failures

## Environment Setup

### Development
```bash
# .env.local
AUTH_WEBHOOK_SECRET=dev-secret-not-for-production
```

### Staging
```bash
# Supabase staging project
supabase secrets set AUTH_WEBHOOK_SECRET=$(openssl rand -hex 32) --project-ref staging-ref
```

### Production
```bash
# Supabase production project
supabase secrets set AUTH_WEBHOOK_SECRET=$(openssl rand -hex 32) --project-ref prod-ref
```

## Rate Limits

No specific rate limits enforced, but:
- Monitor for suspicious patterns
- Alert on >10 failures per minute
- Consider IP-based rate limiting if needed

## Monitoring Queries

### Check Recent Webhook Activity
```sql
-- If logging to database
SELECT
  event_type,
  user_id,
  created_at,
  status
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Alert Conditions
```
- "Invalid signature" count > 5 in 1 minute → Potential attack
- "Timestamp invalid" count > 3 in 1 minute → System clock issue
- "Webhook not configured" → Critical config error
```

## Support

- **Technical Details**: `/docs/SECURITY_WEBHOOK_FIX.md`
- **Deployment**: `/docs/WEBHOOK_DEPLOYMENT_CHECKLIST.md`
- **Source Code**: `/supabase/functions/auth-events/index.ts`

## Quick Commands

```bash
# Generate new secret
openssl rand -hex 32

# Set secret
supabase secrets set AUTH_WEBHOOK_SECRET=<secret>

# Deploy function
supabase functions deploy auth-events

# View logs
supabase functions logs auth-events --tail

# Test webhook (with valid signature)
./scripts/test-webhook.sh
```

---

**Last Updated**: 2026-01-23
**Version**: 2.0 (Post-security-fix)
