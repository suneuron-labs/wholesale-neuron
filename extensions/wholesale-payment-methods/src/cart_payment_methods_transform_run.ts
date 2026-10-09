import type {
  CartPaymentMethodsTransformRunInput,
  CartPaymentMethodsTransformRunResult,
} from "../generated/api";
import { hiddenPaymentMethodIds } from "../../../app/payment-decision";

export function cartPaymentMethodsTransformRun(
  input: CartPaymentMethodsTransformRunInput,
): CartPaymentMethodsTransformRunResult {
  if (!allowedPaymentMethod(input.paymentCustomization?.metafield?.value)) {
    return { operations: [] };
  }

  const ids = hiddenPaymentMethodIds({
    hasWholesaleTag: input.cart.buyerIdentity?.customer?.hasAnyTag ?? false,
    settingsJson: input.paymentCustomization?.metafield?.value,
    methods: input.paymentMethods.map((method) => ({
      id: method.id,
      name: method.name,
    })),
  });

  return {
    operations: ids.map((paymentMethodId) => ({
      paymentMethodHide: { paymentMethodId },
    })),
  };
}

function allowedPaymentMethod(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as { paymentMethodName?: unknown };
    if (typeof parsed.paymentMethodName !== "string") {
      return null;
    }
    const name = parsed.paymentMethodName.trim();
    return name.length > 0 ? name : null;
  } catch {
    return null;
  }
}
