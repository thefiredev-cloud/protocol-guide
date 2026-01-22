# Stripe Setup Guide for Protocol Guide

This guide walks through setting up Stripe for Protocol Guide's subscription system.

---

## Overview

Protocol Guide uses Stripe for:
- **Pro Monthly**: $4.99/month for unlimited queries
- **Pro Annual**: $39/year for unlimited queries (35% savings)
- **Enterprise Subscription**: Custom pricing (contact sales)

---

## Step 1: Create Stripe Products

### 1.1 Log into Stripe Dashboard
Go to https://dashboard.stripe.com and sign in to your account.

### 1.2 Create the Pro Monthly Product

1. Navigate to **Products** in the left sidebar (or go to https://dashboard.stripe.com/products)
2. Click **+ Add product**
3. Fill in the details:
   - **Name**: `Protocol Guide Pro Monthly`
   - **Description**: `Unlimited EMS protocol queries, all counties, offline access, priority support`
   - **Image**: Upload your Protocol Guide logo (optional)
4. Under **Pricing**, click **Add pricing**:
   - **Pricing model**: Standard pricing
   - **Price**: `$4.99`
   - **Billing period**: `Monthly`
   - **Currency**: USD
5. Click **Save product**
6. Copy the **Price ID** → Save as `STRIPE_PRO_MONTHLY_PRICE_ID`

### 1.3 Create the Pro Annual Product

1. Click **+ Add product** again
2. Fill in the details:
   - **Name**: `Protocol Guide Pro Annual`
   - **Description**: `Unlimited EMS protocol queries, all counties, offline access, priority support - Best value! Save 35%`
   - **Image**: Upload your Protocol Guide logo (optional)
4. Under **Pricing**, click **Add pricing**:
   - **Pricing model**: Standard pricing
   - **Price**: `$39.00`
   - **Billing period**: `Yearly`
   - **Currency**: USD
5. Click **Save product**
6. Copy the **Price ID** → Save as `STRIPE_PRO_ANNUAL_PRICE_ID`

**Example Price IDs**: `price_1ABC123DEF456GHI789`

---

## Step 2: Set Up the Webhook

Webhooks allow Stripe to notify Protocol Guide when subscription events occur (payment success, cancellation, etc.).

### 2.1 Get Your Webhook Endpoint URL

Your webhook endpoint will be:
```
https://3000-iwmxn3zfxrnvmix9g2lqe-87854817.us1.manus.computer/api/stripe/webhook
```

**For Production** (after deployment), it will be:
```
https://your-production-domain.com/api/stripe/webhook
```

### 2.2 Create the Webhook in Stripe

1. Go to **Developers** → **Webhooks** (or https://dashboard.stripe.com/webhooks)
2. Click **+ Add endpoint**
3. Fill in:
   - **Endpoint URL**: Your webhook URL from above
   - **Description**: `Protocol Guide subscription events`
4. Under **Select events to listen to**, click **+ Select events**
5. Add these specific events:
   
   **Checkout Events:**
   - `checkout.session.completed`
   
   **Subscription Events:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   
   **Invoice Events:**
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

6. Click **Add endpoint**

### 2.3 Copy the Webhook Signing Secret

After creating the webhook:
1. Click on the webhook endpoint you just created
2. Under **Signing secret**, click **Reveal**
3. Copy the secret (starts with `whsec_`)
4. Save this - you'll need it: `STRIPE_WEBHOOK_SECRET`

**Example**: `whsec_ABC123DEF456GHI789...`

---

## Step 3: Get Your API Keys

### 3.1 Navigate to API Keys

Go to **Developers** → **API keys** (or https://dashboard.stripe.com/apikeys)

### 3.2 Copy Your Keys

You'll see two keys:

1. **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - This is safe to use in client-side code
   - Copy and save as: `STRIPE_PUBLISHABLE_KEY`

2. **Secret key** (starts with `sk_test_` or `sk_live_`)
   - Click **Reveal test key** to see it
   - **NEVER expose this in client-side code**
   - Copy and save as: `STRIPE_SECRET_KEY`

---

## Step 4: Configure Customer Portal

The Customer Portal lets users manage their subscription (cancel, update payment method).

### 4.1 Set Up the Portal

1. Go to **Settings** → **Billing** → **Customer portal** (or https://dashboard.stripe.com/settings/billing/portal)
2. Configure these settings:

**Business information:**
- Business name: `Protocol Guide`
- Privacy policy: `https://protocol-guide.com/privacy`
- Terms of service: `https://protocol-guide.com/terms`

**Features:**
- ✅ Allow customers to update payment methods
- ✅ Allow customers to view invoice history
- ✅ Allow customers to cancel subscriptions
- ❌ Allow customers to switch plans (optional - enable if you add more tiers)

**Cancellation:**
- Cancellation mode: `At end of billing period` (recommended)
- Enable cancellation reason collection: `Yes`

3. Click **Save**

---

## Step 5: Test Mode vs Live Mode

### For Development/Testing:
- Use keys starting with `pk_test_` and `sk_test_`
- Use test card numbers (see below)
- Webhooks work in test mode

### Test Card Numbers:
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 3220` | 3D Secure required |

Use any future expiry date and any 3-digit CVC.

### For Production:
- Toggle to **Live mode** in Stripe Dashboard (top-right switch)
- Create new webhook endpoint with production URL
- Use keys starting with `pk_live_` and `sk_live_`

---

## Summary: Keys You Need

After completing this setup, you should have:

| Key | Example | Where to Find |
|-----|---------|---------------|
| `STRIPE_SECRET_KEY` | `sk_test_51ABC...` | Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_51ABC...` | Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_ABC123...` | Developers → Webhooks → Your endpoint |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | `price_1ABC...` | Products → Protocol Guide Pro Monthly → Pricing |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | `price_1ABC...` | Products → Protocol Guide Pro Annual → Pricing |

---

## Webhook Events Reference

Here's what each webhook event does in Protocol Guide:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Upgrade user to Pro tier |
| `customer.subscription.created` | Record subscription start |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Downgrade user to Free tier |
| `invoice.payment_succeeded` | Extend subscription period |
| `invoice.payment_failed` | Send payment failure notification |

---

## Troubleshooting

### Webhook not receiving events?
1. Check the endpoint URL is correct
2. Ensure the server is running and accessible
3. Check Stripe Dashboard → Webhooks → Your endpoint → Recent events

### Payment failing in test mode?
1. Use test card `4242 4242 4242 4242`
2. Use any future expiry date
3. Use any 3-digit CVC

### "Invalid API key" error?
1. Ensure you're using the correct mode (test vs live)
2. Check the key hasn't been rotated/revoked
3. Verify the key is correctly copied (no extra spaces)

---

## Next Steps

Once you have all five keys, provide them to set up the integration:
1. `STRIPE_SECRET_KEY`
2. `STRIPE_PUBLISHABLE_KEY`
3. `STRIPE_WEBHOOK_SECRET`
4. `STRIPE_PRO_MONTHLY_PRICE_ID`
5. `STRIPE_PRO_ANNUAL_PRICE_ID`
