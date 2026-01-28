# Billing & Payments Documentation

> **Last Updated**: 2025-01-29  
> **Payment Provider**: Stripe

Protocol Guide uses Stripe for all payment processing, supporting both individual user subscriptions and department/agency subscriptions.

---

## Table of Contents

- [Overview](#overview)
- [Individual User Subscriptions](#individual-user-subscriptions)
- [Department/Agency Subscriptions](#departmentagency-subscriptions)
- [Feature Gating](#feature-gating)
- [Stripe Integration](#stripe-integration)
- [Webhook Handlers](#webhook-handlers)
- [Customer Portal](#customer-portal)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Overview

Protocol Guide has two subscription models:

1. **Individual Subscriptions** - For EMS professionals (Free → Pro)
2. **Department Subscriptions** - For agencies/departments (Starter → Professional → Enterprise)

All payments are processed through Stripe with:
- Checkout Sessions for new subscriptions
- Customer Portal for subscription management
- Webhooks for event processing
- 7-day free trial (configurable via `STRIPE_TRIAL_PERIOD_DAYS`)

---

## Individual User Subscriptions

### Pricing Tiers

| Tier | Price | Billing |
|------|-------|---------|
| **Free** | $0 | N/A |
| **Pro Monthly** | $9.99/month | Recurring |
| **Pro Annual** | $89/year | Recurring (25% savings) |

### Free Tier Features

| Feature | Limit |
|---------|-------|
| Daily queries | 5 |
| Counties | 1 |
| Bookmarks | 5 |
| Offline access | ❌ |
| Priority support | ❌ |
| AI Model | Haiku only |

### Pro Tier Features

| Feature | Limit |
|---------|-------|
| Daily queries | Unlimited |
| Counties | Unlimited |
| Bookmarks | Unlimited |
| Offline access | ✅ |
| Priority support | ✅ |
| AI Models | Haiku, Sonnet |
| Advanced search | ✅ |
| Sync history | ✅ |

### Enterprise Tier Features

| Feature | Limit |
|---------|-------|
| All Pro features | ✅ |
| Upload protocols | ✅ |
| Manage agency | ✅ |
| AI Models | Haiku, Sonnet, Opus |
| States | Unlimited |
| Agencies | Unlimited |

---

## Department/Agency Subscriptions

### Pricing Tiers

| Tier | Seats | Monthly (per seat) | Annual (per seat) |
|------|-------|-------------------|-------------------|
| **Starter** | 5-20 | $7.99 | $95.88 |
| **Professional** | 20-100 | $5.99 | $71.88 |
| **Enterprise** | 100+ | Custom | Contact Sales |

### Tier Features (UI Display)

From `app/admin/settings/billing.tsx`:

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Team seats | 10 | 50 | Unlimited |
| Protocols | 50 | 200 | Unlimited |
| Storage | 1GB | 10GB | 100GB |
| Support | Email | Priority | Dedicated |
| Custom branding | ❌ | ✅ | ✅ |
| SSO | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |

---

## Feature Gating

### Client-Side (UI Display Only)

**File**: `lib/tier-helpers.ts`

```typescript
// Check if user can access a feature
canAccessFeature(tierInfo, 'canSyncHistory')

// Get upgrade message
getUpgradeMessage('free', 'offline access')
// → "Upgrade to Pro to unlock offline access"

// Check tier hierarchy
meetsRequiredTier('pro', 'free') // true
meetsRequiredTier('free', 'pro') // false
```

⚠️ **Security Warning**: Client-side checks are for UI/UX only. Always validate on the server.

### Server-Side (Security Enforcement)

**File**: `server/_core/tier-validation.ts`

```typescript
// Validate user has required tier (throws TRPCError if not)
await validateTier(ctx, 'pro');

// Validate subscription is active (checks status + expiration)
await validateSubscriptionActive(user);

// Get user's effective features (downgrades if subscription invalid)
const features = await getUserTierFeatures(userId);

// Check daily query limit
await validateQueryLimit(userId);

// Limit search results based on tier
const limit = await validateSearchLimit(userId, requestedLimit);
```

### Subscription Access Control

**File**: `server/subscription-access.ts`

Controls access to states and agencies based on subscription:

```typescript
// Check if user can access state protocols
await canUserAccessState(userId, 'CA');

// Check if user can access agency protocols
await canUserAccessAgency(userId, agencyId);

// Get user's full access permissions
const access = await getUserAccess(userId);
// Returns: { tier, subscribedStates, subscribedAgencies, canUploadProtocols, ... }
```

**Access Limits by Tier:**

| Tier | Max States | Max Agencies | Upload Protocols | Manage Agency |
|------|------------|--------------|------------------|---------------|
| Free | 0 | 1 | ❌ | ❌ |
| Pro | 1 | 10 | ❌ | ❌ |
| Enterprise | ∞ | ∞ | ✅ | ✅ |

---

## Stripe Integration

### Core File

**File**: `server/stripe.ts`

### Individual Checkout

```typescript
import { createCheckoutSession } from './stripe';

const result = await createCheckoutSession({
  userId: 123,
  userEmail: 'user@example.com',
  plan: 'annual', // or 'monthly'
  successUrl: 'https://app.com/success',
  cancelUrl: 'https://app.com/cancel',
});

if ('url' in result) {
  // Redirect to result.url
}
```

### Department Checkout

```typescript
import { createDepartmentCheckoutSession } from './stripe';

const result = await createDepartmentCheckoutSession({
  agencyId: 456,
  agencyEmail: 'billing@agency.com',
  tier: 'professional',
  seatCount: 25,
  interval: 'annual',
  successUrl: 'https://app.com/agency/success',
  cancelUrl: 'https://app.com/agency/pricing',
});
```

### Cancel Subscription

```typescript
import { cancelSubscription } from './stripe';

// Cancels at period end (user keeps access until then)
await cancelSubscription(subscriptionId);
```

### Downgrade to Free

```typescript
import { downgradeToFree } from './stripe';

// Immediately cancels and clears subscription data
await downgradeToFree(userId);
```

---

## Webhook Handlers

**File**: `server/webhooks/stripe.ts`

**Endpoint**: `/api/stripe/webhook`

### Handled Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Upgrade user to Pro, store Stripe customer ID |
| `customer.subscription.created` | Record subscription details |
| `customer.subscription.updated` | Update subscription status, handle upgrades/downgrades |
| `customer.subscription.deleted` | Downgrade to Free tier |
| `invoice.payment_succeeded` | Ensure user is on Pro tier |
| `invoice.payment_failed` | Log failure (Stripe handles retries) |
| `charge.dispute.created` | Optionally downgrade user (configurable) |
| `charge.dispute.closed` | Downgrade if dispute lost |
| `customer.deleted` | Clean up all Stripe data, downgrade to Free |

### Idempotency

Webhook events are tracked in `stripe_webhook_events` table to prevent duplicate processing:

```sql
SELECT * FROM stripe_webhook_events WHERE event_id = 'evt_xxx';
```

### Department Subscriptions

Webhooks check `metadata.subscriptionType` to differentiate:

```typescript
if (session.metadata?.subscriptionType === 'department') {
  // Update agency record
} else {
  // Update user record
}
```

---

## Customer Portal

Users can manage their subscription via Stripe's Customer Portal:

```typescript
import { createCustomerPortalSession } from './stripe';

const result = await createCustomerPortalSession({
  stripeCustomerId: user.stripeCustomerId,
  returnUrl: 'https://app.com/profile',
});

if ('url' in result) {
  // Redirect to result.url
}
```

### Portal Features (Configured in Stripe Dashboard)

- ✅ Update payment method
- ✅ View invoice history
- ✅ Cancel subscription
- ❌ Switch plans (disabled by default)

---

## Database Schema

### Users Table (`manus_users`)

```sql
stripeCustomerId    TEXT      -- Stripe customer ID (cus_xxx)
subscriptionId      TEXT      -- Stripe subscription ID (sub_xxx)
subscriptionStatus  TEXT      -- active, trialing, past_due, canceled, etc.
subscriptionEndDate TIMESTAMP -- When current period ends
tier                TEXT      -- free, pro, enterprise
queryCountToday     INTEGER   -- Daily query counter
lastQueryDate       DATE      -- For resetting daily count
```

### Agencies Table

```sql
stripeCustomerId   VARCHAR(255)       -- Stripe customer ID
subscriptionTier   subscription_tier  -- starter, professional, enterprise
subscriptionStatus VARCHAR(50)        -- active, canceled, etc.
```

### Webhook Events Table (`stripe_webhook_events`)

```sql
id          SERIAL PRIMARY KEY
eventId     VARCHAR(255)  -- Stripe event ID (evt_xxx)
eventType   VARCHAR(100)  -- checkout.session.completed, etc.
payload     JSON          -- Full event payload
processed   BOOLEAN       -- Has been processed
processedAt TIMESTAMP     -- When processed
error       TEXT          -- Error message if failed
createdAt   TIMESTAMP     -- When received
```

---

## Environment Variables

### Required

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_xxx          # or sk_test_xxx for testing
STRIPE_PUBLISHABLE_KEY=pk_live_xxx     # or pk_test_xxx for testing
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Individual Subscription Prices
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx

# Department Subscription Prices
STRIPE_DEPT_STARTER_MONTHLY_PRICE_ID=price_xxx
STRIPE_DEPT_STARTER_ANNUAL_PRICE_ID=price_xxx
STRIPE_DEPT_PROFESSIONAL_MONTHLY_PRICE_ID=price_xxx
STRIPE_DEPT_PROFESSIONAL_ANNUAL_PRICE_ID=price_xxx
```

### Optional

```bash
# Trial period (default: 7 days)
STRIPE_TRIAL_PERIOD_DAYS=7

# Auto-downgrade on dispute (default: false)
STRIPE_DOWNGRADE_ON_DISPUTE=false
```

---

## Testing

### Test Card Numbers

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 3220` | 3D Secure required |

Use any future expiry and any 3-digit CVC.

### E2E Tests

**File**: `e2e/checkout.spec.ts`

Tests cover:
- Upgrade button visibility
- Monthly/annual pricing display
- Checkout flow initiation
- Customer portal access
- Usage limits display
- Checkout return handling

### Manual Testing Checklist

- [ ] Free user sees upgrade prompt
- [ ] Checkout session creates successfully
- [ ] Stripe redirect works
- [ ] Webhook updates user tier
- [ ] Pro features unlock after payment
- [ ] Customer portal loads
- [ ] Subscription cancellation works
- [ ] User downgrades at period end
- [ ] Department checkout works
- [ ] Seat count validation works

---

## Related Documentation

- [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) - Initial Stripe configuration
- [DEPARTMENT_PRICING_IMPLEMENTATION.md](./DEPARTMENT_PRICING_IMPLEMENTATION.md) - Department pricing details
- [PAYMENT_TESTING_GUIDE.md](./PAYMENT_TESTING_GUIDE.md) - Testing procedures
- [WEBHOOK_QUICK_REFERENCE.md](./WEBHOOK_QUICK_REFERENCE.md) - Webhook handling

---

## API Reference

### tRPC Procedures

**Router**: `server/routers/subscription.ts`

| Procedure | Type | Description |
|-----------|------|-------------|
| `subscription.createCheckout` | Mutation | Create individual checkout session |
| `subscription.createDepartmentCheckout` | Mutation | Create department checkout session |
| `subscription.createPortal` | Mutation | Create customer portal session |
| `subscription.status` | Query | Get user's subscription status and features |

### Example Usage

```typescript
// Frontend
const { mutateAsync: createCheckout } = trpc.subscription.createCheckout.useMutation();

const handleUpgrade = async () => {
  const result = await createCheckout({
    plan: 'annual',
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/pricing`,
  });
  
  if (result.success && result.url) {
    window.location.href = result.url;
  }
};
```
