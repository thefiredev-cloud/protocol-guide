# Stripe Schema Fixes - Deployment Checklist

**Date:** 2026-01-23
**Related:** STRIPE_SCHEMA_FIXES.md

---

## Pre-Deployment Checklist

### 1. Code Review
- [x] Database schema aligned with migrations
- [x] Subscription tier enums standardized
- [x] Department webhook handlers implemented
- [x] Price ID environment variables renamed
- [x] TypeScript compilation passes
- [x] No Stripe-related type errors

### 2. Environment Variables

#### Update Production `.env` file:

**Remove (deprecated):**
```bash
STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID
STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID
STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID
STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID
```

**Add (new):**
```bash
# Department Starter Tier (5-20 seats)
STRIPE_DEPT_STARTER_MONTHLY_PRICE_ID=price_xxx
STRIPE_DEPT_STARTER_ANNUAL_PRICE_ID=price_xxx

# Department Professional Tier (20-100 seats)
STRIPE_DEPT_PROFESSIONAL_MONTHLY_PRICE_ID=price_xxx
STRIPE_DEPT_PROFESSIONAL_ANNUAL_PRICE_ID=price_xxx

# Optional: Trial period override (default: 7 days)
STRIPE_TRIAL_PERIOD_DAYS=7

# Optional: Downgrade policy for disputes (default: false)
STRIPE_DOWNGRADE_ON_DISPUTE=false
```

### 3. Stripe Dashboard Setup

#### Create Products

**Product 1: Department - Starter (Monthly)**
```
Name: Protocol Guide - Department Starter (Monthly)
Description: For departments with 5-20 users
Pricing: $7.99/month per seat
Billing: Recurring monthly
Type: Licensed (quantity-based)
Min quantity: 5
Max quantity: 20
Trial: 7 days (optional)
```

**Product 2: Department - Starter (Annual)**
```
Name: Protocol Guide - Department Starter (Annual)
Description: For departments with 5-20 users (save with annual billing)
Pricing: $95.88/year per seat
Billing: Recurring yearly
Type: Licensed (quantity-based)
Min quantity: 5
Max quantity: 20
Trial: 7 days (optional)
```

**Product 3: Department - Professional (Monthly)**
```
Name: Protocol Guide - Department Professional (Monthly)
Description: For departments with 20-100 users
Pricing: $5.99/month per seat
Billing: Recurring monthly
Type: Licensed (quantity-based)
Min quantity: 20
Max quantity: 100
Trial: 7 days (optional)
```

**Product 4: Department - Professional (Annual)**
```
Name: Protocol Guide - Department Professional (Annual)
Description: For departments with 20-100 users (save with annual billing)
Pricing: $71.88/year per seat
Billing: Recurring yearly
Type: Licensed (quantity-based)
Min quantity: 20
Max quantity: 100
Trial: 7 days (optional)
```

#### Copy Price IDs

After creating products:
1. Go to Products → [Product Name] → Pricing
2. Copy each price ID (starts with `price_`)
3. Update environment variables

### 4. Webhook Configuration

Verify webhook endpoints listen for these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `charge.dispute.created` (optional)
- ✅ `charge.dispute.closed` (optional)
- ✅ `customer.deleted` (optional)

Webhook URL: `https://your-domain.com/api/webhooks/stripe`

---

## Deployment Steps

### Step 1: Deploy Code Changes
```bash
# Commit changes
git add .
git commit -m "fix: Stripe schema mismatches and department subscription support"

# Deploy to production
git push origin main
# OR deploy via your CI/CD pipeline
```

### Step 2: Update Environment Variables

**Netlify:**
```bash
netlify env:set STRIPE_DEPT_STARTER_MONTHLY_PRICE_ID "price_xxx"
netlify env:set STRIPE_DEPT_STARTER_ANNUAL_PRICE_ID "price_xxx"
netlify env:set STRIPE_DEPT_PROFESSIONAL_MONTHLY_PRICE_ID "price_xxx"
netlify env:set STRIPE_DEPT_PROFESSIONAL_ANNUAL_PRICE_ID "price_xxx"
```

**Vercel:**
```bash
vercel env add STRIPE_DEPT_STARTER_MONTHLY_PRICE_ID production
vercel env add STRIPE_DEPT_STARTER_ANNUAL_PRICE_ID production
vercel env add STRIPE_DEPT_PROFESSIONAL_MONTHLY_PRICE_ID production
vercel env add STRIPE_DEPT_PROFESSIONAL_ANNUAL_PRICE_ID production
```

**Docker/.env:**
```bash
# Edit .env file directly
nano .env
# Add variables, save, restart container
docker-compose restart
```

### Step 3: Verify Deployment

**Health Check:**
```bash
# Check server status
curl https://your-domain.com/health

# Check Stripe configuration
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-domain.com/api/stripe/config
```

**Test Department Checkout:**
```bash
# Create test checkout session
curl -X POST https://your-domain.com/api/subscription/createDepartmentCheckout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "agencyId": 1,
    "tier": "starter",
    "seatCount": 10,
    "interval": "monthly",
    "successUrl": "https://your-domain.com/success",
    "cancelUrl": "https://your-domain.com/cancel"
  }'
```

### Step 4: Monitor Webhooks

**Watch webhook logs:**
```bash
# Stripe CLI (development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Production logs
tail -f /var/log/stripe-webhooks.log
# OR check your logging service (e.g., CloudWatch, Datadog)
```

**Expected log patterns:**
```
[Stripe Webhook] Received event: checkout.session.completed (ID: evt_xxx)
[Stripe Webhook] Department checkout completed for agency 123
[Stripe Webhook] Updated agency 123 with customer cus_xxx, tier: starter
```

---

## Post-Deployment Verification

### Test Cases

#### Test 1: Individual User Subscription (Regression)
- [ ] User can create checkout session for pro monthly
- [ ] User can create checkout session for pro annual
- [ ] Webhook updates user to pro tier
- [ ] User can access customer portal
- [ ] Subscription cancellation works

#### Test 2: Department Starter Subscription
- [ ] Admin can create checkout for 5-20 seats
- [ ] Checkout session includes correct metadata
- [ ] Webhook updates agency with customer ID
- [ ] Agency subscription tier set to "starter"
- [ ] Agency subscription status set to "active"

#### Test 3: Department Professional Subscription
- [ ] Admin can create checkout for 20-100 seats
- [ ] Checkout session includes correct metadata
- [ ] Webhook updates agency correctly
- [ ] Agency subscription tier set to "professional"

#### Test 4: Subscription Updates
- [ ] Seat count changes reflected
- [ ] Subscription status changes (active → past_due → canceled)
- [ ] Agency tier updated correctly

#### Test 5: Subscription Cancellation
- [ ] Cancel subscription via customer portal
- [ ] Webhook downgrades agency to starter tier
- [ ] Subscription status marked as "canceled"

### Database Verification

**Check agency records:**
```sql
SELECT
  id,
  name,
  stripeCustomerId,
  subscriptionTier,
  subscriptionStatus
FROM agencies
WHERE stripeCustomerId IS NOT NULL;
```

**Check webhook events:**
```sql
SELECT
  eventId,
  eventType,
  processedAt,
  error
FROM stripe_webhook_events
WHERE createdAt > NOW() - INTERVAL '1 hour'
ORDER BY createdAt DESC
LIMIT 20;
```

---

## Rollback Plan

If critical issues are discovered:

### Quick Rollback (Code Only)
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Full Rollback (Code + Environment)
```bash
# Revert code
git revert HEAD
git push origin main

# Restore old environment variables (if needed)
netlify env:set STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID "price_xxx"
netlify env:set STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID "price_xxx"
netlify env:set STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID "price_xxx"
netlify env:set STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID "price_xxx"
```

**Note:** Rollback is low-risk because:
- No database migrations required
- Individual subscriptions unaffected
- Environment variables backward compatible

---

## Monitoring

### Key Metrics to Watch

**Webhook Success Rate:**
- Target: >99% success rate
- Alert if: <95% success rate for 10+ minutes

**Department Subscription Creation:**
- Track: Number of department checkouts per day
- Alert if: Unexpected spike or drop

**Subscription Tier Distribution:**
- Track: Starter vs Professional vs Enterprise
- Review: Weekly to inform pricing strategy

**Error Patterns:**
```bash
# Common errors to watch for
grep "No agencyId in department checkout" /var/log/stripe-webhooks.log
grep "No agency found for customer" /var/log/stripe-webhooks.log
grep "Invalid subscription tier" /var/log/stripe-webhooks.log
```

### Alerting Rules

**Critical:**
- Webhook signature verification failures
- Database connection failures during webhook processing
- Missing price IDs for configured tiers

**Warning:**
- Webhook retry attempts >3
- Duplicate event processing
- Subscription downgrades

---

## Support Playbook

### Issue: Department checkout fails with "Price ID not configured"

**Diagnosis:**
```bash
# Check environment variables
echo $STRIPE_DEPT_STARTER_MONTHLY_PRICE_ID
echo $STRIPE_DEPT_PROFESSIONAL_MONTHLY_PRICE_ID
```

**Resolution:**
1. Verify Stripe products created
2. Copy correct price IDs
3. Update environment variables
4. Restart application

### Issue: Webhook handler logs "No agency found for customer"

**Diagnosis:**
```sql
-- Check if customer ID in database
SELECT * FROM agencies WHERE stripeCustomerId = 'cus_xxx';
```

**Resolution:**
1. Check checkout.session.completed webhook processed
2. Verify agency ID in session metadata
3. Re-process checkout if needed

### Issue: Agency tier not updating

**Diagnosis:**
```bash
# Check webhook logs
grep "agency_id" /var/log/stripe-webhooks.log | tail -20
```

**Resolution:**
1. Verify subscription has metadata.subscriptionType = "department"
2. Check webhook processed successfully
3. Manually update via admin panel if needed

---

## Success Criteria

Deployment is considered successful when:
- [x] All code changes deployed
- [ ] Environment variables updated
- [ ] Stripe products configured
- [ ] Test checkout completes successfully
- [ ] Webhooks process without errors
- [ ] Database records updated correctly
- [ ] No increase in error rates
- [ ] Individual subscriptions still working

---

## Timeline

**Estimated Duration:** 2-3 hours

- Code deployment: 15 minutes
- Environment variable update: 15 minutes
- Stripe product creation: 30 minutes
- Testing: 60 minutes
- Monitoring: 30 minutes
- Buffer: 30 minutes

---

## Contact

**Deployment Lead:** Tanner (CEO)
**Technical Review:** Claude (AI Assistant)
**Rollback Authority:** Tanner

---

## Sign-off

- [ ] Code changes reviewed
- [ ] Environment variables prepared
- [ ] Stripe products ready
- [ ] Test plan reviewed
- [ ] Rollback plan understood
- [ ] Monitoring configured

**Deployment Approved By:** ________________
**Date:** ________________
