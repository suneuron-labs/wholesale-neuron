import { BillingInterval } from "@shopify/shopify-app-react-router/server";
import { describe, expect, it, vi } from "vitest";
import {
  BASIC_MONTHLY_PLAN,
  BILLING_AMOUNT_USD,
  BILLING_CURRENCY_CODE,
  BILLING_TRIAL_DAYS,
  PUBLIC_DISTRIBUTION_BYPASS_REASON,
  billingPlanConfig,
  isPublicDistributionBillingError,
  requireAppSubscription,
  shouldRequestBilling,
  subscriptionIsTest,
} from "./billing.server";

describe("billing plan", () => {
  it("charges 29 USD every 30 days with a 7-day trial", () => {
    const plan = billingPlanConfig()[BASIC_MONTHLY_PLAN];

    expect(BASIC_MONTHLY_PLAN).toBe("Essential B2B Plan");
    expect(plan.trialDays).toBe(BILLING_TRIAL_DAYS);
    expect(BILLING_TRIAL_DAYS).toBe(7);
    expect(plan.lineItems).toEqual([
      {
        amount: BILLING_AMOUNT_USD,
        currencyCode: BILLING_CURRENCY_CODE,
        interval: BillingInterval.Every30Days,
      },
    ]);
    expect(BILLING_AMOUNT_USD).toBe(29);
    expect(BILLING_CURRENCY_CODE).toBe("USD");
  });
});

describe("isPublicDistributionBillingError", () => {
  it("matches the Billing API public-distribution message", () => {
    expect(
      isPublicDistributionBillingError(
        new Error("Apps without a public distribution cannot use the Billing API"),
      ),
    ).toBe(true);
    expect(
      isPublicDistributionBillingError({
        message: "request failed",
        errorData: { message: "public distribution is required" },
      }),
    ).toBe(true);
    expect(isPublicDistributionBillingError(new Error("invalid session"))).toBe(
      false,
    );
  });
});

describe("shouldRequestBilling", () => {
  it("requests a charge only in production or when billing is enforced", () => {
    expect(shouldRequestBilling({ NODE_ENV: "production" })).toBe(true);
    expect(
      shouldRequestBilling({ NODE_ENV: "development", ENFORCE_BILLING: "1" }),
    ).toBe(true);
    expect(shouldRequestBilling({ NODE_ENV: "development" })).toBe(false);
    expect(
      shouldRequestBilling({ NODE_ENV: "test", ENFORCE_BILLING: "0" }),
    ).toBe(false);
  });
});

describe("requireAppSubscription", () => {
  it("does not call billing.request outside production unless ENFORCE_BILLING=1", async () => {
    const billing = {
      check: vi.fn().mockResolvedValue({ hasActivePayment: false }),
      require: vi.fn(),
      request: vi.fn(),
    };

    const result = await requireAppSubscription(billing, {
      NODE_ENV: "development",
    });

    expect(billing.check).toHaveBeenCalledWith({
      plans: [BASIC_MONTHLY_PLAN],
      isTest: true,
    });
    expect(billing.require).not.toHaveBeenCalled();
    expect(billing.request).not.toHaveBeenCalled();
    expect(result.billingBypassed).toBe(true);
    expect(result.billingActive).toBe(false);
  });

  it("treats an active dev subscription as billed", async () => {
    const billing = {
      check: vi.fn().mockResolvedValue({ hasActivePayment: true }),
      require: vi.fn(),
      request: vi.fn(),
    };

    const result = await requireAppSubscription(billing, {
      NODE_ENV: "development",
    });

    expect(result).toEqual({
      billingActive: true,
      billingBypassed: false,
      bypassReason: null,
    });
  });

  it("bypasses a public-distribution error only outside production", async () => {
    const distributionError = new Error(
      "Apps without a public distribution cannot use the Billing API",
    );
    const billing = {
      check: vi.fn().mockRejectedValue(distributionError),
      require: vi.fn().mockRejectedValue(distributionError),
      request: vi.fn(),
    };

    const dev = await requireAppSubscription(billing, {
      NODE_ENV: "development",
    });

    expect(dev).toEqual({
      billingActive: false,
      billingBypassed: true,
      bypassReason: PUBLIC_DISTRIBUTION_BYPASS_REASON,
    });
    expect(billing.request).not.toHaveBeenCalled();

    await expect(
      requireAppSubscription(billing, { NODE_ENV: "production" }),
    ).rejects.toBe(distributionError);
  });

  it("requests the monthly plan with test mode and a 7-day trial when billing is enforced", async () => {
    const request = vi.fn().mockResolvedValue(new Response(null, { status: 302 }));
    const billing = {
      check: vi.fn(),
      request,
      require: vi.fn(
        async (options: {
          onFailure: (error: unknown) => Promise<Response>;
        }) => {
          await options.onFailure(new Error("No active payment"));
          return {
            hasActivePayment: false,
            appSubscriptions: [],
            oneTimePurchases: [],
          };
        },
      ),
    };

    await requireAppSubscription(billing, {
      NODE_ENV: "development",
      ENFORCE_BILLING: "1",
    });

    expect(billing.check).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledWith({
      plan: BASIC_MONTHLY_PLAN,
      isTest: true,
      trialDays: 7,
    });
  });

  it("charges in non-test mode in production", async () => {
    const request = vi.fn().mockResolvedValue(new Response(null, { status: 302 }));
    const billing = {
      check: vi.fn(),
      request,
      require: vi.fn(
        async (options: {
          onFailure: (error: unknown) => Promise<Response>;
        }) => {
          await options.onFailure(new Error("No active payment"));
        },
      ),
    };

    await requireAppSubscription(billing, { NODE_ENV: "production" });

    expect(request).toHaveBeenCalledWith({
      plan: BASIC_MONTHLY_PLAN,
      isTest: false,
      trialDays: 7,
    });
  });

  it("requests a test charge in production when the shop is a development store", async () => {
    const request = vi.fn().mockResolvedValue(new Response(null, { status: 302 }));
    const billing = {
      check: vi.fn(),
      request,
      require: vi.fn(
        async (options: {
          onFailure: (error: unknown) => Promise<Response>;
        }) => {
          await options.onFailure(new Error("No active payment"));
        },
      ),
    };

    await requireAppSubscription(billing, { NODE_ENV: "production" }, {
      partnerDevelopment: true,
    });

    expect(request).toHaveBeenCalledWith({
      plan: BASIC_MONTHLY_PLAN,
      isTest: true,
      trialDays: 7,
    });
    expect(subscriptionIsTest({ NODE_ENV: "production" }, true)).toBe(true);
    expect(subscriptionIsTest({ NODE_ENV: "production" }, false)).toBe(false);
  });
});

describe("requireAppSubscription verification vs charge creation", () => {
  function billingWithRequire(requireImpl: (options: {
    plans: string[];
    isTest?: boolean;
    onFailure: (error: unknown) => Promise<Response>;
  }) => Promise<unknown>) {
    return {
      check: vi.fn(),
      require: vi.fn(requireImpl),
      request: vi.fn().mockResolvedValue(new Response(null, { status: 302 })),
    };
  }

  it("production Staff store: verifies with test-inclusive check and accepts an active Test subscription", async () => {
    const billing = billingWithRequire(async () => ({
      hasActivePayment: true,
    }));

    const result = await requireAppSubscription(billing, {
      NODE_ENV: "production",
    });

    expect(billing.require).toHaveBeenCalledWith(
      expect.objectContaining({ plans: [BASIC_MONTHLY_PLAN], isTest: true }),
    );
    expect(billing.request).not.toHaveBeenCalled();
    expect(result).toEqual({
      billingActive: true,
      billingBypassed: false,
      bypassReason: null,
    });
  });

  it("production Staff store: still requests a Live charge when no subscription exists", async () => {
    const billing = billingWithRequire(async (options) => {
      await options.onFailure(new Error("Billing check failed"));
      throw new Error("redirect");
    });

    await expect(
      requireAppSubscription(billing, { NODE_ENV: "production" }),
    ).rejects.toThrow("redirect");

    expect(billing.require).toHaveBeenCalledWith(
      expect.objectContaining({ isTest: true }),
    );
    expect(billing.request).toHaveBeenCalledWith({
      plan: BASIC_MONTHLY_PLAN,
      isTest: false,
      trialDays: BILLING_TRIAL_DAYS,
    });
  });

  it("production Staff store with SIMULATE_STAFF_STORE=1: verification still accepts Test and Live, charge stays Live", async () => {
    const billing = billingWithRequire(async () => ({
      hasActivePayment: true,
    }));

    const result = await requireAppSubscription(billing, {
      NODE_ENV: "production",
      SIMULATE_STAFF_STORE: "1",
    });

    expect(billing.require).toHaveBeenCalledWith(
      expect.objectContaining({ isTest: true }),
    );
    expect(billing.request).not.toHaveBeenCalled();
    expect(result.billingActive).toBe(true);
  });

  it("production Partner Development store: verification is test-inclusive and charge is a Test charge", async () => {
    const billing = billingWithRequire(async (options) => {
      await options.onFailure(new Error("Billing check failed"));
      throw new Error("redirect");
    });

    await expect(
      requireAppSubscription(
        billing,
        { NODE_ENV: "production" },
        { partnerDevelopment: true },
      ),
    ).rejects.toThrow("redirect");

    expect(billing.require).toHaveBeenCalledWith(
      expect.objectContaining({ isTest: true }),
    );
    expect(billing.request).toHaveBeenCalledWith({
      plan: BASIC_MONTHLY_PLAN,
      isTest: true,
      trialDays: BILLING_TRIAL_DAYS,
    });
  });

  it("unpaid, declined, or reinstalled store: missing subscription triggers the approval redirect", async () => {
    const redirect = new Response(null, {
      status: 302,
      headers: { Location: "https://admin.shopify.com/charge/approve" },
    });
    const billing = {
      check: vi.fn(),
      require: vi.fn(async (options: {
        onFailure: (error: unknown) => Promise<Response>;
      }) => {
        throw await options.onFailure(new Error("Billing check failed"));
      }),
      request: vi.fn().mockResolvedValue(redirect),
    };

    const thrown = await requireAppSubscription(billing, {
      NODE_ENV: "production",
      SIMULATE_STAFF_STORE: "1",
    }).catch((error: unknown) => error);

    expect(thrown).toBe(redirect);
    expect(billing.request).toHaveBeenCalledWith({
      plan: BASIC_MONTHLY_PLAN,
      isTest: false,
      trialDays: BILLING_TRIAL_DAYS,
    });
  });
});
