import { describe, expect, it } from "vitest";
import { wholesaleMinimumOrderError } from "../extensions/wholesale-minimum-order/src/minimum-order-decision";
import { cartValidationsGenerateRun } from "../extensions/wholesale-minimum-order/src/cart_validations_generate_run";

const settings = JSON.stringify({
  customerTag: "wholesale",
  discountPercent: 20,
  minimumOrderValue: 500,
});

describe("wholesaleMinimumOrderError", () => {
  it("blocks checkout when the post-discount subtotal is below the minimum", () => {
    expect(
      wholesaleMinimumOrderError({
        hasWholesaleTag: true,
        settingsJson: settings,
        subtotal: "400.00",
        step: "CHECKOUT_INTERACTION",
      }),
    ).toBe("Wholesale orders require a minimum spend of $500.");
    expect(
      wholesaleMinimumOrderError({
        hasWholesaleTag: true,
        settingsJson: settings,
        subtotal: "499.99",
        step: "CHECKOUT_COMPLETION",
      }),
    ).toBe("Wholesale orders require a minimum spend of $500.");
  });

  it("allows checkout at or above the minimum", () => {
    expect(
      wholesaleMinimumOrderError({
        hasWholesaleTag: true,
        settingsJson: settings,
        subtotal: "500.00",
        step: "CHECKOUT_INTERACTION",
      }),
    ).toBeNull();
  });

  it("does not block cart interaction", () => {
    expect(
      wholesaleMinimumOrderError({
        hasWholesaleTag: true,
        settingsJson: settings,
        subtotal: "10.00",
        step: "CART_INTERACTION",
      }),
    ).toBeNull();
  });

  it("uses the saved customer tag, including tags other than wholesale", () => {
    expect(
      wholesaleMinimumOrderError({
        hasWholesaleTag: true,
        settingsJson: JSON.stringify({
          customerTag: "bulk",
          discountPercent: 10,
          minimumOrderValue: 250,
        }),
        subtotal: "100.00",
        step: "CHECKOUT_COMPLETION",
      }),
    ).toBe("Wholesale orders require a minimum spend of $250.");
  });

  it("passes for an untagged customer and when the minimum is off", () => {
    expect(
      wholesaleMinimumOrderError({
        hasWholesaleTag: false,
        settingsJson: settings,
        subtotal: "10.00",
        step: "CHECKOUT_COMPLETION",
      }),
    ).toBeNull();
    expect(
      wholesaleMinimumOrderError({
        hasWholesaleTag: true,
        settingsJson: JSON.stringify({
          customerTag: "wholesale",
          discountPercent: 20,
          minimumOrderValue: 0,
        }),
        subtotal: "1.00",
        step: "CHECKOUT_COMPLETION",
      }),
    ).toBeNull();
  });
});

describe("cartValidationsGenerateRun", () => {
  it("returns no errors when the minimum is zero or missing", () => {
    const cart = {
      buyerIdentity: { customer: { hasAnyTag: true } },
      cost: { subtotalAmount: { amount: "10.00" } },
    };
    expect(
      cartValidationsGenerateRun({
        cart,
        buyerJourney: { step: "CHECKOUT_COMPLETION" },
        validation: {
          metafield: {
            value: JSON.stringify({ customerTag: "vip", minimumOrderValue: 0 }),
          },
        },
      } as never),
    ).toEqual({ operations: [] });
    expect(
      cartValidationsGenerateRun({
        cart,
        buyerJourney: { step: "CHECKOUT_COMPLETION" },
        validation: { metafield: null },
      } as never),
    ).toEqual({ operations: [] });
  });
});
