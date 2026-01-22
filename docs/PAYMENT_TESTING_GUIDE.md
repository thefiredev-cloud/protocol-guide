# Protocol Guide - Payment & Subscription Testing Guide

This guide walks you through testing the complete payment flow from free user to Pro subscriber.

---

## Prerequisites

Before testing, ensure these are configured in your Stripe Dashboard:

| Item | Status | Value |
|------|--------|-------|
| Secret Key | ✅ Configured | `sk_test_...` |
| Publishable Key | ✅ Configured | `pk_test_...` |
| Webhook Secret | ✅ Configured | `whsec_egk5Wvy7...` |
| Monthly Price ID | ✅ Configured | `price_1SoG8qDjdtNeDMqX7XPFdCoE` |
| Annual Price ID | ✅ Configured | `price_1SoFuuDjdtNeDMqXTW64ePxn` |

---

## Test Flow: Free User to Pro Subscriber

### Step 1: Sign In as a New User

1. Open the app
2. Tap **"Sign In to Continue"**
3. Complete OAuth authentication
4. You'll be logged in as a **Free tier** user with 5 queries/day

### Step 2: Use Your Free Queries

1. Select a county (e.g., "Los Angeles County, California")
2. Submit protocol queries:
   - Query 1: "Cardiac arrest protocol"
   - Query 2: "Stroke assessment"
   - Query 3: "Pediatric dosing"
   - Query 4: "Anaphylaxis treatment"
   - Query 5: "Opioid overdose"

3. After the 5th query, you'll see your remaining count at 0

### Step 3: Trigger the Upgrade Prompt

1. Try to submit a 6th query
2. The **Upgrade Screen** will appear with the message:
   > "You've used your 5 free lookups today. Upgrade to Pro for unlimited queries—$39/year, less than a shift meal."

### Step 4: Test Stripe Checkout

1. On the Upgrade Screen, select a plan:
   - **Monthly**: $4.99/month
   - **Annual**: $39/year (35% savings)

2. Tap **"Get Pro for $X"**

3. You'll be redirected to Stripe Checkout

4. Use these **test card numbers**:

| Scenario | Card Number | Expiry | CVC |
|----------|-------------|--------|-----|
| Successful payment | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| Card declined | `4000 0000 0000 0002` | Any future date | Any 3 digits |
| Requires authentication | `4000 0025 0000 3155` | Any future date | Any 3 digits |

5. Complete the checkout with test card `4242 4242 4242 4242`

### Step 5: Verify Pro Subscription

After successful payment:

1. You'll be redirected back to the app
2. Go to the **Profile** tab
3. Verify you see:
   - **Plan**: Pro (Monthly or Annual)
   - **Status**: Active
   - **Renewal Date**: Correct date based on plan
   - **"Manage Subscription"** button

4. Return to **Home** tab
5. Submit queries - you should now have **unlimited queries**

---

## Test Flow: Manage Subscription

### Access Customer Portal

1. Go to **Profile** tab
2. Tap **"Manage Subscription"**
3. You'll be redirected to Stripe Customer Portal
4. Here you can:
   - Update payment method
   - View invoices
   - Cancel subscription

### Test Cancellation

1. In Customer Portal, click **"Cancel plan"**
2. Confirm cancellation
3. Return to app
4. Profile should show:
   - **Status**: Canceled (or "Canceling at period end")
   - Subscription remains active until period end

---

## Webhook Events to Monitor

In your Stripe Dashboard → Developers → Webhooks, you should see these events:

| Event | When It Fires |
|-------|---------------|
| `checkout.session.completed` | User completes payment |
| `customer.subscription.created` | New subscription created |
| `customer.subscription.updated` | Subscription changed |
| `customer.subscription.deleted` | Subscription canceled |
| `invoice.payment_succeeded` | Recurring payment successful |
| `invoice.payment_failed` | Payment failed |

**Webhook Endpoint**: `https://3000-iwmxn3zfxrnvmix9g2lqe-87854817.us1.manus.computer/api/stripe/webhook`

---

## Troubleshooting

### "Stripe is not configured" Error

- Verify `STRIPE_SECRET_KEY` is set in environment
- Restart the server after adding keys

### Checkout Doesn't Open

- Check browser console for errors
- Verify price IDs are correct in Stripe Dashboard
- Ensure prices are set to "Recurring" not "One-time"

### Webhook Not Receiving Events

1. Go to Stripe Dashboard → Webhooks
2. Check the endpoint status
3. View recent webhook attempts and errors
4. Verify the webhook secret matches `STRIPE_WEBHOOK_SECRET`

### User Not Upgraded After Payment

1. Check server logs for webhook errors
2. Verify `checkout.session.completed` event was received
3. Check database for user's `tier` and `stripeCustomerId` fields

---

## Production Checklist

Before going live:

- [ ] Switch from test keys to live keys in Stripe Dashboard
- [ ] Update webhook endpoint to production URL
- [ ] Create live products with same price structure
- [ ] Update price IDs in environment variables
- [ ] Test with a real card (small amount, then refund)
- [ ] Enable Stripe Radar for fraud protection
- [ ] Set up email notifications for failed payments

---

## Support

If you encounter issues during testing:

1. Check server logs: `pnpm dev` output
2. Check Stripe Dashboard → Developers → Logs
3. Verify all environment variables are set correctly
