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
});
