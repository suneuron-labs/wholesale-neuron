import { describe, expect, it } from "vitest";
import { cartLinesDiscountsGenerateRun } from "../extensions/wholesale-pricing/src/cart_lines_discounts_generate_run";

describe("cartLinesDiscountsGenerateRun", () => {
  it("returns a 20 percent product discount without using a runtime enum", () => {
    const result = cartLinesDiscountsGenerateRun({
      cart: {
        buyerIdentity: { customer: { hasAnyTag: true } },
        lines: [{ id: "gid://shopify/CartLine/0" }],
      },
      discount: {
        metafield: {
          value: JSON.stringify({
            customerTag: "vip",
            discountPercent: 20,
            minimumOrderValue: 500,
            paymentMethodName: "Bank Deposit",
          }),
        },
      },
    } as never);

    expect(result).toEqual({
      operations: [
        {
          productDiscountsAdd: {
            selectionStrategy: "ALL",
            candidates: [
              {
                message: "20% off",
                targets: [{ cartLine: { id: "gid://shopify/CartLine/0" } }],
                value: { percentage: { value: "20" } },
              },
            ],
          },
        },
      ],
    });
  });

  it("returns no discounts when the percent is zero or missing", () => {
    const cart = {
      buyerIdentity: { customer: { hasAnyTag: true } },
      lines: [{ id: "gid://shopify/CartLine/0" }],
    };
    expect(
      cartLinesDiscountsGenerateRun({
        cart,
        discount: {
          metafield: {
            value: JSON.stringify({ customerTag: "vip", discountPercent: 0 }),
          },
        },
      } as never),
    ).toEqual({ operations: [] });
    expect(
      cartLinesDiscountsGenerateRun({
        cart,
        discount: { metafield: null },
      } as never),
    ).toEqual({ operations: [] });
  });
});
