import { describe, expect, it } from "vitest";
import { hiddenPaymentMethodIds } from "./payment-decision";
import { cartPaymentMethodsTransformRun } from "../extensions/wholesale-payment-methods/src/cart_payment_methods_transform_run";

const methods = [
  { id: "card", name: "Shopify Payments" },
  { id: "paypal", name: "PayPal" },
  { id: "invoice", name: "  PAY BY INVOICE " },
];

const settings = JSON.stringify({
  customerTag: "vip",
  discountPercent: 20,
  minimumOrderValue: 50,
  paymentMethodName: "  Pay By Invoice  ",
});

describe("hiddenPaymentMethodIds", () => {
  it("hides every method whose name does not match the saved payment method", () => {
    expect(
      hiddenPaymentMethodIds({
        hasWholesaleTag: true,
        settingsJson: settings,
        methods,
      }),
    ).toEqual(["card", "paypal"]);
  });

  it("hides every method when none matches the saved name", () => {
    expect(
      hiddenPaymentMethodIds({
        hasWholesaleTag: true,
        settingsJson: JSON.stringify({
          customerTag: "VIP",
          discountPercent: 20,
          minimumOrderValue: 50,
          paymentMethodName: "Purchase order",
        }),
        methods,
      }),
    ).toEqual(["card", "paypal", "invoice"]);
  });

  it("changes nothing for guests and when no payment method name is saved", () => {
    expect(hiddenPaymentMethodIds({ hasWholesaleTag: false, methods })).toEqual([]);
    expect(
      hiddenPaymentMethodIds({
        hasWholesaleTag: true,
        settingsJson: JSON.stringify({
          customerTag: "vip",
          discountPercent: 20,
          minimumOrderValue: 50,
          paymentMethodName: "   ",
        }),
        methods,
      }),
    ).toEqual([]);
  });
});

describe("cartPaymentMethodsTransformRun", () => {
  it("returns no operations when the payment method name is blank or missing", () => {
    const input = {
      cart: { buyerIdentity: { customer: { hasAnyTag: true } } },
      paymentMethods: [
        { id: "card", name: "Shopify Payments" },
        { id: "bank", name: "Bank Deposit" },
      ],
    };
    expect(
      cartPaymentMethodsTransformRun({
        ...input,
        paymentCustomization: {
          metafield: {
            value: JSON.stringify({ customerTag: "vip", paymentMethodName: "   " }),
          },
        },
      } as never),
    ).toEqual({ operations: [] });
    expect(
      cartPaymentMethodsTransformRun({
        ...input,
        paymentCustomization: { metafield: null },
      } as never),
    ).toEqual({ operations: [] });
  });
});
