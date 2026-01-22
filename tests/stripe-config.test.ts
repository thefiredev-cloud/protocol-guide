import { describe, it, expect } from "vitest";

describe("Stripe Configuration", () => {
  it("should have STRIPE_PRO_MONTHLY_PRICE_ID configured", () => {
    const priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    expect(priceId).toBeDefined();
    expect(priceId).not.toBe("");
    expect(priceId).toMatch(/^price_/);
  });

  it("should have STRIPE_PRO_ANNUAL_PRICE_ID configured", () => {
    const priceId = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
    expect(priceId).toBeDefined();
    expect(priceId).not.toBe("");
    expect(priceId).toMatch(/^price_/);
  });

  it("should have correct monthly price ID format", () => {
    const priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    // Stripe price IDs are typically 30+ characters
    expect(priceId?.length).toBeGreaterThan(20);
  });

  it("should have correct annual price ID format", () => {
    const priceId = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
    // Stripe price IDs are typically 30+ characters
    expect(priceId?.length).toBeGreaterThan(20);
  });

  it("should have different price IDs for monthly and annual", () => {
    const monthlyId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    const annualId = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
    expect(monthlyId).not.toBe(annualId);
  });
});
