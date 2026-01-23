# Stripe Webhook Testing Guide

Quick reference for adding new Stripe webhook event tests to Protocol Guide.

---

## Quick Start Template

```typescript
describe("Stripe Webhook Handler - [Event Category]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.getDb).mockResolvedValue(null);
  });

  it("handles [event.type] event", async () => {
    // 1. Create mock request/response
    const req = createMockRequest("raw body", "sig_test_123");
    const res = createMockResponse();

    // 2. Create mock Stripe event
    const mockEvent = {
      id: "evt_test_123",
      type: "[event.type]",
      data: {
        object: {
          id: "obj_test_123",
          // ... event-specific fields
        } as Stripe.EventObject,
      },
    };

    // 3. Mock webhook verification
    vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);

    // 4. Mock database operations
    vi.mocked(db.getUserByStripeCustomerId).mockResolvedValue({
      id: 1,
      tier: "free",
    } as any);
    vi.mocked(db.updateUserTier).mockResolvedValue(undefined);

    // 5. Execute webhook handler
    await handleStripeWebhook(req as Request, res as Response);

    // 6. Assert results
    expect(db.getUserByStripeCustomerId).toHaveBeenCalledWith("cus_test_123");
    expect(db.updateUserTier).toHaveBeenCalledWith(1, "pro");
    expect(res.statusCode).toBe(200);
  });
});
```

---

## Common Test Patterns

### 1. Testing Successful Event Processing

```typescript
it("handles event successfully", async () => {
  const req = createMockRequest("raw body", "sig_test_123");
  const res = createMockResponse();

  const mockEvent = {
    id: "evt_success",
    type: "customer.subscription.created",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_456",
        status: "active",
      } as any,
    },
  };

  vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);
  vi.mocked(db.getUserByStripeCustomerId).mockResolvedValue({
    id: 1,
    tier: "free",
  } as any);
  vi.mocked(db.updateUserTier).mockResolvedValue(undefined);

  await handleStripeWebhook(req as Request, res as Response);

  expect(res.statusCode).toBe(200);
  expect(res.jsonData).toEqual({ received: true });
});
```

### 2. Testing User Not Found

```typescript
it("handles event when user not found", async () => {
  const req = createMockRequest("raw body", "sig_test_123");
  const res = createMockResponse();

  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const mockEvent = {
    id: "evt_no_user",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_nonexistent",
        status: "active",
      } as any,
    },
  };

  vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);
  vi.mocked(db.getUserByStripeCustomerId).mockResolvedValue(null);

  await handleStripeWebhook(req as Request, res as Response);

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining("No user found for customer cus_nonexistent")
  );
  expect(db.updateUserTier).not.toHaveBeenCalled();
  expect(res.statusCode).toBe(200);

  consoleErrorSpy.mockRestore();
});
```

### 3. Testing Database Updates

```typescript
it("updates database correctly", async () => {
  const req = createMockRequest("raw body", "sig_test_123");
  const res = createMockResponse();

  const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  const mockEvent = {
    id: "evt_db_update",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_456",
        status: "active",
        current_period_end: periodEnd,
      } as any,
    },
  };

  const mockDb = {
    query: {
      stripeWebhookEvents: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  };

  vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);
  vi.mocked(db.getUserByStripeCustomerId).mockResolvedValue({
    id: 1,
    tier: "free",
  } as any);
  vi.mocked(db.updateUserTier).mockResolvedValue(undefined);
  vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

  await handleStripeWebhook(req as Request, res as Response);

  expect(mockDb.update).toHaveBeenCalled();
  const setCall = mockDb.update().set;
  expect(setCall).toHaveBeenCalledWith({
    subscriptionId: "sub_test_123",
    subscriptionStatus: "active",
    subscriptionEndDate: new Date(periodEnd * 1000),
  });
  expect(res.statusCode).toBe(200);
});
```

### 4. Testing Signature Verification Failure

```typescript
it("rejects invalid signature", async () => {
  const req = createMockRequest("raw body", "invalid_sig");
  const res = createMockResponse();

  vi.mocked(constructWebhookEvent).mockReturnValue({
    error: "Invalid signature",
  });

  await handleStripeWebhook(req as Request, res as Response);

  expect(res.statusCode).toBe(400);
  expect(res.jsonData).toEqual({ error: "Invalid signature" });
});
```

### 5. Testing Idempotency

```typescript
it("skips duplicate event", async () => {
  const req = createMockRequest("raw body", "sig_test_123");
  const res = createMockResponse();

  const mockEvent = {
    id: "evt_duplicate",
    type: "customer.subscription.created",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_456",
        status: "active",
      } as any,
    },
  };

  const existingEvent = {
    id: 1,
    eventId: "evt_duplicate",
    eventType: "customer.subscription.created",
    processedAt: new Date(),
  };

  const mockDb = {
    query: {
      stripeWebhookEvents: {
        findFirst: vi.fn().mockResolvedValue(existingEvent),
      },
    },
    insert: vi.fn(),
  };

  vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);
  vi.mocked(db.getDb).mockResolvedValue(mockDb as any);

  await handleStripeWebhook(req as Request, res as Response);

  expect(mockDb.query.stripeWebhookEvents.findFirst).toHaveBeenCalled();
  expect(mockDb.insert).not.toHaveBeenCalled();
  expect(res.statusCode).toBe(200);
  expect(res.jsonData).toEqual({
    received: true,
    skipped: true,
    reason: "Already processed",
  });
});
```

### 6. Testing Error Handling

```typescript
it("returns 500 on error", async () => {
  const req = createMockRequest("raw body", "sig_test_123");
  const res = createMockResponse();

  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const mockEvent = {
    id: "evt_error",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_456",
        status: "active",
      } as any,
    },
  };

  vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);
  vi.mocked(db.getUserByStripeCustomerId).mockRejectedValue(
    new Error("Database connection failed")
  );

  await handleStripeWebhook(req as Request, res as Response);

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "[Stripe Webhook] Handler error:",
    expect.any(Error)
  );
  expect(res.statusCode).toBe(500);
  expect(res.jsonData).toEqual({ error: "Webhook handler failed" });

  consoleErrorSpy.mockRestore();
});
```

---

## Helper Functions

### createMockRequest
```typescript
function createMockRequest(body: unknown, signature?: string): Partial<Request> {
  return {
    body,
    headers: signature ? { "stripe-signature": signature } : {},
  };
}
```

### createMockResponse
```typescript
function createMockResponse(): Partial<Response> & {
  statusCode: number;
  jsonData: unknown;
} {
  const res: any = {
    statusCode: 200,
    jsonData: null,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockImplementation((data) => {
      res.jsonData = data;
      return res;
    }),
  };
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  return res;
}
```

---

## Mock Setup

### Basic Mocks (in beforeEach)
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.getDb).mockResolvedValue(null);
});
```

### Full Database Mock (for update tests)
```typescript
const mockDb = {
  query: {
    stripeWebhookEvents: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockResolvedValue(undefined),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  }),
};

vi.mocked(db.getDb).mockResolvedValue(mockDb as any);
```

---

## Common Assertions

### Response Assertions
```typescript
expect(res.statusCode).toBe(200);
expect(res.jsonData).toEqual({ received: true });
```

### Database Call Assertions
```typescript
expect(db.getUserByStripeCustomerId).toHaveBeenCalledWith("cus_test_123");
expect(db.updateUserTier).toHaveBeenCalledWith(1, "pro");
```

### Database Update Assertions
```typescript
expect(mockDb.update).toHaveBeenCalled();
const setCall = mockDb.update().set;
expect(setCall).toHaveBeenCalledWith({
  subscriptionId: "sub_test_123",
  subscriptionStatus: "active",
});
```

### Console Logging Assertions
```typescript
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

await handleStripeWebhook(req as Request, res as Response);

expect(consoleLogSpy).toHaveBeenCalledWith(
  expect.stringContaining("[Stripe Webhook] Event type")
);

consoleLogSpy.mockRestore();
```

---

## Stripe Event Types Reference

### Subscription Events
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`

### Invoice Events
- `invoice.created`
- `invoice.finalized`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.voided`
- `invoice.updated`

### Payment Events
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.processing`

### Checkout Events
- `checkout.session.completed`
- `checkout.session.expired`

### Dispute Events
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`

### Customer Events
- `customer.created`
- `customer.updated`
- `customer.deleted`

### Payment Method Events
- `payment_method.attached`
- `payment_method.detached`
- `payment_method.updated`

---

## Subscription Status Reference

| Status | Description | User Tier |
|--------|-------------|-----------|
| `active` | Subscription is active and paid | pro |
| `trialing` | In free trial period | pro |
| `incomplete` | Initial payment incomplete | free |
| `incomplete_expired` | Initial payment expired | free |
| `past_due` | Payment failed, retrying | free |
| `unpaid` | Payment failed, stopped retrying | free |
| `canceled` | Subscription cancelled | free |

---

## Running Tests

### Run All Webhook Tests
```bash
pnpm test stripe-webhooks
```

### Run Specific Test Suite
```bash
pnpm test stripe-webhooks -t "Signature Verification"
```

### Run in Watch Mode
```bash
pnpm test:watch stripe-webhooks
```

### Run with Coverage
```bash
pnpm test:coverage -- stripe-webhooks
```

---

## Best Practices

### ✅ DO
- Clear all mocks in `beforeEach()`
- Test both success and error cases
- Mock database operations to avoid real DB calls
- Verify signature on every test (via `constructWebhookEvent`)
- Test idempotency for all events
- Clean up console spies after use
- Use realistic Stripe object IDs (e.g., `cus_test_123`, `sub_test_456`)

### ❌ DON'T
- Make real Stripe API calls in tests
- Make real database calls in tests
- Forget to restore console spies
- Skip error case testing
- Assume events will always have all fields

---

## Troubleshooting

### Test fails with "Cannot find module"
```bash
# Install dependencies
pnpm install
```

### Mock not working
```typescript
// Ensure mock is created before import
vi.mock("../server/stripe", () => ({
  constructWebhookEvent: vi.fn(),
}));

// Then import
import { handleStripeWebhook } from "../server/webhooks/stripe";
```

### Database mock not applied
```typescript
// Mock db.getDb in beforeEach, not globally
beforeEach(() => {
  vi.mocked(db.getDb).mockResolvedValue(mockDb as any);
});
```

### Console spy not cleaning up
```typescript
// Always restore in same test
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
// ... test code ...
consoleSpy.mockRestore();
```

---

## Adding a New Event Handler

1. **Add event type to webhook handler** (`server/webhooks/stripe.ts`)
```typescript
case "customer.subscription.trial_will_end": {
  const subscription = event.data.object as Stripe.Subscription;
  await handleTrialEnding(subscription);
  break;
}
```

2. **Implement handler function**
```typescript
async function handleTrialEnding(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await db.getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error(`[Stripe Webhook] No user found for customer ${customerId}`);
    return;
  }

  console.log(`[Stripe Webhook] Trial ending for user ${user.id}`);
  // Send notification email, etc.
}
```

3. **Add comprehensive tests**
```typescript
describe("Stripe Webhook Handler - Trial Ending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.getDb).mockResolvedValue(null);
  });

  it("handles trial ending notification", async () => {
    // Test implementation
  });

  it("handles trial ending when user not found", async () => {
    // Error case
  });
});
```

4. **Run tests to verify**
```bash
pnpm test stripe-webhooks -t "Trial Ending"
```

---

## Resources

**Stripe Documentation:**
- [Webhook Events](https://stripe.com/docs/api/events/types)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)

**Internal Files:**
- Webhook Handler: `/Users/tanner-osterkamp/Protocol Guide Manus/server/webhooks/stripe.ts`
- Test File: `/Users/tanner-osterkamp/Protocol Guide Manus/tests/stripe-webhooks.test.ts`
- Test Summary: `/Users/tanner-osterkamp/Protocol Guide Manus/tests/STRIPE_WEBHOOKS_TEST_SUMMARY.md`

---

## Example: Complete Test for New Event

```typescript
describe("Stripe Webhook Handler - Trial Ending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.getDb).mockResolvedValue(null);
  });

  it("sends notification when trial ends soon", async () => {
    const req = createMockRequest("raw body", "sig_test_123");
    const res = createMockResponse();

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const trialEnd = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60; // 3 days

    const mockEvent = {
      id: "evt_trial_ending",
      type: "customer.subscription.trial_will_end",
      data: {
        object: {
          id: "sub_test_trial",
          customer: "cus_test_456",
          status: "trialing",
          trial_end: trialEnd,
        } as any,
      },
    };

    vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);
    vi.mocked(db.getUserByStripeCustomerId).mockResolvedValue({
      id: 1,
      email: "user@example.com",
      tier: "pro",
    } as any);

    await handleStripeWebhook(req as Request, res as Response);

    expect(db.getUserByStripeCustomerId).toHaveBeenCalledWith("cus_test_456");
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Trial ending for user 1")
    );
    expect(res.statusCode).toBe(200);

    consoleLogSpy.mockRestore();
  });

  it("handles trial ending when user not found", async () => {
    const req = createMockRequest("raw body", "sig_test_123");
    const res = createMockResponse();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockEvent = {
      id: "evt_trial_no_user",
      type: "customer.subscription.trial_will_end",
      data: {
        object: {
          id: "sub_test_trial",
          customer: "cus_nonexistent",
          status: "trialing",
        } as any,
      },
    };

    vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as any);
    vi.mocked(db.getUserByStripeCustomerId).mockResolvedValue(null);

    await handleStripeWebhook(req as Request, res as Response);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("No user found for customer cus_nonexistent")
    );
    expect(res.statusCode).toBe(200);

    consoleErrorSpy.mockRestore();
  });
});
```

---

Happy Testing! 🚀
