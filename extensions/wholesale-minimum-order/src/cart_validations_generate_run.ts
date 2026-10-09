import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
} from "../generated/api";
import { wholesaleMinimumOrderError } from "./minimum-order-decision";

export function cartValidationsGenerateRun(
  input: CartValidationsGenerateRunInput,
): CartValidationsGenerateRunResult {
  if (!minimumOrderIsEnabled(input.validation?.metafield?.value)) {
    return { operations: [] };
  }

  const message = wholesaleMinimumOrderError({
    hasWholesaleTag: input.cart.buyerIdentity?.customer?.hasAnyTag ?? false,
    settingsJson: input.validation?.metafield?.value,
    subtotal: input.cart.cost?.subtotalAmount?.amount,
    step: input.buyerJourney?.step,
  });
  if (!message) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        validationAdd: {
          errors: [{ message, target: "$.cart" }],
        },
      },
    ],
  };
}

function minimumOrderIsEnabled(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  try {
    const parsed = JSON.parse(value) as { minimumOrderValue?: unknown };
    return (
      typeof parsed.minimumOrderValue === "number" && parsed.minimumOrderValue > 0
    );
  } catch {
    return false;
  }
}
