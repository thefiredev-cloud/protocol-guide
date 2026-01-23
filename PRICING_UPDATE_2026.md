# Pricing Update: $4.99 → $9.99 Implementation Guide

**Date:** January 22, 2026
**Status:** Code Updated - Awaiting Stripe Configuration

---

## Overview

Updated Protocol Guide pricing from $4.99/mo to $9.99/mo based on market analysis.

### New Pricing

| Plan | Old Price | New Price | Savings |
|------|-----------|-----------|---------|
| **Monthly** | $4.99/month | **$9.99/month** | - |
| **Annual** | $39/year | **$89/year** | 25% off monthly |

**Annual breakdown:** $89/year = $7.42/month (was $3.25/month)

---

## Code Changes Completed ✅

### 1. Core Pricing Configuration
- **File:** `server/db.ts`
  - Monthly: `499` → `999` cents
  - Annual: `3900` → `8900` cents
  - Discount: `35%` → `25%`

### 2. UI Components Updated
- **`components/upgrade-screen.tsx`**
  - Monthly price display: $4.99 → $9.99
  - Annual price display: $39 → $89
  - Savings badge: 35% → 25%
  - Monthly equivalent: $3.25 → $7.42
  - Marketing copy: "less than a shift meal" → "less than two shift meals"

- **`components/county-limit-modal.tsx`**
  - Pricing hint updated to new prices
  - Savings percentage updated to 25%

- **`app/(tabs)/profile.tsx`**
  - Upgrade card pricing updated

- **`app/terms.tsx`**
  - Terms of Service Section 4 updated

---

## Stripe Configuration Required 🔴

### Step 1: Create New Stripe Products

```bash
# Create Monthly Product
stripe products create \
  --name="Protocol Guide Pro Monthly (v2)" \
  --description="Monthly subscription - Unlimited protocol access for EMS professionals" \
  --metadata[version]="v2" \
  --metadata[effective_date]="2026-01-22"

# Save the product ID (prod_XXXXX)
```

```bash
# Create Annual Product
stripe products create \
  --name="Protocol Guide Pro Annual (v2)" \
  --description="Annual subscription - Unlimited protocol access (25% savings)" \
  --metadata[version]="v2" \
  --metadata[effective_date]="2026-01-22"

# Save the product ID (prod_YYYYY)
```

### Step 2: Create New Price Objects

```bash
# Monthly Price - $9.99/month
stripe prices create \
  --product="prod_XXXXX" \
  --unit-amount=999 \
  --currency=usd \
  --recurring[interval]=month \
  --recurring[interval_count]=1 \
  --metadata[tier]="pro" \
  --metadata[version]="v2"

# Save the price ID: price_AAAAAA
```

```bash
# Annual Price - $89/year (25% discount)
stripe prices create \
  --product="prod_YYYYY" \
  --unit-amount=8900 \
  --currency=usd \
  --recurring[interval]=year \
  --recurring[interval_count]=1 \
  --metadata[tier]="pro" \
  --metadata[version]="v2" \
  --metadata[savings]="25%"

# Save the price ID: price_BBBBBB
```

### Step 3: Update Environment Variables

Update these in **both** Netlify dashboard and local `.env`:

```bash
# Production Stripe Price IDs (v2 - New Pricing)
STRIPE_PRO_MONTHLY_PRICE_ID=price_AAAAAA
STRIPE_PRO_ANNUAL_PRICE_ID=price_BBBBBB
```

**Netlify Configuration:**
1. Go to: Site settings → Environment variables
2. Update `STRIPE_PRO_MONTHLY_PRICE_ID`
3. Update `STRIPE_PRO_ANNUAL_PRICE_ID`
4. Redeploy site for changes to take effect

---

## Grandfathering Existing Users 🎯

**IMPORTANT:** Existing subscriptions will NOT be affected automatically.

### Stripe Behavior:
- Active subscriptions continue at their current price ($4.99 or $39)
- Users keep their existing price until they cancel
- New signups after env var update will use new prices ($9.99 or $89)

### Manual Steps (Optional):
To explicitly grandfather existing users:

1. **Add metadata to existing subscriptions:**
```bash
# Example: Tag all existing Pro subs with grandfathered pricing
stripe subscriptions update sub_XXXXX \
  --metadata[pricing_version]="v1" \
  --metadata[grandfathered]="true" \
  --metadata[original_price]="$4.99/mo or $39/yr"
```

2. **Create customer segment in Stripe:**
   - Dashboard → Customers → Create segment
   - Filter: `subscription.metadata[pricing_version] = "v1"`
   - Name: "Grandfathered Pro Users (v1 Pricing)"

---

## Testing Plan ✅

### Before Production Deployment:

1. **Test Mode Verification**
   ```bash
   # Use test API keys
   stripe prices list --limit 5

   # Create test products/prices with test keys
   # Follow same steps as above but with test mode enabled
   ```

2. **Checkout Flow Test**
   - Navigate to upgrade screen
   - Verify prices show as $9.99 and $89
   - Complete test checkout with test card: `4242 4242 4242 4242`
   - Confirm subscription created at correct price

3. **Existing User Test**
   - Test that existing subs are NOT affected
   - Check Stripe dashboard shows old subscriptions unchanged

### After Production Deployment:

1. Create new test account and verify new pricing
2. Check existing Pro users still see old prices in billing portal
3. Monitor first 24 hours of signups for correct pricing

---

## Marketing Communication 📢

### For New Users:
- All marketing materials already updated in codebase
- App Store listing will need manual update (separate task)
- Website pricing page needs update if separate from app

### For Existing Users:
**No communication needed** - their pricing is unchanged. Only notify if:
- User manually cancels and re-subscribes (they'll get new price)
- User asks about pricing changes

**Suggested response template:**
> "Your subscription is grandfathered at $4.99/month (or $39/year). This rate will continue as long as you maintain your subscription. New users are charged $9.99/month ($89/year), but as an existing customer, you keep your original pricing."

---

## Rollback Plan 🔄

If issues arise, revert by:

1. **Immediate (Code):**
   ```bash
   git revert <commit-hash>
   npm run deploy
   ```

2. **Immediate (Env Vars):**
   - Restore old price IDs in Netlify
   - Redeploy

3. **Keep in mind:**
   - Any subscriptions created with new prices will stay at new prices
   - May need to manually adjust in Stripe dashboard

---

## File Summary

**Files Modified:**
- ✅ `server/db.ts` - Core pricing constants
- ✅ `server/routers.ts` - Uses PRICING from db.ts (no change needed)
- ✅ `server/stripe.ts` - Uses env vars (no change needed)
- ✅ `components/upgrade-screen.tsx` - UI pricing display
- ✅ `components/county-limit-modal.tsx` - Modal pricing
- ✅ `app/(tabs)/profile.tsx` - Profile upgrade card
- ✅ `app/terms.tsx` - Terms of Service

**Files Using Env Vars (No Code Change):**
- `server/stripe.ts` - Reads `STRIPE_PRO_MONTHLY_PRICE_ID` and `STRIPE_PRO_ANNUAL_PRICE_ID`

**No Changes Needed:**
- Webhook handlers (price-agnostic)
- Database schema
- User tier logic

---

## Next Steps

1. ✅ Code changes completed
2. 🔴 Run Stripe CLI commands above to create products/prices
3. 🔴 Update environment variables in Netlify
4. 🔴 Deploy to production
5. 🔴 Test new signup flow
6. 🔴 Monitor analytics for conversion impact

---

## Questions?

- **When do existing users get new pricing?** Never, unless they cancel and re-subscribe
- **What if someone cancels today?** They'll get new pricing if they re-subscribe later
- **Can we offer v1 pricing as a promo?** Yes, via Stripe coupon codes
- **What about annual renewals?** They renew at their existing price automatically

---

**Last Updated:** 2026-01-22
**Updated By:** Stripe Payment Integration Expert
