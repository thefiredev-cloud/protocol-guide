# Pricing Update Checklist
## Quick Reference for Completing $9.99 Pricing Update

**Status:** Code Complete ✅ | Stripe Setup Pending 🔴

---

## Pre-Flight Check ✅

- [x] All code changes completed
- [x] UI components updated ($9.99, $89)
- [x] Tests passing
- [x] Documentation created
- [ ] Stripe API key verified in .env
- [ ] Netlify access confirmed

---

## Step 1: Install Stripe CLI (5 min)

```bash
brew install stripe/stripe-cli/stripe
```

**Verify installation:**
```bash
stripe --version
```

---

## Step 2: Login to Stripe (2 min)

```bash
stripe login
```

This will open your browser to authenticate with Stripe.

---

## Step 3: Create Monthly Product (2 min)

```bash
stripe products create \
  --name="Protocol Guide Pro Monthly (v2)" \
  --description="Monthly subscription - Unlimited protocol access for EMS professionals" \
  --metadata[version]="v2" \
  --metadata[effective_date]="2026-01-23" \
  --metadata[pricing_tier]="pro"
```

**Copy the product ID:** `prod_XXXXX`

- [ ] Product created
- [ ] Product ID saved: __________________

---

## Step 4: Create Annual Product (2 min)

```bash
stripe products create \
  --name="Protocol Guide Pro Annual (v2)" \
  --description="Annual subscription - Unlimited protocol access (25% savings)" \
  --metadata[version]="v2" \
  --metadata[effective_date]="2026-01-23" \
  --metadata[pricing_tier]="pro" \
  --metadata[savings]="25%"
```

**Copy the product ID:** `prod_YYYYY`

- [ ] Product created
- [ ] Product ID saved: __________________

---

## Step 5: Create Monthly Price - $9.99 (2 min)

```bash
stripe prices create \
  --product="prod_XXXXX" \
  --unit-amount=999 \
  --currency=usd \
  --recurring[interval]=month \
  --recurring[interval_count]=1 \
  --metadata[tier]="pro" \
  --metadata[version]="v2"
```

**Copy the price ID:** `price_AAAAAA`

- [ ] Price created
- [ ] Price ID saved: __________________

---

## Step 6: Create Annual Price - $89 (2 min)

```bash
stripe prices create \
  --product="prod_YYYYY" \
  --unit-amount=8900 \
  --currency=usd \
  --recurring[interval]=year \
  --recurring[interval_count]=1 \
  --metadata[tier]="pro" \
  --metadata[version]="v2" \
  --metadata[savings]="25%"
```

**Copy the price ID:** `price_BBBBBB`

- [ ] Price created
- [ ] Price ID saved: __________________

---

## Step 7: Verify Prices (2 min)

```bash
# Check monthly price
stripe prices retrieve price_AAAAAA

# Check annual price
stripe prices retrieve price_BBBBBB
```

**Verify:**
- [ ] Monthly shows: unit_amount: 999
- [ ] Annual shows: unit_amount: 8900
- [ ] Both show: currency: "usd"
- [ ] Both show: active: true

---

## Step 8: Update Local .env (1 min)

Edit `/Users/tanner-osterkamp/Protocol Guide Manus/.env`:

```bash
# OLD PRICING (v1) - Keep for reference
# STRIPE_PRO_MONTHLY_PRICE_ID=price_1SoFuuDjdtNeDMqXTW64ePxn
# STRIPE_PRO_ANNUAL_PRICE_ID=price_1SoG8qDjdtNeDMqX7XPFdCoE

# NEW PRICING (v2) - $9.99/month, $89/year
STRIPE_PRO_MONTHLY_PRICE_ID=price_AAAAAA
STRIPE_PRO_ANNUAL_PRICE_ID=price_BBBBBB
```

- [ ] .env file updated
- [ ] Old price IDs commented out for reference

---

## Step 9: Update Netlify Environment Variables (3 min)

1. Go to: https://app.netlify.com/
2. Select your Protocol Guide site
3. Navigate to: **Site settings** → **Environment variables**
4. Update:
   - `STRIPE_PRO_MONTHLY_PRICE_ID` = `price_AAAAAA`
   - `STRIPE_PRO_ANNUAL_PRICE_ID` = `price_BBBBBB`
5. Click **Save**

- [ ] Netlify monthly price ID updated
- [ ] Netlify annual price ID updated
- [ ] Changes saved

---

## Step 10: Deploy to Production (5 min)

```bash
cd "/Users/tanner-osterkamp/Protocol Guide Manus"
git status
# Should show clean working tree (all changes committed)

# If you need to commit .env changes (don't commit .env to git):
# Just redeploy through Netlify dashboard
```

**Netlify Deploy:**
1. Go to: **Deploys** tab
2. Click: **Trigger deploy** → **Deploy site**
3. Wait for deploy to complete (~3-5 minutes)

- [ ] Site redeployed
- [ ] Deploy successful (green checkmark)
- [ ] Production URL working

---

## Step 11: Test Checkout Flow (10 min)

### Create Test Account
1. Open incognito/private browser window
2. Navigate to your production site
3. Create new test account

### Test Monthly Plan
1. Click "Upgrade to Pro"
2. Verify prices show: **$9.99/month** and **$89/year**
3. Select monthly plan
4. Enter test card: `4242 4242 4242 4242`
5. Exp: Any future date (e.g., 12/30)
6. CVC: Any 3 digits (e.g., 123)
7. ZIP: Any 5 digits (e.g., 12345)
8. Complete checkout

- [ ] Prices display correctly ($9.99, $89)
- [ ] Monthly checkout works
- [ ] Subscription created in Stripe
- [ ] User upgraded to Pro tier

### Check Stripe Dashboard
1. Go to: https://dashboard.stripe.com/subscriptions
2. Find the test subscription
3. Verify: Amount = $9.99 (or $999 cents)

- [ ] Subscription shows in Stripe
- [ ] Correct price ($9.99 or $89)
- [ ] Status: Active

---

## Step 12: Verify Existing Users (5 min)

### Check Old Subscriptions
1. Go to Stripe Dashboard → Subscriptions
2. Filter by price ID: `price_1SoFuuDjdtNeDMqXTW64ePxn`
3. Verify existing subscriptions still at $4.99

- [ ] Existing subs unchanged
- [ ] Old price IDs still active
- [ ] No complaints from existing users

---

## Step 13: Monitor for 24 Hours

### Key Metrics to Watch
- [ ] New signup conversion rate
- [ ] Checkout error rate
- [ ] Stripe webhook success rate
- [ ] Support tickets about pricing
- [ ] Existing user complaints (should be zero)

### Where to Monitor
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Netlify Functions:** Site → Functions tab
- **Application Logs:** Check server logs for errors
- **Analytics:** Track conversion funnel

---

## Success Criteria ✅

After 24 hours, you should see:
- [ ] New signups using new pricing ($9.99/$89)
- [ ] Existing users still on old pricing ($4.99/$39)
- [ ] No increase in checkout errors
- [ ] Webhooks processing successfully
- [ ] Revenue per signup increased ~100%

---

## Rollback Plan (If Needed)

If major issues occur:

1. **Restore old price IDs in Netlify:**
   ```
   STRIPE_PRO_MONTHLY_PRICE_ID=price_1SoFuuDjdtNeDMqXTW64ePxn
   STRIPE_PRO_ANNUAL_PRICE_ID=price_1SoG8qDjdtNeDMqX7XPFdCoE
   ```

2. **Redeploy site**

3. **Monitor for return to normal**

- Note: Subscriptions created at new prices will stay at new prices

---

## Completion Checklist

- [ ] Stripe CLI installed
- [ ] Products created (2)
- [ ] Prices created (2)
- [ ] Local .env updated
- [ ] Netlify env vars updated
- [ ] Site deployed
- [ ] Checkout tested successfully
- [ ] Existing users verified unchanged
- [ ] Monitoring active
- [ ] 24-hour check complete

---

## Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution:** Verify STRIPE_SECRET_KEY in .env is correct and not a placeholder

### Issue: "Price not found"
**Solution:** Double-check price IDs match exactly (no typos)

### Issue: Checkout shows old prices
**Solution:** Clear browser cache, verify env vars updated and site redeployed

### Issue: Webhook failures
**Solution:** Check STRIPE_WEBHOOK_SECRET is correctly set in Netlify

---

## Time Estimate

- Setup (Steps 1-8): ~20 minutes
- Deploy & Test (Steps 9-11): ~20 minutes
- Verification (Step 12): ~5 minutes
- **Total Active Time:** ~45 minutes
- **Monitoring:** 24 hours passive

---

**Last Updated:** 2026-01-23
**Next Review:** After 24-hour monitoring period

---

## Notes

Use this space to track any issues or observations:

-
-
-
