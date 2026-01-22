# Stripe Quick Reference

## Apply Migration

```bash
cd "/Users/tanner-osterkamp/Protocol Guide Manus"
npx drizzle-kit push
```

## Verify Migration

```sql
-- Check table exists
SHOW TABLES LIKE 'stripe_webhook_events';

-- View table structure
DESCRIBE stripe_webhook_events;

-- Check for processed events
SELECT eventType, COUNT(*) as count
FROM stripe_webhook_events
GROUP BY eventType;
```

## Test Webhook Idempotency

```bash
# In Stripe Dashboard:
# 1. Go to Developers > Webhooks
# 2. Find any event
# 3. Click "Resend" multiple times
# 4. Check logs - should see "already processed"

# Verify in database
SELECT * FROM stripe_webhook_events
WHERE eventType = 'checkout.session.completed'
ORDER BY processedAt DESC
LIMIT 10;
```

## Check Stripe Configuration

```bash
# View configured variables (masked)
grep "^STRIPE_" .env | sed 's/=.*/=***/'

# Required variables:
# - STRIPE_SECRET_KEY
# - STRIPE_PUBLISHABLE_KEY
# - STRIPE_WEBHOOK_SECRET
# - STRIPE_PRO_MONTHLY_PRICE_ID
# - STRIPE_PRO_ANNUAL_PRICE_ID
```

## Monitor Webhooks

```bash
# Watch webhook processing
tail -f logs/production.log | grep "[Stripe Webhook]"

# Check for errors
tail -f logs/production.log | grep "[Stripe].*error"
```

## Database Queries

```sql
-- Events in last 24 hours
SELECT eventType, COUNT(*) as count
FROM stripe_webhook_events
WHERE processedAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY eventType;

-- Recent events
SELECT id, eventId, eventType, processedAt
FROM stripe_webhook_events
ORDER BY processedAt DESC
LIMIT 20;

-- Clean up old events (90+ days)
DELETE FROM stripe_webhook_events
WHERE processedAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

## Stripe Dashboard URLs

- **Products:** https://dashboard.stripe.com/products
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Customer Portal:** https://dashboard.stripe.com/settings/billing/portal
- **API Keys:** https://dashboard.stripe.com/apikeys
- **Logs:** https://dashboard.stripe.com/logs

## Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Webhook fails signature check | Verify STRIPE_WEBHOOK_SECRET matches dashboard |
| Duplicate processing | Check migration applied, verify unique constraint |
| Portal "customer not found" | Verify stripeCustomerId in users table |
| Missing price ID | Set STRIPE_PRO_*_PRICE_ID in .env |

## Files

- **Implementation Guide:** `STRIPE_FIXES.md`
- **Summary:** `STRIPE_IMPLEMENTATION_SUMMARY.md`
- **Migration:** `drizzle/0008_harsh_swordsman.sql`
- **Apply Script:** `scripts/apply-stripe-migration.sh`
