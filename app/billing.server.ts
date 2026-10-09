import type { BillingConfigSubscriptionLineItemPlan } from "@shopify/shopify-api";
import { BillingInterval } from "@shopify/shopify-app-react-router/server";

export const BASIC_MONTHLY_PLAN = "Essential B2B Plan";
export const BILLING_AMOUNT_USD = 29;
export const BILLING_CURRENCY_CODE = "USD";
export const BILLING_TRIAL_DAYS = 7;

export const PUBLIC_DISTRIBUTION_BYPASS_REASON =
  "Billing API requires Public (App Store) distribution. Set Partner Dashboard → Distribution, then reload. Dev bypass is active.";

const DEV_BILLING_BYPASS_REASON =
  "Billing is not enforced outside production. Set ENFORCE_BILLING=1 to request a test charge.";

export type AppEnv = {
  NODE_ENV?: string;
  ENFORCE_BILLING?: string;
};

export type SubscriptionGate = {
  billingActive: boolean;
  billingBypassed: boolean;
  bypassReason: string | null;
};

type MonthlyPlan = typeof BASIC_MONTHLY_PLAN;

export type BillingClient = {
  check: (options: {
    plans: MonthlyPlan[];
    isTest?: boolean;
  }) => Promise<{ hasActivePayment: boolean }>;
  require: (options: {
    plans: MonthlyPlan[];
    isTest?: boolean;
    onFailure: (error: unknown) => Promise<Response>;
  }) => Promise<unknown>;
  request: (options: {
    plan: MonthlyPlan;
    isTest?: boolean;
    trialDays?: number;
  }) => Promise<Response>;
};

const activeSubscription: SubscriptionGate = {
  billingActive: true,
  billingBypassed: false,
  bypassReason: null,
};

export function billingPlanConfig(): {
  [plan: string]: BillingConfigSubscriptionLineItemPlan;
} {
  return {
    [BASIC_MONTHLY_PLAN]: {
      trialDays: BILLING_TRIAL_DAYS,
      lineItems: [
        {
          amount: BILLING_AMOUNT_USD,
          currencyCode: BILLING_CURRENCY_CODE,
          interval: BillingInterval.Every30Days,
        },
      ],
    },
  };
}

export function shouldRequestBilling(env: AppEnv): boolean {
  return env.NODE_ENV === "production" || env.ENFORCE_BILLING === "1";
}

export function subscriptionIsTest(
  env: AppEnv,
  partnerDevelopment = false,
): boolean {
  return partnerDevelopment || env.NODE_ENV !== "production";
}

export async function shopIsPartnerDevelopment(admin: {
  graphql: (query: string) => Promise<{ json: () => Promise<unknown> }>;
}): Promise<boolean> {
  const response = await admin.graphql(
    `#graphql
      query BillingShopPlan {
        shop {
          plan {
            partnerDevelopment
          }
        }
      }`,
  );
  const json = (await response.json()) as {
    data?: {
      shop?: { plan?: { partnerDevelopment?: boolean | null } | null } | null;
    };
  };
  return json.data?.shop?.plan?.partnerDevelopment === true;
}

export function isPublicDistributionBillingError(error: unknown): boolean {
  return errorText(error).toLowerCase().includes("public distribution");
}

export async function requireAppSubscription(
  billing: BillingClient,
  env: AppEnv = process.env,
  options?: { partnerDevelopment?: boolean },
): Promise<SubscriptionGate> {
  const isTest = subscriptionIsTest(env, options?.partnerDevelopment);

  try {
    if (!shouldRequestBilling(env)) {
      const check = await billing.check({
        plans: [BASIC_MONTHLY_PLAN],
        isTest,
      });
      if (check.hasActivePayment) {
        return activeSubscription;
      }
      return bypassed(DEV_BILLING_BYPASS_REASON);
    }

    await billing.require({
      plans: [BASIC_MONTHLY_PLAN],
      isTest,
      onFailure: () =>
        billing.request({
          plan: BASIC_MONTHLY_PLAN,
          isTest,
          trialDays: BILLING_TRIAL_DAYS,
        }),
    });

    return activeSubscription;
  } catch (error) {
    if (env.NODE_ENV !== "production" && isPublicDistributionBillingError(error)) {
      return bypassed(PUBLIC_DISTRIBUTION_BYPASS_REASON);
    }
    throw error;
  }
}

function bypassed(bypassReason: string): SubscriptionGate {
  return {
    billingActive: false,
    billingBypassed: true,
    bypassReason,
  };
}

function errorText(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (!error || typeof error !== "object") {
    return "";
  }

  const record = error as { message?: unknown; errorData?: unknown };
  const message = typeof record.message === "string" ? record.message : "";
  const data =
    record.errorData == null ? "" : JSON.stringify(record.errorData);
  return `${message} ${data}`;
}
