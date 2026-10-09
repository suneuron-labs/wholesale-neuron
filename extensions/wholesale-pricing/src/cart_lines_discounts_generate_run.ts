import type {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  ProductDiscountSelectionStrategy,
} from "../generated/api";
import { wholesaleLineDiscounts } from "./pricing-decision";

export function cartLinesDiscountsGenerateRun(
  input: CartInput,
): CartLinesDiscountsGenerateRunResult {
  if (!discountIsEnabled(input.discount?.metafield?.value)) {
    return { operations: [] };
  }

  const discounts = wholesaleLineDiscounts({
    hasWholesaleTag: input.cart.buyerIdentity?.customer?.hasAnyTag ?? false,
    settingsJson: input.discount?.metafield?.value,
    lines: input.cart.lines.map((line) => ({ id: line.id })),
  });
  if (discounts.length === 0) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          selectionStrategy: "ALL" as ProductDiscountSelectionStrategy,
          candidates: discounts.map((discount) => ({
            message: `${discount.percent}% off`,
            targets: [{ cartLine: { id: discount.lineId } }],
            value: { percentage: { value: String(discount.percent) } },
          })),
        },
      },
    ],
  };
}

function discountIsEnabled(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  try {
    const parsed = JSON.parse(value) as { discountPercent?: unknown };
    return (
      typeof parsed.discountPercent === "number" &&
      Number.isInteger(parsed.discountPercent) &&
      parsed.discountPercent >= 1 &&
      parsed.discountPercent <= 100
    );
  } catch {
    return false;
  }
}
