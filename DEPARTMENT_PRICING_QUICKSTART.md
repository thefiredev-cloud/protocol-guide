# Department Pricing - Quick Start Guide

## What Was Done

✅ Updated pricing configuration (`/server/lib/pricing.ts`)
✅ Updated Stripe integration (`/server/stripe.ts`)
✅ Updated environment variable examples (`/.env.example`)
✅ Created setup documentation and scripts

## New Pricing Structure

| Tier | Users | Price | Example (10 users) |
|------|-------|-------|-------------------|
| Individual | 1 | $9.99/user/month | $9.99/month |
| Small Dept | 5-20 | $7.99/user/month | $79.90/month |
| Large Dept | 20-100 | $5.99/user/month | N/A (min 20) |
| Enterprise | 100+ | Custom | Contact sales |

## What You Need to Do

### Step 1: Create Stripe Products

**Option A: Use the automated script**
```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Run the setup script
./scripts/create-stripe-products.sh
```

**Option B: Manual creation via Stripe Dashboard**
1. Go to https://dashboard.stripe.com/products
2. Create "Small Department" product with:
   - Monthly price: $7.99
   - Annual price: $95.88
3. Create "Large Department" product with:
   - Monthly price: $5.99
   - Annual price: $71.88

### Step 2: Update .env File

Add the 4 new price IDs from Step 1:

```bash
# Small Department (5-20 users)
STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID="price_xxxxx"
STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID="price_xxxxx"

# Large Department (20+ users)
STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID="price_xxxxx"
STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID="price_xxxxx"
```

### Step 3: Restart Your Server

```bash
pnpm dev
```

### Step 4: Test

Call the `subscription.createDepartmentCheckout` endpoint with:
```json
{
  "agencyId": 1,
  "tier": "small",
  "seatCount": 10,
  "interval": "monthly"
}
```

## Code Changes Summary

### `/server/lib/pricing.ts`
- Changed tiers: `starter`/`professional` → `small`/`large`
- Updated pricing: Small = $7.99/user, Large = $5.99/user
- All pricing functions updated to use new structure

### `/server/stripe.ts`
- Added new price ID constants
- Updated checkout to use per-seat pricing for both tiers
- Updated tier validation logic

## Files Created

📄 `/scripts/create-stripe-products.sh` - Automated Stripe setup script
📄 `/scripts/department-pricing-plan.md` - Detailed pricing plan
📄 `/DEPARTMENT_PRICING_IMPLEMENTATION.md` - Full implementation guide
📄 `/DEPARTMENT_PRICING_QUICKSTART.md` - This file

## Need Help?

See the full implementation guide: `/DEPARTMENT_PRICING_IMPLEMENTATION.md`
