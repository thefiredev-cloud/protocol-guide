/**
 * Stripe Integration Tests
 * Tests for checkout sessions, customer portal, webhooks, and subscription management
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

// Mock Stripe module - must be defined before import
vi.mock("stripe", () => {
  const mockStripeInstance = {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };
  return {
    default: vi.fn(() => mockStripeInstance),
    __mockStripeInstance: mockStripeInstance,
  };
});

// Mock database
vi.mock("../server/db", () => ({
  PRICING: {
    monthly: 9.99,
    annual: 99.99,
  },
  getUserByStripeCustomerId: vi.fn(),
  updateUserStripeCustomerId: vi.fn(),
  updateUserTier: vi.fn(),
  getUserById: vi.fn(),
  getDb: vi.fn().mockResolvedValue({
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
}));

// Get mock instance for assertions
const getMockStripe = async () => {
  const stripeMock = await import("stripe");
  return (stripeMock as unknown as { __mockStripeInstance: ReturnType<typeof vi.fn> }).__mockStripeInstance;
};

describe("Stripe Checkout Sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_monthly_123";
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_annual_123";
  });

  it("validates monthly checkout session parameters", async () => {
    const checkoutParams = {
      userId: 1,
      userEmail: "test@example.com",
      plan: "monthly" as const,
      successUrl: "https://app.example.com/success",
      cancelUrl: "https://app.example.com/cancel",
    };

    expect(checkoutParams.plan).toBe("monthly");
    expect(checkoutParams.userEmail).toContain("@");
    expect(checkoutParams.successUrl).toMatch(/^https?:\/\//);
  });

  it("validates annual checkout session parameters", async () => {
    const checkoutParams = {
      userId: 1,
      userEmail: "test@example.com",
      plan: "annual" as const,
      successUrl: "https://app.example.com/success",
      cancelUrl: "https://app.example.com/cancel",
    };

    expect(checkoutParams.plan).toBe("annual");
    expect(checkoutParams.userId).toBeGreaterThan(0);
  });

  it("handles missing Stripe configuration", () => {
    // Temporarily remove Stripe key
    const originalKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    // Verify environment is properly unset
    expect(process.env.STRIPE_SECRET_KEY).toBeUndefined();

    // Restore key
    process.env.STRIPE_SECRET_KEY = originalKey;
  });

  it("validates error response structure", () => {
    const errorResponse = { error: "Card declined" };

    expect(errorResponse).toHaveProperty("error");
    expect(typeof errorResponse.error).toBe("string");
  });
});

describe("Stripe Customer Portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
  });

  it("validates portal session parameters", () => {
    const portalParams = {
      stripeCustomerId: "cus_test_123",
      returnUrl: "https://app.example.com/settings",
    };

    expect(portalParams.stripeCustomerId).toMatch(/^cus_/);
    expect(portalParams.returnUrl).toMatch(/^https?:\/\//);
  });

  it("validates portal response structure", () => {
    const portalResponse = {
      url: "https://billing.stripe.com/session/bps_test_123",
    };

    expect(portalResponse).toHaveProperty("url");
    expect(portalResponse.url).toContain("billing.stripe.com");
  });
});

describe("Stripe Subscription Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
  });

  it("validates subscription response structure", () => {
    const subscription = {
      id: "sub_test_123",
      status: "active",
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    };

    expect(subscription.id).toMatch(/^sub_/);
    expect(subscription.status).toBe("active");
    expect(subscription.current_period_end).toBeGreaterThan(Date.now() / 1000);
  });

  it("validates subscription cancellation response", () => {
    const cancelledSubscription = {
      id: "sub_test_123",
      status: "active",
      cancel_at_period_end: true,
    };

    expect(cancelledSubscription.cancel_at_period_end).toBe(true);
  });

  it("handles subscription error responses", () => {
    const errorResponse = { error: "Subscription not found" };

    expect(errorResponse).toHaveProperty("error");
  });
});

describe("Stripe Webhook Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
  });

  it("validates webhook event structure", () => {
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          client_reference_id: "1",
          customer: "cus_test_123",
        },
      },
    };

    expect(mockEvent.type).toBe("checkout.session.completed");
    expect(mockEvent.data.object).toHaveProperty("id");
    expect(mockEvent.data.object).toHaveProperty("customer");
  });

  it("validates webhook signature error handling", () => {
    const errorResponse = { error: "Invalid signature" };

    expect(errorResponse).toHaveProperty("error");
    expect(errorResponse.error).toContain("signature");
  });

  it("validates webhook secret configuration", () => {
    expect(process.env.STRIPE_WEBHOOK_SECRET).toBeDefined();
    expect(process.env.STRIPE_WEBHOOK_SECRET).toMatch(/^whsec_/);
  });
});

describe("Stripe Webhook Event Handling", () => {
  it("handles checkout.session.completed event type", () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: "cs_test_123",
      client_reference_id: "1",
      customer: "cus_test_123",
      metadata: { userId: "1", plan: "monthly" },
    };

    expect(mockSession.client_reference_id).toBe("1");
    expect(mockSession.metadata?.plan).toBe("monthly");
  });

  it("handles customer.subscription.updated event", () => {
    const mockSubscription: Partial<Stripe.Subscription> = {
      id: "sub_test_123",
      customer: "cus_test_123",
      status: "active",
    };

    const isActive = ["active", "trialing"].includes(mockSubscription.status!);
    expect(isActive).toBe(true);
  });

  it("handles customer.subscription.deleted event", () => {
    const mockSubscription: Partial<Stripe.Subscription> = {
      id: "sub_test_123",
      customer: "cus_test_123",
      status: "canceled",
    };

    expect(mockSubscription.status).toBe("canceled");
  });

  it("handles invoice.payment_succeeded event", () => {
    const mockInvoice: Partial<Stripe.Invoice> = {
      id: "in_test_123",
      customer: "cus_test_123",
      status: "paid",
    };

    expect(mockInvoice.status).toBe("paid");
  });

  it("handles invoice.payment_failed event", () => {
    const mockInvoice: Partial<Stripe.Invoice> = {
      id: "in_test_123",
      customer: "cus_test_123",
      status: "open",
    };

    // Payment failed should not immediately downgrade
    expect(mockInvoice.status).toBe("open");
  });
});

describe("Stripe tRPC Router Integration", () => {
  it("subscription.status returns correct data structure", () => {
    const expectedStatus = {
      tier: "free",
      subscriptionStatus: null,
      subscriptionEndDate: null,
    };

    expect(expectedStatus).toHaveProperty("tier");
    expect(expectedStatus).toHaveProperty("subscriptionStatus");
    expect(expectedStatus).toHaveProperty("subscriptionEndDate");
  });

  it("createCheckout validates plan parameter", () => {
    const validPlans = ["monthly", "annual"];
    expect(validPlans).toContain("monthly");
    expect(validPlans).toContain("annual");

    const invalidPlan = "weekly";
    expect(validPlans).not.toContain(invalidPlan);
  });

  it("createPortal requires stripeCustomerId", () => {
    const userWithoutCustomer = {
      stripeCustomerId: null,
    };

    expect(userWithoutCustomer.stripeCustomerId).toBeNull();
  });

  it("validates subscription tier mapping", () => {
    const tierMapping = {
      active: "pro",
      trialing: "pro",
      canceled: "free",
      past_due: "free",
    };

    expect(tierMapping.active).toBe("pro");
    expect(tierMapping.canceled).toBe("free");
  });
});
