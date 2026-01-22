# Stripe Integration Fixes - Protocol Guide

## Summary

This document outlines the Stripe integration fixes implemented to improve reliability, security, and error handling.

## Fixes Implemented

### 1. API Version Update
**File:** `/server/stripe.ts:4-9`

**Issue:** Using experimental API version `2025-12-15.clover`

**Fix:** Updated to stable API version `2024-12-18.acacia`

```typescript
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;
```

**Why:** Stable API versions are production-ready and won't change unexpectedly. Experimental versions may have breaking changes.

---

### 2. Webhook Idempotency
**Files:**
- `/drizzle/schema.ts` - Added `stripeWebhookEvents` table
- `/server/webhooks/stripe.ts` - Added idempotency checks
- `/drizzle/0008_harsh_swordsman.sql` - Migration file

**Issue:** Duplicate webhook events could cause duplicate charges or state corruption

**Fix:** Created tracking table and added idempotency logic

#### Database Schema
```sql
CREATE TABLE `stripe_webhook_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `eventId` varchar(255) NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `processedAt` timestamp NOT NULL DEFAULT (now()),
  `eventData` json,
  CONSTRAINT `stripe_webhook_events_id` PRIMARY KEY(`id`),
  CONSTRAINT `stripe_webhook_events_eventId_unique` UNIQUE(`eventId`)
);
```

#### Implementation
The webhook handler now:
1. Checks if event ID already exists in database
2. If exists, returns 200 (success) but skips processing
3. If new, inserts event ID BEFORE processing (prevents race conditions)
4. Processes the event
5. Returns 500 on error so Stripe retries

```typescript
// Check if event already processed
const existingEvent = await dbInstance.query.stripeWebhookEvents.findFirst({
  where: eq(stripeWebhookEvents.eventId, eventId),
});

if (existingEvent) {
  console.log(`[Stripe Webhook] Event ${eventId} already processed, skipping`);
  return res.status(200).json({ received: true, skipped: true });
}

// Mark as processed BEFORE handling
await dbInstance.insert(stripeWebhookEvents).values({
  eventId,
  eventType: event.type,
  eventData: event.data.object,
});
```

**Why:** Stripe may send the same webhook multiple times. Without idempotency:
- User could be charged twice
- Subscription state could be corrupted
- Database inconsistencies could occur

---

### 3. Enhanced Customer Portal Error Handling
**File:** `/server/stripe.ts:86-132`

**Issue:** Portal failures may be swallowed with generic errors

**Fix:** Added comprehensive error handling and logging

#### Improvements
1. **Validation before API call**
   - Check if Stripe is configured
   - Check if customer ID is provided

2. **Detailed logging**
   - Log customer ID on request
   - Log session ID on success
   - Log full error details on failure

3. **User-friendly error messages**
   - "Customer not found in Stripe" for invalid customers
   - Specific messages for different error types

4. **URL validation**
   - Verify session.url exists before returning

```typescript
try {
  console.log(`[Stripe] Creating portal session for customer: ${stripeCustomerId}`);

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  if (!session.url) {
    console.error("[Stripe] Portal session created but no URL returned");
    return { error: "Failed to create portal session URL" };
  }

  console.log(`[Stripe] Portal session created successfully: ${session.id}`);
  return { url: session.url };
} catch (error) {
  const errorDetails = error instanceof Error ? {
    message: error.message,
    name: error.name,
    stack: error.stack,
  } : error;

  console.error("[Stripe] Portal session error:", errorDetails);

  if (errorMessage.includes("No such customer")) {
    return { error: "Customer not found in Stripe. Please contact support." };
  }

  return { error: errorMessage };
}
```

**Why:** Better error messages help:
- Developers debug issues faster
- Users understand what went wrong
- Support teams resolve issues quicker

---

## Deployment Steps

### 1. Run Database Migration

```bash
cd "/Users/tanner-osterkamp/Protocol Guide Manus"

# Generate migration (already done)
npx drizzle-kit generate

# Apply migration to database
npx drizzle-kit push
# OR
npx drizzle-kit migrate
```

### 2. Verify Stripe Configuration

Check that all required Stripe environment variables are set:

```bash
# Check .env file
cat .env | grep STRIPE
```

Required variables:
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_... or sk_test_...)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_live_... or pk_test_...)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)
- `STRIPE_PRO_MONTHLY_PRICE_ID` - Monthly subscription price ID (price_...)
- `STRIPE_PRO_ANNUAL_PRICE_ID` - Annual subscription price ID (price_...)

### 3. Verify Stripe Dashboard Configuration

#### A. Check Price IDs
1. Go to https://dashboard.stripe.com/products
2. Find your "Pro" product
3. Verify price IDs match your `.env` file
4. Ensure prices are active and in correct mode (test/live)

#### B. Configure Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### C. Configure Customer Portal
1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Enable customer portal
3. Configure allowed features:
   - Cancel subscription
   - Update payment method
   - View invoice history
4. Set business information and branding

### 4. Test the Integration

#### A. Test Checkout Flow
```bash
# Create test checkout session
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "monthly"
  }'
```

#### B. Test Webhook Idempotency
1. In Stripe Dashboard, go to Webhooks
2. Find a recent webhook event
3. Click "Resend" button multiple times
4. Check logs to verify only processed once

```bash
# Check webhook events table
mysql -u root -p -e "SELECT * FROM stripe_webhook_events ORDER BY processedAt DESC LIMIT 10;"
```

#### C. Test Customer Portal
```bash
# Create portal session
curl -X POST http://localhost:3000/api/customer-portal \
  -H "Content-Type: application/json" \
  -d '{
    "stripeCustomerId": "cus_..."
  }'
```

### 5. Monitor Logs

Watch for Stripe-related logs:

```bash
# Production logs
netlify logs --site=your-site-name --filter="[Stripe]"

# Local logs
# Look for console.log messages with [Stripe] prefix
```

---

## Verification Checklist

- [ ] Database migration applied successfully
- [ ] `stripe_webhook_events` table exists
- [ ] All 5 Stripe env variables are set
- [ ] Stripe API version is `2024-12-18.acacia`
- [ ] Price IDs match Stripe Dashboard
- [ ] Webhook endpoint configured in Stripe
- [ ] Webhook secret matches `.env`
- [ ] Customer portal is configured
- [ ] Test checkout flow works
- [ ] Test webhooks are idempotent
- [ ] Test customer portal works
- [ ] Error logs are detailed and helpful

---

## Troubleshooting

### Webhook Signature Verification Fails
**Error:** `Webhook verification failed: No signatures found matching the expected signature`

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Ensure request body is raw (not parsed JSON)
3. Check webhook endpoint URL is correct in Stripe

### Customer Portal "No such customer" Error
**Error:** `Customer not found in Stripe. Please contact support.`

**Solutions:**
1. Verify user has `stripeCustomerId` in database
2. Check customer exists in Stripe Dashboard
3. Ensure using correct API key (test vs live)
4. Check customer wasn't deleted in Stripe

### Duplicate Webhook Processing
**Symptoms:** Same event processed multiple times, duplicate charges

**Solutions:**
1. Verify migration was applied: `SHOW TABLES LIKE 'stripe_webhook_events';`
2. Check table has unique constraint on `eventId`
3. Review webhook handler logs for "already processed" messages
4. Clean up old events: `DELETE FROM stripe_webhook_events WHERE processedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);`

### Price IDs Not Found
**Error:** `Price ID for monthly plan is not configured`

**Solutions:**
1. Set `STRIPE_PRO_MONTHLY_PRICE_ID` in `.env`
2. Get price ID from Stripe Dashboard > Products
3. Ensure price is active and recurring
4. Restart server after updating `.env`

---

## Maintenance

### Clean Up Old Webhook Events

Webhook events are stored indefinitely for debugging. Clean up old events periodically:

```sql
-- Delete events older than 90 days
DELETE FROM stripe_webhook_events
WHERE processedAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

Or create a cron job:

```bash
# Add to crontab
0 0 * * 0 mysql -u root -p -e "DELETE FROM stripe_webhook_events WHERE processedAt < DATE_SUB(NOW(), INTERVAL 90 DAY);"
```

### Monitor Webhook Processing

Check webhook processing stats:

```sql
-- Events processed in last 24 hours
SELECT
  eventType,
  COUNT(*) as count,
  MIN(processedAt) as first_event,
  MAX(processedAt) as last_event
FROM stripe_webhook_events
WHERE processedAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY eventType
ORDER BY count DESC;
```

---

## Security Notes

1. **Never log full card details** - The implementation only logs metadata
2. **Always verify webhook signatures** - Already implemented via `constructWebhookEvent`
3. **Use HTTPS in production** - Required for Stripe webhooks
4. **Rotate API keys regularly** - Update in Stripe Dashboard and `.env`
5. **Use environment-specific keys** - Test keys for development, live keys for production
6. **Store webhook events for 90 days** - For compliance and debugging

---

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe Customer Portal Guide](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Idempotency](https://stripe.com/docs/api/idempotent_requests)
- [Stripe API Versioning](https://stripe.com/docs/api/versioning)
