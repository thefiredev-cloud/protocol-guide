/**
 * Setup Department Pricing Tiers in Stripe
 *
 * Creates products and prices for:
 * - Small Department (5-20 users): $7.99/user/month
 * - Large Department (20+ users): $5.99/user/month
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

async function setupDepartmentPricing() {
  console.log('🔧 Setting up Department Pricing Tiers in Stripe...\n');

  try {
    // 1. Create Small Department Product
    console.log('Creating Small Department product...');
    const smallDeptProduct = await stripe.products.create({
      name: 'Protocol Guide - Small Department',
      description: 'Department subscription for 5-20 users with per-seat pricing',
      metadata: {
        tier: 'small_department',
        min_seats: '5',
        max_seats: '20',
      },
    });
    console.log(`✓ Product created: ${smallDeptProduct.id}\n`);

    // 2. Create Small Department Prices
    console.log('Creating Small Department prices...');

    // Monthly: $7.99/user/month
    const smallDeptMonthly = await stripe.prices.create({
      product: smallDeptProduct.id,
      unit_amount: 799, // $7.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        usage_type: 'licensed',
      },
      nickname: 'Small Department Monthly (Per Seat)',
      metadata: {
        tier: 'small_department',
        interval: 'monthly',
        per_seat: 'true',
      },
    });
    console.log(`✓ Monthly price created: ${smallDeptMonthly.id} ($7.99/seat/month)`);

    // Annual: $95.88/user/year (same monthly rate * 12, no discount for simplicity)
    const smallDeptAnnual = await stripe.prices.create({
      product: smallDeptProduct.id,
      unit_amount: 9588, // $95.88 in cents ($7.99 * 12)
      currency: 'usd',
      recurring: {
        interval: 'year',
        usage_type: 'licensed',
      },
      nickname: 'Small Department Annual (Per Seat)',
      metadata: {
        tier: 'small_department',
        interval: 'annual',
        per_seat: 'true',
      },
    });
    console.log(`✓ Annual price created: ${smallDeptAnnual.id} ($95.88/seat/year)\n`);

    // 3. Create Large Department Product
    console.log('Creating Large Department product...');
    const largeDeptProduct = await stripe.products.create({
      name: 'Protocol Guide - Large Department',
      description: 'Department subscription for 20+ users with volume pricing',
      metadata: {
        tier: 'large_department',
        min_seats: '20',
      },
    });
    console.log(`✓ Product created: ${largeDeptProduct.id}\n`);

    // 4. Create Large Department Prices
    console.log('Creating Large Department prices...');

    // Monthly: $5.99/user/month
    const largeDeptMonthly = await stripe.prices.create({
      product: largeDeptProduct.id,
      unit_amount: 599, // $5.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        usage_type: 'licensed',
      },
      nickname: 'Large Department Monthly (Per Seat)',
      metadata: {
        tier: 'large_department',
        interval: 'monthly',
        per_seat: 'true',
      },
    });
    console.log(`✓ Monthly price created: ${largeDeptMonthly.id} ($5.99/seat/month)`);

    // Annual: $71.88/user/year (same monthly rate * 12)
    const largeDeptAnnual = await stripe.prices.create({
      product: largeDeptProduct.id,
      unit_amount: 7188, // $71.88 in cents ($5.99 * 12)
      currency: 'usd',
      recurring: {
        interval: 'year',
        usage_type: 'licensed',
      },
      nickname: 'Large Department Annual (Per Seat)',
      metadata: {
        tier: 'large_department',
        interval: 'annual',
        per_seat: 'true',
      },
    });
    console.log(`✓ Annual price created: ${largeDeptAnnual.id} ($71.88/seat/year)\n`);

    // 5. Print summary
    console.log('\n✅ Department Pricing Setup Complete!\n');
    console.log('Add these to your .env file:\n');
    console.log(`# Small Department (5-20 users)`);
    console.log(`STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID="${smallDeptMonthly.id}"`);
    console.log(`STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID="${smallDeptAnnual.id}"`);
    console.log('');
    console.log(`# Large Department (20+ users)`);
    console.log(`STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID="${largeDeptMonthly.id}"`);
    console.log(`STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID="${largeDeptAnnual.id}"`);
    console.log('\n');

    // 6. Return the IDs for automated processing
    return {
      smallDepartment: {
        productId: smallDeptProduct.id,
        monthlyPriceId: smallDeptMonthly.id,
        annualPriceId: smallDeptAnnual.id,
      },
      largeDepartment: {
        productId: largeDeptProduct.id,
        monthlyPriceId: largeDeptMonthly.id,
        annualPriceId: largeDeptAnnual.id,
      },
    };
  } catch (error) {
    console.error('❌ Error setting up pricing:', error);
    throw error;
  }
}

// Run the setup
setupDepartmentPricing()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to setup pricing:', error);
    process.exit(1);
  });
