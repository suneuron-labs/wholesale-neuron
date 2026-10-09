const CHECKOUT_STEPS = new Set(["CHECKOUT_INTERACTION", "CHECKOUT_COMPLETION"]);

export function wholesaleMinimumOrderError(input: {
  hasWholesaleTag: boolean;
  settingsJson: string | null | undefined;
  subtotal: string | null | undefined;
  step: string | null | undefined;
}): string | null {
  if (!input.hasWholesaleTag || !input.step || !CHECKOUT_STEPS.has(input.step)) {
    return null;
  }
  const minimum = readMinimum(input.settingsJson);
  const subtotal = readAmount(input.subtotal);
  if (minimum == null || minimum === 0 || subtotal == null || subtotal >= minimum) {
    return null;
  }
  return `Wholesale orders require a minimum spend of $${formatAmount(minimum)}.`;
}

function readMinimum(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as {
      customerTag?: unknown;
      minimumOrderValue?: unknown;
    };
    if (
      typeof parsed.customerTag !== "string" ||
      parsed.customerTag.trim().length === 0 ||
      typeof parsed.minimumOrderValue !== "number" ||
      parsed.minimumOrderValue < 0
    ) {
      return null;
    }
    return parsed.minimumOrderValue;
  } catch {
    return null;
  }
}

function readAmount(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function formatAmount(amount: number): string {
  if (Number.isInteger(amount)) {
    return String(amount);
  }
  return amount.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
