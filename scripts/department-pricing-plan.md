# Department Pricing Setup Plan

## Overview
This document outlines the Stripe products and prices that will be created for Protocol Guide's department/team pricing tiers.

## Pricing Tiers

### Individual (Already Exists)
- **Individual Pro Monthly**: $9.99/month
  - Price ID: `price_1SoFuuDjdtNeDMqXTW64ePxn`
- **Individual Pro Annual**: $89/year
  - Price ID: `price_1SoG8qDjdtNeDMqX7XPFdCoE`

### Small Department (5-20 users) - NEW
**Per-seat pricing at $7.99/user/month**

- **Product**: Protocol Guide - Small Department
  - Description: Department subscription for 5-20 users with per-seat pricing
  - Metadata:
    - tier: small_department
    - min_seats: 5
    - max_seats: 20

- **Small Dept Monthly Price**: $7.99/seat/month
  - Unit amount: 799 cents
  - Billing interval: monthly
  - Usage type: licensed (per-seat)
  - Nickname: "Small Department Monthly (Per Seat)"

- **Small Dept Annual Price**: $95.88/seat/year
  - Unit amount: 9588 cents ($7.99 × 12)
  - Billing interval: yearly
  - Usage type: licensed (per-seat)
  - Nickname: "Small Department Annual (Per Seat)"

**Example pricing:**
- 5 users: $39.95/month or $479.40/year
- 10 users: $79.90/month or $958.80/year
- 20 users: $159.80/month or $1,917.60/year

### Large Department (20+ users) - NEW
**Volume pricing at $5.99/user/month**

- **Product**: Protocol Guide - Large Department
  - Description: Department subscription for 20+ users with volume pricing
  - Metadata:
    - tier: large_department
    - min_seats: 20

- **Large Dept Monthly Price**: $5.99/seat/month
  - Unit amount: 599 cents
  - Billing interval: monthly
  - Usage type: licensed (per-seat)
  - Nickname: "Large Department Monthly (Per Seat)"

- **Large Dept Annual Price**: $71.88/seat/year
  - Unit amount: 7188 cents ($5.99 × 12)
  - Billing interval: yearly
  - Usage type: licensed (per-seat)
  - Nickname: "Large Department Annual (Per Seat)"

**Example pricing:**
- 20 users: $119.80/month or $1,437.60/year
- 50 users: $299.50/month or $3,594/year
- 100 users: $599/month or $7,188/year

## Environment Variables to Add

After creating these products and prices in Stripe, add the following to your `.env` file:

```bash
# Small Department (5-20 users) - $7.99/user/month
STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID="price_xxx"
STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID="price_xxx"

# Large Department (20+ users) - $5.99/user/month
STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID="price_xxx"
STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID="price_xxx"
```

## Code Updates Needed

### 1. Update `/server/stripe.ts`
Add the new price IDs to the `PRICE_IDS` object:

```typescript
const PRICE_IDS = {
  // Individual/Pro subscriptions
  proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
  proAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",

  // Small Department (5-20 users)
  departmentSmallMonthly: process.env.STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID || "",
  departmentSmallAnnual: process.env.STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID || "",

  // Large Department (20+ users)
  departmentLargeMonthly: process.env.STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID || "",
  departmentLargeAnnual: process.env.STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID || "",
};
```

### 2. Update `/server/lib/pricing.ts`
Modify the pricing tiers to match new structure:

```typescript
export const DEPARTMENT_PRICING = {
  small: {
    // 5-20 users - per-seat pricing
    perSeat: {
      monthly: 7.99,
      annual: 95.88, // $7.99 × 12
    },
    minSeats: 5,
    maxSeats: 20,
  },
  large: {
    // 20+ users - volume pricing
    perSeat: {
      monthly: 5.99,
      annual: 71.88, // $5.99 × 12
    },
    minSeats: 20,
  },
  enterprise: {
    // 100+ users - custom pricing
    contact: true,
    minSeats: 100,
  },
} as const;

export type SubscriptionTier = "small" | "large" | "enterprise";
```

### 3. Update checkout logic in `/server/stripe.ts`
Modify `createDepartmentCheckoutSession` to use the new tier structure:

```typescript
// Get the appropriate price ID
let priceId: string;
if (tier === "small") {
  priceId = interval === "monthly"
    ? PRICE_IDS.departmentSmallMonthly
    : PRICE_IDS.departmentSmallAnnual;
} else if (tier === "large") {
  priceId = interval === "monthly"
    ? PRICE_IDS.departmentLargeMonthly
    : PRICE_IDS.departmentLargeAnnual;
} else {
  return { error: "Invalid subscription tier" };
}
```

## Manual Creation Steps (Using Stripe Dashboard)

If you prefer to create these manually in the Stripe Dashboard:

1. **Go to Products**: https://dashboard.stripe.com/products
2. **Create Small Department Product**:
   - Click "Add product"
   - Name: "Protocol Guide - Small Department"
   - Description: "Department subscription for 5-20 users with per-seat pricing"
   - Add metadata: tier=small_department, min_seats=5, max_seats=20
3. **Add Prices to Small Department**:
   - Monthly: $7.99, recurring monthly
   - Annual: $95.88, recurring yearly
4. **Create Large Department Product**:
   - Name: "Protocol Guide - Large Department"
   - Description: "Department subscription for 20+ users with volume pricing"
   - Add metadata: tier=large_department, min_seats=20
5. **Add Prices to Large Department**:
   - Monthly: $5.99, recurring monthly
   - Annual: $71.88, recurring yearly
6. **Copy Price IDs**: Note down all 4 price IDs and add to `.env`

## Next Steps

1. Create the Stripe products and prices (manually or via script)
2. Update `.env` with the new price IDs
3. Update code files as outlined above
4. Test the department checkout flow
5. Update pricing display on frontend
